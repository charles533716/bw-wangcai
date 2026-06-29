import request from '@/utils/request'

const prototypeSiteRows = [
  {
    id: 1000,
    code: '2222',
    nameZn: '演示总站',
    nameEn: 'Prototype Hub',
    account: 'demo_admin',
    status: '1',
    applyDate: '2026-06-17 09:12:00'
  },
  {
    id: 1001,
    code: 'SITE001',
    nameZn: '旺财总站',
    nameEn: 'Wangcai',
    account: 'site001_admin',
    status: '1',
    applyDate: '2026-06-18 10:12:00'
  },
  {
    id: 1002,
    code: 'SITE002',
    nameZn: '星河体育',
    nameEn: 'Galaxy Sport',
    account: 'site002_admin',
    status: '2',
    applyDate: '2026-06-19 11:24:00'
  }
]

function hasActiveSiteFilter(query = {}) {
  return ['code', 'nameZn', 'status'].some(key => {
    const value = query[key]
    return value !== undefined && value !== null && value !== ''
  })
}

function withPrototypeSiteRows(response, query) {
  const responseRows = Array.isArray(response && response.rows) ? response.rows : []
  if (!response || responseRows.length || hasActiveSiteFilter(query)) {
    return response
  }
  const rows = prototypeSiteRows.map(row => ({ ...row }))
  return {
    ...response,
    rows,
    total: rows.length,
    data: {
      ...(response.data || {}),
      rows,
      list: rows,
      records: rows,
      total: rows.length
    }
  }
}

// 查询站点列表
export function listSite(query) {
  return request({
    url: '/site/list',
    method: 'get',
    params: query
  }).then(response => withPrototypeSiteRows(response, query))
}

// 查询站点下拉选项
export function listSiteOptions(query) {
  return request({
    url: '/site/options',
    method: 'get',
    params: query
  })
}

// 查询站点详细
export function getSite(id) {
  return request({
    url: '/site/' + id,
    method: 'get'
  })
}

// 新增站点
export function addSite(data) {
  return request({
    url: '/site',
    method: 'post',
    data: data
  })
}

// 修改站点
export function updateSite(data) {
  return request({
    url: '/site',
    method: 'put',
    data: data
  })
}

// 删除站点
export function delSite(id) {
  return request({
    url: '/site/' + id,
    method: 'delete'
  })
}

// 导出站点
export function exportSite(query) {
  return request({
    url: '/site/export',
    method: 'post',
    params: query
  })
}

// 站点申请开站
export function applySite(data) {
  return request({
    url: '/site/apply',
    method: 'post',
    data: data
  })
}

// 查询待审批站点列表
export function getApplyList() {
  return request({
    url: '/site/apply/list',
    method: 'get'
  })
}

// 审批站点
export function approveSite(data) {
  return request({
    url: '/site/approve',
    method: 'put',
    data: data
  })
}


// 检查站点编码是否唯一
export function checkSiteCodeUnique(data) {
  return request({
    url: '/site/checkCodeUnique',
    method: 'post',
    data: data
  })
}

// 检查站点账号是否唯一
export function checkSiteAccountUnique(data) {
  return request({
    url: '/site/checkAccountUnique',
    method: 'post',
    data: data
  })
}
