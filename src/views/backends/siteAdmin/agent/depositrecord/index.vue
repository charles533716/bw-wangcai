<!-- 存款记录 -->
<template>
  <div class="deposit-page">
    <!-- 标题 -->
    <div class="page-title">
      <span class="title-text">存款记录</span>
    </div>

    <el-card shadow="never" class="card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <div class="left">
          <div class="field">
            <span class="label">会员账号：</span>
            <el-input
              v-model="query.memberId"
              placeholder="请输入会员账号"
              clearable
              class="w-200"
            />
          </div>

          <div class="field">
            <span class="label">会员名字：</span>
            <el-input
              v-model="query.memberName"
              placeholder="请输入会员名字"
              clearable
              class="w-200"
            />
          </div>

          <div class="field">
            <span class="label">支付方式：</span>
            <el-select v-model="query.payType" placeholder="全部" clearable class="w-200">
              <el-option
                v-for="item in payTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="field">
            <span class="label">存款时间：</span>
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

          <div class="field">
            <span class="label">状态：</span>
            <el-select v-model="query.status" placeholder="全部" clearable class="w-200">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
          <el-button class="btn" @click="handleReset">重置</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        border
        class="table"
        :header-cell-style="headerStyle"
        :summary-method="getSummaries"
        show-summary
      >
        <el-table-column label="会员账号" prop="memberId" min-width="140" align="center" />
        <el-table-column label="会员名字" prop="memberName" min-width="140" align="center" />
        <el-table-column label="记录编号" prop="code" min-width="180" align="center" />
        <el-table-column label="支付方式" prop="payType" min-width="140" align="center" />
        <el-table-column
          label="存款金额"
          prop="amount"
          min-width="140"
          align="center"
          :formatter="$formatters.formatMoney"
        />
        <el-table-column
          label="赠送金额"
          prop="giftAmount"
          min-width="140"
          align="center"
          :formatter="$formatters.formatMoney"
        />
        <el-table-column
          label="存款时间"
          prop="completeTime"
          min-width="170"
          align="center"
          :formatter="$formatters.formatDateTime"
        />
        <el-table-column label="已获取存款卡" prop="from" min-width="160" align="center" />
        <el-table-column
          label="状态"
          prop="status"
          min-width="120"
          align="center"
          :formatter="(row) => formatByOptions(row.status, statusOptions)"
        />

        <!-- 空状态 -->
        <template slot="empty">
          <div class="empty-wrap">
            <i class="el-icon-document"></i>
            <div class="empty-text">暂无数据</div>
          </div>
        </template>
      </el-table>

      <!-- 分页（需要可打开） -->
      <div class="pager" v-if="showPager">
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
import { list, total, dictListData } from '@/api/depositrecord/index';

export default {
  name: 'DepositRecord',
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      showPager: true,

      query: {
        memberId: '',
        memberName: '',
        payType: '',
        status: '',
        dateRange: [], // ['yyyy-MM-dd','yyyy-MM-dd']
        pageNum: 1,
        pageSize: 10
      },
      payTypeOptions: [],
      statusOptions: []
    };
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
    handleSearch() {
      const memberId = String(this.query.memberId || '').trim();
      if (memberId && !/^[0-9]+$/.test(memberId)) {
        this.$message.error('会员账号只能输入数字');
        return;
      }
      this.query.memberId = memberId;
      this.query.memberName = String(this.query.memberName || '').trim();
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleReset() {
      this.query.memberId = '';
      this.query.memberName = '';
      this.query.payType = '';
      this.query.status = '';
      this.query.dateRange = [];
      this.query.pageNum = 1;
      this.fetchList();
    },
    handlePageChange(page) {
      this.query.pageNum = page;
      this.fetchList();
    },
    formatByOptions(value, options) {
      if (!value && value !== 0) return '-';
      const item = options.find((o) => o.value == value);
      return item ? item.label : value;
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        if (column.property === 'amount' || column.property === 'giftAmount') {
          const pageTotal = data.reduce((total, row) => {
            const value = parseFloat(row[column.property]);
            return total + (Number.isNaN(value) ? 0 : value);
          }, 0);
          sums[index] = `U ${this.formatAmount(pageTotal)}`;
        } else {
          sums[index] = '-';
        }
      });
      return sums;
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined) return '0.00';
      const num = parseFloat(amount);
      if (Number.isNaN(num)) return '0.00';
      return num.toFixed(2);
    },

    async fetchList() {
      this.loading = true;
      try {
        dictListData({ dictType: 'pay_type' }).then((res) => {
          const list = res.rows || [];
          this.payTypeOptions = [
            { label: '全部', value: '' },
            ...list.map((item) => ({
              label: item.dictLabel,
              value: item.dictValue
            }))
          ];
        });
        dictListData({ dictType: 'record_status' }).then((res) => {
          const list = res.rows || [];
          this.statusOptions = [
            { label: '全部', value: '' },
            ...list.map((item) => ({
              label: item.dictLabel,
              value: item.dictValue
            }))
          ];
        });
        this.query = this.addDateRange(this.query, this.query.dateRange);
        Promise.all([
          list(this.query),
          total(this.query)
        ]).then(([listResponse, totalResponse]) => {
          this.list = listResponse.rows;
          this.total = Number(totalResponse.data || 0);
          this.loading = false;
        });
      } finally {
      }
    }
  }
};
</script>

<style scoped>
.deposit-page {
  padding: 16px;
  background: #fff;
}

/* 标题 */
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
.badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 卡片 */
.card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

/* 筛选区 */
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
.w-200 {
  width: 200px;
}
.w-160 {
  width: 160px;
}
.w-360 {
  width: 360px;
}
.btn {
  min-width: 80px;
}

/* 表格 */
.table {
  margin-top: 4px;
}

/* 空状态 */
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

/* 分页 */
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 0 4px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .w-360 {
    width: 300px;
  }
}
</style>
