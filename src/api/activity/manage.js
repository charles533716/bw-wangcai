import request from '@/utils/request'

const FIRST_DEPOSIT_DEMO_ID = '9001'
const FIRST_DEPOSIT_DEMO_NAME = '体育首存送68%最高2000元'
const FIRST_DEPOSIT_ACTIVITY_TYPE = '26'
const PROTOTYPE_MOCK_ENABLED = process.env.VUE_APP_PROTOTYPE_MOCK !== 'false'
const ACTIVITY_DEMO_NAMES = [
  FIRST_DEPOSIT_DEMO_NAME,
  '新会员注册礼',
  '世界杯签到有礼',
  '周末红包雨',
  '累计充值送豪礼',
  '有效投注额达标礼',
  '体育首存送68%最高1000元',
  '新人专享体验金',
  '连续签到7天奖励',
  'VIP周末回馈',
  '月度累充返利',
  '体育有效投注加奖',
  '真人首存送88%',
  '新会员首充礼包',
  '世界杯每日签到',
  '夏日通用优惠',
  '累充满额赠礼',
  '电子有效投注奖励',
  '棋牌首存礼遇',
  '新人注册彩金'
]
const ACTIVITY_DEMO_TYPES = ['26', '25', '27', '30', '21', '24']
const ACTIVITY_DEMO_TAGS = ['最新', '新人', '限时', '日常', '体育', 'VIP']
const ACTIVITY_DEMO_OPERATORS = ['admin', 'xiuxiu', 'xiaoyang', 'yolo', 'charles', 'clark', 'mike', 'bill']
const ACTIVITY_DEMO_SITES = [
  { code: 'SITE001', name: '旺财体育' },
  { code: 'SITE002', name: '财神体育' },
  { code: 'SITE003', name: 'DW体育' },
  { code: 'SITE004', name: '星河体育' }
]

if (ACTIVITY_DEMO_NAMES.length !== 20) {
  throw new Error('Activity prototype data must contain exactly 20 rows')
}

const PROTOTYPE_ACTIVITY_ROWS = ACTIVITY_DEMO_NAMES.map((activityName, index) => {
  const sequence = index + 1
  const site = ACTIVITY_DEMO_SITES[index % ACTIVITY_DEMO_SITES.length]
  const day = String(Math.min(sequence, 20)).padStart(2, '0')
  const primaryTypeIndex = index % ACTIVITY_DEMO_TYPES.length
  const activityTypes = [ACTIVITY_DEMO_TYPES[primaryTypeIndex]]
  if (index % 5 === 0) {
    activityTypes.push(ACTIVITY_DEMO_TYPES[(primaryTypeIndex + 1) % ACTIVITY_DEMO_TYPES.length])
    activityTypes.push(ACTIVITY_DEMO_TYPES[(primaryTypeIndex + 2) % ACTIVITY_DEMO_TYPES.length])
  }
  return {
    id: 9000 + sequence,
    activityCode: 'ACT202607' + String(sequence).padStart(3, '0'),
    activityName,
    activityType: ACTIVITY_DEMO_TYPES[primaryTypeIndex],
    activityTypes,
    activityTag: ACTIVITY_DEMO_TAGS[index % ACTIVITY_DEMO_TAGS.length],
    siteCode: site.code,
    siteName: site.name,
    createTime: `2026-07-${day} ${String(8 + index % 10).padStart(2, '0')}:00:00`,
    displayBeginTime: `2026-07-${day} 00:00:00`,
    displayEndTime: index % 4 === 0 ? `2026-08-${day} 23:59:59` : '',
    activityBeginTime: `2026-07-${day} 00:00:00`,
    activityEndTime: index % 4 === 0 ? `2026-08-${day} 23:59:59` : '',
    activitySort: sequence,
    hotSort: index % 4 === 0 ? sequence : null,
    updateTime: `2026-07-${day} ${String(9 + index % 9).padStart(2, '0')}:30:00`,
    operatorName: ACTIVITY_DEMO_OPERATORS[index % ACTIVITY_DEMO_OPERATORS.length],
    status: index % 3 === 1 ? '0' : '1'
  }
})

function splitQueryValues(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean)
}

function isWithinRange(value, start, end) {
  if (!value) {
    return false
  }
  return (!start || value >= start) && (!end || value <= end)
}

function buildPrototypeListResponse(query = {}) {
  const activityTypes = splitQueryValues(query.activityType)
  const activityTags = splitQueryValues(query.activityTag)
  const siteCodes = splitQueryValues(query.siteCode)
  const activityName = String(query.activityName || '').trim().toLowerCase()
  const filtered = PROTOTYPE_ACTIVITY_ROWS.filter(row => {
    if (activityName && !row.activityName.toLowerCase().includes(activityName)) {
      return false
    }
    if (activityTypes.length && !activityTypes.some(type => row.activityTypes.includes(type))) {
      return false
    }
    if (activityTags.length && !activityTags.includes(row.activityTag)) {
      return false
    }
    if (siteCodes.length && !siteCodes.includes(row.siteCode)) {
      return false
    }
    if ((query.displayStartTime || query.displayEndTime) && !isWithinRange(row.displayBeginTime, query.displayStartTime, query.displayEndTime)) {
      return false
    }
    if ((query.activityStartTime || query.activityEndTime) && !isWithinRange(row.activityBeginTime, query.activityStartTime, query.activityEndTime)) {
      return false
    }
    return true
  })
  const pageNum = Number(query.pageNum || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (pageNum - 1) * pageSize
  return {
    code: 200,
    msg: '操作成功',
    rows: filtered.slice(start, start + pageSize).map(row => ({ ...row })),
    total: filtered.length
  }
}

function normalizeFirstDepositDemo(row) {
  if (!row || (String(row.id) !== FIRST_DEPOSIT_DEMO_ID && row.activityName !== '首充活动')) {
    return row
  }
  return {
    ...row,
    activityName: FIRST_DEPOSIT_DEMO_NAME,
    activityType: FIRST_DEPOSIT_ACTIVITY_TYPE
  }
}

export function listActivities(query) {
  return request({
    url: '/activity/manage/list',
    method: 'get',
    params: query
  }).then(res => {
    if (PROTOTYPE_MOCK_ENABLED) {
      return buildPrototypeListResponse(query)
    }
    if (Array.isArray(res && res.rows)) {
      res.rows = res.rows.map(normalizeFirstDepositDemo)
    }
    return res
  })
}

export function getActivityMeta() {
  return request({
    url: '/activity/manage/meta',
    method: 'get'
  })
}

export function listActivityAgents(siteCode) {
  return request({
    url: '/activity/manage/agent-tree',
    method: 'get',
    params: { siteCode }
  })
}

export function getActivity(id, params) {
  return request({
    url: '/activity/manage/' + id,
    method: 'get',
    params
  }).then(res => {
    if (PROTOTYPE_MOCK_ENABLED) {
      const prototypeRow = PROTOTYPE_ACTIVITY_ROWS.find(row => String(row.id) === String(id))
      if (prototypeRow) {
        res.data = { ...(res && res.data || {}), ...prototypeRow }
      }
    }
    if (res && res.data) {
      res.data = normalizeFirstDepositDemo(res.data)
    }
    return res
  })
}

export function addActivity(data) {
  return request({
    url: '/activity/manage',
    method: 'post',
    data
  })
}

export function updateActivity(data) {
  return request({
    url: '/activity/manage',
    method: 'put',
    data
  })
}

export function updateActivityStatus(id, status) {
  return request({
    url: '/activity/manage/' + id + '/status/' + status,
    method: 'put'
  })
}
