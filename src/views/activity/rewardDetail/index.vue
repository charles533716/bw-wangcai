<template>
  <div class="activity-reward-detail-page app-container">
    <section class="page-header">
      <h1 class="page-title">活动奖励明细</h1>
    </section>

    <section class="filter-card">
      <el-form ref="queryForm" :model="queryParams" class="filter-form" @submit.native.prevent>
        <div class="filter-grid">
          <el-form-item class="filter-item" prop="siteCode">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-collection-tag"></i><span>站点</span></span>
            </template>
            <el-select
              v-model="queryParams.siteCode"
              :disabled="meta.siteReadonly"
              :clearable="!meta.siteReadonly"
              placeholder="全部站点"
              style="width: 100%"
            >
              <el-option label="全部站点" value="" />
              <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item class="filter-item" prop="agentKeyword">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-user"></i><span>上级代理</span></span>
            </template>
            <el-input
              v-model.trim="queryParams.agentKeyword"
              clearable
              placeholder="输入代理名称"
              suffix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item class="filter-item" prop="memberName">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-user"></i><span>会员名称</span></span>
            </template>
            <el-input
              v-model.trim="queryParams.memberName"
              clearable
              placeholder="输入会员名称"
              suffix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item class="filter-item" prop="memberUserId">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-s-operation"></i><span>会员ID</span></span>
            </template>
            <el-input
              v-model.trim="queryParams.memberUserId"
              clearable
              placeholder="输入会员ID"
              suffix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item class="filter-item" prop="activityName">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-tickets"></i><span>活动名称</span></span>
            </template>
            <el-input
              v-model.trim="queryParams.activityName"
              clearable
              placeholder="输入活动名称"
              suffix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item class="filter-item" prop="activityType">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-connection"></i><span>活动类型</span></span>
            </template>
            <el-select v-model="queryParams.activityType" clearable placeholder="全部类型" style="width: 100%">
              <el-option label="全部类型" value="" />
              <el-option v-for="item in activityTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item class="filter-item" prop="bonusStatus">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-time"></i><span>领取状态</span></span>
            </template>
            <el-select v-model="queryParams.bonusStatus" clearable placeholder="全部状态" style="width: 100%">
              <el-option label="全部状态" value="" />
              <el-option v-for="item in bonusStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item class="filter-item" prop="createDateRange">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-date"></i><span>日期区间</span></span>
            </template>
            <el-date-picker
              v-model="createDateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy/MM/dd"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item class="filter-item" prop="receivingDateRange">
            <template slot="label">
              <span class="filter-label"><i class="el-icon-time"></i><span>领取时间</span></span>
            </template>
            <el-date-picker
              v-model="receivingDateRange"
              type="datetimerange"
              range-separator="~"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="yyyy/MM/dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <div class="filter-action-cell">
            <el-button class="action-button action-button--secondary" @click="resetQuery">重置</el-button>
            <el-button type="primary" class="action-button action-button--primary" @click="handleQuery">查询</el-button>
          </div>
        </div>
      </el-form>
    </section>

    <section class="detail-card">
      <div class="detail-card__header">
        <div class="detail-card__title-wrap">
          <h2 class="detail-card__title">奖励明细列表</h2>
          <span class="detail-card__badge">共 {{ total }} 条</span>
        </div>
        <div class="detail-card__tools">
          <el-button type="text" class="detail-card__refresh" icon="el-icon-refresh" @click="handleRefresh"></el-button>
          <el-button
            type="success"
            size="mini"
            class="detail-card__export"
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >
            导出数据
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        class="detail-table"
        empty-text="没有查到结果"
        :header-cell-style="headerCellStyle"
        :summary-method="getSummaries"
        show-summary
      >
        <el-table-column label="日期区间" prop="createTime" min-width="180" align="left">
          <template slot-scope="{ row }">
            <span class="date-range-text">{{ resolveDateRangeText(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站点" prop="siteName" min-width="120" align="left">
          <template slot-scope="{ row }">
            <div class="site-cell">
              <span class="site-cell__name">{{ row.siteName || row.siteCode || '-' }}</span>
              <span v-if="row.siteCode" class="site-cell__code">{{ row.siteCode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上级代理" prop="agentName" min-width="120" align="left">
          <template slot-scope="{ row }">
            {{ row.agentName || row.agentCode || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="会员名称" prop="memberName" min-width="120" align="left">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.memberUserId"
              type="text"
              class="member-link-button"
              @click="handleOpenMemberDetail(row)"
            >
              <span class="member-link-text">{{ row.memberName || String(row.memberUserId) }}</span>
            </el-button>
            <span v-else class="member-link-text">{{ row.memberName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务ID" prop="taskId" min-width="96" align="center">
          <template slot-scope="{ row }">
            {{ row.taskId == null ? '-' : row.taskId }}
          </template>
        </el-table-column>
        <el-table-column label="活动编码" prop="activityCode" min-width="188" align="center">
          <template slot-scope="{ row }">
            <span class="table-code">{{ row.activityCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动名称" prop="activityName" min-width="150" align="left">
          <template slot-scope="{ row }">
            <span class="activity-name-text">{{ row.activityName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动类型" prop="activityType" min-width="118" align="center">
          <template slot-scope="{ row }">
            <span class="type-pill">{{ row.activityType || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="任务名称" prop="taskName" min-width="140" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.taskName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动奖励" prop="rewardBonus" min-width="126" align="right">
          <template slot-scope="{ row }">
            <span class="reward-text">{{ formatCurrency(row.rewardBonus) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="领取状态" prop="bonusStatusLabel" min-width="112" align="center">
          <template slot-scope="{ row }">
            <span :class="['status-pill', bonusStatusClass(row.bonusStatus)]">{{ resolveBonusStatusLabel(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="达标时间" prop="finishTime" min-width="172" align="left">
          <template slot-scope="{ row }">
            {{ parseTime(row.finishTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="领取时间" prop="receivingTime" min-width="172" align="left">
          <template slot-scope="{ row }">
            {{ parseTime(row.receivingTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <div class="detail-card__footer">
        <div class="detail-card__range">{{ rangeText }}</div>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="handlePagination"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { getActivityRewardDetailMeta, getActivityRewardDetailSummary, listActivityRewardDetails } from '@/api/activity/rewardDetail'

function createDefaultQuery() {
  return {
    pageNum: 1,
    pageSize: 20,
    siteCode: '',
    agentKeyword: '',
    memberName: '',
    memberUserId: '',
    activityName: '',
    activityType: '',
    bonusStatus: ''
  }
}

function formatSlashDate(value) {
  return String(value || '').replace(/-/g, '/')
}

function padNumber(value) {
  return value < 10 ? '0' + value : String(value)
}

function formatDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('-')
}

function createDefaultCreateDateRange() {
  const endDate = new Date()
  const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  const startDate = new Date(normalizedEndDate)
  startDate.setDate(normalizedEndDate.getDate() - 6)
  return [formatDateValue(startDate), formatDateValue(normalizedEndDate)]
}

function formatCompactDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('')
}

export default {
  name: 'ActivityRewardDetail',
  data() {
    return {
      loading: false,
      exportLoading: false,
      total: 0,
      list: [],
      summaryTotals: {},
      meta: {
        siteReadonly: false,
        currentSiteCode: '',
        siteOptions: [],
        activityTypes: [],
        bonusStatusOptions: []
      },
      queryParams: createDefaultQuery(),
      createDateRange: createDefaultCreateDateRange(),
      receivingDateRange: []
    }
  },
  computed: {
    siteOptions() {
      return Array.isArray(this.meta.siteOptions) ? this.meta.siteOptions : []
    },
    activityTypeOptions() {
      return Array.isArray(this.meta.activityTypes) ? this.meta.activityTypes : []
    },
    bonusStatusOptions() {
      return Array.isArray(this.meta.bonusStatusOptions) ? this.meta.bonusStatusOptions : []
    },
    bonusStatusMap() {
      return this.bonusStatusOptions.reduce((acc, item) => {
        acc[String(item.value)] = item.label
        return acc
      }, {})
    },
    rangeText() {
      if (!this.total) {
        return '暂无记录'
      }
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      const end = Math.min(this.queryParams.pageNum * this.queryParams.pageSize, this.total)
      return `显示 ${start} 到 ${end} 条，共 ${this.total} 条记录`
    }
  },
  created() {
    this.initializePage()
  },
  methods: {
    async initializePage() {
      await this.loadMeta()
      await this.getList(true)
    },
    async loadMeta() {
      const res = await getActivityRewardDetailMeta()
      this.meta = res.data || this.meta
      const nextQuery = createDefaultQuery()
      if (this.meta.siteReadonly) {
        nextQuery.siteCode = this.meta.currentSiteCode || ''
      }
      nextQuery.activityType = ''
      nextQuery.bonusStatus = ''
      this.queryParams = Object.assign({}, this.queryParams, nextQuery)
    },
    buildQueryParams() {
      const params = Object.assign({}, this.queryParams)
      params.memberUserId = params.memberUserId === '' ? undefined : Number(params.memberUserId)
      if (Number.isNaN(params.memberUserId)) {
        params.memberUserId = undefined
      }
      params.bonusStatus = params.bonusStatus === '' || params.bonusStatus === null ? undefined : Number(params.bonusStatus)
      if (Number.isNaN(params.bonusStatus)) {
        params.bonusStatus = undefined
      }
      params.createStartDate = Array.isArray(this.createDateRange) && this.createDateRange.length === 2 ? this.createDateRange[0] : undefined
      params.createEndDate = Array.isArray(this.createDateRange) && this.createDateRange.length === 2 ? this.createDateRange[1] : undefined
      params.receivingStartDate = Array.isArray(this.receivingDateRange) && this.receivingDateRange.length === 2 ? this.receivingDateRange[0] : undefined
      params.receivingEndDate = Array.isArray(this.receivingDateRange) && this.receivingDateRange.length === 2 ? this.receivingDateRange[1] : undefined
      return params
    },
    async getList(includeSummary = false) {
      this.loading = true
      try {
        const params = this.buildQueryParams()
        const res = await listActivityRewardDetails(params)
        this.list = Array.isArray(res.rows) ? res.rows : []
        this.total = Number(res.total || 0)
        if (includeSummary === true) {
          await this.getSummary(params)
        }
      } finally {
        this.loading = false
      }
    },
    async getSummary(params) {
      try {
        const res = await getActivityRewardDetailSummary(params)
        const data = res.data || {}
        this.summaryTotals = {
          rewardBonus: this.toNumber(data.rewardBonus) || 0
        }
      } catch (e) {
        this.summaryTotals = {}
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList(true)
    },
    handlePagination() {
      this.getList(false)
    },
    handleRefresh() {
      this.getList(true)
    },
    handleOpenMemberDetail(row) {
      const memberId = row && row.memberUserId
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法查看详情')
        return
      }
      this.$router.push({
        name: 'MemberDetail',
        params: { id: String(memberId) },
        query: {
          name: row.memberName || ''
        }
      })
    },
    resetQuery() {
      const nextQuery = createDefaultQuery()
      if (this.meta.siteReadonly) {
        nextQuery.siteCode = this.meta.currentSiteCode || ''
      }
      nextQuery.activityType = ''
      nextQuery.bonusStatus = ''
      this.queryParams = nextQuery
      this.createDateRange = createDefaultCreateDateRange()
      this.receivingDateRange = []
      this.$nextTick(() => {
        if (this.$refs.queryForm) {
          this.$refs.queryForm.clearValidate && this.$refs.queryForm.clearValidate()
        }
      })
      this.handleQuery()
    },
    async handleExport() {
      this.exportLoading = true
      try {
        await this.$confirm('是否导出当前筛选条件下的数据？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.download('/activity/reward-detail/export', this.buildQueryParams(), `活动奖励明细_${formatCompactDateValue(new Date())}.xlsx`)
      } catch (error) {
        if (error !== 'cancel') {
          throw error
        }
      } finally {
        this.exportLoading = false
      }
    },
    resolveDateRangeText(row) {
      if (Array.isArray(this.createDateRange) && this.createDateRange.length === 2) {
        return `${formatSlashDate(this.createDateRange[0])} ~ ${formatSlashDate(this.createDateRange[1])}`
      }
      return this.parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-'
    },
    headerCellStyle() {
      return {
        background: '#2f7df6',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        borderBottom: 'none'
      }
    },
    getSummaries({ columns }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        if (column.property === 'rewardBonus' && Object.prototype.hasOwnProperty.call(this.summaryTotals, 'rewardBonus')) {
          sums[index] = this.formatCurrency(this.summaryTotals.rewardBonus)
          return
        }
        sums[index] = '-'
      })
      return sums
    },
    toNumber(value) {
      if (value === null || value === undefined || value === '') {
        return null
      }
      const num = Number(value)
      return Number.isFinite(num) ? num : null
    },
    formatCurrency(value) {
      const num = Number(value || 0)
      return `¥${num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    bonusStatusClass(status) {
      if (Number(status) === 1) {
        return 'status-pill--success'
      }
      if (Number(status) === 2) {
        return 'status-pill--danger'
      }
      return 'status-pill--warning'
    },
    resolveBonusStatusLabel(row) {
      if (row && row.bonusStatusLabel) {
        return row.bonusStatusLabel
      }
      return this.bonusStatusMap[String(row && row.bonusStatus)] || '-'
    }
  }
}
</script>

<style scoped>
.activity-reward-detail-page {
  min-height: calc(100vh - 84px);
  background: #f5f8fc;
}

.page-header {
  margin-bottom: 18px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #1f2d3d;
}

.filter-card,
.detail-card {
  border: 1px solid #e3ebf5;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(31, 45, 61, 0.04);
}

.filter-card {
  padding: 18px 20px 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px 16px;
  align-items: end;
}

.filter-item {
  margin-bottom: 0;
}

.filter-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-label i {
  font-size: 14px;
  color: #92a0b5;
}

.filter-action-cell {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-self: end;
  padding-bottom: 2px;
}

.action-button {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.action-button--secondary {
  border-color: #e2e8f2;
  color: #61728a;
  background: #f7f9fc;
}

.action-button--primary {
  background: linear-gradient(135deg, #3f8cff 0%, #2f6dff 100%);
  border-color: transparent;
}

.detail-card {
  margin-top: 22px;
  overflow: hidden;
}

.detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
}

.detail-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-card__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.detail-card__badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eff5ff;
  color: #6280b5;
  font-size: 12px;
  font-weight: 600;
}

.detail-card__tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-card__refresh {
  padding: 0;
  color: #8ea0bb;
  font-size: 18px;
}

.detail-card__export {
  min-width: 108px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #33c56f 0%, #26b563 100%);
  border-color: transparent;
}

.detail-table {
  width: 100%;
}

.date-range-text,
.activity-name-text {
  color: #4a5b73;
  font-weight: 600;
}

.site-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.site-cell__name {
  color: #4a5b73;
  font-weight: 600;
}

.site-cell__code,
.table-code {
  color: #74839a;
  font-size: 12px;
  line-height: 1.4;
}

.member-link-text {
  color: #2f6dff;
  font-weight: 700;
}

.member-link-button {
  padding: 0;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eff5ff;
  color: #2f6dff;
  font-size: 12px;
  font-weight: 700;
}

.reward-text {
  color: #ff5d6c;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill--success {
  background: #eafaf2;
  color: #1ca56d;
}

.status-pill--warning {
  background: #fff7e8;
  color: #d18a10;
}

.status-pill--danger {
  background: #eef3f8;
  color: #8ba0b8;
}

.detail-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 22px;
}

.detail-card__range {
  color: #8a98ad;
  font-size: 13px;
}

.activity-reward-detail-page ::v-deep .el-form-item__label {
  padding-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #5c6f89;
}

.activity-reward-detail-page ::v-deep .el-input__inner,
.activity-reward-detail-page ::v-deep .el-select .el-input__inner,
.activity-reward-detail-page ::v-deep .el-date-editor .el-input__inner {
  height: 42px;
  border-color: #dbe4ef;
  border-radius: 12px;
  color: #32465a;
  font-size: 14px;
}

.activity-reward-detail-page ::v-deep .el-range-editor.el-input__inner {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border-color: #dbe4ef;
}

.activity-reward-detail-page ::v-deep .el-table th,
.activity-reward-detail-page ::v-deep .el-table tr {
  background: #ffffff;
}

.activity-reward-detail-page ::v-deep .el-table td,
.activity-reward-detail-page ::v-deep .el-table th.is-leaf {
  border-bottom: 1px solid #edf2f8;
}

.activity-reward-detail-page ::v-deep .el-table .cell {
  padding-left: 14px;
  padding-right: 14px;
}

.activity-reward-detail-page ::v-deep .pagination-container {
  padding: 0;
  margin: 0;
}

@media (max-width: 1680px) {
  .filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1360px) {
  .filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-action-cell,
  .detail-card__footer,
  .detail-card__header {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
