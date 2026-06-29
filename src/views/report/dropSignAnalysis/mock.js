export const siteOptions = [
  { siteCode: '2222', siteName: '演示总站' },
  { siteCode: 'SITE001', siteName: '旺财总站' },
  { siteCode: 'SITE002', siteName: '星河体育' },
  { siteCode: 'SITE003', siteName: '蓝海娱乐' }
]

export const signStatusOptions = [
  { label: '掉签流失', value: 'lost', type: 'danger' },
  { label: '已恢复', value: 'recovered', type: 'success' },
  { label: '掉签未流失', value: 'watching', type: 'warning' },
  { label: '未掉签', value: 'normal', type: 'info' }
]

export const followStatusOptions = [
  { label: '待跟进', value: 'pending', type: 'warning' },
  { label: '已联系', value: 'contacted', type: 'primary' },
  { label: '无法接通', value: 'unreachable', type: 'danger' },
  { label: '已召回', value: 'recalled', type: 'success' },
  { label: '无需跟进', value: 'ignored', type: 'info' }
]

export const loginStatusOptions = [
  { label: '在线', value: 'online', type: 'success' },
  { label: '离线', value: 'offline', type: 'info' }
]

export const userStatusOptions = [
  { label: '正常', value: 'normal', type: 'success' },
  { label: '冻结', value: 'frozen', type: 'warning' },
  { label: '禁用', value: 'disabled', type: 'danger' }
]

export const clientTypeOptions = [
  { label: 'iOS', value: 'iOS' }
]

export const versionOptions = ['6.8.0', '6.7.2', '6.7.0', '5.9.8', '5.8.6']

export function buildSeedRows() {
  return [
    buildRow(1, '2222', '演示总站', '华东总代', 'member001', '林可欣', '13800001001', 'member001@example.com', 'offline', 'normal', 'iOS', '6.7.2', '2026-06-24 09:20:00', '2026-06-23 22:14:00', 'pending', '', '', ''),
    buildRow(2, 'SITE001', '旺财总站', '王者代理', 'member002', '陈明远', '13800001002', 'member002@example.com', 'offline', 'normal', 'iOS', '6.7.0', '2026-06-23 16:45:00', '2026-06-22 18:30:00', 'pending', '', '', ''),
    buildRow(3, 'SITE002', '星河体育', '星河总代', 'member003', '周雅', '13800001003', 'member003@example.com', 'online', 'normal', 'iOS', '6.8.0', '2026-06-24 10:05:00', '2026-06-24 10:36:00', 'recalled', '演示运营', '2026-06-24 11:10:00', '用户已重新登录，暂不外呼。'),
    buildRow(4, 'SITE003', '蓝海娱乐', '蓝海代理A', 'member004', '赵子豪', '13800001004', 'member004@example.com', 'offline', 'frozen', 'iOS', '5.9.8', '2026-06-22 20:12:00', '', 'unreachable', '演示运营', '2026-06-23 15:42:00', '电话未接通，建议次日再拨。'),
    buildRow(5, '2222', '演示总站', '直营会员', 'member005', '许晴', '13800001005', 'member005@example.com', 'offline', 'normal', 'iOS', '6.7.2', '2026-06-24 08:00:00', '2026-06-24 08:00:00', 'pending', '', '', ''),
    buildRow(6, 'SITE001', '旺财总站', '王者代理', 'member006', '王景', '13800001006', 'member006@example.com', 'online', 'normal', 'iOS', '6.8.0', '', '2026-06-24 17:20:00', 'ignored', '演示运营', '2026-06-24 17:35:00', '未掉签，仅作为正常用户对照。'),
    buildRow(7, 'SITE002', '星河体育', '星河总代', 'member007', '黄一鸣', '13800001007', 'member007@example.com', 'offline', 'disabled', 'iOS', '5.8.6', '2026-06-21 13:26:00', '2026-06-20 21:08:00', 'contacted', '演示运营', '2026-06-22 10:18:00', '用户表示稍后重新下载登录。'),
    buildRow(8, 'SITE003', '蓝海娱乐', '蓝海代理B', 'member008', '刘若琳', '13800001008', 'member008@example.com', 'offline', 'normal', 'iOS', '6.7.0', '2026-06-24 14:50:00', '2026-06-23 19:12:00', 'pending', '', '', ''),
    buildRow(9, 'SITE001', '旺财总站', '旺财总代', 'member009', '郑飞', '13800001009', 'member009@example.com', 'online', 'normal', 'iOS', '6.8.0', '2026-06-23 12:20:00', '2026-06-24 07:45:00', 'recalled', '演示运营', '2026-06-24 08:12:00', '已恢复登录，可观察后续存款。'),
    buildRow(10, '2222', '演示总站', '华东总代', 'member010', '孙雨', '13800001010', 'member010@example.com', 'offline', 'normal', 'iOS', '6.7.2', '2026-06-20 11:30:00', '2026-06-19 23:05:00', 'pending', '', '', '')
  ]
}

function buildRow(id, siteCode, siteName, parentAgentName, userName, realName, phone, email, loginStatus, userStatus, clientType, appVersion, dropSignTime, lastLoginTime, followStatus, followOwner, followTime, followRemark) {
  return {
    id,
    siteCode,
    siteName,
    parentAgentName,
    userName,
    realName,
    phone,
    email,
    loginStatus,
    userStatus,
    clientType,
    appVersion,
    dropSignTime,
    lastLoginTime,
    followStatus,
    followOwner,
    followTime,
    followRemark
  }
}
