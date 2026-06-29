<template>
  <div class="app-container agent-commission-page">
    <div class="page-title">代理佣金发放明细</div>

    <el-card shadow="never" class="section-card">
      <div class="section-title">佣金结算中心</div>
      <el-form :model="pendingQuery" :inline="true" label-width="78px" class="filter-form">
        <el-form-item label="日期筛选">
          <el-date-picker
            v-model="pendingQuery.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            class="w-date"
          />
        </el-form-item>
        <el-form-item label="代理层级">
          <el-input-number
            v-model="pendingQuery.agentLevel"
            :min="0"
            :precision="0"
            :controls="false"
            placeholder="全部层级"
            class="w-level"
          />
        </el-form-item>
        <el-form-item label="代理名称">
          <el-input
            v-model.trim="pendingQuery.agentName"
            placeholder="搜索代理名称..."
            clearable
            class="w-name"
            @keyup.enter.native="handlePendingQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handlePendingQuery">查询</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handlePendingExport">导出</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="pendingLoading"
        :data="pendingRows"
        border
        stripe
        show-summary
        :summary-method="getPendingSummaries"
      >
        <el-table-column label="编号" width="86" align="center">
          <template slot-scope="{ $index }">{{ calcPendingIndex($index) }}</template>
        </el-table-column>
        <el-table-column label="账期范围" prop="periodRange" min-width="165" align="center" />
        <el-table-column label="站点名称" prop="siteName" min-width="120" />
        <el-table-column label="代理名称" prop="agentName" min-width="120" />
        <el-table-column label="层级" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span v-if="toNumber(row.level) >= 0" class="level-text">{{ renderStars(row.level) }} {{ row.level }}级</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="总流水" prop="totalTurnover" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.totalTurnover) }}</template>
        </el-table-column>
        <el-table-column label="总盈利" prop="totalProfit" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.totalProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值手续费" prop="rechargeFee" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCurrency(row.rechargeFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现手续费" prop="withdrawFee" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCurrency(row.withdrawFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="三方场馆费" prop="venueFee" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.venueFee) }}</template>
        </el-table-column>
        <el-table-column label="彩金支出" prop="bonusExpense" min-width="110" align="right">
          <template slot-scope="{ row }">
            <span class="text-orange">{{ formatCurrency(row.bonusExpense) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="代理佣金" prop="agentCommission" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCurrency(row.agentCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="代理余额" prop="agentBalance" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.agentBalance) }}</template>
        </el-table-column>
        <el-table-column label="待结算佣金" prop="pendingCommission" min-width="125" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.pendingCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="应结日" prop="dueDate" min-width="105" align="center">
          <template slot-scope="{ row }">{{ formatDate(row.dueDate) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              v-if="row.settleStatus === '结算'"
              type="success"
              size="mini"
              @click="handleSettle(row)"
            >
              结算
            </el-button>
            <el-button v-else type="info" size="mini" disabled>已发放</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="pendingTotal > 0"
        :total="pendingTotal"
        :page.sync="pendingQuery.pageNum"
        :limit.sync="pendingQuery.pageSize"
        @pagination="fetchPending"
      />
    </el-card>

    <el-card shadow="never" class="section-card history-card">
      <div class="history-header">
        <div class="section-title">已结算历史日志</div>
        <div class="history-sub-title">查看佣金发放历史及审计操作</div>
      </div>

      <el-form :model="historyQuery" :inline="true" label-width="78px" class="filter-form">
        <el-form-item label="执行日期">
          <el-date-picker
            v-model="historyQuery.executeDateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            class="w-date"
          />
        </el-form-item>
        <el-form-item label="代理名称">
          <el-input
            v-model.trim="historyQuery.agentName"
            placeholder="搜索代理名称..."
            clearable
            class="w-name"
            @keyup.enter.native="handleHistoryQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleHistoryQuery">查询历史</el-button>
          <el-button icon="el-icon-download" @click="handleHistoryExport">导出历史</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="historyLoading"
        :data="historyRows"
        border
        stripe
        show-summary
        :summary-method="getHistorySummaries"
      >
        <el-table-column label="流水号" prop="historyNo" min-width="110" align="center" />
        <el-table-column label="账期范围" prop="periodRange" min-width="165" align="center" />
        <el-table-column label="站点名称" prop="siteName" min-width="120" />
        <el-table-column label="代理名称" prop="agentName" min-width="120" />
        <el-table-column label="层级" min-width="120" align="center">
          <template slot-scope="{ row }">
            <span v-if="toNumber(row.level) > 0" class="level-text">{{ renderStars(row.level) }} {{ row.level }}级</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="总流水" prop="totalTurnover" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.totalTurnover) }}</template>
        </el-table-column>
        <el-table-column label="总盈利" prop="totalProfit" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.totalProfit) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值手续费" prop="rechargeFee" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-orange">{{ formatCurrency(row.rechargeFee) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现手续费" prop="withdrawFee" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.withdrawFee) }}</template>
        </el-table-column>
        <el-table-column label="三方场馆费" prop="venueFee" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.venueFee) }}</template>
        </el-table-column>
        <el-table-column label="彩金支出" prop="bonusExpense" min-width="110" align="right">
          <template slot-scope="{ row }">
            <span class="text-orange">{{ formatCurrency(row.bonusExpense) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="实结佣金" prop="settledCommission" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.settledCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发放后余额" prop="postGrantBalance" min-width="125" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCurrency(row.postGrantBalance) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="operatorName" min-width="110" align="center" />
        <el-table-column label="结算执行时间" prop="executeTime" min-width="168" align="center">
          <template slot-scope="{ row }">{{ formatDateTime(row.executeTime) }}</template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="historyTotal > 0"
        :total="historyTotal"
        :page.sync="historyQuery.pageNum"
        :limit.sync="historyQuery.pageSize"
        @pagination="fetchHistory"
      />
    </el-card>
  </div>
</template>

<script>
import {
  listPendingAgentCommission,
  summaryPendingAgentCommission,
  settlePendingAgentCommission,
  listHistoryAgentCommission,
  summaryHistoryAgentCommission
} from '@/api/report/agentcommission'

function emptySummary() {
  return {
    totalTurnover: 0,
    totalProfit: 0,
    rechargeFee: 0,
    withdrawFee: 0,
    venueFee: 0,
    bonusExpense: 0,
    commissionAmount: 0,
    pendingCommission: 0,
    settledCommission: 0,
    balanceAmount: 0
  }
}

export default {
  name: 'AgentCommissionReport',
  data() {
    return {
      pendingLoading: false,
      historyLoading: false,
      pendingRows: [],
      historyRows: [],
      pendingTotal: 0,
      historyTotal: 0,
      pendingSummary: emptySummary(),
      historySummary: emptySummary(),
      pendingQuery: {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.defaultLast30Days(),
        agentLevel: null,
        agentName: ''
      },
      historyQuery: {
        pageNum: 1,
        pageSize: 10,
        executeDateRange: this.defaultPrevMonthRange(),
        agentName: ''
      }
    }
  },
  created() {
    this.fetchPending()
    this.fetchHistory()
  },
  methods: {
    defaultLast30Days() {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 29)
      return [this.toDateStr(start), this.toDateStr(end)]
    },
    defaultPrevMonthRange() {
      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayPrevMonth = new Date(firstDayThisMonth.getTime() - 24 * 60 * 60 * 1000)
      const firstDayPrevMonth = new Date(lastDayPrevMonth.getFullYear(), lastDayPrevMonth.getMonth(), 1)
      return [this.toDateStr(firstDayPrevMonth), this.toDateStr(lastDayPrevMonth)]
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
    renderStars(level) {
      const n = Math.max(0, Math.min(6, this.toNumber(level)))
      return '★'.repeat(n)
    },
    formatCurrency(value) {
      const amount = this.toNumber(value)
      return `¥ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    formatDate(value) {
      if (!value) return '-'
      return this.parseTime(value, '{y}-{m}-{d}')
    },
    formatDateTime(value) {
      if (!value) return '-'
      return this.parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    calcPendingIndex(index) {
      const offset = (this.pendingQuery.pageNum - 1) * this.pendingQuery.pageSize
      return 10000 + offset + index + 1
    },
    validatePendingRange() {
      const [startDate, endDate] = this.pendingQuery.dateRange || []
      if (!startDate || !endDate) {
        this.$message.warning('请选择待结算日期范围')
        return false
      }
      if (endDate < startDate) {
        this.$message.warning('结束日期不能早于开始日期')
        return false
      }
      return true
    },
    validateHistoryRange() {
      const [startDate, endDate] = this.historyQuery.executeDateRange || []
      if (!startDate || !endDate) {
        this.$message.warning('请选择历史执行日期范围')
        return false
      }
      if (endDate < startDate) {
        this.$message.warning('结束日期不能早于开始日期')
        return false
      }
      return true
    },
    buildPendingFilterParams() {
      const [startDate, endDate] = this.pendingQuery.dateRange || []
      const params = {
        startDate,
        endDate
      }
      if (this.pendingQuery.agentLevel !== null && this.pendingQuery.agentLevel !== undefined && this.pendingQuery.agentLevel !== '') {
        params.agentLevel = this.pendingQuery.agentLevel
      }
      if (this.pendingQuery.agentName) {
        params.agentName = this.pendingQuery.agentName
      }
      return params
    },
    buildPendingListParams() {
      return {
        ...this.buildPendingFilterParams(),
        pageNum: this.pendingQuery.pageNum,
        pageSize: this.pendingQuery.pageSize
      }
    },
    buildHistoryFilterParams() {
      const [executeStartDate, executeEndDate] = this.historyQuery.executeDateRange || []
      const params = {
        executeStartDate,
        executeEndDate
      }
      if (this.historyQuery.agentName) {
        params.agentName = this.historyQuery.agentName
      }
      return params
    },
    buildHistoryListParams() {
      return {
        ...this.buildHistoryFilterParams(),
        pageNum: this.historyQuery.pageNum,
        pageSize: this.historyQuery.pageSize
      }
    },
    async fetchPending() {
      if (!this.validatePendingRange()) return
      this.pendingLoading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listPendingAgentCommission(this.buildPendingListParams()),
          summaryPendingAgentCommission(this.buildPendingFilterParams())
        ])
        this.pendingRows = Array.isArray(listResp.rows) ? listResp.rows : []
        this.pendingTotal = Number(listResp.total || 0)
        this.pendingSummary = { ...emptySummary(), ...(summaryResp.data || {}) }
      } catch (e) {
        this.pendingRows = []
        this.pendingTotal = 0
        this.pendingSummary = emptySummary()
      } finally {
        this.pendingLoading = false
      }
    },
    async fetchHistory() {
      if (!this.validateHistoryRange()) return
      this.historyLoading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listHistoryAgentCommission(this.buildHistoryListParams()),
          summaryHistoryAgentCommission(this.buildHistoryFilterParams())
        ])
        this.historyRows = Array.isArray(listResp.rows) ? listResp.rows : []
        this.historyTotal = Number(listResp.total || 0)
        this.historySummary = { ...emptySummary(), ...(summaryResp.data || {}) }
      } catch (e) {
        this.historyRows = []
        this.historyTotal = 0
        this.historySummary = emptySummary()
      } finally {
        this.historyLoading = false
      }
    },
    handlePendingQuery() {
      this.pendingQuery.pageNum = 1
      this.fetchPending()
    },
    handleHistoryQuery() {
      this.historyQuery.pageNum = 1
      this.fetchHistory()
    },
    handlePendingExport() {
      if (!this.validatePendingRange()) return
      const params = this.buildPendingFilterParams()
      this.$confirm('是否导出当前筛选条件下的待结算数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/agentcommission/pending/export',
          params,
          `agent_commission_pending_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    handleHistoryExport() {
      if (!this.validateHistoryRange()) return
      const params = this.buildHistoryFilterParams()
      this.$confirm('是否导出当前筛选条件下的历史数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/agentcommission/history/export',
          params,
          `agent_commission_history_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    async handleSettle(row) {
      if (!row || !row.billId) {
        this.$message.warning('缺少账单标识，无法结算')
        return
      }
      const amount = this.toNumber(row.pendingCommission)
      let message = `确认为代理【${row.agentName || '-'}】执行结算吗？`
      if (amount < 0) {
        message = `该代理当前待结算佣金为负数（${this.formatCurrency(amount)}），确认继续结算吗？`
      } else if (amount === 0) {
        message = '该代理当前待结算佣金为 0，确认继续结算吗？'
      }

      try {
        await this.$confirm(message, '结算确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: amount < 0 ? 'warning' : 'info'
        })
        await settlePendingAgentCommission(row.billId)
        this.$message.success('结算成功')
        this.fetchPending()
        this.fetchHistory()
      } catch (e) {
        // cancel / request error
      }
    },
    getPendingSummaries({ columns }) {
      const sums = []
      const summary = this.pendingSummary || emptySummary()
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '待结算汇总'
          return
        }
        switch (column.property) {
          case 'totalTurnover':
            sums[index] = this.formatCurrency(summary.totalTurnover)
            break
          case 'totalProfit':
            sums[index] = this.formatCurrency(summary.totalProfit)
            break
          case 'rechargeFee':
            sums[index] = this.formatCurrency(summary.rechargeFee)
            break
          case 'withdrawFee':
            sums[index] = this.formatCurrency(summary.withdrawFee)
            break
          case 'venueFee':
            sums[index] = this.formatCurrency(summary.venueFee)
            break
          case 'bonusExpense':
            sums[index] = this.formatCurrency(summary.bonusExpense)
            break
          case 'agentCommission':
            sums[index] = this.formatCurrency(summary.commissionAmount)
            break
          case 'agentBalance':
            sums[index] = this.formatCurrency(summary.balanceAmount)
            break
          case 'pendingCommission':
            sums[index] = this.formatCurrency(summary.pendingCommission)
            break
          default:
            sums[index] = ''
            break
        }
      })
      return sums
    },
    getHistorySummaries({ columns }) {
      const sums = []
      const summary = this.historySummary || emptySummary()
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '历史发放汇总'
          return
        }
        switch (column.property) {
          case 'totalTurnover':
            sums[index] = this.formatCurrency(summary.totalTurnover)
            break
          case 'totalProfit':
            sums[index] = this.formatCurrency(summary.totalProfit)
            break
          case 'rechargeFee':
            sums[index] = this.formatCurrency(summary.rechargeFee)
            break
          case 'withdrawFee':
            sums[index] = this.formatCurrency(summary.withdrawFee)
            break
          case 'venueFee':
            sums[index] = this.formatCurrency(summary.venueFee)
            break
          case 'bonusExpense':
            sums[index] = this.formatCurrency(summary.bonusExpense)
            break
          case 'settledCommission':
            sums[index] = this.formatCurrency(summary.settledCommission)
            break
          case 'postGrantBalance':
            sums[index] = this.formatCurrency(summary.balanceAmount)
            break
          default:
            sums[index] = ''
            break
        }
      })
      return sums
    }
  }
}
</script>

<style scoped>
.agent-commission-page {
  padding-bottom: 10px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 14px;
}

.section-card {
  margin-bottom: 14px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}

.history-header {
  margin-bottom: 8px;
}

.history-sub-title {
  margin-top: -4px;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 13px;
}

.w-date {
  width: 260px;
}

.w-level {
  width: 130px;
}

.w-name {
  width: 200px;
}

.level-text {
  color: #2d6bff;
  font-weight: 600;
}

.text-green {
  color: #2f9a62;
  font-weight: 600;
}

.text-blue {
  color: #2d6bff;
  font-weight: 600;
}

.text-orange {
  color: #e67e22;
  font-weight: 600;
}

::v-deep .el-table__footer-wrapper .cell {
  font-weight: 700;
}
</style>
