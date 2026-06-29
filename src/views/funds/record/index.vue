<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="单号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入单号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input v-model="queryParams.memberName" placeholder="请输入会员账号名称" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="站点编码" prop="siteCode">
        <el-input v-model="queryParams.siteCode" placeholder="请输入站点编码" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="站点名称" prop="siteName">
        <el-input v-model="queryParams.siteName" placeholder="请输入站点名称" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="交易类型" prop="transactionType">
        <el-select v-model="queryParams.transactionType" placeholder="请选择" clearable style="width: 200px">
          <el-option
            v-for="dict in dict.type.transaction_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 200px">
          <el-option
            v-for="dict in dict.type.transaction_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请人" prop="operatorName">
        <el-input v-model="queryParams.operatorName" placeholder="请输入申请人" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="审核人" prop="reviewerName">
        <el-input v-model="queryParams.reviewerName" placeholder="请输入审核人" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="调整原因" prop="adjustReason">
        <el-select v-model="queryParams.adjustReason" placeholder="请选择调整原因" clearable style="width: 200px">
          <el-option
            v-for="dict in dict.type.member_up_amount"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
          <el-option
            v-for="dict in dict.type.member_down_amount"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
          v-hasPermi="['funds:record:export']"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="recordList"
      :summary-method="getSummaries"
      show-summary
    >
      <el-table-column label="单号" prop="code" align="center" width="200" fixed="left"/>
      <el-table-column label="会员账号" prop="memberName" align="center" width="120"/>
      <el-table-column label="站点编码" prop="siteCode" align="center" width="120"/>
      <el-table-column label="站点名称" prop="siteName" align="center" width="150"/>
      <el-table-column label="交易类型" prop="transactionType" align="center" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.transaction_type" :value="scope.row.transactionType" />
        </template>
      </el-table-column>
      <el-table-column label="币种" prop="coin" align="center" width="80"/>
      <el-table-column label="金额" prop="amount" align="center" width="120" class-name="amount-column">
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amount)">
            {{ formatAmount(scope.row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getDictLabel(dict.type.transaction_status, scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="调整原因" prop="adjustReason" align="center" width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ getAdjustReasonLabel(scope.row.adjustReason, scope.row.transactionType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" prop="operatorName" align="center" width="120"/>
      <el-table-column label="申请时间" prop="createTime" align="center" width="160"/>
      <el-table-column label="审核人" prop="reviewerName" align="center" width="120"/>
      <el-table-column label="审核备注" prop="reviewReason" align="center" width="150" show-overflow-tooltip/>
      <el-table-column label="备注" prop="memo" align="center" show-overflow-tooltip/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="160"/>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listRecord, summaryRecord } from "@/api/funds/record";

function padNumber(value) {
  return value < 10 ? '0' + value : String(value);
}

function formatDateValue(date) {
  return [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join('-');
}

function createDefaultCreateDateRange() {
  const today = new Date();
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  return [
    formatDateValue(startDate),
    formatDateValue(endDate)
  ];
}

export default {
  name: "MemberAccountRecord",
  dicts: ['member_up_amount', 'member_down_amount', 'transaction_type', 'transaction_status'],
  data() {
    return {
      loading: false,
      recordList: [],
      total: 0,
      totalAmount: 0,
      summaryAmount: 0,
      dateRange: createDefaultCreateDateRange(),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        memberName: undefined,
        siteCode: undefined,
        siteName: undefined,
        transactionType: undefined,
        status: undefined,
        operatorName: undefined,
        reviewerName: undefined,
        adjustReason: undefined,
        beginTime: undefined,
        endTime: undefined
      }
    };
  },
  created() {
    this.loadList(true);
  },
  methods: {
    getAdjustReasonLabel(reason, transactionType) {
      if (!reason) return '-';

      // 如果是人工加分
      if (transactionType === 7) {
        const dict = this.dict.type.member_up_amount.find(item => item.value === reason);
        return dict ? dict.label : reason;
      }
      // 如果是人工减分
      if (transactionType === 8) {
        const dict = this.dict.type.member_down_amount.find(item => item.value === reason);
        return dict ? dict.label : reason;
      }
      return reason;
    },
    buildQueryParams(includePagination = true) {
      const params = {
        ...this.queryParams,
        params: {}
      };

      if (!includePagination) {
        delete params.pageNum;
        delete params.pageSize;
      }

      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00';
        params.params.endTime = this.dateRange[1] + ' 23:59:59';
      }

      return params;
    },
    getSummaryAmount(response) {
      const data = response && response.data ? response.data : {};
      const amount = Number(data.amount);
      return Number.isFinite(amount) ? amount : 0;
    },
    getList() {
      this.loadList(false);
    },
    async loadList(includeSummary) {
      this.loading = true;
      const params = this.buildQueryParams(true);
      try {
        const summaryPromise = includeSummary
          ? summaryRecord(this.buildQueryParams(false)).catch(() => null)
          : null;
        const response = await listRecord(params);
        this.recordList = response.rows;
        this.total = response.total;
        this.totalAmount = response.totalAmount || 0;
        if (summaryPromise) {
          const summaryResponse = await summaryPromise;
          this.summaryAmount = this.getSummaryAmount(summaryResponse);
        }
      } catch (e) {
        this.recordList = [];
        this.total = 0;
        this.totalAmount = 0;
        this.summaryAmount = 0;
      } finally {
        this.loading = false;
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadList(true);
    },
    resetQuery() {
      this.dateRange = createDefaultCreateDateRange();
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleExport() {
      const params = this.buildQueryParams(false);

      this.download('funds/record/export',
        params
       , `record_${new Date().getTime()}.xlsx`)
    },
    // 表格底部汇总
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        if (column.property === 'amount') {
          sums[index] = this.formatAmount(this.summaryAmount);
        } else {
          sums[index] = '-';
        }
      });
      return sums;
    },
    getDictLabel(options, value) {
      if (value === null || value === undefined || value === '') {
        return '-';
      }
      const match = (options || []).find(item => String(item.value) === String(value));
      return match ? match.label : String(value);
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined) return '-';
      const num = parseFloat(amount);
      if (isNaN(num)) return '-';
      if (num > 0) {
        return '+' + num.toFixed(2);
      } else if (num < 0) {
        return num.toFixed(2);
      } else {
        return num.toFixed(2);
      }
    },
    getAmountClass(amount) {
      if (amount === null || amount === undefined) return '';
      const num = parseFloat(amount);
      if (isNaN(num)) return '';
      if (num > 0) {
        return 'amount-positive';
      } else if (num < 0) {
        return 'amount-negative';
      } else {
        return '';
      }
    },
    getStatusTagType(status) {
      // 根据 SQL 备注完善状态分类
      const successStatus = [3, 7, 10, 14, 16, 18, 21, 22]; // 成功状态
      const pendingStatus = [1, 4, 5, 9, 12, 15]; // 处理中/待处理状态
      const failedStatus = [2, 6, 8, 11, 13, 17, 19, 20]; // 失败状态

      if (successStatus.includes(status)) return 'success';
      if (pendingStatus.includes(status)) return 'warning';
      if (failedStatus.includes(status)) return 'danger';
      return 'info';
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.total-amount {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
}

.total-label {
  color: #606266;
}

.total-positive {
  color: #67c23a;
}

.total-negative {
  color: #f56c6c;
}

.amount-positive {
  color: #67c23a;
  font-weight: bold;
}

.amount-negative {
  color: #f56c6c;
  font-weight: bold;
}

/* 金额列样式 */
.amount-column {
  font-weight: bold;
}

::v-deep .el-table .cell {
  white-space: nowrap;
}

::v-deep .el-table__footer .cell {
  font-weight: bold;
  color: #409eff;
}
</style>
