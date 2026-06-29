<!-- 个人佣金 -->
<template>
  <div class="commission-page">
    <!-- 标题 -->
    <div class="page-title">
      <span class="title-text">个人佣金</span>
    </div>

    <!-- 查询区 -->
    <div class="filter-bar">
      <div class="left">
        <span class="label">佣金月份:</span>
        <el-date-picker
          v-model="queryParams.month"
          type="month"
          placeholder="请选择月"
          value-format="yyyy-MM"
          clearable
          class="month-picker"
        />
        <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
        <el-button class="btn" @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 标题行 -->
    <div class="section-head">
      <div class="head-left">
        <div class="section-title">{{ monthText }}佣金</div>
        <!--<div class="sub">（发放时间：{{ publishTime }}）</div>-->
      </div>
      <el-button type="primary" plain size="mini" @click="goBillDetail">账单明细</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>
        <div class="card-mid">
          <div class="k">佣金余额</div>
          <div class="v">CNY {{ commissionDetail.commissionAmount }}</div>
        </div>
        <!--<div class="card-right">
          <span class="status-dot"></span>
          <span class="status-text">已发放</span>
        </div>-->
      </div>

      <div class="stat-card">
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>
        <div class="card-mid">
          <div class="k">佣金比例</div>
          <div class="v">{{ commissionDetail.commissionRate }}%</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>
        <div class="card-mid">
          <div class="k">活跃会员</div>
          <div class="v">{{ commissionDetail.activeMembers }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="card-left">
          <div class="icon-box">
            <i class="el-icon-picture-outline"></i>
          </div>
        </div>
        <div class="card-mid">
          <div class="k">有效新增</div>
          <div class="v">{{ commissionDetail.validNew }}</div>
        </div>
      </div>
    </div>

    <!-- 明细区域 -->
    <div class="detail-panel">
      <div class="detail-grid">
        <div class="detail-item" v-for="(it, idx) in detailItems" :key="idx">
          <div class="dk">{{ it.label }}</div>
          <div class="dv">CNY {{ it.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCommissionSummary, getGameAgentId } from "@/api/agent/commrecord";
export default {
  name: "PersonalCommission",
  data() {
    return {
      commissionDetail: {
        commissionAmount: "0.00",
        commissionRate: "0.00",
        totalWinLoss: "0.00",
        totalNetAmount: "0.00",
        previousMonthBalance: "0.00",
        netWinlossAfterAmount: "0.00",
        activeMembers: 0,
        validNew: 0,
        repairWinLoss : "0.00",
        nueFee: "0.00",
        bonus: "0.00",
        rebate: "0.00",
        accountAdjust: "0.00",
        depositWithdrawFee: "0.00",
        commissionAdjust: "0.00",
        vipExclusive: "0.00",
      },
      queryParams: {
        agentId: this.$store.getters.id,
        agentName: this.$store.getters.userName,
        month: this.getCurrentYearMonth() // yyyy-MM
      },
      publishTime: "2026-01-09 05:06:44",
      gameAgentParams: {
        agentName: this.$store.getters.userName
      },
    };
  },
  computed: {
    monthText() {
      // 优先用选择的月份，否则用示例“12月”
      if (!this.queryParams.month) return this.getCurrentMonth();//new Date().getMonth() + 1;
      const m = String(this.queryParams.month).split("-")[1];
      return `${Number(m)}月`;
    },
    detailItems() {
      const d = this.commissionDetail;

      return [
        { label: "总输赢", value: d.totalWinLoss || "0.00" },
        { label: "净输赢", value: d.totalNetAmount || "0.00" },
        { label: "补单输赢", value: d.repairWinLoss || "0.00" },
        { label: "场馆费", value: d.venueFee || "0.00" },
        { label: "红利", value: d.bonus || "0.00" },
        { label: "返水", value: d.rebate || "0.00" },
        { label: "账户调整", value: d.accountAdjust || "0.00" },

        { label: "上月结余", value: d.previousMonthBalance || "0.00" },
        { label: "冲正后净输赢", value: d.netWinlossAfterAmount || "0.00" },
        { label: "存提手续费", value: d.depositWithdrawFee || "0.00" },
        { label: "佣金调整", value: d.commissionAdjust || "0.00" },
        { label: "VIP专享", value: d.vipExclusive || "0.00" }
      ];
    }

  },
  async created() {
    this.getDetail();
  },
  methods: {
    getDetail() {
      this.loading = true;
      getCommissionSummary(this.queryParams).then(response => {
        if (response.code === 200) {
          this.commissionDetail = response.data || {};
        } else {
          this.initCommissionDetail();
        }
        this.loading = false;
      }).catch(error => {
        console.error("获取佣金记录失败:", error);
        this.initCommissionDetail();
        this.loading = false;
        //this.$modal.msgError("获取数据失败");
      });
    },
    handleSearch() {
      // TODO: 调接口拿数据
      // 示例：this.fetchData(this.query.month)
      this.getDetail();
      console.log("search month:", this.queryParams.month);
    },
    handleReset() {
      this.queryParams.month = this.getCurrentYearMonth();
      // 需要的话也可以清空数据
      this.initCommissionDetail();
    },
    goBillDetail() {
      // TODO: 跳转账单明细
      // this.$router.push({ path: '/xxx/detail', query: { month: this.query.month } })
      console.log("go bill detail");
    },
    initCommissionDetail() {
      this.commissionDetail = {
        commissionAmount: "0.00",
        commissionRate: "0.00",
        totalWinLoss: "0.00",
        totalNetAmount: "0.00",
        previousMonthBalance: "0.00",
        netWinlossAfterAmount: "0.00",
        activeMembers: 0,
        validNew: 0,
        repairWinLoss : "0.00",
        nueFee: "0.00",
        bonus: "0.00",
        rebate: "0.00",
        accountAdjust: "0.00",
        depositWithdrawFee: "0.00",
        commissionAdjust: "0.00",
        vipExclusive: "0.00",
      }
    },
    getCurrentYearMonth() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    },
    getCurrentMonth() {
      const d = new Date();
      const m = String(d.getMonth() + 1);
      return `${m}`;
    },
  }
};
</script>

<style scoped>
.commission-page {
  padding: 16px;
  background: #fff;
}

/* 标题 */
.page-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.title-text {
  font-size: 18px;
  font-weight: 600;
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
  line-height: 16px;
}

/* 查询区 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.filter-bar .left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.filter-bar .label {
  font-size: 13px;
  color: #333;
}
.month-picker {
  width: 200px;
}
.btn {
  min-width: 72px;
}

/* section head */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 14px;
}
.head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111;
}
.sub {
  font-size: 12px;
  color: #666;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.stat-card {
  border: 1px solid #eef0f3;
  border-radius: 10px;
  padding: 14px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  min-height: 78px;
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
  background: #fff;
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
  font-weight: 700;
  color: #111;
}
.card-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border: 1px solid #e7f3ea;
  background: #f3fbf6;
  border-radius: 999px;
  font-size: 12px;
  color: #1f9d55;
  white-space: nowrap;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1f9d55;
}

/* 明细区域 */
.detail-panel {
  border: 1px solid #eef0f3;
  border-radius: 10px;
  padding: 18px 16px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 22px 10px;
}
.detail-item .dk {
  font-size: 13px;
  color: #111;
  margin-bottom: 6px;
}
.detail-item .dv {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
