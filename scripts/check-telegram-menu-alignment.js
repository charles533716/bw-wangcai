const fs = require('fs')
const path = require('path')

const routerSource = fs.readFileSync(path.resolve(__dirname, '../src/router/index.js'), 'utf8')
const alignmentSource = fs.readFileSync(
  path.resolve(__dirname, '../src/utils/testEnvironmentMenu.js'),
  'utf8'
)

if (!routerSource.includes("path: '/telegram'")) {
  throw new Error('缺少 Telegram 管理一级菜单')
}
if (!routerSource.includes("meta: { title: 'telegram配置'")) {
  throw new Error('缺少 telegram配置二级菜单')
}
if (!alignmentSource.includes("route.path !== '/telegram/index'")) {
  throw new Error('旧 Telegram 直达菜单未隐藏')
}
if (!alignmentSource.includes("child.path !== 'index'")) {
  throw new Error('旧 Telegram 二级菜单未隐藏')
}

console.log('Telegram 菜单对齐检查通过')
