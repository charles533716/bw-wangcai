<template>
  <div v-loading="loading" class="operation-expense-page app-container">
    <section class="expense-hero">
      <div class="expense-hero__content">
        <div class="expense-hero__badge">
          <i class="el-icon-money"></i>
        </div>
        <div>
          <h1 class="expense-hero__title">运营费用管理</h1>
          <p class="expense-hero__desc">设置各项运营费用的承担占比，支持按总站、站点、代理三个维度分配。</p>
        </div>
      </div>
      <div class="expense-hero__actions">
        <el-button class="hero-btn hero-btn--ghost" icon="el-icon-refresh-left" @click="handleReset">重置默认</el-button>
        <el-button
          class="hero-btn hero-btn--primary"
          type="primary"
          icon="el-icon-folder-checked"
          :loading="saving"
          :disabled="!canSave"
          v-hasPermi="['funds:operationExpense:edit']"
          @click="handleSave"
        >
          保存设置
        </el-button>
      </div>
    </section>

    <section class="rule-card">
      <div class="rule-card__icon">
        <i class="el-icon-info"></i>
      </div>
      <div class="rule-card__body">
        <div class="rule-card__title">配置说明：</div>
        <div class="rule-card__line">1. 每项费用的承担占比之和必须等于 100%。</div>
        <div class="rule-card__line">2. 总站占比：由平台总部承担的费用比例。</div>
        <div class="rule-card__line">3. 站点占比：由各站点（商户）承担的费用比例。</div>
        <div class="rule-card__line">4. 代理占比：由代理商承担的费用比例。</div>
      </div>
    </section>

    <section class="expense-grid">
      <article
        v-for="item in form.items"
        :key="item.expenseType"
        :class="['expense-card', computeTotal(item) === 100 ? '' : 'expense-card--invalid']"
      >
        <div class="expense-card__header">
          <div class="expense-card__title-wrap">
            <div class="expense-card__badge">%</div>
            <div class="expense-card__title">{{ item.expenseLabel }}</div>
          </div>
          <div :class="['expense-card__total', computeTotal(item) === 100 ? 'is-valid' : 'is-invalid']">
            合计: {{ formatPercent(computeTotal(item)) }}
          </div>
        </div>

        <div class="expense-card__body">
          <div class="expense-field">
            <div class="expense-field__label">总站占比</div>
            <div class="unit-input">
              <el-input-number
                v-model="item.hqRatio"
                :controls="false"
                :min="0"
                :precision="2"
                :step="1"
              />
              <span class="unit-input__suffix">%</span>
            </div>
          </div>

          <div class="expense-field">
            <div class="expense-field__label">站点占比</div>
            <div class="unit-input">
              <el-input-number
                v-model="item.siteRatio"
                :controls="false"
                :min="0"
                :precision="2"
                :step="1"
              />
              <span class="unit-input__suffix">%</span>
            </div>
          </div>

          <div class="expense-field">
            <div class="expense-field__label">代理占比</div>
            <div class="unit-input">
              <el-input-number
                v-model="item.agentRatio"
                :controls="false"
                :min="0"
                :precision="2"
                :step="1"
              />
              <span class="unit-input__suffix">%</span>
            </div>
          </div>
        </div>

        <div class="expense-card__bar">
          <div class="expense-card__bar-segment expense-card__bar-segment--hq" :style="{ width: `${Math.max(item.hqRatio, 0)}%` }"></div>
          <div class="expense-card__bar-segment expense-card__bar-segment--site" :style="{ width: `${Math.max(item.siteRatio, 0)}%` }"></div>
          <div class="expense-card__bar-segment expense-card__bar-segment--agent" :style="{ width: `${Math.max(item.agentRatio, 0)}%` }"></div>
        </div>

        <div class="expense-card__legend">
          <span><i class="dot dot--hq"></i>总站</span>
          <span><i class="dot dot--site"></i>站点</span>
          <span><i class="dot dot--agent"></i>代理</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import { getGlobalOperationExpenseSettings, updateGlobalOperationExpenseSettings } from '@/api/funds/operationExpense'

function createEmptyForm() {
  return {
    items: [],
    defaultItems: []
  }
}

export default {
  name: 'FundsOperationExpense',
  data() {
    return {
      loading: false,
      saving: false,
      form: createEmptyForm(),
      defaultSnapshot: []
    }
  },
  computed: {
    canSave() {
      return Array.isArray(this.form.items) && this.form.items.length > 0 && this.form.items.every((item) => this.computeTotal(item) === 100)
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      this.loading = true
      try {
        const res = await getGlobalOperationExpenseSettings()
        this.applyForm((res && res.data) || {})
      } catch (e) {
        this.applyForm(createEmptyForm())
      } finally {
        this.loading = false
      }
    },
    applyForm(data) {
      const normalizedItems = this.normalizeItems(data.items)
      const normalizedDefaults = this.normalizeItems(data.defaultItems)
      this.form = {
        items: normalizedItems,
        defaultItems: normalizedDefaults
      }
      this.defaultSnapshot = JSON.parse(JSON.stringify(normalizedDefaults))
    },
    normalizeItems(items) {
      if (!Array.isArray(items)) {
        return []
      }
      return items.map((item) => {
        const normalized = {
          expenseType: item.expenseType || '',
          expenseLabel: item.expenseLabel || item.expenseType || '',
          hqRatio: this.toNumber(item.hqRatio),
          siteRatio: this.toNumber(item.siteRatio),
          agentRatio: this.toNumber(item.agentRatio),
          sort: this.toNumber(item.sort)
        }
        return normalized
      }).sort((a, b) => a.sort - b.sort)
    },
    toNumber(value) {
      const num = Number(value)
      if (!Number.isFinite(num)) {
        return 0
      }
      return Number(num.toFixed(2))
    },
    computeTotal(item) {
      return this.toNumber(this.toNumber(item.hqRatio) + this.toNumber(item.siteRatio) + this.toNumber(item.agentRatio))
    },
    formatPercent(value) {
      return `${this.toNumber(value).toFixed(2).replace(/\.00$/, '')}%`
    },
    handleReset() {
      this.form.items = JSON.parse(JSON.stringify(this.defaultSnapshot))
      this.$message.success('已恢复默认配置')
    },
    async handleSave() {
      if (!this.canSave) {
        this.$message.error('请先确保每项费用的承担比例合计为100%')
        return
      }
      this.saving = true
      try {
        const payload = {
          items: this.form.items.map((item) => ({
            expenseType: item.expenseType,
            hqRatio: this.toNumber(item.hqRatio),
            siteRatio: this.toNumber(item.siteRatio),
            agentRatio: this.toNumber(item.agentRatio)
          }))
        }
        const res = await updateGlobalOperationExpenseSettings(payload)
        this.applyForm((res && res.data) || {})
        this.$message.success('运营费用设置已保存')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-expense-page {
  min-height: calc(100vh - 84px);
  background: linear-gradient(180deg, #f7f9fd 0%, #f3f7fb 100%);
}

.expense-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 28px 30px;
  border-radius: 26px;
  background: linear-gradient(135deg, #ffffff 0%, #f6f9ff 100%);
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.08);
}

.expense-hero__content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.expense-hero__badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 22px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.28);
}

.expense-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.expense-hero__desc {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
}

.expense-hero__actions {
  display: flex;
  gap: 12px;
}

.hero-btn {
  min-width: 128px;
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 600;
}

.hero-btn--ghost {
  color: #334155;
  border-color: #dbe4f0;
  background: #ffffff;
}

.hero-btn--primary {
  border-color: transparent;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.25);
}

.rule-card {
  margin-top: 22px;
  padding: 22px 24px;
  display: flex;
  gap: 16px;
  border-radius: 22px;
  background: linear-gradient(180deg, #eef5ff 0%, #f7fbff 100%);
  border: 1px solid #d8e7ff;
}

.rule-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.rule-card__line {
  line-height: 1.9;
  font-size: 14px;
  color: #1d4ed8;
}

.expense-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.expense-card {
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.14);
  overflow: hidden;
}

.expense-card--invalid {
  border-color: #f59e0b;
  box-shadow: 0 16px 36px rgba(245, 158, 11, 0.15);
}

.expense-card__header {
  padding: 20px 22px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f7;
}

.expense-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.expense-card__badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid #dbe5f1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 700;
}

.expense-card__title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.expense-card__total {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.expense-card__total.is-valid {
  color: #059669;
  background: #d1fae5;
}

.expense-card__total.is-invalid {
  color: #b45309;
  background: #fef3c7;
}

.expense-card__body {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.expense-field__label {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.unit-input {
  position: relative;
}

.unit-input ::v-deep .el-input-number {
  width: 100%;
}

.unit-input ::v-deep .el-input__inner {
  height: 50px;
  padding-right: 42px;
  border-radius: 14px;
  border: 1px solid #dbe5f1;
  background: #f8fbff;
  color: #0f172a;
  font-weight: 600;
}

.unit-input__suffix {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}

.expense-card__bar {
  display: flex;
  height: 8px;
  margin: 0 22px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.expense-card__bar-segment--hq {
  background: #3b82f6;
}

.expense-card__bar-segment--site {
  background: #10b981;
}

.expense-card__bar-segment--agent {
  background: #f97316;
}

.expense-card__legend {
  padding: 14px 22px 20px;
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 12px;
}

.dot {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 6px;
}

.dot--hq {
  background: #3b82f6;
}

.dot--site {
  background: #10b981;
}

.dot--agent {
  background: #f97316;
}

@media (max-width: 1280px) {
  .expense-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .expense-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .expense-card__body {
    grid-template-columns: 1fr;
  }
}
</style>
