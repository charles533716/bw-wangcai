<!-- 财务报表 -->
<template>
  <div class="finance-page">
    <!-- 标题 -->
    <div class="page-title">
      <span class="title-text">个人财务</span>
    </div>

    <!-- 查询区 -->
    <div class="filter-bar">
      <div class="left">
        <span class="label">统计时间：</span>
        <el-date-picker
          v-model="query.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          class="date-range"
          clearable
        />
        <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
        <el-button class="btn" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 卡片区：第一行 5 个 -->
    <div class="cards-row row-5">
      <div
        v-for="(it, idx) in cardsTop"
        :key="'top-' + idx"
        class="stat-card"
        @click="handleCardClick(it)"
      >
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>

        <div class="card-mid">
          <div class="k">{{ it.label }}</div>
          <div class="v">CNY {{ it.value }}</div>
        </div>

        <div class="card-right">
          <span class="go-btn" title="查看明细">
            <i class="el-icon-arrow-right"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- 卡片区：第二行 5 个（含有效投注） -->
    <div class="cards-row row-5">
      <div
        v-for="(it, idx) in cardsBottom"
        :key="'bot-' + idx"
        class="stat-card"
        @click="handleCardClick(it)"
      >
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>

        <div class="card-mid">
          <div class="k">{{ it.label }}</div>
          <div class="v">CNY {{ it.value }}</div>
        </div>

        <div class="card-right">
          <span class="go-btn" title="查看明细">
            <i class="el-icon-arrow-right"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tip">
      <i class="el-icon-info"></i>
      <span>
        总输赢、净输赢中正数表示公司盈利，负数表示公司亏损，每天数据仅做普通参考，并不做实际佣金派发标准。
      </span>
    </div>
  </div>
</template>

<script>
import { getFinanceReportData } from "@/api/agent/financereport"

export default {
  name: "PersonalFinance",
  data() {
    return {
      query: {
        dateRange: [] // ['yyyy-MM-dd','yyyy-MM-dd']
      },
      // 第一行 5 个
      cardsTop: [
        { key: "actualDeposit", label: "存款", value: "0.00" },
        { key: "withdraw", label: "提款", value: "0.00" },
        { key: "totalWinLose", label: "总输赢", value: "0.00" },
        { key: "netWinLose", label: "净输赢", value: "0.00" },
        { key: "bonus", label: "红利", value: "0.00" }
      ],
      // 第二行 5 个（补上“有效投注”）
      cardsBottom: [
        { key: "rebate", label: "返水", value: "0.00" },
        { key: "venueFee", label: "场馆费", value: "0.00" },
        { key: "feeAmount", label: "存提手续费", value: "0.00" },
        { key: "accountAdjust", label: "账户调整", value: "0.00" },
        { key: "validBetAmount", label: "有效投注", value: "0.00" }
      ]
    };
  },
  created() {
    this.handleSearch();
  },
  methods: {
    handleSearch() {
      // ===== 取得数据接口 =====
      const [startDate, endDate] = this.query.dateRange || [];

      const params = {
          agentId: this.$store.getters.id,
          agentName: this.$store.getters.userName,
          startDate,
          endDate,
        };

      getFinanceReportData(params).then(response => {
        console.log("获取帐变明细:", response);
        if (response.code === 200) {
          const data = response.data || {};
          this.cardsTop = this.cardsTop.map(item => ({
            ...item,
            value: this.formatAmount(data[item.key])
          }));
          this.cardsBottom = this.cardsBottom.map(item => ({
            ...item,
            value: this.formatAmount(data[item.key])
          }));
        } else {
          console.error("获取帐变明细失败:", error);  
        }
        this.loading = false
      }).catch(error => {
        console.error("获取帐变明细失败:", error);
        this.loading = false;
      });

      console.log("search:", this.query.dateRange);
    },
    handleReset() {
      this.query.dateRange = [];
    },
    handleCardClick(item) {
      // TODO: 跳转对应明细页
      console.log("click card:", item);
    },
    formatAmount(val) {
      if (val === null || val === undefined) return "0.00";
      return Number(val).toFixed(2);
    }
  }
};
</script>

<style scoped>
.finance-page {
  padding: 16px;
  background: #fff;
}

/* 标题 */
.page-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
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

/* 查询区 */
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}
.filter-bar .left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label {
  font-size: 13px;
  color: #333;
}
.date-range {
  width: 360px;
}
.btn {
  min-width: 80px;
}

/* 卡片行 */
.cards-row {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

/* 每行 5 个 */
.row-5 {
  grid-template-columns: repeat(5, 1fr);
}

.stat-card {
  border: 1px solid #eef0f3;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  padding: 14px;
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.05s ease;
}
.stat-card:active {
  transform: scale(0.995);
}

.icon-box {
  width: 38px;
  height: 38px;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
}

.card-mid {
  flex: 1;
}
.k {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}
.v {
  font-size: 22px;
  font-weight: 800;
  color: #111;
}

/* 右上角按钮（圆圈 + 箭头） */
.card-right {
  align-self: flex-start;
}
.go-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  background: #fff;
}

/* 底部提示 */
.tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #666;
  font-size: 12px;
  margin-top: 6px;
}
.tip i {
  margin-top: 2px;
}

/* 响应式：屏幕小自动换行 */
@media (max-width: 1400px) {
  .row-5 {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>


