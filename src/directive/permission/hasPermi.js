 /**
 * v-hasPermi 操作权限处理
 * Copyright (c) 2019 ruoyi
 */

import store from '@/store'

function matchesWildcardPermission(granted, required) {
  if (!granted || !required || granted.indexOf('*') === -1) {
    return false
  }
  const grantedParts = String(granted).trim().split(':')
  const requiredParts = String(required).trim().split(':')
  if (grantedParts.length !== requiredParts.length) {
    return false
  }
  return grantedParts.every((part, index) => part === '*' || part === requiredParts[index])
}

export default {
  inserted(el, binding, vnode) {
    const { value } = binding
    const all_permission = "*:*:*"
    const permissions = store.getters && store.getters.permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.some((required) => {
          return required === permission || matchesWildcardPermission(permission, required)
        })
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
}
