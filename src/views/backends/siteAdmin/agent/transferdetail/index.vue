<template>
  <div class="report-page">
    <div class="page-title">
      <span class="title-text">代理/站点转账明细报表</span>
    </div>

    <el-card shadow="never" class="card">
      <div class="filter-bar">
        <div class="left">
          <div class="field">
            <span class="label">订单号：</span>
            <el-input
              v-model="query.orderNo"
              placeholder="请输入订单号"
              clearable
              class="w-240"
            />
          </div>
          <div class="field">
            <span class="label">日期：</span>
            <el-date-picker
              v-model="query.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              clearable
              class="w-340"
            />
          </div>
          <div class="field">
            <span class="label">转账人：</span>
            <el-input
              v-model="query.fromAccount"
              placeholder="请输入转账人账号"
              clearable
              class="w-220"
            />
          </div>
          <div class="field">
            <span class="label">被转账人：</span>
            <el-input
              v-model="query.toAccount"
              placeholder="请输入被转账人账号"
              clearable
              class="w-220"
            />
          </div>
          <div class="field">
            <span class="label">身份：</span>
            <el-select v-model="query.identity" placeholder="全部身份" clearable class="w-180">
              <el-option
                v-for="it in identityOptions"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              />
            </el-select>
          </div>
          <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
          <el-button class="btn" @click="handleReset">重置</el-button>
          <el-button type="warning" icon="el-icon-download" class="btn" @click="handleExport">导出</el-button>
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
        <el-table-column label="订单号" min-width="220" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.__isSummary">总计</span>
            <span v-else>{{ row.orderNo || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="转账时间" min-width="180" align="center">
          <template slot-scope="{ row }">
            <span v-if="!row.__isSummary">{{ row.transferTime ? $formatters.formatDateTime(null, null, row.transferTime) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="转账人" prop="fromAccount" min-width="140" align="center" />
        <el-table-column label="ID" prop="fromId" min-width="100" align="center" />
        <el-table-column label="转账前额度" prop="fromQuotaText" min-width="160" align="center" />

        <el-table-column label="额度增减" min-width="140" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'amountChange', true) }}
          </template>
        </el-table-column>

        <el-table-column label="充值后站点额度" min-width="150" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'fromAfterAmount', false) }}
          </template>
        </el-table-column>

        <el-table-column label="被转账人账号" min-width="160" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.__isSummary">-</span>
            <el-link v-else type="primary" :underline="false" @click="handleViewReceiver(row)">
              {{ row.toAccount || '-' }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="被转账人ID" prop="toId" min-width="120" align="center" />
        <el-table-column label="转账前额度（收方）" prop="toQuotaText" min-width="170" align="center" />

        <el-table-column label="被转账额度" min-width="140" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'toAmount', true) }}
          </template>
        </el-table-column>

        <el-table-column label="转账后额度（收方）" min-width="160" align="center">
          <template slot-scope="{ row }">
            {{ renderAmount(row, 'toAfterAmount', false) }}
          </template>
        </el-table-column>

        <el-table-column label="操作人" prop="operatorName" min-width="140" align="center" />
        <el-table-column label="操作人身份" prop="operatorIdentity" min-width="120" align="center" />

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
import { listTransferDetail, summaryTransferDetail } from '@/api/agent/transferdetail';

function createEmptySummaryRow() {
  return {
    __isSummary: true,
    orderNo: null,
    transferTime: null,
    fromAccount: null,
    fromId: null,
    fromQuotaText: null,
    amountChange: 0,
    fromAfterAmount: null,
    toAccount: null,
    toId: null,
    toQuotaText: null,
    toAmount: 0,
    toAfterAmount: null,
    operatorName: null,
    operatorIdentity: null
  };
}

export default {
  name: 'TransferDetailReport',
  data() {
    return {
      loading: false,
      list: [],
      summaryRow: createEmptySummaryRow(),
      total: 0,
      query: {
        orderNo: '',
        dateRange: [],
        fromAccount: '',
        toAccount: '',
        identity: '',
        pageNum: 1,
        pageSize: 10
      },
      identityOptions: [
        { label: '全部身份', value: '' },
        { label: '站点管理', value: 'SITE_ADMIN' },
        { label: '代理', value: 'AGENT' },
        { label: '会员', value: 'MEMBER' }
      ]
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
    handleSearch() {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleReset() {
      this.query = {
        orderNo: '',
        dateRange: [],
        fromAccount: '',
        toAccount: '',
        identity: '',
        pageNum: 1,
        pageSize: 10
      };
      this.fetchList();
    },
    handleExport() {
      if (!this.validateDateRange()) {
        return;
      }
      const params = this.buildQueryParams();
      this.download('/agent/transferdetail/export', params, `代理站点转账明细_${new Date().getTime()}.xlsx`);
    },
    handlePageChange(page) {
      if (!this.validateDateRange()) {
        return;
      }
      this.query.pageNum = page;
      this.fetchList();
    },
    handleViewReceiver(row) {
      if (!row || row.__isSummary) {
        return;
      }
      const detail = `账号：${row.toAccount || '-'}\nID：${row.toId || '-'}\n转账前额度：${row.toQuotaText || '-'}\n转账后额度：${this.renderAmount(row, 'toAfterAmount', false)}`;
      this.$alert(detail, '被转账人详情', {
        confirmButtonText: '确定'
      });
    },
    renderAmount(row, field, enableSummary) {
      const value = row ? row[field] : null;
      if (row && row.__isSummary && !enableSummary) {
        return '-';
      }
      return this.$formatters.formatMoneyCNY(null, null, value || 0);
    },
    buildFilterParams() {
      const [startDate, endDate] = this.query.dateRange || [];
      return {
        orderNo: (this.query.orderNo || '').trim() || undefined,
        startDate,
        endDate,
        fromAccount: (this.query.fromAccount || '').trim() || undefined,
        toAccount: (this.query.toAccount || '').trim() || undefined,
        identity: this.query.identity || undefined
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
        listTransferDetail(listParams),
        summaryTransferDetail(summaryParams)
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

.w-180 {
  width: 180px;
}

.w-220 {
  width: 220px;
}

.w-240 {
  width: 240px;
}

.w-340 {
  width: 340px;
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

::v-deep .el-table .summary-total-row td {
  background: #f8fafc;
  font-weight: 700;
}

@media (max-width: 1300px) {
  .w-340 {
    width: 300px;
  }
}
</style>

