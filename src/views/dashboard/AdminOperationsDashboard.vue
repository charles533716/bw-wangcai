<template>
  <div class="ops-board app-container">
    <div class="top-strip">
      <div class="top-strip__title">全站运营数据看板</div>
      <el-select
        v-model="query.siteCode"
        size="mini"
        class="top-strip__site"
        popper-class="ops-site-select-popper"
        :popper-append-to-body="false"
        @change="handleQuery(false)"
      >
        <el-option
          v-for="site in siteOptions"
          :key="site.value"
          :label="site.label"
          :value="site.value"
        />
      </el-select>
    </div>

    <div class="page-head">
      <div class="page-head__left">
        <span class="page-head__dot"></span>
        <span class="page-head__title">全站运营数据看板</span>
      </div>
      <div class="page-head__right">
        <div class="range-switch">
          <button
            v-for="item in quickRanges"
            :key="item.value"
            type="button"
            class="range-switch__btn"
            :class="{ 'is-active': query.quickRange === item.value }"
            @click="switchRange(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <section
      v-for="section in dashboardData.sections"
      :key="section.key"
      class="metric-section"
    >
      <div class="metric-section__head">
        <div class="metric-section__title-wrap">
          <span class="metric-section__icon" :class="`is-${section.iconColor || 'blue'}`"></span>
          <span class="metric-section__title">{{ section.title }}</span>
        </div>
      </div>

      <div class="metric-grid" :style="gridStyle(section)">
        <article v-for="card in section.cards" :key="card.label" class="metric-card">
          <div class="metric-card__header">
            <div class="metric-card__label">{{ card.label }}</div>
            <span class="metric-card__icon" :class="`is-${card.color}`">
              <i :class="card.icon"></i>
            </span>
          </div>

          <div class="metric-card__value" :class="`is-${card.color}`">
            {{ card.value }}
          </div>

          <div v-if="card.showCompare !== false" class="metric-card__footer">
            <span class="metric-card__trend" :class="`is-${card.trendType}`">{{ card.trend }}</span>
            <span class="metric-card__sub">{{ card.subLabel }}</span>
          </div>
        </article>
      </div>
    </section>

    <div class="bottom-grid">
      <el-card shadow="never" class="panel-card trend-panel">
        <div class="panel-card__head">
          <div>
            <div class="panel-card__title">收益趋势统计</div>
            <div class="panel-card__desc">历史数据：充值金额、总营收金额与盈亏金额对比</div>
          </div>
          <div class="panel-card__actions">
            <span class="mini-range">
              <i class="el-icon-date"></i>
              {{ trendRangeLabel }}
            </span>
          </div>
        </div>

        <div class="legend-row">
          <span v-for="item in dashboardData.legends" :key="item.key" class="legend-row__item">
            <i class="legend-row__dot" :style="{ backgroundColor: item.color }"></i>
            {{ item.label }}
          </span>
        </div>

        <div class="trend-chart">
          <div class="trend-chart__axis">
            <span v-for="(tick, index) in yTicks" :key="`tick-${index}-${tick}`">{{ tick }}</span>
          </div>

          <div class="trend-chart__plot">
            <div
              v-for="line in 5"
              :key="`grid-${line}`"
              class="trend-chart__gridline"
              :style="gridLineStyle(line)"
            ></div>

            <div class="trend-chart__bars" :style="trendBarsStyle">
              <div v-for="row in normalizedTrendRows" :key="row.label" class="trend-col">
                <div class="trend-col__body">
                  <div
                    class="trend-col__bar"
                    :class="{ 'is-negative': row.bar < 0 }"
                    :style="{ height: row.barHeight + '%' }"
                  >
                    <span v-if="row.barHeight > 0" class="trend-col__bar-label">{{ row.barLabel }}</span>
                  </div>
                </div>
                <div class="trend-col__label">{{ row.shortLabel }}</div>
              </div>
            </div>

            <div v-if="isTrendEmpty" class="trend-empty">暂无数据</div>

            <svg class="trend-chart__svg" viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden="true">
              <polyline class="trend-line trend-line--blue" :points="linePointsBlue" />
              <polyline class="trend-line trend-line--pink" :points="linePointsPink" />
              <g v-for="(pt, idx) in bluePoints" :key="`blue-${idx}`">
                <circle :cx="pt.x" :cy="pt.y" r="4" class="trend-point trend-point--blue" />
              </g>
              <g v-for="(pt, idx) in pinkPoints" :key="`pink-${idx}`">
                <circle :cx="pt.x" :cy="pt.y" r="4" class="trend-point trend-point--pink" />
              </g>
            </svg>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="panel-card rank-panel">
        <div class="panel-card__head">
          <div>
            <div class="panel-card__title panel-card__title--rank">
              <i class="el-icon-trophy"></i>
              {{ dashboardData.rankingTitle }}
            </div>
            <div class="panel-card__desc">{{ dashboardData.rankingSubTitle }}</div>
          </div>
        </div>

        <div class="rank-list">
          <div v-if="!dashboardData.rankingRows || !dashboardData.rankingRows.length" class="rank-empty">
            暂无数据
          </div>
          <div v-else v-for="row in dashboardData.rankingRows" :key="row.name" class="rank-item">
            <div class="rank-item__head">
              <span class="rank-item__name">{{ row.name }}</span>
              <span class="rank-item__value">{{ row.amountText }}</span>
            </div>
            <div class="rank-item__track">
              <div class="rank-item__fill" :style="{ width: row.percent + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="rank-footer">
          <span class="rank-footer__label">{{ dashboardData.rankingFooterLabel }}</span>
          <span class="rank-footer__value">{{ dashboardData.rankingFooterValue }}</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getDashboardSiteOptions, getOperationsDashboard } from '@/api/report/dashboard'

const PLOT_WIDTH = 1000
const PLOT_HEIGHT = 280
const LEFT_PADDING = 34
const RIGHT_PADDING = 34
const TOP_PADDING = 24
const BOTTOM_PADDING = 42

const createZeroMetric = (label, value, color, icon, trendType = 'up', showCompare = true) => ({
  label,
  value,
  trend: showCompare ? '--' : '',
  trendType,
  subLabel: showCompare ? '较前一周期' : '',
  showCompare,
  color,
  icon
})

const createZeroNoCompareMetric = (label, value, color, icon, trendType = 'up') => (
  createZeroMetric(label, value, color, icon, trendType, false)
)

const createZeroSection = (key, title, iconColor, cols, cards) => ({
  key,
  title,
  iconColor,
  cols,
  cards
})

const createZeroTrendRows = () => {
  return [
    '2026/06/21',
    '2026/06/22',
    '2026/06/23',
    '2026/06/24',
    '2026/06/25',
    '2026/06/26',
    '2026/06/27',
    '2026/06/28',
    '2026/06/29',
    '2026/06/30'
  ].map((label) => ({ label, bar: 0, blue: 0, pink: 0 }))
}

const createZeroRankingRows = () => {
  return []
}

const createDashboardLegends = () => {
  return [
    { key: 'blue', label: '充值金额', color: '#3b82f6' },
    { key: 'pink', label: '盈亏金额', color: '#ec4899' },
    { key: 'bar', label: '总营收金额', color: '#fb923c' }
  ]
}

const createAdminOperationsDashboardZeroState = () => {
  return {
    generatedAt: '',
    sections: [
      createZeroSection('website_income', '网站收益', 'blue', 3, [
        createZeroNoCompareMetric('总投注额度', '¥ 0.00', 'blue', 'el-icon-money'),
        createZeroNoCompareMetric('总收益', '¥ 0.00', 'green', 'el-icon-top-right'),
        createZeroNoCompareMetric('总注册人数', '0', 'violet', 'el-icon-user')
      ]),
      createZeroSection('funds', '资金明细', 'violet', 4, [
        createZeroNoCompareMetric('全站用户总额', '¥ 0.00', 'violet', 'el-icon-wallet'),
        createZeroNoCompareMetric('资金池额度', '¥ 0.00', 'blue', 'el-icon-s-finance'),
        createZeroNoCompareMetric('充值总额', '¥ 0.00', 'green', 'el-icon-circle-plus-outline'),
        createZeroNoCompareMetric('提现总额', '¥ 0.00', 'rose', 'el-icon-remove-outline', 'down')
      ]),
      createZeroSection('user_growth', '用户增长动态', 'orange', 5, [
        createZeroNoCompareMetric('总用户数', '0', 'blue', 'el-icon-user-solid'),
        createZeroMetric('活跃用户数', '0', 'orange', 'el-icon-s-data'),
        createZeroMetric('新增用户', '0', 'green', 'el-icon-plus'),
        createZeroMetric('付费用户', '0', 'red', 'el-icon-tickets'),
        createZeroMetric('新增付费用户', '0', 'rose', 'el-icon-s-order')
      ]),
      createZeroSection('agent_data', '代理数据', 'indigo', 4, [
        createZeroNoCompareMetric('总代理数', '0', 'blue', 'el-icon-share'),
        createZeroMetric('新增代理数', '0', 'violet', 'el-icon-circle-plus'),
        createZeroNoCompareMetric('代理佣金余额（含未结算）', '¥ 0.00', 'orange', 'el-icon-s-ticket'),
        createZeroNoCompareMetric('代理余额', '¥ 0.00', 'green', 'el-icon-folder-opened')
      ])
    ],
    trend: {
      rows: createZeroTrendRows(),
      max: 0,
      unitLabel: '000'
    },
    rankingTitle: '站点收益排行',
    rankingSubTitle: '按总站总收益排序（前6名站点）',
    rankingRows: createZeroRankingRows(),
    rankingFooterLabel: '全站总收益',
    rankingFooterValue: '¥ 0.00',
    legends: createDashboardLegends()
  }
}

export default {
  name: 'AdminOperationsDashboard',
  created() {
    this.loadSiteOptions(false)
    this.handleQuery(false)
  },
  data() {
    return {
      siteOptions: [
        { value: 'ALL', label: '全部站点' }
      ],
      quickRanges: [
        { label: '今日', value: 'today' },
        { label: '昨日', value: 'yesterday' },
        { label: '近3日', value: '3d' },
        { label: '近7日', value: '7d' },
        { label: '近1月', value: '30d' }
      ],
      query: {
        siteCode: 'ALL',
        quickRange: 'today'
      },
      dashboardData: createAdminOperationsDashboardZeroState()
    }
  },
  computed: {
    trend() {
      return this.dashboardData.trend || { rows: [], max: 1, unitLabel: '' }
    },
    trendRowCount() {
      return Array.isArray(this.trend.rows) ? this.trend.rows.length : 0
    },
    isTrendEmpty() {
      const rows = Array.isArray(this.trend.rows) ? this.trend.rows : []
      if (!rows.length) return true
      return !rows.some((row) => Number(row && row.bar || 0) !== 0 || Number(row && row.blue || 0) !== 0 || Number(row && row.pink || 0) !== 0)
    },
    trendBarsStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.max(1, this.trendRowCount)}, minmax(0, 1fr))`
      }
    },
    trendRangeLabel() {
      const rowCount = this.trendRowCount
      if (rowCount > 0) return `最近${rowCount}天`
      return '最近0天'
    },
    normalizedTrendRows() {
      const max = this.trend.max || 1
      const rows = this.trend.rows || []
      const labelStep = rows.length > 24 ? 3 : (rows.length > 14 ? 2 : 1)
      return rows.map((row, index) => {
        const barHeight = Number(row.bar || 0) === 0 ? 0 : Math.max(4, Math.round((Math.abs(row.bar) / max) * 100))
        return {
          ...row,
          barHeight,
          shortLabel: index % labelStep === 0 ? row.label.slice(5) : '',
          barLabel: Number(row.bar || 0) * 1000
        }
      })
    },
    yTicks() {
      const max = this.trend.max || 0
      if (this.isTrendEmpty) {
        return [0, 0, 0, 0, 0, 0]
      }
      return [5, 4, 3, 2, 1, 0].map((step) => `${Math.round((max * step) / 5) * 1000}`)
    },
    bluePoints() {
      return this.calcLinePoints('blue')
    },
    pinkPoints() {
      return this.calcLinePoints('pink')
    },
    linePointsBlue() {
      return this.bluePoints.map((pt) => `${pt.x},${pt.y}`).join(' ')
    },
    linePointsPink() {
      return this.pinkPoints.map((pt) => `${pt.x},${pt.y}`).join(' ')
    }
  },
  methods: {
    isEmptyMetricValue(value) {
      return value === null || value === undefined || String(value).trim() === ''
    },
    normalizeDashboardData(rawData) {
      const zeroData = createAdminOperationsDashboardZeroState()
      if (!rawData || !Array.isArray(rawData.sections) || rawData.sections.length === 0) {
        return zeroData
      }

      const data = JSON.parse(JSON.stringify(rawData))
      const apiSections = Array.isArray(data.sections) ? data.sections : []

      data.sections = zeroData.sections.map((zeroSection) => {
        const apiSection = apiSections.find((section) => section && section.key === zeroSection.key)
        if (!apiSection || !Array.isArray(apiSection.cards)) {
          return zeroSection
        }

        return {
          ...zeroSection,
          ...apiSection,
          cards: zeroSection.cards.map((zeroCard, index) => {
            const apiCard = apiSection.cards[index]
            if (!apiCard) return zeroCard
            return {
              ...zeroCard,
              ...apiCard,
              value: this.isEmptyMetricValue(apiCard.value) ? zeroCard.value : apiCard.value,
              trend: this.isEmptyMetricValue(apiCard.trend) ? zeroCard.trend : apiCard.trend,
              subLabel: this.isEmptyMetricValue(apiCard.subLabel) ? zeroCard.subLabel : apiCard.subLabel
            }
          })
        }
      })

      data.trend = (data.trend && Array.isArray(data.trend.rows) && data.trend.rows.length)
        ? { ...zeroData.trend, ...data.trend }
        : zeroData.trend
      data.legends = Array.isArray(data.legends) && data.legends.length ? data.legends : zeroData.legends
      data.rankingRows = Array.isArray(data.rankingRows) && data.rankingRows.length ? data.rankingRows : zeroData.rankingRows
      data.rankingTitle = data.rankingTitle || zeroData.rankingTitle
      data.rankingSubTitle = data.rankingSubTitle || zeroData.rankingSubTitle
      data.rankingFooterLabel = data.rankingFooterLabel || zeroData.rankingFooterLabel
      data.rankingFooterValue = this.isEmptyMetricValue(data.rankingFooterValue) ? zeroData.rankingFooterValue : data.rankingFooterValue
      data.generatedAt = data.generatedAt || zeroData.generatedAt

      return data
    },
    async loadSiteOptions(showToast = false) {
      try {
        const response = await getDashboardSiteOptions()
        const options = response && response.data && response.data.options
        if (Array.isArray(options) && options.length) this.siteOptions = options
        if (showToast) this.$message.success('站点列表已刷新')
      } catch (e) {
        if (showToast) this.$message.warning('站点列表加载失败，使用默认站点')
      }
    },
    switchRange(value) {
      this.query.quickRange = value
      this.handleQuery()
    },
    async handleQuery(showToast = true) {
      try {
        const response = await getOperationsDashboard(this.query)
        const data = (response && response.data) || null
        if (!data) throw new Error('empty dashboard data')
        this.dashboardData = this.normalizeDashboardData(data)
        if (showToast) this.$message.success('全站看板数据已刷新')
      } catch (e) {
        this.dashboardData = createAdminOperationsDashboardZeroState()
        if (showToast) this.$message.warning('接口调用失败，已显示默认0数据')
      }
    },
    gridStyle(section) {
      return {
        gridTemplateColumns: `repeat(${Math.max(1, Number(section.cols || 4))}, minmax(0, 1fr))`
      }
    },
    gridLineStyle(line) {
      return {
        bottom: `${(line - 1) * 20}%`
      }
    },
    calcLinePoints(field) {
      const rows = this.trend.rows || []
      const max = this.trend.max || 1
      if (!rows.length) return []
      const plotWidth = PLOT_WIDTH - LEFT_PADDING - RIGHT_PADDING
      const plotHeight = PLOT_HEIGHT - TOP_PADDING - BOTTOM_PADDING
      const stepX = rows.length > 1 ? plotWidth / (rows.length - 1) : plotWidth

      return rows.map((row, index) => {
        const x = LEFT_PADDING + stepX * index
        const ratio = Math.max(0, Math.min(1, Number(row[field] || 0) / max))
        const y = TOP_PADDING + (1 - ratio) * plotHeight
        return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.ops-board {
  padding: 10px 12px 12px;
  background: #f5f7fb;
}

.top-strip {
  margin-bottom: 10px;
  padding: 8px 12px;
  border: 1px solid #e9edf5;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.top-strip__title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

.top-strip__site {
  width: 280px;
}

.top-strip ::v-deep .el-select .el-input__inner {
  border-radius: 10px;
  background: #fff;
  border: 1px solid #d8e3f4;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #4b5563;
  padding-left: 14px;
}

.top-strip ::v-deep .el-select .el-input__inner:focus,
.top-strip ::v-deep .el-select:hover .el-input__inner {
  border-color: #2f80ff;
}

.top-strip ::v-deep .el-select .el-input__icon {
  line-height: 40px;
  color: #b8c1cd;
  font-size: 16px;
}

.top-strip ::v-deep .ops-site-select-popper {
  margin-top: 6px !important;
  border-radius: 10px;
  border: 1px solid #e3e9f2;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.top-strip ::v-deep .ops-site-select-popper .el-select-dropdown__item {
  height: 48px;
  line-height: 48px;
  padding: 0 18px;
  font-size: 15px;
  color: #4b5563;
}

.top-strip ::v-deep .ops-site-select-popper .el-select-dropdown__item.hover,
.top-strip ::v-deep .ops-site-select-popper .el-select-dropdown__item:hover {
  background: #f7faff;
}

.top-strip ::v-deep .ops-site-select-popper .el-select-dropdown__item.selected {
  color: #2f80ff;
  font-weight: 700;
  background: #f3f7ff;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #e9edf5;
  border-radius: 10px;
  background: #fff;
}

.page-head__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-head__dot {
  width: 6px;
  height: 16px;
  border-radius: 999px;
  background: #2563eb;
}

.page-head__title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.page-head__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-switch {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.range-switch__btn {
  border: 0;
  background: transparent;
  padding: 5px 10px;
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
  border-right: 1px solid #e8eef8;
}

.range-switch__btn:last-child {
  border-right: 0;
}

.range-switch__btn.is-active {
  background: #2563eb;
  color: #fff;
}

.metric-section {
  margin-bottom: 10px;
  padding: 10px 12px 12px;
  border: 1px solid #e9edf5;
  border-radius: 10px;
  background: #fff;
}

.metric-section__head { margin-bottom: 10px; }
.metric-section__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.metric-section__icon {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}
.metric-section__icon.is-blue { background: #2563eb; }
.metric-section__icon.is-violet { background: #8b5cf6; }
.metric-section__icon.is-orange { background: #f97316; }
.metric-section__icon.is-indigo { background: #4f46e5; }
.metric-section__title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.metric-grid {
  display: grid;
  gap: 10px;
}

.metric-card {
  border: 1px solid #eef2f7;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  min-height: 86px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.metric-card__label {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.2;
}
.metric-card__icon {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  flex-shrink: 0;
}
.metric-card__value {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}
.metric-card__footer {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.metric-card__trend {
  font-size: 10px;
  font-weight: 700;
}
.metric-card__trend.is-up { color: #10b981; }
.metric-card__trend.is-down { color: #ef4444; }
.metric-card__sub {
  font-size: 10px;
  color: #94a3b8;
}

.metric-card__icon.is-blue, .metric-card__value.is-blue { color: #2563eb; }
.metric-card__icon.is-blue { background: #2563eb; color: #fff; }
.metric-card__icon.is-green, .metric-card__value.is-green { color: #10b981; }
.metric-card__icon.is-green { background: #10b981; color: #fff; }
.metric-card__icon.is-violet, .metric-card__value.is-violet { color: #6366f1; }
.metric-card__icon.is-violet { background: #6366f1; color: #fff; }
.metric-card__icon.is-orange, .metric-card__value.is-orange { color: #f97316; }
.metric-card__icon.is-orange { background: #f97316; color: #fff; }
.metric-card__icon.is-red, .metric-card__value.is-red { color: #ef4444; }
.metric-card__icon.is-red { background: #ef4444; color: #fff; }
.metric-card__icon.is-rose, .metric-card__value.is-rose { color: #f43f5e; }
.metric-card__icon.is-rose { background: #f43f5e; color: #fff; }
.metric-card__icon.is-indigo, .metric-card__value.is-indigo { color: #4f46e5; }
.metric-card__icon.is-indigo { background: #4f46e5; color: #fff; }

.bottom-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
  gap: 12px;
}
.panel-card { border-radius: 10px; }
.panel-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.panel-card__title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.panel-card__title--rank {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.panel-card__title--rank i { color: #f59e0b; }
.panel-card__desc {
  margin-top: 4px;
  font-size: 11px;
  color: #94a3b8;
}
.mini-range {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 4px 8px;
}

.legend-row {
  margin: 10px 0 4px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}
.legend-row__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #64748b;
}
.legend-row__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.trend-chart {
  margin-top: 4px;
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 8px;
  height: 300px;
}
.trend-chart__axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2px 0 26px;
  font-size: 10px;
  color: #94a3b8;
}
.trend-chart__plot {
  position: relative;
  border-radius: 8px;
  border: 1px solid #eef2f7;
  background: #fff;
  overflow: hidden;
}
.trend-chart__gridline {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 1px;
  background: #edf2f7;
  z-index: 0;
}
.trend-chart__bars {
  position: absolute;
  top: 12px;
  bottom: 6px;
  left: 10px;
  right: 10px;
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 6px;
  z-index: 1;
}
.trend-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
}
.trend-col__body {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 12px;
}
.trend-col__bar {
  width: 54%;
  min-width: 8px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #fb923c 0%, #f59e0b 100%);
  position: relative;
}
.trend-col__bar.is-negative {
  background: linear-gradient(180deg, #fca5a5 0%, #ef4444 100%);
}
.trend-col__bar-label {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%) scale(0.82);
  transform-origin: center;
  font-size: 10px;
  color: #64748b;
  white-space: nowrap;
}
.trend-col__label {
  margin-top: 4px;
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
  white-space: nowrap;
  transform: scale(0.8);
  transform-origin: center top;
}
.trend-chart__svg {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.trend-empty {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.72);
  pointer-events: none;
}

.trend-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.trend-line--blue { stroke: #3b82f6; }
.trend-line--pink { stroke: #ec4899; }
.trend-point {
  stroke: #fff;
  stroke-width: 2;
}
.trend-point--blue { fill: #3b82f6; }
.trend-point--pink { fill: #ec4899; }

.rank-list {
  margin-top: 10px;
  display: grid;
  gap: 14px;
}

.rank-empty {
  min-height: 180px;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 12px;
  background: #fafcff;
}

.rank-item__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.rank-item__name {
  font-size: 11px;
  color: #4b5563;
}
.rank-item__value {
  font-size: 10px;
  color: #3b82f6;
}
.rank-item__track {
  height: 6px;
  border-radius: 999px;
  background: #e7eef9;
  overflow: hidden;
}
.rank-item__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2563eb 0%, #93c5fd 100%);
}
.rank-footer {
  margin-top: 18px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.rank-footer__label {
  font-size: 11px;
  color: #94a3b8;
}
.rank-footer__value {
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
}

@media (max-width: 1300px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 768px) {
  .top-strip {
    flex-direction: column;
    align-items: stretch;
  }
  .top-strip__site {
    width: 100%;
  }
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .page-head__right {
    justify-content: flex-start;
    overflow-x: auto;
  }
  .metric-grid {
    grid-template-columns: 1fr !important;
  }
  .trend-chart {
    grid-template-columns: 38px 1fr;
    height: 260px;
  }
  .trend-chart__bars {
    gap: 2px;
  }
}
</style>
