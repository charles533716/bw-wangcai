<template>
  <div v-loading="loading" class="reversal-report-page app-container">
    <section class="report-hero report-hero--purple">
      <div class="report-hero__content">
        <div class="report-hero__badge"><i class="el-icon-office-building"></i></div>
        <div>
          <h1 class="report-hero__title">冲正统计报表</h1>
          <p class="report-hero__desc">统计代理代冲正业务数据，包括垫付人数、额度及追回血况汇总。</p>
        </div>
      </div>
      <el-button
        class="report-hero__button"
        icon="el-icon-download"
        v-hasPermi="['agent:reversalStats:export']"
        @click="handleExport"
      >导出统计数据</el-button>
    </section>

    <section class="summary-grid">
      <article class="summary-card">
        <div class="summary-card__label">总垫付充正代理数</div>
        <div class="summary-card__value">{{ formatCount(summary.totalAdvanceAgentCount) }}</div>
      </article>
      <article class="summary-card">
        <div class="summary-card__label">总欠款人数</div>
        <div class="summary-card__value">{{ formatCount(summary.totalDebtorCount) }}</div>
      </article>
      <article class="summary-card summary-card--money">
        <div class="summary-card__label">总垫付额度</div>
        <div class="summary-card__value">{{ formatAmount(summary.totalAdvanceAmount) }}</div>
      </article>
      <article class="summary-card summary-card--danger">
        <div class="summary-card__label">总欠款额度</div>
        <div class="summary-card__value">{{ formatAmount(summary.totalOutstandingAmount) }}</div>
      </article>
    </section>

    <section class="filter-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="统计周期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="所属站点">
          <el-select v-model="queryParams.siteCode" clearable placeholder="全部站点" style="width: 180px">
            <el-option label="全部站点" value="" />
            <el-option v-for="site in siteOptions" :key="site.code" :label="site.nameZn || site.code" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索代理名称/ID..."
            clearable
            style="width: 260px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-card">
      <el-table :data="list" stripe show-summary :summary-method="getSummaries">
        <el-table-column label="所属站点" prop="siteName" min-width="120" />
        <el-table-column label="名称" prop="agentName" min-width="120" />
        <el-table-column label="ID" prop="agentId" width="100" />
        <el-table-column label="代理等级" prop="agentLevelLabel" min-width="100" />
        <el-table-column label="垫付充正代理人数" prop="paidBorrowerCount" width="150" align="center" />
        <el-table-column label="垫付余额" prop="advanceBalanceAmount" min-width="140" align="right">
          <template slot-scope="scope">{{ formatAmount(scope.row.advanceBalanceAmount) }}</template>
        </el-table-column>
        <el-table-column label="垫付级差佣金" prop="advanceLevelCommissionAmount" min-width="150" align="right">
          <template slot-scope="scope"><span class="text-blue">{{ formatAmount(scope.row.advanceLevelCommissionAmount) }}</span></template>
        </el-table-column>
        <el-table-column label="垫付会员盈利" prop="advanceDirectGrossAmount" min-width="150" align="right">
          <template slot-scope="scope"><span class="text-green">{{ formatAmount(scope.row.advanceDirectGrossAmount) }}</span></template>
        </el-table-column>
        <el-table-column label="垫付直属佣金" prop="advanceDirectCommissionAmount" min-width="150" align="right">
          <template slot-scope="scope"><span class="text-green">{{ formatAmount(scope.row.advanceDirectCommissionAmount) }}</span></template>
        </el-table-column>
        <el-table-column label="欠款人数" prop="debtorCount" width="110" align="center">
          <template slot-scope="scope"><span class="text-danger">{{ formatCount(scope.row.debtorCount) }}</span></template>
        </el-table-column>
        <el-table-column label="佣金+余额欠款额度" prop="outstandingAmount" min-width="170" align="right">
          <template slot-scope="scope"><span class="text-danger">{{ formatAmount(scope.row.outstandingAmount) }}</span></template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </section>

    <section class="note-card note-card--dark">
      <div class="note-card__title">统计口径说明</div>
      <div class="note-card__line">1. 垫付充正代理人数：统计周期内，发生过代下级代理垫付冲正的代理人数。</div>
      <div class="note-card__line">2. 垫付余额 / 垫付级差佣金 / 垫付会员盈利 / 垫付直属佣金：按冲正台账类型分别汇总。</div>
      <div class="note-card__line">3. 欠款人数 / 欠款额度：以当前仍有剩余未归还金额的台账为准。</div>
      <div class="note-card__line">4. 当前版本仅统计代理对下级代理的代冲正记录，不含站点兜底台账。</div>
    </section>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import { getReversalStatsSummary, listReversalStats } from '@/api/agent/reversalReport'

function createSummary() {
  return {
    totalAdvanceAgentCount: 0,
    totalDebtorCount: 0,
    totalAdvanceAmount: 0,
    totalOutstandingAmount: 0
  }
}

export default {
  name: 'AgentReversalStatsReport',
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      summary: createSummary(),
      siteOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startDate: undefined,
        endDate: undefined,
        siteCode: '',
        keyword: ''
      }
    }
  },
  created() {
    this.loadSiteOptions()
    this.handleQuery()
  },
  methods: {
    async loadSiteOptions() {
      const res = await listSite({ pageNum: 1, pageSize: 1000 })
      this.siteOptions = (res && res.rows) || []
    },
    syncDateRange() {
      this.queryParams.startDate = this.dateRange && this.dateRange.length ? this.dateRange[0] : undefined
      this.queryParams.endDate = this.dateRange && this.dateRange.length ? this.dateRange[1] : undefined
    },
    async loadSummary() {
      const res = await getReversalStatsSummary(this.queryParams)
      this.summary = Object.assign(createSummary(), (res && res.data) || {})
    },
    async getList() {
      this.syncDateRange()
      this.loading = true
      try {
        const [summaryRes, listRes] = await Promise.all([
          getReversalStatsSummary(this.queryParams),
          listReversalStats(this.queryParams)
        ])
        this.summary = Object.assign(createSummary(), (summaryRes && summaryRes.data) || {})
        this.list = (listRes && listRes.rows) || []
        this.total = (listRes && listRes.total) || 0
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleReset() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        startDate: undefined,
        endDate: undefined,
        siteCode: '',
        keyword: ''
      }
      this.getList()
    },
    handleExport() {
      this.syncDateRange()
      this.download(
        '/agent/reversal/report/stats/export',
        { ...this.queryParams, pageNum: undefined, pageSize: undefined },
        `reversal_stats_${Date.now()}.xlsx`
      )
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return `¥ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    formatCount(value) {
      return Number(value || 0)
    },
    getSummaries({ columns, data }) {
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总统计 (Page Total)'
          return
        }
        const key = column.property
        if (!key) {
          sums[index] = ''
          return
        }
        if (['paidBorrowerCount', 'debtorCount'].includes(key)) {
          sums[index] = data.reduce((acc, item) => acc + Number(item[key] || 0), 0)
          return
        }
        if (['advanceBalanceAmount', 'advanceLevelCommissionAmount', 'advanceDirectGrossAmount', 'advanceDirectCommissionAmount', 'outstandingAmount'].includes(key)) {
          sums[index] = this.formatAmount(data.reduce((acc, item) => acc + Number(item[key] || 0), 0))
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
.reversal-report-page { background: #f4f7fb; min-height: calc(100vh - 84px); }
.report-hero { display: flex; justify-content: space-between; align-items: center; padding: 22px 26px; border-radius: 22px; background: linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%); box-shadow: 0 10px 28px rgba(26, 40, 76, 0.08); }
.report-hero--purple .report-hero__badge { background: linear-gradient(135deg, #5a6bff, #6e39ff); }
.report-hero__content { display: flex; align-items: center; gap: 16px; }
.report-hero__badge { width: 54px; height: 54px; border-radius: 16px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(95, 80, 255, 0.25); }
.report-hero__title { margin: 0; font-size: 30px; font-weight: 700; color: #25304b; }
.report-hero__desc { margin: 8px 0 0; color: #73819b; }
.report-hero__button { border-radius: 14px; box-shadow: 0 8px 20px rgba(36, 68, 140, 0.08); }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-top: 18px; }
.summary-card { padding: 22px 24px; border-radius: 20px; background: #fff; box-shadow: 0 10px 24px rgba(22, 42, 84, 0.08); }
.summary-card__label { color: #8c97ab; font-size: 14px; }
.summary-card__value { margin-top: 16px; font-size: 34px; font-weight: 700; color: #25304b; }
.summary-card--money .summary-card__value { color: #0f9d71; }
.summary-card--danger .summary-card__value { color: #ef466f; }
.filter-card, .table-card, .note-card { margin-top: 18px; border-radius: 20px; background: #fff; box-shadow: 0 10px 24px rgba(22, 42, 84, 0.08); }
.filter-card { padding: 20px 22px 2px; }
.table-card { padding: 12px 0 6px; overflow: hidden; }
.note-card { padding: 22px 24px; }
.note-card--dark { background: #101b34; color: #eff3ff; }
.note-card__title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.note-card__line { margin-top: 8px; color: rgba(239, 243, 255, 0.82); }
.text-blue { color: #3c66ff; font-weight: 600; }
.text-green { color: #12a16f; font-weight: 600; }
.text-danger { color: #ef466f; font-weight: 600; }
@media (max-width: 1400px) { .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 768px) { .report-hero { flex-direction: column; align-items: flex-start; gap: 16px; } .summary-grid { grid-template-columns: 1fr; } }
</style>
