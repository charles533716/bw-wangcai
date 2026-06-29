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

const createSiteTrendZeroRows = () => ([
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
].map((label) => ({
  label,
  bar: 0,
  blue: 0,
  red: 0
})))

const createSiteRankingZeroRows = () => {
  return []
}

const createSiteLegends = () => {
  return [
    { key: 'blue', label: '总投注金额', color: '#2563eb' },
    { key: 'red', label: '总返彩金额', color: '#ec4899' },
    { key: 'bar', label: '总盈利金额', color: '#fb923c' }
  ]
}

const createDefaultSiteOptions = (scopeType, siteCode, userName) => {
  if (scopeType === 'site') {
    const code = String(siteCode || '').trim()
    if (code) {
      return [{ code, name: userName || code }]
    }
  }
  return [{ code: 'ALL', name: '全部站点' }]
}

const createOperationsDashboardZeroState = (scopeType) => {
  const isSuper = scopeType === 'super'
  const currentSiteLabel = isSuper ? '全站用户总额' : '本站用户总额'
  const rankingTitle = '游戏收益排行榜'
  const rankingSubTitle = '收益最高的前6名游戏'
  const rankingFooterLabel = '平台最高收益金额汇总'

  return {
    generatedAt: '',
    sections: [
      createZeroSection('website_income', '网站收益', 'blue', 3, [
        createZeroNoCompareMetric('总投注额度', '¥0.00', 'blue', 'el-icon-money'),
        createZeroNoCompareMetric('总收益', '¥0.00', 'green', 'el-icon-top-right'),
        createZeroNoCompareMetric('总投注人数', '0', 'violet', 'el-icon-user')
      ]),
      createZeroSection('funds', '资金明细', 'violet', 4, [
        createZeroNoCompareMetric(currentSiteLabel, '¥0.00', 'violet', 'el-icon-wallet'),
        createZeroNoCompareMetric('资金池额度', '¥0.00', 'blue', 'el-icon-s-finance'),
        createZeroNoCompareMetric('充值总额', '¥0.00', 'green', 'el-icon-circle-plus-outline'),
        createZeroNoCompareMetric('提现总额', '¥0.00', 'rose', 'el-icon-remove-outline', 'down')
      ]),
      createZeroSection('user_growth', '用户增长动态', 'orange', 5, [
        createZeroNoCompareMetric('总用户数', '0', 'blue', 'el-icon-user-solid'),
        createZeroMetric('活跃用户数', '0', 'orange', 'el-icon-edit-outline'),
        createZeroMetric('新增用户', '0', 'green', 'el-icon-plus'),
        createZeroMetric('付费用户', '0', 'red', 'el-icon-tickets'),
        createZeroMetric('新增付费用户', '0', 'rose', 'el-icon-s-order')
      ]),
      createZeroSection('agent_data', '代理数据', 'indigo', 4, [
        createZeroNoCompareMetric('总代理数', '0', 'blue', 'el-icon-share'),
        createZeroMetric('新增代理数', '0', 'violet', 'el-icon-circle-plus'),
        createZeroNoCompareMetric('代理佣金余额（含未结算）', '¥0.00', 'orange', 'el-icon-s-ticket'),
        createZeroNoCompareMetric('代理余额', '¥0.00', 'green', 'el-icon-folder-opened')
      ])
    ],
    trend: {
      rows: createSiteTrendZeroRows(),
      max: 1,
      unitLabel: 'k'
    },
    rankingTitle,
    rankingSubTitle,
    rankingRows: createSiteRankingZeroRows(),
    rankingFooterLabel,
    rankingFooterValue: '¥0.00',
    legends: createSiteLegends()
  }
}

export default {
  name: 'OperationsDashboard',
  props: {
    scopeType: {
      type: String,
      default: 'site'
    },
    siteCode: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      siteOptions: createDefaultSiteOptions(this.scopeType, this.siteCode, this.userName),
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
      dashboardData: createOperationsDashboardZeroState(this.scopeType, this.siteCode, this.userName)
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
      return !rows.some((row) => Number(row && row.bar || 0) !== 0 || Number(row && row.blue || 0) !== 0 || Number(row && row.red || row && row.pink || 0) !== 0)
    },
    trendBarsStyle() {
      return {
        gridTemplateColumns: `repeat(${Math.max(1, this.trendRowCount)}, minmax(0, 1fr))`
      }
    },
    trendRangeLabel() {
      const rowCount = this.trendRowCount
      if (rowCount > 0) {
        return `最近${rowCount}天`
      }
      return '最近0天'
    },
    normalizedTrendRows() {
      const max = this.trend.max || 1
      const rows = this.trend.rows || []
      const labelStep = rows.length > 24 ? 3 : (rows.length > 14 ? 2 : 1)
      return rows.map((row, index) => ({
        ...row,
        barHeight: Number(row.bar || 0) === 0 ? 0 : Math.max(4, Math.round((row.bar / max) * 100)),
        blueHeight: Math.max(4, Math.round((row.blue / max) * 100)),
        pinkHeight: Math.max(4, Math.round((row.red / max) * 100)),
        shortLabel: index % labelStep === 0 ? row.label.slice(5) : ''
      }))
    },
    yTicks() {
      const max = this.trend.max || 0
      const unit = this.trend.unitLabel || ''
      if (this.isTrendEmpty) {
        return [0, 0, 0, 0, 0, 0].map((step) => `${step}${unit}`)
      }
      return [5, 4, 3, 2, 1, 0].map((step) => `${Math.round((max * step) / 5)}${unit}`)
    },
    bluePoints() {
      return this.calcLinePoints('blue')
    },
    pinkPoints() {
      return this.calcLinePoints('red')
    },
    linePointsBlue() {
      return this.bluePoints.map((pt) => `${pt.x},${pt.y}`).join(' ')
    },
    linePointsPink() {
      return this.pinkPoints.map((pt) => `${pt.x},${pt.y}`).join(' ')
    }
  },
  watch: {
    scopeType: {
      immediate: true,
      handler() {
        this.resetByScope()
      }
    },
    siteCode(val) {
      if (this.scopeType === 'site') {
        this.query.siteCode = val || 'ALL'
        this.handleQuery(false)
      }
    }
  },
  methods: {
    createZeroDashboardState(targetSiteCode = '') {
      const siteCode = this.scopeType === 'site' ? (this.siteCode || targetSiteCode || '') : (targetSiteCode || this.query.siteCode || 'ALL')
      return createOperationsDashboardZeroState(this.scopeType, siteCode, this.userName)
    },
    createDefaultSiteOptionsForCurrentScope() {
      return createDefaultSiteOptions(this.scopeType, this.siteCode, this.userName)
    },
    isEmptyMetricValue(value) {
      return value === null || value === undefined || String(value).trim() === ''
    },
    normalizeDashboardData(rawData, targetSiteCode = '') {
      const zeroData = this.createZeroDashboardState(targetSiteCode)
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

      return this.applyFundsEmptyDefaults(data)
    },
    applyFundsEmptyDefaults(rawData, forceZero = false) {
      const data = rawData ? JSON.parse(JSON.stringify(rawData)) : {}
      const sections = Array.isArray(data.sections) ? data.sections : []

      data.sections = sections.map((section) => {
        if (!section || section.key !== 'funds' || !Array.isArray(section.cards)) {
          return section
        }

        return {
          ...section,
          cards: section.cards.map((card) => {
            if (!card) return card
            const isUserTotal = typeof card.label === 'string' && card.label.includes('用户总额')
            const isFundPoolQuota = card.label === '资金池额度' || card.label === '可提现资金池'
            if (!isUserTotal && !isFundPoolQuota) {
              return card
            }

            if (!forceZero && !this.isEmptyMetricValue(card.value)) {
              return card
            }

            return {
              ...card,
              value: '¥0.00'
            }
          })
        }
      })

      return data
    },
    normalizeSiteOptions(options) {
      if (!Array.isArray(options)) return []
      return options.map((item) => ({
        code: item.code || item.value || '',
        name: item.name || item.label || ''
      })).filter((item) => item.code)
    },
    async loadSiteOptions(showToast = false) {
      try {
        const requestParams = { scopeType: this.scopeType }
        if (this.scopeType === 'site' && String(this.siteCode || '').trim() !== '') {
          requestParams.siteCode = String(this.siteCode).trim()
        }
        const response = await getDashboardSiteOptions(requestParams)
        const options = this.normalizeSiteOptions(response && response.data && response.data.options)
        if (options.length) {
          this.siteOptions = options
        }
        if (showToast) {
          this.$message.success('站点列表已刷新')
        }
      } catch (e) {
        this.siteOptions = this.createDefaultSiteOptionsForCurrentScope()
        if (showToast) {
          this.$message.warning('站点列表接口失败，已使用默认站点')
        }
      }
    },
    async resetByScope() {
      this.query.quickRange = 'today'
      this.query.siteCode = this.scopeType === 'site' ? (this.siteCode || 'ALL') : 'ALL'
      if (this.scopeType === 'super' || this.scopeType === 'site') {
        await this.loadSiteOptions(false)
      }
      this.handleQuery(false)
    },
    switchRange(value) {
      this.query.quickRange = value
      this.handleQuery()
    },
    async handleQuery(showToast = true) {
      const targetSiteCode = this.scopeType === 'site' ? (this.siteCode || '') : this.query.siteCode
      try {
        const response = await getOperationsDashboard({
          scopeType: this.scopeType,
          siteCode: targetSiteCode || 'ALL',
          quickRange: this.query.quickRange
        })
        const data = response && response.data
        if (!data) throw new Error('empty dashboard data')
        this.dashboardData = this.normalizeDashboardData(data, targetSiteCode)
        if (showToast) {
          this.$message.success('看板数据已刷新')
        }
      } catch (e) {
        this.dashboardData = this.createZeroDashboardState(targetSiteCode)
        if (showToast) {
          this.$message.warning('看板接口失败，已显示默认0数据')
        }
      }
    },
    gridStyle(section) {
      const cols = Math.max(1, Number(section.cols || (section.cards && section.cards.length) || 4))
      return {
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
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
