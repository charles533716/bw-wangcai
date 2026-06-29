<template>
  <div class="app-container fee-report-page">
    <section class="report-header">
      <div class="header-title">
        <div class="header-icon">
          <i class="el-icon-s-data"></i>
        </div>
        <div>
          <div class="header-heading">充提手续费报表</div>
          <div class="header-subtitle">多维度分析站点充提成本与综合费用明细</div>
        </div>
      </div>
      <div class="header-actions">
        <el-radio-group v-model="reportType" size="small" @change="handleReportTypeChange">
          <el-radio-button label="COMPREHENSIVE">综合报表</el-radio-button>
          <el-radio-button label="DEPOSIT">充值报表</el-radio-button>
          <el-radio-button label="WITHDRAW">提现报表</el-radio-button>
        </el-radio-group>
        <el-button
          class="export-button"
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['depositWithdrawFee:report:export']"
        >导出报表</el-button>
      </div>
    </section>

    <section class="filter-panel">
      <div class="filter-group">
        <div class="filter-label">时间范围</div>
        <div class="date-range">
          <el-date-picker
            v-model="queryParams.startDate"
            type="date"
            size="small"
            value-format="yyyy-MM-dd"
            format="yyyy/MM/dd"
            placeholder="开始日期"
          />
          <span class="range-separator">至</span>
          <el-date-picker
            v-model="queryParams.endDate"
            type="date"
            size="small"
            value-format="yyyy-MM-dd"
            format="yyyy/MM/dd"
            placeholder="结束日期"
          />
        </div>
      </div>
      <div class="filter-group site-filter">
        <div class="filter-label">查询站点</div>
        <el-select v-model="queryParams.siteCode" size="small" filterable placeholder="全部站点">
          <el-option label="全部站点" value="" />
          <el-option
            v-for="site in siteOptions"
            :key="site.code"
            :label="site.label"
            :value="site.code"
          />
        </el-select>
      </div>
      <el-button
        class="query-button"
        type="primary"
        icon="el-icon-search"
        :loading="loading"
        @click="getList"
      >执行查询</el-button>
    </section>

    <section class="table-panel">
      <div class="table-title">
        <i class="el-icon-connection"></i>
        <span>{{ tableTitle }}</span>
      </div>
      <el-table
        v-loading="loading"
        :data="tableRows"
        border
        class="report-table"
        :row-class-name="getRowClassName"
        empty-text="暂无报表数据"
      >
        <el-table-column label="时间" prop="timeRange" min-width="180" align="center" fixed>
          <template slot-scope="{ row }">
            <span v-if="row.isSummary" class="summary-label">{{ summaryLabel }}</span>
            <span v-else>{{ row.timeRange }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站点" prop="siteName" min-width="130" align="center" fixed>
          <template slot-scope="{ row }">
            <span>{{ row.isSummary ? '' : (row.siteName || row.siteCode || '-') }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-for="column in amountColumns"
          :key="column.prop"
          :label="column.label"
          :prop="column.prop"
          :min-width="column.width"
          align="center"
        >
          <template slot-scope="{ row }">
            <span :class="amountClass(column, row[column.prop])">{{ formatMoney(row[column.prop]) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import { listDepositWithdrawFeeReport, exportDepositWithdrawFeeReport } from '@/api/depositWithdrawFee/report'

const REPORT_TYPES = {
  COMPREHENSIVE: 'COMPREHENSIVE',
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW'
}

export default {
  name: 'DepositWithdrawFeeReport',
  data() {
    const range = this.defaultDateRange()
    return {
      loading: false,
      exportLoading: false,
      reportType: REPORT_TYPES.COMPREHENSIVE,
      queryParams: {
        startDate: range.startDate,
        endDate: range.endDate,
        siteCode: ''
      },
      siteOptions: [],
      rows: [],
      summary: this.emptySummary()
    }
  },
  computed: {
    amountColumns() {
      const depositColumns = [
        { label: '充值额度', prop: 'depositAmount', width: 150 },
        { label: '站点充值报价手续费', prop: 'depositSiteQuoteFee', width: 190 },
        { label: '三方充值成本手续费', prop: 'depositThirdPartyFee', width: 190 },
        { label: '充值手续费收益', prop: 'depositOperationFee', width: 170, profit: true, type: 'deposit' }
      ]
      const withdrawColumns = [
        { label: '提现额度', prop: 'withdrawAmount', width: 150 },
        { label: '站点提现报价手续费', prop: 'withdrawSiteQuoteFee', width: 190 },
        { label: '三方提现成本手续费', prop: 'withdrawThirdPartyFee', width: 190 },
        { label: '提现手续费收益', prop: 'withdrawOperationFee', width: 170, profit: true, type: 'withdraw' }
      ]
      if (this.reportType === REPORT_TYPES.DEPOSIT) return depositColumns
      if (this.reportType === REPORT_TYPES.WITHDRAW) return withdrawColumns
      return depositColumns.concat(withdrawColumns)
    },
    tableRows() {
      const summary = {
        ...this.emptySummary(),
        ...this.summary,
        isSummary: true
      }
      return this.rows.concat([summary])
    },
    tableTitle() {
      if (this.reportType === REPORT_TYPES.DEPOSIT) return '站点充值报表明细数据'
      if (this.reportType === REPORT_TYPES.WITHDRAW) return '站点提现报表明细数据'
      return '站点综合充提报表明细数据'
    },
    summaryLabel() {
      if (this.reportType === REPORT_TYPES.DEPOSIT) return '充值报表总计 (DEPOSIT TOTAL)'
      if (this.reportType === REPORT_TYPES.WITHDRAW) return '提现报表总计 (WITHDRAWAL TOTAL)'
      return '综合报表总计 (COMPREHENSIVE TOTAL)'
    }
  },
  created() {
    this.loadSites()
    this.getList()
  },
  methods: {
    loadSites() {
      listSite({ pageNum: 1, pageSize: 1000, status: '1' }).then(response => {
        const rows = response.rows || []
        this.siteOptions = rows.filter(site => site && site.code).map(site => ({
          code: site.code,
          label: this.formatSiteLabel(site)
        }))
      }).catch(() => {
        this.siteOptions = []
      })
    },
    getList() {
      if (!this.validateQuery()) return
      this.loading = true
      listDepositWithdrawFeeReport(this.buildQuery()).then(response => {
        const data = response.data || {}
        this.rows = this.normalizeRows(data.rows || [])
        this.summary = this.normalizeRow(data.summary || this.emptySummary())
      }).finally(() => {
        this.loading = false
      })
    },
    handleReportTypeChange() {
      this.getList()
    },
    handleExport() {
      if (!this.validateQuery()) return
      this.exportLoading = true
      exportDepositWithdrawFeeReport(this.buildQuery()).then(data => {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        this.$download.saveAs(blob, `充提手续费报表_${this.reportType}_${Date.now()}.xlsx`)
      }).finally(() => {
        this.exportLoading = false
      })
    },
    buildQuery() {
      return {
        reportType: this.reportType,
        startDate: this.queryParams.startDate,
        endDate: this.queryParams.endDate,
        siteCode: this.queryParams.siteCode || undefined
      }
    },
    validateQuery() {
      if (!this.queryParams.startDate || !this.queryParams.endDate) {
        this.$message.warning('请选择时间范围')
        return false
      }
      if (this.queryParams.startDate > this.queryParams.endDate) {
        this.$message.warning('开始日期不能晚于结束日期')
        return false
      }
      return true
    },
    normalizeRows(rows) {
      return rows.map(row => this.normalizeRow(row))
    },
    normalizeRow(row) {
      const next = { ...this.emptySummary(), ...row }
      Object.keys(this.emptySummary()).forEach(key => {
        if (this.isMoneyKey(key)) {
          next[key] = this.toNumber(next[key])
        }
      })
      return next
    },
    emptySummary() {
      return {
        timeRange: '',
        siteCode: '',
        siteName: '',
        depositAmount: 0,
        depositSiteQuoteFee: 0,
        depositThirdPartyFee: 0,
        depositOperationFee: 0,
        withdrawAmount: 0,
        withdrawSiteQuoteFee: 0,
        withdrawThirdPartyFee: 0,
        withdrawOperationFee: 0
      }
    },
    isMoneyKey(key) {
      return /Amount$|Fee$/.test(key)
    },
    amountClass(column, value) {
      if (!column.profit) return 'amount-value'
      const amount = this.toNumber(value)
      return {
        'amount-value': true,
        'profit-deposit': column.type === 'deposit',
        'profit-withdraw': column.type === 'withdraw',
        'is-negative': amount < 0
      }
    },
    getRowClassName({ row }) {
      return row && row.isSummary ? 'summary-row' : ''
    },
    formatMoney(value) {
      const amount = this.toNumber(value)
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    toNumber(value) {
      const amount = Number(value)
      return Number.isFinite(amount) ? amount : 0
    },
    formatSiteLabel(site) {
      const code = site.code || site.siteCode || ''
      const name = site.nameZn || site.nameEn || site.name || code
      return code && name && code !== name ? `${name}（${code}）` : name
    },
    defaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 6)
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end)
      }
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped>
.fee-report-page {
  min-height: calc(100vh - 84px);
  padding: 18px 24px 28px;
  background: #f5f8fc;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.header-title,
.header-actions {
  display: flex;
  align-items: center;
}

.header-title {
  gap: 14px;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: #fff;
  color: #1f63ff;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(31, 48, 75, 0.06);
}

.header-heading {
  color: #14233b;
  font-size: 20px;
  font-weight: 800;
}

.header-subtitle {
  margin-top: 4px;
  color: #60708a;
  font-size: 13px;
  font-weight: 600;
}

.header-actions {
  gap: 14px;
}

.export-button {
  color: #fff;
  border-color: #16233a;
  background: #16233a;
}

.filter-panel,
.table-panel {
  background: #fff;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(31, 48, 75, 0.06);
}

.filter-panel {
  display: flex;
  align-items: flex-end;
  gap: 26px;
  margin-bottom: 18px;
  padding: 28px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  color: #7587a3;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range ::v-deep .el-date-editor.el-input {
  width: 150px;
}

.range-separator {
  color: #9aa9bf;
  font-weight: 700;
}

.site-filter ::v-deep .el-select {
  width: 210px;
}

.query-button {
  margin-left: auto;
  width: 150px;
  height: 40px;
  font-weight: 700;
}

.table-panel {
  overflow: hidden;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 28px;
  color: #1f2f46;
  font-size: 16px;
  font-weight: 800;
}

.table-title i {
  color: #1f63ff;
  font-size: 18px;
}

.report-table {
  width: 100%;
}

.report-table ::v-deep th {
  background: #f6f9fd;
  color: #637895;
  font-size: 12px;
  font-weight: 800;
}

.report-table ::v-deep td {
  background: #fff;
  color: #26384f;
  font-weight: 700;
}

.amount-value {
  font-variant-numeric: tabular-nums;
}

.profit-deposit {
  color: #1f63ff;
}

.profit-withdraw {
  color: #00a676;
}

.is-negative {
  font-weight: 800;
}

.report-table ::v-deep .el-table__body tr.summary-row > td {
  border-color: #16233a;
  background: #111b30;
  color: #fff;
}

.report-table ::v-deep .el-table__body tr.summary-row > td:last-child {
  background: #0f3440;
}

.summary-label {
  color: #fff;
  font-style: italic;
  letter-spacing: 0;
}

@media (max-width: 1200px) {
  .report-header,
  .filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .query-button {
    margin-left: 0;
  }
}
</style>
