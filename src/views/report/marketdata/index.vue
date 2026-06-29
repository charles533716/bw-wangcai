<template>
  <div class="app-container market-data-page">
    <div class="page-head">
      <div>
        <div class="page-title">市场数据统计表</div>
        <div class="page-subtitle">按日期与站点统计充值、提现、盈亏和新增注册</div>
      </div>
      <el-button type="primary" icon="el-icon-download" :loading="exportLoading" @click="handleExport">
        导出 Excel
      </el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="queryParams" label-width="72px">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            clearable
            class="date-picker"
          />
        </el-form-item>
        <el-form-item label="站点">
          <el-select
            v-model="selectedSiteCodes"
            multiple
            filterable
            clearable
            placeholder="请选择站点"
            class="site-select"
            :loading="siteLoading"
            @change="handleSiteChange"
          >
            <el-option
              v-for="site in siteOptions"
              :key="site.siteCode"
              :label="site.label || site.siteName || site.siteCode"
              :value="site.siteCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="quick-row">
        <el-button size="mini" :type="activePreset === 'all' ? 'primary' : 'default'" @click="applyPreset('all')">
          全部数据（近180天）
        </el-button>
        <el-button size="mini" :type="activePreset === '5' ? 'primary' : 'default'" @click="applyPreset('5')">
          近5天
        </el-button>
        <el-button size="mini" :type="activePreset === '3' ? 'primary' : 'default'" @click="applyPreset('3')">
          近3天
        </el-button>
        <el-divider direction="vertical" />
        <el-button size="mini" icon="el-icon-check" @click="selectAllSites">全选站点</el-button>
        <el-button size="mini" icon="el-icon-close" @click="clearSites">清空站点</el-button>
        <span class="site-count">已选 {{ selectedSiteCodes.length }} / {{ siteOptions.length }} 个站点</span>
      </div>
    </el-card>

    <div class="summary-grid" v-loading="summaryLoading">
      <div class="summary-card">
        <div class="summary-label">总充值</div>
        <div class="summary-value text-blue">{{ formatMoney(summary.depositAmount) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">总提现</div>
        <div class="summary-value text-amber">{{ formatMoney(summary.withdrawAmount) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">总盈亏</div>
        <div class="summary-value" :class="profitClass(summary.profitLossAmount)">
          {{ formatMoney(summary.profitLossAmount) }}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">新增注册</div>
        <div class="summary-value text-violet">{{ formatCount(summary.registerCount) }}</div>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <div slot="header" class="table-head">
        <span>日期 + 站点矩阵明细</span>
        <span class="table-hint">日期升序，同日期内按站点选择顺序展示</span>
      </div>
      <el-table
        v-loading="loading"
        :data="tableRows"
        border
        :span-method="tableSpanMethod"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="日期" prop="statDate" min-width="130" align="center" />
        <el-table-column label="所属站点" prop="siteName" min-width="150" align="center" />
        <el-table-column label="当日充值" prop="depositAmount" min-width="150" align="right">
          <template slot-scope="{ row }">
            <span>{{ formatMoney(row.depositAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当日提现" prop="withdrawAmount" min-width="150" align="right">
          <template slot-scope="{ row }">
            <span>{{ formatMoney(row.withdrawAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站点盈亏" prop="profitLossAmount" min-width="150" align="right">
          <template slot-scope="{ row }">
            <span :class="profitClass(row.profitLossAmount)">{{ formatMoney(row.profitLossAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="新增注册" prop="registerCount" min-width="120" align="right">
          <template slot-scope="{ row }">
            <span>{{ formatCount(row.registerCount) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="fetchData"
      />
    </el-card>
  </div>
</template>

<script>
import { listMarketDataReport, summaryMarketDataReport } from '@/api/report/marketdata'
import { listSiteOptions } from '@/api/site/site'

function emptySummary() {
  return {
    statDate: '合计',
    siteName: '所筛选站点合计总量',
    depositAmount: 0,
    withdrawAmount: 0,
    profitLossAmount: 0,
    registerCount: 0
  }
}

export default {
  name: 'MarketDataReport',
  data() {
    return {
      loading: false,
      summaryLoading: false,
      siteLoading: false,
      exportLoading: false,
      activePreset: '',
      list: [],
      total: 0,
      summary: emptySummary(),
      siteOptions: [],
      selectedSiteCodes: [],
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        dateRange: this.recentRange(30)
      }
    }
  },
  computed: {
    tableRows() {
      if (!this.list.length) {
        return []
      }
      return this.list.concat([Object.assign({ __summary: true }, this.summary)])
    }
  },
  created() {
    this.loadSites()
  },
  methods: {
    async loadSites() {
      this.siteLoading = true
      try {
        const resp = await listSiteOptions()
        this.siteOptions = Array.isArray(resp.data) ? resp.data : []
        this.selectedSiteCodes = this.siteOptions.map(item => item.siteCode)
      } finally {
        this.siteLoading = false
        this.fetchData()
      }
    },
    recentRange(days) {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - days + 1)
      return [this.toDateStr(start), this.toDateStr(end)]
    },
    toDateStr(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    buildFilterParams() {
      const range = this.queryParams.dateRange || []
      const params = {
        startDate: range[0],
        endDate: range[1]
      }
      if (this.selectedSiteCodes.length === 0) {
        params.siteCodes = '[]'
      } else if (this.selectedSiteCodes.length < this.siteOptions.length) {
        params.siteCodes = this.selectedSiteCodes.join(',')
      }
      return params
    },
    buildListParams() {
      return Object.assign({}, this.buildFilterParams(), {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      })
    },
    validateDateRange() {
      const range = this.queryParams.dateRange || []
      if (!range[0] || !range[1]) {
        this.$message.warning('请选择完整的时间范围')
        return false
      }
      return true
    },
    async fetchData() {
      if (!this.validateDateRange()) {
        return
      }
      this.loading = true
      this.summaryLoading = true
      try {
        const [listResp, summaryResp] = await Promise.all([
          listMarketDataReport(this.buildListParams()),
          summaryMarketDataReport(this.buildFilterParams())
        ])
        this.list = Array.isArray(listResp.rows) ? listResp.rows : []
        this.total = Number(listResp.total || 0)
        this.summary = Object.assign(emptySummary(), summaryResp.data || {})
      } catch (e) {
        this.list = []
        this.total = 0
        this.summary = emptySummary()
      } finally {
        this.loading = false
        this.summaryLoading = false
      }
    },
    handleQuery() {
      this.activePreset = ''
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    resetQuery() {
      this.activePreset = ''
      this.queryParams.dateRange = this.recentRange(30)
      this.selectedSiteCodes = this.siteOptions.map(item => item.siteCode)
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    applyPreset(type) {
      this.activePreset = type
      const days = type === 'all' ? 180 : Number(type)
      this.queryParams.dateRange = this.recentRange(days)
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    handleSiteChange() {
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    selectAllSites() {
      this.selectedSiteCodes = this.siteOptions.map(item => item.siteCode)
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    clearSites() {
      this.selectedSiteCodes = []
      this.queryParams.pageNum = 1
      this.fetchData()
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return
      }
      this.$confirm('是否导出当前筛选条件下的市场数据统计表？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.exportLoading = true
        return this.download(
          '/report/marketdata/export',
          this.buildFilterParams(),
          `market_data_report_${new Date().getTime()}.xlsx`
        )
      }).finally(() => {
        this.exportLoading = false
      }).catch(() => {
        this.exportLoading = false
      })
    },
    tableSpanMethod({ row, columnIndex, rowIndex }) {
      if (row.__summary) {
        if (columnIndex === 0) {
          return { rowspan: 1, colspan: 2 }
        }
        if (columnIndex === 1) {
          return { rowspan: 0, colspan: 0 }
        }
        return { rowspan: 1, colspan: 1 }
      }
      if (columnIndex !== 0) {
        return { rowspan: 1, colspan: 1 }
      }
      const currentDate = row.statDate
      if (rowIndex > 0 && this.list[rowIndex - 1] && this.list[rowIndex - 1].statDate === currentDate) {
        return { rowspan: 0, colspan: 0 }
      }
      let rowspan = 1
      for (let i = rowIndex + 1; i < this.list.length; i++) {
        if (this.list[i].statDate !== currentDate) {
          break
        }
        rowspan += 1
      }
      return { rowspan, colspan: 1 }
    },
    tableRowClassName({ row }) {
      return row.__summary ? 'market-summary-row' : ''
    },
    toNumber(value) {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    },
    formatMoney(value) {
      return this.toNumber(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatCount(value) {
      return `${Math.trunc(this.toNumber(value)).toLocaleString('zh-CN')} 人`
    },
    profitClass(value) {
      const num = this.toNumber(value)
      if (num < 0) {
        return 'text-red'
      }
      if (num > 0) {
        return 'text-green'
      }
      return 'text-muted'
    }
  }
}
</script>

<style scoped>
.market-data-page {
  padding-bottom: 8px;
  background: #f6f8fb;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-title {
  color: #17233d;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.page-subtitle {
  margin-top: 4px;
  color: #71809a;
  font-size: 13px;
}

.filter-card {
  margin-bottom: 14px;
  border-radius: 8px;
}

.date-picker {
  width: 300px;
}

.site-select {
  width: 360px;
}

.quick-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
  padding-left: 72px;
}

.site-count {
  color: #8a99ad;
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card {
  min-height: 96px;
  padding: 18px 20px;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(39, 55, 84, 0.06);
}

.summary-label {
  color: #71809a;
  font-size: 13px;
  font-weight: 600;
}

.summary-value {
  margin-top: 14px;
  font-family: Monaco, Menlo, Consolas, monospace;
  font-size: 24px;
  font-weight: 700;
}

.table-card {
  border-radius: 8px;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #17233d;
  font-weight: 700;
}

.table-hint {
  color: #8a99ad;
  font-size: 12px;
  font-weight: 400;
}

.text-blue {
  color: #2563eb;
}

.text-amber {
  color: #d97706;
}

.text-violet {
  color: #7c3aed;
}

.text-green {
  color: #059669;
}

.text-red {
  color: #f43f5e;
}

.text-muted {
  color: #52627a;
}

::v-deep .el-table .market-summary-row td {
  background: #101828;
  color: #fff;
  font-weight: 700;
}

::v-deep .el-table .market-summary-row .text-red,
::v-deep .el-table .market-summary-row .text-green,
::v-deep .el-table .market-summary-row .text-muted {
  color: #fff;
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
