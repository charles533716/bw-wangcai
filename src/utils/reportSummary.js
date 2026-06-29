export function omitPagination(query) {
  const next = { ...(query || {}) }
  delete next.pageNum
  delete next.pageSize
  return next
}

export async function fetchAllRowsByPage(fetchPage, query, options = {}) {
  const pageKey = options.pageKey || 'pageNum'
  const sizeKey = options.sizeKey || 'pageSize'
  const pageSize = Number(options.pageSize || 500)
  const maxPages = Number(options.maxPages || 2000)

  const baseQuery = omitPagination(query)
  const allRows = []
  let pageNum = 1
  let total = 0

  while (pageNum <= maxPages) {
    const pageQuery = {
      ...baseQuery,
      [pageKey]: pageNum,
      [sizeKey]: pageSize
    }
    const resp = await fetchPage(pageQuery)
    const pageRows = Array.isArray(resp && resp.rows) ? resp.rows : []
    allRows.push(...pageRows)

    const respTotal = Number(resp && resp.total)
    if (Number.isFinite(respTotal) && respTotal > 0) {
      total = respTotal
      if (allRows.length >= total) {
        break
      }
    } else if (pageRows.length < pageSize) {
      break
    }

    pageNum += 1
  }

  if (!total) {
    total = allRows.length
  }
  return { rows: allRows, total }
}

export function sumNumericFields(rows, fields) {
  const sums = {}
  const counts = {}
  fields.forEach((field) => {
    sums[field] = 0
    counts[field] = 0
  })
  ;(rows || []).forEach((row) => {
    fields.forEach((field) => {
      const value = Number(row ? row[field] : NaN)
      if (Number.isFinite(value)) {
        sums[field] += value
        counts[field] += 1
      }
    })
  })
  return { sums, counts }
}
