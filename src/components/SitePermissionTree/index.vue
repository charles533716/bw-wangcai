<template>
  <div class="site-permission-tree">
    <div class="tree-toolbar">
      <el-input
        v-model="keyword"
        size="small"
        clearable
        prefix-icon="el-icon-search"
        placeholder="搜索菜单、页面或权限名称"
      />
      <div class="tree-actions">
        <el-button size="mini" :disabled="readonly" @click="selectAll">全选</el-button>
        <el-button size="mini" :disabled="readonly" @click="clearAll">取消全选</el-button>
        <el-button size="mini" @click="expandAll(true)">展开全部</el-button>
        <el-button size="mini" @click="expandAll(false)">收起全部</el-button>
      </div>
      <span class="selected-count">已选择：{{ checkedCodes.length }}项权限</span>
    </div>
    <el-tree
      ref="permissionTree"
      class="permission-tree"
      :class="{ 'permission-tree--readonly': readonly }"
      :style="{ height }"
      :data="filteredTree"
      node-key="id"
      show-checkbox
      check-strictly
      :default-expanded-keys="expandedKeys"
      :props="treeProps"
      @check="handleCheck"
    >
      <span slot-scope="{ data }" class="tree-node">
        <span class="node-type">{{ nodeType(data) }}</span>
        <span>{{ data.label }}</span>
        <span v-if="data.permission" class="permission-code">{{ data.permission }}</span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { collectPermissionCodes, filterPermissionTree, flattenPermissionTree } from '@/views/system/role/permissionCatalog'

export default {
  name: 'SitePermissionTree',
  props: {
    value: { type: Array, default: () => [] },
    treeData: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
    height: { type: String, default: '430px' }
  },
  data() {
    return {
      keyword: '',
      checkedCodes: [],
      expandedKeys: [],
      treeProps: { children: 'children', label: 'label' }
    }
  },
  computed: {
    filteredTree() {
      return filterPermissionTree(this.treeData, this.keyword)
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(value) {
        this.checkedCodes = [...new Set(value || [])]
        this.$nextTick(this.syncTree)
      }
    },
    filteredTree() {
      this.$nextTick(this.syncTree)
    }
  },
  methods: {
    syncTree() {
      if (!this.$refs.permissionTree) return
      this.$refs.permissionTree.setCheckedKeys(this.checkedCodes)
      if (this.keyword) {
        this.expandedKeys = flattenPermissionTree(this.filteredTree, []).map(node => node.id)
      }
    },
    nodeType(node) {
      if (node.type === 'directory') return '[菜单]'
      if (node.type === 'page') return '[页面]'
      return '[权限]'
    },
    emitValue(codes) {
      this.checkedCodes = [...new Set(codes)]
      this.$emit('input', this.checkedCodes)
      this.$emit('change', this.checkedCodes)
      this.$nextTick(this.syncTree)
    },
    selectAll() {
      this.emitValue(collectPermissionCodes(this.treeData))
    },
    clearAll() {
      this.emitValue([])
    },
    expandAll(expanded) {
      const keys = expanded ? flattenPermissionTree(this.filteredTree, []).map(node => node.id) : []
      this.expandedKeys = keys
      this.$nextTick(() => {
        const store = this.$refs.permissionTree && this.$refs.permissionTree.store
        if (!store) return
        Object.keys(store.nodesMap).forEach(key => { store.nodesMap[key].expanded = expanded })
      })
    },
    handleCheck(data, state) {
      if (this.readonly) {
        this.syncTree()
        return
      }
      const permissionSet = new Set(collectPermissionCodes(this.treeData))
      const checked = new Set(state.checkedKeys.filter(key => permissionSet.has(key)))
      const descendantCodes = collectPermissionCodes(data.children || [])
      const isChecked = state.checkedKeys.includes(data.id)
      if (data.type === 'directory' || data.type === 'page') {
        descendantCodes.forEach(code => isChecked ? checked.add(code) : checked.delete(code))
      }
      if (data.type === 'permission') {
        if (isChecked) {
          checked.add(data.permission)
          if (data.action !== 'view') {
            const page = flattenPermissionTree(this.treeData, []).find(node => node.type === 'page' && node.routePath === data.routePath)
            if (page) checked.add(page.viewPermission)
          }
        } else {
          checked.delete(data.permission)
          if (data.action === 'view') {
            const page = flattenPermissionTree(this.treeData, []).find(node => node.type === 'page' && node.routePath === data.routePath)
            ;(page && page.children || []).forEach(child => checked.delete(child.permission))
          }
        }
      }
      this.emitValue([...checked])
    }
  }
}
</script>

<style scoped>
.site-permission-tree { border: 1px solid #dfe7f3; background: #fff; }
.tree-toolbar { display: flex; align-items: center; gap: 10px; padding: 12px; border-bottom: 1px solid #e8edf5; background: #f8fafc; }
.tree-toolbar .el-input { width: 260px; }
.tree-actions { display: flex; align-items: center; }
.selected-count { margin-left: auto; color: #5b6b7f; font-size: 13px; white-space: nowrap; }
.permission-tree { padding: 10px 12px; overflow: auto; }
.tree-node { display: flex; align-items: center; gap: 8px; min-width: 0; }
.node-type { color: #8fa0b6; font-size: 12px; }
.permission-code { margin-left: 8px; color: #a4afbf; font-size: 12px; }
.permission-tree--readonly ::v-deep .el-checkbox { pointer-events: none; }
::v-deep .el-tree-node__content { min-height: 30px; }
</style>
