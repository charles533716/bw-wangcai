import request from '@/utils/request'
import { PROTOTYPE_SITES } from '@/utils/prototypeBackend'

const prototypeSiteRows = PROTOTYPE_SITES.map((site, index) => ({
  id: site.id,
  code: site.code,
  nameZn: site.name,
  nameEn: site.nameEn,
  account: site.account,
  status: site.status,
  applyDate: `2026-08-0${index + 1} 10:00:00`
}))

function withPrototypeSiteRows(response, query = {}) {
  if (process.env.VUE_APP_PROTOTYPE_MOCK !== 'false') {
    const code = String(query.code || '').trim().toLowerCase()
    const name = String(query.nameZn || '').trim().toLowerCase()
    const status = String(query.status || '').trim()
    const filteredRows = prototypeSiteRows.filter(row => {
      const matchesCode = !code || row.code.toLowerCase().includes(code)
      const matchesName = !name || `${row.nameZn} ${row.nameEn}`.toLowerCase().includes(name)
      const matchesStatus = !status || row.status === status
      return matchesCode && matchesName && matchesStatus
    })
    const pageNum = Math.max(1, Number(query.pageNum) || 1)
    const pageSize = Math.max(1, Number(query.pageSize) || 10)
    const rows = filteredRows.slice((pageNum - 1) * pageSize, pageNum * pageSize).map(row => ({ ...row }))
    return {
      ...(response || {}),
      rows,
      total: filteredRows.length,
      data: {
        ...((response && response.data) || {}),
        rows,
        list: rows,
        records: rows,
        total: filteredRows.length
      }
    }
  }
  const responseRows = Array.isArray(response && response.rows) ? response.rows : []
  if (!response || responseRows.length) {
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
