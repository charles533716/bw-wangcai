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
      <el-form-item label="通道名称" prop="channelName">
        <el-input
          v-model="queryParams.channelName"
          placeholder="请输入通道名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="通道编码" prop="channelCode">
        <el-input
          v-model="queryParams.channelCode"
          placeholder="请输入通道编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="通道类型" prop="channelType">
        <el-select v-model="queryParams.channelType" placeholder="请选择通道类型" clearable size="small" style="width: 160px">
          <el-option
            v-for="item in channelTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="国内/海外" prop="smsScopeType">
        <el-select v-model="queryParams.smsScopeType" placeholder="请选择类型" clearable size="small" style="width: 160px">
          <el-option
            v-for="item in scopeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
          v-hasPermi="['resources:smsChannel:add']"
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
          v-hasPermi="['resources:smsChannel:edit']"
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
          v-hasPermi="['resources:smsChannel:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="smsChannelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="站点" align="center" min-width="150" fixed="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ formatSiteName(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通道名称" align="center" prop="channelName" width="140" show-overflow-tooltip />
      <el-table-column label="通道编码" align="center" prop="channelCode" width="140" show-overflow-tooltip />
      <el-table-column label="通道类型" align="center" prop="channelType" width="120">
        <template slot-scope="scope">
          <el-tag type="primary">{{ formatChannelType(scope.row.channelType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商户号/AppCode" align="center" prop="merchantNo" width="160" show-overflow-tooltip />
      <el-table-column label="接口" align="center" prop="apiUrl" min-width="220" show-overflow-tooltip />
      <el-table-column label="密钥/AppSecret" align="center" prop="secretKey" min-width="180" show-overflow-tooltip />
      <el-table-column label="AppKey" align="center" prop="appKey" min-width="180" show-overflow-tooltip />
      <el-table-column label="模板编码/扩展号" align="center" prop="templateCode" min-width="180" show-overflow-tooltip />
      <el-table-column label="统一模板内容" align="center" prop="templateContent" min-width="320" show-overflow-tooltip />
      <el-table-column label="验证码长度" align="center" prop="verifyCodeLength" width="110" />
      <el-table-column label="过期秒数" align="center" prop="expireSeconds" width="100" />
      <el-table-column label="同IP限制次数" align="center" prop="sameIpLimitCount" width="120" />
      <el-table-column label="同手机限制次数" align="center" prop="samePhoneLimitCount" width="130" />
      <el-table-column label="国内/海外" align="center" prop="smsScopeType" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.smsScopeType === '0' ? 'success' : 'warning'">
            {{ formatScopeType(scope.row.smsScopeType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="String(scope.row.status) === '1' ? 'success' : 'info'">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['resources:smsChannel:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['resources:smsChannel:remove']"
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

    <el-dialog :title="title" :visible.sync="open" width="980px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
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
            <el-form-item label="通道名称" prop="channelName">
              <el-input v-model="form.channelName" placeholder="请输入通道名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通道编码" prop="channelCode">
              <el-input v-model="form.channelCode" placeholder="请输入通道编码" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通道类型" prop="channelType">
              <el-select v-model="form.channelType" placeholder="请选择通道类型" style="width: 100%">
                <el-option
                  v-for="item in channelTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商户号/AppCode" prop="merchantNo">
              <el-input v-model="form.merchantNo" placeholder="请输入商户号或AppCode" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接口" prop="apiUrl">
              <el-input v-model="form.apiUrl" placeholder="请输入接口地址" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密钥/AppSecret" prop="secretKey">
              <el-input v-model="form.secretKey" placeholder="请输入密钥或AppSecret" show-password maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="AppKey" prop="appKey">
              <el-input v-model="form.appKey" placeholder="请输入AppKey" maxlength="255" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板编码/扩展号" prop="templateCode">
              <el-input v-model="form.templateCode" placeholder="腾讯/网易填模板编码，HTTP平台可留空或填写扩展号" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="验证码长度" prop="verifyCodeLength">
              <el-input-number v-model="form.verifyCodeLength" :min="1" :max="32" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="过期秒数" prop="expireSeconds">
              <el-input-number v-model="form.expireSeconds" :min="1" :max="86400" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="统一模板内容" prop="templateContent">
              <el-input
                v-model="form.templateContent"
                type="textarea"
                :rows="3"
                :disabled="isEditMode"
                :placeholder="isEditMode ? '修改场景不允许变更统一模板内容' : '请输入统一模板内容，使用 {} 作为验证码占位符'"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="同IP限制次数" prop="sameIpLimitCount">
              <el-input-number v-model="form.sameIpLimitCount" :min="0" :max="9999" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="同手机限制次数" prop="samePhoneLimitCount">
              <el-input-number v-model="form.samePhoneLimitCount" :min="0" :max="9999" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="国内/海外" prop="smsScopeType">
              <el-select v-model="form.smsScopeType" placeholder="请选择类型" style="width: 100%">
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
                active-value="1"
                inactive-value="0"
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
import { listSmsChannel, getSmsChannel, addSmsChannel, updateSmsChannel, delSmsChannel } from '@/api/resources/smsChannel'

export default {
  name: 'SmsChannel',
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      smsChannelList: [],
      siteOptions: [],
      title: '',
      open: false,
      channelTypeOptions: [
        { value: 1, label: '腾讯云' },
        { value: 2, label: '网易云信' },
        { value: 3, label: 'HTTP短信平台' }
      ],
      scopeTypeOptions: [
        { value: '0', label: '国内' },
        { value: '1', label: '海外' }
      ],
      statusOptions: [
        { value: '1', label: '启用' },
        { value: '0', label: '禁用' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        channelName: undefined,
        channelCode: undefined,
        channelType: undefined,
        smsScopeType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        siteId: [
          { required: true, message: '站点不能为空', trigger: 'change' }
        ],
        channelName: [
          { required: true, message: '通道名称不能为空', trigger: 'blur' }
        ],
        channelCode: [
          { required: true, message: '通道编码不能为空', trigger: 'blur' }
        ],
        channelType: [
          { required: true, message: '通道类型不能为空', trigger: 'change' }
        ],
        apiUrl: [
          { required: true, message: '接口不能为空', trigger: 'blur' }
        ],
        smsScopeType: [
          { required: true, message: '国内/海外类型不能为空', trigger: 'change' }
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
  computed: {
    isEditMode() {
      return this.form && this.form.id !== undefined && this.form.id !== null
    }
  },
  methods: {
    getList() {
      this.loading = true
      listSmsChannel(this.queryParams).then(response => {
        this.smsChannelList = response.rows || []
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
    formatSiteName(row) {
      if (!row) {
        return '-'
      }
      return row.siteName || row.siteId || '-'
    },
    formatChannelType(value) {
      const item = this.channelTypeOptions.find(option => option.value === Number(value))
      return item ? item.label : value || '-'
    },
    formatScopeType(value) {
      const item = this.scopeTypeOptions.find(option => option.value === String(value))
      return item ? item.label : value || '-'
    },
    formatStatus(value) {
      const item = this.statusOptions.find(option => option.value === String(value))
      return item ? item.label : value || '-'
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
        channelName: '',
        channelCode: '',
        channelType: undefined,
        merchantNo: '',
        apiUrl: '',
        secretKey: '',
        appKey: '',
        templateCode: '',
        templateContent: '【陕西萌次网络公司】 您的验证码为: {}  请勿泄露给他人！',
        verifyCodeLength: 6,
        expireSeconds: 300,
        sameIpLimitCount: 0,
        samePhoneLimitCount: 0,
        smsScopeType: '0',
        status: '1'
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.title = '新增短信通道'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getSmsChannel(id).then(response => {
        const data = response.data || {}
        this.form = {
          ...this.form,
          ...data,
          channelType: data.channelType == null ? undefined : Number(data.channelType),
          templateContent: data.templateContent || this.form.templateContent,
          verifyCodeLength: data.verifyCodeLength == null ? 6 : Number(data.verifyCodeLength),
          expireSeconds: data.expireSeconds == null ? 300 : Number(data.expireSeconds),
          sameIpLimitCount: data.sameIpLimitCount == null ? 0 : Number(data.sameIpLimitCount),
          samePhoneLimitCount: data.samePhoneLimitCount == null ? 0 : Number(data.samePhoneLimitCount),
          smsScopeType: data.smsScopeType == null ? '0' : String(data.smsScopeType),
          status: data.status == null ? '1' : String(data.status)
        }
        this.title = '修改短信通道'
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
          channelType: this.form.channelType == null ? null : Number(this.form.channelType),
          verifyCodeLength: this.form.verifyCodeLength == null ? null : Number(this.form.verifyCodeLength),
          expireSeconds: this.form.expireSeconds == null ? null : Number(this.form.expireSeconds),
          sameIpLimitCount: this.form.sameIpLimitCount == null ? null : Number(this.form.sameIpLimitCount),
          samePhoneLimitCount: this.form.samePhoneLimitCount == null ? null : Number(this.form.samePhoneLimitCount),
          smsScopeType: this.form.smsScopeType == null ? null : String(this.form.smsScopeType),
          status: this.form.status == null ? null : String(this.form.status)
        }
        const request = payload.id ? updateSmsChannel(payload) : addSmsChannel(payload)
        request.then(() => {
          this.$modal.msgSuccess(payload.id ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm(`是否确认删除短信通道编号为"${ids}"的数据项？`).then(() => {
        return delSmsChannel(ids)
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
