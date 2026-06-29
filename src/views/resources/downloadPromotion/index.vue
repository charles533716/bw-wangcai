<template>
  <div class="app-container download-promotion-page">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="siteName">
        <el-input
          v-model="queryParams.siteName"
          placeholder="请输入站点名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows" border>
      <el-table-column label="站点/代理" width="240" fixed>
        <template slot-scope="scope">
          <div class="site-code">{{ scope.row.siteCode || '-' }}</div>
          <div class="site-name">{{ scope.row.siteName || '-' }}</div>
          <div class="agent-block">
            <template v-if="scope.row.agentId">
              <div class="agent-name">{{ scope.row.agentName || '-' }}</div>
              <div class="muted">ID: {{ scope.row.agentId }}</div>
              <div class="muted">推广码: {{ scope.row.promotionCode || scope.row.inviteCode || '-' }}</div>
            </template>
            <el-tag v-else type="warning" size="mini">无可用代理</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="链接" min-width="620">
        <template slot-scope="scope">
          <div class="profile-link-list">
            <div
              v-for="item in buildLinkRows(scope.row)"
              :key="item.key"
              class="profile-link-row"
            >
              <div class="profile-link-label">{{ item.label }}</div>
              <div class="profile-link-action">
                <template v-if="item.type === 'open'">
                  <el-link
                    :href="item.url"
                    target="_blank"
                    type="info"
                    class="profile-open-link"
                  >
                    <i class="el-icon-top-right"></i>
                    <span>{{ item.actionText }}</span>
                  </el-link>
                  <el-button type="text" class="copy-inline-btn" @click="copyText(item.url)">复制</el-button>
                </template>
                <template v-else-if="item.type === 'download'">
                  <el-link
                    :href="item.url"
                    target="_blank"
                    type="primary"
                    class="download-url-link"
                  >
                    {{ item.url }}
                  </el-link>
                  <el-button type="text" class="copy-inline-btn" @click="copyText(item.url)">复制</el-button>
                </template>
                <el-button v-else type="text" @click="copyText(item.url)">复制</el-button>
              </div>
            </div>
            <el-empty
              v-if="!buildLinkRows(scope.row).length"
              :image-size="48"
              description="暂无可用链接"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listDownloadPromotion } from '@/api/resources/downloadPromotion'

export default {
  name: 'DownloadPromotion',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      rows: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: undefined,
        siteName: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listDownloadPromotion(this.queryParams).then(response => {
        this.rows = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    buildLinkRows(row) {
      const links = []
      const agentId = row.agentId || ''

      if (row.h5Link) {
        links.push({
          key: 'h5',
          label: 'H5链接',
          actionText: '国内链接',
          type: 'open',
          url: row.h5Link
        })
      }
      if (row.h5Link && agentId) {
        links.push({
          key: 'promotion-domestic',
          label: '推广链接',
          actionText: '国内链接',
          type: 'open',
          url: this.buildRegisterPlusUrl(row.h5Link, agentId)
        })
      }
      if (row.agentDomain && row.promotionLink) {
        links.push({
          key: 'promotion-agent',
          label: '推广链接',
          actionText: '国外链接',
          type: 'open',
          url: row.promotionLink
        })
      }
      const telegramLinks = Array.isArray(row.telegramLinks) ? row.telegramLinks : []
      telegramLinks.forEach((item, index) => {
        const botUsername = this.normalizeBotUsername(item.botUsername)
        const url = item.promotionUrl || item.url
        if (!url) {
          return
        }
        links.push({
          key: `telegram-${item.id || item.botCode || index}`,
          label: 'Telegram链接',
          actionText: botUsername ? `@${botUsername}` : `机器人${index + 1}`,
          type: 'open',
          url
        })
      })
      const telegramPromotionLinks = Array.isArray(row.telegramPromotionLinks) ? row.telegramPromotionLinks : []
      telegramPromotionLinks.forEach((item, index) => {
        const botUsername = this.normalizeBotUsername(item.botUsername)
        const url = item.promotionUrl || item.url
        if (!url) {
          return
        }
        links.push({
          key: `telegram-promotion-${item.id || item.botCode || index}`,
          label: 'Telegram推广链接',
          actionText: botUsername ? `@${botUsername}` : `机器人${index + 1}`,
          type: 'open',
          url
        })
      })
      const appLinks = Array.isArray(row.appDownloadLinks) ? row.appDownloadLinks : []
      appLinks.forEach((url, index) => {
        if (!url) {
          return
        }
        links.push({
          key: `app-${index}`,
          label: index === 0 ? 'App下载链接' : `备用链接${index}`,
          type: 'download',
          url
        })
      })
      if (row.apkDownloadLink) {
        links.push({
          key: 'apk',
          label: '安卓APK链接',
          type: 'download',
          url: row.apkDownloadLink
        })
      }
      return links
    },
    buildRegisterPlusUrl(baseUrl, agentId) {
      const normalizedBase = String(baseUrl || '').replace(/\/+$/, '')
      const params = new URLSearchParams()
      params.set('agentCode', agentId)
      return `${normalizedBase}/auth/register-plus?${params.toString()}`
    },
    normalizeBotUsername(botUsername) {
      return String(botUsername || '').trim().replace(/^@+/, '')
    },
    copyText(text) {
      if (!text) {
        this.$modal.msgWarning('暂无可复制内容')
        return
      }
      this.copyToClipboard(text).then(() => {
        this.$modal.msgSuccess('复制成功')
      }).catch(() => {
        this.$modal.msgError('复制失败，请手动复制')
      })
    },
    copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
      }
      return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', 'readonly')
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        success ? resolve() : reject(new Error('copy failed'))
      })
    }
  }
}
</script>

<style scoped>
.download-promotion-page .site-code {
  font-weight: 600;
  color: #303133;
}

.download-promotion-page .site-name,
.download-promotion-page .muted {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.download-promotion-page .agent-name {
  font-weight: 600;
  color: #303133;
}

.download-promotion-page .profile-link-list {
  display: flex;
  flex-direction: column;
  min-width: 360px;
}

.download-promotion-page .profile-link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 4px;
  border-bottom: 1px solid #ebeef5;
  min-width: 0;
}

.download-promotion-page .profile-link-row:last-child {
  border-bottom: 0;
}

.download-promotion-page .profile-link-label {
  flex: 1 1 auto;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-promotion-page .profile-link-action {
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  max-width: calc(100% - 180px);
  margin-left: 16px;
  min-width: 0;
}

.download-promotion-page .profile-open-link {
  color: #303133;
  font-size: 14px;
}

.download-promotion-page .profile-open-link i {
  margin-right: 4px;
  font-size: 16px;
  font-weight: 600;
}

.download-promotion-page .profile-open-link span {
  display: inline-block;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.download-promotion-page .download-url-link {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 420px;
  font-size: 14px;
  text-align: right;
}

.download-promotion-page .download-url-link::v-deep .el-link--inner {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.download-promotion-page .copy-inline-btn {
  flex: 0 0 auto;
  padding: 0;
}
</style>
