<template>
  <div class="security-config">
    <section class="security-panel">
      <header class="security-panel__header">
        <div>
          <h3>实名信息唯一绑定设置</h3>
          <p>控制当前站点内实名及收款信息的唯一归属规则</p>
        </div>
        <el-button type="primary" size="small" @click="saveSettings">保存安全设置</el-button>
      </header>

      <div class="security-note">
        <span class="security-note__label">统一说明</span>
        <span>开启后，同一实名信息在当前站点内只能归属一个用户。用户解绑、删除收款方式或注销账号后，历史归属关系仍保留，不允许其他用户绑定。</span>
      </div>

      <el-table :data="settingRows" border class="security-table">
        <el-table-column label="配置项" min-width="170">
          <template slot-scope="scope">
            <span class="setting-name">{{ scope.row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="170">
          <template slot-scope="scope">
            <el-switch
              v-model="form[scope.row.key]"
              active-text="开启"
              inactive-text="关闭"
            />
          </template>
        </el-table-column>
        <el-table-column label="规则" min-width="290" prop="rule" />
        <el-table-column label="示例" min-width="370">
          <template slot-scope="scope">
            <span
              class="setting-example"
              :class="{ 'setting-example--disabled': !form[scope.row.key] }"
            >
              {{ getExample(scope.row) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
const SETTING_ROWS = [
  {
    key: 'mobileUnique',
    label: '手机号唯一绑定',
    exampleSubject: '手机号 138****8888',
    rule: '同一站点内，一个手机号只能归属一个用户'
  },
  {
    key: 'bankCardUnique',
    label: '银行卡唯一绑定',
    exampleSubject: '银行卡 6222 **** **** 8888',
    rule: '同一站点内，一张银行卡只能归属一个用户'
  },
  {
    key: 'alipayUnique',
    label: '支付宝唯一绑定',
    exampleSubject: '支付宝账号 zhang***@example.com',
    rule: '同一站点内，一个支付宝账号只能归属一个用户'
  },
  {
    key: 'wechatUnique',
    label: '微信唯一绑定',
    exampleSubject: '微信号 wx_demo_001',
    rule: '同一站点内，一个微信账号只能归属一个用户'
  }
]

const DEFAULT_SETTINGS = {
  mobileUnique: true,
  bankCardUnique: true,
  alipayUnique: true,
  wechatUnique: true
}

const createDefaultForm = () => ({ ...DEFAULT_SETTINGS })

export default {
  name: 'SecuritySettings',
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      settingRows: SETTING_ROWS,
      form: createDefaultForm()
    }
  },
  computed: {
    storageKey() {
      return `master-admin-prototype:site-security-settings:${this.siteCode}`
    }
  },
  created() {
    this.loadSettings()
  },
  methods: {
    getExample(row) {
      const bindingResult = this.form[row.key]
        ? '不可再绑定当前站点的其他用户'
        : '仍可绑定当前站点的其他用户'
      return `${row.exampleSubject} 已绑定站点A的用户001；${bindingResult}；可绑定站点B的用户。`
    },
    loadSettings() {
      const saved = window.localStorage.getItem(this.storageKey)
      if (!saved) return

      try {
        const parsed = JSON.parse(saved)
        SETTING_ROWS.forEach(item => {
          if (typeof parsed[item.key] === 'boolean') {
            this.form[item.key] = parsed[item.key]
          }
        })
      } catch (error) {
        window.localStorage.removeItem(this.storageKey)
      }
    },
    saveSettings() {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.form))
      this.$message.success('安全设置保存成功')
    }
  }
}
</script>

<style scoped>
.security-config {
  padding: 20px 20px 4px;
}

.security-panel {
  overflow: hidden;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.security-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 66px;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.security-panel__header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.security-panel__header p {
  margin: 7px 0 0;
  color: #909399;
  font-size: 13px;
}

.security-note {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px;
  padding: 13px 16px;
  border-left: 3px solid #409eff;
  background: #f4f8ff;
  color: #606266;
  font-size: 14px;
  line-height: 22px;
}

.security-note__label {
  flex: 0 0 auto;
  color: #303133;
  font-weight: 600;
}

.security-table {
  width: calc(100% - 32px);
  margin: 0 16px 16px;
}

.setting-name {
  color: #303133;
  font-weight: 500;
}

.setting-example {
  color: #606266;
  line-height: 20px;
}

.setting-example--disabled {
  color: #909399;
}

@media (max-width: 900px) {
  .security-config {
    padding: 12px 0 0;
  }

  .security-panel__header {
    align-items: flex-start;
    gap: 16px;
  }

  .security-note {
    display: block;
  }

  .security-note__label {
    display: block;
    margin-bottom: 4px;
  }
}
</style>
