<template>
  <div class="app-container bonus-report-page">
    <section class="page-head">
      <div class="head-title-wrap">
        <div class="title-icon">
          <i class="el-icon-present"></i>
        </div>
        <div>
          <h2 class="page-title">礼金统计报表</h2>
          <p class="page-subtitle">统计全站各项礼金的发放情况，包含活动、晋升、周期性礼金等明细。</p>
        </div>
      </div>
      <el-button plain icon="el-icon-download" class="export-btn" :loading="exportLoading" @click="handleExport" v-hasPermi="['vip:bonus:export']">
        导出报表
      </el-button>
    </section>

    <section class="summary-grid" v-loading="loading">
      <article
        v-for="item in summaryCards"
        :key="item.key"
        class="summary-card"
      >
        <div class="summary-top">
          <div class="summary-icon" :class="item.iconClass">
            <i :class="item.icon"></i>
          </div>
          <div class="summary-label">{{ item.label }}</div>
        </div>
        <div class="summary-amount" :class="{ 'summary-amount--compact': item.compact }">
          {{ formatSummaryAmount(item.amount) }}
        </div>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-item">
        <label>日期范围:</label>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          size="small"
          class="w-date"
          unlink-panels
        />
      </div>

      <div class="filter-item">
        <label>领取时间:</label>
        <el-date-picker
          v-model="queryParams.receiveDateRange"
          type="datetimerange"
          range-separator="~"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          size="small"
          class="w-date-time"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
        />
      </div>

      <div class="filter-item">
        <label>所属站点:</label>
        <el-select v-model="queryParams.siteCode" size="small" class="w-site-select">
          <el-option
            v-for="site in siteOptions"
            :key="String(site.code)"
            :label="site.label"
            :value="site.code"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>礼金类型:</label>
        <el-select v-model="queryParams.bonusType" size="small" class="w-select">
          <el-option label="全部类型" value="" />
          <el-option
            v-for="item in bonusTypeOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="String(item.dictValue)"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>发放状态:</label>
        <el-select v-model="queryParams.status" size="small" class="w-select">
          <el-option label="全部状态" value="" />
          <el-option
            v-for="item in statusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="String(item.dictValue)"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>会员名:</label>
        <el-input
          v-model.trim="queryParams.keyword"
          size="small"
          clearable
          placeholder="请输入会员名"
          class="w-search"
          @keyup.enter.native="handleQuery"
        >
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>

      <div class="filter-item">
        <label>上级代理:</label>
        <el-input
          v-model.trim="queryParams.agentKeyword"
          size="small"
          clearable
          placeholder="请输入上级代理"
          class="w-search"
          @keyup.enter.native="handleQuery"
        >
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>

      <div class="filter-actions">
        <el-button type="primary" size="small" class="query-btn" @click="handleQuery">查询</el-button>
        <el-button size="small" icon="el-icon-refresh-left" circle @click="resetQuery"></el-button>
      </div>
    </section>

    <section class="table-card">
      <el-table
        v-loading="loading"
        :data="tableRows"
        size="small"
        class="bonus-table"
        show-summary
        :summary-method="getTableSummaries"
      >
        <el-table-column prop="statDate" label="日期" min-width="130">
          <template slot-scope="scope">
            <span class="date-text">{{ formatStatDate(scope.row.statDate) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="siteName" label="所属站点" min-width="140">
          <template slot-scope="scope">
            <div class="cell-with-icon">
              <i class="el-icon-s-home icon-muted"></i>
              <span>{{ scope.row.siteName || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="agentCode" label="上级代理" min-width="120" />

        <el-table-column prop="userName" label="用户名称" min-width="120">
          <template slot-scope="scope">
            <div class="cell-with-icon">
              <i class="el-icon-user icon-primary"></i>
              <span>{{ scope.row.userName || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="memberUserId" label="会员ID" min-width="100" />

        <el-table-column prop="vipLevel" label="VIP等级" min-width="95">
          <template slot-scope="scope">
            <span class="vip-pill">VIP {{ scope.row.vipLevel || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="bonusType" label="礼金类型" min-width="120">
          <template slot-scope="scope">
            <span :class="['type-pill', getBonusTypeClass(scope.row.bonusType)]">
              {{ getBonusTypeLabel(scope.row.bonusType) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="bonusAmount" label="礼金额度" min-width="130" align="right">
          <template slot-scope="scope">
            <span class="amount-text">{{ formatAmount(scope.row.bonusAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" min-width="110">
          <template slot-scope="scope">
            <span :class="['status-pill', getStatusClass(scope.row.status)]">
              <i class="status-dot"></i>
              {{ getStatusLabel(scope.row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="receiveTime" label="领取时间" min-width="165">
          <template slot-scope="scope">
            <span>{{ formatDateTime(scope.row.receiveTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <section class="tip-panel">
      <div class="tip-icon">
        <i class="el-icon-info"></i>
      </div>
      <div class="tip-content">
        <h4>报表统计说明</h4>
        <p>* 本报表统计全站所有类型的礼金发放明细，包含手动发放与系统自动触发的礼金。</p>
        <p>* 晋升礼金、周礼金、月礼金等周期性奖励将根据会员VIP等级配置自动生成。</p>
        <p>* 待领取状态的礼金需要会员在前端手动领取后方可计入余额。</p>
      </div>
    </section>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { listSite } from '@/api/site/site'
import { listBonusReport, getBonusReportSummary } from '@/api/report/bonus'

const DEFAULT_BONUS_TYPE_OPTIONS = [
  { dictLabel: '活动礼金', dictValue: '0' },
  { dictLabel: '晋升礼金', dictValue: '1' },
  { dictLabel: '周礼金', dictValue: '2' },
  { dictLabel: '月礼金', dictValue: '3' }
]

const DEFAULT_STATUS_OPTIONS = [
  { dictLabel: '待领取', dictValue: '0' },
  { dictLabel: '已领取', dictValue: '1' },
  { dictLabel: '已过期', dictValue: '2' }
]

export default {
  name: 'BonusReport',
  data() {
    return {
      loading: false,
      exportLoading: false,
      total: 0,
      tableRows: [],
      siteOptions: [{ code: '', label: '全部站点' }],
      bonusTypeOptions: DEFAULT_BONUS_TYPE_OPTIONS.slice(),
      statusOptions: DEFAULT_STATUS_OPTIONS.slice(),
      summaryData: {
        totalBonusAmount: 0,
        activityBonusAmount: 0,
        upgradeBonusAmount: 0,
        weeklyBonusAmount: 0,
        monthlyBonusAmount: 0,
        expiredBonusAmount: 0
      },
      tableSummaryBonusAmount: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        receiveDateRange: [],
        siteCode: '',
        bonusType: '',
        status: '',
        keyword: '',
        agentKeyword: ''
      }
    }
  },
  computed: {
    summaryCards() {
      return [
        {
          key: 'all',
          label: '总发放礼金',
          amount: this.summaryData.totalBonusAmount,
          icon: 'el-icon-s-finance',
          iconClass: 'is-blue',
          compact: true
        },
        {
          key: 'activity',
          label: '总活动礼金',
          amount: this.summaryData.activityBonusAmount,
          icon: 'el-icon-present',
          iconClass: 'is-red',
          compact: false
        },
        {
          key: 'upgrade',
          label: '总晋升礼金',
          amount: this.summaryData.upgradeBonusAmount,
          icon: 'el-icon-trophy',
          iconClass: 'is-orange',
          compact: true
        },
        {
          key: 'weekly',
          label: '周礼金',
          amount: this.summaryData.weeklyBonusAmount,
          icon: 'el-icon-date',
          iconClass: 'is-indigo',
          compact: true
        },
        {
          key: 'monthly',
          label: '总月礼金',
          amount: this.summaryData.monthlyBonusAmount,
          icon: 'el-icon-notebook-2',
          iconClass: 'is-green',
          compact: true
        },
        {
          key: 'expired',
          label: '过期总礼金',
          amount: this.summaryData.expiredBonusAmount,
          icon: 'el-icon-time',
          iconClass: 'is-slate',
          compact: true
        }
      ]
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    async initPage() {
      await Promise.all([this.loadDicts(), this.loadSiteOptions()])
      this.getList()
    },
    async loadSiteOptions() {
      try {
        const response = await listSite({ pageNum: 1, pageSize: 1000 })
        const rows = Array.isArray(response.rows) ? response.rows : []
        const siteRows = rows.filter((site) => site && site.code).map((site) => ({
          code: site.code,
          label: `${site.nameZn || site.nameEn || site.code || site.id} (${site.code || site.id})`
        }))
        this.siteOptions = [{ code: '', label: '全部站点' }].concat(siteRows)
      } catch (e) {
        this.siteOptions = [{ code: '', label: '全部站点' }]
      }
    },
    async loadDicts() {
      try {
        const [bonusTypeRes, statusRes] = await Promise.all([
          this.getDicts('bonus_type'),
          this.getDicts('issuance_status')
        ])
        const bonusTypeRows = Array.isArray(bonusTypeRes.data) ? bonusTypeRes.data : []
        const statusRows = Array.isArray(statusRes.data) ? statusRes.data : []
        if (bonusTypeRows.length) {
          this.bonusTypeOptions = bonusTypeRows
        }
        if (statusRows.length) {
          this.statusOptions = statusRows
        }
      } catch (e) {
        this.bonusTypeOptions = DEFAULT_BONUS_TYPE_OPTIONS.slice()
        this.statusOptions = DEFAULT_STATUS_OPTIONS.slice()
      }
    },
    buildQueryParams(includePage = true, includeTypeStatus = true) {
      const params = {}
      if (includePage) {
        params.pageNum = this.queryParams.pageNum
        params.pageSize = this.queryParams.pageSize
      }
      if (this.queryParams.dateRange && this.queryParams.dateRange.length === 2) {
        params.beginStatDate = this.queryParams.dateRange[0]
        params.endStatDate = this.queryParams.dateRange[1]
      }
      if (this.queryParams.receiveDateRange && this.queryParams.receiveDateRange.length === 2) {
        params.beginReceiveTime = this.queryParams.receiveDateRange[0]
        params.endReceiveTime = this.queryParams.receiveDateRange[1]
      }
      if (this.queryParams.siteCode !== undefined && this.queryParams.siteCode !== null && this.queryParams.siteCode !== '') {
        params.siteCode = this.queryParams.siteCode
      }
      if (this.queryParams.keyword) {
        params.keyword = this.queryParams.keyword
      }
      if (this.queryParams.agentKeyword) {
        params.agentKeyword = this.queryParams.agentKeyword
      }
      if (includeTypeStatus) {
        if (this.queryParams.bonusType !== '') {
          params.bonusType = this.queryParams.bonusType
        }
        if (this.queryParams.status !== '') {
          params.status = this.queryParams.status
        }
      }
      return params
    },
    async getList() {
      this.loading = true
      try {
        const listRes = await listBonusReport(this.buildQueryParams(true, true))
        this.tableRows = Array.isArray(listRes.rows) ? listRes.rows : []
        this.total = Number(listRes.total || 0)

        try {
          const filteredSummaryRes = await getBonusReportSummary(this.buildQueryParams(false, true))
          this.setSummaryData(filteredSummaryRes.data || {})
          this.tableSummaryBonusAmount = this.toNumber(
            (filteredSummaryRes.data || {}).totalBonusAmount
          )
        } catch (e) {
          this.setSummaryData({})
          this.tableSummaryBonusAmount = 0
        }
      } catch (e) {
        this.tableRows = []
        this.total = 0
        this.setSummaryData({})
        this.tableSummaryBonusAmount = 0
        this.$message.error('礼金报表数据加载失败，请检查接口权限或后端服务状态')
      } finally {
        this.loading = false
      }
    },
    setSummaryData(filteredData) {
      const filtered = filteredData || {}
      this.summaryData = {
        totalBonusAmount: this.toNumber(filtered.totalBonusAmount),
        upgradeBonusAmount: this.toNumber(filtered.upgradeBonusAmount),
        weeklyBonusAmount: this.toNumber(filtered.weeklyBonusAmount),
        monthlyBonusAmount: this.toNumber(filtered.monthlyBonusAmount),
        expiredBonusAmount: this.toNumber(filtered.expiredBonusAmount),
        activityBonusAmount: this.toNumber(filtered.activityBonusAmount)
      }
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        receiveDateRange: [],
        siteCode: '',
        bonusType: '',
        status: '',
        keyword: '',
        agentKeyword: ''
      }
      this.getList()
    },
    handleExport() {
      const queryParams = this.buildQueryParams(false, true)
      this.$confirm('是否确认导出礼金统计报表数据?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.exportLoading = true
        return this.download('vip/bonus/export', queryParams, `bonus_report_${new Date().getTime()}.xlsx`)
      }).catch(() => {
      }).finally(() => {
        this.exportLoading = false
      })
    },
    formatSummaryAmount(value) {
      const amount = this.toNumber(value)
      return `¥ ${amount.toLocaleString('en-US', {
        maximumFractionDigits: 0
      })}`
    },
    formatAmount(value) {
      const amount = this.toNumber(value)
      return `¥ ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    formatStatDate(value) {
      if (!value) {
        return '-'
      }
      if (typeof value === 'string') {
        return value.length > 10 ? value.slice(0, 10) : value
      }
      return parseTime(value, '{y}-{m}-{d}')
    },
    formatDateTime(value) {
      if (!value) {
        return '-'
      }
      if (typeof value === 'string') {
        return value.length > 19 ? value.slice(0, 19) : value
      }
      return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    getBonusTypeLabel(value) {
      const target = this.bonusTypeOptions.find((item) => String(item.dictValue) === String(value))
      return target ? target.dictLabel : '-'
    },
    getStatusLabel(value) {
      const target = this.statusOptions.find((item) => String(item.dictValue) === String(value))
      return target ? target.dictLabel : '-'
    },
    getBonusTypeClass(value) {
      const map = {
        0: 'type-pill--activity',
        1: 'type-pill--upgrade',
        2: 'type-pill--weekly',
        3: 'type-pill--monthly'
      }
      return map[String(value)] || 'type-pill--activity'
    },
    getStatusClass(value) {
      const map = {
        0: 'status-pill--pending',
        1: 'status-pill--issued',
        2: 'status-pill--expired'
      }
      return map[String(value)] || 'status-pill--pending'
    },
    getTableSummaries(param) {
      const { columns } = param
      const sums = []

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
        } else if (column.property === 'bonusAmount') {
          sums[index] = this.formatAmount(this.tableSummaryBonusAmount)
        } else {
          sums[index] = '-'
        }
      })
      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
.bonus-report-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fb;
  color: #1f2a44;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.head-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2d6bff, #1f57de);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 10px 18px rgba(45, 107, 255, 0.24);
}

.page-title {
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #6f7f9e;
  font-size: 13px;
}

.export-btn {
  border-radius: 12px;
  height: 44px;
  padding: 0 20px;
  border-color: #d6deea;
  color: #5b6f90;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(190px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e4e9f3;
  padding: 18px 20px 16px;
  min-height: 140px;
  box-shadow: 0 6px 14px rgba(19, 38, 69, 0.04);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.summary-icon.is-blue {
  color: #2d6bff;
  background: #eaf1ff;
}

.summary-icon.is-red {
  color: #ff2c5f;
  background: #ffeaf1;
}

.summary-icon.is-orange {
  color: #ea8a00;
  background: #fff4df;
}

.summary-icon.is-indigo {
  color: #5468ff;
  background: #edf0ff;
}

.summary-icon.is-green {
  color: #08a86b;
  background: #e7f9f1;
}

.summary-icon.is-slate {
  color: #50627f;
  background: #edf2f8;
}

.summary-label {
  color: #8a98b4;
  font-size: 12px;
  font-weight: 600;
}

.summary-amount {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.summary-amount--compact {
  font-size: 32px;
}

.filter-card {
  background: #fff;
  border: 1px solid #e4e9f3;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px 12px;
  margin-bottom: 18px;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-item > label {
  color: #6f7f9e;
  font-size: 13px;
  font-weight: 600;
}

.w-date {
  width: 290px;
}

.w-date-time {
  width: 330px;
}

.w-select {
  width: 120px;
}

.w-site-select {
  width: 210px;
}

.w-search {
  width: 230px;
  max-width: 230px;
}

.filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.query-btn {
  min-width: 80px;
  border-radius: 10px;
  font-weight: 700;
}

.table-card {
  background: #fff;
  border: 1px solid #e4e9f3;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}

.bonus-table ::v-deep .el-table__header th {
  background: #f8fafd;
  color: #8a98b4;
  font-weight: 700;
  height: 52px;
}

.bonus-table ::v-deep .el-table__row td {
  padding: 14px 0;
}

.bonus-table ::v-deep .el-table__footer-wrapper td {
  font-weight: 700;
  color: #5b6f90;
}

.date-text {
  color: #8b9bb7;
  font-weight: 600;
}

.cell-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #1f2a44;
}

.icon-muted {
  color: #b1bfd5;
}

.icon-primary {
  color: #2d6bff;
}

.vip-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #cc7a00;
  background: #fff3de;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.type-pill--upgrade {
  color: #ff2f67;
  background: #ffeaf0;
}

.type-pill--activity {
  color: #2666ff;
  background: #eaf1ff;
}

.type-pill--weekly {
  color: #4a58d1;
  background: #ecefff;
}

.type-pill--monthly {
  color: #07a66a;
  background: #e8f8f1;
}

.amount-text {
  color: #1f63ff;
  font-weight: 700;
  font-size: 20px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-pill--issued {
  color: #0caf70;
}

.status-pill--issued .status-dot {
  background: #0caf70;
}

.status-pill--pending {
  color: #f19700;
}

.status-pill--pending .status-dot {
  background: #f19700;
}

.status-pill--expired {
  color: #ff5e6e;
}

.status-pill--expired .status-dot {
  background: #ff5e6e;
}

.tip-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: linear-gradient(120deg, #0e2047 0%, #071738 100%);
  border-radius: 16px;
  padding: 20px 22px;
  color: #d8e6ff;
}

.tip-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #1f5de0;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.tip-content h4 {
  margin: 2px 0 10px;
  font-size: 26px;
}

.tip-content p {
  margin: 6px 0;
  font-size: 12px;
  color: #bed1f7;
}

@media (max-width: 1600px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(220px, 1fr));
  }
}

@media (max-width: 1200px) {
  .page-title {
    font-size: 30px;
  }

  .summary-amount {
    font-size: 34px;
  }

  .summary-amount--compact {
    font-size: 28px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filter-card {
    padding: 12px;
    flex-wrap: wrap;
    overflow-x: visible;
  }

  .w-date,
  .w-date-time,
  .w-site-select,
  .w-select,
  .w-search {
    width: 100%;
    max-width: 100%;
  }

  .filter-item {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-actions {
    width: 100%;
  }

  .query-btn {
    flex: 1;
  }
}
</style>
