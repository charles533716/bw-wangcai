<template>
  <div class="app-container detail-container">
    <div class="page-header">
      <el-page-header @back="goBack" content="游戏记录详情" />
      <el-button icon="el-icon-refresh" @click="refreshData" style="margin-left: 20px;">刷新</el-button>
    </div>

    <!-- 游戏基本信息卡片 -->
      <!-- 游戏基本信息卡片 -->
         <el-card class="info-card" shadow="hover">


           <!-- 基本信息三列布局 -->
           <el-row :gutter="20">
             <el-col :span="8">
               <div class="info-group">
                 <div class="info-item">
                   <label>游戏编号：</label>
                   <span class="info-value highlight">{{ gameRecord.gameCode }}</span>
                 </div>
                 <div class="info-item">
                   <label>游戏轮数：</label>
                   <span class="info-value">{{ gameRecord.gameRound }}</span>
                 </div>
                 <div class="info-item">
                   <label>下注人数：</label>
                   <span class="info-value">{{ gameRecord.totalBetUsers || 0 }} 人</span>
                 </div>
                 <div class="info-item">
                   <label>创建时间：</label>
                   <span>{{ formatTime(gameRecord.createTime) }}</span>
                 </div>
                 <div class="info-item">
                   <label>开盘时间：</label>
                   <span>{{ formatTime(gameRecord.startTime) }}</span>
                 </div>
               </div>
             </el-col>

             <el-col :span="8">
               <div class="info-group">
                 <div class="info-item">
                   <label>开奖号码：</label>
                   <span v-if="gameRecord.lotteryNumber" class="lottery-number-big">
                     {{ gameRecord.lotteryNumber }}
<el-tag :type="getStatusTagType(gameRecord.gameStatus)" size="medium">
                     {{ formatStatus(gameRecord.gameStatus) }}
                   </el-tag>
                   </span>

                   <span v-else class="info-value">-
                   <el-tag :type="getStatusTagType(gameRecord.gameStatus)" size="medium">
                                        {{ formatStatus(gameRecord.gameStatus) }}
                                      </el-tag></span>
                 </div>
                 <div class="info-item">
                   <label>总下注金额：</label>
                   <span class="info-value amount-large">{{ formatCurrency(gameRecord.totalBetAmount) }}</span>
                 </div>
                 <div class="info-item">
                   <label>总赔付金额：</label>
                   <span class="info-value amount-large">{{ formatCurrency(gameRecord.totalPayoutAmount) }}</span>
                 </div>
                 <div class="info-item">
                   <label>封盘时间：</label>
                   <span>{{ formatTime(gameRecord.sealTime) }}</span>
                 </div>
                 <div class="info-item">
                   <label>结束时间：</label>
                   <span>{{ formatTime(gameRecord.endTime) }}</span>
                 </div>
               </div>
             </el-col>

             <el-col :span="8">
               <div class="info-group">
                 <div class="info-item">
                   <label>总盈利金额：</label>
                   <span :class="['info-value', 'amount-large', getProfitClass(gameRecord.totalProfitAmount)]">
                     {{ formatCurrency(gameRecord.totalProfitAmount) }}
                   </span>
                 </div>
                 <div class="info-item">
                   <label>平台收益率：</label>
                   <span class="info-value rate-highlight">{{ formatPercentage(gameRecord.platformYieldRate) }}</span>
                 </div>
                 <div class="info-item">
                   <label>推荐奖励：</label>
                   <span class="info-value">{{ formatCurrency(gameRecord.referralReward) }}</span>
                 </div>
                 <div class="info-item">
                   <label>游戏时长：</label>
                   <span>{{ gameRecord.gameDuration }} 秒</span>
                 </div>
               </div>
             </el-col>
           </el-row>
         </el-card>
    <!-- 收益率统计卡片 -->
    <el-card class="yield-card" shadow="hover" v-loading="yieldsLoading">
      <div slot="header" class="card-header">
        <span class="header-title"><i class="el-icon-data-analysis"></i> 各号码收益率统计</span>
        <span class="total-text">总计 {{ yields.length }} 个号码</span>
      </div>

      <el-table :data="yields" border stripe style="width: 100%">
        <el-table-column label="下注号码" align="center" width="100" fixed>
          <template slot-scope="scope">
            <span class="bet-number">{{ scope.row.betNumber }}</span>
          </template>
        </el-table-column>

        <el-table-column label="赔率" align="center" width="80">
          <template slot-scope="scope">
            <span class="odds-value">{{ scope.row.numberOdds }}x</span>
          </template>
        </el-table-column>

        <el-table-column label="下注总额" align="center" width="120">
          <template slot-scope="scope">
            <span class="amount-text">{{ formatCurrency(scope.row.betTotalAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="下注人次" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.totalUsers || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="赔付金额" align="center" width="120">
          <template slot-scope="scope">
            <span class="amount-text">{{ formatCurrency(scope.row.payoutAmount) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="盈利金额" align="center" width="120">
          <template slot-scope="scope">
            <span :class="['amount-text', getProfitClass(scope.row.profitAmount)]">
              {{ formatCurrency(scope.row.profitAmount) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="平台收益率" align="center" width="120">
                 <template slot-scope="scope">
                   <span :class="getRateColorClass(scope.row.platformYieldRate)">
                     {{ formatPercentage(scope.row.platformYieldRate) }}
                   </span>
                 </template>
               </el-table-column>

        <el-table-column label="是否中奖"   width="100"  >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.betNumber == gameRecord.lotteryNumber ? 'success' : 'info'"
              effect="light"
              v-if="gameRecord.lotteryNumber"
            >
              {{ scope.row.betNumber == gameRecord.lotteryNumber ? '中奖' : '未中奖' }}
            </el-tag>
            <el-tag v-else type="info" effect="light">未开奖</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getGameRecordDetail, getGameYields } from "@/api/game/record";

export default {
  name: "GameRecordDetail",
  data() {
    return {
      gameRecord: {
        id: null,
        gameCode: '',
        gameRound: 0,
        gameStatus: 0,
        totalBetAmount: 0,
        totalPayoutAmount: 0,
        totalProfitAmount: 0,
        platformYieldRate: 0,
        totalBetUsers: 0,
        referralReward: 0,
        createTime: null,
        startTime: null,
        sealTime: null,
        endTime: null,
        lotteryNumber: null,
        gameDuration: 0
      },
      yields: [],
      loading: false,
      yieldsLoading: false,
      timeSectionExpanded: false // 控制时间区域折叠状态
    };
  },
  created() {
    const recordId = this.$route.params.id;
    if (recordId) {
      this.loadGameRecord(recordId);
    }
  },
  methods: {
    loadGameRecord(id) {
      this.loading = true;
      getGameRecordDetail(id).then(response => {
        this.gameRecord = response.data;
        this.loadYields(this.gameRecord.gameCode);
      }).finally(() => {
        this.loading = false;
      });
    },

    loadYields(gameCode) {
      this.yieldsLoading = true;
      getGameYields(gameCode).then(response => {
        this.yields = response.data || [];
      }).finally(() => {
        this.yieldsLoading = false;
      });
    },

    // 刷新数据
    refreshData() {
      this.loading = true;
      this.yieldsLoading = true;
      const recordId = this.$route.params.id;
      this.loadGameRecord(recordId);
      this.$message.success('数据已刷新');
    },

    goBack() {
      this.$router.go(-1);
    },

    // 切换时间区域折叠状态
    toggleTimeSection() {
      this.timeSectionExpanded = !this.timeSectionExpanded;
    },

    formatStatus(status) {
      const statusMap = {
        0: '未开盘',
        1: '开盘中',
        2: '封盘中',
        3: '已开奖',
        4: '作废'
      };
      return statusMap[status] || '未知';
    },

    getStatusTagType(status) {
      const typeMap = {
        0: 'info',
        1: 'primary',
        2: 'warning',
        3: 'success',
        4: 'danger'
      };
      return typeMap[status] || 'info';
    },

    formatCurrency(amount) {
      if (amount === null || amount === undefined) return '$0.00';
      return '$' + parseFloat(amount).toFixed(2);
    },

    formatPercentage(rate) {
      if (rate === null || rate === undefined) return '0.00%';
      return (parseFloat(rate) * 100).toFixed(2) + '%';
    },

    // 改进的时间格式化方法
    formatTime(time) {
      if (!time) return '-';

      // 统一处理时间格式
      let timestamp;

      if (typeof time === 'number') {
        // 如果是数字，直接使用
        timestamp = time;
      } else if (typeof time === 'string') {
        // 如果是字符串，尝试转换为数字
        if (/^\d+$/.test(time)) {
          timestamp = parseInt(time);
        } else {
          // 如果是日期字符串，转换为时间戳
          timestamp = new Date(time).getTime();
        }
      } else {
        return '-';
      }

      // 处理时间戳
      const date = new Date(timestamp);

      // 检查日期是否有效
      if (isNaN(date.getTime())) return '-';

      // 返回格式化后的时间
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    },

    getProfitClass(profit) {
      const profitNum = parseFloat(profit || 0);
      return profitNum >= 0 ? 'profit-positive' : 'profit-negative';
    },
  getRateColorClass(rate) {
      const rateNum = parseFloat(rate || 0);
      return rateNum >= 0 ? 'rate-positive' : 'rate-negative';
    },
    getRateClass(rate) {
      const rateNum = parseFloat(rate || 0) * 100;
      if (rateNum > 20) return 'rate-high';
      if (rateNum > 10) return 'rate-medium';
      if (rateNum > 0) return 'rate-low';
      return 'rate-negative';
    },

    // 统计方法
    getMaxBetNumber() {
      if (this.yields.length === 0) return '-';
      const maxBet = this.yields.reduce((max, item) =>
        parseFloat(item.betTotalAmount) > parseFloat(max.betTotalAmount) ? item : max
      );
      return maxBet.betNumber;
    },

    getMaxYieldRate() {
      if (this.yields.length === 0) return '-';
      const maxRate = Math.max(...this.yields.map(item => parseFloat(item.platformYieldRate || 0) * 100));
      return maxRate.toFixed(2) + '%';
    },

    getMinYieldRate() {
      if (this.yields.length === 0) return '-';
      const minRate = Math.min(...this.yields.map(item => parseFloat(item.platformYieldRate || 0) * 100));
      return minRate.toFixed(2) + '%';
    },

    getAvgYieldRate() {
      if (this.yields.length === 0) return '-';
      const total = this.yields.reduce((sum, item) => sum + parseFloat(item.platformYieldRate || 0), 0);
      return ((total / this.yields.length) * 100).toFixed(2) + '%';
    }
  }
};
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-card, .yield-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
}
.rate-positive {
  color: #67C23A;
  font-weight: bold;
}

.rate-negative {
  color: #F56C6C;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.header-title i {
  margin-right: 8px;
  color: #409EFF;
}

.info-group {
  padding: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
}

.info-value {
  font-weight: 600;
  color: #303133;
}

.highlight {
  color: #409EFF;
  font-size: 16px;
}

.amount-large {
  font-size: 16px;
  font-weight: bold;
}

.rate-highlight {
  color: #E6A23C;
  font-weight: bold;
}

.lottery-number-big {
  font-size: 20px;
  font-weight: bold;
  color: #F56C6C;
  padding: 6px 12px;
  background: #fff;
  border: 2px solid #F56C6C;
  border-radius: 6px;
}

/* 时间区域样式 */
.time-section {
  margin-bottom: 20px;
}

.time-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.time-header:hover {
  background-color: #e4e7ed;
}

.time-header i {
  transition: transform 0.3s;
}

.time-header i.rotate {
  transform: rotate(180deg);
}

.time-info {
  padding: 10px;
}

.time-item {
  margin: 10px 0;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.time-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

/* 表格样式 */
.bet-number {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.odds-value {
  font-weight: bold;
  color: #E6A23C;
}

.amount-text {
  font-weight: 600;
}

.profit-positive {
  color: #67C23A;
}

.profit-negative {
  color: #F56C6C;
}

.rate-high {
  color: #67C23A;
  font-weight: bold;
}

.rate-medium {
  color: #E6A23C;
  font-weight: bold;
}

.rate-low {
  color: #909399;
  font-weight: bold;
}

.rate-negative {
  color: #F56C6C;
  font-weight: bold;
}

/* 统计摘要 */
.summary {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.summary-item label {
  font-weight: 500;
  color: #606266;
}

.total-text {
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-item label {
    margin-bottom: 4px;
  }

  .time-header {
    padding: 8px 12px;
  }

  .time-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-item label {
    margin-bottom: 4px;
  }
}
</style>
