<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="报表类型" prop="reportType">
        <el-select v-model="queryParams.reportType" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="日报" value="DAY" />
          <el-option label="月报" value="MONTH" />
        </el-select>
      </el-form-item>

      <el-form-item label="统计方式" prop="statType">
        <el-select v-model="queryParams.statType" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="按时间" value="time" />
          <el-option label="按账户" value="account" />
        </el-select>
      </el-form-item>

      <el-form-item label="场馆" prop="venueCodes">
        <el-select
          v-model="queryParams.venueCodes"
          multiple
          placeholder="请选择场馆"
          clearable
          size="small"
          style="width: 200px"
        >
          <el-option
            v-for="venue in venueList"
            :key="venue.code"
            :label="venue.nameZn"
            :value="venue.code"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="币种" prop="currency">
        <el-select v-model="queryParams.currency" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="USDT" value="USDT" />
          <el-option label="CNY" value="CNY" />
        </el-select>
      </el-form-item>

      <el-form-item label="结算状态" prop="settlementStatus">
        <el-select v-model="queryParams.settlementStatus" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="成功" :value="3" />
          <el-option label="处理中" :value="1" />
          <el-option label="失败" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          :type="queryParams.reportType === 'MONTH' ? 'month' : 'date'"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :picker-options="startDatePickerOptions"
          size="small"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          :type="queryParams.reportType === 'MONTH' ? 'month' : 'date'"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          :picker-options="endDatePickerOptions"
          size="small"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="快速选择">
        <el-radio-group v-model="queryParams.quickRange" @change="handleQuickRangeChange" size="small">
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="yesterday">昨天</el-radio-button>
          <el-radio-button label="last7days">近7天</el-radio-button>
          <el-radio-button label="last14days">近14天</el-radio-button>
          <el-radio-button label="last30days">近30天</el-radio-button>
          <el-radio-button label="lastMonth">上个月</el-radio-button>
          <el-radio-button label="thisMonth">本月</el-radio-button>
        </el-radio-group>
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
      <el-table-column label="日期" align="center" prop="dateLabel" width="120" fixed>
        <template slot-scope="scope">
          <span v-if="scope.row.dateLabel">
            {{ queryParams.reportType === 'MONTH' ? parseTime(scope.row.dateLabel, '{y}-{m}') : parseTime(scope.row.dateLabel, '{y}-{m}-{d}') }}
          </span>
          <span v-else class="total-row">总计</span>
        </template>
      </el-table-column>

      <el-table-column label="场馆/平台" align="center" prop="venueName" width="120" />
      <el-table-column label="币种" align="center" prop="currency" width="80" />

      <!-- 充值提现统计 -->
      <el-table-column label="充值统计" align="center" header-align="center">
        <el-table-column label="充值笔数" align="center" prop="depositCount" width="90" />
        <el-table-column label="充值金额" align="center" prop="depositAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.depositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="提现笔数" align="center" prop="withdrawCount" width="90" />
        <el-table-column label="提现金额" align="center" prop="withdrawAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.withdrawAmount) }}
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 场馆转账 -->
      <el-table-column label="场馆转账" align="center" header-align="center">
        <el-table-column label="上分金额" align="center" prop="venueInAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.venueInAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="下分金额" align="center" prop="venueOutAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.venueOutAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="异常退款" align="center" prop="refundAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.refundAmount) }}
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 投注统计 -->
      <el-table-column label="投注统计" align="center" header-align="center">
        <el-table-column label="投注金额" align="center" prop="betAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.betAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="有效投注" align="center" prop="validBetAmount" width="100">
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
        <el-table-column label="盈亏比例" align="center" prop="profitRate" width="90">
          <template slot-scope="scope">
            {{ scope.row.profitRate ? scope.row.profitRate.toFixed(2) + '%' : '0%' }}
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 财务汇总 -->
      <el-table-column label="财务汇总" align="center" header-align="center">
        <el-table-column label="总收入" align="center" prop="totalIncome" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.totalIncome) }}
          </template>
        </el-table-column>
        <el-table-column label="总支出" align="center" prop="totalExpense" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.totalExpense) }}
          </template>
        </el-table-column>
        <el-table-column label="净入账" align="center" prop="netAmount" width="100">
          <template slot-scope="scope">
            <span :class="getWinLossClass(scope.row.netAmount)">
              {{ formatCurrency(scope.row.netAmount) }}
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
import { listFinancialReport, exportFinancialReport } from "@/api/report/financial";
import { listVenue } from "@/api/venue/venue";
import { parseTime } from "@/utils/ruoyi";
import { fetchAllRowsByPage, omitPagination, sumNumericFields } from "@/utils/reportSummary";

export default {
  name: "FinancialReport",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      reportList: [],
      summarySums: {},
      summaryCounts: {},
      venueList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        reportType: "DAY",
        startDate: null,
        endDate: null,
        statType: "time",
        venueCodes: [],
        currency: "USDT",
        settlementStatus: null,
        quickRange: "last7days"
      },
      startDatePickerOptions: {
        disabledDate: (time) => {
          if (this.queryParams.endDate) {
            return time.getTime() > new Date(this.queryParams.endDate).getTime();
          }
          return false;
        }
      },
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
    this.getVenueList();
    this.getList();
  },
  methods: {
    getVenueList() {
      listVenue().then(response => {
        this.venueList = response.rows || response.data;
      });
    },
    async getList() {
      this.loading = true;
      try {
        const response = await listFinancialReport(this.queryParams);
        this.reportList = response.rows;
        this.total = response.total;
        await this.getAllSummary();
      } catch (e) {
        this.reportList = [];
        this.total = 0;
        this.summarySums = {};
        this.summaryCounts = {};
      } finally {
        this.loading = false;
      }
    },
    async getAllSummary() {
      const summaryFields = [
        'depositCount',
        'depositAmount',
        'withdrawCount',
        'withdrawAmount',
        'venueInAmount',
        'venueOutAmount',
        'refundAmount',
        'betAmount',
        'validBetAmount',
        'companyWinLoss',
        'profitRate',
        'totalIncome',
        'totalExpense',
        'netAmount'
      ];
      try {
        const { rows } = await fetchAllRowsByPage(
          (query) => listFinancialReport(query),
          omitPagination(this.queryParams),
          { pageSize: 500 }
        );
        const { sums, counts } = sumNumericFields(rows, summaryFields);
        this.summarySums = sums;
        this.summaryCounts = counts;
      } catch (e) {
        this.summarySums = {};
        this.summaryCounts = {};
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.quickRange = "last7days";
      this.handleQuickRangeChange("last7days");
      this.handleQuery();
    },
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
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有财务报表数据?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return exportFinancialReport(queryParams);
      }).then(response => {
        this.download(response.msg);
      }).catch(() => {});
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        if (index === 1 || index === 2) {
          sums[index] = '';
          return;
        }

        const prop = column.property;
        if (!prop) {
          sums[index] = '';
          return;
        }

        const sum = Number(this.summarySums[prop]);
        if (!Number.isFinite(sum)) {
          sums[index] = '';
          return;
        }

        if (prop === 'profitRate') {
          const count = Number(this.summaryCounts[prop] || 0);
          const avg = count > 0 ? sum / count : 0;
          sums[index] = avg ? avg.toFixed(2) + '%' : '0%';
        } else {
          sums[index] = this.formatCurrency(sum);
        }
      });
      return sums;
    },
    formatCurrency(value) {
      if (value === null || value === undefined) return '0.00';
      const num = parseFloat(value);
      if (isNaN(num)) return '0.00';
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    getWinLossClass(amount) {
      if (amount > 0) return 'profit';
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
.profit {
  color: #f56c6c;
  font-weight: bold;
}
.loss {
  color: #67c23a;
  font-weight: bold;
}
</style>
