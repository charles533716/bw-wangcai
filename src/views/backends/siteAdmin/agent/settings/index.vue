<template>
  <div class="agent-settings-page">
    <div class="header-card">
      <div class="header-left">
        <div class="header-icon">
          <i class="el-icon-s-operation" />
        </div>
        <div class="header-text">
          <div class="title">代理分润体系配置</div>
          <div class="sub-title">设置代理结算规则，返佣比例请到总控返佣方案中维护</div>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          icon="el-icon-refresh-left"
          :disabled="saving || !isEditable"
          @click="handleResetDefaults"
        >
          恢复默认
        </el-button>
        <el-button
          type="primary"
          icon="el-icon-folder-checked"
          :loading="saving"
          :disabled="!isEditable"
          @click="handleSave"
        >
          保存设置
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!isEditable"
      class="readonly-tip"
      title="当前账号无超级管理员权限，仅可查看配置。"
      type="warning"
      :closable="false"
      show-icon
    />

    <div class="layout-grid top-grid">
      <el-card class="section-card" shadow="never">
        <div class="card-head">
          <span>返佣比例配置说明</span>
          <el-tag size="mini" type="primary">动态等级</el-tag>
        </div>
        <el-alert
          title="返佣比例已改为动态等级配置"
          description="星级/层级和各级返佣比例请在总控后台的通用返佣方案或站点专用返佣方案中维护；本站点设置页不再写回固定 1~6 级返佣参数。"
          type="info"
          :closable="false"
          show-icon
        />
      </el-card>

      <el-card class="section-card side-card" shadow="never">
        <div class="card-head">营收计算逻辑</div>
        <div class="logic-line">当日玩家输金额减去赢金额作为当日营收分润返佣基数。</div>
        <div class="formula">公式：营收 =（Σ 输额）-（Σ 赢额）</div>
      </el-card>

      <el-card class="section-card side-card" shadow="never">
        <div class="card-head">代理开户规则</div>
        <div class="rule-item danger">
          <i class="el-icon-warning-outline" />
          <span>代理账号不能新增星级代理。</span>
        </div>
        <div class="rule-item success">
          <i class="el-icon-circle-check" />
          <span>其他级别代理仅可开设级别低于本人的代理。</span>
        </div>
        <div class="rule-example">
          示例：多层级代理仅可开设级别低于本人的代理，具体可选级别来自返佣方案明细。
        </div>
      </el-card>
    </div>

    <div class="layout-grid mid-grid">
      <el-card class="section-card" shadow="never">
        <div class="card-head">
          <span>代理成本 / 手续费配置</span>
          <el-tag size="mini" type="info">财务风控</el-tag>
        </div>

        <div class="fees-grid">
          <div class="fee-item">
            <div class="fee-label">充值手续费</div>
            <div class="fee-input-wrap">
              <el-input-number
                v-model="form.depositFeeRatePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                controls-position="right"
                class="fee-input"
                :disabled="!isEditable"
              />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="fee-item">
            <div class="fee-label">提现手续费</div>
            <div class="fee-input-wrap">
              <el-input-number
                v-model="form.withdrawFeeRatePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                controls-position="right"
                class="fee-input"
                :disabled="!isEditable"
              />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="fee-item">
            <div class="fee-label">三方场馆手续费</div>
            <div class="fee-input-wrap">
              <el-input-number
                v-model="form.venueFeeRatePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                controls-position="right"
                class="fee-input"
                :disabled="!isEditable"
              />
              <span class="unit">%</span>
            </div>
          </div>

          <div class="fee-item">
            <div class="fee-label">站点服务费</div>
            <div class="fee-input-wrap">
              <el-input-number
                v-model="form.siteServiceFeeRatePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="0.1"
                controls-position="right"
                class="fee-input"
                :disabled="!isEditable"
              />
              <span class="unit">%</span>
            </div>
          </div>
        </div>

        <div class="bonus-switch">
          <div class="switch-left">
            <div class="switch-icon"><i class="el-icon-present" /></div>
            <div>
              <div class="switch-title">彩金扣除选项</div>
              <div class="switch-desc">是否在代理分润结算中自动扣除已发放的活动彩金？</div>
            </div>
          </div>
          <div class="switch-right">
            <el-switch
              v-model="form.bonusDeductEnabled"
              active-color="#5b7cff"
              :disabled="!isEditable"
            />
          </div>
        </div>
      </el-card>

      <el-card class="section-card notice-card" shadow="never">
        <div class="notice-title">分润结算须知</div>
        <ul class="notice-list">
          <li>返佣结算采用实时极差计算。</li>
          <li>上级代理获得的分润 =（本人返佣比 - 下级直接代理返佣比）× 下级团队总营收。</li>
          <li>多层级情况下以此类推，逐层差额分润。</li>
          <li>当前周期：{{ settlementCycleText }}</li>
          <li>执行时间：{{ executeTimeText }}</li>
        </ul>
      </el-card>
    </div>

    <el-card class="section-card settle-card" shadow="never">
      <div class="card-head">
        <span>结算周期设置</span>
      </div>

      <div class="cycle-options">
        <div
          v-for="item in cycleOptions"
          :key="item.value"
          class="cycle-item"
          :class="{ active: form.settlementCycleType === item.value }"
          @click="handleChooseCycle(item.value)"
        >
          <div class="cycle-name">{{ item.label }}</div>
          <div class="cycle-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="settle-form">
        <div v-if="form.settlementCycleType === 'WEEKLY'" class="settle-row">
          <span class="settle-label">每周结算日</span>
          <el-select v-model="form.weeklySettleDay" class="w-220" :disabled="!isEditable">
            <el-option v-for="it in weeklyOptions" :key="it.value" :label="it.label" :value="it.value" />
          </el-select>
        </div>

        <div v-if="form.settlementCycleType === 'MONTHLY'" class="settle-row">
          <span class="settle-label">每月结算日</span>
          <el-input-number
            v-model="form.monthlySettleDay"
            :min="1"
            :max="28"
            :step="1"
            :step-strictly="true"
            controls-position="right"
            class="w-220"
            :disabled="!isEditable"
          />
        </div>

        <div v-if="form.settlementCycleType === 'CUSTOM'" class="settle-row">
          <span class="settle-label">自定义间隔（天）</span>
          <el-input-number
            v-model="form.customCycleDays"
            :min="1"
            :max="365"
            :step="1"
            :step-strictly="true"
            controls-position="right"
            class="w-220"
            :disabled="!isEditable"
          />
        </div>

        <div class="settle-row">
          <span class="settle-label">执行具体时间</span>
          <el-time-picker
            v-model="form.settleExecuteTime"
            value-format="HH:mm"
            format="HH:mm"
            placeholder="选择时间"
            class="w-220"
            :clearable="false"
            :disabled="!isEditable"
            @change="handleTimeChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getAgentSettingsConfig,
  updateAgentSettingsConfig,
  resetAgentSettingsConfig
} from '@/api/agent/settings'

const CYCLE_WEEKLY = 'WEEKLY'
const CYCLE_MONTHLY = 'MONTHLY'
const CYCLE_CUSTOM = 'CUSTOM'

function buildDefaultForm() {
  return {
    profitMode: 'GAP',
    depositFeeRatePercent: 1,
    withdrawFeeRatePercent: 0.5,
    venueFeeRatePercent: 12,
    siteServiceFeeRatePercent: 3,
    bonusDeductEnabled: true,
    settlementCycleType: CYCLE_WEEKLY,
    weeklySettleDay: 1,
    monthlySettleDay: 1,
    customCycleDays: 7,
    settleExecuteTime: '02:00',
    editable: false
  }
}

export default {
  name: 'AgentSettingsPage',
  data() {
    return {
      loading: false,
      saving: false,
      form: buildDefaultForm(),
      originalForm: buildDefaultForm(),
      cycleOptions: [
        { value: CYCLE_WEEKLY, label: '周结算（默认）', desc: '每周固定日期结算上周佣金' },
        { value: CYCLE_MONTHLY, label: '月结算', desc: '每月固定日期结算上月佣金' },
        { value: CYCLE_CUSTOM, label: '自定义结算日期', desc: '按指定时间间隔进行结算' }
      ],
      weeklyOptions: [
        { label: '周一', value: 1 },
        { label: '周二', value: 2 },
        { label: '周三', value: 3 },
        { label: '周四', value: 4 },
        { label: '周五', value: 5 },
        { label: '周六', value: 6 },
        { label: '周日', value: 7 }
      ]
    }
  },
  computed: {
    isEditable() {
      return !!this.form.editable
    },
    settlementCycleText() {
      if (this.form.settlementCycleType === CYCLE_MONTHLY) {
        return `月结算（每月${this.form.monthlySettleDay}日）`
      }
      if (this.form.settlementCycleType === CYCLE_CUSTOM) {
        return `自定义结算（每${this.form.customCycleDays}天）`
      }
      const weeklyLabel = this.weeklyOptions.find(it => it.value === this.form.weeklySettleDay)
      return `周结算（${weeklyLabel ? weeklyLabel.label : '周一'}）`
    },
    executeTimeText() {
      return this.form.settleExecuteTime || '02:00'
    }
  },
  created() {
    this.fetchConfig()
  },
  methods: {
    fetchConfig() {
      this.loading = true
      getAgentSettingsConfig()
        .then(resp => {
          const serverData = (resp && resp.data) || {}
          const normalized = this.normalizeForm(serverData)
          this.form = { ...normalized }
          this.originalForm = { ...normalized }
        })
        .finally(() => {
          this.loading = false
        })
    },
    normalizeForm(data) {
      const defaults = buildDefaultForm()
      return {
        ...defaults,
        ...data,
        depositFeeRatePercent: this.toDecimal(data.depositFeeRatePercent, defaults.depositFeeRatePercent),
        withdrawFeeRatePercent: this.toDecimal(data.withdrawFeeRatePercent, defaults.withdrawFeeRatePercent),
        venueFeeRatePercent: this.toDecimal(data.venueFeeRatePercent, defaults.venueFeeRatePercent),
        siteServiceFeeRatePercent: this.toDecimal(data.siteServiceFeeRatePercent, defaults.siteServiceFeeRatePercent),
        bonusDeductEnabled: this.toBool(data.bonusDeductEnabled, defaults.bonusDeductEnabled),
        settlementCycleType: this.normalizeCycleType(data.settlementCycleType) || defaults.settlementCycleType,
        weeklySettleDay: this.toInt(data.weeklySettleDay, defaults.weeklySettleDay),
        monthlySettleDay: this.toInt(data.monthlySettleDay, defaults.monthlySettleDay),
        customCycleDays: this.toInt(data.customCycleDays, defaults.customCycleDays),
        settleExecuteTime: this.normalizeTime(data.settleExecuteTime) || defaults.settleExecuteTime,
        editable: this.toBool(data.editable, defaults.editable)
      }
    },
    toInt(value, fallback) {
      const num = Number(value)
      if (Number.isFinite(num)) {
        return Math.trunc(num)
      }
      return fallback
    },
    toDecimal(value, fallback) {
      const num = Number(value)
      if (!Number.isFinite(num)) {
        return fallback
      }
      return Number(num.toFixed(2))
    },
    toBool(value, fallback) {
      if (value === true || value === false) {
        return value
      }
      if (value === 1 || value === '1' || value === 'true') {
        return true
      }
      if (value === 0 || value === '0' || value === 'false') {
        return false
      }
      return fallback
    },
    normalizeCycleType(value) {
      const raw = String(value || '').toUpperCase()
      if ([CYCLE_WEEKLY, CYCLE_MONTHLY, CYCLE_CUSTOM].includes(raw)) {
        return raw
      }
      return ''
    },
    normalizeTime(value) {
      const text = String(value || '').trim()
      const reg = /^([01]\d|2[0-3]):([0-5]\d)$/
      return reg.test(text) ? text : ''
    },
    handleChooseCycle(cycleType) {
      if (!this.isEditable) {
        return
      }
      this.form.settlementCycleType = cycleType
    },
    handleTimeChange(value) {
      this.form.settleExecuteTime = this.normalizeTime(value) || '02:00'
    },
    buildPayload() {
      return {
        depositFeeRatePercent: this.toDecimal(this.form.depositFeeRatePercent, 0),
        withdrawFeeRatePercent: this.toDecimal(this.form.withdrawFeeRatePercent, 0),
        venueFeeRatePercent: this.toDecimal(this.form.venueFeeRatePercent, 0),
        siteServiceFeeRatePercent: this.toDecimal(this.form.siteServiceFeeRatePercent, 0),
        bonusDeductEnabled: !!this.form.bonusDeductEnabled,
        settlementCycleType: this.form.settlementCycleType,
        weeklySettleDay: this.toInt(this.form.weeklySettleDay, 1),
        monthlySettleDay: this.toInt(this.form.monthlySettleDay, 1),
        customCycleDays: this.toInt(this.form.customCycleDays, 7),
        settleExecuteTime: this.normalizeTime(this.form.settleExecuteTime) || '02:00'
      }
    },
    validateBeforeSave(payload) {
      const feeRates = [
        payload.depositFeeRatePercent,
        payload.withdrawFeeRatePercent,
        payload.venueFeeRatePercent,
        payload.siteServiceFeeRatePercent
      ]
      const feeOk = feeRates.every(v => Number.isFinite(v) && v >= 0 && v <= 100)
      if (!feeOk) {
        this.$message.error('手续费比例必须在0-100之间')
        return false
      }

      if (![CYCLE_WEEKLY, CYCLE_MONTHLY, CYCLE_CUSTOM].includes(payload.settlementCycleType)) {
        this.$message.error('结算方式仅支持周结算、月结算或自定义结算')
        return false
      }
      if (!this.normalizeTime(payload.settleExecuteTime)) {
        this.$message.error('执行时间格式必须为HH:mm')
        return false
      }
      if (payload.settlementCycleType === CYCLE_WEEKLY && (payload.weeklySettleDay < 1 || payload.weeklySettleDay > 7)) {
        this.$message.error('周结算执行日范围为1-7')
        return false
      }
      if (payload.settlementCycleType === CYCLE_MONTHLY && (payload.monthlySettleDay < 1 || payload.monthlySettleDay > 28)) {
        this.$message.error('月结算执行日范围为1-28')
        return false
      }
      if (payload.settlementCycleType === CYCLE_CUSTOM && (payload.customCycleDays < 1 || payload.customCycleDays > 365)) {
        this.$message.error('自定义结算间隔范围为1-365天')
        return false
      }
      return true
    },
    hasFeeChanged(payload) {
      const original = this.originalForm || {}
      return Number(payload.depositFeeRatePercent) !== Number(original.depositFeeRatePercent) ||
        Number(payload.withdrawFeeRatePercent) !== Number(original.withdrawFeeRatePercent) ||
        Number(payload.venueFeeRatePercent) !== Number(original.venueFeeRatePercent) ||
        Number(payload.siteServiceFeeRatePercent) !== Number(original.siteServiceFeeRatePercent)
    },
    async handleSave() {
      if (!this.isEditable) {
        this.$message.warning('仅超级管理员可以保存配置')
        return
      }
      const payload = this.buildPayload()
      if (!this.validateBeforeSave(payload)) {
        return
      }

      if (this.hasFeeChanged(payload)) {
        const confirmed = await this.$confirm(
          '手续费比例修改会影响当前周期内已产生但未结算的佣金，确认继续保存吗？',
          '风险提示',
          { type: 'warning' }
        ).then(() => true).catch(() => false)
        if (!confirmed) {
          return
        }
      }

      this.saving = true
      updateAgentSettingsConfig(payload)
        .then(resp => {
          const result = (resp && resp.data) || {}
          const config = this.normalizeForm(result.config || {})
          this.form = { ...this.form, ...config, editable: this.form.editable }
          this.originalForm = { ...this.form }
          const warnings = result.warnings || []
          if (warnings.length) {
            this.$message.warning(warnings[0])
          } else {
            this.$message.success('保存成功')
          }
        })
        .finally(() => {
          this.saving = false
        })
    },
    async handleResetDefaults() {
      if (!this.isEditable) {
        this.$message.warning('仅超级管理员可以恢复默认')
        return
      }

      const confirmed = await this.$confirm(
        '确认恢复为系统默认配置吗？恢复后将立即生效。',
        '提示',
        { type: 'warning' }
      ).then(() => true).catch(() => false)
      if (!confirmed) {
        return
      }

      this.saving = true
      resetAgentSettingsConfig()
        .then(resp => {
          const result = (resp && resp.data) || {}
          const config = this.normalizeForm(result.config || {})
          this.form = { ...this.form, ...config, editable: this.form.editable }
          this.originalForm = { ...this.form }
          this.$message.success('已恢复默认配置')
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>

<style scoped>
.agent-settings-page {
  padding: 16px;
  background: #f4f6fb;
  min-height: 100%;
}

.header-card {
  background: #fff;
  border: 1px solid #e9edf7;
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6f8cff 0%, #3a63f3 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 6px 14px rgba(58, 99, 243, 0.24);
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1a2340;
}

.sub-title {
  margin-top: 2px;
  color: #7c879f;
  font-size: 13px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.readonly-tip {
  margin-top: 12px;
}

.layout-grid {
  margin-top: 14px;
}

.top-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  grid-template-rows: auto auto;
  gap: 14px;
}

.top-grid .section-card:first-child {
  grid-row: 1 / span 2;
}

.mid-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 14px;
}

.section-card {
  border: 1px solid #e7ebf5;
  border-radius: 14px;
}

.card-head {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1f2a44;
  font-size: 18px;
  font-weight: 700;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.level-item {
  border: 1px solid #e7ebf5;
  border-radius: 12px;
  padding: 12px;
  background: #fdfdff;
}

.level-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.level-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #27304f;
  font-weight: 700;
}

.level-badge {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #121a36;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.star-score {
  color: #f5b72f;
  font-size: 13px;
}

.rate-input-wrap,
.fee-input-wrap {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-input,
.fee-input {
  width: calc(100% - 22px);
}

.unit {
  color: #6d7894;
  font-weight: 700;
}

.rule-desc {
  margin-top: 10px;
  color: #65708b;
  font-size: 12px;
}

.side-card .card-head {
  font-size: 16px;
}

.logic-line {
  font-size: 13px;
  color: #2c3757;
  line-height: 1.6;
}

.formula {
  margin: 10px 0;
  padding: 10px;
  border: 1px dashed #a7b8f8;
  border-radius: 10px;
  background: #f8faff;
  color: #3e5dd2;
  font-weight: 700;
}

.logic-tips {
  color: #5f6b87;
  font-size: 12px;
  line-height: 1.7;
}

.rule-item {
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
}

.rule-item.danger {
  background: #fff5f4;
  color: #ef5f5f;
}

.rule-item.success {
  background: #f2fbf5;
  color: #43a86f;
}

.rule-example {
  margin-top: 4px;
  color: #8a95ae;
  font-size: 12px;
  line-height: 1.7;
}

.fees-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.fee-item {
  border: 1px solid #e7ebf5;
  border-radius: 12px;
  padding: 12px;
  background: #fdfdff;
}

.fee-label {
  color: #4b5573;
  font-size: 13px;
  font-weight: 600;
}

.bonus-switch {
  margin-top: 14px;
  border: 1px solid #dfe7ff;
  background: #f7f9ff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.switch-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6c8bff 0%, #4166f0 100%);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 8px 16px rgba(65, 102, 240, 0.25);
}

.switch-title {
  color: #1e2846;
  font-size: 16px;
  font-weight: 700;
}

.switch-desc {
  margin-top: 2px;
  color: #6d7993;
  font-size: 12px;
}

.notice-card {
  background: #0f1f45;
  color: #e7efff;
}

.notice-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
}

.notice-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
  font-size: 13px;
}

.settle-card {
  margin-top: 14px;
}

.cycle-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.cycle-item {
  border: 1px solid #e5e9f5;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  background: #fff;
}

.cycle-item.active {
  border-color: #4b72ff;
  box-shadow: 0 0 0 2px rgba(75, 114, 255, 0.14) inset;
}

.cycle-name {
  color: #27304f;
  font-size: 16px;
  font-weight: 700;
}

.cycle-desc {
  margin-top: 6px;
  color: #7782a0;
  font-size: 12px;
  line-height: 1.6;
}

.settle-form {
  margin-top: 14px;
  border: 1px solid #e8edf8;
  border-radius: 12px;
  padding: 14px;
}

.settle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.settle-row:last-child {
  margin-bottom: 0;
}

.settle-label {
  width: 110px;
  color: #4c5775;
  font-size: 13px;
  flex-shrink: 0;
}

.w-220 {
  width: 220px;
}

@media (max-width: 1400px) {
  .top-grid,
  .mid-grid {
    grid-template-columns: 1fr;
  }

  .top-grid .section-card:first-child {
    grid-row: auto;
  }

  .cycle-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 992px) {
  .levels-grid,
  .fees-grid {
    grid-template-columns: 1fr;
  }

  .header-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
