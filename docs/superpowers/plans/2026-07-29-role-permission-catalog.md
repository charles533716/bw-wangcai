# 角色权限配置 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为总站后台现有全部菜单和页面建立统一权限目录，并完成角色配置、权限预览和权限清单。

**Architecture:** 路由负责菜单层级，独立权限目录负责页面操作和唯一标识；角色管理、路由过滤、按钮指令和权限清单共用该目录。原型角色及当前预览角色保存在本地状态中，不改变现有业务接口。

**Tech Stack:** Vue 2、Vue Router、Vuex、Element UI、localStorage、Node.js 静态检查脚本。

## Global Constraints

- 只处理总站后台当前已有菜单、页面和实际业务操作。
- 不为搜索、筛选、分页、刷新和重置查询条件建立权限。
- 不改变现有业务流程和视觉风格。
- 权限标识为小写英文、冒号分隔且全局唯一。
- 本次不推送 GitHub。

---

### Task 1: 权限目录与检查脚本

**Files:**
- Create: `src/views/system/role/permissionCatalog.js`
- Create: `scripts/check-role-permission-catalog.js`

**Interfaces:**
- Produces: `buildPermissionTree(routes)`, `permissionCatalog`, `permissionAliasMap`, `presetRoles`, `validatePermissionCatalog()`.

- [ ] 建立权限目录与页面操作定义。
- [ ] 建立当前权限标识兼容映射。
- [ ] 建立预置角色权限集合。
- [ ] 编写静态检查，验证唯一性、页面覆盖和预置角色引用。
- [ ] 运行检查并确认通过。

### Task 2: 角色数据与角色管理页面

**Files:**
- Modify: `src/views/system/role/prototypeData.js`
- Modify: `src/views/system/role/index.vue`
- Modify: `scripts/check-role-management-prototype.js`

**Interfaces:**
- Consumes: Task 1 的权限目录和树构建方法。
- Produces: 完整角色列表、权限配置、查看、复制和权限预览入口。

- [ ] 更新角色字段和预置角色。
- [ ] 将现有示例菜单树替换为统一权限树。
- [ ] 实现搜索、统计、全选、取消全选、展开、收起与父子联动。
- [ ] 实现查看、编辑回显、复制、保存和超级管理员只读。
- [ ] 更新角色管理专项检查并确认通过。

### Task 3: 权限预览与实际控制

**Files:**
- Create: `src/utils/prototypePermission.js`
- Modify: `src/store/modules/permission.js`
- Modify: `src/directive/permission/hasPermi.js`
- Modify: `src/permission.js`
- Modify: `src/layout/components/Navbar.vue`

**Interfaces:**
- Consumes: Task 1 的权限目录、兼容映射和角色权限。
- Produces: `getPreviewRole()`, `setPreviewRole()`, `clearPreviewRole()`, `hasPrototypePermission()`.

- [ ] 保存和读取当前预览角色。
- [ ] 按查看权限过滤左侧菜单。
- [ ] 拦截无页面查看权限的路由。
- [ ] 通过权限指令控制业务按钮。
- [ ] 展示当前预览角色和退出入口。

### Task 4: 权限清单与完整验证

**Files:**
- Create: `docs/permissions/role-permission-list.md`
- Modify: `scripts/check-role-permission-catalog.js`

**Interfaces:**
- Consumes: Task 1 的统一权限目录。
- Produces: 可供研发查阅的完整权限清单。

- [ ] 生成模块、页面、权限名称和权限标识清单。
- [ ] 运行权限目录和角色页面专项检查。
- [ ] 运行 `git diff --check`。
- [ ] 运行 GitHub 模式生产构建。
- [ ] 在本地页面验证权限搜索、回显、预览、菜单和按钮控制。

