<template>
  <div class="ops-board app-container">
    <section class="ops-toolbar">
      <div class="ops-toolbar__title">全站运营数据看板</div>
      <div class="ops-toolbar__filters">
        <el-select
          v-model="query.siteCode"
          size="small"
          class="ops-toolbar__site"
          popper-class="ops-site-select-popper"
          :popper-append-to-body="false"
          placeholder="请选择站点"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.value"
            :label="site.label"
            :value="site.value"
          />
        </el-select>
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          size="small"
          class="ops-toolbar__date"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="起始日期"
          end-placeholder="结束日期"
          :clearable="false"
        />
        <el-button type="primary" size="small" class="ops-toolbar__button" @click="handleQuery">
          查询
        </el-button>
      </div>
    </section>

    <section class="overview-panel">
      <div class="module-title">网站收益 / 资金明细</div>
      <div class="overview-grid">
        <div v-for="item in dashboardData.overview" :key="item.label" class="overview-item">
          <div class="overview-item__label">{{ item.label }}</div>
          <div class="overview-item__value">{{ item.value }}</div>
        </div>
      </div>
    </section>

    <section class="module-grid">
      <article
        v-for="module in dashboardData.modules"
        :key="module.key"
        class="data-module"
        :class="[`is-${module.size || 'small'}`, { 'is-compact': module.compact }]"
      >
        <div class="module-title">{{ module.title }}</div>
        <div class="module-table">
          <table v-if="module.rows.length" class="module-table__content">
            <thead>
              <tr>
                <th
                  v-for="field in module.fields"
                  :key="field.key"
                  :class="[fieldSizeClass(field), { 'is-wide': isWideField(field) }]"
                >
                  <span class="field-label">
                    {{ field.label }}
                    <el-popover
                      v-if="field.tooltip"
                      trigger="click"
                      placement="top"
                      width="260"
                      :content="field.tooltip"
                    >
                      <button slot="reference" type="button" class="field-help">?</button>
                    </el-popover>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in module.rows" :key="`${module.key}-${rowIndex}`">
                <td
                  v-for="field in module.fields"
                  :key="field.key"
                  :class="[fieldSizeClass(field), { 'is-wide': isWideField(field) }]"
                >
                  {{ row[field.key] }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="module-empty">暂无数据</div>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import { getDashboardSiteOptions, getOperationsDashboard } from '@/api/report/dashboard'

const SITE_OPTIONS = [
  { value: 'ALL', label: '全部站点' },
  { value: 'WANGCAI', label: '旺财体育' },
  { value: 'DW', label: 'DW体育' },
  { value: 'CAISHEN', label: '财神体育' }
]

const SITE_NAMES = SITE_OPTIONS.filter((item) => item.value !== 'ALL').map((item) => item.label)
const MEMBER_NAMES = ['wc_10086', 'dw_70888', 'cs_90018', 'wc_16888', 'dw_55123', 'cs_77889', 'wc_60666', 'dw_31314', 'cs_52020', 'wc_99881']
const AGENT_NAMES = ['agent_wang01', 'agent_dw02', 'agent_cs03', 'agent_gold04', 'agent_star05', 'agent_top06', 'agent_plus07', 'agent_fast08', 'agent_win09', 'agent_hot10']
const VENUE_NAMES = ['旺财体育', '熊猫体育', 'IM体育', '旺财真人', '旺财彩票', '旺财电子', 'DB电子', 'PG电子', 'DB棋牌', 'IM电竞']
const GAME_NAMES = ['麻将胡了', '赏金女王', '超级王牌', '财神到', '极速糖果', '宝石侠', '英雄捕鱼', '黄金之城', '水果派对', '龙珠探宝']

const money = (value) => `¥ ${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const numberText = (value) => Number(value || 0).toLocaleString('zh-CN')

const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const resolveSelectedSites = (siteCode, siteOptions = SITE_OPTIONS) => {
  const availableSites = siteOptions
    .filter((item) => item.value !== 'ALL')
    .map((item) => item.label)

  if (!siteCode || siteCode === 'ALL') return availableSites.length ? availableSites : SITE_NAMES
  const site = siteOptions.find((item) => item.value === siteCode)
  return site ? [site.label] : SITE_NAMES
}

const buildTopRows = (sites, mapper) => {
  return Array.from({ length: 10 }).map((_, index) => {
    const site = sites[index % sites.length]
    return mapper(index, site)
  })
}

const moduleFields = {
  registration: [
    { key: 'site', label: '站点' },
    { key: 'depositTotal', label: '充值总金额' },
    { key: 'withdrawTotal', label: '提款总金额' },
    { key: 'activityBonus', label: '活动优惠', tooltip: '所有类型的优惠+VIP彩金+线下人工手动活动' },
    { key: 'vipRebate', label: 'VIP返水' },
    { key: 'agentCommission', label: '代理佣金' },
    { key: 'manualDepositTotal', label: '人工充值总金额' },
    { key: 'manualWithdrawTotal', label: '人工提现总金额' },
    { key: 'platformProfit', label: '平台游戏盈利总金额' }
  ],
  totalUsers: [
    { key: 'todayRegister', label: '今日注册' },
    { key: 'firstDepositUsers', label: '首冲人数' },
    { key: 'firstDepositAmount', label: '首冲金额' },
    { key: 'totalDeposit', label: '总存金额' },
    { key: 'userBalance', label: '用户余额' },
    { key: 'todayBet', label: '今日投注' },
    { key: 'validBet', label: '有效投注' },
    { key: 'orderCount', label: '注单数量' },
    { key: 'bettorCount', label: '投注人数' },
    { key: 'activeUsers', label: '活跃人数' },
    { key: 'betProfit', label: '投注盈亏' }
  ],
  amountRecharge: [
    { key: 'site', label: '站点' },
    { key: 'depositCount', label: '充值笔数' },
    { key: 'depositUsers', label: '充值人数' },
    { key: 'avgDeposit', label: '人均充值' }
  ],
  siteIncome: [
    { key: 'site', label: '站点' },
    { key: 'activeUsers', label: '活跃人数' },
    { key: 'profitAmount', label: '盈亏金额' },
    { key: 'depositGap', label: '存提差' }
  ],
  withdrawToday: [
    { key: 'site', label: '站点' },
    { key: 'withdrawCount', label: '提现笔数' },
    { key: 'withdrawUsers', label: '提现人数' },
    { key: 'avgWithdraw', label: '人均提现' }
  ],
  memberDepositRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'member', label: '会员' },
    { key: 'people', label: '人数' },
    { key: 'count', label: '笔数' }
  ],
  memberWithdrawRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'member', label: '会员' },
    { key: 'people', label: '人数' },
    { key: 'count', label: '笔数' }
  ],
  winRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'member', label: '会员' },
    { key: 'winAmount', label: '赢钱' },
    { key: 'orderCount', label: '订单数' }
  ],
  loseRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'member', label: '会员' },
    { key: 'loseAmount', label: '输钱' },
    { key: 'orderCount', label: '订单数' }
  ],
  agentDevelopmentRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'offlineTotal', label: '累积下线' },
    { key: 'todayNew', label: '今日新增' },
    { key: 'agentCommission', label: '代理佣金' },
    { key: 'agentBalance', label: '代理余额' }
  ],
  venueBetRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'venueName', label: '场馆名称' },
    { key: 'betAmount', label: '投注金额' },
    { key: 'orderCount', label: '订单数' },
    { key: 'profitAmount', label: '总盈亏' }
  ],
  electronicGameRank: [
    { key: 'site', label: '站点' },
    { key: 'rank', label: '排名' },
    { key: 'gameName', label: '游戏名称' },
    { key: 'betAmount', label: '投注金额' },
    { key: 'orderCount', label: '订单数' },
    { key: 'profitAmount', label: '总盈亏' }
  ]
}

const createOperationsDashboardData = (query = {}, siteOptions = SITE_OPTIONS) => {
  const sites = resolveSelectedSites(query.siteCode, siteOptions)
  const dateRange = Array.isArray(query.dateRange) ? query.dateRange : [today(), today()]
  const daySeed = dateRange.join('').replace(/\D/g, '').slice(-4) || '0713'
  const seed = Number(daySeed) || 713
  const siteScale = sites.length

  return {
    overview: [
      { label: '总投注额度', value: money((seed + 4200) * 288 * siteScale) },
      { label: '总收益', value: money((seed + 1200) * 38 * siteScale) },
      { label: '全站用户总额', value: money((seed + 6500) * 208 * siteScale) },
      { label: '资金池总额', value: money((seed + 2300) * 166 * siteScale) }
    ],
    modules: [
      {
        key: 'registration',
        title: '注册人数',
        size: 'large',
        fields: moduleFields.registration,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          depositTotal: money(880000 - index * 31800),
          withdrawTotal: money(520000 - index * 21400),
          activityBonus: money(48000 - index * 1260),
          vipRebate: money(26000 - index * 880),
          agentCommission: money(36000 - index * 960),
          manualDepositTotal: money(18000 - index * 530),
          manualWithdrawTotal: money(12000 - index * 410),
          platformProfit: money(96000 - index * 2180)
        }))
      },
      {
        key: 'totalUsers',
        title: '总用户数',
        size: 'large',
        fields: moduleFields.totalUsers,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          todayRegister: numberText(238 - index * 8),
          firstDepositUsers: numberText(126 - index * 5),
          firstDepositAmount: money(186000 - index * 7200),
          totalDeposit: money(986000 - index * 36000),
          userBalance: money(560000 - index * 22000),
          todayBet: money(1280000 - index * 46800),
          validBet: money(1080000 - index * 39000),
          orderCount: numberText(12860 - index * 310),
          bettorCount: numberText(860 - index * 24),
          activeUsers: numberText(1820 - index * 42),
          betProfit: money(76000 - index * 2100)
        }))
      },
      {
        key: 'amountRecharge',
        title: '金额充值排行',
        size: 'small',
        fields: moduleFields.amountRecharge,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          depositCount: numberText(780 - index * 28),
          depositUsers: numberText(530 - index * 18),
          avgDeposit: money(2680 - index * 76)
        }))
      },
      {
        key: 'siteIncome',
        title: '站点收益排行',
        size: 'small',
        fields: moduleFields.siteIncome,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          activeUsers: numberText(2160 - index * 65),
          profitAmount: money(286000 - index * 9600),
          depositGap: money(128000 - index * 5200)
        }))
      },
      {
        key: 'withdrawToday',
        title: '今日提现排行',
        size: 'small',
        fields: moduleFields.withdrawToday,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          withdrawCount: numberText(360 - index * 12),
          withdrawUsers: numberText(286 - index * 9),
          avgWithdraw: money(3280 - index * 92)
        }))
      },
      {
        key: 'memberDepositRank',
        title: '充值排行榜',
        size: 'small',
        fields: moduleFields.memberDepositRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          member: MEMBER_NAMES[index],
          people: 1,
          count: numberText(38 - index)
        }))
      },
      {
        key: 'memberWithdrawRank',
        title: '提现排行榜',
        size: 'small',
        fields: moduleFields.memberWithdrawRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          member: MEMBER_NAMES[(index + 3) % MEMBER_NAMES.length],
          people: 1,
          count: numberText(26 - index)
        }))
      },
      {
        key: 'winRank',
        title: '赢钱排行榜',
        size: 'small',
        fields: moduleFields.winRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          member: MEMBER_NAMES[(index + 1) % MEMBER_NAMES.length],
          winAmount: money(118000 - index * 6300),
          orderCount: numberText(136 - index * 6)
        }))
      },
      {
        key: 'loseRank',
        title: '输钱排行榜',
        size: 'small',
        fields: moduleFields.loseRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          member: MEMBER_NAMES[(index + 5) % MEMBER_NAMES.length],
          loseAmount: money(96000 - index * 5100),
          orderCount: numberText(128 - index * 5)
        }))
      },
      {
        key: 'agentDevelopmentRank',
        title: '代理发展排行榜',
        size: 'medium',
        fields: moduleFields.agentDevelopmentRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          offlineTotal: numberText(860 - index * 32),
          todayNew: numberText(68 - index * 2),
          agentCommission: money(58000 - index * 1800),
          agentBalance: money(128000 - index * 4200),
          agent: AGENT_NAMES[index]
        }))
      },
      {
        key: 'venueBetRank',
        title: '场馆投注排行',
        size: 'medium',
        compact: true,
        fields: moduleFields.venueBetRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          venueName: VENUE_NAMES[index],
          betAmount: money(760000 - index * 28000),
          orderCount: numberText(6890 - index * 186),
          profitAmount: money(86000 - index * 2400)
        }))
      },
      {
        key: 'electronicGameRank',
        title: '电子游戏排行',
        size: 'medium',
        compact: true,
        fields: moduleFields.electronicGameRank,
        rows: buildTopRows(sites, (index, site) => ({
          site,
          rank: index + 1,
          gameName: GAME_NAMES[index],
          betAmount: money(460000 - index * 18600),
          orderCount: numberText(4200 - index * 128),
          profitAmount: money(52000 - index * 1700)
        }))
      }
    ]
  }
}

export default {
  name: 'AdminOperationsDashboard',
  created() {
    this.loadSiteOptions()
    this.dashboardData = createOperationsDashboardData(this.query, this.siteOptions)
  },
  data() {
    const currentDate = today()
    return {
      siteOptions: SITE_OPTIONS,
      query: {
        siteCode: 'ALL',
        dateRange: [currentDate, currentDate]
      },
      dashboardData: createOperationsDashboardData({
        siteCode: 'ALL',
        dateRange: [currentDate, currentDate]
      }, SITE_OPTIONS)
    }
  },
  methods: {
    async loadSiteOptions() {
      try {
        const response = await getDashboardSiteOptions()
        const options = response && response.data && response.data.options
        if (Array.isArray(options) && options.length) {
          const normalizedOptions = options.map((item) => ({
            label: item.label,
            value: item.value
          }))
          this.siteOptions = normalizedOptions.some((item) => item.value === 'ALL')
            ? normalizedOptions
            : [{ value: 'ALL', label: '全部站点' }].concat(normalizedOptions)
          this.dashboardData = createOperationsDashboardData(this.query, this.siteOptions)
        }
      } catch (e) {
        this.siteOptions = SITE_OPTIONS
      }
    },
    async handleQuery() {
      try {
        await getOperationsDashboard({
          siteCode: this.query.siteCode,
          startDate: this.query.dateRange[0],
          endDate: this.query.dateRange[1]
        })
      } catch (e) {
        // 原型环境接口失败时仍使用本地演示数据刷新页面。
      }
      this.dashboardData = createOperationsDashboardData(this.query, this.siteOptions)
      this.$message.success('全站运营数据已更新')
    },
    isWideField(field) {
      return ['manualDepositTotal', 'manualWithdrawTotal', 'platformProfit'].includes(field.key)
    },
    fieldSizeClass(field) {
      if (field.key === 'rank') return 'is-rank'
      if (['orderCount', 'count', 'people'].includes(field.key)) return 'is-count'
      if (['site', 'member', 'venueName', 'gameName'].includes(field.key)) return 'is-name'
      if (/Amount|Total|Balance|Gap|Profit|Deposit|Withdraw|Rebate|Commission|Bet|winAmount|loseAmount/.test(field.key)) return 'is-money'
      return ''
    }
  }
}
</script>

<style scoped lang="scss">
.ops-board {
  min-height: calc(100vh - 84px);
  padding: 12px;
  background: #f5f7fb;
}

.ops-toolbar {
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid #e5eaf3;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.ops-toolbar__title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

.ops-toolbar__filters {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.ops-toolbar__site {
  width: 220px;
}

.ops-toolbar__date {
  width: 300px;
}

.ops-toolbar__button {
  min-width: 72px;
}

.overview-panel,
.data-module {
  border: 1px solid #e5eaf3;
  border-radius: 6px;
  background: #fff;
}

.overview-panel {
  margin-bottom: 12px;
  padding: 14px 16px 16px;
}

.module-title {
  margin-bottom: 10px;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 700;
  color: #f5222d;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.overview-item {
  padding: 12px 14px;
  border: 1px solid #edf1f7;
  border-radius: 4px;
  background: #fafcff;
}

.overview-item__label {
  margin-bottom: 8px;
  font-size: 13px;
  color: #1f2937;
}

.overview-item__value {
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  color: #111827;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.data-module {
  min-width: 0;
  padding: 12px 12px 14px;
}

.data-module.is-large {
  grid-column: span 6;
}

.data-module.is-medium {
  grid-column: span 3;
}

.data-module.is-small {
  grid-column: span 2;
}

.module-table {
  overflow-x: auto;
  border: 1px solid #edf1f7;
  border-radius: 4px;
}

.module-table__content {
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  table-layout: auto;
}

.module-table__content th,
.module-table__content td {
  min-width: 88px;
  padding: 7px 8px;
  border-right: 1px solid #edf1f7;
  border-bottom: 1px solid #edf1f7;
  font-size: 12px;
  line-height: 18px;
  color: #1f2937;
  text-align: left;
  white-space: nowrap;
}

.module-table__content th {
  background: #f8fafc;
  font-weight: 700;
  color: #111827;
}

.module-table__content th.is-wide,
.module-table__content td.is-wide {
  min-width: 132px;
}

.module-table__content th.is-rank,
.module-table__content td.is-rank {
  min-width: 48px;
}

.module-table__content th.is-count,
.module-table__content td.is-count {
  min-width: 70px;
}

.module-table__content th.is-name,
.module-table__content td.is-name {
  min-width: 82px;
}

.module-table__content th.is-money,
.module-table__content td.is-money {
  min-width: 98px;
}

.data-module.is-compact .module-table__content th,
.data-module.is-compact .module-table__content td {
  min-width: 74px;
  padding: 6px 7px;
}

.data-module.is-compact .module-table__content th.is-rank,
.data-module.is-compact .module-table__content td.is-rank {
  min-width: 42px;
}

.data-module.is-compact .module-table__content th.is-count,
.data-module.is-compact .module-table__content td.is-count {
  min-width: 60px;
}

.data-module.is-compact .module-table__content th.is-name,
.data-module.is-compact .module-table__content td.is-name {
  min-width: 76px;
}

.data-module.is-compact .module-table__content th.is-money,
.data-module.is-compact .module-table__content td.is-money {
  min-width: 86px;
}

.module-table__content th:last-child,
.module-table__content td:last-child {
  border-right: 0;
}

.module-table__content tbody tr:last-child td {
  border-bottom: 0;
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.field-help {
  width: 14px;
  height: 14px;
  padding: 0;
  border: 1px solid #a8b4c5;
  border-radius: 50%;
  background: #fff;
  color: #6b778c;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
  cursor: pointer;
}

.field-help:hover,
.field-help:focus {
  border-color: #409eff;
  color: #409eff;
  outline: none;
}

.module-empty {
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
}

.ops-toolbar ::v-deep .el-input__inner {
  border-radius: 4px;
}

.ops-toolbar ::v-deep .el-range-editor--small.el-input__inner {
  height: 32px;
}

@media (max-width: 1280px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data-module.is-large {
    grid-column: span 2;
  }

  .data-module.is-medium,
  .data-module.is-small {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .ops-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .ops-toolbar__filters {
    justify-content: flex-start;
  }

  .ops-toolbar__site,
  .ops-toolbar__date {
    width: 100%;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .data-module.is-large,
  .data-module.is-medium,
  .data-module.is-small {
    grid-column: span 1;
  }
}
</style>
