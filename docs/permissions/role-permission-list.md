# 角色权限清单

本清单由角色管理页面基于当前可见菜单、路由和页面操作动态生成。角色管理右上角的“导出权限清单”可导出当前版本的完整 CSV，权限标识统一采用 `模块:页面:操作` 格式。

| 一级菜单 | 二级菜单/页面 | 权限名称 | 权限标识 |
| --- | --- | --- | --- |
| 全站运营数据看板 | 全站运营数据看板 | 查看 | dashboard:index:view |
| 站点管理 | 开站申请 | 查看 | site:apply:view |
| 站点管理 | 站点列表 | 查看 | site:list:view |
| 站点管理 | 站点场馆管理 | 查看 | site:venue:view |
| 站点管理 | 站点素材管理 | 查看 | site:material:view |
| 财务管理 | 奖励发放记录 | 查看 | finance:reward-record:view |
| 财务管理 | 余额宝利息发放记录 | 查看 | finance:reward-record:view |
| 运营报表 | 掉签分析 | 查看 | report:drop-analysis:view |
| Telegram管理 | telegram配置 | 查看 | telegram:config:view |
| 活动管理 | 活动列表 | 新增活动 | activity:list:create |
| 活动管理 | 活动列表 | 编辑 | activity:list:edit |
| 活动管理 | 活动列表 | 删除 | activity:list:delete |
| 活动管理 | 活动列表 | 启用/禁用 | activity:list:status |
| 活动管理 | 活动奖励明细 | 查看详情 | activity:reward-detail:detail |
| 活动管理 | 手动派彩 | 批量手动派彩 | activity:manual-payout:batch-grant |
| 场馆游戏报表 | 场馆报表 | 查看 | venue-report:venue:view |
| 场馆游戏报表 | 场馆游戏报表 | 导出 | venue-report:game:export |
| 场馆游戏报表 | 场馆游戏会员盈亏报表 | 导出 | venue-report:member-profit:export |
| 会员管理 | 会员列表 | 查看详情 | member:list:detail |
| 会员管理 | 会员实名审核列表 | 手动修改 | member:real-name-audit:edit |
| 会员管理 | 会员提现流水查询 | 查看明细 | member:withdraw-turnover:detail |
| 资源管理 | 游戏自动下架日志 | 查看详情 | resource:game-auto-offline-log:detail |
| 代理管理 | 负盈利代理佣金结算 | 确认发放 | agent:negative-profit-settlement:confirm |
| 代理管理 | 负盈利代理佣金报表 | 导出 | agent:negative-profit-report:export |
| 代理管理 | 修改代理关系记录 | 查看 | agent:relationship-record:view |
| 系统管理 | 角色管理 | 配置权限 | system:role:permission |

> 表内列出重点业务权限作为文档索引；完整页面访问权限和全部按钮权限以角色管理页面实时生成并导出的权限清单为准，避免菜单迭代后文档静态内容失效。
