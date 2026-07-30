const STORAGE_PREFIX = 'master-admin-prototype:v5:'
const SEED_MARKER_KEY = `${STORAGE_PREFIX}resource-catalog-seed`
const SEED_VERSION = '2026-07-30-v2'

const sites = [
  { id: 1, code: 'WC', name: '旺财体育' },
  { id: 2, code: 'DW', name: 'DW体育' },
  { id: 3, code: 'CS', name: '财神体育' },
  { id: 4, code: 'XH', name: '星河体育' }
]

const dateTime = index => {
  const day = String((index % 28) + 1).padStart(2, '0')
  const hour = String((index * 3) % 24).padStart(2, '0')
  const minute = String((index * 7) % 60).padStart(2, '0')
  return `2026-07-${day} ${hour}:${minute}:00`
}

const siteFor = index => sites[index % sites.length]

const makeSmsChannels = () => [
  {
    id: 1,
    siteId: 1,
    siteName: '旺财体育',
    siteCode: 'WC',
    channelName: '阿里云短信',
    channelCode: 'ALIYUN_SMS',
    channelType: '1',
    merchantNo: 'wangcai-sms',
    apiUrl: 'https://dysmsapi.aliyuncs.com',
    secretKey: '************',
    appKey: 'LTAI-WC-001',
    templateCode: 'SMS_289600001',
    templateContent: '您的验证码为${code}，5分钟内有效。',
    verifyCodeLength: 6,
    expireSeconds: 300,
    sameIpLimitCount: 10,
    samePhoneLimitCount: 5,
    smsScopeType: '1',
    status: '1',
    createTime: '2026-07-01 09:00:00'
  },
  {
    id: 2,
    siteId: 2,
    siteName: 'DW体育',
    siteCode: 'DW',
    channelName: '腾讯云短信',
    channelCode: 'TENCENT_SMS',
    channelType: '1',
    merchantNo: '1400988001',
    apiUrl: 'https://sms.tencentcloudapi.com',
    secretKey: '************',
    appKey: 'AKID-DW-002',
    templateCode: '2289001',
    templateContent: '验证码：${code}，请勿向他人泄露。',
    verifyCodeLength: 6,
    expireSeconds: 300,
    sameIpLimitCount: 10,
    samePhoneLimitCount: 5,
    smsScopeType: '1',
    status: '1',
    createTime: '2026-07-02 10:30:00'
  }
]

const makeAreaCodes = () => [
  ['+86', 'CN', 'CHN'],
  ['+84', 'VN', 'VNM'],
  ['+66', 'TH', 'THA'],
  ['+63', 'PH', 'PHL']
].map((item, index) => {
  const site = siteFor(index)
  return {
    id: index + 1,
    siteId: site.id,
    siteName: site.name,
    siteCode: site.code,
    areaCode: item[0],
    countryCode: item[1],
    countryEnCode: item[2],
    scopeType: index === 0 ? '1' : '2',
    status: '1',
    createTime: dateTime(index),
    updateTime: dateTime(index + 1)
  }
})

const makeSmsLogs = count => Array.from({ length: count }, (_, index) => {
  const site = siteFor(index)
  const success = index % 9 !== 0
  return {
    id: index + 1,
    siteId: site.id,
    siteName: site.name,
    siteCode: site.code,
    memberName: `member${String(index + 1).padStart(4, '0')}`,
    phone: `+86 138${String(10000000 + index).slice(-8)}`,
    verifyType: String((index % 4) + 1),
    verifyCode: String(100000 + (index % 900000)),
    channelName: index % 2 ? '腾讯云短信' : '阿里云短信',
    content: `您的验证码为${100000 + (index % 900000)}，5分钟内有效。`,
    responseData: success ? '{"code":"OK","message":"发送成功"}' : '{"code":"LIMIT","message":"发送频率过高"}',
    sendTime: dateTime(index),
    responseTime: dateTime(index),
    status: success ? '1' : '0'
  }
})

const makeGameLines = () => [
  ['WC_API', '旺财游戏线路', 'wc_merchant'],
  ['DW_API', 'DW游戏线路', 'dw_merchant'],
  ['CS_API', '财神游戏线路', 'cs_merchant']
].map((item, index) => ({
  id: index + 1,
  lineCode: item[0],
  lineName: item[1],
  lineType: String((index % 2) + 1),
  walletMode: String((index % 2) + 1),
  merchantId: `${item[2]}_${index + 1}`,
  merchantAccount: item[2],
  merchantToken: '********',
  merchantSecretKey: '********',
  merchantPassword: '********',
  apiUrl: `https://api${index + 1}.example.com`,
  signKey: '********',
  salt1: `salt_${index + 1}_a`,
  salt2: `salt_${index + 1}_b`,
  salt3: `salt_${index + 1}_c`,
  extraConfigJson: '{"timeout":5000}',
  status: '1',
  sort: index + 1,
  remark: '原型演示线路',
  updateTime: dateTime(index)
}))

const factoryNames = ['PG电子', 'DB电子', 'IM体育', '熊猫体育', '旺财真人', '旺财彩票', 'DB棋牌', '博雅棋牌']
const makeGameFactories = count => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  lineId: (index % 3) + 1,
  lineName: ['旺财游戏线路', 'DW游戏线路', '财神游戏线路'][index % 3],
  factoryCode: `FACTORY_${String(index + 1).padStart(3, '0')}`,
  factoryName: `${factoryNames[index % factoryNames.length]}${index >= factoryNames.length ? index + 1 : ''}`,
  subPlatform: `SUB_${String((index % 8) + 1).padStart(2, '0')}`,
  walletCode: `WALLET_${String((index % 6) + 1).padStart(2, '0')}`,
  venueType: String((index % 6) + 1),
  logImg: `https://images.example.com/factory/${index + 1}.png`,
  status: index % 11 === 0 ? '0' : '1',
  sort: index + 1,
  remark: '游戏厂商原型数据',
  updateTime: dateTime(index)
}))

const gameNames = ['财富转盘', '黄金之城', '麻雀胡了', '超级王牌', '足球大师', '极速赛车', '捕鱼达人', '幸运棋牌']
const makeGames = count => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  lineId: (index % 3) + 1,
  lineName: ['旺财游戏线路', 'DW游戏线路', '财神游戏线路'][index % 3],
  factoryId: (index % 25) + 1,
  factoryName: factoryNames[index % factoryNames.length],
  gameCode: `GAME_${String(index + 1).padStart(4, '0')}`,
  gameName: `${gameNames[index % gameNames.length]} ${index + 1}`,
  gameType: String((index % 7) + 1),
  gameSource: index % 2 ? '2' : '1',
  currency: 'CNY',
  terminalScope: index % 3 === 0 ? 'PC,H5' : 'H5',
  cover: `https://images.example.com/games/${index + 1}/cover.png`,
  pcIcon: `https://images.example.com/games/${index + 1}/pc.png`,
  h5Icon: `https://images.example.com/games/${index + 1}/h5.png`,
  isHot: index % 5 === 0 ? 1 : 0,
  isNew: index % 7 === 0 ? 1 : 0,
  isTop: index % 10 === 0 ? 1 : 0,
  status: index % 17 === 0 ? '0' : '1',
  sort: index + 1,
  extraJson: '{"language":"zh-CN"}',
  remark: '游戏管理原型数据',
  updateTime: dateTime(index)
}))

const groupNames = ['热门推荐', '体育专区', '真人娱乐', '电子精选', '彩票专区', '棋牌竞技', '捕鱼游戏']
const makeGameGroups = count => Array.from({ length: count }, (_, index) => {
  const site = siteFor(index)
  return {
    id: index + 1,
    siteId: site.id,
    siteName: site.name,
    groupCode: `GROUP_${String(index + 1).padStart(3, '0')}`,
    groupName: `${groupNames[index % groupNames.length]}${index >= groupNames.length ? index + 1 : ''}`,
    groupType: index % 4 === 0 ? 2 : 1,
    parentId: index % 4 === 0 ? 1 : 0,
    parentGroupName: index % 4 === 0 ? '热门推荐' : '--',
    scene: String((index % 3) + 1),
    terminalScope: index % 2 ? 'H5' : 'PC,H5',
    isHotGroup: index % 5 === 0 ? 1 : 0,
    displayStyle: String((index % 3) + 1),
    icon: `https://images.example.com/groups/${index + 1}.png`,
    pcIcon: `https://images.example.com/groups/${index + 1}-pc.png`,
    h5Icon: `https://images.example.com/groups/${index + 1}-h5.png`,
    selectedIcon: `https://images.example.com/groups/${index + 1}-selected.png`,
    bindGameCount: (index * 3) % 26,
    status: index % 13 === 0 ? '0' : '1',
    sort: index + 1,
    remark: '游戏分组原型数据',
    updateTime: dateTime(index)
  }
})

const autoDisableGames = ['维加斯火箭', '黄金之城', '麻雀胡了', '超级王牌', '捕鱼达人']
const autoDisableFactories = ['DB电子', 'PG电子', '旺财电子', 'IM电子']
const autoDisableLines = ['bw', 'wc_api', 'dw_api']

const makeGameAutoDisableLogs = count => Array.from({ length: count }, (_, index) => {
  const gameName = autoDisableGames[index % autoDisableGames.length]
  const failureType = ['THIRD_PARTY', 'CONFIG', 'EXCEPTION'][index % 3]
  const disabled = index % 6 !== 5
  const failCode = failureType === 'THIRD_PARTY' ? 20096 : failureType === 'CONFIG' ? 40012 : 50001
  const failMessage = failureType === 'THIRD_PARTY'
    ? '游戏已下架'
    : failureType === 'CONFIG'
      ? '游戏配置不可用'
      : '三方接口检测异常'

  return {
    id: index + 1,
    checkTime: dateTime(index),
    gameId: 51 + index,
    gameName: `${gameName}${index >= autoDisableGames.length ? index + 1 : ''}`,
    gameCode: String(5476 + index),
    lineId: (index % 3) + 1,
    lineName: autoDisableLines[index % autoDisableLines.length],
    factoryId: (index % 25) + 1,
    factoryName: autoDisableFactories[index % autoDisableFactories.length],
    currency: 'CNY',
    deviceType: String((index % 2) + 1),
    failureType,
    failCode,
    failMessage,
    disableStatus: disabled ? 1 : 0,
    beforeStatus: '1',
    afterStatus: disabled ? '0' : '1',
    failCount: (index % 3) + 1,
    threshold: (index % 3) + 1,
    rawResponse: JSON.stringify({
      code: failCode,
      message: failMessage,
      simulate: true,
      profile: 'stg',
      gameId: 51 + index,
      gameCode: String(5476 + index),
      gameName
    }, null, 2),
    remark: disabled
      ? 'enterGameV3三方返回游戏不可用，自动下架'
      : '未达到自动下架条件，仅保留检测记录'
  }
})

export function seedResourceCatalogMocks() {
  if (
    typeof window === 'undefined' ||
    process.env.VUE_APP_PROTOTYPE_MOCK === 'false' ||
    window.localStorage.getItem(SEED_MARKER_KEY) === SEED_VERSION
  ) {
    return
  }

  const seedData = {
    '/resources/smsChannel': makeSmsChannels(),
    '/resources/areaCode': makeAreaCodes(),
    '/resources/smsLog': makeSmsLogs(200),
    '/resources/gameLine': makeGameLines(),
    '/resources/gameFactory': makeGameFactories(25),
    '/resources/gameBase': makeGames(150),
    '/resources/gameGroup': makeGameGroups(50),
    '/resources/gameAutoDisableLog': makeGameAutoDisableLogs(50)
  }

  Object.keys(seedData).forEach(key => {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(seedData[key]))
  })
  window.localStorage.setItem(SEED_MARKER_KEY, SEED_VERSION)
}

const PAGE_KEYS = new Set(['pageNum', 'pageSize', 'page', 'limit', 'orderByColumn', 'isAsc'])

const hasValue = value => value !== undefined && value !== null && value !== ''

const rowMatches = (row, query) => Object.keys(query || {}).every(key => {
  const expected = query[key]
  if (PAGE_KEYS.has(key) || !hasValue(expected) || typeof expected === 'object') {
    return true
  }

  const actual = row[key]
  if (!hasValue(actual)) {
    return false
  }

  return String(actual).toLowerCase().includes(String(expected).toLowerCase())
})

export function getResourceCatalogPage(key, query = {}) {
  if (
    typeof window === 'undefined' ||
    process.env.VUE_APP_PROTOTYPE_MOCK === 'false'
  ) {
    return null
  }

  seedResourceCatalogMocks()
  const rows = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${key}`) || '[]')
  const filteredRows = rows.filter(row => rowMatches(row, query))
  const pageNum = Math.max(Number(query.pageNum || query.page || 1), 1)
  const pageSize = Math.max(Number(query.pageSize || query.limit || 10), 1)
  const start = (pageNum - 1) * pageSize
  const pageRows = filteredRows.slice(start, start + pageSize)

  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    rows: pageRows,
    total: filteredRows.length,
    data: {
      rows: pageRows,
      records: pageRows,
      list: pageRows,
      total: filteredRows.length
    }
  })
}

export function getResourceCatalogRecord(key, id) {
  if (
    typeof window === 'undefined' ||
    process.env.VUE_APP_PROTOTYPE_MOCK === 'false'
  ) {
    return null
  }

  seedResourceCatalogMocks()
  const rows = JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}${key}`) || '[]')
  const row = rows.find(item => String(item.id) === String(id))
  return Promise.resolve({
    code: 200,
    msg: '操作成功',
    data: row || null
  })
}
