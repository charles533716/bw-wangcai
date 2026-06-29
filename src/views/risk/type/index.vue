<template>
  <div class="app-container risk-page">
    <div class="risk-card">
      <el-form
        ref="typeQueryForm"
        :model="typeQuery"
        :inline="true"
        size="small"
        label-width="78px"
        class="risk-query"
      >
        <el-form-item class="query-item query-item--sm" label="状态" prop="status">
          <el-select v-model="typeQuery.status" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-item query-item--lg" label="类型名称" prop="typeName">
          <el-input
            v-model="typeQuery.typeName"
            class="query-control"
            placeholder="请输入类型名称"
            clearable
            @keyup.enter.native="handleTypeQuery"
          />
        </el-form-item>
        <el-form-item class="query-item query-item--lg" label="类型code" prop="typeCode">
          <el-input
            v-model="typeQuery.typeCode"
            class="query-control"
            placeholder="请输入类型code"
            clearable
            @keyup.enter.native="handleTypeQuery"
          />
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleTypeQuery">查询</el-button>
          <el-button type="info" size="mini" @click="resetTypeQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="risk-toolbar">
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAddType">新增风控类型</el-button>
        <el-button type="warning" plain size="mini" icon="el-icon-download" @click="handleTypeExport">导出</el-button>
      </div>

      <el-table v-loading="typeLoading" :data="typeList" @row-dblclick="handleEditType">
        <el-table-column label="ID" align="center" width="80">
          <template slot-scope="scope">{{ resolveTypeId(scope.row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="类型名称" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ getTypeName(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="类型code" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">{{ getTypeCode(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="类型说明" align="center" min-width="260" show-overflow-tooltip>
          <template slot-scope="scope">{{ getTypeDesc(scope.row) }}</template>
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
            <el-button type="text" size="mini" @click.stop="handleEditType(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click.stop="handleDeleteType(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="typeTotal > 0"
        :total="typeTotal"
        :page.sync="typeQuery.pageNum"
        :limit.sync="typeQuery.pageSize"
        @pagination="getTypeList"
      />
    </div>

    <el-dialog :title="typeDialogTitle" :visible.sync="typeDialogOpen" width="620px" append-to-body>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="typeForm.typeName" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型code" prop="typeCode">
          <el-input v-model="typeForm.typeCode" placeholder="请输入类型code" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="typeForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型说明" prop="typeDesc">
          <el-input v-model="typeForm.typeDesc" type="textarea" :rows="3" placeholder="请输入类型说明" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitTypeForm">确 定</el-button>
        <el-button @click="closeTypeDialog">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listType,
  getType,
  delType,
  addType,
  updateType
} from '@/api/risk/type'

const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 2 }
]

export default {
  name: 'RiskTypePage',
  data() {
    return {
      statusOptions: STATUS_OPTIONS,

      typeLoading: false,
      typeList: [],
      typeTotal: 0,
      typeQuery: {
        pageNum: 1,
        pageSize: 20,
        status: '',
        typeName: '',
        typeCode: ''
      },

      typeDialogOpen: false,
      typeDialogTitle: '新增风控类型',
      typeForm: {
        id: undefined,
        typeName: '',
        typeCode: '',
        status: 1,
        typeDesc: ''
      },
      typeRules: {
        typeName: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
        typeCode: [{ required: true, message: '类型code不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getTypeList()
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
    normalizeStatusValue(value, fallback = 1) {
      const status = Number(value)
      if (status === 1) return 1
      if (status === 2 || status === 0) return 2
      return fallback
    },
    resolveTypeId(row) {
      return this.getFieldByAliases(row, ['id', 'typeId', 'riskTypeId'])
    },
    getTypeName(row) {
      return this.getFieldByAliases(row, ['typeName', 'name', 'riskTypeName']) || '--'
    },
    getTypeCode(row) {
      return this.getFieldByAliases(row, ['typeCode', 'code', 'riskTypeCode']) || '--'
    },
    getTypeDesc(row) {
      return this.getFieldByAliases(row, ['typeDesc', 'description', 'remark']) || '--'
    },
    normalizeTypeForm(data = {}) {
      return {
        id: this.resolveTypeId(data) || undefined,
        typeName: this.getFieldByAliases(data, ['typeName', 'name', 'riskTypeName']) || '',
        typeCode: this.getFieldByAliases(data, ['typeCode', 'code', 'riskTypeCode']) || '',
        status: this.normalizeStatusValue(this.getFieldByAliases(data, ['status', 'state']), 1),
        typeDesc: this.getFieldByAliases(data, ['typeDesc', 'description', 'remark']) || ''
      }
    },
    buildStatusPayload(value) {
      const normalizedStatus = this.normalizeStatusValue(value, 1)
      return {
        status: normalizedStatus,
        state: normalizedStatus === 1 ? 1 : 0
      }
    },
    buildTypePayload(source = {}, extra = {}) {
      const normalized = {
        ...this.normalizeTypeForm(source),
        ...extra
      }
      const typeId = normalized.id || undefined
      return this.sanitizePayload({
        id: typeId,
        typeId,
        riskTypeId: typeId,
        typeName: normalized.typeName,
        name: normalized.typeName,
        riskTypeName: normalized.typeName,
        typeCode: normalized.typeCode,
        code: normalized.typeCode,
        riskTypeCode: normalized.typeCode,
        typeDesc: normalized.typeDesc,
        description: normalized.typeDesc,
        remark: normalized.typeDesc,
        ...this.buildStatusPayload(normalized.status)
      })
    },
    buildTypeQueryPayload() {
      const payload = this.sanitizePayload({
        pageNum: this.typeQuery.pageNum,
        pageSize: this.typeQuery.pageSize,
        typeName: this.typeQuery.typeName,
        name: this.typeQuery.typeName,
        riskTypeName: this.typeQuery.typeName,
        typeCode: this.typeQuery.typeCode,
        code: this.typeQuery.typeCode,
        riskTypeCode: this.typeQuery.typeCode
      })
      if (this.typeQuery.status !== undefined && this.typeQuery.status !== null && this.typeQuery.status !== '') {
        return {
          ...payload,
          ...this.buildStatusPayload(this.typeQuery.status)
        }
      }
      return payload
    },

    getTypeList() {
      this.typeLoading = true
      const payload = this.buildTypeQueryPayload()
      listType(payload).then((response) => {
        const rows = this.extractRows(response)
        this.typeList = rows.map((item) => ({
          ...item,
          status: this.normalizeStatusValue(this.getFieldByAliases(item, ['status', 'state']), 1)
        }))
        this.typeTotal = this.extractTotal(response)
      }).finally(() => {
        this.typeLoading = false
      })
    },
    handleTypeQuery() {
      this.typeQuery.pageNum = 1
      this.getTypeList()
    },
    handleTypeExport() {
      const params = this.buildTypeQueryPayload()
      this.download('/api/admin/risk/exportRiskType', params, `risk_type_${new Date().getTime()}.xlsx`)
    },
    resetTypeQuery() {
      this.resetForm('typeQueryForm')
      this.typeQuery = {
        pageNum: 1,
        pageSize: 20,
        status: '',
        typeName: '',
        typeCode: ''
      }
      this.getTypeList()
    },
    handleAddType() {
      this.resetTypeForm()
      this.typeDialogTitle = '新增风控类型'
      this.typeDialogOpen = true
    },
    handleEditType(row) {
      const id = this.resolveTypeId(row)
      if (!id) {
        this.$modal.msgWarning('请双击一条类型数据进行编辑')
        return
      }
      getType(id).then((response) => {
        this.resetTypeForm()
        const data = this.extractData(response)
        this.typeForm = this.normalizeTypeForm({
          ...data,
          id
        })
        this.typeDialogTitle = '修改风控类型'
        this.typeDialogOpen = true
      })
    },
    handleDeleteType(row) {
      const id = this.resolveTypeId(row)
      if (!id) return
      this.$modal.confirm('确认删除当前风控类型吗？').then(() => delType(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getTypeList()
      }).catch(() => {})
    },
    handleStatusSwitch(row) {
      const id = this.resolveTypeId(row)
      if (!id) return
      const nextStatus = this.normalizeStatusValue(row.status, 1)
      const prevStatus = nextStatus === 1 ? 2 : 1
      const actionText = nextStatus === 1 ? '启用' : '禁用'
      const payload = this.buildTypePayload(row, { id, status: nextStatus })
      this.$modal.confirm(`确认${actionText}当前风控类型吗？`).then(() => updateType(payload)).then(() => {
        this.$modal.msgSuccess(`${actionText}成功`)
      }).catch(() => {
        this.$set(row, 'status', prevStatus)
      })
    },

    resetTypeForm() {
      this.typeForm = {
        id: undefined,
        typeName: '',
        typeCode: '',
        status: 1,
        typeDesc: ''
      }
      this.resetForm('typeFormRef')
    },
    closeTypeDialog() {
      this.typeDialogOpen = false
      this.resetTypeForm()
    },
    submitTypeForm() {
      this.$refs.typeFormRef.validate((valid) => {
        if (!valid) return
        const payload = this.buildTypePayload(this.typeForm)
        const requestFn = payload.id ? updateType : addType
        const successText = payload.id ? '修改成功' : '新增成功'
        requestFn(payload).then(() => {
          this.$modal.msgSuccess(successText)
          this.typeDialogOpen = false
          this.getTypeList()
        })
      })
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
}

.risk-toolbar {
  display: flex;
  justify-content: flex-start;
  padding: 8px 16px;
}
</style>
