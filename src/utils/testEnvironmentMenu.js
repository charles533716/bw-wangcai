const SITE_MENU_ITEMS = {
  apply: '开站申请',
  site: '站点列表',
  venue: '站点场馆管理',
  resource: '站点素材管理'
}
const SITE_MENU_ORDER = ['apply', 'site', 'venue', 'resource']
const FINANCE_MENU_TITLES = {
  redPacketRecord: '奖励发放记录'
}
const REPORT_MENU_ITEMS = {
  marketdata: '市场数据统计表',
  withdrawtransfer: '充提转账统计',
  siteprofitdetail: '站点利润明细',
  site: '站点报表',
  memberchangerecord: '账变记录',
  transferdetail: '站点/代理转账明细报表',
  memberpromotionbenefit: '会员推广福利明细',
  memberpromotionstats: '会员推广统计报表',
  rebate: '会员投注返水报表',
  bonus: '礼金统计报表',
  dropSignAnalysis: '掉签分析'
}
const REPORT_MENU_ORDER = Object.keys(REPORT_MENU_ITEMS)
const RESOURCE_MENU_FIRST_COMPONENT = 'resources/template/index'
const RESOURCE_GAME_LIST_PATH = 'gameList'
const RESOURCE_SKIN_PATH = 'skin'
const RESOURCE_MENU_ITEMS = {
  appVersion: 'App版本管理',
  gameCurrency: '三方游戏币种配置',
  smsChannel: '短信通道管理',
  areaCode: '区号配置',
  smsLog: '短信发送记录',
  gameLine: '游戏线路管理',
  gameFactory: '游戏厂商管理',
  gameBase: '游戏管理',
  gameGroup: '游戏分组管理'
}
const RESOURCE_MENU_ORDER = Object.keys(RESOURCE_MENU_ITEMS)
const RESOURCE_HIDDEN_PATHS = new Set(['realNameChannel'])
const GAME_AUTO_DISABLE_COMPONENT = 'resources/gameAutoDisableLog/index'
const RECORD_MENU_ITEMS = [
  { sourceTitle: '游戏记录', title: '投注记录' },
  { sourceTitle: '资金账变', title: '账户调整记录' }
]
const RECORD_HIDDEN_TITLES = new Set(['消息列表'])
const AGENT_MENU_ITEMS = {
  index: '代理管理',
  'comm/index': '返佣方案',
  'comm/grant': '代理佣金结算',
  'comm/record': '佣金记录',
  'reversal/stats': '冲正统计报表',
  'reversal/repayment': '冲正回款报表',
  negativeProfitSettlement: '负盈利代理佣金结算',
  negativeProfitReport: '负盈利代理佣金报表',
  teamManagement: '团队代理管理',
  earningBoard: '代理收益看板',
  settlementCycle: '结算周期设置',
  relationChangeRecord: '修改代理关系记录'
}
const AGENT_MENU_ORDER = Object.keys(AGENT_MENU_ITEMS)
const AGENT_HIDDEN_PATHS = new Set(['advanceRecords'])

function cloneRoute(route = {}) {
  const nextRoute = {
    ...route,
    meta: route.meta ? { ...route.meta } : route.meta
  }
  if (Array.isArray(route.children)) {
    nextRoute.children = route.children.map(cloneRoute)
  }
  return nextRoute
}

export function alignRoutesWithTestEnvironment(routes = []) {
  const recordRoute = routes.find(route => route && route.path === '/record')
  const gameAutoDisableLogRoute = (recordRoute && recordRoute.children || []).find(
    child =>
      child.path === 'autoDisable' ||
      child.component === GAME_AUTO_DISABLE_COMPONENT ||
      (child.meta && child.meta.prototypeComponent === GAME_AUTO_DISABLE_COMPONENT)
  )

  return routes
    .filter(route => route && route.path !== '/revisionNotes' && route.path !== '/telegram/index')
    .map(route => {
      const nextRoute = cloneRoute(route)
      if (nextRoute.path === '/telegram') {
        nextRoute.children = (nextRoute.children || []).filter(child => child.path !== 'index')
        nextRoute.alwaysShow = true
        nextRoute.meta = {
          ...(nextRoute.meta || {}),
          title: 'Telegram管理',
          icon: 'message',
          mergeByTitle: true
        }
        return nextRoute
      }

      if (nextRoute.path === '/funds') {
        nextRoute.children = (nextRoute.children || []).map(child => ({
          ...child,
          meta: Object.prototype.hasOwnProperty.call(FINANCE_MENU_TITLES, child.path)
            ? { ...(child.meta || {}), title: FINANCE_MENU_TITLES[child.path] }
            : child.meta
        }))
        return nextRoute
      }

      if (nextRoute.path === '/report') {
        nextRoute.children = REPORT_MENU_ORDER
          .map(path => (nextRoute.children || []).find(child => child.path === path))
          .filter(Boolean)
          .map(child => ({
            ...child,
            meta: {
              ...(child.meta || {}),
              title: REPORT_MENU_ITEMS[child.path]
            }
          }))
        return nextRoute
      }

      if (nextRoute.path === '/resources') {
        const children = nextRoute.children || []
        const messageTemplate = children.find(
          child => child.meta && child.meta.prototypeComponent === RESOURCE_MENU_FIRST_COMPONENT
        )
        const gameList = children.find(child => child.path === RESOURCE_GAME_LIST_PATH)
        const frontEndSkin = children.find(child => child.path === RESOURCE_SKIN_PATH)
        const orderedResourceChildren = RESOURCE_MENU_ORDER
          .map(path => children.find(child => child.path === path))
          .filter(Boolean)
          .map(child => ({
            ...child,
            meta: {
              ...(child.meta || {}),
              title: RESOURCE_MENU_ITEMS[child.path]
            }
          }))
        const remainingChildren = children.filter(
          child =>
            child !== messageTemplate &&
            child !== gameList &&
            child !== frontEndSkin &&
            !RESOURCE_MENU_ORDER.includes(child.path) &&
            !RESOURCE_HIDDEN_PATHS.has(child.path)
        )

        nextRoute.children = [
          ...(messageTemplate
            ? [
              {
                ...messageTemplate,
                meta: {
                  ...(messageTemplate.meta || {}),
                  title: '站内信'
                }
              }
            ]
            : []),
          ...(gameList ? [gameList] : []),
          ...(frontEndSkin
            ? [
              {
                ...frontEndSkin,
                meta: {
                  ...(frontEndSkin.meta || {}),
                  title: '前端皮肤'
                }
              }
            ]
            : []),
          ...orderedResourceChildren,
          ...(gameAutoDisableLogRoute
            ? [
              {
                ...cloneRoute(gameAutoDisableLogRoute),
                path: 'gameAutoDisableLog',
                name: 'ResourceGameAutoDisableLog',
                meta: {
                  ...(gameAutoDisableLogRoute.meta || {}),
                  title: '游戏自动下架日志'
                }
              }
            ]
            : []),
          ...remainingChildren
        ]

        return nextRoute
      }

      if (nextRoute.path === '/record') {
        const visibleRecordChildren = (nextRoute.children || []).filter(
          child =>
            child.path !== 'autoDisable' &&
            child.component !== GAME_AUTO_DISABLE_COMPONENT &&
            (!child.meta || child.meta.prototypeComponent !== GAME_AUTO_DISABLE_COMPONENT) &&
            !RECORD_HIDDEN_TITLES.has(child.meta && child.meta.title)
        )
        const orderedRecordChildren = RECORD_MENU_ITEMS
          .map(item => {
            const child = visibleRecordChildren.find(
              route => route.meta && route.meta.title === item.sourceTitle
            )
            return child
              ? {
                ...child,
                meta: {
                  ...(child.meta || {}),
                  title: item.title
                }
              }
              : null
          })
          .filter(Boolean)
        const sourceTitles = new Set(RECORD_MENU_ITEMS.map(item => item.sourceTitle))
        const remainingRecordChildren = visibleRecordChildren.filter(
          child => !sourceTitles.has(child.meta && child.meta.title)
        )

        nextRoute.children = [
          ...orderedRecordChildren,
          ...remainingRecordChildren
        ]
        return nextRoute
      }

      if (nextRoute.path === '/agent') {
        nextRoute.children = AGENT_MENU_ORDER
          .map(path => (nextRoute.children || []).find(child => child.path === path))
          .filter(child => child && !AGENT_HIDDEN_PATHS.has(child.path))
          .map(child => ({
            ...child,
            meta: {
              ...(child.meta || {}),
              title: AGENT_MENU_ITEMS[child.path]
            }
          }))
        return nextRoute
      }

      if (nextRoute.path !== '/site') {
        return nextRoute
      }

      nextRoute.children = SITE_MENU_ORDER
        .map(path => (nextRoute.children || []).find(child => child.path === path))
        .filter(Boolean)
        .map(child => ({
          ...child,
          meta: {
            ...(child.meta || {}),
            title: SITE_MENU_ITEMS[child.path]
          }
        }))

      return nextRoute
    })
}
