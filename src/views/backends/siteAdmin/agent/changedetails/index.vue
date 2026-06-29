<!-- 帐变明细 -->
<template>
  <div class="bill-page">
    <!-- 标题 -->
    <div class="page-title">
      <span class="title-text">账变明细</span>
    </div>

    <!-- 外层：模拟“内容区内部滚动”容器 -->
    <div ref="scrollBox" class="scroll-box">
      <el-card shadow="never" class="card">
        <!-- Tabs -->
        <!--<el-tabs v-model="activeTab" class="tabs" @tab-click="handleTabClick">
          <el-tab-pane label="额度钱包" name="agent" />
          <el-tab-pane label="佣金钱包" name="commission" />
        </el-tabs>-->

        <!-- 筛选区 -->
        <div class="filter-bar">
          <div class="left">
            <div class="field">
              <span class="label">会员名：</span>
              <el-input
                v-model.trim="query.memberName"
                placeholder="请输入会员名"
                clearable
                class="w-220"
                @keyup.enter.native="handleSearch"
              />
            </div>

            <div class="field">
              <span class="label">账变类型：</span>
              <el-select v-model="query.changeType" placeholder="全部" clearable class="w-220">
                <el-option
                  v-for="it in changeTypeOptions"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value"
                />
              </el-select>
            </div>

            <div class="field">
              <span class="label">账变时间：</span>
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

            <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
            <el-button class="btn" @click="handleReset">重置</el-button>
          </div>
        </div>

        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="agentpayList"
          border
          class="table"
          :header-cell-style="headerStyle"
          :summary-method="getSummaries"
          show-summary
        >
          <!--<el-table-column label="序号" type="id" width="80" align="center" /> -->
          <el-table-column label="会员账号" prop="memberId" min-width="160" align="center" />
          <el-table-column label="会员名" prop="memberName" min-width="160" align="center" />
          <!--<el-table-column label="账变类型" prop="transactionType" min-width="160" align="center" />-->
          <el-table-column
            label="账变类型"
            min-width="160"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ changeTypeMap[row.transactionType] || '-' }}
            </template>
          </el-table-column>
          
          <!--<el-table-column label="账变金额" prop="amount" min-width="180" align="center" />-->
          <el-table-column
            label="账变金额(元)"
            prop="amount"
            min-width="180"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ row.amount == null ? 0 : row.amount }}
            </template>
          </el-table-column>
          <el-table-column label="时间" prop="time" min-width="160" align="center" />
          <el-table-column label="记录编号" prop="orderNo" min-width="180" align="center" />
          
          
          <!--<el-table-column label="余额" prop="amountAfter" min-width="180" align="center" />-->
          <!--<el-table-column
            label="余额(元)"
            min-width="180"
            align="center"
          >
            <template slot-scope="{ row }">
              {{ row.amountAfter == null ? 0 : row.amountAfter }}
            </template>
          </el-table-column>-->

          <!-- 自定义空状态 -->
          <template slot="empty">
            <div class="empty-wrap">
              <i class="el-icon-document"></i>
              <div class="empty-text">暂无数据</div>
            </div>
          </template>
        </el-table>

        <!-- 分页（需要就打开 showPager） -->
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
  </div>
</template>

<script>

import { getChangeDetails } from "@/api/agent/changedetails"

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRecentSevenDaysRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return [formatDate(start), formatDate(end)];
}

function createDefaultQuery() {
  return {
    memberName: "",
    changeType: "0",
    dateRange: getRecentSevenDaysRange(),
    pageNum: 1,
    pageSize: 10
  };
}

export default {
  name: "AccountChangeDetail",
  data() {
    return {
      //activeTab: "commission", // commission | agent
      loading: true,

      agentpayList: [],
      total: 0,
      showPager: true,

      query: createDefaultQuery(),
      changeTypeOptions: [{ label: "全部", value: "0" }]
    };
  },
  created() {
    this.loadTransactionTypeOptions();
    this.fetchList();
  },
  computed: {
    changeTypeMap() {
      const map = {}
      this.changeTypeOptions.forEach(item => {
        map[item.value] = item.label
      })
      return map
    }
  },
  methods: {
    loadTransactionTypeOptions() {
      this.getDicts("transaction_type").then(response => {
        const dynamicOptions = (response.data || []).map(item => ({
          label: item.dictLabel,
          value: String(item.dictValue)
        }));
        this.changeTypeOptions = [{ label: "全部", value: "0" }].concat(dynamicOptions);
      });
    },
    headerStyle() {
      return {
        background: "#f5f7fa",
        color: "#303133",
        fontWeight: "600",
        height: "44px"
      };
    },

    // Element-UI tab click（这里做滚动效果）
    handleTabClick() {
      this.query.pageNum = 1;
      this.fetchList();
      this.$nextTick(() => this.scrollCardTop());
    },

    handleSearch() {
      this.query.pageNum = 1;
      this.fetchList();
      this.$nextTick(() => this.scrollCardTop());
    },

    handleReset() {
      this.query = createDefaultQuery();
      this.fetchList();
      this.$nextTick(() => this.scrollCardTop());
    },

    handlePageChange(page) {
      this.query.pageNum = page;
      this.fetchList();
      // 翻页也可以滚到顶部（可选）
      this.$nextTick(() => this.scrollCardTop());
    },

    scrollCardTop() {
      const box = this.$refs.scrollBox;
      if (!box) return;

      // scrollBox 是普通 div，不是 el-card，所以直接 box.scrollTo
      box.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    async fetchList() {
      this.loading = true;
      try {
        //const walletType = this.activeTab === "commission" ? 0 : 1;
        const [startDate, endDate] = this.query.dateRange || [];

        const params = {
          siteCode: this.$store.getters.siteCode, 
          agentId: this.$store.getters.id,
          agentName: this.$store.getters.userName,
          memberName: this.query.memberName,
          //walletType,             // 🔥 核心参数
          transactionType: this.query.changeType,
          startDate,
          endDate,
          pageNum: this.query.pageNum,
          pageSize: this.query.pageSize
        };

        // ===== 取得数据接口 =====
        const response = await getChangeDetails(params);
        console.log("帐变明细取得:", response);
        if (response.code === 200) {
          this.agentpayList = response.rows || [];
          this.total = response.total;
          this.showPager = true;
        } else {
          console.error("获取帐变明细失败:", response);
        }

        // const res = await api.getAccountChangeList(params);
        // this.list = res.rows;
        // this.total = res.total;
        // this.showPager = true;

        // ===== 模拟数据 =====
        //this.list = walletType === 0 ? this.mockCommission() : this.mockAgent();
      } finally {
        this.loading = false;
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
          return;
        }
        if (column.property === "amount") {
          const pageTotal = data.reduce((total, row) => {
            const value = parseFloat(row.amount);
            return total + (Number.isNaN(value) ? 0 : value);
          }, 0);
          sums[index] = this.formatAmount(pageTotal);
        } else {
          sums[index] = "-";
        }
      });
      return sums;
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined) return "0.00";
      const num = parseFloat(amount);
      if (Number.isNaN(num)) return "0.00";
      return num.toFixed(2);
    }
  }
};
</script>

<style scoped>
.bill-page {
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

/* ✅ 方案二关键：内容区内部滚动容器 */
.scroll-box {
  height: calc(100vh - 110px); /* 你可以按实际布局调这个高度 */
  overflow: auto;
  padding-right: 2px; /* 防止滚动条遮挡 */
}

/* 卡片 */
.card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

/* Tabs（接近截图下划线蓝色） */
.tabs ::v-deep .el-tabs__item.is-active {
  color: #409eff;
  font-weight: 600;
}
.tabs ::v-deep .el-tabs__active-bar {
  height: 2px;
}

/* 筛选区 */
.filter-bar {
  display: flex;
  align-items: center;
  padding: 8px 4px 14px;
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
.w-220 {
  width: 220px;
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
