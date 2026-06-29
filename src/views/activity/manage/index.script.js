import ActivityForm from './components/ActivityForm'
import ActivityCommonForm from './components/ActivityCommonForm'
import { getActivityMeta, listActivities, updateActivityStatus } from '@/api/activity/manage'

const COMMON_ACTIVITY_TYPE = '30'

function createDefaultQuery(siteCode) {
  return {
    pageNum: 1,
    pageSize: 10,
    activityName: '',
    activityType: '',
    siteCode: siteCode || ''
  }
}

const ENABLED_STATUS_VALUE = '0'
const DISABLED_STATUS_VALUE = '1'
const DELETED_STATUS_VALUE = '2'

function normalizeOptions(rawOptions) {
  if (!Array.isArray(rawOptions)) {
    return []
  }
  return rawOptions
    .map(item => {
      const value = item && item.value !== undefined && item.value !== null ? String(item.value).trim() : ''
      const label = item && item.label ? item.label : value
      return { value, label }
    })
    .filter(item => !!item.value)
}

function normalizeStatusValue(status) {
  return status === null || status === undefined ? '' : String(status).trim()
}

export default {
  name: 'ActivityManage',
  components: {
    ActivityForm,
    ActivityCommonForm
  },
  data() {
    return {
      loading: false,
      total: 0,
      activityList: [],
      createDialogVisible: false,
      createCommonDialogVisible: false,
      createDialogWidth: 'auto',
      createDialogStyle: {
        padding: '0'
      },
      createDialogTop: '18px',
      createDialogKey: 0,
      meta: {
        siteReadonly: false,
        currentSiteCode: '',
        siteOptions: [],
        activityTypes: [],
        activityObjectOptions: [],
        vipLevelOptions: [],
        statusOptions: [],
        claimRuleOptions: [],
        crossTypeCombinedOptions: [],
        statisticalPeriodOptions: [],
        gameTypeOptions: [],
        newMemberTaskTypeOptions: [],
        sameTierRepeatOptions: [],
        stackHighTierOptions: [],
        dailyResetTimeOptions: [],
        activityTypeConfigTemplates: {}
      },
      queryParams: createDefaultQuery(''),
      queryDateRange: []
    }
  },
  computed: {
    isSiteReadonly() {
      return !!this.meta.siteReadonly
    },
    siteOptions() {
      return Array.isArray(this.meta.siteOptions) ? this.meta.siteOptions : []
    },
    activityTypeOptions() {
      return Array.isArray(this.meta.activityTypes) ? this.meta.activityTypes : []
    },
    statusOptions() {
      return normalizeOptions(this.meta.statusOptions)
    },
    isEditMode() {
      return this.$route.query.mode === 'edit' && !!this.$route.query.id
    },
    routeActivityId() {
      return this.$route.query.id || null
    },
    routeActivityType() {
      return this.$route.query.activityType || ''
    },
    isCommonEditMode() {
      return String(this.routeActivityType || '').trim() === COMMON_ACTIVITY_TYPE
    }
  },
  watch: {
    isEditMode(val, oldVal) {
      if (!val && oldVal) {
        this.getList()
      }
    },
    createDialogVisible(val) {
      this.handleCreateDialogVisibleChange(val)
    },
    createCommonDialogVisible(val) {
      this.handleCreateDialogVisibleChange(val)
    }
  },
  created() {
    this.bootstrap()
  },
  mounted() {
    window.addEventListener('resize', this.handleDialogResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleDialogResize)
  },
  methods: {
    async bootstrap() {
      await this.fetchMeta()
      if (!this.isEditMode) {
        this.getList()
      }
    },
    async fetchMeta() {
      const res = await getActivityMeta()
      const data = (res && res.data) || {}
      this.meta = Object.assign(
        {
          siteReadonly: false,
          currentSiteCode: '',
          siteOptions: [],
          activityTypes: [],
          activityObjectOptions: [],
          vipLevelOptions: [],
          vipLevelOptionsBySite: {},
          statusOptions: [],
          claimRuleOptions: [],
          crossTypeCombinedOptions: [],
          statisticalPeriodOptions: [],
          gameTypeOptions: [],
          newMemberTaskTypeOptions: [],
          sameTierRepeatOptions: [],
          stackHighTierOptions: [],
          dailyResetTimeOptions: [],
          activityTypeConfigTemplates: {}
        },
        data
      )
      if (this.isSiteReadonly) {
        this.queryParams.siteCode = this.meta.currentSiteCode || ''
      }
    },
    buildListQuery() {
      const query = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        activityName: this.queryParams.activityName || undefined,
        activityType: this.queryParams.activityType || undefined,
        siteCode: (this.isSiteReadonly ? this.meta.currentSiteCode : this.queryParams.siteCode) || undefined
      }
      if (Array.isArray(this.queryDateRange) && this.queryDateRange.length === 2) {
        query.queryStartDate = this.queryDateRange[0]
        query.queryEndDate = this.queryDateRange[1]
      }
      return query
    },
    async getList() {
      this.loading = true
      try {
        const res = await listActivities(this.buildListQuery())
        this.activityList = Array.isArray(res.rows) ? res.rows : []
        this.total = res.total || 0
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = createDefaultQuery(this.isSiteReadonly ? this.meta.currentSiteCode : '')
      this.queryDateRange = []
      this.$nextTick(() => {
        if (this.$refs.queryForm) {
          this.$refs.queryForm.clearValidate()
        }
      })
      this.getList()
    },
    syncCreateDialogLayout() {
      if (!this.$refs.tableCard || !this.$refs.pageTitle) {
        return
      }
      const tableRect = this.$refs.tableCard.getBoundingClientRect()
      const titleRect = this.$refs.pageTitle.getBoundingClientRect()
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1440
      const safeLeft = Math.max(8, Math.round(titleRect.left) - 8)
      const safeTop = Math.max(10, Math.round(titleRect.top) - 4)
      const rightGap = 8
      const contentWidth = Math.max(Math.round(tableRect.right - safeLeft), Math.round(tableRect.width) + 16)
      const maxWidth = Math.max(360, viewportWidth - safeLeft - rightGap)
      const width = Math.max(360, Math.min(contentWidth, maxWidth))
      this.createDialogWidth = width + 'px'
      this.createDialogStyle = {
        padding: safeTop + 'px ' + rightGap + 'px 0 ' + safeLeft + 'px'
      }
      this.createDialogTop = '0px'
    },
    handleDialogResize() {
      if (this.createDialogVisible || this.createCommonDialogVisible) {
        this.syncCreateDialogLayout()
      }
    },
    handleCreateDialogVisibleChange(val) {
      if (!val) {
        return
      }
      this.$nextTick(() => {
        this.syncCreateDialogLayout()
      })
    },
    handleAdd() {
      this.createDialogKey += 1
      this.createDialogVisible = true
    },
    handleAddCommon() {
      this.createDialogKey += 1
      this.createCommonDialogVisible = true
    },
    handleCreateSuccess() {
      this.createDialogVisible = false
      this.createCommonDialogVisible = false
      this.handleQuery()
    },
    handleConfig(row) {
      if (!row || !row.id) {
        this.$modal.msgWarning('活动ID不存在，无法进入配置页面')
        return
      }
      this.$router.replace({
        path: this.$route.path,
        query: {
          mode: 'edit',
          id: String(row.id),
          activityType: row.activityType || ''
        }
      })
    },
    handleDelete(row) {
      if (!row || !row.id) {
        this.$modal.msgWarning('活动ID不存在，无法删除')
        return
      }
      const activityName = row.activityName || row.activityCode || row.id
      this.$modal.confirm(`是否确认删除活动"${activityName}"？删除后活动列表不再显示。`).then(() => {
        return updateActivityStatus(row.id, DELETED_STATUS_VALUE)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    exitEditMode() {
      this.$router.replace({ path: this.$route.path, query: {} })
    },
    handleEditSuccess() {
      this.exitEditMode()
    },
    activityTypeLabel(value) {
      const normalized = String(value || '').trim()
      if (!normalized) {
        return '-'
      }
      const matched = this.activityTypeOptions.find(item => {
        return item && (String(item.value) === normalized || String(item.label) === normalized)
      })
      return (matched && matched.label) || normalized
    },
    getStatusMeta(status) {
      const value = normalizeStatusValue(status)
      const matched = this.statusOptions.find(item => item.value === value)
      let className = 'is-ended'
      if (value === ENABLED_STATUS_VALUE) {
        className = 'is-enabled'
      } else if (value === DISABLED_STATUS_VALUE) {
        className = 'is-disabled'
      }
      return {
        text: (matched && matched.label) || value || '-',
        className
      }
    },
    formatEndTime(value) {
      return value ? (this.parseTime(value, '{y}-{m}-{d}') || '-') : '长期有效'
    }
  }
}
