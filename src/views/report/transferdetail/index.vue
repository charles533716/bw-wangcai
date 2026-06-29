<template>
  <div class="app-container transfer-detail-page">
    <div class="page-title">站点/代理转账明细报表</div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" :inline="true" label-width="70px">
        <el-form-item label="订单号">
          <el-input
            v-model.trim="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            class="w-order"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="日期">
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

        <el-form-item label="转账人">
          <el-input
            v-model.trim="queryParams.fromAccount"
            placeholder="请输入转账人"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="被转账人">
          <el-input
            v-model.trim="queryParams.toAccount"
            placeholder="请输入被转账人"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="身份">
          <el-select
            v-model="queryParams.identity"
            clearable
            placeholder="全部身份"
            class="w-select"
          >
            <el-option
              v-for="item in identityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        border
        stripe
        show-summary
        :summary-method="getSummaries"
        :class="['transfer-table', { 'summary-negative': summaryChangeNegative }]"
      >
        <el-table-column label="订单号" prop="orderNo" min-width="200" />

        <el-table-column label="转账人" prop="fromAccount" min-width="130" />

        <el-table-column label="ID" min-width="100" align="center">
          <template slot-scope="{ row }">{{ renderFromId(row) }}</template>
        </el-table-column>

        <el-table-column label="转账前额度" prop="fromQuotaText" min-width="150" align="center">
          <template slot-scope="{ row }">{{ row.fromQuotaText || '-' }}</template>
        </el-table-column>

        <el-table-column label="额度增减" prop="amountChange" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span :class="changeClass(row.amountChange)">{{ formatSignedAmount(row.amountChange) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="充值后站点额度" min-width="150" align="center">
          <template slot-scope="{ row }">{{ renderFromAfterQuota(row) }}</template>
        </el-table-column>

        <el-table-column label="被转账人账号" prop="toAccount" min-width="130" align="center">
          <template slot-scope="{ row }">
            <el-tag
              v-if="row.toAccount === '操作' || row.toAccount === '充正'"
              size="mini"
              type="primary"
              effect="plain"
            >
              {{ row.toAccount }}
            </el-tag>
            <span v-else>{{ row.toAccount || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="被转账人ID" min-width="110" align="center">
          <template slot-scope="{ row }">{{ renderToId(row) }}</template>
        </el-table-column>

        <el-table-column label="转账前额度" prop="toBeforeAmount" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.toBeforeAmount) }}</template>
        </el-table-column>

        <el-table-column label="被转账额度" prop="toAmount" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.toAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="转账后额度" prop="toAfterAmount" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.toAfterAmount) }}</template>
        </el-table-column>

        <el-table-column label="操作人" prop="operatorName" min-width="120" align="center" />

        <el-table-column label="转账时间" prop="transferTime" min-width="170" align="center">
          <template slot-scope="{ row }">{{ formatDateTime(row.transferTime) }}</template>
        </el-table-column>

        <el-table-column label="操作人身份" prop="operatorIdentity" min-width="110" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.operatorIdentity ? 'primary' : 'info'">{{ row.operatorIdentity || '-' }}</el-tag>
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
import { listTransferDetail, summaryTransferDetail } from '@/api/report/transferdetail'

function emptySummary() {
  return {
    amountChange: 0,
    toAmount: 0
  }
}

export default {
  name: 'TransferDetailReport',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      summaryRow: emptySummary(),
      identityOptions: [
        { label: '全部身份', value: '' },
        { label: '站点管理', value: 'SITE_ADMIN' },
        { label: '代理', value: 'AGENT' },
        { label: '总站', value: 'MAIN_SITE' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        dateRange: this.defaultMonthRange(),
        fromAccount: '',
        toAccount: '',
        identity: ''
      }
    }
  },
  computed: {
    summaryChangeNegative() {
      return this.toNumber(this.summaryRow && this.summaryRow.amountChange) < 0
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    defaultMonthRange() {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [this.toDateStr(start), this.toDateStr(now)]
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
    toText(value, fallback = '-') {
      if (value === undefined || value === null || value === '') {
        return fallback
      }
      return String(value)
    },
    formatAmount(value) {
      return this.toNumber(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatCurrency(value) {
      return `¥ ${this.formatAmount(value)}`
    },
    formatSignedAmount(value) {
      const amount = this.toNumber(value)
      const base = this.formatAmount(amount)
      if (amount > 0) return `+${base}`
      return base
    },
    formatDateTime(value) {
      if (!value) return '-'
      return this.parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    changeClass(value) {
      const amount = this.toNumber(value)
      if (amount > 0) return 'text-green'
      if (amount < 0) return 'text-red'
      return ''
    },
    renderFromId(row) {
      if (!row) return '-'
      return this.toText(row.fromIdText, this.toText(row.fromId))
    },
    renderToId(row) {
      if (!row) return '-'
      return this.toText(row.toIdText, this.toText(row.toId))
    },
    renderFromAfterQuota(row) {
      if (!row) return '-'
      if (row.fromAfterQuotaText) {
        return row.fromAfterQuotaText
      }
      const fromAfter = this.formatAmount(row.fromAfterAmount)
      const parts = String(row.fromQuotaText || '').split('/')
      if (parts.length === 2) {
        return `${fromAfter}/${parts[1]}`
      }
      return fromAfter
    },
    validateDateRange() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      if (!startDate || !endDate) {
        this.$message.warning('请选择开始日期和结束日期')
        return false
      }
      if (endDate < startDate) {
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
      if (this.queryParams.orderNo) params.orderNo = this.queryParams.orderNo
      if (this.queryParams.fromAccount) params.fromAccount = this.queryParams.fromAccount
      if (this.queryParams.toAccount) params.toAccount = this.queryParams.toAccount
      if (this.queryParams.identity) params.identity = this.queryParams.identity
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
          listTransferDetail(this.buildListParams()),
          summaryTransferDetail(this.buildFilterParams())
        ])
        this.list = Array.isArray(listResp.rows) ? listResp.rows : []
        this.total = Number(listResp.total || 0)
        this.summaryRow = this.normalizeSummary(summaryResp.data)
      } catch (e) {
        this.list = []
        this.total = 0
        this.summaryRow = emptySummary()
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      if (!this.validateDateRange()) return
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        dateRange: this.defaultMonthRange(),
        fromAccount: '',
        toAccount: '',
        identity: ''
      }
      this.fetchList()
    },
    handleExport() {
      if (!this.validateDateRange()) return
      const params = this.buildFilterParams()
      this.$confirm('是否导出当前筛选条件下的全部数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/transferdetail/export',
          params,
          `site_agent_transfer_detail_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    getSummaries({ columns }) {
      const sums = []
      const summary = this.summaryRow || emptySummary()
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        if (column.property === 'amountChange') {
          sums[index] = this.formatSignedAmount(summary.amountChange)
          return
        }
        if (column.property === 'toAmount') {
          sums[index] = this.formatCurrency(summary.toAmount)
          return
        }
        sums[index] = ''
      })
      return sums
    }
  }
}
</script>

<style scoped>
.transfer-detail-page {
  padding-bottom: 8px;
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

.table-toolbar {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.w-order {
  width: 190px;
}

.w-date {
  width: 260px;
}

.w-input {
  width: 170px;
}

.w-select {
  width: 130px;
}

.text-blue {
  color: #2d6bff;
  font-weight: 600;
}

.text-green {
  color: #2f9a62;
  font-weight: 600;
}

.text-red {
  color: #f56c6c;
  font-weight: 600;
}

::v-deep .transfer-table .el-table__footer-wrapper .cell {
  font-weight: 700;
}

::v-deep .transfer-table .el-table__footer-wrapper tr td:nth-child(5) .cell,
::v-deep .transfer-table .el-table__footer-wrapper tr td:nth-child(10) .cell {
  color: #2f9a62;
}

::v-deep .transfer-table.summary-negative .el-table__footer-wrapper tr td:nth-child(5) .cell {
  color: #f56c6c;
}
</style>
