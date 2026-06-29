<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="币种编码" prop="currencyCode">
        <el-input v-model="queryParams.currencyCode" placeholder="请输入币种编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="币种名称" prop="currencyName">
        <el-input v-model="queryParams.currencyName" placeholder="请输入币种名称" clearable size="small" @keyup.enter.native="handleQuery" />
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['resources:gameCurrency:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['resources:gameCurrency:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['resources:gameCurrency:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="currencyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="币种编码" align="center" prop="currencyCode" min-width="120" />
      <el-table-column label="币种名称" align="center" prop="currencyName" min-width="140" />
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="备注" align="center" prop="remark" min-width="160" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" width="170">
        <template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['resources:gameCurrency:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['resources:gameCurrency:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="币种编码" prop="currencyCode">
          <el-input v-model="form.currencyCode" placeholder="如：CNY / USDT" maxlength="16" />
        </el-form-item>
        <el-form-item label="币种名称" prop="currencyName">
          <el-input v-model="form.currencyName" placeholder="请输入币种名称" maxlength="64" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" style="width: 100%" />
        </el-form-item>
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
import { addGameCurrency, delGameCurrency, getGameCurrency, listGameCurrency, updateGameCurrency } from '@/api/resources/gameCurrency'

export default {
  name: 'GameCurrency',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      currencyList: [],
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      statusOptions: [
        { value: 0, label: '禁用' },
        { value: 1, label: '启用' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        currencyCode: undefined,
        currencyName: undefined,
        status: undefined
      },
      form: {},
      rules: {
        currencyCode: [{ required: true, message: '币种编码不能为空', trigger: 'blur' }],
        currencyName: [{ required: true, message: '币种名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listGameCurrency(this.queryParams).then(response => {
        this.currencyList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
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
        currencyCode: undefined,
        currencyName: undefined,
        status: 1,
        sort: 0,
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
      this.title = '新增三方游戏币种'
    },
    handleUpdate(row) {
      const id = row ? row.id : this.ids[0]
      getGameCurrency(id).then(response => {
        this.reset()
        this.form = Object.assign({}, this.form, response.data)
        this.open = true
        this.title = '修改三方游戏币种'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const submitData = Object.assign({}, this.form)
        const api = submitData.id ? updateGameCurrency : addGameCurrency
        api(submitData).then(() => {
          this.$modal.msgSuccess(submitData.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row ? row.id : this.ids.join(',')
      this.$modal.confirm('是否确认删除币种ID为"' + ids + '"的数据项？').then(() => {
        return delGameCurrency(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
