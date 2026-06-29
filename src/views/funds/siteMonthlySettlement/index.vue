<template>
  <div class="app-container venue-monthly-page">
    <header class="report-head">
      <div class="report-head__main">
        <div class="title-line">
          <span class="title-mark"></span>
          <h2>三方场馆站点月结费用</h2>
          <el-tag size="small" type="primary" effect="plain">结算报表</el-tag>
        </div>
        <p>统计各加盟场馆及子站点的盈亏、比例分账和最终的对站三方场馆收益。数据可多维度筛选及归并。</p>
      </div>
      <el-button
        type="primary"
        icon="el-icon-download"
        class="export-btn"
        :loading="exportLoading"
        @click="handleExport"
      >
        导出报表
      </el-button>
    </header>

    <section class="filter-card">
      <div class="filter-card__head">
        <div class="filter-title">
          <i class="el-icon-s-operation"></i>
          <span>报表精准筛选项</span>
        </div>
        <el-button type="text" icon="el-icon-refresh" @click="handleReset">重置筛选条件</el-button>
      </div>

      <div class="filter-grid">
        <div class="filter-item filter-item--range">
          <label>跨月份选择</label>
          <div class="month-range">
            <el-date-picker
              v-model="query.startMonth"
              type="month"
              value-format="yyyy-MM"
              format="yyyy年MM月"
              placeholder="开始月份"
              class="month-picker"
            />
            <span class="range-arrow">→</span>
            <el-date-picker
              v-model="query.endMonth"
              type="month"
              value-format="yyyy-MM"
              format="yyyy年MM月"
              placeholder="结束月份"
              class="month-picker"
            />
          </div>
        </div>
        <div class="filter-item">
          <label>检索关键词</label>
          <el-input
            v-model.trim="query.keyword"
            clearable
            prefix-icon="el-icon-search"
            placeholder="搜索站点名称/场馆..."
          />
        </div>
        <div class="filter-item">
          <label>站点名称</label>
          <el-select v-model="query.siteCode" filterable placeholder="全部站点名称">
            <el-option label="全部站点名称" value="" />
            <el-option
              v-for="site in siteOptions"
              :key="site.code"
              :label="site.name"
              :value="site.code"
            />
          </el-select>
        </div>
      </div>
    </section>

    <section class="report-table-wrap">
      <table class="venue-report-table">
        <thead>
          <tr>
            <th rowspan="2" class="w-date">日期</th>
            <th rowspan="2" class="w-site">站点名称</th>
            <th colspan="4">对站点场馆费用明细</th>
            <th rowspan="2" class="w-summary">三方场馆收益汇总</th>
          </tr>
          <tr>
            <th>场馆名称</th>
            <th>会员总盈亏</th>
            <th>对应费用比例</th>
            <th>产生费用</th>
          </tr>
        </thead>
        <tbody v-if="filteredGroups.length">
          <template v-for="group in filteredGroups">
            <tr v-for="(item, index) in group.items" :key="group.groupKey + '-' + item.venueName + '-' + index">
              <td v-if="index === 0" :rowspan="group.items.length" class="merge-cell month-cell">
                {{ formatMonth(group.month) }}
              </td>
              <td v-if="index === 0" :rowspan="group.items.length" class="merge-cell site-cell">
                <i class="el-icon-office-building"></i>
                <span>{{ group.siteName }}</span>
              </td>
              <td class="venue-name">{{ item.venueName }}</td>
              <td class="number-cell">
                <span :class="amountClass(item.winLoss)">{{ formatSignedMoney(item.winLoss) }}</span>
              </td>
              <td class="rate-cell">{{ item.feeRate }}%</td>
              <td class="number-cell">
                <span :class="amountClass(item.feeAmount)">{{ formatSignedMoney(item.feeAmount) }}</span>
              </td>
              <td v-if="index === 0" :rowspan="group.items.length" class="merge-cell summary-cell">
                <strong :class="amountClass(group.totalFee)">{{ formatSignedMoney(group.totalFee) }}</strong>
              </td>
            </tr>
          </template>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="7" class="empty-cell">暂无符合条件的三方场馆月结费用</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
const siteOptions = [
  { code: 'WANGCAI', name: '旺财' },
  { code: 'DW', name: 'DW' },
  { code: 'NEXUS', name: 'NEXUS' }
]

const baseGroups = [
  {
    month: '2026-06',
    siteCode: 'WANGCAI',
    siteName: '旺财',
    items: [
      { venueName: '电子', winLoss: -156860, feeRate: 12 },
      { venueName: '体育', winLoss: -760, feeRate: 15 },
      { venueName: '棋牌', winLoss: 6700, feeRate: 15, feeAmount: 0 },
      { venueName: '电竞', winLoss: -156860, feeRate: 15 },
      { venueName: '哈希', winLoss: -156860, feeRate: 15 },
      { venueName: '电子', winLoss: -156860, feeRate: 15 }
    ]
  },
  {
    month: '2026-05',
    siteCode: 'WANGCAI',
    siteName: '旺财',
    items: [
      { venueName: '电子', winLoss: -156860, feeRate: 12 },
      { venueName: '体育', winLoss: -760, feeRate: 15 },
      { venueName: '棋牌', winLoss: 6700, feeRate: 15, feeAmount: 0 },
      { venueName: '电竞', winLoss: -156860, feeRate: 15 },
      { venueName: '哈希', winLoss: -156860, feeRate: 15 },
      { venueName: '电子', winLoss: -156860, feeRate: 15 }
    ]
  },
  {
    month: '2026-06',
    siteCode: 'DW',
    siteName: 'DW',
    items: [
      { venueName: '电子', winLoss: -156860, feeRate: 12 },
      { venueName: '体育', winLoss: -760, feeRate: 15 },
      { venueName: '棋牌', winLoss: 6700, feeRate: 15, feeAmount: 0 },
      { venueName: '电竞', winLoss: -156860, feeRate: 15 },
      { venueName: '哈希', winLoss: -156860, feeRate: 15 },
      { venueName: '电子', winLoss: -156860, feeRate: 15 }
    ]
  },
  {
    month: '2025-11',
    siteCode: 'NEXUS',
    siteName: 'NEXUS',
    items: [
      { venueName: '电子', winLoss: -98600, feeRate: 10 },
      { venueName: '体育', winLoss: 12500, feeRate: 12, feeAmount: 0 },
      { venueName: '棋牌', winLoss: -38800, feeRate: 13 },
      { venueName: '真人', winLoss: -66000, feeRate: 14 }
    ]
  }
]

export default {
  name: 'FundsSiteMonthlySettlement',
  data() {
    return {
      exportLoading: false,
      siteOptions,
      query: {
        startMonth: '2025-11',
        endMonth: '2026-06',
        keyword: '',
        siteCode: ''
      },
      reportGroups: this.buildGroups(baseGroups)
    }
  },
  computed: {
    filteredGroups() {
      const keyword = String(this.query.keyword || '').toLowerCase()
      return this.reportGroups.filter(group => {
        const matchMonth = (!this.query.startMonth || group.month >= this.query.startMonth) &&
          (!this.query.endMonth || group.month <= this.query.endMonth)
        const matchSite = !this.query.siteCode || group.siteCode === this.query.siteCode
        const text = `${group.siteName} ${group.siteCode} ${group.items.map(item => item.venueName).join(' ')}`.toLowerCase()
        const matchKeyword = !keyword || text.includes(keyword)
        return matchMonth && matchSite && matchKeyword
      })
    }
  },
  methods: {
    buildGroups(groups) {
      return groups.map(group => {
        const items = group.items.map(item => {
          const feeAmount = item.feeAmount !== undefined ? item.feeAmount : item.winLoss * item.feeRate / 100
          return {
            ...item,
            feeAmount: this.normalizeMoney(feeAmount)
          }
        })
        return {
          ...group,
          groupKey: `${group.month}-${group.siteCode}`,
          items,
          totalFee: this.normalizeMoney(items.reduce((sum, item) => sum + item.feeAmount, 0))
        }
      })
    },
    handleReset() {
      this.query = {
        startMonth: '2025-11',
        endMonth: '2026-06',
        keyword: '',
        siteCode: ''
      }
    },
    async handleExport() {
      this.exportLoading = true
      try {
        await this.download('funds/siteMonthlySettlement/export', {
          startMonth: this.query.startMonth,
          endMonth: this.query.endMonth,
          siteCode: this.query.siteCode,
          keyword: this.query.keyword
        }, `三方场馆站点月结费用_${this.query.startMonth}_${this.query.endMonth}.xlsx`)
      } finally {
        this.exportLoading = false
      }
    },
    formatMonth(month) {
      if (!month) {
        return '-'
      }
      const [year, value] = String(month).split('-')
      return `${year}年${value}月`
    },
    amountClass(value) {
      const amount = this.normalizeMoney(value)
      if (amount > 0) {
        return 'amount amount--positive'
      }
      if (amount < 0) {
        return 'amount amount--negative'
      }
      return 'amount amount--zero'
    },
    formatSignedMoney(value) {
      const amount = this.normalizeMoney(value)
      const prefix = amount > 0 ? '+' : ''
      return `${prefix}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    normalizeMoney(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) {
        return 0
      }
      return Math.round(number * 100) / 100
    }
  }
}
</script>

<style scoped>
.venue-monthly-page {
  min-height: calc(100vh - 84px);
  background: #f5f8fc;
  color: #1f2d3d;
}

.report-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0 24px;
  border-bottom: 1px solid #dfe7f1;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-line h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  color: #1f2d3d;
  font-weight: 800;
}

.title-mark {
  width: 6px;
  height: 28px;
  border-radius: 4px;
  background: #2f74ff;
}

.report-head p {
  margin: 12px 0 0 18px;
  color: #7a8ba3;
  line-height: 1.7;
  font-weight: 600;
}

.export-btn {
  min-width: 126px;
  height: 42px;
  margin-top: 4px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(47, 116, 255, 0.22);
  font-weight: 700;
}

.filter-card {
  margin-top: 28px;
  padding: 22px 24px;
  background: #fff;
  border: 1px solid #dfe7f1;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(45, 65, 95, 0.05);
}

.filter-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px dashed #e6edf6;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #22344d;
  font-weight: 800;
}

.filter-title i {
  color: #2f74ff;
  font-size: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 18px;
  margin-top: 20px;
}

.filter-item {
  min-width: 0;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  color: #6b7c93;
  font-size: 13px;
  font-weight: 800;
}

.filter-item ::v-deep .el-input__inner {
  height: 44px;
  border-radius: 12px;
  background: #f8fbff;
  border-color: #dce6f2;
  font-weight: 700;
}

.filter-item ::v-deep .el-select {
  width: 100%;
}

.month-range {
  display: grid;
  grid-template-columns: 1fr 32px 1fr;
  gap: 12px;
  align-items: center;
}

.month-picker {
  width: 100%;
}

.range-arrow {
  color: #9badc4;
  font-size: 24px;
  text-align: center;
}

.report-table-wrap {
  margin-top: 26px;
  overflow-x: auto;
  background: #fff;
  border: 1px solid #dfe7f1;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(45, 65, 95, 0.04);
}

.venue-report-table {
  width: 100%;
  min-width: 1180px;
  border-collapse: separate;
  border-spacing: 0;
  color: #27364a;
  table-layout: fixed;
}

.venue-report-table th,
.venue-report-table td {
  border-right: 1px solid #dfe7f1;
  border-bottom: 1px solid #dfe7f1;
  padding: 15px 18px;
  text-align: center;
  vertical-align: middle;
  font-weight: 700;
}

.venue-report-table th {
  background: #f1f5fb;
  color: #34445b;
  font-size: 14px;
}

.venue-report-table tr:last-child td {
  border-bottom: 0;
}

.venue-report-table th:last-child,
.venue-report-table td:last-child {
  border-right: 0;
}

.w-date {
  width: 130px;
}

.w-site {
  width: 160px;
}

.w-summary {
  width: 190px;
}

.merge-cell {
  background: #fbfdff;
}

.month-cell {
  font-size: 18px;
  font-weight: 800;
}

.site-cell {
  color: #2680ff;
  font-size: 16px;
}

.site-cell i {
  margin-right: 6px;
}

.venue-name {
  color: #2b3b52;
}

.number-cell {
  text-align: right;
}

.rate-cell {
  color: #7c8faa;
}

.summary-cell {
  font-size: 22px;
  text-align: right;
}

.amount {
  font-weight: 800;
}

.amount--negative {
  color: #ff315d;
}

.amount--positive {
  color: #00a476;
}

.amount--zero {
  color: #8fa2bb;
}

.empty-cell {
  height: 120px;
  color: #8fa2bb;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .report-head {
    flex-direction: column;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .export-btn {
    align-self: flex-start;
  }
}
</style>
