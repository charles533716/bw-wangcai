import { parseTime } from '@/utils/ruoyi'
import { listSite } from '@/api/site/site'
import { listRiskTags } from '@/api/risk/tags'
import {
  banAdminMember,
  batchBanMember,
  batchUnbanMember,
  listAdminMember,
  getAdminMemberInfo,
  updateAdminMember,
  resetAdminMemberPassword,
  resetAdminMemberWithdrawPassword,
  recoverAdminMemberVenueBalancesById
} from '@/api/member/adminMember'

const DEFAULT_STATUS_OPTIONS = [
  { dictLabel: '正常', dictValue: '1' },
  { dictLabel: '封禁', dictValue: '0' }
]

const DEFAULT_QUERY_PARAMS = {
  pageNum: 1,
  pageSize: 20,
  siteCode: '',
  userId: '',
  name: '',
  realName: '',
  realNameStatus: '',
  parentAgentName: '',
  status: '',
  googleStatus: '',
  riskTagId: ''
}

function createDemoMemberRows() {
  const sites = [
    { code: '8888', name: 'DW体育' },
    { code: '1001', name: '旺财体育' },
    { code: '1002', name: '财神体育' },
    { code: '1003', name: '星河体育' }
  ]
  return Array.from({ length: 50 }, (_, index) => {
    const id = 1867 - index
    const site = sites[index % sites.length]
    const memberName = `dw666s${String(index % 8 + 1).padStart(2, '0')}m${String(index % 7).padStart(2, '0')}`
    const realName = index % 4 === 0 ? ['苏速度', '飞机场', '离箭头', '返水大哥'][index % 4] : ''
    return {
      id,
      userId: id,
      name: memberName,
      realName,
      realNameStatus: realName ? '1' : '0',
      parentAgentId: 1840 - Math.floor(index / 3),
      parentAgentName: `dw666s0${index % 5}${String.fromCharCode(97 + index % 4)}`,
      parentAgentLevel: 1,
      parentAgentStarLevel: 1,
      isAgent: index % 9 === 0 ? 1 : 0,
      agentLevel: index % 9 === 0 ? 1 : '',
      starLevel: index % 9 === 0 ? 1 : '',
      centerBalanceCnySum: Number((index * 86.35).toFixed(2)),
      venueBalanceCnySum: Number((index % 6 * 30.5).toFixed(2)),
      amountValidCnySum: Number((1000 + index * 278.9).toFixed(2)),
      siteCode: site.code,
      siteName: site.name,
      status: index % 12 === 0 ? 0 : 1,
      googleStatus: index % 3 === 0 ? '1' : '0',
      vipLevel: index % 8,
      inviteCode: `IDW666S${String(index + 1).padStart(4, '0')}`,
      phone: realName ? `+86138${String(10000000 + index).slice(-8)}` : '',
      qq: '',
      wechat: '',
      riskTagId: index % 10 === 0 ? 'attention' : '',
      riskTags: index % 10 === 0 ? [{ id: 'attention', name: '重点关注', type: 'warning' }] : [],
      fromIp: `103.28.${index % 20}.${20 + index}`,
      fromIpRegion: index % 2 === 0 ? '越南/胡志明市' : '中国/广东',
      regTime: `2026-06-${String(index % 28 + 1).padStart(2, '0')} 09:00:00`,
      lastLoginIp: `103.29.${index % 18}.${40 + index}`,
      lastLoginRegion: index % 2 === 0 ? '越南/河内' : '中国/上海',
      lastLoginTime: `2026-07-${String(index % 28 + 1).padStart(2, '0')} 18:30:00`
    }
  })
}

export default {
  name: 'MemberListPage',
  data() {
    const validatePhoneWithAreaCode = (rule, value, callback) => {
      const phone = String(value || '').trim()
      if (!phone) {
        callback()
        return
      }
      if (!/^\+86(1[3-9]\d{9})$/.test(phone)) {
        callback(new Error('请输入中国大陆手机号，格式：+8613812345678'))
        return
      }
      callback()
    }
    return {
      showSearch: true,
      listLoading: false,
      submitLoading: false,
      listData: [],
      total: 0,
      selectedRows: [],
      batchDisableLoading: false,
      statusActionIds: [],
      siteOptions: [],
      statusOptions: DEFAULT_STATUS_OPTIONS.map(item => ({ ...item })),
      riskTagOptions: [],
      riskTagOptionsLoading: false,
      recoverActionIds: [],
      queryParams: { ...DEFAULT_QUERY_PARAMS },
      editDialogOpen: false,
      editForm: {
        id: '',
        userId: '',
        name: '',
        phone: '',
        realName: '',
        status: '1'
      },
      editRules: {
        name: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        phone: [
          { validator: validatePhoneWithAreaCode, trigger: 'blur' }
        ],
        status: [
          { required: true, message: '状态不能为空', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchRiskTagOptions()
    this.getSiteOptions()
    this.getList()
  },
  methods: {
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then((response) => {
        const rows = this.extractRows(response)
        this.siteOptions = rows.map((site) => {
          const value = site.code || site.siteCode || site.id
          const code = site.code || site.siteCode || site.id
          const name = site.nameZn || site.siteName || site.siteNameZn || site.name
          return {
            value,
            label: this.formatSiteCodeName(code, name)
          }
        }).filter(item => item.value !== undefined && item.value !== null && item.value !== '')
      }).catch(() => {
        this.siteOptions = []
      })
    },
    getList() {
      this.listLoading = true
      Promise.resolve().then(() => {
        const keyword = value => String(value || '').trim().toLowerCase()
        const rows = createDemoMemberRows().filter(row =>
          (!this.queryParams.siteCode || String(row.siteCode) === String(this.queryParams.siteCode)) &&
          (!keyword(this.queryParams.userId) || String(row.id).includes(keyword(this.queryParams.userId))) &&
          (!keyword(this.queryParams.name) || row.name.toLowerCase().includes(keyword(this.queryParams.name))) &&
          (!keyword(this.queryParams.realName) || row.realName.toLowerCase().includes(keyword(this.queryParams.realName))) &&
          (!this.queryParams.realNameStatus || row.realNameStatus === this.queryParams.realNameStatus) &&
          (!keyword(this.queryParams.parentAgentName) || row.parentAgentName.toLowerCase().includes(keyword(this.queryParams.parentAgentName))) &&
          (!this.queryParams.status || String(row.status) === String(this.queryParams.status)) &&
          (!this.queryParams.googleStatus || row.googleStatus === this.queryParams.googleStatus) &&
          (!this.queryParams.riskTagId || row.riskTagId === this.queryParams.riskTagId)
        )
        this.total = rows.length
        const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
        this.listData = rows.slice(start, start + this.queryParams.pageSize)
        this.selectedRows = []
        this.$nextTick(() => {
          if (this.$refs.memberTable) {
            this.$refs.memberTable.clearSelection()
          }
        })
      }).finally(() => {
        this.listLoading = false
      })
    },
    buildPageParams() {
      return {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      }
    },
    buildQueryPayload() {
      return this.sanitizePayload({
        id: this.queryParams.userId,
        name: this.queryParams.name,
        realName: this.queryParams.realName,
        parentAgentName: this.queryParams.parentAgentName,
        siteCode: this.queryParams.siteCode,
        status: this.queryParams.status === '' ? undefined : Number(this.queryParams.status),
        riskTagId: this.queryParams.riskTagId,
        riskTagName: this.getSelectedRiskTagName()
      })
    },
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
      if (response.data && Array.isArray(response.data.records)) return response.data.records
      if (response.data && Array.isArray(response.data.list)) return response.data.list
      if (response.data && Array.isArray(response.data.content)) return response.data.content
      if (Array.isArray(response.data)) return response.data
      return []
    },
    extractTotal(response) {
      if (typeof response.total === 'number') return response.total
      if (response.data && typeof response.data.total === 'number') return response.data.total
      if (response.data && typeof response.data.totalCount === 'number') return response.data.totalCount
      if (response.data && typeof response.data.count === 'number') return response.data.count
      return Array.isArray(response.rows) ? response.rows.length : this.listData.length
    },
    extractData(response) {
      if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data
      }
      return response || {}
    },
    getFieldValue(source, aliases = []) {
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
    },
    normalizeRiskTagText(value) {
      if (value === undefined || value === null) return ''
      const text = String(value)
      if (!/[\u00c0-\u00ff][\u0080-\u00ff]|[ÃÂâ][\u0080-\uffff]|[äåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(text)) {
        return text
      }
      const decoded = this.decodeUtf8Mojibake(text)
      if (!decoded || decoded === text) return text
      return this.countCjk(decoded) > this.countCjk(text) ? decoded : text
    },
    decodeUtf8Mojibake(text) {
      try {
        const bytes = []
        for (let i = 0; i < text.length; i += 1) {
          const code = text.charCodeAt(i)
          if (code > 255) return text
          bytes.push(code)
        }
        return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
      } catch (e) {
        return text
      }
    },
    countCjk(text) {
      const matched = String(text || '').match(/[\u3400-\u9fff]/g)
      return matched ? matched.length : 0
    },
    normalizeRiskTagType(value) {
      const text = this.normalizeRiskTagText(value).trim().toUpperCase()
      if (['SYSTEM', 'SYS', '1', '系统标签'].includes(text)) return 'SYSTEM'
      if (['CUSTOM', '2', '自定义标签'].includes(text)) return 'CUSTOM'
      return text || 'CUSTOM'
    },
    normalizeRiskTag(item) {
      if (typeof item === 'string') {
        const name = this.normalizeRiskTagText(item).trim()
        return {
          id: name,
          tagId: name,
          tagName: name,
          tagType: 'CUSTOM'
        }
      }
      const source = item || {}
      const id = this.getFieldValue(source, ['id', 'tagId', 'riskTagId'])
      const tagName = this.normalizeRiskTagText(this.getFieldValue(source, ['tagName', 'riskTagName', 'name']))
      const tagType = this.normalizeRiskTagType(this.getFieldValue(source, ['tagType', 'riskTagType', 'type']))
      return {
        ...source,
        id: id || tagName,
        tagId: id || tagName,
        tagName,
        tagType
      }
    },
    normalizeRiskTagList(list) {
      const source = Array.isArray(list) ? list : []
      const result = []
      const seen = new Set()
      source.forEach(item => {
        const tag = this.normalizeRiskTag(item)
        const name = this.getRiskTagName(tag)
        if (!name || name === '--') return
        const key = this.getRiskTagIdentity(tag)
        if (seen.has(key)) return
        seen.add(key)
        result.push(tag)
      })
      return result
    },
    getRiskTagKey(tag) {
      return this.getRiskTagIdentity(tag)
    },
    getRiskTagIdentity(tag) {
      const id = this.getFieldValue(tag, ['id', 'tagId', 'riskTagId'])
      const name = this.getRiskTagName(tag)
      return String(id || name || '').trim()
    },
    getRiskTagName(tag) {
      return this.normalizeRiskTagText(this.getFieldValue(tag, ['tagName', 'riskTagName', 'name'])) || '--'
    },
    getRiskTagTypeLabel(tag) {
      return this.normalizeRiskTagType(this.getFieldValue(tag, ['tagType', 'riskTagType', 'type'])) === 'SYSTEM' ? '系统' : '自定义'
    },
    getRiskTagElementType(tag) {
      return this.normalizeRiskTagType(this.getFieldValue(tag, ['tagType', 'riskTagType', 'type'])) === 'SYSTEM' ? 'danger' : 'warning'
    },
    getSelectedRiskTag() {
      const targetId = String(this.queryParams.riskTagId || '').trim()
      if (!targetId) return null
      return this.riskTagOptions.find(tag => this.getRiskTagIdentity(tag) === targetId) || null
    },
    getSelectedRiskTagName() {
      const selected = this.getSelectedRiskTag()
      return selected ? this.getRiskTagName(selected) : ''
    },
    extractRiskTagsFromRow(row) {
      const source = row || {}
      const directKeys = ['memberRiskTags', 'riskTagList', 'riskTags', 'tagList']
      const matchedLists = directKeys
        .filter(key => Object.prototype.hasOwnProperty.call(source, key))
        .map(key => source[key])
        .filter(Array.isArray)
      const nonEmptyList = matchedLists.find(list => list.length > 0)
      if (nonEmptyList) return nonEmptyList
      if (matchedLists.length) return matchedLists[0]
      const textKeys = ['riskTagNames', 'riskTagsText', 'riskTagName', 'risk_tag_names']
      const matchedTextKey = textKeys.find(key => Object.prototype.hasOwnProperty.call(source, key))
      if (matchedTextKey) {
        const tagText = this.normalizeRiskTagText(source[matchedTextKey]).trim()
        return tagText ? tagText.split(/[,，、]/).map(item => item.trim()).filter(Boolean) : []
      }
      return null
    },
    getMemberRiskTags(row) {
      const rowTags = this.extractRiskTagsFromRow(row)
      return this.normalizeRiskTagList(rowTags || [])
    },
    getVisibleMemberRiskTags(row) {
      return this.getMemberRiskTags(row).slice(0, 2)
    },
    getHiddenMemberRiskTags(row) {
      return this.getMemberRiskTags(row).slice(2)
    },
    handleRiskTagSelectVisible(visible) {
      if (visible && !this.riskTagOptions.length && !this.riskTagOptionsLoading) {
        this.fetchRiskTagOptions()
      }
    },
    async fetchRiskTagOptions() {
      this.riskTagOptionsLoading = true
      try {
        const response = await listRiskTags({ pageNum: 1, pageSize: 200 })
        const rows = this.extractRows(response)
        this.riskTagOptions = this.normalizeRiskTagList(rows)
      } catch (e) {
        this.riskTagOptions = []
      } finally {
        this.riskTagOptionsLoading = false
      }
    },
    getPrimaryIdValue(source) {
      return this.getFieldValue(source, ['id', 'userId', 'memberUserId', 'member_user_id'])
    },
    getUserIdValue(source) {
      if (!source) return ''
      return this.getFieldValue(source, ['userId', 'memberUserId', 'member_user_id', 'id'])
    },
    getUserNameValue(source) {
      return this.getFieldValue(source, ['name', 'userName', 'username', 'memberName', 'member_name'])
    },
    getRealNameValue(source) {
      return this.getFieldValue(source, ['realName', 'real_name'])
    },
    getStatusValue(source) {
      const statusValue = this.getFieldValue(source, ['status', 'userStatus', 'memberStatus'])
      if (statusValue === undefined || statusValue === null || statusValue === '') return null
      const status = Number(statusValue)
      return Number.isNaN(status) ? null : status
    },
    getVipLevelValue(source) {
      const value = this.getFieldValue(source, ['vipLevel', 'vip_level', 'vipLvl', 'vip_level_name'])
      return value === '' ? '' : value
    },
    getSourceValue(source) {
      return this.getFieldValue(source, ['fromSource', 'from_source'])
    },
    getSiteId(source) {
      const value = this.getFieldValue(source, ['siteCode', 'site_code', 'siteId', 'site_id', 'site'])
      return value === '' ? '--' : value
    },
    getSiteName(source) {
      const value = this.getFieldValue(source, ['siteName', 'site_name', 'siteNameZn', 'siteNameZh', 'nameZn', 'name'])
      return value === '' ? '--' : value
    },
    getParentAgentId(source) {
      const value = this.getFieldValue(source, ['parentAgentId', 'parent_agent_id', 'agentId', 'agent_id', 'agentCode', 'agent_code'])
      return value === '' ? '--' : value
    },
    getParentAgentName(source) {
      const value = this.getFieldValue(source, ['parentAgentName', 'parent_agent_name', 'agentName', 'agent_name'])
      return value === '' ? '--' : value
    },
    getParentAgentLevel(source) {
      const value = this.getFieldValue(source, ['parentAgentLevel', 'parent_agent_level'])
      return value === '' ? '' : value
    },
    getParentAgentStarLevel(source) {
      const value = this.getFieldValue(source, ['parentAgentStarLevel', 'parent_agent_star_level'])
      return value === '' ? '' : value
    },
    getAgentFlag(source) {
      return this.getFieldValue(source, ['isAgent', 'is_agent', 'agentFlag', 'agent_flag', 'agentStatus'])
    },
    getAgentLevel(source) {
      const value = this.getFieldValue(source, ['agentLevel', 'agent_level'])
      return value === '' ? '' : value
    },
    getAgentStarLevel(source) {
      const value = this.getFieldValue(source, ['starLevel', 'star_level'])
      return value === '' ? '' : value
    },
    getInviteCode(source) {
      const value = this.getFieldValue(source, ['inviteCode', 'invite_code', 'recommendCode', 'recommend_code'])
      return value === '' ? '--' : value
    },
    getPhone(source) {
      const value = this.getFieldValue(source, ['phone', 'mobile', 'mobilePhone', 'tel'])
      return value === '' ? '--' : value
    },
    getQq(source) {
      const value = this.getFieldValue(source, ['qq', 'qqNumber', 'qq_number'])
      return value === '' ? '--' : value
    },
    getWechat(source) {
      const value = this.getFieldValue(source, ['wechat', 'weChat', 'wechatId', 'wechat_id'])
      return value === '' ? '--' : value
    },
    getCenterBalance(source) {
      return this.getFieldValue(source, ['centerBalanceCnySum', 'centerBalance', 'center_balance', 'walletBalance'])
    },
    getVenueBalance(source) {
      return this.getFieldValue(source, ['venueBalanceCnySum', 'venueBalance', 'venue_balance'])
    },
    getPrimaryId(source) {
      const value = this.getPrimaryIdValue(source)
      return value === '' ? '--' : value
    },
    getUserId(source) {
      const value = this.getUserIdValue(source)
      return value === '' ? '--' : value
    },
    getUserName(source) {
      const value = this.getUserNameValue(source)
      return value === '' ? '--' : value
    },
    getRealName(source) {
      const value = this.getRealNameValue(source)
      return value === '' ? '--' : value
    },
    getVipLevel(source) {
      const value = this.getVipLevelValue(source)
      return value === '' ? '--' : value
    },
    formatSiteCodeName(code, name) {
      if (code && name) return `${code}/${name}`
      if (code) return String(code)
      if (name) return name
      return '--'
    },
    formatStatus(value) {
      if (value === undefined || value === null || value === '') return '--'
      const matched = this.statusOptions.find(item => String(item.dictValue) === String(value))
      return matched ? matched.dictLabel : '--'
    },
    getStatusTagType(value) {
      if (value === 1) return 'success'
      if (value === 0) return 'danger'
      return 'info'
    },
    formatAgentLevel(value) {
      if (value === undefined || value === null || value === '') return '--'
      return `${value}级`
    },
    formatStarLevel(value) {
      if (value === undefined || value === null || value === '') return '--'
      return `${value}星`
    },
    formatYesNo(value) {
      if (value === undefined || value === null || value === '') return '--'
      const normalized = String(value).trim().toLowerCase()
      if (['1', 'true', 'yes', 'y'].includes(normalized)) return '是'
      if (['0', 'false', 'no', 'n'].includes(normalized)) return '否'
      const numeric = Number(value)
      if (!Number.isNaN(numeric)) return numeric === 1 ? '是' : '否'
      return value ? '是' : '否'
    },
    formatMoney(value) {
      if (value === undefined || value === null || value === '') return '--'
      const amount = Number(value)
      if (Number.isNaN(amount)) return String(value)
      return amount.toFixed(2)
    },
    getValidBetAmount(source) {
      if (!source) return ''
      const amount = this.getFieldValue(source, [
        'amountValidCnySum',
        'totalValidBetAmount',
        'validBetAmount',
        'validBetAmountCny',
        'validBetCnySum'
      ])
      return amount
    },
    getRegisterIp(source) {
      const value = this.getFieldValue(source, ['fromIp', 'regIp', 'registerIp', 'register_ip'])
      return value === '' ? '--' : value
    },
    getRegisterRegion(source) {
      const value = this.getFieldValue(source, ['fromIpRegion', 'from_ip_region', 'regRegion', 'registerRegion'])
      return value === '' ? '--' : value
    },
    getRegisterTime(source) {
      return this.getFieldValue(source, ['regTime', 'registerTime', 'reg_time'])
    },
    getLastLoginIp(source) {
      const value = this.getFieldValue(source, ['lastLoginIp', 'last_login_ip'])
      return value === '' ? '--' : value
    },
    getLastLoginRegion(source) {
      const value = this.getFieldValue(source, ['lastLoginRegion', 'last_login_region'])
      return value === '' ? '--' : value
    },
    getLastLoginTime(source) {
      return this.getFieldValue(source, ['lastLoginTime', 'last_login_time'])
    },
    formatListTime(value) {
      return value ? (parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') || '--') : '--'
    },
    handleSelectionChange(selection) {
      this.selectedRows = Array.isArray(selection) ? selection : []
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.queryParams = { ...DEFAULT_QUERY_PARAMS }
      this.getList()
    },
    getBatchBanTargets() {
      return this.selectedRows.filter((row) => this.getPrimaryIdValue(row) && this.getStatusValue(row) !== 0)
    },
    getBatchUnbanTargets() {
      return this.selectedRows.filter((row) => this.getPrimaryIdValue(row) && this.getStatusValue(row) === 0)
    },
    normalizeBatchMemberId(value) {
      if (value === undefined || value === null || value === '') return null
      const raw = String(value).trim()
      if (!raw) return null
      const numeric = Number(raw)
      if (Number.isSafeInteger(numeric)) {
        return numeric
      }
      return raw
    },
    getBatchMemberIds(targets) {
      return (Array.isArray(targets) ? targets : [])
        .map((row) => this.normalizeBatchMemberId(this.getPrimaryIdValue(row)))
        .filter(value => value !== null && value !== undefined && value !== '')
    },
    async handleBatchBan() {
      const targets = this.getBatchBanTargets()
      if (!targets.length) {
        this.$modal.msgWarning('请选择需要封禁的正常会员')
        return
      }
      await this.runBatchStatusAction(targets, '封禁', batchBanMember)
    },
    async handleBatchUnban() {
      const targets = this.getBatchUnbanTargets()
      if (!targets.length) {
        this.$modal.msgWarning('请选择需要解封的已封禁会员')
        return
      }
      await this.runBatchStatusAction(targets, '解封', batchUnbanMember)
    },
    async runBatchStatusAction(targets, actionText, requestFn) {
      const ids = this.getBatchMemberIds(targets)
      if (!ids.length) {
        this.$modal.msgWarning(`没有可${actionText}的会员ID`)
        return
      }
      this.batchDisableLoading = true
      try {
        const response = await requestFn(ids)
        const responseCode = response && typeof response.code === 'number' ? response.code : 200
        const responseMsg = response && response.msg ? String(response.msg) : ''
        const responseData = response && response.data && typeof response.data === 'object' ? response.data : {}
        const failedCount = Number.isFinite(Number(responseData.failedCount))
          ? Number(responseData.failedCount)
          : null
        const successCount = failedCount !== null
          ? Math.max(ids.length - failedCount, 0)
          : (Number.isFinite(Number(responseData.successCount))
            ? Number(responseData.successCount)
            : Number.isFinite(Number(responseData.count))
              ? Number(responseData.count)
              : ids.length)

        if (responseCode !== 200) {
          this.$modal.msgError(responseMsg || `批量${actionText}失败`)
          return
        }

        if (failedCount !== null && failedCount > 0) {
          this.$modal.msgWarning(responseMsg || `批量${actionText}已完成，成功 ${successCount} 个，失败 ${failedCount} 个`)
        } else if (responseMsg) {
          this.$modal.msgSuccess(responseMsg)
        } else {
          this.$modal.msgSuccess(`批量${actionText}成功，共 ${successCount} 个`)
        }

        this.getList()
      } catch (error) {
        this.$modal.msgError(error && error.message ? error.message : `批量${actionText}失败`)
      } finally {
        this.batchDisableLoading = false
      }
    },
    isStatusActionLoading(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      return memberId ? this.statusActionIds.includes(String(memberId)) : false
    },
    getStatusActionText(row) {
      return this.getStatusValue(row) === 0 ? '解封' : '封禁'
    },
    handleToggleStatus(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法操作')
        return
      }
      const currentStatus = this.getStatusValue(row)
      const isDisabled = currentStatus === 0
      const actionText = isDisabled ? '解封' : '封禁'
      this.$modal.confirm(`是否确认${actionText}该会员？`).then(() => {
        const key = String(memberId)
        if (!this.statusActionIds.includes(key)) {
          this.statusActionIds = [...this.statusActionIds, key]
        }
        if (isDisabled) {
          return updateAdminMember({
            id: memberId,
            status: 1
          })
        }
        return banAdminMember(memberId)
      }).then((response) => {
        const successMsg = !isDisabled && response && response.msg
          ? response.msg
          : `${actionText}成功`
        this.$modal.msgSuccess(successMsg)
        this.getList()
      }).catch(() => {}).finally(() => {
        const key = String(memberId)
        this.statusActionIds = this.statusActionIds.filter(item => item !== key)
      })
    },
    fetchUserDetail(source) {
      const memberId = this.getPrimaryIdValue(source) || this.getUserIdValue(source)
      if (!memberId) {
        return Promise.reject(new Error('missing-member-id'))
      }
      return getAdminMemberInfo(memberId).then((response) => {
        const data = this.extractData(response)
        if (data && Object.keys(data).length) {
          return data
        }
        return Promise.reject(new Error('empty-member-detail'))
      })
    },
    handleViewDetail(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法查看详情')
        return
      }
      this.$router.push({
        name: 'MemberDetail',
        params: { id: String(memberId) },
        query: {
          name: this.getUserNameValue(row) || ''
        }
      })
    },
    handleEdit(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法编辑')
        return
      }
      this.fetchUserDetail(row).then((data) => {
        const source = { ...row, ...data }
        this.editForm = {
          id: this.getPrimaryIdValue(source) || memberId,
          userId: this.getUserIdValue(source) || memberId,
          name: this.getUserNameValue(source),
          phone: this.getFieldValue(source, ['phone', 'mobile', 'mobilePhone', 'tel']),
          realName: this.getRealNameValue(source),
          status: String(this.getStatusValue(source) === null ? 1 : this.getStatusValue(source))
        }
        this.editDialogOpen = true
        this.$nextTick(() => {
          if (this.$refs.editForm) {
            this.$refs.editForm.clearValidate()
          }
        })
      }).catch(() => {
        this.$modal.msgError('获取会员信息失败，无法编辑')
      })
    },
    resetEditState() {
      this.submitLoading = false
      this.editForm = {
        id: '',
        userId: '',
        name: '',
        phone: '',
        realName: '',
        status: '1'
      }
      if (this.$refs.editForm) {
        this.$refs.editForm.clearValidate()
      }
    },
    submitEdit() {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return
        this.submitLoading = true
        updateAdminMember({
          id: this.editForm.id,
          name: this.editForm.name,
          phone: this.editForm.phone ? String(this.editForm.phone).trim() : undefined,
          realName: this.editForm.realName ? String(this.editForm.realName).trim() : undefined,
          status: Number(this.editForm.status)
        }).then((response) => {
          this.$modal.msgSuccess(response && response.msg ? response.msg : '保存成功')
          this.editDialogOpen = false
          this.getList()
        }).catch(() => {
          this.$modal.msgError('保存失败')
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    handleResetLoginPassword(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法修改登录密码')
        return
      }
      this.$prompt('请输入新的登录密码', '修改登录密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^[^\s]{6,20}$/,
        inputErrorMessage: '登录密码长度需为 6-20 位，且不能包含空格'
      }).then(({ value }) => {
        return resetAdminMemberPassword({
          id: memberId,
          password: String(value || '').trim()
        })
      }).then(() => {
        this.$modal.msgSuccess('登录密码修改成功')
      }).catch((error) => {
        if (error === 'cancel' || error === 'close') {
          return
        }
        this.$modal.msgError('登录密码修改失败')
      })
    },
    handleResetWithdrawPassword(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法重置提现密码')
        return
      }
      this.$prompt('请输入新的提现密码', '重置提现密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /^[^\s]{6,20}$/,
        inputErrorMessage: '提现密码长度需为 6-20 位，且不能包含空格'
      }).then(({ value }) => {
        return resetAdminMemberWithdrawPassword({
          id: memberId,
          withdrawPassword: String(value || '').trim()
        })
      }).then(() => {
        this.$modal.msgSuccess('提现密码重置成功')
      }).catch((error) => {
        if (error === 'cancel' || error === 'close') {
          return
        }
        this.$modal.msgError('提现密码重置失败')
      })
    },
    isRecoverActionLoading(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      return memberId ? this.recoverActionIds.includes(String(memberId)) : false
    },
    handleRecoverVenueBalance(row) {
      const memberId = this.getPrimaryIdValue(row) || this.getUserIdValue(row)
      if (!memberId) {
        this.$modal.msgWarning('缺少会员ID，无法一键回收')
        return
      }
      this.$modal.confirm('是否确认一键回收该会员的场馆余额到中心钱包？').then(() => {
        const key = String(memberId)
        if (!this.recoverActionIds.includes(key)) {
          this.recoverActionIds = [...this.recoverActionIds, key]
        }
        return recoverAdminMemberVenueBalancesById(memberId)
      }).then(() => {
        this.$modal.msgSuccess('一键回收已提交')
        this.getList()
      }).catch(() => {}).finally(() => {
        const key = String(memberId)
        this.recoverActionIds = this.recoverActionIds.filter(item => item !== key)
      })
    }
  }
}
