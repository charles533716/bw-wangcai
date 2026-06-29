<template>
    <div class="app-container promotion-stats-page">
      <div class="header-row">
      <div class="page-title">会员推广统计报表</div>
      <el-button type="primary" plain icon="el-icon-download" @click="handleExport">导出统计数据</el-button>
    </div>

    <div class="cards-grid">
      <div class="metric-card">
        <div class="metric-title">总推广人数</div>
        <div class="metric-value">{{ toNumber(summary.totalPromotionCount).toLocaleString('en-US') }}</div>
        <div class="metric-extra" :class="hasStatsData ? growthClass(summary.promotionGrowthRate) : 'growth-neutral'">
          {{ hasStatsData ? formatGrowth(summary.promotionGrowthRate) : '暂无数据' }}
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-title">总充值会员数</div>
        <div class="metric-value">{{ toNumber(summary.totalRechargeMemberCount).toLocaleString('en-US') }}</div>
        <div class="metric-extra conversion-text">{{ hasStatsData ? formatConversion(summary.rechargeConversionRate) : '暂无数据' }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">总发放奖励额</div>
        <div class="metric-value">{{ formatCurrency(summary.totalRewardGrantAmount) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">总返佣金额</div>
        <div class="metric-value">{{ formatCurrency(summary.totalRebateAmount) }}</div>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="queryParams" :inline="true" label-width="74px">
        <el-form-item label="统计周期">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            class="w-date"
          />
        </el-form-item>
        <el-form-item label="所属站点">
          <el-select v-model="queryParams.siteCode" clearable placeholder="全部站点" class="w-site">
            <el-option label="全部站点" value="" />
            <el-option
              v-for="item in siteOptions"
              :key="item.code"
              :label="item.nameZn || item.code"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上级代理">
          <el-input
            v-model.trim="queryParams.parentAgentName"
            placeholder="输入代理账号..."
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="会员">
          <el-input
            v-model.trim="queryParams.memberKeyword"
            placeholder="搜索会员账号/ID..."
            clearable
            class="w-input"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" circle @click="resetQuery" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        border
        stripe
        show-summary
        empty-text="暂无数据"
        :summary-method="getSummaries"
      >
        <el-table-column label="日期区间" prop="periodRange" min-width="170" align="center" />
        <el-table-column label="站点" prop="siteName" min-width="100" align="center" />
        <el-table-column label="上级代理" prop="parentAgentName" min-width="100" align="center" />
        <el-table-column label="会员名称" prop="memberName" min-width="120">
          <template slot-scope="{ row }">
            <div class="member-cell">
              <div class="avatar">{{ initials(row.memberName) }}</div>
              <span>{{ row.memberName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="ID" prop="memberId" min-width="88" align="center" />
        <el-table-column label="推广人数" prop="promotionCount" min-width="88" align="right" />
        <el-table-column label="充值会员数" prop="rechargeMemberCount" min-width="98" align="center">
          <template slot-scope="{ row }">
            <el-link
              v-if="toNumber(row.rechargeMemberCount) > 0"
              type="primary"
              :underline="false"
              @click="goPromotionBenefit(row)"
            >
              {{ row.rechargeMemberCount }}
            </el-link>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="邀请收益(CNY)" prop="invitationIncome" min-width="120" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.invitationIncome) }}</template>
        </el-table-column>
        <el-table-column label="被推广会员存款收益(CNY)" prop="depositIncome" min-width="190" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.depositIncome) }}</template>
        </el-table-column>
        <el-table-column label="会员返佣收益(CNY)" prop="rebateIncome" min-width="170" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.rebateIncome) }}</template>
        </el-table-column>
        <el-table-column label="被推广会员福利收益(CNY)" prop="inviteeWelfareIncome" min-width="190" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.inviteeWelfareIncome) }}</template>
        </el-table-column>
        <el-table-column label="总发放福利(CNY)" prop="totalBenefit" min-width="122" align="right">
          <template slot-scope="{ row }">{{ formatCurrency(row.totalBenefit) }}</template>
        </el-table-column>
        <el-table-column label="推广总收益(CNY)" prop="promotionTotalIncome" min-width="122" align="right">
          <template slot-scope="{ row }">
            <span class="text-blue">{{ formatCurrency(row.promotionTotalIncome) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已获得收益(CNY)" prop="obtainedIncome" min-width="170" align="right">
          <template slot-scope="{ row }">
            <span class="text-green">{{ formatCurrency(row.obtainedIncome) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="fetchData"
    />

    <div class="tips-box">
      <div class="tips-title">统计口径说明</div>
      <div class="tips-line">推广人数：通过会员专属邀请链接/二维码成功注册的会员总数。</div>
      <div class="tips-line">充值会员数：被邀请人中，完成首充且金额达到有效充值门槛的人数。</div>
      <div class="tips-line">收益统计：包含邀请阶梯礼金、被推广会员存款奖励以及基于被推广会员流水的返佣收益。</div>
      <div class="tips-line">总发放福利：统计推广总收益与被推广会员福利收益的总和。</div>
      <div class="tips-line">数据更新：统计数据每小时更新一次，点击查询可手动刷新。</div>
    </div>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import { listMemberPromotionStats, getMemberPromotionStatsSummary } from '@/api/report/memberPromotionStats'

function emptySummary() {
  return {
    totalPromotionCount: 0,
    promotionGrowthRate: 0,
    totalRechargeMemberCount: 0,
    rechargeConversionRate: 0,
    totalRewardGrantAmount: 0,
    totalRebateAmount: 0,
    sumPromotionCount: 0,
    sumRechargeMemberCount: 0,
    sumInvitationIncome: 0,
    sumDepositIncome: 0,
    sumRebateIncome: 0,
    sumInviteeWelfareIncome: 0,
    sumTotalBenefit: 0,
    sumPromotionTotalIncome: 0,
    sumObtainedIncome: 0,
    totalRowCount: 0
  }
}

export default {
  name: 'MemberPromotionStatsReport',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      siteOptions: [{ code: '', nameZn: '全部站点' }],
      summary: emptySummary(),
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        dateRange: this.defaultMonthRange(),
        siteCode: '',
        parentAgentName: '',
        memberKeyword: ''
      }
    }
  },
  computed: {
    hasStatsData() {
      return this.toNumber(this.summary.totalPromotionCount) > 0 ||
        this.toNumber(this.summary.totalRechargeMemberCount) > 0 ||
        this.toNumber(this.summary.totalRewardGrantAmount) > 0 ||
        this.toNumber(this.summary.totalRebateAmount) > 0 ||
        this.toNumber(this.summary.totalRowCount) > 0
    }
  },
  created() {
    this.initPage()
  },
  methods: {
    async initPage() {
      await this.loadSiteOptions()
      this.fetchData()
    },
    defaultMonthRange() {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [this.toDateStr(start), this.toDateStr(now)]
    },
    toDateStr(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    initials(name) {
      const text = (name || '').trim()
      if (!text) return '-'
      return text.substring(0, 1).toUpperCase()
    },
    formatCurrency(value) {
      return `¥ ${this.toNumber(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    formatGrowth(value) {
      const n = this.toNumber(value)
      if (n > 0) return `+${n.toFixed(2)}%`
      return `${n.toFixed(2)}%`
    },
    growthClass(value) {
      const n = this.toNumber(value)
      if (n > 0) return 'growth-positive'
      if (n < 0) return 'growth-negative'
      return 'growth-neutral'
    },
    formatConversion(value) {
      return `${this.toNumber(value).toFixed(1)}%转化率`
    },
    validateDateRange() {
      const [startDate, endDate] = this.queryParams.dateRange || []
      if (!startDate || !endDate) {
        this.$message.warning('请选择统计周期')
        return false
      }
      if (endDate < startDate) {
        this.$message.warning('结束日期不能早于开始日期')
        return false
      }
      const start = new Date(`${startDate} 00:00:00`).getTime()
      const end = new Date(`${endDate} 00:00:00`).getTime()
      const diffDays = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1
      if (diffDays > 90) {
        this.$message.warning('统计周期跨度不能超过90天')
        return false
      }
      return true
    },
    async loadSiteOptions() {
      try {
        const response = await listSite({ pageNum: 1, pageSize: 1000 })
        const rows = Array.isArray(response.rows) ? response.rows : []
        this.siteOptions = [{ code: '', nameZn: '全部站点' }].concat(
          rows
            .filter((item) => item && item.code)
            .map((item) => ({
              code: item.code,
              nameZn: item.nameZn || item.nameEn || item.code
            }))
        )
      } catch (e) {
        this.siteOptions = [{ code: '', nameZn: '全部站点' }]
      }
    },
    buildQueryParams(includePage = true) {
      const params = {}
      if (includePage) {
        params.pageNum = this.queryParams.pageNum
        params.pageSize = this.queryParams.pageSize
      }
      if (this.queryParams.dateRange && this.queryParams.dateRange.length === 2) {
        params.startDate = this.queryParams.dateRange[0]
        params.endDate = this.queryParams.dateRange[1]
      }
      if (this.queryParams.siteCode) {
        params.siteCode = this.queryParams.siteCode
      }
      if (this.queryParams.parentAgentName) {
        params.parentAgentName = this.queryParams.parentAgentName
      }
      if (this.queryParams.memberKeyword) {
        params.memberKeyword = this.queryParams.memberKeyword
      }
      return params
    },
    async fetchData() {
      if (!this.validateDateRange()) return
      this.loading = true
      try {
        const [listRes, summaryRes] = await Promise.all([
          listMemberPromotionStats(this.buildQueryParams(true)),
          getMemberPromotionStatsSummary(this.buildQueryParams(false))
        ])
        this.list = Array.isArray(listRes.rows) ? listRes.rows : []
        this.total = this.toNumber(listRes.total)
        this.summary = Object.assign(emptySummary(), summaryRes.data || {})
      } catch (e) {
        this.list = []
        this.total = 0
        this.summary = emptySummary()
        this.$message.error('会员推广统计数据加载失败，请检查接口权限或后端服务状态')
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 20,
        dateRange: this.defaultMonthRange(),
        siteCode: '',
        parentAgentName: '',
        memberKeyword: ''
      }
      this.fetchData()
    },
    handleExport() {
      if (!this.validateDateRange()) return
      const params = this.buildQueryParams(false)
      this.$confirm('是否导出当前筛选条件下的一览数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.download(
          '/report/memberpromotionstats/export',
          params,
          `member_promotion_stats_${new Date().getTime()}.xlsx`
        )
      }).catch(() => {})
    },
    goPromotionBenefit(row) {
      const [startDate, endDate] = this.queryParams.dateRange || []
      const keyword = row && row.memberUserId ? String(row.memberUserId) : (row.memberName || '')
      this.$router.push({
        path: '/report/memberpromotionbenefit',
        query: {
          startDate,
          endDate,
          keyword
        }
      })
    },
    getSummaries({ columns }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计'
          return
        }
        switch (column.property) {
          case 'promotionCount':
            sums[index] = this.toNumber(this.summary.sumPromotionCount)
            break
          case 'rechargeMemberCount':
            sums[index] = this.toNumber(this.summary.sumRechargeMemberCount)
            break
          case 'invitationIncome':
            sums[index] = this.formatCurrency(this.summary.sumInvitationIncome)
            break
          case 'depositIncome':
            sums[index] = this.formatCurrency(this.summary.sumDepositIncome)
            break
          case 'rebateIncome':
            sums[index] = this.formatCurrency(this.summary.sumRebateIncome)
            break
          case 'inviteeWelfareIncome':
            sums[index] = this.formatCurrency(this.summary.sumInviteeWelfareIncome)
            break
          case 'totalBenefit':
            sums[index] = this.formatCurrency(this.summary.sumTotalBenefit)
            break
          case 'promotionTotalIncome':
            sums[index] = this.formatCurrency(this.summary.sumPromotionTotalIncome)
            break
          case 'obtainedIncome':
            sums[index] = this.formatCurrency(this.summary.sumObtainedIncome)
            break
          default:
            sums[index] = ''
            break
        }
      })
      return sums
    }
  }
}
</script>

<style scoped>
.promotion-stats-page {
  padding-bottom: 10px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.metric-card {
  background: #fff;
  border: 1px solid #e5eaf3;
  border-radius: 10px;
  padding: 14px;
}

.metric-title {
  color: #667085;
  font-size: 13px;
  margin-bottom: 8px;
}

.metric-value {
  color: #111827;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}

.metric-extra {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
}

.conversion-text {
  color: #16a34a;
}

.growth-positive {
  color: #16a34a;
}

.growth-negative {
  color: #ef4444;
}

.growth-neutral {
  color: #6b7280;
}

.filter-card {
  margin-bottom: 12px;
}

.table-card {
  margin-bottom: 12px;
}

.table-card ::v-deep .el-table th > .cell {
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
}

.w-date {
  width: 260px;
}

.w-site {
  width: 140px;
}

.w-input {
  width: 180px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e8eefb;
  color: #3466ff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-blue {
  color: #2d6bff;
  font-weight: 700;
}

.text-green {
  color: #17a673;
  font-weight: 700;
}

.tips-box {
  margin-top: 8px;
  background: #071938;
  color: #c2d4ff;
  border-radius: 10px;
  padding: 12px 16px;
}

.tips-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
}

.tips-line {
  font-size: 12px;
  line-height: 1.7;
}

::v-deep .el-table__footer-wrapper .cell {
  font-weight: 700;
}

::v-deep .el-table__footer-wrapper tr td:nth-child(13) .cell {
  color: #2d6bff;
}

::v-deep .el-table__footer-wrapper tr td:nth-child(14) .cell {
  color: #17a673;
}

@media (max-width: 1400px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
