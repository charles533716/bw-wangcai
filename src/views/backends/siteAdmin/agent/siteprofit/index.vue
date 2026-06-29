<template>
  <div class="report-page">
    <div class="page-title">
      <span class="title-text">站点利润明细</span>
    </div>

    <el-card shadow="never" class="card">
      <div class="filter-bar">
        <div class="left">
          <div class="field">
            <span class="label">日期筛选：</span>
            <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              clearable
              class="w-360"
            />
          </div>
          <el-button type="text" class="btn-link" @click="toggleMoreFilters">
            {{ showMoreFilters ? '收起筛选' : '更多筛选' }}
          </el-button>
          <el-button type="primary" class="btn" @click="handleSearch">查询</el-button>
          <el-button class="btn" @click="handleReset">重置</el-button>
          <el-button type="warning" icon="el-icon-download" class="btn" @click="handleExport"
            >导出</el-button
          >
        </div>
        <div v-if="showMoreFilters" class="more-filters">
          <div class="field">
            <span class="label">站点名称：</span>
            <el-input
              v-model="query.siteName"
              class="w-220"
              clearable
              placeholder="请输入站点名称"
            />
          </div>
          <div class="field">
            <span class="label">状态：</span>
            <el-select v-model="query.settleStatus" class="w-220" clearable placeholder="全部状态">
              <el-option
                v-for="item in settleStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        class="table"
        :header-cell-style="headerStyle"
        :span-method="tableSpanMethod"
        :row-class-name="tableRowClassName"
      >
        <el-table-column label="编号" min-width="110" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.__isSummary">总计</span>
            <span v-else>{{ row.siteCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="statDateRange" min-width="220" align="center">
          <template slot-scope="{ row }">
            <span v-if="!row.__isSummary">{{ row.statDateRange || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总流水" min-width="140" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'totalTurnover') }}
          </template>
        </el-table-column>
        <el-table-column label="总盈利" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-green">{{ renderAmount(row, 'totalProfit') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值额度" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-blue">{{ renderAmount(row, 'rechargeAmount') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="充值手续费" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-blue">{{ renderAmount(row, 'rechargeFee') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="提现额度" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'withdrawAmount') }}
          </template>
        </el-table-column>
        <el-table-column label="提现手续费" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'withdrawFee') }}
          </template>
        </el-table-column>
        <el-table-column label="坏账" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-red">{{ renderAmount(row, 'badDebt') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="活动彩金" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-orange">{{ renderAmount(row, 'activityBonus') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="站点收益" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span class="amount-blue">{{ renderAmount(row, 'siteIncome') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="月租" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.__isSummary">{{ renderAmount(row, 'monthlyRentAmount') }}</span>
            <span v-else>{{ renderMonthlyRent(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="三方场馆费用" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'venueFee') }}
          </template>
        </el-table-column>
        <el-table-column label="盈利代理额度总计" min-width="150" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'profitableAgentTotal') }}
          </template>
        </el-table-column>
        <el-table-column label="总站分成" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'headOfficeShareAmount') }}
          </template>
        </el-table-column>
        <el-table-column label="站点分成" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'siteShareAmount') }}
          </template>
        </el-table-column>
        <el-table-column label="代理佣金" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'agentCommission') }}
          </template>
        </el-table-column>
        <el-table-column label="站点实际分成收益" min-width="150" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'siteActualShareIncome') }}
          </template>
        </el-table-column>
        <el-table-column label="亏损代理额度总计" min-width="150" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'lossAgentTotal') }}
          </template>
        </el-table-column>
        <el-table-column label="冲正额度" min-width="130" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'correctionAmount') }}
          </template>
        </el-table-column>
        <el-table-column label="站点纯收入总计" min-width="150" align="center">
          <template slot-scope="{ row }">
            <span :class="profitClass(row)">{{ renderAmount(row, 'siteNetIncomeTotal') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120" align="center">
          <template slot-scope="{ row }">
            <el-tag v-if="!row.__isSummary" :type="statusTagType(row.settleStatus)" size="small">
              {{ row.settleStatus || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <template slot="empty">
          <div class="empty-wrap">
            <i class="el-icon-document"></i>
            <div class="empty-text">暂无数据</div>
          </div>
        </template>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="query.pageSize"
          :current-page.sync="query.pageNum"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { listSiteProfitDetail, summarySiteProfitDetail } from '@/api/agent/siteprofit';

function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createDefaultDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  return [formatDate(start), formatDate(end)];
}

function createEmptySummaryRow() {
  return {
    __isSummary: true,
    siteCode: null,
    statDateRange: null,
    totalTurnover: 0,
    totalProfit: 0,
    rechargeAmount: 0,
    rechargeFee: 0,
    withdrawAmount: 0,
    withdrawFee: 0,
    badDebt: 0,
    agentCommission: 0,
    activityBonus: 0,
    siteIncome: 0,
    monthlyRentText: '0.00',
    monthlyRentAmount: 0,
    venueFee: 0,
    profitableAgentTotal: 0,
    headOfficeShareAmount: 0,
    siteShareAmount: 0,
    siteActualShareIncome: 0,
    lossAgentTotal: 0,
    correctionAmount: 0,
    siteNetIncomeTotal: 0,
    siteProfit: 0,
    settleStatus: null
  };
}

export default {
  name: 'SiteProfitDetail',
  data() {
    return {
      loading: false,
      list: [],
      summaryRow: createEmptySummaryRow(),
      total: 0,
      showMoreFilters: false,
      settleStatusOptions: [
        { label: '已结算', value: '已结算' },
        { label: '未结算', value: '未结算' }
      ],
      query: {
        dateRange: createDefaultDateRange(),
        siteName: '',
        settleStatus: '',
        pageNum: 1,
        pageSize: 10
      }
    };
  },
  computed: {
    tableData() {
      const rows = Array.isArray(this.list) ? this.list.slice() : [];
      rows.push(this.summaryRow);
      return rows;
    }
  },
  created() {
    this.fetchList();
  },
  methods: {
    headerStyle() {
      return {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600',
        height: '44px'
      };
    },
    tableSpanMethod({ row, columnIndex }) {
      if (!row || !row.__isSummary) {
        return [1, 1];
      }
      if (columnIndex === 0) {
        return [1, 2];
      }
      if (columnIndex === 1) {
        return [0, 0];
      }
      return [1, 1];
    },
    tableRowClassName({ row }) {
      return row && row.__isSummary ? 'summary-total-row' : '';
    },
    validateDateRange() {
      const [startDate, endDate] = this.query.dateRange || [];
      if (!startDate || !endDate) {
        this.$message.warning('开始日期和结束日期需同时选择');
        return false;
      }

      const [startY, startM, startD] = startDate.split('-').map(Number);
      const [endY, endM, endD] = endDate.split('-').map(Number);
      const startUtc = Date.UTC(startY, startM - 1, startD);
      const endUtc = Date.UTC(endY, endM - 1, endD);
      if (endUtc < startUtc) {
        this.$message.warning('结束日期不能早于开始日期');
        return false;
      }

      const days = Math.floor((endUtc - startUtc) / (24 * 60 * 60 * 1000));
      if (days > 90) {
        this.$message.warning('查询日期跨度不能超过90天，请调整查询范围');
        return false;
      }
      return true;
    },
    handleSearch() {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleReset() {
      this.query = {
        dateRange: createDefaultDateRange(),
        siteName: '',
        settleStatus: '',
        pageNum: 1,
        pageSize: 10
      };
      this.showMoreFilters = false;
      this.fetchList();
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return;
      }
      this.download(
        '/agent/siteprofit/export',
        this.buildFilterParams(),
        `站点利润明细_${new Date().getTime()}.xlsx`
      );
    },
    handlePageChange(page) {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = page;
      this.fetchList();
    },
    buildFilterParams() {
      const [startDate, endDate] = this.query.dateRange || [];
      return {
        startDate,
        endDate,
        siteName: (this.query.siteName || '').trim(),
        settleStatus: this.query.settleStatus || undefined
      };
    },
    buildQueryParams() {
      return {
        ...this.buildFilterParams(),
        pageNum: this.query.pageNum,
        pageSize: this.query.pageSize
      };
    },
    toSummaryRow(data) {
      return {
        ...createEmptySummaryRow(),
        ...(data || {}),
        __isSummary: true
      };
    },
    fetchList() {
      this.loading = true;
      const listParams = this.buildQueryParams();
      const summaryParams = this.buildFilterParams();
      Promise.all([listSiteProfitDetail(listParams), summarySiteProfitDetail(summaryParams)])
        .then(([listResp, summaryResp]) => {
          const listData = (listResp && listResp.data) || {};
          const summaryData = (summaryResp && summaryResp.data) || {};
          this.list = listData.rows || [];
          this.total = Number(listData.total || 0);
          this.summaryRow = this.toSummaryRow(summaryData);
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
          this.summaryRow = createEmptySummaryRow();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    renderAmount(row, field) {
      const value = row ? row[field] : 0;
      return this.$formatters.formatMoneyCNY(null, null, value || 0);
    },
    renderMonthlyRent(row) {
      if (!row) {
        return '-';
      }
      if (row.monthlyRentText === '免扣除') {
        return '免扣除';
      }
      return this.$formatters.formatMoneyCNY(null, null, row.monthlyRentAmount || 0);
    },
    profitClass(row) {
      const value = Number((row && row.siteNetIncomeTotal) || 0);
      return value < 0 ? 'amount-red' : '';
    },
    toggleMoreFilters() {
      this.showMoreFilters = !this.showMoreFilters;
    },
    statusTagType(status) {
      if (status === '已结算') {
        return 'success';
      }
      if (status === '未结算') {
        return 'warning';
      }
      return 'info';
    }
  }
};
</script>

<style scoped>
.report-page {
  padding: 16px;
  background: #fff;
}

.page-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  color: #111;
}

.card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.filter-bar {
  padding: 10px 6px 14px;
}

.filter-bar .left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.more-filters {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
}

.w-360 {
  width: 360px;
}

.w-220 {
  width: 220px;
}

.btn {
  min-width: 80px;
}

.btn-link {
  padding: 0;
}

.table {
  margin-top: 4px;
}

.empty-wrap {
  padding: 60px 0;
  text-align: center;
  color: #909399;
}

.empty-wrap i {
  font-size: 42px;
  opacity: 0.5;
}

.empty-text {
  margin-top: 10px;
  font-size: 13px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 0 4px;
}

.amount-green {
  color: #67c23a;
  font-weight: 700;
}

.amount-blue {
  color: #409eff;
  font-weight: 700;
}

.amount-red {
  color: #f56c6c;
  font-weight: 700;
}

.amount-orange {
  color: #e67e22;
  font-weight: 700;
}

::v-deep .el-table .summary-total-row td {
  background: #f8fafc;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .w-360 {
    width: 300px;
  }
}
</style>
