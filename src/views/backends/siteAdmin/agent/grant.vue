<template>
  <div class="app-container settlement-page">
    <el-form ref="queryForm" :inline="true" :model="filters" label-width="90px" class="query-form">
      <el-form-item label="代理名称" prop="agentName">
        <el-input
          v-model="filters.agentName"
          placeholder="请输入代理名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item v-if="showSiteSelector" label="站点" prop="siteSelector">
        <el-select
          v-model="filters.siteSelector"
          placeholder="全部站点"
          clearable
          filterable
          style="width: 240px"
        >
          <el-option
            v-for="option in siteOptions"
            :key="option.value === '' ? '__ALL__' : option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="编号" prop="cycleNo">
        <el-input
          v-model="filters.cycleNo"
          placeholder="请输入账单周期编号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态" prop="pendingAction">
        <el-select
          v-model="filters.pendingAction"
          placeholder="全部"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="option in pendingActionOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-card shadow="never" class="section-card">
      <div slot="header" class="section-header">
        <span>未发放区域</span>
        <el-button
          size="mini"
          type="warning"
          icon="el-icon-download"
          :loading="pendingExportLoading"
          @click="handleExportPending"
        >导出</el-button>
      </div>
      <el-table v-loading="pendingLoading" :data="pendingList" border stripe>
        <el-table-column
          v-for="column in settlementColumns"
          :key="`pending-${column.key}`"
          :label="column.label"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed || false"
          :show-overflow-tooltip="column.tooltip || false"
        >
          <template slot-scope="scope">
            <el-button
              v-if="column.key === 'operatingExpenseAmount'"
              type="text"
              class="expense-link"
              @click="handleOpenExpenseDialog(scope.row)"
            >{{ formatSettlementColumn(scope.row, column) }}</el-button>
            <span v-else>{{ formatSettlementColumn(scope.row, column) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isSuperViewer" label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="单号" prop="cycleNo" min-width="180" show-overflow-tooltip />
        <el-table-column v-if="canSettleByRole" label="操作" min-width="100" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="canSettle(scope.row)"
              size="mini"
              type="primary"
              v-hasPermi="['agent:commission:grant']"
              @click="handleSettle(scope.row)"
            >{{ actionText(scope.row) }}</el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="pendingTotal > 0"
        :total="pendingTotal"
        :page.sync="pendingQuery.pageNum"
        :limit.sync="pendingQuery.pageSize"
        @pagination="loadPending"
      />
    </el-card>

    <el-card shadow="never" class="section-card">
      <div slot="header" class="section-header">
        <span>已发放区域</span>
        <el-button
          size="mini"
          type="warning"
          icon="el-icon-download"
          :loading="grantedExportLoading"
          @click="handleExportGranted"
        >导出</el-button>
      </div>
      <el-table v-loading="grantedLoading" :data="grantedList" border stripe>
        <el-table-column
          v-for="column in settlementColumns"
          :key="`granted-${column.key}`"
          :label="column.label"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed || false"
          :show-overflow-tooltip="column.tooltip || false"
        >
          <template slot-scope="scope">
            <el-button
              v-if="column.key === 'operatingExpenseAmount'"
              type="text"
              class="expense-link"
              @click="handleOpenExpenseDialog(scope.row)"
            >{{ formatSettlementColumn(scope.row, column) }}</el-button>
            <span v-else>{{ formatSettlementColumn(scope.row, column) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template slot-scope="scope">
            <el-tag size="mini" :type="statusTagType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isSuperViewer" label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="单号" prop="cycleNo" min-width="180" show-overflow-tooltip />
        <el-table-column
          v-for="column in grantedOperationColumns"
          :key="`granted-extra-${column.key}`"
          :label="column.label"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :show-overflow-tooltip="column.tooltip || false"
        >
          <template slot-scope="scope">
            <span>{{ formatSettlementColumn(scope.row, column) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="grantedTotal > 0"
        :total="grantedTotal"
        :page.sync="grantedQuery.pageNum"
        :limit.sync="grantedQuery.pageSize"
        @pagination="loadGranted"
      />
    </el-card>

    <el-dialog
      title="运营费用详情"
      :visible.sync="expenseDialog.visible"
      width="760px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleCloseExpenseDialog"
    >
      <div class="expense-dialog">
        <div v-if="expenseDialog.summary" class="expense-dialog-meta">
          <span>{{ billTypeText(expenseDialog.summary.billType) }}</span>
          <span>{{ expenseDialog.summary.ownerName || '-' }}</span>
          <span>账期：{{ formatExpenseCycleMeta() }}</span>
        </div>
        <el-table
          v-loading="expenseDialog.loading"
          :data="expenseDialog.items"
          border
          stripe
          empty-text="暂无运营费用明细"
        >
          <el-table-column label="费用类型" prop="expenseLabel" min-width="220" show-overflow-tooltip />
          <el-table-column label="承担比例" min-width="120" align="center">
            <template slot-scope="scope">
              <span class="expense-ratio-tag">{{ formatExpenseShareRatio(scope.row.shareRatio) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="承担费用" min-width="140" align="right">
            <template slot-scope="scope">
              <span>{{ formatMoney(scope.row.chargeAmount) }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="expense-dialog-total">
          <span>费用总计</span>
          <span>{{ formatMoney(expenseDialog.totalAmount) }}</span>
        </div>
        <div class="expense-dialog-note">
          提示：运营费用由系统根据代理协议自动计算，包含会员在账期内产生的礼金、返水、推广奖励和三方场馆费等费用分摊。
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseExpenseDialog">关闭详情</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="settleDialogTitle"
      :visible.sync="settleDialog.visible"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
      @close="handleCloseSettleDialog"
    >
      <div v-if="settleDialog.row" class="settle-dialog-content">
          <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="账单类型">{{ billTypeText(settleDialog.row.billType) }}</el-descriptions-item>
          <el-descriptions-item label="代理名称">{{ settleDialog.row.agentName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="账单编号">{{ settleDialog.row.cycleNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="结算周期">
            {{ formatPeriod(settleDialog.row.commissionDateStart, settleDialog.row.commissionDateEnd) }}
          </el-descriptions-item>
          <el-descriptions-item label="分润金额">
            {{ formatMoney(settleDialog.row.commissionAmount) }}
          </el-descriptions-item>
          <el-descriptions-item label="总盈利">
            {{ formatMoney(settleDialog.row.totalWinLoss) }}
          </el-descriptions-item>
          <el-descriptions-item label="代理余额">
            {{ formatMoney(settleDialog.row.agentBalance) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSettleDialog">取消</el-button>
        <el-button type="primary" :loading="settleDialog.submitting" @click="handleConfirmSettleDialog">{{ settleDialogActionText }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listCommissionBill, grantCommissionBill, getCommissionBillExpenseDetail } from '@/api/agent/bill'
import { listSite } from '@/api/site/site'
import { parseTime } from '@/utils/ruoyi'

function buildRoleKeys(roles) {
  return (Array.isArray(roles) ? roles : [])
    .map((item) => {
      if (!item) return ''
      if (typeof item === 'string') return item.trim().toLowerCase()
      if (typeof item === 'object') {
        return String(item.roleKey || item.roleName || item.name || '').trim().toLowerCase()
      }
      return ''
    })
    .filter(Boolean)
}

export default {
  name: 'CommissionGrant',
  data() {
    return {
      filters: {
        agentName: '',
        siteSelector: '',
        pendingAction: '',
        cycleNo: ''
      },
      siteOptions: [],
      pendingActionOptions: [
        { label: '全部', value: '' },
        { label: '待结算', value: 'settle' },
        { label: '待确认', value: 'confirm' }
      ],
      pendingLoading: false,
      grantedLoading: false,
      pendingTotal: 0,
      grantedTotal: 0,
      pendingList: [],
      grantedList: [],
      pendingExportLoading: false,
      grantedExportLoading: false,
      settlementColumns: [
        { key: 'agentName', label: '代理名称', minWidth: 150, fixed: 'left', tooltip: true, type: 'text' },
        { key: 'siteName', label: '所属站点', minWidth: 140, tooltip: true, type: 'text' },
        { key: 'starLevel', label: '星级', minWidth: 90, align: 'center', type: 'starLevel' },
        { key: 'agentLevel', label: '层级', minWidth: 90, align: 'center', type: 'agentLevel' },
        { key: 'commissionRate', label: '返佣比例', minWidth: 110, align: 'center', type: 'commissionRate' },
        { key: 'accountType', label: '账号类型', minWidth: 110, align: 'center', type: 'accountType' },
        { key: 'parentAgentName', label: '直属上级代理', minWidth: 140, tooltip: true, type: 'parentAgent' },
        { key: 'periodRange', label: '账期范围', minWidth: 210, type: 'period' },
        { key: 'directMemberWinLossAmount', label: '代理直属会员盈亏', minWidth: 130, align: 'right', type: 'money' },
        { key: 'grossDirectCommissionAmount', label: '直属会员佣金', minWidth: 130, align: 'right', type: 'agentMoney' },
        { key: 'grossLevelCommissionAmount', label: '级差佣金', minWidth: 120, align: 'right', type: 'money' },
        { key: 'grossCommissionAmount', label: '本期佣金毛收益', minWidth: 150, align: 'right', type: 'money' },
        { key: 'operatingExpenseAmount', label: '运营费用总计', minWidth: 140, align: 'right', type: 'money' },
        { key: 'balanceChangeTotalAmount', label: '余额变动总额', minWidth: 140, align: 'right', type: 'money' },
        { key: 'balanceOffsetAmount', label: '余额抵扣', minWidth: 120, align: 'right', type: 'money' },
        { key: 'balanceRepaymentAmount', label: '余额还款', minWidth: 120, align: 'right', type: 'money' },
        { key: 'balanceAdvanceAmount', label: '余额垫付', minWidth: 120, align: 'right', type: 'money' },
        { key: 'advanceCommissionAmount', label: '垫付佣金', minWidth: 120, align: 'right', type: 'money' },
        { key: 'advanceTotalAmount', label: '本期垫付总金额', minWidth: 150, align: 'right', type: 'money' },
        { key: 'repaidCommissionAmount', label: '垫付佣金回款', minWidth: 140, align: 'right', type: 'money' },
        { key: 'repaidTotalAmount', label: '本期回款总金额', minWidth: 150, align: 'right', type: 'money' },
        { key: 'newDebtAmount', label: '本期借款', minWidth: 120, align: 'right', type: 'money' },
        { key: 'debtRepaymentAmount', label: '本期还款总额', minWidth: 140, align: 'right', type: 'money' },
        { key: 'finalProfitAmount', label: '本期最终收益', minWidth: 140, align: 'right', type: 'money' },
        { key: 'outstandingDebtAmount', label: '剩余总欠款金额', minWidth: 150, align: 'right', type: 'money' },
        { key: 'unrecoveredAdvanceAmount', label: '未收回垫付总金额', minWidth: 160, align: 'right', type: 'money' },
        { key: 'calcTime', label: '应结日', minWidth: 110, type: 'date' }
      ],
      pendingQuery: {
        pageNum: 1,
        pageSize: 10,
        agentName: '',
        siteCode: '',
        mainSiteOnly: false,
        cycleNo: '',
        isGranted: '0',
        status: '',
        settlementAction: '',
        excludeZeroCommissionAmount: false
      },
      grantedQuery: {
        pageNum: 1,
        pageSize: 10,
        agentName: '',
        siteCode: '',
        mainSiteOnly: false,
        cycleNo: '',
        isGranted: '1',
        status: '',
        excludeZeroCommissionAmount: false
      },
      settleDialog: {
        visible: false,
        submitting: false,
        row: null
      },
      expenseDialog: {
        visible: false,
        loading: false,
        row: null,
        summary: null,
        items: [],
        totalAmount: 0
      }
    }
  },
  computed: {
    grantedOperationColumns() {
      return [
        { key: 'grantBy', label: '操作人', minWidth: 120, tooltip: true, type: 'text' },
        { key: 'grantTime', label: '操作时间', minWidth: 180, type: 'datetime' }
      ]
    },
    frontViewerRole() {
      const roleKeys = buildRoleKeys(this.$store.getters.roles)
      if (roleKeys.includes('admin')) return 'super'
      if (roleKeys.includes('siteadmin')) return 'site'
      if (Number(this.$store.getters.isAgent || 0) === 1) return 'agent'
      return 'site'
    },
    isSuperViewer() {
      return this.frontViewerRole === 'super'
    },
    showSiteSelector() {
      return this.isSuperViewer
    },
    canSettleByRole() {
      return this.frontViewerRole === 'super' || this.frontViewerRole === 'site'
    },
    settleDialogTitle() {
      return this.isConfirmOnlyBill(this.settleDialog.row) ? '确认账单' : '确认结算'
    },
    settleDialogActionText() {
      return this.isConfirmOnlyBill(this.settleDialog.row) ? '确认' : '确认结算'
    }
  },
  created() {
    this.loadSiteOptions()
    this.reloadAll()
  },
  methods: {
    async loadSiteOptions() {
      if (!this.showSiteSelector) {
        this.siteOptions = []
        return
      }
      try {
        const response = await listSite({ pageNum: 1, pageSize: 1000 })
        const rows = this.extractSiteRows(response)
        this.siteOptions = [
          { label: '全部站点', value: '' },
          { label: '总站', value: '__MAIN__' },
          ...rows
            .map((site) => {
              const code = site.code || site.siteCode || site.id
              const name = site.nameZn || site.siteName || site.siteNameZn || site.name
              if (code === undefined || code === null || code === '') {
                return null
              }
              return {
                value: String(code),
                label: this.formatSiteOptionLabel(code, name)
              }
            })
            .filter(Boolean)
        ]
      } catch (error) {
        console.error('[commission][site-options] load failed', error)
        this.siteOptions = [
          { label: '全部站点', value: '' },
          { label: '总站', value: '__MAIN__' }
        ]
      }
    },
    reloadAll() {
      this.loadPending()
      this.loadGranted()
    },
    syncFilters() {
      const agentName = String(this.filters.agentName || '').trim()
      const cycleNo = String(this.filters.cycleNo || '').trim()
      const pendingAction = String(this.filters.pendingAction || '').trim()
      const { siteCode, mainSiteOnly } = this.buildSiteFilter()
      this.pendingQuery.agentName = agentName
      this.pendingQuery.siteCode = siteCode
      this.pendingQuery.mainSiteOnly = mainSiteOnly
      this.pendingQuery.cycleNo = cycleNo
      this.pendingQuery.status = ''
      this.pendingQuery.settlementAction = pendingAction
      this.grantedQuery.agentName = agentName
      this.grantedQuery.siteCode = siteCode
      this.grantedQuery.mainSiteOnly = mainSiteOnly
      this.grantedQuery.cycleNo = cycleNo
      this.grantedQuery.status = ''
    },
    handleSearch() {
      this.pendingQuery.pageNum = 1
      this.grantedQuery.pageNum = 1
      this.syncFilters()
      this.reloadAll()
    },
    handleReset() {
      this.filters.agentName = ''
      this.filters.siteSelector = ''
      this.filters.pendingAction = ''
      this.filters.cycleNo = ''
      this.handleSearch()
    },
    handleExportPending() {
      this.handleExportSection('0', this.filters.pendingAction, '未发放')
    },
    handleExportGranted() {
      this.handleExportSection('1', '', '已发放')
    },
    handleExportSection(isGranted, settlementAction, label) {
      const loadingKey = isGranted === '0' ? 'pendingExportLoading' : 'grantedExportLoading'
      this.$modal.confirm(`是否确认导出当前筛选条件下${label}记录？`)
        .then(async () => {
          this[loadingKey] = true
          const params = this.buildExportParams(isGranted, settlementAction)
          const now = Date.now()
          await this.download('/agent/commission/bill/export', params, `佣金结算明细_${label}_${now}.xlsx`)
          this.$modal.msgSuccess('导出完成')
        })
        .catch(() => {})
        .finally(() => {
          this[loadingKey] = false
        })
    },
    buildExportParams(isGranted, settlementAction) {
      const agentName = String(this.filters.agentName || '').trim()
      const cycleNo = String(this.filters.cycleNo || '').trim()
      const { siteCode, mainSiteOnly } = this.buildSiteFilter()
      return {
        agentName,
        siteCode,
        mainSiteOnly,
        cycleNo,
        isGranted,
        status: '',
        settlementAction: isGranted === '0' ? String(settlementAction || '').trim() : '',
        excludeZeroCommissionAmount: false
      }
    },
    buildSiteFilter() {
      const selected = this.showSiteSelector ? this.filters.siteSelector : ''
      if (selected === '__MAIN__') {
        return {
          siteCode: '',
          mainSiteOnly: true
        }
      }
      return {
        siteCode: String(selected || '').trim(),
        mainSiteOnly: false
      }
    },
    extractSiteRows(response) {
      if (Array.isArray(response && response.rows)) return response.rows
      if (response && response.data && Array.isArray(response.data.rows)) return response.data.rows
      if (response && Array.isArray(response.data)) return response.data
      return []
    },
    formatSiteOptionLabel(code, name) {
      if (name) {
        return `${code} / ${name}`
      }
      return String(code)
    },
    loadPending() {
      this.pendingLoading = true
      listCommissionBill(this.pendingQuery)
        .then((res) => {
          if (res && res.code === 200) {
            this.pendingList = Array.isArray(res.rows) ? res.rows : []
            this.pendingTotal = Number(res.total || 0)
            return
          }
          this.pendingList = []
          this.pendingTotal = 0
          this.$modal.msgError((res && res.msg) || '获取未发放账单失败')
        })
        .catch((err) => {
          console.error('[commission][pending] load failed', err)
          this.pendingList = []
          this.pendingTotal = 0
          this.$modal.msgError('获取未发放账单失败')
        })
        .finally(() => {
          this.pendingLoading = false
        })
    },
    loadGranted() {
      this.grantedLoading = true
      listCommissionBill(this.grantedQuery)
        .then((res) => {
          if (res && res.code === 200) {
            this.grantedList = Array.isArray(res.rows) ? res.rows : []
            this.grantedTotal = Number(res.total || 0)
            return
          }
          this.grantedList = []
          this.grantedTotal = 0
          this.$modal.msgError((res && res.msg) || '获取已发放账单失败')
        })
        .catch((err) => {
          console.error('[commission][granted] load failed', err)
          this.grantedList = []
          this.grantedTotal = 0
          this.$modal.msgError('获取已发放账单失败')
        })
        .finally(() => {
          this.grantedLoading = false
        })
    },
    canSettle(row) {
      if (!this.canSettleByRole) return false
      if (!row) return false
      const pending = String(row.isGranted || '0') === '0' && String(row.status || '') === '1'
      if (!pending) return false
      if (!this.hasGrantableSettlement(row)) return false
      if (this.frontViewerRole === 'super') return true
      if (this.frontViewerRole === 'site') {
        return Number(row.billType || 0) === 2 && Number(row.siteBillGranted || 0) === 1
      }
      return false
    },
    hasGrantableSettlement(row) {
      if (!row) return false
      if (this.isConfirmOnlyBill(row)) return true
      const agentId = Number(row.agentId || 0)
      const commissionAmount = Number(row.commissionAmount || 0)
      const balanceDeltaAmount = Number(row.balanceDeltaAmount || 0)
      if (agentId > 0) {
        if (commissionAmount < 0) return false
        return commissionAmount !== 0 || balanceDeltaAmount !== 0
      }
      const billType = Number(row.billType)
      if (billType === 0 || billType === 1) {
        return commissionAmount !== 0
      }
      return false
    },
    isPureDebtBill(row) {
      if (!row) return false
      const commissionAmount = Number(row.commissionAmount || 0)
      const balanceDeltaAmount = Number(row.balanceDeltaAmount || 0)
      if (commissionAmount !== 0 || balanceDeltaAmount !== 0) return false
      return Number(row.debtRepaymentAmount || 0) !== 0
        || Number(row.newDebtAmount || 0) !== 0
        || Number(row.outstandingDebtAmount || 0) !== 0
    },
    isZeroSettlementAgentBill(row) {
      if (!row) return false
      const agentId = Number(row.agentId || 0)
      if (agentId <= 0) return false
      return Number(row.commissionAmount || 0) === 0
        && Number(row.balanceDeltaAmount || 0) === 0
        && Number(row.debtRepaymentAmount || 0) === 0
        && Number(row.newDebtAmount || 0) === 0
        && Number(row.outstandingDebtAmount || 0) === 0
    },
    isZeroSettlementNonAgentBill(row) {
      if (!row) return false
      if (row.agentId !== null && row.agentId !== undefined && Number(row.agentId) > 0) return false
      const billType = Number(row.billType)
      if (billType !== 0 && billType !== 1) return false
      return Number(row.commissionAmount || 0) === 0
    },
    isConfirmOnlyBill(row) {
      return this.isPureDebtBill(row) || this.isZeroSettlementAgentBill(row) || this.isZeroSettlementNonAgentBill(row)
    },
    actionText(row) {
      return this.isConfirmOnlyBill(row) ? '确认' : '结算'
    },
    handleSettle(row) {
      if (!row || !row.id) return
      this.settleDialog.row = { ...row }
      this.settleDialog.visible = true
    },
    handleConfirmSettleDialog() {
      const row = this.settleDialog.row
      if (!row || !row.id) return
      this.settleDialog.submitting = true
      grantCommissionBill(row.id)
        .then((res) => {
          if (res && res.code === 200) {
            this.$modal.msgSuccess(this.isConfirmOnlyBill(row) ? '确认成功' : '结算成功')
            this.handleCloseSettleDialog()
            this.reloadAll()
            return
          }
          this.$modal.msgError((res && res.msg) || (this.isConfirmOnlyBill(row) ? '确认失败' : '结算失败'))
        })
        .catch((err) => {
          console.error('[commission][settle] failed', err)
          this.$modal.msgError((err && err.message) || (this.isConfirmOnlyBill(row) ? '确认失败' : '结算失败'))
        })
        .finally(() => {
          this.settleDialog.submitting = false
        })
    },
    handleCancelSettleDialog() {
      this.settleDialog.visible = false
    },
    handleCloseSettleDialog() {
      this.settleDialog.visible = false
      this.settleDialog.submitting = false
      this.settleDialog.row = null
    },
    handleOpenExpenseDialog(row) {
      if (!row || !row.id) return
      this.expenseDialog.visible = true
      this.expenseDialog.loading = true
      this.expenseDialog.row = { ...row }
      this.expenseDialog.summary = {
        billId: row.id,
        billType: row.billType,
        ownerName: row.agentName || '-',
        siteCode: row.siteCode || '',
        cycleNo: row.cycleNo || ''
      }
      this.expenseDialog.items = []
      this.expenseDialog.totalAmount = Number(row.operatingExpenseAmount || 0)
      getCommissionBillExpenseDetail(row.id)
        .then((res) => {
          if (!res || res.code !== 200) {
            this.$modal.msgError((res && res.msg) || '获取运营费用明细失败')
            return
          }
          const payload = res.data || {}
          this.expenseDialog.summary = payload
          this.expenseDialog.items = Array.isArray(payload.items) ? payload.items : []
          this.expenseDialog.totalAmount = Number(payload.totalAmount || 0)
        })
        .catch((err) => {
          console.error('[commission][expense-details] load failed', err)
          this.$modal.msgError('获取运营费用明细失败')
        })
        .finally(() => {
          this.expenseDialog.loading = false
        })
    },
    handleCloseExpenseDialog() {
      this.expenseDialog.visible = false
      this.expenseDialog.loading = false
      this.expenseDialog.row = null
      this.expenseDialog.summary = null
      this.expenseDialog.items = []
      this.expenseDialog.totalAmount = 0
    },
    formatMoney(value) {
      const num = Number(value || 0)
      if (Number.isNaN(num)) return '0.00'
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatExpenseShareRatio(value) {
      const num = Number(value || 0)
      if (Number.isNaN(num)) return '0.00%'
      return `${num.toFixed(2)}%`
    },
    formatExpenseCycleMeta() {
      const summary = this.expenseDialog.summary
      const row = this.expenseDialog.row
      if (row && (row.commissionDateStart || row.commissionDateEnd)) {
        return this.formatPeriod(row.commissionDateStart, row.commissionDateEnd)
      }
      if (summary && summary.cycleNo) {
        return summary.cycleNo
      }
      return '-'
    },
    formatDate(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d}') || '-'
    },
    formatDateTime(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || '-'
    },
    formatPeriod(start, end) {
      const s = this.formatDate(start)
      const e = this.formatDate(end)
      if (s === '-' && e === '-') return '-'
      return `${s} ~ ${e}`
    },
    formatSettlementColumn(row, column) {
      if (!column) return '-'
      if (column.type === 'money') return this.formatMoney(row && row[column.key])
      if (column.type === 'agentMoney') {
        if (!row) return '-'
        const billType = Number(row.billType)
        if (billType !== 1 && billType !== 2) return '-'
        return this.formatMoney(row[column.key])
      }
      if (column.type === 'date') return this.formatDate(row && row[column.key])
      if (column.type === 'datetime') return this.formatDateTime(row && row[column.key])
      if (column.type === 'period') return this.formatPeriod(row && row.commissionDateStart, row && row.commissionDateEnd)
      if (column.type === 'starLevel') return this.formatStarLevel(row)
      if (column.type === 'agentLevel') return this.formatAgentLevel(row)
      if (column.type === 'commissionRate') {
        if (!row || Number(row.billType) !== 2) return '-'
        return this.formatCommissionRate(row.commissionRate)
      }
      if (column.type === 'accountType') return this.billTypeText(row && row.billType)
      if (column.type === 'parentAgent') return (row && row.parentAgentName) || '-'
      const value = row && row[column.key]
      return value === null || value === undefined || value === '' ? '-' : value
    },
    isStarCommission(row) {
      if (!row) return false
      return String(row.commissionType || '') === '3'
    },
    formatStarLevel(row) {
      if (!this.isStarCommission(row)) return '-'
      if (row.starLevel === null || row.starLevel === undefined || row.starLevel === '') return '-'
      return `${row.starLevel}星`
    },
    formatAgentLevel(row) {
      if (this.isStarCommission(row)) return '-'
      if (!row || row.agentLevel === null || row.agentLevel === undefined || row.agentLevel === '') return '-'
      return `${row.agentLevel}层`
    },
    formatCommissionRate(value) {
      if (value === null || value === undefined || value === '') return '-'
      const raw = Number(value)
      if (Number.isNaN(raw)) return '-'
      const percent = raw > 1 ? raw : raw * 100
      return `${percent.toFixed(2)}%`
    },
    billTypeText(billType) {
      const code = Number(billType)
      if (code === 2) return '代理账单'
      if (code === 1) return '站点账单'
      if (code === 0) return '总站账单'
      return '-'
    },
    billTypeTagType(billType) {
      const code = Number(billType)
      if (code === 2) return ''
      if (code === 1) return 'warning'
      if (code === 0) return 'info'
      return 'info'
    },
    statusText(status) {
      const code = String(status || '')
      const map = {
        '0': '等待上级发放',
        '1': '待发放',
        '2': '已发放',
        '3': '已取消'
      }
      return map[code] || code || '-'
    },
    statusTagType(status) {
      const code = String(status || '')
      if (code === '2') return 'success'
      if (code === '1') return 'warning'
      if (code === '3') return 'danger'
      return 'info'
    }
  }
}
</script>

<style scoped>
.settlement-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.query-form {
  margin-bottom: 0;
}

.section-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.settle-dialog-content {
  margin-bottom: 4px;
}

.expense-link {
  padding: 0;
}

.expense-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-dialog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #4b5563;
  font-size: 13px;
}

.expense-ratio-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef4ff;
  color: #2563eb;
  font-weight: 600;
}

.expense-dialog-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8fafc;
  color: #1f2937;
  font-weight: 600;
}

.expense-dialog-note {
  padding: 12px 16px;
  border-radius: 10px;
  background: #fff7ed;
  color: #9a3412;
  line-height: 1.6;
  font-size: 13px;
}
</style>
