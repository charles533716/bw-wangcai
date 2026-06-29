# 意见反馈页面后端 API 对接清单

## 菜单与权限

- 菜单路径：`/system/feedback`
- 前端组件：`system/feedback/index`
- 菜单名称：`意见反馈`
- 本地 mock 开关：默认请求真实接口；如需临时使用前端 mock，可设置 `VUE_APP_FEEDBACK_MOCK=true`
- 权限标识：
  - `system:feedback:list`：列表菜单与查询
  - `system:feedback:query`：查看详情
  - `system:feedback:reply`：回复工单
  - `system:feedback:reopen`：撤销回复/重新编辑
  - `system:feedback:template`：账号级快捷回复配置
  - `system:feedback:export`：导出

## 字段枚举

### 问题类型 `questionType`

| 值 | 展示文案 |
| --- | --- |
| `DEPOSIT` | 存款问题 |
| `WITHDRAW` | 取款问题 |
| `GAME` | 游戏问题 |
| `PROMOTION` | 优惠问题 |
| `LOGIN` | 网站/APP登录 |
| `TURNOVER` | 流水问题 |
| `PROFILE` | 修改资料 |
| `SUGGESTION` | 会员建议 |

### 处理状态 `status`

| 值 | 展示文案 |
| --- | --- |
| `PENDING` | 待处理 |
| `REPLIED` | 已回复 |

## 管理后台接口

### 1. 查询反馈列表

`GET /system/feedback/list`

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | number | 是 | 页码 |
| `pageSize` | number | 是 | 每页条数 |
| `username` | string | 否 | 会员账号，模糊匹配 |
| `orderNo` | string | 否 | 关联订单号，模糊匹配 |
| `questionType` | string | 否 | 问题类型枚举 |
| `status` | string | 否 | 处理状态枚举 |
| `siteCode` | string | 否 | 站点编码 |
| `siteKeyword` | string | 否 | 站点编码/名称模糊匹配 |
| `beginTime` | string | 否 | 创建开始日期，`yyyy-MM-dd` |
| `endTime` | string | 否 | 创建结束日期，`yyyy-MM-dd` |

响应沿用若依分页结构：

```json
{
  "code": 200,
  "msg": "操作成功",
  "total": 200,
  "rows": [
    {
      "id": 1200,
      "username": "test1123",
      "vipLevel": "vip3",
      "siteCode": "333333",
      "siteName": "财神客钱",
      "questionType": "DEPOSIT",
      "description": "使用微信快捷支付充值100元，付款成功但游戏币未到账。",
      "associatedOrderNo": "DH202605201142",
      "screenshots": [
        "https://xxx/feedback/1200-1.png"
      ],
      "status": "PENDING",
      "createTime": "2026-05-20 15:10",
      "replier": null,
      "replyContent": null,
      "replyTime": null,
      "rating": null
    }
  ]
}
```

### 2. 查询反馈详情

`GET /system/feedback/{feedbackId}`

响应：

```json
{
  "code": 200,
  "data": {
    "id": 1200,
    "username": "test1123",
    "vipLevel": "vip3",
    "siteCode": "333333",
    "siteName": "财神客钱",
    "questionType": "DEPOSIT",
    "description": "使用微信快捷支付充值100元，付款成功但游戏币未到账。",
    "associatedOrderNo": "DH202605201142",
    "screenshots": ["https://xxx/feedback/1200-1.png"],
    "status": "PENDING",
    "createTime": "2026-05-20 15:10",
    "replier": null,
    "replyContent": null,
    "replyTime": null,
    "rating": null
  }
}
```

### 3. 查询反馈统计

`GET /system/feedback/stats`

请求参数可复用列表筛选参数，至少支持按站点和时间筛选。

响应：

```json
{
  "code": 200,
  "data": {
    "total": 200,
    "pending": 67,
    "replied": 133
  }
}
```

### 4. 回复反馈

`POST /system/feedback/{feedbackId}/reply`

请求体：

```json
{
  "replyContent": "您好，问题已核实并处理，请刷新钱包查看。"
}
```

响应：

```json
{
  "code": 200,
  "msg": "回复成功",
  "data": {
    "id": 1200,
    "status": "REPLIED",
    "replier": "旺财官方专员",
    "replyContent": "您好，问题已核实并处理，请刷新钱包查看。",
    "replyTime": "2026-05-29 18:30"
  }
}
```

后端动作建议：更新反馈状态、写回复记录、同步前台“我的反馈”，并发送站内信或通知。

### 5. 撤销回复/恢复待处理

`PUT /system/feedback/{feedbackId}/reopen`

请求体：

```json
{
  "reason": "重新编辑"
}
```

响应：

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 6. 查询快捷回复模板

`GET /system/feedback/templates`

说明：返回当前登录后台账号自己的快捷回复模板。后端根据 token 里的后台用户 ID 隔离数据，不需要前端传账号 ID。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | number | 否 | `1` 启用，`0` 禁用 |

响应：

```json
{
  "code": 200,
  "rows": [
    {
      "id": 1,
      "content": "您好！由于三方通道短暂延迟，我们已手动为您处理并入账。",
      "status": 1,
      "sort": 1,
      "createTime": "2026-05-29 14:30",
      "updateTime": "2026-05-29 14:30"
    }
  ]
}
```

### 7. 新增快捷回复模板

`POST /system/feedback/templates`

请求体：

```json
{
  "content": "您好！由于三方通道短暂延迟，我们已手动为您处理并入账。",
  "status": 1,
  "sort": 1
}
```

响应：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1
  }
}
```

### 8. 修改快捷回复模板

`PUT /system/feedback/templates`

请求体：

```json
{
  "id": 1,
  "content": "您好！由于三方通道短暂延迟，我们已手动为您处理并入账。",
  "status": 1,
  "sort": 1
}
```

响应：

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 9. 删除快捷回复模板

`DELETE /system/feedback/templates/{templateId}`

响应：

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 10. 导出反馈

`POST /system/feedback/export`

请求参数复用列表筛选参数；响应为 Excel 文件流。

## 前台会员端接口建议

如果前台还没有提交入口，需要补以下接口：

### 1. 提交意见反馈

`POST /member/feedback`

请求体：

```json
{
  "questionType": "DEPOSIT",
  "description": "充值100元付款成功但未到账。",
  "associatedOrderNo": "DH202605201142",
  "screenshots": ["https://xxx/feedback/1200-1.png"]
}
```

### 2. 我的反馈列表

`GET /member/feedback/list`

请求参数：`pageNum`、`pageSize`、`questionType`、`status`。

### 3. 反馈满意度评价

`POST /member/feedback/{feedbackId}/rating`

请求体：

```json
{
  "rating": 5
}
```

## 截图上传约定

- 可以复用现有通用上传接口；若没有，建议提供 `POST /common/upload` 或 `POST /member/feedback/upload`。
- 返回字段至少包含 `url`。
- 建议限制：最多 3 到 5 张，每张不超过 5MB，支持 `jpg/jpeg/png/webp`。
