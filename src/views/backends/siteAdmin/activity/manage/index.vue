<template>
  <div class="app-container activity-page">
    <template v-if="detailVisible">
      <div class="detail-header">
        <div>
          <div class="detail-header__eyebrow">活动详情</div>
          <h2 class="detail-header__title">{{ detail.activityName || '-' }}</h2>
        </div>
        <el-button icon="el-icon-back" @click="backToList">返回活动列表</el-button>
      </div>

      <el-card v-loading="detailLoading" shadow="never" class="detail-card">
        <section class="detail-section">
          <div class="detail-section__title">基础信息</div>
          <div class="detail-info-grid">
            <div class="detail-info-item">
              <span class="detail-info-item__label">活动名称</span>
              <span class="detail-info-item__value">{{ detail.activityName || '-' }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">站点</span>
              <span class="detail-info-item__value">{{ detail.siteName || detail.siteCode || currentSiteCode || '-' }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">状态</span>
              <span class="detail-info-item__value">
                <el-tag :type="statusTagType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
              </span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">活动类型</span>
              <span class="detail-info-item__value">{{ activityTypeLabel(detail.activityType) }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">活动对象</span>
              <span class="detail-info-item__value">{{ activityObjectLabel(detail.activityObject) }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">活动开始时间</span>
              <span class="detail-info-item__value">{{ formatDate(detail.activityBeginTime) }}</span>
            </div>
            <div class="detail-info-item">
              <span class="detail-info-item__label">活动结束时间</span>
              <span class="detail-info-item__value">{{ formatEndTime(detail.activityEndTime) }}</span>
            </div>
          </div>
        </section>

        <div v-if="detail.activityDetailPictureUrl" class="detail-picture">
          <div class="detail-picture__title">活动详细说明图</div>
          <div class="detail-picture__preview">
            <el-image
              :src="detail.activityDetailPictureUrl"
              :preview-src-list="[detail.activityDetailPictureUrl]"
              fit="contain"
            />
          </div>
        </div>
      </el-card>
    </template>

    <template v-else>
      <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="活动名称" prop="activityName">
          <el-input
            v-model="queryParams.activityName"
            placeholder="请输入活动名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="活动类型" prop="activityType">
          <el-select v-model="queryParams.activityType" placeholder="全部" clearable size="small">
            <el-option
              v-for="item in activityTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="站点" prop="siteCode">
          <el-select
            v-if="canSelectSite"
            v-model="queryParams.siteCode"
            placeholder="全部站点"
            clearable
            filterable
            size="small"
          >
            <el-option
              v-for="item in siteOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            :value="currentSiteLabel"
            disabled
            size="small"
          />
        </el-form-item>
        <el-form-item label="查询日期">
          <el-date-picker
            v-model="queryDateRange"
            size="small"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="activityList" empty-text="没有查到结果">
        <el-table-column label="时间" align="center" prop="createTime" min-width="170">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站点" align="center" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.siteName || scope.row.siteCode || currentSiteCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动编码" align="center" prop="activityCode" min-width="190">
          <template slot-scope="scope">
            <span class="table-code">{{ scope.row.activityCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动名称" align="center" prop="activityName" min-width="180" />
        <el-table-column label="活动类型" align="center" prop="activityType" min-width="130">
          <template slot-scope="scope">
            <span>{{ activityTypeLabel(scope.row.activityType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动对象" align="center" prop="activityObject" min-width="130">
          <template slot-scope="scope">
            <span>{{ activityObjectLabel(scope.row.activityObject) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center" prop="activityBeginTime" min-width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.activityBeginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="activityEndTime" min-width="120">
          <template slot-scope="scope">
            <span>{{ formatEndTime(scope.row.activityEndTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动排序" align="center" prop="activitySort" min-width="96">
          <template slot-scope="scope">
            <span>{{ scope.row.activitySort == null ? '-' : scope.row.activitySort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="热门排序" align="center" prop="hotSort" min-width="96">
          <template slot-scope="scope">
            <span>{{ scope.row.hotSort == null ? '-' : scope.row.hotSort }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" align="center" prop="status" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" min-width="90" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              :loading="detailLoading && detail.id === scope.row.id"
              @click="handleDetail(scope.row)"
            >详细</el-button>
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
    </template>
  </div>
</template>

<script>
import { getActivity, getActivityMeta, listActivities } from '@/api/activity/manage'

const DEFAULT_ACTIVITY_TYPES = [
  { value: '20', label: '连胜' },
  { value: '25', label: '新人礼' },
  { value: '26', label: '首充' },
  { value: '30', label: '通用活动' }
]

const DEFAULT_ACTIVITY_OBJECTS = [
  { value: '0', label: '全体会员' },
  { value: '1', label: 'VIP会员' },
  { value: '2', label: '注册7天内会员' },
  { value: '3', label: '指定代理' }
]

function normalizeOptions(options) {
  return Array.isArray(options)
    ? options.map(item => ({
      value: String(item.value == null ? item.dictValue : item.value),
      label: item.label || item.dictLabel || String(item.value == null ? item.dictValue : item.value)
    }))
    : []
}

function createDefaultQuery(siteCode) {
  return {
    pageNum: 1,
    pageSize: 10,
    activityName: '',
    activityType: '',
    siteCode: siteCode || ''
  }
}

function normalizeRoleKey(role) {
  if (role && typeof role === 'object') {
    return String(role.roleKey || role.key || '').toLowerCase()
  }
  return String(role || '').toLowerCase()
}

export default {
  name: 'SiteActivityManage',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      activityList: [],
      queryDateRange: [],
      queryParams: createDefaultQuery(this.resolveCurrentSiteCode()),
      meta: {},
      detailLoading: false,
      detailVisible: false,
      detail: {}
    }
  },
  computed: {
    currentSiteCode() {
      return this.resolveCurrentSiteCode()
    },
    activityTypeOptions() {
      const options = normalizeOptions(this.meta.activityTypes || this.meta.activityTypeOptions)
      return options.length ? options : DEFAULT_ACTIVITY_TYPES
    },
    activityObjectOptions() {
      const options = normalizeOptions(this.meta.activityObjects || this.meta.activityObjectOptions)
      return options.length ? options : DEFAULT_ACTIVITY_OBJECTS
    },
    siteOptions() {
      return normalizeOptions(this.meta.siteOptions)
    },
    isSuperAdmin() {
      const roles = this.$store.getters.roles || []
      return roles.map(normalizeRoleKey).includes('admin')
    },
    canSelectSite() {
      return this.isSuperAdmin && this.meta.siteReadonly !== true
    },
    currentSiteLabel() {
      const siteCode = this.resolveCurrentSiteCode()
      const matched = this.siteOptions.find(item => item.value === siteCode)
      return matched ? matched.label : (siteCode || '-')
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      await this.loadMeta()
      this.getList()
    },
    async loadMeta() {
      try {
        const res = await getActivityMeta()
        this.meta = (res && res.data) || {}
        if (this.canSelectSite) {
          this.queryParams.siteCode = ''
        } else {
          this.queryParams.siteCode = this.resolveCurrentSiteCode()
        }
      } catch (e) {
        this.meta = {}
      }
    },
    resolveCurrentSiteCode() {
      return this.$store.getters.userSiteCode || this.$store.getters.siteCode || ''
    },
    buildListQuery() {
      const siteCode = this.resolveCurrentSiteCode()
      const query = Object.assign({}, this.queryParams)
      if (this.canSelectSite) {
        query.siteCode = this.queryParams.siteCode || ''
      } else {
        query.siteCode = siteCode
      }
      if (this.queryDateRange && this.queryDateRange.length === 2) {
        query.queryStartDate = this.queryDateRange[0]
        query.queryEndDate = this.queryDateRange[1]
      }
      return query
    },
    getList() {
      const siteCode = this.resolveCurrentSiteCode()
      if (!this.canSelectSite) {
        this.queryParams.siteCode = siteCode
      }
      if (!this.canSelectSite && !siteCode) {
        this.activityList = []
        this.total = 0
        this.$modal.msgWarning('当前账号未绑定站点，无法查询活动列表')
        return
      }
      this.loading = true
      listActivities(this.buildListQuery()).then(res => {
        this.activityList = res.rows || []
        this.total = res.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryDateRange = []
      this.queryParams = createDefaultQuery(this.canSelectSite ? '' : this.resolveCurrentSiteCode())
      this.resetForm && this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDetail(row) {
      if (!row || !row.id) {
        this.$modal.msgWarning('活动ID不存在，无法查看详情')
        return
      }
      this.detail = Object.assign({}, row)
      this.detailLoading = true
      getActivity(row.id, { activityType: row.activityType }).then(res => {
        this.detail = Object.assign({}, row, (res && res.data) || {})
        this.detailVisible = true
      }).finally(() => {
        this.detailLoading = false
      })
    },
    backToList() {
      this.detailVisible = false
      this.detail = {}
    },
    activityTypeLabel(value) {
      const normalized = String(value == null ? '' : value)
      const matched = this.activityTypeOptions.find(item => item.value === normalized)
      return matched ? matched.label : (normalized || '-')
    },
    activityObjectLabel(value) {
      const normalized = String(value == null ? '' : value)
      const matched = this.activityObjectOptions.find(item => item.value === normalized)
      return matched ? matched.label : (normalized || '-')
    },
    statusLabel(value) {
      return String(value) === '0' ? '启用' : '停用'
    },
    statusTagType(value) {
      return String(value) === '0' ? 'success' : 'info'
    },
    formatDate(value) {
      return this.parseTime(value, '{y}-{m}-{d}') || '-'
    },
    formatEndTime(value) {
      return value ? (this.parseTime(value, '{y}-{m}-{d}') || '-') : '长期有效'
    }
  }
}
</script>

<style scoped>
.activity-page {
  min-height: calc(100vh - 84px);
}

.table-code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 12px;
  color: #53657d;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.detail-header__eyebrow {
  color: #409eff;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.detail-header__title {
  margin: 0;
  color: #1f2f46;
  font-size: 22px;
  font-weight: 700;
}

.detail-card {
  border-radius: 8px;
}

.detail-section + .detail-section,
.detail-section + .detail-picture {
  margin-top: 24px;
}

.detail-section__title {
  margin-bottom: 12px;
  color: #1f2f46;
  font-size: 15px;
  font-weight: 700;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 24px;
  padding: 18px 20px;
  border: 1px solid #e5edf6;
  border-radius: 8px;
  background: #fbfdff;
}

.detail-info-item {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-info-item__label {
  flex: 0 0 92px;
  color: #8a96a8;
  font-size: 13px;
  text-align: right;
}

.detail-info-item__value {
  min-width: 0;
  color: #303b4d;
  font-size: 14px;
  word-break: break-word;
}

.detail-picture {
  margin-top: 24px;
}

.detail-picture__title {
  margin-bottom: 12px;
  color: #1f2f46;
  font-size: 15px;
  font-weight: 700;
}

.detail-picture__preview {
  width: 100%;
  padding: 16px;
  border: 1px solid #e5edf6;
  border-radius: 8px;
  background: #f8fafc;
  text-align: center;
}

.detail-picture__preview ::v-deep .el-image {
  width: 100%;
  max-width: 100%;
}

.detail-picture__preview ::v-deep .el-image__inner {
  width: 100%;
  height: auto;
  object-fit: contain;
}

@media (max-width: 1100px) {
  .detail-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .detail-info-item__label {
    flex-basis: 86px;
  }

}
</style>
