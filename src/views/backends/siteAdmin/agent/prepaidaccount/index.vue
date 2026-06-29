<template>
  <div
    v-loading="pageLoading"
    element-loading-text="数据加载中..."
    class="prepaid-page app-container"
  >
    <div class="pa-toolbar">
      <div>
        <div class="pa-title">预付金账户</div>
        <div class="pa-subtitle">预付金额度只能从财务中心可用额度转入，用于 Nexus 充值扣减。</div>
      </div>
      <el-button
        size="small"
        icon="el-icon-refresh"
        :loading="pageLoading || recordsLoading"
        @click="reloadAll"
      >
        刷新
      </el-button>
    </div>

    <div class="pa-summary-grid">
      <section class="pa-balance-card">
        <div class="pa-balance-label">
          <i class="el-icon-wallet"></i>
          预付金账户余额（CNY）
        </div>
        <div class="pa-balance-amount">{{ prepaidBalanceText }}</div>
        <div class="pa-balance-meta">
          <span v-if="summary.accountNo">账户编号：{{ summary.accountNo }}</span>
          <span>财务中心可用额度：{{ financeAvailableBalanceText }}</span>
        </div>

        <div class="pa-action-row">
          <button class="pa-action-btn is-primary" type="button" @click="openTransferDialog('in')">
            <i class="el-icon-top"></i>
            转入预付金
          </button>
        </div>
      </section>

      <section class="pa-info-card">
        <div class="pa-info-title">
          <i class="el-icon-info"></i>
          账户规则
        </div>
        <div class="pa-rule-list">
          <div class="pa-rule-item">
            <span class="pa-rule-dot is-in"></span>
            <div>
              <div class="pa-rule-title">转入来源</div>
              <div class="pa-rule-desc">只能从财务中心可用额度转入预付金账户。</div>
            </div>
          </div>
          <div class="pa-rule-item">
            <span class="pa-rule-dot is-use"></span>
            <div>
              <div class="pa-rule-title">Nexus 充值扣减</div>
              <div class="pa-rule-desc">后续用户使用 Nexus 充值时，将从预付金账户扣减额度。</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="pa-stat-grid">
      <div v-for="item in statCards" :key="item.key" class="pa-stat-card">
        <div class="pa-stat-label">{{ item.label }}</div>
        <div class="pa-stat-value">{{ item.value }}</div>
      </div>
    </div>

    <section class="pa-record-card">
      <div class="pa-record-head">
        <div class="pa-record-title-wrap">
          <span class="pa-record-dot"></span>
          <span class="pa-record-title">预付金流水记录</span>
        </div>
        <div class="pa-record-actions">
          <el-date-picker
            v-model="queryParams.dateRange"
            class="pa-date-range"
            size="small"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :default-time="['00:00:00', '23:59:59']"
            @change="handleQuery"
          />
          <el-select
            v-model="queryParams.recordType"
            class="pa-type-select"
            size="small"
            placeholder="类型"
            clearable
            @change="handleQuery"
          >
            <el-option label="全部类型" value="" />
            <el-option label="转入预付金" value="TRANSFER_IN" />
            <el-option label="转出到可用余额" value="TRANSFER_OUT" />
            <el-option label="Nexus充值扣减" value="NEXUS_RECHARGE_DEDUCT" />
          </el-select>
          <el-input
            v-model.trim="queryParams.keyword"
            class="pa-keyword"
            size="small"
            clearable
            prefix-icon="el-icon-search"
            placeholder="流水号/关联单号"
            @keyup.enter.native="handleQuery"
            @clear="handleQuery"
          />
          <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </div>
      </div>

      <el-table
        v-loading="recordsLoading"
        :data="recordList"
        class="pa-record-table"
        :header-cell-style="tableHeaderStyle"
      >
        <el-table-column label="流水单号" min-width="170">
          <template slot-scope="scope">
            <span class="pa-record-code">{{ scope.row.recordNo || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务类型" min-width="140">
          <template slot-scope="scope">
            <el-tag size="mini" :type="recordTagType(scope.row.recordType)">
              {{ recordTypeName(scope.row.recordType, scope.row.recordTypeName) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变动金额" min-width="140" align="right">
          <template slot-scope="scope">
            <span :class="amountClass(scope.row)">
              {{ formatSignedAmount(scope.row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="变动前余额" min-width="140" align="right">
          <template slot-scope="scope">
            {{ formatCny(scope.row.balanceBefore) }}
          </template>
        </el-table-column>
        <el-table-column label="变动后余额" min-width="140" align="right">
          <template slot-scope="scope">
            {{ formatCny(scope.row.balanceAfter) }}
          </template>
        </el-table-column>
        <el-table-column label="关联单号" min-width="170">
          <template slot-scope="scope">
            {{ scope.row.relatedOrderNo || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="操作人" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.operatorName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="170">
          <template slot-scope="scope">
            {{ scope.row.createTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.remark || '--' }}
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="pa-empty">暂无流水记录</div>
        </template>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @pagination="handlePageChange"
      />
    </section>

    <el-dialog
      :visible.sync="transferDialog.visible"
      :close-on-click-modal="false"
      append-to-body
      width="520px"
      custom-class="pa-transfer-dialog"
    >
      <div slot="title" class="pa-dialog-title">{{ transferDialogTitle }}</div>
      <el-form
        ref="transferForm"
        :model="transferDialog"
        label-width="96px"
        class="pa-transfer-form"
      >
        <el-form-item label="转账方向">
          <div class="pa-direction-box">
            <span>{{ transferSourceText }}</span>
            <i class="el-icon-right"></i>
            <span>{{ transferTargetText }}</span>
          </div>
        </el-form-item>
        <el-form-item label="可转金额">
          <div class="pa-inline-tip">{{ transferMaxAmountText }}</div>
        </el-form-item>
        <el-form-item label="转账金额">
          <el-input
            v-model.trim="transferDialog.amount"
            placeholder="请输入金额，最多2位小数"
            clearable
            @keyup.enter.native="submitTransfer"
          >
            <span slot="append">CNY</span>
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model.trim="transferDialog.remark"
            type="textarea"
            :rows="3"
            maxlength="100"
            show-word-limit
            placeholder="选填"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="transferDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="transferDialog.submitting" @click="submitTransfer">
          确认转入
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPrepaidAccountSummary,
  getPrepaidAccountRecords,
  submitPrepaidTransferIn
} from '@/api/agent/prepaidAccount'

const MAX_TRANSFER_AMOUNT = 99999999.99

function createSummary() {
  return {
    accountNo: '',
    prepaidBalance: 0,
    financeAvailableBalance: 0,
    todayTransferIn: 0,
    todayTransferOut: 0,
    monthNexusDeduct: 0,
    totalNexusDeduct: 0
  }
}

export default {
  name: 'PrepaidAccount',
  data() {
    return {
      pageLoading: false,
      recordsLoading: false,
      summary: createSummary(),
      recordList: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dateRange: [],
        recordType: '',
        keyword: ''
      },
      transferDialog: {
        visible: false,
        direction: 'in',
        amount: '',
        remark: '',
        submitting: false
      }
    }
  },
  computed: {
    requestSiteCode() {
      const siteCode = this.$store.getters.userSiteCode || this.$store.getters.siteCode || ''
      return String(siteCode || '').trim()
    },
    prepaidBalanceText() {
      return this.formatCny(this.summary.prepaidBalance)
    },
    financeAvailableBalanceText() {
      return this.formatCny(this.summary.financeAvailableBalance)
    },
    statCards() {
      return [
        { key: 'todayTransferIn', label: '今日转入', value: this.formatCny(this.summary.todayTransferIn) },
        { key: 'monthNexusDeduct', label: '本月 Nexus 扣减', value: this.formatCny(this.summary.monthNexusDeduct) },
        { key: 'totalNexusDeduct', label: '累计 Nexus 扣减', value: this.formatCny(this.summary.totalNexusDeduct) }
      ]
    },
    transferDialogTitle() {
      return '转入预付金'
    },
    transferSourceText() {
      return '财务中心可用额度'
    },
    transferTargetText() {
      return '预付金账户'
    },
    transferMaxAmount() {
      return this.toNumber(this.summary.financeAvailableBalance)
    },
    transferMaxAmountText() {
      return this.formatCny(this.transferMaxAmount)
    }
  },
  created() {
    this.setDefaultDateRange()
    this.reloadAll()
  },
  methods: {
    tableHeaderStyle() {
      return {
        background: '#f7f8fa',
        color: '#303133',
        fontWeight: 600
      }
    },
    setDefaultDateRange() {
      const end = new Date()
      end.setHours(23, 59, 59, 0)
      const start = new Date(end)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      this.queryParams.dateRange = [
        this.formatDateTimeParam(start),
        this.formatDateTimeParam(end)
      ]
    },
    formatDateTimeParam(date) {
      const pad = value => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    },
    toNumber(value) {
      if (value === null || value === undefined || value === '') return 0
      const number = Number(value)
      return Number.isFinite(number) ? number : 0
    },
    formatCny(value) {
      return `CNY ${this.toNumber(value).toFixed(2)}`
    },
    normalizeSummary(raw) {
      const data = raw || {}
      return {
        accountNo: data.accountNo || data.accountId || '',
        prepaidBalance: this.toNumber(this.firstPresent(data.prepaidBalance, data.balance)),
        financeAvailableBalance: this.toNumber(this.firstPresent(data.financeAvailableBalance, data.availableBalance)),
        todayTransferIn: this.toNumber(data.todayTransferIn),
        todayTransferOut: this.toNumber(data.todayTransferOut),
        monthNexusDeduct: this.toNumber(data.monthNexusDeduct),
        totalNexusDeduct: this.toNumber(data.totalNexusDeduct)
      }
    },
    firstPresent() {
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== null && arguments[i] !== undefined) return arguments[i]
      }
      return undefined
    },
    normalizeRecord(row) {
      const type = row.recordType || row.type || row.bizType || ''
      return {
        recordNo: row.recordNo || row.transactionId || row['流水号'] || '',
        recordType: type,
        recordTypeName: this.normalizeRecordTypeName(type, row.recordTypeName || row.typeName || row.bizTypeName || ''),
        amount: this.toNumber(this.firstPresent(row.amount, row.changeAmount)),
        direction: row.direction || row.amountDirection || '',
        balanceBefore: this.toNumber(row.balanceBefore),
        balanceAfter: this.toNumber(row.balanceAfter),
        relatedOrderNo: row.relatedOrderNo || row.relatedTransactionId || row.orderNo || '',
        operatorName: row.operatorName || row.createBy || '',
        createTime: row.createTime || row.time || '',
        remark: this.normalizeRecordRemark(type, row.remark)
      }
    },
    applyRecordResponse(response) {
      const payload = response || {}
      const data = payload.data || payload
      const rows = Array.isArray(data.rows)
        ? data.rows
        : Array.isArray(data.records)
          ? data.records
          : Array.isArray(data.list)
            ? data.list
            : Array.isArray(payload.rows)
              ? payload.rows
              : []
      this.recordList = rows.map(this.normalizeRecord)
      this.total = this.toNumber(this.firstPresent(data.total, payload.total))
      if (data.pageNum) this.queryParams.pageNum = this.toNumber(data.pageNum) || this.queryParams.pageNum
      if (data.pageSize) this.queryParams.pageSize = this.toNumber(data.pageSize) || this.queryParams.pageSize
    },
    buildRecordParams() {
      const params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
      if (this.requestSiteCode) params.siteCode = this.requestSiteCode
      if (this.queryParams.recordType) params.recordType = this.queryParams.recordType
      if (this.queryParams.keyword) params.keyword = this.queryParams.keyword
      if (Array.isArray(this.queryParams.dateRange) && this.queryParams.dateRange.length === 2) {
        params.createStartTime = this.queryParams.dateRange[0]
        params.createEndTime = this.queryParams.dateRange[1]
      }
      return params
    },
    async reloadAll() {
      this.pageLoading = true
      this.recordsLoading = true
      try {
        const params = this.requestSiteCode ? { siteCode: this.requestSiteCode } : {}
        const [summaryRes, recordsRes] = await Promise.all([
          getPrepaidAccountSummary(params),
          getPrepaidAccountRecords(this.buildRecordParams())
        ])
        this.summary = this.normalizeSummary((summaryRes && summaryRes.data) || {})
        this.applyRecordResponse(recordsRes)
      } catch (e) {
        this.summary = createSummary()
        this.recordList = []
        this.total = 0
      } finally {
        this.pageLoading = false
        this.recordsLoading = false
      }
    },
    async getList() {
      this.recordsLoading = true
      try {
        const res = await getPrepaidAccountRecords(this.buildRecordParams())
        this.applyRecordResponse(res)
      } catch (e) {
        this.recordList = []
        this.total = 0
      } finally {
        this.recordsLoading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.pageNum = 1
      this.queryParams.pageSize = 10
      this.queryParams.recordType = ''
      this.queryParams.keyword = ''
      this.setDefaultDateRange()
      this.getList()
    },
    handlePageChange(pagination) {
      if (pagination) {
        this.queryParams.pageNum = pagination.page || this.queryParams.pageNum
        this.queryParams.pageSize = pagination.limit || this.queryParams.pageSize
      }
      this.getList()
    },
    openTransferDialog(direction) {
      if (direction !== 'in') return
      this.transferDialog.direction = direction
      this.transferDialog.amount = ''
      this.transferDialog.remark = ''
      this.transferDialog.visible = true
    },
    parseAmount(rawValue) {
      const amountText = String(rawValue || '').trim()
      if (!amountText) return { valid: false, message: '请输入转账金额' }
      if (/^-/.test(amountText)) return { valid: false, message: '转账金额必须大于0' }
      if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amountText)) {
        return { valid: false, message: '转账金额格式不正确（最多2位小数）' }
      }
      const amount = Number(amountText)
      if (!Number.isFinite(amount) || amount <= 0) return { valid: false, message: '转账金额必须大于0' }
      if (amount > MAX_TRANSFER_AMOUNT) return { valid: false, message: '转账金额过大，最大支持99,999,999.99' }
      if (amount > this.transferMaxAmount) {
        return { valid: false, message: `可转金额不足，当前可转 ${this.transferMaxAmountText}` }
      }
      return { valid: true, value: amount }
    },
    async submitTransfer() {
      if (this.transferDialog.submitting) return
      const parsed = this.parseAmount(this.transferDialog.amount)
      if (!parsed.valid) {
        this.$message.warning(parsed.message)
        return
      }
      const actionName = '转入预付金'
      try {
        await this.$confirm(
          `${actionName}：${this.formatCny(parsed.value)}\n${this.transferSourceText} -> ${this.transferTargetText}`,
          `确认${actionName}`,
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch (e) {
        return
      }

      const payload = {
        amount: parsed.value,
        remark: this.transferDialog.remark,
        ...(this.requestSiteCode ? { siteCode: this.requestSiteCode } : {})
      }

      this.transferDialog.submitting = true
      try {
        await submitPrepaidTransferIn(payload)
        this.$message.success(`${actionName}成功`)
        this.transferDialog.visible = false
        await this.reloadAll()
      } catch (e) {
        // request.js 已统一提示接口错误，这里不重复弹窗。
      } finally {
        this.transferDialog.submitting = false
      }
    },
    recordTypeName(type, fallback) {
      return this.normalizeRecordTypeName(type, fallback)
    },
    normalizeRecordTypeName(type, fallback) {
      const normalized = String(type || '').toUpperCase()
      const map = this.recordTypeNameMap()
      if (map[normalized]) return map[normalized]
      const fallbackText = String(fallback || '').trim()
      if (!fallbackText) return '--'
      const fallbackCode = fallbackText.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()
      const fallbackMap = {
        'TRANSFER IN': 'TRANSFER_IN',
        'TRANSFER OUT': 'TRANSFER_OUT',
        'NEXUS RECHARGE DEDUCT': 'NEXUS_RECHARGE_DEDUCT',
        'NEXUS RECHARGE FREEZE': 'NEXUS_RECHARGE_FREEZE',
        'NEXUS FREEZE': 'NEXUS_RECHARGE_FREEZE',
        'NEXUS RECHARGE SETTLE': 'NEXUS_RECHARGE_SETTLE',
        'NEXUS SETTLE': 'NEXUS_RECHARGE_SETTLE',
        'NEXUS RECHARGE REFUND': 'NEXUS_RECHARGE_REFUND',
        'NEXUS REFUND': 'NEXUS_RECHARGE_REFUND'
      }
      return map[fallbackMap[fallbackCode]] || fallbackText
    },
    recordTypeNameMap() {
      return {
        TRANSFER_IN: '转入预付金',
        TRANSFER_OUT: '转出到可用余额',
        NEXUS_RECHARGE_DEDUCT: 'Nexus充值扣减',
        NEXUS_RECHARGE_FREEZE: 'Nexus充值冻结',
        NEXUS_RECHARGE_SETTLE: 'Nexus充值结算',
        NEXUS_RECHARGE_REFUND: 'Nexus充值退回'
      }
    },
    normalizeRecordRemark(type, remark) {
      const normalized = String(type || '').toUpperCase()
      const defaultRemark = this.defaultRecordRemark(normalized)
      const value = String(remark || '').trim()
      if (!value) return defaultRemark
      const remarkCode = value.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase()
      const englishDefaults = {
        TRANSFER_IN: ['TRANSFER IN', 'PREPAID TRANSFER IN', 'TRANSFER IN PREPAID'],
        TRANSFER_OUT: ['TRANSFER OUT', 'PREPAID TRANSFER OUT', 'TRANSFER OUT PREPAID'],
        NEXUS_RECHARGE_DEDUCT: ['NEXUS RECHARGE DEDUCT', 'NEXUS RECHARGE PREPAID DEDUCT'],
        NEXUS_RECHARGE_FREEZE: ['NEXUS RECHARGE FREEZE', 'NEXUS RECHARGE PREPAID FREEZE', 'NEXUS FREEZE'],
        NEXUS_RECHARGE_SETTLE: ['NEXUS RECHARGE SETTLE', 'NEXUS RECHARGE PREPAID SETTLE', 'NEXUS SETTLE'],
        NEXUS_RECHARGE_REFUND: ['NEXUS RECHARGE REFUND', 'NEXUS RECHARGE PREPAID REFUND', 'NEXUS REFUND']
      }
      const typeCode = normalized.replace(/_/g, ' ')
      if (remarkCode === typeCode || (englishDefaults[normalized] || []).includes(remarkCode)) {
        return defaultRemark
      }
      return value
    },
    defaultRecordRemark(type) {
      const map = {
        TRANSFER_IN: '预付金转入',
        TRANSFER_OUT: '预付金转出到可用余额',
        NEXUS_RECHARGE_DEDUCT: 'Nexus充值扣减预付金',
        NEXUS_RECHARGE_FREEZE: 'Nexus充值预付金冻结',
        NEXUS_RECHARGE_SETTLE: 'Nexus充值预付金结算',
        NEXUS_RECHARGE_REFUND: 'Nexus充值预付金退回'
      }
      return map[type] || '--'
    },
    recordTagType(type) {
      const normalized = String(type || '').toUpperCase()
      if (normalized === 'TRANSFER_IN') return 'success'
      if (normalized === 'TRANSFER_OUT') return 'warning'
      if (normalized === 'NEXUS_RECHARGE_DEDUCT') return 'danger'
      if (normalized === 'NEXUS_RECHARGE_FREEZE') return 'danger'
      if (normalized === 'NEXUS_RECHARGE_SETTLE') return 'warning'
      if (normalized === 'NEXUS_RECHARGE_REFUND') return 'success'
      return 'info'
    },
    amountDirection(row) {
      const direction = String(row.direction || '').toUpperCase()
      if (direction === 'IN' || direction === 'PLUS' || direction === '+') return 'plus'
      if (direction === 'OUT' || direction === 'MINUS' || direction === '-') return 'minus'
      const type = String(row.recordType || '').toUpperCase()
      if (type === 'TRANSFER_IN') return 'plus'
      if (type === 'TRANSFER_OUT' || type === 'NEXUS_RECHARGE_DEDUCT' || type === 'NEXUS_RECHARGE_FREEZE' || type === 'NEXUS_RECHARGE_SETTLE') return 'minus'
      if (type === 'NEXUS_RECHARGE_REFUND') return 'plus'
      return this.toNumber(row.amount) >= 0 ? 'plus' : 'minus'
    },
    amountClass(row) {
      return this.amountDirection(row) === 'plus' ? 'pa-amount-plus' : 'pa-amount-minus'
    },
    formatSignedAmount(row) {
      const amount = Math.abs(this.toNumber(row.amount))
      const sign = this.amountDirection(row) === 'plus' ? '+' : '-'
      return `${sign}${this.formatCny(amount)}`
    }
  }
}
</script>

<style scoped lang="scss">
.prepaid-page {
  min-height: calc(100vh - 84px);
  padding: 12px;
  background: #f5f7fb;
}

.pa-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pa-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 26px;
}

.pa-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}

.pa-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
  gap: 12px;
  margin-bottom: 12px;
}

.pa-balance-card,
.pa-info-card,
.pa-stat-card,
.pa-record-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.pa-balance-card {
  padding: 22px;
}

.pa-balance-label,
.pa-info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}

.pa-balance-label i,
.pa-info-title i {
  color: #409eff;
}

.pa-balance-amount {
  margin-top: 12px;
  color: #111827;
  font-size: 34px;
  font-weight: 800;
  line-height: 42px;
}

.pa-balance-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 20px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 12px;
}

.pa-action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.pa-action-btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  color: #303133;
  cursor: pointer;
  font-size: 13px;
}

.pa-action-btn i {
  margin-right: 6px;
}

.pa-action-btn.is-primary {
  border-color: #409eff;
  background: #409eff;
  color: #fff;
}

.pa-info-card {
  padding: 18px;
}

.pa-rule-list {
  margin-top: 14px;
}

.pa-rule-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #f0f2f5;
}

.pa-rule-item:first-child {
  border-top: none;
}

.pa-rule-dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  background: #409eff;
}

.pa-rule-dot.is-in {
  background: #67c23a;
}

.pa-rule-dot.is-out {
  background: #e6a23c;
}

.pa-rule-dot.is-use {
  background: #f56c6c;
}

.pa-rule-title {
  color: #1f2d3d;
  font-size: 13px;
  font-weight: 600;
}

.pa-rule-desc {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
  line-height: 18px;
}

.pa-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.pa-stat-card {
  padding: 14px 16px;
}

.pa-stat-label {
  color: #6b7280;
  font-size: 12px;
}

.pa-stat-value {
  margin-top: 8px;
  color: #111827;
  font-size: 20px;
  font-weight: 700;
}

.pa-record-card {
  padding: 14px;
}

.pa-record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pa-record-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 132px;
}

.pa-record-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
}

.pa-record-title {
  color: #1f2d3d;
  font-size: 15px;
  font-weight: 700;
}

.pa-record-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.pa-date-range {
  width: 360px;
}

.pa-type-select {
  width: 160px;
}

.pa-keyword {
  width: 180px;
}

.pa-record-table {
  width: 100%;
}

.pa-record-code {
  font-family: Arial, sans-serif;
  font-weight: 600;
  color: #303133;
}

.pa-amount-plus {
  color: #0f9f5f;
  font-weight: 700;
}

.pa-amount-minus {
  color: #d94841;
  font-weight: 700;
}

.pa-empty {
  padding: 24px 0;
  color: #909399;
}

.pa-dialog-title {
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 700;
}

.pa-transfer-form {
  padding-right: 8px;
}

.pa-direction-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  color: #303133;
  font-weight: 600;
}

.pa-direction-box i {
  color: #909399;
}

.pa-inline-tip {
  color: #606266;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .pa-summary-grid {
    grid-template-columns: 1fr;
  }

  .pa-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .pa-toolbar,
  .pa-record-head {
    align-items: stretch;
    flex-direction: column;
  }

  .pa-record-actions,
  .pa-date-range,
  .pa-type-select,
  .pa-keyword {
    width: 100%;
  }

  .pa-stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
