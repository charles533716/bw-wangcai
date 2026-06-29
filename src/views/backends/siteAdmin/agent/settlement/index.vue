<template>
  <div class="agent-settlement-page app-container">
    <div class="page-head">
      <div>
        <div class="page-title">预支佣金</div>
        <div class="page-sub">展示本周期佣金、可预支金额、已预支金额和剩余领取次数</div>
      </div>
    </div>

    <el-row :gutter="16" class="summary-row">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card shadow="never" class="summary-card">
          <div class="card-label">{{ card.label }}</div>
          <div class="card-value" :class="card.className">{{ card.value }}</div>
          <div class="card-tip">{{ card.tip }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="operate-card">
      <div slot="header" class="section-head">
        <span>预支规则摘要与领取</span>
        <el-tag size="mini" :type="summary.canClaim ? 'success' : 'warning'">
          {{ summary.canClaim ? '可领取' : '暂不可领取' }}
        </el-tag>
      </div>

      <el-descriptions :column="3" border size="small" class="rule-desc">
        <el-descriptions-item label="当前周期">{{ summary.period }}</el-descriptions-item>
        <el-descriptions-item label="预支比例">{{ summary.config.maxRatio }}%</el-descriptions-item>
        <el-descriptions-item label="最低盈利">{{ money(summary.config.minProfitAmount) }}</el-descriptions-item>
        <el-descriptions-item label="最低剩余佣金">{{ money(summary.config.minRemainingCommission) }}</el-descriptions-item>
        <el-descriptions-item label="佣金余额">{{ money(summary.commissionBalance) }}</el-descriptions-item>
      </el-descriptions>

      <el-alert
        v-if="!summary.canClaim"
        class="claim-tip"
        :title="summary.blockedReason"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-alert
        v-else
        class="claim-tip"
        title="当前满足预支条件，可输入不超过可预支佣金的金额进行领取。"
        type="success"
        :closable="false"
        show-icon
      />

      <div class="claim-box">
        <el-input-number
          v-model="claimAmount"
          :min="0"
          :max="summary.availableAmount"
          :precision="2"
          :step="500"
          controls-position="right"
          placeholder="请输入本次预支金额"
        />
        <el-button
          type="primary"
          icon="el-icon-wallet"
          :disabled="!summary.canClaim"
          @click="handleClaim"
        >领取预支佣金</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="operate-card">
      <div slot="header" class="section-head">
        <span>佣金构成说明</span>
      </div>
      <el-table :data="commissionRows" border>
        <el-table-column label="项目" prop="name" min-width="160" />
        <el-table-column label="金额" min-width="160" align="right">
          <template slot-scope="scope">{{ money(scope.row.amount) }}</template>
        </el-table-column>
        <el-table-column label="说明" prop="desc" min-width="260" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  claimAdvanceCommission,
  formatMoney,
  getAdvanceSummary
} from '@/utils/agentAdvance'
import { DEFAULT_AGENT_CODE, DEFAULT_SITE_CODE } from '@/utils/prototypeBackend'

export default {
  name: 'AgentCommissionSettlement',
  data() {
    return {
      claimAmount: 0,
      summary: {
        config: {},
        period: '-',
        currentCommission: 0,
        availableAmount: 0,
        claimedAmount: 0,
        remainingTimes: 0,
        directCommission: 0,
        gapCommission: 0,
        commissionBalance: 0,
        canClaim: false,
        blockedReason: ''
      }
    }
  },
  computed: {
    siteCode() {
      return this.$store.getters.userSiteCode || DEFAULT_SITE_CODE
    },
    agentCode() {
      return this.$store.getters.agentCode || DEFAULT_AGENT_CODE
    },
    cards() {
      return [
        { label: '本周期佣金', value: this.money(this.summary.currentCommission), tip: '周结算后形成的当前周期佣金' },
        { label: '可预支佣金', value: this.money(this.summary.availableAmount), tip: '按总控规则计算的可领取额度', className: 'primary' },
        { label: '已预支佣金', value: this.money(this.summary.claimedAmount), tip: '本周期已成功领取的预支金额' },
        { label: '剩余预支次数', value: `${this.summary.remainingTimes} 次`, tip: '本周期还可领取的次数', className: 'success' }
      ]
    },
    commissionRows() {
      return [
        { name: '普通佣金', amount: this.summary.directCommission, desc: '代理直属会员贡献形成的佣金金额' },
        { name: '极差佣金', amount: this.summary.gapCommission, desc: '下级代理差额贡献形成的佣金金额' },
        { name: '最终待发放佣金', amount: this.summary.currentCommission - this.summary.claimedAmount, desc: '正式发放时需扣除已预支金额，避免重复发放' }
      ]
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.summary = getAdvanceSummary(this.siteCode, this.agentCode)
      this.claimAmount = this.summary.canClaim ? this.summary.availableAmount : 0
    },
    money(value) {
      return formatMoney(value)
    },
    handleClaim() {
      const result = claimAdvanceCommission(this.siteCode, this.agentCode, this.claimAmount)
      if (!result.ok) {
        this.$message.warning(result.message)
        return
      }
      this.$message.success(result.message)
      this.refresh()
    }
  }
}
</script>

<style scoped>
.agent-settlement-page {
  background: #f5f7fb;
}

.page-head,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-head {
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.page-sub,
.card-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  border-radius: 6px;
}

.card-label {
  color: #606266;
}

.card-value {
  margin-top: 12px;
  color: #303133;
  font-size: 24px;
  font-weight: 700;
}

.card-value.primary {
  color: #409eff;
}

.card-value.success {
  color: #67c23a;
}

.operate-card {
  margin-bottom: 16px;
}

.rule-desc {
  margin-bottom: 14px;
}

.claim-tip {
  margin-bottom: 14px;
}

.claim-box {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
