<template>
  <div class="app-container role-page">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName" clearable placeholder="请输入角色名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="全部状态">
          <el-option label="启用" value="0" />
          <el-option label="禁用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="table-toolbar">
      <el-button size="small" icon="el-icon-download" @click="exportPermissionCatalog">导出权限清单</el-button>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table v-loading="loading" :data="roleList" border>
      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="{ $index }">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" prop="roleName" min-width="130" />
      <el-table-column label="角色描述" prop="remark" min-width="260" show-overflow-tooltip />
      <el-table-column label="用户数量" prop="userCount" width="100" align="center" />
      <el-table-column label="状态" width="110" align="center">
        <template slot-scope="{ row }">
          <el-switch v-model="row.status" active-value="0" inactive-value="1" :disabled="row.locked" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
      <el-table-column label="更新时间" prop="updateTime" width="170" align="center" />
      <el-table-column label="操作" width="300" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" @click="handleView(row)">查看</el-button>
          <el-button type="text" :disabled="row.locked" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" @click="handleCopy(row)">复制</el-button>
          <el-button type="text" class="danger-action" :disabled="row.locked" @click="handleDelete(row)">删除</el-button>
          <el-button type="text" :disabled="row.locked" @click="handleStatusChangeFromAction(row)">
            {{ row.status === '0' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="dialogTitle" :visible.sync="open" width="920px" custom-class="role-permission-dialog" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <div class="role-basic-grid">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="form.roleName" :disabled="formMode === 'view'" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色状态">
            <el-radio-group v-model="form.status" :disabled="formMode === 'view'">
              <el-radio label="0">启用</el-radio>
              <el-radio label="1">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="角色描述" prop="remark" class="full-row">
            <el-input v-model="form.remark" type="textarea" :rows="2" :disabled="formMode === 'view'" placeholder="请输入角色用途说明" />
          </el-form-item>
        </div>

        <el-form-item label="权限配置" class="permission-form-item">
          <div class="permission-panel">
            <div class="permission-toolbar">
              <el-input
                v-model="permissionKeyword"
                prefix-icon="el-icon-search"
                clearable
                placeholder="搜索菜单、页面或权限名称"
                class="permission-search"
                :disabled="false"
              />
              <el-button size="mini" :disabled="formMode === 'view'" @click="selectAllPermissions">全选</el-button>
              <el-button size="mini" :disabled="formMode === 'view'" @click="clearAllPermissions">取消全选</el-button>
              <el-button size="mini" @click="expandAll(true)">展开全部</el-button>
              <el-button size="mini" @click="expandAll(false)">收起全部</el-button>
              <span class="permission-count">已选择：{{ selectedPermissionCount }}项权限</span>
            </div>
            <el-tree
              ref="permissionTree"
              class="permission-tree"
              :class="{ 'permission-tree--readonly': formMode === 'view' }"
              :data="filteredMenuOptions"
              :props="defaultProps"
              node-key="id"
              show-checkbox
              :check-on-click-node="formMode !== 'view'"
              :expand-on-click-node="false"
              :check-strictly="false"
              :default-expanded-keys="defaultExpandedMenuKeys"
              @check-change="handlePermissionCheck"
            >
              <span slot-scope="{ data }" class="permission-node">
                <span>{{ data.label }}</span>
                <code v-if="data.permission">{{ data.permission }}</code>
              </span>
            </el-tree>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button v-if="formMode === 'view'" type="primary" @click="applyRolePreview">应用此角色预览</el-button>
        <el-button v-else type="primary" @click="submitForm">保存</el-button>
        <el-button @click="cancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  buildRoleMenuTree,
  clonePrototypeRoles,
  filterPrototypeRoles,
  getRoleCheckedKeys,
  nextRoleId,
  savePrototypeRoles
} from './prototypeData'
import {
  buildPermissionManifest,
  collectPermissionCodes,
  filterPermissionTree,
  flattenPermissionTree
} from './permissionCatalog'
import { applyPermissionPreview } from '@/utils/prototypePermission'
import { resolvePrototypePath } from '@/utils/prototypeBackend'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export default {
  name: 'Role',
  data() {
    return {
      loading: false,
      total: 0,
      roleList: [],
      prototypeRoleRows: clonePrototypeRoles(),
      queryParams: { pageNum: 1, pageSize: 10, roleName: '', status: '' },
      open: false,
      formMode: 'add',
      form: {},
      menuOptions: [],
      permissionKeyword: '',
      defaultExpandedMenuKeys: [],
      permissionSyncing: false,
      defaultProps: { children: 'children', label: 'label' },
      rules: {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '角色描述不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.formMode === 'view' ? '查看角色' : this.formMode === 'edit' ? '编辑角色' : this.formMode === 'copy' ? '复制角色' : '新增角色'
    },
    filteredMenuOptions() {
      return filterPermissionTree(this.menuOptions, this.permissionKeyword)
    },
    selectedPermissionCount() {
      return (this.form.permissionCodes || []).length
    }
  },
  watch: {
    permissionKeyword() {
      const checked = this.form.permissionCodes || []
      this.$nextTick(() => this.$refs.permissionTree && this.$refs.permissionTree.setCheckedKeys(checked))
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      const filtered = filterPrototypeRoles(this.prototypeRoleRows, this.queryParams)
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      this.roleList = filtered.slice(start, start + this.queryParams.pageSize)
      this.total = filtered.length
    },
    ensurePermissionTree() {
      const routes = this.$store.state.permission.sidebarRouters || []
      this.menuOptions = buildRoleMenuTree(routes)
      this.defaultExpandedMenuKeys = this.menuOptions.slice(0, 4).map(item => item.id)
    },
    resetFormData() {
      this.form = {
        roleId: undefined,
        roleName: '',
        roleKey: '',
        status: '0',
        userCount: 0,
        remark: '',
        permissionCodes: []
      }
      this.permissionKeyword = ''
    },
    openRoleDialog(row, mode) {
      this.ensurePermissionTree()
      this.formMode = mode
      this.form = clone(row)
      this.form.permissionCodes = getRoleCheckedKeys(row, this.menuOptions)
      this.open = true
      this.$nextTick(() => {
        this.$refs.permissionTree.setCheckedKeys(this.form.permissionCodes)
      })
    },
    handleAdd() {
      this.resetFormData()
      this.ensurePermissionTree()
      this.formMode = 'add'
      this.open = true
      this.$nextTick(() => this.$refs.permissionTree.setCheckedKeys([]))
    },
    handleView(row) {
      this.openRoleDialog(row, 'view')
    },
    handleUpdate(row) {
      if (!row.locked) this.openRoleDialog(row, 'edit')
    },
    handleCopy(row) {
      const copyRow = clone(row)
      delete copyRow.roleId
      copyRow.roleName = `${row.roleName}-副本`
      copyRow.roleKey = `${row.roleKey}-copy-${Date.now()}`
      copyRow.userCount = 0
      copyRow.locked = false
      copyRow.preset = false
      this.openRoleDialog(copyRow, 'copy')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = { pageNum: 1, pageSize: 10, roleName: '', status: '' }
      this.getList()
    },
    getSelectedPermissionCodes() {
      return [...new Set(this.form.permissionCodes || [])]
    },
    selectAllPermissions() {
      this.form.permissionCodes = collectPermissionCodes(this.menuOptions)
      this.$refs.permissionTree.setCheckedKeys(this.form.permissionCodes)
    },
    clearAllPermissions() {
      this.form.permissionCodes = []
      this.$refs.permissionTree.setCheckedKeys([])
    },
    expandAll(expanded) {
      Object.values(this.$refs.permissionTree.store.nodesMap).forEach(node => { node.expanded = expanded })
    },
    handlePermissionCheck(data, checked) {
      if (this.permissionSyncing || this.formMode === 'view' || data.type !== 'permission') return
      const flat = flattenPermissionTree(this.menuOptions, [])
      const page = flat.find(node => node.type === 'page' && node.routePath === data.routePath)
      if (!page) return
      this.permissionSyncing = true
      const keys = new Set(this.form.permissionCodes || [])
      if (checked) keys.add(data.permission)
      else keys.delete(data.permission)
      if (data.action !== 'view' && checked) keys.add(page.viewPermission)
      if (data.action === 'view' && !checked) {
        ;(page.children || []).forEach(child => keys.delete(child.id))
      }
      this.$refs.permissionTree.setCheckedKeys([...keys])
      this.form.permissionCodes = [...keys]
      this.permissionSyncing = false
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const now = this.parseTime(new Date())
        const saved = {
          ...clone(this.form),
          permissionCodes: this.getSelectedPermissionCodes(),
          updateTime: now
        }
        if (saved.roleId) {
          const index = this.prototypeRoleRows.findIndex(item => item.roleId === saved.roleId)
          this.prototypeRoleRows.splice(index, 1, saved)
        } else {
          saved.roleId = nextRoleId(this.prototypeRoleRows)
          saved.roleKey = saved.roleKey || `role-${saved.roleId}`
          saved.createTime = now
          this.prototypeRoleRows.push(saved)
        }
        savePrototypeRoles(this.prototypeRoleRows)
        this.open = false
        this.getList()
        this.$modal.msgSuccess('保存成功')
      })
    },
    handleStatusChange(row) {
      savePrototypeRoles(this.prototypeRoleRows)
      this.$modal.msgSuccess(row.status === '0' ? '启用成功' : '禁用成功')
    },
    handleStatusChangeFromAction(row) {
      row.status = row.status === '0' ? '1' : '0'
      this.handleStatusChange(row)
    },
    handleDelete(row) {
      if (row.locked) return
      this.$modal.confirm(`确认删除角色“${row.roleName}”吗？`).then(() => {
        this.prototypeRoleRows = this.prototypeRoleRows.filter(item => item.roleId !== row.roleId)
        savePrototypeRoles(this.prototypeRoleRows)
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    exportPermissionCatalog() {
      this.ensurePermissionTree()
      const rows = [['一级菜单', '二级菜单/页面', '权限名称', '权限标识']]
      buildPermissionManifest(this.menuOptions).forEach(item => {
        rows.push([item.firstMenu, item.page, item.permissionName, item.permissionCode])
      })
      const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
      link.download = `角色权限清单_${this.parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      this.$modal.msgSuccess(`已导出${rows.length - 1}项权限`)
    },
    applyRolePreview() {
      const previewRole = {
        ...this.form,
        permissionCodes: this.form.permissionCodes || getRoleCheckedKeys(this.form, this.menuOptions)
      }
      applyPermissionPreview(previewRole, this.menuOptions)
      this.$modal.msgSuccess(`已应用“${this.form.roleName}”权限预览`)
      const firstPage = flattenPermissionTree(this.menuOptions, []).find(node => (
        node.type === 'page' && previewRole.permissionCodes.includes(node.viewPermission)
      ))
      setTimeout(() => {
        window.location.href = resolvePrototypePath(firstPage ? firstPage.routePath : '/401')
      }, 300)
    },
    cancel() {
      this.open = false
    }
  }
}
</script>

<style scoped>
.table-toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.danger-action { color: #f56c6c; }
.role-basic-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; }
.role-basic-grid .full-row { grid-column: 1 / -1; }
.permission-form-item { margin-bottom: 0; }
.permission-panel { border: 1px solid #dfe6ef; border-radius: 4px; overflow: hidden; }
.permission-toolbar { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f7f9fc; border-bottom: 1px solid #e5eaf2; }
.permission-search { width: 280px; }
.permission-count { margin-left: auto; color: #409eff; white-space: nowrap; }
.permission-tree { height: 460px; padding: 10px 12px; overflow: auto; }
.permission-node { display: flex; align-items: center; gap: 12px; }
.permission-node code { color: #909399; font-size: 12px; }
::v-deep .role-permission-dialog .el-dialog__body { padding: 18px 24px 10px; }
::v-deep .permission-tree .el-tree-node__content { min-height: 30px; }
::v-deep .permission-tree--readonly .el-checkbox { pointer-events: none; }
</style>
