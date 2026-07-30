const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const routerSource = fs.readFileSync(path.join(root, 'src/router/index.js'), 'utf8')
const menuSource = fs.readFileSync(path.join(root, 'src/utils/testEnvironmentMenu.js'), 'utf8')

const expectedTitles = [
  '用户管理',
  '角色管理',
  '菜单管理',
  '部门管理',
  '岗位管理',
  '字典管理',
  '参数设置',
  '通知公告',
  '站内信管理',
  '日志管理',
  '管理员操作日志',
  '登录日志',
  '意见反馈',
  '系统维护管理'
]

expectedTitles.forEach(title => {
  if (!routerSource.includes(`title: '${title}'`) && !menuSource.includes(`'${title}'`)) {
    throw new Error(`系统管理菜单缺少：${title}`)
  }
})

const expectedOrder = [
  "user: '用户管理'",
  "role: '角色管理'",
  "menu: '菜单管理'",
  "dept: '部门管理'",
  "post: '岗位管理'",
  "dict: '字典管理'",
  "config: '参数设置'",
  "notice: '通知公告'",
  "message: '站内信管理'",
  "log: '日志管理'",
  "feedback: '意见反馈'",
  "maintenance: '系统维护管理'"
]

let previousIndex = -1
expectedOrder.forEach(entry => {
  const currentIndex = menuSource.indexOf(entry)
  if (currentIndex === -1) {
    throw new Error(`系统管理排序配置缺少：${entry}`)
  }
  if (currentIndex <= previousIndex) {
    throw new Error(`系统管理菜单顺序错误：${entry}`)
  }
  previousIndex = currentIndex
})

if (!routerSource.includes("path: 'operlog'") || !routerSource.includes("path: 'logininfor'")) {
  throw new Error('日志管理缺少管理员操作日志或登录日志三级菜单')
}

console.log('系统管理菜单结构检查通过')
