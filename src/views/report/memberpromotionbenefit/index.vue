<template>
  <div class="app-container promotion-benefit-page">
    <section class="page-head">
      <div class="head-title-wrap">
        <div class="title-icon">
          <i class="el-icon-s-claim"></i>
        </div>
        <div>
          <h2 class="page-title">会员推广福利明细</h2>
          <p class="page-subtitle">展示推广首充奖励、存款奖励、投注返佣的发放和领取情况。</p>
        </div>
      </div>
    </section>

    <section class="quick-filter-card">
      <div class="quick-row">
        <div class="quick-list">
          <el-button
            v-for="item in quickRanges"
            :key="item.value"
            size="mini"
            :type="activeQuickRange === item.value ? 'primary' : 'default'"
            @click="handleQuickRange(item.value)"
          >
            {{ item.label }}
          </el-button>
        </div>
        <div class="quick-date">
          <span class="quick-label">日期查询：</span>
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            unlink-panels
            class="w-date"
            @change="handleDateRangeChanged"
          />
        </div>
      </div>
    </section>

    <section class="summary-grid" v-loading="loading">
      <article class="summary-card">
        <div class="summary-label">发起邀请会员数</div>
        <div class="summary-value">{{ toNumber(summary.promoterCount).toLocaleString('en-US') }}</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">被邀请会员数</div>
        <div class="summary-value">{{ toNumber(summary.inviteeCount).toLocaleString('en-US') }}</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">推广会员奖励总额</div>
        <div class="summary-value">{{ formatCurrency(summary.promoterRewardTotal) }}</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">被邀请人奖励总额</div>
        <div class="summary-value">{{ formatCurrency(summary.inviteeRewardTotal) }}</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">待领取奖励</div>
        <div class="summary-value">{{ formatCurrency(summary.pendingRewardAmount) }}</div>
      </article>
    </section>

    <section class="filter-card">
      <div class="filter-item">
        <label>日期范围:</label>
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          size="small"
          class="w-date"
          unlink-panels
          @change="handleDateRangeChanged"
        />
      </div>

      <div class="filter-item">
        <label>领取时间:</label>
        <el-date-picker
          v-model="queryParams.receiveDateRange"
          type="datetimerange"
          range-separator="~"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          size="small"
          class="w-date-time"
          unlink-panels
          :default-time="['00:00:00', '23:59:59']"
        />
      </div>

      <div class="filter-item">
        <label>所属站点:</label>
        <el-select v-model="queryParams.siteCode" size="small" class="w-select">
          <el-option
            v-for="site in siteOptions"
            :key="String(site.code)"
            :label="site.label"
            :value="site.code"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>身份:</label>
        <el-select v-model="queryParams.identityType" size="small" clearable class="w-select">
          <el-option label="全部身份" value="" />
          <el-option
            v-for="item in identityTypeOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="String(item.dictValue)"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>类型:</label>
        <el-select v-model="queryParams.bonusType" size="small" clearable class="w-select">
          <el-option label="全部类型" value="" />
          <el-option
            v-for="item in bonusTypeOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="String(item.dictValue)"
          />
        </el-select>
      </div>

      <div class="filter-item">
        <label>状态:</label>
        <el-select v-model="queryParams.status" size="small" clearable class="w-select">
          <el-option label="全部状态" value="" />
          <el-option
            v-for="item in statusOptions"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="String(item.dictValue)"
          />
        </el-select>
      </div>

      <div class="filter-item filter-item--grow">
        <el-input
          v-model.trim="queryParams.keyword"
          size="small"
          clearable
          placeholder="搜索推广会员/被邀请人/会员ID"
          class="w-keyword"
          @keyup.enter.native="handleQuery"
        >
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>

      <div class="filter-actions">
        <el-button type="primary" size="small" @click="handleQuery">查询</el-button>
        <el-button size="small" icon="el-icon-refresh-left" circle @click="resetQuery"></el-button>
      </div>
    </section>

    <section class="table-card">
      <el-table
        v-loading="loading"
        :data="tableRows"
        size="small"
        class="benefit-table"
        show-summary
        :summary-method="getTableSummaries"
      >
        <el-table-column prop="serialNo" label="流水号" min-width="90" align="center" />

        <el-table-column label="日期区间" min-width="165" align="center">
          <template slot-scope>
            <span>{{ currentDateRangeLabel }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="siteName" label="站点" min-width="140">
          <template slot-scope="{ row }">
            <span>{{ row.siteName || row.siteCode || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="agentName" label="上级代理" min-width="120">
          <template slot-scope="{ row }">
            <span>{{ row.agentName || row.agentCode || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="promoterMemberName" label="推广会员" min-width="120">
          <template slot-scope="{ row }">
            <span>{{ row.promoterMemberName || row.promoterMemberId || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="promoterMemberId" label="推广会员ID" min-width="110" />

        <el-table-column prop="inviteeMemberName" label="被邀请人" min-width="120">
          <template slot-scope="{ row }">
            <span>{{ row.inviteeMemberName || row.inviteeMemberId || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="inviteeMemberId" label="被邀请人ID" min-width="110" />

        <el-table-column prop="identityTypeLabel" label="身份" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="String(row.identityType) === '0' ? 'success' : ''">
              {{ row.identityTypeLabel || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="bonusTypeLabel" label="类型" min-width="120" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :class="bonusTypeClass(row.bonusType)">
              {{ row.bonusTypeLabel || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="bonusAmount" label="奖励金额" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span class="amount-text">{{ formatCurrency(row.bonusAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="statusLabel" label="状态" min-width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="statusTagType(row.status)">
              {{ row.statusLabel || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="发放时间" min-width="170" align="center">
          <template slot-scope="{ row }">
            <span>{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="receiveTime" label="领取时间" min-width="170" align="center">
          <template slot-scope="{ row }">
            <span>{{ formatDateTime(row.receiveTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <section class="tip-panel">
      <div class="tip-icon">
        <i class="el-icon-info"></i>
      </div>
      <div class="tip-content">
        <h4>报表统计说明</h4>
        <p>* 本页数据来自会员推广福利记录表，包含首充奖励、存款奖励、投注返佣。</p>
        <p>* 日期区间显示当前查询条件，不是单条记录自身的统计日期。</p>
        <p>* 待领取状态时领取时间为空，领取后显示实际领取时间。</p>
      </div>
    </section>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { listSite } from '@/api/site/site'
import { listMemberPromotionBenefit, getMemberPromotionBenefitSummary } from '@/api/report/memberPromotionBenefit'

const DEFAULT_IDENTITY_OPTIONS = [
  { dictLabel: '邀请人', dictValue: '0' },
  { dictLabel: '被邀请人', dictValue: '1' }
]

const DEFAULT_BONUS_OPTIONS = [
  { dictLabel: '首充奖励', dictValue: '10' },
  { dictLabel: '存款奖励', dictValue: '11' },
  { dictLabel: '投注返佣', dictValue: '12' }
]

const DEFAULT_STATUS_OPTIONS = [
  { dictLabel: '待领取', dictValue: '0' },
  { dictLabel: '已发放', dictValue: '1' },
  { dictLabel: '已过期', dictValue: '2' }
]

function emptySummary() {
  return {
    promoterCount: 0,
    inviteeCount: 0,
    promoterRewardTotal: 0,
    inviteeRewardTotal: 0,
    pendingRewardAmount: 0,
    receivedRewardAmount: 0,
    totalRewardAmount: 0,
    totalRecordCount: 0
  }
}

export default {
  name: 'MemberPromotionBenefitReport',
  data() {
    return {
      loading: false,
      total: 0,
      tableRows: [],
      summary: emptySummary(),
      siteOptions: [{ code: '', label: '全部站点' }],
      identityTypeOptions: DEFAULT_IDENTITY_OPTIONS.slice(),
      bonusTypeOptions: DEFAULT_BONUS_OPTIONS.slice(),
      statusOptions: DEFAULT_STATUS_OPTIONS.slice(),
      activeQuickRange: 'thisMonth',
      quickRanges: [
        { label: '今日', value: 'today' },
        { label: '昨日', value: 'yesterday' },
        { label: '本周', value: 'thisWeek' },
        { label: '上周', value: 'lastWeek' },
        { label: '本月', value: 'thisMonth' },
        { label: '上月', value: 'lastMonth' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        receiveDateRange: [],
        siteCode: '',
        identityType: '',
        bonusType: '',
        status: '',
        keyword: ''
      }
    }
  },
  computed: {
    currentDateRangeLabel() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      if (!startDate || !endDate) {
        return '-'
      }
      return `${startDate} ~ ${endDate}`
    }
  },
  created() {
    this.queryParams.dateRange = this.getQuickRange('thisMonth')
    this.applyRoutePreset()
    this.initPage()
  },
  methods: {
    async initPage() {
      await Promise.all([this.loadSiteOptions(), this.loadDicts()])
      this.getList()
    },
    async loadSiteOptions() {
      try {
        const response = await listSite({ pageNum: 1, pageSize: 1000 })
        const rows = Array.isArray(response.rows) ? response.rows : []
        const siteRows = rows
          .filter((site) => site && site.code)
          .map((site) => ({
            code: site.code,
            label: `${site.nameZn || site.nameEn || site.code || site.id} (${site.code || site.id})`
          }))
        this.siteOptions = [{ code: '', label: '全部站点' }].concat(siteRows)
      } catch (e) {
        this.siteOptions = [{ code: '', label: '全部站点' }]
      }
    },
    async loadDicts() {
      try {
        const [identityRes, bonusRes, statusRes] = await Promise.all([
          this.getDicts('identity_type'),
          this.getDicts('bonus_type'),
          this.getDicts('issuance_status')
        ])
        const identityRows = Array.isArray(identityRes.data) ? identityRes.data : []
        const bonusRows = Array.isArray(bonusRes.data) ? bonusRes.data : []
        const statusRows = Array.isArray(statusRes.data) ? statusRes.data : []
        this.identityTypeOptions = identityRows.length ? identityRows : DEFAULT_IDENTITY_OPTIONS.slice()
        this.bonusTypeOptions = bonusRows.filter((item) => ['10', '11', '12'].includes(String(item.dictValue))).length
          ? bonusRows.filter((item) => ['10', '11', '12'].includes(String(item.dictValue)))
          : DEFAULT_BONUS_OPTIONS.slice()
        this.statusOptions = statusRows.length ? statusRows : DEFAULT_STATUS_OPTIONS.slice()
      } catch (e) {
        this.identityTypeOptions = DEFAULT_IDENTITY_OPTIONS.slice()
        this.bonusTypeOptions = DEFAULT_BONUS_OPTIONS.slice()
        this.statusOptions = DEFAULT_STATUS_OPTIONS.slice()
      }
    },
    applyRoutePreset() {
      const routeQuery = (this.$route && this.$route.query) ? this.$route.query : {}
      const startDate = routeQuery.startDate
      const endDate = routeQuery.endDate
      const keyword = routeQuery.keyword
      if (startDate && endDate) {
        this.queryParams.dateRange = [startDate, endDate]
        this.activeQuickRange = ''
      }
      if (keyword) {
        this.queryParams.keyword = keyword
      }
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    toDateStr(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    getWeekStart(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = day === 0 ? 6 : day - 1
      d.setDate(d.getDate() - diff)
      d.setHours(0, 0, 0, 0)
      return d
    },
    getQuickRange(type) {
      const now = new Date()
      const todayStr = this.toDateStr(now)
      if (type === 'today') {
        return [todayStr, todayStr]
      }
      if (type === 'yesterday') {
        const y = new Date(now)
        y.setDate(now.getDate() - 1)
        const s = this.toDateStr(y)
        return [s, s]
      }
      if (type === 'thisMonth') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        return [this.toDateStr(start), todayStr]
      }
      if (type === 'lastMonth') {
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDayLastMonth = new Date(firstDayThisMonth.getTime() - 24 * 60 * 60 * 1000)
        const firstDayLastMonth = new Date(lastDayLastMonth.getFullYear(), lastDayLastMonth.getMonth(), 1)
        return [this.toDateStr(firstDayLastMonth), this.toDateStr(lastDayLastMonth)]
      }
      const weekStart = this.getWeekStart(now)
      if (type === 'thisWeek') {
        return [this.toDateStr(weekStart), todayStr]
      }
      if (type === 'lastWeek') {
        const prevWeekEnd = new Date(weekStart.getTime() - 24 * 60 * 60 * 1000)
        const prevWeekStart = new Date(prevWeekEnd)
        prevWeekStart.setDate(prevWeekEnd.getDate() - 6)
        return [this.toDateStr(prevWeekStart), this.toDateStr(prevWeekEnd)]
      }
      return [todayStr, todayStr]
    },
    handleQuickRange(type) {
      this.activeQuickRange = type
      this.queryParams.dateRange = this.getQuickRange(type)
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleDateRangeChanged() {
      this.activeQuickRange = ''
    },
    buildQueryParams(includePage = true) {
      const params = {}
      if (includePage) {
        params.pageNum = this.queryParams.pageNum
        params.pageSize = this.queryParams.pageSize
      }
      if (this.queryParams.dateRange && this.queryParams.dateRange.length === 2) {
        params.beginStatDate = this.queryParams.dateRange[0]
        params.endStatDate = this.queryParams.dateRange[1]
      }
      if (this.queryParams.receiveDateRange && this.queryParams.receiveDateRange.length === 2) {
        params.beginReceiveTime = this.queryParams.receiveDateRange[0]
        params.endReceiveTime = this.queryParams.receiveDateRange[1]
      }
      if (this.queryParams.siteCode) {
        params.siteCode = this.queryParams.siteCode
      }
      if (this.queryParams.identityType !== '') {
        params.identityType = this.queryParams.identityType
      }
      if (this.queryParams.bonusType !== '') {
        params.bonusType = this.queryParams.bonusType
      }
      if (this.queryParams.status !== '') {
        params.status = this.queryParams.status
      }
      if (this.queryParams.keyword) {
        params.keyword = this.queryParams.keyword
      }
      return params
    },
    async getList() {
      this.loading = true
      try {
        const [listRes, summaryRes] = await Promise.all([
          listMemberPromotionBenefit(this.buildQueryParams(true)),
          getMemberPromotionBenefitSummary(this.buildQueryParams(false))
        ])
        this.tableRows = Array.isArray(listRes.rows) ? listRes.rows : []
        this.total = Number(listRes.total || 0)
        this.summary = Object.assign(emptySummary(), summaryRes.data || {})
      } catch (e) {
        this.tableRows = []
        this.total = 0
        this.summary = emptySummary()
        this.$message.error('会员推广福利数据加载失败，请检查接口权限或后端服务状态')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.activeQuickRange = 'thisMonth'
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        dateRange: this.getQuickRange('thisMonth'),
        receiveDateRange: [],
        siteCode: '',
        identityType: '',
        bonusType: '',
        status: '',
        keyword: ''
      }
      this.getList()
    },
    formatCurrency(value) {
      return `¥ ${this.toNumber(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    },
    formatDateTime(value) {
      if (!value) return '-'
      if (typeof value === 'string') {
        return value.length > 19 ? value.slice(0, 19) : value
      }
      return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    bonusTypeClass(value) {
      const map = {
        10: 'type-pill--first',
        11: 'type-pill--deposit',
        12: 'type-pill--commission'
      }
      return map[String(value)] || 'type-pill--first'
    },
    statusTagType(value) {
      const map = {
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return map[String(value)] || ''
    },
    getTableSummaries({ columns }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        if (column.property === 'bonusAmount') {
          sums[index] = this.formatCurrency(this.summary.totalRewardAmount)
          return
        }
        sums[index] = ''
      })
      return sums
    }
  }
}
</script>

<style scoped>
.promotion-benefit-page {
  padding-bottom: 10px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.head-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f5ef7, #4aa8ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 12px 24px rgba(15, 94, 247, 0.18);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
}

.quick-filter-card,
.filter-card,
.table-card,
.tip-panel {
  background: #fff;
  border: 1px solid #e8eef7;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
}

.quick-filter-card {
  padding: 14px 18px;
  margin-bottom: 14px;
}

.quick-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.quick-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-label {
  color: #475569;
  font-size: 13px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.summary-card {
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  border: 1px solid #e8eef7;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
}

.summary-label {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-value {
  color: #0f172a;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.filter-card {
  display: flex;
  align-items: center;
  gap: 12px 14px;
  flex-wrap: wrap;
  padding: 16px 18px;
  margin-bottom: 14px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}

.filter-item--grow {
  flex: 0 0 180px;
  min-width: 180px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-card {
  padding: 10px 12px 2px;
}

.benefit-table /deep/ .el-table__header th {
  background: #f8fbff;
  color: #334155;
}

.amount-text {
  color: #0f5ef7;
  font-weight: 600;
}

.type-pill--first {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.25);
  color: #2563eb;
}

.type-pill--deposit {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.28);
  color: #d97706;
}

.type-pill--commission {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.28);
  color: #059669;
}

.tip-panel {
  margin-top: 14px;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%);
}

.tip-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #0f5ef7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-content h4 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 15px;
}

.tip-content p {
  margin: 0 0 6px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.w-date {
  width: 300px;
}

.w-date-time {
  width: 330px;
}

.w-select {
  width: 120px;
}

.w-keyword {
  width: 260px;
}

@media (max-width: 1400px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-row,
  .filter-card {
    align-items: stretch;
  }

  .quick-date,
  .filter-item,
  .filter-actions {
    width: 100%;
  }

  .w-date,
  .w-date-time,
  .w-select {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
