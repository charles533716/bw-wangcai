<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="线路编码" prop="lineCode">
        <el-input v-model="queryParams.lineCode" placeholder="请输入线路编码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="线路名称" prop="lineName">
        <el-input v-model="queryParams.lineName" placeholder="请输入线路名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="线路类型" prop="lineType">
        <el-select v-model="queryParams.lineType" placeholder="请选择线路类型" clearable size="small">
          <el-option v-for="item in lineTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="钱包模式" prop="walletMode">
        <el-select v-model="queryParams.walletMode" placeholder="请选择钱包模式" clearable size="small">
          <el-option v-for="item in walletModeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="商户ID" prop="merchantId">
        <el-input v-model="queryParams.merchantId" placeholder="请输入商户ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="商户账号" prop="merchantAccount">
        <el-input v-model="queryParams.merchantAccount" placeholder="请输入商户账号" clearable size="small" @keyup.enter.native="handleQuery" />
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['resources:gameLine:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['resources:gameLine:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['resources:gameLine:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="lineList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="线路编码" align="center" prop="lineCode" min-width="120" />
      <el-table-column label="线路名称" align="center" prop="lineName" min-width="140" />
      <el-table-column label="线路类型" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.lineType === 1 ? 'success' : 'warning'">{{ lineTypeLabel(scope.row.lineType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="钱包模式" align="center" width="120">
        <template slot-scope="scope">{{ walletModeLabel(scope.row.walletMode) }}</template>
      </el-table-column>
      <el-table-column label="商户ID" align="center" prop="merchantId" min-width="130" show-overflow-tooltip />
      <el-table-column label="商户账号" align="center" prop="merchantAccount" min-width="130" show-overflow-tooltip />
      <el-table-column label="Token" align="center" min-width="120">
        <template slot-scope="scope">{{ maskSecret(scope.row.merchantToken) }}</template>
      </el-table-column>
      <el-table-column label="密钥" align="center" min-width="120">
        <template slot-scope="scope">{{ maskSecret(scope.row.merchantSecretKey) }}</template>
      </el-table-column>
      <el-table-column label="登录密码/加密密钥" align="center" min-width="150">
        <template slot-scope="scope">{{ maskSecret(scope.row.merchantPassword) }}</template>
      </el-table-column>
      <el-table-column label="请求Host" align="center" prop="apiUrl" min-width="180" show-overflow-tooltip />
      <el-table-column label="签名Key" align="center" min-width="120">
        <template slot-scope="scope">{{ maskSecret(scope.row.signKey) }}</template>
      </el-table-column>
      <el-table-column label="加盐参数1" align="center" prop="salt1" min-width="120" show-overflow-tooltip />
      <el-table-column label="加盐参数2" align="center" prop="salt2" min-width="120" show-overflow-tooltip />
      <el-table-column label="加盐参数3" align="center" prop="salt3" min-width="120" show-overflow-tooltip />
      <el-table-column label="扩展配置" align="center" prop="extraConfigJson" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="备注" align="center" prop="remark" min-width="140" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" width="170">
        <template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['resources:gameLine:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['resources:gameLine:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="980px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路编码" prop="lineCode">
              <el-input v-model="form.lineCode" placeholder="如：bw" maxlength="64" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="线路名称" prop="lineName">
              <el-input v-model="form.lineName" placeholder="请输入线路名称" maxlength="128" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路类型" prop="lineType">
              <el-select v-model="form.lineType" placeholder="请选择线路类型" style="width: 100%">
                <el-option v-for="item in lineTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="钱包模式" prop="walletMode">
              <el-select v-model="form.walletMode" placeholder="请选择钱包模式" style="width: 100%">
                <el-option v-for="item in walletModeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户ID" prop="merchantId">
              <el-input v-model="form.merchantId" placeholder="请输入商户ID" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商户账号" prop="merchantAccount">
              <el-input v-model="form.merchantAccount" placeholder="请输入商户账号" maxlength="128" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Token信息" prop="merchantToken">
              <el-input v-model="form.merchantToken" placeholder="请输入Token信息" maxlength="255" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密钥信息" prop="merchantSecretKey">
              <el-input v-model="form.merchantSecretKey" placeholder="请输入密钥信息" maxlength="255" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="代理登录密码/密钥" prop="merchantPassword">
              <el-input v-model="form.merchantPassword" placeholder="请输入代理登录密码或加密密钥" maxlength="255" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求Host地址" prop="apiUrl">
              <el-input v-model="form.apiUrl" placeholder="请输入接口请求Host地址" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签名Key" prop="signKey">
              <el-input v-model="form.signKey" placeholder="请输入用于签名的Key" maxlength="255" show-password />
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
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="加盐参数1" prop="salt1">
              <el-input v-model="form.salt1" placeholder="可选" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加盐参数2" prop="salt2">
              <el-input v-model="form.salt2" placeholder="可选" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加盐参数3" prop="salt3">
              <el-input v-model="form.salt3" placeholder="可选" maxlength="128" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="扩展配置(JSON)" prop="extraConfigJson">
          <el-input
            v-model="form.extraConfigJson"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder='请输入合法JSON，例如：{"currency":"CNY"}'
          />
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
import { addGameLine, delGameLine, getGameLine, listGameLine, updateGameLine } from '@/api/resources/gameLine'

export default {
  name: 'GameLine',
  data() {
    const validateJson = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      try {
        JSON.parse(value)
        callback()
      } catch (e) {
        callback(new Error('扩展配置必须是合法JSON'))
      }
    }

    return {
      loading: false,
      showSearch: true,
      total: 0,
      lineList: [],
      ids: [],
      single: true,
      multiple: true,
      title: '',
      open: false,
      lineTypeOptions: [
        { value: 1, label: '自营' },
        { value: 2, label: '三方' }
      ],
      walletModeOptions: [
        { value: 1, label: '免转钱包' },
        { value: 2, label: '转账钱包' }
      ],
      statusOptions: [
        { value: 0, label: '禁用' },
        { value: 1, label: '启用' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        lineCode: undefined,
        lineName: undefined,
        lineType: undefined,
        walletMode: undefined,
        merchantId: undefined,
        merchantAccount: undefined,
        status: undefined
      },
      form: {},
      rules: {
        lineCode: [{ required: true, message: '线路编码不能为空', trigger: 'blur' }],
        lineName: [{ required: true, message: '线路名称不能为空', trigger: 'blur' }],
        lineType: [{ required: true, message: '线路类型不能为空', trigger: 'change' }],
        walletMode: [{ required: true, message: '钱包模式不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        extraConfigJson: [{ validator: validateJson, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listGameLine(this.queryParams).then(response => {
        this.lineList = response.rows || []
        this.total = response.total || 0
      }).finally(() => {
        this.loading = false
      })
    },
    lineTypeLabel(value) {
      const found = this.lineTypeOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    walletModeLabel(value) {
      const found = this.walletModeOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    statusLabel(value) {
      const found = this.statusOptions.find(item => item.value === value)
      return found ? found.label : '-'
    },
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value)
    },
    maskSecret(value) {
      if (!value) return '-'
      if (value.length <= 4) {
        return '****'
      }
      return `${value.slice(0, 2)}****${value.slice(-2)}`
    },
    reset() {
      this.form = {
        id: undefined,
        lineCode: undefined,
        lineName: undefined,
        merchantId: undefined,
        merchantAccount: undefined,
        merchantToken: undefined,
        merchantSecretKey: undefined,
        merchantPassword: undefined,
        apiUrl: undefined,
        signKey: undefined,
        lineType: 1,
        salt1: undefined,
        salt2: undefined,
        salt3: undefined,
        walletMode: 1,
        extraConfigJson: undefined,
        status: 0,
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
      this.title = '新增游戏线路'
    },
    handleUpdate(row) {
      const id = row ? row.id : this.ids[0]
      getGameLine(id).then(response => {
        this.reset()
        this.form = Object.assign({}, this.form, response.data)
        this.open = true
        this.title = '修改游戏线路'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const api = this.form.id ? updateGameLine : addGameLine
        api(this.form).then(() => {
          this.$modal.msgSuccess(this.form.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row ? row.id : this.ids.join(',')
      this.$modal.confirm('是否确认删除线路ID为"' + ids + '"的数据项？').then(() => {
        return delGameLine(ids)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
