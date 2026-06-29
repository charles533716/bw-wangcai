<template>
  <div class="app-container risk-page">
    <div class="risk-card">
      <el-form
        ref="ruleQueryForm"
        :model="ruleQuery"
        :inline="true"
        size="small"
        label-width="78px"
        class="risk-query"
      >
        <el-form-item class="query-item query-item--sm" label="站点" prop="siteId">
          <el-select v-model="ruleQuery.siteId" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-item query-item--sm" label="业务类型" prop="type">
          <el-select v-model="ruleQuery.type" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-item query-item--sm" label="状态" prop="status">
          <el-select v-model="ruleQuery.status" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-item query-item--lg" label="规则名称" prop="ruleName">
          <el-input
            v-model="ruleQuery.ruleName"
            class="query-control"
            placeholder="请输入规则名称"
            clearable
            @keyup.enter.native="handleRuleQuery"
          />
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleRuleQuery">查询</el-button>
          <el-button type="info" size="mini" @click="resetRuleQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="risk-toolbar">
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAddRule">新增规则</el-button>
        <el-button type="warning" plain size="mini" icon="el-icon-download" @click="handleRuleExport">导出</el-button>
      </div>

      <el-table v-loading="ruleLoading" :data="ruleList" @row-dblclick="handleEditRule">
        <el-table-column label="ID" align="center" prop="id" width="80" />
        <el-table-column label="站点code/站点名称" align="center" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ getSiteDisplay(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务类型" align="center" min-width="140">
          <template slot-scope="scope">
            <span>{{ getTypeDisplay(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规则名称" align="center" prop="ruleName" min-width="180" show-overflow-tooltip />
        <el-table-column label="规则code" align="center" prop="ruleCode" min-width="170" show-overflow-tooltip />
        <el-table-column label="预警动作" align="center" min-width="130">
          <template slot-scope="scope">
            <span>{{ getModeDisplay(scope.row.mode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规则说明" align="center" prop="ruleDesc" min-width="260" show-overflow-tooltip />
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
        <el-table-column label="创建时间" align="center" min-width="170">
          <template slot-scope="scope">
            <span>{{ formatListTime(getFieldByAliases(scope.row, ['createTime', 'createAt', 'createdAt', 'gmtCreate'])) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" min-width="170">
          <template slot-scope="scope">
            <span>{{ formatListTime(getFieldByAliases(scope.row, ['updateTime', 'updateAt', 'updatedAt', 'gmtModified'])) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" min-width="130" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ getOperatorDisplay(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="handleEditRule(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click.stop="handleDeleteRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="ruleTotal > 0"
        :total="ruleTotal"
        :page.sync="ruleQuery.pageNum"
        :limit.sync="ruleQuery.pageSize"
        @pagination="getRuleList"
      />
    </div>

      <el-dialog :title="ruleDialogTitle" :visible.sync="ruleDialogOpen" width="620px" append-to-body>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="ruleRules" label-width="100px">
        <el-form-item label="站点" prop="siteId">
          <el-select v-model="ruleForm.siteId" placeholder="请选择站点" style="width: 100%" filterable>
            <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择业务类型" style="width: 100%" @change="handleRuleTypeChange">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="随业务类型自动带入" readonly />
        </el-form-item>
        <el-form-item label="规则code" prop="ruleCode">
          <el-input v-model="ruleForm.ruleCode" placeholder="随业务类型自动带入" readonly />
        </el-form-item>
        <el-form-item label="配置内容" prop="ruleValue">
          <div v-if="isCountRuleType(ruleForm.type)" class="rule-value-inline">
            <span class="rule-value-text">次数超过</span>
            <el-input-number
              v-model="ruleConfigForm.count"
              :min="1"
              :precision="0"
              :step="1"
              controls-position="right"
              class="rule-value-number"
            />
            <span class="rule-value-text">次触发风控内容</span>
          </div>
          <div v-else-if="isScaleRuleType(ruleForm.type)" class="rule-value-inline">
            <span class="rule-value-text">投注输赢比大于</span>
            <el-input
              v-model="ruleConfigForm.scale"
              class="rule-value-scale"
              placeholder="请输入比例，如 0.8"
              clearable
            />
            <span class="rule-value-text">触发风控内容</span>
          </div>
          <div v-else class="rule-value-raw">
            <el-input
              v-model="ruleConfigForm.raw"
              type="textarea"
              :rows="3"
              placeholder="请输入配置内容，支持 JSON 或纯文本"
            />
          </div>
        </el-form-item>
        <el-form-item label="预警动作" prop="mode">
          <el-select v-model="ruleForm.mode" placeholder="请选择预警动作" style="width: 100%">
            <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="ruleForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则说明" prop="ruleDesc">
          <el-input v-model="ruleForm.ruleDesc" type="textarea" :rows="3" placeholder="请输入规则说明" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRuleForm">确 定</el-button>
        <el-button @click="closeRuleDialog">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRule,
  getRule,
  delRule,
  addRule,
  updateRule
} from '@/api/risk/rule'
import { listType } from '@/api/risk/type'
import { listSite } from '@/api/site/site'
import {
  LEGACY_RISK_TYPE_OPTIONS,
  normalizeRiskTypeOptions,
  getRiskTypeLabel,
  getRiskTypeMode,
  getRiskTypeField,
  getRiskTypeOption
} from '@/utils/riskType'

const MODE_OPTIONS = [
  { label: '标记预警', value: 1 },
  { label: '强制业务中断', value: 2 }
]

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export default {
  name: 'RiskRulePage',
  data() {
    return {
      typeOptions: LEGACY_RISK_TYPE_OPTIONS.map((item) => ({ ...item })),
      modeOptions: MODE_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      siteOptions: [],

      ruleLoading: false,
      ruleList: [],
      ruleTotal: 0,
      ruleQuery: {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        type: '',
        status: '',
        ruleName: ''
      },

      ruleDialogOpen: false,
      ruleDialogTitle: '新增规则',
      ruleForm: {
        id: undefined,
        siteId: '',
        ruleName: '',
        ruleCode: '',
        ruleValue: '',
        type: LEGACY_RISK_TYPE_OPTIONS[0].value,
        mode: 1,
        status: 1,
        ruleDesc: ''
      },
      ruleConfigForm: {
        count: 10,
        scale: '0.8',
        raw: ''
      },
      ruleRules: {
        siteId: [{ required: true, message: '站点不能为空', trigger: 'change' }],
        ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
        ruleCode: [{ required: true, message: '规则code不能为空', trigger: 'blur' }],
        ruleValue: [{ required: true, message: '配置内容不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '业务类型不能为空', trigger: 'change' }],
        mode: [{ required: true, message: '预警动作不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getSiteOptions()
    this.getRiskTypeOptions()
    this.getRuleList()
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
      if (response.data && Array.isArray(response.data.rows)) return response.data.rows
      if (Array.isArray(response.data)) return response.data
      return []
    },
    extractTotal(response) {
      if (typeof response.total === 'number') return response.total
      if (response.data && typeof response.data.total === 'number') return response.data.total
      return 0
    },
    extractData(response) {
      if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data
      }
      return response || {}
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
    getRiskTypeOptions() {
      listType({ pageNum: 1, pageSize: 1000 }).then((response) => {
        this.typeOptions = normalizeRiskTypeOptions(response, LEGACY_RISK_TYPE_OPTIONS)
        this.ensureRuleTypeValue()
      }).catch(() => {
        this.typeOptions = LEGACY_RISK_TYPE_OPTIONS.map((item) => ({ ...item }))
        this.ensureRuleTypeValue()
      })
    },
    ensureRuleTypeValue() {
      if (!this.typeOptions.length) return
      const currentValue = this.ruleForm && this.ruleForm.type
      const exists = this.typeOptions.some((item) => String(item.value) === String(currentValue))
      if (!exists) {
        this.$set(this.ruleForm, 'type', this.typeOptions[0].value)
      }
      this.syncRuleIdentityByType(this.ruleForm.type)
    },
    resolveRuleTypeValue(source) {
      if (source === undefined || source === null || source === '') return ''
      if (typeof source !== 'object') return source
      return getRiskTypeField(source, ['type', 'ruleType', 'typeId', 'riskTypeId']) || ''
    },
    getCurrentRuleTypeMode(type = this.ruleForm.type) {
      return getRiskTypeMode(this.typeOptions, this.resolveRuleTypeValue(type))
    },
    syncRuleIdentityByType(type = this.ruleForm.type) {
      const option = getRiskTypeOption(this.typeOptions, this.resolveRuleTypeValue(type))
      const ruleName = option && option.label ? option.label : this.getTypeDisplay(type)
      const ruleCode = option && option.code ? option.code : ''
      this.$set(this.ruleForm, 'ruleName', ruleName === '--' ? '' : String(ruleName || ''))
      this.$set(this.ruleForm, 'ruleCode', String(ruleCode || ''))
    },

    getRuleList() {
      this.ruleLoading = true
      const payload = this.sanitizePayload({ ...this.ruleQuery })
      listRule(payload).then((response) => {
        const rows = this.extractRows(response)
        this.ruleList = rows
        this.ruleTotal = this.extractTotal(response)
      }).finally(() => {
        this.ruleLoading = false
      })
    },
    handleRuleQuery() {
      this.ruleQuery.pageNum = 1
      this.getRuleList()
    },
    handleRuleExport() {
      const params = this.sanitizePayload({ ...this.ruleQuery })
      this.download('/api/admin/risk/exportRiskRule', params, `risk_rule_${new Date().getTime()}.xlsx`)
    },
    resetRuleQuery() {
      this.resetForm('ruleQueryForm')
      this.ruleQuery = {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        type: '',
        status: '',
        ruleName: ''
      }
      this.getRuleList()
    },
    handleAddRule() {
      this.resetRuleForm()
      this.syncRuleIdentityByType(this.ruleForm.type)
      this.ruleDialogTitle = '新增规则'
      this.ruleDialogOpen = true
    },
    handleEditRule(row) {
      if (!row || !row.id) {
        this.$modal.msgWarning('请双击一条规则进行编辑')
        return
      }
      getRule(row.id).then((response) => {
        this.resetRuleForm()
        const data = this.extractData(response)
        this.ruleForm = {
          ...this.ruleForm,
          ...data,
          siteId: data.siteId === undefined || data.siteId === null ? '' : data.siteId,
          type: this.resolveRuleTypeValue(data)
        }
        this.syncRuleIdentityByType(this.ruleForm.type)
        this.syncRuleConfigFormByRuleValue()
        this.ruleDialogTitle = '修改规则'
        this.ruleDialogOpen = true
      })
    },
    resetRuleForm() {
      this.ruleForm = {
        id: undefined,
        siteId: '',
        ruleName: '',
        ruleCode: '',
        ruleValue: '',
        type: this.typeOptions.length ? this.typeOptions[0].value : LEGACY_RISK_TYPE_OPTIONS[0].value,
        mode: 1,
        status: 1,
        ruleDesc: ''
      }
      this.ruleConfigForm = {
        count: 10,
        scale: '0.8',
        raw: ''
      }
      this.resetForm('ruleFormRef')
      this.syncRuleIdentityByType(this.ruleForm.type)
    },
    closeRuleDialog() {
      this.ruleDialogOpen = false
      this.resetRuleForm()
    },
    submitRuleForm() {
      if (!this.buildRuleValueByType()) return
      this.syncRuleIdentityByType(this.ruleForm.type)
      this.$refs.ruleFormRef.validate((valid) => {
        if (!valid) return
        const payload = this.sanitizePayload({ ...this.ruleForm })
        const requestFn = payload.id ? updateRule : addRule
        const successText = payload.id ? '修改成功' : '新增成功'
        requestFn(payload).then(() => {
          this.$modal.msgSuccess(successText)
          this.ruleDialogOpen = false
          this.getRuleList()
        })
      })
    },
    handleDeleteRule(row) {
      if (!row || !row.id) return
      this.$modal.confirm('确认删除当前风控规则吗？').then(() => delRule(row.id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getRuleList()
      }).catch(() => {})
    },
    handleStatusSwitch(row) {
      if (!row || !row.id) return
      const nextStatus = Number(row.status) === 1 ? 1 : 2
      const prevStatus = nextStatus === 1 ? 2 : 1
      const actionText = nextStatus === 1 ? '启用' : '禁用'
      const payload = this.sanitizePayload({
        id: row.id,
        siteId: row.siteId,
        ruleName: row.ruleName,
        ruleCode: row.ruleCode,
        ruleValue: row.ruleValue,
        type: this.resolveRuleTypeValue(row),
        mode: row.mode,
        status: nextStatus,
        ruleDesc: row.ruleDesc
      })
      this.$modal.confirm(`确认${actionText}当前风控规则吗？`).then(() => updateRule(payload)).then(() => {
        this.$modal.msgSuccess(`${actionText}成功`)
      }).catch(() => {
        this.$set(row, 'status', prevStatus)
      })
    },
    isCountRuleType(type) {
      return this.getCurrentRuleTypeMode(type) === 'count'
    },
    isScaleRuleType(type) {
      return this.getCurrentRuleTypeMode(type) === 'scale'
    },
    handleRuleTypeChange(type) {
      this.syncRuleIdentityByType(type)
      const currentMode = this.getCurrentRuleTypeMode(type)
      if (currentMode === 'count') {
        if (!this.ruleConfigForm.count || Number(this.ruleConfigForm.count) <= 0) {
          this.$set(this.ruleConfigForm, 'count', 10)
        }
        return
      }
      if (currentMode === 'scale') {
        if (!String(this.ruleConfigForm.scale || '').trim()) {
          this.$set(this.ruleConfigForm, 'scale', '0.8')
        }
        return
      }
      if (!String(this.ruleConfigForm.raw || '').trim()) {
        this.$set(this.ruleConfigForm, 'raw', this.formatRuleValueForRaw(this.ruleForm.ruleValue))
      }
    },
    parseRuleValue(rawValue) {
      if (!rawValue) return {}
      if (typeof rawValue === 'object') return rawValue
      if (typeof rawValue !== 'string') return {}
      try {
        return JSON.parse(rawValue)
      } catch (e) {
        return {}
      }
    },
    formatRuleValueForRaw(rawValue) {
      if (rawValue === undefined || rawValue === null || rawValue === '') return ''
      if (typeof rawValue === 'string') return rawValue
      if (typeof rawValue === 'object') {
        try {
          return JSON.stringify(rawValue, null, 2)
        } catch (e) {
          return ''
        }
      }
      return String(rawValue)
    },
    syncRuleConfigFormByRuleValue() {
      const parsed = this.parseRuleValue(this.ruleForm.ruleValue)
      const currentMode = this.getCurrentRuleTypeMode(this.ruleForm.type)
      if (currentMode === 'count') {
        const countValue = Number(parsed.count)
        this.ruleConfigForm.count = Number.isFinite(countValue) && countValue > 0 ? Math.floor(countValue) : 10
        return
      }
      if (currentMode === 'scale') {
        const scaleValue = parsed.scale === undefined || parsed.scale === null ? '' : String(parsed.scale)
        this.ruleConfigForm.scale = scaleValue || '0.8'
        return
      }
      this.ruleConfigForm.raw = this.formatRuleValueForRaw(this.ruleForm.ruleValue)
    },
    buildRuleValueByType() {
      const currentMode = this.getCurrentRuleTypeMode(this.ruleForm.type)
      if (currentMode === 'count') {
        const count = Number(this.ruleConfigForm.count)
        if (!Number.isInteger(count) || count <= 0) {
          this.$modal.msgWarning('请输入大于0的整数次数')
          return false
        }
        this.ruleForm.ruleValue = JSON.stringify({ count })
        return true
      }
      if (currentMode === 'scale') {
        const scale = String(this.ruleConfigForm.scale || '').trim()
        const scaleNumber = Number(scale)
        if (!scale || !Number.isFinite(scaleNumber) || scaleNumber <= 0) {
          this.$modal.msgWarning('请输入大于0的投注输赢比')
          return false
        }
        this.ruleForm.ruleValue = JSON.stringify({ scale })
        return true
      }
      const rawValue = String(this.ruleConfigForm.raw || '').trim()
      if (!rawValue) {
        this.$modal.msgWarning('请输入配置内容')
        return false
      }
      this.ruleForm.ruleValue = rawValue
      return true
    },

    getTypeDisplay(value) {
      if (value && typeof value === 'object') {
        const directName = getRiskTypeField(value, ['typeName', 'ruleTypeName', 'riskTypeName'])
        if (directName) return directName
        return getRiskTypeLabel(this.typeOptions, this.resolveRuleTypeValue(value))
      }
      return getRiskTypeLabel(this.typeOptions, value)
    },
    getModeDisplay(value) {
      return this.getOptionLabel(this.modeOptions, value)
    },
    getStatusDisplay(value) {
      return this.getOptionLabel(this.statusOptions, value)
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
    },
    getOptionLabel(options, value) {
      const target = Number(value)
      const item = options.find((opt) => Number(opt.value) === target)
      if (item) return item.label
      if (value === undefined || value === null || value === '') return '--'
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
  padding: 8px 0 0;
}

.risk-query {
  padding: 0 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px 12px;
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
  margin-left: 0;
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
  .risk-query .query-actions {
    padding-left: 0;
  }
}

.risk-toolbar {
  display: flex;
  justify-content: flex-start;
  padding: 8px 16px;
}

.rule-value-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.rule-value-raw {
  width: 100%;
}

.rule-value-text {
  color: #606266;
  line-height: 32px;
}

.rule-value-number {
  width: 150px;
}

.rule-value-scale {
  width: 180px;
}
</style>
