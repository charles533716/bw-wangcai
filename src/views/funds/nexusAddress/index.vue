<template>
  <div class="app-container nexus-address-page">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      v-show="showSearch"
      label-width="90px"
      class="query-form"
    >
      <el-form-item label="钱包地址" prop="address">
        <el-input v-model="queryParams.address" placeholder="精确查询地址" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable size="small">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="当前订单号" prop="currentOrderNo">
        <el-input v-model="queryParams.currentOrderNo" placeholder="请输入订单号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="锁定会员ID" prop="lockedMemberId">
        <el-input-number
          v-model="queryParams.lockedMemberId"
          :min="1"
          :precision="0"
          :controls="false"
          placeholder="请输入会员ID"
          size="small"
          class="query-number"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="stats-strip">
      <div v-for="item in statItems" :key="item.key" class="stat-item" :class="'stat-item--' + item.key">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-upload2"
          size="mini"
          @click="openImportDialog"
          v-hasPermi="['funds:nexusAddress:import']"
        >导入地址</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="addressList"
      border
    >
      <el-table-column label="ID" prop="id" align="center" width="80" fixed="left" />
      <el-table-column label="收款地址" prop="address" align="center" width="300" fixed="left" show-overflow-tooltip />
      <el-table-column label="状态" prop="status" align="center" width="110">
        <template slot-scope="{ row }">
          <el-tag :type="statusTag(row.status)" size="mini">{{ row.statusName || statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前订单号" prop="currentOrderNo" align="center" width="170" show-overflow-tooltip />
      <el-table-column label="锁定会员" prop="lockedMemberId" align="center" width="110" />
      <el-table-column label="锁定时间" prop="lockedAt" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.lockedAt) }}</template>
      </el-table-column>
      <el-table-column label="订单过期时间" prop="expireAt" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.expireAt) }}</template>
      </el-table-column>
      <el-table-column label="冷却结束时间" prop="cooldownUntil" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.cooldownUntil) }}</template>
      </el-table-column>
      <el-table-column label="最近分配时间" prop="lastAssignedAt" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.lastAssignedAt) }}</template>
      </el-table-column>
      <el-table-column label="最近交易Hash" prop="lastTxHash" align="center" width="260" show-overflow-tooltip />
      <el-table-column label="最近入账时间" prop="lastDepositTime" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.lastDepositTime) }}</template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" align="center" width="180" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" align="center" width="160">
        <template slot-scope="{ row }">{{ formatTime(row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="handleView(row)"
            v-hasPermi="['funds:nexusAddress:query']"
          >查看</el-button>
          <el-button
            v-if="row.status === 'DISABLED'"
            type="text"
            size="mini"
            icon="el-icon-circle-check"
            @click="handleEnable(row)"
            v-hasPermi="['funds:nexusAddress:edit']"
          >启用</el-button>
          <el-button
            v-else
            type="text"
            size="mini"
            icon="el-icon-remove-outline"
            :disabled="isBusyStatus(row.status)"
            @click="handleDisable(row)"
            v-hasPermi="['funds:nexusAddress:edit']"
          >禁用</el-button>
          <el-button
            v-if="isBusyStatus(row.status)"
            type="text"
            size="mini"
            icon="el-icon-refresh-left"
            class="warning-action"
            @click="handleRelease(row)"
            v-hasPermi="['funds:nexusAddress:release']"
          >释放</el-button>
          <el-button
            type="text"
            size="mini"
            icon="el-icon-delete"
            class="danger-action"
            :disabled="isBusyStatus(row.status)"
            @click="handleDelete(row)"
            v-hasPermi="['funds:nexusAddress:remove']"
          >删除</el-button>
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

    <el-dialog title="导入BSC NEXUS地址池" :visible.sync="importOpen" width="720px" append-to-body>
      <el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="110px">
        <el-alert
          title="地址支持换行、空格、逗号、分号分隔；重复和无效地址会由后端统计返回。"
          type="info"
          show-icon
          :closable="false"
          class="dialog-tip"
        />
        <el-form-item label="地址文本" prop="addressText">
          <el-input
            v-model="importForm.addressText"
            type="textarea"
            :rows="7"
            placeholder="0x1111111111111111111111111111111111111111"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="初始状态" prop="status">
              <el-radio-group v-model="importForm.status">
                <el-radio label="IDLE">空闲</el-radio>
                <el-radio label="DISABLED">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="importForm.remark" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div v-if="importResult" class="import-result">
        <div class="result-counts">
          <span>总数：<strong>{{ displayValue(importResult.totalCount) }}</strong></span>
          <span>入库：<strong>{{ displayValue(importResult.importedCount) }}</strong></span>
          <span>重复：<strong>{{ displayValue(importResult.duplicateCount) }}</strong></span>
          <span>无效：<strong>{{ displayValue(importResult.invalidCount) }}</strong></span>
        </div>
        <div v-if="hasResultList(importResult.duplicateAddresses)" class="result-list">
          <span>重复地址</span>
          <p>{{ importResult.duplicateAddresses.join('，') }}</p>
        </div>
        <div v-if="hasResultList(importResult.invalidAddresses)" class="result-list result-list--danger">
          <span>无效地址</span>
          <p>{{ importResult.invalidAddresses.join('，') }}</p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="importOpen = false">关 闭</el-button>
        <el-button type="primary" :loading="importSubmitting" @click="submitImport">确认导入</el-button>
      </div>
    </el-dialog>

    <el-dialog title="地址详情" :visible.sync="detailOpen" width="760px" append-to-body>
      <div class="detail-grid">
        <div v-for="item in detailItems" :key="item.label" class="detail-item" :class="{ 'detail-item--wide': item.wide }">
          <span>{{ item.label }}</span>
          <el-tag v-if="item.status" :type="statusTag(item.status)" size="mini">{{ item.value }}</el-tag>
          <strong v-else>{{ displayValue(item.value) }}</strong>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  delNexusAddress,
  disableNexusAddress,
  enableNexusAddress,
  getNexusAddress,
  getNexusAddressStats,
  importNexusAddress,
  listNexusAddress,
  releaseNexusAddress
} from '@/api/funds/nexusAddress'

function createQueryParams() {
  return {
    pageNum: 1,
    pageSize: 10,
    address: undefined,
    status: undefined,
    currentOrderNo: undefined,
    lockedMemberId: undefined
  }
}

function createImportForm() {
  return {
    addressText: '',
    status: 'IDLE',
    remark: ''
  }
}

function validateAddressText(rule, value, callback) {
  if (!String(value || '').trim()) {
    callback(new Error('请输入至少一个钱包地址'))
    return
  }
  callback()
}

export default {
  name: 'NexusAddress',
  data() {
    return {
      loading: false,
      showSearch: true,
      addressList: [],
      total: 0,
      stats: {
        totalCount: 0,
        idleCount: 0,
        lockedCount: 0,
        coolingCount: 0,
        disabledCount: 0
      },
      queryParams: createQueryParams(),
      statusOptions: [
        { value: 'IDLE', label: '空闲' },
        { value: 'LOCKED', label: '已锁定' },
        { value: 'COOLING', label: '冷却中' },
        { value: 'DISABLED', label: '禁用' }
      ],
      importOpen: false,
      importSubmitting: false,
      importForm: createImportForm(),
      importResult: null,
      importRules: {
        addressText: [{ validator: validateAddressText, trigger: 'blur' }],
        status: [{ required: true, message: '请选择初始状态', trigger: 'change' }]
      },
      detailOpen: false,
      detailForm: {}
    }
  },
  computed: {
    statItems() {
      return [
        { key: 'total', label: '总地址', value: this.stats.totalCount || 0 },
        { key: 'idle', label: '空闲', value: this.stats.idleCount || 0 },
        { key: 'locked', label: '已锁定', value: this.stats.lockedCount || 0 },
        { key: 'cooling', label: '冷却中', value: this.stats.coolingCount || 0 },
        { key: 'disabled', label: '禁用', value: this.stats.disabledCount || 0 }
      ]
    },
    detailItems() {
      const row = this.detailForm || {}
      return [
        { label: '地址ID', value: row.id },
        { label: '状态', value: row.statusName || this.statusLabel(row.status), status: row.status },
        { label: '收款地址', value: row.address, wide: true },
        { label: '小写地址', value: row.addressLower, wide: true },
        { label: '当前订单号', value: row.currentOrderNo },
        { label: '锁定会员ID', value: row.lockedMemberId },
        { label: '锁定时间', value: this.formatTime(row.lockedAt) },
        { label: '订单过期时间', value: this.formatTime(row.expireAt) },
        { label: '冷却结束时间', value: this.formatTime(row.cooldownUntil) },
        { label: '最近分配时间', value: this.formatTime(row.lastAssignedAt) },
        { label: '最近交易Hash', value: row.lastTxHash, wide: true },
        { label: '最近入账时间', value: this.formatTime(row.lastDepositTime) },
        { label: '创建人', value: row.createBy },
        { label: '创建时间', value: this.formatTime(row.createTime) },
        { label: '更新人', value: row.updateBy },
        { label: '更新时间', value: this.formatTime(row.updateTime) },
        { label: '备注', value: row.remark, wide: true }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listNexusAddress(this.buildListParams()).then(response => {
        this.addressList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
      this.loadStats()
    },
    loadStats() {
      getNexusAddressStats(this.buildStatsParams()).then(response => {
        this.stats = {
          totalCount: 0,
          idleCount: 0,
          lockedCount: 0,
          coolingCount: 0,
          disabledCount: 0,
          ...((response && response.data) || {})
        }
      }).catch(() => {
        this.stats = {
          totalCount: 0,
          idleCount: 0,
          lockedCount: 0,
          coolingCount: 0,
          disabledCount: 0
        }
      })
    },
    buildListParams() {
      return this.trimParams(this.queryParams)
    },
    buildStatsParams() {
      const params = this.trimParams(this.queryParams)
      delete params.pageNum
      delete params.pageSize
      return params
    },
    trimParams(source) {
      const params = {}
      Object.keys(source).forEach(key => {
        const value = source[key]
        params[key] = typeof value === 'string' ? value.trim() : value
      })
      return params
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = createQueryParams()
      this.$nextTick(() => {
        this.resetForm('queryForm')
      })
      this.handleQuery()
    },
    openImportDialog() {
      this.importForm = createImportForm()
      this.importResult = null
      this.importOpen = true
      this.$nextTick(() => {
        this.resetForm('importFormRef')
      })
    },
    submitImport() {
      this.$refs.importFormRef.validate(valid => {
        if (!valid) return
        this.importSubmitting = true
        importNexusAddress(this.buildImportPayload()).then(response => {
          this.importResult = (response && response.data) || {}
          this.$modal.msgSuccess('导入完成')
          this.getList()
        }).finally(() => {
          this.importSubmitting = false
        })
      })
    },
    buildImportPayload() {
      return {
        addressText: String(this.importForm.addressText || '').trim(),
        status: this.importForm.status,
        remark: this.trimOrNull(this.importForm.remark)
      }
    },
    handleView(row) {
      getNexusAddress(row.id).then(response => {
        this.detailForm = (response && response.data) || {}
        this.detailOpen = true
      })
    },
    handleEnable(row) {
      this.$modal.confirm('是否确认启用地址 "' + row.address + '"？').then(() => {
        return enableNexusAddress(row.id)
      }).then(() => {
        this.$modal.msgSuccess('启用成功')
        this.getList()
      }).catch(() => {})
    },
    handleDisable(row) {
      if (this.isBusyStatus(row.status)) {
        this.$modal.msgWarning('LOCKED/COOLING 地址请先手动释放后再禁用')
        return
      }
      this.$modal.confirm('是否确认禁用地址 "' + row.address + '"？').then(() => {
        return disableNexusAddress(row.id)
      }).then(() => {
        this.$modal.msgSuccess('禁用成功')
        this.getList()
      }).catch(() => {})
    },
    handleRelease(row) {
      this.$confirm('是否确认手动释放地址 "' + row.address + '"？释放后会清空当前订单、锁定会员和冷却时间。', '手动释放地址', {
        confirmButtonText: '确认释放',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return releaseNexusAddress(row.id)
      }).then(() => {
        this.$modal.msgSuccess('释放成功')
        this.getList()
      }).catch(() => {})
    },
    handleDelete(row) {
      if (!row || !row.id) return
      if (this.isBusyStatus(row.status)) {
        this.$modal.msgWarning('LOCKED/COOLING 地址不能删除，请先手动释放')
        return
      }
      this.$modal.confirm('是否确认删除NEXUS地址编号为 "' + row.id + '" 的数据项？').then(() => {
        return delNexusAddress(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    isBusyStatus(status) {
      return status === 'LOCKED' || status === 'COOLING'
    },
    statusLabel(status) {
      const found = this.statusOptions.find(item => item.value === status)
      return found ? found.label : (status || '-')
    },
    statusTag(status) {
      const map = {
        IDLE: 'success',
        LOCKED: 'warning',
        COOLING: '',
        DISABLED: 'info'
      }
      return map[status] || 'info'
    },
    formatTime(value) {
      return value ? this.parseTime(value) : '-'
    },
    displayValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    hasResultList(value) {
      return Array.isArray(value) && value.length > 0
    },
    trimOrNull(value) {
      const text = String(value || '').trim()
      return text || null
    }
  }
}
</script>

<style scoped>
.nexus-address-page {
  padding: 20px;
}

.query-form ::v-deep .el-input,
.query-form ::v-deep .el-select {
  width: 190px;
}

.query-number {
  width: 190px;
}

.stats-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 14px;
  border: 1px solid #e4e7ed;
  border-left: 4px solid #909399;
  border-radius: 4px;
  background: #fff;
}

.stat-item span {
  color: #606266;
  font-size: 13px;
}

.stat-item strong {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.stat-item--total {
  border-left-color: #409eff;
}

.stat-item--idle {
  border-left-color: #67c23a;
}

.stat-item--locked {
  border-left-color: #e6a23c;
}

.stat-item--cooling {
  border-left-color: #909399;
}

.stat-item--disabled {
  border-left-color: #f56c6c;
}

.warning-action {
  color: #e6a23c;
}

.danger-action {
  color: #f56c6c;
}

.dialog-tip {
  margin-bottom: 18px;
}

.import-result {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.result-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #606266;
}

.result-counts strong {
  color: #303133;
}

.result-list {
  margin-top: 10px;
}

.result-list span {
  display: block;
  margin-bottom: 4px;
  color: #606266;
  font-size: 13px;
}

.result-list p {
  margin: 0;
  color: #303133;
  word-break: break-all;
}

.result-list--danger p {
  color: #f56c6c;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-item {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.detail-item--wide {
  grid-column: 1 / -1;
}

.detail-item span {
  display: block;
  margin-bottom: 5px;
  color: #909399;
  font-size: 12px;
}

.detail-item strong {
  display: block;
  color: #303133;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-all;
}

@media (max-width: 1200px) {
  .stats-strip {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-strip,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
