<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="数据统计方式" prop="statType">
        <el-select v-model="queryParams.statType" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="投注时间" value="bet" />
          <el-option label="结算时间" value="net" />
          <el-option label="注册时间" value="reg" />
          <el-option label="首存时间" value="first_deposit" />
        </el-select>
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="date"
          placeholder="选择开始日期"
          value-format="yyyy-MM-dd"
          :picker-options="startDatePickerOptions"
          size="small"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="date"
          placeholder="选择结束日期"
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

      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="未存款时长" prop="noDepositDays">
        <el-select v-model="queryParams.noDepositDays" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="7天" :value="7" />
          <el-option label="15天" :value="15" />
          <el-option label="30天" :value="30" />
          <el-option label="60天" :value="60" />
          <el-option label="90天" :value="90" />
        </el-select>
      </el-form-item>

      <el-form-item label="未投注时长" prop="noBetDays">
        <el-select v-model="queryParams.noBetDays" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="7天" :value="7" />
          <el-option label="15天" :value="15" />
          <el-option label="30天" :value="30" />
          <el-option label="60天" :value="60" />
          <el-option label="90天" :value="90" />
        </el-select>
      </el-form-item>

      <el-form-item label="未登录时长" prop="noLoginDays">
        <el-select v-model="queryParams.noLoginDays" placeholder="请选择" clearable size="small" style="width: 120px">
          <el-option label="7天" :value="7" />
          <el-option label="15天" :value="15" />
          <el-option label="30天" :value="30" />
          <el-option label="60天" :value="60" />
          <el-option label="90天" :value="90" />
        </el-select>
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
      <el-table-column label="会员账号" align="center" prop="userName" width="120" fixed />

      <el-table-column label="注册时间" align="center" prop="regTime" width="150">
        <template slot-scope="scope">
          {{ parseTime(scope.row.regTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
        </template>
      </el-table-column>

      <el-table-column label="账户余额" align="center" prop="balance" width="100">
        <template slot-scope="scope">
          {{ formatCurrency(scope.row.balance) }}
        </template>
      </el-table-column>

      <el-table-column label="存款统计" align="center" header-align="center">
        <el-table-column label="存款笔数" align="center" prop="depositCount" width="90" />
        <el-table-column label="存款额" align="center" prop="depositAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.depositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="未存款时长(天)" align="center" prop="noDepositDays" width="120" />
      </el-table-column>

      <el-table-column label="取款统计" align="center" header-align="center">
        <el-table-column label="取款额" align="center" prop="withdrawAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.withdrawAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="取款笔数" align="center" prop="withdrawCount" width="90" />
      </el-table-column>

      <el-table-column label="投注统计" align="center" header-align="center">
        <el-table-column label="有效投注额" align="center" prop="validBetAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.validBetAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="未投注时长(天)" align="center" prop="noBetDays" width="120" />
      </el-table-column>

      <el-table-column label="输赢统计" align="center" header-align="center">
        <el-table-column label="公司输赢" align="center" prop="companyWinLoss" width="100">
          <template slot-scope="scope">
            <span :class="getWinLossClass(scope.row.companyWinLoss)">
              {{ formatCurrency(scope.row.companyWinLoss) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分数调整" align="center" prop="accountAdjustment" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.accountAdjustment) }}
          </template>
        </el-table-column>
        <el-table-column label="提前结算" align="center" prop="earlySettlement" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.earlySettlement) }}
          </template>
        </el-table-column>
        <el-table-column label="公司收入" align="center" prop="companyIncome" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.companyIncome) }}
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="代理信息" align="center" header-align="center">
        <el-table-column label="代理" align="center" prop="agentCode" width="100" />
      </el-table-column>

      <el-table-column label="登录信息" align="center" header-align="center">
        <el-table-column label="未登录时长(天)" align="center" prop="noLoginDays" width="120" />
        <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.lastLoginTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="会员状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="首存信息" align="center" header-align="center">
        <el-table-column label="首存金额" align="center" prop="firstDepositAmount" width="100">
          <template slot-scope="scope">
            {{ formatCurrency(scope.row.firstDepositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="首存时间" align="center" prop="firstDepositTime" width="150">
          <template slot-scope="scope">
            {{ parseTime(scope.row.firstDepositTime, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="首投金额" align="center" prop="firstBetAmount" width="100">
        <template slot-scope="scope">
          {{ formatCurrency(scope.row.firstBetAmount) }}
        </template>
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
import { listMemberReport, exportMemberReport } from "@/api/report/member";
import { parseTime } from "@/utils/ruoyi";
import { fetchAllRowsByPage, omitPagination, sumNumericFields } from "@/utils/reportSummary";

export default {
  name: "MemberReport",
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      reportList: [],
      summarySums: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        statType: "bet",
        startDate: null,
        endDate: null,
        quickRange: "last7days",
        userName: null,
        noDepositDays: null,
        noBetDays: null,
        noLoginDays: null
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
    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true;
      try {
        const response = await listMemberReport(this.queryParams);
        this.reportList = response.rows;
        this.total = response.total;
        await this.getAllSummary();
      } catch (e) {
        this.reportList = [];
        this.total = 0;
        this.summarySums = {};
      } finally {
        this.loading = false;
      }
    },
    async getAllSummary() {
      const summaryFields = [
        'balance',
        'depositCount',
        'depositAmount',
        'noDepositDays',
        'withdrawAmount',
        'withdrawCount',
        'validBetAmount',
        'noBetDays',
        'companyWinLoss',
        'accountAdjustment',
        'earlySettlement',
        'companyIncome',
        'noLoginDays',
        'firstDepositAmount',
        'firstBetAmount'
      ];
      try {
        const { rows } = await fetchAllRowsByPage(
          (query) => listMemberReport(query),
          omitPagination(this.queryParams),
          { pageSize: 500 }
        );
        const { sums } = sumNumericFields(rows, summaryFields);
        this.summarySums = sums;
      } catch (e) {
        this.summarySums = {};
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
      this.$confirm('是否确认导出所有会员报表数据?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return exportMemberReport(queryParams);
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

        const prop = column.property;
        if (!prop) {
          sums[index] = 'N/A';
          return;
        }
        const sum = Number(this.summarySums[prop]);
        if (Number.isFinite(sum)) {
          sums[index] = this.formatCurrency(sum);
        } else {
          sums[index] = 'N/A';
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
.win {
  color: #f56c6c;
  font-weight: bold;
}
.loss {
  color: #67c23a;
  font-weight: bold;
}
</style>
