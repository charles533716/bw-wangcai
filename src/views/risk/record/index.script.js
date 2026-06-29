import { listUserRiskRecord, getUserRiskRecordInfo } from '@/api/risk/record'
import { listType } from '@/api/risk/type'
import { listSite } from '@/api/site/site'
import { listUser, getUser as getMemberUser, updateUser as updateMemberUser } from '@/api/member/user'
import { listAccount } from '@/api/funds/account'
import {
  LEGACY_RISK_TYPE_OPTIONS,
  normalizeRiskTypeOptions,
  getRiskTypeLabel
} from '@/utils/riskType'
import {
  getMemberUserField,
  resolveMemberAgentId,
  resolveMemberAgentCode,
  resolveMemberAgentName,
  extractMemberUserProfile,
  normalizeMemberUserStatus,
  formatMemberUserStatus,
  isMemberUserBlocked,
  buildMemberDisplay,
  buildAgentDisplay
} from '@/utils/memberUser'

const MODE_OPTIONS = [
  { label: '标记预警', value: 1 },
  { label: '强制业务中断', value: 2 }
]

export default {
  name: 'RiskRecordPage',
  data() {
    return {
      typeOptions: LEGACY_RISK_TYPE_OPTIONS.map((item) => ({ ...item })),
      modeOptions: MODE_OPTIONS,
      siteOptions: [],
      userNameMap: {},
      userStatusMap: {},
      userProfileMap: {},
      loadingUserIds: [],

      recordLoading: false,
      recordList: [],
      recordTotal: 0,
      recordQuery: {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        mode: '',
        createTimeRange: []
      },
      recordDialogOpen: false,
      recordDetail: {},
      userDialogOpen: false,
      userDetailLoading: false,
      userDetail: {},
      userBalance: '--',
      loadingAgentNames: []
    }
  },
  computed: {
    recordDetailEntries() {
      return this.buildRecordDetailEntries(this.recordDetail)
    },
    userDetailSummary() {
      const data = this.userDetail || {}
      const userName = this.getUserDetailField(data, ['name', 'userName', 'username'])
      const parentAgentId = resolveMemberAgentId(data)
      const parentAgentName = resolveMemberAgentName(data)
      const regTime = this.getUserDetailField(data, ['regTime', 'registerTime', 'createTime', 'gmtCreate'])
      const regIp = this.getUserDetailField(data, ['regIp', 'registerIp', 'createIp'])
      const lastLoginTime = this.getUserDetailField(data, ['lastLoginTime', 'loginTime', 'lastTime'])
      const lastLoginIp = this.getUserDetailField(data, ['lastLoginIp', 'loginIp'])
      const inviteCode = this.getUserDetailField(data, ['inviteCode', 'invite_code'])
      const fromSource = this.getUserDetailField(data, ['fromSource', 'registerSource', 'source'])
      const fromDomain = this.getUserDetailField(data, ['fromDomain', 'registerDomain', 'domain'])
      const userStatus = this.getUserDetailField(data, ['status', 'userStatus', 'memberStatus'])
      return {
        userName: userName || '--',
        status: this.formatUserStatus(userStatus),
        parentAgentId: parentAgentId || '--',
        parentAgentName: parentAgentName || '--',
        siteInfo: this.getUserSiteDisplay(data),
        balance: this.userBalance,
        regTime: this.formatTime(regTime),
        regIp: regIp || '--',
        lastLoginTime: this.formatTime(lastLoginTime),
        lastLoginIp: lastLoginIp || '--',
        inviteCode: inviteCode || '--',
        fromSource: fromSource || '--',
        fromDomain: fromDomain || '--'
      }
    }
  },
  created() {
    this.getSiteOptions()
    this.getRiskTypeOptions()
    this.getRecordList()
  },
  methods: {
    sanitizePayload(payload) {
      const result = {}
      Object.keys(payload || {}).forEach((key) => {
        const value = payload[key]
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value
        }
      })
      return result
    },
    extractRows(response) {
      if (Array.isArray(response.rows)) return response.rows
      if (response.data && Array.isArray(response.data.rows)) return response.data.rows
      if (Array.isArray(response.data)) return response.data
      return []
    },
    extractTotal(response) {
      if (typeof response.total === 'number') return response.total
      if (response.data && typeof response.data.total === 'number') return response.data.total
      return 0
    },
    extractData(response) {
      if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data
      }
      return response || {}
    },
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then((response) => {
        const rows = Array.isArray(response.rows)
          ? response.rows
          : (response.data && Array.isArray(response.data.rows) ? response.data.rows : [])
        this.siteOptions = rows.map((site) => {
          const value = site.id !== undefined && site.id !== null && site.id !== ''
            ? site.id
            : (site.siteId !== undefined && site.siteId !== null && site.siteId !== ''
                ? site.siteId
                : '')
          const code = site.code || site.siteCode || ''
          const name = site.nameZn || site.siteName || site.name || ''
          const label = this.formatSiteCodeName(code, name)
          return { value, label, code, name }
        }).filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
      }).catch(() => {
        this.siteOptions = []
      })
    },
    getRiskTypeOptions() {
      listType({ pageNum: 1, pageSize: 1000 }).then((response) => {
        this.typeOptions = normalizeRiskTypeOptions(response, LEGACY_RISK_TYPE_OPTIONS)
      }).catch(() => {
        this.typeOptions = LEGACY_RISK_TYPE_OPTIONS.map((item) => ({ ...item }))
      })
    },

    getRecordList() {
      this.recordLoading = true
      const payload = this.buildRecordQueryPayload()
      listUserRiskRecord(payload).then((response) => {
        const rows = this.extractRows(response)
        this.recordList = rows
        this.recordTotal = this.extractTotal(response)
        this.loadUserNames(rows)
      }).finally(() => {
        this.recordLoading = false
      })
    },
    handleRecordQuery() {
      this.recordQuery.pageNum = 1
      this.getRecordList()
    },
    handleRecordExport() {
      const params = this.buildRecordQueryPayload()
      this.download('/api/admin/risk/exportUserRiskRecord', params, `risk_record_${new Date().getTime()}.xlsx`)
    },
    resetRecordQuery() {
      this.resetForm('recordQueryForm')
      this.recordQuery = {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        mode: '',
        createTimeRange: []
      }
      this.getRecordList()
    },
    buildRecordQueryPayload() {
      const payload = {
        pageNum: this.recordQuery.pageNum,
        pageSize: this.recordQuery.pageSize,
        siteId: this.recordQuery.siteId,
        mode: this.recordQuery.mode
      }
      const range = Array.isArray(this.recordQuery.createTimeRange) ? this.recordQuery.createTimeRange : []
      if (range.length >= 2) {
        payload.beginTime = range[0]
        payload.endTime = range[1]
      }
      return this.sanitizePayload(payload)
    },
    handleViewRecord(row) {
      if (!row) return
      const id = this.getRecordField(row, 'id', true)
      if (!id) {
        this.$modal.msgWarning('该记录缺少ID，无法查询详情')
        return
      }
      getUserRiskRecordInfo(id).then((response) => {
        this.recordDetail = this.extractData(response)
        this.loadUserNames([this.recordDetail])
        this.recordDialogOpen = true
      })
    },
    hasUserId(row) {
      const userId = this.getRecordField(row, 'userId', true)
      return !(userId === undefined || userId === null || userId === '')
    },
    cacheUserProfile(userId, source = {}, fallback = {}) {
      if (userId === undefined || userId === null || userId === '') return
      const key = String(userId)
      const current = this.userProfileMap[key] || {}
      const data = { ...fallback, ...source, id: userId }
      const profile = extractMemberUserProfile(data)
      const nextProfile = {
        ...current,
        id: userId,
        name: profile.name || current.name || '',
        status: profile.status !== null ? profile.status : (current.status !== undefined ? current.status : null),
        agentId: profile.agentId || current.agentId || '',
        agentCode: profile.agentCode || current.agentCode || '',
        agentName: profile.agentName || current.agentName || '',
        loaded: Boolean(current.loaded || source.loaded || fallback.loaded)
      }
      this.$set(this.userProfileMap, key, nextProfile)
      if (nextProfile.name) {
        this.$set(this.userNameMap, key, nextProfile.name)
      }
      if (nextProfile.status !== null && nextProfile.status !== undefined) {
        this.$set(this.userStatusMap, key, nextProfile.status)
      }
    },
    getCachedUserProfile(row) {
      const userId = this.getRecordField(row, 'userId', true)
      if (userId === undefined || userId === null || userId === '') return {}
      const key = String(userId)
      const cached = this.userProfileMap[key] || {}
      const rowStatus = this.normalizeUserStatus(this.getRecordField(row, 'userStatus', true))
      return {
        id: userId,
        name: this.getRecordField(row, 'userName', true) || cached.name || this.userNameMap[key] || '',
        status: rowStatus !== null ? rowStatus : (cached.status !== undefined ? cached.status : this.normalizeUserStatus(this.userStatusMap[key])),
        agentId: resolveMemberAgentId(row) || cached.agentId || '',
        agentCode: resolveMemberAgentCode(row) || cached.agentCode || '',
        agentName: resolveMemberAgentName(row) || cached.agentName || '',
        loaded: Boolean(cached.loaded)
      }
    },
    getAgentIdentity(row) {
      const profile = this.getCachedUserProfile(row)
      return {
        agentId: profile.agentId || '',
        agentCode: profile.agentCode || '',
        agentName: profile.agentName || ''
      }
    },
    hasAgent(row) {
      const identity = this.getAgentIdentity(row)
      return Boolean(identity.agentId || identity.agentCode || identity.agentName)
    },
    getAgentDisplay(row) {
      const identity = this.getAgentIdentity(row)
      return buildAgentDisplay(identity.agentId || identity.agentCode, identity.agentName)
    },
    openMemberDetailById(userId, fallback = {}) {
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('缺少会员ID，无法查看详情')
        return
      }
      this.userDetailLoading = true
      this.userBalance = '--'
      Promise.all([
        getMemberUser(userId).then((response) => this.extractData(response)),
        this.getUserAccountInfo(userId)
      ]).then(([data, accountInfo]) => {
        const detail = {
          ...fallback,
          ...data,
          parentAgentId: accountInfo.agentId || getMemberUserField(fallback, ['parentAgentId', 'agentId', 'agent_code', 'agentCode']) || getMemberUserField(data, ['parentAgentId', 'agentId', 'agent_code', 'agentCode']),
          parentAgentName: accountInfo.agentName || getMemberUserField(fallback, ['parentAgentName', 'agentName']) || getMemberUserField(data, ['parentAgentName', 'agentName']),
          id: userId
        }
        this.cacheUserProfile(userId, { ...detail, loaded: true }, fallback)
        this.userDetail = detail
        this.userBalance = accountInfo.balance
        this.userDialogOpen = true
      }).catch(() => {
        this.$modal.msgError('获取用户详情失败')
      }).finally(() => {
        this.userDetailLoading = false
      })
    },
    handleViewUser(row) {
      const userId = this.getRecordField(row, 'userId', true)
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('该记录缺少用户ID，无法查看用户详情')
        return
      }
      this.openMemberDetailById(userId, row)
    },
    findAgentUserByAlias(identity = {}) {
      if (!identity.agentName) {
        return Promise.resolve(null)
      }
      const payload = this.sanitizePayload({
        pageNum: 1,
        pageSize: 50,
        name: identity.agentName || undefined
      })
      return listUser(payload).then((response) => {
        const rows = this.extractRows(response)
        if (!rows.length) return null
        const byId = rows.find((item) => String(getMemberUserField(item, ['id', 'userId'])) === String(identity.agentId || ''))
        if (byId) return byId
        const byCode = rows.find((item) => {
          const rowCode = getMemberUserField(item, ['agentCode', 'agent_code', 'inviteCode', 'invite_code'])
          return rowCode !== '' && String(rowCode) === String(identity.agentCode || '')
        })
        if (byCode) return byCode
        return rows.find((item) => {
          const rowName = getMemberUserField(item, ['name', 'userName', 'username'])
          return rowName !== '' && String(rowName) === String(identity.agentName || '')
        })
      })
    },
    findAgentUser(identity = {}) {
      if (identity.agentId !== undefined && identity.agentId !== null && identity.agentId !== '') {
        return listUser({
          pageNum: 1,
          pageSize: 1,
          id: identity.agentId
        }).then((response) => {
          const rows = this.extractRows(response)
          const byId = rows.find((item) => String(getMemberUserField(item, ['id', 'userId'])) === String(identity.agentId))
          if (byId) return byId
          return this.findAgentUserByAlias(identity)
        })
      }
      return this.findAgentUserByAlias(identity)
    },
    handleViewAgent(row) {
      const identity = this.getAgentIdentity(row)
      if (!identity.agentId && !identity.agentCode && !identity.agentName) {
        this.$modal.msgWarning('该用户没有上级代理信息')
        return
      }
      this.findAgentUser(identity).then((agent) => {
        if (!agent && identity.agentId) {
          this.openMemberDetailById(identity.agentId, {
            id: identity.agentId,
            name: identity.agentName,
            userName: identity.agentName,
            agentCode: identity.agentCode
          })
          return
        }
        if (!agent) {
          this.$modal.msgWarning('未找到该代理详情')
          return
        }
        const agentId = getMemberUserField(agent, ['id', 'userId'])
        if (!agentId) {
          this.$modal.msgWarning('该代理缺少会员ID，无法查看详情')
          return
        }
        this.openMemberDetailById(agentId, agent)
      }).catch(() => {
        this.$modal.msgError('获取代理详情失败')
      })
    },
    normalizeUserStatus(value) {
      return normalizeMemberUserStatus(value)
    },
    formatUserStatus(value) {
      return formatMemberUserStatus(value)
    },
    getUserStatus(row) {
      const userId = this.getRecordField(row, 'userId', true)
      if (userId !== undefined && userId !== null && userId !== '') {
        const mappedStatus = this.normalizeUserStatus(this.userStatusMap[String(userId)])
        if (mappedStatus !== null) return mappedStatus
      }
      const rowStatus = this.getRecordField(row, 'userStatus', true)
      return this.normalizeUserStatus(rowStatus)
    },
    isUserBlocked(status) {
      return isMemberUserBlocked(status)
    },
    getUserActionLabel(row) {
      const status = this.getUserStatus(row)
      if (status === 1) return '封禁用户'
      if (this.isUserBlocked(status)) return '解封用户'
      return '状态未知'
    },
    canChangeUserStatus(row) {
      if (!this.hasUserId(row)) return false
      const status = this.getUserStatus(row)
      return status === 1 || this.isUserBlocked(status)
    },
    handleChangeUserStatus(row) {
      const userId = this.getRecordField(row, 'userId', true)
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('该记录缺少用户ID，无法操作')
        return
      }
      const status = this.getUserStatus(row)
      if (status === 1) {
        this.changeUserStatus(row, userId, 2, '封禁')
        return
      }
      if (this.isUserBlocked(status)) {
        this.changeUserStatus(row, userId, 1, '解封')
        return
      }
      this.$modal.msgWarning('用户状态未知，无法操作')
    },
    changeUserStatus(row, userId, targetStatus, actionText) {
      this.$modal.confirm(`是否确认${actionText}该用户？`).then(() => this.submitUserStatus(userId, targetStatus)).then(() => {
        this.$set(this.userStatusMap, String(userId), targetStatus)
        this.cacheUserProfile(userId, { status: targetStatus })
        this.$set(row, 'userStatus', targetStatus)
        this.$modal.msgSuccess(`${actionText}成功`)
      }).catch(() => {})
    },
    submitUserStatus(userId, targetStatus) {
      return getMemberUser(userId).then((response) => {
        const data = this.extractData(response)
        const payload = this.sanitizePayload({
          ...data,
          id: userId,
          userId,
          status: targetStatus
        })
        return updateMemberUser(payload)
      }, () => updateMemberUser({
        id: userId,
        userId,
        status: targetStatus
      }))
    },
    getUserDetailField(data, aliases) {
      if (!data || !Array.isArray(aliases)) return ''
      let result = ''
      aliases.some((key) => {
        const value = data[key]
        if (value !== undefined && value !== null && value !== '') {
          result = value
          return true
        }
        return false
      })
      return result
    },
    getUserSiteDisplay(data) {
      const siteCode = this.getUserDetailField(data, ['siteCode', 'code', 'site_code'])
      const siteName = this.getUserDetailField(data, ['siteName', 'siteNameZn', 'nameZn'])
      if (siteCode || siteName) {
        if (siteCode && siteName) return this.formatSiteCodeName(siteCode, siteName)
        if (siteCode) {
          const foundByCode = this.siteOptions.find((item) => String(item.code) === String(siteCode))
          return foundByCode ? this.formatSiteCodeName(foundByCode.code, foundByCode.name) : siteCode
        }
        return siteName
      }
      const siteId = this.getUserDetailField(data, ['siteId', 'site_id'])
      if (siteId === undefined || siteId === null || siteId === '') return '--'
      const foundById = this.siteOptions.find((item) => String(item.value) === String(siteId))
      if (!foundById) return '--'
      return this.formatSiteCodeName(foundById.code, foundById.name)
    },
    resolveUserNameById(userId) {
      if (userId === undefined || userId === null || userId === '') return Promise.resolve('')
      const key = String(userId)
      const cachedProfile = this.userProfileMap[key] || {}
      const cachedName = cachedProfile.name || this.userNameMap[key] || ''
      if (cachedName && cachedName !== '--') return Promise.resolve(cachedName)
      if (this.loadingAgentNames.includes(key)) return Promise.resolve('')

      this.loadingAgentNames = [...this.loadingAgentNames, key]
      return listUser({
        pageNum: 1,
        pageSize: 1,
        id: userId
      }).then((response) => {
        const rows = this.extractRows(response)
        const user = rows.find((item) => String(getMemberUserField(item, ['id', 'userId'])) === key) || rows[0] || {}
        const userName = getMemberUserField(user, ['name', 'userName', 'username'])
        if (userName) {
          this.cacheUserProfile(userId, { ...user, name: userName, loaded: true })
        }
        return userName || ''
      }).catch(() => '').finally(() => {
        this.loadingAgentNames = this.loadingAgentNames.filter((item) => item !== key)
      })
    },
    getUserAccountInfo(userId) {
      return listAccount({
        pageNum: 1,
        pageSize: 1,
        memberUserId: userId
      }).then((response) => {
        const rows = this.extractRows(response)
        if (!rows.length) {
          return {
            balance: '--',
            agentId: '',
            agentName: ''
          }
        }
        const account = rows[0] || {}
        const balance = account.balance === undefined || account.balance === null || account.balance === ''
          ? '--'
          : String(account.balance)
        const agentId = getMemberUserField(account, ['agentCode', 'agent_code'])
        return this.resolveUserNameById(agentId).then((agentName) => ({
          balance,
          agentId: agentId || '',
          agentName: agentName || ''
        }))
      }).catch(() => ({
        balance: '--',
        agentId: '',
        agentName: ''
      }))
    },

    getTypeDisplay(value) {
      return getRiskTypeLabel(this.typeOptions, value)
    },
    getModeDisplay(value) {
      return this.getOptionLabel(this.modeOptions, value)
    },
    getOptionLabel(options, value) {
      const target = Number(value)
      const item = options.find((opt) => Number(opt.value) === target)
      if (item) return item.label
      if (value === undefined || value === null || value === '') return '--'
      return value
    },
    getRecordDetailLabel(field) {
      const labelMap = {
        siteId: '站点信息',
        siteCode: '站点编码',
        siteName: '站点名称',
        businessType: '业务类型',
        type: '业务类型',
        userId: '用户信息',
        userName: '用户名',
        ruleId: '规则ID',
        riskRuleId: '规则ID',
        ruleType: '业务类型',
        ruleName: '规则名称',
        orderNo: '关联订单号',
        relatedOrderNo: '关联订单号',
        ruleMode: '预警动作',
        mode: '预警动作',
        warnMode: '预警动作',
        riskReason: '风控原因',
        reason: '风控原因',
        operator: '操作人',
        operatorName: '操作人',
        updateBy: '操作人',
        createBy: '操作人',
        createTime: '创建时间',
        triggerTime: '创建时间',
        riskTime: '创建时间',
        updateTime: '更新时间',
        updateAt: '更新时间',
        updatedAt: '更新时间'
      }
      return labelMap[field] || field
    },
    formatRecordDetailValue(field, value, row = {}) {
      if (value === undefined || value === null || value === '') return '--'
      if (field === 'siteId') return this.getSiteDisplay(row)
      if (field === 'userId') return this.getUserDisplay(row)
      if (field === 'mode' || field === 'warnMode' || field === 'ruleMode') return this.getModeDisplay(value)
      if (field === 'type' || field === 'ruleType' || field === 'businessType') return this.getTypeDisplay(value)
      if (String(field).toLowerCase().includes('time')) return this.formatTime(value)
      if (typeof value === 'object') return JSON.stringify(value)
      return value
    },
    isRecordDetailSiteField(field) {
      const key = String(field).toLowerCase()
      return ['siteid', 'site_id', 'sitecode', 'site_code', 'sitename', 'sitenamezn', 'sitenamezh', 'namezn'].includes(key)
    },
    isRecordDetailUserField(field) {
      const key = String(field).toLowerCase()
      return ['userid', 'user_id', 'username', 'user_name'].includes(key)
    },
    isRecordDetailModeField(field) {
      const key = String(field).toLowerCase()
      return ['mode', 'warnmode', 'rulemode'].includes(key)
    },
    buildRecordDetailEntries(data) {
      const source = data || {}
      const keys = Object.keys(source)
      if (!keys.length) {
        return [{ key: '__empty', label: '提示', value: '暂无详情数据' }]
      }

      const entries = []
      let hasSiteInfo = false
      let hasUserInfo = false
      let hasModeInfo = false

      keys.forEach((key) => {
        if (String(key).toLowerCase() === 'id') return

        if (this.isRecordDetailSiteField(key)) {
          if (!hasSiteInfo) {
            entries.push({
              key: '__siteInfo',
              label: '站点信息',
              value: this.getSiteDisplay(source)
            })
            hasSiteInfo = true
          }
          return
        }

        if (this.isRecordDetailUserField(key)) {
          if (!hasUserInfo) {
            entries.push({
              key: '__userInfo',
              label: '用户信息',
              value: this.getUserDisplay(source)
            })
            hasUserInfo = true
          }
          return
        }

        if (this.isRecordDetailModeField(key)) {
          if (!hasModeInfo) {
            const modeValue = this.getRecordField(source, 'mode', true)
            entries.push({
              key: '__modeInfo',
              label: '预警动作',
              value: this.getModeDisplay(modeValue)
            })
            hasModeInfo = true
          }
          return
        }

        entries.push({
          key,
          label: this.getRecordDetailLabel(key),
          value: this.formatRecordDetailValue(key, source[key], source)
        })
      })

      if (!hasSiteInfo) {
        const siteInfo = this.getSiteDisplay(source)
        if (siteInfo !== '--') {
          entries.unshift({ key: '__siteInfo', label: '站点信息', value: siteInfo })
        }
      }
      if (!hasUserInfo) {
        const userInfo = this.getUserDisplay(source)
        if (userInfo !== '--') {
          entries.unshift({ key: '__userInfo', label: '用户信息', value: userInfo })
        }
      }
      if (!hasModeInfo) {
        const modeValue = this.getRecordField(source, 'mode', true)
        if (modeValue !== undefined && modeValue !== null && modeValue !== '') {
          entries.push({ key: '__modeInfo', label: '预警动作', value: this.getModeDisplay(modeValue) })
        }
      }

      if (!entries.length) {
        return [{ key: '__empty', label: '提示', value: '暂无详情数据' }]
      }
      return entries
    },
    getRecordField(row, field, raw = false) {
      const aliasMap = {
        id: ['id'],
        siteId: ['siteId', 'site_code', 'site_id'],
        siteCode: ['siteCode', 'code', 'site_code'],
        siteName: ['siteName', 'siteNameZn', 'nameZn', 'siteNameZh'],
        businessType: ['type', 'ruleType', 'bizType'],
        userId: ['userId', 'user_id'],
        userName: ['userName', 'username', 'name'],
        userStatus: ['userStatus', 'memberStatus', 'status'],
        ruleId: ['ruleId', 'riskRuleId'],
        ruleType: ['type', 'ruleType', 'typeName'],
        orderNo: ['orderNo', 'relatedOrderNo', 'bizOrderNo', 'tradeNo'],
        mode: ['mode', 'warnMode', 'ruleMode'],
        riskReason: ['riskReason', 'reason', 'ruleDesc'],
        createTime: ['createTime', 'triggerTime', 'riskTime', 'gmtCreate'],
        updateTime: ['updateTime', 'updateAt', 'updatedAt', 'gmtModified'],
        operator: ['operator', 'operatorName', 'updateBy', 'updateName', 'createBy', 'createName']
      }
      const fields = aliasMap[field] || [field]
      let value = ''
      fields.some((key) => {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          value = row[key]
          return true
        }
        return false
      })
      if (raw) return value
      if (value === '' || value === undefined || value === null) return '--'
      if (field === 'businessType' || field === 'ruleType') {
        return this.getTypeDisplay(value)
      }
      if (field === 'createTime' || field === 'updateTime') return this.formatTime(value)
      return value
    },
    getSiteDisplay(row) {
      const code = this.getRecordField(row, 'siteCode', true)
      const name = this.getRecordField(row, 'siteName', true)
      if (code || name) return this.formatSiteCodeName(code, name)

      const siteId = this.getRecordField(row, 'siteId', true)
      if (siteId === undefined || siteId === null || siteId === '') return '--'
      const site = this.siteOptions.find((item) => String(item.value) === String(siteId))
      if (!site) return '--'
      return this.formatSiteCodeName(site.code, site.name)
    },
    formatSiteCodeName(code, name) {
      if (code && name) return `${code}/${name}`
      if (name) return name
      if (code) return code
      return '--'
    },
    getOperatorDisplay(row) {
      return this.getRecordField(row, 'operator')
    },
    getUserDisplay(row) {
      const userId = this.getRecordField(row, 'userId', true)
      const userName = this.getRecordField(row, 'userName', true) || this.userNameMap[String(userId)] || ''
      return buildMemberDisplay(userId, userName)
    },
    loadUserNames(rows) {
      const list = Array.isArray(rows) ? rows : []
      const userIds = Array.from(new Set(list.map((item) => {
        const userId = this.getRecordField(item, 'userId', true)
        if (userId === undefined || userId === null || userId === '') return ''
        this.cacheUserProfile(userId, item)
        return userId
      }).filter((id) => id !== undefined && id !== null && id !== '')))
      const pendingIds = userIds.filter((id) => {
        const key = String(id)
        const profile = this.userProfileMap[key] || {}
        return !profile.loaded && !this.loadingUserIds.includes(key)
      })
      if (!pendingIds.length) return

      this.loadingUserIds = [...this.loadingUserIds, ...pendingIds.map((id) => String(id))]
      Promise.all(pendingIds.map((id) => getMemberUser(id).then((response) => {
        const data = response && response.data ? response.data : {}
        this.cacheUserProfile(id, { ...data, loaded: true })
      }).catch(() => {
        this.cacheUserProfile(id, { loaded: true })
      }))).finally(() => {
        const loadingSet = new Set(this.loadingUserIds)
        pendingIds.forEach((id) => loadingSet.delete(String(id)))
        this.loadingUserIds = Array.from(loadingSet)
      })
    },
    formatListTime(value) {
      return this.formatTime(value)
    },
    formatTime(value) {
      if (value === undefined || value === null || value === '') return '--'
      if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        const num = Number(value)
        const ms = num > 9999999999 ? num : num * 1000
        return this.parseTime(ms, '{y}-{m}-{d} {h}:{i}:{s}')
      }
      return value
    }
  }
}
