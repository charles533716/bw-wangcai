<template>
  <div class="app-container red-packet-page">
    <div class="ledger-tabs">
      <button
        type="button"
        class="ledger-tab"
        :class="{ 'ledger-tab--active': activeLedgerTab === 'redPacket' }"
        @click="switchLedgerTab('redPacket')"
      >
        <i class="el-icon-present"></i>
        红包发放记录
      </button>
      <button
        type="button"
        class="ledger-tab ledger-tab--cash"
        :class="{ 'ledger-tab--active': activeLedgerTab === 'activityCash' }"
        @click="switchLedgerTab('activityCash')"
      >
        <i class="el-icon-present"></i>
        彩金发放记录
      </button>
    </div>

    <div class="toolbar">
      <div class="toolbar__title">
        <span>{{ pageTitle }}</span>
        <small>{{ pageSubtitle }}</small>
      </div>
      <div class="toolbar__actions">
        <el-button icon="el-icon-refresh" size="small" @click="refreshPage">刷新</el-button>
        <el-button
          v-if="!isActivityCashTab"
          type="primary"
          size="small"
          icon="el-icon-present"
          v-hasPermi="['funds:redpacket:add']"
          @click="openRedPacketDialog"
        >发放红包</el-button>
        <el-button
          size="small"
          icon="el-icon-download"
          :loading="exportLoading"
          v-hasPermi="['funds:redpacket:export']"
          @click="handleExport"
        >导出</el-button>
      </div>
    </div>

    <section class="summary-grid">
      <div class="summary-card">
        <span class="summary-card__label">{{ summaryLabels.headquarters }}</span>
        <strong>{{ summaryText(summary.headquarters, 'packetCount') }}</strong>
        <small>{{ money(summaryValue(summary.headquarters, 'totalAmount')) }} CNY</small>
      </div>
      <div class="summary-card">
        <span class="summary-card__label">{{ summaryLabels.siteAdmin }}</span>
        <strong>{{ summaryText(summary.siteAdmin, 'packetCount') }}</strong>
        <small>{{ money(summaryValue(summary.siteAdmin, 'totalAmount')) }} CNY</small>
      </div>
      <div class="summary-card">
        <span class="summary-card__label">{{ summaryLabels.agent }}</span>
        <strong>{{ summaryText(summary.agent, 'packetCount') }}</strong>
        <small>{{ money(summaryValue(summary.agent, 'totalAmount')) }} CNY</small>
      </div>
    </section>

    <section class="record-panel">
      <el-form :inline="true" size="small" :model="queryParams" class="filter-form">
        <el-form-item>
          <el-input
            v-model.trim="queryParams.keyword"
            clearable
            prefix-icon="el-icon-search"
            :placeholder="isActivityCashTab ? '编号/会员/站点/操作人' : '编号/会员/主体'"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.siteCode" filterable clearable placeholder="所属站点" class="site-select">
            <el-option v-for="item in siteOptions" :key="item.siteCode" :label="siteLabel(item)" :value="item.siteCode" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.senderType" clearable placeholder="发放主体" class="type-select">
            <el-option label="总站" value="HEADQUARTERS" />
            <el-option label="站点管理员" value="SITE_ADMIN" />
            <el-option label="代理" value="AGENT" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isActivityCashTab">
          <el-select v-model="queryParams.bonusType" clearable placeholder="彩金类型" class="type-select">
            <el-option label="全部彩金类型" value="" />
            <el-option label="活动彩金" :value="31" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.claimStatus" clearable placeholder="领取状态" class="status-select">
            <el-option label="已领取" value="CLAIMED" />
            <el-option label="未领取" value="UNCLAIMED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
            class="date-range"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="records" border stripe>
        <el-table-column label="业务编号" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ businessNo(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="senderDisplayName" label="发放主体" min-width="180" show-overflow-tooltip />
        <el-table-column prop="senderTypeName" label="主体类别" min-width="110" />
        <el-table-column :label="isActivityCashTab ? '彩金类型' : '红包类型'" min-width="110">
          <template slot-scope="scope">{{ ledgerTypeName(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="targetMemberName" label="指定发放对象" min-width="130" show-overflow-tooltip />
        <el-table-column label="总额(CNY)" min-width="110" align="right">
          <template slot-scope="scope">{{ money(rowAmount(scope.row)) }}</template>
        </el-table-column>
        <el-table-column prop="turnoverMultiple" label="流水倍数" min-width="100" align="right" />
        <el-table-column prop="claimStatusName" label="当前状态" min-width="100">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.claimStatus === 'CLAIMED' ? 'success' : 'info'">
              {{ scope.row.claimStatusName || '未领取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" min-width="160" />
        <el-table-column prop="availableTime" label="可领取时间" min-width="160" />
        <el-table-column label="过期时间" min-width="160">
          <template slot-scope="scope">{{ rowExpireTime(scope.row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-view" @click="openDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="openClaims(scope.row)">领取记录</el-button>
            <el-button
              v-if="!isActivityCashTab && scope.row.status === 'SCHEDULED'"
              size="mini"
              type="text"
              icon="el-icon-video-play"
              v-hasPermi="['funds:redpacket:edit']"
              @click="activateNow(scope.row)"
            >立即生效</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </section>

    <el-dialog title="发放指定会员红包" :visible.sync="redPacketOpen" width="560px" append-to-body>
      <el-form ref="redPacketForm" :model="redPacketForm" :rules="redPacketRules" label-width="116px">
        <el-form-item label="所属站点" prop="siteCode">
          <el-select v-model="redPacketForm.siteCode" filterable clearable placeholder="请选择站点" @change="handleRedPacketSiteChange">
            <el-option v-for="item in siteOptions" :key="item.siteCode" :label="siteLabel(item)" :value="item.siteCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="指定会员" prop="targetMember">
          <el-select
            v-model="redPacketForm.targetMember"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入会员名或ID"
            :remote-method="remoteMemberSearch"
            :loading="memberLoading"
          >
            <el-option v-for="item in memberOptions" :key="item.targetId" :label="memberLabel(item)" :value="String(item.targetId)" />
          </el-select>
        </el-form-item>
        <el-form-item label="红包金额" prop="amount">
          <el-input-number v-model="redPacketForm.amount" :min="0.01" :precision="2" :step="10" controls-position="right" />
        </el-form-item>
        <el-form-item label="流水倍数" prop="turnoverMultiple">
          <el-input-number v-model="redPacketForm.turnoverMultiple" :min="0" :precision="2" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="redPacketForm.availableTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="留空为立即生效" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker v-model="redPacketForm.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择过期时间" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="redPacketForm.remark" type="textarea" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="redPacketOpen = false">取消</el-button>
        <el-button type="primary" :loading="redPacketLoading" @click="submitRedPacket">确定发放</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="isActivityCashTab ? '彩金详情' : '红包详情'" :visible.sync="detailOpen" width="560px" append-to-body>
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="业务编号">{{ businessNo(detail) || '--' }}</el-descriptions-item>
        <el-descriptions-item label="发放主体">{{ detail.senderDisplayName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="指定会员">{{ detail.targetMemberName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="总额">{{ money(rowAmount(detail)) }} CNY</el-descriptions-item>
        <el-descriptions-item label="流水倍数">{{ detail.turnoverMultiple || 0 }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">{{ detail.claimStatusName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="可领取时间">{{ detail.availableTime || '--' }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ rowExpireTime(detail) || '--' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog title="领取记录" :visible.sync="claimsOpen" width="680px" append-to-body>
      <el-table v-loading="claimsLoading" :data="claims" border stripe>
        <el-table-column prop="memberName" label="会员" min-width="130" />
        <el-table-column prop="amount" label="领取金额(CNY)" min-width="130" align="right">
          <template slot-scope="scope">{{ money(scope.row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template>已领取</template>
        </el-table-column>
        <el-table-column prop="claimTime" label="领取时间" min-width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getActivityCashRecord, getActivityCashSummary, listActivityCashClaims, listActivityCashRecords } from '@/api/funds/activityCashRecord'
import { activateRedPacket, createRedPacket, getRedPacket, getRedPacketSummary, listRedPacketClaims, listRedPacketMembers, listRedPackets } from '@/api/funds/redPacket'
import { listSiteOptions } from '@/api/site/site'

function defaultQuery() {
  return {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    siteCode: '',
    senderType: '',
    claimStatus: '',
    bonusType: ''
  }
}

function defaultRedPacketForm() {
  return {
    siteCode: '',
    targetMember: '',
    amount: undefined,
    turnoverMultiple: 1,
    availableTime: '',
    expireTime: '',
    remark: ''
  }
}

export default {
  name: 'FundsRedPacketRecord',
  data() {
    return {
      loading: false,
      exportLoading: false,
      redPacketLoading: false,
      memberLoading: false,
      claimsLoading: false,
      redPacketOpen: false,
      detailOpen: false,
      claimsOpen: false,
      activeLedgerTab: 'redPacket',
      queryParams: defaultQuery(),
      dateRange: [],
      records: [],
      total: 0,
      siteOptions: [],
      memberOptions: [],
      claims: [],
      detail: {},
      redPacketForm: defaultRedPacketForm(),
      summary: {
        headquarters: {},
        siteAdmin: {},
        agent: {}
      },
      redPacketRules: {
        siteCode: [{ required: true, message: '请选择站点', trigger: 'change' }],
        targetMember: [{ required: true, message: '请选择会员', trigger: 'change' }],
        amount: [{ required: true, message: '请输入红包金额', trigger: 'blur' }],
        turnoverMultiple: [{ required: true, message: '请输入流水倍数', trigger: 'blur' }],
        expireTime: [{ required: true, message: '请选择过期时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    isActivityCashTab() {
      return this.activeLedgerTab === 'activityCash'
    },
    pageTitle() {
      return this.isActivityCashTab ? '彩金发放记录' : '红包发放记录'
    },
    pageSubtitle() {
      return this.isActivityCashTab ? '活动彩金' : '指定会员红包'
    },
    summaryLabels() {
      if (this.isActivityCashTab) {
        return {
          headquarters: '总站发放彩金',
          siteAdmin: '站点管理员发放彩金',
          agent: '代理发放彩金'
        }
      }
      return {
        headquarters: '总站发放',
        siteAdmin: '站点管理员发放',
        agent: '代理发放'
      }
    }
  },
  created() {
    this.loadSites()
    this.refreshPage()
  },
  methods: {
    switchLedgerTab(tab) {
      if (this.activeLedgerTab === tab) return
      this.activeLedgerTab = tab
      this.queryParams = defaultQuery()
      this.dateRange = []
      this.records = []
      this.total = 0
      this.detail = {}
      this.claims = []
      this.refreshPage()
    },
    refreshPage() {
      this.getList()
      this.getSummary()
    },
    buildParams() {
      const params = Object.assign({}, this.queryParams)
      if (!this.isActivityCashTab || params.bonusType === '') {
        delete params.bonusType
      }
      if (this.dateRange && this.dateRange.length === 2) {
        params.beginTime = this.dateRange[0]
        params.endTime = this.dateRange[1]
      }
      return params
    },
    getList() {
      this.loading = true
      const request = this.isActivityCashTab ? listActivityCashRecords : listRedPackets
      request(this.buildParams()).then(res => {
        this.records = (res && res.rows) || []
        this.total = (res && res.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    getSummary() {
      const request = this.isActivityCashTab ? getActivityCashSummary : getRedPacketSummary
      request(this.buildParams()).then(res => {
        this.summary = Object.assign({ headquarters: {}, siteAdmin: {}, agent: {} }, (res && res.data) || {})
      })
    },
    loadSites() {
      listSiteOptions({}).then(res => {
        this.siteOptions = (res && res.data) || []
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.refreshPage()
    },
    resetQuery() {
      this.queryParams = defaultQuery()
      this.dateRange = []
      this.refreshPage()
    },
    openRedPacketDialog() {
      this.redPacketForm = defaultRedPacketForm()
      this.memberOptions = []
      this.redPacketOpen = true
      this.$nextTick(() => this.$refs.redPacketForm && this.$refs.redPacketForm.clearValidate())
    },
    handleRedPacketSiteChange() {
      this.redPacketForm.targetMember = ''
      this.memberOptions = []
    },
    remoteMemberSearch(keyword) {
      if (!this.redPacketForm.siteCode || !keyword) {
        this.memberOptions = []
        return
      }
      this.memberLoading = true
      listRedPacketMembers({
        siteCode: this.redPacketForm.siteCode,
        keyword
      }).then(res => {
        this.memberOptions = (res && res.data) || []
      }).finally(() => {
        this.memberLoading = false
      })
    },
    submitRedPacket() {
      this.$refs.redPacketForm.validate(valid => {
        if (!valid) return
        this.redPacketLoading = true
        createRedPacket(this.redPacketForm).then(() => {
          this.$message.success('红包已发放')
          this.redPacketOpen = false
          this.refreshPage()
        }).finally(() => {
          this.redPacketLoading = false
        })
      })
    },
    openDetail(row) {
      const request = this.isActivityCashTab ? getActivityCashRecord : getRedPacket
      request(row.id).then(res => {
        this.detail = (res && res.data) || {}
        this.detailOpen = true
      })
    },
    openClaims(row) {
      this.claimsOpen = true
      this.claimsLoading = true
      const request = this.isActivityCashTab ? listActivityCashClaims : listRedPacketClaims
      request(row.id).then(res => {
        this.claims = (res && res.data) || []
      }).finally(() => {
        this.claimsLoading = false
      })
    },
    activateNow(row) {
      this.$confirm('确认让该红包立即生效？', '提示', { type: 'warning' }).then(() => {
        return activateRedPacket(row.id)
      }).then(() => {
        this.$message.success('红包已生效')
        this.refreshPage()
      }).catch(() => {})
    },
    async handleExport() {
      this.exportLoading = true
      try {
        const path = this.isActivityCashTab ? 'funds/activity-cash-record/export' : 'funds/red-packet/export'
        const name = this.isActivityCashTab ? '彩金发放记录' : '红包发放记录'
        await this.download(path, this.buildParams(), `${name}_${new Date().getTime()}.xlsx`)
      } finally {
        this.exportLoading = false
      }
    },
    siteLabel(item) {
      if (!item) return '--'
      return item.label || `${item.siteName || item.siteCode}/${item.siteCode || ''}`
    },
    memberLabel(item) {
      const name = item.targetName || item.memberName || item.name || '-'
      const code = item.siteCode ? ` / ${item.siteCode}` : ''
      const id = item.targetId ? ` / ID:${item.targetId}` : ''
      return `${name}${code}${id}`
    },
    summaryValue(group, key) {
      return group && group[key] ? group[key] : 0
    },
    summaryText(group, key) {
      return `${this.summaryValue(group, key)} 个`
    },
    businessNo(row) {
      return this.isActivityCashTab ? row.activityCashNo : row.redPacketNo
    },
    ledgerTypeName(row) {
      return this.isActivityCashTab ? (row.bonusTypeName || '活动彩金') : '指定会员红包'
    },
    rowAmount(row) {
      return this.isActivityCashTab ? row.bonusAmount : row.amount
    },
    rowExpireTime(row) {
      return this.isActivityCashTab ? row.receiveDeadline : row.expireTime
    },
    money(value) {
      const num = Number(value || 0)
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style lang="scss" scoped>
.red-packet-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fb;
}

.ledger-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 14px;
  background: #eef3f8;
  border: 1px solid #dfe7f0;
  border-radius: 16px;
}

.ledger-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 136px;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  color: #63748a;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}

.ledger-tab--active {
  color: #1f4f9f;
  background: #fff;
  box-shadow: 0 8px 20px rgba(39, 80, 139, 0.12);
}

.ledger-tab--cash.ledger-tab--active {
  color: #7c3cff;
}

.toolbar,
.record-panel,
.summary-card {
  background: #fff;
  border: 1px solid #e7ebf2;
  border-radius: 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  margin-bottom: 14px;
}

.toolbar__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2d3d;
}

.toolbar__title small {
  color: #8b98aa;
}

.toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.summary-card__label {
  color: #516070;
  font-weight: 600;
}

.summary-card strong {
  font-size: 26px;
  color: #1f2d3d;
}

.summary-card small {
  color: #0f766e;
  font-weight: 600;
}

.record-panel {
  padding: 16px;
}

.filter-form {
  padding: 12px 12px 0;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.site-select {
  width: 180px;
}

.type-select,
.status-select {
  width: 130px;
}

.date-range {
  width: 360px;
}

@media (max-width: 900px) {
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .date-range {
    width: 100%;
  }
}
</style>
