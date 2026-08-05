<template>
  <div class="app-container site-account-page">
    <div class="page-heading">
      <div><h2>账号管理</h2><p>账号通过关联角色继承权限，不支持为账号单独配置权限。</p></div>
      <el-button type="primary" @click="openCreate">新增账号</el-button>
    </div>
    <el-alert
      :closable="false"
      show-icon
      type="info"
      :title="`当前站点：${siteName}（${siteCode}）。账号有效权限为已启用角色权限的合集，并自动受总控授权范围约束。`"
    />

    <div class="filter-panel">
      <el-input v-model="keyword" clearable prefix-icon="el-icon-search" placeholder="搜索账号、姓名或部门" />
      <el-select v-model="roleFilter" clearable placeholder="全部角色">
        <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
      </el-select>
      <el-select v-model="statusFilter" clearable placeholder="全部状态">
        <el-option label="启用" :value="true" />
        <el-option label="禁用" :value="false" />
      </el-select>
    </div>

    <el-table :data="filteredAccounts" border>
      <el-table-column type="index" label="序号" width="70" align="center" />
      <el-table-column prop="username" label="账号" width="170" />
      <el-table-column prop="nickname" label="姓名" width="150" />
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column label="关联角色" min-width="260">
        <template slot-scope="scope">
          <el-tag v-for="role in accountRoles(scope.row)" :key="role.id" size="small" class="role-tag">{{ role.name }}</el-tag>
          <span v-if="!accountRoles(scope.row).length" class="empty-text">未关联</span>
        </template>
      </el-table-column>
      <el-table-column label="有效权限" width="110" align="center">
        <template slot-scope="scope">{{ permissionCodes(scope.row).length }} 项</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope"><el-switch v-model="scope.row.status" @change="saveStatus(scope.row)" /></template>
      </el-table-column>
      <el-table-column label="操作" width="290" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="openPermissions(scope.row)">查看权限</el-button>
          <el-button type="text" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="previewAccount(scope.row)">权限预览</el-button>
          <el-button type="text" class="danger" @click="removeAccount(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="form.id ? '编辑账号' : '新增账号'" :visible.sync="dialogVisible" width="680px" append-to-body>
      <el-form :model="form" label-width="90px">
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="账号" required><el-input v-model="form.username" maxlength="30" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="姓名" required><el-input v-model="form.nickname" maxlength="30" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="部门"><el-input v-model="form.department" maxlength="30" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :label="true">启用</el-radio><el-radio :label="false">禁用</el-radio></el-radio-group></el-form-item></el-col>
        </el-row>
        <el-form-item label="关联角色" required>
          <el-select v-model="form.roleIds" multiple collapse-tags filterable placeholder="请选择角色" class="full-width">
            <el-option v-for="role in activeRoles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
          <div class="form-tip">账号仅继承所选角色权限，无法在此额外增加权限。</div>
        </el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitAccount">保存账号</el-button></span>
    </el-dialog>

    <el-dialog :title="`${permissionAccount.username} 的有效权限`" :visible.sync="permissionVisible" width="920px" append-to-body>
      <el-alert :closable="false" type="success" show-icon :title="`继承角色：${accountRoleNames(permissionAccount)}；当前有效权限 ${permissionCodes(permissionAccount).length} 项。`" />
      <site-permission-tree :value="permissionCodes(permissionAccount)" :tree-data="scopedTree" readonly height="430px" class="permission-preview" />
      <span slot="footer"><el-button @click="permissionVisible = false">关闭</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import SitePermissionTree from '@/components/SitePermissionTree'
import { applyPermissionPreview } from '@/utils/prototypePermission'
import { getCurrentSiteCode } from '@/utils/prototypeBackend'
import { buildSitePermissionTree } from '@/utils/sitePermissionCatalog'
import {
  deleteSiteAccount,
  filterTreeByPermissionCodes,
  getAccountPermissionCodes,
  readSitePermissionState,
  saveSiteAccount
} from '@/utils/sitePermissionStore'

export default {
  name: 'SiteAdminAccountManagement',
  components: { SitePermissionTree },
  data() {
    return {
      siteCode: getCurrentSiteCode(),
      state: { sites: {}, roles: {}, accounts: {}, catalogTree: [] },
      keyword: '',
      roleFilter: '',
      statusFilter: '',
      dialogVisible: false,
      permissionVisible: false,
      permissionAccount: { username: '', roleIds: [] },
      form: this.emptyForm()
    }
  },
  computed: {
    site() { return this.state.sites[this.siteCode] || { name: '当前站点', permissionCodes: [] } },
    siteName() { return this.site.name },
    roles() { return this.state.roles[this.siteCode] || [] },
    activeRoles() { return this.roles.filter(role => role.status) },
    accounts() { return this.state.accounts[this.siteCode] || [] },
    scopedTree() { return filterTreeByPermissionCodes(this.state.catalogTree || [], this.site.permissionCodes || []) },
    filteredAccounts() {
      return this.accounts.filter(account => {
        const text = `${account.username}${account.nickname}${account.department}`
        return (!this.keyword || text.includes(this.keyword)) &&
          (!this.roleFilter || (account.roleIds || []).includes(this.roleFilter)) &&
          (this.statusFilter === '' || account.status === this.statusFilter)
      })
    }
  },
  created() { this.reload() },
  methods: {
    emptyForm() { return { id: '', username: '', nickname: '', department: '', status: true, roleIds: [] } },
    reload() { this.state = readSitePermissionState(buildSitePermissionTree()) },
    accountRoles(account) { return this.roles.filter(role => (account.roleIds || []).includes(role.id)) },
    accountRoleNames(account) { return this.accountRoles(account).map(role => role.name).join('、') || '未关联角色' },
    permissionCodes(account) { return getAccountPermissionCodes(this.state, this.siteCode, account || { roleIds: [] }) },
    openCreate() { this.form = this.emptyForm(); this.dialogVisible = true },
    openEdit(account) { this.form = JSON.parse(JSON.stringify(account)); this.dialogVisible = true },
    openPermissions(account) { this.permissionAccount = JSON.parse(JSON.stringify(account)); this.permissionVisible = true },
    submitAccount() {
      if (!this.form.username.trim()) return this.$message.warning('请输入账号')
      if (!this.form.nickname.trim()) return this.$message.warning('请输入姓名')
      if (!this.form.roleIds.length) return this.$message.warning('请至少关联一个角色')
      this.state = saveSiteAccount(this.siteCode, this.form)
      this.dialogVisible = false
      this.$message.success('账号保存成功')
    },
    saveStatus(account) { this.state = saveSiteAccount(this.siteCode, account); this.$message.success(account.status ? '账号已启用' : '账号已禁用') },
    previewAccount(account) {
      if (!account.status) return this.$message.warning('禁用账号不能进行权限预览')
      const codes = this.permissionCodes(account)
      if (!codes.length) return this.$message.warning('该账号暂无有效权限')
      applyPermissionPreview({ roleId: account.id, roleName: account.username, roleKey: `site-account-${account.id}`, permissionCodes: codes }, this.scopedTree)
      this.$message.success(`已应用账号“${account.username}”的权限预览，页面即将刷新`)
      setTimeout(() => window.location.reload(), 350)
    },
    removeAccount(account) {
      this.$confirm(`确认删除账号“${account.username}”吗？`, '删除账号', { type: 'warning' }).then(() => {
        this.state = deleteSiteAccount(this.siteCode, account.id)
        this.$message.success('账号已删除')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.site-account-page { background: #f5f7fa; min-height: calc(100vh - 84px); }
.page-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.page-heading h2 { margin: 0 0 6px; }
.page-heading p { margin: 0; color: #8794a8; }
.filter-panel { display: flex; gap: 12px; margin: 14px 0; padding: 14px; background: #fff; border: 1px solid #e4e9f1; }
.filter-panel .el-input { width: 280px; }
.filter-panel .el-select { width: 180px; }
.role-tag { margin: 2px 6px 2px 0; }
.empty-text, .form-tip { color: #98a4b5; font-size: 12px; }
.form-tip { margin-top: 6px; }
.full-width { width: 100%; }
.danger { color: #f56c6c; }
.permission-preview { margin-top: 14px; }
</style>
