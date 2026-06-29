<template>
  <div class="app-container agent-detail-page" v-loading="loading">
    <el-card shadow="never" class="detail-card">
      <div class="detail-header">
        <div class="detail-title">代理详情</div>
        <div class="detail-actions">
          <el-button size="mini" @click="goAgentList">代理列表</el-button>
          <el-button type="primary" size="mini" @click="goBack">返回</el-button>
        </div>
      </div>

      <el-empty v-if="!loading && !agent" description="未找到代理详情" />

      <el-descriptions v-else-if="agent" :column="2" border size="small" class="detail-descriptions">
        <el-descriptions-item label="代理ID">{{ toText(agent.id) }}</el-descriptions-item>
        <el-descriptions-item label="代理名称">{{ toText(agent.name) }}</el-descriptions-item>
        <el-descriptions-item label="站点编码">{{ toText(agent.siteCode) }}</el-descriptions-item>
        <el-descriptions-item label="上级代理编码">{{ toText(agent.agentCode) }}</el-descriptions-item>
        <el-descriptions-item label="代理状态">{{ statusText(agent.agentStatus) }}</el-descriptions-item>
        <el-descriptions-item label="代理层级">{{ toText(agent.agentLevel) }}</el-descriptions-item>
        <el-descriptions-item label="代理星级">{{ toText(agent.starLevel) }}</el-descriptions-item>
        <el-descriptions-item label="佣金方案ID">{{ toText(agent.commissionPlanId) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ toText(agent.agentRemark) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { getAgent, listAgent } from '@/api/agent/agent'

export default {
  name: 'AgentDetailPage',
  data() {
    return {
      loading: false,
      agent: null
    }
  },
  watch: {
    '$route.fullPath': {
      handler() {
        this.loadAgentDetail()
      }
    }
  },
  created() {
    this.loadAgentDetail()
  },
  methods: {
    toText(value) {
      if (value === undefined || value === null || value === '') return '---'
      return String(value)
    },
    statusText(status) {
      const map = {
        0: '正常',
        1: '停用',
        2: '审核中',
        3: '已拒绝'
      }
      const key = Number(status)
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : this.toText(status)
    },
    async resolveAgentId() {
      const query = (this.$route && this.$route.query) || {}
      const rawId = query.id
      if (rawId !== undefined && rawId !== null && rawId !== '' && !Number.isNaN(Number(rawId))) {
        return Number(rawId)
      }
      const name = String(query.name || '').trim()
      if (!name) return null
      const params = {
        pageNum: 1,
        pageSize: 100,
        name
      }
      const siteCode = String(query.siteCode || '').trim()
      if (siteCode) {
        params.siteCode = siteCode
      }
      const resp = await listAgent(params)
      const rows = Array.isArray(resp && resp.rows) ? resp.rows : []
      if (!rows.length) return null
      let matched = null
      if (siteCode) {
        matched = rows.find(item => String(item && item.name || '') === name && String(item && item.siteCode || '') === siteCode)
      }
      if (!matched) {
        matched = rows.find(item => String(item && item.name || '') === name) || rows[0]
      }
      const id = matched && (matched.id || matched.userId)
      return id ? Number(id) : null
    },
    async loadAgentDetail() {
      this.loading = true
      this.agent = null
      try {
        const id = await this.resolveAgentId()
        if (!id) {
          this.$message.warning('未找到对应代理')
          return
        }
        const resp = await getAgent(id)
        this.agent = (resp && resp.data) ? resp.data : null
        if (!this.agent) {
          this.$message.warning('未找到代理详情')
        }
      } catch (e) {
        this.agent = null
        this.$message.error((e && e.message) || '获取代理详情失败')
      } finally {
        this.loading = false
      }
    },
    goAgentList() {
      const query = (this.$route && this.$route.query) || {}
      const next = {}
      if (query.name) next.name = query.name
      if (query.siteCode) next.siteCode = query.siteCode
      this.$router.push({ path: '/agent/index', query: next })
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.goAgentList()
    }
  }
}
</script>

<style scoped>
.agent-detail-page {
  padding-bottom: 8px;
}

.detail-card {
  margin-bottom: 12px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-descriptions {
  margin-top: 8px;
}
</style>
