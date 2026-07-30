<template>
  <div class="report-page app-container">
    <section class="filter-panel">
      <el-form :model="query" inline @submit.native.prevent>
        <el-form-item label="选择站点">
          <el-select v-model="query.site" clearable placeholder="全部站点">
            <el-option label="全部站点" value="" />
            <el-option v-for="item in siteOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="场馆名称">
          <el-select v-model="query.venue" clearable placeholder="全部场馆">
            <el-option label="全部场馆" value="" />
            <el-option v-for="item in venueOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="游戏名称">
          <el-input v-model.trim="query.game" clearable placeholder="搜索游戏名称..." />
        </el-form-item>
        <el-form-item label="会员名称/ID">
          <el-input v-model.trim="query.member" clearable placeholder="会员昵称、账号 ID" />
        </el-form-item>
        <el-form-item label="上级代理">
          <el-input v-model.trim="query.agent" clearable placeholder="代理商名称或ID..." />
        </el-form-item>
        <el-form-item label="风控标签">
          <el-select v-model="query.risk" clearable placeholder="全部风控标签">
            <el-option label="全部风控标签" value="" />
            <el-option label="无风险" value="无风险" />
            <el-option label="重点关注" value="重点关注" />
          </el-select>
        </el-form-item>
        <el-form-item label="货币种类">
          <el-select v-model="query.currency" clearable placeholder="全部币种">
            <el-option label="全部币种" value="" />
            <el-option label="CNY" value="CNY" />
            <el-option label="USDT" value="USDT" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围" class="date-filter">
          <el-date-picker
            v-model="query.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportReport">导出报表</el-button>
          <el-button icon="el-icon-folder-opened" disabled>下载文件</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="report-section">
      <div class="report-heading">
        <div>场馆游戏会员盈亏报表表单（共 {{ filteredRows.length }} 条记录）</div>
        <div class="report-heading__right">
          <el-button type="text" icon="el-icon-search" title="搜索" />
          <el-button type="text" icon="el-icon-refresh" title="刷新" @click="refreshData" />
          <span>最后更新时间：{{ lastUpdated }}</span>
        </div>
      </div>

      <el-table
        :data="pagedRows"
        border
        :header-cell-style="headerStyle"
        :summary-method="summaryMethod"
        show-summary
      >
        <el-table-column prop="period" label="时段" min-width="165" align="center" />
        <el-table-column prop="site" label="站点" min-width="100" align="center" sortable />
        <el-table-column prop="member" label="会员名称" min-width="120" align="center" sortable />
        <el-table-column prop="risk" label="风控标签" min-width="120" align="center">
          <template slot-scope="{ row }"><span class="risk-badge">{{ row.risk }}</span></template>
        </el-table-column>
        <el-table-column prop="memberId" label="会员ID" min-width="90" align="center" sortable />
        <el-table-column prop="vip" label="VIP等级" min-width="90" align="center" sortable>
          <template slot-scope="{ row }"><el-tag size="mini" type="warning">VIP {{ row.vip }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="agent" label="上级代理" min-width="115" align="center" sortable />
        <el-table-column prop="venue" label="场馆" min-width="120" align="center" sortable />
        <el-table-column prop="game" label="游戏名称" min-width="140" align="center" sortable />
        <el-table-column prop="orderCount" label="注单数" min-width="90" align="center" sortable />
        <el-table-column prop="betAmount" label="投注总额" min-width="140" align="right" sortable>
          <template slot-scope="{ row }">{{ formatAmount(row.betAmount) }}</template>
        </el-table-column>
        <el-table-column prop="profit" label="投注总盈亏" min-width="140" align="right" sortable>
          <template slot-scope="{ row }">
            <span :class="profitClass(row.profit)">{{ signedAmount(row.profit) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <span>共 {{ filteredRows.length }} 条</span>
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50]"
          :page-size.sync="pageSize"
          :current-page.sync="pageNum"
          :total="filteredRows.length"
        />
      </div>
    </section>
  </div>
</template>

<script>
const SITES = ['旺财体育', '财神体育', 'DW体育', '星河体育']
const VENUES = ['DW测试场馆', '旺财体育', '熊猫体育', 'IM体育', 'DB电子']
const GAMES = ['DW666测试', '体育滚球', '真人百家乐', '麻将胡了', '欢乐捕鱼']

function createRows() {
  return Array.from({ length: 50 }, (_, index) => {
    const id = 1844 + index
    const profit = index % 6 === 0 ? -(index * 10 + 50) : index % 5 === 0 ? 0 : index * 30 + 20
    return {
      id: index + 1,
      period: '2026-07-01 ~ 2026-07-29',
      site: SITES[index % SITES.length],
      member: `dw666s${String(index + 1).padStart(2, '0')}m0${index % 7}`,
      risk: index % 13 === 0 ? '重点关注' : '无风险',
      memberId: id,
      vip: index % 3,
      agent: `dw666s0${index % 5}${String.fromCharCode(97 + index % 4)}`,
      venue: VENUES[index % VENUES.length],
      game: GAMES[index % GAMES.length],
      orderCount: index % 9 + 1,
      betAmount: Number(((index % 8 + 1) * 500 + index * 19.78).toFixed(2)),
      profit: Number(profit.toFixed(2)),
      currency: index % 9 === 0 ? 'USDT' : 'CNY'
    }
  })
}

function defaultQuery() {
  return {
    site: '',
    venue: '',
    game: '',
    member: '',
    agent: '',
    risk: '',
    currency: '',
    dateRange: ['2026-07-01 00:00:00', '2026-07-29 23:13:04']
  }
}

export default {
  name: 'VenueGameMemberProfitReport',
  data() {
    return {
      siteOptions: SITES,
      venueOptions: VENUES,
      rows: createRows(),
      query: defaultQuery(),
      appliedQuery: defaultQuery(),
      pageNum: 1,
      pageSize: 10,
      lastUpdated: '2026-07-28 10:58:01'
    }
  },
  computed: {
    filteredRows() {
      const game = String(this.appliedQuery.game || '').toLowerCase()
      const member = String(this.appliedQuery.member || '').toLowerCase()
      const agent = String(this.appliedQuery.agent || '').toLowerCase()
      return this.rows.filter(row =>
        (!this.appliedQuery.site || row.site === this.appliedQuery.site) &&
        (!this.appliedQuery.venue || row.venue === this.appliedQuery.venue) &&
        (!game || row.game.toLowerCase().includes(game)) &&
        (!member || `${row.member}${row.memberId}`.toLowerCase().includes(member)) &&
        (!agent || row.agent.toLowerCase().includes(agent)) &&
        (!this.appliedQuery.risk || row.risk === this.appliedQuery.risk) &&
        (!this.appliedQuery.currency || row.currency === this.appliedQuery.currency)
      )
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    }
  },
  methods: {
    headerStyle() {
      return { background: '#f5f7fa', color: '#49566a', fontWeight: '600' }
    },
    handleQuery() {
      this.appliedQuery = { ...this.query, dateRange: [...(this.query.dateRange || [])] }
      this.pageNum = 1
    },
    resetQuery() {
      this.query = defaultQuery()
      this.appliedQuery = defaultQuery()
      this.pageNum = 1
    },
    exportReport() {
      this.$message.success('场馆游戏会员盈亏报表导出任务已生成')
    },
    refreshData() {
      this.lastUpdated = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      this.$message.success('数据刷新完成')
    },
    formatAmount(value) {
      return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    signedAmount(value) {
      const amount = Number(value || 0)
      if (!amount) return '0.00'
      return `${amount > 0 ? '+ ' : '- '}${this.formatAmount(Math.abs(amount))}`
    },
    profitClass(value) {
      if (Number(value) > 0) return 'profit-positive'
      if (Number(value) < 0) return 'profit-negative'
      return ''
    },
    summaryMethod({ columns }) {
      const totals = this.filteredRows.reduce((result, row) => {
        result.orderCount += row.orderCount
        result.betAmount += row.betAmount
        result.profit += row.profit
        return result
      }, { orderCount: 0, betAmount: 0, profit: 0 })
      return columns.map((column, index) => {
        if (index === 0) return '数据汇总计'
        if (column.property === 'betAmount') return this.formatAmount(totals.betAmount)
        if (column.property === 'profit') return this.signedAmount(totals.profit)
        return Object.prototype.hasOwnProperty.call(totals, column.property) ? totals[column.property] : ''
      })
    }
  }
}
</script>

<style scoped>
.report-page { min-height: calc(100vh - 84px); background: #fff; }
.filter-panel { padding: 14px 6px 4px; border-bottom: 1px solid #e5ebf3; }
.filter-panel .el-form { display: flex; flex-wrap: wrap; align-items: center; gap: 0 16px; }
.filter-panel .el-form-item { margin-right: 0; margin-bottom: 10px; }
.filter-panel .el-select, .filter-panel .el-input { width: 190px; }
.date-filter ::v-deep .el-date-editor { width: 360px; }
.report-section { padding-top: 34px; }
.report-heading, .report-heading__right, .pagination-row { display: flex; align-items: center; }
.report-heading { justify-content: space-between; margin-bottom: 10px; color: #606b7d; }
.report-heading__right { gap: 8px; font-size: 13px; }
.risk-badge { display: inline-block; padding: 1px 7px; border: 1px solid #d5dce6; border-radius: 3px; color: #8a95a5; font-size: 12px; }
.profit-positive { color: #00ad6d; font-weight: 600; }
.profit-negative { color: #ff4d5a; font-weight: 600; }
.pagination-row { justify-content: flex-end; gap: 12px; margin-top: 18px; color: #667085; }
::v-deep .el-table__footer-wrapper td { background: #f5f7fa; color: #596579; }
@media (max-width: 1440px) {
  .filter-panel .el-form { gap: 0 10px; }
  .filter-panel .el-select, .filter-panel .el-input { width: 170px; }
}
</style>
