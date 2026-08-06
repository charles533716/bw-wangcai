import auth from '@/plugins/auth'
import router, { backendManualRoutes, constantRoutes, dynamicRoutes, manualRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import { deriveHomeContext, normalizeRoleKeys } from '@/utils/homeContext'
import { getCurrentBackendMode } from '@/utils/prototypeBackend'
import { filterRoutesForPreview } from '@/utils/prototypePermission'
import { alignRoutesWithTestEnvironment } from '@/utils/testEnvironmentMenu'

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: [],
    homePath: '/index',
    homeTitle: '首页'
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_DEFAULT_ROUTES: (state, routes) => {
      state.defaultRoutes = constantRoutes.concat(routes)
    },
    SET_TOPBAR_ROUTES: (state, routes) => {
      state.topbarRouters = routes
    },
    SET_SIDEBAR_ROUTERS: (state, routes) => {
      state.sidebarRouters = routes
    },
    SET_HOME_CONTEXT: (state, context = {}) => {
      state.homePath = context.homePath || '/index'
      state.homeTitle = context.homeTitle || '首页'
    }
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit, rootState }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const backendMode = getCurrentBackendMode()
          const roles = normalizeRoleKeys(rootState.user?.roles || [])
          const sdata = JSON.parse(JSON.stringify(res.data))
          const rdata = JSON.parse(JSON.stringify(res.data))
          const sidebarRoutes = alignRoutesWithTestEnvironment(filterAsyncRouter(sdata))
          const rewriteRoutes = alignRoutesWithTestEnvironment(filterAsyncRouter(rdata, false, true))
          const sourceLocalRoutes = backendMode === 'master' ? manualRoutes : (backendManualRoutes[backendMode] || [])
          const localRoutes = filterManualRoutes(cloneRouteTree(sourceLocalRoutes))
          const sidebarAccessRoutes = filterRoutesForPreview(
            alignRoutesWithTestEnvironment(mergeRouteTrees(sidebarRoutes, cloneRouteTree(localRoutes)))
          )
          const accessRoutes = filterRoutesForPreview(
            alignRoutesWithTestEnvironment(mergeRouteTrees(rewriteRoutes, localRoutes))
          )
          const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
          accessRoutes.push({ path: '*', redirect: '/404', hidden: true })
          router.addRoutes(asyncRoutes)
          commit('SET_ROUTES', accessRoutes)
          const homeContext = deriveHomeContext({
            roles,
            sidebarRoutes: sidebarAccessRoutes,
            // admin-ui 不区分站点管理员/代理，统一使用后台第一个可访问菜单作为首页
            staticHomeRoleKeys: []
          })
          commit('SET_HOME_CONTEXT', homeContext)
          if (!homeContext.keepConstantSidebar) {
            commit('SET_SIDEBAR_ROUTERS', sidebarAccessRoutes)
          } else {
            commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(sidebarAccessRoutes))
          }
          commit('SET_DEFAULT_ROUTES', sidebarAccessRoutes)
          commit('SET_TOPBAR_ROUTES', sidebarAccessRoutes)
          resolve(accessRoutes)
        })
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter(route => {
    normalizeRouteTitle(route)
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      const sourceComponent = route.component
      if (!['Layout', 'ParentView', 'InnerLink'].includes(sourceComponent)) {
        route.meta = { ...(route.meta || {}), prototypeComponent: sourceComponent }
      }
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function normalizeRouteTitle(route = {}) {
  if (!route.meta) {
    return
  }
  const component = String(route.component || '')
  const routePath = String(route.path || '')
  if (routePath === '/game') {
    route.meta.title = '场馆游戏报表'
    route.meta.icon = 'chart'
    route.children = [
      {
        path: 'venueReport',
        name: 'VenueSummaryReport',
        component: 'report/venueSummary/index',
        meta: { title: '场馆报表', icon: 'chart' }
      },
      {
        path: 'venueGameReport',
        name: 'VenueGameReport',
        component: 'report/venueGame/index',
        meta: { title: '场馆游戏报表', icon: 'chart' }
      },
      {
        path: 'venueMemberProfit',
        name: 'VenueGameMemberProfitReport',
        component: 'report/venueMemberProfit/index',
        meta: { title: '场馆游戏会员盈亏报表', icon: 'chart' }
      }
    ]
  }
  if (routePath === '/member') {
    route.meta.title = '会员管理'
    route.meta.icon = 'peoples'
    route.children = [
      {
        path: 'list',
        name: 'MemberListPage',
        component: 'member/list/index',
        meta: { title: '会员列表', icon: 'user' }
      },
      {
        path: 'sameIp',
        name: 'MemberSameIpList',
        component: 'member/sameIp/index',
        meta: { title: '同IP会员列表', icon: 'peoples' }
      },
      {
        path: 'vip',
        name: 'MemberVipSettings',
        component: 'member/vip/index',
        meta: { title: 'VIP会员设置', icon: 'star' }
      },
      {
        path: 'promotion',
        name: 'MemberPromotionSettings',
        component: 'member/promotion/index',
        meta: { title: '会员推广邀请奖励设置', icon: 'tree' }
      },
      {
        path: 'realNameReview',
        name: 'MemberRealNameReview',
        component: 'member/realNameReview/index',
        meta: { title: '会员实名审核列表', icon: 'user' }
      },
      {
        path: 'withdrawTurnover',
        name: 'MemberWithdrawTurnover',
        component: 'member/withdrawTurnover/index',
        meta: { title: '会员提现流水查询', icon: 'search' }
      }
    ]
  }
  if (routePath === '/activity' && Array.isArray(route.children)) {
    const rewardDetailIndex = route.children.findIndex(child => child.component === 'activity/rewardDetail/index')
    const hasManualPayout = route.children.some(child => String(child.path || '').includes('manualPayout'))
    if (rewardDetailIndex >= 0 && !hasManualPayout) {
      const rewardDetailRoute = route.children[rewardDetailIndex]
      route.children.splice(rewardDetailIndex + 1, 0, {
        path: 'manualPayout',
        name: 'ActivityManualPayout',
        component: 'activity/rewardDetail/index',
        meta: {
          ...(rewardDetailRoute.meta || {}),
          title: '手动派彩',
          icon: 'money'
        }
      })
    }
    route.children.forEach(child => {
      if (child.meta && child.component === 'activity/manage/index') {
        child.meta.title = '活动列表'
      }
      if (
        child.meta &&
        child.component === 'activity/rewardDetail/index' &&
        !String(child.path || '').includes('manualPayout')
      ) {
        child.meta.title = '活动奖励明细'
      }
    })
  }
  if (
    route.meta.title === '会员帐变记录' ||
    component.includes('report/memberchangerecord') ||
    routePath.includes('memberchangerecord')
  ) {
    route.meta.title = '账变记录'
  }
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

function cloneRouteTree(routes = []) {
  return routes.map(route => {
    const nextRoute = { ...route }
    if (route.meta) {
      nextRoute.meta = { ...route.meta }
    }
    if (route.children && route.children.length) {
      nextRoute.children = cloneRouteTree(route.children)
    }
    return nextRoute
  })
}

function hasRouteAccess(route = {}) {
  const permissions = normalizeAccessValues(route.permissions || (route.meta && route.meta.permissions))
  const roles = normalizeAccessValues(route.roles || (route.meta && route.meta.roles))
  if (permissions && permissions.length) {
    return auth.hasRole('admin') || auth.hasPermiOr(permissions)
  }
  if (roles && roles.length) {
    return auth.hasRoleOr(roles)
  }
  return true
}

function normalizeAccessValues(value) {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

function filterManualRoutes(routes = []) {
  return routes.filter(route => {
    if (!hasRouteAccess(route)) {
      return false
    }
    const hadChildren = route.children && route.children.length
    if (hadChildren) {
      route.children = filterManualRoutes(route.children)
      return route.children.length > 0
    }
    return true
  })
}

function normalizeRoutePath(path = '') {
  return String(path).replace(/^\/+|\/+$/g, '')
}

function mergeRouteTrees(baseRoutes = [], extraRoutes = []) {
  const routes = cloneRouteTree(baseRoutes)
  extraRoutes.forEach(extraRoute => {
    const matchedRoute = routes.find(route => isSameRouteTree(route, extraRoute))
    if (!matchedRoute) {
      if (extraRoute.meta && extraRoute.meta.mergeOnly) {
        return
      }
      const nextRoute = cloneRouteTree([extraRoute])[0]
      if (extraRoute.meta && extraRoute.meta.prepend) {
        routes.unshift(nextRoute)
      } else {
        routes.push(nextRoute)
      }
      return
    }
    if (extraRoute.meta && extraRoute.meta.localOverride) {
      applyLocalRouteOverride(matchedRoute, extraRoute)
    }
    if (extraRoute.children && extraRoute.children.length) {
      matchedRoute.children = mergeRouteTrees(matchedRoute.children || [], extraRoute.children)
    }
  })
  return routes
}

function applyLocalRouteOverride(route = {}, extraRoute = {}) {
  if (extraRoute.name) {
    route.name = extraRoute.name
  }
  if (extraRoute.component) {
    route.component = extraRoute.component
  }
  route.meta = {
    ...(route.meta || {}),
    ...(extraRoute.meta || {})
  }
  delete route.meta.localOverride
}

function isSameRouteTree(route = {}, extraRoute = {}) {
  if (normalizeRoutePath(route.path) === normalizeRoutePath(extraRoute.path)) {
    return true
  }
  if (!extraRoute.meta || !extraRoute.meta.mergeByTitle) {
    return false
  }
  return route.meta && route.meta.title && route.meta.title === extraRoute.meta.title
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view) => {
  const normalizedView = String(view || '').replace(/\.vue$/, '')
  if (process.env.NODE_ENV === 'development') {
    return (resolve) => require([`@/views/${normalizedView}.vue`], resolve)
  } else {
    // 使用 import 实现生产环境的路由懒加载
    return () => import(`@/views/${normalizedView}.vue`)
  }
}

export default permission
