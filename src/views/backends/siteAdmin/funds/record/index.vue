<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="单号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入单号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input v-model="queryParams.memberName" placeholder="请输入会员账号名称" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="备注" prop="memo">
        <el-input v-model="queryParams.memo" placeholder="请输入备注" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="交易类型" prop="transactionType">
        <el-select v-model="queryParams.transactionType" placeholder="全部" clearable style="width: 200px">
          <el-option
            v-for="dict in transactionTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="Number(dict.dictValue)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 200px">
          <el-option
            v-for="dict in transactionStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="Number(dict.dictValue)"
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
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="recordList">
      <el-table-column label="单号" prop="code" align="center" width="200"/>
      <el-table-column label="会员账号" prop="memberName" align="center" width="120"/>
      <el-table-column label="交易类型" prop="transactionType" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ formatTransactionType(scope.row.transactionType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="币种" prop="coin" align="center" width="80"/>
      <el-table-column label="金额" prop="amount" align="center" width="120">
        <template slot-scope="scope">
          <span :class="getAmountClass(scope.row.amount)">
            {{ formatAmount(scope.row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="160"/>
      <el-table-column label="备注" prop="memo" align="center" show-overflow-tooltip/>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>
 <script>
 import { listRecord, totalRecord } from "@/api/funds/record";

 function formatDate(date) {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
 }

 function getRecentSevenDaysRange() {
   const end = new Date();
   const start = new Date(end);
   start.setDate(start.getDate() - 6);
   return [formatDate(start), formatDate(end)];
 }

 export default {
   name: "MemberAccountRecord",
   data() {
     return {
       loading: false,
       recordList: [],
       total: 0,
       lastPageSize: 10,
       dateRange: getRecentSevenDaysRange(),
       transactionTypeOptions: [],
       transactionStatusOptions: [],
       queryParams: {
         pageNum: 1,
         pageSize: 10,
         code: undefined,
         memberName: undefined,
         memo: undefined,
         transactionType: undefined,
         status: undefined,
         beginTime: undefined,
         endTime: undefined
       }
     };
   },
   computed: {
     requestSiteCode() {
       const code = this.$store.getters.userSiteCode || this.$store.getters.siteCode || '';
       const normalized = String(code || '').trim();
       return normalized && normalized.toLowerCase() !== 'default' ? normalized : '';
     }
   },
   created() {
     this.loadTransactionTypeOptions();
     this.loadTransactionStatusOptions();
     this.getList(true);
   },
   methods: {
     loadTransactionTypeOptions() {
       this.getDicts("transaction_type").then(response => {
         this.transactionTypeOptions = response.data || [];
       });
     },
     loadTransactionStatusOptions() {
       this.getDicts("transaction_status").then(response => {
         this.transactionStatusOptions = response.data || [];
       });
     },
     buildQueryParams() {
       const params = {
         ...this.queryParams,
         params: {}
       };

       if (this.requestSiteCode) {
         params.siteCode = this.requestSiteCode;
       }

       if (this.dateRange && this.dateRange.length === 2) {
         params.params.beginTime = this.dateRange[0] + ' 00:00:00';
         params.params.endTime = this.dateRange[1] + ' 23:59:59';
       }

       return params;
     },
     getList(refreshTotal = false) {
       this.loading = true;
       const params = this.buildQueryParams();
       const listRequest = listRecord(params).then(response => {
         this.recordList = response.rows || [];
       });
       const requests = [listRequest];
       if (refreshTotal) {
         requests.push(totalRecord(params).then(response => {
           this.total = Number(response.data || 0);
         }));
       }
       Promise.all(requests).finally(() => {
         this.loading = false;
       });
     },
     handleQuery() {
       this.queryParams.pageNum = 1;
       this.lastPageSize = this.queryParams.pageSize;
       this.getList(true);
     },
     handlePagination({ limit } = {}) {
       const refreshTotal = limit && limit !== this.lastPageSize;
       this.lastPageSize = this.queryParams.pageSize;
       this.getList(refreshTotal);
     },
     resetQuery() {
       this.dateRange = getRecentSevenDaysRange();
       this.resetForm("queryForm");
       this.handleQuery();
     },
     formatTransactionType(type) {
       const matched = this.transactionTypeOptions.find(item => Number(item.dictValue) === Number(type));
       return matched ? matched.dictLabel : `未知类型(${type})`;
     },
     formatStatus(status) {
       const matched = this.transactionStatusOptions.find(item => Number(item.dictValue) === Number(status));
       return matched ? matched.dictLabel : `未知状态(${status})`;
     },
     formatAmount(amount) {
       if (!amount) return '-';
       const num = parseFloat(amount);
       if (num > 0) {
         return '+' + num.toFixed(2);
       } else if (num < 0) {
         return num.toFixed(2);
       } else {
         return num.toFixed(2);
       }
     },
     getAmountClass(amount) {
       if (!amount) return '';
       const num = parseFloat(amount);
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
       const successStatus = [3, 7, 10, 14, 16, 18, 21, 22, 26, 28]; // 成功状态
       const pendingStatus = [1, 4, 5, 9, 12, 15, 23, 25, 27, 31, 33]; // 处理中/待处理状态
       const failedStatus = [2, 6, 8, 11, 13, 17, 19, 20, 24, 29, 30, 32]; // 失败状态

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

.amount-positive {
  color: #67c23a;
  font-weight: bold;
}

.amount-negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>
