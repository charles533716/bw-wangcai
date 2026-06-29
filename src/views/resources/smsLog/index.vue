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
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="验证码类型" prop="verifyType">
        <el-select v-model="queryParams.verifyType" placeholder="请选择类型" clearable size="small" style="width: 160px">
          <el-option
            v-for="item in verifyTypeOptions"
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
      <el-form-item label="发送时间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="smsLogList">
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="站点" align="center" min-width="150" fixed="left" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.siteName || scope.row.siteId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会员账号" align="center" prop="memberName" width="120" show-overflow-tooltip />
      <el-table-column label="手机号" align="center" prop="phone" width="150" />
      <el-table-column label="验证码类型" align="center" prop="verifyType" width="130">
        <template slot-scope="scope">
          <el-tag :type="getVerifyTypeTagType(scope.row.verifyType)">
            {{ formatVerifyType(scope.row.verifyType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="验证码" align="center" prop="verifyCode" width="110" />
      <el-table-column label="通道名称" align="center" prop="channelName" width="140" show-overflow-tooltip />
      <el-table-column label="发送内容" align="center" prop="content" min-width="220" show-overflow-tooltip />
      <el-table-column label="响应数据" align="center" prop="responseData" min-width="260" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ formatResponseData(scope.row.responseData) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" prop="sendTime" width="160">
        <template slot-scope="scope">
          <span>{{ formatDateTime(scope.row.sendTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="响应时间" align="center" prop="responseTime" width="160">
        <template slot-scope="scope">
          <span>{{ formatDateTime(scope.row.responseTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="String(scope.row.status) === '1' ? 'success' : 'danger'">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
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
</template>

<script>
import { addDateRange } from '@/utils/ruoyi'
import { listSite } from '@/api/site/site'
import { listSmsLog } from '@/api/resources/smsLog'

const VERIFY_TYPE_OPTIONS = [
  { value: 1, label: '注册' },
  { value: 2, label: '登录' },
  { value: 3, label: '重置密码' },
  { value: 4, label: '绑定手机号' },
  { value: 5, label: '修改手机号' },
  { value: 6, label: '绑定提现密码' },
  { value: 7, label: '修改提现密码' },
  { value: 8, label: '实名认证' },
  { value: 9, label: '提现申请' },
  { value: 10, label: '忘记密码' }
]

const STATUS_OPTIONS = [
  { value: '1', label: '成功' },
  { value: '0', label: '失败' }
]

export default {
  name: 'SmsLog',
  data() {
    return {
      loading: false,
      showSearch: true,
      total: 0,
      smsLogList: [],
      siteOptions: [],
      dateRange: [],
      verifyTypeOptions: VERIFY_TYPE_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: undefined,
        phone: undefined,
        verifyType: undefined,
        status: undefined
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
      const params = addDateRange({ ...this.queryParams }, this.dateRange)
      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00'
        params.params.endTime = this.dateRange[1] + ' 23:59:59'
      }
      listSmsLog(params).then(response => {
        this.smsLogList = response.rows || []
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
    formatVerifyType(value) {
      const item = this.verifyTypeOptions.find(option => option.value === Number(value))
      return item ? item.label : value || '-'
    },
    formatStatus(value) {
      const item = this.statusOptions.find(option => option.value === String(value))
      return item ? item.label : value || '-'
    },
    getVerifyTypeTagType(value) {
      if (Number(value) === 1 || Number(value) === 2) return 'success'
      if (Number(value) === 8 || Number(value) === 9 || Number(value) === 10) return 'warning'
      return 'info'
    },
    formatDateTime(value) {
      return value ? this.parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    },
    formatResponseData(value) {
      if (value === null || value === undefined || value === '') {
        return '-'
      }
      return typeof value === 'object' ? JSON.stringify(value) : String(value)
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    }
  }
}
</script>
