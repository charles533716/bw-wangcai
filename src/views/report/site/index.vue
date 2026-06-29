<template>
  <div class="app-container site-report-page">
    <div class="page-title">站点报表</div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" :inline="true" label-width="84px">
        <el-form-item label="站点账号">
          <el-input
            v-model.trim="queryParams.siteAccount"
            placeholder="请输入站点账号"
            clearable
            class="w-site-account"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            class="w-date"
          />
        </el-form-item>

        <el-form-item label="快捷时间">
          <el-button size="mini" @click="applyQuickRange('thisWeek')">本周</el-button>
          <el-button size="mini" @click="applyQuickRange('lastWeek')">上周</el-button>
          <el-button size="mini" @click="applyQuickRange('lastMonth')">上月</el-button>
        </el-form-item>

        <el-form-item label="投注人数">
          <el-input-number
            v-model="queryParams.betUsersMin"
            :min="0"
            :controls="false"
            placeholder="最小值"
            class="w-num"
          />
          <span class="range-sep">~</span>
          <el-input-number
            v-model="queryParams.betUsersMax"
            :min="0"
            :controls="false"
            placeholder="最大值"
            class="w-num"
          />
        </el-form-item>

        <el-form-item label="投注金额">
          <el-input-number
            v-model="queryParams.betAmountMin"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="最小值"
            class="w-num"
          />
          <span class="range-sep">~</span>
          <el-input-number
            v-model="queryParams.betAmountMax"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="最大值"
            class="w-num"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="tableRows"
        border
        stripe
        show-summary
        :summary-method="getSummaries"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="siteName" label="站点名称" min-width="140" sortable="custom">
          <template slot-scope="{ row }">
            <el-link type="primary" :underline="false" @click="goSiteConfig(row)">
              {{ row.siteName || '-' }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="siteAccount" label="站点账号" min-width="120" sortable="custom" />

        <el-table-column prop="betUserCount" label="投注人数" min-width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ formatCount(row.betUserCount) }}</template>
        </el-table-column>

        <el-table-column prop="totalBetCount" label="总投注单数" min-width="120" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ formatCount(row.totalBetCount) }}</template>
        </el-table-column>

        <el-table-column prop="winBetCount" label="中奖注单数" min-width="120" align="right" sortable="custom">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCount(row.winBetCount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="winRate" label="中奖率" min-width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ formatPercent(row.winRate) }}</template>
        </el-table-column>

        <el-table-column prop="totalBetAmount" label="总投注金额" min-width="130" align="right" sortable="custom">
          <template slot-scope="{ row }">¥ {{ formatAmount(row.totalBetAmount) }}</template>
        </el-table-column>

        <el-table-column prop="totalPayoutAmount" label="总派奖金额" min-width="130" align="right" sortable="custom">
          <template slot-scope="{ row }">¥ {{ formatAmount(row.totalPayoutAmount) }}</template>
        </el-table-column>

        <el-table-column prop="memberNetProfitAmount" label="会员净盈利" min-width="130" align="right" sortable="custom">
          <template slot-scope="{ row }">
            <span :class="profitClass(row.memberNetProfitAmount)">¥ {{ formatAmount(row.memberNetProfitAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="operationExpenseAmount" label="运营费用" min-width="130" align="right" sortable="custom">
          <template slot-scope="{ row }">¥ {{ formatAmount(row.operationExpenseAmount) }}</template>
        </el-table-column>

        <el-table-column prop="totalProfitAmount" label="总盈利金额" min-width="130" align="right" sortable="custom">
          <template slot-scope="{ row }">
            <span :class="profitClass(row.totalProfitAmount)">¥ {{ formatAmount(row.totalProfitAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="profitRate" label="盈利率" min-width="110" align="right" sortable="custom">
          <template slot-scope="{ row }">
            <span :class="profitClass(row.profitRate)">{{ formatPercent(row.profitRate) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template slot-scope="{ row }">
            <div class="op-cell">
              <el-button class="op-btn" type="primary" size="mini" @click="openDailyDetail(row)">每日详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="fetchList"
    />

    <el-dialog
      :visible.sync="dailyDialog.visible"
      width="96%"
      append-to-body
      class="daily-dialog"
    >
      <template #title>
        <div class="daily-dialog-title">
          <span class="daily-dialog-title-label">站点：</span>
          <span class="daily-dialog-title-value">{{ dailyDialog.currentSiteName }} - 每日详情</span>
        </div>
      </template>

      <div class="daily-dialog-content">
        <el-table
          v-loading="dailyDialog.loading"
          :data="dailyDialog.rows"
          border
          stripe
          show-summary
          :summary-method="getDailySummaries"
        >
          <el-table-column prop="statDate" min-width="130" align="center">
            <template slot="header">
              <span>日期</span>
            </template>
            <template slot-scope="{ row, $index }">
              <span class="date-cell">
                <i
                  v-if="$index === 0"
                  class="el-icon-refresh refresh-cell-icon"
                  @click="refreshDailyDetail"
                />
                <span class="date-link">{{ row.statDate || '-' }}</span>
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="betUserCount" label="投注人数" min-width="110" align="right">
            <template slot-scope="{ row }">{{ formatCount(row.betUserCount) }}</template>
          </el-table-column>

          <el-table-column prop="totalBetCount" label="总投注单数" min-width="130" align="right">
            <template slot-scope="{ row }">{{ formatCount(row.totalBetCount) }}</template>
          </el-table-column>

          <el-table-column prop="winBetCount" label="中奖注单数" min-width="120" align="right">
            <template slot-scope="{ row }">
              <span class="text-blue">{{ formatCount(row.winBetCount) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="winRate" label="中奖率" min-width="100" align="right">
            <template slot-scope="{ row }">{{ formatPercent(row.winRate) }}</template>
          </el-table-column>

          <el-table-column prop="totalBetAmount" label="总投注金额" min-width="140" align="right">
            <template slot-scope="{ row }">¥ {{ formatAmount(row.totalBetAmount) }}</template>
          </el-table-column>

          <el-table-column prop="totalPayoutAmount" label="总派奖金额" min-width="140" align="right">
            <template slot-scope="{ row }">¥ {{ formatAmount(row.totalPayoutAmount) }}</template>
          </el-table-column>

          <el-table-column prop="memberNetProfitAmount" label="会员净盈利" min-width="140" align="right">
            <template slot-scope="{ row }">
              <span :class="profitClass(row.memberNetProfitAmount)">¥ {{ formatAmount(row.memberNetProfitAmount) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="operationExpenseAmount" label="运营费用" min-width="140" align="right">
            <template slot-scope="{ row }">¥ {{ formatAmount(row.operationExpenseAmount) }}</template>
          </el-table-column>

          <el-table-column prop="totalProfitAmount" label="总盈利金额" min-width="140" align="right">
            <template slot-scope="{ row }">
              <span :class="profitClass(row.totalProfitAmount)">¥ {{ formatAmount(row.totalProfitAmount) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="profitRate" label="盈利率" min-width="100" align="right">
            <template slot-scope="{ row }">
              <span :class="profitClass(row.profitRate)">{{ formatPercent(row.profitRate) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="dialog-footer">
          <el-button class="close-btn" @click="dailyDialog.visible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listSiteReport,
  summarySiteReport,
  listSiteReportDaily,
  summarySiteReportDaily
} from '@/api/report/sitereport'

function emptyMainSummary() {
  return {
    siteName: '总计',
    siteAccount: '总计',
    betUserCount: 0,
    totalBetCount: 0,
    winBetCount: 0,
    winRate: 0,
    totalBetAmount: 0,
    totalPayoutAmount: 0,
    memberNetProfitAmount: 0,
    operationExpenseAmount: 0,
    totalProfitAmount: 0,
    profitRate: 0
  }
}

function emptyDailySummary() {
  return {
    statDate: '总计',
    betUserCount: 0,
    totalBetCount: 0,
    winBetCount: 0,
    winRate: 0,
    totalBetAmount: 0,
    totalPayoutAmount: 0,
    memberNetProfitAmount: 0,
    operationExpenseAmount: 0,
    totalProfitAmount: 0,
    profitRate: 0
  }
}

export default {
  name: 'SiteReport',
  data() {
    return {
      loading: false,
      tableRows: [],
      total: 0,
      summaryRow: emptyMainSummary(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.defaultDateRange(),
        siteAccount: '',
        betUsersMin: undefined,
        betUsersMax: undefined,
        betAmountMin: undefined,
        betAmountMax: undefined,
        sortField: 'siteName',
        sortOrder: 'asc'
      },
      dailyDialog: {
        visible: false,
        loading: false,
        title: '每日详情',
        rows: [],
        summary: emptyDailySummary(),
        currentSiteCode: '',
        currentSiteName: ''
      }
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    defaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 29)
      return [this.toDateStr(start), this.toDateStr(end)]
    },
    toDateStr(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    toInt(value) {
      const num = parseInt(value, 10)
      return Number.isFinite(num) ? num : 0
    },
    formatCount(value) {
      return this.toInt(value).toLocaleString('en-US')
    },
    formatAmount(value) {
      const num = this.toNumber(value)
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatPercent(value) {
      const num = this.toNumber(value)
      return `${num.toFixed(2)}%`
    },
    profitClass(value) {
      const num = this.toNumber(value)
      if (num > 0) return 'text-green'
      if (num < 0) return 'text-red'
      return ''
    },
    validateDateRange() {
      const range = this.queryParams.dateRange || []
      if (range.length !== 2) {
        this.$message.warning('请选择开始和结束日期')
        return false
      }
      if (range[1] < range[0]) {
        this.$message.warning('结束日期不能早于开始日期')
        return false
      }
      return true
    },
    buildFilterParams() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      const params = {
        startDate,
        endDate,
        sortField: this.queryParams.sortField,
        sortOrder: this.queryParams.sortOrder
      }
      if (this.queryParams.siteAccount) {
        params.siteAccount = this.queryParams.siteAccount
      }
      if (this.queryParams.betUsersMin !== undefined && this.queryParams.betUsersMin !== null) {
        params.betUsersMin = this.queryParams.betUsersMin
      }
      if (this.queryParams.betUsersMax !== undefined && this.queryParams.betUsersMax !== null) {
        params.betUsersMax = this.queryParams.betUsersMax
      }
      if (this.queryParams.betAmountMin !== undefined && this.queryParams.betAmountMin !== null) {
        params.betAmountMin = this.queryParams.betAmountMin
      }
      if (this.queryParams.betAmountMax !== undefined && this.queryParams.betAmountMax !== null) {
        params.betAmountMax = this.queryParams.betAmountMax
      }
      return params
    },
    buildListParams() {
      return {
        ...this.buildFilterParams(),
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
    },
    normalizeMainSummary(data) {
      return {
        ...emptyMainSummary(),
        ...(data || {}),
        siteName: '总计',
        siteAccount: '总计'
      }
    },
    normalizeDailySummary(data) {
      return {
        ...emptyDailySummary(),
        ...(data || {}),
        statDate: '总计'
      }
    },
    async fetchList() {
      if (!this.validateDateRange()) return
      this.loading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listSiteReport(this.buildListParams()),
          summarySiteReport(this.buildFilterParams())
        ])
        this.tableRows = Array.isArray(listResp.rows) ? listResp.rows : []
        this.total = Number(listResp.total || 0)
        this.summaryRow = this.normalizeMainSummary(summaryResp.data)
      } catch (e) {
        this.tableRows = []
        this.total = 0
        this.summaryRow = emptyMainSummary()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleSortChange({ prop, order }) {
      if (!prop || !order) {
        this.queryParams.sortField = 'siteName'
        this.queryParams.sortOrder = 'asc'
      } else {
        this.queryParams.sortField = prop
        this.queryParams.sortOrder = order === 'descending' ? 'desc' : 'asc'
      }
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    applyQuickRange(type) {
      const today = new Date()
      if (type === 'thisWeek') {
        const weekStart = new Date(today)
        const day = weekStart.getDay() || 7
        weekStart.setDate(weekStart.getDate() - day + 1)
        this.queryParams.dateRange = [this.toDateStr(weekStart), this.toDateStr(today)]
        return
      }
      if (type === 'lastWeek') {
        const thisWeekStart = new Date(today)
        const day = thisWeekStart.getDay() || 7
        thisWeekStart.setDate(thisWeekStart.getDate() - day + 1)
        const lastWeekEnd = new Date(thisWeekStart)
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
        const lastWeekStart = new Date(lastWeekEnd)
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6)
        this.queryParams.dateRange = [this.toDateStr(lastWeekStart), this.toDateStr(lastWeekEnd)]
        return
      }
      if (type === 'lastMonth') {
        const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayLastMonth = new Date(firstDayCurrentMonth.getTime() - 24 * 60 * 60 * 1000)
        const firstDayLastMonth = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), 1)
        this.queryParams.dateRange = [this.toDateStr(firstDayLastMonth), this.toDateStr(lastDayLastMonth)]
      }
    },
    handleExport() {
      if (!this.validateDateRange()) return
      const params = this.buildFilterParams()
      this.$confirm('是否导出当前筛选条件下的所有数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/sitereport/export',
          params,
          `site_report_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    getSummaries({ columns }) {
      const sums = []
      const summary = this.summaryRow || emptyMainSummary()
      const countProps = ['betUserCount', 'totalBetCount', 'winBetCount']
      const amountProps = ['totalBetAmount', 'totalPayoutAmount', 'memberNetProfitAmount', 'operationExpenseAmount', 'totalProfitAmount']
      const rateProps = ['winRate', 'profitRate']
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '数据总计'
          return
        }
        const prop = column.property
        if (!prop || prop === 'siteName' || prop === 'siteAccount') {
          sums[index] = ''
          return
        }
        if (countProps.indexOf(prop) > -1) {
          sums[index] = this.formatCount(summary[prop])
          return
        }
        if (amountProps.indexOf(prop) > -1) {
          sums[index] = `¥ ${this.formatAmount(summary[prop])}`
          return
        }
        if (rateProps.indexOf(prop) > -1) {
          sums[index] = this.formatPercent(summary[prop])
          return
        }
        sums[index] = ''
      })
      return sums
    },
    openDailyDetail(row) {
      if (!row || !row.siteCode) {
        this.$message.warning('站点编码缺失，无法查看每日详情')
        return
      }
      this.dailyDialog.visible = true
      this.dailyDialog.currentSiteCode = row.siteCode
      this.dailyDialog.currentSiteName = row.siteName || row.siteAccount || row.siteCode
      this.dailyDialog.title = `站点：${this.dailyDialog.currentSiteName} - 每日详情`
      this.fetchDailyDetail()
    },
    refreshDailyDetail() {
      if (!this.dailyDialog.currentSiteCode) return
      this.fetchDailyDetail()
    },
    async fetchDailyDetail() {
      this.dailyDialog.loading = true
      try {
        const [startDate, endDate] = this.queryParams.dateRange || []
        const params = {
          siteCode: this.dailyDialog.currentSiteCode,
          startDate,
          endDate
        }
        const [listResp, summaryResp] = await Promise.all([
          listSiteReportDaily(params),
          summarySiteReportDaily(params)
        ])
        this.dailyDialog.rows = Array.isArray(listResp.data) ? listResp.data : []
        this.dailyDialog.summary = this.normalizeDailySummary(summaryResp.data)
      } catch (e) {
        this.dailyDialog.rows = []
        this.dailyDialog.summary = emptyDailySummary()
      } finally {
        this.dailyDialog.loading = false
      }
    },
    getDailySummaries({ columns }) {
      const sums = []
      const summary = this.dailyDialog.summary || emptyDailySummary()
      const countProps = ['betUserCount', 'totalBetCount', 'winBetCount']
      const amountProps = ['totalBetAmount', 'totalPayoutAmount', 'memberNetProfitAmount', 'operationExpenseAmount', 'totalProfitAmount']
      const rateProps = ['winRate', 'profitRate']
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '数据总计'
          return
        }
        const prop = column.property
        if (!prop) {
          sums[index] = ''
          return
        }
        if (countProps.indexOf(prop) > -1) {
          sums[index] = this.formatCount(summary[prop])
          return
        }
        if (amountProps.indexOf(prop) > -1) {
          sums[index] = `¥ ${this.formatAmount(summary[prop])}`
          return
        }
        if (rateProps.indexOf(prop) > -1) {
          sums[index] = this.formatPercent(summary[prop])
          return
        }
        sums[index] = ''
      })
      return sums
    },
    goSiteConfig(row) {
      if (!row || !row.siteCode) return
      this.$router.push({
        path: '/site/config/index',
        query: { siteCode: row.siteCode }
      })
    }
  }
}
</script>

<style scoped>
.site-report-page {
  padding-bottom: 10px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 14px;
}

.filter-card {
  margin-bottom: 12px;
}

.table-card {
  margin-bottom: 12px;
}

.w-site-account {
  width: 180px;
}

.w-date {
  width: 280px;
}

.w-num {
  width: 120px;
}

.range-sep {
  margin: 0 6px;
  color: #909399;
}

.text-blue {
  color: #2d6bff;
  font-weight: 600;
}

.text-green {
  color: #2f9a62;
  font-weight: 700;
}

.text-red {
  color: #f56c6c;
  font-weight: 700;
}

.op-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
}

.op-cell .op-btn {
  margin-left: 0 !important;
  white-space: nowrap;
}

::v-deep .el-table__footer-wrapper .cell {
  font-weight: 700;
}

.daily-dialog-title {
  display: flex;
  align-items: center;
}

.daily-dialog-title-label {
  color: #97a7bf;
  font-size: 14px;
  font-weight: 500;
  margin-right: 8px;
}

.daily-dialog-title-value {
  color: #273a55;
  font-size: 18px;
  font-weight: 700;
}

.daily-dialog-content {
  background: #f1f4f8;
}

.date-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.date-link {
  color: #2d78ff;
  font-weight: 700;
}

.refresh-cell-icon {
  color: #a2b0c4;
  font-size: 18px;
  cursor: pointer;
}

.dialog-footer {
  margin-top: 16px;
  padding-right: 22px;
  text-align: right;
}

.close-btn {
  min-width: 130px;
  height: 44px;
  border-radius: 8px;
  border-color: #d9dfe8;
  color: #4b5f7a;
  font-weight: 600;
}

::v-deep .daily-dialog .el-dialog {
  margin-top: 8px !important;
  border-radius: 28px;
  overflow: hidden;
  background: #f1f4f8;
}

::v-deep .daily-dialog .el-dialog__header {
  padding: 24px 36px;
  background: #eef2f7;
  border-bottom: 1px solid #dbe3ee;
}

::v-deep .daily-dialog .el-dialog__headerbtn {
  top: 26px;
  right: 30px;
}

::v-deep .daily-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #2d78ff;
  font-size: 28px;
  font-weight: 700;
}

::v-deep .daily-dialog .el-dialog__body {
  padding: 0 0 20px;
  background: #f1f4f8;
}

::v-deep .daily-dialog .el-table {
  background: #f7f9fc;
  border-color: #dbe3ee;
}

::v-deep .daily-dialog .el-table th {
  background: #13a7d5;
  border-color: #33b4dc;
}

::v-deep .daily-dialog .el-table th > .cell {
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
}

::v-deep .daily-dialog .el-table td {
  border-color: #dfe5ee;
  background: #f8fafd;
}

::v-deep .daily-dialog .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #f4f7fb;
}

::v-deep .daily-dialog .el-table .cell {
  padding: 18px 10px;
  color: #4d5f7a;
  font-size: 13px;
}

::v-deep .daily-dialog .el-table__footer-wrapper td {
  background: #e4e9f0;
  border-color: #d5deea;
}

::v-deep .daily-dialog .el-table__footer-wrapper .cell {
  color: #273a55;
  font-weight: 700;
  font-size: 14px;
}

::v-deep .daily-dialog .el-table__footer-wrapper tr td:nth-child(8) .cell,
::v-deep .daily-dialog .el-table__footer-wrapper tr td:nth-child(9) .cell {
  color: #0eb573;
}
</style>
