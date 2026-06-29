<template>
  <div class="app-container agent-advance-record-page">
    <div class="page-head">
      <div>
        <h2>代理预支记录</h2>
        <p>{{ scopeTip }}</p>
      </div>
      <el-button type="warning" icon="el-icon-download" @click="handleExport">导出演示数据</el-button>
    </div>

    <el-form :inline="true" :model="filters" label-width="86px" class="record-filter">
      <el-form-item v-if="scope === 'master'" label="所属站点">
        <el-select v-model="filters.siteFilter" clearable filterable placeholder="全部站点" style="width: 180px">
          <el-option
            v-for="item in siteOptions"
            :key="item.siteCode"
            :label="item.siteName"
            :value="item.siteCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="scope !== 'agent'" label="代理账号">
        <el-input
          v-model.trim="filters.agentKeyword"
          clearable
          placeholder="账号/名称"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属周期">
        <el-input
          v-model.trim="filters.period"
          clearable
          placeholder="如 2026-06"
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="领取状态">
        <el-select v-model="filters.status" clearable placeholder="全部" style="width: 150px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领取时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="rows" border stripe>
      <el-table-column label="所属站点" prop="siteName" min-width="130" show-overflow-tooltip />
      <el-table-column label="代理账号" prop="agentCode" min-width="110" />
      <el-table-column label="代理名称" prop="agentName" min-width="130" show-overflow-tooltip />
      <el-table-column label="所属周期" prop="period" min-width="180" />
      <el-table-column label="本周期佣金" min-width="120" align="right">
        <template slot-scope="scope">{{ money(scope.row.currentCommission) }}</template>
      </el-table-column>
      <el-table-column label="可预支金额" min-width="120" align="right">
        <template slot-scope="scope">{{ money(scope.row.availableAmount) }}</template>
      </el-table-column>
      <el-table-column label="本次预支" min-width="110" align="right">
        <template slot-scope="scope">{{ money(scope.row.claimAmount) }}</template>
      </el-table-column>
      <el-table-column label="累计预支" min-width="110" align="right">
        <template slot-scope="scope">{{ money(scope.row.claimedAmount) }}</template>
      </el-table-column>
      <el-table-column label="剩余次数" prop="remainingTimes" min-width="90" align="center" />
      <el-table-column label="领取状态" min-width="100" align="center">
        <template slot-scope="scope">
          <el-tag size="mini" :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领取时间" prop="claimTime" min-width="160" />
      <el-table-column label="备注说明" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="90" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="pager.pageNum"
      :limit.sync="pager.pageSize"
      @pagination="loadRows"
    />

    <el-dialog title="预支记录详情" :visible.sync="detailOpen" width="560px" append-to-body>
      <el-descriptions v-if="detail" :column="1" border size="small">
        <el-descriptions-item label="周期佣金构成">
          普通佣金 {{ money(detail.directCommission) }}，极差佣金 {{ money(detail.gapCommission) }}
        </el-descriptions-item>
        <el-descriptions-item label="预支规则快照">{{ detail.ruleSnapshot }}</el-descriptions-item>
        <el-descriptions-item label="本次预支金额">{{ money(detail.claimAmount) }}</el-descriptions-item>
        <el-descriptions-item label="领取前可预支">{{ money(detail.beforeAvailableAmount) }}</el-descriptions-item>
        <el-descriptions-item label="领取后可预支">{{ money(detail.afterAvailableAmount) }}</el-descriptions-item>
        <el-descriptions-item label="处理说明">{{ detail.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="detailOpen = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  CLAIM_STATUS_OPTIONS,
  formatMoney,
  getAdvanceSiteOptions,
  getStatusText,
  listAdvanceRecords
} from '@/utils/agentAdvance'
import { DEFAULT_AGENT_CODE, DEFAULT_SITE_CODE } from '@/utils/prototypeBackend'

export default {
  name: 'AgentAdvanceRecordsPage',
  data() {
    return {
      rows: [],
      total: 0,
      dateRange: [],
      detailOpen: false,
      detail: null,
      filters: {
        siteFilter: '',
        agentKeyword: '',
        period: '',
        status: ''
      },
      pager: {
        pageNum: 1,
        pageSize: 10
      },
      statusOptions: CLAIM_STATUS_OPTIONS,
      siteOptions: getAdvanceSiteOptions()
    }
  },
  computed: {
    scope() {
      return (this.$route.meta && this.$route.meta.advanceScope) || 'master'
    },
    effectiveSiteCode() {
      return this.$store.getters.userSiteCode || this.$store.getters.siteCode || DEFAULT_SITE_CODE
    },
    effectiveAgentCode() {
      return this.$store.getters.agentCode || DEFAULT_AGENT_CODE
    },
    scopeTip() {
      if (this.scope === 'agent') {
        return '当前仅展示本代理的佣金预支记录，用于核对领取结果、累计预支金额和剩余次数。'
      }
      if (this.scope === 'site') {
        return '当前仅展示本站代理的佣金预支记录，便于站点运营核对代理结算和佣金发放。'
      }
      return '当前展示全部站点和全部代理的佣金预支记录，可按站点、代理、周期、状态和时间筛选。'
    }
  },
  created() {
    this.loadRows()
  },
  watch: {
    '$route.fullPath'() {
      this.handleReset()
    }
  },
  methods: {
    buildParams(extra = {}) {
      return {
        ...this.filters,
        scope: this.scope,
        siteCode: this.effectiveSiteCode,
        agentCode: this.effectiveAgentCode,
        startTime: this.dateRange && this.dateRange[0],
        endTime: this.dateRange && this.dateRange[1],
        pageNum: this.pager.pageNum,
        pageSize: this.pager.pageSize,
        ...extra
      }
    },
    loadRows() {
      const result = listAdvanceRecords(this.buildParams())
      this.rows = result.rows
      this.total = result.total
    },
    handleQuery() {
      this.pager.pageNum = 1
      this.loadRows()
    },
    handleReset() {
      this.filters = {
        siteFilter: '',
        agentKeyword: '',
        period: '',
        status: ''
      }
      this.dateRange = []
      this.pager.pageNum = 1
      this.loadRows()
    },
    openDetail(row) {
      this.detail = row
      this.detailOpen = true
    },
    statusText(status) {
      return getStatusText(status)
    },
    statusTag(status) {
      if (status === 'SUCCESS') return 'success'
      if (status === 'REVOKED') return 'info'
      return 'warning'
    },
    money(value) {
      return formatMoney(value)
    },
    handleExport() {
      const result = listAdvanceRecords(this.buildParams({ pageNum: 1, pageSize: 9999 }))
      const lines = [
        '所属站点,代理账号,代理名称,所属周期,本周期佣金,可预支金额,本次预支,累计预支,剩余次数,领取状态,领取时间,备注说明'
      ].concat(result.allRows.map(row => [
        row.siteName,
        row.agentCode,
        row.agentName,
        row.period,
        this.money(row.currentCommission),
        this.money(row.availableAmount),
        this.money(row.claimAmount),
        this.money(row.claimedAmount),
        row.remainingTimes,
        this.statusText(row.status),
        row.claimTime,
        row.remark
      ].map(item => `"${String(item || '').replace(/"/g, '""')}"`).join(',')))
      const blob = new Blob([`\ufeff${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `agent_advance_records_${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      this.$message.success('代理预支记录演示数据已导出')
    }
  }
}
</script>

<style scoped>
.agent-advance-record-page {
  background: #fff;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 18px 20px;
  border: 1px solid #e7edf5;
  border-radius: 6px;
  background: #f8fbff;
}

.page-head h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2d3d;
}

.page-head p {
  margin: 8px 0 0;
  color: #606f89;
  line-height: 1.6;
}

.record-filter {
  margin-bottom: 8px;
}
</style>
