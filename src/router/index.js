import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [

    // {
    //   path: '/system/config',
    //   component: Layout,
    //   hidden: true,
    //   permissions: ['game:dict:list'],
    //   children: [
    //     {
    //       path: 'index/:dictId(\\d+)',
    //       component: () => import('@/views/system/dict/data'),
    //       name: 'Data',
    //       meta: { title: '字典数据', activeMenu: '/system/dict' }
    //     }
    //   ]
    // },

  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    hidden: true,
    redirect: 'index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/index'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
]

// 前端本地业务菜单
export const manualRoutes = [
  {
    path: '/revisionNotes',
    component: Layout,
    meta: { title: '本周需求说明', icon: 'documentation', prepend: true },
    children: [
      {
        path: 'index',
        component: () => import('@/views/revisionNotes/index'),
        name: 'RevisionNotes',
        meta: { title: '本周需求说明', icon: 'documentation' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    alwaysShow: true,
    meta: { title: '系统管理', icon: 'system', mergeByTitle: true, mergeOnly: true },
    children: [
      {
        path: 'feedback',
        component: () => import('@/views/system/feedback/index'),
        name: 'SystemFeedback',
        permissions: ['system:feedback:list'],
        meta: { title: '意见反馈', icon: 'message' }
      }
    ]
  },
  {
    path: '/funds',
    component: Layout,
    alwaysShow: true,
    meta: { title: '财务管理', icon: 'money', mergeByTitle: true },
    children: [
      {
        path: 'prepaidAccount',
        component: () => import('@/views/funds/prepaidAccount/index'),
        name: 'FundsPrepaidAccount',
        permissions: ['funds:prepaidAccount:list'],
        meta: { title: '预付金管理', icon: 'money' }
      },
      {
        path: 'nexusAddress',
        component: () => import('@/views/funds/nexusAddress/index'),
        name: 'NexusAddress',
        permissions: ['funds:nexusAddress:list'],
        meta: { title: 'BSC NEXUS 地址池', icon: 'wallet' }
      }
    ]
  },
  {
    path: '/depositWithdrawFee',
    component: Layout,
    alwaysShow: true,
    meta: { title: '充提费用管理', icon: 'money' },
    children: [
      {
        path: 'setting',
        component: () => import('@/views/depositWithdrawFee/setting/index'),
        name: 'DepositWithdrawFeeSetting',
        meta: { title: '充提手续费设置', icon: 'edit', localOverride: true }
      },
      {
        path: 'report',
        component: () => import('@/views/depositWithdrawFee/report/index'),
        name: 'DepositWithdrawFeeReport',
        meta: { title: '充提手续费报表', icon: 'chart', localOverride: true }
      },
      {
        path: 'detail',
        component: () => import('@/views/depositWithdrawFee/detail/index'),
        name: 'DepositWithdrawFeeDetail',
        meta: { title: '充提手续费明细', icon: 'list' }
      }
    ]
  },
  {
    path: '/risk',
    component: Layout,
    alwaysShow: true,
    meta: { title: '风控管理', icon: 'monitor' },
    children: [
      {
        path: 'ipWhitelist',
        component: () => import('@/views/risk/ipWhitelist/index'),
        name: 'RiskIpWhitelist',
        meta: { title: 'IP白名单管理', icon: 'lock' }
      },
      {
        path: 'userWhitelist',
        component: () => import('@/views/risk/userWhitelist/index'),
        name: 'RiskUserWhitelist',
        meta: { title: '用户白名单管理', icon: 'user' }
      },
      {
        path: 'tags',
        component: () => import('@/views/risk/tags/index'),
        name: 'RiskTags',
        meta: { title: '风控标签管理', icon: 'tag', localOverride: true }
      }
    ]
  },
  {
    path: '/venue',
    component: Layout,
    alwaysShow: true,
    meta: { title: '三方场馆管理', icon: 'nested', mergeByTitle: true },
    children: [
      {
        path: 'index',
        component: () => import('@/views/report/venue/feeConfig/index'),
        name: 'VenueFeeConfigEntry',
        meta: { title: '三方场馆设置', icon: 'list', localOverride: true }
      },
      {
        path: 'feeDetail',
        component: () => import('@/views/report/venue/feeDetail/index'),
        name: 'VenueFeeDetailEntry',
        meta: { title: '三方场馆费用明细', icon: 'money' }
      },
      {
        path: 'agentFeeDetail',
        component: () => import('@/views/report/venue/agentFeeDetail/index'),
        name: 'VenueAgentFeeDetailEntry',
        meta: { title: '三方场馆代理费用明细', icon: 'money' }
      },
      {
        path: 'siteMonthlySettlement',
        component: () => import('@/views/funds/siteMonthlySettlement/index'),
        name: 'VenueSiteMonthlySettlementEntry',
        meta: { title: '三方场馆站点月结费用', icon: 'money' }
      }
    ]
  },
  {
    path: '/agent',
    component: Layout,
    alwaysShow: true,
    meta: { title: '代理管理', icon: 'peoples', mergeByTitle: true },
    children: [
      {
        path: 'advanceRecords',
        component: () => import('@/views/agent/advanceRecords/index'),
        name: 'AgentAdvanceRecords',
        meta: { title: '代理预支记录', icon: 'money', advanceScope: 'master' }
      },
      {
        path: 'earningBoard',
        component: () => import('@/views/agent/earningBoard/index'),
        name: 'AgentEarningBoard',
        meta: { title: '代理收益看板', icon: 'chart' }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    alwaysShow: true,
    meta: { title: '运营报表', icon: 'chart', mergeByTitle: true },
    children: [
      {
        path: 'dropSignAnalysis',
        component: () => import('@/views/report/dropSignAnalysis/index'),
        name: 'DropSignAnalysis',
        meta: { title: '掉签分析', icon: 'phone' }
      }
    ]
  },
  {
    path: '/agent/detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/agent/detail/index'),
        name: 'AgentDetail',
        meta: { title: '代理详情', activeMenu: '/agent/index' }
      }
    ]
  },
  {
    path: '/member/user-detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: ':id(\\d+)',
        component: () => import('@/views/member/detail'),
        name: 'MemberDetail',
        meta: { title: '会员详情', activeMenu: '/member/user/index' }
      }
    ]
  },
  {
    path: '/member/same-ip-detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: ':id(\\d+)',
        component: () => import('@/views/member/detail'),
        name: 'MemberSameIpDetail',
        meta: { title: '会员详情', activeMenu: '/member/sameIp' }
      }
    ]
  }
]

// 站点/代理后台本地演示补充菜单
export const backendManualRoutes = {
  site: [
    {
      path: '/site-admin/agent',
      component: Layout,
      alwaysShow: true,
      meta: { title: '代理管理', icon: 'peoples', mergeByTitle: true },
      children: [
        {
          path: 'advanceRecords',
          component: () => import('@/views/agent/advanceRecords/index'),
          name: 'SiteAdminAgentAdvanceRecords',
          meta: { title: '代理预支记录', icon: 'money', advanceScope: 'site' }
        }
      ]
    }
  ],
  agent: [
    {
      path: '/agent-admin/commission',
      component: Layout,
      alwaysShow: true,
      meta: { title: '佣金管理', icon: 'money', mergeByTitle: true },
      children: [
        {
          path: 'settlement',
          component: () => import('@/views/backends/siteAdmin/agent/settlement/index'),
          name: 'AgentAdminCommissionSettlement',
          meta: { title: '预支佣金', icon: 'money' }
        },
        {
          path: '/agent-admin/agent/advanceRecords',
          component: () => import('@/views/agent/advanceRecords/index'),
          name: 'AgentAdminAdvanceRecords',
          meta: { title: '代理预支记录', icon: 'money', advanceScope: 'agent' }
        }
      ]
    }
  ]
}

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  {
    path: '/system/role-auth',
    component: Layout,
    hidden: true,
    permissions: ['system:role:edit'],
    children: [
      {
        path: 'user/:roleId(\\d+)',
        component: () => import('@/views/system/role/authUser'),
        name: 'AuthUser',
        meta: { title: '分配用户', activeMenu: '/system/role' }
      }
    ]
  },
// 游戏记录
{
  path: '/game/record',
  component: Layout,
  hidden: true,
  permissions: ['game:record:list'],
  children: [
    {
      path: '/game/record',
      component: () => import('@/views/game/record/index'),
      name: 'GameRecord',
      meta: { title: '游戏记录', icon: 'game', activeMenu: '/game/record'}
    },
    {
      path: 'data/:id(\\d+)',
      component: () => import('@/views/game/record/data'),
      name: 'GameRecordDetail',
      meta: { title: '游戏记录详情', activeMenu: '/game/record/data' }
    }
  ]
},
// 游戏下注
{
  path: 'gameBet',
  component: () => import('@/views/game/record/gameBet'),
  name: 'GameBet',
  meta: { title: '游戏下注', icon: 'bet', permissions: ['game:gameBet:list'] }
},
  {
    path: '/game/config',
    component: Layout,
    hidden: true,
    permissions: ['game:config:list'],
    children: [
      {
        path: '/game/config',
        component: () => import('@/views/game/config/index'),
        name: 'GameConfigType',
        meta: { title: '配置类型管理', icon: 'dict', activeMenu: '/game/config' }
      },
      {
        path: 'data',
        component: () => import('@/views/game/config/data'),
        name: 'GameConfigData',
        meta: { title: '配置数据管理', icon: 'dict', activeMenu: '/game/config/data' }
      }
    ]
  },
  {
    path: '/site/config',
    component: Layout,
    hidden: true,
    permissions: ['game:site:config'],
    children: [
      {
        path: 'index',
        component: () => import('@/views/site/config'),
        name: 'SiteConfig',
        meta: { title: '站点配置', activeMenu: '/site/site' }
      }
    ]
  },

  {
    path: '/system/dict-data',
    component: Layout,
    hidden: true,
    permissions: ['system:dict:list'],
    children: [
      {
        path: 'index/:dictId(\\d+)',
        component: () => import('@/views/system/dict/data'),
        name: 'Data',
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    component: Layout,
    hidden: true,
    permissions: ['monitor:job:list'],
    children: [
      {
        path: 'index/:jobId(\\d+)',
        component: () => import('@/views/monitor/job/log'),
        name: 'JobLog',
        meta: { title: '调度日志', activeMenu: '/monitor/job' }
      }
    ]
  },
  {
    path: '/tool/gen-edit',
    component: Layout,
    hidden: true,
    permissions: ['tool:gen:edit'],
    children: [
      {
        path: 'index/:tableId(\\d+)',
        component: () => import('@/views/tool/gen/editTable'),
        name: 'GenEdit',
        meta: { title: '修改生成配置', activeMenu: '/tool/gen' }
      }
    ]
  }
]

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push
let routerReplace = Router.prototype.replace
// push
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(err => err)
}
// replace
Router.prototype.replace = function push(location) {
  return routerReplace.call(this, location).catch(err => err)
}

export default new Router({
  mode: 'history', // 去掉url中的#
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
