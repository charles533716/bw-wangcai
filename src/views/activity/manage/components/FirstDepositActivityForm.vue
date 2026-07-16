<template>
  <div class="first-deposit-form">
    <section class="first-section">
      <div class="first-section__title">配置信息</div>
      <div class="first-grid first-grid--config">
        <el-form-item label="活动标题" prop="activityName" required class="first-config-title first-grid__wide">
          <el-input v-model="form.activityName" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="活动分类" required class="first-config-meta-row first-grid__wide">
          <div class="first-config-meta">
            <el-select v-model="extra.activityCategory" multiple collapse-tags placeholder="请选择分类" class="first-config-category">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>

            <el-form-item label="活动标签" required>
              <el-select v-model="extra.activityTag" placeholder="请选择标签" style="width: 100%">
                <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="排序" prop="activitySort" required>
              <el-input-number v-model="form.activitySort" :min="1" :precision="0" :controls="false" class="first-field" placeholder="数值越小排序越前" />
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
                class="first-status-switch"
              />
            </el-form-item>
          </div>
        </el-form-item>

        <el-form-item label="展示设备" required class="first-grid__wide">
          <el-checkbox-group :value="displayDevices" class="first-check-group" @input="handleDisplayDevicesChange">
            <el-checkbox v-for="item in displayDeviceOptions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="活动周期" class="first-grid__wide">
          <el-radio-group v-model="extra.activityPeriod">
            <el-radio label="fixed">指定时间</el-radio>
            <el-radio label="forever">永久</el-radio>
          </el-radio-group>
        </el-form-item>

        <div class="first-time-row first-grid__wide">
          <el-form-item label="展示时间" required>
            <el-date-picker
              v-model="displayTimeRange"
              :type="isForeverPeriod ? 'date' : 'daterange'"
              :range-separator="'→'"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              placeholder="开始时间"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="活动时间" required>
            <el-date-picker
              v-model="activityTimeRange"
              :type="isForeverPeriod ? 'date' : 'daterange'"
              :range-separator="'→'"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              placeholder="开始时间"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
        </div>
      </div>
    </section>

    <section class="first-section">
      <div class="first-section__title">规则配置</div>
      <div class="first-rules">
        <el-form-item label="申请模式" required>
          <el-select v-model="extra.applyMode" disabled placeholder="请选择申请模式" style="width: 260px">
            <el-option v-for="item in applyModeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择站点" required class="first-grid__wide">
          <el-select
            :value="selectedSites"
            multiple
            filterable
            collapse-tags
            :disabled="isEdit"
            placeholder="请选择站点"
            class="site-select"
            @input="handleSelectedSitesChange"
          >
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="活动场馆" required class="first-grid__wide">
          <div v-if="selectedSiteVenueGroups.length" class="venue-groups">
            <div v-for="group in selectedSiteVenueGroups" :key="group.site.value" class="venue-group">
              <div class="venue-group__head">
                <div class="venue-group__title">{{ group.site.label }}</div>
                <el-button type="text" class="venue-toggle" @click="toggleVenueGroup(group.site.value)">
                  {{ isVenueGroupCollapsed(group.site.value) ? '展开' : '收起' }}
                  <i :class="isVenueGroupCollapsed(group.site.value) ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
                </el-button>
              </div>
              <el-checkbox-group v-show="!isVenueGroupCollapsed(group.site.value)" :value="getSiteVenueSelection(group.site.value)" class="venue-options" @input="handleSiteVenuesChange(group.site.value, $event)">
                <el-checkbox class="venue-options__all" label="all">全选</el-checkbox>
                <div class="venue-options__items">
                  <el-checkbox v-for="item in group.site.venues" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </div>
          <span v-else class="venue-empty">请先选择站点</span>
        </el-form-item>

        <el-form-item label="赠送形式" required>
          <el-radio-group v-model="extra.giftType">
            <el-radio label="percent">比例金额</el-radio>
            <el-radio label="fixed">固定金额</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-button type="primary" icon="el-icon-plus" class="first-add-button" @click="handleAddReward">添加</el-button>

        <el-table
          ref="rewardTable"
          :data="rewardItems"
          border
          :style="{ width: rewardTableWidth }"
          class="first-reward-table"
        >
          <el-table-column label="序号" width="88" align="center">
            <template slot-scope="{ $index }">{{ $index + 1 }}</template>
          </el-table-column>
          <el-table-column label="转账金额(元)" width="260" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row.targetValidBetAmount" :min="0" :precision="0" :controls="false" class="table-field" placeholder="请输入1-99999999" />
            </template>
          </el-table-column>
          <el-table-column v-if="isPercentGift" label="赠送比例（%）" width="220" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row.extraConfig.giftRate" :min="0" :precision="0" :controls="false" class="table-field" placeholder="请输入1-500" />
            </template>
          </el-table-column>
          <el-table-column v-if="isPercentGift" label="赠送上限（元）" width="260" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row.extraConfig.giftLimit" :min="0" :precision="0" :controls="false" class="table-field" placeholder="请输入1-99999999" />
            </template>
          </el-table-column>
          <el-table-column v-else label="赠送金额（元）" width="260" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row.rewardAmount" :min="0" :precision="0" :controls="false" class="table-field" placeholder="请输入赠送金额" />
            </template>
          </el-table-column>
          <el-table-column label="流水要求（本金+奖励）（倍）" width="280" align="center">
            <template slot-scope="{ row }">
              <el-input-number v-model="row.extraConfig.turnoverMultiple" :min="0" :precision="0" :controls="false" class="table-field" placeholder="请输入1-500" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" align="center">
            <template slot-scope="{ $index }">
              <el-button :disabled="rewardItems.length <= 1" size="mini" @click="handleRemoveReward($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <section class="first-section">
      <div class="first-section__title">页面配置</div>
      <div class="page-block">
        <div class="page-block__heading">WEB</div>
        <div class="image-row">
          <image-field title="活动列表图（1张）" v-model="extra.webListImage" />
          <image-field title="WEB端主图(1张)" v-model="extra.webMainImage" />
        </div>
      </div>

      <div class="page-block">
        <div class="page-block__heading">H5</div>
        <div class="image-row">
          <image-field title="活动列表图(1张)" v-model="extra.h5ListImage" />
          <image-field title="APP/H5主图(1张)" v-model="extra.h5MainImage" />
        </div>
      </div>
    </section>

    <section class="first-section">
      <div class="first-section__title">内容详情</div>
      <el-form-item label="WEB端详情" class="detail-item">
        <editor v-model="extra.webDetail" :min-height="190" toolbar-locale="zh-CN" class="first-editor" />
      </el-form-item>
      <el-form-item label="移动端详情" class="detail-item">
        <editor v-model="extra.mobileDetail" :min-height="190" toolbar-locale="zh-CN" class="first-editor" />
      </el-form-item>
    </section>
  </div>
</template>

<script>
import Editor from '@/components/Editor'

const ALL_VALUE = 'all'
const SITE_VENUES = [
  {
    value: 'wc',
    label: '旺财体育',
    venues: [
      { value: 'wcSports', label: '旺财体育' },
      { value: 'pandaSports', label: '熊猫体育' },
      { value: 'imSports', label: 'IM体育' },
      { value: 'wcLive', label: '旺财真人' },
      { value: 'wcLottery', label: '旺财彩票' },
      { value: 'wcChess', label: '旺财棋牌' },
      { value: 'dbChess', label: 'DB棋牌' },
      { value: 'boyaChess', label: '博雅棋牌' },
      { value: 'gaodengChess', label: '高登棋牌' },
      { value: 'wcEsports', label: '旺财电竞' },
      { value: 'dbEsports', label: 'DB电竞' },
      { value: 'imEsports', label: 'IM电竞' },
      { value: 'wcElectronic', label: '旺财电子' },
      { value: 'dbElectronic', label: 'DB电子' },
      { value: 'pgElectronic', label: 'PG电子' }
    ]
  },
  {
    value: 'dw',
    label: 'DW体育',
    venues: [
      { value: 'dwSports', label: 'DW体育' },
      { value: 'dwLive', label: 'DW真人' },
      { value: 'wmLive', label: 'WM真人' },
      { value: 'dwLottery', label: 'DW彩票' },
      { value: 'tcLottery', label: 'TC彩票' },
      { value: 'dbElectronic', label: 'DB电子' },
      { value: 'pgElectronic', label: 'PG电子' }
    ]
  },
  {
    value: 'cs',
    label: '财神体育',
    venues: [
      { value: 'csSports', label: '财神体育' },
      { value: 'pandaSports', label: '熊猫体育' },
      { value: 'imSports', label: 'IM体育' },
      { value: 'csLive', label: '财神真人' },
      { value: 'wmLive', label: 'WM真人' },
      { value: 'dbElectronic', label: 'DB电子' },
      { value: 'pgElectronic', label: 'PG电子' }
    ]
  }
]

function cloneRewardItem(index) {
  return {
    taskName: '首存奖励' + (index + 1),
    targetCount: null,
    targetValidBetAmount: null,
    rewardAmount: null,
    taskSummary: '',
    enabled: true,
    extraConfig: {
      giftRate: null,
      giftLimit: null,
      turnoverMultiple: null
    }
  }
}

const ImageField = {
  name: 'FirstDepositImageField',
  props: {
    value: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  render(h) {
    return h('div', { class: 'image-field' }, [
      h('div', { class: 'image-field__title' }, [
        this.required ? h('span', { class: 'image-field__required', style: { color: '#f56c6c' } }, '*') : null,
        this.title
      ]),
      h('div', {
        class: 'image-field__box',
        on: {
          click: this.openFileDialog
        }
      }, [
        this.value
          ? h('img', {
            class: 'image-field__preview',
            attrs: {
              src: this.value,
              alt: this.title
            }
          })
          : h('i', { class: 'el-icon-plus image-field__plus' }),
        this.value
          ? h('button', {
            class: 'image-field__remove',
            attrs: {
              type: 'button',
              title: '删除图片'
            },
            on: {
              click: this.removeImage
            }
          }, '×')
          : null,
        h('input', {
          ref: 'fileInput',
          class: 'image-field__input',
          attrs: {
            type: 'file',
            accept: '.jpg,.jpeg,.png,image/jpeg,image/png'
          },
          on: {
            change: this.handleFileChange
          }
        })
      ]),
      h('div', {
        class: 'image-field__tip',
        style: {
          color: '#909399',
          fontSize: '11px',
          lineHeight: '1.2',
          whiteSpace: 'nowrap'
        }
      }, '支持.jpg .jpeg .png，大小不超过2M')
    ])
  },
  methods: {
    openFileDialog() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click()
      }
    },
    handleFileChange(event) {
      const file = event.target.files && event.target.files[0]
      event.target.value = ''
      if (!file) {
        return
      }
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : ''
      if (!['jpg', 'jpeg', 'png'].includes(extension)) {
        this.$message.error('请上传 jpg、jpeg、png 格式的图片')
        return
      }
      if (file.size / 1024 / 1024 > 2) {
        this.$message.error('图片大小不能超过 2M')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        this.$emit('input', reader.result)
      }
      reader.readAsDataURL(file)
    },
    removeImage(event) {
      event.stopPropagation()
      this.$emit('input', '')
    }
  }
}

export default {
  name: 'FirstDepositActivityForm',
  components: {
    Editor,
    ImageField
  },
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
  data() {
    return {
      collapsedVenueGroups: {}
    }
  },
  computed: {
    extra() {
      if (!this.form.baseConfigExtra) {
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
    applyModeOptions() {
      return [
        { value: 'accountOnce', label: '每个账户仅一次' },
        { value: 'venueOnce', label: '每个场馆仅一次' },
        { value: 'activityOnce', label: '每个活动仅一次' }
      ]
    },
    siteOptions() {
      return SITE_VENUES.map(site => ({
        value: site.value,
        label: site.label
      }))
    },
    selectedSites() {
      if (this.isEdit) {
        return ['wc']
      }
      return Array.isArray(this.extra.selectedSites) ? this.extra.selectedSites : []
    },
    venueSelections() {
      if (!this.extra.venueSelections || typeof this.extra.venueSelections !== 'object' || Array.isArray(this.extra.venueSelections)) {
        this.$set(this.extra, 'venueSelections', {})
      }
      return this.extra.venueSelections
    },
    selectedSiteVenueGroups() {
      const selectedSet = new Set(this.selectedSites)
      return SITE_VENUES.filter(site => selectedSet.has(site.value)).map(site => ({
        site,
        options: [
          { value: ALL_VALUE, label: '全选' },
          ...site.venues
        ]
      }))
    },
    displayDevices() {
      return Array.isArray(this.extra.displayDevices) ? this.extra.displayDevices : []
    },
    rewardItems() {
      if (!Array.isArray(this.form.rewardItems)) {
        this.$set(this.form, 'rewardItems', [cloneRewardItem(0)])
      }
      this.form.rewardItems.forEach((item, index) => this.ensureRewardItem(item, index))
      return this.form.rewardItems
    },
    isPercentGift() {
      return this.extra.giftType !== 'fixed'
    },
    rewardTableWidth() {
      return this.isPercentGift ? '1218px' : '998px'
    },
    isForeverPeriod() {
      return this.extra.activityPeriod === 'forever'
    },
    displayTimeRange: {
      get() {
        return this.isForeverPeriod ? (this.extra.displayTimeRange && this.extra.displayTimeRange[0]) || '' : this.extra.displayTimeRange
      },
      set(value) {
        this.$set(this.extra, 'displayTimeRange', Array.isArray(value) ? value : (value ? [value] : []))
      }
    },
    activityTimeRange: {
      get() {
        return this.isForeverPeriod ? this.form.activityBeginTime || '' : [this.form.activityBeginTime, this.form.activityEndTime].filter(Boolean)
      },
      set(value) {
        const values = Array.isArray(value) ? value : (value ? [value] : [])
        this.$set(this.extra, 'activityTimeRange', values)
        this.$set(this.form, 'activityBeginTime', values[0] || '')
        this.$set(this.form, 'activityEndTime', values[1] || '')
      }
    }
  },
  created() {
    this.ensureDefaults()
  },
  watch: {
    form: {
      immediate: true,
      handler() {
        if (this.isEdit) {
          this.$nextTick(() => this.syncSelectedSites(['wc']))
        }
      }
    },
    'extra.giftType'() {
      this.$nextTick(() => {
        if (this.$refs.rewardTable) {
          this.$refs.rewardTable.doLayout()
        }
      })
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
        activityTimeRange: [],
        applyMode: 'accountOnce',
        selectedSites: ['wc'],
        venueSelections: {},
        rmbVenues: [],
        giftType: 'percent',
        webContentMode: 'popup',
        h5ModuleTop: '0',
        webListImage: '',
        webMainImage: '',
        webBackgroundImage: '',
        h5ListImage: '',
        h5MainImage: '',
        webDetail: '',
        mobileDetail: ''
      }
      Object.keys(defaults).forEach(key => {
        if (this.extra[key] === undefined || this.extra[key] === null) {
          this.$set(this.extra, key, Array.isArray(defaults[key]) ? defaults[key].slice() : defaults[key])
        }
      })
      const selectedCategories = Array.isArray(this.extra.activityCategory)
        ? this.extra.activityCategory
        : (this.extra.activityCategory ? [this.extra.activityCategory] : [])
      const categoryValues = this.categoryOptions.map(item => item.value)
      this.$set(this.extra, 'activityCategory', selectedCategories.filter(value => categoryValues.includes(value)))
      this.$set(this.extra, 'applyMode', 'accountOnce')
      if (!this.isEdit) {
        this.$set(this.form, 'status', '1')
      }
      this.syncSelectedSites(this.selectedSites)
      if (!Array.isArray(this.form.rewardItems) || !this.form.rewardItems.length) {
        this.$set(this.form, 'rewardItems', [cloneRewardItem(0), cloneRewardItem(1), cloneRewardItem(2)])
      }
      this.rewardItems.forEach((item, index) => this.ensureRewardItem(item, index))
    },
    ensureRewardItem(item, index) {
      if (!item.extraConfig) {
        this.$set(item, 'extraConfig', {})
      }
      if (!item.taskName) {
        this.$set(item, 'taskName', '首存奖励' + (index + 1))
      }
      ;['giftRate', 'giftLimit', 'turnoverMultiple'].forEach(key => {
        if (item.extraConfig[key] === undefined) {
          this.$set(item.extraConfig, key, null)
        }
      })
      if (item.targetValidBetAmount === undefined) {
        this.$set(item, 'targetValidBetAmount', null)
      }
      if (item.rewardAmount === undefined) {
        this.$set(item, 'rewardAmount', null)
      }
    },
    resolveAllSelection(values, options, previousValues) {
      const optionValues = options.map(item => item.value)
      const selected = Array.isArray(values) ? values.slice() : []
      const previous = Array.isArray(previousValues) ? previousValues : []
      const allExceptAll = optionValues.filter(item => item !== ALL_VALUE)
      const hasAll = selected.includes(ALL_VALUE)
      const hadAll = previous.includes(ALL_VALUE)
      const hasEveryItem = allExceptAll.every(item => selected.includes(item))

      if (hasAll && !hadAll) {
        return optionValues
      }
      if (!hasAll && hadAll && hasEveryItem) {
        return []
      }
      if (hasEveryItem) {
        return optionValues
      }
      return selected.filter(item => item !== ALL_VALUE)
    },
    handleDisplayDevicesChange(values) {
      this.$set(this.extra, 'displayDevices', this.resolveAllSelection(values, this.displayDeviceOptions, this.displayDevices))
    },
    getSiteConfig(siteValue) {
      return SITE_VENUES.find(site => site.value === siteValue) || null
    },
    getSiteVenueOptions(siteValue) {
      const site = this.getSiteConfig(siteValue)
      return site ? [{ value: ALL_VALUE, label: '全选' }, ...site.venues] : []
    },
    getDefaultVenueSelection(siteValue) {
      return this.getSiteVenueOptions(siteValue).map(item => item.value)
    },
    getSiteVenueSelection(siteValue) {
      const current = this.venueSelections[siteValue]
      return Array.isArray(current) ? current : []
    },
    syncSelectedSites(values) {
      const validSites = SITE_VENUES.map(site => site.value)
      const nextSites = Array.from(new Set((Array.isArray(values) ? values : []).filter(value => validSites.includes(value))))
      const nextSelections = {}
      nextSites.forEach(siteValue => {
        const currentSelection = this.venueSelections[siteValue]
        nextSelections[siteValue] = Array.isArray(currentSelection) ? currentSelection.slice() : this.getDefaultVenueSelection(siteValue)
      })
      this.$set(this.extra, 'selectedSites', nextSites)
      this.$set(this.extra, 'venueSelections', nextSelections)
      this.$set(this.extra, 'rmbVenues', nextSites.reduce((result, siteValue) => {
        const selectedVenues = nextSelections[siteValue].filter(value => value !== ALL_VALUE)
        return result.concat(selectedVenues.map(venueValue => siteValue + ':' + venueValue))
      }, []))
    },
    handleSelectedSitesChange(values) {
      if (this.isEdit) {
        return
      }
      this.syncSelectedSites(values)
    },
    handleSiteVenuesChange(siteValue, values) {
      const options = this.getSiteVenueOptions(siteValue)
      const previousValues = this.getSiteVenueSelection(siteValue)
      const resolvedValues = this.resolveAllSelection(values, options, previousValues)
      const nextSelections = Object.assign({}, this.venueSelections, {
        [siteValue]: resolvedValues
      })
      this.$set(this.extra, 'venueSelections', nextSelections)
      this.syncSelectedSites(this.selectedSites)
    },
    isVenueGroupCollapsed(siteValue) {
      return !!this.collapsedVenueGroups[siteValue]
    },
    toggleVenueGroup(siteValue) {
      this.$set(this.collapsedVenueGroups, siteValue, !this.isVenueGroupCollapsed(siteValue))
    },
    handleAddReward() {
      this.rewardItems.push(cloneRewardItem(this.rewardItems.length))
    },
    handleRemoveReward(index) {
      if (this.rewardItems.length <= 1) {
        return
      }
      this.rewardItems.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.first-deposit-form {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.first-section {
  padding-top: 4px;
}

.first-section + .first-section {
  padding-top: 24px;
  border-top: 1px solid #edf1f6;
}

.first-section__title {
  display: inline-flex;
  align-items: center;
  margin-bottom: 22px;
  padding-bottom: 9px;
  border-bottom: 2px solid #3b96ff;
  color: #2d8cf0;
  font-size: 15px;
  font-weight: 700;
}

.first-grid {
  display: grid;
  gap: 18px 26px;
}

.first-grid--config {
  grid-template-columns: minmax(220px, 1.4fr) minmax(150px, 0.75fr) minmax(150px, 0.75fr) minmax(130px, 0.65fr) minmax(150px, 0.7fr);
}

.first-grid__wide {
  grid-column: 1 / -1;
}

.first-config-title {
  width: 33%;
}

.first-config-meta {
  display: grid;
  grid-template-columns: 180px 200px 210px 170px;
  gap: 10px;
  align-items: center;
}

.first-config-category {
  width: 100%;
}

.first-config-meta ::v-deep .el-form-item {
  display: flex;
  align-items: center;
}

.first-config-meta ::v-deep .el-form-item__label {
  flex: 0 0 auto;
  width: auto !important;
  padding-right: 12px;
}

.first-config-meta ::v-deep .el-form-item__content {
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 0 !important;
}

.first-time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 33%));
  gap: 26px;
}

.first-field,
.table-field {
  width: 100%;
}

.first-status-switch {
  display: inline-flex;
  align-items: center;
  min-width: 118px;
  min-height: 40px;
  white-space: nowrap;
}

.first-status-switch ::v-deep .el-switch__label,
.first-status-switch ::v-deep .el-switch__core {
  flex: 0 0 auto;
}

.first-status-switch ::v-deep .el-switch__label {
  white-space: nowrap;
}

.site-select {
  width: 260px;
}

.first-check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 22px;
  min-height: 42px;
  align-items: center;
}

.venue-options {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 22px;
  min-height: 42px;
  align-items: start;
}

.venue-options__all {
  margin-right: 0;
  padding-top: 1px;
}

.venue-options__items {
  display: grid;
  grid-template-columns: repeat(10, 96px);
  gap: 8px 14px;
  min-width: 0;
}

.venue-options__items ::v-deep .el-checkbox {
  margin-right: 0;
}

.first-rules {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.venue-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.venue-group {
  padding: 12px 14px;
  border: 1px solid #edf1f6;
  border-radius: 4px;
  background: #fbfdff;
}

.venue-group__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.venue-group__title {
  color: #314256;
  font-size: 13px;
  font-weight: 700;
}

.venue-toggle {
  padding: 0;
  line-height: 1;
}

.venue-toggle i {
  margin-left: 2px;
}

.venue-empty {
  color: #909399;
}

.first-add-button {
  width: 92px;
}

.first-reward-table {
  margin-top: 4px;
}

.page-block {
  margin-bottom: 30px;
}

.page-block__heading {
  margin: 0 0 14px 32px;
  padding-left: 8px;
  border-left: 4px solid #2d8cf0;
  color: #314256;
  font-weight: 700;
  line-height: 1.2;
}

.image-row {
  display: grid;
  grid-template-columns: repeat(3, 250px);
  gap: 42px 42px;
  margin-left: 32px;
}

.image-row--single {
  grid-template-columns: 250px;
}

.image-field__title {
  margin-bottom: 8px;
  color: #56657d;
  font-size: 13px;
  font-weight: 600;
}

.image-field__required {
  margin-right: 2px;
  color: #f56c6c;
}

.image-field__box {
  position: relative;
  width: 99px;
  height: 99px;
}

.image-field__tip {
  margin-top: 14px;
  color: #9aa7b8;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.detail-item {
  max-width: 1180px;
}

.first-editor {
  border: 1px solid #dbe3ef;
  border-radius: 4px;
  overflow: hidden;
}

.first-editor ::v-deep .ql-toolbar {
  border: none;
  border-bottom: 1px solid #e4ebf5;
}

.first-editor ::v-deep .ql-container {
  border: none;
}

.first-deposit-form ::v-deep .el-table th {
  background: #fafafa;
  color: #2d3545;
  font-weight: 700;
}

.first-deposit-form ::v-deep .el-form-item {
  margin-bottom: 0;
}

@media (max-width: 1100px) {
  .first-grid--config {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .first-config-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .first-grid--config,
  .first-config-meta,
  .first-time-row,
  .image-row {
    grid-template-columns: 1fr;
  }

  .first-config-title {
    width: 100%;
  }

  .image-row,
  .page-block__heading {
    margin-left: 0;
  }

  .venue-group {
    padding: 10px;
  }
}
</style>

<style>
.first-deposit-form .image-row {
  grid-template-columns: repeat(3, 250px);
  column-gap: 42px;
}

.first-deposit-form .image-field__title {
  margin-bottom: 8px;
  color: #56657d;
  font-size: 13px;
  font-weight: 600;
}

.first-deposit-form .image-field__required {
  margin-right: 2px;
  color: #f56c6c;
}

.first-deposit-form .image-field__box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 99px !important;
  height: 99px !important;
  border: 1px dashed #d8dee8;
  border-radius: 2px;
  background: #fff;
  cursor: pointer;
  box-sizing: border-box;
}

.first-deposit-form .image-field__plus {
  color: #6f7f91;
  font-size: 20px;
}

.first-deposit-form .image-field__input {
  display: none;
}

.first-deposit-form .image-field__preview {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.first-deposit-form .image-field__remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
}

.first-deposit-form .image-field__tip {
  width: 250px;
  margin-top: 14px;
  color: #909399 !important;
  font-size: 11px !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}
</style>
