<!-- agent/record.vue -->
<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="代理账号" prop="agentName">
        <el-input
          v-model="queryParams.agentName"
          placeholder="请输入代理账号"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="站点名称" prop="siteKeyword">
        <el-input
          v-model.trim="queryParams.siteKeyword"
          placeholder="请输入站点名称"
          clearable
          @keyup.enter.native="handleQuery"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="发放时间">
        <el-date-picker
          v-model="grantTimeRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          clearable
          style="width: 240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
          v-hasPermi="['agent:commission:export']"
        >导出</el-button>
        <el-button type="info" icon="el-icon-tickets" @click="advanceRecordOpen = true">代理预支记录</el-button>
      </el-form-item>
    </el-form>

    <!-- 佣金表格 -->
    <el-table
      v-loading="loading"
      :data="commissionList"
      @selection-change="handleSelectionChange"
      show-summary
      :summary-method="getSummaries"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="佣金周期" align="center" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.commissionDateStart && scope.row.commissionDateEnd">
            {{ formatDate(scope.row.commissionDateStart) }} - {{ formatDate(scope.row.commissionDateEnd) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="代理账号" align="center" prop="agentName" />
      <el-table-column label="站点名称" align="center">
        <template slot-scope="scope">
          {{ getSiteName(scope.row.siteCode) }}
        </template>
      </el-table-column>
      <el-table-column label="代理星级" align="center" prop="starLevel">
        <template slot-scope="scope">
          <span>{{ scope.row.starLevel ? scope.row.starLevel + '星' : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总输赢" align="center" prop="totalWinLoss">
        <template slot-scope="scope">
          <span :class="scope.row.totalWinLoss >= 0 ? 'profit' : 'loss'">
            {{ formatNumber(scope.row.totalWinLoss) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="月流水" align="center" prop="monthlyTurnover">
        <template slot-scope="scope">
          {{ formatNumber(scope.row.monthlyTurnover) }}
        </template>
      </el-table-column>
      <el-table-column label="首充金额" align="center" prop="firstRechargeAmount">
        <template slot-scope="scope">
          {{ formatNumber(scope.row.firstRechargeAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="留存天数" align="center" prop="retentionDays">
        <template slot-scope="scope">
          {{ scope.row.retentionDays || 0 }}天
        </template>
      </el-table-column>
      <el-table-column label="佣金金额" align="center" prop="commissionAmount">
        <template slot-scope="scope">
          <span class="commission-amount">{{ formatNumber(scope.row.commissionAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="返佣方案" align="center" prop="commissionPlanName" />
      <el-table-column label="佣金状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag type="success" size="small">已发放</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发放时间" align="center" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.grantTime">{{ parseTime(scope.row.grantTime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="发放人员" align="center" prop="grantBy" />

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <agent-advance-records-dialog :visible.sync="advanceRecordOpen" scope="master" />
  </div>
</template>

<script>
import { listCommissionBill } from "@/api/agent/bill";
import { listSite } from "@/api/site/site";
import { parseTime } from "@/utils/ruoyi";
import { fetchAllRowsByPage, omitPagination } from "@/utils/reportSummary";
import AgentAdvanceRecordsDialog from "@/components/AgentAdvanceRecordsDialog";
export default {
  name: "CommissionRecord",
  components: { AgentAdvanceRecordsDialog },
  data() {
    return {
      loading: true,
      ids: [],
      advanceRecordOpen: false,
      total: 0,
      commissionList: [],
      siteOptions: [],
      siteNameMap: {},
      grantTimeRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        agentName: null,
        siteKeyword: null,
        // 只查询已发放的佣金账单
        status: '2',
        isGranted: '1',
        params: {}
      },
      exportLoading: false,
      summaryData: {
        totalWinLoss: 0,
        monthlyTurnover: 0,
        commissionAmount: 0
      }
    };
  },
  created() {
    this.getList();
    this.getSiteOptions();
  },
  methods: {
    buildQueryParams() {
      const params = {
        ...this.queryParams,
        params: {
          ...(this.queryParams.params || {})
        }
      };
      delete params.params.grantBeginTime;
      delete params.params.grantEndTime;
      if (Array.isArray(this.grantTimeRange) && this.grantTimeRange.length === 2) {
        params.params.grantBeginTime = `${this.grantTimeRange[0]} 00:00:00`;
        params.params.grantEndTime = `${this.grantTimeRange[1]} 23:59:59`;
      }
      return params;
    },

    /** 查询已发放佣金记录列表 */
    async getList() {
      this.loading = true;
      try {
        const response = await listCommissionBill(this.buildQueryParams());
        if (response.code === 200) {
          this.commissionList = response.rows || [];
          this.total = response.total || 0;
          await this.getAllSummary();
        } else {
          this.commissionList = [];
          this.total = 0;
          this.summaryData = {
            totalWinLoss: 0,
            monthlyTurnover: 0,
            commissionAmount: 0
          };
          this.$modal.msgError(response.msg || "获取数据失败");
        }
      } catch (error) {
        console.error("获取佣金发放记录失败:", error);
        this.commissionList = [];
        this.total = 0;
        this.summaryData = {
          totalWinLoss: 0,
          monthlyTurnover: 0,
          commissionAmount: 0
        };
        this.$modal.msgError("获取数据失败");
      } finally {
        this.loading = false;
      }
    },
    async getAllSummary() {
      try {
        const { rows } = await fetchAllRowsByPage(
          (query) => listCommissionBill(query),
          omitPagination(this.buildQueryParams()),
          { pageSize: 500 }
        );
        this.summaryData = (rows || []).reduce((acc, row) => {
          acc.totalWinLoss += Number(row && row.totalWinLoss) || 0;
          acc.monthlyTurnover += Number(row && row.monthlyTurnover) || 0;
          acc.commissionAmount += Number(row && row.commissionAmount) || 0;
          return acc;
        }, {
          totalWinLoss: 0,
          monthlyTurnover: 0,
          commissionAmount: 0
        });
      } catch (e) {
        this.summaryData = {
          totalWinLoss: 0,
          monthlyTurnover: 0,
          commissionAmount: 0
        };
      }
    },

    /** 获取站点选项 */
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        if (response.code === 200) {
          this.siteOptions = response.rows || [];
          this.siteOptions.forEach(site => {
            if (site.code && site.nameZn) {
              this.siteNameMap[site.code] = site.nameZn;
            }
          });
        }
      }).catch(error => {
        console.error("获取站点列表失败:", error);
        this.siteOptions = [];
      });
    },

    /** 获取站点名称 */
    getSiteName(siteCode) {
      return this.siteNameMap[siteCode] || siteCode;
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        agentName: null,
        siteKeyword: null,
        status: '2',
        isGranted: '1',
        params: {}
      };
      this.grantTimeRange = [];
      this.handleQuery();
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
    },

    /** 导出按钮操作 */
    handleExport() {
      this.$modal.confirm('是否确认导出所有佣金发放记录数据？').then(() => {
        this.exportLoading = true;
        return this.downloadExport();
      }).then(() => {
        this.exportLoading = false;
      }).catch(error => {
        console.error("导出失败:", error);
        this.exportLoading = false;
      });
    },

    /** 下载导出文件 */
    downloadExport() {
      const queryParams = Object.assign({}, this.buildQueryParams());
      delete queryParams.pageNum;
      delete queryParams.pageSize;
      return this.download('agent/commission/bill/export', queryParams, `commission_record_${new Date().getTime()}.xlsx`);
    },

    /** 表格底部合计 */
    getSummaries(param) {
      const { columns } = param;
      const sums = [];
      const summaryMap = {
        commissionAmount: this.summaryData.commissionAmount,
        totalWinLoss: this.summaryData.totalWinLoss,
        monthlyTurnover: this.summaryData.monthlyTurnover
      };
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        }

        const property = column.property;
        if (Object.prototype.hasOwnProperty.call(summaryMap, property)) {
          sums[index] = this.formatNumber(summaryMap[property]);
        } else {
          sums[index] = '';
        }
      });
      return sums;
    },

    /** 格式化数字 */
    formatNumber(num) {
      if (num === null || num === undefined) return '0.00';
      const number = Number(num);
      if (isNaN(number)) return '0.00';
      return number.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    /** 格式化日期 */
    formatDate(date) {
      if (!date) return '';
      return parseTime(date, '{y}-{m}-{d}');
    },

    /** 解析时间 */
    parseTime(time, format) {
      return parseTime(time, format);
    }
  }
};
</script>

<style scoped>
.profit {
  color: #67c23a;
  font-weight: bold;
}
.loss {
  color: #f56c6c;
  font-weight: bold;
}
.commission-amount {
  color: #e6a23c;
  font-weight: bold;
}
.app-container {
  padding: 20px;
}
</style>
