# Site Security Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在站点配置页新增“安全设置”Tab，提供四项实名信息唯一绑定开关、统一说明和原型本地保存能力。

**Architecture:** 新建独立 `SecuritySettings.vue` 组件负责页面呈现和每站点本地状态；`src/views/site/config/index.vue` 仅负责注册并展示新 Tab。新增 Node 静态检查脚本验证 Tab、文案、配置项和保存行为均存在。

**Tech Stack:** Vue 2.6、Element UI 2.15、localStorage、Node.js assert

## Global Constraints

- “安全设置”必须位于“站点综合配置”右侧。
- 配置项为手机号、银行卡、支付宝、微信唯一绑定，首次进入默认全部开启。
- 统一说明必须逐字展示：开启后，同一实名信息在当前站点内只能归属一个用户。用户解绑、删除收款方式或注销账号后，历史归属关系仍保留，不允许其他用户绑定。
- 仅实现原型本地交互，不新增真实后端接口，不修改其他站点配置。
- 本次只在本地验证，不推送 GitHub。

---

### Task 1: 添加失败的页面结构检查

**Files:**
- Create: `scripts/check-site-security-settings.js`
- Test: `scripts/check-site-security-settings.js`

**Interfaces:**
- Consumes: `src/views/site/config/index.vue` 和 `src/views/site/config/SecuritySettings.vue` 源码文本。
- Produces: 退出码 `0` 表示安全设置页面结构满足需求；断言失败表示缺少需求项。

- [ ] **Step 1: 写入失败检查**

```js
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const indexSource = fs.readFileSync(path.resolve(__dirname, '../src/views/site/config/index.vue'), 'utf8')
const securitySource = fs.readFileSync(path.resolve(__dirname, '../src/views/site/config/SecuritySettings.vue'), 'utf8')

assert(indexSource.includes('label="安全设置"'))
assert(indexSource.includes('name="security"'))
assert(indexSource.includes('SecuritySettings'))
;['手机号唯一绑定', '银行卡唯一绑定', '支付宝唯一绑定', '微信唯一绑定'].forEach(label => {
  assert(securitySource.includes(label), `缺少配置项：${label}`)
})
assert(securitySource.includes('历史归属关系仍保留，不允许其他用户绑定'))
assert(securitySource.includes('安全设置保存成功'))
assert(securitySource.includes('localStorage'))

console.log('PASS 站点安全设置页面检查通过')
```

- [ ] **Step 2: 运行检查并确认失败**

Run: `/Users/charles/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-site-security-settings.js`

Expected: FAIL，提示找不到 `SecuritySettings.vue`。

### Task 2: 实现安全设置组件并接入 Tab

**Files:**
- Create: `src/views/site/config/SecuritySettings.vue`
- Modify: `src/views/site/config/index.vue`
- Test: `scripts/check-site-security-settings.js`

**Interfaces:**
- Consumes: `siteCode: String` 属性。
- Produces: `SecuritySettings` Vue 组件；使用 `master-admin-prototype:site-security-settings:<siteCode>` 存储当前站点四项布尔配置。

- [ ] **Step 1: 创建安全设置组件**

组件使用 `el-card`、顶部统一说明和 `el-table`，表格列为“配置项 / 控件 / 默认值 / 规则”。四行分别绑定 `mobileUnique`、`bankCardUnique`、`alipayUnique`、`wechatUnique`，默认值均为 `true`。点击“保存安全设置”时写入 localStorage 并调用：

```js
this.$message.success('安全设置保存成功')
```

- [ ] **Step 2: 在站点配置页接入 Tab**

在 `comprehensive` 页签后增加：

```vue
<el-tab-pane label="安全设置" name="security">
  <security-settings
    v-if="activeTab === 'security'"
    :site-code="siteCode"
  />
</el-tab-pane>
```

并导入、注册 `SecuritySettings`。

- [ ] **Step 3: 运行静态检查**

Run: `/Users/charles/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-site-security-settings.js`

Expected: `PASS 站点安全设置页面检查通过`

- [ ] **Step 4: 执行完整构建**

Run: `NODE_OPTIONS=--openssl-legacy-provider /Users/charles/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/@vue/cli-service/bin/vue-cli-service.js build`

Expected: 构建完成；允许仓库既有 `.template.html` 动态扫描警告，不允许新增编译错误。

- [ ] **Step 5: 浏览器验收**

打开 `http://127.0.0.1:8080/site/config/index?siteCode=2222`，确认 Tab 顺序、四个默认开启开关、统一说明、保存提示及刷新后的状态保持。

- [ ] **Step 6: 本地提交实现**

```bash
git add src/views/site/config/index.vue src/views/site/config/SecuritySettings.vue scripts/check-site-security-settings.js
git commit -m "Add site security settings tab"
```

不得执行 `git push`。
