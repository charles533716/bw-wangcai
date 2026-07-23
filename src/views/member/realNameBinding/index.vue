<template>
  <div class="app-container binding-record-page">
    <section class="binding-record-panel">
      <header class="page-header">
        <div>
          <h2>实名信息绑定记录</h2>
          <p>查询实名及收款信息在各站点内的当前归属与历史绑定记录</p>
        </div>
        <span class="record-count">共 {{ allRows.length }} 条数据</span>
      </header>

      <el-alert
        class="query-notice"
        title="本页面仅用于查询，不支持删除永久归属关系；如需释放，须通过特殊权限流程处理并记录审计日志。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-form ref="queryForm" :model="queryParams" label-position="top" size="small" class="query-form">
        <el-form-item label="站点" prop="siteCode">
          <el-select v-model="queryParams.siteCode" placeholder="全部站点" clearable filterable>
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model.trim="queryParams.mobile" placeholder="请输入手机号" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="银行卡号" prop="bankCard">
          <el-input v-model.trim="queryParams.bankCard" placeholder="请输入银行卡号" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="支付宝账号" prop="alipay">
          <el-input v-model.trim="queryParams.alipay" placeholder="请输入支付宝账号" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="微信账号" prop="wechat">
          <el-input v-model.trim="queryParams.wechat" placeholder="请输入微信账号" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model.trim="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="当前绑定状态" prop="bindingStatus">
          <el-select v-model="queryParams.bindingStatus" placeholder="全部状态" clearable>
            <el-option label="当前绑定" value="bound" />
            <el-option label="已解绑" value="unbound" />
          </el-select>
        </el-form-item>
        <el-form-item label="首次绑定时间" prop="firstBindingRange" class="date-query-item">
          <el-date-picker
            v-model="queryParams.firstBindingRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            unlink-panels
            clearable
          />
        </el-form-item>
        <div class="query-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </div>
      </el-form>

      <el-table :data="pagedRows" border stripe class="binding-table">
        <el-table-column label="序号" align="center" width="70">
          <template slot-scope="scope">{{ (pagination.pageNum - 1) * pagination.pageSize + scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="站点" prop="siteName" min-width="120" show-overflow-tooltip />
        <el-table-column label="实名信息类型" prop="identityTypeLabel" min-width="110" />
        <el-table-column label="实名信息" min-width="210" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="identity-value-cell">
              <span>{{ displayIdentityValue(scope.row) }}</span>
              <button
                type="button"
                class="identity-visibility-button"
                :class="{ 'is-revealed': isIdentityRevealed(scope.row) }"
                :aria-label="isIdentityRevealed(scope.row) ? '恢复半脱敏' : '查看全明文'"
                @click.stop="toggleIdentityVisibility(scope.row)"
              >
                <svg-icon
                  :icon-class="isIdentityRevealed(scope.row) ? 'eye' : 'eye-open'"
                  class-name="identity-eye-icon"
                  aria-hidden="true"
                />
              </button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="当前归属用户ID" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.currentUserId || '--' }}</template>
        </el-table-column>
        <el-table-column label="会员账号" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.memberAccount || '--' }}</template>
        </el-table-column>
        <el-table-column label="当前绑定状态" align="center" width="110">
          <template slot-scope="scope">
            <el-tag :type="scope.row.bindingStatus === 'bound' ? 'success' : 'info'" size="small">
              {{ scope.row.bindingStatus === 'bound' ? '当前绑定' : '已解绑' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="历史重复" align="center" width="105">
          <template slot-scope="scope">
            <el-tag :type="scope.row.historicalDuplicate ? 'warning' : 'info'" size="small" effect="plain">
              {{ scope.row.historicalDuplicate ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="首次绑定时间" prop="firstBindingTime" min-width="165" />
        <el-table-column label="最近解绑时间" min-width="165">
          <template slot-scope="scope">{{ scope.row.lastUnbindingTime || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="openHistory(scope.row)">查看记录</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="filteredRows.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </section>

    <el-dialog
      title="历史绑定记录"
      :visible.sync="historyDialogVisible"
      width="960px"
      append-to-body
    >
      <div v-if="selectedRow" class="history-summary">
        <div><span>站点</span><strong>{{ selectedRow.siteName }}</strong></div>
        <div><span>信息类型</span><strong>{{ selectedRow.identityTypeLabel }}</strong></div>
        <div><span>实名信息</span><strong>{{ selectedRow.maskedIdentityValue }}</strong></div>
        <div><span>历史归属用户</span><strong>{{ selectedRow.historyRecords.length }} 个</strong></div>
      </div>
      <el-alert
        class="history-alert"
        title="历史归属关系永久保留，仅供查询，不支持在此页面删除。"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-table :data="selectedRow ? selectedRow.historyRecords : []" border>
        <el-table-column type="index" label="序号" align="center" width="70" />
        <el-table-column label="用户ID" prop="userId" min-width="120" />
        <el-table-column label="会员账号" prop="memberAccount" min-width="130" />
        <el-table-column label="归属状态" align="center" width="110">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'bound' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'bound' ? '当前绑定' : '已解绑' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="绑定时间" prop="bindingTime" min-width="170" />
        <el-table-column label="解绑时间" min-width="170">
          <template slot-scope="scope">{{ scope.row.unbindingTime || '--' }}</template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button @click="historyDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const SITE_OPTIONS = [
  { label: '旺财体育', value: 'WC' },
  { label: 'DW体育', value: 'DW' },
  { label: '财神体育', value: 'CS' }
]

const IDENTITY_TYPES = [
  { label: '手机号', value: 'mobile' },
  { label: '银行卡号', value: 'bankCard' },
  { label: '支付宝账号', value: 'alipay' },
  { label: '微信账号', value: 'wechat' }
]

const DEFAULT_QUERY = {
  siteCode: '',
  mobile: '',
  bankCard: '',
  alipay: '',
  wechat: '',
  userId: '',
  bindingStatus: '',
  firstBindingRange: []
}

const padNumber = (value, length) => String(value).padStart(length, '0')

const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1, 2)
  const day = padNumber(date.getDate(), 2)
  const hour = padNumber(date.getHours(), 2)
  const minute = padNumber(date.getMinutes(), 2)
  const second = padNumber(date.getSeconds(), 2)
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const createDate = (dayOffset, hourOffset) => {
  const date = new Date(2026, 0, 1, 8 + (hourOffset % 10), (dayOffset * 7) % 60, 0)
  date.setDate(date.getDate() + dayOffset)
  return date
}

const maskIdentityValue = (type, value) => {
  if (type === 'mobile') return `${value.slice(0, 3)}****${value.slice(-4)}`
  if (type === 'bankCard') return `${value.slice(0, 4)} **** **** ${value.slice(-4)}`
  if (type === 'alipay') {
    const parts = value.split('@')
    return `${parts[0].slice(0, 2)}***${parts[0].slice(-2)}@${parts[1]}`
  }
  return `${value.slice(0, 3)}****${value.slice(-3)}`
}

const buildIdentityValue = (type, sequence) => {
  if (type === 'mobile') return `138${padNumber(10000000 + sequence, 8)}`
  if (type === 'bankCard') return `622202${padNumber(1000000000 + sequence, 10)}`
  if (type === 'alipay') return `member${padNumber(sequence, 4)}@example.com`
  return `wx_member_${padNumber(sequence, 4)}`
}

const buildHistoryRecords = (sequence, ownerCount, isBound) => {
  return Array.from({ length: ownerCount }, (_, ownerIndex) => {
    const ownerSequence = sequence * 3 + ownerIndex
    const bindingDate = createDate((sequence + ownerIndex * 24) % 175, ownerIndex)
    const isCurrentOwner = isBound && ownerIndex === ownerCount - 1
    const unbindingDate = new Date(bindingDate.getTime())
    unbindingDate.setDate(unbindingDate.getDate() + 12 + (sequence % 18))
    return {
      userId: String(100000 + ownerSequence),
      memberAccount: `member${padNumber(ownerSequence, 5)}`,
      status: isCurrentOwner ? 'bound' : 'unbound',
      bindingTime: formatDateTime(bindingDate),
      unbindingTime: isCurrentOwner ? '' : formatDateTime(unbindingDate)
    }
  })
}

const buildBindingRows = () => Array.from({ length: 300 }, (_, index) => {
  const sequence = index + 1
  const site = SITE_OPTIONS[index % SITE_OPTIONS.length]
  const identityType = IDENTITY_TYPES[index % IDENTITY_TYPES.length]
  const identityValue = buildIdentityValue(identityType.value, sequence)
  const isBound = sequence % 5 !== 0
  const historicalDuplicate = sequence % 7 === 0 || sequence % 13 === 0
  const ownerCount = historicalDuplicate ? (sequence % 11 === 0 ? 3 : 2) : 1
  const historyRecords = buildHistoryRecords(sequence, ownerCount, isBound)
  const currentOwner = historyRecords.find(item => item.status === 'bound')
  const lastUnboundOwner = historyRecords.slice().reverse().find(item => item.unbindingTime)
  return {
    id: sequence,
    siteCode: site.value,
    siteName: site.label,
    identityType: identityType.value,
    identityTypeLabel: identityType.label,
    identityValue,
    maskedIdentityValue: maskIdentityValue(identityType.value, identityValue),
    mobile: identityType.value === 'mobile' ? identityValue : '',
    bankCard: identityType.value === 'bankCard' ? identityValue : '',
    alipay: identityType.value === 'alipay' ? identityValue : '',
    wechat: identityType.value === 'wechat' ? identityValue : '',
    currentUserId: currentOwner ? currentOwner.userId : '',
    memberAccount: currentOwner ? currentOwner.memberAccount : '',
    bindingStatus: isBound ? 'bound' : 'unbound',
    historicalDuplicate,
    firstBindingTime: historyRecords[0].bindingTime,
    lastUnbindingTime: lastUnboundOwner ? lastUnboundOwner.unbindingTime : '',
    historyRecords
  }
})

export default {
  name: 'MemberRealNameBinding',
  data() {
    return {
      siteOptions: SITE_OPTIONS,
      allRows: buildBindingRows(),
      queryParams: { ...DEFAULT_QUERY },
      appliedQuery: { ...DEFAULT_QUERY },
      pagination: {
        pageNum: 1,
        pageSize: 20
      },
      revealedIdentityIds: [],
      historyDialogVisible: false,
      selectedRow: null
    }
  },
  computed: {
    filteredRows() {
      const query = this.appliedQuery
      return this.allRows.filter(row => {
        if (query.siteCode && row.siteCode !== query.siteCode) return false
        if (query.mobile && !row.mobile.includes(query.mobile)) return false
        if (query.bankCard && !row.bankCard.includes(query.bankCard)) return false
        if (query.alipay && !row.alipay.toLowerCase().includes(query.alipay.toLowerCase())) return false
        if (query.wechat && !row.wechat.toLowerCase().includes(query.wechat.toLowerCase())) return false
        if (query.userId && !row.historyRecords.some(item => item.userId.includes(query.userId))) return false
        if (query.bindingStatus && row.bindingStatus !== query.bindingStatus) return false
        const range = query.firstBindingRange || []
        const bindingDate = row.firstBindingTime.slice(0, 10)
        if (range[0] && bindingDate < range[0]) return false
        if (range[1] && bindingDate > range[1]) return false
        return true
      })
    },
    pagedRows() {
      const start = (this.pagination.pageNum - 1) * this.pagination.pageSize
      return this.filteredRows.slice(start, start + this.pagination.pageSize)
    }
  },
  methods: {
    isIdentityRevealed(row) {
      return this.revealedIdentityIds.includes(row.id)
    },
    displayIdentityValue(row) {
      return this.isIdentityRevealed(row) ? row.identityValue : row.maskedIdentityValue
    },
    toggleIdentityVisibility(row) {
      const revealedIndex = this.revealedIdentityIds.indexOf(row.id)
      if (revealedIndex === -1) {
        this.revealedIdentityIds.push(row.id)
        return
      }
      this.revealedIdentityIds.splice(revealedIndex, 1)
    },
    handleQuery() {
      this.appliedQuery = {
        ...this.queryParams,
        firstBindingRange: (this.queryParams.firstBindingRange || []).slice()
      }
      this.pagination.pageNum = 1
    },
    resetQuery() {
      this.queryParams = { ...DEFAULT_QUERY }
      this.appliedQuery = { ...DEFAULT_QUERY }
      this.pagination.pageNum = 1
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.pageNum = 1
    },
    handleCurrentChange(page) {
      this.pagination.pageNum = page
    },
    openHistory(row) {
      this.selectedRow = row
      this.historyDialogVisible = true
    }
  }
}
</script>

<style scoped>
.binding-record-page {
  background: #f4f6fa;
}

.binding-record-panel {
  padding: 18px;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.page-header p {
  margin: 7px 0 0;
  color: #909399;
  font-size: 13px;
}

.record-count {
  color: #606266;
  font-size: 13px;
}

.query-notice {
  margin-bottom: 16px;
}

.query-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 0 16px;
  margin-bottom: 16px;
  padding: 16px 16px 4px;
  border: 1px solid #ebeef5;
  background: #f8fafc;
}

.query-form .el-form-item {
  min-width: 0;
  margin-bottom: 14px;
}

.query-form .el-select,
.query-form .el-input,
.query-form .el-date-editor {
  width: 100%;
}

.query-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 14px;
}

.binding-table {
  width: 100%;
}

.identity-value-cell {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.identity-value-cell > span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.identity-visibility-button {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #909399;
  cursor: pointer;
  font-size: 16px;
}

.identity-visibility-button:hover,
.identity-visibility-button:focus,
.identity-visibility-button.is-revealed {
  color: #409eff;
  outline: none;
}

.identity-eye-icon {
  width: 18px;
  height: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

.history-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 14px;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  background: #f8fafc;
}

.history-summary div {
  min-width: 0;
}

.history-summary span,
.history-summary strong {
  display: block;
}

.history-summary span {
  margin-bottom: 6px;
  color: #909399;
  font-size: 12px;
}

.history-summary strong {
  overflow: hidden;
  color: #303133;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-alert {
  margin-bottom: 14px;
}

@media (max-width: 1200px) {
  .query-form {
    grid-template-columns: repeat(3, minmax(180px, 1fr));
  }
}

@media (max-width: 760px) {
  .binding-record-panel {
    padding: 12px;
  }

  .page-header {
    align-items: flex-start;
    gap: 12px;
  }

  .query-form,
  .history-summary {
    grid-template-columns: 1fr;
  }
}
</style>
