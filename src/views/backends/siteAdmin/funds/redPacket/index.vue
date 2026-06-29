<template>
  <div class="red-packet-page app-container">
    <div class="red-packet-toolbar">
      <div>
        <h2>发放红包</h2>
        <p>第一期仅支持发放给指定会员，不支持口令红包和随机红包。</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openCreateDialog">发放红包</el-button>
    </div>

    <el-form :model="queryParams" class="red-packet-filter" inline>
      <el-form-item label="红包单号">
        <el-input v-model.trim="queryParams.redPacketNo" clearable placeholder="请输入红包单号" />
      </el-form-item>
      <el-form-item label="目标会员">
        <el-input v-model.trim="queryParams.targetMemberName" clearable placeholder="请输入会员账号" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" clearable placeholder="全部状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" border>
      <el-table-column label="红包单号" prop="redPacketNo" min-width="170" />
      <el-table-column label="发放方" min-width="130">
        <template slot-scope="scope">{{ senderLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="目标会员" prop="targetMemberName" min-width="130" />
      <el-table-column label="红包金额" min-width="120" align="right">
        <template slot-scope="scope">{{ formatCny(scope.row.amount) }}</template>
      </el-table-column>
      <el-table-column label="流水倍数" min-width="100">
        <template slot-scope="scope">{{ formatNumber(scope.row.turnoverMultiple) }} 倍</template>
      </el-table-column>
      <el-table-column label="状态" min-width="110">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="small">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="生效时间" min-width="170">
        <template slot-scope="scope">{{ formatDateTime(scope.row.availableTime) }}</template>
      </el-table-column>
      <el-table-column label="过期时间" min-width="170">
        <template slot-scope="scope">{{ formatDateTime(scope.row.expireTime) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170">
        <template slot-scope="scope">{{ formatDateTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="openDetail(scope.row)">详情</el-button>
          <el-button type="text" @click="openClaims(scope.row)">领取明细</el-button>
          <el-button v-if="scope.row.status === 'SCHEDULED'" type="text" @click="activate(scope.row)">立即生效</el-button>
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

    <el-dialog
      title="发放指定会员红包"
      :visible.sync="createDialog.visible"
      width="620px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="createForm" :model="createDialog.form" :rules="rules" label-width="120px">
        <el-form-item label="目标会员" prop="targetMember">
          <el-select
            v-model="createDialog.form.targetMember"
            class="member-select"
            filterable
            remote
            clearable
            reserve-keyword
            placeholder="输入会员账号或ID"
            :remote-method="remoteMemberSearch"
            :loading="createDialog.memberLoading"
          >
            <el-option
              v-for="item in createDialog.memberOptions"
              :key="item.targetId"
              :label="memberLabel(item)"
              :value="String(item.targetId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="红包金额" prop="amount">
          <el-input v-model.trim="createDialog.form.amount" placeholder="请输入红包金额">
            <template slot="append">CNY</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流水倍数" prop="turnoverMultiple">
          <el-input v-model.trim="createDialog.form.turnoverMultiple" placeholder="默认1倍">
            <template slot="append">倍</template>
          </el-input>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker
            v-model="createDialog.form.availableTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="不填则立即生效"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="createDialog.form.expireTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="不填则生效后24小时过期"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="createDialog.form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="createDialog.submitting" @click="submitCreate">确认发放</el-button>
      </div>
    </el-dialog>

    <el-dialog title="红包详情" :visible.sync="detailDialog.visible" width="680px" append-to-body>
      <el-descriptions v-loading="detailDialog.loading" :column="2" border>
        <el-descriptions-item label="红包单号">{{ detail.redPacketNo || '--' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detail.status) }}</el-descriptions-item>
        <el-descriptions-item label="发放方">{{ senderLabel(detail) }}</el-descriptions-item>
        <el-descriptions-item label="目标会员">{{ detail.targetMemberName || '--' }}</el-descriptions-item>
        <el-descriptions-item label="红包金额">{{ formatCny(detail.amount) }}</el-descriptions-item>
        <el-descriptions-item label="流水倍数">{{ formatNumber(detail.turnoverMultiple) }} 倍</el-descriptions-item>
        <el-descriptions-item label="生效时间">{{ formatDateTime(detail.availableTime) }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ formatDateTime(detail.expireTime) }}</el-descriptions-item>
        <el-descriptions-item label="领取时间">{{ formatDateTime(detail.claimedTime) }}</el-descriptions-item>
        <el-descriptions-item label="退款时间">{{ formatDateTime(detail.refundedTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark || '--' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog title="红包领取明细" :visible.sync="claimsDialog.visible" width="720px" append-to-body>
      <el-table v-loading="claimsDialog.loading" :data="claimsDialog.rows" border>
        <el-table-column label="会员" prop="memberName" min-width="130" />
        <el-table-column label="金额" min-width="120" align="right">
          <template slot-scope="scope">{{ formatCny(scope.row.amount) }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" prop="status" />
        <el-table-column label="领取时间" min-width="170">
          <template slot-scope="scope">{{ formatDateTime(scope.row.claimTime) }}</template>
        </el-table-column>
        <el-table-column label="账变ID" prop="accountRecordId" min-width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import {
  listRedPackets,
  getRedPacket,
  getRedPacketClaims,
  listRedPacketMembers,
  createRedPacket,
  activateRedPacket
} from '@/api/funds/redPacket'

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: '预约中', tag: 'info' },
  { value: 'ACTIVE', label: '可领取', tag: 'success' },
  { value: 'CLAIMED', label: '已领取', tag: '' },
  { value: 'REFUNDING', label: '退款中', tag: 'warning' },
  { value: 'REFUNDED', label: '已退回', tag: 'danger' }
]

function validateAmount(rule, value, callback) {
  const text = String(value || '').trim()
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text) || Number(text) <= 0) {
    callback(new Error('请输入大于0且最多2位小数的金额'))
    return
  }
  callback()
}

function validateTurnover(rule, value, callback) {
  const text = String(value || '').trim()
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text) || Number(text) < 0) {
    callback(new Error('请输入不小于0且最多2位小数的流水倍数'))
    return
  }
  callback()
}

export default {
  name: 'FundsRedPacket',
  data() {
    return {
      loading: false,
      rows: [],
      total: 0,
      dateRange: [],
      statusOptions: STATUS_OPTIONS,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        redPacketNo: '',
        targetMemberName: '',
        status: ''
      },
      createDialog: {
        visible: false,
        submitting: false,
        memberLoading: false,
        memberOptions: [],
        form: this.newCreateForm()
      },
      detailDialog: {
        visible: false,
        loading: false,
        row: {}
      },
      claimsDialog: {
        visible: false,
        loading: false,
        rows: []
      },
      rules: {
        targetMember: [{ required: true, message: '请选择目标会员账号或ID', trigger: 'change' }],
        amount: [{ required: true, validator: validateAmount, trigger: 'blur' }],
        turnoverMultiple: [{ required: true, validator: validateTurnover, trigger: 'blur' }]
      }
    }
  },
  computed: {
    detail() {
      return this.detailDialog.row || {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    newCreateForm() {
      return {
        targetMember: '',
        amount: '',
        turnoverMultiple: '1',
        availableTime: '',
        expireTime: '',
        remark: ''
      }
    },
    buildParams() {
      const params = { ...this.queryParams }
      if (this.dateRange && this.dateRange.length === 2) {
        params.beginTime = `${this.dateRange[0]} 00:00:00`
        params.endTime = `${this.dateRange[1]} 23:59:59`
      }
      return params
    },
    async getList() {
      this.loading = true
      try {
        const res = await listRedPackets(this.buildParams())
        this.rows = Array.isArray(res.rows) ? res.rows : []
        this.total = Number(res.total || 0)
      } finally {
        this.loading = false
      }
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
        redPacketNo: '',
        targetMemberName: '',
        status: ''
      }
      this.getList()
    },
    openCreateDialog() {
      this.createDialog.form = this.newCreateForm()
      this.createDialog.memberOptions = []
      this.createDialog.memberLoading = false
      this.createDialog.visible = true
      this.$nextTick(() => this.$refs.createForm && this.$refs.createForm.clearValidate())
    },
    async remoteMemberSearch(keyword) {
      const value = String(keyword || '').trim()
      if (!value) {
        this.createDialog.memberOptions = []
        return
      }
      this.createDialog.memberLoading = true
      try {
        const res = await listRedPacketMembers({ keyword: value })
        this.createDialog.memberOptions = Array.isArray(res.data) ? res.data : []
      } finally {
        this.createDialog.memberLoading = false
      }
    },
    memberLabel(item) {
      if (!item) return '--'
      const name = item.targetName || '-'
      const id = item.targetId ? ` / ID:${item.targetId}` : ''
      const parent = item.parentName ? ` / 代理:${item.parentName}` : ''
      return `${name}${id}${parent}`
    },
    submitCreate() {
      this.$refs.createForm.validate(async valid => {
        if (!valid || this.createDialog.submitting) return
        this.createDialog.submitting = true
        try {
          await createRedPacket({ ...this.createDialog.form })
          this.$message.success('红包发放成功')
          this.createDialog.visible = false
          this.getList()
        } finally {
          this.createDialog.submitting = false
        }
      })
    },
    async openDetail(row) {
      this.detailDialog.visible = true
      this.detailDialog.loading = true
      this.detailDialog.row = row || {}
      try {
        const res = await getRedPacket(row.id)
        this.detailDialog.row = res.data || row || {}
      } finally {
        this.detailDialog.loading = false
      }
    },
    async openClaims(row) {
      this.claimsDialog.visible = true
      this.claimsDialog.loading = true
      this.claimsDialog.rows = []
      try {
        const res = await getRedPacketClaims(row.id)
        this.claimsDialog.rows = Array.isArray(res.data) ? res.data : []
      } finally {
        this.claimsDialog.loading = false
      }
    },
    async activate(row) {
      await this.$confirm(`确认让红包 ${row.redPacketNo} 立即生效？`, '立即生效', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await activateRedPacket(row.id)
      this.$message.success('红包已生效')
      this.getList()
    },
    statusLabel(status) {
      const found = STATUS_OPTIONS.find(item => item.value === status)
      return found ? found.label : (status || '--')
    },
    statusTagType(status) {
      const found = STATUS_OPTIONS.find(item => item.value === status)
      return found ? found.tag : 'info'
    },
    senderLabel(row) {
      if (!row) return '--'
      const type = row.senderType === 'AGENT' ? '代理' : '站点'
      return `${type}${row.senderName ? `：${row.senderName}` : ''}`
    },
    formatCny(value) {
      const num = Number(value)
      if (!Number.isFinite(num)) return '0.00'
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatNumber(value) {
      const num = Number(value)
      if (!Number.isFinite(num)) return '0'
      return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    },
    formatDateTime(value) {
      return value ? parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}') : '--'
    }
  }
}
</script>

<style scoped lang="scss">
.red-packet-page {
  background: #f5f7fb;
  min-height: calc(100vh - 84px);
}

.red-packet-toolbar,
.red-packet-filter {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  margin-bottom: 14px;
}

.red-packet-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;

  h2 {
    margin: 0;
    color: #17233d;
    font-size: 20px;
  }

  p {
    margin: 6px 0 0;
    color: #7b8aa4;
  }
}

.red-packet-filter {
  padding: 18px 20px 0;
}

.member-select {
  width: 100%;
}
</style>
