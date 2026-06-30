<template>
  <div class="app-container agent-earning-board-page">
    <div class="page-head">
      <div>
        <h2>代理收益看板</h2>
        <p>按代理维度汇总代理后台首页核心经营指标，帮助总控对比不同站点和上级代理下的收益表现。</p>
      </div>
      <el-button type="warning" icon="el-icon-download" @click="handleExport">导出数据</el-button>
    </div>

    <el-form :inline="true" :model="filters" label-width="86px" class="earning-filter">
      <el-form-item label="所属站点">
        <el-select v-model="filters.siteFilter" clearable filterable placeholder="全部站点" style="width: 180px">
          <el-option
            v-for="item in siteOptions"
            :key="item.siteCode"
            :label="item.siteName"
            :value="item.siteCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="代理账号">
        <el-input
          v-model.trim="filters.agentKeyword"
          clearable
          placeholder="账号/名称"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="查询时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="board-summary">
      <el-tag type="info">演示数据</el-tag>
      <span>当前共 {{ count(total) }} 条代理收益记录，指标用于总控查看代理经营表现和上下级代理关系。</span>
    </div>

    <el-table :data="pagedRows" border stripe class="earning-table">
      <el-table-column label="所属站点" prop="siteName" min-width="130" fixed show-overflow-tooltip />
      <el-table-column label="代理编号" prop="agentCode" min-width="110" fixed />
      <el-table-column label="代理账号" prop="agentName" min-width="130" fixed show-overflow-tooltip />
      <el-table-column label="上级代理" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.parentAgentCode === '-' ? '无上级代理' : scope.row.parentAgentCode + ' / ' + scope.row.parentAgentName }}
        </template>
      </el-table-column>
      <el-table-column
        v-for="column in earningColumns"
        :key="column.prop"
        :label="column.label"
        :min-width="column.width"
        align="right"
      >
        <template slot-scope="scope">
          <span :class="{ 'is-negative': column.signed && Number(scope.row[column.prop]) < 0 }">
            {{ formatCell(scope.row, column) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="账期范围" min-width="190" align="center">
        <template slot-scope="scope">
          {{ formatAccountPeriod(scope.row) }}
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pager.pageNum"
      :limit.sync="pager.pageSize"
      @pagination="loadRows"
    />
  </div>
</template>

<script>
import {
  formatMoney,
  getAdvanceSiteOptions,
  listAgentEarningRows
} from '@/utils/agentAdvance'

const formatDate = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getRecentSevenDayRange = () => {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  return [formatDate(start), formatDate(end)]
}

export default {
  name: 'AgentEarningBoardPage',
  data() {
    return {
      rows: [],
      dateRange: getRecentSevenDayRange(),
      filters: {
        siteFilter: '',
        agentKeyword: ''
      },
      pager: {
        pageNum: 1,
        pageSize: 10
      },
      siteOptions: getAdvanceSiteOptions(),
      earningColumns: [
        { prop: 'estimatedCommissionNetProfit', label: '本期佣金预估净收益', type: 'money', width: 170 },
        { prop: 'currentBalance', label: '当前余额', type: 'money', width: 130 },
        { prop: 'totalPromotionCommission', label: '总推广佣金', type: 'money', width: 140 },
        { prop: 'settledCommission', label: '已结算佣金', type: 'money', width: 140 },
        { prop: 'totalRecharge', label: '总充值', type: 'money', width: 130 },
        { prop: 'totalWithdraw', label: '总提现', type: 'money', width: 130 },
        { prop: 'totalBet', label: '总投注', type: 'money', width: 130 },
        { prop: 'validBet', label: '有效投注', type: 'money', width: 130 },
        { prop: 'totalWinLoss', label: '总盈亏', type: 'money', signed: true, width: 130 },
        { prop: 'agentDebtAmount', label: '该代理欠款', type: 'money', width: 140 },
        { prop: 'unrecoveredDebtAmount', label: '未收回欠款', type: 'money', width: 140 },
        { prop: 'vipBenefit', label: '会员VIP福利', type: 'money', width: 140 },
        { prop: 'activityBenefit', label: '活动福利', type: 'money', width: 130 },
        { prop: 'memberPromotionCommission', label: '会员推广福利', type: 'money', width: 150 },
        { prop: 'depositFee', label: '充提手续运营费', type: 'money', width: 150 },
        { prop: 'totalAgents', label: '代理总人数', type: 'count', width: 120 },
        { prop: 'newAgentsMonthly', label: '新增代理', type: 'count', width: 110 },
        { prop: 'activeAgents', label: '活跃代理', type: 'count', width: 110 },
        { prop: 'totalMembers', label: '会员总数', type: 'count', width: 110 },
        { prop: 'newMembersMonthly', label: '新增会员', type: 'count', width: 110 },
        { prop: 'activeMembers', label: '活跃会员', type: 'count', width: 110 },
        { prop: 'paidMembers', label: '付费会员', type: 'count', width: 110 },
        { prop: 'newPaidMembersMonthly', label: '新增付费', type: 'count', width: 110 },
        { prop: 'agentPromotedMembers', label: '代理推广会员', type: 'count', width: 140 },
        { prop: 'memberPromotedMembers', label: '会员推广会员', type: 'count', width: 140 },
        { prop: 'lostMembersMonthly', label: '30天未登录会员数', type: 'count', width: 160 }
      ]
    }
  },
  computed: {
    total() {
      return this.rows.length
    },
    pagedRows() {
      const start = (this.pager.pageNum - 1) * this.pager.pageSize
      return this.rows.slice(start, start + this.pager.pageSize)
    }
  },
  created() {
    this.loadRows()
  },
  methods: {
    buildParams() {
      return {
        ...this.filters,
        scope: 'master'
      }
    },
    loadRows() {
      this.rows = listAgentEarningRows(this.buildParams())
    },
    handleQuery() {
      this.pager.pageNum = 1
      this.loadRows()
    },
    handleReset() {
      this.filters = {
        siteFilter: '',
        agentKeyword: ''
      }
      this.dateRange = getRecentSevenDayRange()
      this.pager.pageNum = 1
      this.loadRows()
    },
    money(value) {
      return formatMoney(value)
    },
    count(value) {
      return Number(value || 0).toLocaleString('zh-CN')
    },
    formatCell(row, column) {
      const value = row[column.prop]
      if (column.type === 'count') {
        return this.count(value)
      }
      return this.money(value)
    },
    getAccountPeriodRange() {
      if (!Array.isArray(this.dateRange) || this.dateRange.length < 2 || !this.dateRange[0] || !this.dateRange[1]) {
        return '-'
      }
      return `${this.dateRange[0]} 至 ${this.dateRange[1]}`
    },
    formatAccountPeriod() {
      return this.getAccountPeriodRange()
    },
    handleExport() {
      const headers = [
        '所属站点',
        '代理编号',
        '代理账号',
        '上级代理',
        ...this.earningColumns.map(column => column.label),
        '账期范围'
      ]
      const lines = [headers.join(',')].concat(this.rows.map(row => [
        row.siteName,
        row.agentCode,
        row.agentName,
        row.parentAgentCode === '-' ? '无上级代理' : `${row.parentAgentCode} / ${row.parentAgentName}`,
        ...this.earningColumns.map(column => this.formatCell(row, column)),
        this.formatAccountPeriod(row)
      ].map(item => `"${String(item || '').replace(/"/g, '""')}"`).join(',')))
      const blob = new Blob([`\ufeff${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `agent_earning_board_${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      this.$message.success('代理收益看板演示数据已导出')
    }
  }
}
</script>

<style scoped>
.agent-earning-board-page {
  background: #fff;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 18px 20px;
  border: 1px solid #e7edf5;
  border-radius: 6px;
  background: #f8fbff;
}

.page-head h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2d3d;
}

.page-head p {
  margin: 8px 0 0;
  color: #606f89;
  line-height: 1.6;
}

.earning-filter {
  margin-bottom: 8px;
}

.board-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0 14px;
  color: #606f89;
  line-height: 1.6;
}

.earning-table {
  width: 100%;
}

.is-negative {
  color: #f56c6c;
}
</style>
