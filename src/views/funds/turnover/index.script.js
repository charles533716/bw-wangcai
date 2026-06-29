import { getGlobalTurnoverSettings, updateGlobalTurnoverSettings } from '@/api/funds/turnoverSetting'

const DEFAULT_FORM = Object.freeze({
  percentageRate: 0,
  fixedAmount: 0,
  currentTurnoverBase: 0,
  turnoverBase: 0,
  venueItems: []
})

const VENUE_META = {
  sport: {
    shortLabel: '体',
    description: '包含足球、篮球、网球等所有体育赛事投注。',
    theme: 'sport'
  },
  person: {
    shortLabel: '真',
    description: '包含百家乐、龙虎、轮盘等真人娱乐项目。',
    theme: 'person'
  },
  esports: {
    shortLabel: '竞',
    description: '包含英雄联盟、DOTA2、CS:GO 等电子竞技赛事。',
    theme: 'esports'
  },
  cards: {
    shortLabel: '棋',
    description: '包含斗地主、麻将、德州扑克等棋牌竞技项目。',
    theme: 'cards'
  },
  lottery: {
    shortLabel: '彩',
    description: '包含时时彩、快3、11选5等各类彩票平台玩法。',
    theme: 'lottery'
  },
  dianzi: {
    shortLabel: '电',
    description: '包含各类老虎机、捕鱼达人等电子类游戏。',
    theme: 'dianzi'
  },
  fish: {
    shortLabel: '捕',
    description: '包含基于区块链哈希值的各类即时开奖渔场游戏。',
    theme: 'fish'
  }
}

function createDefaultForm() {
  return {
    percentageRate: DEFAULT_FORM.percentageRate,
    fixedAmount: DEFAULT_FORM.fixedAmount,
    currentTurnoverBase: DEFAULT_FORM.currentTurnoverBase,
    turnoverBase: DEFAULT_FORM.turnoverBase,
    venueItems: []
  }
}

export default {
  name: 'FundsTurnoverSetting',
  data() {
    return {
      loading: false,
      saving: false,
      form: createDefaultForm(),
      originalFormSnapshot: ''
    }
  },
  watch: {
    'form.turnoverBase'(value) {
      this.form.currentTurnoverBase = this.toNumber(value)
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      this.loading = true
      try {
        const res = await getGlobalTurnoverSettings()
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
      const venueItems = Array.isArray(source.venueItems) ? source.venueItems : []
      return {
        percentageRate: this.toNumber(source.percentageRate),
        fixedAmount: this.toNumber(source.fixedAmount),
        currentTurnoverBase: this.toNumber(source.currentTurnoverBase),
        turnoverBase: this.toNumber(source.turnoverBase),
        venueItems: venueItems.map((item) => this.normalizeVenueItem(item))
      }
    },
    normalizeVenueItem(item) {
      const source = item && typeof item === 'object' ? item : {}
      const meta = VENUE_META[source.venueType] || {}
      const venueLabel = String(source.venueLabel || source.venueType || '场馆').trim()
      return {
        venueType: source.venueType,
        venueLabel,
        theme: meta.theme || source.theme || 'primary',
        turnoverMultiple: this.toNumber(source.turnoverMultiple, 1),
        shortLabel: meta.shortLabel || venueLabel.slice(0, 1),
        description: meta.description || '按当前场馆盈利参与提现流水计算。'
      }
    },
    handleReset() {
      if (!this.originalFormSnapshot) {
        this.form = createDefaultForm()
        return
      }
      this.form = JSON.parse(this.originalFormSnapshot)
      this.$message.success('已恢复当前保存值')
    },
    async handleSave() {
      if (!this.validateForm()) {
        return
      }
      this.saving = true
      try {
        const res = await updateGlobalTurnoverSettings(this.buildPayload())
        this.applyForm((res && res.data) || {})
        this.$message.success('提现流水设置已保存')
      } finally {
        this.saving = false
      }
    },
    validateForm() {
      if (this.form.percentageRate < 0) {
        this.$message.error('指定百分比额度不能小于 0')
        return false
      }
      if (this.form.fixedAmount < 0) {
        this.$message.error('固定额度不能小于 0')
        return false
      }
      if (this.form.turnoverBase < 0) {
        this.$message.error('提现流水基数不能小于 0')
        return false
      }
      if (!Array.isArray(this.form.venueItems) || this.form.venueItems.length === 0) {
        this.$message.error('请至少配置一个场馆的游戏流水倍数')
        return false
      }
      const invalidItem = this.form.venueItems.find((item) => this.toNumber(item.turnoverMultiple, -1) < 0)
      if (invalidItem) {
        this.$message.error(`${invalidItem.venueLabel} 的游戏流水倍数不能小于 0`)
        return false
      }
      return true
    },
    buildPayload() {
      return {
        percentageRate: this.form.percentageRate,
        fixedAmount: this.form.fixedAmount,
        turnoverBase: this.form.turnoverBase,
        venueItems: this.form.venueItems.map((item) => ({
          venueType: item.venueType,
          turnoverMultiple: item.turnoverMultiple
        }))
      }
    },
    computeActualTurnover(turnoverMultiple) {
      return this.toNumber(this.form.turnoverBase) * this.toNumber(turnoverMultiple)
    },
    resolveTheme(theme) {
      const value = String(theme || 'primary').toLowerCase()
      if (['sport', 'person', 'esports', 'cards', 'lottery', 'dianzi', 'fish', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)) {
        return value
      }
      return 'primary'
    },
    formatMoney(value) {
      const num = this.toNumber(value)
      return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CNY`
    },
    formatPercent(value) {
      return `${this.toNumber(value).toFixed(2)}%`
    },
    formatMultiple(value) {
      return `${this.toNumber(value).toFixed(1)}x`
    },
    toNumber(value, defaultValue = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : defaultValue
    }
  }
}
