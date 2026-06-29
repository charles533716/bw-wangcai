<template>
  <div class="settlement-cycle-page">
    <div class="site-card">
      <div class="card-title">
        <div class="title-icon">
          <i class="el-icon-menu"></i>
        </div>
        <div>
          <div class="title-main">站点选择</div>
          <div class="title-sub">当前查看：{{ currentSiteName || '-' }}</div>
        </div>
      </div>
      <div class="site-card__control">
        <el-select
          v-model="selectedSiteCode"
          class="site-select"
          filterable
          placeholder="请选择站点"
          :loading="siteLoading"
          @change="loadConfig"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.siteCode"
            :label="site.siteName"
            :value="site.siteCode"
          />
        </el-select>
        <div class="scope-status">
          <el-tag size="mini" :type="scopeTagType">{{ scopeTagText }}</el-tag>
          <span>{{ scopeDescription }}</span>
        </div>
      </div>
    </div>

    <div class="header-card">
      <div class="card-title">
        <div class="blue-icon">
          <i class="el-icon-set-up"></i>
        </div>
        <div>
          <div class="header-title">结算周期设置</div>
          <div class="title-sub">配置代理分润的自动结算周期与执行时间</div>
        </div>
      </div>
      <div class="header-actions">
        <el-button round icon="el-icon-refresh-left" :loading="saving" @click="handleReset">{{ resetButtonText }}</el-button>
        <el-button type="primary" round icon="el-icon-document-checked" :loading="saving" @click="handleSave">{{ saveButtonText }}</el-button>
      </div>
    </div>

    <div class="content-grid">
      <div class="main-panel">
        <section class="section">
          <h3><i class="el-icon-time"></i>结算周期设置</h3>
          <div class="cycle-cards">
            <div
              class="cycle-card"
              :class="{ active: form.cycleType === 'WEEKLY' }"
              @click="selectCycleType('WEEKLY')"
            >
              <div class="cycle-icon active-icon"><i class="el-icon-date"></i></div>
              <div class="cycle-name">周结算</div>
              <div class="cycle-desc">每周固定日期结算上周期佣金</div>
              <i class="el-icon-info cycle-info"></i>
            </div>
            <div
              class="cycle-card"
              :class="{ active: form.cycleType === 'MONTHLY' }"
              @click="selectCycleType('MONTHLY')"
            >
              <div class="cycle-icon"><i class="el-icon-date"></i></div>
              <div class="cycle-name">月结算</div>
              <div class="cycle-desc">每月固定日期结算上月佣金</div>
            </div>
          </div>
        </section>

        <section class="section config-box">
          <h3><span></span>结算执行配置</h3>
          <el-form ref="form" :model="form" label-position="top" class="config-form">
            <el-row :gutter="28">
              <el-col :span="12">
                <el-form-item label="结算频率">
                  <el-select
                    v-if="form.cycleType === 'WEEKLY'"
                    v-model="form.weekInterval"
                    class="full"
                  >
                    <el-option :value="1" label="每周一次（连续1周）" />
                    <el-option :value="2" label="每2周一次（连续2周）" />
                    <el-option :value="3" label="每3周一次（连续3周）" />
                  </el-select>
                  <el-input v-else value="每月一次" disabled>
                    <i slot="prefix" class="el-icon-refresh"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="form.cycleType === 'WEEKLY'">
                <el-form-item label="每周结算日">
                  <el-input value="周一" class="full" disabled>
                    <i slot="prefix" class="el-icon-date"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-else>
                <el-form-item label="每月结算日">
                  <el-input value="1日" class="full" disabled>
                    <i slot="prefix" class="el-icon-date"></i>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="执行具体时间">
                  <el-time-picker
                    v-model="form.executeTime"
                    class="full"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="请选择执行时间"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </section>

        <section class="section config-box advance-config">
          <h3><span></span>佣金预支配置</h3>
          <el-alert
            title="佣金预支配置用于设置代理在佣金正式发放前可提前领取的额度和次数，帮助运营控制代理资金周转风险。"
            type="info"
            :closable="false"
            show-icon
          />
          <el-form :model="advanceConfig" label-position="top" class="config-form">
            <el-row :gutter="28">
              <el-col :span="8">
                <el-form-item label="佣金预支模式">
                  <el-switch
                    v-model="advanceConfig.enabled"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最高可预支比例">
                  <el-input-number
                    v-model="advanceConfig.maxRatio"
                    :min="0"
                    :max="100"
                    :precision="0"
                    controls-position="right"
                    class="full"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="每周期可预支次数">
                  <el-input-number
                    v-model="advanceConfig.maxClaimsPerCycle"
                    :min="0"
                    :max="20"
                    :step-strictly="true"
                    controls-position="right"
                    class="full"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最低盈利门槛">
                  <el-input-number
                    v-model="advanceConfig.minProfitAmount"
                    :min="0"
                    :precision="2"
                    :step="500"
                    controls-position="right"
                    class="full"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最低剩余佣金额度">
                  <el-input-number
                    v-model="advanceConfig.minRemainingCommission"
                    :min="0"
                    :precision="2"
                    :step="500"
                    controls-position="right"
                    class="full"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="advance-rule">
            当前规则将在演示流程中立即生效；代理后台会按此规则展示可预支金额、剩余次数和不可领取原因。
          </div>

          <div v-if="!isGlobalConfig" class="agent-override">
            <div class="agent-override__head">
              <div>
                <strong>单独代理配置</strong>
                <p>可为重点代理单独设置预支比例、次数和领取门槛；单独配置优先于当前站点统一规则。</p>
              </div>
              <el-button type="primary" plain icon="el-icon-plus" @click="openAgentConfig()">新增代理配置</el-button>
            </div>
            <el-table :data="agentAdvanceConfigs" border size="small" empty-text="暂无单独代理配置">
              <el-table-column label="代理账号" prop="agentCode" min-width="110" />
              <el-table-column label="代理名称" prop="agentName" min-width="120" show-overflow-tooltip />
              <el-table-column label="预支模式" min-width="90" align="center">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="scope.row.enabled ? 'success' : 'info'">
                    {{ scope.row.enabled ? '开启' : '关闭' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="最高比例" min-width="90" align="center">
                <template slot-scope="scope">{{ scope.row.maxRatio }}%</template>
              </el-table-column>
              <el-table-column label="每周期次数" prop="maxClaimsPerCycle" min-width="100" align="center" />
              <el-table-column label="最低盈利" min-width="110" align="right">
                <template slot-scope="scope">{{ money(scope.row.minProfitAmount) }}</template>
              </el-table-column>
              <el-table-column label="最低剩余佣金" min-width="120" align="right">
                <template slot-scope="scope">{{ money(scope.row.minRemainingCommission) }}</template>
              </el-table-column>
              <el-table-column label="更新时间" prop="updatedAt" min-width="160" />
              <el-table-column label="操作" width="130" fixed="right" align="center">
                <template slot-scope="scope">
                  <el-button type="text" size="mini" @click="openAgentConfig(scope.row)">修改</el-button>
                  <el-button type="text" size="mini" class="danger-text" @click="handleDeleteAgentConfig(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>

        <div v-if="pendingConfig" class="pending-tip">
          <i class="el-icon-warning-outline"></i>
          该设置将在当前周期执行完成后生效
        </div>

        <section class="section history-section">
          <h3><i class="el-icon-refresh-left"></i>历史更改</h3>
          <div v-if="history.length" class="history-list">
            <div v-for="item in history" :key="item.id" class="history-item">
              <div>
                <strong>{{ formatTime(item.changeTime) }}</strong>
                <span>{{ item.changeSummary }}</span>
              </div>
              <em>{{ item.operator || '-' }}</em>
            </div>
          </div>
          <el-empty v-else description="暂无更改记录" :image-size="80" />
        </section>
      </div>

      <aside class="notice-panel">
        <div class="notice-title">
          <span><i class="el-icon-question"></i></span>
          分润结算须知
        </div>
        <ul>
          <li>返佣结算采用实时计算。</li>
          <li>结算周期定义了系统自动生成佣金账单的时间点。</li>
          <li>保存设置后的周期会在本次周期执行完后开始生效。</li>
        </ul>
        <div class="notice-divider"></div>
        <div class="notice-info">
          <label>当前周期：</label>
          <strong>{{ activeLabel }}</strong>
          <small>{{ activeFrequency }}</small>
        </div>
        <div class="notice-info next">
          <label>下一次执行：</label>
          <strong>{{ nextExecuteText }}</strong>
        </div>
      </aside>
    </div>
    <el-dialog
      :title="editingAgentCode ? '修改单独代理配置' : '新增单独代理配置'"
      :visible.sync="agentConfigOpen"
      width="680px"
      append-to-body
    >
      <el-form :model="agentConfigForm" label-width="132px" class="agent-config-form">
        <el-form-item label="代理账号">
          <el-select
            v-model="agentConfigForm.agentCode"
            filterable
            :disabled="!!editingAgentCode"
            placeholder="请选择代理"
            class="full"
          >
            <el-option
              v-for="item in availableAgentOptions"
              :key="item.agentCode"
              :label="item.agentCode + ' / ' + item.agentName"
              :value="item.agentCode"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="佣金预支模式">
              <el-switch v-model="agentConfigForm.enabled" active-text="开启" inactive-text="关闭" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高可预支比例">
              <el-input-number
                v-model="agentConfigForm.maxRatio"
                :min="0"
                :max="100"
                :precision="0"
                controls-position="right"
                class="full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="每周期可预支次数">
              <el-input-number
                v-model="agentConfigForm.maxClaimsPerCycle"
                :min="0"
                :max="20"
                controls-position="right"
                class="full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低盈利门槛">
              <el-input-number
                v-model="agentConfigForm.minProfitAmount"
                :min="0"
                :precision="2"
                :step="500"
                controls-position="right"
                class="full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低剩余佣金">
              <el-input-number
                v-model="agentConfigForm.minRemainingCommission"
                :min="0"
                :precision="2"
                :step="500"
                controls-position="right"
                class="full"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明">
          <el-input
            v-model="agentConfigForm.remark"
            type="textarea"
            :rows="3"
            placeholder="用于记录该代理单独配置原因，便于运营评审"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="agentConfigOpen = false">取消</el-button>
        <el-button type="primary" @click="submitAgentConfig">保存配置</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listCycleSites, getCycleConfig } from '@/api/agent/settlementCycle'
import {
  deleteAdvanceAgentConfig,
  formatMoney,
  getAdvanceAgentConfigList,
  getAdvanceAgentOptions,
  getAdvanceConfig,
  getAdvanceHistory,
  resetAdvanceConfig,
  saveAdvanceAgentConfig,
  saveAdvanceConfig
} from '@/utils/agentAdvance'
import {
  buildCycleLabels,
  getCycleScopeHistory,
  getCycleScopeState,
  GLOBAL_SITE_CODE,
  GLOBAL_SITE_NAME,
  isGlobalSite,
  resetCycleScopeConfig,
  saveCycleScopeConfig,
  withGlobalSiteOption
} from '@/utils/settlementCycleScope'

export default {
  name: 'SettlementCycle',
  data() {
    return {
      siteLoading: false,
      loading: false,
      saving: false,
      selectedSiteCode: '',
      currentSiteName: '',
      rawSiteOptions: [],
      siteOptions: [],
      cycleScopeMode: 'global',
      pendingConfig: null,
      history: [],
      agentAdvanceConfigs: [],
      agentOptions: getAdvanceAgentOptions(),
      agentConfigOpen: false,
      editingAgentCode: '',
      activeLabel: '-',
      activeFrequency: '-',
      nextExecuteText: '-',
      form: {
        cycleType: 'WEEKLY',
        weekInterval: 1,
        weeklySettleDay: 1,
        monthlySettleDay: 1,
        executeTime: '02:00'
      },
      advanceConfig: {
        enabled: true,
        maxRatio: 50,
        maxClaimsPerCycle: 2,
        minProfitAmount: 5000,
        minRemainingCommission: 1000
      },
      agentConfigForm: {
        agentCode: '',
        enabled: true,
        maxRatio: 50,
        maxClaimsPerCycle: 2,
        minProfitAmount: 5000,
        minRemainingCommission: 1000,
        remark: ''
      }
    }
  },
  computed: {
    isGlobalConfig() {
      return isGlobalSite(this.selectedSiteCode)
    },
    availableAgentOptions() {
      if (this.isGlobalConfig) return []
      return this.agentOptions.filter(item => item.siteCode === this.selectedSiteCode)
    },
    scopeTagText() {
      if (this.isGlobalConfig) return '全局默认规则'
      return this.cycleScopeMode === 'site' ? '单站配置' : '继承全局配置'
    },
    scopeTagType() {
      if (this.isGlobalConfig) return 'success'
      return this.cycleScopeMode === 'site' ? 'warning' : 'info'
    },
    scopeDescription() {
      if (this.isGlobalConfig) {
        return '全局配置适配所有未单独配置的站点。'
      }
      if (this.cycleScopeMode === 'site') {
        return '当前站点使用单站配置，优先于全局配置。'
      }
      return '当前站点未单独配置，正在继承全局配置。'
    },
    saveButtonText() {
      return this.isGlobalConfig ? '保存全局配置' : '保存为单站配置'
    },
    resetButtonText() {
      return this.isGlobalConfig ? '恢复默认' : '恢复全局配置'
    }
  },
  created() {
    this.loadSites()
  },
  methods: {
    loadSites() {
      this.siteLoading = true
      listCycleSites().then(res => {
        this.rawSiteOptions = res.data || []
        this.siteOptions = withGlobalSiteOption(this.rawSiteOptions)
        if (!this.selectedSiteCode && this.siteOptions.length) {
          this.selectedSiteCode = GLOBAL_SITE_CODE
          this.loadConfig(this.selectedSiteCode)
        }
      }).finally(() => {
        this.siteLoading = false
      })
    },
    loadConfig(siteCode) {
      if (!siteCode) return
      this.loading = true
      if (isGlobalSite(siteCode)) {
        this.applyScopedConfig(siteCode, { siteName: GLOBAL_SITE_NAME, history: [] })
        this.loading = false
        return
      }
      getCycleConfig(siteCode).then(res => {
        const data = res.data || {}
        this.applyScopedConfig(siteCode, data)
      }).finally(() => {
        this.loading = false
      })
    },
    applyScopedConfig(siteCode, data = {}) {
      const state = getCycleScopeState(siteCode)
      const labels = buildCycleLabels(state.config)
      this.cycleScopeMode = state.mode
      this.currentSiteName = isGlobalSite(siteCode) ? GLOBAL_SITE_NAME : data.siteName || this.findSiteName(siteCode)
      this.pendingConfig = isGlobalSite(siteCode) ? null : data.pendingConfig
      this.activeLabel = labels.activeLabel
      this.activeFrequency = labels.activeFrequency
      this.nextExecuteText = labels.nextExecuteText
      this.applyForm(state.config)
      this.advanceConfig = getAdvanceConfig(siteCode)
      this.refreshAgentConfigs()
      this.history = getCycleScopeHistory(siteCode).concat(getAdvanceHistory(siteCode), data.history || [])
    },
    applyForm(config) {
      this.form = {
        cycleType: config.cycleType || 'WEEKLY',
        weekInterval: config.weekInterval || 1,
        weeklySettleDay: 1,
        monthlySettleDay: 1,
        executeTime: config.executeTime || '02:00'
      }
    },
    selectCycleType(type) {
      this.form.cycleType = type
      this.form.weeklySettleDay = 1
      this.form.monthlySettleDay = 1
      if (type === 'MONTHLY') {
        this.form.weekInterval = 1
      }
    },
    buildPayload() {
      return {
        siteCode: this.selectedSiteCode,
        cycleType: this.form.cycleType,
        weekInterval: this.form.cycleType === 'WEEKLY' ? this.form.weekInterval : 1,
        weeklySettleDay: 1,
        monthlySettleDay: 1,
        executeTime: this.form.executeTime
      }
    },
    handleSave() {
      if (!this.selectedSiteCode) {
        this.$message.warning('请先选择站点')
        return
      }
      this.saving = true
      Promise.resolve().then(() => {
        saveCycleScopeConfig(this.selectedSiteCode, this.buildPayload(), this.currentSiteName)
        saveAdvanceConfig(this.selectedSiteCode, this.advanceConfig)
        this.$message.success(this.isGlobalConfig ? '全局配置已保存，未单独配置的站点将继承该规则' : '单站配置已保存，将优先于全局配置生效')
        this.loadConfig(this.selectedSiteCode)
      }).finally(() => {
        this.saving = false
      })
    },
    handleReset() {
      if (!this.selectedSiteCode) {
        this.$message.warning('请先选择站点')
        return
      }
      const message = this.isGlobalConfig
        ? '确认将全局配置恢复为系统默认吗？未单独配置的站点会同步继承默认规则。'
        : `确认将 ${this.currentSiteName} 恢复为继承全局配置吗？该操作不会删除单独代理配置。`
      this.$confirm(message, '提示', {
        type: 'warning'
      }).then(() => {
        this.saving = true
        resetAdvanceConfig(this.selectedSiteCode)
        resetCycleScopeConfig(this.selectedSiteCode, this.currentSiteName)
      }).then(() => {
        this.$message.success(this.isGlobalConfig ? '已恢复系统默认配置' : '已恢复继承全局配置')
        this.loadConfig(this.selectedSiteCode)
      }).catch(() => {
        this.saving = false
      }).finally(() => {
        this.saving = false
      })
    },
    refreshAgentConfigs() {
      if (this.isGlobalConfig) {
        this.agentAdvanceConfigs = []
        return
      }
      this.agentAdvanceConfigs = getAdvanceAgentConfigList(this.selectedSiteCode)
    },
    openAgentConfig(row) {
      if (!this.selectedSiteCode || this.isGlobalConfig) {
        this.$message.warning('请先选择具体站点后维护单独代理配置')
        return
      }
      const base = row || getAdvanceConfig(this.selectedSiteCode)
      this.editingAgentCode = row ? row.agentCode : ''
      this.agentConfigForm = {
        agentCode: row ? row.agentCode : '',
        enabled: base.enabled !== false,
        maxRatio: Number(base.maxRatio || 0),
        maxClaimsPerCycle: Number(base.maxClaimsPerCycle || 0),
        minProfitAmount: Number(base.minProfitAmount || 0),
        minRemainingCommission: Number(base.minRemainingCommission || 0),
        remark: base.remark || ''
      }
      this.agentConfigOpen = true
    },
    submitAgentConfig() {
      if (!this.agentConfigForm.agentCode) {
        this.$message.warning('请选择代理账号')
        return
      }
      saveAdvanceAgentConfig(this.selectedSiteCode, this.agentConfigForm)
      this.refreshAgentConfigs()
      this.history = getAdvanceHistory(this.selectedSiteCode).concat(this.history)
      this.agentConfigOpen = false
      this.$message.success('单独代理配置已保存')
    },
    handleDeleteAgentConfig(row) {
      this.$confirm(`确认删除代理 ${row.agentCode} 的单独预支配置吗？删除后将恢复使用站点统一规则。`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteAdvanceAgentConfig(row.siteCode, row.agentCode)
        this.refreshAgentConfigs()
        this.history = getAdvanceHistory(this.selectedSiteCode).concat(this.history)
        this.$message.success('已删除单独代理配置')
      }).catch(() => {})
    },
    findSiteName(siteCode) {
      const site = this.rawSiteOptions.find(item => item.siteCode === siteCode)
      return site ? site.siteName : siteCode
    },
    formatTime(value) {
      if (!value) return '-'
      return String(value).replace('T', ' ').slice(0, 19)
    },
    money(value) {
      return formatMoney(value)
    }
  }
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
