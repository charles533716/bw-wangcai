<template>
  <div class="app-container member-change-page">
    <div class="page-title">账变记录</div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="78px">
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

        <el-form-item label="总站">
          <el-select
            v-model="queryParams.mainSiteCode"
            placeholder="全部总站"
            clearable
            filterable
            class="w-select"
          >
            <el-option
              v-for="item in mainSiteOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="总站名称">
          <el-input
            v-model.trim="queryParams.mainSiteName"
            placeholder="请输入总站名称"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="直属上级">
          <el-input
            v-model.trim="queryParams.parentName"
            placeholder="请输入直属上级"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="用户ID/名称">
          <el-input
            v-model.trim="queryParams.memberKeyword"
            placeholder="请输入用户ID或名称"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="身份">
          <el-select
            v-model="queryParams.identity"
            placeholder="全部身份"
            clearable
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

        <el-form-item label="订单号">
          <el-input
            v-model.trim="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="IP地址">
          <el-input
            v-model.trim="queryParams.ipAddress"
            placeholder="请输入IP地址"
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>


        <el-form-item label="帐变模块">
          <el-select
            v-model="queryParams.operationModule"
            placeholder="全部"
            clearable
            class="w-select"
            @change="handleTransactionCategoryChange"
          >
            <el-option
              v-for="item in transactionCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="交易类型">
          <el-select
            v-model="queryParams.transactionType"
            placeholder="全部"
            clearable
            filterable
            class="w-select"
            @change="handleTransactionTypeChange"
          >
            <el-option
              v-for="item in filteredTransactionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="Number(item.value)"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        border
        stripe
        :class="{ 'summary-negative': summaryNegative }"
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column label="总站" prop="mainSiteName" min-width="110" />

        <el-table-column label="直属上级" prop="parentName" min-width="120">
          <template slot-scope="{ row }">
            <span>{{ row.parentName || '---' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="ID" prop="memberIdText" min-width="140" />

        <el-table-column label="名称" prop="memberName" min-width="110" />

        <el-table-column label="身份" prop="identityLabel" min-width="100" align="center">
          <template slot-scope="{ row }">
            {{ showDash(row.identityLabel) }}
          </template>
        </el-table-column>

        <el-table-column label="订单号" prop="orderNo" min-width="160" />

        <el-table-column label="操作时间" prop="operationTime" min-width="165">
          <template slot-scope="{ row }">
            {{ formatTime(row.operationTime) }}
          </template>
        </el-table-column>

        <el-table-column label="帐变模块" prop="operationModule" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="moduleTagType(row.operationModule)">
              {{ getDictLabel(dict.type.transaction_category, row.operationModule) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="交易类型" prop="transactionType" min-width="140" align="center">
          <template slot-scope="{ row }">
            <dict-tag :options="dict.type.transaction_type" :value="row.transactionType" />
          </template>
        </el-table-column>

        <el-table-column label="帐变前余额" prop="amountBefore" min-width="120" align="right">
          <template slot-scope="{ row }">
            {{ formatBalance(row.amountBefore) }}
          </template>
        </el-table-column>

        <el-table-column label="帐变额度" prop="changeAmount" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span :class="changeAmountClass(row.changeAmount)">
              {{ formatSignedAmount(row.changeAmount) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="手续费" prop="feeAmount" min-width="100" align="right">
          <template slot-scope="{ row }">
            {{ formatCurrency(row.feeAmount) }}
          </template>
        </el-table-column>

        <el-table-column label="帐变后余额" prop="amountAfter" min-width="120" align="right">
          <template slot-scope="{ row }">
            {{ formatBalance(row.amountAfter) }}
          </template>
        </el-table-column>

        <el-table-column label="登陆终端" prop="loginTerminal" min-width="95" align="center">
          <template slot-scope="{ row }">
            {{ showDash(row.loginTerminal) }}
          </template>
        </el-table-column>

        <el-table-column label="IP地址" min-width="160">
          <template slot-scope="{ row }">
            <div>{{ showDash(row.ipAddress) }}</div>
            <div class="ip-location">{{ row.ipLocation || '' }}</div>
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
import {
  listMemberChangeRecord,
  summaryMemberChangeRecord,
  listMemberChangeMainSites
} from '@/api/report/memberchangerecord'

const CATEGORY_TRANSACTION_TYPE_MAP = Object.freeze({
  转入: [1, 11],
  转出: [2, 9, 10],
  投注: [3],
  派彩: [4],
  上分下分: [5, 6, 7, 8],
  奖励: [15, 16],
  代理: [17, 18, 22, 23, 24, 25],
  站点: [20, 21]
})

const TRANSACTION_TYPE_CATEGORY_MAP = Object.freeze(
  Object.keys(CATEGORY_TRANSACTION_TYPE_MAP).reduce((result, category) => {
    CATEGORY_TRANSACTION_TYPE_MAP[category].forEach((type) => {
      result[type] = category
    })
    return result
  }, {})
)

function emptySummary() {
  return {
    changeAmountTotal: 0,
    feeAmountTotal: 0
  }
}

export default {
  name: 'MemberChangeRecordReport',
  dicts: ['transaction_category', 'transaction_type'],
  computed: {
    summaryNegative() {
      return this.toNumber(this.summaryRow && this.summaryRow.changeAmountTotal) < 0
    },
    transactionCategoryOptions() {
      return this.dict.type.transaction_category || []
    },
    filteredTransactionTypeOptions() {
      const allOptions = this.dict.type.transaction_type || []
      const category = this.queryParams.operationModule
      if (!category) {
        return allOptions
      }
      const allowedTypes = CATEGORY_TRANSACTION_TYPE_MAP[category] || []
      return allOptions.filter((item) => allowedTypes.includes(Number(item.value)))
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      mainSiteOptions: [],
      summaryRow: emptySummary(),
      identityOptions: [
        { label: '站点', value: 'SITE_ADMIN' },
        { label: '代理', value: 'AGENT' },
        { label: '会员', value: 'MEMBER' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.defaultDateRange(),
        mainSiteCode: '',
        mainSiteName: '',
        parentName: '',
        memberKeyword: '',
        identity: '',
        orderNo: '',
        ipAddress: '',
        deviceCode: '',
        operationModule: '',
        transactionType: undefined
      }
    }
  },
  created() {
    this.loadMainSites()
    this.fetchList()
  },
  methods: {
    defaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - 6)
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
    isEmpty(value) {
      return value === undefined || value === null || value === ''
    },
    showDash(value) {
      return this.isEmpty(value) ? '---' : value
    },
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    formatCurrency(value) {
      const amount = this.toNumber(value)
      return `¥ ${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    formatBalance(value) {
      if (this.isEmpty(value)) {
        return '---'
      }
      return this.formatCurrency(value)
    },
    formatSignedAmount(value) {
      if (this.isEmpty(value)) {
        return '---'
      }
      const amount = this.toNumber(value)
      const base = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      if (amount > 0) {
        return `+${base}`
      }
      return base
    },
    changeAmountClass(value) {
      const amount = this.toNumber(value)
      if (amount > 0) return 'text-green'
      if (amount < 0) return 'text-red'
      return ''
    },
    getDictLabel(options, value) {
      const matched = (options || []).find((item) => String(item.value) === String(value))
      if (matched) {
        return matched.label
      }
      return this.isEmpty(value) ? '-' : value
    },
    moduleTagType(module) {
      if (module === '转入' || module === '派彩' || module === '奖励') {
        return 'success'
      }
      if (module === '投注' || module === '转出') {
        return 'danger'
      }
      if (module === '代理') {
        return 'info'
      }
      if (module === '上分下分' || module === '站点') {
        return 'warning'
      }
      return 'info'
    },
    handleTransactionCategoryChange(value) {
      if (this.isEmpty(value) || this.isEmpty(this.queryParams.transactionType)) {
        return
      }
      const allowedTypes = CATEGORY_TRANSACTION_TYPE_MAP[value] || []
      if (!allowedTypes.includes(Number(this.queryParams.transactionType))) {
        this.queryParams.transactionType = undefined
      }
    },
    handleTransactionTypeChange(value) {
      if (this.isEmpty(value)) {
        return
      }
      const matchedCategory = TRANSACTION_TYPE_CATEGORY_MAP[Number(value)]
      if (matchedCategory && this.queryParams.operationModule !== matchedCategory) {
        this.queryParams.operationModule = matchedCategory
      }
    },
    validateDateRange() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      if (startDate && endDate && endDate < startDate) {
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
      if (this.queryParams.mainSiteCode) params.mainSiteCode = this.queryParams.mainSiteCode
      if (this.queryParams.mainSiteName) params.mainSiteName = this.queryParams.mainSiteName
      if (this.queryParams.parentName) params.parentName = this.queryParams.parentName
      if (this.queryParams.memberKeyword) params.memberKeyword = this.queryParams.memberKeyword
      if (this.queryParams.identity) params.identity = this.queryParams.identity
      if (this.queryParams.orderNo) params.orderNo = this.queryParams.orderNo
      if (this.queryParams.ipAddress) params.ipAddress = this.queryParams.ipAddress
      if (this.queryParams.deviceCode) params.deviceCode = this.queryParams.deviceCode
      if (this.queryParams.operationModule) params.operationModule = this.queryParams.operationModule
      if (!this.isEmpty(this.queryParams.transactionType)) params.transactionType = this.queryParams.transactionType
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
    async loadMainSites() {
      try {
        const resp = await listMemberChangeMainSites()
        this.mainSiteOptions = Array.isArray(resp.data) ? resp.data : []
      } catch (e) {
        this.mainSiteOptions = []
      }
    },
    async fetchList() {
      if (!this.validateDateRange()) return
      this.loading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listMemberChangeRecord(this.buildListParams()),
          summaryMemberChangeRecord(this.buildFilterParams())
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
      this.queryParams.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.defaultDateRange(),
        mainSiteCode: '',
        mainSiteName: '',
        parentName: '',
        memberKeyword: '',
        identity: '',
        orderNo: '',
        ipAddress: '',
        deviceCode: '',
        operationModule: '',
        transactionType: undefined
      }
      this.fetchList()
    },
    handleExport() {
      if (!this.validateDateRange()) return
      const params = this.buildFilterParams()
      this.$confirm('是否确认导出当前筛选条件下的全部数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/memberchangerecord/export',
          params,
          `member_change_record_${new Date().getTime()}.xlsx`
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
        if (column.property === 'changeAmount') {
          sums[index] = this.formatSignedAmount(summary.changeAmountTotal)
          return
        }
        if (column.property === 'feeAmount') {
          sums[index] = this.formatCurrency(summary.feeAmountTotal)
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
.member-change-page {
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

.w-date {
  width: 260px;
}

.w-select {
  width: 140px;
}

.w-input {
  width: 155px;
}

.ip-location {
  color: #8b96a6;
  font-size: 12px;
  margin-top: 2px;
}

.text-green {
  color: #2f9a62;
  font-weight: 600;
}

.text-red {
  color: #f56c6c;
  font-weight: 600;
}

::v-deep .el-table__footer-wrapper .cell {
  font-weight: 700;
}

::v-deep .summary-negative .el-table__footer-wrapper tr td:nth-child(11) .cell {
  color: #f56c6c;
}
</style>
