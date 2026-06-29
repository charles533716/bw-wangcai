<template>
  <div class="comprehensive-config">
    <el-form ref="form" :model="form" :rules="rules" label-width="170px" v-loading="loading">
      <el-card class="box-card" shadow="never">
        <div slot="header" class="section-header">
          <span>站点综合配置</span>
          <el-button
            type="primary"
            size="small"
            :disabled="saveDisabled"
            :loading="saveLoading"
            @click="submitForm"
          >
            保存综合配置
          </el-button>
        </div>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="站点编号">
              <el-input v-model="form.siteCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="站点月费额度(CNY)" prop="monthlyRent">
              <el-input-number
                v-model="form.monthlyRent"
                :min="0"
                :precision="2"
                :step="100"
                controls-position="right"
                style="width: 100%"
                placeholder="请输入站点月费额度"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="站点名称">
              <el-input v-model="form.siteName" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="免月费利润阈值(CNY)" prop="freeMonthlyRentProfitThreshold">
              <el-input-number
                v-model="form.freeMonthlyRentProfitThreshold"
                :min="0"
                :precision="2"
                :step="100"
                controls-position="right"
                style="width: 100%"
                placeholder="请输入免月费利润阈值"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">站点分润百分比</el-divider>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="站点分润(%)" prop="siteProfitSharePercent">
              <el-input-number
                v-model="form.siteProfitSharePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="总站分润(%)" prop="headOfficeProfitSharePercent">
              <el-input-number
                v-model="form.headOfficeProfitSharePercent"
                :min="0"
                :max="100"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
            <div v-if="showShareWarning" class="share-warning">两项百分比之和必须等于100%</div>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="box-card quota-card" shadow="never">
        <div slot="header" class="clearfix">
          <span>站点额度</span>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="当前可用额度(CNY)">
              <el-input :value="formatMoney(form.currentAvailableQuota)" disabled>
                <i slot="prefix" class="el-input__icon el-icon-wallet" />
              </el-input>
            </el-form-item>
            <div v-if="isQuotaNegative" class="quota-warning">
              当前可用额度为负数，请在额度管理中充值。
            </div>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="box-card" shadow="never">
        <div slot="header" class="section-header">
          <span>返佣方案配置</span>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openCommissionDialog()">新增返佣方案</el-button>
        </div>
        <el-table :data="commissionOverrideList" border size="small" v-loading="commissionLoading">
          <el-table-column label="基础返佣方案" prop="basePlanName" min-width="180" />
          <el-table-column label="类型" width="120">
            <template slot-scope="scope">{{ formatCommissionType(scope.row.commType) }}</template>
          </el-table-column>
          <el-table-column label="专用参数" min-width="260">
            <template slot-scope="scope">
              <span v-if="!scope.row.detailList || !scope.row.detailList.length">-</span>
              <span v-else>
                <span
                  v-for="detail in scope.row.detailList"
                  :key="detail.id || detail.levelNum"
                  class="commission-detail-tag"
                >
                  {{ detail.levelNum }}级/{{ formatRate(detail.commissionRate) }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">
                {{ scope.row.status === '0' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="openCommissionDialog(scope.row)">修改</el-button>
              <el-button type="text" size="mini" class="danger-text" @click="deleteCommissionOverride(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-form>

    <el-dialog :title="commissionDialogTitle" :visible.sync="commissionDialogOpen" width="780px" append-to-body>
      <el-form ref="commissionForm" :model="commissionForm" label-width="120px">
        <el-form-item label="基础返佣方案" required>
          <el-select
            v-model="commissionForm.basePlanId"
            filterable
            :disabled="!!commissionForm.id"
            placeholder="请选择基础返佣方案"
            style="width: 100%"
            @change="handleBasePlanChange"
          >
            <el-option
              v-for="plan in commissionPlanOptions"
              :key="plan.id"
              :label="`${plan.planName}（${formatCommissionType(plan.commType)}）`"
              :value="plan.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="commissionForm.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="专用参数">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="addCommissionDetail">添加级别</el-button>
          <el-table :data="commissionForm.detailList" border size="mini" style="margin-top: 10px">
            <el-table-column label="级别/星级" width="160" align="center">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.levelNum"
                  :min="0"
                  :precision="0"
                  :step="1"
                  controls-position="right"
                  style="width: 120px"
                />
              </template>
            </el-table-column>
            <el-table-column label="返佣比例(0~1)" width="180" align="center">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.commissionRate"
                  :min="0"
                  :max="1"
                  :precision="4"
                  :step="0.0001"
                  controls-position="right"
                  style="width: 140px"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="removeCommissionDetail(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="commissionForm.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="commissionDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="commissionSaving" @click="submitCommissionOverride">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addSiteCommissionPlanOverride,
  delSiteCommissionPlanOverride,
  getSiteComprehensiveConfig,
  listSiteCommissionPlanOverrides,
  updateSiteCommissionPlanOverride,
  updateSiteComprehensiveConfig
} from '@/api/site/config'
import { listCommissionByType } from '@/api/agent/commission'

export default {
  name: 'ComprehensiveConfig',
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  data() {
    const validateNonNegativeMoney = (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error('请输入大于等于0的数'))
        return
      }
      const num = Number(value)
      if (!Number.isFinite(num) || num < 0) {
        callback(new Error('请输入大于等于0的数'))
        return
      }
      callback()
    }

    const validatePercent = (rule, value, callback) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error('请输入0~100之间的数值'))
        return
      }
      const num = Number(value)
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        callback(new Error('请输入0~100之间的数值'))
        return
      }
      callback()
    }

    return {
      loading: false,
      saveLoading: false,
      form: {
        siteCode: '',
        siteName: '',
        monthlyRent: null,
        freeMonthlyRentProfitThreshold: null,
        siteProfitSharePercent: null,
        headOfficeProfitSharePercent: null,
        currentAvailableQuota: 0
      },
      rules: {
        monthlyRent: [
          { validator: validateNonNegativeMoney, trigger: 'blur' },
          { validator: validateNonNegativeMoney, trigger: 'change' }
        ],
        freeMonthlyRentProfitThreshold: [
          { validator: validateNonNegativeMoney, trigger: 'blur' },
          { validator: validateNonNegativeMoney, trigger: 'change' }
        ],
        siteProfitSharePercent: [
          { validator: validatePercent, trigger: 'blur' },
          { validator: validatePercent, trigger: 'change' }
        ],
        headOfficeProfitSharePercent: [
          { validator: validatePercent, trigger: 'blur' },
          { validator: validatePercent, trigger: 'change' }
        ]
      },
      commissionLoading: false,
      commissionSaving: false,
      commissionOverrideList: [],
      commissionPlanOptions: [],
      commissionDialogOpen: false,
      commissionDialogTitle: '新增返佣方案',
      commissionForm: {
        id: null,
        siteCode: '',
        basePlanId: null,
        basePlanName: '',
        commType: '',
        status: '0',
        remark: '',
        detailList: []
      }
    }
  },
  computed: {
    isShareRateValid() {
      const siteRate = Number(this.form.siteProfitSharePercent)
      const headRate = Number(this.form.headOfficeProfitSharePercent)
      if (!Number.isFinite(siteRate) || !Number.isFinite(headRate)) {
        return false
      }
      if (siteRate < 0 || siteRate > 100 || headRate < 0 || headRate > 100) {
        return false
      }
      const total = Number((siteRate + headRate).toFixed(2))
      return total === 100
    },
    showShareWarning() {
      const siteRate = this.form.siteProfitSharePercent
      const headRate = this.form.headOfficeProfitSharePercent
      if (siteRate === null || siteRate === undefined || headRate === null || headRate === undefined) {
        return false
      }
      return !this.isShareRateValid
    },
    saveDisabled() {
      return this.loading || this.saveLoading || !this.isShareRateValid
    },
    isQuotaNegative() {
      return Number(this.form.currentAvailableQuota) < 0
    }
  },
  watch: {
    siteCode: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadData()
        }
      }
    }
  },
  methods: {
    toNumber(value, fallback = 0) {
      const num = Number(value)
      return Number.isFinite(num) ? num : fallback
    },
    formatMoney(value) {
      const amount = this.toNumber(value, 0)
      return `¥${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    async loadData() {
      this.loading = true
      try {
        const response = await getSiteComprehensiveConfig(this.siteCode)
        const data = (response && response.data) || {}
        this.form.siteCode = data.siteCode || this.siteCode
        this.form.siteName = data.siteName || ''
        this.form.monthlyRent = this.toNumber(data.monthlyRent, 0)
        this.form.freeMonthlyRentProfitThreshold = this.toNumber(data.freeMonthlyRentProfitThreshold, 0)
        this.form.siteProfitSharePercent = this.toNumber(data.siteProfitSharePercent, 0)
        this.form.headOfficeProfitSharePercent = this.toNumber(data.headOfficeProfitSharePercent, 0)
        this.form.currentAvailableQuota = this.toNumber(data.currentAvailableQuota, 0)
        await Promise.all([
          this.loadCommissionOverrides(),
          this.loadCommissionPlanOptions()
        ])
      } catch (error) {
        const message = error && error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : '加载综合配置失败'
        this.$modal.msgError(message)
      } finally {
        this.loading = false
      }
    },
    submitForm() {
      if (!this.isShareRateValid) {
        this.$modal.msgError('两项百分比之和必须等于100%')
        return
      }
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        this.saveLoading = true
        try {
          await updateSiteComprehensiveConfig({
            siteCode: this.form.siteCode,
            monthlyRent: this.form.monthlyRent,
            freeMonthlyRentProfitThreshold: this.form.freeMonthlyRentProfitThreshold,
            siteProfitSharePercent: this.form.siteProfitSharePercent,
            headOfficeProfitSharePercent: this.form.headOfficeProfitSharePercent
          })
          this.$modal.msgSuccess('保存成功')
          this.loadData()
        } catch (error) {
          const message = error && error.response && error.response.data && error.response.data.msg
            ? error.response.data.msg
            : (error && error.message ? error.message : '保存失败')
          this.$modal.msgError(message)
        } finally {
          this.saveLoading = false
        }
      })
    },
    formatCommissionType(commType) {
      if (commType === '3') {
        return '星级代理'
      }
      if (commType === '6') {
        return '多层级代理'
      }
      return commType || '-'
    },
    formatRate(rate) {
      const value = this.toNumber(rate, 0) * 100
      return `${value.toFixed(2)}%`
    },
    async loadCommissionPlanOptions() {
      const [starResponse, levelResponse] = await Promise.all([
        listCommissionByType('3'),
        listCommissionByType('6')
      ])
      this.commissionPlanOptions = [
        ...((starResponse && starResponse.rows) || []),
        ...((levelResponse && levelResponse.rows) || [])
      ]
    },
    async loadCommissionOverrides() {
      if (!this.siteCode) {
        this.commissionOverrideList = []
        return
      }
      this.commissionLoading = true
      try {
        const response = await listSiteCommissionPlanOverrides(this.siteCode)
        this.commissionOverrideList = ((response && response.data) || []).map(item => ({
          ...item,
          detailList: this.normalizeCommissionDetails(item.detailList)
        }))
      } finally {
        this.commissionLoading = false
      }
    },
    resetCommissionForm() {
      this.commissionForm = {
        id: null,
        siteCode: this.siteCode,
        basePlanId: null,
        basePlanName: '',
        commType: '',
        status: '0',
        remark: '',
        detailList: []
      }
    },
    openCommissionDialog(row) {
      if (!this.commissionPlanOptions.length) {
        this.loadCommissionPlanOptions()
      }
      if (row) {
        this.commissionForm = {
          id: row.id,
          siteCode: row.siteCode || this.siteCode,
          basePlanId: row.basePlanId,
          basePlanName: row.basePlanName,
          commType: row.commType,
          status: row.status || '0',
          remark: row.remark || '',
          detailList: this.normalizeCommissionDetails(row.detailList)
        }
        this.commissionDialogTitle = '修改返佣方案'
      } else {
        this.resetCommissionForm()
        this.commissionDialogTitle = '新增返佣方案'
      }
      this.commissionDialogOpen = true
    },
    handleBasePlanChange(basePlanId) {
      const plan = this.commissionPlanOptions.find(item => Number(item.id) === Number(basePlanId))
      if (!plan) {
        this.commissionForm.commType = ''
        this.commissionForm.detailList = []
        return
      }
      this.commissionForm.basePlanName = plan.planName
      this.commissionForm.commType = plan.commType
      this.commissionForm.detailList = this.normalizeCommissionDetails(plan.detailList)
    },
    normalizeCommissionDetails(detailList) {
      return (detailList || []).map((item, index) => ({
        ...item,
        levelNum: this.toNumber(item.levelNum, index + 1),
        commissionRate: this.toNumber(item.commissionRate, 0),
        sortOrder: item.sortOrder || index + 1
      })).sort((a, b) => Number(a.levelNum ?? 0) - Number(b.levelNum ?? 0))
    },
    addCommissionDetail() {
      const detailList = this.commissionForm.detailList || []
      const hasZeroLevel = detailList.some(item => Number(item && item.levelNum) === 0)
      const maxLevel = detailList.reduce((max, item) => {
        const level = Number(item && item.levelNum)
        return Number.isFinite(level) && level > max ? level : max
      }, -1)
      detailList.push({
        levelNum: hasZeroLevel ? maxLevel + 1 : 0,
        commissionRate: 0,
        sortOrder: detailList.length + 1
      })
      this.commissionForm.detailList = this.normalizeCommissionDetails(detailList)
    },
    removeCommissionDetail(index) {
      this.commissionForm.detailList.splice(index, 1)
    },
    buildCommissionPayload() {
      return {
        siteCode: this.siteCode,
        basePlanId: this.commissionForm.basePlanId,
        status: this.commissionForm.status || '0',
        remark: this.commissionForm.remark,
        detailList: this.normalizeCommissionDetails(this.commissionForm.detailList).map((item, index) => ({
          levelNum: item.levelNum,
          commissionRate: item.commissionRate,
          sortOrder: item.sortOrder || index + 1
        }))
      }
    },
    async submitCommissionOverride() {
      if (!this.commissionForm.basePlanId) {
        this.$modal.msgError('请选择基础返佣方案')
        return
      }
      this.commissionSaving = true
      try {
        const payload = this.buildCommissionPayload()
        if (this.commissionForm.id) {
          await updateSiteCommissionPlanOverride(this.commissionForm.id, payload)
        } else {
          await addSiteCommissionPlanOverride(payload)
        }
        this.$modal.msgSuccess('保存成功')
        this.commissionDialogOpen = false
        await this.loadCommissionOverrides()
      } catch (error) {
        const message = error && error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : (error && error.message ? error.message : '保存失败')
        this.$modal.msgError(message)
      } finally {
        this.commissionSaving = false
      }
    },
    deleteCommissionOverride(row) {
      this.$modal.confirm(`确认删除 ${row.basePlanName || row.basePlanId} 的站点专用返佣参数？删除后该站点将回退通用方案。`).then(async () => {
        await delSiteCommissionPlanOverride(row.id)
        this.$modal.msgSuccess('删除成功')
        this.loadCommissionOverrides()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.comprehensive-config {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.share-warning {
  color: #e6a23c;
  font-size: 12px;
  line-height: 1.2;
  margin-top: -8px;
}

.quota-card {
  margin-bottom: 20px;
}

.quota-warning {
  color: #f56c6c;
  font-size: 12px;
  margin-top: -8px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.commission-detail-tag {
  display: inline-block;
  margin: 2px 8px 2px 0;
  color: #606266;
}

.danger-text {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .comprehensive-config {
    padding: 10px;
  }
}
</style>
