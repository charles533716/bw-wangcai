<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="线路" prop="lineId">
        <el-select v-model="queryParams.lineId" placeholder="请选择线路" clearable size="small" filterable>
          <el-option v-for="line in lineOptions" :key="line.id" :label="line.lineName" :value="line.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="厂商编码" prop="factoryCode">
        <el-input v-model="queryParams.factoryCode" placeholder="请输入厂商编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="厂商名称" prop="factoryName">
        <el-input v-model="queryParams.factoryName" placeholder="请输入厂商名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="子平台" prop="subPlatform">
        <el-input v-model="queryParams.subPlatform" placeholder="请输入子平台" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="钱包编码" prop="walletCode">
        <el-input v-model="queryParams.walletCode" placeholder="请输入钱包编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="场馆类型" prop="venueType">
        <el-select v-model="queryParams.venueType" placeholder="请选择场馆类型" clearable size="small">
          <el-option v-for="dict in dict.type.venue_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['resources:gameFactory:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['resources:gameFactory:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['resources:gameFactory:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="factoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="线路" align="center" prop="lineName" min-width="130" />
      <el-table-column label="厂商编码" align="center" prop="factoryCode" min-width="120" />
      <el-table-column label="厂商名称" align="center" prop="factoryName" min-width="140" />
      <el-table-column label="子平台" align="center" prop="subPlatform" min-width="120" show-overflow-tooltip />
      <el-table-column label="钱包编码" align="center" prop="walletCode" min-width="120" show-overflow-tooltip />
      <el-table-column label="场馆类型" align="center" prop="venueType" width="110">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.venueType" />
        </template>
      </el-table-column>
      <el-table-column label="Logo地址" align="center" prop="logImg" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="备注" align="center" prop="remark" min-width="150" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" width="170">
        <template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['resources:gameFactory:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['resources:gameFactory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路" prop="lineId">
              <el-select v-model="form.lineId" placeholder="请选择线路" filterable style="width: 100%">
                <el-option v-for="line in lineOptions" :key="line.id" :label="line.lineName" :value="line.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂商编码" prop="factoryCode">
              <el-input v-model="form.factoryCode" placeholder="如：ag / pg" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="厂商名称" prop="factoryName">
              <el-input v-model="form.factoryName" placeholder="请输入厂商名称" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子平台" prop="subPlatform">
              <el-input v-model="form.subPlatform" placeholder="可选" maxlength="64" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="钱包编码" prop="walletCode">
              <el-input v-model="form.walletCode" placeholder="可选" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场馆类型" prop="venueType">
              <el-select v-model="form.venueType" placeholder="请选择场馆类型" filterable style="width: 100%">
                <el-option v-for="dict in dict.type.venue_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Logo地址" prop="logImg">
              <ImageUpload v-model="form.logImg" :limit="1" :isShowTip="false" />
              <el-input v-model="form.logImg" placeholder="上传后自动回填，可手动修改" maxlength="255" style="margin-top: 8px;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addGameFactory, delGameFactory, getGameFactory, listGameFactory, updateGameFactory } from '@/api/resources/gameFactory'
import { listGameLine } from '@/api/resources/gameLine'

export default {
  name: 'GameFactory',
  dicts: ['venue_type'],
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      factoryList: [],
      lineOptions: [],
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      statusOptions: [
        { value: 1, label: '启用' },
        { value: 0, label: '禁用' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lineId: undefined,
        factoryCode: undefined,
        factoryName: undefined,
        subPlatform: undefined,
        walletCode: undefined,
        venueType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        lineId: [{ required: true, message: '线路不能为空', trigger: 'change' }],
        factoryCode: [{ required: true, message: '厂商编码不能为空', trigger: 'blur' }],
        factoryName: [{ required: true, message: '厂商名称不能为空', trigger: 'blur' }],
        venueType: [{ required: true, message: '场馆类型不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadLineOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listGameFactory(this.queryParams).then(response => {
        this.factoryList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    loadLineOptions() {
      listGameLine({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.lineOptions = response.rows || []
      })
    },
    statusLabel(value) {
      const found = this.statusOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value)
    },
    reset() {
      this.form = {
        id: undefined,
        lineId: undefined,
        factoryCode: undefined,
        factoryName: undefined,
        subPlatform: undefined,
        walletCode: undefined,
        venueType: undefined,
        logImg: undefined,
        sort: 0,
        status: 0,
        remark: undefined
      }
      this.resetForm('form')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增游戏厂商'
    },
    handleUpdate(row) {
      const id = row ? row.id : this.ids[0]
      getGameFactory(id).then(response => {
        this.reset()
        this.form = Object.assign({}, this.form, response.data)
        this.open = true
        this.title = '修改游戏厂商'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const submitData = Object.assign({}, this.form)
        submitData.lineId = Number(submitData.lineId)
        if (!Number.isInteger(submitData.lineId) || submitData.lineId <= 0) {
          this.$modal.msgError('请选择有效的线路')
          return
        }
        const selectedLine = this.lineOptions.find(item => Number(item.id) === submitData.lineId)
        submitData.lineCode = selectedLine ? selectedLine.lineCode : undefined
        const api = submitData.id ? updateGameFactory : addGameFactory
        api(submitData).then(() => {
          this.$modal.msgSuccess(this.form.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row ? row.id : this.ids.join(',')
      this.$modal.confirm('是否确认删除厂商ID为"' + ids + '"的数据项？').then(() => {
        return delGameFactory(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
