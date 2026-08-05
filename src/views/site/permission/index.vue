<template>
  <div class="app-container site-permission-page">
    <div class="page-header">
      <div>
        <h2>站点权限管理</h2>
        <p>由总控统一配置各站点可使用的菜单、页面及按钮权限。</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-setting" @click="openBatchDialog">多站点批量配置</el-button>
        <el-button icon="el-icon-document-copy" @click="copyDialogVisible = true">权限复制</el-button>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-item"><span>站点总数</span><strong>{{ sites.length }}</strong><small>当前纳入统一权限管理</small></div>
      <div class="summary-item"><span>权限目录</span><strong>{{ catalogStats.total }}</strong><small>菜单、页面与按钮权限</small></div>
      <div class="summary-item"><span>本日更新</span><strong>3</strong><small>权限变更实时同步至站点</small></div>
    </div>

    <el-alert
      class="rule-alert"
      type="info"
      :closable="false"
      show-icon
      title="保存采用统一覆盖：当前勾选权限覆盖所选站点，未勾选权限同步回收；对应角色及账号权限会同时收缩。"
    />

    <div class="table-panel">
      <div class="filter-row">
        <el-input v-model="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索站点名称或编码" />
        <el-select v-model="statusFilter" clearable placeholder="全部配置状态">
          <el-option label="已配置" value="configured" />
          <el-option label="未配置" value="empty" />
        </el-select>
        <el-button type="primary" @click="applyFilters">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <el-table :data="filteredSites" border>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column label="站点" min-width="170">
          <template slot-scope="scope"><strong>{{ scope.row.name }}</strong><div class="muted">{{ scope.row.code }}</div></template>
        </el-table-column>
        <el-table-column label="一级菜单" width="120" align="center"><template slot-scope="scope">{{ statsFor(scope.row).menus }}</template></el-table-column>
        <el-table-column label="页面权限" width="120" align="center"><template slot-scope="scope">{{ statsFor(scope.row).pages }}</template></el-table-column>
        <el-table-column label="按钮权限" width="120" align="center"><template slot-scope="scope">{{ statsFor(scope.row).actions }}</template></el-table-column>
        <el-table-column label="授权状态" width="110" align="center">
          <template slot-scope="scope"><el-tag :type="scope.row.permissionCodes.length ? 'success' : 'info'">{{ scope.row.permissionCodes.length ? '已配置' : '未配置' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新时间" width="170" />
        <el-table-column prop="updatedBy" label="最后操作人" width="120" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="openSingleDialog(scope.row)">配置权限</el-button>
            <el-button type="text" @click="openViewDialog(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="configDialogVisible" width="900px" append-to-body>
      <el-alert v-if="configMode === 'batch'" type="warning" :closable="false" title="批量保存会用当前勾选结果统一覆盖所有选中站点。" />
      <el-form label-width="110px" class="dialog-form">
        <el-form-item v-if="configMode === 'batch'" label="选择站点" required>
          <el-select v-model="targetSiteCodes" multiple filterable collapse-tags placeholder="请选择一个或多个站点">
            <el-option v-for="site in sites" :key="site.code" :label="`${site.name} (${site.code})`" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="目标站点"><span>{{ currentSite.name }}（{{ currentSite.code }}）</span></el-form-item>
      </el-form>
      <site-permission-tree v-model="editingCodes" :tree-data="permissionTree" :readonly="configMode === 'view'" />
      <span slot="footer">
        <el-button @click="configDialogVisible = false">{{ configMode === 'view' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="configMode !== 'view'" type="primary" @click="saveConfig">保存并覆盖</el-button>
      </span>
    </el-dialog>

    <el-dialog title="复制站点权限" :visible.sync="copyDialogVisible" width="560px" append-to-body>
      <el-alert type="warning" :closable="false" title="复制采用统一覆盖，目标站点原权限将被来源站点权限替换。" />
      <el-form label-width="100px" class="copy-form">
        <el-form-item label="来源站点" required>
          <el-select v-model="copySource" placeholder="请选择来源站点"><el-option v-for="site in sites" :key="site.code" :label="`${site.name} (${site.code})`" :value="site.code" /></el-select>
        </el-form-item>
        <el-form-item label="目标站点" required>
          <el-select v-model="copyTargets" multiple filterable collapse-tags placeholder="请选择目标站点">
            <el-option v-for="site in sites" :key="site.code" :disabled="site.code === copySource" :label="`${site.name} (${site.code})`" :value="site.code" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="copyDialogVisible = false">取消</el-button><el-button type="primary" @click="confirmCopy">确认复制</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import SitePermissionTree from '@/components/SitePermissionTree'
import { buildSitePermissionTree } from '@/utils/sitePermissionCatalog'
import { copySitePermissions, getPermissionStats, readSitePermissionState, saveSitePermissions } from '@/utils/sitePermissionStore'

export default {
  name: 'SitePermissionManagement',
  components: { SitePermissionTree },
  data() {
    return {
      permissionTree: [], state: { sites: {} }, keyword: '', queryKeyword: '', statusFilter: '', queryStatus: '',
      configDialogVisible: false, copyDialogVisible: false, configMode: 'single', currentSite: {}, targetSiteCodes: [], editingCodes: [],
      copySource: '', copyTargets: []
    }
  },
  computed: {
    sites() { return Object.values(this.state.sites || {}) },
    catalogStats() { return getPermissionStats(this.permissionTree, this.permissionTreeCodes) },
    permissionTreeCodes() { return this.permissionTree.reduce((result, node) => result.concat(this.collectCodes(node)), []) },
    filteredSites() {
      return this.sites.filter(site => {
        const keywordMatch = !this.queryKeyword || `${site.name}${site.code}`.toLowerCase().includes(this.queryKeyword.toLowerCase())
        const statusMatch = !this.queryStatus || (this.queryStatus === 'configured' ? site.permissionCodes.length : !site.permissionCodes.length)
        return keywordMatch && statusMatch
      })
    },
    dialogTitle() {
      if (this.configMode === 'batch') return '多站点批量权限配置'
      if (this.configMode === 'view') return `查看权限 - ${this.currentSite.name || ''}`
      return `单站点权限配置 - ${this.currentSite.name || ''}`
    }
  },
  created() { this.reload() },
  methods: {
    collectCodes(node) { return (node.children || []).reduce((result, child) => result.concat(this.collectCodes(child)), node.permission ? [node.permission] : []) },
    reload() {
      this.permissionTree = buildSitePermissionTree()
      this.state = readSitePermissionState(this.permissionTree)
    },
    statsFor(site) { return getPermissionStats(this.permissionTree, site.permissionCodes || []) },
    applyFilters() { this.queryKeyword = this.keyword; this.queryStatus = this.statusFilter },
    resetFilters() { this.keyword = ''; this.statusFilter = ''; this.applyFilters() },
    openSingleDialog(site) { this.currentSite = site; this.configMode = 'single'; this.editingCodes = [...site.permissionCodes]; this.configDialogVisible = true },
    openViewDialog(site) { this.currentSite = site; this.configMode = 'view'; this.editingCodes = [...site.permissionCodes]; this.configDialogVisible = true },
    openBatchDialog() { this.configMode = 'batch'; this.targetSiteCodes = []; this.editingCodes = []; this.configDialogVisible = true },
    saveConfig() {
      const siteCodes = this.configMode === 'batch' ? this.targetSiteCodes : [this.currentSite.code]
      if (!siteCodes.length) return this.$message.warning('请至少选择一个站点')
      this.state = saveSitePermissions(siteCodes, this.editingCodes, this.permissionTree)
      this.configDialogVisible = false
      this.$message.success(`已覆盖保存 ${siteCodes.length} 个站点的权限`)
    },
    confirmCopy() {
      if (!this.copySource || !this.copyTargets.length) return this.$message.warning('请选择来源站点和目标站点')
      this.state = copySitePermissions(this.copySource, this.copyTargets, this.permissionTree)
      this.copyDialogVisible = false
      this.copyTargets = []
      this.$message.success('站点权限复制完成')
    }
  }
}
</script>

<style scoped>
.site-permission-page { background: #f5f7fa; min-height: calc(100vh - 84px); }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 20px; background: #fff; border: 1px solid #e4eaf2; }
.page-header h2 { margin: 0 0 8px; color: #1f2d3d; }.page-header p { margin: 0; color: #8190a5; }
.header-actions { display: flex; gap: 10px; }.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 14px; }
.summary-item { padding: 18px 20px; background: #fff; border: 1px solid #e2e8f1; }.summary-item span,.summary-item small { display: block; color: #8492a6; }.summary-item strong { display: block; margin: 8px 0; color: #2563eb; font-size: 28px; }
.rule-alert { margin-bottom: 14px; }.table-panel { padding: 16px; background: #fff; border: 1px solid #e2e8f1; }
.filter-row { display: flex; gap: 10px; margin-bottom: 14px; }.filter-row .el-input { width: 260px; }.filter-row .el-select { width: 180px; }
.muted { margin-top: 4px; color: #96a1b1; font-size: 12px; }.dialog-form { margin-top: 12px; }.dialog-form .el-select,.copy-form .el-select { width: 100%; }.copy-form { margin-top: 18px; }
</style>
