<template>
  <div class="app-container">
    <div class="batch-bet-container">
      <!-- 顶部操作区域 -->
      <div class="header-section">
        <h2>批量下注管理</h2>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleAddPlan">新增计划</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="handleDeletePlans" :disabled="selectedPlans.length === 0">删除选中</el-button>
          <el-button type="success" icon="el-icon-video-play" @click="handleBatchBet" :disabled="selectedPlans.length === 0 || isBetting">批量下注</el-button>
          <el-button icon="el-icon-refresh" @click="refreshGameInfo">刷新游戏信息</el-button>
        </div>
      </div>

      <!-- 游戏信息显示 -->
      <div class="game-info-section">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>当前游戏信息</span>
            <div class="game-status">
              <span class="status-label">状态:</span>
              <el-tag :type="getStatusTagType(currentGame.gameStatus)" size="medium">
                {{ formatStatus(currentGame.gameStatus) }}
              </el-tag>
              <span class="countdown" v-if="currentGame.remainingSeconds > 0">
                倒计时: {{ formatCountdown(currentGame.remainingSeconds) }}
              </span>
            </div>
          </div>
          <div class="game-details">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="info-item">
                  <label>游戏轮次:</label>
                  <span>{{ currentGame.gameRound || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>游戏编号:</label>
                  <span>{{ currentGame.gameCode || '-' }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>开盘时间:</label>
                  <span>{{ formatTime(currentGame.startTime) }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="info-item">
                  <label>封盘时间:</label>
                  <span>{{ formatTime(currentGame.sealTime) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>

      <!-- 下注计划列表 -->
      <div class="plans-section">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>下注计划列表</span>
            <span class="total-count">共 {{ plans.length }} 个计划</span>
          </div>

          <el-table
            :data="plans"
            border
            @selection-change="handleSelectionChange"
            v-loading="loading"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column label="计划名称" prop="name" width="180">
              <template slot-scope="scope">
                <el-input
                  v-if="scope.row.editing"
                  v-model="scope.row.name"
                  size="small"
                  @blur="handleSavePlan(scope.row)"
                  @keyup.enter.native="handleSavePlan(scope.row)"
                ></el-input>
                <span v-else @dblclick="handleEditPlan(scope.row)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="会员ID" prop="memberIds" width="200">
              <template slot-scope="scope">
                <el-tag
                  v-for="memberId in scope.row.memberIds"
                  :key="memberId"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ memberId }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="下注号码" prop="betNumbers" width="200">
              <template slot-scope="scope">
                <el-tag
                  v-for="number in scope.row.betNumbers"
                  :key="number"
                  type="success"
                  size="small"
                  style="margin-right: 5px;"
                >
                  {{ number }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="单注金额" prop="betAmount" width="120" align="center">
              <template slot-scope="scope">
                <span>{{ formatCurrency(scope.row.betAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总下注金额" width="150" align="center">
              <template slot-scope="scope">
                <span class="total-amount">{{
                  formatCurrency(scope.row.betAmount * scope.row.memberIds.length * scope.row.betNumbers.length)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.lastResult ? (scope.row.lastResult.success ? 'success' : 'danger') : 'info'"
                  size="small"
                >
                  {{ scope.row.lastResult ? (scope.row.lastResult.success ? '成功' : '失败') : '未执行' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleEditPlan(scope.row)"
                  :disabled="isBetting"
                >
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="success"
                  @click="handleSingleBet(scope.row)"
                  :disabled="isBetting"
                >
                  下注
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDeletePlan(scope.$index)"
                  :disabled="isBetting"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 下注结果日志 -->
      <div class="results-section">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>下注结果日志</span>
            <el-button size="mini" @click="clearResults" :disabled="betResults.length === 0">清空日志</el-button>
          </div>
          <div class="results-container">
            <div
              v-for="(result, index) in betResults"
              :key="index"
              :class="['result-item', result.success ? 'success' : 'error']"
            >
              <div class="result-time">{{ formatTime(result.timestamp) }}</div>
              <div class="result-content">
                <span class="plan-name">{{ result.planName }}</span>
                <span class="member-id">会员ID: {{ result.memberId }}</span>
                <span class="bet-numbers">号码: {{ result.betNumbers.join(',') }}</span>
                <span class="result-message">{{ result.message }}</span>
              </div>
            </div>
            <div v-if="betResults.length === 0" class="empty-results">
              暂无下注结果
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑计划对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form :model="currentPlan" :rules="rules" ref="planForm" label-width="100px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="currentPlan.name" placeholder="请输入计划名称"></el-input>
        </el-form-item>

        <el-form-item label="会员ID" prop="memberIds">
          <el-tag
            v-for="memberId in currentPlan.memberIds"
            :key="memberId"
            closable
            @close="removeMemberId(memberId)"
            style="margin-right: 10px;"
          >
            {{ memberId }}
          </el-tag>
          <el-input
            v-model="newMemberId"
            placeholder="输入会员ID后按回车"
            size="small"
            style="width: 200px;"
            @keyup.enter.native="addMemberId"
          >
            <el-button slot="append" icon="el-icon-plus" @click="addMemberId"></el-button>
          </el-input>
        </el-form-item>

        <el-form-item label="下注号码" prop="betNumbers">
          <div class="number-selector">
            <el-checkbox-group v-model="currentPlan.betNumbers">
              <el-checkbox
                v-for="n in 10"
                :key="n"
                :label="n"
                :disabled="isBetting"
              >
                {{ n }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="单注金额" prop="betAmount">
          <el-input-number
            v-model="currentPlan.betAmount"
            :min="1"
            :max="10000"
            :precision="2"
            controls-position="right"
          ></el-input-number>
          <span style="margin-left: 10px;">松鼠币</span>
        </el-form-item>

        <el-form-item label="总下注金额">
          <span class="total-amount-display">
            {{ formatCurrency(calculateTotalAmount()) }}
          </span>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlan">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getLatestGameRecord, placeBet } from "@/api/game/gameApi";
import {  getUser} from "@/api/member/user";
import { getToken } from "@/utils/auth";

export default {
  name: "BatchBet",
  data() {
    return {
      // 当前游戏信息
      currentGame: {
        gameRound: null,
        gameCode: null,
        gameStatus: null,
        startTime: null,
        sealTime: null,
        remainingSeconds: 0
      },

      // 下注计划
      plans: [],
      selectedPlans: [],

      // 下注结果
      betResults: [],

      // 对话框状态
      dialogVisible: false,
      dialogTitle: "新增下注计划",
      currentPlan: {
        id: null,
        name: "",
        memberIds: [],
        betNumbers: [],
        betAmount: 10
      },
      newMemberId: "",
      editingIndex: -1,

      // 操作状态
      loading: false,
      isBetting: false,
      refreshTimer: null,

      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入计划名称', trigger: 'blur' }
        ],
        memberIds: [
          { required: true, message: '请至少添加一个会员ID', trigger: 'change' }
        ],
        betNumbers: [
          { required: true, message: '请至少选择一个下注号码', trigger: 'change' }
        ],
        betAmount: [
          { required: true, message: '请输入下注金额', trigger: 'blur' },
          { type: 'number', min: 1, message: '下注金额必须大于0', trigger: 'blur' }
        ]
      }
    };
  },

  mounted() {
    this.loadPlansFromStorage();
    this.refreshGameInfo();
    this.startAutoRefresh();
  },

  beforeDestroy() {
    this.stopAutoRefresh();
  },

  methods: {
    // 加载游戏信息
    async refreshGameInfo() {
      try {
        const response = await getLatestGameRecord();
        if (response.code === 200) {
          this.currentGame = response.data;
        }
      } catch (error) {
        console.error('获取游戏信息失败:', error);
        this.$message.error('获取游戏信息失败');
      }
    },

    // 开始自动刷新
    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.refreshGameInfo();
      }, 1000);
    },

    // 停止自动刷新
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    // 从本地存储加载计划
    loadPlansFromStorage() {
      const savedPlans = localStorage.getItem('batchBetPlans');
      if (savedPlans) {
        try {
          this.plans = JSON.parse(savedPlans);
        } catch (error) {
          console.error('加载下注计划失败:', error);
          this.plans = [];
        }
      }
    },

    // 保存计划到本地存储
    savePlansToStorage() {
      localStorage.setItem('batchBetPlans', JSON.stringify(this.plans));
    },

    // 添加会员ID
    addMemberId() {
      if (this.newMemberId && !this.currentPlan.memberIds.includes(this.newMemberId)) {
        getUser(this.newMemberId).then(response => {

          if (response.code === 200 && response.data && response.data.id != null)  {
            this.currentPlan.memberIds.push(this.newMemberId);
            this.newMemberId = "";
          }else{
             this.$message.error('会员ID不存在');
          }

        });

      }
    },

    // 移除会员ID
    removeMemberId(memberId) {
      const index = this.currentPlan.memberIds.indexOf(memberId);
      if (index > -1) {
        this.currentPlan.memberIds.splice(index, 1);
      }
    },

    // 计算总金额
    calculateTotalAmount() {
      return this.currentPlan.betAmount * this.currentPlan.betNumbers.length;
    },

    // 添加计划
    handleAddPlan() {
      this.dialogTitle = "新增下注计划";
      this.currentPlan = {
        id: Date.now(),
        name: `下注计划_${this.plans.length + 1}`,
        memberIds: [],
        betNumbers: [],
        betAmount: 10
      };
      this.editingIndex = -1;
      this.dialogVisible = true;
    },

    // 编辑计划
    handleEditPlan(plan) {
      this.dialogTitle = "编辑下注计划";
      this.currentPlan = { ...plan };
      this.editingIndex = this.plans.findIndex(p => p.id === plan.id);
      this.dialogVisible = true;
    },

    // 保存计划
    savePlan() {
      this.$refs.planForm.validate((valid) => {
        if (valid) {
          if (this.editingIndex > -1) {
            // 更新现有计划
            this.plans.splice(this.editingIndex, 1, { ...this.currentPlan });
          } else {
            // 添加新计划
            this.plans.push({ ...this.currentPlan });
          }

          this.savePlansToStorage();
          this.dialogVisible = false;
          this.$message.success('保存成功');
        }
      });
    },

    // 删除单个计划
    handleDeletePlan(index) {
      this.$confirm('确定删除这个下注计划吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.plans.splice(index, 1);
        this.savePlansToStorage();
        this.$message.success('删除成功');
      });
    },

    // 删除选中计划
    handleDeletePlans() {
      if (this.selectedPlans.length === 0) {
        this.$message.warning('请选择要删除的计划');
        return;
      }

      this.$confirm(`确定删除选中的 ${this.selectedPlans.length} 个下注计划吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        const selectedIds = this.selectedPlans.map(plan => plan.id);
        this.plans = this.plans.filter(plan => !selectedIds.includes(plan.id));
        this.selectedPlans = [];
        this.savePlansToStorage();
        this.$message.success('删除成功');
      });
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedPlans = selection;
    },

    // 单个计划下注
    async handleSingleBet(plan) {
      if (this.currentGame.gameStatus !== 1) {
        this.$message.warning('当前游戏不在开盘中，无法下注');
        return;
      }

      this.isBetting = true;
      await this.executeBetForPlan(plan);
      this.isBetting = false;
    },

    // 批量下注
    async handleBatchBet() {
      if (this.currentGame.gameStatus !== 1) {
        this.$message.warning('当前游戏不在开盘中，无法下注');
        return;
      }

      if (this.selectedPlans.length === 0) {
        this.$message.warning('请选择要执行下注的计划');
        return;
      }

      this.isBetting = true;

      for (const plan of this.selectedPlans) {
        await this.executeBetForPlan(plan);
        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.isBetting = false;
      this.$message.success('批量下注完成');
    },

    // 执行单个计划的下注
    async executeBetForPlan(plan) {
      const gameCode = this.currentGame.gameCode;
      let successCount = 0;
      let failCount = 0;

      for (const memberId of plan.memberIds) {
        try {
          const betParams = {
            memberId: memberId,
            betNumber: plan.betNumbers.join(','),
            betAmount: plan.betAmount * plan.betNumbers.length,
            gameCode: gameCode
          };

          const response = await placeBet(betParams);

          if (response.code === 200) {
            successCount++;
            this.addBetResult({
              planName: plan.name,
              memberId: memberId,
              betNumbers: plan.betNumbers,
              message: response.msg || '下注成功',
              success: true,
              timestamp: new Date()
            });
          } else {
            failCount++;
            this.addBetResult({
              planName: plan.name,
              memberId: memberId,
              betNumbers: plan.betNumbers,
              message: response.msg || '下注失败',
              success: false,
              timestamp: new Date()
            });
          }
        } catch (error) {
          failCount++;
          this.addBetResult({
            planName: plan.name,
            memberId: memberId,
            betNumbers: plan.betNumbers,
            message: `下注异常: ${error.message}`,
            success: false,
            timestamp: new Date()
          });
        }
      }

      // 更新计划状态
      plan.lastResult = {
        success: failCount === 0,
        successCount: successCount,
        failCount: failCount,
        timestamp: new Date()
      };

      this.savePlansToStorage();
    },

    // 添加下注结果
    addBetResult(result) {
      this.betResults.unshift(result);
      // 限制日志数量，最多保留100条
      if (this.betResults.length > 100) {
        this.betResults = this.betResults.slice(0, 100);
      }
    },

    // 清空结果
    clearResults() {
      this.betResults = [];
    },

    // 格式化方法
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
      if (amount === null || amount === undefined) return '0.00';
      return parseFloat(amount).toFixed(2);
    },

    formatTime(time) {
      if (!time) return '-';
      return new Date(time).toLocaleString('zh-CN');
    },

    formatCountdown(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    handleDialogClose() {
      this.dialogVisible = false;
    }
  }
};
</script>

<style scoped>
.batch-bet-container {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-section h2 {
  margin: 0;
  color: #303133;
}

.game-info-section {
  margin-bottom: 20px;
}

.game-status {
  float: right;
}

.status-label {
  margin-right: 10px;
  color: #606266;
}

.countdown {
  margin-left: 15px;
  color: #E6A23C;
  font-weight: bold;
}

.game-details {
  padding: 10px 0;
}

.info-item {
  margin: 8px 0;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  margin-right: 8px;
}

.plans-section {
  margin-bottom: 20px;
}

.total-count {
  float: right;
  color: #909399;
  font-size: 14px;
}

.total-amount {
  font-weight: bold;
  color: #E6A23C;
}

.results-section {
  margin-bottom: 20px;
}

.results-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.result-item {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 4px solid;
}

.result-item.success {
  background-color: #f0f9ff;
  border-left-color: #67C23A;
}

.result-item.error {
  background-color: #fef0f0;
  border-left-color: #F56C6C;
}

.result-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.result-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.plan-name {
  font-weight: bold;
  margin-right: 15px;
  color: #303133;
}

.member-id, .bet-numbers {
  margin-right: 15px;
  color: #606266;
}

.result-message {
  margin-left: auto;
  font-weight: 500;
}

.empty-results {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.number-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.total-amount-display {
  font-size: 16px;
  font-weight: bold;
  color: #E6A23C;
}

::v-deep .el-card__header {
  background: #f5f7fa;
  padding: 15px 20px;
}

::v-deep .el-table th {
  background: #f5f7fa;
  font-weight: bold;
}
</style>
