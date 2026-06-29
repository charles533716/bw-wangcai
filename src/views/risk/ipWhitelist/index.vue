<template>
  <div class="app-container risk-page">
    <div class="risk-card">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="86px"
        class="risk-query"
      >
        <el-form-item class="query-item query-item--sm" label="站点" prop="siteId">
          <el-select v-model="queryParams.siteId" class="query-control" placeholder="全部" clearable filterable>
            <el-option label="全部" value="" />
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-item query-item--lg" label="IP地址" prop="ip">
          <el-input
            v-model="queryParams.ip"
            class="query-control"
            placeholder="请输入IP地址"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="query-item query-item--sm" label="状态" prop="status">
          <el-select v-model="queryParams.status" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
          <el-button type="info" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="risk-toolbar">
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">新增IP白名单</el-button>
      </div>

      <el-table v-loading="listLoading" :data="listData" @row-dblclick="handleEdit">
        <el-table-column label="ID" align="center" width="80">
          <template slot-scope="scope">{{ resolveWhitelistId(scope.row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="站点code/站点名称" align="center" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">{{ getSiteDisplay(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="IP地址" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ getWhitelistIp(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="启用" align="center" min-width="110">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="2"
              active-color="#2f6df6"
              inactive-color="#dfe5ef"
              @change="handleStatusSwitch(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" min-width="240" show-overflow-tooltip>
          <template slot-scope="scope">{{ getWhitelistRemark(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" min-width="170">
          <template slot-scope="scope">
            {{ formatListTime(getFieldByAliases(scope.row, ['createTime', 'createAt', 'createdAt', 'gmtCreate'])) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" min-width="170">
          <template slot-scope="scope">
            {{ formatListTime(getFieldByAliases(scope.row, ['updateTime', 'updateAt', 'updatedAt', 'gmtModified'])) }}
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">{{ getOperatorDisplay(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click.stop="handleDelete(scope.row)">删除</el-button>
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
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogOpen" width="620px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="站点" prop="siteId">
          <el-select v-model="form.siteId" placeholder="请选择站点" style="width: 100%" filterable clearable>
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model.trim="form.ip" placeholder="请输入IP地址，支持IPv4/IPv6/CIDR" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeDialog">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRiskIpWhitelist,
  getRiskIpWhitelist,
  delRiskIpWhitelist,
  addRiskIpWhitelist,
  updateRiskIpWhitelist
} from '@/api/risk/ipWhitelist'
import { listSite } from '@/api/site/site'

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export default {
  name: 'RiskIpWhitelistPage',
  data() {
    return {
      statusOptions: STATUS_OPTIONS,
      siteOptions: [],

      listLoading: false,
      listData: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        ip: '',
        status: ''
      },

      dialogOpen: false,
      dialogTitle: '新增IP白名单',
      form: {
        id: undefined,
        siteId: '',
        ip: '',
        status: 1,
        remark: ''
      },
      rules: {
        ip: [
          { required: true, message: 'IP地址不能为空', trigger: 'blur' },
          { validator: (rule, value, callback) => this.validateIp(rule, value, callback), trigger: 'blur' }
        ],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getSiteOptions()
    this.getList()
  },
  methods: {
    sanitizePayload(payload) {
      const result = {}
      Object.keys(payload || {}).forEach((key) => {
        const value = payload[key]
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value
        }
      })
      return result
    },
    extractRows(response) {
      if (Array.isArray(response.rows)) return response.rows
      if (Array.isArray(response.records)) return response.records
      if (Array.isArray(response.list)) return response.list
      if (response.data && Array.isArray(response.data.rows)) return response.data.rows
      if (response.data && Array.isArray(response.data.records)) return response.data.records
      if (response.data && Array.isArray(response.data.list)) return response.data.list
      if (Array.isArray(response.data)) return response.data
      return []
    },
    extractTotal(response) {
      if (typeof response.total === 'number') return response.total
      if (typeof response.count === 'number') return response.count
      if (response.data && typeof response.data.total === 'number') return response.data.total
      if (response.data && typeof response.data.count === 'number') return response.data.count
      return 0
    },
    extractData(response) {
      if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          return response.data.data
        }
        return response.data
      }
      return response || {}
    },
    normalizeStatusValue(value, fallback = 1) {
      if (value === true) return 1
      if (value === false) return 2
      const status = Number(value)
      if (status === 1) return 1
      if (status === 2 || status === 0) return 2
      return fallback
    },
    buildStatusPayload(value) {
      const normalizedStatus = this.normalizeStatusValue(value, 1)
      return {
        status: normalizedStatus,
        state: normalizedStatus === 1 ? 1 : 0,
        enabled: normalizedStatus === 1
      }
    },
    resolveWhitelistId(row) {
      return this.getFieldByAliases(row, ['id', 'whitelistId', 'ipWhitelistId', 'riskIpWhitelistId'])
    },
    getWhitelistIp(row) {
      return this.getFieldByAliases(row, ['ip', 'ipAddress', 'whiteIp', 'whitelistIp', 'riskIp']) || '--'
    },
    getWhitelistRemark(row) {
      return this.getFieldByAliases(row, ['remark', 'remarks', 'memo', 'description', 'desc']) || '--'
    },
    normalizeForm(data = {}) {
      return {
        id: this.resolveWhitelistId(data) || undefined,
        siteId: this.getFieldByAliases(data, ['siteId']) || '',
        ip: this.getFieldByAliases(data, ['ip', 'ipAddress', 'whiteIp', 'whitelistIp', 'riskIp']) || '',
        status: this.normalizeStatusValue(this.getFieldByAliases(data, ['status', 'state', 'enabled']), 1),
        remark: this.getFieldByAliases(data, ['remark', 'remarks', 'memo', 'description', 'desc']) || ''
      }
    },
    buildPayload(source = {}, extra = {}) {
      const normalized = {
        ...this.normalizeForm(source),
        ...extra
      }
      const whitelistId = normalized.id || undefined
      return this.sanitizePayload({
        id: whitelistId,
        whitelistId,
        ipWhitelistId: whitelistId,
        riskIpWhitelistId: whitelistId,
        siteId: normalized.siteId,
        ip: String(normalized.ip || '').trim(),
        ipAddress: String(normalized.ip || '').trim(),
        whiteIp: String(normalized.ip || '').trim(),
        whitelistIp: String(normalized.ip || '').trim(),
        riskIp: String(normalized.ip || '').trim(),
        remark: String(normalized.remark || '').trim(),
        remarks: String(normalized.remark || '').trim(),
        description: String(normalized.remark || '').trim(),
        ...this.buildStatusPayload(normalized.status)
      })
    },
    buildQueryPayload() {
      const payload = this.sanitizePayload({
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        siteId: this.queryParams.siteId,
        ip: String(this.queryParams.ip || '').trim(),
        ipAddress: String(this.queryParams.ip || '').trim(),
        whiteIp: String(this.queryParams.ip || '').trim(),
        whitelistIp: String(this.queryParams.ip || '').trim(),
        riskIp: String(this.queryParams.ip || '').trim()
      })
      if (this.queryParams.status !== undefined && this.queryParams.status !== null && this.queryParams.status !== '') {
        return {
          ...payload,
          ...this.buildStatusPayload(this.queryParams.status)
        }
      }
      return payload
    },

    getList() {
      this.listLoading = true
      listRiskIpWhitelist(this.buildQueryPayload()).then((response) => {
        const rows = this.extractRows(response)
        this.listData = rows.map((item) => ({
          ...item,
          status: this.normalizeStatusValue(this.getFieldByAliases(item, ['status', 'state', 'enabled']), 1)
        }))
        this.total = this.extractTotal(response)
      }).finally(() => {
        this.listLoading = false
      })
    },
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then((response) => {
        const rows = Array.isArray(response.rows)
          ? response.rows
          : (response.data && Array.isArray(response.data.rows) ? response.data.rows : [])
        this.siteOptions = rows.map((site) => {
          const value = site.id !== undefined && site.id !== null && site.id !== ''
            ? site.id
            : (site.siteId !== undefined && site.siteId !== null && site.siteId !== ''
                ? site.siteId
                : '')
          const code = site.code || site.siteCode || ''
          const name = site.nameZn || site.siteName || site.name || ''
          const label = this.formatSiteCodeName(code, name)
          return { value, label, code, name }
        }).filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
      }).catch(() => {
        this.siteOptions = []
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        ip: '',
        status: ''
      }
      this.getList()
    },
    handleAdd() {
      this.resetDataForm()
      this.dialogTitle = '新增IP白名单'
      this.dialogOpen = true
    },
    handleEdit(row) {
      const id = this.resolveWhitelistId(row)
      if (!id) {
        this.$modal.msgWarning('请双击一条IP白名单数据进行编辑')
        return
      }
      getRiskIpWhitelist(id).then((response) => {
        this.resetDataForm()
        const data = this.extractData(response)
        this.form = this.normalizeForm({
          ...data,
          id
        })
        this.dialogTitle = '修改IP白名单'
        this.dialogOpen = true
      })
    },
    handleDelete(row) {
      const id = this.resolveWhitelistId(row)
      if (!id) return
      this.$modal.confirm('确认删除当前IP白名单吗？').then(() => delRiskIpWhitelist(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleStatusSwitch(row) {
      const id = this.resolveWhitelistId(row)
      if (!id) return
      const nextStatus = this.normalizeStatusValue(row.status, 1)
      const prevStatus = nextStatus === 1 ? 2 : 1
      const actionText = nextStatus === 1 ? '启用' : '禁用'
      const payload = this.buildPayload(row, { id, status: nextStatus })
      this.$modal.confirm(`确认${actionText}当前IP白名单吗？`).then(() => updateRiskIpWhitelist(payload)).then(() => {
        this.$modal.msgSuccess(`${actionText}成功`)
      }).catch(() => {
        this.$set(row, 'status', prevStatus)
      })
    },

    resetDataForm() {
      this.form = {
        id: undefined,
        siteId: '',
        ip: '',
        status: 1,
        remark: ''
      }
      this.resetForm('formRef')
    },
    closeDialog() {
      this.dialogOpen = false
      this.resetDataForm()
    },
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        const payload = this.buildPayload(this.form)
        const requestFn = payload.id ? updateRiskIpWhitelist : addRiskIpWhitelist
        const successText = payload.id ? '修改成功' : '新增成功'
        requestFn(payload).then(() => {
          this.$modal.msgSuccess(successText)
          this.dialogOpen = false
          this.getList()
        })
      })
    },

    validateIp(rule, value, callback) {
      const ip = String(value || '').trim()
      if (!ip) {
        callback(new Error('IP地址不能为空'))
        return
      }
      if (ip.length > 64) {
        callback(new Error('IP地址长度不能超过64个字符'))
        return
      }
      if (!this.isValidIpOrCidr(ip)) {
        callback(new Error('请输入正确的IPv4、IPv6或CIDR地址'))
        return
      }
      callback()
    },
    isValidIpOrCidr(value) {
      const parts = value.split('/')
      if (parts.length > 2) return false
      const ip = parts[0]
      const prefix = parts.length === 2 ? parts[1] : ''
      if (this.isValidIpv4(ip)) {
        return prefix === '' || this.isValidCidrPrefix(prefix, 0, 32)
      }
      if (this.isValidIpv6(ip)) {
        return prefix === '' || this.isValidCidrPrefix(prefix, 0, 128)
      }
      return false
    },
    isValidCidrPrefix(value, min, max) {
      if (!/^\d+$/.test(String(value))) return false
      const num = Number(value)
      return Number.isInteger(num) && num >= min && num <= max
    },
    isValidIpv4(value) {
      const segments = String(value).split('.')
      if (segments.length !== 4) return false
      return segments.every((segment) => {
        if (!/^\d+$/.test(segment)) return false
        if (segment.length > 1 && segment[0] === '0') return false
        const num = Number(segment)
        return num >= 0 && num <= 255
      })
    },
    isValidIpv6(value) {
      const ip = String(value)
      if (!ip.includes(':') || !/^[0-9a-fA-F:.]+$/.test(ip)) return false
      const compressed = ip.split('::')
      if (compressed.length > 2) return false
      const head = compressed[0] ? compressed[0].split(':') : []
      const tail = compressed.length === 2 && compressed[1] ? compressed[1].split(':') : []
      const segments = head.concat(tail)
      if (segments.some((segment) => !/^[0-9a-fA-F]{1,4}$/.test(segment))) return false
      return compressed.length === 2 ? segments.length < 8 : segments.length === 8
    },
    getSiteDisplay(row) {
      if (!row) return '--'
      const rowCode = row.siteCode || row.code || ''
      const rowName = row.siteName || row.siteNameZn || row.nameZn || row.siteNameZh || ''
      if (rowCode || rowName) return this.formatSiteCodeName(rowCode, rowName)

      const siteId = row.siteId
      if (siteId === undefined || siteId === null || siteId === '') return '--'
      const site = this.siteOptions.find((item) => String(item.value) === String(siteId))
      if (!site) return '--'
      return this.formatSiteCodeName(site.code, site.name)
    },
    formatSiteCodeName(code, name) {
      if (code && name) return `${code}/${name}`
      if (name) return name
      if (code) return code
      return '--'
    },
    getOperatorDisplay(row) {
      return this.getFieldByAliases(row, ['operator', 'operatorName', 'updateBy', 'updateName', 'createBy', 'createName']) || '--'
    },
    getFieldByAliases(row, aliases) {
      if (!row || !Array.isArray(aliases)) return ''
      let value = ''
      aliases.some((key) => {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          value = row[key]
          return true
        }
        return false
      })
      return value
    },
    formatListTime(value) {
      if (value === undefined || value === null || value === '') return '--'
      if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        const num = Number(value)
        const ms = num > 9999999999 ? num : num * 1000
        return this.parseTime(ms, '{y}-{m}-{d} {h}:{i}:{s}')
      }
      return value
    }
  }
}
</script>

<style scoped>
.risk-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 0 0;
}

.risk-query {
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 12px;
}

.risk-query .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.risk-query .el-form-item__label {
  padding-right: 8px;
}

.risk-query .query-item--sm .query-control {
  width: 180px;
}

.risk-query .query-item--lg .query-control {
  width: 280px;
}

.risk-query .query-actions {
  margin-left: auto;
}

.risk-query .query-actions .el-form-item__content {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 1200px) {
  .risk-query .query-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .risk-query .query-item--sm .query-control,
  .risk-query .query-item--lg .query-control {
    width: 100%;
  }
}

.risk-toolbar {
  display: flex;
  justify-content: flex-start;
  padding: 12px 16px 12px;
}
</style>
