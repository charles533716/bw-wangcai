import { listSite } from '@/api/site/site'
import { listType } from '@/api/risk/type'
import { listUser, getUser as getMemberUser, updateUser as updateMemberUser } from '@/api/member/user'
import { listAccount } from '@/api/funds/account'
import { listMemberBlacklist, listUserRiskRecord, getUserRiskRecordInfo } from '@/api/risk/record'
import {
  LEGACY_RISK_TYPE_OPTIONS,
  normalizeRiskTypeOptions,
  getRiskTypeLabel
} from '@/utils/riskType'
import {
  getMemberUserField,
  resolveMemberUserId,
  resolveMemberUserName,
  resolveMemberAgentId,
  resolveMemberAgentName,
  extractMemberUserProfile,
  isMemberUserBlocked,
  normalizeMemberUserStatus,
  formatMemberUserStatus,
  buildMemberDisplay,
  buildAgentDisplay
} from '@/utils/memberUser'

const MODE_OPTIONS = [
  { label: '标记预警', value: 1 },
  { label: '强制业务中断', value: 2 }
]

export default {
  name: 'RiskBlacklistPage',
  data() {
    return {
      modeOptions: MODE_OPTIONS,
      typeOptions: LEGACY_RISK_TYPE_OPTIONS.map((item) => ({ ...item })),
      siteOptions: [],
      listLoading: false,
      listData: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        name: '',
        parentAgentName: ''
      },
      userProfileMap: {},

      userDialogOpen: false,
      userDetailLoading: false,
      userDetail: {},
      userBalance: '--',
      loadingAgentNames: [],
      statusActionUserIds: [],

      riskRecordDialogOpen: false,
      riskRecordDialogLoading: false,
      riskRecordDialogTitle: '用户风控记录',
      riskRecordSourceList: [],
      riskRecordList: [],
      riskRecordTotal: 0,
      riskRecordQuery: {
        pageNum: 1,
        pageSize: 10,
        userId: '',
        siteId: ''
      },

      recordDialogOpen: false,
      recordDetail: {}
    }
  },
  computed: {
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
    },
    recordDetailEntries() {
      return this.buildRecordDetailEntries(this.recordDetail)
    }
  },
  created() {
    this.getSiteOptions()
    this.getRiskTypeOptions()
    this.getList()
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
        const rows = this.extractRows(response)
        this.siteOptions = rows.map((site) => {
          const value = site.id !== undefined && site.id !== null && site.id !== ''
            ? site.id
            : (site.siteId !== undefined && site.siteId !== null && site.siteId !== '' ? site.siteId : '')
          const code = site.code || site.siteCode || ''
          const name = site.nameZn || site.siteName || site.name || ''
          return { value, code, name, label: this.formatSiteCodeName(code, name) }
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
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = {
        pageNum: 1,
        pageSize: 20,
        siteId: '',
        name: '',
        parentAgentName: ''
      }
      this.getList()
    },
    getList() {
      this.listLoading = true
      const payload = this.sanitizePayload({
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        siteId: this.queryParams.siteId || undefined,
        name: this.queryParams.name || undefined,
        userName: this.queryParams.name || undefined,
        memberName: this.queryParams.name || undefined,
        parentAgentName: this.queryParams.parentAgentName || undefined,
        agentName: this.queryParams.parentAgentName || undefined
      })
      listMemberBlacklist(payload).then((response) => {
        const rows = this.extractRows(response)
        this.listData = rows
        this.total = this.extractTotal(response)
        rows.forEach((item) => {
          const userId = this.getBlacklistUserId(item)
          if (userId === undefined || userId === null || userId === '') return
          this.cacheUserProfile(userId, {
            id: userId,
            userId,
            name: this.getBlacklistUserName(item),
            userName: this.getBlacklistUserName(item),
            status: this.getBlacklistStatus(item),
            parentAgentId: this.getBlacklistAgentId(item),
            agentId: this.getBlacklistAgentId(item),
            agentCode: this.getBlacklistAgentId(item),
            parentAgentName: this.getBlacklistAgentName(item),
            agentName: this.getBlacklistAgentName(item)
          })
        })
      }).finally(() => {
        this.listLoading = false
      })
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
    },
    getBlacklistField(row, aliases = []) {
      return getMemberUserField(row, aliases)
    },
    getBlacklistSiteId(row) {
      const siteId = this.getBlacklistField(row, ['siteId', 'site_id'])
      return siteId === undefined || siteId === null || siteId === '' ? '--' : siteId
    },
    getBlacklistSiteName(row) {
      return this.getBlacklistField(row, ['siteName', 'siteNameZn', 'nameZn', 'site_name']) || '--'
    },
    getBlacklistAgentId(row) {
      const agentId = this.getBlacklistField(row, ['parentAgentId', 'agentId', 'agent_code', 'agentCode', 'parentAgentCode'])
      return agentId === undefined || agentId === null || agentId === '' ? '--' : agentId
    },
    getBlacklistAgentName(row) {
      return this.getBlacklistField(row, ['parentAgentName', 'agentName', 'agent_name', 'parent_agent_name']) || '--'
    },
    getBlacklistUserId(row) {
      return this.getBlacklistField(row, ['userId', 'memberUserId', 'member_user_id', 'id'])
    },
    getBlacklistUserName(row) {
      return this.getBlacklistField(row, ['userName', 'memberName', 'username', 'name']) || '--'
    },
    getBlacklistVipLevel(row) {
      return this.getBlacklistField(row, ['vipLevel', 'vip', 'vipGrade', 'vipName', 'level']) || '--'
    },
    getBlacklistStatus(row) {
      return this.normalizeUserStatus(this.getBlacklistField(row, ['status', 'userStatus', 'memberStatus']))
    },
    getBlacklistTriggerCount(row) {
      const riskRecordList = this.getBlacklistField(row, ['riskRecordList'])
      if (Array.isArray(riskRecordList)) return riskRecordList.length
      const count = this.getBlacklistField(row, ['triggerRiskRecordCount', 'riskRecordCount', 'recordCount', 'count', 'triggerCount'])
      if (count === undefined || count === null || count === '') return 0
      return Number.isNaN(Number(count)) ? count : Number(count)
    },
    hasUserId(row) {
      const userId = this.getBlacklistUserId(row)
      return !(userId === undefined || userId === null || userId === '')
    },
    getUserStatus(row) {
      const userId = this.getBlacklistUserId(row)
      if (userId !== undefined && userId !== null && userId !== '') {
        const cached = this.userProfileMap[String(userId)] || {}
        if (cached.status !== undefined && cached.status !== null) {
          return this.normalizeUserStatus(cached.status)
        }
      }
      return this.getBlacklistStatus(row)
    },
    isUserBlocked(status) {
      return isMemberUserBlocked(status)
    },
    getUserActionLabel(row) {
      const status = this.getUserStatus(row)
      if (status === 1) return '封禁'
      if (this.isUserBlocked(status)) return '解封'
      return '状态未知'
    },
    canChangeUserStatus(row) {
      if (!this.hasUserId(row)) return false
      const status = this.getUserStatus(row)
      return status === 1 || this.isUserBlocked(status)
    },
    isStatusActionLoading(row) {
      const userId = this.getBlacklistUserId(row)
      if (userId === undefined || userId === null || userId === '') return false
      return this.statusActionUserIds.includes(String(userId))
    },
    handleChangeUserStatus(row) {
      const userId = this.getBlacklistUserId(row)
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('该用户缺少会员ID，无法操作')
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
      this.$modal.confirm(`是否确认${actionText}该用户？`).then(() => {
        const key = String(userId)
        if (!this.statusActionUserIds.includes(key)) {
          this.statusActionUserIds = [...this.statusActionUserIds, key]
        }
        return this.submitUserStatus(userId, targetStatus)
      }).then(() => {
        this.$set(this.userProfileMap, String(userId), {
          ...(this.userProfileMap[String(userId)] || {}),
          status: targetStatus
        })
        this.$set(row, 'status', targetStatus)
        this.$set(row, 'userStatus', targetStatus)
        if (String(this.getUserDetailField(this.userDetail, ['id', 'userId', 'memberUserId'])) === String(userId)) {
          this.userDetail = {
            ...this.userDetail,
            status: targetStatus,
            userStatus: targetStatus,
            memberStatus: targetStatus
          }
        }
        this.$modal.msgSuccess(`${actionText}成功`)
        this.getList()
      }).catch(() => {}).finally(() => {
        const key = String(userId)
        this.statusActionUserIds = this.statusActionUserIds.filter((item) => item !== key)
      })
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
    normalizeUserStatus(value) {
      return normalizeMemberUserStatus(value)
    },
    formatUserStatus(value) {
      return formatMemberUserStatus(value)
    },
    getStatusTagType(value) {
      const status = this.normalizeUserStatus(value)
      if (status === 1) return 'success'
      if (status === 2 || status === 0) return 'danger'
      return 'info'
    },
    getUserDisplay(row) {
      const userId = this.getBlacklistUserId(row)
      const cached = userId !== undefined && userId !== null && userId !== '' ? (this.userProfileMap[String(userId)] || {}) : {}
      return buildMemberDisplay(userId, this.getBlacklistUserName(row) || cached.name || '')
    },
    getAgentIdentity(row) {
      const userId = this.getBlacklistUserId(row)
      const cached = userId !== undefined && userId !== null && userId !== '' ? (this.userProfileMap[String(userId)] || {}) : {}
      return {
        agentId: this.getBlacklistField(row, ['parentAgentId', 'agentId', 'agent_code', 'agentCode', 'parentAgentCode']) || cached.agentId || '',
        agentCode: this.getBlacklistField(row, ['agentCode', 'agent_code', 'parentAgentCode', 'parent_agent_code']) || cached.agentCode || '',
        agentName: this.getBlacklistField(row, ['parentAgentName', 'agentName', 'agent_name', 'parent_agent_name']) || cached.agentName || ''
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
    getSiteDisplay(row) {
      const siteId = this.getBlacklistField(row, ['siteId', 'site_id'])
      const siteName = this.getBlacklistField(row, ['siteName', 'siteNameZn', 'nameZn', 'site_name'])
      if (siteId !== undefined && siteId !== null && siteId !== '') {
        if (siteName) return `${siteId}/${siteName}`
        const found = this.siteOptions.find((item) => String(item.value) === String(siteId))
        if (found) return `${siteId}/${found.name || found.code || '--'}`
        return String(siteId)
      }
      if (siteName) return siteName
      return '--'
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
      if (!foundById) return String(siteId)
      return this.formatSiteCodeName(foundById.code, foundById.name)
    },
    formatSiteCodeName(code, name) {
      if (code && name) return `${code}/${name}`
      if (name) return name
      if (code) return code
      return '--'
    },
    getUserDetailField(data, aliases) {
      return getMemberUserField(data, aliases)
    },
    resolveUserNameById(userId) {
      if (userId === undefined || userId === null || userId === '') return Promise.resolve('')
      const key = String(userId)
      const cachedProfile = this.userProfileMap[key] || {}
      const cachedName = cachedProfile.name || ''
      if (cachedName && cachedName !== '--') return Promise.resolve(cachedName)
      if (this.loadingAgentNames.includes(key)) return Promise.resolve('')

      this.loadingAgentNames = [...this.loadingAgentNames, key]
      return listUser({
        pageNum: 1,
        pageSize: 1,
        id: userId
      }).then((response) => {
        const rows = this.extractRows(response)
        const user = rows.find((item) => String(resolveMemberUserId(item)) === key) || rows[0] || {}
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
      const userId = this.getBlacklistUserId(row)
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('该用户缺少会员ID，无法查看详情')
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
        const byId = rows.find((item) => String(resolveMemberUserId(item)) === String(identity.agentId || ''))
        if (byId) return byId
        const byCode = rows.find((item) => {
          const rowCode = getMemberUserField(item, ['agentCode', 'agent_code', 'inviteCode', 'invite_code'])
          return rowCode !== '' && String(rowCode) === String(identity.agentCode || '')
        })
        if (byCode) return byCode
        return rows.find((item) => String(resolveMemberUserName(item) || '') === String(identity.agentName || '')) || null
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
          const byId = rows.find((item) => String(resolveMemberUserId(item)) === String(identity.agentId))
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
        const agentId = resolveMemberUserId(agent)
        if (!agentId) {
          this.$modal.msgWarning('该代理缺少会员ID，无法查看详情')
          return
        }
        this.openMemberDetailById(agentId, agent)
      }).catch(() => {
        this.$modal.msgError('获取代理详情失败')
      })
    },
    getRiskRecordCountText(row) {
      const count = this.getBlacklistTriggerCount(row)
      if (count === undefined || count === null || count === '') return '0'
      return String(count)
    },
    handleViewRiskRecords(row) {
      const userId = this.getBlacklistUserId(row)
      if (userId === undefined || userId === null || userId === '') {
        this.$modal.msgWarning('该用户缺少会员ID，无法查看风控记录')
        return
      }
      const sourceList = this.getBlacklistField(row, ['riskRecordList'])
      this.riskRecordDialogTitle = `风控记录 - ${this.getUserDisplay(row)}`
      this.riskRecordQuery = {
        pageNum: 1,
        pageSize: 10,
        userId,
        siteId: getMemberUserField(row, ['siteId', 'site_id']) || ''
      }
      this.riskRecordSourceList = Array.isArray(sourceList) ? sourceList : []
      this.riskRecordDialogOpen = true
      this.getRiskRecordList()
    },
    applyRiskRecordSourcePage() {
      const sourceList = Array.isArray(this.riskRecordSourceList) ? this.riskRecordSourceList : []
      const pageNum = Number(this.riskRecordQuery.pageNum) || 1
      const pageSize = Number(this.riskRecordQuery.pageSize) || 10
      const start = (pageNum - 1) * pageSize
      this.riskRecordTotal = sourceList.length
      this.riskRecordList = sourceList.slice(start, start + pageSize)
    },
    getRiskRecordList() {
      if (Array.isArray(this.riskRecordSourceList) && this.riskRecordSourceList.length) {
        this.riskRecordDialogLoading = false
        this.applyRiskRecordSourcePage()
        return
      }
      if (!this.riskRecordQuery.userId) {
        this.riskRecordList = []
        this.riskRecordTotal = 0
        return
      }
      this.riskRecordDialogLoading = true
      listUserRiskRecord(this.sanitizePayload(this.riskRecordQuery)).then((response) => {
        const rows = this.extractRows(response)
        this.riskRecordList = rows
        this.riskRecordTotal = this.extractTotal(response)
      }).finally(() => {
        this.riskRecordDialogLoading = false
      })
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
        this.recordDialogOpen = true
      })
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
    getRecordField(row, field, raw = false) {
      const aliasMap = {
        id: ['id'],
        siteId: ['siteId', 'site_code', 'site_id'],
        siteCode: ['siteCode', 'code', 'site_code'],
        siteName: ['siteName', 'siteNameZn', 'nameZn', 'siteNameZh'],
        businessType: ['type', 'ruleType', 'bizType', 'businessType'],
        userId: ['userId', 'user_id'],
        userName: ['userName', 'username', 'name'],
        ruleId: ['ruleId', 'riskRuleId'],
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
      if (field === 'businessType') return this.getTypeDisplay(value)
      if (field === 'createTime' || field === 'updateTime') return this.formatTime(value)
      return value
    },
    getRecordSiteDisplay(row) {
      const code = this.getRecordField(row, 'siteCode', true)
      const name = this.getRecordField(row, 'siteName', true)
      if (code || name) return this.formatSiteCodeName(code, name)
      const siteId = this.getRecordField(row, 'siteId', true)
      if (siteId === undefined || siteId === null || siteId === '') return '--'
      const site = this.siteOptions.find((item) => String(item.value) === String(siteId))
      if (!site) return '--'
      return this.formatSiteCodeName(site.code, site.name)
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
      if (field === 'siteId') return this.getRecordSiteDisplay(row)
      if (field === 'userId') return buildMemberDisplay(this.getRecordField(row, 'userId', true), this.getRecordField(row, 'userName', true))
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
            entries.push({ key: '__siteInfo', label: '站点信息', value: this.getRecordSiteDisplay(source) })
            hasSiteInfo = true
          }
          return
        }

        if (this.isRecordDetailUserField(key)) {
          if (!hasUserInfo) {
            entries.push({
              key: '__userInfo',
              label: '用户信息',
              value: buildMemberDisplay(this.getRecordField(source, 'userId', true), this.getRecordField(source, 'userName', true))
            })
            hasUserInfo = true
          }
          return
        }

        if (this.isRecordDetailModeField(key)) {
          if (!hasModeInfo) {
            entries.push({
              key: '__modeInfo',
              label: '预警动作',
              value: this.getModeDisplay(this.getRecordField(source, 'mode', true))
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
        const siteInfo = this.getRecordSiteDisplay(source)
        if (siteInfo !== '--') {
          entries.unshift({ key: '__siteInfo', label: '站点信息', value: siteInfo })
        }
      }
      if (!hasUserInfo) {
        const userInfo = buildMemberDisplay(this.getRecordField(source, 'userId', true), this.getRecordField(source, 'userName', true))
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
