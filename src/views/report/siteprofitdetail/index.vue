<template>
  <div class="app-container site-profit-page">
    <div class="page-title">站点利润明细</div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
        <el-form-item label="日期筛选">
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
            placeholder="搜索站点名称..."
            clearable
            class="w-search"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button icon="el-icon-s-operation" @click="advancedVisible = !advancedVisible">
            更多筛选
          </el-button>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>

      <el-form v-show="advancedVisible" :inline="true" label-width="80px" class="advanced-filter">
        <el-form-item label="结算状态">
          <el-select v-model="queryParams.settleStatus" clearable placeholder="全部" class="w-status">
            <el-option label="已结算" value="已结算" />
            <el-option label="未结算" value="未结算" />
          </el-select>
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
      >
        <el-table-column label="编号" width="90" align="center">
          <template slot-scope="{ $index }">
            {{ calcRowIndex($index) }}
          </template>
        </el-table-column>

        <el-table-column label="日期" prop="statDateRange" min-width="170" align="center">
          <template slot-scope="{ row }">
            {{ formatStatDateRange(row.statDateRange) }}
          </template>
        </el-table-column>

        <el-table-column label="站点名称" prop="siteName" min-width="130" />

        <el-table-column label="总流水" prop="totalTurnover" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.totalTurnover) }}</template>
        </el-table-column>

        <el-table-column label="总盈利" prop="totalProfit" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span :class="profitClass(row.totalProfit)">{{ formatAmount(row.totalProfit) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="充值额度" prop="rechargeAmount" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatAmount(row.rechargeAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="充值手续费" prop="rechargeFee" min-width="110" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatAmount(row.rechargeFee) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="提现额度" prop="withdrawAmount" min-width="115" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.withdrawAmount) }}</template>
        </el-table-column>

        <el-table-column label="提现手续费" prop="withdrawFee" min-width="110" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.withdrawFee) }}</template>
        </el-table-column>

        <el-table-column label="坏账" prop="badDebt" min-width="95" align="right">
          <template slot-scope="{ row }">
            <span :class="{ 'text-red': toNumber(row.badDebt) !== 0 }">{{ formatAmount(row.badDebt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="代理佣金" prop="agentCommission" min-width="110" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.agentCommission) }}</template>
        </el-table-column>

        <el-table-column label="活动彩金" prop="activityBonus" min-width="110" align="right">
          <template slot-scope="{ row }">
            <span class="text-orange">{{ formatAmount(row.activityBonus) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="站点收益" prop="siteIncome" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatAmount(row.siteIncome) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="月租" prop="monthlyRentText" min-width="110" align="center">
          <template slot-scope="{ row }">
            {{ renderMonthlyRent(row) }}
          </template>
        </el-table-column>

        <el-table-column label="三方场馆费用" prop="venueFee" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.venueFee) }}</template>
        </el-table-column>

        <el-table-column label="站点利润" prop="siteProfit" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-profit">{{ formatAmount(row.siteProfit) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="总站收益" prop="headOfficeShareAmount" min-width="115" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue-strong">{{ formatAmount(row.headOfficeShareAmount) }}</span>
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
  </div>
</template>

<script>
import { listSiteProfitDetail, summarySiteProfitDetail } from '@/api/report/siteprofitdetail'

function emptySummary() {
  return {
    totalTurnover: 0,
    totalProfit: 0,
    rechargeAmount: 0,
    rechargeFee: 0,
    withdrawAmount: 0,
    withdrawFee: 0,
    badDebt: 0,
    agentCommission: 0,
    activityBonus: 0,
    siteIncome: 0,
    monthlyRentAmount: 0,
    venueFee: 0,
    siteProfit: 0,
    headOfficeShareAmount: 0
  }
}

export default {
  name: 'SiteProfitDetailReport',
  data() {
    return {
      loading: false,
      advancedVisible: false,
      tableRows: [],
      total: 0,
      summaryRow: emptySummary(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.defaultDateRange(),
        siteName: '',
        settleStatus: ''
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
    formatAmount(value) {
      const amount = this.toNumber(value)
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatStatDateRange(value) {
      if (!value) return '-'
      const text = String(value)
      const parts = text.split('~')
      if (parts.length !== 2) return text
      const left = parts[0].trim().replace(/-/g, '/')
      const right = parts[1].trim().replace(/-/g, '/')
      return `${left}-${right}`
    },
    calcRowIndex(index) {
      const offset = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      return 10000 + offset + index + 1
    },
    profitClass(value) {
      const amount = this.toNumber(value)
      if (amount < 0) return 'text-red'
      return 'text-green'
    },
    renderMonthlyRent(row) {
      const amount = this.toNumber(row && row.monthlyRentAmount)
      if (amount > 0) {
        return `¥ ${this.formatAmount(amount)}`
      }
      if (row && row.monthlyRentText && String(row.monthlyRentText).indexOf('免') > -1) {
        return '免扣除'
      }
      return '免扣除'
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
        endDate
      }
      if (this.queryParams.siteName) {
        params.siteName = this.queryParams.siteName
      }
      if (this.queryParams.settleStatus) {
        params.settleStatus = this.queryParams.settleStatus
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
    normalizeSummary(data) {
      return {
        ...emptySummary(),
        ...(data || {})
      }
    },
    async fetchList() {
      if (!this.validateDateRange()) return
      this.loading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listSiteProfitDetail(this.buildListParams()),
          summarySiteProfitDetail(this.buildFilterParams())
        ])
        this.tableRows = Array.isArray(listResp.rows) ? listResp.rows : []
        this.total = Number(listResp.total || 0)
        this.summaryRow = this.normalizeSummary(summaryResp.data)
      } catch (e) {
        this.tableRows = []
        this.total = 0
        this.summaryRow = emptySummary()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams.siteName = ''
      this.queryParams.settleStatus = ''
      this.queryParams.pageNum = 1
      this.queryParams.dateRange = this.defaultDateRange()
      this.fetchList()
    },
    handleExport() {
      if (!this.validateDateRange()) return
      const params = this.buildFilterParams()
      this.$confirm('是否导出当前筛选条件的数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/siteprofitdetail/export',
          params,
          `site_profit_detail_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    getSummaries(param) {
      const { columns } = param
      const sums = []
      const summary = this.summaryRow || emptySummary()
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        const prop = column.property
        if (!prop) {
          sums[index] = ''
          return
        }
        if (prop === 'statDateRange' || prop === 'siteName') {
          sums[index] = ''
          return
        }
        if (prop === 'monthlyRentText') {
          sums[index] = `¥ ${this.formatAmount(summary.monthlyRentAmount)}`
          return
        }
        sums[index] = this.formatAmount(summary[prop])
      })
      return sums
    }
  }
}
</script>

<style scoped>
.site-profit-page {
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

.w-date {
  width: 300px;
}

.w-search {
  width: 220px;
}

.w-status {
  width: 130px;
}

.advanced-filter {
  margin-top: 4px;
}

.text-green {
  color: #2f9a62;
  font-weight: 600;
}

.text-red {
  color: #f56c6c;
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

.text-profit {
  color: #1f2a44;
  font-weight: 700;
}

.text-blue-strong {
  color: #2d6bff;
  font-weight: 700;
}

::v-deep .el-table__footer-wrapper .cell {
  font-weight: 700;
}
</style>
