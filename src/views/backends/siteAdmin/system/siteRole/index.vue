<template>
  <div class="app-container site-role-page">
    <div class="page-heading"><div><h2>角色管理</h2><p>站点角色只能分配总控已授权范围内的菜单与按钮权限。</p></div><el-button type="primary" @click="openCreate">新增角色</el-button></div>
    <el-alert :closable="false" show-icon type="info" :title="`当前站点：${siteName}（${siteCode}），总控已授权 ${siteGrantedCodes.length} 项权限。总控回收权限后，角色和账号对应权限同步回收。`" />
    <div class="filter-panel"><el-input v-model="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索角色名称或描述" /><el-select v-model="statusFilter" clearable placeholder="全部状态"><el-option label="启用" :value="true" /><el-option label="禁用" :value="false" /></el-select></div>
    <el-table :data="filteredRoles" border>
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="name" label="角色名称" width="170" />
      <el-table-column prop="description" label="角色描述" min-width="220" />
      <el-table-column label="用户数量" width="100" align="center"><template slot-scope="scope">{{ accountCount(scope.row.id) }}</template></el-table-column>
      <el-table-column label="权限数量" width="100" align="center"><template slot-scope="scope">{{ scope.row.permissionCodes.length }}</template></el-table-column>
      <el-table-column label="状态" width="100" align="center"><template slot-scope="scope"><el-switch v-model="scope.row.status" :disabled="scope.row.system" @change="saveStatus(scope.row)" /></template></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column prop="updatedAt" label="更新时间" width="170" />
      <el-table-column label="操作" width="230" fixed="right" align="center"><template slot-scope="scope"><el-button type="text" @click="openView(scope.row)">查看</el-button><el-button type="text" :disabled="scope.row.system" @click="openEdit(scope.row)">编辑</el-button><el-button type="text" @click="copyRole(scope.row)">复制</el-button><el-button type="text" class="danger" :disabled="scope.row.system" @click="removeRole(scope.row)">删除</el-button></template></el-table-column>
    </el-table>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="920px" append-to-body>
      <el-form :model="form" label-width="90px">
        <el-row :gutter="18"><el-col :span="12"><el-form-item label="角色名称" required><el-input v-model="form.name" :disabled="mode === 'view'" maxlength="30" /></el-form-item></el-col><el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status" :disabled="mode === 'view'"><el-radio :label="true">启用</el-radio><el-radio :label="false">禁用</el-radio></el-radio-group></el-form-item></el-col></el-row>
        <el-form-item label="角色描述"><el-input v-model="form.description" :disabled="mode === 'view'" type="textarea" :rows="2" maxlength="100" /></el-form-item>
        <el-form-item label="权限配置" required><site-permission-tree v-model="form.permissionCodes" :tree-data="scopedTree" :readonly="mode === 'view'" height="420px" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button><el-button v-if="mode !== 'view'" type="primary" @click="submitRole">保存角色</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import SitePermissionTree from '@/components/SitePermissionTree'
import { getCurrentSiteCode } from '@/utils/prototypeBackend'
import { deleteSiteRole, filterTreeByPermissionCodes, readSitePermissionState, saveSiteRole } from '@/utils/sitePermissionStore'
import { buildSitePermissionTree } from '@/utils/sitePermissionCatalog'

export default {
  name: 'SiteAdminRoleManagement', components: { SitePermissionTree },
  data() { return { siteCode: getCurrentSiteCode(), state: { sites: {}, roles: {}, accounts: {}, catalogTree: [] }, keyword: '', statusFilter: '', dialogVisible: false, mode: 'create', form: this.emptyForm() } },
  computed: {
    site() { return this.state.sites[this.siteCode] || { name: '当前站点', permissionCodes: [] } }, siteName() { return this.site.name }, siteGrantedCodes() { return this.site.permissionCodes || [] },
    scopedTree() { return filterTreeByPermissionCodes(this.state.catalogTree || [], this.siteGrantedCodes) }, roles() { return this.state.roles[this.siteCode] || [] }, accounts() { return this.state.accounts[this.siteCode] || [] },
    filteredRoles() { return this.roles.filter(role => (!this.keyword || `${role.name}${role.description}`.includes(this.keyword)) && (this.statusFilter === '' || role.status === this.statusFilter)) },
    dialogTitle() { return this.mode === 'create' ? '新增角色' : this.mode === 'edit' ? '编辑角色' : '查看角色' }
  },
  created() { this.reload() },
  methods: {
    emptyForm() { return { id: '', name: '', description: '', status: true, permissionCodes: [], system: false } }, reload() { this.state = readSitePermissionState(buildSitePermissionTree()) },
    accountCount(roleId) { return this.accounts.filter(account => (account.roleIds || []).includes(roleId)).length },
    openCreate() { this.mode = 'create'; this.form = this.emptyForm(); this.dialogVisible = true }, openEdit(role) { this.mode = 'edit'; this.form = JSON.parse(JSON.stringify(role)); this.dialogVisible = true }, openView(role) { this.mode = 'view'; this.form = JSON.parse(JSON.stringify(role)); this.dialogVisible = true },
    submitRole() { if (!this.form.name.trim()) return this.$message.warning('请输入角色名称'); if (!this.form.permissionCodes.length) return this.$message.warning('请至少选择一项权限'); this.state = saveSiteRole(this.siteCode, this.form); this.dialogVisible = false; this.$message.success('角色保存成功') },
    saveStatus(role) { this.state = saveSiteRole(this.siteCode, role); this.$message.success(role.status ? '角色已启用' : '角色已禁用') },
    copyRole(role) { const copy = { ...JSON.parse(JSON.stringify(role)), id: '', name: `${role.name}副本`, system: false }; this.state = saveSiteRole(this.siteCode, copy); this.$message.success('角色复制成功') },
    removeRole(role) { this.$confirm(`确认删除角色“${role.name}”吗？`, '删除角色', { type: 'warning' }).then(() => { this.state = deleteSiteRole(this.siteCode, role.id); this.$message.success('角色已删除') }).catch(() => {}) }
  }
}
</script>

<style scoped>
.site-role-page { background: #f5f7fa; min-height: calc(100vh - 84px); }.page-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }.page-heading h2 { margin:0 0 6px; }.page-heading p { margin:0; color:#8794a8; }
.filter-panel { display:flex; gap:12px; margin:14px 0; padding:14px; background:#fff; border:1px solid #e4e9f1; }.filter-panel .el-input { width:280px; }.filter-panel .el-select { width:180px; }.danger { color:#f56c6c; }
</style>
