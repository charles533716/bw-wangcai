<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
       <el-form-item label="报表类型" prop="reportType">
              <el-radio-group v-model="queryParams.reportType">
                <el-radio label="DAY">日报</el-radio>
                <el-radio label="MONTH">月报</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="起止时间">
              <el-date-picker
                v-model="dateRange"
                :type="queryParams.reportType === 'DAY' ? 'daterange' : 'monthrange'"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions"
              ></el-date-picker>
            </el-form-item>


      <el-form-item label="币种" prop="currency">
        <el-select v-model="queryParams.currency" placeholder="请选择币种" clearable>

          <el-option label="CNY" value="CNY" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>

          <el-button type="primary" @click="handleExport" v-hasPermi="['game:report:export']">
            导出Excel
          </el-button>

      </el-form-item>
    </el-form>


    <el-table v-loading="loading" :data="reportList" style="width: 100%">
      <el-table-column label="日期" align="center" prop="dateLabel" width="120" fixed />
      <el-table-column label="注册数" align="center" prop="registerCount" width="100" />
      <el-table-column label="存款人数" align="center" prop="depositUserCount" width="100" />
      <el-table-column label="取款人数" align="center" prop="withdrawUserCount" width="100" />
      <el-table-column label="存款额" align="center" prop="depositAmount" width="120">
        <template slot-scope="scope">
          {{ formatAmount(scope.row.depositAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="取款额" align="center" prop="withdrawAmount" width="120">
        <template slot-scope="scope">
          {{ formatAmount(scope.row.withdrawAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="投注人数" align="center" prop="betUserCount" width="100" />
      <el-table-column label="有效投注额" align="center" prop="validBetAmount" width="120">
        <template slot-scope="scope">
          {{ formatAmount(scope.row.validBetAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="公司输赢" align="center" prop="companyWinLoss" width="120">
        <template slot-scope="scope">
          <span :class="getWinLossClass(scope.row.companyWinLoss)">
            {{ formatAmount(scope.row.companyWinLoss) }}
          </span>
        </template>
      </el-table-column>
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
 import { listGameReport, getGameReportTotal, exportGameReport } from "@/api/funds/report";

 export default {
   name: "GameReport",
   data() {
     return {
       loading: false,
       reportList: [],
       totalData: null,
       total: 0,
       dateRange: [],
       queryParams: {
         pageNum: 1,
         pageSize: 10,
         reportType: 'DAY',
         currency: 'CNY',
         siteCode: this.$store.getters.siteCode,
         beginTime: undefined,
         endTime: undefined
       },
       pickerOptions: {
         shortcuts: [{
           text: '最近一周',
           onClick(picker) {
             const end = new Date();
             const start = new Date();
             start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
             picker.$emit('pick', [start, end]);
           }
         }, {
           text: '最近一个月',
           onClick(picker) {
             const end = new Date();
             const start = new Date();
             start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
             picker.$emit('pick', [start, end]);
           }
         }, {
           text: '最近三个月',
           onClick(picker) {
             const end = new Date();
             const start = new Date();
             start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
             picker.$emit('pick', [start, end]);
           }
         }]
       }
     };
   },
   created() {
     // 默认查询最近7天的数据
     const end = new Date();
     const start = new Date();
     start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
     this.dateRange = [this.formatDate(start), this.formatDate(end)];
     this.getList();
     this.getTotal();
   },
   methods: {
     getList() {
       this.loading = true;

       // 设置日期参数
       if (this.dateRange && this.dateRange.length === 2) {
         this.queryParams.beginTime = this.dateRange[0] + ' 00:00:00';
         this.queryParams.endTime = this.dateRange[1] + ' 23:59:59';
       }

       listGameReport(this.queryParams).then(response => {
         this.reportList = response.rows;
         this.total = response.total;
         this.loading = false;
       });
     },

     getTotal() {
       // 设置日期参数
       if (this.dateRange && this.dateRange.length === 2) {
         this.queryParams.beginTime = this.dateRange[0] + ' 00:00:00';
         this.queryParams.endTime = this.dateRange[1] + ' 23:59:59';
       }

       getGameReportTotal(this.queryParams).then(response => {
         this.totalData = response.data;
       });
     },

     handleQuery() {
       this.queryParams.pageNum = 1;
       this.getList();
       this.getTotal();
     },

     resetQuery() {
       this.dateRange = [];
       this.resetForm("queryForm");
       // 重置后重新设置默认日期
       const end = new Date();
       const start = new Date();
       start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
       this.dateRange = [this.formatDate(start), this.formatDate(end)];
       this.handleQuery();
     },

     handleExport() {
       // 设置日期参数
       if (this.dateRange && this.dateRange.length === 2) {
         this.queryParams.beginTime = this.dateRange[0] + ' 00:00:00';
         this.queryParams.endTime = this.dateRange[1] + ' 23:59:59';
       }

       this.download('/game/report/export', this.queryParams, `游戏报表_${new Date().getTime()}.xlsx`);
     },

     formatDate(date) {
       const year = date.getFullYear();
       const month = (date.getMonth() + 1).toString().padStart(2, '0');
       const day = date.getDate().toString().padStart(2, '0');
       return `${year}-${month}-${day}`;
     },

     formatAmount(amount) {
       if (!amount) return '0.00';
       return parseFloat(amount).toFixed(2);
     },

     getWinLossClass(amount) {
       if (!amount) return '';
       const num = parseFloat(amount);
       if (num > 0) {
         return 'text-success';
       } else if (num < 0) {
         return 'text-danger';
       }
       return '';
     }
   }
 };
 </script>

<style scoped>
.total-card {
  background: #f8f9fa;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
