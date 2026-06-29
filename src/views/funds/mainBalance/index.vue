<template>
  <div class="app-container main-balance-page">
    <div class="page-heading">
      <div>
        <div class="page-heading__title">总站余额</div>
        <div class="page-heading__sub">管理总站可用余额、红包发放与收支明细</div>
      </div>
      <div class="page-heading__actions">
        <el-button icon="el-icon-refresh" size="small" @click="refreshPage">刷新</el-button>
      </div>
    </div>

    <section class="main-action-grid">
      <div class="balance-hero">
        <div class="balance-hero__label">
          <i class="el-icon-wallet"></i>
          <span>总站可用余额（CNY）</span>
        </div>
        <div class="balance-hero__amount">¥{{ money(summary.balance) }}</div>
        <div class="balance-hero__footer">
          <span>发放红包从该余额扣减</span>
          <button
            type="button"
            class="balance-hero__button"
            v-hasPermi="['funds:mainBalance:recharge']"
            @click="openRechargeDialog"
          >补充额度</button>
        </div>
      </div>

      <div class="redpacket-entry">
        <div class="redpacket-entry__head">
          <span class="redpacket-entry__icon"><i class="el-icon-present"></i></span>
          <div>
            <div class="redpacket-entry__title">总站发放指定会员红包 / 活动彩金</div>
            <div class="redpacket-entry__sub">红包扣减总站余额，活动彩金作为运营费用参与佣金分摊</div>
          </div>
        </div>
        <div class="redpacket-entry__actions">
          <button
            type="button"
            class="redpacket-entry__button"
            v-hasPermi="['funds:redpacket:add']"
            @click="openRedPacketDialog"
          >
            <i class="el-icon-present"></i>
            <span>发放红包</span>
          </button>
          <button
            type="button"
            class="redpacket-entry__button redpacket-entry__button--activity"
            v-hasPermi="['funds:mainBalance:activityCash', 'funds:redpacket:add']"
            @click="openActivityCashDialog"
          >
            <i class="el-icon-money"></i>
            <span>发活动彩金</span>
          </button>
        </div>
      </div>
    </section>

    <section class="record-panel">
      <div class="record-panel__head">
        <div class="section-title">
          <i class="el-icon-tickets"></i>
          <span>总站收支明细</span>
        </div>
        <el-button
          size="small"
          icon="el-icon-download"
          :loading="exportLoading"
          v-hasPermi="['funds:mainBalance:export']"
          @click="handleExport"
        >导出</el-button>
      </div>

      <el-form :inline="true" size="small" :model="queryParams" class="filter-form">
        <el-form-item>
          <el-input
            v-model.trim="queryParams.keyword"
            clearable
            prefix-icon="el-icon-search"
            placeholder="流水号/摘要/站点"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.transactionTypes" clearable placeholder="收支类型" class="type-select">
            <el-option v-for="item in transactionTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="queryParams.siteCode" filterable clearable placeholder="关联站点" class="site-select">
            <el-option v-for="item in siteOptions" :key="item.siteCode" :label="siteLabel(item)" :value="item.siteCode" />
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
        <el-table-column prop="transactionId" label="流水业务单号" min-width="190" show-overflow-tooltip />
        <el-table-column prop="transactionTypeName" label="收支业务类型" min-width="130" />
        <el-table-column label="交易主体/关联站点" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <div>{{ scope.row.subjectName || '--' }}</div>
            <small class="muted">{{ scope.row.relatedSiteName || '--' }}</small>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="交易摘要说明" min-width="180" show-overflow-tooltip />
        <el-table-column prop="amount" label="交易发生额(CNY)" min-width="140" align="right">
          <template slot-scope="scope">
            <span :class="amountClass(scope.row.amount)">{{ signedMoney(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceBefore" label="交易前可用余额(CNY)" min-width="170" align="right">
          <template slot-scope="scope">{{ money(scope.row.balanceBefore) }}</template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="交易后最新可用账户余额(CNY)" min-width="210" align="right">
          <template slot-scope="scope">{{ money(scope.row.balanceAfter) }}</template>
        </el-table-column>
        <el-table-column prop="createTime" label="交易入账时间" min-width="160" />
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getRecords"
      />
    </section>

    <el-dialog title="补充总站余额" :visible.sync="rechargeOpen" width="460px" append-to-body>
      <el-form ref="rechargeForm" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
        <el-form-item label="当前余额">
          <span class="balance-inline">{{ money(summary.balance) }} CNY</span>
        </el-form-item>
        <el-form-item label="补充额度" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="0.01" :precision="2" :step="100" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="rechargeForm.remark" type="textarea" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rechargeOpen = false">取消</el-button>
        <el-button type="primary" :loading="rechargeLoading" @click="submitRecharge">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="redPacketOpen"
      width="620px"
      :custom-class="redPacketDialogClass"
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div slot="title" class="redpacket-dialog__title">
        <span class="redpacket-dialog__icon"><i :class="redPacketDialogIcon"></i></span>
        <span>
          <strong>{{ redPacketDialogTitle }}</strong>
          <em>{{ redPacketDialogSubTitle }}</em>
        </span>
        <button type="button" class="redpacket-dialog__close" @click="redPacketOpen = false">
          <i class="el-icon-close"></i>
        </button>
      </div>
      <el-form ref="redPacketForm" :model="redPacketForm" :rules="redPacketRules" class="redpacket-form">
        <div v-if="redPacketMode === 'redPacket'" class="redpacket-balance">
          <span>当前可用额度：</span>
          <strong>¥{{ money(summary.balance) }}</strong>
        </div>
        <div v-else class="redpacket-balance redpacket-balance--activity">
          <span>发放说明：</span>
          <strong>不扣总站余额，领取后作为运营费用参与佣金分摊</strong>
        </div>

        <el-form-item prop="siteCode">
          <div class="redpacket-form__label">所属站点</div>
          <el-select
            v-model="redPacketForm.siteCode"
            class="redpacket-form__control"
            filterable
            clearable
            placeholder="请选择站点"
            @change="handleRedPacketSiteChange"
          >
            <el-option v-for="item in siteOptions" :key="item.siteCode" :label="siteLabel(item)" :value="item.siteCode" />
          </el-select>
        </el-form-item>

        <el-form-item prop="targetMember">
          <div class="redpacket-form__label">指定会员 ID / 账号</div>
          <el-select
            v-model="redPacketForm.targetMember"
            class="redpacket-form__control"
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

        <el-form-item prop="amount">
          <div class="redpacket-form__label">{{ amountFieldLabel }}</div>
          <el-input
            v-model.trim="redPacketForm.amount"
            class="redpacket-form__control redpacket-number-input"
            inputmode="decimal"
            maxlength="16"
            placeholder="0.00"
          >
            <template slot="suffix">元</template>
          </el-input>
        </el-form-item>

        <el-form-item prop="turnoverMultiple">
          <div class="redpacket-form__label">提现所需流水倍数（倍）</div>
          <el-input
            v-model.trim="redPacketForm.turnoverMultiple"
            class="redpacket-form__control redpacket-number-input"
            inputmode="decimal"
            maxlength="6"
            placeholder="1"
          >
            <template slot="suffix">倍</template>
          </el-input>
          <div class="redpacket-form__tip">输入 0 表示无流水限制，默认 1 倍。</div>
        </el-form-item>

        <el-form-item>
          <div class="redpacket-form__label">发放时间</div>
          <div class="redpacket-segment">
            <button
              type="button"
              :class="{ 'is-active': redPacketForm.issueMode === 'now' }"
              @click="setRedPacketIssueMode('now')"
            >立即发放</button>
            <button
              type="button"
              :class="{ 'is-active': redPacketForm.issueMode === 'scheduled' }"
              @click="setRedPacketIssueMode('scheduled')"
            >指定时间发放</button>
          </div>
          <el-date-picker
            v-if="redPacketForm.issueMode === 'scheduled'"
            v-model="redPacketForm.availableTime"
            class="redpacket-form__control redpacket-date-picker"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择发放时间"
          />
        </el-form-item>

        <el-form-item>
          <div class="redpacket-form__label">{{ validityFieldLabel }}</div>
          <div class="redpacket-segment">
            <button
              type="button"
              :class="{ 'is-active': redPacketForm.validity === '24h' }"
              @click="setRedPacketValidity('24h')"
            >24小时</button>
            <button
              type="button"
              :class="{ 'is-active': redPacketForm.validity === '7d' }"
              @click="setRedPacketValidity('7d')"
            >7天</button>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="redpacket-form__label">备注</div>
          <el-input
            v-model.trim="redPacketForm.remark"
            class="redpacket-form__control"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入备注（选填）"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="redpacket-submit"
          :loading="redPacketLoading"
          @click="submitRedPacket"
        >{{ submitButtonText }}</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { createActivityCash, getMainBalanceSummary, listMainBalanceRecords, rechargeMainBalance } from '@/api/funds/mainBalance'
import { createRedPacket, listRedPacketMembers } from '@/api/funds/redPacket'
import { listSiteOptions } from '@/api/site/site'

function defaultRecordQuery() {
  return {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    transactionTypes: '',
    siteCode: ''
  }
}

function defaultRedPacketForm() {
  return {
    siteCode: '',
    targetMember: '',
    amount: '',
    turnoverMultiple: '1',
    issueMode: 'now',
    availableTime: '',
    validity: '24h',
    remark: ''
  }
}

export default {
  name: 'FundsMainBalance',
  data() {
    return {
      loading: false,
      exportLoading: false,
      rechargeLoading: false,
      redPacketLoading: false,
      memberLoading: false,
      rechargeOpen: false,
      redPacketOpen: false,
      redPacketMode: 'redPacket',
      summary: { balance: 0, currency: 'CNY' },
      records: [],
      total: 0,
      siteOptions: [],
      memberOptions: [],
      dateRange: [],
      queryParams: defaultRecordQuery(),
      rechargeForm: { amount: undefined, remark: '' },
      redPacketForm: defaultRedPacketForm(),
      transactionTypeOptions: [
        { label: '总站余额补充', value: '30' },
        { label: '活动彩金扣款', value: '31' },
        { label: '红包发放扣款', value: '28' },
        { label: '红包过期退回', value: '29' },
        { label: '会员充值', value: '5' },
        { label: '会员提现', value: '6' },
        { label: '分润', value: '12' },
        { label: '站点月结', value: '14' }
      ],
      rechargeRules: {
        amount: [{ required: true, message: '请输入补充额度', trigger: 'blur' }]
      },
      redPacketRules: {
        siteCode: [{ required: true, message: '请选择站点', trigger: 'change' }],
        targetMember: [{ required: true, message: '请选择会员', trigger: 'change' }],
        amount: [
          { required: true, message: '请输入红包金额', trigger: 'blur' },
          { validator: this.validatePositiveAmount, trigger: 'blur' }
        ],
        turnoverMultiple: [
          { required: true, message: '请输入流水倍数', trigger: 'blur' },
          { validator: this.validateTurnoverMultiple, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadSites()
    this.refreshPage()
  },
  computed: {
    isActivityCashMode() {
      return this.redPacketMode === 'activityCash'
    },
    redPacketDialogClass() {
      return this.isActivityCashMode ? 'redpacket-dialog activity-cash-dialog' : 'redpacket-dialog'
    },
    redPacketDialogIcon() {
      return this.isActivityCashMode ? 'el-icon-money' : 'el-icon-present'
    },
    redPacketDialogTitle() {
      return this.isActivityCashMode ? '发放活动彩金' : '发放会员红包'
    },
    redPacketDialogSubTitle() {
      return this.isActivityCashMode ? 'ACTIVITY CASH BONUS' : 'DIRECT MEMBER RED PACKET'
    },
    amountFieldLabel() {
      return this.isActivityCashMode ? '单会员活动彩金金额（CNY）' : '单会员红包金额（CNY）'
    },
    validityFieldLabel() {
      return this.isActivityCashMode ? '领取有效期' : '红包有效期'
    },
    submitButtonText() {
      return this.isActivityCashMode ? '确认发放活动彩金' : '确认派发红包'
    }
  },
  methods: {
    refreshPage() {
      this.getSummary()
      this.getRecords()
    },
    async getSummary() {
      const res = await getMainBalanceSummary()
      this.summary = Object.assign({ balance: 0, currency: 'CNY' }, (res && res.data) || {})
    },
    getRecords() {
      this.loading = true
      const params = this.buildRecordParams()
      listMainBalanceRecords(params).then(res => {
        this.records = (res && res.rows) || []
        this.total = (res && res.total) || 0
      }).finally(() => {
        this.loading = false
      })
    },
    buildRecordParams() {
      const params = Object.assign({}, this.queryParams)
      if (this.dateRange && this.dateRange.length === 2) {
        params.beginTime = this.dateRange[0]
        params.endTime = this.dateRange[1]
      }
      return params
    },
    loadSites() {
      listSiteOptions({}).then(res => {
        this.siteOptions = (res && res.data) || []
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getRecords()
    },
    resetQuery() {
      this.queryParams = defaultRecordQuery()
      this.dateRange = []
      this.getRecords()
    },
    openRechargeDialog() {
      this.rechargeForm = { amount: undefined, remark: '' }
      this.rechargeOpen = true
      this.$nextTick(() => this.$refs.rechargeForm && this.$refs.rechargeForm.clearValidate())
    },
    submitRecharge() {
      this.$refs.rechargeForm.validate(valid => {
        if (!valid) return
        this.rechargeLoading = true
        rechargeMainBalance(this.rechargeForm).then(() => {
          this.$message.success('总站余额已补充')
          this.rechargeOpen = false
          this.refreshPage()
        }).finally(() => {
          this.rechargeLoading = false
        })
      })
    },
    openRedPacketDialog() {
      this.redPacketMode = 'redPacket'
      this.openBonusDialog()
    },
    openActivityCashDialog() {
      this.redPacketMode = 'activityCash'
      this.openBonusDialog()
    },
    openBonusDialog() {
      this.redPacketForm = defaultRedPacketForm()
      this.memberOptions = []
      this.redPacketOpen = true
      this.$nextTick(() => this.$refs.redPacketForm && this.$refs.redPacketForm.clearValidate())
    },
    handleRedPacketSiteChange() {
      this.redPacketForm.targetMember = ''
      this.memberOptions = []
    },
    validatePositiveAmount(rule, value, callback) {
      const num = Number(value)
      if (!Number.isFinite(num) || num <= 0) {
        callback(new Error(this.isActivityCashMode ? '活动彩金金额必须大于0' : '红包金额必须大于0'))
        return
      }
      callback()
    },
    validateTurnoverMultiple(rule, value, callback) {
      const num = Number(value)
      if (!Number.isFinite(num) || num < 0) {
        callback(new Error('流水倍数不能小于0'))
        return
      }
      callback()
    },
    setRedPacketIssueMode(mode) {
      this.redPacketForm.issueMode = mode
      if (mode === 'now') {
        this.redPacketForm.availableTime = ''
      }
    },
    setRedPacketValidity(validity) {
      this.redPacketForm.validity = validity
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
        if (this.redPacketForm.issueMode === 'scheduled' && !this.redPacketForm.availableTime) {
          this.$message.warning('请选择发放时间')
          return
        }
        const payload = this.buildRedPacketPayload()
        this.redPacketLoading = true
        const request = this.isActivityCashMode ? createActivityCash(payload) : createRedPacket(payload)
        request.then(() => {
          this.$message.success(this.isActivityCashMode ? '活动彩金已发放' : '红包已发放')
          this.redPacketOpen = false
          this.refreshPage()
        }).finally(() => {
          this.redPacketLoading = false
        })
      })
    },
    buildRedPacketPayload() {
      const form = this.redPacketForm
      const availableTime = form.issueMode === 'scheduled' ? form.availableTime : ''
      const baseDate = availableTime ? new Date(String(availableTime).replace(/-/g, '/')) : new Date()
      return {
        siteCode: form.siteCode,
        targetMember: form.targetMember,
        amount: form.amount,
        turnoverMultiple: form.turnoverMultiple,
        availableTime,
        expireTime: this.formatDateTimeParam(this.addRedPacketValidity(baseDate, form.validity)),
        remark: form.remark
      }
    },
    addRedPacketValidity(baseDate, validity) {
      const hours = validity === '7d' ? 24 * 7 : 24
      return new Date(baseDate.getTime() + hours * 60 * 60 * 1000)
    },
    formatDateTimeParam(date) {
      const pad = value => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    async handleExport() {
      this.exportLoading = true
      try {
        await this.download('funds/main-balance/records/export', this.buildRecordParams(), `总站收支明细_${new Date().getTime()}.xlsx`)
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
    money(value) {
      const num = Number(value || 0)
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    signedMoney(value) {
      const num = Number(value || 0)
      const sign = num > 0 ? '+' : ''
      return `${sign}${this.money(num)}`
    },
    amountClass(value) {
      const num = Number(value || 0)
      return num >= 0 ? 'amount-positive' : 'amount-negative'
    }
  }
}
</script>

<style lang="scss" scoped>
.main-balance-page { min-height: calc(100vh - 84px); background: #f4f7fb; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.page-heading__title { color: #172033; font-size: 22px; font-weight: 700; }
.page-heading__sub { margin-top: 4px; color: #8a98ad; font-size: 13px; }
.page-heading__actions { display: flex; justify-content: flex-end; }
.main-action-grid { display: grid; grid-template-columns: minmax(340px, 1fr) minmax(340px, 1fr); gap: 16px; margin-bottom: 16px; }
.balance-hero, .redpacket-entry, .record-panel { border: 1px solid #e5ebf3; border-radius: 8px; box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08); }
.balance-hero {
  position: relative; min-height: 192px; overflow: hidden; padding: 24px 24px 22px; color: #fff;
  background: linear-gradient(135deg, #071226 0%, #0d1b34 60%, #101b31 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 14px 32px rgba(15, 23, 42, 0.12);
}
.balance-hero__label { display: inline-flex; align-items: center; gap: 10px; color: #b8c6db; font-size: 13px; font-weight: 700; }
.balance-hero__label i { color: #5aa7ff; font-size: 16px; }
.balance-hero__amount { margin-top: 14px; font-size: 34px; line-height: 1.1; font-weight: 800; letter-spacing: 0; }
.balance-hero__footer {
  position: absolute; right: 24px; bottom: 22px; left: 24px; display: flex; align-items: center; justify-content: space-between;
  gap: 16px; color: #8798b0; font-size: 12px;
}
.balance-hero__button {
  height: 28px; padding: 0 14px; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: 8px; background: rgba(148, 163, 184, 0.12);
  color: #70b4ff; cursor: pointer; font-size: 12px; font-weight: 700;
}
.redpacket-entry {
  display: flex; flex-direction: column; justify-content: space-between; min-height: 192px; padding: 24px; background: #fff;
}
.redpacket-entry__head { display: flex; align-items: flex-start; gap: 16px; }
.redpacket-entry__icon, .redpacket-dialog__icon {
  display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 48px; height: 48px; border-radius: 8px;
  background: #fff0f3; color: #ff1f52; font-size: 22px;
}
.redpacket-entry__title { margin-top: 2px; color: #172033; font-size: 16px; font-weight: 800; }
.redpacket-entry__sub { margin-top: 8px; color: #8b98aa; font-size: 13px; line-height: 1.5; }
.redpacket-entry__actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.redpacket-entry__button, .redpacket-submit {
  width: 100%; height: 46px; border: 0; border-radius: 8px; background: #ff1f52; box-shadow: 0 12px 24px rgba(255, 31, 82, 0.2);
  color: #fff; cursor: pointer; font-weight: 800;
}
.redpacket-entry__button--activity { background: #2563ff; box-shadow: 0 12px 24px rgba(37, 99, 255, 0.2); }
.redpacket-entry__button i { margin-right: 8px; }
.record-panel { padding: 18px; background: #fff; }
.record-panel__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.section-title { display: inline-flex; align-items: center; gap: 8px; color: #253044; font-size: 16px; font-weight: 700; }
.muted { color: #8b98aa; }
.filter-form { padding: 12px 12px 0; margin-bottom: 14px; border: 1px solid #edf2f7; border-radius: 8px; background: #f8fafc; }
.type-select { width: 150px; }
.site-select { width: 180px; }
.date-range { width: 360px; }
.amount-positive, .balance-inline { color: #059669; font-weight: 700; }
.balance-inline { color: #172033; }
.amount-negative { color: #e11d48; font-weight: 700; }
.redpacket-dialog__title { position: relative; display: flex; align-items: center; gap: 14px; padding-right: 40px; }
.redpacket-dialog__title strong { display: block; color: #172033; font-size: 22px; line-height: 1.2; }
.redpacket-dialog__title em {
  display: block; margin-top: 5px; color: #8aa0bf; font-size: 12px; font-style: normal; font-weight: 800; letter-spacing: 4px;
}
.redpacket-dialog__close {
  position: absolute; top: 2px; right: 0; width: 28px; height: 28px; border: 0; background: transparent; color: #91a2bd; cursor: pointer; font-size: 22px;
}
.redpacket-form { padding-top: 2px; }
.redpacket-balance {
  display: flex; align-items: center; justify-content: space-between; min-height: 46px; margin-bottom: 18px; padding: 0 16px;
  border: 1px solid #ffb9c7; border-radius: 8px; background: #fff1f4; color: #d71945; font-weight: 800;
}
.redpacket-balance strong { font-size: 16px; }
.redpacket-balance--activity { border-color: #b8d3ff; background: #eef6ff; color: #1d4ed8; }
.redpacket-form__label { margin-bottom: 8px; color: #8aa0bf; font-size: 13px; font-weight: 800; }
.redpacket-form__control { width: 100%; }
.redpacket-form__tip { margin-top: 8px; color: #8aa0bf; font-size: 12px; }
.redpacket-segment {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; padding: 8px; border-radius: 8px; background: #edf3fb;
}
.redpacket-segment button {
  height: 44px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: #8aa0bf; cursor: pointer; font-weight: 800;
}
.redpacket-segment button.is-active {
  border-color: #2563ff; background: #fff; box-shadow: 0 6px 14px rgba(37, 99, 255, 0.1); color: #2563ff;
}
.redpacket-date-picker { margin-top: 12px; }
.redpacket-submit { margin-top: 4px; }
@media (max-width: 900px) {
  .page-heading, .record-panel__head { align-items: flex-start; flex-direction: column; }
  .main-action-grid { grid-template-columns: 1fr; }
  .date-range { width: 100%; }
}
::v-deep .redpacket-dialog { border-radius: 8px; }
::v-deep .redpacket-dialog .el-dialog__header { padding: 26px 24px 10px; }
::v-deep .redpacket-dialog .el-dialog__body { padding: 0 24px 24px; }
::v-deep .activity-cash-dialog .redpacket-dialog__icon { background: #eef6ff; color: #2563ff; }
::v-deep .activity-cash-dialog .redpacket-submit { background: #2563ff; box-shadow: 0 12px 24px rgba(37, 99, 255, 0.2); }
::v-deep .redpacket-form .el-form-item { margin-bottom: 18px; }
::v-deep .redpacket-form__control .el-input__inner {
  height: 42px; border-color: #d6e0ec; border-radius: 8px;
}
::v-deep .redpacket-number-input .el-input__inner {
  height: 60px; padding-right: 52px; background: #f8fbff; color: #172033; font-size: 22px; font-weight: 800;
}
::v-deep .redpacket-number-input .el-input__suffix {
  right: 18px; color: #b3c0d2; font-size: 16px; font-weight: 800;
}
::v-deep .redpacket-form textarea { border-color: #d6e0ec; border-radius: 8px; }
</style>
