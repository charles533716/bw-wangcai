import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import { getCurrentBackendMode, setBackendContext } from '@/utils/prototypeBackend'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

function inferBackendModeByPath(path) {
  if (path.startsWith('/site-admin')) {
    return 'site'
  }
  if (path.startsWith('/agent-admin')) {
    return 'agent'
  }
  if (path !== '/' && !isWhiteList(path) && !['/401', '/404'].includes(path)) {
    return 'master'
  }
  return ''
}

function syncBackendModeByPath(path) {
  const targetMode = inferBackendModeByPath(path)
  if (!targetMode || targetMode === getCurrentBackendMode()) {
    return
  }
  setBackendContext(targetMode)
  store.commit('SET_BACKEND_MODE', targetMode)
  store.commit('SET_ROLES', [])
  store.commit('SET_PERMISSIONS', [])
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    syncBackendModeByPath(to.path)
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(() => {
          isRelogin.show = false
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            const homePath = store.getters.homePath || '/index'
            // 清理旧会话遗留标签，避免默认首页标签残留
            store.dispatch('tagsView/delAllViews').finally(() => {
              if (homePath !== '/index') {
                store.dispatch('tagsView/delVisitedView', { path: '/index' })
              }
              if ((to.path === '/' || to.path === '/index') && homePath !== '/index') {
                next({ path: homePath, replace: true })
              } else {
                next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
              }
            })
          })
        }).catch(err => {
            store.dispatch('LogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        const homePath = store.getters.homePath || '/index'
        if ((to.path === '/' || to.path === '/index') && homePath !== '/index') {
          next({ path: homePath, replace: true })
        } else {
          next()
        }
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
