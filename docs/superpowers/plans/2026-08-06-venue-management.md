# 总控后台场馆管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在总控后台资源管理中新增可完整操作的场馆管理页面，提供场馆、游戏、钱包和维护日志四个联动 Tab。

**Architecture:** 父页面持有共享 `venueManagementModel`，四个子组件通过 props 和事件读写同一状态。纯模型负责初始数据、校验、筛选、分页、统计、维护日志和带版本本地持久化，视图负责 Element UI 展示。

**Tech Stack:** Vue 2.6、Element UI、CommonJS 纯模型、`localStorage`、Node smoke 脚本。

## Global Constraints

- 新菜单位于“资源管理 → 站内信”下方，原独立“游戏列表”保留。
- 页面固定为场馆列表、游戏列表、钱包列表、维护日志四个 Tab。
- 仅实现浏览器本地 Mock，不接真实后端。
- 不修改站点后台场馆页面和客户端资源配置。
- 危险操作必须确认，校验失败必须保留当前输入。
- 不提交、不推送、不发布 Git。

---

### Task 1: 共享数据模型与回归脚本

**Files:**
- Create: `src/views/resources/venueManagement/model.js`
- Create: `scripts/check-venue-management.js`

**Interfaces:**
- Produces: `createInitialState`、`cloneState`、`validateVenue`、`validateGame`、`validateGameBatch`、`validateWallet`、四个 `filter*`、`paginate`、`getVenueStats`、`appendMaintenanceLog`、`loadState`、`saveState`。

- [ ] **Step 1: 写失败检查**

断言 8 类场馆数据存在；场馆 ID/CODE、游戏 CODE、钱包 CODE 重复校验失败；筛选和分页总数正确；页码可回退；游戏数和授权数来自关联数据；维护状态可新增日志；错误版本缓存会重建。

- [ ] **Step 2: 运行并确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `Cannot find module '../src/views/resources/venueManagement/model'`。

- [ ] **Step 3: 实现模型**

状态结构：

```js
{
  version: 1,
  venues: [{ id, code, name, nameZh, type, walletId, commissionRate, sort, status, authCount, remark, updatedAt }],
  games: [{ id, name, venueId, code, platforms, sort, webImage, h5Image, authCount, status, brand, creator, createdAt, editor, editedAt }],
  wallets: [{ id, name, code, venueIds, direct, locked, siteStatuses }],
  maintenanceLogs: [{ id, venueId, gameId, startAt, endAt, operator, operatedAt, reason }]
}
```

`paginate` 返回 `{ rows, total, pageNum, pageSize }`，页码上限为 `Math.max(1, Math.ceil(total / pageSize))`。

- [ ] **Step 4: 运行检查并确认通过**

Run: `node scripts/check-venue-management.js`
Expected: `场馆管理模型检查通过`。

### Task 2: 菜单、路由与父页面

**Files:**
- Modify: `src/router/index.js`
- Create: `src/views/resources/venueManagement/index.vue`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Consumes: `createInitialState`、`loadState`、`saveState`。
- Produces: route `ResourceVenueManagement`；事件 `switch-tab`、`state-change`。

- [ ] **Step 1: 增加失败静态断言**

断言 `/resources/venueManagement`、“场馆管理”、原 `/resources/gameList`、四个 Tab 和四个子组件注册存在。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `缺少场馆管理路由`。

- [ ] **Step 3: 实现路由和父页面**

新增路由：

```js
{
  path: 'venueManagement',
  component: () => import('@/views/resources/venueManagement/index'),
  name: 'ResourceVenueManagement',
  meta: { title: '场馆管理', icon: 'table' }
}
```

父页面加载共享状态，变更后持久化；`switch-tab` 切换到 `games` 并记录预设场馆 ID。

- [ ] **Step 4: 运行静态检查**

Run: `node scripts/check-venue-management.js`
Expected: 路由和父页面断言通过。

### Task 3: 场馆列表与弹窗

**Files:**
- Create: `src/views/resources/venueManagement/VenueList.vue`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Consumes prop: `state: Object`。
- Emits: `state-change`、`switch-tab` with `{ tab: 'games', venueId }`。

- [ ] **Step 1: 增加失败断言**

断言 4 个筛选项、12 个字段、8 类操作按钮及弹窗字段“场馆ID、场馆CODE、中文名称、场馆类型、场馆钱包、场馆佣金比例、排序、备注”存在。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `缺少场馆列表组件`。

- [ ] **Step 3: 实现页面**

本地 computed 完成筛选分页；游戏数调用 `getVenueStats` 并可跳游戏 Tab；新增/编辑调用 `validateVenue`；维护状态调用 `appendMaintenanceLog`；授权数增减且不小于 0。

- [ ] **Step 4: 运行检查**

Run: `node scripts/check-venue-management.js`
Expected: 场馆断言通过。

### Task 4: 游戏列表、单个新增和批量新增

**Files:**
- Create: `src/views/resources/venueManagement/GameList.vue`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Consumes props: `state: Object`、`presetVenueId: [Number, String]`。
- Emits: `state-change`。

- [ ] **Step 1: 增加失败断言**

断言 7 个筛选项、16 个字段、新增/批量新增、编辑、状态切换、授权/取消授权、WEB/H5 图片上传存在。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `缺少游戏列表组件`。

- [ ] **Step 3: 实现页面**

单个表单调用 `validateGame`；批量动态行调用 `validateGameBatch`；场馆类型自动带出；平台多选 `PC/H5/APP`；图片限制单张 JPG/JPEG/PNG、2MB；维护状态追加日志。

- [ ] **Step 4: 运行检查**

Run: `node scripts/check-venue-management.js`
Expected: 游戏断言通过。

### Task 5: 钱包列表及全部操作

**Files:**
- Create: `src/views/resources/venueManagement/WalletList.vue`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Consumes prop: `state: Object`。
- Emits: `state-change`。

- [ ] **Step 1: 增加失败断言**

断言 2 个筛选项、6 个字段、新增、编辑、锁定、解锁、删除、站点状态调整和确认语义存在。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `缺少钱包列表组件`。

- [ ] **Step 3: 实现页面**

新增/编辑调用 `validateWallet`；锁定/解锁更新 `locked`；删除确认后修正页码；站点状态调整固定提供 `2222、SITE001、SITE002、SITE003`，授权数取启用站点数量。

- [ ] **Step 4: 运行检查**

Run: `node scripts/check-venue-management.js`
Expected: 钱包断言通过。

### Task 6: 维护日志和跨 Tab 联动

**Files:**
- Create: `src/views/resources/venueManagement/MaintenanceLog.vue`
- Modify: `src/views/resources/venueManagement/index.vue`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Consumes prop: `state: Object`。

- [ ] **Step 1: 增加失败断言**

断言筛选、重置和 7 个日志字段存在；场馆/游戏进入维护状态后日志数增加且名称可解析。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `缺少维护日志组件`。

- [ ] **Step 3: 实现日志和联动**

日志只读展示，查询同时匹配场馆和游戏名称；父页面持久化状态，切换 Tab 不重建数据。

- [ ] **Step 4: 运行完整检查**

Run: `node scripts/check-venue-management.js`
Expected: `场馆管理模型检查通过`。

### Task 7: 权限、文档、构建和浏览器验收

**Files:**
- Modify: `src/views/system/role/permissionCatalog.js`
- Modify: `docs/PROJECT.md`
- Modify: `docs/PROGRESS.md`
- Modify: `docs/DECISIONS.md`
- Modify: `scripts/check-venue-management.js`

**Interfaces:**
- Produces: 页面权限及 `create/edit/status/authorize/revoke/delete/adjust` 操作目录。

- [ ] **Step 1: 增加权限失败断言**

断言权限目录包含“场馆管理”及查看、新增、编辑、状态切换、授权、取消授权、删除、站点状态调整。

- [ ] **Step 2: 运行确认失败**

Run: `node scripts/check-venue-management.js`
Expected: FAIL with `权限目录缺少场馆管理`。

- [ ] **Step 3: 更新权限和文档**

只添加本页面权限条目，不运行会改写其他模块的全量生成器。文档记录四个 Tab、共享 Mock、联动、本地持久化键和回归入口。

- [ ] **Step 4: 自动验证和构建**

Run:

```bash
node scripts/check-venue-management.js
node scripts/app-h5-home-config-smoke.js
node scripts/web-venue-detail-config-smoke.js
NODE_OPTIONS=--openssl-legacy-provider node node_modules/@vue/cli-service/bin/vue-cli-service.js build
git diff --check
```

Expected: 三项脚本通过、构建完成、差异检查无输出。

- [ ] **Step 5: 浏览器验收**

确认 HTTP 200；检查菜单位置和原游戏列表保留；逐 Tab 验证筛选、重置、分页、全部弹窗和操作；验证游戏数跳转、授权统计、钱包状态及维护日志联动；检查浏览器错误日志。

- [ ] **Step 6: 最终范围核对**

运行 `git status --short`，确认没有修改站点后台场馆页面、原游戏列表实现和客户端资源配置等无关代码；不提交、不推送。
