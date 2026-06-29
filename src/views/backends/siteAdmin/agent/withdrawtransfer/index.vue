<template>
  <div class="report-page">
    <div class="page-title">
      <span class="title-text">充提转账统计</span>
    </div>

    <el-card shadow="never" class="card">
      <div class="filter-bar">
        <div class="left">
          <div class="field">
            <span class="label">日期查询：</span>
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
          <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
          <el-button class="btn" @click="handleReset">重置</el-button>
          <el-button type="warning" icon="el-icon-download" class="btn" @click="handleExport"
            >导出</el-button
          >
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
        <el-table-column label="编号" width="80" align="center">
          <template slot-scope="{ row, $index }">
            <span v-if="row.__isSummary">总计</span>
            <span v-else>{{ calcRowIndex($index) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="statDate" min-width="130" align="center">
          <template slot-scope="{ row }">
            <span v-if="!row.__isSummary">{{ row.statDate }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="总充值"
          prop="totalDeposit"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="总提现"
          prop="totalWithdraw"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="总转账"
          prop="totalTransfer"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="站点总充值"
          prop="siteTotalDeposit"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="站点总转账"
          prop="siteTotalTransfer"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="站点总提现"
          prop="siteTotalWithdraw"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="代理总充值"
          prop="agentTotalDeposit"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="代理总转账"
          prop="agentTotalTransfer"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="代理总提现"
          prop="agentTotalWithdraw"
          min-width="130"
          align="center"
          :formatter="formatAmount"
        />
        <el-table-column
          label="会员总充值"
          prop="memberTotalDeposit"
          min-width="130"
          align="center"
          class-name="member-deposit-cell"
          :formatter="formatAmount"
        />
        <el-table-column
          label="会员总提现"
          prop="memberTotalWithdraw"
          min-width="130"
          align="center"
          class-name="member-withdraw-cell"
          :formatter="formatAmount"
        />

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
import {
  listWithdrawTransferStats,
  summaryWithdrawTransferStats
} from '@/api/agent/withdrawtransfer';

function createEmptySummaryRow() {
  return {
    __isSummary: true,
    statDate: null,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalTransfer: 0,
    siteTotalDeposit: 0,
    siteTotalTransfer: 0,
    siteTotalWithdraw: 0,
    agentTotalDeposit: 0,
    agentTotalTransfer: 0,
    agentTotalWithdraw: 0,
    memberTotalDeposit: 0,
    memberTotalWithdraw: 0
  };
}

export default {
  name: 'WithdrawTransferStats',
  data() {
    return {
      loading: false,
      list: [],
      summaryRow: createEmptySummaryRow(),
      total: 0,
      query: {
        dateRange: [],
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
    calcRowIndex(index) {
      return (this.query.pageNum - 1) * this.query.pageSize + index + 1;
    },
    validateDateRange() {
      const [startDate, endDate] = this.query.dateRange || [];
      if (!startDate && !endDate) {
        return true;
      }
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
    headerStyle() {
      return {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600',
        height: '44px'
      };
    },
    handleSearch() {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleReset() {
      this.query.dateRange = [];
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return;
      }
      const params = this.buildQueryParams();
      this.download(
        '/agent/withdrawtransfer/export',
        params,
        `充提转账统计_${new Date().getTime()}.xlsx`
      );
    },
    handlePageChange(page) {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = page;
      this.fetchList();
    },
    formatAmount(row, column, value) {
      return this.$formatters.formatMoneyCNY(null, null, value);
    },
    buildFilterParams() {
      const [startDate, endDate] = this.query.dateRange || [];
      return {
        startDate,
        endDate
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
      Promise.all([
        listWithdrawTransferStats(listParams),
        summaryWithdrawTransferStats(summaryParams)
      ])
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

.btn {
  min-width: 80px;
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

@media (max-width: 1200px) {
  .w-360 {
    width: 300px;
  }
}

::v-deep .member-deposit-cell .cell {
  color: #e67e22;
  font-weight: 700;
}

::v-deep .member-withdraw-cell .cell {
  color: #f56c6c;
  font-weight: 700;
}

::v-deep .el-table .summary-total-row td {
  background: #f8fafc;
  font-weight: 700;
}
</style>
