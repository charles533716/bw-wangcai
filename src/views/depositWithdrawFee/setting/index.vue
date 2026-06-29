<template>
  <div class="app-container deposit-withdraw-fee-page" v-loading="loading">
    <section class="config-panel">
      <div class="panel-title">
        <div class="panel-icon">
          <i class="el-icon-menu"></i>
        </div>
        <div>
          <div class="panel-heading">站点手续费管理</div>
          <div class="panel-subtitle">当前：{{ currentContextText }}</div>
        </div>
      </div>
      <div class="panel-switch">
        <el-radio-group v-model="profileType" size="small" @change="handleProfileTypeChange">
          <el-radio-button label="TEMPLATE">通用全局配置</el-radio-button>
          <el-radio-button label="SITE">站点详细配置</el-radio-button>
        </el-radio-group>
      </div>
      <div class="config-controls" :class="{ 'is-template-mode': profileType === 'TEMPLATE' }">
        <el-select
          v-if="profileType === 'TEMPLATE'"
          v-model="currentTemplateId"
          filterable
          placeholder="请选择模版"
          class="control-main"
          @change="loadCurrentConfig"
        >
          <el-option
            v-for="item in templateOptions"
            :key="item.id"
            :label="item.templateName"
            :value="item.id"
          />
        </el-select>
        <el-select
          v-if="profileType === 'SITE'"
          v-model="currentSiteCode"
          filterable
          placeholder="请选择站点"
          class="control-main"
          @change="loadCurrentConfig"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.code"
            :label="site.label"
            :value="site.code"
          />
        </el-select>
        <el-radio-group
          v-if="profileType === 'SITE'"
          v-model="configMode"
          size="small"
          class="control-mode"
          @change="handleConfigModeChange"
        >
          <el-radio-button label="FOLLOW_TEMPLATE">跟随模版</el-radio-button>
          <el-radio-button label="CUSTOM">自主设置</el-radio-button>
        </el-radio-group>
        <el-select
          v-if="profileType === 'SITE' && configMode === 'FOLLOW_TEMPLATE'"
          v-model="followTemplateId"
          filterable
          placeholder="请选择跟随模版"
          class="control-template"
          @change="loadFollowTemplatePreview"
        >
          <el-option
            v-for="item in templateOptions"
            :key="item.id"
            :label="item.templateName"
            :value="item.id"
          />
        </el-select>
        <div v-if="profileType === 'TEMPLATE'" class="template-actions">
          <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            @click="handleAddTemplate"
            v-hasPermi="['depositWithdrawFee:template:add']"
          >新增模版</el-button>
          <el-button
            plain
            icon="el-icon-edit"
            :disabled="!currentTemplateId"
            @click="handleRenameTemplate"
            v-hasPermi="['depositWithdrawFee:template:edit']"
          >重命名</el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            :disabled="!currentTemplateId"
            @click="handleDeleteTemplate"
            v-hasPermi="['depositWithdrawFee:template:remove']"
          >删除模版</el-button>
        </div>
      </div>
    </section>
    <section class="toolbar-panel">
      <div class="toolbar-title">
        <div class="toolbar-icon">
          <i class="el-icon-bank-card"></i>
        </div>
        <span>三方支付通道</span>
      </div>
      <el-button
        type="primary"
        icon="el-icon-document-checked"
        :loading="saving"
        :disabled="saveDisabled"
        @click="handleSave"
        v-hasPermi="['depositWithdrawFee:setting:save']"
      >保存配置</el-button>
    </section>
    <div class="table-heading">
      <div class="table-heading__title">
        <i class="el-icon-shield"></i>
        <span>通道级详细费用配置</span>
      </div>
      <el-radio-group v-model="businessType" size="small">
        <el-radio-button label="DEPOSIT">充值详细配置</el-radio-button>
        <el-radio-button label="WITHDRAW">提现详细配置</el-radio-button>
      </el-radio-group>
    </div>
    <el-table
      :data="currentTableRows"
      border
      class="fee-table"
      :row-key="getRowKey"
      max-height="620"
      empty-text="暂无可配置通道"
    >
      <el-table-column label="通道信息" min-width="180" fixed>
        <template slot-scope="{ row }">
          <div class="channel-cell">
            <div class="channel-name">{{ formatDictLabel(channelTypeDict, row.channelType) }}</div>
            <div class="channel-meta">
              <span>{{ formatDictLabel(channelCurrencyDict, row.channelCurrency) }}</span>
              <span>{{ row.channelId }}</span>
            </div>
            <div v-if="row.protocolOptions.length" class="channel-coin">USDT</div>
            <div v-if="row.protocolOptions.length" class="protocol-switch">
              <button v-for="protocol in row.protocolOptions" :key="protocol" type="button" class="protocol-switch__item" :class="[protocolClass(protocol), { 'is-active': protocol === row.selectedProtocol }]" @click="setActiveProtocol(row, protocol)">
                {{ formatProtocolLabel(protocol) }}
              </button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="档位金额范围" min-width="210">
        <template slot-scope="{ row }">
          <div class="amount-range-list">
            <div v-for="item in row.amountItems" :key="`amount-${item.sourceRowKey}`" class="amount-range">
              <span>{{ formatAmountRange(item) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="labels.thirdPartyStandard" min-width="250" align="center">
        <template slot-scope="{ row }">
          <div v-if="getFeeMode(row.items, 'thirdPartySettlementMode') === 'fixed_fee'" class="fee-card-list is-fixed">
            <div class="fee-card fee-card--third" :class="protocolClass(row.selectedProtocol)">
              <div class="fee-card__main">
                <div class="fee-value-with-unit">
                  <el-input-number :value="getFixedValue(row.items, 'thirdPartyFixedFee')" :controls="false" :min="0" :precision="2" :disabled="tableReadonly" size="small" @change="setFixedValue(row.items, 'thirdPartyFixedFee', $event)" />
                  <span class="fee-unit-tag">¥</span>
                </div>
                <el-select
                  :value="getFeeMode(row.items, 'thirdPartySettlementMode')"
                  :disabled="tableReadonly"
                  size="mini"
                  class="fee-mode-select"
                  @change="setFeeMode(row.items, 'thirdPartySettlementMode', $event)"
                >
                  <el-option label="%" value="tiered_rate" />
                  <el-option label="固定" value="fixed_fee" />
                </el-select>
              </div>
            </div>
          </div>
          <div v-else class="fee-card-list">
            <div
              v-for="(item, itemIndex) in row.items"
              :key="item.sourceRowKey"
              class="fee-card fee-card--third"
              :class="protocolClass(row.selectedProtocol)"
            >
              <div class="fee-card__main">
                <el-input-number v-model="item.thirdPartyRatePercent" :controls="false" :min="0" :max="100" :precision="4" :disabled="tableReadonly" size="small" />
                <el-select
                  :value="getFeeMode(row.items, 'thirdPartySettlementMode')"
                  :disabled="tableReadonly"
                  size="mini"
                  class="fee-mode-select"
                  @change="setFeeMode(row.items, 'thirdPartySettlementMode', $event)"
                >
                  <el-option label="%" value="tiered_rate" />
                  <el-option label="固定" value="fixed_fee" />
                </el-select>
              </div>
              <div v-if="itemIndex === 0" class="fee-card__min">
                <span>最低手续费：¥</span>
                <el-input-number v-model="item.thirdPartyMinFee" :controls="false" :min="0" :precision="2" :disabled="tableReadonly" size="mini" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="labels.siteQuoteStandard" min-width="250" align="center">
        <template slot-scope="{ row }">
          <div v-if="getFeeMode(row.items, 'siteQuoteSettlementMode') === 'fixed_fee'" class="fee-card-list is-fixed">
            <div class="fee-card fee-card--site" :class="protocolClass(row.selectedProtocol)">
              <div class="fee-card__main">
                <div class="fee-value-with-unit">
                  <el-input-number :value="getFixedValue(row.items, 'siteQuoteFixedFee')" :controls="false" :min="0" :precision="2" :disabled="tableReadonly" size="small" @change="setFixedValue(row.items, 'siteQuoteFixedFee', $event)" />
                  <span class="fee-unit-tag">¥</span>
                </div>
                <el-select
                  :value="getFeeMode(row.items, 'siteQuoteSettlementMode')"
                  :disabled="tableReadonly"
                  size="mini"
                  class="fee-mode-select"
                  @change="setFeeMode(row.items, 'siteQuoteSettlementMode', $event)"
                >
                  <el-option label="%" value="tiered_rate" />
                  <el-option label="固定" value="fixed_fee" />
                </el-select>
              </div>
            </div>
          </div>
          <div v-else class="fee-card-list">
            <div
              v-for="(item, itemIndex) in row.items"
              :key="item.sourceRowKey"
              class="fee-card fee-card--site"
              :class="protocolClass(row.selectedProtocol)"
            >
              <div class="fee-card__main">
                <el-input-number v-model="item.siteQuoteRatePercent" :controls="false" :min="0" :max="100" :precision="4" :disabled="tableReadonly" size="small" />
                <el-select
                  :value="getFeeMode(row.items, 'siteQuoteSettlementMode')"
                  :disabled="tableReadonly"
                  size="mini"
                  class="fee-mode-select"
                  @change="setFeeMode(row.items, 'siteQuoteSettlementMode', $event)"
                >
                  <el-option label="%" value="tiered_rate" />
                  <el-option label="固定" value="fixed_fee" />
                </el-select>
              </div>
              <div v-if="itemIndex === 0" class="fee-card__min">
                <span>最低手续费：¥</span>
                <el-input-number v-model="item.siteQuoteMinFee" :controls="false" :min="0" :precision="2" :disabled="tableReadonly" size="mini" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="labels.memberActualStandard" min-width="250" align="center">
        <template slot-scope="{ row }">
          <div v-if="getFeeMode(row.items, 'sourceFeeMode') === 'fixed_fee'" class="fee-card-list is-fixed">
            <div class="fee-card fee-card--member" :class="protocolClass(row.selectedProtocol)">
              <div class="fee-card__main">
                <div class="fee-value-with-unit">
                  <span class="readonly-fee-value">{{ formatMoney(getFixedValue(row.items, 'memberFixedFee')) }}</span>
                  <span class="fee-unit-tag">{{ formatFeeUnit(row.items[0] && row.items[0].feeUnit) }}</span>
                </div>
                <span class="readonly-fee-mode">固定</span>
              </div>
            </div>
          </div>
          <div v-else class="fee-card-list">
            <div
              v-for="(item, itemIndex) in row.items"
              :key="item.sourceRowKey"
              class="fee-card fee-card--member"
              :class="protocolClass(row.selectedProtocol)"
            >
              <div class="fee-card__main">
                <span class="readonly-fee-value">
                  {{ formatPercent(item.memberRatePercent) }}
                </span>
                <span class="readonly-fee-mode">%</span>
              </div>
              <div v-if="itemIndex === 0" class="fee-card__min is-readonly">
                <span>最低手续费：¥</span>
                <span>{{ formatMoney(item.memberMinFee) }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import {
  addDepositWithdrawFeeTemplate,
  delDepositWithdrawFeeTemplate,
  getDepositWithdrawFeeConfig,
  listDepositWithdrawFeeTemplates,
  saveDepositWithdrawFeeConfig,
  updateDepositWithdrawFeeTemplate
} from '@/api/depositWithdrawFee/config'
import { listSite } from '@/api/site/site'
export default {
  name: 'DepositWithdrawFeeSetting',
  dicts: ['pay_type', 'pay_coin'],
  data() {
    return {
      loading: false,
      saving: false,
      profileType: 'TEMPLATE',
      businessType: 'DEPOSIT',
      configMode: 'CUSTOM',
      currentTemplateId: null,
      currentSiteCode: null,
      followTemplateId: null,
      templateOptions: [],
      siteOptions: [],
      activeProtocols: {},
      depositItems: [],
      withdrawItems: []
    }
  },
  computed: {
    currentItems() {
      return this.businessType === 'DEPOSIT' ? this.depositItems : this.withdrawItems
    },
    currentTableRows() {
      return this.buildTableRows(this.currentItems)
    },
    labels() {
      const prefix = this.businessType === 'DEPOSIT' ? '充值' : '提现'
      return {
        thirdPartyStandard: `${prefix}三方收费标准`,
        siteQuoteStandard: `${prefix}对站点报价`,
        memberActualStandard: `${prefix}实际会员扣款`
      }
    },
    currentTemplateName() {
      const found = this.templateOptions.find(item => String(item.id) === String(this.currentTemplateId))
      return found ? found.templateName : ''
    },
    currentSiteLabel() {
      const found = this.siteOptions.find(item => String(item.code) === String(this.currentSiteCode))
      return found ? found.label : ''
    },
    currentContextText() {
      if (this.profileType === 'TEMPLATE') {
        return this.currentTemplateName || '未选择模版'
      }
      return this.currentSiteLabel || '未选择站点'
    },
    tableReadonly() {
      return this.profileType === 'SITE' && this.configMode === 'FOLLOW_TEMPLATE'
    },
    saveDisabled() {
      if (this.profileType === 'TEMPLATE') {
        return !this.currentTemplateId
      }
      if (!this.currentSiteCode) {
        return true
      }
      return this.configMode === 'FOLLOW_TEMPLATE' && !this.followTemplateId
    },
    channelTypeDict() {
      return (this.dict && this.dict.type && this.dict.type.pay_type) || []
    },
    channelCurrencyDict() {
      return (this.dict && this.dict.type && this.dict.type.pay_coin) || []
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.loading = true
      Promise.all([this.loadTemplates(), this.loadSites()]).then(() => {
        if (this.templateOptions.length > 0) {
          this.currentTemplateId = this.templateOptions[0].id
        }
        if (this.siteOptions.length > 0) {
          this.currentSiteCode = this.siteOptions[0].code
        }
        return this.loadCurrentConfig()
      }).finally(() => {
        this.loading = false
      })
    },
    loadTemplates() {
      return listDepositWithdrawFeeTemplates().then(response => {
        this.templateOptions = response.data || []
      })
    },
    loadSites() {
      return listSite({ pageNum: 1, pageSize: 1000, status: '1' }).then(response => {
        const rows = response.rows || []
        this.siteOptions = rows.filter(site => site && site.code).map(site => ({
          code: site.code,
          name: site.nameZn || site.nameEn || site.name || site.code,
          label: this.formatSiteLabel(site)
        }))
      })
    },
    loadCurrentConfig() {
      if (this.profileType === 'TEMPLATE') {
        if (!this.currentTemplateId) {
          this.applyConfig({})
          return Promise.resolve()
        }
        return this.fetchConfig({
          profileType: 'TEMPLATE',
          templateId: this.currentTemplateId
        })
      }
      if (!this.currentSiteCode) {
        this.applyConfig({})
        return Promise.resolve()
      }
      return this.fetchConfig({
        profileType: 'SITE',
        siteCode: this.currentSiteCode
      })
    },
    fetchConfig(query) {
      this.loading = true
      return getDepositWithdrawFeeConfig(query).then(response => {
        this.applyConfig(response.data || {})
      }).finally(() => {
        this.loading = false
      })
    },
    applyConfig(data) {
      this.configMode = data.configMode || this.configMode || 'CUSTOM'
      this.followTemplateId = data.followTemplateId || null
      this.depositItems = this.normalizeItems(data.depositItems || [])
      this.withdrawItems = this.normalizeItems(data.withdrawItems || [])
    },
    normalizeItems(items) {
      return items.map(item => ({
        ...item,
        thirdPartyRatePercent: this.toNumber(item.thirdPartyRatePercent, 0),
        thirdPartyFixedFee: this.toNumber(item.thirdPartyFixedFee, 0),
        siteQuoteRatePercent: this.toNumber(item.siteQuoteRatePercent, 0),
        memberRatePercent: this.toNumber(item.memberRatePercent, 0),
        siteQuoteMinFee: this.toNumber(item.siteQuoteMinFee, 0),
        memberMinFee: this.toNumber(item.memberMinFee, 0),
        siteQuoteFixedFee: this.toNumber(item.siteQuoteFixedFee, 0),
        memberFixedFee: this.toNumber(item.memberFixedFee, 0),
        thirdPartyMinFee: this.toNumber(item.thirdPartyMinFee, 0),
        thirdPartySettlementMode: item.thirdPartySettlementMode || 'tiered_rate',
        siteQuoteSettlementMode: item.siteQuoteSettlementMode || item.settlementMode || 'tiered_rate',
        settlementMode: item.siteQuoteSettlementMode || item.settlementMode || 'tiered_rate'
      }))
    },
    handleProfileTypeChange() {
      this.businessType = 'DEPOSIT'
      this.loadCurrentConfig()
    },
    handleConfigModeChange(mode) {
      if (mode === 'FOLLOW_TEMPLATE') {
        if (!this.followTemplateId && this.templateOptions.length > 0) {
          this.followTemplateId = this.templateOptions[0].id
        }
        this.loadFollowTemplatePreview()
      }
    },
    loadFollowTemplatePreview() {
      if (this.profileType !== 'SITE' || this.configMode !== 'FOLLOW_TEMPLATE' || !this.followTemplateId) {
        return
      }
      const selectedTemplateId = this.followTemplateId
      this.fetchConfig({
        profileType: 'TEMPLATE',
        templateId: selectedTemplateId
      }).then(() => {
        this.configMode = 'FOLLOW_TEMPLATE'
        this.followTemplateId = selectedTemplateId
      })
    },
    handleAddTemplate() {
      this.$prompt('请输入模版名称', '新增模版', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,64}$/,
        inputErrorMessage: '模版名称不能为空且不能超过64个字符'
      }).then(({ value }) => {
        return addDepositWithdrawFeeTemplate({ templateName: value.trim() })
      }).then(response => {
        this.$modal.msgSuccess('新增成功')
        return this.loadTemplates().then(() => {
          this.profileType = 'TEMPLATE'
          this.currentTemplateId = response.data && response.data.id ? response.data.id : this.currentTemplateId
          return this.loadCurrentConfig()
        })
      }).catch(() => {})
    },
    handleRenameTemplate() {
      if (!this.currentTemplateId) return
      this.$prompt('请输入模版名称', '重命名模版', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.currentTemplateName,
        inputPattern: /^.{1,64}$/,
        inputErrorMessage: '模版名称不能为空且不能超过64个字符'
      }).then(({ value }) => {
        return updateDepositWithdrawFeeTemplate(this.currentTemplateId, { templateName: value.trim() })
      }).then(() => {
        this.$modal.msgSuccess('修改成功')
        return this.loadTemplates()
      }).catch(() => {})
    },
    handleDeleteTemplate() {
      if (!this.currentTemplateId) return
      this.$modal.confirm(`确认删除模版「${this.currentTemplateName}」吗？`).then(() => {
        return delDepositWithdrawFeeTemplate(this.currentTemplateId)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.loadTemplates().then(() => {
          this.currentTemplateId = this.templateOptions.length > 0 ? this.templateOptions[0].id : null
          return this.loadCurrentConfig()
        })
      }).catch(() => {})
    },
    handleSave() {
      this.normalizeFeeGroupItems(this.depositItems)
      this.normalizeFeeGroupItems(this.withdrawItems)
      const message = this.validateItems()
      if (message) {
        this.$modal.msgWarning(message)
        return
      }
      const payload = {
        profileType: this.profileType,
        templateId: this.profileType === 'TEMPLATE' ? this.currentTemplateId : null,
        siteCode: this.profileType === 'SITE' ? this.currentSiteCode : null,
        configMode: this.profileType === 'SITE' ? this.configMode : 'CUSTOM',
        followTemplateId: this.profileType === 'SITE' && this.configMode === 'FOLLOW_TEMPLATE' ? this.followTemplateId : null,
        depositItems: this.buildSaveItems(this.depositItems),
        withdrawItems: this.buildSaveItems(this.withdrawItems)
      }
      this.saving = true
      saveDepositWithdrawFeeConfig(payload).then(response => {
        this.$modal.msgSuccess('保存成功')
        this.applyConfig(response.data || {})
      }).finally(() => {
        this.saving = false
      })
    },
    buildSaveItems(items) {
      return items.map(item => ({
        channelId: item.channelId,
        sourceRowKey: item.sourceRowKey,
        settlementMode: item.siteQuoteSettlementMode || item.settlementMode,
        thirdPartySettlementMode: item.thirdPartySettlementMode,
        thirdPartyRatePercent: item.thirdPartyRatePercent,
        thirdPartyFixedFee: item.thirdPartyFixedFee,
        thirdPartyMinFee: item.thirdPartyMinFee,
        siteQuoteSettlementMode: item.siteQuoteSettlementMode || item.settlementMode,
        siteQuoteRatePercent: item.siteQuoteRatePercent,
        siteQuoteMinFee: item.siteQuoteMinFee,
        siteQuoteFixedFee: item.siteQuoteFixedFee
      }))
    },
    validateItems() {
      const items = this.depositItems.concat(this.withdrawItems)
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!this.isSettlementMode(item.thirdPartySettlementMode) || !this.isSettlementMode(item.siteQuoteSettlementMode)) {
          return '请选择正确的手续费模式'
        }
        if (!this.isPercent(item.thirdPartyRatePercent) || !this.isPercent(item.siteQuoteRatePercent)) {
          return '百分比需在0到100之间'
        }
        if (!this.isMoney(item.thirdPartyFixedFee)) {
          return '三方固定收费不能小于0，且最多支持2位小数'
        }
        if (!this.isMoney(item.thirdPartyMinFee)) {
          return '三方最低手续费不能小于0，且最多支持2位小数'
        }
        if (!this.isMoney(item.siteQuoteMinFee)) {
          return '站点报价最低手续费不能小于0，且最多支持2位小数'
        }
        if (!this.isMoney(item.siteQuoteFixedFee)) {
          return '站点报价固定手续费不能小于0，且最多支持2位小数'
        }
      }
      return ''
    },
    isSettlementMode(value) {
      return ['tiered_rate', 'fixed_fee'].includes(value)
    },
    isPercent(value) {
      const numberValue = Number(value)
      return !Number.isNaN(numberValue) && numberValue >= 0 && numberValue <= 100
    },
    isMoney(value) {
      const numberValue = Number(value)
      if (Number.isNaN(numberValue) || numberValue < 0) {
        return false
      }
      const text = String(value)
      return !text.includes('.') || text.split('.')[1].length <= 2
    },
    getRowKey(row) {
      return row.rowKey
    },
    buildTableRows(items) {
      const groups = []
      const indexMap = {}
      ;(items || []).forEach(item => {
        const groupKey = `${item.businessType}|${item.channelId}`
        if (!indexMap[groupKey]) {
          const row = {
            ...item,
            rowKey: groupKey,
            allItems: [],
            items: [],
            amountItems: [],
            protocolOptions: [],
            selectedProtocol: ''
          }
          indexMap[groupKey] = row
          groups.push(row)
        }
        indexMap[groupKey].allItems.push(item)
        const protocol = this.parseProtocol(item.sourceRowKey)
        if (protocol) {
          this.addProtocolOption(indexMap[groupKey].protocolOptions, protocol)
        }
      })
      groups.forEach(row => {
        row.protocolOptions.sort((left, right) => this.protocolOrder(left) - this.protocolOrder(right))
        row.selectedProtocol = this.resolveSelectedProtocol(row)
        row.items = this.sortAmountItems(row.protocolOptions.length
          ? row.allItems.filter(item => this.parseProtocol(item.sourceRowKey) === row.selectedProtocol)
          : row.allItems.slice())
        row.amountItems = row.items
      })
      return groups
    },
    addProtocolOption(options, protocol) {
      if (protocol && !options.includes(protocol)) {
        options.push(protocol)
      }
    },
    resolveSelectedProtocol(row) {
      if (!row.protocolOptions.length) {
        return ''
      }
      const key = this.protocolStateKey(row)
      const current = this.activeProtocols[key]
      if (current && row.protocolOptions.includes(current)) {
        return current
      }
      return row.protocolOptions[0]
    },
    protocolStateKey(row) {
      return `${row.businessType}|${row.channelId}`
    },
    setActiveProtocol(row, protocol) {
      this.$set(this.activeProtocols, this.protocolStateKey(row), protocol)
    },
    sortAmountItems(items) {
      return (items || []).slice().sort((left, right) => {
        const leftFixed = this.isFixedSourceKey(left.sourceRowKey)
        const rightFixed = this.isFixedSourceKey(right.sourceRowKey)
        if (leftFixed !== rightFixed) {
          return leftFixed ? 1 : -1
        }
        const minDiff = this.toNumber(left.amountMin, 0) - this.toNumber(right.amountMin, 0)
        if (minDiff !== 0) {
          return minDiff
        }
        return this.toNumber(left.amountMax, 0) - this.toNumber(right.amountMax, 0)
      })
    },
    parseProtocol(sourceRowKey) {
      const text = String(sourceRowKey || '')
      const protocol = text.split(':')[0]
      return ['TRC20', 'BEP20', 'ERC20'].includes(protocol) ? protocol : ''
    },
    protocolOrder(value) {
      const order = { TRC20: 1, BEP20: 2, ERC20: 3 }
      const protocol = typeof value === 'string' ? value : this.parseProtocol(value && value.sourceRowKey)
      return order[protocol] || 99
    },
    protocolClass(value) {
      const protocol = typeof value === 'string' ? value : this.parseProtocol(value && value.sourceRowKey)
      return protocol ? `is-protocol-${protocol.toLowerCase()}` : ''
    },
    formatProtocolLabel(value) {
      const protocol = typeof value === 'string' ? value : this.parseProtocol(value && value.sourceRowKey)
      const labels = { TRC20: 'TRC20', BEP20: 'BSC', ERC20: 'ETH' }
      return labels[protocol] || ''
    },
    formatSiteLabel(site) {
      const code = site.code || site.siteCode || ''
      const name = site.nameZn || site.siteName || site.name || site.nameEn || ''
      if (code && name) return `${code}/${name}`
      return name || code
    },
    formatDictLabel(options, value) {
      const found = (options || []).find(item => String(item.value) === String(value))
      return found ? found.label : (value || '-')
    },
    formatAmountRange(row) {
      if (this.isFixedSourceKey(row.sourceRowKey)) {
        if (row.amountMin === null || row.amountMin === undefined) {
          return '固定手续费'
        }
      }
      const min = this.formatMoney(row.amountMin)
      const max = row.amountMax === null || row.amountMax === undefined ? '以上' : this.formatMoney(row.amountMax)
      return `${min} ~ ${max}`
    },
    isFixedSourceKey(sourceRowKey) {
      const text = String(sourceRowKey || '')
      return text === 'fixed' || text.endsWith(':fixed')
    },
    formatPercent(value) { return this.toNumber(value, 0).toFixed(4).replace(/\.?0+$/, '') },
    formatMoney(value) { return this.toNumber(value, 0).toFixed(2).replace(/\.00$/, '') },
    formatFeeUnit(unit) {
      const normalized = String(unit || 'CNY').toUpperCase()
      return normalized === 'CNY' ? '¥' : normalized
    },
    getFeeMode(items, field) {
      const first = (items || []).find(item => item && item[field])
      return first ? first[field] : 'tiered_rate'
    },
    setFeeMode(items, field, value) {
      ;(items || []).forEach(item => {
        this.$set(item, field, value)
      })
    },
    getFixedValue(items, field) {
      const first = (items || []).find(item => item && item[field] !== undefined && item[field] !== null)
      return first ? this.toNumber(first[field], 0) : 0
    },
    setFixedValue(items, field, value) {
      ;(items || []).forEach(item => {
        this.$set(item, field, this.toNumber(value, 0))
      })
    },
    normalizeFeeGroupItems(items) {
      const groups = {}
      ;(items || []).forEach(item => {
        const key = `${item.businessType}|${item.channelId}|${this.parseProtocol(item.sourceRowKey) || 'ROOT'}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(item)
      })
      Object.keys(groups).forEach(key => {
        const groupItems = this.sortAmountItems(groups[key])
        this.normalizeFeeGroup(groupItems, 'thirdPartySettlementMode', 'thirdPartyFixedFee', 'thirdPartyMinFee')
        this.normalizeFeeGroup(groupItems, 'siteQuoteSettlementMode', 'siteQuoteFixedFee', 'siteQuoteMinFee')
      })
    },
    normalizeFeeGroup(items, modeField, fixedField, minField) {
      if (!items || !items.length) {
        return
      }
      const mode = this.getFeeMode(items, modeField)
      const fixedValue = this.getFixedValue(items, fixedField)
      const minValue = minField ? this.toNumber(items[0] && items[0][minField], 0) : 0
      items.forEach(item => {
        this.$set(item, modeField, mode)
        if (mode === 'fixed_fee') {
          this.$set(item, fixedField, fixedValue)
        }
        if (mode === 'tiered_rate' && minField) {
          this.$set(item, minField, minValue)
        }
      })
    },
    toNumber(value, fallback) {
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? fallback : numberValue
    }
  }
}
</script>
<style scoped src="./style.css"></style>
