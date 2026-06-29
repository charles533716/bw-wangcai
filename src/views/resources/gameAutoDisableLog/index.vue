<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="检测时间">
        <el-date-picker
          v-model="checkTimeRange"
          size="small"
          style="width: 360px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="游戏ID" prop="gameId">
        <el-input
          v-model.number="queryParams.gameId"
          placeholder="请输入游戏ID"
          clearable
          size="small"
          style="width: 150px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏名称" prop="gameName">
        <el-input
          v-model="queryParams.gameName"
          placeholder="请输入游戏名称"
          clearable
          size="small"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏编码" prop="gameCode">
        <el-input
          v-model="queryParams.gameCode"
          placeholder="请输入游戏编码"
          clearable
          size="small"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="线路" prop="lineId">
        <el-select
          v-model="queryParams.lineId"
          placeholder="请选择线路"
          clearable
          filterable
          size="small"
          style="width: 180px"
          @change="handleLineChange"
        >
          <el-option v-for="line in lineOptions" :key="line.id" :label="line.lineName" :value="line.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="厂商" prop="factoryId">
        <el-select
          v-model="queryParams.factoryId"
          placeholder="请选择厂商"
          clearable
          filterable
          size="small"
          style="width: 180px"
        >
          <el-option v-for="factory in factoryOptions" :key="factory.id" :label="factory.factoryName" :value="factory.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="币种" prop="currency">
        <el-select
          v-model="queryParams.currency"
          placeholder="请选择币种"
          clearable
          filterable
          size="small"
          style="width: 150px"
        >
          <el-option v-for="item in currencyOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="终端" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请选择终端" clearable size="small" style="width: 130px">
          <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="失败类型" prop="failureType">
        <el-select v-model="queryParams.failureType" placeholder="请选择失败类型" clearable size="small" style="width: 160px">
          <el-option v-for="item in failureTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态" prop="disableStatus">
        <el-select v-model="queryParams.disableStatus" placeholder="请选择处理状态" clearable size="small" style="width: 180px">
          <el-option v-for="item in disableStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['resources:gameAutoDisableLog:export']"
        >
          导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="logList">
      <el-table-column label="检测时间" align="center" prop="checkTime" width="170" fixed="left">
        <template slot-scope="scope">{{ formatTime(scope.row.checkTime) }}</template>
      </el-table-column>
      <el-table-column label="游戏ID" align="center" prop="gameId" width="90" />
      <el-table-column label="游戏名称" align="center" prop="gameName" min-width="150" show-overflow-tooltip />
      <el-table-column label="游戏编码" align="center" prop="gameCode" min-width="130" show-overflow-tooltip />
      <el-table-column label="线路" align="center" prop="lineName" min-width="130" show-overflow-tooltip />
      <el-table-column label="厂商" align="center" prop="factoryName" min-width="130" show-overflow-tooltip />
      <el-table-column label="币种" align="center" prop="currency" width="90" />
      <el-table-column label="终端" align="center" prop="deviceType" width="90">
        <template slot-scope="scope">
          <el-tag size="mini" :type="String(scope.row.deviceType) === '1' ? 'success' : 'info'">
            {{ optionLabel(deviceTypeOptions, scope.row.deviceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="失败类型" align="center" prop="failureType" width="130">
        <template slot-scope="scope">
          <el-tag size="mini" :type="failureTypeTag(scope.row.failureType)">
            {{ optionLabel(failureTypeOptions, scope.row.failureType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="失败原因" align="center" min-width="240" show-overflow-tooltip>
        <template slot-scope="scope">{{ formatFailReason(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="处理状态" align="center" prop="disableStatus" width="160">
        <template slot-scope="scope">
          <el-tag size="mini" :type="disableStatusTag(scope.row.disableStatus)">
            {{ optionLabel(disableStatusOptions, scope.row.disableStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="原状态" align="center" prop="beforeStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.game_status" :value="scope.row.beforeStatus" />
        </template>
      </el-table-column>
      <el-table-column label="新状态" align="center" prop="afterStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.game_status" :value="scope.row.afterStatus" />
        </template>
      </el-table-column>
      <el-table-column label="失败次数/阈值" align="center" width="120">
        <template slot-scope="scope">{{ formatCountThreshold(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="90" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['resources:gameAutoDisableLog:query']"
          >
            详情
          </el-button>
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

    <el-dialog title="自动下架日志详情" :visible.sync="detailOpen" width="900px" append-to-body>
      <div v-loading="detailLoading">
        <el-descriptions :column="2" border size="small" v-if="detailForm">
          <el-descriptions-item label="日志ID">{{ formatEmpty(detailForm.id) }}</el-descriptions-item>
          <el-descriptions-item label="检测时间">{{ formatTime(detailForm.checkTime) }}</el-descriptions-item>
          <el-descriptions-item label="游戏ID">{{ formatEmpty(detailForm.gameId) }}</el-descriptions-item>
          <el-descriptions-item label="游戏名称">{{ formatEmpty(detailForm.gameName) }}</el-descriptions-item>
          <el-descriptions-item label="游戏编码">{{ formatEmpty(detailForm.gameCode) }}</el-descriptions-item>
          <el-descriptions-item label="币种">{{ formatEmpty(detailForm.currency) }}</el-descriptions-item>
          <el-descriptions-item label="线路">{{ formatEmpty(detailForm.lineName) }}</el-descriptions-item>
          <el-descriptions-item label="厂商">{{ formatEmpty(detailForm.factoryName) }}</el-descriptions-item>
          <el-descriptions-item label="终端">
            {{ optionLabel(deviceTypeOptions, detailForm.deviceType) }}
          </el-descriptions-item>
          <el-descriptions-item label="失败类型">
            {{ optionLabel(failureTypeOptions, detailForm.failureType) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            {{ optionLabel(disableStatusOptions, detailForm.disableStatus) }}
          </el-descriptions-item>
          <el-descriptions-item label="失败次数/阈值">
            {{ formatCountThreshold(detailForm) }}
          </el-descriptions-item>
          <el-descriptions-item label="原状态">
            <dict-tag :options="dict.type.game_status" :value="detailForm.beforeStatus" />
          </el-descriptions-item>
          <el-descriptions-item label="新状态">
            <dict-tag :options="dict.type.game_status" :value="detailForm.afterStatus" />
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <div class="detail-title">失败原因</div>
          <div class="detail-text">{{ formatLongText(detailForm.failMessage) }}</div>
        </div>
        <div class="detail-section">
          <div class="detail-title">完整三方响应</div>
          <pre class="raw-response">{{ formatRawResponse(detailForm.rawResponse) }}</pre>
        </div>
        <div class="detail-section">
          <div class="detail-title">备注</div>
          <div class="detail-text">{{ formatLongText(detailForm.remark) }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getGameAutoDisableLog, listGameAutoDisableLog } from '@/api/resources/gameAutoDisableLog'
import { listGameCurrency } from '@/api/resources/gameCurrency'
import { listGameFactory } from '@/api/resources/gameFactory'
import { listGameLine } from '@/api/resources/gameLine'

export default {
  name: 'GameAutoDisableLog',
  dicts: ['game_status'],
  data() {
    return {
      loading: false,
      detailLoading: false,
      showSearch: true,
      total: 0,
      logList: [],
      lineOptions: [],
      factoryOptions: [],
      currencyOptions: [],
      checkTimeRange: [],
      detailOpen: false,
      detailForm: {},
      deviceTypeOptions: [
        { value: '1', label: 'PC' },
        { value: '2', label: 'H5' }
      ],
      failureTypeOptions: [
        { value: 'CONFIG', label: '配置异常' },
        { value: 'THIRD_PARTY', label: '三方返回失败' },
        { value: 'EXCEPTION', label: '检测异常' }
      ],
      disableStatusOptions: [
        { value: 0, label: '仅记录，未下架' },
        { value: 1, label: '已自动下架' },
        { value: 2, label: '跳过下架' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gameId: undefined,
        gameCode: undefined,
        gameName: undefined,
        lineId: undefined,
        factoryId: undefined,
        currency: undefined,
        deviceType: undefined,
        failureType: undefined,
        disableStatus: undefined
      }
    }
  },
  created() {
    this.getList()
    this.loadLineOptions()
    this.loadFactoryOptions()
    this.loadCurrencyOptions()
  },
  methods: {
    getList() {
      this.loading = true
      listGameAutoDisableLog(this.buildQueryParams(true)).then(response => {
        this.logList = response.rows || []
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
    loadFactoryOptions(lineId) {
      const params = { pageNum: 1, pageSize: 1000 }
      if (lineId) {
        params.lineId = lineId
      }
      listGameFactory(params).then(response => {
        this.factoryOptions = response.rows || []
      })
    },
    loadCurrencyOptions() {
      listGameCurrency({ pageNum: 1, pageSize: 1000, status: 1 }).then(response => {
        this.currencyOptions = (response.rows || []).map(item => ({
          value: item.currencyCode,
          label: item.currencyName ? `${item.currencyCode}（${item.currencyName}）` : item.currencyCode
        }))
      })
    },
    handleLineChange(value) {
      this.queryParams.factoryId = undefined
      this.loadFactoryOptions(value)
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.checkTimeRange = []
      this.resetForm('queryForm')
      this.loadFactoryOptions()
      this.handleQuery()
    },
    handleDetail(row) {
      this.detailForm = Object.assign({}, row)
      this.detailOpen = true
      this.detailLoading = true
      getGameAutoDisableLog(row.id).then(response => {
        this.detailForm = Object.assign({}, row, response.data || {})
      }).catch(() => {
        this.detailOpen = false
      }).finally(() => {
        this.detailLoading = false
      })
    },
    handleExport() {
      this.download(
        '/api/admin/game/autoDisableLog/export',
        this.buildQueryParams(false),
        `game_auto_disable_log_${new Date().getTime()}.xlsx`
      )
    },
    buildQueryParams(withPage) {
      const params = Object.assign({}, this.queryParams)
      if (!withPage) {
        delete params.pageNum
        delete params.pageSize
      }
      if (this.checkTimeRange && this.checkTimeRange.length === 2) {
        params.beginCheckTime = this.checkTimeRange[0]
        params.endCheckTime = this.checkTimeRange[1]
      }
      return this.cleanParams(params)
    },
    cleanParams(params) {
      const result = {}
      Object.keys(params || {}).forEach(key => {
        const value = params[key]
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value
        }
      })
      return result
    },
    optionLabel(options, value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      const found = (options || []).find(item => String(item.value) === String(value))
      return found ? found.label : String(value)
    },
    formatEmpty(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      return value
    },
    formatTime(value) {
      if (!value) return '-'
      return this.parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
    },
    formatCountThreshold(row) {
      const failCount = this.formatEmpty(row && row.failCount)
      const threshold = this.formatEmpty(row && row.threshold)
      return `${failCount}/${threshold}`
    },
    formatFailReason(row) {
      if (!row) {
        return '-'
      }
      const failCode = this.formatEmpty(row.failCode)
      const failMessage = this.formatEmpty(row.failMessage)
      if (failCode === '-' && failMessage === '-') {
        return '-'
      }
      if (failCode === '-') {
        return failMessage
      }
      if (failMessage === '-') {
        return failCode
      }
      return `${failCode} - ${failMessage}`
    },
    formatLongText(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    },
    formatRawResponse(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      const text = String(value)
      try {
        return JSON.stringify(JSON.parse(text), null, 2)
      } catch (e) {
        return text
      }
    },
    failureTypeTag(value) {
      if (value === 'CONFIG') return 'warning'
      if (value === 'THIRD_PARTY') return 'danger'
      if (value === 'EXCEPTION') return 'danger'
      return 'info'
    },
    disableStatusTag(value) {
      const status = Number(value)
      if (status === 1) return 'danger'
      if (status === 2) return 'warning'
      return 'info'
    }
  }
}
</script>

<style scoped>
.detail-section {
  margin-top: 16px;
}

.detail-title {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 600;
}

.detail-text {
  min-height: 36px;
  padding: 10px 12px;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f8f8f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.raw-response {
  max-height: 360px;
  margin: 0;
  padding: 12px;
  overflow: auto;
  color: #303133;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f8f8f9;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
