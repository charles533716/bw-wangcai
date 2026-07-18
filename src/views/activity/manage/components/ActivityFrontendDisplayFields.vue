<template>
  <div class="frontend-display-fields">
    <div class="frontend-display-fields__title">前端展示配置</div>

    <div class="frontend-display-fields__grid frontend-display-fields__grid--meta">
      <el-form-item
        label="活动分类"
        prop="baseConfigExtra.activityCategory"
        :rules="requiredCategoryRules"
        required
      >
        <el-select
          v-model="extra.activityCategory"
          multiple
          collapse-tags
          placeholder="请选择分类"
          style="width: 100%"
        >
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="活动标签"
        prop="baseConfigExtra.activityTag"
        :rules="requiredTagRules"
        required
      >
        <el-select v-model="extra.activityTag" placeholder="请选择标签" style="width: 100%">
          <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item
        label="展示设备"
        prop="baseConfigExtra.displayDevices"
        :rules="requiredDeviceRules"
        required
      >
        <el-checkbox-group :value="displayDevices" class="frontend-display-fields__devices" @input="handleDisplayDevicesChange">
          <el-checkbox v-for="item in displayDeviceOptions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="状态" prop="status" required>
        <el-switch
          v-model="form.status"
          active-value="0"
          inactive-value="1"
          active-text="启用"
          inactive-text="禁用"
          active-color="#20b56d"
          inactive-color="#c0c4cc"
          class="frontend-display-fields__status"
        />
      </el-form-item>
    </div>

    <el-form-item label="活动周期" class="frontend-display-fields__period">
      <el-radio-group v-model="extra.activityPeriod">
        <el-radio label="fixed">指定时间</el-radio>
        <el-radio label="forever">永久</el-radio>
      </el-radio-group>
    </el-form-item>

    <div class="frontend-display-fields__grid frontend-display-fields__grid--time">
      <el-form-item
        label="展示时间"
        prop="baseConfigExtra.displayTimeRange"
        :rules="requiredDisplayTimeRules"
        required
      >
        <el-date-picker
          v-model="displayTimeRange"
          :type="isForeverPeriod ? 'date' : 'daterange'"
          range-separator="→"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          placeholder="开始日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item
        label="活动时间"
        prop="activityBeginTime"
        :rules="requiredActivityTimeRules"
        required
      >
        <el-date-picker
          v-model="activityTimeRange"
          :type="isForeverPeriod ? 'date' : 'daterange'"
          range-separator="→"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          placeholder="开始日期"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script>
const ALL_VALUE = 'all'

export default {
  name: 'ActivityFrontendDisplayFields',
  props: {
    form: {
      type: Object,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    extra() {
      if (!this.form.baseConfigExtra || typeof this.form.baseConfigExtra !== 'object') {
        this.$set(this.form, 'baseConfigExtra', {})
      }
      return this.form.baseConfigExtra
    },
    categoryOptions() {
      return [
        { value: 'latest', label: '最新' },
        { value: 'sports', label: '体育' },
        { value: 'live', label: '真人' },
        { value: 'esports', label: '电竞' },
        { value: 'lottery', label: '彩票' },
        { value: 'chess', label: '棋牌' },
        { value: 'electronic', label: '电子' },
        { value: 'fishing', label: '捕鱼' },
        { value: 'hash', label: '哈希' }
      ]
    },
    tagOptions() {
      return [
        { value: 'latest', label: '最新' },
        { value: 'daily', label: '日常' },
        { value: 'newcomer', label: '新人' },
        { value: 'vip', label: 'VIP' },
        { value: 'limited', label: '限时' },
        { value: 'luxury', label: '豪礼' },
        { value: 'rebate', label: '返水' },
        { value: 'none', label: '无标签' }
      ]
    },
    displayDeviceOptions() {
      return [
        { value: ALL_VALUE, label: '全部' },
        { value: 'web', label: 'Web' },
        { value: 'appH5', label: 'APP/H5' }
      ]
    },
    displayDevices() {
      return Array.isArray(this.extra.displayDevices) ? this.extra.displayDevices : []
    },
    isForeverPeriod() {
      return this.extra.activityPeriod === 'forever'
    },
    displayTimeRange: {
      get() {
        const values = Array.isArray(this.extra.displayTimeRange) ? this.extra.displayTimeRange : []
        return this.isForeverPeriod ? values[0] || '' : values
      },
      set(value) {
        this.$set(this.extra, 'displayTimeRange', Array.isArray(value) ? value : (value ? [value] : []))
      }
    },
    activityTimeRange: {
      get() {
        return this.isForeverPeriod
          ? this.form.activityBeginTime || ''
          : [this.form.activityBeginTime, this.form.activityEndTime].filter(Boolean)
      },
      set(value) {
        const values = Array.isArray(value) ? value : (value ? [value] : [])
        this.$set(this.extra, 'activityTimeRange', values)
        this.$set(this.form, 'activityBeginTime', values[0] || '')
        this.$set(this.form, 'activityEndTime', values[1] || '')
      }
    },
    requiredCategoryRules() {
      return [{
        validator: (rule, value, callback) => {
          if (!Array.isArray(value) || !value.length) {
            callback(new Error('请选择活动分类'))
            return
          }
          callback()
        },
        trigger: 'change'
      }]
    },
    requiredTagRules() {
      return [{ required: true, message: '请选择活动标签', trigger: 'change' }]
    },
    requiredDeviceRules() {
      return [{
        validator: (rule, value, callback) => {
          if (!Array.isArray(value) || !value.length) {
            callback(new Error('请选择展示设备'))
            return
          }
          callback()
        },
        trigger: 'change'
      }]
    },
    requiredDisplayTimeRules() {
      return [this.createTimeRangeRule('展示时间', () => this.extra.displayTimeRange)]
    },
    requiredActivityTimeRules() {
      return [this.createTimeRangeRule('活动时间', () => [this.form.activityBeginTime, this.form.activityEndTime].filter(Boolean))]
    }
  },
  created() {
    this.ensureDefaults()
    if (!this.isEdit || this.form.status === undefined || this.form.status === null || this.form.status === '') {
      this.$set(this.form, 'status', '1')
    }
  },
  watch: {
    'form.baseConfigExtra': {
      handler() {
        this.ensureDefaults()
      }
    },
    'extra.activityPeriod'(value) {
      if (value !== 'forever') {
        return
      }
      const displayStart = Array.isArray(this.extra.displayTimeRange) ? this.extra.displayTimeRange[0] : ''
      this.$set(this.extra, 'displayTimeRange', displayStart ? [displayStart] : [])
      this.$set(this.extra, 'activityTimeRange', this.form.activityBeginTime ? [this.form.activityBeginTime] : [])
      this.$set(this.form, 'activityEndTime', '')
    }
  },
  methods: {
    ensureDefaults() {
      const defaults = {
        activityCategory: [],
        activityTag: '',
        displayDevices: [ALL_VALUE, 'web', 'appH5'],
        activityPeriod: 'fixed',
        displayTimeRange: [],
        activityTimeRange: []
      }
      Object.keys(defaults).forEach(key => {
        if (this.extra[key] === undefined || this.extra[key] === null) {
          const value = Array.isArray(defaults[key]) ? defaults[key].slice() : defaults[key]
          this.$set(this.extra, key, value)
        }
      })
      const categoryValues = this.categoryOptions.map(item => item.value)
      const selectedCategories = Array.isArray(this.extra.activityCategory)
        ? this.extra.activityCategory
        : (this.extra.activityCategory ? [this.extra.activityCategory] : [])
      this.$set(this.extra, 'activityCategory', selectedCategories.filter(value => categoryValues.includes(value)))
    },
    createTimeRangeRule(label, resolveValues) {
      return {
        validator: (rule, value, callback) => {
          const values = resolveValues()
          const requiredCount = this.isForeverPeriod ? 1 : 2
          if (!Array.isArray(values) || values.filter(Boolean).length < requiredCount) {
            callback(new Error(`请选择${label}`))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    },
    resolveAllSelection(values, previousValues) {
      const optionValues = this.displayDeviceOptions.map(item => item.value)
      const selected = Array.isArray(values) ? values.slice() : []
      const previous = Array.isArray(previousValues) ? previousValues : []
      const deviceValues = optionValues.filter(item => item !== ALL_VALUE)
      const hasAll = selected.includes(ALL_VALUE)
      const hadAll = previous.includes(ALL_VALUE)
      const hasEveryDevice = deviceValues.every(item => selected.includes(item))

      if (hasAll && !hadAll) {
        return optionValues
      }
      if (!hasAll && hadAll && hasEveryDevice) {
        return []
      }
      if (hasEveryDevice) {
        return optionValues
      }
      return selected.filter(item => item !== ALL_VALUE)
    },
    handleDisplayDevicesChange(values) {
      this.$set(this.extra, 'displayDevices', this.resolveAllSelection(values, this.displayDevices))
    }
  }
}
</script>

<style scoped>
.frontend-display-fields {
  grid-column: 1 / -1;
  margin-top: 2px;
  padding: 20px 0 2px;
  border-top: 1px solid #edf1f6;
}

.frontend-display-fields__title {
  margin-bottom: 18px;
  color: #409eff;
  font-size: 14px;
  font-weight: 700;
}

.frontend-display-fields__grid {
  display: grid;
  gap: 16px 20px;
}

.frontend-display-fields__grid--meta {
  grid-template-columns: minmax(260px, 1fr) minmax(220px, 340px) max-content max-content;
  max-width: 1120px;
}

.frontend-display-fields__grid--time {
  grid-template-columns: repeat(2, minmax(340px, 1fr));
  max-width: 1060px;
}

.frontend-display-fields__period {
  margin-bottom: 18px;
}

.frontend-display-fields__devices {
  display: flex;
  min-height: 42px;
  align-items: center;
  flex-wrap: wrap;
  gap: 0 24px;
}

.frontend-display-fields__devices ::v-deep .el-checkbox {
  margin-right: 0;
}

.frontend-display-fields__status {
  display: inline-flex;
  min-width: 118px;
  min-height: 42px;
  align-items: center;
  white-space: nowrap;
}

.frontend-display-fields__status ::v-deep .el-switch__label,
.frontend-display-fields__status ::v-deep .el-switch__core {
  flex: 0 0 auto;
}

.frontend-display-fields__status ::v-deep .el-switch__label {
  white-space: nowrap;
}

.frontend-display-fields ::v-deep .el-form-item__label {
  float: none;
  display: block;
  width: auto !important;
  padding-bottom: 8px;
  color: #5e6d86;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  text-align: left;
}

.frontend-display-fields ::v-deep .el-form-item__content {
  margin-left: 0 !important;
}

.frontend-display-fields ::v-deep .el-input__inner {
  height: 42px;
  border-color: #dbe4ef;
  border-radius: 10px;
  line-height: 42px;
}

@media (max-width: 1100px) {
  .frontend-display-fields__grid--meta,
  .frontend-display-fields__grid--time {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}

@media (max-width: 760px) {
  .frontend-display-fields__grid--meta,
  .frontend-display-fields__grid--time {
    grid-template-columns: 1fr;
  }
}
</style>
