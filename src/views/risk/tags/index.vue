<template>
  <div class="app-container risk-tags-page">
    <div class="risk-card">
      <div class="risk-tags-header">
        <div>
          <div class="risk-tags-header__eyebrow">
            <i class="el-icon-collection-tag"></i>
            风控管理
          </div>
          <div class="risk-tags-header__title">
            风控标签管理
            <el-tag v-if="useMockData" size="mini" type="info">本地演示数据</el-tag>
          </div>
        </div>
        <div class="risk-tags-header__actions">
          <el-button type="info" plain size="mini" icon="el-icon-time" @click="openLogDialog">操作记录</el-button>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">新增自定义标签</el-button>
        </div>
      </div>

      <el-alert
        class="risk-tags-tip"
        type="info"
        :closable="false"
        show-icon
      >
        <div slot="title">
          系统标签由风控策略预置，只允许修改备注；自定义标签支持新增、编辑和删除，用于各分站记录本地风险特征。
        </div>
      </el-alert>

      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
        label-width="86px"
        class="risk-query"
      >
        <el-form-item class="query-item query-item--lg" label="标签名称" prop="tagName">
          <el-input
            v-model.trim="queryParams.tagName"
            class="query-control"
            placeholder="请输入标签名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="query-item query-item--sm" label="标签类型" prop="tagType">
          <el-select v-model="queryParams.tagType" class="query-control" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in tagTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">查询</el-button>
          <el-button type="info" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="listLoading" :data="listData" @row-dblclick="handleEdit">
        <el-table-column label="序号" type="index" width="70" align="center">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="ID" align="center" min-width="110" show-overflow-tooltip>
          <template slot-scope="scope">{{ resolveTagId(scope.row) || '--' }}</template>
        </el-table-column>
        <el-table-column label="标签名称" align="center" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="tag-name">{{ getTagName(scope.row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险标签类型" align="center" min-width="130">
          <template slot-scope="scope">
            <el-tag :type="isSystemTag(scope.row) ? '' : 'success'" size="mini" effect="plain">
              {{ getTagTypeLabel(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注信息" align="left" min-width="330" show-overflow-tooltip>
          <template slot-scope="scope">{{ getTagRemark(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="最后修改时间" align="center" min-width="170">
          <template slot-scope="scope">{{ formatListTime(getTagUpdateTime(scope.row)) }}</template>
        </el-table-column>
        <el-table-column label="操作人" align="center" min-width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ getTagOperator(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="handleEdit(scope.row)">
              {{ isSystemTag(scope.row) ? '修改备注' : '编辑' }}
            </el-button>
            <el-button
              v-if="!isSystemTag(scope.row)"
              type="text"
              size="mini"
              class="danger-text"
              @click.stop="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogOpen" width="620px" append-to-body @close="resetDataForm">
      <el-alert
        v-if="editingSystemTag"
        class="dialog-tip"
        title="系统标签名称由风控策略预置并绑定，不支持改名和删除。"
        type="info"
        :closable="false"
        show-icon
      />
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model.trim="form.name"
            :disabled="editingSystemTag"
            maxlength="20"
            show-word-limit
            placeholder="例如：特定漏洞套佣玩家"
          />
        </el-form-item>
        <el-form-item label="标签类型" prop="tagType">
          <el-tag :type="editingSystemTag ? '' : 'success'" effect="plain">
            {{ getTypeLabel(form.tagType) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model.trim="form.remark"
            type="textarea"
            :rows="4"
            maxlength="300"
            show-word-limit
            placeholder="请输入判定依据、审核口径或出款复核建议"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialogOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="风控标签操作记录"
      :visible.sync="logDialogOpen"
      width="980px"
      append-to-body
      class="risk-tags-log-dialog"
    >
      <el-table v-loading="logLoading" :data="logList" max-height="520">
        <el-table-column label="配置时间" align="center" width="170">
          <template slot-scope="scope">{{ formatListTime(getLogCreateTime(scope.row)) }}</template>
        </el-table-column>
        <el-table-column label="标签名称" align="center" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">{{ getLogTagName(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="风险类型" align="center" width="120">
          <template slot-scope="scope">
            <el-tag :type="normalizeTagType(getLogTagType(scope.row)) === 'SYSTEM' ? '' : 'success'" size="mini" effect="plain">
              {{ getTypeLabel(getLogTagType(scope.row)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作指令" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="getActionTagType(getLogActionType(scope.row))" size="mini">
              {{ getLogActionType(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="核心详情操作明细记录" min-width="300" show-overflow-tooltip>
          <template slot-scope="scope">{{ getLogDetail(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="操作员" align="center" width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{ getLogOperator(scope.row) }}</template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="logTotal > 0"
        :total="logTotal"
        :page.sync="logQueryParams.pageNum"
        :limit.sync="logQueryParams.pageSize"
        @pagination="getLogList"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="logDialogOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listRiskTags,
  getRiskTag,
  addRiskTag,
  updateRiskTag,
  delRiskTag,
  listRiskTagLogs
} from '@/api/risk/tags'

const USE_MOCK_DATA = process.env.VUE_APP_RISK_TAG_MOCK === 'true'

const TAG_TYPE_OPTIONS = [
  { label: '系统标签', value: 'SYSTEM' },
  { label: '自定义标签', value: 'CUSTOM' }
]

const MOCK_TAGS = [
  { id: 'sys-1', name: '高盈利会员', tagType: 'SYSTEM', remark: '盈利水平异常偏离的超额获利玩家，出款时需强化其游戏原始流水对比与对账单审计。', updateTime: '2026-06-02 09:30:15', operator: 'system_auth' },
  { id: 'sys-2', name: '职业玩家', tagType: 'SYSTEM', remark: '拥有高频次多模式套利投注策略的专业选手，不建议发放特殊反水或倾斜礼金。', updateTime: '2026-06-01 18:22:45', operator: 'admin' },
  { id: 'sys-3', name: '对冲套利风险', tagType: 'SYSTEM', remark: '在多平台或同平台多盘口进行反向对冲以获取返水或无风险套利的账号群。', updateTime: '2026-06-01 22:10:11', operator: 'risk_officer' },
  { id: 'sys-4', name: '活动套利风险', tagType: 'SYSTEM', remark: '专盯高反水、首存送、大额活动漏洞进行低风险洗码的套现型玩家。', updateTime: '2026-05-29 10:14:02', operator: 'system_auth' },
  { id: 'sys-5', name: '羊毛党用户', tagType: 'SYSTEM', remark: '只参与平台免费福利、红包派发，且基本没有后续真实流水贡献的边缘群体。', updateTime: '2026-05-28 11:45:00', operator: 'admin' },
  { id: 'sys-6', name: '多账号关联', tagType: 'SYSTEM', remark: '相同IP、相似设备ID或高频充提及钱包地址重复的大量关联克隆账号。', updateTime: '2026-06-01 10:05:12', operator: 'risk_officer' },
  { id: 'sys-7', name: '异常投注用户', tagType: 'SYSTEM', remark: '在电子、棋牌、真人游戏存在规律性瞬时对倒投注，单注金额异常偏高。', updateTime: '2026-05-30 16:30:00', operator: 'system_auth' },
  { id: 'sys-8', name: '异常充值用户', tagType: 'SYSTEM', remark: '频繁发起小额测试型扫码支付，或提币地址关联黑灰名单的高风险源头账户。', updateTime: '2026-05-31 09:15:33', operator: 'admin' },
  { id: 'sys-9', name: '异常提币用户', tagType: 'SYSTEM', remark: '高频极速清零出款，疑似账户存在异地登录、被盗风险或套路外泄行为。', updateTime: '2026-06-02 08:12:05', operator: 'system_auth' },
  { id: 'sys-10', name: '黑名单用户', tagType: 'SYSTEM', remark: '因严重刷单、造假实名、洗黑钱等恶意套利行为被限制财务交互及游戏动作。', updateTime: '2026-06-02 10:00:00', operator: 'admin' },
  { id: 'cust-1', name: '高频刷充代理关联户', tagType: 'CUSTOM', remark: '与下线代理存在多层交叉，专攻返佣差价，投注规律高度一致。', updateTime: '2026-05-30 14:15:20', operator: 'system_audit' },
  { id: 'cust-2', name: '特定IP段注册群组', tagType: 'CUSTOM', remark: '在特定网口段批量注册，并在同时间段提取整额。', updateTime: '2026-06-01 09:12:00', operator: 'admin' },
  { id: 'cust-3', name: '哈希爆奖监测户', tagType: 'CUSTOM', remark: '哈希尾号竞猜常驻高倍率玩家，需每天人工多区块比对签名真伪。', updateTime: '2026-06-01 11:22:33', operator: 'risk_officer' },
  { id: 'cust-4', name: '虚拟币快存快提小户', tagType: 'CUSTOM', remark: '小额USDT高频套流，单日交易笔数50次以上。', updateTime: '2026-06-02 08:33:45', operator: 'admin' },
  { id: 'cust-5', name: '同步对倒投注刷水户', tagType: 'CUSTOM', remark: '监测到在同场馆或多场馆间极速实现双向对压玩法，涉嫌恶意刷返水。', updateTime: '2026-06-02 07:11:00', operator: 'system_auth' },
  { id: 'cust-6', name: '异常时段批量注册群', tagType: 'CUSTOM', remark: '每日凌晨通过境外代理IP段聚集注册的用户群体。', updateTime: '2026-06-01 15:40:12', operator: 'admin' },
  { id: 'cust-7', name: '绑定相同提现姓名户', tagType: 'CUSTOM', remark: '多个不同账号频繁重合绑定同一个或极相似的提现实名拥有者。', updateTime: '2026-05-31 20:30:15', operator: 'risk_officer' },
  { id: 'cust-8', name: '流水超爆高额波动户', tagType: 'CUSTOM', remark: '短时间内突然产生超过历史存缴10倍以上的大额流水。', updateTime: '2026-05-31 11:12:02', operator: 'system_auth' },
  { id: 'cust-9', name: '代理假人套利返佣组', tagType: 'CUSTOM', remark: '新增代理下产生大量不活跃账号，仅在福利发放前上线对倒套利。', updateTime: '2026-05-30 09:22:45', operator: 'system_audit' },
  { id: 'cust-10', name: '同卡多人循环充值户', tagType: 'CUSTOM', remark: '同一张银行卡或支付扫码账户跨多个游戏UID进行充值支付。', updateTime: '2026-05-30 18:25:30', operator: 'admin' },
  { id: 'cust-11', name: '跨省异地异端登录组', tagType: 'CUSTOM', remark: '短时间内登录地明显跳变，疑似代打、外接脚本或撞库套号。', updateTime: '2026-05-29 14:15:33', operator: 'risk_officer' },
  { id: 'cust-12', name: '快存快取低流水玩家', tagType: 'CUSTOM', remark: '存款到账后未足额投注，即以紧急理由发起取消或全额退出申请。', updateTime: '2026-05-29 11:00:22', operator: 'admin' },
  { id: 'cust-13', name: '高频解绑谷歌验证户', tagType: 'CUSTOM', remark: '频繁发起重置或解绑双重因子安全密钥申请，疑似账户交易买卖。', updateTime: '2026-05-28 16:35:10', operator: 'system_auth' },
  { id: 'cust-14', name: '撞库高频密码错误户', tagType: 'CUSTOM', remark: '单IP连续尝试大量不同账户名密码或找回流程。', updateTime: '2026-05-28 10:14:02', operator: 'system_auth' }
]

const MOCK_LOGS = [
  { id: 'log-1', tagId: 'cust-4', tagName: '虚拟币快存快提小户', tagType: 'CUSTOM', actionType: '新增', detail: '新增自定义标签 [虚拟币快存快提小户]，备注：小额USDT高频套流，单日交易笔数50次以上。', operator: 'admin', createTime: '2026-06-02 08:33:45' },
  { id: 'log-2', tagId: 'sys-3', tagName: '对冲套利风险', tagType: 'SYSTEM', actionType: '修改', detail: '修改系统标签备注，补充同平台多盘口反向对冲识别口径。', operator: 'risk_officer', createTime: '2026-06-01 22:10:11' },
  { id: 'log-3', tagId: 'sys-1', tagName: '高盈利会员', tagType: 'SYSTEM', actionType: '修改', detail: '更新风控备注指导细则，追加强化出款前游戏原始投注记录对账标准。', operator: 'admin', createTime: '2026-06-01 14:18:22' },
  { id: 'log-4', tagId: 'cust-3', tagName: '哈希爆奖监测户', tagType: 'CUSTOM', actionType: '新增', detail: '新增自定义标签 [哈希爆奖监测户]，设定为需要进行哈希真伪链下对账的玩家群。', operator: 'risk_officer', createTime: '2026-06-01 11:22:33' },
  { id: 'log-5', tagId: 'cust-1', tagName: '高频刷充代理关联户', tagType: 'CUSTOM', actionType: '新增', detail: '新增自定义标签 [高频刷充代理关联户]，用于识别代理佣金交叉套利玩家。', operator: 'system_audit', createTime: '2026-05-30 14:15:20' }
]

export default {
  name: 'RiskTagsPage',
  data() {
    return {
      useMockData: USE_MOCK_DATA,
      tagTypeOptions: TAG_TYPE_OPTIONS,

      listLoading: false,
      listData: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tagName: '',
        tagType: ''
      },

      dialogOpen: false,
      dialogTitle: '新增自定义风控标签',
      submitLoading: false,
      form: this.getDefaultForm(),
      rules: {
        name: [{ validator: (rule, value, callback) => this.validateTagName(rule, value, callback), trigger: 'blur' }],
        remark: [
          { required: true, message: '备注信息不能为空', trigger: 'blur' },
          { min: 2, max: 300, message: '备注信息长度为2到300个字符', trigger: 'blur' }
        ]
      },

      logDialogOpen: false,
      logLoading: false,
      logList: [],
      logTotal: 0,
      logQueryParams: {
        pageNum: 1,
        pageSize: 10
      },

      mockTags: USE_MOCK_DATA ? MOCK_TAGS.map(item => ({ ...item })) : [],
      mockLogs: USE_MOCK_DATA ? MOCK_LOGS.map(item => ({ ...item })) : []
    }
  },
  computed: {
    editingSystemTag() {
      return this.normalizeTagType(this.form.tagType) === 'SYSTEM'
    },
    currentAccountName() {
      const user = this.$store.state.user || {}
      return user.nickName || user.name || user.userName || 'admin'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        name: '',
        tagType: 'CUSTOM',
        remark: ''
      }
    },
    getList() {
      if (this.useMockData) {
        this.getMockList()
        return
      }

      this.listLoading = true
      listRiskTags(this.buildQueryPayload()).then((response) => {
        const rows = this.extractRows(response)
        this.listData = rows.map(item => this.normalizeTag(item))
        this.total = this.extractTotal(response)
      }).finally(() => {
        this.listLoading = false
      })
    },
    getMockList() {
      this.listLoading = true
      const filtered = this.filterMockTags()
      this.total = filtered.length
      const totalPages = Math.max(Math.ceil(this.total / this.queryParams.pageSize), 1)
      if (this.queryParams.pageNum > totalPages) {
        this.queryParams.pageNum = totalPages
      }
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      this.listData = filtered.slice(start, start + this.queryParams.pageSize)
      this.listLoading = false
    },
    filterMockTags() {
      const name = String(this.queryParams.tagName || '').trim().toLowerCase()
      const type = this.normalizeTagType(this.queryParams.tagType)
      return this.mockTags
        .filter(item => {
          const nameMatched = !name || String(item.name || '').toLowerCase().includes(name)
          const typeMatched = !type || this.normalizeTagType(item.tagType) === type
          return nameMatched && typeMatched
        })
        .sort((a, b) => String(b.updateTime || '').localeCompare(String(a.updateTime || '')))
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: this.queryParams.pageSize,
        tagName: '',
        tagType: ''
      }
      this.$nextTick(() => {
        this.resetForm('queryForm')
      })
      this.getList()
    },
    handleAdd() {
      this.resetDataForm()
      this.dialogTitle = '新增自定义风控标签'
      this.dialogOpen = true
    },
    handleEdit(row) {
      const id = this.resolveTagId(row)
      if (!id) {
        this.$modal.msgWarning('请双击一条风控标签数据进行编辑')
        return
      }
      if (this.useMockData) {
        this.form = this.normalizeTag(row)
        this.dialogTitle = this.isSystemTag(row) ? '修改系统标签备注' : '修改自定义风控标签'
        this.dialogOpen = true
        this.$nextTick(() => this.clearFormValidate())
        return
      }

      getRiskTag(id).then((response) => {
        this.form = this.normalizeTag({
          ...this.extractData(response),
          id
        })
        this.dialogTitle = this.editingSystemTag ? '修改系统标签备注' : '修改自定义风控标签'
        this.dialogOpen = true
        this.$nextTick(() => this.clearFormValidate())
      })
    },
    handleDelete(row) {
      if (this.isSystemTag(row)) {
        this.$modal.msgWarning('系统标签不可删除')
        return
      }
      const id = this.resolveTagId(row)
      if (!id) return
      const name = this.getTagName(row)
      this.$modal.confirm(`确认删除自定义风控标签【${name}】吗？删除后，历史使用该标签的会员标记需由后端按规则处理。`).then(() => {
        if (this.useMockData) {
          this.mockTags = this.mockTags.filter(item => String(item.id) !== String(id))
          this.appendMockLog({
            tagId: id,
            tagName: name,
            tagType: 'CUSTOM',
            actionType: '删除',
            detail: `删除自定义风控标签 [${name}]，原备注：${this.getTagRemark(row)}`
          })
          this.$modal.msgSuccess('删除成功')
          this.getList()
          return
        }
        return delRiskTag(id).then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        const payload = this.buildPayload(this.form)
        if (this.useMockData) {
          this.applyMockSave(payload)
          return
        }

        this.submitLoading = true
        const requestFn = payload.id ? updateRiskTag : addRiskTag
        const successText = payload.id ? '修改成功' : '新增成功'
        requestFn(payload).then(() => {
          this.$modal.msgSuccess(successText)
          this.dialogOpen = false
          this.getList()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    applyMockSave(payload) {
      const name = String(payload.tagName || payload.name || '').trim()
      const remark = String(payload.remark || '').trim()
      const now = this.formatNow()
      if (!payload.id) {
        if (this.isDuplicateTagName(name)) {
          this.$modal.msgError('该标签名称已经存在，请勿重复添加')
          return
        }
        const id = 'cust-' + Date.now()
        const nextTag = {
          id,
          name,
          tagType: 'CUSTOM',
          remark,
          updateTime: now,
          operator: this.currentAccountName
        }
        this.mockTags.unshift(nextTag)
        this.appendMockLog({
          tagId: id,
          tagName: name,
          tagType: 'CUSTOM',
          actionType: '新增',
          detail: `新增自定义标签 [${name}]，备注：${remark}`
        })
        this.$modal.msgSuccess('新增成功')
        this.queryParams.pageNum = 1
        this.dialogOpen = false
        this.getList()
        return
      }

      const oldTag = this.mockTags.find(item => String(item.id) === String(payload.id))
      if (!oldTag) return
      const tagType = this.normalizeTagType(oldTag.tagType)
      const nextName = tagType === 'SYSTEM' ? oldTag.name : name
      if (tagType === 'CUSTOM' && this.isDuplicateTagName(nextName, payload.id)) {
        this.$modal.msgError('该标签名称已经存在，请尝试其他命名')
        return
      }
      if (nextName === oldTag.name && remark === oldTag.remark) {
        this.dialogOpen = false
        return
      }
      this.mockTags = this.mockTags.map(item => {
        if (String(item.id) !== String(payload.id)) return item
        return {
          ...item,
          name: nextName,
          remark,
          updateTime: now,
          operator: this.currentAccountName
        }
      })
      this.appendMockLog({
        tagId: payload.id,
        tagName: nextName,
        tagType,
        actionType: '修改',
        detail: this.buildUpdateLogDetail(oldTag, nextName, remark)
      })
      this.$modal.msgSuccess('修改成功')
      this.dialogOpen = false
      this.getList()
    },
    buildUpdateLogDetail(oldTag, nextName, remark) {
      const oldName = oldTag.name
      const oldRemark = oldTag.remark
      if (this.normalizeTagType(oldTag.tagType) === 'SYSTEM') {
        return `修改系统标签 [${oldName}] 备注：由 “${oldRemark}” 更新为 “${remark}”`
      }
      if (oldName !== nextName && oldRemark !== remark) {
        return `修改自定义标签名称和备注：由 [${oldName}] 更名为 [${nextName}]，备注更新为 “${remark}”`
      }
      if (oldName !== nextName) {
        return `修改自定义标签名称：由 [${oldName}] 更名为 [${nextName}]`
      }
      return `修改自定义标签 [${oldName}] 备注：由 “${oldRemark}” 更新为 “${remark}”`
    },
    isDuplicateTagName(name, excludeId) {
      const normalized = String(name || '').trim()
      return this.mockTags.some(item => {
        if (excludeId && String(item.id) === String(excludeId)) return false
        return String(item.name || '').trim() === normalized
      })
    },
    openLogDialog() {
      this.logDialogOpen = true
      this.getLogList()
    },
    getLogList() {
      if (this.useMockData) {
        this.getMockLogList()
        return
      }

      this.logLoading = true
      listRiskTagLogs({ ...this.logQueryParams }).then((response) => {
        this.logList = this.extractRows(response)
        this.logTotal = this.extractTotal(response)
      }).finally(() => {
        this.logLoading = false
      })
    },
    getMockLogList() {
      this.logLoading = true
      const rows = this.mockLogs.slice().sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')))
      this.logTotal = rows.length
      const totalPages = Math.max(Math.ceil(this.logTotal / this.logQueryParams.pageSize), 1)
      if (this.logQueryParams.pageNum > totalPages) {
        this.logQueryParams.pageNum = totalPages
      }
      const start = (this.logQueryParams.pageNum - 1) * this.logQueryParams.pageSize
      this.logList = rows.slice(start, start + this.logQueryParams.pageSize)
      this.logLoading = false
    },
    appendMockLog(source) {
      this.mockLogs.unshift({
        id: 'log-' + Date.now(),
        tagId: source.tagId,
        tagName: source.tagName,
        tagType: this.normalizeTagType(source.tagType),
        actionType: source.actionType,
        detail: source.detail,
        operator: this.currentAccountName,
        createTime: this.formatNow()
      })
      if (this.logDialogOpen) {
        this.getMockLogList()
      }
    },
    resetDataForm() {
      this.form = this.getDefaultForm()
      this.submitLoading = false
      this.$nextTick(() => this.clearFormValidate())
    },
    clearFormValidate() {
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },
    validateTagName(rule, value, callback) {
      if (this.editingSystemTag) {
        callback()
        return
      }
      const name = String(value || '').trim()
      if (!name) {
        callback(new Error('标签名称不能为空'))
        return
      }
      if (name.length > 20) {
        callback(new Error('标签名称不能超过20个字符'))
        return
      }
      callback()
    },
    buildQueryPayload() {
      const tagType = this.normalizeTagType(this.queryParams.tagType)
      return this.cleanParams({
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
        tagName: String(this.queryParams.tagName || '').trim(),
        tagType
      })
    },
    buildPayload(source = {}) {
      const id = source.id || undefined
      const tagType = this.normalizeTagType(source.tagType) || 'CUSTOM'
      const name = String(source.name || '').trim()
      const remark = String(source.remark || '').trim()
      return this.cleanParams({
        id,
        tagName: name,
        tagType,
        remark
      })
    },
    normalizeTag(item = {}) {
      const id = this.getFieldByAliases(item, ['id', 'tagId', 'riskTagId'])
      const name = this.normalizeText(this.getFieldByAliases(item, ['name', 'tagName', 'riskTagName']))
      const tagType = this.normalizeTagType(this.getFieldByAliases(item, ['tagType', 'type', 'riskTagType']))
      return {
        ...item,
        id,
        name,
        tagType: tagType || 'CUSTOM',
        remark: this.normalizeText(this.getFieldByAliases(item, ['remark', 'remarks', 'description', 'desc'])) || '',
        updateTime: this.getFieldByAliases(item, ['updateTime', 'updatedAt', 'updatedTime', 'modifyTime', 'gmtModified']) || '',
        operator: this.normalizeText(this.getFieldByAliases(item, ['operator', 'operatorName', 'updateBy', 'updateName', 'createBy', 'createName'])) || '--'
      }
    },
    normalizeTagType(value) {
      if (value === undefined || value === null || value === '') return ''
      const text = this.normalizeText(value).trim().toUpperCase()
      if (text === 'SYSTEM' || text === 'SYS' || text === '1' || text === '系统标签') return 'SYSTEM'
      if (text === 'CUSTOM' || text === '2' || text === '自定义标签') return 'CUSTOM'
      return text
    },
    getTypeLabel(value) {
      return this.normalizeTagType(value) === 'SYSTEM' ? '系统标签' : '自定义标签'
    },
    isSystemTag(row) {
      return this.normalizeTagType(this.getFieldByAliases(row, ['tagType', 'type', 'riskTagType'])) === 'SYSTEM'
    },
    resolveTagId(row) {
      return this.getFieldByAliases(row, ['id', 'tagId', 'riskTagId']) || ''
    },
    getTagName(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['name', 'tagName', 'riskTagName'])) || '--'
    },
    getTagTypeLabel(row) {
      return this.getTypeLabel(this.getFieldByAliases(row, ['tagType', 'type', 'riskTagType']))
    },
    getTagRemark(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['remark', 'remarks', 'description', 'desc'])) || '--'
    },
    getTagUpdateTime(row) {
      return this.getFieldByAliases(row, ['updateTime', 'updatedAt', 'updatedTime', 'modifyTime', 'gmtModified'])
    },
    getTagOperator(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['operator', 'operatorName', 'updateBy', 'updateName', 'createBy', 'createName'])) || '--'
    },
    getLogTagName(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['tagName', 'riskTagName', 'name'])) || '--'
    },
    getLogTagType(row) {
      return this.getFieldByAliases(row, ['tagType', 'riskTagType', 'type'])
    },
    getLogActionType(row) {
      return this.getFieldByAliases(row, ['actionType', 'operateType', 'operationType']) || '--'
    },
    getLogDetail(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['detail', 'operateDetail', 'operationDetail', 'content', 'remark'])) || '--'
    },
    getLogOperator(row) {
      return this.normalizeText(this.getFieldByAliases(row, ['operator', 'operatorName', 'createBy', 'createName'])) || '--'
    },
    getLogCreateTime(row) {
      return this.getFieldByAliases(row, ['createTime', 'createdAt', 'operationTime', 'operateTime'])
    },
    getActionTagType(actionType) {
      if (actionType === '新增' || String(actionType).toUpperCase() === 'CREATE') return 'success'
      if (actionType === '删除' || String(actionType).toUpperCase() === 'DELETE') return 'danger'
      return 'warning'
    },
    getFieldByAliases(row, aliases) {
      if (!row || !Array.isArray(aliases)) return ''
      let value = ''
      aliases.some((key) => {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
          value = row[key]
          return true
        }
        return false
      })
      return value
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
        if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          return response.data.data
        }
        return response.data
      }
      return response || {}
    },
    cleanParams(source) {
      const result = {}
      Object.keys(source || {}).forEach((key) => {
        const value = source[key]
        if (value !== undefined && value !== null && value !== '') {
          result[key] = value
        }
      })
      return result
    },
    normalizeText(value) {
      if (value === undefined || value === null) return ''
      const text = String(value)
      if (!this.looksLikeMojibake(text)) return text
      const decoded = this.decodeUtf8Mojibake(text)
      if (!decoded || decoded === text) return text
      return this.isBetterDecodedText(text, decoded) ? decoded : text
    },
    looksLikeMojibake(text) {
      return /[\u00c0-\u00ff][\u0080-\u00ff]|[ÃÂâ][\u0080-\uffff]|[äåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/.test(text)
    },
    decodeUtf8Mojibake(text) {
      try {
        if (typeof TextDecoder === 'undefined') return text
        const decoder = new TextDecoder('utf-8')
        const bytes = []
        let result = ''
        const cp1252 = {
          0x20ac: 0x80,
          0x201a: 0x82,
          0x0192: 0x83,
          0x201e: 0x84,
          0x2026: 0x85,
          0x2020: 0x86,
          0x2021: 0x87,
          0x02c6: 0x88,
          0x2030: 0x89,
          0x0160: 0x8a,
          0x2039: 0x8b,
          0x0152: 0x8c,
          0x017d: 0x8e,
          0x2018: 0x91,
          0x2019: 0x92,
          0x201c: 0x93,
          0x201d: 0x94,
          0x2022: 0x95,
          0x2013: 0x96,
          0x2014: 0x97,
          0x02dc: 0x98,
          0x2122: 0x99,
          0x0161: 0x9a,
          0x203a: 0x9b,
          0x0153: 0x9c,
          0x017e: 0x9e,
          0x0178: 0x9f
        }
        const flushBytes = () => {
          if (!bytes.length) return
          result += decoder.decode(new Uint8Array(bytes))
          bytes.length = 0
        }
        for (let i = 0; i < text.length; i++) {
          const code = text.charCodeAt(i)
          if (code <= 0xff) {
            bytes.push(code)
          } else if (cp1252[code]) {
            bytes.push(cp1252[code])
          } else {
            flushBytes()
            result += text[i]
          }
        }
        flushBytes()
        return result
      } catch (e) {
        return text
      }
    },
    isBetterDecodedText(source, decoded) {
      const sourceCjk = this.countCjk(source)
      const decodedCjk = this.countCjk(decoded)
      if (decodedCjk > sourceCjk) return true
      return false
    },
    countCjk(text) {
      const matched = String(text || '').match(/[\u3400-\u9fff]/g)
      return matched ? matched.length : 0
    },
    countMojibakeMarkers(text) {
      const matched = String(text || '').match(/[ÃÂâäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/g)
      return matched ? matched.length : 0
    },
    formatListTime(value) {
      if (value === undefined || value === null || value === '') return '--'
      if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        const num = Number(value)
        const ms = num > 9999999999 ? num : num * 1000
        return this.parseTime(ms, '{y}-{m}-{d} {h}:{i}:{s}')
      }
      return value
    },
    formatNow() {
      return this.parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}')
    }
  }
}
</script>

<style scoped>
.risk-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 0 0 12px;
}

.risk-tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.risk-tags-header__eyebrow {
  color: #7a8aa0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.risk-tags-header__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #1f2d3d;
  font-size: 18px;
  font-weight: 700;
}

.risk-tags-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.risk-tags-tip {
  margin: 12px 16px 0;
  width: auto;
}

.risk-query {
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.risk-query .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}

.risk-query .el-form-item__label {
  padding-right: 8px;
}

.risk-query .query-item--sm .query-control {
  width: 180px;
}

.risk-query .query-item--lg .query-control {
  width: 280px;
}

.risk-query .query-actions {
  margin-left: auto;
}

.risk-query .query-actions .el-form-item__content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-name {
  color: #1f2d3d;
  font-weight: 700;
}

.danger-text {
  color: #f56c6c;
}

.dialog-tip {
  margin-bottom: 16px;
}

@media (max-width: 1200px) {
  .risk-query .query-actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .risk-tags-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .risk-tags-header__actions {
    justify-content: flex-start;
  }

  .risk-query .query-item--sm .query-control,
  .risk-query .query-item--lg .query-control {
    width: 100%;
  }
}
</style>
