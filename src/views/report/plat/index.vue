<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="报表类型" prop="reportType">
        <el-select v-model="queryParams.reportType" placeholder="请选择" clearable size="small" style="width: 200px">
          <el-option label="日报" value="DAY" />
          <el-option label="月报" value="MONTH" />
        </el-select>
      </el-form-item>

      <el-form-item label="统计方式" prop="statType">
        <el-select v-model="queryParams.statType" placeholder="请选择" clearable size="small" style="width: 200px">
          <el-option label="投注时间" value="bet" />
          <el-option label="结算时间" value="net" />
        </el-select>
      </el-form-item>

      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="请输入"
          clearable
          size="small"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="币种" prop="currency">
        <el-select v-model="queryParams.currency" placeholder="请选择" clearable size="small" style="width: 200px">
          <el-option label="USDT" value="USDT" />
          <el-option label="CNY" value="CNY" />
        </el-select>
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :picker-options="startDatePickerOptions"
          size="small"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :picker-options="endDatePickerOptions"
          size="small"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="快速选择">
        <el-radio-group v-model="queryParams.quickRange" @change="handleQuickRangeChange" size="small">
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="yesterday">昨天</el-radio-button>
          <el-radio-button label="last7days">近7天</el-radio-button>
          <el-radio-button label="last30days">近30天</el-radio-button>
          <el-radio-button label="thisMonth">本月</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 高级筛选 -->
      <el-form-item label="存款金额">
        <el-input-number
          v-model="queryParams.depositAmountFrom"
          :precision="2"
          :min="0"
          controls-position="right"
          placeholder="起"
          size="small"
          style="width: 100px"
        />
        <span style="margin: 0 5px">至</span>
        <el-input-number
          v-model="queryParams.depositAmountTo"
          :precision="2"
          :min="0"
          controls-position="right"
          placeholder="至"
          size="small"
          style="width: 100px"
        />
      </el-form-item>

      <el-form-item label="投注金额">
        <el-input-number
          v-model="queryParams.betAmountFrom"
          :precision="2"
          :min="0"
          controls-position="right"
          placeholder="起"
          size="small"
          style="width: 100px"
        />
        <span style="margin: 0 5px">至</span>
        <el-input-number
          v-model="queryParams.betAmountTo"
          :precision="2"
          :min="0"
          controls-position="right"
          placeholder="至"
          size="small"
          style="width: 100px"
        />
      </el-form-item>

      <el-form-item label="充值笔数">
        <el-input-number
          v-model="queryParams.depositCountFrom"
          :min="0"
          controls-position="right"
          placeholder="起"
          size="small"
          style="width: 100px"
        />
        <span style="margin: 0 5px">至</span>
        <el-input-number
          v-model="queryParams.depositCountTo"
          :min="0"
          controls-position="right"
          placeholder="至"
          size="small"
          style="width: 100px"
        />
      </el-form-item>

      <el-form-item label="净输赢">
        <el-input-number
          v-model="queryParams.netAmountFrom"
          :precision="2"
          controls-position="right"
          placeholder="起"
          size="small"
          style="width: 100px"
        />
        <span style="margin: 0 5px">至</span>
        <el-input-number
          v-model="queryParams.netAmountTo"
          :precision="2"
          controls-position="right"
          placeholder="至"
          size="small"
          style="width: 100px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
        <el-button type="success" icon="el-icon-download" size="small" @click="handleExport">导出CSV</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 报表表格 -->
    <el-table
      v-loading="loading"
      :data="reportList"
      border
      stripe
      show-summary
      :summary-method="getSummaries"
      style="width: 100%; margin-top: 15px;"
      size="small"
    >
      <!-- 表格列保持不变 -->
      <el-table-column label="日期" align="center" prop="dateLabel" width="120" fixed>
        <template slot-scope="scope">
          <span v-if="scope.row.dateLabel">{{ parseTime(scope.row.dateLabel, '{y}-{m}-{d}') }}</span>
          <span v-else class="total-row">总计</span>
        </template>
      </el-table-column>

      <!-- 用户统计 -->
      <el-table-column label="用户统计" align="center" header-align="center">
        <el-table-column label="新增人数" align="center" prop="newUsers" width="90" />
        <el-table-column label="日活人数" align="center" prop="dailyActiveUsers" width="90" />
        <el-table-column label="有效日活" align="center" prop="validDailyActiveUsers" width="90" />
        <el-table-column label="首存人数" align="center" prop="firstDepositUsers" width="90" />
        <el-table-column label="转化率" align="center" prop="conversionRate" width="90">
          <template slot-scope="scope">
            {{ scope.row.conversionRate ? scope.row.conversionRate + '%' : '0%' }}
          </template>
        </el-table-column>
        <el-table-column label="首存额" align="center" prop="firstDepositAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.firstDepositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="人均首存" align="center" prop="avgFirstDeposit" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.avgFirstDeposit) }}
          </template>
        </el-table-column>
        <el-table-column label="存款人数" align="center" prop="depositUsers" width="90" />
        <el-table-column label="取款人数" align="center" prop="withdrawUsers" width="90" />
        <el-table-column label="设备数量" align="center" prop="deviceCount" width="90" />
        <el-table-column label="IP数量" align="center" prop="ipCount" width="90" />
      </el-table-column>

      <!-- 资金统计 -->
      <el-table-column label="资金统计" align="center" header-align="center">
        <el-table-column label="存款笔数" align="center" prop="depositCount" width="90" />
        <el-table-column label="存款额" align="center" prop="depositAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.depositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="取款额" align="center" prop="withdrawAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.withdrawAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="存提差" align="center" prop="depositWithdrawDiff" width="100">
          <template slot-scope="scope">
            <span :class="getAmountClass(scope.row.depositWithdrawDiff)">
              {{ formatCurrency(scope.row.depositWithdrawDiff) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="提存率" align="center" prop="withdrawDepositRate" width="90">
          <template slot-scope="scope">
            {{ scope.row.withdrawDepositRate ? scope.row.withdrawDepositRate + '%' : '0%' }}
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 投注统计 -->
      <el-table-column label="投注统计" align="center" header-align="center">
        <el-table-column label="投注人数" align="center" prop="betUsers" width="90" />
        <el-table-column label="投注额" align="center" prop="betAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.betAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="有效投注额" align="center" prop="validBetAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.validBetAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="公司输赢" align="center" prop="companyWinLoss" width="100">
          <template slot-scope="scope">
            <span :class="getWinLossClass(scope.row.companyWinLoss)">
              {{ formatCurrency(scope.row.companyWinLoss) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="公司平均输赢" align="center" prop="avgCompanyWinLoss" width="110">
          <template slot-scope="scope">
            <span :class="getWinLossClass(scope.row.avgCompanyWinLoss)">
              {{ formatCurrency(scope.row.avgCompanyWinLoss) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="赢余比例" align="center" prop="profitRate" width="90">
          <template slot-scope="scope">
            {{ scope.row.profitRate ? scope.row.profitRate + '%' : '0%' }}
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 其他统计 -->
      <el-table-column label="其他统计" align="center" header-align="center">
        <el-table-column label="账户调整" align="center" prop="accountAdjustment" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.accountAdjustment) }}
          </template>
        </el-table-column>
        <el-table-column label="公司收入" align="center" prop="companyIncome" width="100">
          <template slot-scope="scope">
            <span :class="getWinLossClass(scope.row.companyIncome)">
              {{ formatCurrency(scope.row.companyIncome) }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
import { listGameReport, getReportTotal, exportGameReport } from "@/api/report/plat";
import { parseTime } from "@/utils/ruoyi";
import { omitPagination } from "@/utils/reportSummary";

export default {
  name: "GameReport",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 报表表格数据
      reportList: [],
      // 总计数据
      totalData: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        reportType: "DAY",
        startDate: null,
        endDate: null,
        statType: "bet",
        siteCode: null,
        currency: "USDT",
        quickRange: "last7days",
        depositAmountFrom: null,
        depositAmountTo: null,
        betAmountFrom: null,
        betAmountTo: null,
        depositCountFrom: null,
        depositCountTo: null,
        netAmountFrom: null,
        netAmountTo: null
      },
      // 开始日期选择器配置
      startDatePickerOptions: {
        disabledDate: (time) => {
          if (this.queryParams.endDate) {
            return time.getTime() > new Date(this.queryParams.endDate).getTime();
          }
          return false;
        }
      },
      // 结束日期选择器配置
      endDatePickerOptions: {
        disabledDate: (time) => {
          if (this.queryParams.startDate) {
            return time.getTime() < new Date(this.queryParams.startDate).getTime() - 8.64e7;
          }
          return false;
        }
      }
    };
  },
  created() {
    this.getList();
    this.getTotalData();
  },
  methods: {
    /** 查询报表列表 */
    getList() {
      this.loading = true;
      listGameReport(this.queryParams).then(response => {
        this.reportList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    /** 获取总计数据 */
    getTotalData() {
      getReportTotal(omitPagination(this.queryParams)).then(response => {
        this.totalData = response.data;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
      this.getTotalData();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.quickRange = "last7days";
      this.handleQuickRangeChange("last7days");
      this.handleQuery();
    },

    /** 快速选择变化 */
    handleQuickRangeChange(range) {
      const today = new Date();
      const startDate = new Date();

      switch (range) {
        case "today":
          this.queryParams.startDate = this.parseTime(today, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(today, '{y}-{m}-{d}');
          break;
        case "yesterday":
          startDate.setDate(today.getDate() - 1);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(startDate, '{y}-{m}-{d}');
          break;
        case "last7days":
          startDate.setDate(today.getDate() - 7);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(today, '{y}-{m}-{d}');
          break;
        case "last14days":
          startDate.setDate(today.getDate() - 14);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(today, '{y}-{m}-{d}');
          break;
        case "last30days":
          startDate.setDate(today.getDate() - 30);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(today, '{y}-{m}-{d}');
          break;
        case "lastMonth":
          startDate.setMonth(today.getMonth() - 1);
          startDate.setDate(1);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          this.queryParams.endDate = this.parseTime(endDate, '{y}-{m}-{d}');
          break;
        case "thisMonth":
          startDate.setDate(1);
          this.queryParams.startDate = this.parseTime(startDate, '{y}-{m}-{d}');
          this.queryParams.endDate = this.parseTime(today, '{y}-{m}-{d}');
          break;
      }
    },

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有报表数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return exportGameReport(queryParams);
      }).then(response => {
        this.download(response.msg);
      }).catch(() => {});
    },

    /** 表格合计行 */
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      const rateFields = ['conversionRate', 'withdrawDepositRate', 'profitRate'];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }

        const prop = column.property;
        if (!prop) {
          sums[index] = '';
          return;
        }
        const value = Number(this.totalData[prop]);
        if (rateFields.includes(prop)) {
          sums[index] = Number.isFinite(value) ? value.toFixed(2) + '%' : '0%';
        } else if (Number.isFinite(value)) {
          sums[index] = this.formatCurrency(value);
        } else {
          sums[index] = '';
        }
      });

      return sums;
    },

    /** 格式化金额显示 */
    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00';
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    /** 获取金额显示样式 */
    getAmountClass(amount) {
      if (amount > 0) return 'positive';
      if (amount < 0) return 'negative';
      return '';
    },

    /** 获取输赢显示样式 */
    getWinLossClass(amount) {
      if (amount > 0) return 'win';
      if (amount < 0) return 'loss';
      return '';
    },

    parseTime
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.total-row {
  font-weight: bold;
  color: #409eff;
}

.el-table .cell {
  white-space: nowrap;
  font-size: 12px;
}

.positive, .win {
  color: #f56c6c;
  font-weight: bold;
}

.negative, .loss {
  color: #67c23a;
  font-weight: bold;
}

/* 统一表单样式 */
::v-deep .el-form-item {
  margin-bottom: 18px;
}

::v-deep .el-form-item__label {
  font-weight: normal;
}

::v-deep .el-table__footer .cell {
  font-weight: bold;
  color: #409eff;
}
</style>
