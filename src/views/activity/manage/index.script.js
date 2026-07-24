import ActivityForm from './components/ActivityForm'
import ActivityCommonForm from './components/ActivityCommonForm'
import { getActivityMeta, listActivities, updateActivityStatus } from '@/api/activity/manage'
import { DEFAULT_TYPE_OPTIONS, getActivityTypeDescription, normalizeActivityTypeValue, resolveActivityTypeRequestValue } from './components/activityTypeSchemas'

const COMMON_ACTIVITY_TYPE = '30'
const FIRST_DEPOSIT_ACTIVITY_TYPE = '26'
const COMMON_ACTIVITY_TYPE_LABEL = '通用活动'
const CREATE_ACTIVITY_TYPE_ORDER = ['新人礼', '签到', '首存活动', COMMON_ACTIVITY_TYPE_LABEL, '累充', '每日投注额度+笔数', '连续每日投注', '连胜', '胜率']
const ENABLED_CREATE_ACTIVITY_TYPES = new Set(['新人礼', '签到', '首存活动', COMMON_ACTIVITY_TYPE_LABEL, '累充', '每日投注额度+笔数'])
const CREATE_ACTIVITY_TYPE_DISPLAY_LABELS = {
  '累充': '累充活动',
  '每日投注额度+笔数': '有效投注额'
}
const ACTIVITY_LIST_FILTER_TYPE_OPTIONS = [
  { value: '25', label: '新人礼' },
  { value: '27', label: '签到' },
  { value: '26', label: '首存活动' },
  { value: COMMON_ACTIVITY_TYPE, label: COMMON_ACTIVITY_TYPE_LABEL },
  { value: '21', label: '累充活动' },
  { value: '24', label: '有效投注额' }
]
const ACTIVITY_LIST_FILTER_TAG_OPTIONS = ['最新', '新人', '限时', '日常', '体育', 'VIP'].map(value => ({
  value,
  label: value
}))

function createDefaultQuery(siteCode) {
  return {
    pageNum: 1,
    pageSize: 10,
    activityName: '',
    activityType: [],
    activityTag: [],
    siteCode: siteCode ? [siteCode] : []
  }
}

function normalizeQueryValues(value) {
  return Array.isArray(value)
    ? value.map(item => String(item || '').trim()).filter(Boolean)
    : String(value || '').split(',').map(item => item.trim()).filter(Boolean)
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
      createCommonDialogVisible: false,
      activityTypeDialogVisible: false,
      activityTypesPreviewVisible: false,
      activityTypesPreviewList: [],
      selectedCreateActivityType: '',
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
      displayTimeRange: [],
      activityTimeRange: []
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
      return ACTIVITY_LIST_FILTER_TYPE_OPTIONS
    },
    activityTagOptions() {
      return ACTIVITY_LIST_FILTER_TAG_OPTIONS
    },
    createActivityTypeOptions() {
      const rawOptions = DEFAULT_TYPE_OPTIONS.concat({
        value: COMMON_ACTIVITY_TYPE,
        label: COMMON_ACTIVITY_TYPE_LABEL,
        description: '适用于活动文案、图片和基础规则配置的通用活动'
      })
      return rawOptions
        .map(item => {
          const value = resolveActivityTypeRequestValue(item.value || item.label, { activityTypes: rawOptions })
          const rawLabel = item.label || normalizeActivityTypeValue(item.value || value, { activityTypes: rawOptions })
          const typeKey = normalizeActivityTypeValue(rawLabel || value, { activityTypes: rawOptions })
          return {
            value,
            label: CREATE_ACTIVITY_TYPE_DISPLAY_LABELS[typeKey] || rawLabel,
            description: item.description || getActivityTypeDescription(typeKey, { activityTypes: rawOptions }),
            disabled: !ENABLED_CREATE_ACTIVITY_TYPES.has(typeKey),
            sortIndex: CREATE_ACTIVITY_TYPE_ORDER.indexOf(typeKey) === -1
              ? CREATE_ACTIVITY_TYPE_ORDER.length
              : CREATE_ACTIVITY_TYPE_ORDER.indexOf(typeKey)
          }
        })
        .filter(item => item.value)
        .sort((left, right) => {
          if (left.sortIndex !== right.sortIndex) {
            return left.sortIndex - right.sortIndex
          }
          return String(left.label).localeCompare(String(right.label), 'zh-Hans-CN')
        })
    },
    statusOptions() {
      return normalizeOptions(this.meta.statusOptions)
    },
    isEditMode() {
      return this.$route.query.mode === 'edit' && !!this.$route.query.id
    },
    isCreateMode() {
      return this.$route.query.mode === 'create' && !!this.$route.query.activityType
    },
    isFormMode() {
      return this.isEditMode || this.isCreateMode
    },
    routeActivityId() {
      return this.$route.query.id || null
    },
    routeActivityType() {
      return this.$route.query.activityType || ''
    },
    routeActivityTypeLabel() {
      const rawOptions = DEFAULT_TYPE_OPTIONS.concat({ value: COMMON_ACTIVITY_TYPE, label: COMMON_ACTIVITY_TYPE_LABEL })
      const routeTypeLabel = normalizeActivityTypeValue(this.routeActivityType, { activityTypes: rawOptions })
      return CREATE_ACTIVITY_TYPE_DISPLAY_LABELS[routeTypeLabel] || routeTypeLabel || '活动'
    },
    isCommonEditMode() {
      return String(this.routeActivityType || '').trim() === COMMON_ACTIVITY_TYPE
    },
    isFirstDepositCreateMode() {
      return this.isCreateMode && String(this.routeActivityType || '').trim() === FIRST_DEPOSIT_ACTIVITY_TYPE
    },
    isFirstDepositEditMode() {
      return this.isEditMode && String(this.routeActivityType || '').trim() === FIRST_DEPOSIT_ACTIVITY_TYPE
    },
    isFirstDepositMode() {
      return this.isFirstDepositCreateMode || this.isFirstDepositEditMode
    },
    formPageTitle() {
      if (this.isFirstDepositCreateMode) {
        return '新增首存活动'
      }
      if (this.isFirstDepositEditMode) {
        return '修改首存活动'
      }
      if (this.isCreateMode) {
        const routeTypeLabel = this.routeActivityTypeLabel
        return '新增' + routeTypeLabel
      }
      return this.isCommonEditMode ? '编辑通用活动' : '编辑活动'
    },
    formPageSubtitle() {
      if (this.isCreateMode) {
        return '配置已选择的活动类型、活动信息、奖励档位和规则内容。'
      }
      return this.isCommonEditMode ? '维护通用活动基础信息、展示图片和上下架状态。' : '维护活动信息、奖励档位和规则配置。'
    },
    activityFormKey() {
      if (this.isCreateMode) {
        return 'create-page-' + this.routeActivityType
      }
      return 'edit-' + this.routeActivityId + '-' + this.routeActivityType
    }
  },
  watch: {
    isFormMode(val, oldVal) {
      if (!val && oldVal) {
        this.getList()
      }
    },
    createCommonDialogVisible(val) {
      this.handleCreateDialogVisibleChange(val)
    },
    activityTypeDialogVisible(val) {
      if (!val) {
        return
      }
      if (!this.selectedCreateActivityType) {
        const firstEnabledType = this.createActivityTypeOptions.find(item => !item.disabled)
        this.selectedCreateActivityType = firstEnabledType ? firstEnabledType.value : ''
      }
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
      if (!this.isFormMode) {
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
        this.queryParams.siteCode = this.meta.currentSiteCode ? [this.meta.currentSiteCode] : []
      }
    },
    buildListQuery() {
      const activityTypes = normalizeQueryValues(this.queryParams.activityType)
      const activityTags = normalizeQueryValues(this.queryParams.activityTag)
      const siteCodes = this.isSiteReadonly
        ? normalizeQueryValues(this.meta.currentSiteCode)
        : normalizeQueryValues(this.queryParams.siteCode)
      const query = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        activityName: this.queryParams.activityName || undefined,
        activityType: activityTypes.length ? activityTypes.join(',') : undefined,
        activityTag: activityTags.length ? activityTags.join(',') : undefined,
        siteCode: siteCodes.length ? siteCodes.join(',') : undefined
      }
      if (Array.isArray(this.displayTimeRange) && this.displayTimeRange.length === 2) {
        query.displayStartTime = this.displayTimeRange[0]
        query.displayEndTime = this.displayTimeRange[1]
      }
      if (Array.isArray(this.activityTimeRange) && this.activityTimeRange.length === 2) {
        query.activityStartTime = this.activityTimeRange[0]
        query.activityEndTime = this.activityTimeRange[1]
      }
      return query
    },
    async queryActivityNameSuggestions(keyword, callback) {
      try {
        const res = await listActivities({
          pageNum: 1,
          pageSize: 100,
          activityName: String(keyword || '').trim() || undefined
        })
        const seen = new Set()
        const suggestions = (Array.isArray(res && res.rows) ? res.rows : [])
          .map(item => String(item && item.activityName || '').trim())
          .filter(name => name && !seen.has(name) && seen.add(name))
          .map(value => ({ value }))
        callback(suggestions)
      } catch (error) {
        callback([])
      }
    },
    handleActivityNameSelect() {
      this.handleQuery()
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
      this.displayTimeRange = []
      this.activityTimeRange = []
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
      if (this.createCommonDialogVisible) {
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
      const firstEnabledType = this.createActivityTypeOptions.find(item => !item.disabled)
      this.selectedCreateActivityType = firstEnabledType ? firstEnabledType.value : ''
      this.activityTypeDialogVisible = true
    },
    handleSelectCreateActivityType(item) {
      if (!item || item.disabled) {
        return
      }
      this.selectedCreateActivityType = item.value
    },
    handleConfirmCreateActivityType() {
      if (!this.selectedCreateActivityType) {
        this.$message.warning('请选择活动类型')
        return
      }
      this.activityTypeDialogVisible = false
      if (String(this.selectedCreateActivityType) === COMMON_ACTIVITY_TYPE) {
        this.$nextTick(() => {
          this.handleAddCommon()
        })
        return
      }
      this.$router.replace({
        path: this.$route.path,
        query: {
          mode: 'create',
          activityType: this.selectedCreateActivityType
        }
      })
    },
    handleAddCommon() {
      this.createDialogKey += 1
      this.createCommonDialogVisible = true
    },
    handleCreateSuccess() {
      this.createCommonDialogVisible = false
      if (this.isFormMode) {
        this.exitEditMode()
        return
      }
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
      if (this.isActivityEnabled(row)) {
        this.$modal.msgWarning('启用状态的活动不可删除，请先禁用')
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
    handleStatusSwitchChange(row, nextStatus) {
      const normalizedNextStatus = normalizeStatusValue(nextStatus)
      const previousStatus = normalizedNextStatus === ENABLED_STATUS_VALUE
        ? DISABLED_STATUS_VALUE
        : ENABLED_STATUS_VALUE
      if (!row || !row.id) {
        if (row) {
          row.status = previousStatus
        }
        this.$modal.msgWarning('活动ID不存在，无法修改状态')
        return
      }
      updateActivityStatus(row.id, normalizedNextStatus).then(() => {
        const statusText = normalizedNextStatus === ENABLED_STATUS_VALUE ? '启用' : '禁用'
        this.$modal.msgSuccess(statusText + '成功')
      }).catch(() => {
        row.status = previousStatus
      })
    },
    isActivityEnabled(row) {
      return normalizeStatusValue(row && row.status) === ENABLED_STATUS_VALUE
    },
    exitEditMode() {
      this.$router.replace({ path: this.$route.path, query: {} })
    },
    handleEditSuccess() {
      this.exitEditMode()
    },
    handleFormSuccess() {
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
      const fallback = DEFAULT_TYPE_OPTIONS.find(item => String(item.value) === normalized)
      return (matched && matched.label) || (fallback && fallback.label) || normalized
    },
    activityTypeLabels(row) {
      const rawTypes = Array.isArray(row && row.activityTypes) && row.activityTypes.length
        ? row.activityTypes
        : String(row && row.activityType || '').split(',')
      const seen = new Set()
      return rawTypes
        .map(value => String(value || '').trim())
        .filter(value => value && !seen.has(value) && seen.add(value))
        .map(value => ({
          value,
          label: this.activityTypeLabel(value)
        }))
    },
    showActivityTypes(row) {
      this.activityTypesPreviewList = this.activityTypeLabels(row)
      this.activityTypesPreviewVisible = true
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
        text: value === ENABLED_STATUS_VALUE ? '启用' : value === DISABLED_STATUS_VALUE ? '禁用' : (matched && matched.label) || value || '-',
        className
      }
    },
    formatEndTime(value) {
      return value ? (this.parseTime(value, '{y}-{m}-{d}') || '-') : '长期有效'
    },
    formatActivityRange(beginTime, endTime) {
      const begin = beginTime ? this.parseTime(beginTime, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
      const end = endTime ? this.parseTime(endTime, '{y}-{m}-{d} {h}:{i}:{s}') : '长期有效'
      return begin + ' ~ ' + end
    }
  }
}
