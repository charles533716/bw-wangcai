import {
  cloneActivityTypeState,
  createNewcomerRewardItem,
  createDefaultActivityTypeState,
  createNormalizedActivityTypeState,
  getActivityTypeSchema,
  normalizeActivityTypeValue
} from './activityTypeSchemas'

function normalizeGameTypeOption(item) {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const value = String(item.value || item.label || '').trim()
    const label = String(item.label || item.value || '').trim()
    return value ? { value: value, label: label || value } : null
  }
  const value = String(item || '').trim()
  return value ? { value: value, label: value } : null
}

export default {
  name: 'ActivityTypeDynamicSections',
  props: {
    form: {
      type: Object,
      required: true
    },
    activityType: {
      type: String,
      default: ''
    },
    optionSources: {
      type: Object,
      default: function() {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      typeStateCache: {}
    }
  },
  computed: {
    currentTypeKey() {
      return normalizeActivityTypeValue(this.activityType || this.form.activityType, this.optionSources)
    },
    currentSchema() {
      return getActivityTypeSchema(this.currentTypeKey, this.optionSources)
    },
    currentTemplate() {
      const templates = this.optionSources && this.optionSources.activityTypeConfigTemplates ? this.optionSources.activityTypeConfigTemplates : {}
      return templates && templates[this.currentTypeKey] ? templates[this.currentTypeKey] : null
    },
    rewardGridStyle() {
      return {
        gridTemplateColumns: this.currentSchema.rewardGridTemplate
      }
    },
    signinGridStyle() {
      const tierCount = Array.isArray(this.form.rewardItems) ? this.form.rewardItems.length : 0
      return {
        gridTemplateColumns: '150px repeat(' + Math.max(tierCount, 1) + ', minmax(180px, 1fr))'
      }
    },
    signinWeekdays() {
      return [
        { value: '1', label: '周一' },
        { value: '2', label: '周二' },
        { value: '3', label: '周三' },
        { value: '4', label: '周四' },
        { value: '5', label: '周五' },
        { value: '6', label: '周六' },
        { value: '7', label: '周日' }
      ]
    },
    shouldShowBaseConfig() {
      return Boolean(this.currentSchema.baseCaption && (this.currentSchema.baseFields.length || this.currentSchema.showGameTypes))
    },
    hasBaseSection() {
      return Boolean(this.currentSchema.baseFields.length || this.currentSchema.showGameTypes)
    },
    resolvedBaseFields() {
      return this.currentSchema.baseFields.map(field => {
        const templateItem = this.resolveTemplateBaseField(field.key)
        return Object.assign({}, field, {
          label: templateItem && templateItem.name ? templateItem.name : field.label,
          tip: templateItem && templateItem.description ? templateItem.description : field.tip,
          options: this.resolveFieldOptions(field)
        })
      })
    },
    resolvedRuleOptions() {
      const templateItems = this.currentTemplate && Array.isArray(this.currentTemplate.enableConfig) ? this.currentTemplate.enableConfig : []
      if (templateItems.length) {
        const seenKeys = new Set()
        return templateItems
          .map(item => ({
            key: item && (item.code || item.key) ? (item.code || item.key) : '',
            label: item && (item.name || item.label) ? (item.name || item.label) : '',
            description: item && item.description ? item.description : ''
          }))
          .filter(item => {
            if (!item.key || seenKeys.has(item.key)) {
              return false
            }
            seenKeys.add(item.key)
            return true
          })
      }
      return this.currentSchema.ruleOptions
    },
    gameTypeOptions() {
      const baseOptions = Array.isArray(this.optionSources.gameTypeOptions)
        ? this.optionSources.gameTypeOptions.map(normalizeGameTypeOption).filter(item => !!item)
        : []
      const optionValues = baseOptions.map(item => item.value)
      ;(Array.isArray(this.form.gameTypes) ? this.form.gameTypes : []).forEach(item => {
        const value = String(item || '').trim()
        if (value && optionValues.indexOf(value) === -1) {
          baseOptions.push({ value: value, label: value })
          optionValues.push(value)
        }
      })
      return baseOptions
    },
    fullSignFlgOptions() {
      const options = Array.isArray(this.optionSources.fullSignFlgOptions)
        ? this.optionSources.fullSignFlgOptions
          .map(item => ({
            value: String(item && item.value !== undefined ? item.value : '').trim(),
            label: item && item.label ? item.label : ''
          }))
          .filter(item => item.value !== '')
        : []
      return options.length ? options : [
        { value: '0', label: '无满签奖励' },
        { value: '1', label: '有满签奖励' }
      ]
    },
    newMemberTaskTypeOptions() {
      return Array.isArray(this.optionSources.newMemberTaskTypeOptions)
        ? this.optionSources.newMemberTaskTypeOptions
          .map(item => ({
            value: String(item && item.value !== undefined ? item.value : '').trim(),
            label: item && item.label ? item.label : ''
          }))
          .filter(item => item.value !== '')
        : []
    },
    newcomerTaskSeqMap() {
      if (this.currentTypeKey !== '新人礼') {
        return {}
      }
      return (Array.isArray(this.form.rewardItems) ? this.form.rewardItems : []).reduce((result, item) => {
        const taskType = this.normalizeNewcomerTaskType(this.getExtraConfigValue(item, 'taskType', ''))
        const taskSeq = Number(this.getExtraConfigValue(item, 'taskSeq', 1))
        if (!taskType) {
          return result
        }
        result[taskType] = Math.max(result[taskType] || 0, Number.isNaN(taskSeq) ? 1 : taskSeq)
        return result
      }, {})
    },
    nextFirstDepositTaskSeq() {
      return (this.newcomerTaskSeqMap['1'] || 0) + 1
    },
    nextCumulativeTaskSeq() {
      return (this.newcomerTaskSeqMap['5'] || 0) + 1
    },
    canAddRewardItem() {
      return this.currentTypeKey !== '新人礼'
    }
  },
  methods: {
    normalizeNewcomerTaskType(taskType) {
      const normalized = String(taskType === undefined || taskType === null ? '' : taskType).trim()
      if (!/^\d+$/.test(normalized)) {
        return normalized
      }
      return Number(normalized) >= 6 ? '5' : normalized
    },
    resolveTemplateBaseField(code) {
      const items = this.currentTemplate && Array.isArray(this.currentTemplate.baseConfig) ? this.currentTemplate.baseConfig : []
      return items.find(item => item && item.code === code) || null
    },
    resolveFieldOptions(field) {
      const optionMap = {
        crossTypeCombined: this.optionSources.crossTypeCombinedOptions,
        statisticalPeriod: this.optionSources.statisticalPeriodOptions,
        sameTierRepeatable: this.optionSources.sameTierRepeatOptions,
        stackHighTierReward: this.optionSources.stackHighTierOptions,
        dailyResetTime: this.optionSources.dailyResetTimeOptions
      }
      return Array.isArray(optionMap[field.key]) && optionMap[field.key].length ? optionMap[field.key] : field.options
    },
    resetTypeCache(activityType) {
      const normalizedState = createNormalizedActivityTypeState(activityType, this.captureCurrentState(), this.optionSources)
      this.applyTypeState(normalizedState)
      this.typeStateCache = {}
      this.typeStateCache[normalizeActivityTypeValue(activityType, this.optionSources)] = cloneActivityTypeState(normalizedState)
      this.$nextTick(() => this.syncNewcomerTaskSummaries())
    },
    handleTypeChange(previousType, nextType) {
      const previousKey = normalizeActivityTypeValue(previousType, this.optionSources)
      const nextKey = normalizeActivityTypeValue(nextType, this.optionSources)
      this.typeStateCache[previousKey] = cloneActivityTypeState(this.captureCurrentState())
      const nextState = this.typeStateCache[nextKey] || createDefaultActivityTypeState(nextType, this.optionSources)
      const normalizedNextState = createNormalizedActivityTypeState(nextType, nextState, this.optionSources)
      this.applyTypeState(normalizedNextState)
      this.typeStateCache[nextKey] = cloneActivityTypeState(normalizedNextState)
      this.$nextTick(() => this.syncNewcomerTaskSummaries())
    },
    captureCurrentState() {
      return {
        crossTypeCombined: this.form.crossTypeCombined,
        statisticalPeriod: this.form.statisticalPeriod,
        minimumValidBet: this.form.minimumValidBet,
        gameTypes: Array.isArray(this.form.gameTypes) ? this.form.gameTypes.slice() : [],
        baseConfigExtra: Object.assign({}, this.form.baseConfigExtra || {}),
        rewardItems: Array.isArray(this.form.rewardItems)
          ? this.form.rewardItems.map(item => ({
            taskName: item.taskName || '',
            targetCount: item.targetCount,
            targetValidBetAmount: item.targetValidBetAmount,
            rewardAmount: item.rewardAmount,
            taskSummary: item.taskSummary || '',
            enabled: item.enabled !== false,
            extraConfig: Object.assign({}, item.extraConfig || {})
          }))
          : [],
        ruleSwitches: Object.assign({}, this.form.ruleSwitches || {})
      }
    },
    applyTypeState(state) {
      this.$set(this.form, 'crossTypeCombined', state.crossTypeCombined)
      this.$set(this.form, 'statisticalPeriod', state.statisticalPeriod)
      this.$set(this.form, 'minimumValidBet', state.minimumValidBet)
      this.$set(this.form, 'gameTypes', Array.isArray(state.gameTypes) ? state.gameTypes.slice() : [])
      this.$set(this.form, 'baseConfigExtra', Object.assign({}, state.baseConfigExtra || {}))
      this.$set(this.form, 'rewardItems', Array.isArray(state.rewardItems)
        ? state.rewardItems.map(item => ({
          taskName: item.taskName || '',
          targetCount: item.targetCount,
          targetValidBetAmount: item.targetValidBetAmount,
          rewardAmount: item.rewardAmount,
          taskSummary: item.taskSummary || '',
          enabled: item.enabled !== false,
          extraConfig: Object.assign({}, item.extraConfig || {})
        }))
        : [])
      this.$set(this.form, 'ruleSwitches', Object.assign({}, state.ruleSwitches || {}))
    },
    getBaseFieldValue(field) {
      if (field.source === 'extra') {
        return (this.form.baseConfigExtra || {})[field.key]
      }
      return this.form[field.key]
    },
    isCenteredRewardColumn(column) {
      return ['switch', 'action'].indexOf(column && column.type) > -1
    },
    setBaseFieldValue(field, value) {
      if (field.source === 'extra') {
        if (!this.form.baseConfigExtra) {
          this.$set(this.form, 'baseConfigExtra', {})
        }
        this.$set(this.form.baseConfigExtra, field.key, value)
        return
      }
      this.$set(this.form, field.key, value)
    },
    getRewardFieldValue(item, column) {
      if (!column.field) {
        return undefined
      }
      if (column.field.indexOf('extraConfig.') === 0) {
        const key = column.field.replace('extraConfig.', '')
        return this.getExtraConfigValue(item, key)
      }
      return item[column.field]
    },
    getRewardStaticText(item, column) {
      if (this.currentTypeKey === '新人礼' && column && column.key === 'taskName') {
        return this.getNewcomerTaskLabel(item)
      }
      return this.getRewardFieldValue(item, column)
    },
    getNewcomerTaskLabel(item) {
      const taskType = this.normalizeNewcomerTaskType(this.getExtraConfigValue(item, 'taskType', ''))
      const taskSeq = String(this.getExtraConfigValue(item, 'taskSeq', 1)).trim() || '1'
      const options = Array.isArray(this.optionSources.newMemberTaskTypeOptions) ? this.optionSources.newMemberTaskTypeOptions : []
      const matched = options.find(option => option && String(option.value) === taskType)
      let baseLabel = (matched && matched.label) || item.taskName || ''
      if ((taskType === '1' || taskType === '5') && /\d+$/.test(baseLabel)) {
        baseLabel = baseLabel.replace(/\d+$/, '')
      }
      if (taskType === '1' || taskType === '5') {
        return baseLabel + taskSeq
      }
      return baseLabel
    },
    setRewardFieldValue(item, column, value) {
      if (!column.field) {
        return
      }
      if (this.isAutoTaskSummaryColumn(column)) {
        this.$set(item, column.field, value)
        return
      }
      if (column.field.indexOf('extraConfig.') === 0) {
        const key = column.field.replace('extraConfig.', '')
        this.setExtraConfigValue(item, key, value)
        return
      }
      this.$set(item, column.field, value)
    },
    getExtraConfigValue(item, key, fallback) {
      const extraConfig = item && item.extraConfig ? item.extraConfig : {}
      return extraConfig[key] === undefined ? fallback : extraConfig[key]
    },
    setExtraConfigValue(item, key, value) {
      if (!item.extraConfig) {
        this.$set(item, 'extraConfig', {})
      }
      this.$set(item.extraConfig, key, value)
      if (this.currentTypeKey === '新人礼') {
        this.syncNewcomerTaskSummary(item, true)
      }
    },
    resolvePositiveMin(precision) {
      return precision && Number(precision) > 0 ? 0.01 : 1
    },
    resolveRewardNumberMin(column) {
      if (this.currentTypeKey === '新人礼') {
        return this.resolvePositiveMin(column && column.precision)
      }
      return 0
    },
    buildNewcomerConditionLines(item) {
      const taskCode = this.getNewcomerTaskCode(item)
      const validDaysSegments = [
        { type: 'text', text: '注册后有效期 ≤' },
        { type: 'input', key: 'validDays', width: 60 }
      ]
      const buildValidDaysLine = segments => {
        const tailSegments = Array.isArray(segments) ? segments : []
        const firstSegment = tailSegments[0]
        if (firstSegment && firstSegment.type === 'text') {
          return validDaysSegments.concat([
            Object.assign({}, firstSegment, { text: '天，' + firstSegment.text })
          ], tailSegments.slice(1))
        }
        return validDaysSegments.concat([{ type: 'text', text: '天' }], tailSegments)
      }
      if (taskCode === 'realName') {
        return [buildValidDaysLine([{ type: 'text', text: '完成手机号绑定 + 实名认证' }])]
      }
      if (taskCode === 'firstDeposit' || taskCode === 'cumulativeDeposit' || taskCode === 'cumulativeDepositCustom') {
        const depositLabel = taskCode === 'firstDeposit' ? '新人首充存款金额' : '累计存款金额'
        return [buildValidDaysLine([
          { type: 'text', text: depositLabel + ' ≥' },
          { type: 'input', key: 'accumulatedDeposit', width: 72, precision: 0 },
          { type: 'text', text: '元' }
        ])]
      }
      if (taskCode === 'withdrawal') {
        return [buildValidDaysLine([
          { type: 'text', text: '完成取款次数 ≥' },
          { type: 'input', key: 'withdrawalCount', width: 56 },
          { type: 'text', text: '次' }
        ])]
      }
      if (taskCode === 'active') {
        return [
          buildValidDaysLine([
            { type: 'text', text: '累计签到 ≥' },
            { type: 'input', key: 'signInDays', width: 56 },
            { type: 'text', text: '天' }
          ]),
          [
            { type: 'text', text: '每日累计存款 ≥' },
            { type: 'input', key: 'dailyDeposit', width: 72, precision: 0 },
            { type: 'text', text: '元' }
          ],
          [
            { type: 'text', text: '每日有效投注 ≥' },
            { type: 'input', key: 'dailyValidBet', width: 84, precision: 0 },
            { type: 'text', text: '元' }
          ]
        ]
      }
      if (taskCode === 'revive') {
        return [buildValidDaysLine([
          { type: 'text', text: '累计负盈利 ≥' },
          { type: 'input', key: 'negativeProfit', width: 84, precision: 0 },
          { type: 'text', text: '元' }
        ])]
      }
      return [buildValidDaysLine()]
    },
    isAutoTaskSummaryColumn(column) {
      return this.currentTypeKey === '新人礼' && column && column.field === 'taskSummary'
    },
    buildNewcomerConditionSummary(item) {
      return this.buildNewcomerConditionLines(item)
        .map(line => line.map(segment => {
          if (segment.type === 'text') {
            return segment.text
          }
          const value = this.getExtraConfigValue(item, segment.key, '')
          return value === undefined || value === null || value === '' ? '' : String(value)
        }).join(' '))
        .map(line => line.replace(/\s+/g, ' ').trim())
        .map(line => line.replace(/，\s+/g, '，'))
        .filter(line => !!line)
        .join('；')
    },
    syncNewcomerTaskSummary(item, force) {
      if (!item || this.currentTypeKey !== '新人礼') {
        return
      }
      const summary = this.buildNewcomerConditionSummary(item)
      const currentSummary = item.taskSummary === undefined || item.taskSummary === null ? '' : String(item.taskSummary)
      const previousAutoSummary = item._autoTaskSummary === undefined || item._autoTaskSummary === null ? '' : String(item._autoTaskSummary)
      if (force || !currentSummary.trim() || currentSummary === previousAutoSummary) {
        this.$set(item, 'taskSummary', summary)
      }
      this.$set(item, '_autoTaskSummary', summary)
    },
    syncNewcomerTaskSummaries() {
      if (this.currentTypeKey !== '新人礼' || !Array.isArray(this.form.rewardItems)) {
        return
      }
      this.form.rewardItems.forEach(item => this.syncNewcomerTaskSummary(item))
    },
    getNewcomerTaskCode(item) {
      const taskType = this.normalizeNewcomerTaskType(this.getExtraConfigValue(item, 'taskType', ''))
      if (taskType === '0') {
        return 'realName'
      }
      if (taskType === '1') {
        return 'firstDeposit'
      }
      if (taskType === '2') {
        return 'withdrawal'
      }
      if (taskType === '3') {
        return 'active'
      }
      if (taskType === '4') {
        return 'revive'
      }
      if (taskType) {
        return 'cumulativeDepositCustom'
      }
      return this.getExtraConfigValue(item, 'taskCode', '')
    },
    handleAddRewardItem() {
      if (!this.canAddRewardItem) {
        return
      }
      if (this.currentTypeKey === '签到' && this.form.rewardItems.length >= 6) {
        this.$message.error('奖励档位最多支持配置6个档位！')
        return
      }
      const item = this.currentSchema.createRewardItem(this.form.rewardItems.length)
      if (this.currentTypeKey === '签到') {
        const previousItem = this.form.rewardItems[this.form.rewardItems.length - 1]
        const previousBetAmount = Number(previousItem && previousItem.targetValidBetAmount)
        this.$set(item, 'targetValidBetAmount', Number.isFinite(previousBetAmount) && previousBetAmount > 0 ? previousBetAmount * 2 : 100)
      }
      this.form.rewardItems.push(item)
    },
    handleAddNewcomerRewardItem(taskType) {
      const taskSeq = taskType === '1' ? this.nextFirstDepositTaskSeq : this.nextCumulativeTaskSeq
      this.form.rewardItems.push(createNewcomerRewardItem(taskType, taskSeq, this.optionSources))
      this.sortNewcomerRewardItems()
      this.$nextTick(() => this.syncNewcomerTaskSummaries())
    },
    sortNewcomerRewardItems() {
      if (this.currentTypeKey !== '新人礼' || !Array.isArray(this.form.rewardItems)) {
        return
      }
      const nextItems = this.form.rewardItems.slice().sort((left, right) => {
        const leftType = Number(this.normalizeNewcomerTaskType(this.getExtraConfigValue(left, 'taskType', '')))
        const rightType = Number(this.normalizeNewcomerTaskType(this.getExtraConfigValue(right, 'taskType', '')))
        if (leftType !== rightType) {
          return leftType - rightType
        }
        const leftSeq = Number(this.getExtraConfigValue(left, 'taskSeq', 1))
        const rightSeq = Number(this.getExtraConfigValue(right, 'taskSeq', 1))
        return leftSeq - rightSeq
      })
      this.$set(this.form, 'rewardItems', nextItems)
    },
    canRemoveRewardItem(index) {
      if (this.currentTypeKey !== '新人礼') {
        return true
      }
      const item = this.form.rewardItems[index]
      const taskType = this.normalizeNewcomerTaskType(this.getExtraConfigValue(item, 'taskType', ''))
      if (taskType !== '1' && taskType !== '5') {
        return false
      }
      const sameTypeItems = this.form.rewardItems.filter(row => this.normalizeNewcomerTaskType(this.getExtraConfigValue(row, 'taskType', '')) === taskType)
      if (sameTypeItems.length <= 1) {
        return false
      }
      const taskSeq = Number(this.getExtraConfigValue(item, 'taskSeq', 1))
      const maxTaskSeq = Math.max.apply(null, sameTypeItems.map(row => Number(this.getExtraConfigValue(row, 'taskSeq', 1)) || 1))
      return taskSeq === maxTaskSeq
    },
    handleRemoveRewardItem(index) {
      if (!this.canRemoveRewardItem(index)) {
        return
      }
      this.form.rewardItems.splice(index, 1)
    },
    ensureSigninExtraConfig(item) {
      if (!item.extraConfig) {
        this.$set(item, 'extraConfig', {})
      }
      if (!item.extraConfig.weekdayRewards) {
        this.$set(item.extraConfig, 'weekdayRewards', {})
      }
      return item.extraConfig
    },
    setSigninTierBet(item, value) {
      this.$set(item, 'targetValidBetAmount', value)
    },
    getSigninWeekdayReward(item, weekday) {
      const extra = item && item.extraConfig ? item.extraConfig : {}
      const rewards = extra.weekdayRewards || {}
      const value = rewards[String(weekday)]
      return value === undefined || value === null ? 0 : value
    },
    setSigninWeekdayReward(item, weekday, value) {
      const extra = this.ensureSigninExtraConfig(item)
      this.$set(extra.weekdayRewards, String(weekday), value)
    },
    getSigninFullReward(item) {
      const extra = item && item.extraConfig ? item.extraConfig : {}
      return extra.fullSignReward === undefined || extra.fullSignReward === null ? 0 : extra.fullSignReward
    },
    setSigninFullReward(item, value) {
      const extra = this.ensureSigninExtraConfig(item)
      this.$set(extra, 'fullSignReward', value)
    },
    exportTypeStates(activityTypes) {
      const currentKey = normalizeActivityTypeValue(this.form.activityType || this.activityType, this.optionSources)
      this.typeStateCache[currentKey] = cloneActivityTypeState(this.captureCurrentState())
      const targetTypes = Array.isArray(activityTypes) && activityTypes.length ? activityTypes : Object.keys(this.typeStateCache)
      const result = {}
      targetTypes.forEach(type => {
        const normalizedType = normalizeActivityTypeValue(type, this.optionSources)
        const sourceState = this.typeStateCache[normalizedType] || createDefaultActivityTypeState(normalizedType, this.optionSources)
        result[normalizedType] = cloneActivityTypeState(createNormalizedActivityTypeState(normalizedType, sourceState, this.optionSources))
      })
      return result
    },
    importTypeStates(activityTypeStates, currentType) {
      const nextCache = {}
      Object.keys(activityTypeStates || {}).forEach(key => {
        const normalizedType = normalizeActivityTypeValue(key, this.optionSources)
        nextCache[normalizedType] = cloneActivityTypeState(createNormalizedActivityTypeState(normalizedType, activityTypeStates[key], this.optionSources))
      })
      const currentKey = normalizeActivityTypeValue(currentType || this.activityType || this.form.activityType, this.optionSources)
      const currentState = nextCache[currentKey] || createDefaultActivityTypeState(currentKey, this.optionSources)
      this.typeStateCache = nextCache
      this.applyTypeState(currentState)
      this.typeStateCache[currentKey] = cloneActivityTypeState(currentState)
      this.$nextTick(() => this.syncNewcomerTaskSummaries())
    },
    validate() {
      this.syncNewcomerTaskSummaries()
      if (!String(this.form.activityDetail || '').trim()) {
        this.$message.error('请输入活动文案')
        return false
      }
      const errorMessage = this.currentSchema.validate ? this.currentSchema.validate(this.form) : ''
      if (errorMessage) {
        this.$message.error(errorMessage)
        return false
      }
      return true
    }
  }
}
