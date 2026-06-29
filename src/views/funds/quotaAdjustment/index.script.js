import {
  adjustQuotaAgent,
  adjustQuotaMember,
  adjustQuotaSite,
  listQuotaAgents,
  listQuotaMembers,
  listQuotaRecords,
  listQuotaSites
} from '@/api/funds/quotaAdjustment'

const MAX_ADJUST_AMOUNT = 999999.99
const DEDUCT_PRIORITY_WITHDRAWABLE_FIRST = 'WITHDRAWABLE_FIRST'
const DEDUCT_PRIORITY_LOCKED_FIRST = 'LOCKED_FIRST'

function createAdjustForm() {
  return {
    siteCode: '',
    targetId: undefined,
    amount: undefined,
    remark: '',
    deductPriority: DEDUCT_PRIORITY_WITHDRAWABLE_FIRST,
    withdrawTurnoverMultiple: 0
  }
}

export default {
  name: 'QuotaAdjustment',
  data() {
    return {
      siteOptions: [],
      agentOptions: [],
      memberOptions: [],
      siteLoading: false,
      agentLoading: false,
      memberLoading: false,
      siteSubmitting: false,
      agentSubmitting: false,
      memberSubmitting: false,
      recordLoading: false,
      exportLoading: false,
      siteForm: createAdjustForm(),
      agentForm: createAdjustForm(),
      memberForm: createAdjustForm(),
      records: [],
      recordTotal: 0,
      recordSummary: {
        increaseAmount: 0,
        decreaseAmount: 0
      },
      maxAdjustAmount: MAX_ADJUST_AMOUNT,
      recordQuery: {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        targetType: undefined
      }
    }
  },
  computed: {
    isMemberIncrease() {
      return Number(this.memberForm.amount) > 0
    },
    isMemberDecrease() {
      return Number(this.memberForm.amount) < 0
    },
    deductPriorityWithdrawableFirst() {
      return DEDUCT_PRIORITY_WITHDRAWABLE_FIRST
    },
    deductPriorityLockedFirst() {
      return DEDUCT_PRIORITY_LOCKED_FIRST
    }
  },
  watch: {
    'memberForm.amount': 'syncMemberTurnoverMultiple'
  },
  created() {
    this.remoteSiteSearch('')
    this.loadRecords()
  },
  methods: {
    remoteSiteSearch(keyword) {
      this.siteLoading = true
      listQuotaSites({ keyword }).then(response => {
        this.siteOptions = (response && response.data) || []
      }).finally(() => {
        this.siteLoading = false
      })
    },
    remoteAgentSearch(keyword) {
      this.agentLoading = true
      listQuotaAgents({
        siteCode: this.agentForm.siteCode || undefined,
        keyword
      }).then(response => {
        this.agentOptions = (response && response.data) || []
      }).finally(() => {
        this.agentLoading = false
      })
    },
    remoteMemberSearch(keyword) {
      this.memberLoading = true
      listQuotaMembers({
        siteCode: this.memberForm.siteCode || undefined,
        keyword
      }).then(response => {
        this.memberOptions = (response && response.data) || []
      }).finally(() => {
        this.memberLoading = false
      })
    },
    handleSiteTargetChange() {
      const site = this.currentSiteTarget()
      if (site && !this.siteForm.targetId) {
        this.siteForm.targetId = site.targetId
      }
    },
    handleAgentSiteChange() {
      this.agentForm.targetId = undefined
      this.agentOptions = []
    },
    handleMemberSiteChange() {
      this.memberForm.targetId = undefined
      this.memberOptions = []
    },
    handleAgentTargetChange() {
      const agent = this.currentAgentTarget()
      if (agent) {
        this.agentForm.siteCode = agent.siteCode || this.agentForm.siteCode
      }
    },
    handleMemberTargetChange() {
      const member = this.currentMemberTarget()
      if (member) {
        this.memberForm.siteCode = member.siteCode || this.memberForm.siteCode
      }
    },
    async submitSiteAdjust() {
      const target = this.currentSiteTarget()
      if (!this.validateAdjustForm(this.siteForm, target, '请选择站点')) {
        return
      }
      const preview = this.buildSitePreview(target, this.siteForm)
      if (preview.invalid) {
        this.$message.warning('减少后的站点资金池或额度不能小于 0')
        return
      }
      try {
        await this.confirmAdjust('站点额度调整确认', this.renderSiteConfirm(target, preview))
      } catch (e) {
        return
      }
      this.siteSubmitting = true
      adjustQuotaSite(this.buildPayload(this.siteForm, target, {
        targetType: 0,
        preview
      })).then(response => {
        this.$message.success('站点额度调整成功')
        this.afterAdjustSuccess(response && response.data, 'site')
      }).finally(() => {
        this.siteSubmitting = false
      })
    },
    async submitAgentAdjust() {
      const target = this.currentAgentTarget()
      if (!this.validateAdjustForm(this.agentForm, target, '请选择代理')) {
        return
      }
      const preview = this.buildAgentPreview(target, this.agentForm)
      if (preview.after < 0) {
        this.$message.warning('减少后的代理余额不能小于 0')
        return
      }
      if (preview.fundPoolAfter < 0) {
        this.$message.warning('站点资金池余额不足')
        return
      }
      try {
        await this.confirmAdjust('代理额度调整确认', this.renderAgentConfirm(target, preview))
      } catch (e) {
        return
      }
      this.agentSubmitting = true
      adjustQuotaAgent(this.buildPayload(this.agentForm, target, {
        targetType: 1,
        preview
      })).then(response => {
        this.$message.success('代理额度调整成功')
        this.afterAdjustSuccess(response && response.data, 'agent')
      }).finally(() => {
        this.agentSubmitting = false
      })
    },
    async submitMemberAdjust() {
      const target = this.currentMemberTarget()
      if (!this.validateAdjustForm(this.memberForm, target, '请选择会员')) {
        return
      }
      if (!this.validateMemberTurnoverMultiple()) {
        return
      }
      const preview = this.buildMemberPreview(target, this.memberForm)
      if (preview.balanceAfter < 0) {
        this.$message.warning('减少后的会员余额不能小于 0')
        return
      }
      try {
        await this.confirmAdjust('会员额度调整确认', this.renderMemberConfirm(target, preview))
      } catch (e) {
        return
      }
      this.memberSubmitting = true
      adjustQuotaMember(this.buildPayload(this.memberForm, target, {
        includeDeductPriority: true,
        includeMemberTurnover: true,
        targetType: 2,
        preview
      })).then(response => {
        this.$message.success('会员额度调整成功')
        this.afterAdjustSuccess(response && response.data, 'member')
      }).finally(() => {
        this.memberSubmitting = false
      })
    },
    confirmAdjust(title, html) {
      return this.$confirm(html, title, {
        confirmButtonText: '确定调整',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      })
    },
    validateAdjustForm(form, target, targetMessage) {
      if (!target) {
        this.$message.warning(targetMessage)
        return false
      }
      const amount = Number(form.amount)
      if (!Number.isFinite(amount) || amount === 0) {
        this.$message.warning('请输入非 0 的调整金额，正数为增，负数为减')
        return false
      }
      if (Math.abs(amount) > MAX_ADJUST_AMOUNT) {
        this.$message.warning('单次调整金额不能超过 999999.99')
        return false
      }
      if (!this.isMoneyPrecisionValid(amount)) {
        this.$message.warning('调整金额最多支持 2 位小数')
        return false
      }
      return true
    },
    buildPayload(form, target, options = {}) {
      const signed = this.signedValue(form)
      const payload = {
        siteCode: target.siteCode || form.siteCode,
        targetId: target.targetId,
        direction: this.directionValue(signed),
        amount: Math.abs(signed),
        remark: form.remark
      }
      if (options.includeDeductPriority && signed < 0) {
        payload.deductPriority = form.deductPriority || DEDUCT_PRIORITY_WITHDRAWABLE_FIRST
      }
      if (options.includeMemberTurnover) {
        payload.withdrawTurnoverMultiple = signed > 0 ? this.memberTurnoverMultipleValue(form) : 0
        payload.withdrawTurnoverAmount = signed > 0
          ? this.roundMoney(payload.amount * payload.withdrawTurnoverMultiple)
          : 0
      }
      if (options.targetType !== undefined) {
        Object.assign(payload, this.buildRecordPayload(target, signed, options.targetType, options.preview || {}))
      }
      return payload
    },
    buildRecordPayload(target, signed, targetType, preview) {
      const payload = {
        recordNo: `QA${Date.now()}`,
        targetType,
        targetTypeText: this.targetTypeName(targetType),
        targetName: target.targetName || target.siteName || '-',
        siteName: target.siteName || '',
        signedAmount: signed,
        balanceBefore: preview.balanceBefore !== undefined ? preview.balanceBefore : preview.before,
        balanceAfter: preview.balanceAfter !== undefined ? preview.balanceAfter : preview.after,
        operatorName: '演示管理员',
        createTime: this.formatDateTime(new Date())
      }
      if (targetType !== 2) {
        payload.fundPoolBefore = preview.fundPoolBefore
        payload.fundPoolAfter = preview.fundPoolAfter
      } else {
        payload.lockedBefore = preview.lockedBefore
        payload.lockedAfter = preview.lockedAfter
        payload.withdrawableBefore = preview.withdrawableBefore
        payload.withdrawableAfter = preview.withdrawableAfter
        payload.turnoverBefore = preview.turnoverBefore
        payload.turnoverAfter = preview.turnoverAfter
      }
      return payload
    },
    buildSitePreview(target, form) {
      const signed = this.signedValue(form)
      const fundPoolBefore = this.numberValue(target.fundPoolBalance)
      const balanceBefore = this.numberValue(target.balance)
      const fundPoolAfter = this.roundMoney(fundPoolBefore + signed)
      const balanceAfter = this.roundMoney(balanceBefore + signed)
      return {
        signed,
        fundPoolBefore,
        fundPoolAfter,
        balanceBefore,
        balanceAfter,
        invalid: fundPoolAfter < 0 || balanceAfter < 0
      }
    },
    buildBalancePreview(target, form) {
      const signed = this.signedValue(form)
      const before = this.numberValue(target.balance)
      const after = this.roundMoney(before + signed)
      return { signed, before, after }
    },
    buildAgentPreview(target, form) {
      const preview = this.buildBalancePreview(target, form)
      const fundPoolBefore = this.numberValue(target.fundPoolBalance)
      const fundPoolAfter = this.roundMoney(fundPoolBefore + preview.signed)
      return {
        ...preview,
        fundPoolBefore,
        fundPoolAfter
      }
    },
    buildMemberPreview(target, form) {
      const signed = this.signedValue(form)
      const amount = Math.abs(signed)
      const balanceBefore = this.numberValue(target.balance)
      const lockedBefore = this.numberValue(target.lockedAmount)
      const withdrawableBefore = Math.max(this.numberValue(target.withdrawableAmount), balanceBefore - lockedBefore)
      let balanceAfter = this.roundMoney(balanceBefore + signed)
      let lockedAfter = lockedBefore
      let withdrawableAfter = withdrawableBefore
      let turnoverAfter = this.numberValue(target.remainingTurnover)
      let withdrawTurnoverMultiple = 0
      let withdrawTurnoverAmount = 0
      if (signed > 0) {
        withdrawTurnoverMultiple = this.memberTurnoverMultipleValue(form)
        withdrawTurnoverAmount = this.roundMoney(amount * withdrawTurnoverMultiple)
        lockedAfter = this.roundMoney(lockedBefore + amount)
        withdrawableAfter = Math.max(this.roundMoney(balanceAfter - lockedAfter), 0)
        turnoverAfter = this.roundMoney(turnoverAfter + withdrawTurnoverAmount)
      } else {
        const deductPriority = form.deductPriority || DEDUCT_PRIORITY_WITHDRAWABLE_FIRST
        const lockedFirst = deductPriority === DEDUCT_PRIORITY_LOCKED_FIRST
        const lockedDeduct = lockedFirst
          ? Math.min(amount, lockedBefore)
          : Math.min(Math.max(amount - Math.min(amount, withdrawableBefore), 0), lockedBefore)
        const withdrawDeduct = lockedFirst
          ? Math.min(Math.max(amount - lockedDeduct, 0), withdrawableBefore)
          : Math.min(amount, withdrawableBefore)
        lockedAfter = this.roundMoney(lockedBefore - lockedDeduct)
        withdrawableAfter = this.roundMoney(Math.max(withdrawableBefore - withdrawDeduct, 0))
        if (lockedBefore > 0 && turnoverAfter > 0) {
          turnoverAfter = this.roundMoney(turnoverAfter * (lockedAfter / lockedBefore))
        }
      }
      return {
        signed,
        balanceBefore,
        balanceAfter,
        lockedBefore,
        lockedAfter,
        withdrawableBefore,
        withdrawableAfter,
        turnoverBefore: this.numberValue(target.remainingTurnover),
        turnoverAfter,
        withdrawTurnoverMultiple,
        withdrawTurnoverAmount,
        deductPriority: signed < 0 ? (form.deductPriority || DEDUCT_PRIORITY_WITHDRAWABLE_FIRST) : '',
        deductPriorityLabel: signed < 0
          ? (form.deductPriority === DEDUCT_PRIORITY_LOCKED_FIRST ? '优先扣锁定金额' : '优先扣可提现金额')
          : ''
      }
    },
    renderSiteConfirm(target, preview) {
      return this.renderConfirmRows([
        ['站点', `${target.siteName || '-'}（${target.siteCode || '-'}）`],
        ['方向/金额', this.directionLabel(preview.signed) + ' ' + this.formatMoney(Math.abs(preview.signed))],
        ['资金池', `${this.formatMoney(preview.fundPoolBefore)} → ${this.formatMoney(preview.fundPoolAfter)}`],
        ['站点额度', `${this.formatMoney(preview.balanceBefore)} → ${this.formatMoney(preview.balanceAfter)}`],
        ['备注', this.siteForm.remark || '-']
      ])
    },
    renderAgentConfirm(target, preview) {
      return this.renderConfirmRows([
        ['代理', `${target.targetName || '-'}（ID: ${target.targetId || '-'}）`],
        ['站点', `${target.siteName || '-'}（${target.siteCode || '-'}）`],
        ['上级代理', target.parentName || '-'],
        ['方向/金额', this.directionLabel(preview.signed) + ' ' + this.formatMoney(Math.abs(preview.signed))],
        ['余额', `${this.formatMoney(preview.before)} → ${this.formatMoney(preview.after)}`],
        ['站点资金池', `${this.formatMoney(preview.fundPoolBefore)} → ${this.formatMoney(preview.fundPoolAfter)}`],
        ['备注', this.agentForm.remark || '-']
      ])
    },
    renderMemberConfirm(target, preview) {
      const rows = [
        ['会员', `${target.targetName || '-'}（ID: ${target.targetId || '-'}）`],
        ['站点', `${target.siteName || '-'}（${target.siteCode || '-'}）`],
        ['方向/金额', this.directionLabel(preview.signed) + ' ' + this.formatMoney(Math.abs(preview.signed))],
        ['余额', `${this.formatMoney(preview.balanceBefore)} → ${this.formatMoney(preview.balanceAfter)}`],
        ['锁定金额', `${this.formatMoney(preview.lockedBefore)} → ${this.formatMoney(preview.lockedAfter)}`],
        ['可提现金额', `${this.formatMoney(preview.withdrawableBefore)} → ${this.formatMoney(preview.withdrawableAfter)}`],
        ['剩余流水', `${this.formatMoney(preview.turnoverBefore)} → ${this.formatMoney(preview.turnoverAfter)}`],
        ['备注', this.memberForm.remark || '-']
      ]
      if (preview.signed < 0) {
        rows.splice(3, 0, ['优先扣除', preview.deductPriorityLabel])
        rows.splice(4, 0, ['提现流水倍数', '0 倍'])
      } else if (preview.signed > 0) {
        rows.splice(3, 0, ['提现流水倍数', `${preview.withdrawTurnoverMultiple} 倍`])
        rows.splice(4, 0, ['新增提现流水', this.formatMoney(preview.withdrawTurnoverAmount)])
      }
      return this.renderConfirmRows(rows)
    },
    renderConfirmRows(rows) {
      const body = rows.map(([label, value]) => (
        `<div class="quota-confirm-row"><span>${label}</span><strong>${value}</strong></div>`
      )).join('')
      return `<div class="quota-confirm-box">${body}</div>`
    },
    afterAdjustSuccess(record, type) {
      if (type === 'site') {
        this.siteForm = createAdjustForm()
        this.remoteSiteSearch('')
      } else if (type === 'agent') {
        this.agentForm = createAdjustForm()
        this.agentOptions = []
      } else {
        this.memberForm = createAdjustForm()
        this.memberOptions = []
      }
      if (record) {
        this.records.unshift(record)
      }
      this.handleRecordQuery()
    },
    loadRecords() {
      this.recordLoading = true
      listQuotaRecords({
        pageNum: this.recordQuery.pageNum,
        pageSize: this.recordQuery.pageSize,
        keyword: this.recordQuery.keyword || undefined,
        targetType: this.recordQuery.targetType
      }).then(response => {
        this.records = (response && response.rows) || []
        this.recordTotal = (response && response.total) || 0
        this.recordSummary = Object.assign({
          increaseAmount: 0,
          decreaseAmount: 0
        }, (response && response.summary) || {})
      }).finally(() => {
        this.recordLoading = false
      })
    },
    getRecordSummary({ columns }) {
      return columns.map(column => {
        if (column.property === 'targetTypeText') {
          return '总计'
        }
        if (column.property === 'signedAmount') {
          return this.$createElement('div', { class: 'quota-summary-amounts' }, [
            this.$createElement('div', { class: 'amount-add' }, `增 ${this.signedMoney(this.recordSummary.increaseAmount)}`),
            this.$createElement('div', { class: 'amount-subtract' }, `减 ${this.signedMoney(this.recordSummary.decreaseAmount)}`)
          ])
        }
        return ''
      })
    },
    handleRecordQuery() {
      this.recordQuery.pageNum = 1
      this.loadRecords()
    },
    resetRecordQuery() {
      this.recordQuery = {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        targetType: undefined
      }
      this.loadRecords()
    },
    async handleExport() {
      this.exportLoading = true
      try {
        await this.download('funds/quotaAdjustment/export', {
          keyword: this.recordQuery.keyword || undefined,
          targetType: this.recordQuery.targetType
        }, `额度增减_${new Date().getTime()}.xlsx`)
      } finally {
        this.exportLoading = false
      }
    },
    currentSiteTarget() {
      return this.siteOptions.find(item => item.siteCode === this.siteForm.siteCode)
    },
    currentAgentTarget() {
      return this.agentOptions.find(item => `${item.targetId}` === `${this.agentForm.targetId}`)
    },
    currentMemberTarget() {
      return this.memberOptions.find(item => `${item.targetId}` === `${this.memberForm.targetId}`)
    },
    targetLabel(item) {
      const name = item.targetName || item.siteName || item.siteCode || '-'
      const code = item.siteCode ? ` / ${item.siteCode}` : ''
      const id = item.targetId ? ` / ID:${item.targetId}` : ''
      return `${name}${code}${id}`
    },
    targetTypeName(type) {
      if (type === 0) return '站点额度'
      if (type === 1) return '代理额度'
      if (type === 2) return '会员额度'
      return '-'
    },
    targetTagType(type) {
      if (type === 0) return 'primary'
      if (type === 1) return 'success'
      if (type === 2) return 'warning'
      return 'info'
    },
    directionLabel(signed) {
      return this.numberValue(signed) > 0 ? '增加' : '减少'
    },
    directionValue(signed) {
      return this.numberValue(signed) > 0 ? 'add' : 'subtract'
    },
    signedValue(form) {
      return this.roundMoney(form.amount)
    },
    numberValue(value) {
      const number = Number(value)
      return Number.isFinite(number) ? number : 0
    },
    isMoneyPrecisionValid(value) {
      const number = Number(value)
      return Number.isFinite(number) && Math.abs(number * 100 - Math.round(number * 100)) < 0.0000001
    },
    validateMemberTurnoverMultiple() {
      if (!this.isMemberIncrease) {
        this.memberForm.withdrawTurnoverMultiple = 0
        return true
      }
      const multiple = this.memberTurnoverMultipleValue(this.memberForm)
      if (!Number.isFinite(multiple) || multiple < 1) {
        this.$message.warning('会员增加额度时提现流水倍数最低为 1 倍')
        return false
      }
      return true
    },
    memberTurnoverMultipleValue(form) {
      const multiple = Number(form.withdrawTurnoverMultiple)
      return Number.isFinite(multiple) ? Math.round(multiple * 100) / 100 : 1
    },
    syncMemberTurnoverMultiple(value) {
      const amount = Number(value !== undefined ? value : this.memberForm.amount)
      if (Number.isFinite(amount) && amount > 0) {
        const multiple = Number(this.memberForm.withdrawTurnoverMultiple)
        if (!Number.isFinite(multiple) || multiple < 1) {
          this.memberForm.withdrawTurnoverMultiple = 1
        }
        return
      }
      this.memberForm.withdrawTurnoverMultiple = 0
    },
    hasMemberTurnoverRecord(row) {
      return row.withdrawTurnoverMultiple !== undefined && row.withdrawTurnoverMultiple !== null
    },
    formatTurnoverMultiple(value) {
      return this.numberValue(value).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    },
    roundMoney(value) {
      return Math.round(this.numberValue(value) * 100) / 100
    },
    formatMoney(value) {
      return this.roundMoney(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatDateTime(value) {
      const date = value instanceof Date ? value : new Date(value)
      if (Number.isNaN(date.getTime())) {
        return ''
      }
      const pad = number => String(number).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    signedMoney(value) {
      const amount = this.roundMoney(value)
      const prefix = amount > 0 ? '+' : ''
      return `${prefix}${this.formatMoney(amount)}`
    },
    amountClass(value) {
      const amount = this.numberValue(value)
      return {
        'amount-add': amount > 0,
        'amount-subtract': amount < 0
      }
    },
    hasFundPool(row) {
      return row.fundPoolBefore !== null && row.fundPoolBefore !== undefined &&
        row.fundPoolAfter !== null && row.fundPoolAfter !== undefined
    }
  }
}
