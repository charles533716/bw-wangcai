<template>
  <div class="app-container same-ip-page">
    <div class="same-ip-card">
      <el-form
        v-show="showSearch"
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="84px"
        class="same-ip-query"
      >
        <el-form-item label="所属站点" prop="siteCode">
          <el-select
            v-model="queryParams.siteCode"
            class="query-control"
            placeholder="全部站点"
            clearable
            filterable
          >
            <el-option label="全部站点" value="" />
            <el-option
              v-for="item in siteOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="注册IP" prop="fromIp">
          <el-input
            v-model="queryParams.fromIp"
            class="query-control"
            placeholder="请输入注册IP"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="same-ip-toolbar">
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
      </div>

      <el-table v-loading="listLoading" :data="listData">
        <el-table-column label="注册IP" align="center" min-width="180" show-overflow-tooltip prop="fromIp" />
        <el-table-column label="注册地区" align="center" min-width="180" show-overflow-tooltip prop="fromIpRegion">
          <template slot-scope="scope">{{ getRegisterRegion(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="会员数量" align="center" min-width="120">
          <template slot-scope="scope">
            <el-button
              v-if="canQuerySameIpMembers()"
              type="text"
              size="mini"
              class="member-count-trigger"
              @click="handleOpenMembers(scope.row)"
            >
              {{ formatMemberCount(scope.row.memberCount) }}
            </el-button>
            <span v-else>{{ formatMemberCount(scope.row.memberCount) }}</span>
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

    <el-dialog
      :title="memberDialogTitle"
      :visible.sync="memberDialogVisible"
      width="1080px"
      append-to-body
      @close="resetMemberDialog"
    >
      <div class="member-dialog__meta">
        <span>注册IP：{{ memberDialogQuery.fromIp || '--' }}</span>
        <span>会员数量：{{ memberDialogTotal }}</span>
      </div>

      <el-table
        v-loading="memberDialogLoading"
        :data="memberDialogList"
        @row-dblclick="handleViewDetail"
      >
        <el-table-column label="ID" align="center" min-width="90" show-overflow-tooltip>
          <template slot-scope="scope">{{ getPrimaryId(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="所属站点" align="center" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ getSiteDisplay(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="上级代理" align="center" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ getAgentDisplay(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="用户ID" align="center" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">{{ getUserId(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="用户名" align="center" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ getUserName(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="注册地区" align="center" min-width="160" show-overflow-tooltip>
          <template slot-scope="scope">{{ getRegisterRegion(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="VIP等级" align="center" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">{{ getVipLevel(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(getStatusValue(scope.row))" size="small" class="status-tag">
              {{ formatStatus(getStatusValue(scope.row)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" align="center" min-width="170">
          <template slot-scope="scope">{{ formatListTime(scope.row.regTime) }}</template>
        </el-table-column>
        <el-table-column label="最后登录时间" align="center" min-width="170">
          <template slot-scope="scope">{{ formatListTime(scope.row.lastLoginTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="handleViewDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="memberDialogTotal > 0"
        :total="memberDialogTotal"
        :page.sync="memberDialogQuery.pageNum"
        :limit.sync="memberDialogQuery.pageSize"
        @pagination="getMemberDialogList"
      />
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { checkPermi } from '@/utils/permission'
import { listSite } from '@/api/site/site'
import { listAdminSameIpMembers, listAdminSameIpSummaries } from '@/api/member/adminMember'

const DEFAULT_STATUS_OPTIONS = [
  { dictLabel: '正常', dictValue: '1' },
  { dictLabel: '封禁', dictValue: '0' }
]

const DEFAULT_QUERY_PARAMS = {
  pageNum: 1,
  pageSize: 20,
  siteCode: '',
  fromIp: ''
}

export default {
  name: 'MemberSameIpPage',
  data() {
    return {
      showSearch: true,
      listLoading: false,
      memberDialogVisible: false,
      memberDialogLoading: false,
      memberDialogTitle: '同IP会员详情',
      listData: [],
      total: 0,
      siteOptions: [],
      statusOptions: DEFAULT_STATUS_OPTIONS.map(item => ({ ...item })),
      queryParams: { ...DEFAULT_QUERY_PARAMS },
      memberDialogList: [],
      memberDialogTotal: 0,
      memberDialogQuery: {
        fromIp: '',
        siteCode: '',
        pageNum: 1,
        pageSize: 10
      }
    }
  },
  created() {
    this.getSiteOptions()
    this.getList()
  },
  methods: {
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then((response) => {
        const rows = this.extractRows(response)
        this.siteOptions = rows.map((site) => {
          const value = site.code || site.siteCode || site.id
          const code = site.code || site.siteCode || site.id
          const name = site.nameZn || site.siteName || site.siteNameZn || site.name
          return {
            value,
            label: this.formatSiteCodeName(code, name)
          }
        }).filter(item => item.value !== undefined && item.value !== null && item.value !== '')
      }).catch(() => {
        this.siteOptions = []
      })
    },
    getList() {
      this.listLoading = true
      listAdminSameIpSummaries(this.buildPageParams(), this.buildQueryPayload()).then((response) => {
        this.listData = this.extractRows(response)
        this.total = this.extractTotal(response)
      }).finally(() => {
        this.listLoading = false
      })
    },
    getMemberDialogList() {
      if (!this.memberDialogQuery.fromIp) {
        this.memberDialogList = []
        this.memberDialogTotal = 0
        return
      }
      this.memberDialogLoading = true
      listAdminSameIpMembers(
        {
          pageNum: this.memberDialogQuery.pageNum,
          pageSize: this.memberDialogQuery.pageSize
        },
        {
          fromIp: this.memberDialogQuery.fromIp,
          siteCode: this.memberDialogQuery.siteCode
        }
      ).then((response) => {
        this.memberDialogList = this.extractRows(response)
        this.memberDialogTotal = this.extractTotal(response)
      }).catch(() => {
        this.memberDialogList = []
        this.memberDialogTotal = 0
        this.$modal.msgError('获取同IP会员详情失败')
      }).finally(() => {
        this.memberDialogLoading = false
      })
    },
    buildPageParams() {
      return {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
    },
    buildQueryPayload() {
      return this.sanitizePayload({
        siteCode: this.queryParams.siteCode,
        fromIp: this.queryParams.fromIp
      })
    },
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
      return Array.isArray(response.rows) ? response.rows.length : 0
    },
    formatMemberCount(value) {
      const count = Number(value)
      return Number.isNaN(count) ? 0 : count
    },
    formatStatus(value) {
      if (value === undefined || value === null || value === '') return '--'
      const matched = this.statusOptions.find(item => String(item.dictValue) === String(value))
      return matched ? matched.dictLabel : '--'
    },
    getStatusTagType(value) {
      if (value === 1) return 'success'
      if (value === 0) return 'danger'
      return 'info'
    },
    formatListTime(value) {
      return value ? (parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || '--') : '--'
    },
    getPrimaryId(row) {
      return row && row.id !== undefined && row.id !== null && row.id !== '' ? row.id : '--'
    },
    getUserId(row) {
      if (!row) return '--'
      return row.userId || row.id || '--'
    },
    getUserName(row) {
      return row && row.name ? row.name : '--'
    },
    getRegisterRegion(row) {
      if (!row) return '--'
      const value = row.fromIpRegion || row.registerRegion || row.regRegion || row.ipRegion || row.location || ''
      return value || '--'
    },
    getVipLevel(row) {
      if (!row) return '--'
      return row.vipLevel !== undefined && row.vipLevel !== null && row.vipLevel !== '' ? row.vipLevel : '--'
    },
    getStatusValue(row) {
      if (!row || row.status === undefined || row.status === null || row.status === '') return null
      const status = Number(row.status)
      return Number.isNaN(status) ? null : status
    },
    getAgentDisplay(row) {
      if (!row) return '--'
      if (row.agentCode && row.parentAgentName) {
        return `${row.agentCode}/${row.parentAgentName}`
      }
      if (row.parentAgentName) return row.parentAgentName
      if (row.agentCode !== undefined && row.agentCode !== null && row.agentCode !== '') {
        return String(row.agentCode)
      }
      if (row.parent) return row.parent
      return '--'
    },
    getSiteDisplay(row) {
      if (!row) return '--'
      return this.formatSiteCodeName(row.siteCode, row.siteName)
    },
    formatSiteCodeName(code, name) {
      if (code && name) return `${code}/${name}`
      if (code) return String(code)
      if (name) return name
      return '--'
    },
    canQuerySameIpMembers() {
      return checkPermi(['member:sameIp:query'])
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = { ...DEFAULT_QUERY_PARAMS }
      this.getList()
    },
    handleOpenMembers(row) {
      const fromIp = row && row.fromIp ? String(row.fromIp).trim() : ''
      if (!fromIp) {
        this.$modal.msgWarning('当前记录缺少注册IP')
        return
      }
      this.memberDialogTitle = `同IP会员详情 - ${fromIp}`
      this.memberDialogVisible = true
      this.memberDialogList = []
      this.memberDialogTotal = 0
      this.memberDialogQuery = {
        fromIp,
        siteCode: this.queryParams.siteCode,
        pageNum: 1,
        pageSize: 10
      }
      this.getMemberDialogList()
    },
    resetMemberDialog() {
      this.memberDialogLoading = false
      this.memberDialogTitle = '同IP会员详情'
      this.memberDialogList = []
      this.memberDialogTotal = 0
      this.memberDialogQuery = {
        fromIp: '',
        siteCode: '',
        pageNum: 1,
        pageSize: 10
      }
    },
    handleViewDetail(row) {
      const memberId = row && row.id
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法查看详情')
        return
      }
      this.$router.push({
        name: 'MemberSameIpDetail',
        params: { id: String(memberId) },
        query: {
          name: row.name || ''
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.same-ip-card {
  padding: 18px 18px 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.same-ip-query {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.query-control {
  width: 220px;
}

.query-actions {
  margin-left: auto;
}

.same-ip-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.member-count-trigger {
  padding: 0;
}

.member-dialog__meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
}

.status-tag {
  min-width: 64px;
  text-align: center;
}

@media (max-width: 1200px) {
  .query-actions {
    margin-left: 0;
  }
}
</style>
