<template>
  <div class="app-container prepaid-account-page">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      v-show="showSearch"
      label-width="86px"
      class="query-form"
    >
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="精确查询站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="siteName">
        <el-input
          v-model="queryParams.siteName"
          placeholder="模糊查询站点名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="编码/名称/预付金账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点状态" prop="siteStatus">
        <el-select v-model="queryParams.siteStatus" placeholder="全部状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.site_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="summary-strip">
      <div v-for="item in summaryItems" :key="item.key" class="summary-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="balanceList" border stripe>
      <el-table-column label="站点编码" prop="siteCode" min-width="110" fixed="left" show-overflow-tooltip />
      <el-table-column label="站点名称" prop="siteName" min-width="150" fixed="left" show-overflow-tooltip />
      <el-table-column label="站点状态" prop="siteStatus" min-width="100" align="center">
        <template slot-scope="{ row }">
          <dict-tag v-if="row.siteStatus !== undefined && row.siteStatus !== null" :options="dict.type.site_status" :value="row.siteStatus" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="预付金账号" prop="accountNo" min-width="230" show-overflow-tooltip>
        <template slot-scope="{ row }">{{ row.accountNo || '-' }}</template>
      </el-table-column>
      <el-table-column label="预付金可用余额(CNY)" prop="prepaidBalance" min-width="160" align="right">
        <template slot-scope="{ row }">
          <span class="money money--primary">{{ money(row.prepaidBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预付金冻结余额(CNY)" prop="frozenBalance" min-width="160" align="right">
        <template slot-scope="{ row }">
          <span class="money money--warning">{{ money(row.frozenBalance) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="财务中心可用余额(CNY)" prop="financeAvailableBalance" min-width="175" align="right">
        <template slot-scope="{ row }">{{ money(row.financeAvailableBalance) }}</template>
      </el-table-column>
      <el-table-column label="资金池额度(CNY)" prop="fundPoolBalance" min-width="150" align="right">
        <template slot-scope="{ row }">{{ money(row.fundPoolBalance) }}</template>
      </el-table-column>
      <el-table-column label="最后更新时间" prop="lastUpdateTime" min-width="165">
        <template slot-scope="{ row }">{{ formatTime(row.lastUpdateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-tickets"
            :disabled="!row.siteCode"
            @click="openRecordDialog(row)"
          >明细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      title="预付金明细"
      :visible.sync="recordOpen"
      width="1120px"
      append-to-body
      custom-class="record-dialog"
    >
      <div class="record-account">
        <div class="record-account__item">
          <span>站点</span>
          <strong>{{ currentAccount.siteName || '-' }} / {{ currentAccount.siteCode || '-' }}</strong>
        </div>
        <div class="record-account__item">
          <span>预付金账号</span>
          <strong>{{ currentAccount.accountNo || '-' }}</strong>
        </div>
        <div class="record-account__item">
          <span>可用余额</span>
          <strong class="money--primary">{{ money(currentAccount.prepaidBalance) }} CNY</strong>
        </div>
        <div class="record-account__item">
          <span>冻结余额</span>
          <strong class="money--warning">{{ money(currentAccount.frozenBalance) }} CNY</strong>
        </div>
      </div>

      <el-form :model="recordQueryParams" :inline="true" class="record-filter" label-width="78px">
        <el-form-item label="关键词" prop="keyword">
          <el-input
            v-model="recordQueryParams.keyword"
            placeholder="流水号/订单号/备注"
            clearable
            size="small"
            @keyup.enter.native="handleRecordQuery"
          />
        </el-form-item>
        <el-form-item label="收支方向" prop="direction">
          <el-select v-model="recordQueryParams.direction" placeholder="全部方向" clearable size="small">
            <el-option label="收入" value="IN" />
            <el-option label="支出" value="OUT" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="recordDateRange"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            size="small"
            class="record-date-range"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleRecordQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetRecordQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="recordLoading" :data="recordList" border stripe>
        <el-table-column label="流水号" prop="transactionId" min-width="180" fixed="left" show-overflow-tooltip />
        <el-table-column label="业务类型" prop="transactionTypeName" min-width="130" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.transactionTypeName || row.transactionType || '-' }}</template>
        </el-table-column>
        <el-table-column label="发生额(CNY)" prop="amount" min-width="125" align="right">
          <template slot-scope="{ row }">
            <span :class="recordAmountClass(row)">{{ recordMoney(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="变动前可用余额(CNY)" prop="balanceBefore" min-width="165" align="right">
          <template slot-scope="{ row }">{{ money(row.balanceBefore) }}</template>
        </el-table-column>
        <el-table-column label="变动后可用余额(CNY)" prop="balanceAfter" min-width="165" align="right">
          <template slot-scope="{ row }">{{ money(row.balanceAfter) }}</template>
        </el-table-column>
        <el-table-column label="变动前冻结余额(CNY)" prop="frozenBalanceBefore" min-width="165" align="right">
          <template slot-scope="{ row }">{{ money(row.frozenBalanceBefore) }}</template>
        </el-table-column>
        <el-table-column label="变动后冻结余额(CNY)" prop="frozenBalanceAfter" min-width="165" align="right">
          <template slot-scope="{ row }">{{ money(row.frozenBalanceAfter) }}</template>
        </el-table-column>
        <el-table-column label="关联业务单号" prop="relatedOrderNo" min-width="170" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.relatedOrderNo || '-' }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作人" prop="operatorName" min-width="110" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.operatorName || row.createBy || '-' }}</template>
        </el-table-column>
        <el-table-column label="发生时间" prop="createTime" min-width="165">
          <template slot-scope="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="recordTotal > 0"
        :total="recordTotal"
        :page.sync="recordQueryParams.pageNum"
        :limit.sync="recordQueryParams.pageSize"
        @pagination="getRecordList"
      />

      <div slot="footer" class="dialog-footer">
        <el-button @click="recordOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getPrepaidAccountBalanceSummary, listPrepaidAccountBalances, listPrepaidAccountRecords } from '@/api/funds/prepaidAccount'

function createQueryParams() {
  return {
    pageNum: 1,
    pageSize: 10,
    siteCode: undefined,
    siteName: undefined,
    keyword: undefined,
    siteStatus: undefined
  }
}

function createRecordQueryParams(siteCode) {
  return {
    pageNum: 1,
    pageSize: 10,
    siteCode,
    keyword: undefined,
    direction: undefined
  }
}

function createSummary() {
  return {
    siteCount: 0,
    accountCount: 0,
    totalPrepaidBalance: 0,
    totalFrozenBalance: 0,
    totalFinanceAvailableBalance: 0,
    totalFundPoolBalance: 0,
    currency: 'CNY'
  }
}

export default {
  name: 'FundsPrepaidAccount',
  dicts: ['site_status'],
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      balanceList: [],
      summary: createSummary(),
      queryParams: createQueryParams(),
      recordOpen: false,
      recordLoading: false,
      recordTotal: 0,
      recordList: [],
      recordDateRange: [],
      recordQueryParams: createRecordQueryParams(undefined),
      currentAccount: {}
    }
  },
  computed: {
    summaryItems() {
      const currency = this.summary.currency || 'CNY'
      return [
        { key: 'siteCount', label: '站点数量', value: this.summary.siteCount || 0 },
        { key: 'accountCount', label: '已创建账户', value: this.summary.accountCount || 0 },
        { key: 'totalPrepaidBalance', label: '预付金可用余额', value: `${this.money(this.summary.totalPrepaidBalance)} ${currency}` },
        { key: 'totalFrozenBalance', label: '预付金冻结余额', value: `${this.money(this.summary.totalFrozenBalance)} ${currency}` },
        { key: 'totalFinanceAvailableBalance', label: '财务中心可用余额', value: `${this.money(this.summary.totalFinanceAvailableBalance)} ${currency}` },
        { key: 'totalFundPoolBalance', label: '资金池额度', value: `${this.money(this.summary.totalFundPoolBalance)} ${currency}` }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listPrepaidAccountBalances(this.buildListParams()).then(res => {
        this.balanceList = (res && res.rows) || []
        this.total = (res && res.total) || 0
      }).finally(() => {
        this.loading = false
      })
      this.loadSummary()
    },
    loadSummary() {
      getPrepaidAccountBalanceSummary(this.buildSummaryParams()).then(res => {
        this.summary = Object.assign(createSummary(), (res && res.data) || {})
      }).catch(() => {
        this.summary = createSummary()
      })
    },
    buildListParams() {
      return this.trimParams(this.queryParams)
    },
    buildSummaryParams() {
      const params = this.trimParams(this.queryParams)
      delete params.pageNum
      delete params.pageSize
      return params
    },
    trimParams(source) {
      const params = {}
      Object.keys(source).forEach(key => {
        const value = source[key]
        params[key] = typeof value === 'string' ? value.trim() : value
      })
      return params
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = createQueryParams()
      this.$nextTick(() => {
        this.resetForm('queryForm')
        this.handleQuery()
      })
    },
    openRecordDialog(row) {
      this.currentAccount = row || {}
      this.recordDateRange = []
      this.recordList = []
      this.recordTotal = 0
      this.recordQueryParams = createRecordQueryParams(row && row.siteCode)
      this.recordOpen = true
      this.getRecordList()
    },
    getRecordList() {
      if (!this.recordQueryParams.siteCode) {
        this.recordList = []
        this.recordTotal = 0
        return
      }
      this.recordLoading = true
      listPrepaidAccountRecords(this.buildRecordParams()).then(res => {
        this.recordList = (res && res.rows) || []
        this.recordTotal = (res && res.total) || 0
      }).finally(() => {
        this.recordLoading = false
      })
    },
    buildRecordParams() {
      const params = this.trimParams(this.recordQueryParams)
      if (Array.isArray(this.recordDateRange) && this.recordDateRange.length === 2) {
        params.beginTime = this.recordDateRange[0]
        params.endTime = this.recordDateRange[1]
      }
      return params
    },
    handleRecordQuery() {
      this.recordQueryParams.pageNum = 1
      this.getRecordList()
    },
    resetRecordQuery() {
      const siteCode = this.recordQueryParams.siteCode
      this.recordDateRange = []
      this.recordQueryParams = createRecordQueryParams(siteCode)
      this.getRecordList()
    },
    recordMoney(row) {
      const direction = row && row.direction
      const amount = Number((row && row.amount) || 0)
      if (direction === 'IN') {
        return `+${this.money(Math.abs(amount))}`
      }
      if (direction === 'OUT') {
        return `-${this.money(Math.abs(amount))}`
      }
      const prefix = amount > 0 ? '+' : ''
      return `${prefix}${this.money(amount)}`
    },
    recordAmountClass(row) {
      const direction = row && row.direction
      const amount = Number((row && row.amount) || 0)
      if (direction === 'IN' || amount > 0) {
        return 'money money--income'
      }
      if (direction === 'OUT' || amount < 0) {
        return 'money money--expense'
      }
      return 'money'
    },
    money(value) {
      const amount = Number(value || 0)
      if (!Number.isFinite(amount)) {
        return '0.00'
      }
      return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatTime(value) {
      return value ? this.parseTime(value) : '-'
    }
  }
}
</script>

<style scoped>
.prepaid-account-page {
  padding: 20px;
}

.query-form ::v-deep .el-input,
.query-form ::v-deep .el-select {
  width: 190px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.summary-item {
  min-width: 0;
  min-height: 62px;
  padding: 11px 14px;
  border: 1px solid #e4e7ed;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  background: #fff;
}

.summary-item span {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 13px;
}

.summary-item strong {
  display: block;
  overflow: hidden;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.money {
  font-weight: 600;
}

.money--primary {
  color: #409eff;
}

.money--warning {
  color: #e6a23c;
}

.money--income {
  color: #67c23a;
}

.money--expense {
  color: #f56c6c;
}

.record-account {
  display: grid;
  grid-template-columns: 1.3fr 1.7fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}

.record-account__item {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}

.record-account__item span {
  display: block;
  margin-bottom: 6px;
  color: #909399;
  font-size: 12px;
}

.record-account__item strong {
  display: block;
  overflow: hidden;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-filter {
  padding: 12px 12px 0;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.record-filter ::v-deep .el-input,
.record-filter ::v-deep .el-select {
  width: 180px;
}

.record-date-range {
  width: 360px !important;
}

::v-deep .record-dialog .el-dialog__body {
  padding-top: 12px;
}

@media (max-width: 1400px) {
  .summary-strip {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  .record-account {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }

  .record-account {
    grid-template-columns: 1fr;
  }

  .record-date-range {
    width: 100% !important;
  }
}
</style>
