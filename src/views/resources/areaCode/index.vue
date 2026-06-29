<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="站点" prop="siteId">
        <el-select
          v-model="queryParams.siteId"
          placeholder="请选择站点"
          clearable
          filterable
          size="small"
          style="width: 220px"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.id"
            :label="site.nameZn ? site.nameZn + ' (' + site.code + ')' : site.code"
            :value="site.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="区号" prop="areaCode">
        <el-input
          v-model="queryParams.areaCode"
          placeholder="请输入区号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="国家代码" prop="countryCode">
        <el-input
          v-model="queryParams.countryCode"
          placeholder="请输入国家代码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="英文编码" prop="countryEnCode">
        <el-input
          v-model="queryParams.countryEnCode"
          placeholder="请输入英文编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small" style="width: 120px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用范围" prop="scopeType">
        <el-select v-model="queryParams.scopeType" placeholder="请选择适用范围" clearable size="small" style="width: 120px">
          <el-option
            v-for="item in scopeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['resources:areaCode:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['resources:areaCode:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['resources:areaCode:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="areaCodeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="站点" align="center" min-width="150" fixed="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.siteName || scope.row.siteId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="区号" align="center" prop="areaCode" width="120" />
      <el-table-column label="国家代码" align="center" prop="countryCode" width="140" show-overflow-tooltip />
      <el-table-column label="英文编码" align="center" prop="countryEnCode" width="140" show-overflow-tooltip />
      <el-table-column label="适用范围" align="center" prop="scopeType" width="100">
        <template slot-scope="scope">
          <span>{{ formatScopeType(scope.row.scopeType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="Number(scope.row.status) === 1 ? 'success' : 'info'">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['resources:areaCode:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['resources:areaCode:remove']"
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

    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="站点" prop="siteId">
              <el-select v-model="form.siteId" placeholder="请选择站点" filterable style="width: 100%">
                <el-option
                  v-for="site in siteOptions"
                  :key="site.id"
                  :label="site.nameZn ? site.nameZn + ' (' + site.code + ')' : site.code"
                  :value="site.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区号" prop="areaCode">
              <el-input v-model="form.areaCode" placeholder="请输入区号" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="国家代码" prop="countryCode">
              <el-input v-model="form.countryCode" placeholder="请输入国家代码" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文编码" prop="countryEnCode">
              <el-input v-model="form.countryEnCode" placeholder="请输入英文编码" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="适用范围" prop="scopeType">
              <el-select v-model="form.scopeType" placeholder="请选择适用范围" style="width: 100%">
                <el-option
                  v-for="item in scopeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="form.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
import { listAreaCode, getAreaCode, addAreaCode, updateAreaCode, delAreaCode } from '@/api/resources/areaCode'

export default {
  name: 'AreaCode',
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      areaCodeList: [],
      siteOptions: [],
      title: '',
      open: false,
      statusOptions: [
        { value: 1, label: '启用' },
        { value: 0, label: '禁用' }
      ],
      scopeTypeOptions: [
        { value: 0, label: '国内' },
        { value: 1, label: '海外' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        areaCode: undefined,
        countryCode: undefined,
        countryEnCode: undefined,
        status: undefined,
        scopeType: undefined
      },
      form: {},
      rules: {
        siteId: [
          { required: true, message: '站点不能为空', trigger: 'change' }
        ],
        areaCode: [
          { required: true, message: '区号不能为空', trigger: 'blur' }
        ],
        countryCode: [
          { required: true, message: '国家代码不能为空', trigger: 'blur' }
        ],
        countryEnCode: [
          { required: true, message: '英文编码不能为空', trigger: 'blur' }
        ],
        scopeType: [
          { required: true, message: '适用范围不能为空', trigger: 'change' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadSiteOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listAreaCode(this.queryParams).then(response => {
        this.areaCodeList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.siteOptions = response.rows || []
      })
    },
    formatStatus(value) {
      const normalized = value === null || value === undefined || value === '' ? undefined : Number(value)
      const item = this.statusOptions.find(option => option.value === normalized)
      return item ? item.label : value || '-'
    },
    formatScopeType(value) {
      const item = this.scopeTypeOptions.find(option => option.value === String(value))
      if (item) {
        return item.label
      }
      const numeric = Number(value)
      const fallback = this.scopeTypeOptions.find(option => option.value === numeric)
      return fallback ? fallback.label : value || '-'
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    reset() {
        this.form = {
          id: undefined,
          siteId: undefined,
          areaCode: '',
          countryCode: '',
          countryEnCode: '',
          scopeType: 0,
          status: 1
        }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.title = '新增区号配置'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getAreaCode(id).then(response => {
        const data = response.data || {}
        this.form = {
          ...this.form,
          ...data,
          scopeType: data.scopeType == null ? 0 : Number(data.scopeType),
          status: data.status == null ? 1 : Number(data.status)
        }
        this.title = '修改区号配置'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          ...this.form,
          scopeType: this.form.scopeType == null ? null : Number(this.form.scopeType),
          status: this.form.status == null ? null : Number(this.form.status)
        }
        const request = payload.id ? updateAreaCode(payload) : addAreaCode(payload)
        request.then(() => {
          this.$modal.msgSuccess(payload.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm(`是否确认删除区号配置编号为"${ids}"的数据项？`).then(() => {
        return delAreaCode(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    }
  }
}
</script>
