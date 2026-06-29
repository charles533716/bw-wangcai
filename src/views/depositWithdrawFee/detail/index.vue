<template>
  <div class="app-container fee-detail-page">
    <section class="page-head">
      <div>
        <div class="page-title">充提手续费明细</div>
        <div class="page-desc">按每笔账号充提订单核对三方成本、站点报价、用户实收手续费和站点与会员差额</div>
      </div>
      <el-button icon="el-icon-download" type="primary" plain @click="handleExport">导出演示数据</el-button>
    </section>

    <section class="filter-panel">
      <el-form :model="queryParams" :inline="true" label-width="88px">
        <el-form-item label="交易时间">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            size="small"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="所属站点">
          <el-select v-model="queryParams.siteCode" clearable filterable size="small" placeholder="全部站点">
            <el-option v-for="site in siteOptions" :key="site.code" :label="site.label" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="queryParams.bizType" clearable size="small" placeholder="全部">
            <el-option label="充值" value="DEPOSIT" />
            <el-option label="提现" value="WITHDRAW" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道类型">
          <el-select v-model="queryParams.channelType" clearable size="small" placeholder="全部通道">
            <el-option v-for="item in channelTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道名称">
          <el-input v-model="queryParams.channelName" clearable size="small" placeholder="输入通道名称" />
        </el-form-item>
        <el-form-item label="账号名">
          <el-input v-model="queryParams.keyword" clearable size="small" placeholder="输入账号名" />
        </el-form-item>
        <el-form-item label="代理树">
          <el-cascader
            v-model="queryParams.agentTreeCode"
            :options="agentTreeOptions"
            :props="agentTreeProps"
            clearable
            filterable
            size="small"
            placeholder="选择代理及下级"
          />
        </el-form-item>
        <el-form-item label="上级代理">
          <el-input v-model="queryParams.parentAgent" clearable size="small" placeholder="输入上级代理" />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" clearable size="small" placeholder="输入订单号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="summary-grid">
      <div v-for="item in summaryCards" :key="item.label" class="summary-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value" :class="item.className">{{ item.value }}</div>
        <div class="summary-note">{{ item.note }}</div>
      </div>
    </section>

    <section class="table-panel">
      <div class="table-title">
        <span>手续费明细列表</span>
        <el-tag size="mini" effect="plain">共 {{ filteredRows.length }} 笔</el-tag>
      </div>
      <el-table
        :data="pagedRows"
        border
        stripe
        show-summary
        :summary-method="getSummaries"
        class="detail-table"
        empty-text="暂无手续费明细"
      >
        <el-table-column label="交易时间" prop="transactionTime" min-width="160" fixed />
        <el-table-column label="所属站点" min-width="150" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.siteName }}（{{ row.siteCode }}）</template>
        </el-table-column>
        <el-table-column label="业务类型" min-width="90" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.bizType === 'DEPOSIT' ? 'success' : 'warning'">{{ bizTypeText(row.bizType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单号" prop="orderNo" min-width="190" show-overflow-tooltip />
        <el-table-column label="账号类型" min-width="90" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="accountTypeTag(row.accountType)">{{ accountTypeText(row.accountType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号名" prop="accountName" min-width="120" />
        <el-table-column label="上级代理" prop="parentAgent" min-width="130" />
        <el-table-column label="通道类型" min-width="100">
          <template slot-scope="{ row }">{{ channelTypeText(row.channelType) }}</template>
        </el-table-column>
        <el-table-column label="通道名称" prop="channelName" min-width="140" show-overflow-tooltip />
        <el-table-column label="币种/协议" min-width="100" align="center">
          <template slot-scope="{ row }">{{ row.currency }}{{ row.protocol ? ` / ${row.protocol}` : '' }}</template>
        </el-table-column>
        <el-table-column label="充值/提现账号" prop="transactionAccount" min-width="180" show-overflow-tooltip />
        <el-table-column label="交易金额" prop="amount" min-width="120" align="right">
          <template slot-scope="{ row }">{{ money(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="三方费率" prop="thirdRateText" min-width="110" align="center" />
        <el-table-column label="三方手续费" prop="thirdFee" min-width="120" align="right">
          <template slot-scope="{ row }">{{ money(row.thirdFee) }}</template>
        </el-table-column>
        <el-table-column label="站点报价费率" prop="siteRateText" min-width="130" align="center" />
        <el-table-column label="站点报价手续费" prop="siteQuoteFee" min-width="140" align="right">
          <template slot-scope="{ row }">{{ money(row.siteQuoteFee) }}</template>
        </el-table-column>
        <el-table-column label="用户实收费率" prop="memberRateText" min-width="130" align="center" />
        <el-table-column label="用户实收手续费" prop="memberFee" min-width="140" align="right">
          <template slot-scope="{ row }">{{ money(row.memberFee) }}</template>
        </el-table-column>
        <el-table-column label="站点与会员差额" prop="siteMemberDiff" min-width="140" align="right">
          <template slot-scope="{ row }">
            <span :class="row.siteMemberDiff >= 0 ? 'amount-profit' : 'amount-loss'">{{ money(row.siteMemberDiff) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费用状态" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.status === 'SETTLED' ? 'success' : 'info'">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      </el-table>
      <pagination
        v-show="filteredRows.length > 0"
        :total="filteredRows.length"
        :page.sync="pagination.pageNum"
        :limit.sync="pagination.pageSize"
      />
    </section>
  </div>
</template>

<script>
const CHANNEL_TYPE_OPTIONS = [
  { label: '银行卡', value: 'BANK' },
  { label: 'USDT', value: 'USDT' },
  { label: '三方支付', value: 'THIRD' }
]

const AGENT_TREE_OPTIONS = [
  {
    label: 'agent001 总代',
    value: 'agent001',
    children: [
      { label: 'agent001-1 一级代理', value: 'agent001-1' },
      { label: 'agent001-2 一级代理', value: 'agent001-2' }
    ]
  },
  {
    label: 'agent002 总代',
    value: 'agent002',
    children: [
      { label: 'agent002-1 一级代理', value: 'agent002-1' }
    ]
  },
  {
    label: 'agent003 总代',
    value: 'agent003',
    children: [
      { label: 'agent003-1 一级代理', value: 'agent003-1' }
    ]
  },
  { label: 'agent004 总代', value: 'agent004' }
]

const DETAIL_ROWS = [
  row('2026-06-25 10:22:16', '2222', '演示总站', 'DEPOSIT', 'FEE202606250001', 'MEMBER', 'member001', 'agent001', 'THIRD', '快付通道A', 'CNY', '', 'alipay_138****1001', 2000, '0.60%', 12, '0.85%', 17, '1.00%', 20, 'SETTLED', '充值成功，按三方比例费率结算'),
  row('2026-06-25 09:18:43', 'SITE001', '旺财总站', 'WITHDRAW', 'FEE202606250002', 'MEMBER', 'member002', 'agent001-1', 'BANK', '银行代付A', 'CNY', '', '6222 **** **** 1024', 1500, '固定 ¥3.00', 3, '固定 ¥5.00', 5, '固定 ¥6.00', 6, 'SETTLED', '提现成功，按固定手续费核对'),
  row('2026-06-24 21:03:08', 'SITE002', '星河体育', 'DEPOSIT', 'FEE202606240003', 'MEMBER', 'member003', 'agent002', 'USDT', 'USDT-TRC20', 'USDT', 'TRC20', 'TXLAQ63Xgt1NAzckPwK...', 6800, '0.35%', 23.8, '0.55%', 37.4, '0.70%', 47.6, 'PENDING', 'USDT 充值，待站点侧日结'),
  row('2026-06-24 15:47:39', 'SITE003', '蓝海娱乐', 'DEPOSIT', 'FEE202606240004', 'MEMBER', 'member004', 'agent003', 'THIRD', '扫码通道B', 'CNY', '', 'wechat_wx_6204', 520, '最低 ¥1.00', 1, '0.80%', 4.16, '1.00%', 5.2, 'SETTLED', '小额充值触发三方最低手续费'),
  row('2026-06-23 18:10:25', '2222', '演示总站', 'WITHDRAW', 'FEE202606230005', 'AGENT', 'agent004', 'agent004', 'USDT', 'USDT-ERC20', 'USDT', 'ERC20', '0xdAC17F958D2ee523...', 3200, '0.50%', 16, '0.75%', 24, '1.00%', 32, 'SETTLED', 'USDT 提现，按比例手续费核对'),
  row('2026-06-23 12:36:58', 'SITE001', '旺财总站', 'DEPOSIT', 'FEE202606230006', 'MEMBER', 'member006', 'agent001-2', 'BANK', '网银通道C', 'CNY', '', '6228 **** **** 6699', 12000, '0.40%', 48, '0.65%', 78, '0.80%', 96, 'SETTLED', '大额网银充值'),
  row('2026-06-22 20:44:01', 'SITE002', '星河体育', 'WITHDRAW', 'FEE202606220007', 'MEMBER', 'member007', 'agent002-1', 'BANK', '银行代付B', 'CNY', '', '6217 **** **** 0831', 880, '固定 ¥2.00', 2, '固定 ¥4.00', 4, '固定 ¥4.00', 4, 'PENDING', '提现待三方回执'),
  row('2026-06-22 11:25:30', 'SITE003', '蓝海娱乐', 'DEPOSIT', 'FEE202606220008', 'MEMBER', 'member008', 'agent003-1', 'THIRD', '云闪付通道', 'CNY', '', 'unionpay_136****2208', 3500, '0.55%', 19.25, '0.75%', 26.25, '0.90%', 31.5, 'SETTLED', '云闪付充值成功'),
  row('2026-06-21 16:05:12', '2222', '演示总站', 'DEPOSIT', 'FEE202606210009', 'SITE', '2222', 'agent004', 'USDT', 'USDT-TRC20', 'USDT', 'TRC20', 'TPrototypeDepositAddress', 9600, '0.35%', 33.6, '0.55%', 52.8, '0.70%', 67.2, 'SETTLED', '站点钱包充值演示'),
  row('2026-06-20 08:58:54', 'SITE001', '旺财总站', 'WITHDRAW', 'FEE202606200010', 'MEMBER', 'member010', 'agent001', 'THIRD', '代付通道C', 'CNY', '', 'alipay_137****5010', 4600, '0.45%', 20.7, '0.70%', 32.2, '0.85%', 39.1, 'SETTLED', '提现成功，比例费率')
]

function row(transactionTime, siteCode, siteName, bizType, orderNo, accountType, accountName, parentAgent, channelType, channelName, currency, protocol, transactionAccount, amount, thirdRateText, thirdFee, siteRateText, siteQuoteFee, memberRateText, memberFee, status, remark) {
  return {
    transactionTime,
    siteCode,
    siteName,
    bizType,
    orderNo,
    accountType,
    accountName,
    parentAgent,
    channelType,
    channelName,
    currency,
    protocol,
    transactionAccount,
    amount,
    thirdRateText,
    thirdFee,
    siteRateText,
    siteQuoteFee,
    memberRateText,
    memberFee,
    siteMemberDiff: Number((memberFee - siteQuoteFee).toFixed(2)),
    status,
    remark
  }
}

export default {
  name: 'DepositWithdrawFeeDetail',
  data() {
    return {
      queryParams: this.defaultQuery(),
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      channelTypeOptions: CHANNEL_TYPE_OPTIONS,
      agentTreeOptions: AGENT_TREE_OPTIONS,
      agentTreeProps: {
        checkStrictly: true,
        emitPath: false
      }
    }
  },
  computed: {
    siteOptions() {
      const map = new Map()
      DETAIL_ROWS.forEach(item => map.set(item.siteCode, `${item.siteName}（${item.siteCode}）`))
      return Array.from(map).map(([code, label]) => ({ code, label }))
    },
    filteredRows() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      return DETAIL_ROWS.filter(row => {
        const txDate = row.transactionTime.slice(0, 10)
        if (startDate && txDate < startDate) return false
        if (endDate && txDate > endDate) return false
        if (this.queryParams.siteCode && row.siteCode !== this.queryParams.siteCode) return false
        if (this.queryParams.bizType && row.bizType !== this.queryParams.bizType) return false
        if (this.queryParams.channelType && row.channelType !== this.queryParams.channelType) return false
        if (this.queryParams.channelName && !row.channelName.includes(this.queryParams.channelName)) return false
        if (this.queryParams.orderNo && !row.orderNo.includes(this.queryParams.orderNo)) return false
        if (this.queryParams.agentTreeCode) {
          const scope = this.getAgentScopeCodes(this.queryParams.agentTreeCode)
          if (!scope.includes(row.parentAgent)) return false
        }
        if (this.queryParams.parentAgent && !row.parentAgent.includes(this.queryParams.parentAgent)) return false
        const keyword = String(this.queryParams.keyword || '').toLowerCase()
        if (keyword) {
          const text = `${row.accountName}`.toLowerCase()
          if (!text.includes(keyword)) return false
        }
        return true
      })
    },
    pagedRows() {
      const start = (this.pagination.pageNum - 1) * this.pagination.pageSize
      return this.filteredRows.slice(start, start + this.pagination.pageSize)
    },
    summary() {
      return this.filteredRows.reduce((acc, row) => {
        acc.count += 1
        acc.amount += row.amount
        acc.thirdFee += row.thirdFee
        acc.siteQuoteFee += row.siteQuoteFee
        acc.memberFee += row.memberFee
        acc.siteMemberDiff += row.siteMemberDiff
        return acc
      }, { count: 0, amount: 0, thirdFee: 0, siteQuoteFee: 0, memberFee: 0, siteMemberDiff: 0 })
    },
    summaryCards() {
      return [
        { label: '交易笔数', value: `${this.summary.count} 笔`, note: '当前筛选范围' },
        { label: '交易金额总计', value: this.money(this.summary.amount), note: '充值与提现金额合计' },
        { label: '三方手续费总计', value: this.money(this.summary.thirdFee), note: '平台支付给通道的成本' },
        { label: '站点报价手续费', value: this.money(this.summary.siteQuoteFee), note: '给站点的报价口径' },
        { label: '用户实收手续费', value: this.money(this.summary.memberFee), note: '会员实际承担费用' },
        { label: '站点与会员差额', value: this.money(this.summary.siteMemberDiff), note: '用户实收 - 站点报价', className: this.summary.siteMemberDiff >= 0 ? 'amount-profit' : 'amount-loss' }
      ]
    }
  },
  methods: {
    defaultQuery() {
      return {
        dateRange: ['2026-06-19', '2026-06-25'],
        siteCode: '',
        bizType: '',
        channelType: '',
        channelName: '',
        keyword: '',
        agentTreeCode: '',
        parentAgent: '',
        orderNo: ''
      }
    },
    handleQuery() {
      this.pagination.pageNum = 1
    },
    handleReset() {
      this.queryParams = this.defaultQuery()
      this.pagination.pageNum = 1
    },
    handleExport() {
      const header = ['交易时间', '所属站点', '业务类型', '订单号', '账号类型', '账号名', '上级代理', '通道类型', '通道名称', '币种/协议', '充值/提现账号', '交易金额', '三方费率', '三方手续费', '站点报价费率', '站点报价手续费', '用户实收费率', '用户实收手续费', '站点与会员差额', '费用状态', '备注']
      const lines = [header.join(',')].concat(this.filteredRows.map(item => [
        item.transactionTime,
        `${item.siteName}（${item.siteCode}）`,
        this.bizTypeText(item.bizType),
        item.orderNo,
        this.accountTypeText(item.accountType),
        item.accountName,
        item.parentAgent,
        this.channelTypeText(item.channelType),
        item.channelName,
        `${item.currency}${item.protocol ? `/${item.protocol}` : ''}`,
        item.transactionAccount,
        this.money(item.amount),
        item.thirdRateText,
        this.money(item.thirdFee),
        item.siteRateText,
        this.money(item.siteQuoteFee),
        item.memberRateText,
        this.money(item.memberFee),
        this.money(item.siteMemberDiff),
        this.statusText(item.status),
        item.remark
      ].map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')))
      const blob = new Blob([`\ufeff${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
      this.$download.saveAs(blob, `充提手续费明细_${Date.now()}.csv`)
    },
    getAgentScopeCodes(agentCode) {
      const node = this.findAgentNode(AGENT_TREE_OPTIONS, agentCode)
      if (!node) return [agentCode]
      const result = [node.value]
      if (node.children) this.collectAgentChildren(node.children, result)
      return result
    },
    findAgentNode(nodes, agentCode) {
      for (const node of nodes) {
        if (node.value === agentCode) return node
        if (node.children) {
          const matched = this.findAgentNode(node.children, agentCode)
          if (matched) return matched
        }
      }
      return null
    },
    collectAgentChildren(nodes, result) {
      nodes.forEach(node => {
        result.push(node.value)
        if (node.children) {
          this.collectAgentChildren(node.children, result)
        }
      })
    },
    getSummaries({ columns }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '全部数据总计'
          return
        }
        if (['amount', 'thirdFee', 'siteQuoteFee', 'memberFee', 'siteMemberDiff'].includes(column.property)) {
          const total = this.filteredRows.reduce((sum, row) => sum + Number(row[column.property] || 0), 0)
          sums[index] = this.money(total)
        } else {
          sums[index] = ''
        }
      })
      return sums
    },
    bizTypeText(value) {
      return value === 'WITHDRAW' ? '提现' : '充值'
    },
    channelTypeText(value) {
      const item = CHANNEL_TYPE_OPTIONS.find(option => option.value === value)
      return item ? item.label : value
    },
    accountTypeText(value) {
      const map = {
        SITE: '站点',
        AGENT: '代理',
        MEMBER: '会员'
      }
      return map[value] || value
    },
    accountTypeTag(value) {
      const map = {
        SITE: 'warning',
        AGENT: 'primary',
        MEMBER: 'success'
      }
      return map[value] || 'info'
    },
    statusText(value) {
      return value === 'SETTLED' ? '已入账' : '待结算'
    },
    money(value) {
      const amount = Number(value) || 0
      return `¥${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }
}
</script>

<style scoped>
.fee-detail-page {
  min-height: calc(100vh - 84px);
  padding: 18px 22px 28px;
  background: #f5f8fc;
}

.page-head,
.filter-panel,
.table-panel {
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(31, 48, 75, 0.06);
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 20px 24px;
}

.page-title {
  color: #14233b;
  font-size: 20px;
  font-weight: 800;
}

.page-desc {
  margin-top: 6px;
  color: #60708a;
  font-size: 13px;
  font-weight: 600;
}

.filter-panel {
  margin-bottom: 14px;
  padding: 18px 18px 2px;
}

.filter-panel ::v-deep .el-form-item {
  margin-right: 12px;
  margin-bottom: 16px;
}

.filter-panel ::v-deep .el-input,
.filter-panel ::v-deep .el-select {
  width: 180px;
}

.filter-panel ::v-deep .el-cascader {
  width: 180px;
}

.filter-panel ::v-deep .el-date-editor {
  width: 260px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card {
  min-height: 104px;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
}

.summary-label {
  color: #667891;
  font-size: 12px;
  font-weight: 700;
}

.summary-value {
  margin-top: 10px;
  color: #14233b;
  font-size: 22px;
  font-weight: 800;
}

.summary-note {
  margin-top: 8px;
  color: #8a99ad;
  font-size: 12px;
}

.amount-profit {
  color: #00a676;
}

.amount-loss {
  color: #e24a4a;
}

.table-panel {
  overflow: hidden;
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  color: #1f2f46;
  font-size: 16px;
  font-weight: 800;
}

.detail-table {
  width: 100%;
}

.detail-table ::v-deep th {
  background: #f6f9fd;
  color: #637895;
  font-size: 12px;
  font-weight: 800;
}

.detail-table ::v-deep td {
  color: #26384f;
  font-weight: 700;
}

@media (max-width: 1400px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .page-head {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
