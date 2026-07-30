<template>
  <div class="app-container bonus-management-page">
    <el-tabs v-model="activeTab" class="bonus-management-tabs">
      <el-tab-pane label="发放红利" name="grant">
        <div class="grant-panel">
          <div class="section-title">发放红利</div>

          <el-form ref="bonusForm" :model="form" label-width="124px" class="bonus-form">
            <el-form-item label="站点" required>
              <el-select
                v-model="form.siteCode"
                placeholder="请选择站点"
                class="control-md"
                @change="handleSiteChange"
              >
                <el-option
                  v-for="site in siteOptions"
                  :key="site.code"
                  :label="site.name"
                  :value="site.code"
                />
              </el-select>
            </el-form-item>

            <div v-if="currentSite" class="site-summary">
              <div class="summary-item">
                <span>站点资金池</span>
                <strong>¥{{ formatAmount(currentSite.fundPool) }}</strong>
              </div>
              <div class="summary-item">
                <span>今日发放金额</span>
                <strong class="summary-issued">¥{{ formatAmount(currentSite.todayIssued) }}</strong>
              </div>
              <div class="summary-item">
                <span>剩余可发放金额</span>
                <strong class="summary-balance">¥{{ formatAmount(currentSite.remaining) }}</strong>
              </div>
            </div>

            <el-form-item label="钱包类型" required>
              <el-radio-group v-model="form.walletType" @change="handleWalletTypeChange">
                <el-radio label="center">中心钱包</el-radio>
                <el-radio label="venue">场馆钱包</el-radio>
                <el-radio label="commission">佣金钱包</el-radio>
              </el-radio-group>
            </el-form-item>

            <template v-if="form.walletType === 'center' || form.walletType === 'venue'">
              <el-form-item v-if="form.walletType === 'venue'" label="选择场馆" required>
                <el-select
                  v-model="form.venueCodes"
                  :disabled="!form.siteCode"
                  :placeholder="form.siteCode ? '请选择场馆' : '请先选择站点'"
                  class="control-md"
                  multiple
                  collapse-tags
                  filterable
                  clearable
                >
                  <el-option
                    v-for="venue in currentVenueOptions"
                    :key="venue.value"
                    :label="venue.label"
                    :value="venue.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="操作类型" required>
                <el-radio-group v-model="form.operationType" class="operation-switch">
                  <el-radio-button label="single">单会员发放</el-radio-button>
                  <el-radio-button label="batch">批量发放</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="红利类型" required>
                <el-select v-model="form.bonusType" placeholder="请选择红利类型" class="control-md">
                  <el-option label="推广彩金" value="promotion" />
                  <el-option label="活动彩金" value="activity" />
                  <el-option label="平台彩金" value="platform" />
                  <el-option label="代理线下首存" value="agentFirstDeposit" />
                </el-select>
              </el-form-item>

              <el-form-item label="领取方式" required>
                <el-radio-group v-model="form.receiveMode">
                  <el-radio label="manual">手动领取</el-radio>
                  <el-radio label="automatic">自动派发</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="红利有效期" required>
                <div class="inline-field">
                  <el-radio-group v-model="form.validityType">
                    <el-radio label="day">按天计算</el-radio>
                    <el-radio label="hour">按小时计算</el-radio>
                  </el-radio-group>
                  <el-input-number
                    v-model="form.validityValue"
                    :min="1"
                    :max="1000"
                    :controls="false"
                    class="validity-input"
                  />
                  <span class="unit-text">
                    {{ form.validityType === 'day' ? '天' : '小时' }}
                  </span>
                </div>
              </el-form-item>

              <template v-if="form.operationType === 'single'">
                <el-form-item label="会员账号" required>
                  <el-input
                    v-model="form.memberAccount"
                    placeholder="请输入会员账号"
                    class="control-md"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="金额" required>
                  <el-input v-model="form.amount" placeholder="请输入0.01-99999999" class="control-md">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </template>

              <el-form-item v-else label="导入文件" required>
                <div class="batch-file-actions">
                  <el-button icon="el-icon-download" @click="handleDownloadTemplate">下载模板</el-button>
                  <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls">
                    <el-button icon="el-icon-upload2">上传文件</el-button>
                  </el-upload>
                </div>
              </el-form-item>

              <el-form-item label="流水限制" required>
                <el-radio-group v-model="form.turnoverRequired">
                  <el-radio :label="false">无需流水限制</el-radio>
                  <el-radio :label="true">需要流水限制</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="form.turnoverRequired" label="流水倍数" required>
                <el-input-number
                  v-model="form.turnoverMultiple"
                  :min="0"
                  :max="999"
                  :precision="0"
                  :controls="false"
                  class="control-md"
                  placeholder="请输入流水倍数，正整数"
                />
                <span class="unit-text">倍</span>
              </el-form-item>

              <el-form-item label="站内信通知" required>
                <el-radio-group v-model="form.notice">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="申请备注" required>
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入申请备注"
                  class="textarea-md"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
              </el-form-item>
            </template>

            <template v-else-if="form.walletType === 'commission'">
              <el-form-item label="操作类型" required>
                <el-radio-group v-model="form.operationType" class="operation-switch">
                  <el-radio-button label="single">单会员发放</el-radio-button>
                  <el-radio-button label="batch">批量发放</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="红利类型" required>
                <el-select v-model="form.bonusType" class="control-md" disabled>
                  <el-option label="代理红利" value="agentBonus" />
                </el-select>
              </el-form-item>

              <template v-if="form.operationType === 'single'">
                <el-form-item label="代理账号" required>
                  <el-input
                    v-model="form.agentAccount"
                    placeholder="请输入代理账号"
                    class="control-md"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="金额" required>
                  <el-input v-model="form.amount" placeholder="请输入0.01-99999999" class="control-md">
                    <template slot="append">元</template>
                  </el-input>
                </el-form-item>
              </template>

              <el-form-item v-else-if="form.operationType === 'batch'" label="导入文件" required>
                <div class="batch-file-actions">
                  <el-button icon="el-icon-download" @click="handleDownloadTemplate">下载模板</el-button>
                  <el-upload action="#" :auto-upload="false" :show-file-list="false" accept=".xlsx,.xls">
                    <el-button icon="el-icon-upload2">上传文件</el-button>
                  </el-upload>
                </div>
              </el-form-item>

              <el-form-item label="流水限制" required>
                <el-radio-group v-model="form.turnoverRequired">
                  <el-radio :label="false">无需流水限制</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="申请备注" required>
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入申请备注"
                  class="textarea-md"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="历史记录" name="history">
        <div class="history-panel bonus-management-tab-content">
          <div class="section-title">红利发放历史记录</div>

          <div class="history-filter-card">
            <div class="history-filter-grid">
              <div class="history-filter-item">
                <label>订单号</label>
                <el-input
                  v-model="historyFilters.orderNo"
                  placeholder="请输入订单号"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>站点</label>
                <el-select v-model="historyFilters.siteCode" placeholder="全部站点" clearable>
                  <el-option
                    v-for="site in siteOptions"
                    :key="site.code"
                    :label="site.name"
                    :value="site.code"
                  />
                </el-select>
              </div>
              <div class="history-filter-item">
                <label>会员账号</label>
                <el-input
                  v-model="historyFilters.memberAccount"
                  placeholder="请输入会员账号"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>代理账号</label>
                <el-input
                  v-model="historyFilters.agentAccount"
                  placeholder="请输入代理账号"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>钱包类型</label>
                <el-select v-model="historyFilters.walletType" placeholder="全部类型" clearable>
                  <el-option label="中心钱包" value="center" />
                  <el-option label="场馆钱包" value="venue" />
                  <el-option label="佣金钱包" value="commission" />
                </el-select>
              </div>
              <div class="history-filter-item">
                <label>钱包名称</label>
                <el-input
                  v-model="historyFilters.walletName"
                  placeholder="请输入钱包名称"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>红利类型</label>
                <el-select v-model="historyFilters.bonusType" placeholder="全部类型" clearable>
                  <el-option label="推广彩金" value="promotion" />
                  <el-option label="活动彩金" value="activity" />
                  <el-option label="平台彩金" value="platform" />
                  <el-option label="代理线下首存" value="agentFirstDeposit" />
                  <el-option label="代理红利" value="agentBonus" />
                </el-select>
              </div>
              <div class="history-filter-item">
                <label>红利标题</label>
                <el-input
                  v-model="historyFilters.bonusTitle"
                  placeholder="请输入红利标题"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>会员标签</label>
                <el-select v-model="historyFilters.memberTag" placeholder="全部标签" clearable>
                  <el-option label="新会员" value="新会员" />
                  <el-option label="活跃会员" value="活跃会员" />
                  <el-option label="VIP会员" value="VIP会员" />
                  <el-option label="重点会员" value="重点会员" />
                </el-select>
              </div>
              <div class="history-filter-item history-filter-time">
                <label>派发时间</label>
                <el-date-picker
                  v-model="historyFilters.dispatchTime"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>申请备注</label>
                <el-input
                  v-model="historyFilters.remark"
                  placeholder="请输入申请备注"
                  clearable
                />
              </div>
              <div class="history-filter-item">
                <label>状态</label>
                <el-select v-model="historyFilters.status" placeholder="全部状态" clearable>
                  <el-option label="已派发" value="issued" />
                  <el-option label="已领取" value="claimed" />
                  <el-option label="已过期" value="expired" />
                </el-select>
              </div>
            </div>

            <div class="history-filter-actions">
              <el-button @click="handleHistoryReset">重置</el-button>
              <el-button type="primary" @click="handleHistoryQuery">查询</el-button>
              <el-button type="success" @click="handleHistoryExport">导出</el-button>
            </div>
          </div>

          <div class="history-table-card">
            <div class="history-table-title">
              <span>历史记录列表</span>
              <span>共 {{ filteredHistoryRows.length }} 条</span>
            </div>
            <el-table
              :data="pagedHistoryRows"
              border
              stripe
              class="history-table"
              empty-text="暂无数据"
            >
              <el-table-column prop="siteName" label="站点" width="110" fixed="left" />
              <el-table-column prop="orderNo" label="订单号" width="210" fixed="left" />
              <el-table-column prop="memberAccount" label="会员账号" width="130" />
              <el-table-column prop="agentAccount" label="代理账号" width="130" />
              <el-table-column prop="memberTag" label="会员标签" width="105" />
              <el-table-column prop="walletTypeName" label="钱包类型" width="105" />
              <el-table-column prop="walletName" label="钱包名称" width="135" />
              <el-table-column prop="bonusTypeName" label="红利类型" width="125" />
              <el-table-column prop="bonusTitle" label="红利标题" min-width="180" show-overflow-tooltip />
              <el-table-column prop="bonusInfo" label="红利信息" min-width="220" show-overflow-tooltip />
              <el-table-column label="流水要求" width="95" align="center">
                <template slot-scope="{ row }">
                  <el-tag :type="row.turnoverRequired ? 'warning' : 'info'" size="mini">
                    {{ row.turnoverRequired ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="turnoverMultiple" label="流水倍数" width="95" align="center">
                <template slot-scope="{ row }">
                  {{ row.turnoverRequired ? `${row.turnoverMultiple}倍` : '--' }}
                </template>
              </el-table-column>
              <el-table-column label="红利金额" width="120" align="right">
                <template slot-scope="{ row }">¥{{ formatAmount(row.amount) }}</template>
              </el-table-column>
              <el-table-column prop="remark" label="申请备注" min-width="180" show-overflow-tooltip />
              <el-table-column prop="dispatchTime" label="派发时间" width="165" />
              <el-table-column prop="expireTime" label="过期时间" width="165" />
              <el-table-column label="状态" width="100" fixed="right" align="center">
                <template slot-scope="{ row }">
                  <el-tag :type="historyStatusMeta[row.status].type" size="mini">
                    {{ historyStatusMeta[row.status].label }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="history-pagination">
              <el-pagination
                :current-page.sync="historyPage"
                :page-size.sync="historyPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredHistoryRows.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="historyPage = 1"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
const SITE_VENUES = {
  wc: [
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
  ],
  dw: [
    { value: 'dwSports', label: 'DW体育' },
    { value: 'dwLive', label: 'DW真人' },
    { value: 'wmLive', label: 'WM真人' },
    { value: 'dwLottery', label: 'DW彩票' },
    { value: 'tcLottery', label: 'TC彩票' },
    { value: 'dbElectronic', label: 'DB电子' },
    { value: 'pgElectronic', label: 'PG电子' }
  ],
  cs: [
    { value: 'csSports', label: '财神体育' },
    { value: 'pandaSports', label: '熊猫体育' },
    { value: 'imSports', label: 'IM体育' },
    { value: 'csLive', label: '财神真人' },
    { value: 'wmLive', label: 'WM真人' },
    { value: 'dbElectronic', label: 'DB电子' },
    { value: 'pgElectronic', label: 'PG电子' }
  ],
  xh: [
    { value: 'xhSports', label: '星河体育' },
    { value: 'pandaSports', label: '熊猫体育' },
    { value: 'imSports', label: 'IM体育' },
    { value: 'xhLive', label: '星河真人' },
    { value: 'wmLive', label: 'WM真人' },
    { value: 'dbElectronic', label: 'DB电子' },
    { value: 'pgElectronic', label: 'PG电子' }
  ]
}

const SITE_OPTIONS = [
  { code: 'wc', name: '旺财体育', fundPool: 1285600, todayIssued: 18620, remaining: 1266980 },
  { code: 'dw', name: 'DW体育', fundPool: 986500, todayIssued: 12380, remaining: 974120 },
  { code: 'cs', name: '财神体育', fundPool: 768800, todayIssued: 9680, remaining: 759120 },
  { code: 'xh', name: '星河体育', fundPool: 625000, todayIssued: 7350, remaining: 617650 }
]

const HISTORY_STATUS_META = {
  issued: { label: '已派发', type: 'warning' },
  claimed: { label: '已领取', type: 'success' },
  expired: { label: '已过期', type: 'info' }
}

const HISTORY_BONUS_TYPES = [
  { value: 'promotion', label: '推广彩金', title: '会员推广奖励' },
  { value: 'activity', label: '活动彩金', title: '限时活动红利' },
  { value: 'platform', label: '平台彩金', title: '平台关怀彩金' },
  { value: 'agentFirstDeposit', label: '代理线下首存', title: '代理线下首存红利' },
  { value: 'agentBonus', label: '代理红利', title: '代理业绩红利' }
]

function padNumber(value) {
  return String(value).padStart(2, '0')
}

function createHistoryRows() {
  const memberTags = ['新会员', '活跃会员', 'VIP会员', '重点会员']
  const venues = ['旺财体育', '熊猫体育', 'IM体育', '旺财真人', 'PG电子']
  const remarks = ['运营活动发放', '会员关怀补发', '代理业绩奖励', '线下活动审核通过', '批量红利导入']

  return Array.from({ length: 60 }, (_, index) => {
    const serial = index + 1
    const site = SITE_OPTIONS[index % SITE_OPTIONS.length]
    const bonus = HISTORY_BONUS_TYPES[index % HISTORY_BONUS_TYPES.length]
    const walletType = bonus.value === 'agentBonus'
      ? 'commission'
      : (index % 3 === 1 ? 'venue' : 'center')
    const day = (index % 28) + 1
    const hour = 8 + (index % 12)
    const dispatchTime = `2026-07-${padNumber(day)} ${padNumber(hour)}:${padNumber((index * 7) % 60)}:00`
    const expireDay = Math.min(day + 3, 31)
    const turnoverRequired = walletType !== 'commission' && index % 3 !== 0

    return {
      siteCode: site.code,
      siteName: site.name,
      orderNo: `BN202607${padNumber(day)}${String(100000 + serial)}`,
      memberAccount: walletType === 'commission' ? '--' : `member${String(serial).padStart(4, '0')}`,
      agentAccount: `agent${String((index % 18) + 1).padStart(3, '0')}`,
      memberTag: memberTags[index % memberTags.length],
      walletType,
      walletTypeName: walletType === 'center' ? '中心钱包' : (walletType === 'venue' ? '场馆钱包' : '佣金钱包'),
      walletName: walletType === 'center' ? '中心钱包' : (walletType === 'venue' ? venues[index % venues.length] : '代理佣金钱包'),
      bonusType: bonus.value,
      bonusTypeName: bonus.label,
      bonusTitle: bonus.title,
      bonusInfo: `${bonus.label} / ${index % 2 === 0 ? '单笔发放' : '批量发放'}`,
      turnoverRequired,
      turnoverMultiple: turnoverRequired ? [3, 5, 8, 10][index % 4] : 0,
      amount: 50 + (index % 12) * 25.5,
      remark: remarks[index % remarks.length],
      dispatchTime,
      expireTime: `2026-07-${padNumber(expireDay)} ${padNumber(hour)}:${padNumber((index * 7) % 60)}:00`,
      status: ['issued', 'claimed', 'expired'][index % 3]
    }
  })
}

function createEmptyHistoryFilters() {
  return {
    orderNo: '',
    siteCode: '',
    memberAccount: '',
    agentAccount: '',
    walletType: '',
    walletName: '',
    bonusType: '',
    bonusTitle: '',
    memberTag: '',
    dispatchTime: [],
    remark: '',
    status: ''
  }
}

export default {
  name: 'BonusManagement',
  data() {
    return {
      activeTab: 'grant',
      siteOptions: SITE_OPTIONS,
      historyStatusMeta: HISTORY_STATUS_META,
      historyRows: createHistoryRows(),
      historyFilters: createEmptyHistoryFilters(),
      appliedHistoryFilters: createEmptyHistoryFilters(),
      historyPage: 1,
      historyPageSize: 10,
      form: {
        siteCode: '',
        walletType: 'center',
        venueCodes: [],
        operationType: 'single',
        bonusType: '',
        agentAccount: '',
        receiveMode: 'manual',
        validityType: 'day',
        validityValue: 1,
        memberAccount: '',
        amount: '',
        turnoverRequired: true,
        turnoverMultiple: 1,
        notice: false,
        remark: ''
      }
    }
  },
  computed: {
    currentSite() {
      return this.siteOptions.find(site => site.code === this.form.siteCode) || null
    },
    currentVenueOptions() {
      return SITE_VENUES[this.form.siteCode] || []
    },
    filteredHistoryRows() {
      const filters = this.appliedHistoryFilters
      return this.historyRows.filter(row => {
        const matchesText = (value, keyword) => !keyword || String(value).toLowerCase().includes(String(keyword).trim().toLowerCase())
        const matchesDispatchTime = !filters.dispatchTime || filters.dispatchTime.length !== 2 ||
          (row.dispatchTime >= filters.dispatchTime[0] && row.dispatchTime <= filters.dispatchTime[1])

        return matchesText(row.orderNo, filters.orderNo) &&
          (!filters.siteCode || row.siteCode === filters.siteCode) &&
          matchesText(row.memberAccount, filters.memberAccount) &&
          matchesText(row.agentAccount, filters.agentAccount) &&
          (!filters.walletType || row.walletType === filters.walletType) &&
          matchesText(row.walletName, filters.walletName) &&
          (!filters.bonusType || row.bonusType === filters.bonusType) &&
          matchesText(row.bonusTitle, filters.bonusTitle) &&
          (!filters.memberTag || row.memberTag === filters.memberTag) &&
          matchesText(row.remark, filters.remark) &&
          (!filters.status || row.status === filters.status) &&
          matchesDispatchTime
      })
    },
    pagedHistoryRows() {
      const start = (this.historyPage - 1) * this.historyPageSize
      return this.filteredHistoryRows.slice(start, start + this.historyPageSize)
    }
  },
  methods: {
    handleSiteChange() {
      this.form.venueCodes = []
      this.$message.success(`已加载${this.currentSite.name}资金信息`)
    },
    handleWalletTypeChange(walletType) {
      if (walletType !== 'venue') {
        this.form.venueCodes = []
      }
      if (walletType === 'commission') {
        this.form.bonusType = 'agentBonus'
        this.form.turnoverRequired = false
      } else if (this.form.bonusType === 'agentBonus') {
        this.form.bonusType = ''
      }
    },
    formatAmount(value) {
      return Number(value || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    handleDownloadTemplate() {
      this.$message.success('红利批量发放模板下载成功')
    },
    handleHistoryQuery() {
      this.appliedHistoryFilters = {
        ...this.historyFilters,
        dispatchTime: this.historyFilters.dispatchTime ? [...this.historyFilters.dispatchTime] : []
      }
      this.historyPage = 1
      this.$message.success(`查询完成，共 ${this.filteredHistoryRows.length} 条记录`)
    },
    handleHistoryReset() {
      this.historyFilters = createEmptyHistoryFilters()
      this.appliedHistoryFilters = createEmptyHistoryFilters()
      this.historyPage = 1
      this.$message.success('筛选条件已重置')
    },
    handleHistoryExport() {
      this.$message.success(`已导出 ${this.filteredHistoryRows.length} 条红利历史记录`)
    },
    handleSubmit() {
      if (!this.form.siteCode) {
        this.$message.warning('请选择站点')
        return
      }
      if (this.form.walletType === 'venue' && !this.form.venueCodes.length) {
        this.$message.warning('请选择场馆')
        return
      }
      if (!this.form.bonusType) {
        this.$message.warning('请选择红利类型')
        return
      }
      if (this.form.operationType === 'single') {
        const account = this.form.walletType === 'commission'
          ? this.form.agentAccount
          : this.form.memberAccount
        if (!account.trim()) {
          this.$message.warning(this.form.walletType === 'commission' ? '请输入代理账号' : '请输入会员账号')
          return
        }
      }
      this.$message.success(this.form.operationType === 'single' ? '红利发放申请已提交' : '批量红利文件已提交')
    }
  }
}
</script>

<style scoped>
.bonus-management-page {
  min-height: calc(100vh - 84px);
  background: #fff;
}

.bonus-management-tabs {
  min-height: 640px;
}

.bonus-management-tab-content {
  min-height: 560px;
}

.grant-panel {
  padding: 8px 24px 32px;
}

.section-title {
  margin-bottom: 24px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.bonus-form {
  max-width: 1180px;
}

.control-md {
  width: 300px;
}

.textarea-md {
  width: 500px;
}

.site-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 16px;
  margin: 0 0 24px 124px;
  max-width: 900px;
}

.summary-item {
  padding: 16px 18px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f8fafc;
}

.summary-item span {
  display: block;
  margin-bottom: 10px;
  color: #909399;
  font-size: 13px;
}

.summary-item strong {
  color: #303133;
  font-size: 22px;
}

.summary-item .summary-issued {
  color: #e6a23c;
}

.summary-item .summary-balance {
  color: #67c23a;
}

.operation-switch ::v-deep .el-radio-button__inner {
  min-width: 100px;
}

.inline-field {
  display: flex;
  align-items: center;
}

.validity-input {
  width: 160px;
  margin-left: 24px;
}

.unit-text {
  margin-left: 10px;
  color: #606266;
}

.batch-file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-file-actions .el-upload {
  display: block;
}

.history-panel {
  padding: 8px 20px 28px;
}

.history-filter-card,
.history-table-card {
  border: 1px solid #e4e7ed;
  background: #fff;
}

.history-filter-card {
  padding: 18px 18px 16px;
}

.history-filter-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(180px, 1fr));
  gap: 16px 14px;
}

.history-filter-item label {
  display: block;
  margin-bottom: 7px;
  color: #606266;
  font-size: 13px;
  font-weight: 500;
}

.history-filter-item ::v-deep .el-input,
.history-filter-item ::v-deep .el-select,
.history-filter-item ::v-deep .el-date-editor {
  width: 100%;
}

.history-filter-time {
  grid-column: span 2;
}

.history-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.history-filter-actions .el-button {
  min-width: 82px;
}

.history-table-card {
  margin-top: 16px;
}

.history-table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  font-weight: 600;
}

.history-table-title span:last-child {
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.history-table {
  width: 100%;
}

.history-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

@media (max-width: 1500px) {
  .history-filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .site-summary {
    grid-template-columns: 1fr;
  }

  .history-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .history-filter-grid {
    grid-template-columns: 1fr;
  }

  .history-filter-time {
    grid-column: auto;
  }
}
</style>
