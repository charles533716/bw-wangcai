# 风控标签管理后端 API 对接清单

## 菜单与权限

- 菜单路径：`/risk/tags`
- 前端组件：`risk/tags/index`
- 菜单名称：`风控标签管理`
- 本地 mock 开关：默认请求真实接口；如需临时使用前端演示数据，可设置 `VUE_APP_RISK_TAG_MOCK=true`。
- 建议权限标识：
  - `risk:tag:list`：列表菜单与查询
  - `risk:tag:query`：查看详情
  - `risk:tag:add`：新增自定义标签
  - `risk:tag:edit`：修改标签
  - `risk:tag:remove`：删除自定义标签
  - `risk:tag:log`：查看操作记录

## 字段枚举

### 标签类型 `tagType`

| 值 | 展示文案 | 规则 |
| --- | --- | --- |
| `SYSTEM` | 系统标签 | 后端预置，不允许新增名称和删除，只允许修改备注 |
| `CUSTOM` | 自定义标签 | 后台人员新增，可编辑名称、备注和删除 |

### 操作类型 `actionType`

| 值 | 展示文案 |
| --- | --- |
| `新增` | 新增 |
| `修改` | 修改 |
| `删除` | 删除 |

## 管理后台接口

### 1. 查询风控标签列表

`POST /api/admin/risk/getRiskTagList`

请求体：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | number | 是 | 页码 |
| `pageSize` | number | 是 | 每页条数 |
| `tagName` | string | 否 | 标签名称，模糊匹配 |
| `tagType` | string | 否 | `SYSTEM` / `CUSTOM` |

响应沿用若依分页结构：

```json
{
  "code": 200,
  "msg": "操作成功",
  "total": 24,
  "rows": [
    {
      "id": "sys-1",
      "tagName": "高盈利会员",
      "tagType": "SYSTEM",
      "remark": "盈利水平异常偏离的超额获利玩家，出款时需强化其游戏原始流水对比与对账单审计。",
      "updateTime": "2026-06-02 09:30:15",
      "operator": "admin"
    }
  ]
}
```

### 2. 查询风控标签详情

`POST /api/admin/risk/getRiskTagInfo?id={id}`

响应：

```json
{
  "code": 200,
  "data": {
    "id": "cust-1",
    "tagName": "高频刷充代理关联户",
    "tagType": "CUSTOM",
    "remark": "与下线代理存在多层交叉，专攻返佣差价。",
    "updateTime": "2026-05-30 14:15:20",
    "operator": "admin"
  }
}
```

### 3. 新增自定义风控标签

`POST /api/admin/risk/addRiskTag`

请求体：

```json
{
  "tagName": "特定漏洞套佣玩家",
  "tagType": "CUSTOM",
  "remark": "针对特定活动漏洞与代理佣金叠加套利的会员群。"
}
```

后端规则：

- 只允许新增 `CUSTOM` 标签。
- `tagName` 全局唯一，建议长度不超过 20 个字符。
- `remark` 必填，建议长度不超过 300 个字符。
- 成功后写入操作记录，`actionType=新增`。

### 4. 修改风控标签

`POST /api/admin/risk/updateRiskTag`

请求体：

```json
{
  "id": "cust-1",
  "tagName": "高频刷充代理关联户",
  "tagType": "CUSTOM",
  "remark": "与下线代理存在多层交叉，专攻返佣差价，投注规律高度一致。"
}
```

后端规则：

- `SYSTEM` 标签：忽略或拒绝 `tagName` 变更，只允许修改 `remark`。
- `CUSTOM` 标签：允许修改 `tagName` 和 `remark`。
- 标签名称重复时返回明确错误文案。
- 成功后写入操作记录，`actionType=修改`，`detail` 建议记录修改前后差异。

### 5. 删除自定义风控标签

`POST /api/admin/risk/deleteRiskTag?id={id}`

后端规则：

- 只允许删除 `CUSTOM` 标签。
- `SYSTEM` 标签返回错误：`系统标签不可删除`。
- 如果会员历史记录已使用该标签，后端需要明确处理策略：保留历史快照、解除绑定或禁止删除。
- 成功后写入操作记录，`actionType=删除`。

响应：

```json
{
  "code": 200,
  "msg": "删除成功"
}
```

### 6. 查询风控标签操作记录

`POST /api/admin/risk/getRiskTagLogList`

请求体：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | number | 是 | 页码 |
| `pageSize` | number | 是 | 每页条数 |
| `tagName` | string | 否 | 可选，标签名称 |
| `tagType` | string | 否 | 可选，`SYSTEM` / `CUSTOM` |
| `actionType` | string | 否 | 可选，`新增` / `修改` / `删除` |

响应：

```json
{
  "code": 200,
  "total": 5,
  "rows": [
    {
      "id": "log-1",
      "tagId": "cust-1",
      "tagName": "高频刷充代理关联户",
      "tagType": "CUSTOM",
      "actionType": "新增",
      "detail": "新增自定义标签 [高频刷充代理关联户]，用于识别代理佣金交叉套利玩家。",
      "operator": "admin",
      "createTime": "2026-05-30 14:15:20"
    }
  ]
}
```
