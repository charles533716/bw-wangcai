<template>
  <div class="app-container withdraw-transfer-page">
    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="88px">
        <el-form-item label="日期查询">
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

        <el-form-item label="站点名称">
          <el-input
            v-model.trim="queryParams.siteName"
            placeholder="请输入站点名称"
            clearable
            class="w-site-name"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="el-icon-download" @click="handleExport">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        :span-method="tableSpanMethod"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="{ row, $index }">
            <span v-if="row.__isSummary">总计</span>
            <span v-else>{{ calcRowIndex($index) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="日期" prop="statDate" width="120" align="center">
          <template slot-scope="{ row }">
            <span v-if="!row.__isSummary">{{ row.statDate || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="站点名称" prop="siteName" min-width="160">
          <template slot-scope="{ row }">
            <el-link
              v-if="!row.__isSummary"
              type="primary"
              :underline="false"
              @click="goSiteConfig(row)"
            >
              {{ row.siteName || row.siteCode || '-' }}
            </el-link>
            <span v-else>{{ row.siteName || '总计' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="总充值" prop="totalDeposit" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.totalDeposit) }}</template>
        </el-table-column>

        <el-table-column label="总提现" prop="totalWithdraw" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.totalWithdraw) }}</template>
        </el-table-column>

        <el-table-column label="总转账" prop="totalTransfer" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.totalTransfer) }}</template>
        </el-table-column>

        <el-table-column label="站点总充值" prop="siteTotalDeposit" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.siteTotalDeposit) }}</template>
        </el-table-column>

        <el-table-column label="站点总转账" prop="siteTotalTransfer" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.siteTotalTransfer) }}</template>
        </el-table-column>

        <el-table-column label="站点总提现" prop="siteTotalWithdraw" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.siteTotalWithdraw) }}</template>
        </el-table-column>

        <el-table-column label="代理总充值" prop="agentTotalDeposit" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.agentTotalDeposit) }}</template>
        </el-table-column>

        <el-table-column label="代理总转账" prop="agentTotalTransfer" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.agentTotalTransfer) }}</template>
        </el-table-column>

        <el-table-column label="代理总提现" prop="agentTotalWithdraw" min-width="130" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.agentTotalWithdraw) }}</template>
        </el-table-column>

        <el-table-column label="会员总充值" prop="memberTotalDeposit" min-width="130" align="right" class-name="member-amount-cell">
          <template slot-scope="{ row }">{{ formatAmount(row.memberTotalDeposit) }}</template>
        </el-table-column>

        <el-table-column label="会员总提现" prop="memberTotalWithdraw" min-width="130" align="right" class-name="member-amount-cell">
          <template slot-scope="{ row }">{{ formatAmount(row.memberTotalWithdraw) }}</template>
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
  </div>
</template>

<script>
import { listWithdrawTransferStats, summaryWithdrawTransferStats } from '@/api/report/withdrawtransfer'

function createEmptySummaryRow() {
  return {
    __isSummary: true,
    statDate: null,
    siteCode: null,
    siteName: '总计',
    totalDeposit: 0,
    totalWithdraw: 0,
    totalTransfer: 0,
    siteTotalDeposit: 0,
    siteTotalTransfer: 0,
    siteTotalWithdraw: 0,
    agentTotalDeposit: 0,
    agentTotalTransfer: 0,
    agentTotalWithdraw: 0,
    memberTotalDeposit: 0,
    memberTotalWithdraw: 0
  }
}

export default {
  name: 'WithdrawTransferStatsReport',
  data() {
    return {
      loading: false,
      list: [],
      summaryRow: createEmptySummaryRow(),
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        siteName: ''
      }
    }
  },
  computed: {
    tableData() {
      const rows = Array.isArray(this.list) ? this.list.slice() : []
      rows.push(this.summaryRow)
      return rows
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    formatAmount(value) {
      const amount = this.toNumber(value)
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    calcRowIndex(index) {
      return (this.queryParams.pageNum - 1) * this.queryParams.pageSize + index + 1
    },
    tableSpanMethod({ row, columnIndex }) {
      if (!row || !row.__isSummary) {
        return [1, 1]
      }
      if (columnIndex === 0) {
        return [1, 3]
      }
      if (columnIndex === 1 || columnIndex === 2) {
        return [0, 0]
      }
      return [1, 1]
    },
    tableRowClassName({ row }) {
      return row && row.__isSummary ? 'summary-total-row' : ''
    },
    validateDateRange() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      if (!startDate && !endDate) {
        return true
      }
      if (!startDate || !endDate) {
        this.$message.warning('开始日期和结束日期需同时选择')
        return false
      }
      const start = new Date(startDate.replace(/-/g, '/'))
      const end = new Date(endDate.replace(/-/g, '/'))
      if (end.getTime() < start.getTime()) {
        this.$message.warning('结束日期不能早于开始日期')
        return false
      }
      return true
    },
    buildFilterParams() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      const params = {}
      if (startDate) {
        params.startDate = startDate
      }
      if (endDate) {
        params.endDate = endDate
      }
      if (this.queryParams.siteName) {
        params.siteName = this.queryParams.siteName
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
    toSummaryRow(data) {
      return {
        ...createEmptySummaryRow(),
        ...(data || {}),
        __isSummary: true,
        siteName: '总计'
      }
    },
    async fetchList() {
      if (!this.validateDateRange()) {
        return
      }
      this.loading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listWithdrawTransferStats(this.buildListParams()),
          summaryWithdrawTransferStats(this.buildFilterParams())
        ])
        this.list = Array.isArray(listResp.rows) ? listResp.rows : []
        this.total = Number(listResp.total || 0)
        this.summaryRow = this.toSummaryRow(summaryResp.data || {})
      } catch (e) {
        this.list = []
        this.total = 0
        this.summaryRow = createEmptySummaryRow()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      if (!this.validateDateRange()) {
        return
      }
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams.dateRange = []
      this.queryParams.siteName = ''
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return
      }
      const params = this.buildFilterParams()
      this.$confirm('是否确认导出当前查询条件下的数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/withdrawtransfer/export',
          params,
          `withdraw_transfer_stats_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    goSiteConfig(row) {
      if (!row || !row.siteCode) {
        return
      }
      this.$router.push({
        path: '/site/config/index',
        query: { siteCode: row.siteCode }
      })
    }
  }
}
</script>

<style scoped>
.withdraw-transfer-page {
  padding-bottom: 8px;
}

.filter-card {
  margin-bottom: 14px;
}

.table-card {
  margin-bottom: 12px;
}

.w-date {
  width: 320px;
}

.w-site-name {
  width: 220px;
}

::v-deep .member-amount-cell .cell {
  color: #f56c6c;
  font-weight: 600;
}

::v-deep .el-table .summary-total-row td {
  background: #f8fafc;
  font-weight: 700;
}
</style>
