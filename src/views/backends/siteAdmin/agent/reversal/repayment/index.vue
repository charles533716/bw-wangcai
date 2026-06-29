<template>
  <div v-loading="loading" class="reversal-report-page app-container">
    <section class="report-hero report-hero--green">
      <div class="report-hero__content">
        <div class="report-hero__badge"><i class="el-icon-refresh-left"></i></div>
        <div>
          <h1 class="report-hero__title">冲正/回款报表</h1>
          <p class="report-hero__desc">记录每一笔代理代冲正操作及后续回款的明细流水。</p>
        </div>
      </div>
      <el-button
        class="report-hero__button"
        icon="el-icon-download"
        v-hasPermi="['agent:reversalRepayment:export']"
        @click="handleExport"
      >导出明细数据</el-button>
    </section>

    <section class="filter-card">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="查询时间">
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
          <el-select
            v-model="queryParams.siteCode"
            :disabled="!isSuperAdmin"
            clearable
            placeholder="全部站点"
            style="width: 160px"
          >
            <el-option label="全部站点" value="" />
            <el-option v-for="site in siteOptions" :key="site.code" :label="site.nameZn || site.code" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.debtType" clearable placeholder="全部类型" style="width: 150px">
            <el-option label="全部类型" value="" />
            <el-option label="直属会员盈利" value="DIRECT_GROSS" />
            <el-option label="直属佣金" value="DIRECT_COMMISSION" />
            <el-option label="级差佣金" value="LEVEL_COMMISSION" />
            <el-option label="余额" value="BALANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="垫付/回款">
          <el-select v-model="queryParams.direction" clearable placeholder="全部" style="width: 130px">
            <el-option label="全部" value="" />
            <el-option label="垫付" value="ADVANCE" />
            <el-option label="回款" value="REPAYMENT" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索代理名称/ID..."
            clearable
            style="width: 240px"
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
      <el-table :data="list" stripe>
        <el-table-column label="所属站点" prop="siteName" min-width="120" />
        <el-table-column label="名称" prop="agentName" min-width="120" />
        <el-table-column label="ID" prop="agentId" width="100" />
        <el-table-column label="代理等级" prop="agentLevelLabel" width="110" />
        <el-table-column label="类型" prop="debtTypeLabel" width="130" />
        <el-table-column label="垫付/回款" prop="directionLabel" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.direction === 'REPAYMENT' ? 'success' : 'warning'" effect="plain">{{ scope.row.directionLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="额度" prop="amount" min-width="140" align="right">
          <template slot-scope="scope">{{ formatAmount(scope.row.amount) }}</template>
        </el-table-column>
        <el-table-column label="额度缺口" prop="gapAmount" min-width="140" align="right">
          <template slot-scope="scope"><span class="text-danger">{{ formatAmount(scope.row.gapAmount) }}</span></template>
        </el-table-column>
        <el-table-column label="充正账目ID" prop="reversalRecordNo" min-width="130" />
        <el-table-column label="时间" prop="occurredAt" min-width="180">
          <template slot-scope="scope">{{ parseTime(scope.row.occurredAt) }}</template>
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

    <section class="note-card note-card--dark-green">
      <div class="note-card__title">报表说明</div>
      <div class="note-card__line">1. 当前版本展示代理对下级代理发生的代冲正及回款明细，不含站点兜底台账。</div>
      <div class="note-card__line">2. “回款”基于现有冲正台账的累计回款口径展示，若同一账目发生多次回款，会按当前累计回款额度展示一条记录。</div>
      <div class="note-card__line">3. 额度缺口 = 当前该笔台账仍未归还的剩余金额。</div>
      <div class="note-card__line">4. 充正账目 ID 采用现有台账主键拼接展示，便于和后台库表核对。</div>
    </section>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import { listReversalRepayment } from '@/api/agent/reversalReport'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'AgentReversalRepaymentReport',
  computed: {
    roles() {
      return this.$store.getters.roles || []
    },
    userSiteCode() {
      return this.$store.getters.userSiteCode || this.$store.getters.siteCode || ''
    },
    isSuperAdmin() {
      return this.roles.some((role) => {
        if (role && typeof role === 'object') {
          return String(role.roleKey || role.key || '').toLowerCase() === 'admin'
        }
        return String(role || '').toLowerCase() === 'admin'
      })
    }
  },
  data() {
    return {
      loading: false,
      total: 0,
      list: [],
      siteOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startDate: undefined,
        endDate: undefined,
        siteCode: '',
        debtType: '',
        direction: '',
        keyword: ''
      }
    }
  },
  created() {
    if (!this.isSuperAdmin && this.userSiteCode) {
      this.queryParams.siteCode = this.userSiteCode
      this.siteOptions = [{ code: this.userSiteCode, nameZn: this.userSiteCode }]
    }
    this.loadSiteOptions()
    this.handleQuery()
  },
  methods: {
    parseTime,
    async loadSiteOptions() {
      if (!this.isSuperAdmin) {
        return
      }
      const res = await listSite({ pageNum: 1, pageSize: 1000 })
      this.siteOptions = (res && res.rows) || []
    },
    syncDateRange() {
      this.queryParams.startDate = this.dateRange && this.dateRange.length ? this.dateRange[0] : undefined
      this.queryParams.endDate = this.dateRange && this.dateRange.length ? this.dateRange[1] : undefined
    },
    async getList() {
      this.syncDateRange()
      this.loading = true
      try {
        const res = await listReversalRepayment(this.queryParams)
        this.list = (res && res.rows) || []
        this.total = (res && res.total) || 0
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
        debtType: '',
        direction: '',
        keyword: ''
      }
      this.getList()
    },
    handleExport() {
      this.syncDateRange()
      this.download(
        '/agent/reversal/report/repayment/export',
        { ...this.queryParams, pageNum: undefined, pageSize: undefined },
        `reversal_repayment_${Date.now()}.xlsx`
      )
    },
    formatAmount(value) {
      const amount = Number(value || 0)
      return `¥ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  }
}
</script>

<style scoped>
.reversal-report-page { background: #f4f7fb; min-height: calc(100vh - 84px); }
.report-hero { display: flex; justify-content: space-between; align-items: center; padding: 22px 26px; border-radius: 22px; background: linear-gradient(135deg, #f8fdfc 0%, #eef8f4 100%); box-shadow: 0 10px 28px rgba(26, 40, 76, 0.08); }
.report-hero--green .report-hero__badge { background: linear-gradient(135deg, #0fa472, #18b896); }
.report-hero__content { display: flex; align-items: center; gap: 16px; }
.report-hero__badge { width: 54px; height: 54px; border-radius: 16px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 10px 20px rgba(15, 164, 114, 0.22); }
.report-hero__title { margin: 0; font-size: 30px; font-weight: 700; color: #25304b; }
.report-hero__desc { margin: 8px 0 0; color: #73819b; }
.report-hero__button { border-radius: 14px; box-shadow: 0 8px 20px rgba(36, 68, 140, 0.08); }
.filter-card, .table-card, .note-card { margin-top: 18px; border-radius: 20px; background: #fff; box-shadow: 0 10px 24px rgba(22, 42, 84, 0.08); }
.filter-card { padding: 20px 22px 2px; }
.table-card { padding: 12px 0 6px; overflow: hidden; }
.note-card { padding: 22px 24px; }
.note-card--dark-green { background: #0f2532; color: #eff9f5; }
.note-card__title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.note-card__line { margin-top: 8px; color: rgba(239, 249, 245, 0.82); }
.text-danger { color: #ef466f; font-weight: 600; }
@media (max-width: 768px) { .report-hero { flex-direction: column; align-items: flex-start; gap: 16px; } }
</style>
