<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="单号" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入单号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入会员账号"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="站点" prop="siteCode">
        <el-select
          v-model="queryParams.siteCode"
          placeholder="请选择站点"
          clearable
          filterable
          :loading="siteLoading"
          style="width: 200px"
        >
          <el-option
            v-for="item in siteOptions"
            :key="item.code"
            :label="formatSiteOption(item)"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="交易类型" prop="transactionType">
        <el-select
          v-model="queryParams.transactionType"
          placeholder="请选择"
          clearable
          style="width: 200px"
        >
          <el-option label="充值" :value="1" />
          <el-option label="提现" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付类型" prop="payType">
        <el-select
          v-model="queryParams.payType"
          placeholder="请选择支付类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="dict in payTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="option in depositWithdrawStatusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核人" prop="reviewerName">
        <el-input
          v-model="queryParams.reviewerName"
          placeholder="请输入审核人"
          clearable
          style="width: 200px"
        />
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
          v-hasPermi="['funds:depositWithdrawRecord:export']"
          >导出</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="recordList"
      :summary-method="getSummaries"
      :cell-class-name="getCellClassName"
      show-summary
    >
      <el-table-column label="单号" prop="code" align="center" width="200" fixed="left" />
      <el-table-column
        label="站点名称"
        prop="siteName"
        align="center"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column label="会员账号" prop="memberName" align="center" width="120" />
      <el-table-column label="交易类型" prop="transactionType" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.transactionType === 1 ? 'success' : 'warning'">
            {{ formatTransactionType(scope.row.transactionType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付类型" prop="payType" align="center" width="120">
        <template slot-scope="scope">
          <dict-tag :options="payTypeOptions" :value="resolvePayType(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="币种" prop="coin" align="center" width="90">
        <template slot-scope="scope">
          <span>{{ formatCoin(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="订单金额"
        prop="amount"
        align="center"
        width="120"
        class-name="amount-column"
      >
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amount, scope.row.transactionType)">
            {{ formatAmount(scope.row.amount, scope.row.transactionType) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="实际交易金额" prop="realAmount" align="center" width="120">
        <template slot-scope="scope">
          <span :class="getAmountClass(resolveRealTransactionAmount(scope.row), scope.row.transactionType)">
            {{ formatAmount(resolveRealTransactionAmount(scope.row), scope.row.transactionType) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="折算金额cny" prop="actualAmount" align="center" width="140">
        <template slot-scope="scope">
          <span :class="getAmountClass(resolveActualAmountCny(scope.row), scope.row.transactionType)">
            {{ formatAmount(resolveActualAmountCny(scope.row), scope.row.transactionType) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变动前金额" prop="amountBefore" align="center" width="120">
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amountBefore)">
            {{ formatAmount(scope.row.amountBefore) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="变动后金额" prop="amountAfter" align="center" width="120">
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amountAfter)">
            {{ formatAmount(scope.row.amountAfter) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="人民币金额" prop="amountCny" align="center" width="120">
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amountCny)">
            {{ formatAmount(scope.row.amountCny) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="汇率" prop="exchangeRate" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ formatRate(scope.row.exchangeRate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费" prop="feeAmount" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ formatAmount(scope.row.feeAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="银行名称"
        prop="bankName"
        align="center"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column label="账户姓名" prop="accountName" align="center" width="120" />
      <el-table-column
        label="银行账号"
        prop="accountNumber"
        align="center"
        width="180"
        show-overflow-tooltip
      />
      <el-table-column label="状态" prop="status" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核人" prop="reviewerName" align="center" width="120" />
      <el-table-column
        label="审核备注"
        prop="reviewReason"
        align="center"
        width="150"
        show-overflow-tooltip
      />
      <el-table-column label="审核时间" prop="reviewTime" align="center" width="160" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="160" />
      <el-table-column label="订单完成时间" prop="completeTime" align="center" width="160" />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['funds:record:view']"
            >查看</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-picture"
            @click="handleViewScreenshot(scope.row)"
            v-if="scope.row.screenshotUrl"
            >截图</el-button
          >
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

    <!-- 查看对话框 -->
    <el-dialog :title="viewTitle" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-form ref="viewForm" :model="viewForm" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="单号：">{{ viewForm.code }}</el-form-item>
            <el-form-item label="站点名称：">{{ viewForm.siteName || '-' }}</el-form-item>
            <el-form-item label="会员账号：">{{ viewForm.memberName }}</el-form-item>
            <el-form-item label="交易类型：">{{
              formatTransactionType(viewForm.transactionType)
            }}</el-form-item>
            <el-form-item label="支付类型：">
              <dict-tag :options="payTypeOptions" :value="resolvePayType(viewForm)" />
            </el-form-item>
            <el-form-item label="币种：">{{ formatCoin(viewForm) }}</el-form-item>
            <el-form-item label="订单金额：">{{
              formatAmount(viewForm.amount, viewForm.transactionType)
            }}</el-form-item>
            <el-form-item label="实际交易金额：">{{
              formatAmount(resolveRealTransactionAmount(viewForm), viewForm.transactionType)
            }}</el-form-item>
            <el-form-item label="折算金额cny：">{{
              formatAmount(resolveActualAmountCny(viewForm), viewForm.transactionType)
            }}</el-form-item>
            <el-form-item label="变动前金额：">{{ formatAmount(viewForm.amountBefore) }}</el-form-item>
            <el-form-item label="变动后金额：">{{ formatAmount(viewForm.amountAfter) }}</el-form-item>
            <el-form-item label="人民币金额：">{{ formatAmount(viewForm.amountCny) }}</el-form-item>
            <el-form-item label="汇率：">{{ formatRate(viewForm.exchangeRate) }}</el-form-item>
            <el-form-item label="手续费：">{{ formatAmount(viewForm.feeAmount) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行名称：">{{ viewForm.bankName }}</el-form-item>
            <el-form-item label="账户姓名：">{{ viewForm.accountName }}</el-form-item>
            <el-form-item label="银行账号：">{{ viewForm.accountNumber }}</el-form-item>
            <el-form-item label="平台类型：">{{ viewForm.platformType }}</el-form-item>
            <el-form-item label="状态：">
              <el-tag :type="getStatusTagType(viewForm.status)">{{
                formatStatus(viewForm.status)
              }}</el-tag>
            </el-form-item>
            <el-form-item label="审核人：">{{ viewForm.reviewerName || '-' }}</el-form-item>
            <el-form-item label="审核时间：">{{ viewForm.reviewTime || '-' }}</el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用户备注：">{{ viewForm.userRemark || '无' }}</el-form-item>
        <el-form-item label="审核备注：">{{ viewForm.reviewReason || '无' }}</el-form-item>
        <el-form-item label="管理员备注：">{{ viewForm.adminRemark || '无' }}</el-form-item>
        <el-form-item label="创建时间：">{{ viewForm.createTime }}</el-form-item>
        <el-form-item label="订单完成时间：">{{ viewForm.completeTime || '-' }}</el-form-item>
        <el-form-item label="截图：" v-if="viewForm.screenshotUrl">
          <el-image
            style="width: 200px; height: 200px"
            :src="viewForm.screenshotUrl"
            :preview-src-list="[viewForm.screenshotUrl]"
            fit="contain"
          ></el-image>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listDepositWithdrawRecord,
  getDepositWithdrawRecordSummary
} from '@/api/funds/depositWithdrawRecord';
import { listSite } from '@/api/site/site';
import {
  DEPOSIT_WITHDRAW_STATUS_OPTIONS,
  formatMemberAccountStatus,
  getMemberAccountStatusTagType
} from '@/utils/memberAccountRecordStatus';

const NEXUS_PAY_TYPE_OPTION = { label: 'NEXUS', value: 'nexus' };
const QUERY_TIMEOUT_MESSAGE = '数据量过大，请修改查询条件';

export default {
  name: 'DepositWithdrawRecord',
  dicts: ['pay_type'],
  data() {
    return {
      loading: false,
      siteLoading: false,
      recordList: [],
      total: 0,
      summaryTotals: {},
      siteOptions: [],
      depositWithdrawStatusOptions: DEPOSIT_WITHDRAW_STATUS_OPTIONS,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        memberName: undefined,
        siteCode: undefined,
        transactionType: undefined,
        payType: undefined,
        status: undefined,
        reviewerName: undefined
      },
      // 查看相关
      viewOpen: false,
      viewTitle: '',
      viewForm: {}
    };
  },
  created() {
    this.dateRange = this.getDefaultDateRange();
    this.getSiteOptions();
    this.refreshListAndSummary();
  },
  computed: {
    payTypeOptions() {
      const options = Array.isArray(this.dict.type.pay_type) ? this.dict.type.pay_type : [];
      const hasNexus = options.some(option => String(option.value || '').toLowerCase() === 'nexus');
      return hasNexus ? options : options.concat(NEXUS_PAY_TYPE_OPTION);
    }
  },
  methods: {
    getDefaultDateRange() {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      // Include one extra day so fresh records written in the server timezone are not hidden locally.
      end.setDate(end.getDate() + 1);
      return [this.formatDate(start), this.formatDate(end)];
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    getSiteOptions() {
      this.siteLoading = true;
      listSite({ pageNum: 1, pageSize: 1000 })
        .then((response) => {
          const rows = Array.isArray(response.rows)
            ? response.rows
            : (response.data && Array.isArray(response.data.rows) ? response.data.rows : []);
          this.siteOptions = rows
            .map((site) => ({
              code: site.code || site.siteCode || '',
              name: site.nameZn || site.name_zn || site.siteName || site.name || ''
            }))
            .filter((site) => site.code);
        })
        .catch(() => {
          this.siteOptions = [];
        })
        .finally(() => {
          this.siteLoading = false;
        });
    },
    formatSiteOption(site) {
      if (site.name && site.code) {
        return `${site.name}（${site.code}）`;
      }
      return site.name || site.code || '-';
    },
    buildQueryParams(includePagination = true) {
      const { pageNum, pageSize, ...filters } = this.queryParams;
      const params = {
        ...(includePagination ? this.queryParams : filters),
        params: {}
      };

      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00';
        params.params.endTime = this.dateRange[1] + ' 23:59:59';
      }

      return params;
    },
    async getList() {
      this.loading = true;

      try {
        const response = await listDepositWithdrawRecord(this.buildQueryParams(true), {
          timeoutMessage: QUERY_TIMEOUT_MESSAGE
        });
        this.recordList = response.rows;
        this.total = response.total;
      } catch (e) {
        this.recordList = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },
    async getSummary() {
      try {
        const response = await getDepositWithdrawRecordSummary(this.buildQueryParams(false), {
          timeoutMessage: QUERY_TIMEOUT_MESSAGE
        });
        this.summaryTotals = response.data || {};
      } catch (e) {
        this.summaryTotals = {};
      }
    },
    refreshListAndSummary() {
      this.getList();
      this.getSummary();
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.refreshListAndSummary();
    },
    resetQuery() {
      this.resetForm('queryForm');
      this.dateRange = this.getDefaultDateRange();
      this.handleQuery();
    },
    handleExport() {
      this.download(
        'funds/depositWithdrawRecord/export',
        this.buildQueryParams(false),
        `deposit_withdraw_record_${new Date().getTime()}.xlsx`
      );
    },
    // 查看详情
    handleView(row) {
      this.viewOpen = true;
      this.viewTitle = '存取款详情';
      this.viewForm = { ...row };
    },
    // 查看截图
    handleViewScreenshot(row) {
      this.viewOpen = true;
      this.viewTitle = '存款截图';
      this.viewForm = { ...row };
    },
    buildSummaryColumnConfig() {
      return {
        amount: {
          getValue: (item) => this.toSignedAmount(item.amount, item.transactionType),
          format: (value) => this.formatAmount(value)
        },
        realAmount: {
          getValue: (item) =>
            this.toSignedAmount(this.resolveRealTransactionAmount(item), item.transactionType),
          format: (value) => this.formatAmount(value)
        },
        actualAmount: {
          getValue: (item) =>
            this.toSignedAmount(this.resolveActualAmountCny(item), item.transactionType),
          format: (value) => this.formatAmount(value)
        },
        amountBefore: {
          getValue: (item) => this.toNumber(item.amountBefore),
          format: (value) => this.formatAmount(value)
        },
        amountAfter: {
          getValue: (item) => this.toNumber(item.amountAfter),
          format: (value) => this.formatAmount(value)
        },
        amountCny: {
          getValue: (item) => this.toNumber(item.amountCny),
          format: (value) => this.formatAmount(value)
        },
        feeAmount: {
          getValue: (item) => this.toNumber(item.feeAmount),
          format: (value) => this.formatAmount(value)
        },
        exchangeRate: {
          getValue: (item) => this.toNumber(item.exchangeRate),
          format: (value) => this.formatRate(value)
        }
      };
    },
    // 表格底部汇总
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      const summaryColumnConfig = this.buildSummaryColumnConfig();
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        const config = summaryColumnConfig[column.property];
        if (!config) {
          sums[index] = '-';
          return;
        }

        if (!Object.prototype.hasOwnProperty.call(this.summaryTotals, column.property)) {
          sums[index] = '-';
          return;
        }

        const sum = Number(this.summaryTotals[column.property]);
        if (!Number.isFinite(sum)) {
          sums[index] = '-';
          return;
        }
        sums[index] = config.format(sum);
      });
      return sums;
    },
    formatTransactionType(type) {
      const map = {
        1: '充值',
        2: '提现'
      };
      return map[type] || type;
    },
    resolvePayType(record) {
      if (!record) {
        return undefined;
      }
      return record.payType || record.withdrawType;
    },
    formatCoin(row) {
      return row.coin || row.currency || '-';
    },
    formatStatus(status) {
      return formatMemberAccountStatus(status);
    },
    toNumber(value) {
      if (value === null || value === undefined || value === '') return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    },
    toSignedAmount(amount, transactionType) {
      const num = this.toNumber(amount);
      if (num === null) return null;
      if (transactionType === 1) return Math.abs(num);
      if (transactionType === 2) return -Math.abs(num);
      return num;
    },
    formatAmount(amount, transactionType) {
      const num =
        transactionType === 1 || transactionType === 2
          ? this.toSignedAmount(amount, transactionType)
          : this.toNumber(amount);
      if (num === null) return '-';

      if (transactionType === 1) {
        return '+' + Math.abs(num).toFixed(2);
      } else if (transactionType === 2) {
        return '-' + Math.abs(num).toFixed(2);
      } else {
        return num.toFixed(2);
      }
    },
    formatRate(rate) {
      const num = this.toNumber(rate);
      if (num === null) return '-';
      return num.toFixed(6);
    },
    resolveActualAmountCny(row) {
      if (!row) return null;
      const actualAmount = this.toNumber(row.actualAmount);
      if (actualAmount === null) return null;

      const coin = row.coin || row.currency;
      if (row.transactionType === 2 && coin === 'USDT') {
        const exchangeRate = this.toNumber(row.exchangeRate);
        if (exchangeRate !== null && exchangeRate > 0) {
          return actualAmount * exchangeRate;
        }

        const amountCny = this.toNumber(row.amountCny);
        const feeAmount = this.toNumber(row.feeAmount);
        if (amountCny !== null && feeAmount !== null) {
          return amountCny - feeAmount;
        }
        if (amountCny !== null) {
          return amountCny;
        }
      }

      return actualAmount;
    },
    resolveRealTransactionAmount(row) {
      if (!row) return null;
      if (row.transactionType === 1) {
        return this.toNumber(row.realAmount);
      }
      if (row.transactionType === 2) {
        const actualAmount = this.toNumber(row.actualAmount);
        if (actualAmount !== null) {
          return actualAmount;
        }
        const amountCny = this.toNumber(row.amountCny);
        const feeAmount = this.toNumber(row.feeAmount);
        if (amountCny !== null && feeAmount !== null) {
          return amountCny - feeAmount;
        }
        return amountCny;
      }
      return this.toNumber(row.realAmount);
    },
    hasAmountMismatch(row) {
      if (!row || row.transactionType !== 1) return false;
      const amount = this.toNumber(row.amount);
      const realAmount = this.toNumber(row.realAmount);
      if (amount === null || realAmount === null) return false;
      return Math.abs(amount - realAmount) > 0.000001;
    },
    getCellClassName({ row, column }) {
      if (!this.hasAmountMismatch(row)) return '';
      if (column.property === 'amount' || column.property === 'realAmount') {
        return 'amount-mismatch-cell';
      }
      return '';
    },
    getAmountClass(amount, transactionType) {
      const num =
        transactionType === 1 || transactionType === 2
          ? this.toSignedAmount(amount, transactionType)
          : this.toNumber(amount);
      if (num === null) return '';

      if (num > 0) {
        return 'amount-positive';
      } else if (num < 0) {
        return 'amount-negative';
      } else {
        return '';
      }
    },
    getStatusTagType(status) {
      return getMemberAccountStatusTagType(status);
    }
  }
};
</script>

<style scoped>
.amount-positive {
  color: #67c23a;
  font-weight: bold;
}

.amount-negative {
  color: #f56c6c;
  font-weight: bold;
}

.amount-column {
  font-weight: bold;
}

::v-deep .amount-mismatch-cell {
  background-color: #fde2e2;
}
</style>
