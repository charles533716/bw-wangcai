<template>
  <div class="app-container venue-agent-fee-page">
    <div class="page-heading">
      <h2>三方场馆代理费用明细</h2>
      <el-button
        type="success"
        plain
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
        v-hasPermi="['venue:agentFeeDetail:export']"
      >
        导出报表
      </el-button>
    </div>

    <el-form :model="queryParams" ref="queryForm" :inline="true" class="filter-panel">
      <el-form-item>
        <el-input
          v-model.trim="queryParams.agentName"
          size="small"
          clearable
          prefix-icon="el-icon-search"
          placeholder="搜索代理名称..."
          class="agent-input"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="queryParams.siteCode"
          size="small"
          clearable
          filterable
          placeholder="所有站点"
          class="site-select"
        >
          <el-option label="所有站点" value="" />
          <el-option
            v-for="site in siteOptions"
            :key="site.code"
            :label="site.nameZn || site.code"
            :value="site.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="时间筛选：">
        <el-date-picker
          v-model="weekRange.startWeek"
          type="week"
          size="small"
          format="yyyy 第 WW 周"
          placeholder="开始周"
          :picker-options="weekPickerOptions"
          class="week-picker"
        />
        <span class="range-separator">至</span>
        <el-date-picker
          v-model="weekRange.endWeek"
          type="week"
          size="small"
          format="yyyy 第 WW 周"
          placeholder="结束周"
          :picker-options="weekPickerOptions"
          class="week-picker"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="success" icon="el-icon-search" size="small" @click="handleQuery">
          开始筛选
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="rows"
      border
      stripe
      class="agent-fee-table"
      size="small"
      show-summary
      :summary-method="getSummaries"
      empty-text="暂无代理费用记录"
    >
      <el-table-column label="时间" prop="periodRange" min-width="175" align="center" fixed />
      <el-table-column label="站点" prop="siteName" min-width="120" align="center" />
      <el-table-column label="上级代理" prop="parentAgentName" min-width="130" align="center" show-overflow-tooltip />
      <el-table-column label="代理名称" prop="agentName" min-width="150" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span class="agent-name">{{ row.agentName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="代理级别" prop="agentLevelLabel" min-width="110" align="center">
        <template slot-scope="{ row }">
          <el-tag size="mini" type="success">{{ row.agentLevelLabel || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代理返佣" prop="profitShareRateText" min-width="100" align="center">
        <template slot-scope="{ row }">
          <span class="rate-text">{{ row.profitShareRateText || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场馆数量" prop="venueCount" min-width="105" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            class="venue-count-link"
            :disabled="!Number(row.venueCount)"
            @click="openDetail(row)"
          >
            {{ row.venueCount || 0 }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="直属承担三方场馆费用" prop="directShareFee" min-width="170" align="right">
        <template slot-scope="{ row }">
          <span class="money danger">{{ formatMoney(row.directShareFee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="级差三方场馆费用" prop="levelShareFee" min-width="150" align="right">
        <template slot-scope="{ row }">
          <span class="money warning">{{ formatMoney(row.levelShareFee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总承担费用" prop="totalShareFee" min-width="135" align="right" fixed="right">
        <template slot-scope="{ row }">
          <span class="money success">{{ formatMoney(row.totalShareFee) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      title="场馆费用明细"
      :visible.sync="detailDialog.visible"
      width="860px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="detail-dialog">
        <div class="detail-meta">
          <span>代理：{{ detailDialog.row.agentName || '-' }}</span>
          <span>时间：{{ detailDialog.row.periodRange || '-' }}</span>
        </div>
        <div v-loading="detailDialog.loading" class="venue-card-grid">
          <div v-for="item in detailDialog.items" :key="item.venueCode" class="venue-card">
            <div class="venue-card-head">
              <strong>{{ item.venueName || item.venueCode }}</strong>
              <span>DETAIL</span>
            </div>
            <div class="metric-row">
              <span>盈亏金额</span>
              <strong>{{ formatMoney(item.winLossAmount) }}</strong>
            </div>
            <div class="metric-row">
              <span>费用比例</span>
              <strong class="warning">{{ item.feeRateText || '0%' }}</strong>
            </div>
            <div class="metric-row">
              <span>费用金额</span>
              <strong class="success">{{ formatMoney(item.feeAmount) }}</strong>
            </div>
            <div class="split-row">
              <span>直属 {{ formatMoney(item.directShareFee) }}</span>
              <span>级差 {{ formatMoney(item.levelShareFee) }}</span>
            </div>
          </div>
          <div v-if="!detailDialog.loading && detailDialog.items.length === 0" class="detail-empty">
            暂无场馆承担明细
          </div>
        </div>
        <div class="detail-total">
          <span>总承担费用</span>
          <strong>{{ formatMoney(detailDialog.totalFeeAmount) }}</strong>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import {
  exportVenueAgentFeeDetail,
  getVenueAgentFeeDetail,
  listVenueAgentFeeDetail
} from '@/api/report/venueAgentFeeDetail'

export default {
  name: 'VenueAgentFeeDetail',
  data() {
    const latestWeek = this.getLatestCompleteWeek()
    return {
      loading: false,
      exportLoading: false,
      rows: [],
      total: 0,
      siteOptions: [],
      weekPickerOptions: {
        firstDayOfWeek: 1
      },
      weekRange: {
        startWeek: latestWeek.start,
        endWeek: latestWeek.end
      },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        agentName: '',
        siteCode: ''
      },
      detailDialog: {
        visible: false,
        loading: false,
        row: {},
        items: [],
        totalFeeAmount: 0
      }
    }
  },
  created() {
    this.loadSiteOptions()
    this.getList()
  },
  methods: {
    loadSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.siteOptions = (response && response.rows) || []
      }).catch(() => {
        this.siteOptions = []
      })
    },
    getList() {
      const params = this.buildQueryParams()
      if (!params) {
        return
      }
      this.loading = true
      listVenueAgentFeeDetail(params).then(response => {
        this.rows = (response && response.rows) || []
        this.total = (response && response.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleExport() {
      const params = this.buildQueryParams(false)
      if (!params) {
        return
      }
      this.exportLoading = true
      exportVenueAgentFeeDetail(params).then(data => {
        const fileName = `三方场馆代理费用明细_${params.startDate}_${params.endDate}.xlsx`
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        this.$download.saveAs(blob, fileName)
      }).finally(() => {
        this.exportLoading = false
      })
    },
    openDetail(row) {
      this.detailDialog.visible = true
      this.detailDialog.loading = true
      this.detailDialog.row = row || {}
      this.detailDialog.items = []
      this.detailDialog.totalFeeAmount = 0
      getVenueAgentFeeDetail({
        cycleNo: row.cycleNo,
        siteCode: row.siteCode,
        agentId: row.agentId
      }).then(response => {
        const data = (response && response.data) || {}
        this.detailDialog.items = data.items || []
        this.detailDialog.totalFeeAmount = data.totalFeeAmount || row.totalShareFee || 0
      }).finally(() => {
        this.detailDialog.loading = false
      })
    },
    buildQueryParams(includePage = true) {
      if (!this.weekRange.startWeek || !this.weekRange.endWeek) {
        this.$message.warning('请选择账单周')
        return null
      }
      const startDate = this.formatDate(this.getWeekStart(this.weekRange.startWeek))
      const endDate = this.formatDate(this.getWeekEnd(this.weekRange.endWeek))
      if (startDate > endDate) {
        this.$message.warning('开始周不能晚于结束周')
        return null
      }
      const params = {
        startDate,
        endDate,
        siteCode: this.queryParams.siteCode || undefined,
        agentName: this.queryParams.agentName || undefined
      }
      if (includePage) {
        params.pageNum = this.queryParams.pageNum
        params.pageSize = this.queryParams.pageSize
      }
      return params
    },
    getSummaries({ columns, data }) {
      return columns.map((column, index) => {
        if (index === 0) {
          return '总计:'
        }
        if (column.property === 'venueCount') {
          return data.reduce((sum, row) => sum + Number(row.venueCount || 0), 0)
        }
        if (['directShareFee', 'levelShareFee', 'totalShareFee'].includes(column.property)) {
          const total = data.reduce((sum, row) => sum + this.normalizeMoney(row[column.property]), 0)
          return this.formatMoney(total)
        }
        return '-'
      })
    },
    getLatestCompleteWeek() {
      const today = this.clearTime(new Date())
      const day = today.getDay() || 7
      const lastSunday = new Date(today)
      lastSunday.setDate(today.getDate() - day)
      const start = new Date(lastSunday)
      start.setDate(lastSunday.getDate() - 6)
      return { start, end: lastSunday }
    },
    getWeekStart(date) {
      const target = this.clearTime(new Date(date))
      const day = target.getDay() || 7
      target.setDate(target.getDate() - day + 1)
      return target
    },
    getWeekEnd(date) {
      const start = this.getWeekStart(date)
      start.setDate(start.getDate() + 6)
      return start
    },
    clearTime(date) {
      const target = new Date(date)
      target.setHours(0, 0, 0, 0)
      return target
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatMoney(value) {
      const amount = this.normalizeMoney(value)
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    normalizeMoney(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) {
        return 0
      }
      return Math.round(number * 100) / 100
    }
  }
}
</script>

<style scoped>
.venue-agent-fee-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-heading h2 {
  position: relative;
  margin: 0;
  padding-left: 14px;
  color: #1f2d3d;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
}

.page-heading h2::before {
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 20px;
  background: #059669;
  border-radius: 2px;
  content: "";
  transform: translateY(-50%);
}

.filter-panel {
  margin-bottom: 22px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #dfe6ef;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(31, 45, 61, 0.04);
}

.agent-input {
  width: 270px;
}

.site-select {
  width: 240px;
}

.week-picker {
  width: 170px;
}

.range-separator {
  display: inline-block;
  margin: 0 8px;
  color: #8a97a8;
}

.agent-fee-table {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.agent-name {
  color: #1f2937;
  font-weight: 700;
}

.rate-text {
  color: #047857;
  font-weight: 700;
}

.venue-count-link {
  min-width: 36px;
  padding: 4px 10px;
  color: #2563eb;
  background: #eef4ff;
  border-radius: 999px;
  font-weight: 700;
}

.money {
  font-weight: 700;
}

.success {
  color: #059669;
}

.warning {
  color: #ea580c;
}

.danger {
  color: #e11d48;
}

.detail-dialog {
  color: #1f2937;
}

.detail-meta {
  display: flex;
  gap: 18px;
  margin: -6px 0 18px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.venue-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  min-height: 120px;
}

.venue-card {
  padding: 18px;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
  background: #ffffff;
}

.venue-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.venue-card-head strong {
  color: #111827;
  font-size: 16px;
}

.venue-card-head span {
  padding: 3px 8px;
  color: #94a3b8;
  background: #f1f5f9;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.metric-row,
.split-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
  color: #64748b;
  font-size: 13px;
}

.metric-row strong {
  color: #1f2937;
  font-size: 14px;
}

.split-row {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #edf2f7;
}

.detail-empty {
  grid-column: 1 / -1;
  padding: 34px 0;
  color: #94a3b8;
  text-align: center;
}

.detail-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5eaf2;
  color: #64748b;
  font-weight: 700;
}

.detail-total strong {
  color: #059669;
  font-size: 26px;
}

@media (max-width: 1100px) {
  .venue-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
