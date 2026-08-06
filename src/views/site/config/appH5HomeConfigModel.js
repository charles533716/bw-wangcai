const DEMO_IMAGE = '/profile/prototype-image.svg'

const GROUP_DEFINITIONS = [
  ['哈希', ['哈希分分彩', '哈希百家乐']],
  ['体育', ['旺财体育', '熊猫体育', 'IM体育']],
  ['真人', ['OB真人', 'eBET真人', 'AG真人', '大游真人', 'BBIN真人', 'WM真人']],
  ['棋牌', ['旺财棋牌', 'DB棋牌', '博雅棋牌', '高登棋牌']],
  ['电竞', ['旺财电竞', 'DB电竞', 'IM电竞']],
  ['彩票', ['旺财彩票', 'TC彩票', 'VR彩票']],
  ['电子', ['PG电子', 'DB电子', 'PM电子', 'PP电子', 'SPRIBE电子', 'MG电子']],
  ['捕鱼', ['AG捕鱼', '博雅捕鱼', 'PM捕鱼']]
]

function cloneGroups(groups) {
  return JSON.parse(JSON.stringify(groups))
}

function createInitialGroups() {
  return GROUP_DEFINITIONS.map(([type, venueNames], groupIndex) => ({
    type,
    sort: groupIndex + 1,
    venues: venueNames.map((name, venueIndex) => ({
      name,
      sort: venueIndex + 1,
      image: DEMO_IMAGE
    }))
  }))
}

function isIntegerInRange(value, min, max) {
  const number = Number(value)
  return Number.isInteger(number) && number >= min && number <= max
}

function validateGroups(groups) {
  if (!Array.isArray(groups) || groups.length !== 8) {
    return { valid: false, message: '场馆类型必须为 8 类' }
  }

  for (const group of groups) {
    if (!isIntegerInRange(group.sort, 1, groups.length)) {
      return { valid: false, message: `${group.type}的类型排序必须为 1-${groups.length} 的整数` }
    }
  }

  const typeSorts = groups.map(group => Number(group.sort))
  if (new Set(typeSorts).size !== typeSorts.length) {
    return { valid: false, message: '场馆类型排序不能重复' }
  }

  for (const group of groups) {
    const venueCount = group.venues.length
    for (const venue of group.venues) {
      if (!isIntegerInRange(venue.sort, 1, venueCount)) {
        return {
          valid: false,
          message: `${group.type} - ${venue.name}的场馆排序必须为 1-${venueCount} 的整数`
        }
      }
    }

    const venueSorts = group.venues.map(venue => Number(venue.sort))
    if (new Set(venueSorts).size !== venueSorts.length) {
      return { valid: false, message: `${group.type}的场馆排序不能重复` }
    }

    const missingImageVenue = group.venues.find(venue => !venue.image)
    if (missingImageVenue) {
      return { valid: false, message: `请上传${group.type} - ${missingImageVenue.name}的场馆图片` }
    }
  }

  return { valid: true, message: '' }
}

module.exports = {
  cloneGroups,
  createInitialGroups,
  validateGroups
}
