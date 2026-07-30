<template>
  <div class="venue-report-page app-container">
    <section class="filter-panel">
      <el-form :model="query" inline @submit.native.prevent>
        <el-form-item label="场馆名称">
          <el-select v-model="query.venue" clearable placeholder="全部场馆">
            <el-option label="全部场馆" value="" />
            <el-option v-for="item in venueOptions" :key="item" :label="item" :value="item" />
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
        <div>场馆报表表单（共 {{ filteredRows.length }} 条记录）</div>
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
        <el-table-column prop="period" label="时段" min-width="190" align="center" />
        <el-table-column prop="bettorCount" label="投注人数" min-width="110" align="center" sortable />
        <el-table-column prop="gameCount" label="游戏数量" min-width="110" align="center" sortable />
        <el-table-column prop="venue" label="场馆" min-width="130" align="center" sortable>
          <template slot-scope="{ row }">
            <span class="venue-badge">{{ row.venue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="注单数" min-width="110" align="center" sortable />
        <el-table-column prop="betAmount" label="投注总额" min-width="170" align="right" sortable>
          <template slot-scope="{ row }">{{ formatAmount(row.betAmount) }}</template>
        </el-table-column>
        <el-table-column prop="profit" label="投注总盈亏" min-width="170" align="right" sortable>
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
const VENUES = [
  '旺财体育', '熊猫体育', 'IM体育', '旺财真人', 'WM真人', '旺财彩票',
  '旺财棋牌', 'DB棋牌', '博雅棋牌', '旺财电竞', 'DB电竞', 'IM电竞',
  '旺财电子', 'DB电子', 'PG电子', '财神体育', '财神真人', 'TC彩票', '高登棋牌'
]

function createRows() {
  const betAmounts = [
    1261416.60, 1542360, 7259698.14, 8100, 21506.81, 300, 32720843,
    81210622.20, 500, 85, 482160.55, 975250.25, 641300, 2250600,
    310050.8, 886420.4, 1260080, 735900.5, 451280.75
  ]
  const profits = [
    473238.64, 600044.02, 1107562.86, 0, 189.04, 89, 868809.36,
    1100574.03, -600, 75.20, 86210.36, 115200.80, -18320.15, 335600.25,
    49080.60, 120540.33, 250300.75, -2550.40, 68020.10
  ]
  return VENUES.map((venue, index) => ({
    id: index + 1,
    period: '2026-07-01 ~ 2026-07-29',
    bettorCount: [3, 0, 1, 10, 1, 0, 0, 0, 1, 0, 2, 4, 3, 1, 2, 1, 0, 1, 1][index],
    gameCount: [7, 3, 20, 1, 28, 1, 59, 61, 1, 6, 12, 18, 9, 15, 8, 11, 5, 10, 6][index],
    venue,
    orderCount: [1162, 48, 536, 10, 2032, 30, 93371, 43728, 1, 13, 3580, 7260, 2150, 6020, 987, 1890, 3200, 1450, 880][index],
    betAmount: betAmounts[index],
    profit: profits[index],
    currency: index % 6 === 0 ? 'USDT' : 'CNY'
  }))
}

function defaultQuery() {
  return {
    venue: '',
    currency: '',
    dateRange: ['2026-07-01 00:00:00', '2026-07-29 23:00:01']
  }
}

export default {
  name: 'VenueSummaryReport',
  data() {
    return {
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
      return this.rows.filter(row =>
        (!this.appliedQuery.venue || row.venue === this.appliedQuery.venue) &&
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
      this.$message.success('场馆报表导出任务已生成')
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
        result.bettorCount += row.bettorCount
        result.gameCount += row.gameCount
        result.orderCount += row.orderCount
        result.betAmount += row.betAmount
        result.profit += row.profit
        return result
      }, { bettorCount: 0, gameCount: 0, orderCount: 0, betAmount: 0, profit: 0 })
      return columns.map((column, index) => {
        if (index === 0) return '数据汇总计'
        if (column.property === 'venue') return ''
        if (column.property === 'betAmount') return this.formatAmount(totals.betAmount)
        if (column.property === 'profit') return this.signedAmount(totals.profit)
        return Object.prototype.hasOwnProperty.call(totals, column.property) ? totals[column.property] : ''
      })
    }
  }
}
</script>

<style scoped>
.venue-report-page {
  min-height: calc(100vh - 84px);
  background: #fff;
}

.filter-panel {
  padding: 14px 6px 4px;
  border-bottom: 1px solid #e5ebf3;
}

.filter-panel .el-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 20px;
}

.filter-panel .el-form-item {
  margin-right: 0;
  margin-bottom: 10px;
}

.filter-panel .el-select {
  width: 190px;
}

.date-filter ::v-deep .el-date-editor {
  width: 360px;
}

.filter-actions {
  margin-left: 0;
}

.report-section {
  padding-top: 34px;
}

.report-heading,
.report-heading__right,
.pagination-row {
  display: flex;
  align-items: center;
}

.report-heading {
  justify-content: space-between;
  margin-bottom: 10px;
  color: #606b7d;
}

.report-heading__right {
  gap: 8px;
  font-size: 12px;
}

.report-heading__right .el-button {
  margin: 0;
  color: #8c9bb0;
}

.venue-badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #d8dee8;
  border-radius: 4px;
  color: #7a8494;
  font-size: 12px;
}

.profit-positive {
  color: #00aa71;
  font-weight: 600;
}

.profit-negative {
  color: #ff525d;
  font-weight: 600;
}

.pagination-row {
  justify-content: flex-end;
  gap: 16px;
  padding-top: 18px;
  color: #66758a;
}
</style>
