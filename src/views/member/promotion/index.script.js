import { getGlobalMemberPromotionSettings, updateGlobalMemberPromotionSettings } from '@/api/member/promotion'

const DEFAULT_FORM = Object.freeze({
  effectiveRechargeAmount: 0,
  withdrawTurnoverMultiple: 1,
  rechargeValidDays: 30,
  inviteValidDays: 30,
  depositValidDays: 30,
  commissionValidDays: 30,
  inviteRewardItems: [],
  depositRewardItems: [],
  commissionItems: []
})

const VENUE_META = {
  sport: { shortLabel: '体', icon: 'el-icon-football', theme: 'blue' },
  person: { shortLabel: '真', icon: 'el-icon-user', theme: 'green' },
  lottery: { shortLabel: '彩', icon: 'el-icon-coin', theme: 'gold' },
  cards: { shortLabel: '棋', icon: 'el-icon-s-grid', theme: 'rose' },
  dianzi: { shortLabel: '电', icon: 'el-icon-monitor', theme: 'indigo' },
  esports: { shortLabel: '竞', icon: 'el-icon-trophy', theme: 'violet' },
  fish: { shortLabel: '捕', icon: 'el-icon-ship', theme: 'cyan' }
}

function createDefaultForm() {
  return {
    effectiveRechargeAmount: DEFAULT_FORM.effectiveRechargeAmount,
    withdrawTurnoverMultiple: DEFAULT_FORM.withdrawTurnoverMultiple,
    rechargeValidDays: DEFAULT_FORM.rechargeValidDays,
    inviteValidDays: DEFAULT_FORM.inviteValidDays,
    depositValidDays: DEFAULT_FORM.depositValidDays,
    commissionValidDays: DEFAULT_FORM.commissionValidDays,
    inviteRewardItems: [],
    depositRewardItems: [],
    commissionItems: []
  }
}

export default {
  name: 'MemberPromotionSetting',
  data() {
    return {
      loading: false,
      saving: false,
      rowSeed: 1,
      form: createDefaultForm(),
      originalFormSnapshot: ''
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      this.loading = true
      try {
        const res = await getGlobalMemberPromotionSettings()
        this.applyForm((res && res.data) || {})
      } catch (e) {
        this.applyForm(createDefaultForm())
      } finally {
        this.loading = false
      }
    },
    applyForm(data) {
      this.form = this.normalizeForm(data)
      this.originalFormSnapshot = JSON.stringify(this.form)
    },
    normalizeForm(data) {
      const source = data && typeof data === 'object' ? data : {}
      const inviteRewardItems = Array.isArray(source.inviteRewardItems) ? source.inviteRewardItems : []
      const depositRewardItems = Array.isArray(source.depositRewardItems) ? source.depositRewardItems : []
      const commissionItems = Array.isArray(source.commissionItems) ? source.commissionItems : []
      return {
        effectiveRechargeAmount: this.toNumber(source.effectiveRechargeAmount),
        withdrawTurnoverMultiple: this.toNumber(source.withdrawTurnoverMultiple, 1),
        rechargeValidDays: this.toInt(source.rechargeValidDays, 30),
        inviteValidDays: this.toInt(source.inviteValidDays, 30),
        depositValidDays: this.toInt(source.depositValidDays, 30),
        commissionValidDays: this.toInt(source.commissionValidDays, 30),
        inviteRewardItems: inviteRewardItems.length
          ? inviteRewardItems.map((item) => this.normalizeInviteRewardItem(item))
          : [this.createInviteRewardItem()],
        depositRewardItems: depositRewardItems.length
          ? depositRewardItems.map((item) => this.normalizeDepositRewardItem(item))
          : [this.createDepositRewardItem()],
        commissionItems: commissionItems.map((item) => this.normalizeCommissionItem(item))
      }
    },
    normalizeInviteRewardItem(item) {
      const source = item && typeof item === 'object' ? item : {}
      return {
        localKey: this.nextLocalKey(),
        inviteCount: this.toInt(source.inviteCount, 0),
        inviterRewardAmount: this.toNumber(source.inviterRewardAmount),
        inviteeRewardAmount: this.toNumber(source.inviteeRewardAmount)
      }
    },
    normalizeDepositRewardItem(item) {
      const source = item && typeof item === 'object' ? item : {}
      return {
        localKey: this.nextLocalKey(),
        depositAmount: this.toNumber(source.depositAmount),
        inviterRewardAmount: this.toNumber(source.inviterRewardAmount),
        inviteeRewardAmount: this.toNumber(source.inviteeRewardAmount)
      }
    },
    normalizeCommissionItem(item) {
      const source = item && typeof item === 'object' ? item : {}
      const meta = VENUE_META[source.venueType] || {}
      const venueLabel = String(source.venueLabel || source.venueType || '场馆').trim()
      return {
        venueType: source.venueType,
        venueLabel,
        theme: meta.theme || source.theme || 'blue',
        icon: meta.icon || 'el-icon-star-off',
        shortLabel: meta.shortLabel || venueLabel.slice(0, 1),
        gameTurnoverRate: this.toPercent(source.gameTurnoverRate)
      }
    },
    createInviteRewardItem() {
      const last = this.form && Array.isArray(this.form.inviteRewardItems)
        ? this.form.inviteRewardItems[this.form.inviteRewardItems.length - 1]
        : null
      return {
        localKey: this.nextLocalKey(),
        inviteCount: this.toInt(last && last.inviteCount, 0) + 1,
        inviterRewardAmount: 0,
        inviteeRewardAmount: 0
      }
    },
    createDepositRewardItem() {
      const last = this.form && Array.isArray(this.form.depositRewardItems)
        ? this.form.depositRewardItems[this.form.depositRewardItems.length - 1]
        : null
      return {
        localKey: this.nextLocalKey(),
        depositAmount: this.toNumber(last && last.depositAmount, 0) + 1000,
        inviterRewardAmount: 0,
        inviteeRewardAmount: 0
      }
    },
    nextLocalKey() {
      const key = `row-${this.rowSeed}`
      this.rowSeed += 1
      return key
    },
    handleAddInviteRewardItem() {
      this.form.inviteRewardItems.push(this.createInviteRewardItem())
    },
    handleRemoveInviteRewardItem(index) {
      if (this.form.inviteRewardItems.length <= 1) {
        this.$message.warning('至少保留一条邀请人数奖励配置')
        return
      }
      this.form.inviteRewardItems.splice(index, 1)
    },
    handleAddDepositRewardItem() {
      this.form.depositRewardItems.push(this.createDepositRewardItem())
    },
    handleRemoveDepositRewardItem(index) {
      if (this.form.depositRewardItems.length <= 1) {
        this.$message.warning('至少保留一条存款奖励配置')
        return
      }
      this.form.depositRewardItems.splice(index, 1)
    },
    async handleSave() {
      if (!this.validateForm()) {
        return
      }
      this.saving = true
      try {
        const res = await updateGlobalMemberPromotionSettings(this.buildPayload())
        this.applyForm((res && res.data) || {})
        this.$message.success('会员推广设置已保存')
      } finally {
        this.saving = false
      }
    },
    validateForm() {
      if (this.form.effectiveRechargeAmount < 0) {
        this.$message.error('被邀请人最低有效充值额度不能小于 0')
        return false
      }
      if (this.form.withdrawTurnoverMultiple < 0) {
        this.$message.error('提现流水倍数不能小于 0')
        return false
      }
      if (this.form.rechargeValidDays <= 0 || this.form.inviteValidDays <= 0 || this.form.depositValidDays <= 0 || this.form.commissionValidDays <= 0) {
        this.$message.error('各奖励期限必须大于 0')
        return false
      }
      if (!this.validateInviteRewardItems()) {
        return false
      }
      if (!this.validateDepositRewardItems()) {
        return false
      }
      if (!Array.isArray(this.form.commissionItems) || this.form.commissionItems.length === 0) {
        this.$message.error('请至少配置一个场馆的投注返佣比例')
        return false
      }
      const invalidCommission = this.form.commissionItems.find((item) => {
        const value = this.toNumber(item.gameTurnoverRate, -1)
        return value < 0 || value > 100
      })
      if (invalidCommission) {
        this.$message.error(`${invalidCommission.venueLabel} 的游戏返水比例必须在 0 到 100 之间`)
        return false
      }
      return true
    },
    validateInviteRewardItems() {
      if (!Array.isArray(this.form.inviteRewardItems) || this.form.inviteRewardItems.length === 0) {
        this.$message.error('请至少配置一条邀请人数奖励')
        return false
      }
      const seen = new Set()
      for (let i = 0; i < this.form.inviteRewardItems.length; i += 1) {
        const item = this.form.inviteRewardItems[i]
        const inviteCount = this.toInt(item.inviteCount, -1)
        if (inviteCount < 0) {
          this.$message.error(`第 ${i + 1} 条邀请人数门槛不能小于 0`)
          return false
        }
        if (seen.has(inviteCount)) {
          this.$message.error('邀请人数门槛不能重复')
          return false
        }
        seen.add(inviteCount)
        if (this.toNumber(item.inviterRewardAmount, -1) < 0 || this.toNumber(item.inviteeRewardAmount, -1) < 0) {
          this.$message.error(`第 ${i + 1} 条邀请人数奖励金额不能小于 0`)
          return false
        }
      }
      return true
    },
    validateDepositRewardItems() {
      if (!Array.isArray(this.form.depositRewardItems) || this.form.depositRewardItems.length === 0) {
        this.$message.error('请至少配置一条存款奖励')
        return false
      }
      const seen = new Set()
      for (let i = 0; i < this.form.depositRewardItems.length; i += 1) {
        const item = this.form.depositRewardItems[i]
        const depositAmount = this.toNumber(item.depositAmount, -1)
        if (depositAmount < 0) {
          this.$message.error(`第 ${i + 1} 条存款额度不能小于 0`)
          return false
        }
        const key = depositAmount.toFixed(2)
        if (seen.has(key)) {
          this.$message.error('存款额度不能重复')
          return false
        }
        seen.add(key)
        if (this.toNumber(item.inviterRewardAmount, -1) < 0 || this.toNumber(item.inviteeRewardAmount, -1) < 0) {
          this.$message.error(`第 ${i + 1} 条存款奖励金额不能小于 0`)
          return false
        }
      }
      return true
    },
    buildPayload() {
      const inviteRewardItems = this.form.inviteRewardItems
        .slice()
        .sort((a, b) => this.toInt(a.inviteCount, 0) - this.toInt(b.inviteCount, 0))
        .map((item) => ({
          inviteCount: this.toInt(item.inviteCount, 0),
          inviterRewardAmount: this.toNumber(item.inviterRewardAmount),
          inviteeRewardAmount: this.toNumber(item.inviteeRewardAmount)
        }))

      const depositRewardItems = this.form.depositRewardItems
        .slice()
        .sort((a, b) => this.toNumber(a.depositAmount) - this.toNumber(b.depositAmount))
        .map((item) => ({
          depositAmount: this.toNumber(item.depositAmount),
          inviterRewardAmount: this.toNumber(item.inviterRewardAmount),
          inviteeRewardAmount: this.toNumber(item.inviteeRewardAmount)
        }))

      return {
        effectiveRechargeAmount: this.toNumber(this.form.effectiveRechargeAmount),
        withdrawTurnoverMultiple: this.toNumber(this.form.withdrawTurnoverMultiple, 1),
        rechargeValidDays: this.toInt(this.form.rechargeValidDays, 30),
        inviteValidDays: this.toInt(this.form.inviteValidDays, 30),
        depositValidDays: this.toInt(this.form.depositValidDays, 30),
        commissionValidDays: this.toInt(this.form.commissionValidDays, 30),
        inviteRewardItems,
        depositRewardItems,
        commissionItems: this.form.commissionItems.map((item) => ({
          venueType: item.venueType,
          gameTurnoverRate: this.toRate(item.gameTurnoverRate)
        }))
      }
    },
    resolveTheme(theme) {
      const value = String(theme || 'blue').toLowerCase()
      if (['blue', 'green', 'gold', 'rose', 'indigo', 'violet', 'cyan', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)) {
        return value
      }
      return 'blue'
    },
    toPercent(value) {
      const rate = this.toNumber(value)
      return this.toNumber((rate * 100).toFixed(2))
    },
    toRate(value) {
      const percent = this.toNumber(value)
      return Number((percent / 100).toFixed(4))
    },
    toNumber(value, defaultValue = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : defaultValue
    },
    toInt(value, defaultValue = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? Math.trunc(num) : defaultValue
    }
  }
}
