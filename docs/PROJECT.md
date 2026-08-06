# 项目说明

## 项目背景和目标

本项目是旺财业务后台的 Vue 2 交互原型，覆盖总控后台、站点后台和代理后台的主要管理场景。项目用于产品需求确认、研发与测试查阅，以及通过 GitHub Pages 提供在线演示，不以真实后端联调和生产交付为默认目标。

项目持续以测试环境菜单和已确认产品规则为基准，补齐页面、Mock 数据、弹窗和操作流程，并在角色权限中反映当前已存在的菜单与页面操作。

## 整体架构

- `src/main.js`：应用入口。
- `src/router/index.js`：总控后台及扩展页面路由。
- `src/router/siteAdmin.js`：站点后台路由与菜单结构。
- `src/store`：Vuex 状态管理。
- `src/api`：保留的接口调用层；原型页面也会直接使用 Mock 数据。
- `src/views`：各业务页面。
- `src/components`：通用组件。
- `src/utils`：权限目录、权限存储和其他工具。
- `public`：静态公共资源。
- `docs`：PRD、API 说明和项目交接文档。
- `dist`：构建产物，不作为业务源码修改入口。

应用采用 Vue Router 管理页面，Element UI 提供表单、表格、弹窗、Tabs、上传与分页等基础组件。多数原型数据在组件内生成，部分配置通过 `localStorage` 保存，以便刷新后继续演示。

## 主要功能模块

当前 `src/views` 中已有的主要模块包括：

- 全站运营数据看板与首页看板
- 站点管理：开站、站点列表、站点配置、站点权限、场馆及素材相关页面
- 财务管理：存取款、审核、总站余额、额度增减、奖励发放记录、红利管理等
- 运营报表：市场、充提、站点、会员、礼金、返水、掉签等报表
- Telegram 管理
- 活动管理：活动列表、活动报表、活动奖励明细、手动派彩
- 三方场馆管理与场馆游戏报表
- 会员管理：会员列表、同 IP、VIP、推广关系、实名审核、提现流水等
- 资源管理：站内信、场馆管理（场馆、游戏、钱包、维护日志）、游戏、皮肤、APP 版本、短信、区号、线路、厂商、分组和自动下架日志
- 记录管理：投注记录、账户调整记录
- 代理管理：代理、返佣、结算、报表、收益看板及关系变更记录
- 风控管理：风控类型、规则、记录、黑白名单、标签和提现流水设置
- 系统管理：用户、角色、菜单、部门、岗位、字典、参数、通知、日志、反馈和系统维护
- 站点后台：独立菜单、角色、账号和站点权限预览

## 重要文件说明

- `package.json`：运行和构建命令，项目版本为 `3.9.0`。
- `vue.config.js`：开发端口、构建目录、资源路径和生产优化配置。
- `src/router/index.js`：总控后台页面入口和菜单映射。
- `src/router/siteAdmin.js`：站点后台菜单来源。
- `src/views/system/role/permissionCatalog.js`：总控角色权限目录。
- `src/utils/sitePermissionCatalog.js`：站点后台独立权限目录。
- `src/utils/sitePermissionStore.js`：站点权限本地持久化和目录版本失效逻辑。
- `src/views/site/permission/index.vue`：总控侧站点权限管理页面。
- `src/views/site/config/index.vue`：站点配置 Tabs 容器。
- `src/views/site/config/ClientResourceConfig.vue`：客户端资源配置页面，当前仍在开发中。
- `src/views/resources/venueManagement/`：总控资源管理下的场馆、游戏、钱包和维护日志联动原型。
- `docs/*PRD.md`：活动与首存活动相关产品文档。
- `docs/*api.md`：风险标签等接口约定。

## 本地运行

```bash
cd /Users/charles/Downloads/0\ CodeX项目/WC后台/master-admin-prototype-code-20260629-122541
npm install
npm run dev
```

默认访问地址通常为 `http://127.0.0.1:1024/`。若使用固定端口启动，则以终端输出为准。出现“本地打不开”时，应先检查开发服务进程和监听端口，不要直接判断为页面代码故障。

## 构建和部署

生产构建：

```bash
npm run build:prod
```

GitHub Pages 构建：

```bash
npm run build:github
```

GitHub 仓库：`https://github.com/charles533716/bw-wangcai.git`

线上演示地址：`https://charles533716.github.io/bw-wangcai/index`

发布前必须验证 `dist/index.html`、`dist/404.html`、公共路径和线上深链接。只有用户明确要求时才允许提交和推送。

## 新对话交接入口

新对话开始后按以下顺序阅读：

1. 根目录 `agents.md`：开发、修改和验证约束。
2. `docs/PROJECT.md`：项目架构、目录、运行与部署。
3. `docs/PROGRESS.md`：当前代码状态、未完成任务和优先级。
4. `docs/DECISIONS.md`：已确认规则及不可反复推翻的设计边界。

随后执行 `git status --short`。当前 `src/views/site/config/index.vue` 与
`src/views/site/config/ClientResourceConfig.vue` 属于暂停中的客户端资源配置改动，
不得清理、覆盖或误判为已验收功能。`docs/PROGRESS.md` 是当前进度事实来源。
