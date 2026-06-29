import request from '@/utils/request'

// 查询代理设置配置
export function getAgentSettingsConfig() {
  return request({
    url: '/agent/settings/config',
    method: 'get'
  })
}

// 保存代理设置配置
export function updateAgentSettingsConfig(data) {
  return request({
    url: '/agent/settings/config',
    method: 'put',
    data
  })
}

// 恢复默认配置
export function resetAgentSettingsConfig() {
  return request({
    url: '/agent/settings/config/reset',
    method: 'post'
  })
}

