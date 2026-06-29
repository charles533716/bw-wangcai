import { listSite } from '@/api/site/site'
import {
  listMemberUserVipConfig,
  addMemberUserVipConfig,
  updateMemberUserVipConfig,
  listMemberUserVipRebateConfig,
  addMemberUserVipRebateConfig,
  updateMemberUserVipRebateConfig
} from '@/api/member/vip'

const DEFAULT_VENUE_TYPES = [
  { key: 'sport', label: '体育', color: '#4f72ff' },
  { key: 'person', label: '真人', color: '#17b26a' },
  { key: 'lottery', label: '彩票', color: '#f59e0b' },
  { key: 'cards', label: '棋牌', color: '#ef4444' },
  { key: 'dianzi', label: '电子', color: '#8b5cf6' },
  { key: 'esports', label: '电竞', color: '#6366f1' },
  { key: 'fish', label: '捕鱼', color: '#06b6d4' }
]

const VENUE_COLORS = ['#4f72ff', '#17b26a', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#06b6d4', '#14b8a6', '#f97316']
const MASTER_SITE_KEY = '__MASTER__'

export default {
  name: 'MemberVipSetting',
  data() {
    return {
      loading: false,
      saving: false,
      activeCardId: '',
      nextLocalId: 1,
      selectedSiteCode: MASTER_SITE_KEY,
      siteOptions: [{ code: MASTER_SITE_KEY, label: '总站' }],
      venueTypes: [],
      vipLevels: [],
      deletedVipConfigs: [],
      configFields: [
        { key: 'totalTurnover', label: '累计流水（≥）', unit: 'CNY', color: '#94a3b8' },
        { key: 'upgradeBonus', label: '晋升礼金', unit: '', color: '#f59e0b' },
        { key: 'weeklyBonus', label: '周礼金', unit: '', color: '#fb7185' },
        { key: 'monthlyBonus', label: '月礼金', unit: '', color: '#818cf8' },
        { key: 'validDays', label: '礼金过期时间', unit: '天', color: '#f43f5e' },
        { key: 'bonusTurnoverMultiple', label: '礼金流水倍数', unit: '倍', color: '#10b981' }
      ],
      retainFields: [
        { key: 'remainLevelTotalBetAmount', label: '保级流水', unit: 'CNY' },
        { key: 'remainLevelDays', label: '达标期限', unit: '天' }
      ],
      benefitFields: [
        { key: 'dailyWithdrawCount', label: '日提款次数' },
        { key: 'rmbDailyLimit', label: 'RMB每日额度' },
        { key: 'dailyTotalLimit', label: '每日总额度' }
      ]
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    async initPage() {
      this.loading = true
      try {
        await Promise.all([this.loadSiteOptions(), this.loadVenueTypes()])
        await this.loadVipData()
      } finally {
        this.loading = false
      }
    },
    async loadSiteOptions() {
      const response = await listSite({ pageNum: 1, pageSize: 1000 })
      const rows = Array.isArray(response.rows) ? response.rows : []
      const siteList = rows.filter((site) => site && site.code).map((site) => ({
        code: site.code,
        label: `${site.nameZn || site.nameEn || site.code || ''} (${site.code || '-'})`
      }))
      this.siteOptions = [{ code: MASTER_SITE_KEY, label: '总站' }].concat(siteList)
      if (!this.siteOptions.find((item) => item.code === this.selectedSiteCode)) {
        this.selectedSiteCode = MASTER_SITE_KEY
      }
    },
    async loadVenueTypes() {
      let dictRows = []
      try {
        const dictRes = await this.getDicts('venue_type')
        dictRows = Array.isArray(dictRes.data) ? dictRes.data : []
      } catch (e) {
        dictRows = []
      }

      if (!dictRows.length) {
        this.venueTypes = DEFAULT_VENUE_TYPES.slice()
        return
      }

      this.venueTypes = dictRows.map((item, index) => ({
        key: item.dictValue,
        label: item.dictLabel,
        color: VENUE_COLORS[index % VENUE_COLORS.length]
      }))
    },
    async loadVipData() {
      const baseQuery = {
        pageNum: 1,
        pageSize: 200,
        status: 0
      }
      const rebatePromise = listMemberUserVipRebateConfig({
        pageNum: 1,
        pageSize: 5000,
        scopeType: 0,
        status: 0
      })

      let siteRows = []
      let fallbackToMaster = false

      if (this.isMasterSelected()) {
        const masterRes = await listMemberUserVipConfig({
          ...baseQuery,
          siteCodeIsNull: true,
          scopeType: 0
        })
        siteRows = Array.isArray(masterRes.rows) ? masterRes.rows : []
      } else {
        const siteRes = await listMemberUserVipConfig({
          ...baseQuery,
          siteCode: this.selectedSiteCode,
          scopeType: 1
        })
        siteRows = Array.isArray(siteRes.rows) ? siteRes.rows : []

        if (!siteRows.length) {
          fallbackToMaster = true
          const masterRes = await listMemberUserVipConfig({
            ...baseQuery,
            siteCodeIsNull: true,
            scopeType: 0
          })
          siteRows = Array.isArray(masterRes.rows) ? masterRes.rows : []
        }
      }

      const vipRows = siteRows
        .slice()
        .sort((a, b) => Number(a.vipLevel || 0) - Number(b.vipLevel || 0))

      const rebateRes = await rebatePromise

      const rebateRows = (Array.isArray(rebateRes.rows) ? rebateRes.rows : []).filter((item) => this.isGlobalRebate(item))

      const mapped = vipRows.map((row) => this.mapVipLevel(row, rebateRows, fallbackToMaster))
      this.vipLevels = mapped
      this.deletedVipConfigs = []
      this.activeCardId = this.vipLevels[0] ? this.vipLevels[0].localKey : ''
    },
    mapVipLevel(row, rebateRows, resetId = false) {
      const rates = this.buildEmptyRebateRates()
      const vipLevel = Number(row.vipLevel || 0)

      this.venueTypes.forEach((venue) => {
        const target = rebateRows.find(
          (item) => Number(item.vipLevel || 0) === vipLevel && item.venueType === venue.key
        )
        rates[venue.key] = this.toUiRebateRate(target ? target.rebateRate : 0)
      })

      return {
        localKey: resetId ? `local-${this.nextLocalId++}` : (row.id ? `db-${row.id}` : `local-${this.nextLocalId++}`),
        id: resetId ? null : (row.id || null),
        vipLevel,
        totalTurnover: this.normalizeNumber(row.totalTurnover),
        remainLevelDays: Number(row.remainLevelDays || 0),
        remainLevelTotalBetAmount: this.normalizeNumber(row.remainLevelTotalBetAmount),
        upgradeBonus: this.normalizeNumber(row.upgradeBonus),
        weeklyBonus: this.normalizeNumber(row.weeklyBonus),
        monthlyBonus: this.normalizeNumber(row.monthlyBonus),
        validDays: Number(row.validDays || 30),
        bonusTurnoverMultiple: this.normalizeNumber(row.bonusTurnoverMultiple, 1),
        rebateTurnoverMultiple: this.normalizeNumberWithFallback(row.rebateTurnoverMultiple, this.normalizeNumber(row.bonusTurnoverMultiple, 1)),
        dailyWithdrawCount: Number(row.dailyWithdrawCount || 0),
        rmbDailyLimit: this.normalizeNumber(row.rmbDailyLimit),
        dailyTotalLimit: this.normalizeNumber(row.dailyTotalLimit),
        rebateRates: rates
      }
    },
    createDefaultVipLevel(vipLevel) {
      return {
        localKey: `local-${this.nextLocalId++}`,
        id: null,
        vipLevel,
        totalTurnover: 0,
        remainLevelDays: 0,
        remainLevelTotalBetAmount: 0,
        upgradeBonus: 0,
        weeklyBonus: 0,
        monthlyBonus: 0,
        validDays: 30,
        bonusTurnoverMultiple: 1,
        rebateTurnoverMultiple: 1,
        dailyWithdrawCount: 0,
        rmbDailyLimit: 0,
        dailyTotalLimit: 0,
        rebateRates: this.buildEmptyRebateRates()
      }
    },
    buildEmptyRebateRates() {
      const rates = {}
      this.venueTypes.forEach((venue) => {
        rates[venue.key] = '0.00'
      })
      return rates
    },
    normalizeNumber(value, defaultValue = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : defaultValue
    },
    normalizeNumberWithFallback(value, defaultValue = 0) {
      if (value === null || value === undefined || value === '') {
        return defaultValue
      }
      return this.normalizeNumber(value, defaultValue)
    },
    toUiRebateRate(value) {
      const percent = this.normalizeNumber(value) * 100
      return this.normalizeNumber(percent.toFixed(2)).toFixed(2)
    },
    isMasterSelected() {
      return this.selectedSiteCode === MASTER_SITE_KEY
    },
    getSelectedSiteCodeForSave() {
      return this.isMasterSelected() ? null : this.selectedSiteCode
    },
    handleAddLevel() {
      let lastVip = null
      this.vipLevels.forEach((item) => {
        const current = Number(item.vipLevel || 0)
        if (!lastVip || current > Number(lastVip.vipLevel || 0)) {
          lastVip = item
        }
      })

      const maxLevel = lastVip ? Number(lastVip.vipLevel || 0) : -1
      const prevTurnover = lastVip ? this.normalizeNumber(lastVip.totalTurnover) : 0
      const newLevel = this.createDefaultVipLevel(maxLevel + 1)
      newLevel.totalTurnover = prevTurnover + 1
      this.vipLevels.push(newLevel)
      this.activeCardId = newLevel.localKey
    },
    async handleRemoveLevel(vipItem) {
      if (this.vipLevels.length <= 1) {
        this.$message.warning('至少保留一个VIP等级')
        return
      }

      if (!vipItem || !vipItem.localKey) {
        return
      }

      const targetIndex = this.vipLevels.findIndex((item) => item.localKey === vipItem.localKey)
      const target = targetIndex > -1 ? this.vipLevels[targetIndex] : null
      const maxVipLevel = this.getMaxVipLevel()
      if (!target || Number(target.vipLevel || 0) !== maxVipLevel) {
        this.$message.warning(`请先删除最高VIP等级（VIP ${maxVipLevel}）`)
        return
      }

      this.$confirm('确认删除该VIP等级配置吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const removeIndex = this.vipLevels.findIndex((item) => item.localKey === vipItem.localKey)
          if (removeIndex < 0) {
            return
          }

          const target = this.vipLevels[removeIndex]
          this.saving = true
          try {
            if (target && target.id) {
              await updateMemberUserVipConfig({ id: target.id, status: 1 })
              await this.deleteRebateByVipLevel(target.vipLevel)
            }

            const removed = this.vipLevels.splice(removeIndex, 1)
            const removedTarget = removed[0]
            if (removedTarget && removedTarget.localKey === this.activeCardId) {
              this.activeCardId = this.vipLevels[0] ? this.vipLevels[0].localKey : ''
            }
            this.$message.success('删除成功')
          } catch (error) {
            this.$message.error('删除失败，请稍后重试')
          } finally {
            this.saving = false
          }
        })
        .catch(() => {})
    },
    async deleteRebateByVipLevel(vipLevel) {
      const rebateRes = await listMemberUserVipRebateConfig({
        pageNum: 1,
        pageSize: 5000,
        scopeType: 0,
        status: 0
      })
      const existingGlobalRebates = (Array.isArray(rebateRes.rows) ? rebateRes.rows : []).filter((item) => this.isGlobalRebate(item))
      const targetRebates = existingGlobalRebates.filter((item) => Number(item.vipLevel || 0) === Number(vipLevel || 0))
      if (!targetRebates.length) {
        return
      }
      await Promise.all(targetRebates.map((item) => updateMemberUserVipRebateConfig({ id: item.id, status: 1 })))
    },
    getMaxVipLevel() {
      return this.vipLevels.reduce((max, item) => {
        const current = Number(item.vipLevel || 0)
        return current > max ? current : max
      }, 0)
    },
    isHighestVipLevel(vipItem) {
      if (!vipItem) {
        return false
      }
      return Number(vipItem.vipLevel || 0) === this.getMaxVipLevel()
    },
    async handleSiteChange() {
      this.loading = true
      try {
        await this.loadVipData()
      } finally {
        this.loading = false
      }
    },
    validateVipLevels() {
      if (!this.vipLevels.length) {
        this.$message.warning('请至少保留一个VIP等级')
        return false
      }

      const levelSet = new Set()
      for (let i = 0; i < this.vipLevels.length; i += 1) {
        const item = this.vipLevels[i]
        const level = Number(item.vipLevel)
        if (!Number.isInteger(level) || level < 0) {
          this.$message.warning(`第 ${i + 1} 个等级的VIP等级必须为大于等于0的整数`)
          return false
        }
        if (levelSet.has(level)) {
          this.$message.warning(`VIP等级 ${level} 重复，请调整后再保存`)
          return false
        }
        levelSet.add(level)
      }

      const sortedByLevel = this.vipLevels
        .slice()
        .sort((a, b) => Number(a.vipLevel || 0) - Number(b.vipLevel || 0))

      for (let i = 1; i < sortedByLevel.length; i += 1) {
        const prev = sortedByLevel[i - 1]
        const curr = sortedByLevel[i]
        const prevTurnover = this.normalizeNumber(prev.totalTurnover)
        const currTurnover = this.normalizeNumber(curr.totalTurnover)
        if (currTurnover <= prevTurnover) {
          this.$message.warning(
            `VIP ${curr.vipLevel} 的累计流水必须大于前一等级 VIP ${prev.vipLevel} 的累计流水`
          )
          return false
        }
      }

      for (let i = 0; i < this.vipLevels.length; i += 1) {
        const item = this.vipLevels[i]
        const rebateTurnoverMultiple = Number(item.rebateTurnoverMultiple)
        if (!Number.isFinite(rebateTurnoverMultiple) || rebateTurnoverMultiple < 0) {
          this.$message.warning(`VIP ${item.vipLevel} 的返水流水倍数必须为大于等于0的数字`)
          return false
        }
      }
      return true
    },
    buildVipConfigPayload(item) {
      return {
        id: item.id || undefined,
        siteCode: this.getSelectedSiteCodeForSave(),
        vipLevel: Number(item.vipLevel),
        totalTurnover: this.normalizeNumber(item.totalTurnover),
        remainLevelDays: Number(item.remainLevelDays || 0),
        remainLevelTotalBetAmount: this.normalizeNumber(item.remainLevelTotalBetAmount),
        upgradeBonus: this.normalizeNumber(item.upgradeBonus),
        weeklyBonus: this.normalizeNumber(item.weeklyBonus),
        monthlyBonus: this.normalizeNumber(item.monthlyBonus),
        validDays: Number(item.validDays || 30),
        bonusTurnoverMultiple: this.normalizeNumber(item.bonusTurnoverMultiple, 1),
        rebateTurnoverMultiple: this.normalizeNumberWithFallback(item.rebateTurnoverMultiple, this.normalizeNumber(item.bonusTurnoverMultiple, 1)),
        dailyWithdrawCount: Number(item.dailyWithdrawCount || 0),
        rmbDailyLimit: this.normalizeNumber(item.rmbDailyLimit),
        dailyTotalLimit: this.normalizeNumber(item.dailyTotalLimit),
        scopeType: this.isMasterSelected() ? 0 : 1,
        status: 0
      }
    },
    buildRebatePayload(vipItem, venueType) {
      return {
        vipLevel: Number(vipItem.vipLevel),
        venueType,
        rebateRate: this.normalizeNumber(vipItem.rebateRates[venueType]),
        scopeType: 0,
        status: 0,
        siteCode: null
      }
    },
    isGlobalRebate(item) {
      return Number(item.scopeType) === 0 && Number(item.status) === 0 && (item.siteCode === null || item.siteCode === undefined)
    },
    async handleSaveAll() {
      if (!this.validateVipLevels()) {
        return
      }

      this.saving = true
      try {
        const saveVipTasks = this.vipLevels.map((item) => {
          const payload = this.buildVipConfigPayload(item)
          return item.id ? updateMemberUserVipConfig(payload) : addMemberUserVipConfig(payload)
        })

        this.deletedVipConfigs.forEach((item) => {
          saveVipTasks.push(updateMemberUserVipConfig({ id: item.id, status: 1 }))
        })

        await Promise.all(saveVipTasks)

        const rebateRes = await listMemberUserVipRebateConfig({
          pageNum: 1,
          pageSize: 5000,
          scopeType: 0,
          status: 0
        })
        const existingGlobalRebates = (Array.isArray(rebateRes.rows) ? rebateRes.rows : []).filter((item) => this.isGlobalRebate(item))

        const existingMap = {}
        existingGlobalRebates.forEach((item) => {
          existingMap[`${item.vipLevel}_${item.venueType}`] = item
        })

        const seenKeys = new Set()
        const saveRebateTasks = []

        this.vipLevels.forEach((item) => {
          this.venueTypes.forEach((venue) => {
            const key = `${item.vipLevel}_${venue.key}`
            seenKeys.add(key)

            const payload = this.buildRebatePayload(item, venue.key)
            const existing = existingMap[key]
            if (existing && existing.id) {
              saveRebateTasks.push(updateMemberUserVipRebateConfig({ id: existing.id, ...payload }))
            } else {
              saveRebateTasks.push(addMemberUserVipRebateConfig(payload))
            }
          })
        })

        existingGlobalRebates.forEach((item) => {
          const key = `${item.vipLevel}_${item.venueType}`
          if (!seenKeys.has(key) && item.id) {
            saveRebateTasks.push(updateMemberUserVipRebateConfig({ id: item.id, status: 1 }))
          }
        })

        if (saveRebateTasks.length) {
          await Promise.all(saveRebateTasks)
        }

        this.$message.success('保存成功')
        await this.loadVipData()
      } catch (error) {
        this.$message.error('保存失败，请稍后重试')
      } finally {
        this.saving = false
      }
    }
  }
}
