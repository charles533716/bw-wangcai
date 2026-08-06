const DEMO_IMAGE = '/profile/prototype-image.svg'

const DEFINITIONS = [
  ['捕鱼', 'icon', ['AG捕鱼', '博雅捕鱼', 'PM捕鱼']],
  ['电竞', 'detail', ['旺财电竞', 'DB电竞', 'IM电竞']],
  ['棋牌', 'detail', ['旺财棋牌', 'DB棋牌', '博雅棋牌']],
  ['真人', 'detail', ['OB真人', 'eBET真人', 'AG真人']],
  ['电子', 'icon', ['博雅电子', '5000PG电子', 'PM电子', 'PP电子']],
  ['彩票', 'detail', ['旺财彩票', 'TC彩票', 'VR彩票']],
  ['体育', 'detail', ['IM体育', 'PM体育', 'FB体育']],
  ['哈希', 'icon', ['哈希分分彩', '哈希百家乐']]
]

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value))
}

function createRow(name, mode) {
  if (mode === 'detail') {
    return {
      id: `${name}-${Date.now()}-${Math.random()}`,
      venueName: name,
      nameImage: DEMO_IMAGE,
      gameImage: DEMO_IMAGE,
      description: `${name}提供丰富的游戏内容与稳定流畅的娱乐体验。`
    }
  }
  return {
    id: `${name}-${Date.now()}-${Math.random()}`,
    venueName: name,
    defaultIcon: DEMO_IMAGE,
    hoverIcon: DEMO_IMAGE
  }
}

function createInitialConfig() {
  return {
    categories: DEFINITIONS.map(([type, mode, venueOptions]) => ({
      type,
      mode,
      venueOptions,
      rows: venueOptions.map(name => createRow(name, mode))
    }))
  }
}

function validateCategory(category) {
  if (!category.rows.length) {
    return { valid: false, message: `${category.type}至少保留一个场馆` }
  }
  const names = category.rows.map(row => row.venueName).filter(Boolean)
  if (names.length !== category.rows.length) {
    return { valid: false, message: `请完整选择${category.type}场馆` }
  }
  if (new Set(names).size !== names.length) {
    return { valid: false, message: `${category.type}场馆不能重复` }
  }
  for (const row of category.rows) {
    if (category.mode === 'detail') {
      if (!row.nameImage) return { valid: false, message: `请上传${category.type} - ${row.venueName}的场馆名称图片` }
      if (!row.gameImage) return { valid: false, message: `请上传${category.type} - ${row.venueName}的游戏图片` }
      if (!row.description) return { valid: false, message: `请填写${category.type} - ${row.venueName}的场馆文案` }
      if (row.description.length > 150) return { valid: false, message: `${category.type} - ${row.venueName}的场馆文案不能超过 150 字` }
    } else {
      if (!row.defaultIcon) return { valid: false, message: `请上传${category.type} - ${row.venueName}的鼠标悬停前图标` }
      if (!row.hoverIcon) return { valid: false, message: `请上传${category.type} - ${row.venueName}的鼠标悬停后图标` }
    }
  }
  return { valid: true, message: '' }
}

module.exports = {
  cloneConfig,
  createInitialConfig,
  createRow,
  validateCategory
}
