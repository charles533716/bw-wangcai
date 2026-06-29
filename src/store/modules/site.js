import { autoDetectSite, getSiteConfig, getSiteConfigInfo } from '@/api/site/config'
import { getBackendContext, getCurrentSiteCode } from '@/utils/prototypeBackend'

const state = {
  siteConfig: {
    title: '',
    logoUrl: '',
    siteCode: '',
    copyright: '',
    domain: ''
  },
  isDetected: false // 是否已检测站点
}

const mutations = {
  SET_SITE_CONFIG: (state, config) => {
    state.siteConfig = { ...state.siteConfig, ...config }
  },
  SET_SITE_DETECTED: (state, detected) => {
    state.isDetected = detected
  }
}

const actions = {
  // 自动检测站点（通过域名）
  async autoDetectSite({ commit, dispatch }) {
    try {
      const response = await autoDetectSite()
      const config = response.data || {}

      if (config.siteCode) {
        commit('SET_SITE_CONFIG', config)
        commit('SET_SITE_DETECTED', true)
        // 存储到localStorage，避免重复检测
        localStorage.setItem('siteConfig', JSON.stringify(config))
        return config
      } else {
        throw new Error('无法自动检测到站点配置')
      }
    } catch (error) {
      console.error('自动检测站点失败:', error)
      // 设置默认配置
      const defaultConfig = await dispatch('getDefaultConfig')
      commit('SET_SITE_CONFIG', defaultConfig)
      return defaultConfig
    }
  },

  // 通过sitecode获取站点配置
  async getSiteConfigByCode({ commit }, siteCode) {
    try {
      const response = await getSiteConfig(siteCode)
      const config = response.data || {}
      commit('SET_SITE_CONFIG', config)
      commit('SET_SITE_DETECTED', true)
      // 存储到localStorage
      localStorage.setItem('siteConfig', JSON.stringify(config))
      return config
    } catch (error) {
      console.error('通过sitecode获取站点配置失败:', error)
      throw error
    }
  },

  // 获取站点配置（智能选择方式）
  async getSiteConfig({ commit, dispatch }, siteCode) {
    // 先从localStorage获取缓存的配置
    const cachedConfig = localStorage.getItem('siteConfig')
    if (cachedConfig) {
      const config = JSON.parse(cachedConfig)
      commit('SET_SITE_CONFIG', config)
      commit('SET_SITE_DETECTED', true)
      return config
    }

    // 如果有传入siteCode，直接使用
    if (siteCode) {
      return await dispatch('getSiteConfigByCode', siteCode)
    }

    // 否则自动检测
    return await dispatch('autoDetectSite')
  },

  // 获取默认配置
  async getDefaultConfig() {
    const context = getBackendContext()
    return {
      title: context.title || process.env.VUE_APP_TITLE || '站点管理系统',
      logoUrl: '',
      siteCode: getCurrentSiteCode(),
      copyright: ' ',
      domain: window.location.hostname
    }
  },

  // 清除站点配置
  clearSiteConfig({ commit }) {
    commit('SET_SITE_CONFIG', {})
    commit('SET_SITE_DETECTED', false)
    localStorage.removeItem('siteConfig')
  },

  // 更新站点配置
  updateSiteConfig({ commit }, config) {
    commit('SET_SITE_CONFIG', config)
    // 更新缓存
    localStorage.setItem('siteConfig', JSON.stringify(config))
  }
}

const getters = {
  siteConfig: state => state.siteConfig,
  siteTitle: state => state.siteConfig.title,
  siteLogo: state => state.siteConfig.logoUrl,
  siteCode: state => state.siteConfig.siteCode,
  isSiteDetected: state => state.isDetected
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
