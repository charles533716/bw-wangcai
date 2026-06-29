<template>
  <div
    v-loading="loading"
    element-loading-text="数据加载中..."
    class="finance-center-page app-container"
  >
    <section class="fc-hero-card">
      <div class="fc-hero-card__label">
        <i class="el-icon-wallet"></i>
        当前可用额度（CNY）
      </div>
      <div class="fc-hero-card__amount">{{ summaryAmountText }}</div>
      <div class="fc-hero-card__meta">
        <span>资金池额度：{{ fundPoolAmountText }}</span>
        <span>范围：{{ scopeText }}</span>
      </div>
    </section>

    <section ref="filterBar" class="fc-filter-bar">
      <div class="fc-filter-bar__main">
        <el-input
          v-model.trim="queryForm.keyword"
          clearable
          class="fc-filter-keyword"
          prefix-icon="el-icon-search"
          placeholder="搜索站点/流水单号/业务类型..."
          @keyup.enter.native="handleQuery"
        />
        <el-select v-model="queryForm.businessType" class="fc-filter-select" placeholder="全部业务类型" clearable>
          <el-option label="全部业务类型" value="" />
          <el-option v-for="item in bizTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select
          v-model="queryForm.siteCode"
          class="fc-filter-related"
          filterable
          placeholder="关联方名称"
        >
          <el-option label="全部站点" value="" />
          <el-option
            v-for="site in siteOptions"
            :key="site.code"
            :label="site.nameZn || site.siteName || site.code"
            :value="site.code"
          />
        </el-select>
        <el-date-picker
          v-model="queryForm.dateRange"
          class="fc-filter-date"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="-"
          start-placeholder="年 / 月 / 日"
          end-placeholder="年 / 月 / 日"
        />
        <el-button plain icon="el-icon-refresh-left" @click="handleResetQuery">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
      <el-button :loading="loading || recordsLoading" plain icon="el-icon-refresh" @click="reloadAll">刷新</el-button>
    </section>

    <section class="fc-record-card">
      <div class="fc-record-card__head">
        <div class="fc-record-card__title-wrap">
          <span class="fc-record-card__dot"></span>
          <span class="fc-record-card__title">近期收支明细（资金池流水）</span>
        </div>
        <div class="fc-record-card__actions">
          <el-button
            type="primary"
            plain
            size="small"
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >
            导出报表
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="recordsLoading"
        :data="financePanel.recentRecords"
        class="fc-record-table"
        :header-cell-style="recordTableHeaderStyle"
      >
        <el-table-column label="流水编号" min-width="190">
          <template slot-scope="scope">
            <span class="fc-record-code">{{ scope.row.transactionId || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="名称" min-width="140">
          <template slot-scope="scope">
            <span class="fc-target-text">{{ scope.row.name || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="业务类型" min-width="120">
          <template slot-scope="scope">
            <span :class="typeBadgeClass(displayTransactionTypeName(scope.row.transactionTypeName))">
              {{ displayTransactionTypeName(scope.row.transactionTypeName) || '--' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="主体变动额度" min-width="140" align="right">
          <template slot-scope="scope">
            <span :class="moneyChangeClass(scope.row.primaryAmountDirection)">
              {{ scope.row.primaryAmountText || '0.00 CNY' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="关联方名称" min-width="150">
          <template slot-scope="scope">
            <span class="fc-target-text">{{ scope.row.counterpartyName || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="时间" min-width="170">
          <template slot-scope="scope">
            {{ scope.row.time || '--' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="130" align="center">
          <template slot-scope="scope">
            <el-button type="text" class="fc-detail-link" @click="handleShowDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>

        <template slot="empty">
          <div class="fc-empty">暂无数据</div>
        </template>
      </el-table>

      <pagination
        v-show="recordPager.total > 0"
        :total="recordPager.total"
        :page.sync="recordPager.pageNum"
        :limit.sync="recordPager.pageSize"
        :page-sizes="[10, 20, 30, 40, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @pagination="handleRecordPageChange"
      />
    </section>

    <el-dialog
      title="流水明细详情"
      :visible.sync="detailVisible"
      width="680px"
      custom-class="fc-detail-dialog"
      append-to-body
    >
      <div v-loading="detailLoading" class="fc-detail-grid">
        <div v-for="item in detailItems" :key="item.label" class="fc-detail-item" :class="{ 'is-wide': item.wide }">
          <div class="fc-detail-label">{{ item.label }}</div>
          <div class="fc-detail-value" :class="item.className">{{ item.value }}</div>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFinanceCenterPanel, getFinanceCenterRecords, getFinanceCenterRecordDetail } from '@/api/funds/center'
import { listSite } from '@/api/site/site'

function createZeroState() {
  return {
    siteCode: 'ALL',
    viewerRole: 'super',
    summary: {
      availableBalance: 0,
      fundPoolBalance: 0,
      currency: 'CNY'
    },
    recentRecords: []
  }
}

function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDefaultDateRange() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  return [formatDateValue(start), formatDateValue(end)]
}

function createDefaultQueryForm() {
  return {
    keyword: '',
    businessType: '',
    siteCode: '',
    dateRange: createDefaultDateRange()
  }
}

export default {
  name: 'AdminFinanceCenter',
  data() {
    return {
      loading: false,
      recordsLoading: false,
      exportLoading: false,
      detailVisible: false,
      detailLoading: false,
      currentDetail: {},
      financePanel: createZeroState(),
      siteOptions: [],
      bizTypeOptions: [
        { value: 2, label: '站点提现' },
        { value: 4, label: '代理提现' },
        { value: 5, label: '会员充值' },
        { value: 6, label: '会员提现' },
        { value: 12, label: '分润' },
        { value: 14, label: '站点月结' },
        { value: 17, label: '转入预付金' }
      ],
      queryForm: createDefaultQueryForm(),
      appliedQueryForm: createDefaultQueryForm(),
      recordPager: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  computed: {
    summaryAmountText() {
      return this.formatCny(this.financePanel.summary.availableBalance)
    },
    fundPoolAmountText() {
      return this.formatCny(this.financePanel.summary.fundPoolBalance)
    },
    scopeText() {
      if (!this.appliedQueryForm.siteCode) {
        return '全部站点'
      }
      const site = this.siteOptions.find((item) => item && String(item.code) === String(this.appliedQueryForm.siteCode))
      return (site && (site.nameZn || site.siteName || site.code)) || this.appliedQueryForm.siteCode
    },
    detailItems() {
      const row = this.currentDetail || {}
      return [
        { label: '流水编号', value: row.transactionId || '--' },
        { label: '名称', value: row.name || '--' },
        { label: '站点编号', value: row.siteCode || '--' },
        { label: '业务类型', value: this.displayTransactionTypeName(row.transactionTypeName) || '--', className: this.typeBadgeClass(this.displayTransactionTypeName(row.transactionTypeName)) },
        { label: '主体变动额度', value: row.primaryAmountText || '--', className: this.moneyChangeClass(row.primaryAmountDirection) },
        { label: '主体变动后余额', value: row.primaryBalanceAfterText || '--', className: this.moneyAfterClass(row.primaryAmountDirection) },
        { label: '关联方名称', value: row.counterpartyName || '--' },
        { label: '变动额度', value: row.counterpartyAmountText || '--', className: this.moneyChangeClass(row.counterpartyAmountDirection) },
        { label: '变动后余额', value: row.counterpartyBalanceAfterText || '--', className: this.moneyAfterClass(row.counterpartyAmountDirection) },
        { label: '关联方资金池额度变动', value: row.fundPoolAmountText || '--', className: this.moneyChangeClass(row.fundPoolAmountDirection) },
        { label: '关联方资金池变动后额度', value: row.fundPoolBalanceAfterText || '--', className: this.moneyAfterClass(row.fundPoolAmountDirection) },
        { label: '时间', value: row.time || '--' },
        { label: '备注', value: row.remark || '--', wide: true }
      ]
    }
  },
  created() {
    this.loadSiteOptions()
    this.reloadAll()
  },
  methods: {
    recordTableHeaderStyle() {
      return {
        background: '#f8fafc',
        color: '#94a3b8',
        fontWeight: 600,
        borderBottom: '1px solid #eef2f7'
      }
    },
    formatCny(value) {
      const num = Number(value || 0)
      if (Number.isNaN(num)) return '¥0.00'
      return `¥${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    moneyChangeClass(direction) {
      return ['fc-money-change', `is-${direction || 'flat'}`]
    },
    moneyAfterClass(direction) {
      return ['fc-money-after', `is-${direction || 'flat'}`]
    },
    typeBadgeClass(typeName) {
      const name = typeName || ''
      return [
        'fc-type-badge',
        name.indexOf('充值') !== -1 ? 'is-green' : '',
        name.indexOf('提现') !== -1 ? 'is-red' : '',
        name.indexOf('分润') !== -1 || name.indexOf('月结') !== -1 ? 'is-blue' : '',
        name.indexOf('预付金') !== -1 ? 'is-amber' : ''
      ]
    },
    displayTransactionTypeName(typeName) {
      if (typeName === '预付金转入') {
        return '转入预付金'
      }
      if (typeName === '预付金转出') {
        return '转出预付金'
      }
      return typeName || ''
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    normalizePanelData(rawData) {
      const zero = createZeroState()
      const data = rawData && typeof rawData === 'object' ? rawData : {}
      const summary = data.summary && typeof data.summary === 'object' ? data.summary : {}
      return {
        siteCode: data.siteCode || zero.siteCode,
        viewerRole: data.viewerRole || zero.viewerRole,
        summary: {
          ...zero.summary,
          ...summary,
          availableBalance: this.toNumber(summary.availableBalance),
          fundPoolBalance: this.toNumber(summary.fundPoolBalance)
        },
        recentRecords: Array.isArray(data.recentRecords) ? data.recentRecords : []
      }
    },
    buildPanelParams() {
      return {
        siteCode: this.appliedQueryForm.siteCode || 'ALL'
      }
    },
    buildRecordParams() {
      const params = {
        pageNum: this.recordPager.pageNum,
        pageSize: this.recordPager.pageSize,
        keyword: this.appliedQueryForm.keyword || undefined,
        siteCode: this.appliedQueryForm.siteCode || undefined
      }
      if (this.appliedQueryForm.businessType) {
        params.transactionTypes = String(this.appliedQueryForm.businessType)
      } else {
        params.transactionTypes = this.bizTypeOptions.map((item) => item.value).join(',')
      }
      if (Array.isArray(this.appliedQueryForm.dateRange) && this.appliedQueryForm.dateRange.length === 2) {
        params.beginTime = this.appliedQueryForm.dateRange[0]
        params.endTime = this.appliedQueryForm.dateRange[1]
      }
      return params
    },
    cloneQueryForm(form) {
      const source = form || createDefaultQueryForm()
      return {
        keyword: source.keyword || '',
        businessType: source.businessType || '',
        siteCode: source.siteCode || '',
        dateRange: Array.isArray(source.dateRange) ? [...source.dateRange] : []
      }
    },
    buildExportParams() {
      return {
        ...this.buildRecordParams(),
        pageNum: undefined,
        pageSize: undefined
      }
    },
    async reloadAll() {
      this.loading = true
      this.recordsLoading = true
      try {
        this.recordPager.pageNum = 1
        const [panelRes, recordsRes] = await Promise.all([
          getFinanceCenterPanel(this.buildPanelParams()),
          getFinanceCenterRecords(this.buildRecordParams())
        ])
        this.financePanel = this.normalizePanelData((panelRes && panelRes.data) || {})
        this.applyRecordsData((recordsRes && recordsRes.data) || {})
      } catch (e) {
        this.financePanel = createZeroState()
        this.recordPager.total = 0
      } finally {
        this.loading = false
        this.recordsLoading = false
      }
    },
    loadSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000, status: '1' }).then(response => {
        this.siteOptions = (response && response.rows) || []
      }).catch(() => {
        this.siteOptions = []
      })
    },
    applyRecordsData(data) {
      const rows = Array.isArray(data.rows) ? data.rows : []
      this.financePanel = {
        ...this.financePanel,
        siteCode: data.siteCode || this.financePanel.siteCode,
        viewerRole: data.viewerRole || this.financePanel.viewerRole,
        recentRecords: rows
      }
      this.recordPager.total = this.toNumber(data.total)
      this.recordPager.pageNum = this.toNumber(data.pageNum) || this.recordPager.pageNum
      this.recordPager.pageSize = this.toNumber(data.pageSize) || this.recordPager.pageSize
    },
    async refreshPanel() {
      this.loading = true
      try {
        const res = await getFinanceCenterPanel(this.buildPanelParams())
        this.financePanel = {
          ...this.normalizePanelData((res && res.data) || {}),
          recentRecords: this.financePanel.recentRecords
        }
      } catch (e) {
        this.financePanel = {
          ...this.financePanel,
          summary: createZeroState().summary
        }
      } finally {
        this.loading = false
      }
    },
    async refreshRecords(silent) {
      this.recordsLoading = true
      try {
        const res = await getFinanceCenterRecords(this.buildRecordParams())
        this.applyRecordsData((res && res.data) || {})
        if (!silent) {
          this.$message.success('收支明细已刷新')
        }
      } catch (e) {
        this.financePanel = {
          ...this.financePanel,
          recentRecords: []
        }
        this.recordPager.total = 0
      } finally {
        this.recordsLoading = false
      }
    },
    handleRecordPageChange() {
      this.refreshRecords(true)
    },
    async handleQuery() {
      this.recordPager.pageNum = 1
      this.appliedQueryForm = this.cloneQueryForm(this.queryForm)
      await Promise.all([
        this.refreshPanel(),
        this.refreshRecords(true)
      ])
    },
    handleResetQuery() {
      const emptyForm = createDefaultQueryForm()
      this.queryForm = this.cloneQueryForm(emptyForm)
      this.appliedQueryForm = this.cloneQueryForm(emptyForm)
      this.handleQuery()
    },
    async handleShowDetail(row) {
      if (!row || !row.transactionId) return
      this.currentDetail = { ...row }
      this.detailVisible = true
      this.detailLoading = true
      try {
        const res = await getFinanceCenterRecordDetail({ transactionId: row.transactionId })
        this.currentDetail = (res && res.data) || row
      } finally {
        this.detailLoading = false
      }
    },
    async handleExport() {
      this.exportLoading = true
      try {
        await this.download('funds/fundpool/center/records/export', this.buildExportParams(), `finance_center_records_${new Date().getTime()}.xlsx`)
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.finance-center-page {
  background: #f5f7fb;
  min-height: calc(100vh - 84px);
}

.fc-hero-card {
  border-radius: 18px;
  padding: 22px 28px;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #001a54 0%, #042b8d 55%, #001b4f 100%);
  color: #fff;
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.12);
}

.fc-hero-card__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 600;
}

.fc-hero-card__amount {
  margin-top: 12px;
  font-size: 44px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -1px;
}

.fc-hero-card__meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.fc-filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.fc-filter-bar__main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
}

.fc-filter-keyword {
  width: 448px;
}

.fc-filter-select {
  width: 130px;
}

.fc-filter-related {
  width: 120px;
}

.fc-filter-date {
  width: 320px;
}

.fc-record-card {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
  border: 1px solid #eef2f7;
}

.fc-record-card__head {
  height: 58px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef2f7;
}

.fc-record-card__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.fc-record-card__dot {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #3b82f6;
}

.fc-record-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.fc-record-card__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.fc-record-table {
  width: 100%;
}

.fc-record-code {
  color: #64748b;
  font-weight: 600;
}

.fc-target-text {
  color: #475569;
}

.fc-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #2563eb;
  font-weight: 600;
  line-height: 1.2;
}

.fc-type-badge.is-green {
  background: #dcfce7;
  color: #059669;
}

.fc-type-badge.is-red {
  background: #ffe4ec;
  color: #e11d48;
}

.fc-type-badge.is-blue {
  background: #eff6ff;
  color: #2563eb;
}

.fc-type-badge.is-amber {
  background: #fef3c7;
  color: #b45309;
}

.fc-money-change {
  font-weight: 700;
}

.fc-money-change.is-in {
  color: #10b981;
}

.fc-money-change.is-out {
  color: #ef4444;
}

.fc-money-change.is-flat {
  color: #0f172a;
}

.fc-money-after {
  font-weight: 600;
}

.fc-money-after.is-in {
  color: #10b981;
}

.fc-money-after.is-out {
  color: #ef4444;
}

.fc-money-after.is-flat {
  color: #0f172a;
}

.fc-empty {
  padding: 18px 0;
  color: #94a3b8;
}

.fc-detail-link {
  font-weight: 700;
}

.fc-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 56px;
  min-height: 220px;
}

.fc-detail-item.is-wide {
  grid-column: 1 / -1;
}

.fc-detail-label {
  margin-bottom: 8px;
  color: #8aa0bd;
  font-size: 13px;
  font-weight: 700;
}

.fc-detail-value {
  color: #1e2f4a;
  font-size: 15px;
  font-weight: 700;
  word-break: break-word;
}

::v-deep .pagination-container {
  padding: 12px 16px 16px;
}

::v-deep .fc-detail-dialog {
  border-radius: 14px;
  overflow: hidden;
}

::v-deep .fc-detail-dialog .el-dialog__header {
  padding: 22px 24px 18px;
  border-bottom: 1px solid #eef2f7;
}

::v-deep .fc-detail-dialog .el-dialog__body {
  padding: 24px;
}

::v-deep .fc-detail-dialog .el-dialog__footer {
  padding: 16px 24px;
  background: #f8fafc;
}

@media (max-width: 1280px) {
  .fc-filter-keyword {
    width: 320px;
  }

  .fc-filter-date {
    width: 280px;
  }
}

@media (max-width: 960px) {
  .fc-filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .fc-filter-keyword,
  .fc-filter-select,
  .fc-filter-related,
  .fc-filter-date {
    width: 100%;
  }

  .fc-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
