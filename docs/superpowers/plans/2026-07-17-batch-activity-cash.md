# 活动彩金批量导入发放 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在总站余额的“发放活动彩金”弹窗中补齐示例 Excel、批量导入校验、正常与异常结果、异常导出及正常数据批量发放原型。

**Architecture:** 把批量演示数据与校验规则放入独立 CommonJS 辅助模块，页面仅负责展示和交互；右上角业务说明增加该页面专属说明。Excel 下载使用浏览器生成的 Excel 兼容 `.xls` 文件，上传后按原型演示数据执行校验。

**Tech Stack:** Vue 2.6、Element UI 2.15、原生 Blob 下载、Node assert 校验脚本。

## Global Constraints

- 本次仅实现原型交互，不接入真实 Excel 解析、会员查询或订单接口。
- 只有“所属站点 + 会员账号 + 彩金类型”三项完全相同时才判定重复。
- 异常数据不阻断正常数据继续发放。
- 不修改总站收支明细筛选和列表结构。
- 不更新 GitHub。

---

### Task 1: 批量数据规则与测试

**Files:**
- Create: `src/views/funds/mainBalance/batchActivityCash.js`
- Create: `scripts/check-batch-activity-cash.js`

**Interfaces:**
- Produces: `validateBatchActivityCashRows(rows)`，返回 `{ allRows, validRows, invalidRows, validAmount }`。
- Produces: `getBatchActivityCashDemoRows()` 和 `getBatchActivityCashTemplateRows()`。

- [ ] **Step 1: 编写失败测试**

使用 Node `assert` 验证同站点同会员不同彩金类型不重复、三字段完全相同判重，以及无站点、无会员、金额和流水异常。

- [ ] **Step 2: 运行测试并确认失败**

Run: `node scripts/check-batch-activity-cash.js`
Expected: FAIL，提示找不到 `batchActivityCash.js` 或导出函数。

- [ ] **Step 3: 实现最小数据模块**

增加允许的站点、会员、彩金类型、模板行和演示导入行；校验时合并一行命中的全部错误原因。

- [ ] **Step 4: 运行测试并确认通过**

Run: `node scripts/check-batch-activity-cash.js`
Expected: PASS，输出批量活动彩金数据校验通过。

### Task 2: 发放活动彩金批量导入界面

**Files:**
- Modify: `src/views/funds/mainBalance/index.vue`

**Interfaces:**
- Consumes: Task 1 的批量数据与校验函数。
- Produces: 单笔发放、批量导入两个页签以及批量配置提交交互。

- [ ] **Step 1: 添加静态失败检查**

在校验脚本中断言页面包含“批量导入”“下载示例Excel”“正常数据”“异常数据”“确认批量发放”。

- [ ] **Step 2: 运行检查并确认失败**

Run: `node scripts/check-batch-activity-cash.js`
Expected: FAIL，提示页面缺少批量导入结构。

- [ ] **Step 3: 实现批量导入交互**

活动彩金模式增加页签；批量页包含模板下载、拖拽上传、统计卡片、正常/异常结果表、异常导出、统一发放时间、领取有效期、备注和确认批量发放按钮。批量模式将弹窗宽度调整为 1180px。

- [ ] **Step 4: 实现 Excel 兼容下载**

使用 HTML table + `application/vnd.ms-excel` Blob 下载示例表和异常表，文件名分别为“活动彩金批量发放示例.xls”和“活动彩金异常数据.xls”。

- [ ] **Step 5: 运行检查并确认通过**

Run: `node scripts/check-batch-activity-cash.js`
Expected: PASS。

### Task 3: 业务及需求说明

**Files:**
- Modify: `src/utils/revisionNotes/master.js`

**Interfaces:**
- Produces: `/funds/mainBalance` 页面专属业务说明。

- [ ] **Step 1: 添加失败检查**

校验脚本断言业务说明包含批量导入五列、异常规则、正常数据继续发放，以及三字段组合判重原文。

- [ ] **Step 2: 运行检查并确认失败**

Run: `node scripts/check-batch-activity-cash.js`
Expected: FAIL，提示业务说明缺少批量导入规则。

- [ ] **Step 3: 增加页面专属说明**

在通用财务管理配置之前增加 `/funds/mainBalance` 精确匹配项，避免被通用财务说明覆盖。

- [ ] **Step 4: 运行检查并确认通过**

Run: `node scripts/check-batch-activity-cash.js`
Expected: PASS。

### Task 4: 构建与浏览器验收

**Files:**
- Verify: `src/views/funds/mainBalance/index.vue`
- Verify: `src/utils/revisionNotes/master.js`

- [ ] **Step 1: 运行生产构建**

Run: `NODE_OPTIONS=--openssl-legacy-provider node node_modules/@vue/cli-service/bin/vue-cli-service.js build`
Expected: `DONE Build complete`。

- [ ] **Step 2: 浏览器验证主流程**

打开 `/funds/mainBalance`，进入“发活动彩金 > 批量导入”，依次验证模板下载入口、上传后统计、正常/异常表切换、异常导出入口、批量配置和确认发放。

- [ ] **Step 3: 验证业务说明**

打开右上角“业务及需求说明”，确认三字段组合判重规则清晰可见。

- [ ] **Step 4: 确认本地服务可访问**

Run: `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/funds/mainBalance`
Expected: `200`。
