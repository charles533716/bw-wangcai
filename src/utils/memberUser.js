export function getMemberUserField(source, aliases = []) {
  if (!source || !Array.isArray(aliases)) return ''
  let value = ''
  aliases.some((key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      value = source[key]
      return true
    }
    return false
  })
  return value
}

export function resolveMemberUserId(source) {
  return getMemberUserField(source, ['id', 'userId', 'memberUserId', 'member_user_id'])
}

export function resolveMemberUserName(source) {
  return getMemberUserField(source, ['name', 'userName', 'username'])
}

export function resolveMemberAgentId(source) {
  return getMemberUserField(source, [
    'agentId',
    'agent_id',
    'parentAgentId',
    'parent_agent_id',
    'agentCode',
    'agent_code',
    'parentAgentCode',
    'parent_agent_code'
  ])
}

export function resolveMemberAgentCode(source) {
  return getMemberUserField(source, ['agentCode', 'agent_code', 'parentAgentCode', 'parent_agent_code'])
}

export function resolveMemberAgentName(source) {
  return getMemberUserField(source, ['parentAgentName', 'parent_agent_name', 'agentName', 'agent_name'])
}

export function normalizeMemberUserStatus(value) {
  if (value === undefined || value === null || value === '') return null
  const status = Number(value)
  return Number.isNaN(status) ? null : status
}

export function isMemberUserBlocked(value) {
  const status = normalizeMemberUserStatus(value)
  return status === 0 || status === 2
}

export function formatMemberUserStatus(value) {
  const status = normalizeMemberUserStatus(value)
  if (status === 1) return '正常'
  if (status === 2) return '黑名单'
  if (status === 0) return '封禁'
  return '--'
}

export function buildMemberDisplay(id, name) {
  if (id !== undefined && id !== null && id !== '' && name) return `${id}/${name}`
  if (id !== undefined && id !== null && id !== '') return String(id)
  if (name) return name
  return '--'
}

export function buildAgentDisplay(code, name) {
  if (code && name) return `${code}/${name}`
  if (code) return String(code)
  if (name) return name
  return '--'
}

export function extractMemberUserProfile(source) {
  return {
    id: resolveMemberUserId(source),
    name: resolveMemberUserName(source),
    status: normalizeMemberUserStatus(getMemberUserField(source, ['status', 'userStatus', 'memberStatus'])),
    agentId: resolveMemberAgentId(source),
    agentCode: resolveMemberAgentCode(source),
    agentName: resolveMemberAgentName(source)
  }
}
