# 会员风控标签后端 API 对接清单

## 页面位置

- 页面一：会员详情
  - 路由：`/member/user-detail/:id`
  - 前端组件：`src/views/member/detail/index.vue`
  - 功能：在“基本信息”里展示、添加、移除会员风控标签
- 页面二：会员列表
  - 路由：会员管理列表页
  - 前端组件：`src/views/member/list/index.vue`
  - 功能：按风控标签筛选会员，并在“会员信息”列展示会员已绑定标签
- 页面三：取款审核
  - 路由：取款审核页
  - 前端组件：`src/views/funds/withdraw/index.vue`
  - 功能：按风控标签筛选取款订单，在列表、查看弹窗、审核弹窗展示会员风控标签，并支持在弹窗内添加、移除会员标签
- 当前状态：前端已切换为真实接口。会员详情和取款审核弹窗通过新增绑定接口查询、添加、移除标签；会员列表和取款审核列表通过各自列表接口按标签筛选并展示每行返回的标签。

## 已有接口可复用

### 查询可选风控标签列表

- URL：`POST /api/admin/risk/getRiskTagList`
- 当前页面用途：添加标签下拉候选
- 请求体：

```json
{
  "pageNum": 1,
  "pageSize": 200,
  "tagName": "",
  "tagType": ""
}
```

- 需要返回字段：

```json
{
  "code": 200,
  "rows": [
    {
      "id": "sys-1",
      "tagName": "高盈利会员",
      "tagType": "SYSTEM",
      "remark": "盈利水平异常偏离的会员"
    }
  ],
  "total": 11
}
```

## 新增接口

### 0. 会员列表支持风控标签筛选和返回标签

- 现有 URL：`POST /api/admin/member/getMemberList?pageNum=1&pageSize=20`
- 用途：会员列表按风控标签查询，并直接展示每个会员已绑定的标签。
- 请求体新增可选字段：

```json
{
  "siteCode": "",
  "id": "",
  "name": "",
  "realName": "",
  "parentAgentName": "",
  "status": 1,
  "riskTagId": "sys-1",
  "riskTagName": "高盈利会员"
}
```

- 要求：
  - `riskTagId` 有值时，后端按标签绑定关系筛选会员。
  - `riskTagName` 是前端兜底传参，建议后端优先用 `riskTagId`，没有 `riskTagId` 再按名称匹配。
  - 分页必须在后端筛选后再计算，`total` 返回筛选后的总数。
  - 每条会员记录需要带 `riskTags` 数组，避免前端进入详情或逐条调用接口。

- 响应示例：

```json
{
  "code": 200,
  "rows": [
    {
      "id": 1484,
      "name": "testtc009",
      "realName": "张三",
      "status": 1,
      "riskTags": [
        {
          "tagId": "sys-1",
          "tagName": "高盈利会员",
          "tagType": "SYSTEM"
        },
        {
          "tagId": "custom-3",
          "tagName": "羊毛党用户",
          "tagType": "CUSTOM"
        }
      ]
    }
  ],
  "total": 1
}
```

- 兼容字段：
  - 最推荐：`riskTags: [{ tagId, tagName, tagType }]`
  - 可兼容：`memberRiskTags`、`tagList`、`riskTagList`
  - 字符串兜底：`riskTagNames: "高盈利会员,羊毛党用户"`

### 0.1 取款审核列表支持风控标签筛选和返回标签

- 现有 URL：`GET /funds/withdraw/list`
- 用途：取款审核页按会员风控标签筛选订单，并在列表直接展示标签。
- 请求参数新增可选字段：

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "transactionType": 2,
  "code": "",
  "accountType": "MEMBER",
  "memberName": "",
  "withdrawType": "USDT",
  "status": 4,
  "platformStatus": "FROZEN",
  "riskTagId": "sys-1",
  "riskTagName": "高盈利会员"
}
```

- 要求：
  - `riskTagId` 有值时，后端按会员标签绑定关系筛选取款订单。
  - `riskTagName` 是前端兜底传参，建议后端优先用 `riskTagId`，没有 `riskTagId` 再按名称匹配。
  - 只需要筛选会员订单；非会员账号类型没有会员风控标签时可以不匹配。
  - 分页必须在后端筛选后再计算，`total` 返回筛选后的总数。
  - 每条取款记录需要带 `memberId` 和 `riskTags`，否则列表只能展示空标签，弹窗内也无法添加/移除标签。

- 响应行示例：

```json
{
  "id": 9001,
  "code": "WD1780121065941887",
  "accountType": "MEMBER",
  "memberId": 1484,
  "memberName": "testtc009",
  "riskTags": [
    {
      "tagId": "sys-1",
      "tagName": "高盈利会员",
      "tagType": "SYSTEM"
    }
  ]
}
```

### 0.2 取款审核详情返回会员标签和会员ID

- 现有 URL：`GET /funds/withdraw/{id}`
- 用途：打开“查看”和“审核”弹窗时展示并管理会员风控标签。
- 需要返回字段：

```json
{
  "id": 9001,
  "code": "WD1780121065941887",
  "accountType": "MEMBER",
  "memberId": 1484,
  "memberName": "testtc009",
  "riskTags": [
    {
      "tagId": "sys-1",
      "tagName": "高盈利会员",
      "tagType": "SYSTEM"
    }
  ]
}
```

- 要求：
  - `memberId` 必须和 `POST /api/admin/member/getMemberRiskTagList`、`addMemberRiskTag`、`deleteMemberRiskTag` 使用的会员主键一致。
  - `riskTags` 用于弹窗首屏展示；弹窗打开后前端仍会调用 `getMemberRiskTagList` 重新拉取最新绑定关系。

### 1. 查询会员已绑定风控标签

- 建议 URL：`POST /api/admin/member/getMemberRiskTagList`
- 用途：进入会员详情时加载当前会员已绑定的风控标签
- 请求体：

```json
{
  "memberId": 1484
}
```

- 响应：

```json
{
  "code": 200,
  "rows": [
    {
      "tagId": "sys-1",
      "tagName": "高盈利会员",
      "tagType": "SYSTEM",
      "bindTime": "2026-06-06 13:40:00",
      "bindBy": "admin"
    }
  ]
}
```

### 2. 给会员添加风控标签

- 建议 URL：`POST /api/admin/member/addMemberRiskTag`
- 用途：选择一个候选标签后绑定到会员
- 请求体：

```json
{
  "memberId": 1484,
  "tagId": "sys-1"
}
```

- 要求：
  - 同一个会员不能重复绑定同一个标签。
  - 如果重复提交，建议后端直接返回成功，避免前端重复点击造成异常。
  - 成功后写操作日志，记录会员、标签、操作人、时间。

- 响应：

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 3. 移除会员风控标签

- 建议 URL：`POST /api/admin/member/deleteMemberRiskTag`
- 用途：点击标签关闭按钮后解除会员和标签的绑定
- 请求体：

```json
{
  "memberId": 1484,
  "tagId": "sys-1"
}
```

- 要求：
  - 只解除会员绑定，不删除风控标签定义。
  - 成功后写操作日志，记录会员、标签、操作人、时间。

- 响应：

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

## 可选优化

会员详情接口 `POST /api/admin/member/getMemberInfo?id=1484` 也可以直接附带已绑定标签，减少一次请求：

```json
{
  "code": 200,
  "data": {
    "id": 1484,
    "name": "testtc009",
    "riskTags": [
      {
        "tagId": "sys-1",
        "tagName": "高盈利会员",
        "tagType": "SYSTEM"
      }
    ]
  }
}
```

如果这样做，前端仍建议保留独立的“查询会员已绑定风控标签”接口，用于添加/移除后刷新。

## 字段约定

- `memberId`：会员主键，和会员详情路由里的 `:id` 一致。
- `tagId`：风控标签主键，来自 `/api/admin/risk/getRiskTagList`。
- `tagName`：标签名称，必须 UTF-8 正常返回。
- `tagType`：`SYSTEM` 系统标签，`CUSTOM` 自定义标签。
- 删除自定义标签定义时，后端需要明确处理已绑定会员的历史关系，建议保留历史日志但解除当前绑定。
