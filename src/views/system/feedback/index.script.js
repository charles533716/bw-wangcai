import {
  listFeedback,
  getFeedback,
  getFeedbackStats,
  replyFeedback,
  reopenFeedback,
  listFeedbackTemplates,
  addFeedbackTemplate,
  updateFeedbackTemplate,
  deleteFeedbackTemplate
} from '@/api/system/feedback'
import { listSite } from '@/api/site/site'

const USE_MOCK_DATA = process.env.VUE_APP_FEEDBACK_MOCK === 'true'

const QUESTION_TYPES = [
  { value: 'DEPOSIT', label: '存款问题', theme: 'deposit', icon: 'el-icon-coin' },
  { value: 'WITHDRAW', label: '取款问题', theme: 'withdraw', icon: 'el-icon-bank-card' },
  { value: 'GAME', label: '游戏问题', theme: 'game', icon: 'el-icon-trophy' },
  { value: 'PROMOTION', label: '优惠问题', theme: 'promotion', icon: 'el-icon-present' },
  { value: 'LOGIN', label: '网站/APP登录', theme: 'login', icon: 'el-icon-mobile-phone' },
  { value: 'TURNOVER', label: '流水问题', theme: 'turnover', icon: 'el-icon-data-line' },
  { value: 'PROFILE', label: '修改资料', theme: 'profile', icon: 'el-icon-user' },
  { value: 'SUGGESTION', label: '会员建议', theme: 'suggestion', icon: 'el-icon-chat-line-round' }
]

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '待处理' },
  { value: 'REPLIED', label: '已回复' }
]

const DEFAULT_REPLY_TEMPLATES = [
  '亲爱的会员您好：非常感谢您提出的宝贵反馈！我们将认真研究您的意见，并在后续的系统更新中予以考虑。祝您游戏愉快！',
  '您好！由于三方通道短暂延迟，我们已手动为您处理并入账。请登录钱包刷新查收金额。非常抱歉给您带来不便！',
  '会员您好！经我们技术团队排查，该问题已得到妥善解决。诚挚邀请您再次尝试，若有任何不便请您海涵！'
]

const MOCK_SITES = [
  { siteCode: '333333', siteName: '财神客钱' },
  { siteCode: '111111', siteName: '极速支付' },
  { siteCode: '2222', siteName: '极速通' },
  { siteCode: '555555', siteName: '万盛国际' },
  { siteCode: '777777', siteName: '金沙娱乐' }
]

const MOCK_DESCRIPTIONS = {
  DEPOSIT: [
    '在线扫码支付了200元，已经扣款成功了但是账户余额一直没加账户，怎么回事啊？',
    '使用网银转账大额5000，已经汇款10分钟了，系统显示还在审核中。麻烦后台核对一下。',
    '请问现在存款优惠还有吗？充1000送50的活动我申请了，怎么还没到账？'
  ],
  WITHDRAW: [
    '今天提现10000元，一直处于“银行处理中”，请问一般多久能到账银行卡？',
    '提现提示“超出当日提款次数限制”，我今天才提了一次啊，请查一下是不是系统判断错了。',
    '绑定提现银行卡时报错，显示格式不对。我填的是招商银行，需要填分行名称吗？'
  ],
  GAME: [
    '捕鱼达人玩到一半突然断线，网络是好的。进去后刚才捕获的黄金鲨鱼没有给我结算，损失大了！',
    '在电子游艺中触发了免费游戏，但是转完十次之后一直卡在结算界面，强退网页重进还是卡着。',
    '玩真人百家时，荷官发完牌显示我赢了，但是下注金额没有翻倍返还。请帮忙对一下账。'
  ],
  PROMOTION: [
    '签到活动打卡满7天了，应该可以开一次神秘宝箱，可是怎么点击开箱提示不满足条件？',
    '每周一的首充礼金怎么没有自动发放到钱包？我昨天充值了800元，流水已经打足了。',
    'VIP晋级礼金发错了，我从VIP3升级到VIP4应该拿188元，怎么只给我加了88元？'
  ],
  LOGIN: [
    '网页版用电脑Chrome打开非常慢，DNS解析出问题了吗？还是有新的备用域名线路？',
    '安卓版APP每次更新包下载到99%就卡住无法安装。能不能给我发一个直连apk下载地址？',
    '输入账号密码后点登录，提示验证码不正确。我已经刷新滑动了五六次了，一直显示不正确。'
  ],
  TURNOVER: [
    '系统后台提示我的总流水还差150就能提现，但我今天明明投注了3000多的额度，流水计算延迟吗？',
    '充值不拿任何优惠，流水要求是一倍吗？为什么我打了一倍多流水，系统还是说提款由于流水不足拒绝？',
    '反水红利的流水倍数是多少？是一倍还是直接提现？我看我的红利直接冻结了。'
  ],
  PROFILE: [
    '之前绑定的提现手机号停机了，收不到短信验证码。想更换成新的手机，请客服协助。',
    '真实姓名绑定的时候写错了一个字，导致银行卡名字和实名不匹配，能不能帮修改一下实名？',
    '我想修改登录密码和提款安全密码，但是老密码我忘记了。我的邮箱还能收到验证码，能重置吗？'
  ],
  SUGGESTION: [
    '希望能够增加主流加密货币（如USDT-TRC20）的一键付款与提现，这样真的会方便很多！',
    '建议夜间模式可以做得更暗一点，现在的黑色背景对比度有点太高，时间长了眼睛有点酸。',
    '在游戏大厅里，如果可以支持按游戏热度或者最新上架来排序就更好了！'
  ]
}

function generateMockFeedbacks() {
  const users = ['test1123', 'testtc009', 'apple_super', 'luckyJacky', 'player_max', 'jack_luck', 'wong888', 'gold_miner']
  const screenshots = [
    '/prototype-api/profile/prototype-image.svg',
    '/prototype-api/profile/prototype-image.svg',
    '/prototype-api/profile/prototype-image.svg'
  ]
  const records = []

  for (let i = 0; i < 200; i++) {
    const type = QUESTION_TYPES[i % QUESTION_TYPES.length].value
    const site = MOCK_SITES[i % MOCK_SITES.length]
    const status = i % 3 === 0 ? 'PENDING' : 'REPLIED'
    const day = Math.min(20, Math.max(1, 20 - Math.floor(i / 10)))
    const hour = String((8 + i * 3) % 24).padStart(2, '0')
    const minute = String((10 + i * 7) % 60).padStart(2, '0')
    const isOrderType = ['DEPOSIT', 'WITHDRAW', 'GAME'].includes(type)
    const orderPrefix = type === 'DEPOSIT' ? 'DH' : type === 'WITHDRAW' ? 'WD' : 'GM'
    const item = {
      id: String(1200 - i),
      username: users[i % users.length] + (i > 4 ? String(100 + i) : ''),
      vipLevel: 'vip' + ((i % 7) + 1),
      questionType: type,
      description: MOCK_DESCRIPTIONS[type][i % MOCK_DESCRIPTIONS[type].length],
      associatedOrderNo: isOrderType ? orderPrefix + '202605' + String(18000 + i) : '',
      screenshots: i % 5 === 0 ? [screenshots[i % screenshots.length]] : (i % 7 === 0 ? [screenshots[0], screenshots[1]] : []),
      status,
      createTime: '2026-05-' + String(day).padStart(2, '0') + ' ' + hour + ':' + minute,
      siteCode: site.siteCode,
      siteName: site.siteName
    }

    if (status === 'REPLIED') {
      item.replier = '客服专员-' + ['妙妙', '晴晴', '小丽', '大壮', '阿强'][i % 5]
      item.replyContent = DEFAULT_REPLY_TEMPLATES[i % DEFAULT_REPLY_TEMPLATES.length] + '（系统已线上审核并予以采纳反馈。）'
      item.replyTime = item.createTime.replace(/(\d{2}):(\d{2})$/, function(_, h, m) {
        return String((Number(h) + 1) % 24).padStart(2, '0') + ':' + m
      })
      item.rating = (i % 4) + 2
    }

    records.push(item)
  }

  return records
}

export default {
  name: 'SystemFeedback',
  data() {
    return {
      useMockData: USE_MOCK_DATA,
      questionTypes: QUESTION_TYPES,
      statusOptions: STATUS_OPTIONS,
      mockFeedbacks: USE_MOCK_DATA ? generateMockFeedbacks() : [],
      siteOptions: [],

      listLoading: false,
      detailLoading: false,
      replyLoading: false,
      listData: [],
      selectedFeedback: null,
      total: 0,
      stats: {
        total: 0,
        pending: 0,
        replied: 0
      },
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: '',
        orderNo: '',
        questionType: '',
        status: '',
        siteCode: '',
        siteKeyword: ''
      },
      replyTemplateRecords: [],
      replyText: '',
      templateDialog: {
        open: false,
        loading: false
      },
      templateFormDialog: {
        open: false,
        title: '新增快捷回复语',
        loading: false
      },
      templateForm: {
        id: undefined,
        content: '',
        status: 1,
        sort: 0
      },
      templateRules: {
        content: [
          { required: true, message: '回复内容不能为空', trigger: 'blur' }
        ]
      },
      imageDialog: {
        open: false,
        url: ''
      }
    }
  },
  computed: {
    statCards() {
      return [
        { key: 'total', label: '累计总反馈数', value: this.stats.total, unit: '个', icon: 'el-icon-tickets', theme: 'blue' },
        { key: 'pending', label: '待客服处理 / 未回复', value: this.stats.pending, unit: '待办', icon: 'el-icon-warning-outline', theme: 'orange' },
        { key: 'replied', label: '已回复归档件', value: this.stats.replied, unit: '已结', icon: 'el-icon-circle-check', theme: 'green' }
      ]
    },
    currentAccountName() {
      return (this.$store.state.user && (this.$store.state.user.nickName || this.$store.state.user.name)) || '当前账号'
    },
    enabledReplyTemplates() {
      return this.replyTemplateRecords
        .filter(item => Number(item.status) === 1)
        .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    }
  },
  created() {
    this.getSiteOptions()
    this.getTemplates()
    this.getList()
  },
  methods: {
    getList() {
      if (this.useMockData) {
        this.getMockList()
        return
      }

      this.listLoading = true
      this.loadStats()
      listFeedback(this.buildQueryParams()).then(response => {
        this.listData = this.extractRows(response)
        this.total = this.extractTotal(response)
        this.syncSelectedAfterList()
      }).finally(() => {
        this.listLoading = false
      })
    },
    getMockList() {
      this.listLoading = true
      const filtered = this.filterMockRecords()
      this.total = filtered.length
      this.stats = this.computeStats(this.mockFeedbacks)
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      this.listData = filtered.slice(start, start + this.queryParams.pageSize)
      this.syncSelectedAfterList()
      this.listLoading = false
    },
    filterMockRecords() {
      const query = this.queryParams
      const beginTime = this.dateRange && this.dateRange.length ? this.dateRange[0] : ''
      const endTime = this.dateRange && this.dateRange.length ? this.dateRange[1] : ''
      return this.mockFeedbacks.filter(item => {
        const usernameMatched = !query.username || this.getUsername(item).toLowerCase().includes(query.username.toLowerCase())
        const orderMatched = !query.orderNo || this.getAssociatedOrderNo(item).toLowerCase().includes(query.orderNo.toLowerCase())
        const typeMatched = !query.questionType || this.normalizeQuestionType(item.questionType) === query.questionType
        const statusMatched = !query.status || this.normalizeStatus(item.status) === query.status
        const siteMatched = !query.siteCode || this.getSiteCode(item) === query.siteCode
        const siteKeyword = (this.getSiteDisplay(item) || '').toLowerCase()
        const siteKeywordMatched = !query.siteKeyword || siteKeyword.includes(query.siteKeyword.toLowerCase())
        const day = String(item.createTime || '').slice(0, 10)
        const beginMatched = !beginTime || day >= beginTime
        const endMatched = !endTime || day <= endTime
        return usernameMatched && orderMatched && typeMatched && statusMatched && siteMatched && siteKeywordMatched && beginMatched && endMatched
      })
    },
    loadStats() {
      getFeedbackStats(this.buildQueryParams()).then(response => {
        const data = this.extractData(response)
        this.stats = {
          total: Number(data.total || data.totalCount || 0),
          pending: Number(data.pending || data.pendingCount || 0),
          replied: Number(data.replied || data.repliedCount || 0)
        }
      })
    },
    getSiteOptions() {
      if (this.useMockData) {
        this.siteOptions = MOCK_SITES.map(item => ({
          value: item.siteCode,
          label: item.siteCode + '/' + item.siteName
        }))
        return
      }

      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.siteOptions = this.extractRows(response).map(site => {
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
    getTemplates() {
      this.templateDialog.loading = this.templateDialog.open
      if (this.useMockData) {
        if (!this.replyTemplateRecords.length) {
          this.replyTemplateRecords = this.buildDefaultTemplates()
        }
        this.templateDialog.loading = false
        return
      }

      listFeedbackTemplates({}).then(response => {
        const rows = this.extractRows(response)
        this.replyTemplateRecords = rows.length
          ? rows.map((item, index) => this.normalizeTemplate(item, index)).filter(item => item.content)
          : []
      }).catch(() => {
        this.replyTemplateRecords = []
      }).finally(() => {
        this.templateDialog.loading = false
      })
    },
    buildDefaultTemplates() {
      return DEFAULT_REPLY_TEMPLATES.map((content, index) => ({
        id: 'default-' + index,
        content,
        status: 1,
        sort: index + 1
      }))
    },
    normalizeTemplate(item = {}, index = 0) {
      const id = this.getFieldByAliases(item, ['id', 'templateId', 'replyTemplateId'])
      const content = this.getFieldByAliases(item, ['content', 'templateContent', 'replyContent'])
      return {
        id: id || 'template-' + index,
        content,
        status: this.normalizeTemplateStatus(this.getFieldByAliases(item, ['status', 'enabled']), 1),
        sort: Number(this.getFieldByAliases(item, ['sort', 'sortNo', 'orderNum']) || index + 1),
        createTime: this.getFieldByAliases(item, ['createTime', 'createdAt']),
        updateTime: this.getFieldByAliases(item, ['updateTime', 'updatedAt'])
      }
    },
    normalizeTemplateStatus(value, fallback = 1) {
      if (value === true) return 1
      if (value === false) return 0
      if (value === 1 || value === '1') return 1
      if (value === 0 || value === '0') return 0
      return fallback
    },
    openTemplateManager() {
      this.templateDialog.open = true
      this.getTemplates()
    },
    resetTemplateForm() {
      this.templateForm = {
        id: undefined,
        content: '',
        status: 1,
        sort: this.replyTemplateRecords.length + 1
      }
      this.$nextTick(() => {
        this.clearTemplateFormValidate()
      })
    },
    handleAddTemplate() {
      this.templateFormDialog.title = '新增快捷回复语'
      this.templateFormDialog.open = true
      this.resetTemplateForm()
    },
    handleEditTemplate(row) {
      this.templateFormDialog.title = '编辑快捷回复语'
      this.templateForm = {
        id: row.id,
        content: row.content,
        status: Number(row.status) === 1 ? 1 : 0,
        sort: Number(row.sort || 0)
      }
      this.templateFormDialog.open = true
      this.$nextTick(() => {
        this.clearTemplateFormValidate()
      })
    },
    clearTemplateFormValidate() {
      if (this.$refs.templateForm) {
        this.$refs.templateForm.clearValidate()
      }
    },
    submitTemplateForm() {
      this.$refs.templateForm.validate(valid => {
        if (!valid) return
        const payload = this.buildTemplatePayload(this.templateForm)
        this.templateFormDialog.loading = true
        if (this.useMockData) {
          this.applyMockTemplateUpsert(payload)
          this.templateFormDialog.loading = false
          this.templateFormDialog.open = false
          this.$message.success(payload.id ? '快捷回复语已更新' : '快捷回复语已新增')
          return
        }
        const request = payload.id ? updateFeedbackTemplate(payload) : addFeedbackTemplate(payload)
        request.then(() => {
          this.$message.success(payload.id ? '快捷回复语已更新' : '快捷回复语已新增')
          this.templateFormDialog.open = false
          this.getTemplates()
        }).finally(() => {
          this.templateFormDialog.loading = false
        })
      })
    },
    handleTemplateStatusChange(row) {
      const payload = this.buildTemplatePayload(row)
      if (this.useMockData) {
        this.$message.success(Number(row.status) === 1 ? '快捷回复语已启用' : '快捷回复语已停用')
        return
      }
      updateFeedbackTemplate(payload).then(() => {
        this.$message.success(Number(row.status) === 1 ? '快捷回复语已启用' : '快捷回复语已停用')
        this.getTemplates()
      }).catch(() => {
        row.status = Number(row.status) === 1 ? 0 : 1
      })
    },
    handleDeleteTemplate(row) {
      this.$confirm('确认删除该快捷回复语吗？删除后仅影响当前账号。', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.useMockData) {
          this.replyTemplateRecords = this.replyTemplateRecords.filter(item => item.id !== row.id)
          this.$message.success('快捷回复语已删除')
          return
        }
        return deleteFeedbackTemplate(row.id)
      }).then(() => {
        if (!this.useMockData) {
          this.$message.success('快捷回复语已删除')
          this.getTemplates()
        }
      }).catch(() => {})
    },
    buildTemplatePayload(source = {}) {
      return this.cleanParams({
        id: source.id,
        templateId: source.id,
        content: source.content,
        status: Number(source.status) === 1 ? 1 : 0,
        sort: Number(source.sort || 0)
      })
    },
    applyMockTemplateUpsert(payload) {
      if (payload.id) {
        this.replyTemplateRecords = this.replyTemplateRecords.map(item => {
          if (item.id !== payload.id) return item
          return {
            ...item,
            content: payload.content,
            status: payload.status,
            sort: payload.sort,
            updateTime: this.formatNow()
          }
        })
        return
      }
      this.replyTemplateRecords.push({
        id: 'mock-template-' + Date.now(),
        content: payload.content,
        status: payload.status,
        sort: payload.sort,
        createTime: this.formatNow()
      })
    },
    syncSelectedAfterList() {
      if (!this.listData.length) {
        this.selectedFeedback = null
        return
      }
      const selectedId = this.selectedFeedback && this.getFeedbackId(this.selectedFeedback)
      const matched = selectedId ? this.listData.find(item => this.getFeedbackId(item) === selectedId) : null
      this.handleSelectFeedback(matched || this.listData[0], true)
    },
    handleSelectFeedback(row, silent) {
      if (!row) return
      if (this.useMockData) {
        this.selectedFeedback = row
        if (!silent) this.replyText = ''
        return
      }

      this.detailLoading = true
      getFeedback(this.getFeedbackId(row)).then(response => {
        this.selectedFeedback = this.extractData(response)
        if (!silent) this.replyText = ''
      }).finally(() => {
        this.detailLoading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: this.queryParams.pageSize,
        username: '',
        orderNo: '',
        questionType: '',
        status: '',
        siteCode: '',
        siteKeyword: ''
      }
      this.$nextTick(() => {
        this.resetForm('queryForm')
      })
      this.getList()
    },
    handleSendReply() {
      if (!this.selectedFeedback) return
      const content = (this.replyText || '').trim()
      if (!content) {
        this.$message.warning('请输入回复内容')
        return
      }

      const feedbackId = this.getFeedbackId(this.selectedFeedback)
      this.replyLoading = true
      if (this.useMockData) {
        this.applyMockReply(feedbackId, content)
        this.replyLoading = false
        this.$message.success('回复已成功发送并发放站内信')
        return
      }

      replyFeedback(feedbackId, { replyContent: content }).then(() => {
        this.$message.success('回复已成功发送并发放站内信')
        this.replyText = ''
        this.getList()
      }).finally(() => {
        this.replyLoading = false
      })
    },
    handleReopen() {
      if (!this.selectedFeedback) return
      this.$confirm('确认撤销该工单回复并恢复为待处理状态吗？', '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const feedbackId = this.getFeedbackId(this.selectedFeedback)
        this.replyLoading = true
        if (this.useMockData) {
          this.applyMockReopen(feedbackId)
          this.replyLoading = false
          this.$message.success('回复已撤销，工单已恢复至待处理')
          return
        }

        reopenFeedback(feedbackId, { reason: '重新编辑' }).then(() => {
          this.$message.success('回复已撤销，工单已恢复至待处理')
          this.getList()
        }).finally(() => {
          this.replyLoading = false
        })
      }).catch(() => {})
    },
    handleExport() {
      if (this.useMockData) {
        this.$message.info('导出接口待后端提供后启用')
        return
      }
      this.download('system/feedback/export', this.buildQueryParams(), 'feedback_' + new Date().getTime() + '.xlsx')
    },
    applyMockReply(feedbackId, content) {
      const now = this.formatNow()
      this.mockFeedbacks = this.mockFeedbacks.map(item => {
        if (this.getFeedbackId(item) !== feedbackId) return item
        return {
          ...item,
          status: 'REPLIED',
          replier: '旺财官方专员',
          replyContent: content,
          replyTime: now,
          rating: undefined
        }
      })
      this.replyText = ''
      this.getMockList()
    },
    applyMockReopen(feedbackId) {
      this.mockFeedbacks = this.mockFeedbacks.map(item => {
        if (this.getFeedbackId(item) !== feedbackId) return item
        return {
          ...item,
          status: 'PENDING',
          replier: undefined,
          replyContent: undefined,
          replyTime: undefined,
          rating: undefined
        }
      })
      this.getMockList()
    },
    buildQueryParams() {
      const result = this.cleanParams({
        ...this.queryParams,
        beginTime: this.dateRange && this.dateRange.length ? this.dateRange[0] : undefined,
        endTime: this.dateRange && this.dateRange.length ? this.dateRange[1] : undefined
      })
      return result
    },
    computeStats(records) {
      const total = records.length
      const pending = records.filter(item => this.isPending(item)).length
      return {
        total,
        pending,
        replied: total - pending
      }
    },
    cleanParams(source) {
      const result = {}
      Object.keys(source || {}).forEach(key => {
        const value = source[key]
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value
        }
      })
      return result
    },
    extractRows(response) {
      if (!response) return []
      if (Array.isArray(response.rows)) return response.rows
      if (Array.isArray(response.records)) return response.records
      if (Array.isArray(response.list)) return response.list
      if (response.data && Array.isArray(response.data.rows)) return response.data.rows
      if (response.data && Array.isArray(response.data.records)) return response.data.records
      if (response.data && Array.isArray(response.data.list)) return response.data.list
      if (Array.isArray(response.data)) return response.data
      return []
    },
    extractTotal(response) {
      if (!response) return 0
      if (typeof response.total === 'number') return response.total
      if (typeof response.count === 'number') return response.count
      if (response.data && typeof response.data.total === 'number') return response.data.total
      if (response.data && typeof response.data.count === 'number') return response.data.count
      return this.extractRows(response).length
    },
    extractData(response) {
      if (response && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data
      }
      return response || {}
    },
    getFieldByAliases(row, aliases) {
      if (!row) return ''
      for (let i = 0; i < aliases.length; i++) {
        const key = aliases[i]
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          return row[key]
        }
      }
      return ''
    },
    getFeedbackId(row) {
      return String(this.getFieldByAliases(row, ['id', 'feedbackId', 'feedbackNo']) || '')
    },
    getUsername(row) {
      return this.getFieldByAliases(row, ['username', 'userName', 'memberName', 'account']) || '--'
    },
    getVipLevel(row) {
      return this.getFieldByAliases(row, ['vipLevel', 'vipName', 'levelName']) || 'vip0'
    },
    getSiteCode(row) {
      return String(this.getFieldByAliases(row, ['siteCode', 'siteId', 'merchantCode']) || '')
    },
    getSiteName(row) {
      return this.getFieldByAliases(row, ['siteName', 'siteNameZh', 'merchantName']) || ''
    },
    getSiteDisplay(row) {
      return this.formatSiteCodeName(this.getSiteCode(row), this.getSiteName(row))
    },
    getDescription(row) {
      return this.getFieldByAliases(row, ['description', 'content', 'feedbackContent', 'questionDesc']) || '--'
    },
    getAssociatedOrderNo(row) {
      return String(this.getFieldByAliases(row, ['associatedOrderNo', 'orderNo', 'bizOrderNo', 'relatedOrderNo']) || '')
    },
    getCreateTime(row) {
      return this.getFieldByAliases(row, ['createTime', 'createdAt', 'submitTime']) || '--'
    },
    getReplier(row) {
      return this.getFieldByAliases(row, ['replier', 'replyBy', 'replyUserName']) || '官方客服'
    },
    getReplyContent(row) {
      return this.getFieldByAliases(row, ['replyContent', 'reply', 'answer']) || '--'
    },
    getReplyTime(row) {
      return this.getFieldByAliases(row, ['replyTime', 'repliedAt', 'updateTime']) || '--'
    },
    getRating(row) {
      return this.getFieldByAliases(row, ['rating', 'score', 'satisfactionScore'])
    },
    getScreenshots(row) {
      const value = this.getFieldByAliases(row, ['screenshots', 'screenshotUrls', 'attachments', 'images'])
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(item => {
          if (typeof item === 'string') return item
          return item.url || item.fileUrl || item.ossUrl || item.path
        }).filter(Boolean)
      }
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) return parsed
        } catch (e) {
          return value.split(',').map(item => item.trim()).filter(Boolean)
        }
      }
      return []
    },
    normalizeQuestionType(value) {
      const rawValue = String(value || '')
      const matched = QUESTION_TYPES.find(item => item.value === rawValue || item.label === rawValue)
      return matched ? matched.value : rawValue
    },
    getTypeMeta(row) {
      const type = this.normalizeQuestionType(this.getFieldByAliases(row, ['questionType', 'type', 'feedbackType']))
      return QUESTION_TYPES.find(item => item.value === type) || QUESTION_TYPES[QUESTION_TYPES.length - 1]
    },
    normalizeStatus(value) {
      const rawValue = String(value || '').toUpperCase()
      if (rawValue === 'PENDING' || rawValue === '0' || value === '待处理') return 'PENDING'
      if (rawValue === 'REPLIED' || rawValue === '1' || value === '已回复') return 'REPLIED'
      return rawValue
    },
    isPending(row) {
      return this.normalizeStatus(this.getFieldByAliases(row, ['status', 'state', 'replyStatus'])) === 'PENDING'
    },
    isReplied(row) {
      return this.normalizeStatus(this.getFieldByAliases(row, ['status', 'state', 'replyStatus'])) === 'REPLIED'
    },
    getStatusLabel(row) {
      return this.isPending(row) ? '待处理' : '已回复'
    },
    formatSiteCodeName(code, name) {
      if (code && name) return code + '/' + name
      return code || name || '--'
    },
    formatNow() {
      const date = new Date()
      const pad = value => String(value).padStart(2, '0')
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    },
    previewImage(url) {
      this.imageDialog = {
        open: true,
        url
      }
    },
    copyText(text) {
      if (!text) return
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopyText(text)
        })
        return
      }
      this.fallbackCopyText(text)
    },
    fallbackCopyText(text) {
      const input = document.createElement('textarea')
      input.value = text
      input.setAttribute('readonly', 'readonly')
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success('已复制到剪贴板')
    }
  }
}
