import { buildPermissionTree } from '@/views/system/role/permissionCatalog'

const page = (path, title, component) => ({
  path,
  meta: { title, prototypeComponent: component }
})

const menu = (path, title, children) => ({
  path,
  meta: { title },
  children
})

// 站点权限只能从站点后台菜单生成，不能依赖当前登录后台的动态路由。
export const SITE_PERMISSION_ROUTES = [
  page('/site-admin/home', '首页', 'backends/siteAdmin/dashboard/index'),
  menu('/site-admin/member', '会员管理', [
    page('user', '会员列表', 'backends/siteAdmin/member/user/index'),
    page('team', '会员团队', 'backends/siteAdmin/member/team/index')
  ]),
  menu('/site-admin/agent', '代理管理', [
    page('index', '代理列表', 'backends/siteAdmin/agent/index'),
    page('commission-plan', '佣金方案', 'backends/siteAdmin/agent/comm/index'),
    page('commission-record', '佣金账单', 'backends/siteAdmin/agent/record'),
    page('commission-grant', '佣金发放', 'backends/siteAdmin/agent/grant'),
    page('reversal-stats', '冲正统计', 'backends/siteAdmin/agent/reversal/stats/index'),
    page('reversal-repayment', '冲正还款', 'backends/siteAdmin/agent/reversal/repayment/index'),
    page('advance-records', '代理预支记录', 'agent/advanceRecords/index')
  ]),
  menu('/site-admin/funds', '财务管理', [
    page('center', '财务中心', 'backends/siteAdmin/funds/center/index'),
    page('account', '资金账户', 'backends/siteAdmin/funds/account/index'),
    page('adjust', '额度调整', 'backends/siteAdmin/funds/adjust/index'),
    page('adjust-approve', '额度审批', 'backends/siteAdmin/funds/adjust/approve'),
    page('record', '资金账变', 'backends/siteAdmin/funds/record/index'),
    page('report', '资金报表', 'backends/siteAdmin/funds/report/index'),
    page('red-packet', '会员红包', 'backends/siteAdmin/funds/redPacket/index')
  ]),
  menu('/site-admin/game', '游戏管理', [
    page('list', '游戏列表', 'backends/siteAdmin/game/index'),
    page('record', '游戏记录', 'backends/siteAdmin/game/record/index'),
    page('bet', '游戏下注', 'backends/siteAdmin/game/record/gameBet'),
    page('batch', '批量下注计划', 'backends/siteAdmin/game/batch/index'),
    page('config', '配置类型', 'backends/siteAdmin/game/config/index'),
    page('config-data', '配置数据', 'backends/siteAdmin/game/config/data')
  ]),
  menu('/site-admin/activity', '活动配置', [
    page('manage', '活动配置', 'backends/siteAdmin/activity/manage/index')
  ]),
  menu('/site-admin/site', '站点管理', [
    page('index', '站点信息', 'backends/siteAdmin/site/index'),
    page('config', '站点配置', 'backends/siteAdmin/site/config/index'),
    page('pay', '支付配置', 'backends/siteAdmin/site/pay'),
    page('update', '站点更新', 'backends/siteAdmin/site/update'),
    page('launch', '站点发布', 'backends/siteAdmin/site/launch'),
    page('resource', '站点资源', 'backends/siteAdmin/site/resource'),
    page('venue', '站点场馆', 'backends/siteAdmin/site/venue/index'),
    page('venue-config', '场馆配置', 'backends/siteAdmin/site/venue/VenueManage'),
    page('game-config', '游戏配置', 'backends/siteAdmin/site/venue/GameManage')
  ]),
  menu('/site-admin/skin', '皮肤管理', [
    page('index', '皮肤管理', 'backends/siteAdmin/resources/skin/index')
  ]),
  menu('/site-admin/venue', '场馆列表', [
    page('index', '场馆列表', 'backends/siteAdmin/venue/index')
  ]),
  menu('/site-admin/system', '系统管理', [
    page('user', '用户管理', 'backends/siteAdmin/system/user/index'),
    page('role', '角色管理', 'backends/siteAdmin/system/siteRole/index'),
    page('account', '账号管理', 'backends/siteAdmin/system/siteAccount/index'),
    page('menu', '菜单管理', 'backends/siteAdmin/system/menu/index'),
    page('dept', '部门管理', 'backends/siteAdmin/system/dept/index'),
    page('post', '岗位管理', 'backends/siteAdmin/system/post/index'),
    page('dict', '字典管理', 'backends/siteAdmin/system/dict/index'),
    page('config', '参数设置', 'backends/siteAdmin/system/config/index'),
    page('notice', '通知公告', 'backends/siteAdmin/system/notice/index')
  ]),
  menu('/site-admin/monitor', '系统监控', [
    page('online', '在线用户', 'backends/siteAdmin/monitor/online/index'),
    page('job', '定时任务', 'backends/siteAdmin/monitor/job/index'),
    page('login-log', '登录日志', 'backends/siteAdmin/monitor/logininfor/index'),
    page('operation-log', '操作日志', 'backends/siteAdmin/monitor/operlog/index'),
    page('server', '服务监控', 'backends/siteAdmin/monitor/server/index'),
    page('cache', '缓存监控', 'backends/siteAdmin/monitor/cache/index'),
    page('druid', '数据源监控', 'backends/siteAdmin/monitor/druid/index')
  ])
]

export function buildSitePermissionTree() {
  return buildPermissionTree(SITE_PERMISSION_ROUTES)
}
