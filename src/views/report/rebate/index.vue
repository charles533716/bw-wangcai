<template>
  <div class="app-container rebate-report-page">
    <section class="page-head">
      <div class="head-title-wrap">
        <div class="title-icon"></div>
        <h2 class="page-title">会员投注返水报表</h2>
      </div>
    </section>

    <section class="filter-card">
      <div class="filter-item">
        <label>日期查询:</label>
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
        <label>会员名:</label>
        <el-input
          v-model.trim="queryParams.keyword"
          size="small"
          clearable
          class="w-search"
          placeholder="请输入会员名"
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
          class="w-search"
          placeholder="请输入上级代理"
          @keyup.enter.native="handleQuery"
        >
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
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
        <label>是否已领取:</label>
        <el-select v-model="queryParams.claimedStatus" size="small" class="w-select">
          <el-option
            v-for="item in claimedStatusOptions"
            :key="String(item.value)"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="filter-actions">
        <el-button type="primary" size="small" icon="el-icon-search" class="query-btn" @click="handleQuery">查询</el-button>
        <el-button size="small" icon="el-icon-refresh-left" class="reset-btn" @click="resetQuery">重置</el-button>
        <el-button type="success" size="small" icon="el-icon-download" class="export-btn" :loading="exportLoading" @click="handleExport" v-hasPermi="['vip:rebate:export']">导出报表</el-button>
      </div>
    </section>

    <section class="table-card">
      <el-table
        v-loading="loading"
        :data="tableRows"
        size="small"
        class="rebate-table"
        border
        show-summary
        :summary-method="getTableSummaries"
        :header-cell-class-name="getHeaderCellClass"
      >
        <el-table-column prop="statDate" label="日期" min-width="118" align="center">
          <template slot-scope="scope">
            <span class="date-text">{{ formatStatDate(scope.row.statDate) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="siteName" label="所属站点" min-width="110" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.siteName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="agentCode" label="上级代理" min-width="110" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.agentCode || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="userName" label="会员名称" min-width="120" align="center">
          <template slot-scope="scope">
            <span class="name-text">{{ scope.row.userName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="memberUserId" label="会员ID" min-width="110" align="center">
          <template slot-scope="scope">
            <span class="member-id-text">{{ scope.row.memberUserId || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="vipLevel" label="VIP等级" min-width="90" align="center">
          <template slot-scope="scope">
            <span class="vip-pill">VIP {{ scope.row.vipLevel || 0 }}</span>
          </template>
        </el-table-column>

        <template v-for="venue in venueOptions">
          <el-table-column
            :key="`bet-${venue.key}`"
            :prop="venueBetProp(venue)"
            :label="`${venue.dictLabel}投注`"
            min-width="112"
            align="right"
          >
            <template slot-scope="scope">
              <span>{{ formatAmount(scope.row[venueBetProp(venue)]) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :key="`rate-${venue.key}`"
            :prop="venueRateProp(venue)"
            label="返水率"
            min-width="86"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ formatRate(scope.row[venueRateProp(venue)]) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            :key="`rebate-${venue.key}`"
            :prop="venueRebateProp(venue)"
            :label="`${venue.dictLabel}返水`"
            min-width="105"
            align="right"
          >
            <template slot-scope="scope">
              <span class="rebate-text">{{ formatAmount(scope.row[venueRebateProp(venue)]) }}</span>
            </template>
          </el-table-column>
        </template>

        <el-table-column prop="totalBetAmount" label="总投注流水" min-width="125" align="right">
          <template slot-scope="scope">
            <span class="total-text">{{ formatAmount(scope.row.totalBetAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="totalRebateAmount" label="总返水额度" min-width="118" align="right">
          <template slot-scope="scope">
            <span class="total-rebate-text">{{ formatAmount(scope.row.totalRebateAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="领取状态" min-width="108" align="center">
          <template slot-scope="scope">
            <span :class="['status-pill', getStatusClass(scope.row.status)]">
              <i class="status-dot"></i>
              {{ getStatusLabel(scope.row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="receiveTime" label="领取时间" min-width="165" align="center">
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
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { listSite } from '@/api/site/site'
import { listRebateReport } from '@/api/report/rebate'

const DEFAULT_STATUS_OPTIONS = [
  { dictLabel: '待领取', dictValue: '0' },
  { dictLabel: '已领取', dictValue: '1' },
  { dictLabel: '已过期', dictValue: '2' }
]

const DEFAULT_CLAIMED_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '已领取', value: '1' },
  { label: '未领取', value: '0' }
]

const DEFAULT_VENUE_OPTIONS = [
  { dictLabel: '体育', dictValue: 'sport' },
  { dictLabel: '真人', dictValue: 'person' },
  { dictLabel: '彩票', dictValue: 'lottery' },
  { dictLabel: '棋牌', dictValue: 'cards' },
  { dictLabel: '电子', dictValue: 'dianzi' },
  { dictLabel: '电竞', dictValue: 'esports' }
]

export default {
  name: 'RebateReport',
  data() {
    return {
      loading: false,
      exportLoading: false,
      total: 0,
      tableRows: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        receiveDateRange: [],
        keyword: '',
        agentKeyword: '',
        siteCode: '',
        claimedStatus: ''
      },
      siteOptions: [{ code: '', label: '全部站点' }],
      claimedStatusOptions: DEFAULT_CLAIMED_STATUS_OPTIONS.slice(),
      statusOptions: DEFAULT_STATUS_OPTIONS.slice(),
      venueOptions: [],
      summaryTotals: {}
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    getDefaultQueryParams() {
      return {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        receiveDateRange: [],
        keyword: '',
        agentKeyword: '',
        siteCode: '',
        claimedStatus: ''
      }
    },
    async initPage() {
      await Promise.all([this.loadSiteOptions(), this.loadDicts()])
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
        const [venueRes, statusRes] = await Promise.all([
          this.getDicts('venue_type'),
          this.getDicts('issuance_status')
        ])
        const venueRows = Array.isArray(venueRes.data) ? venueRes.data : []
        const statusRows = Array.isArray(statusRes.data) ? statusRes.data : []
        if (venueRows.length) {
          this.venueOptions = venueRows.map((item, index) => ({
            ...item,
            key: `v${index}_${item.dictValue}`
          }))
        } else {
          this.venueOptions = DEFAULT_VENUE_OPTIONS.map((item, index) => ({
            ...item,
            key: `v${index}_${item.dictValue}`
          }))
        }
        if (statusRows.length) {
          this.statusOptions = statusRows
        } else {
          this.statusOptions = DEFAULT_STATUS_OPTIONS.slice()
        }
      } catch (e) {
        this.venueOptions = DEFAULT_VENUE_OPTIONS.map((item, index) => ({
          ...item,
          key: `v${index}_${item.dictValue}`
        }))
        this.statusOptions = DEFAULT_STATUS_OPTIONS.slice()
      }
    },
    buildQueryParams(includePage = true) {
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
      if (this.queryParams.siteCode) {
        params.siteCode = this.queryParams.siteCode
      }
      if (this.queryParams.keyword) {
        params.keyword = this.queryParams.keyword
      }
      if (this.queryParams.agentKeyword) {
        params.agentKeyword = this.queryParams.agentKeyword
      }
      if (this.queryParams.claimedStatus !== '') {
        params.claimedStatus = this.queryParams.claimedStatus
      }
      return params
    },
    buildSummaryTotals(rows) {
      const totals = {}
      const addValue = (prop, value) => {
        totals[prop] = this.toNumber(totals[prop]) + this.toNumber(value)
      }
      rows.forEach((row) => {
        addValue('totalBetAmount', row.totalBetAmount)
        addValue('totalRebateAmount', row.totalRebateAmount)
        this.venueOptions.forEach((venue) => {
          addValue(this.venueBetProp(venue), row[this.venueBetProp(venue)])
          addValue(this.venueRebateProp(venue), row[this.venueRebateProp(venue)])
        })
      })
      return totals
    },
    buildSummaryTotalsFromSummary(summary = {}) {
      const totals = {
        totalBetAmount: this.toNumber(summary.totalBetAmount),
        totalRebateAmount: this.toNumber(summary.totalRebateAmount)
      }
      const venueStats = summary.venueStats || {}
      this.venueOptions.forEach((venue) => {
        const stat = venueStats[venue.dictValue] || venueStats[String(venue.dictValue)] || {}
        totals[this.venueBetProp(venue)] = this.toNumber(stat.betAmount)
        totals[this.venueRebateProp(venue)] = this.toNumber(stat.rebateAmount)
      })
      return totals
    },
    async getList() {
      this.loading = true
      try {
        const response = await listRebateReport(this.buildQueryParams(true))
        const rows = Array.isArray(response.rows) ? response.rows : []
        this.tableRows = this.flattenRows(rows)
        this.total = Number(response.total || 0)
        this.summaryTotals = response.summary
          ? this.buildSummaryTotalsFromSummary(response.summary)
          : this.buildSummaryTotals(this.tableRows)
      } catch (e) {
        this.tableRows = []
        this.total = 0
        this.summaryTotals = {}
        this.$message.error('会员投注返水报表加载失败，请检查接口权限或后端服务状态')
      } finally {
        this.loading = false
      }
    },
    flattenRows(rows) {
      return rows.map((row) => {
        const flat = {
          ...row,
          totalBetAmount: this.toNumber(row.totalBetAmount),
          totalRebateAmount: this.toNumber(row.totalRebateAmount)
        }
        const venueStats = row.venueStats || {}
        this.venueOptions.forEach((venue) => {
          const stat = venueStats[venue.dictValue] || venueStats[String(venue.dictValue)] || {}
          flat[this.venueBetProp(venue)] = this.toNumber(stat.betAmount)
          flat[this.venueRateProp(venue)] = this.toNumber(stat.rebateRate)
          flat[this.venueRebateProp(venue)] = this.toNumber(stat.rebateAmount)
        })
        return flat
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = this.getDefaultQueryParams()
      this.getList()
    },
    handleExport() {
      const queryParams = this.buildQueryParams(false)
      this.$confirm('是否确认导出会员投注返水报表数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.exportLoading = true
        return this.download('vip/rebate/report/export', queryParams, `member_rebate_report_${new Date().getTime()}.xlsx`)
      }).catch(() => {
      }).finally(() => {
        this.exportLoading = false
      })
    },
    venueBetProp(venue) {
      return `bet_${venue.key}`
    },
    venueRateProp(venue) {
      return `rate_${venue.key}`
    },
    venueRebateProp(venue) {
      return `rebate_${venue.key}`
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    formatAmount(value) {
      const amount = this.toNumber(value)
      return `¥ ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    formatRate(value) {
      const num = this.toNumber(value)
      return `${num}%`
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
    getStatusLabel(value) {
      const target = this.statusOptions.find((item) => String(item.dictValue) === String(value))
      return target ? target.dictLabel : '-'
    },
    getStatusClass(value) {
      const map = {
        '0': 'status-pill--pending',
        '1': 'status-pill--issued',
        '2': 'status-pill--expired'
      }
      return map[String(value)] || 'status-pill--pending'
    },
    getHeaderCellClass({ column }) {
      const prop = column.property || ''
      if (prop === 'totalBetAmount' || prop === 'totalRebateAmount') {
        return 'head-total'
      }
      if (prop === 'status') {
        return 'head-status'
      }
      if (prop.startsWith('bet_') || prop.startsWith('rate_') || prop.startsWith('rebate_')) {
        const venueKey = prop.substring(prop.indexOf('_') + 1)
        const idx = this.venueOptions.findIndex((item) => item.key === venueKey)
        const classes = ['head-venue-a', 'head-venue-b', 'head-venue-c', 'head-venue-d', 'head-venue-e', 'head-venue-f']
        return classes[idx % classes.length]
      }
      return 'head-base'
    },
    getTableSummaries(param) {
      const { columns } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        const prop = column.property
        if (!prop) {
          sums[index] = '-'
          return
        }
        if (prop.startsWith('bet_') || prop.startsWith('rebate_') || prop === 'totalBetAmount' || prop === 'totalRebateAmount') {
          const totalValue = this.toNumber(this.summaryTotals[prop])
          sums[index] = this.formatAmount(totalValue)
          return
        }
        if (prop.startsWith('rate_')) {
          sums[index] = '--'
          return
        }
        sums[index] = '-'
      })
      return sums
    }
  }
}
</script>

<style lang="scss" scoped>
.rebate-report-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fb;
  color: #1f2a44;
}

.page-head {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.head-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  width: 8px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(180deg, #2f6dff, #1f59df);
}

.page-title {
  margin: 0;
  font-size: 40px;
  line-height: 1.1;
  letter-spacing: 1px;
}

.filter-card {
  background: #fff;
  border: 1px solid #e4e9f3;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  overflow-x: visible;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-item > label {
  color: #5f7193;
  font-size: 13px;
  font-weight: 700;
}

.w-date {
  width: 248px;
}

.w-date-time {
  width: 300px;
}

.w-search {
  width: 210px;
}

.w-site-select {
  width: 148px;
}

.w-select {
  width: 132px;
}

.filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.query-btn,
.reset-btn,
.export-btn {
  border-radius: 10px;
  min-width: 90px;
  font-weight: 700;
}

.table-card {
  background: #fff;
  border: 1px solid #e4e9f3;
  border-radius: 16px;
  overflow: hidden;
}

.rebate-table ::v-deep .el-table__header th {
  color: #fff;
  font-weight: 700;
  height: 48px;
}

.rebate-table ::v-deep .el-table__header th.head-base {
  background: linear-gradient(180deg, #1ca9cf, #1a8dbf);
}

.rebate-table ::v-deep .el-table__header th.head-venue-a {
  background: linear-gradient(180deg, #1ca9cf, #1794bf);
}

.rebate-table ::v-deep .el-table__header th.head-venue-b {
  background: linear-gradient(180deg, #5ea7bb, #5695b3);
}

.rebate-table ::v-deep .el-table__header th.head-venue-c {
  background: linear-gradient(180deg, #6c95c8, #5f87bc);
}

.rebate-table ::v-deep .el-table__header th.head-venue-d {
  background: linear-gradient(180deg, #4f98db, #3d85cc);
}

.rebate-table ::v-deep .el-table__header th.head-venue-e {
  background: linear-gradient(180deg, #11a6c7, #0f95b3);
}

.rebate-table ::v-deep .el-table__header th.head-venue-f {
  background: linear-gradient(180deg, #3f95c7, #367fb2);
}

.rebate-table ::v-deep .el-table__header th.head-total {
  background: linear-gradient(180deg, #23324d, #1f2d43);
}

.rebate-table ::v-deep .el-table__header th.head-status {
  background: linear-gradient(180deg, #17a9cf, #0f95bf);
}

.rebate-table ::v-deep .el-table__row td {
  padding: 14px 0;
}

.rebate-table ::v-deep .el-table__footer-wrapper td {
  font-weight: 700;
  color: #3c4a63;
}

.date-text {
  color: #8193b2;
  font-weight: 600;
}

.name-text {
  color: #2a66ff;
  font-weight: 700;
}

.member-id-text {
  color: #7d90af;
  font-weight: 700;
}

.vip-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  color: #cc7a00;
  background: #fff2da;
  font-size: 12px;
  font-weight: 700;
}

.rebate-text {
  color: #6b2bff;
  font-weight: 700;
}

.total-text {
  color: #1f2a44;
  font-weight: 700;
}

.total-rebate-text {
  color: #245dff;
  font-weight: 700;
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
  color: #06a96a;
}

.status-pill--issued .status-dot {
  background: #06a96a;
}

.status-pill--pending {
  color: #f59b0b;
}

.status-pill--pending .status-dot {
  background: #f59b0b;
}

.status-pill--expired {
  color: #ff5b6d;
}

.status-pill--expired .status-dot {
  background: #ff5b6d;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .filter-card {
    flex-wrap: wrap;
    overflow-x: visible;
  }

  .filter-item,
  .filter-actions {
    width: 100%;
  }

  .w-date,
  .w-date-time,
  .w-search,
  .w-site-select,
  .w-select {
    width: 100%;
    max-width: 100%;
  }
}
</style>
