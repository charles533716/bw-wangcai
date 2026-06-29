import { getActivityReportMeta, getActivityReportSummary, listActivityReports } from '@/api/activity/report'

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '运行中', value: 1 },
  { label: '已暂停', value: 2 }
]

function emptySummary() {
  return {
    totalActivityCount: 0,
    runningActivityCount: 0,
    totalParticipantCount: 0,
    totalCompletedCount: 0,
    averageCompletionRate: 0,
    totalRewardGrantAmount: 0,
    totalRewardClaimedAmount: 0,
    totalBetAmount: 0,
    totalRechargeAmount: 0,
    totalGrossProfit: 0
  }
}

function padNumber(value) {
  return value < 10 ? '0' + value : String(value)
}

function formatDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('-')
}

function formatCompactDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('')
}

function getDefaultDateRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return [formatDateValue(start), formatDateValue(end)]
}

export default {
  name: 'ActivityReport',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      meta: {
        siteReadonly: false,
        currentSiteCode: '',
        siteOptions: [],
        activityTypes: []
      },
      summary: emptySummary(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: '',
        activityType: '',
        status: '',
        siteCode: '',
        memberKeyword: ''
      },
      queryDateRange: getDefaultDateRange(),
      statusOptions: STATUS_OPTIONS
    }
  },
  computed: {
    activityTypeOptions() {
      return Array.isArray(this.meta.activityTypes) ? this.meta.activityTypes : []
    },
    siteOptions() {
      return Array.isArray(this.meta.siteOptions) ? this.meta.siteOptions : []
    },
    summaryCards() {
      return [
        {
          key: 'activity',
          label: '活动总数',
          value: this.formatCount(this.summary.totalActivityCount),
          meta: `运行中 ${this.formatCount(this.summary.runningActivityCount)}个`,
          icon: 'el-icon-s-order',
          iconTheme: 'is-blue',
          themeClass: 'theme-blue'
        },
        {
          key: 'participant',
          label: '总参与人数',
          value: this.formatCount(this.summary.totalParticipantCount),
          meta: `完成 ${this.formatCount(this.summary.totalCompletedCount)}人`,
          icon: 'el-icon-user',
          iconTheme: 'is-purple',
          themeClass: 'theme-purple'
        },
        {
          key: 'completion',
          label: '平均完成率',
          value: this.formatPercent(this.summary.averageCompletionRate),
          meta: '完成人数 / 参与人数',
          icon: 'el-icon-data-analysis',
          iconTheme: 'is-orange',
          themeClass: 'theme-orange'
        },
        {
          key: 'grant',
          label: '派发奖励总额 (元)',
          value: this.formatCurrency(this.summary.totalRewardGrantAmount),
          meta: `已领取 ${this.formatCurrency(this.summary.totalRewardClaimedAmount)}`,
          icon: 'el-icon-present',
          iconTheme: 'is-green',
          themeClass: 'theme-green'
        },
        {
          key: 'turnover',
          label: '投注流水总计 (元)',
          value: this.formatCurrency(this.summary.totalBetAmount),
          meta: `充值额度 ${this.formatCurrency(this.summary.totalRechargeAmount)}`,
          icon: 'el-icon-bank-card',
          iconTheme: 'is-indigo',
          themeClass: 'theme-indigo'
        },
        {
          key: 'profit',
          label: '总赢亏 (元)',
          value: this.formatCurrency(this.summary.totalGrossProfit, true),
          meta: '正值为平台盈利',
          icon: 'el-icon-s-finance',
          iconTheme: 'is-pink',
          themeClass: 'theme-pink',
          valueClass: this.profitClass(this.summary.totalGrossProfit)
        }
      ]
    },
    rangeText() {
      if (!this.total) {
        return '暂无记录'
      }
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize + 1
      const end = Math.min(this.total, start + this.list.length - 1)
      return `显示 ${start} 到 ${end} 条，共 ${this.total} 条记录`
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      await this.fetchMeta()
      await this.refreshData()
    },
    async fetchMeta() {
      const res = await getActivityReportMeta()
      this.meta = Object.assign({ siteReadonly: false, currentSiteCode: '', siteOptions: [], activityTypes: [] }, (res && res.data) || {})
      if (this.meta.siteReadonly) {
        this.queryParams.siteCode = this.meta.currentSiteCode || ''
      }
    },
    buildQueryParams(includePaging = true) {
      const query = {}
      if (includePaging) {
        query.pageNum = this.queryParams.pageNum
        query.pageSize = this.queryParams.pageSize
      }
      if (this.queryParams.activityName) {
        query.activityName = this.queryParams.activityName
      }
      if (this.queryParams.memberKeyword) {
        query.memberKeyword = this.queryParams.memberKeyword
      }
      if (this.queryParams.activityType) {
        query.activityType = this.queryParams.activityType
      }
      if (this.queryParams.status !== '' && this.queryParams.status !== null && this.queryParams.status !== undefined) {
        query.status = this.queryParams.status
      }
      const siteCode = this.meta.siteReadonly ? this.meta.currentSiteCode : this.queryParams.siteCode
      if (siteCode) {
        query.siteCode = siteCode
      }
      if (Array.isArray(this.queryDateRange) && this.queryDateRange.length === 2) {
        query.startDate = this.queryDateRange[0]
        query.endDate = this.queryDateRange[1]
      }
      return query
    },
    async refreshData() {
      await Promise.all([this.getList(), this.getSummary()])
    },
    async getList() {
      this.loading = true
      try {
        const res = await listActivityReports(this.buildQueryParams(true))
        this.list = Array.isArray(res.rows) ? res.rows : []
        this.total = Number(res.total || 0)
      } finally {
        this.loading = false
      }
    },
    async getSummary() {
      const res = await getActivityReportSummary(this.buildQueryParams(false))
      this.summary = Object.assign(emptySummary(), (res && res.data) || {})
    },
    handleQuery() {
      if (!this.validateDateRange()) {
        return
      }
      this.queryParams.pageNum = 1
      this.refreshData()
    },
    handleAutoQuery() {
      this.handleQuery()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        activityName: '',
        activityType: '',
        status: '',
        siteCode: this.meta.siteReadonly ? (this.meta.currentSiteCode || '') : '',
        memberKeyword: ''
      }
      this.queryDateRange = getDefaultDateRange()
      this.$nextTick(() => {
        if (this.$refs.queryForm) {
          this.$refs.queryForm.clearValidate()
        }
      })
      this.refreshData()
    },
    validateDateRange() {
      if (!Array.isArray(this.queryDateRange) || this.queryDateRange.length !== 2) {
        this.$modal.msgWarning('请完整选择查询日期')
        return false
      }
      return true
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return
      }
      const params = this.buildQueryParams(false)
      this.$confirm('是否导出当前筛选条件下的一览数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download('/activity/report/export', params, `活动报表_${formatCompactDateValue(new Date())}.xlsx`)
      }).catch(() => {})
    },
    handleOpenActivityConfig(row) {
      if (!row || !row.id) {
        this.$modal.msgWarning('活动ID不存在，无法进入配置页面')
        return
      }
      this.$router.push({
        path: '/activity/manage',
        query: {
          mode: 'edit',
          id: String(row.id),
          activityType: row.activityType || ''
        }
      })
    },
    headerCellStyle() {
      return {
        background: '#2f7df6',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        borderBottom: 'none'
      }
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    formatCount(value) {
      return this.toNumber(value).toLocaleString('en-US')
    },
    formatPercent(value) {
      return `${Math.round(this.toNumber(value))}%`
    },
    formatCurrency(value, signed = false) {
      const num = this.toNumber(value)
      const abs = Math.abs(num)
      const hasFraction = Math.abs(abs - Math.round(abs)) > 0.001
      const digits = hasFraction ? 2 : 0
      const text = abs.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      })
      if (signed) {
        if (num > 0) return `+¥${text}`
        if (num < 0) return `-¥${text}`
      }
      return `¥${text}`
    },
    resolveStatusText(status) {
      switch (Number(status)) {
        case 1:
          return '运行中'
        case 2:
          return '已暂停'
        default:
          return '-'
      }
    },
    statusClass(status) {
      switch (Number(status)) {
        case 1:
          return 'is-running'
        case 2:
          return 'is-paused'
        default:
          return ''
      }
    },
    profitClass(value) {
      const num = this.toNumber(value)
      if (num > 0) return 'is-positive'
      if (num < 0) return 'is-negative'
      return 'is-neutral'
    },
    completionRateClass(color) {
      switch (String(color || '').toUpperCase()) {
        case 'GREEN':
          return 'is-green'
        case 'ORANGE':
          return 'is-orange'
        case 'RED':
          return 'is-red'
        default:
          return ''
      }
    }
  }
}
