<template>
  <div class="app-container drop-sign-page">
    <div class="page-head">
      <div>
        <div class="page-title">掉签分析</div>
        <div class="page-subtitle">识别 iOS 掉签后未再登录的疑似流失用户，辅助运营安排电话召回。</div>
      </div>
      <el-button type="primary" icon="el-icon-download" :loading="exportLoading" @click="handleExport">
        导出演示数据
      </el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" label-width="96px">
        <el-form-item label="所属站点">
          <el-select v-model="queryParams.siteCode" clearable filterable placeholder="全部站点" class="w-select">
            <el-option v-for="item in siteOptions" :key="item.siteCode" :label="item.siteName" :value="item.siteCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员信息">
          <el-input
            v-model.trim="queryParams.keyword"
            clearable
            placeholder="账号/姓名/手机号/邮箱/上级代理"
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="掉签状态">
          <el-select v-model="queryParams.signStatus" clearable placeholder="全部状态" class="w-select">
            <el-option v-for="item in signStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录状态">
          <el-select v-model="queryParams.loginStatus" clearable placeholder="全部" class="w-select">
            <el-option v-for="item in loginStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="queryParams.userStatus" clearable placeholder="全部" class="w-select">
            <el-option v-for="item in userStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户端">
          <el-select v-model="queryParams.clientType" disabled placeholder="iOS" class="w-select">
            <el-option v-for="item in clientTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前版本">
          <el-select v-model="queryParams.appVersion" clearable filterable allow-create placeholder="全部版本" class="w-select">
            <el-option v-for="item in versionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进状态">
          <el-select v-model="queryParams.followStatus" clearable placeholder="全部跟进" class="w-select">
            <el-option v-for="item in followStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="掉签时间">
          <el-date-picker
            v-model="queryParams.dropSignRange"
            type="datetimerange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
            class="w-date"
          />
        </el-form-item>
        <el-form-item label="最后登录">
          <el-date-picker
            v-model="queryParams.lastLoginRange"
            type="datetimerange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
            class="w-date"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="summary-grid">
      <div v-for="item in summaryCards" :key="item.label" class="summary-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value" :class="item.className">{{ item.value }}</div>
        <div class="summary-desc">{{ item.desc }}</div>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-head">
        <span>掉签用户明细</span>
        <span class="table-hint">默认展示 iOS 掉签流失用户，便于运营优先外呼。</span>
      </div>
      <el-table v-loading="loading" :data="pagedRows" border stripe>
        <el-table-column label="所属站点" prop="siteName" min-width="120" />
        <el-table-column label="会员账号" prop="userName" min-width="120" fixed />
        <el-table-column label="用户姓名" prop="realName" min-width="100" />
        <el-table-column label="手机号码" prop="phone" min-width="130" />
        <el-table-column label="用户邮箱" prop="email" min-width="180" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ showDash(row.email) }}</template>
        </el-table-column>
        <el-table-column label="上级代理" prop="parentAgentName" min-width="120">
          <template slot-scope="{ row }">{{ showDash(row.parentAgentName) }}</template>
        </el-table-column>
        <el-table-column label="当前登录状态" prop="loginStatus" min-width="110" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="optionType(loginStatusOptions, row.loginStatus)">
              {{ optionLabel(loginStatusOptions, row.loginStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户状态" prop="userStatus" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="optionType(userStatusOptions, row.userStatus)">
              {{ optionLabel(userStatusOptions, row.userStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="客户端" prop="clientType" min-width="90" align="center" />
        <el-table-column label="当前版本" prop="appVersion" min-width="100" align="center" />
        <el-table-column label="掉签状态" min-width="120" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="signStatusMeta(row).type">{{ signStatusMeta(row).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="掉签时间" prop="dropSignTime" min-width="165">
          <template slot-scope="{ row }">{{ showDash(row.dropSignTime) }}</template>
        </el-table-column>
        <el-table-column label="最后登录时间" prop="lastLoginTime" min-width="165">
          <template slot-scope="{ row }">{{ showDash(row.lastLoginTime) }}</template>
        </el-table-column>
        <el-table-column label="距离掉签天数" min-width="110" align="right">
          <template slot-scope="{ row }">{{ dropDays(row) }}</template>
        </el-table-column>
        <el-table-column label="掉签后是否登录" min-width="120" align="center">
          <template slot-scope="{ row }">{{ loggedAfterDrop(row) }}</template>
        </el-table-column>
        <el-table-column label="跟进状态" prop="followStatus" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="optionType(followStatusOptions, row.followStatus)">
              {{ optionLabel(followStatusOptions, row.followStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跟进人" prop="followOwner" min-width="100">
          <template slot-scope="{ row }">{{ showDash(row.followOwner) }}</template>
        </el-table-column>
        <el-table-column label="最近跟进时间" prop="followTime" min-width="165">
          <template slot-scope="{ row }">{{ showDash(row.followTime) }}</template>
        </el-table-column>
        <el-table-column label="跟进备注" prop="followRemark" min-width="180" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ showDash(row.followRemark) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="openFollow(row)">标记跟进</el-button>
            <el-button type="text" size="mini" @click="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="filteredRows.length > 0"
        :total="filteredRows.length"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="handlePageChange"
      />
    </el-card>

    <el-dialog title="标记跟进" :visible.sync="followVisible" width="460px" append-to-body>
      <el-form :model="followForm" label-width="88px">
        <el-form-item label="会员账号">
          <el-input :value="activeRow ? activeRow.userName : ''" disabled />
        </el-form-item>
        <el-form-item label="跟进状态">
          <el-select v-model="followForm.followStatus" class="full-width">
            <el-option v-for="item in followStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进备注">
          <el-input v-model.trim="followForm.followRemark" type="textarea" :rows="4" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="followVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFollow">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog title="掉签详情" :visible.sync="detailVisible" width="780px" append-to-body>
      <div v-if="activeRow" class="detail-panel">
        <div class="detail-title">{{ activeRow.userName }} / {{ activeRow.realName }}</div>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="所属站点">{{ activeRow.siteName }}</el-descriptions-item>
          <el-descriptions-item label="手机号码">{{ activeRow.phone }}</el-descriptions-item>
          <el-descriptions-item label="用户邮箱">{{ showDash(activeRow.email) }}</el-descriptions-item>
          <el-descriptions-item label="上级代理">{{ showDash(activeRow.parentAgentName) }}</el-descriptions-item>
          <el-descriptions-item label="客户端">{{ activeRow.clientType }}</el-descriptions-item>
          <el-descriptions-item label="当前版本">{{ activeRow.appVersion }}</el-descriptions-item>
          <el-descriptions-item label="掉签状态">{{ signStatusMeta(activeRow).label }}</el-descriptions-item>
          <el-descriptions-item label="掉签后登录">{{ loggedAfterDrop(activeRow) }}</el-descriptions-item>
          <el-descriptions-item label="掉签时间">{{ showDash(activeRow.dropSignTime) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ showDash(activeRow.lastLoginTime) }}</el-descriptions-item>
          <el-descriptions-item label="用户状态">{{ optionLabel(userStatusOptions, activeRow.userStatus) }}</el-descriptions-item>
          <el-descriptions-item label="跟进状态">{{ optionLabel(followStatusOptions, activeRow.followStatus) }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-note">
          判定依据：{{ detailJudgeText(activeRow) }}
        </div>
        <div class="detail-note">
          跟进备注：{{ showDash(activeRow.followRemark) }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  buildSeedRows,
  clientTypeOptions,
  followStatusOptions,
  loginStatusOptions,
  signStatusOptions,
  siteOptions,
  userStatusOptions,
  versionOptions
} from './mock'

const STORAGE_KEY = 'master-admin-prototype:drop-sign-analysis:v4'

export default {
  name: 'DropSignAnalysis',
  data() {
    return {
      loading: false,
      exportLoading: false,
      rows: [],
      activeRow: null,
      followVisible: false,
      detailVisible: false,
      followForm: {
        followStatus: 'pending',
        followRemark: ''
      },
      siteOptions,
      signStatusOptions,
      loginStatusOptions,
      userStatusOptions,
      clientTypeOptions,
      versionOptions,
      followStatusOptions,
      queryParams: this.defaultQuery()
    }
  },
  computed: {
    filteredRows() {
      return this.rows.filter(row => this.matchRow(row))
    },
    pagedRows() {
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      return this.filteredRows.slice(start, start + this.queryParams.pageSize)
    },
    summaryCards() {
      const all = this.filteredRows
      const dropRows = all.filter(row => row.dropSignTime)
      return [
        { label: '掉签用户数', value: `${dropRows.length} 人`, desc: '存在掉签时间的用户', className: 'text-blue' },
        { label: '掉签流失用户数', value: `${all.filter(row => this.signStatusValue(row) === 'lost').length} 人`, desc: '掉签后未再登录', className: 'text-red' },
        { label: '已恢复用户数', value: `${all.filter(row => this.signStatusValue(row) === 'recovered').length} 人`, desc: '掉签后已重新登录', className: 'text-green' },
        { label: '待跟进用户数', value: `${all.filter(row => row.followStatus === 'pending').length} 人`, desc: '建议运营优先外呼', className: 'text-amber' }
      ]
    }
  },
  created() {
    this.loadRows()
  },
  methods: {
    defaultQuery() {
      return {
        pageNum: 1,
        pageSize: 10,
        siteCode: '',
        keyword: '',
        signStatus: 'lost',
        loginStatus: '',
        userStatus: '',
        clientType: 'iOS',
        appVersion: '',
        followStatus: '',
        dropSignRange: [],
        lastLoginRange: []
      }
    },
    loadRows() {
      const cached = window.localStorage.getItem(STORAGE_KEY)
      if (cached) {
        try {
          this.rows = JSON.parse(cached)
          return
        } catch (e) {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }
      this.rows = buildSeedRows()
      this.saveRows()
    },
    saveRows() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rows))
    },
    matchRow(row) {
      const keyword = this.queryParams.keyword.toLowerCase()
      if (this.queryParams.siteCode && row.siteCode !== this.queryParams.siteCode) return false
      if (keyword && ![row.userName, row.realName, row.phone, row.email, row.parentAgentName].some(value => String(value).toLowerCase().includes(keyword))) return false
      if (this.queryParams.signStatus && this.signStatusValue(row) !== this.queryParams.signStatus) return false
      if (this.queryParams.loginStatus && row.loginStatus !== this.queryParams.loginStatus) return false
      if (this.queryParams.userStatus && row.userStatus !== this.queryParams.userStatus) return false
      if (this.queryParams.clientType && row.clientType !== this.queryParams.clientType) return false
      if (this.queryParams.appVersion && !row.appVersion.includes(this.queryParams.appVersion)) return false
      if (this.queryParams.followStatus && row.followStatus !== this.queryParams.followStatus) return false
      if (!this.inRange(row.dropSignTime, this.queryParams.dropSignRange)) return false
      if (!this.inRange(row.lastLoginTime, this.queryParams.lastLoginRange)) return false
      return true
    },
    inRange(value, range) {
      if (!range || !range[0] || !range[1]) return true
      if (!value) return false
      return value >= range[0] && value <= range[1]
    },
    handleQuery() {
      this.queryParams.pageNum = 1
    },
    resetQuery() {
      this.queryParams = this.defaultQuery()
    },
    handlePageChange() {},
    openFollow(row) {
      this.activeRow = row
      this.followForm = {
        followStatus: row.followStatus || 'pending',
        followRemark: row.followRemark || ''
      }
      this.followVisible = true
    },
    saveFollow() {
      if (!this.activeRow) return
      const row = this.rows.find(item => item.id === this.activeRow.id)
      if (row) {
        row.followStatus = this.followForm.followStatus
        row.followRemark = this.followForm.followRemark
        row.followOwner = '演示运营'
        row.followTime = this.nowText()
        this.saveRows()
      }
      this.followVisible = false
      this.$message.success('跟进状态已保存')
    },
    openDetail(row) {
      this.activeRow = row
      this.detailVisible = true
    },
    handleExport() {
      this.exportLoading = true
      window.setTimeout(() => {
        this.exportLoading = false
        this.$message.success('已生成当前筛选条件下的 iOS 掉签分析演示数据')
      }, 300)
    },
    signStatusValue(row) {
      if (!row.dropSignTime) return 'normal'
      if (!row.lastLoginTime) return 'lost'
      if (row.lastLoginTime > row.dropSignTime) return 'recovered'
      if (row.lastLoginTime === row.dropSignTime) return 'watching'
      return 'lost'
    },
    signStatusMeta(row) {
      const value = this.signStatusValue(row)
      return this.signStatusOptions.find(item => item.value === value) || this.signStatusOptions[0]
    },
    loggedAfterDrop(row) {
      if (!row.dropSignTime) return '未掉签'
      if (!row.lastLoginTime) return '否'
      if (row.lastLoginTime > row.dropSignTime) return '是'
      if (row.lastLoginTime === row.dropSignTime) return '观察中'
      return '否'
    },
    dropDays(row) {
      if (!row.dropSignTime) return '-'
      const start = new Date(row.dropSignTime.replace(/-/g, '/')).getTime()
      const diff = Date.now() - start
      return `${Math.max(0, Math.ceil(diff / 86400000))} 天`
    },
    detailJudgeText(row) {
      const status = this.signStatusValue(row)
      if (status === 'lost') return '该 iOS 用户存在掉签时间，且最后登录时间早于掉签时间或为空，判定为掉签流失。'
      if (status === 'recovered') return '该 iOS 用户存在掉签时间，但最后登录时间晚于掉签时间，说明已重新登录。'
      if (status === 'watching') return '该 iOS 用户存在掉签时间，但最后登录时间与掉签时间一致，演示口径按观察中处理。'
      return '该 iOS 用户没有掉签时间，作为未掉签对照用户展示。'
    },
    optionLabel(options, value) {
      const item = options.find(option => option.value === value)
      return item ? item.label : '-'
    },
    optionType(options, value) {
      const item = options.find(option => option.value === value)
      return item ? item.type || '' : ''
    },
    showDash(value) {
      return value || '-'
    },
    nowText() {
      const date = new Date()
      const pad = value => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
  }
}
</script>

<style scoped>
.drop-sign-page {
  padding-bottom: 8px;
  background: #f6f8fb;
}
.page-head,
.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-head {
  margin-bottom: 14px;
}
.page-title {
  color: #17233d;
  font-size: 22px;
  font-weight: 700;
}
.page-subtitle,
.table-hint,
.summary-desc {
  color: #71809a;
  font-size: 13px;
}
.filter-card,
.table-card {
  margin-bottom: 14px;
  border-radius: 8px;
}
.w-select,
.w-input {
  width: 180px;
}
.w-date {
  width: 360px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.summary-card {
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(39, 55, 84, 0.06);
}
.summary-label {
  color: #71809a;
  font-size: 13px;
  font-weight: 600;
}
.summary-value {
  margin: 10px 0 4px;
  font-family: Monaco, Menlo, Consolas, monospace;
  font-size: 24px;
  font-weight: 700;
}
.table-head {
  color: #17233d;
  font-weight: 700;
}
.full-width {
  width: 100%;
}
.detail-title {
  margin-bottom: 12px;
  color: #17233d;
  font-size: 18px;
  font-weight: 700;
}
.detail-note {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f5f8fc;
  color: #52627a;
  line-height: 1.7;
}
.text-blue {
  color: #2563eb;
}
.text-red {
  color: #f43f5e;
}
.text-green {
  color: #059669;
}
.text-amber {
  color: #d97706;
}
@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
