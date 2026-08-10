<template>
  <div class="agent-portal">
    <div class="agent-portal__orb agent-portal__orb--left"></div>
    <div class="agent-portal__orb agent-portal__orb--right"></div>

    <header class="agent-portal__header">
      <div class="agent-brand">
        <div class="agent-brand__logo">旺</div>
        <div>
          <div class="agent-brand__name">旺财体育</div>
          <div class="agent-brand__desc">代理合作中心</div>
        </div>
      </div>
    </header>

    <main class="agent-portal__main">
      <section class="agent-portal__hero">
        <div class="agent-portal__eyebrow">WANGCAI SPORTS PARTNER</div>
        <h1>
          从旺财开始
          <span>成为更懂体育的推广伙伴</span>
        </h1>
        <p>加入旺财体育代理合作计划，获取专业运营支持、推广资源与实时数据能力。</p>
        <div class="agent-portal__features">
          <div v-for="item in features" :key="item.title" class="agent-feature">
            <span>{{ item.icon }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <em>{{ item.desc }}</em>
            </div>
          </div>
        </div>
      </section>

      <section class="agent-card">
        <div class="agent-card__tabs">
          <button :class="{ active: mode === 'login' }" type="button" @click="switchMode('login')">登录</button>
          <button :class="{ active: mode === 'register' }" type="button" @click="switchMode('register')">注册</button>
        </div>

        <div class="agent-card__title">
          <h2>{{ mode === 'login' ? '代理登录' : '代理注册' }}</h2>
          <span v-if="mode === 'login'">还没有账号？<a @click="switchMode('register')">立即注册</a></span>
          <span v-else>已有账号？<a @click="switchMode('login')">返回登录</a></span>
        </div>

        <el-form
          v-if="mode === 'login'"
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="agent-form"
          label-position="top"
          @submit.native.prevent
        >
          <el-form-item prop="username">
            <el-input v-model.trim="loginForm.username" placeholder="用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showLoginPassword ? 'text' : 'password'"
              placeholder="密码"
              autocomplete="current-password"
              @keyup.enter.native="handleLogin"
            >
              <i
                slot="suffix"
                :class="showLoginPassword ? 'el-icon-view' : 'el-icon-lock'"
                class="agent-form__eye"
                @click="showLoginPassword = !showLoginPassword"
              ></i>
            </el-input>
          </el-form-item>
          <el-form-item prop="captcha">
            <div class="agent-captcha-row">
              <el-input v-model.trim="loginForm.captcha" placeholder="图形验证码" @keyup.enter.native="handleLogin" />
              <button type="button" class="agent-captcha" @click="refreshCaptcha('login')">{{ loginCaptcha }}</button>
            </div>
          </el-form-item>
          <div class="agent-form__tools">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <a @click="handleForgot">忘记密码</a>
          </div>
          <el-button class="agent-submit" type="primary" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form>

        <el-form
          v-else
          ref="registerForm"
          :model="registerForm"
          :rules="registerRules"
          class="agent-form"
          label-position="top"
          @submit.native.prevent
        >
          <el-form-item prop="username">
            <el-input v-model.trim="registerForm.username" placeholder="用户名" autocomplete="username" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="密码"
              autocomplete="new-password"
            >
              <i
                slot="suffix"
                :class="showRegisterPassword ? 'el-icon-view' : 'el-icon-lock'"
                class="agent-form__eye"
                @click="showRegisterPassword = !showRegisterPassword"
              ></i>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              :type="showRegisterPassword ? 'text' : 'password'"
              placeholder="确认密码"
              autocomplete="new-password"
              @keyup.enter.native="handleRegister"
            />
          </el-form-item>
          <el-form-item prop="captcha">
            <div class="agent-captcha-row">
              <el-input v-model.trim="registerForm.captcha" placeholder="图形验证码" @keyup.enter.native="handleRegister" />
              <button type="button" class="agent-captcha" @click="refreshCaptcha('register')">{{ registerCaptcha }}</button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-input v-model.trim="registerForm.inviteCode" placeholder="邀请码（非必填）" />
          </el-form-item>
          <el-button class="agent-submit" type="primary" @click="handleRegister">注册</el-button>
        </el-form>
      </section>
    </main>

    <footer class="agent-portal__footer">
      <div v-for="item in serviceCards" :key="item.title" class="agent-service-card">
        <strong>{{ item.title }}</strong>
        <span>{{ item.desc }}</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { setToken } from '@/utils/auth'
import { DEFAULT_AGENT_CODE, DEFAULT_SITE_CODE, resolvePrototypePath, setBackendContext } from '@/utils/prototypeBackend'

const ACCOUNT_KEY = 'wc-agent-login:accounts'
const REMEMBER_KEY = 'wc-agent-login:remember'
const DEMO_ACCOUNT = { username: 'agent', password: '123456' }

function readAccounts() {
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNT_KEY)) || []
  } catch (e) {
    return []
  }
}

function writeAccounts(accounts) {
  window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts))
}

function createCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default {
  name: 'AgentPortalLogin',
  data() {
    const confirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    }
    const loginCaptcha = (rule, value, callback) => {
      if (String(value || '').toUpperCase() !== this.loginCaptcha) {
        callback(new Error('验证码不正确'))
        return
      }
      callback()
    }
    const registerCaptcha = (rule, value, callback) => {
      if (String(value || '').toUpperCase() !== this.registerCaptcha) {
        callback(new Error('验证码不正确'))
        return
      }
      callback()
    }
    return {
      mode: 'login',
      loading: false,
      showLoginPassword: false,
      showRegisterPassword: false,
      loginCaptcha: createCaptcha(),
      registerCaptcha: createCaptcha(),
      loginForm: {
        username: DEMO_ACCOUNT.username,
        password: DEMO_ACCOUNT.password,
        captcha: '',
        remember: false
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        inviteCode: ''
      },
      loginRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }, { validator: loginCaptcha, trigger: 'blur' }]
      },
      registerRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPassword: [{ required: true, message: '请再次输入密码', trigger: 'blur' }, { validator: confirmPassword, trigger: 'blur' }],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }, { validator: registerCaptcha, trigger: 'blur' }]
      },
      features: [
        { icon: '📊', title: '经营数据', desc: '佣金、会员、投注概览一屏查看' },
        { icon: '⚡', title: '快速进入', desc: '登录后直达代理管理后台' },
        { icon: '🛡', title: '安全保障', desc: '多重校验守护账号安全' }
      ],
      serviceCards: [
        { title: '专属运营支持', desc: '素材、活动、数据支持' },
        { title: '多渠道推广', desc: '支持 Web / H5 代理来源' },
        { title: '实时数据看板', desc: '复用后台已有统计能力' },
        { title: '24小时响应', desc: '异常问题快速协同' }
      ]
    }
  },
  created() {
    this.loadRemembered()
  },
  methods: {
    switchMode(mode) {
      this.mode = mode
      this.$nextTick(() => {
        if (mode === 'login' && this.$refs.loginForm) this.$refs.loginForm.clearValidate()
        if (mode === 'register' && this.$refs.registerForm) this.$refs.registerForm.clearValidate()
      })
    },
    loadRemembered() {
      try {
        const remembered = JSON.parse(window.localStorage.getItem(REMEMBER_KEY))
        if (remembered && remembered.username) {
          this.loginForm.username = remembered.username
          this.loginForm.password = remembered.password || ''
          this.loginForm.remember = true
        }
      } catch (e) {}
    },
    refreshCaptcha(type) {
      if (type === 'register') {
        this.registerCaptcha = createCaptcha()
        this.registerForm.captcha = ''
        return
      }
      this.loginCaptcha = createCaptcha()
      this.loginForm.captcha = ''
    },
    handleForgot() {
      this.$message({
        message: '请联系在线客服重置密码',
        type: 'warning',
        center: true,
        customClass: 'agent-forgot-message',
        duration: 2500
      })
    },
    getAllAccounts() {
      return [DEMO_ACCOUNT, ...readAccounts()]
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid || this.loading) return
        const matched = this.getAllAccounts().find(item => item.username === this.loginForm.username && item.password === this.loginForm.password)
        if (!matched) {
          this.$message.error('用户名或密码错误')
          this.refreshCaptcha('login')
          return
        }
        this.loading = true
        if (this.loginForm.remember) {
          window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({
            username: this.loginForm.username,
            password: this.loginForm.password
          }))
        } else {
          window.localStorage.removeItem(REMEMBER_KEY)
        }
        setBackendContext('agent', { siteCode: DEFAULT_SITE_CODE, agentCode: DEFAULT_AGENT_CODE })
        setToken(`agent-demo-token-${Date.now()}`)
        setTimeout(() => {
          window.location.href = resolvePrototypePath('/index?role=agent')
        }, 450)
      })
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return
        const accounts = readAccounts()
        if (this.getAllAccounts().some(item => item.username === this.registerForm.username)) {
          this.$message.error('用户名已存在')
          this.refreshCaptcha('register')
          return
        }
        accounts.push({
          username: this.registerForm.username,
          password: this.registerForm.password,
          inviteCode: this.registerForm.inviteCode
        })
        writeAccounts(accounts)
        const username = this.registerForm.username
        this.$message.success('注册成功')
        this.registerForm = { username: '', password: '', confirmPassword: '', captcha: '', inviteCode: '' }
        this.loginForm.username = username
        this.loginForm.password = ''
        this.refreshCaptcha('login')
        this.refreshCaptcha('register')
        this.switchMode('login')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-portal {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 34px 7vw 44px;
  color: #07385f;
  background:
    radial-gradient(circle at 16% 15%, rgba(103, 205, 255, 0.32), transparent 28%),
    radial-gradient(circle at 78% 58%, rgba(64, 158, 255, 0.22), transparent 30%),
    linear-gradient(135deg, #f8fdff 0%, #eaf8ff 45%, #f7fbff 100%);
}

.agent-portal__orb {
  position: absolute;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: rgba(61, 170, 255, 0.12);
  filter: blur(4px);
}

.agent-portal__orb--left {
  left: -120px;
  bottom: 80px;
}

.agent-portal__orb--right {
  right: 9vw;
  top: 130px;
  width: 520px;
  height: 520px;
  background: rgba(110, 190, 255, 0.15);
}

.agent-portal__header,
.agent-portal__main,
.agent-portal__footer {
  position: relative;
  z-index: 1;
}

.agent-portal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.agent-brand__logo {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30px;
  font-weight: 900;
  background: linear-gradient(135deg, #0a88ff, #5dd7ff);
  box-shadow: 0 14px 28px rgba(32, 150, 242, 0.28);
}

.agent-brand__name {
  font-size: 25px;
  font-weight: 900;
  letter-spacing: 1px;
}

.agent-brand__desc {
  margin-top: 3px;
  color: #5b7890;
  font-size: 13px;
  letter-spacing: 4px;
}

.agent-card__tabs button {
  border: 0;
  cursor: pointer;
  color: #058be8;
  background: transparent;
}

.agent-portal__main {
  display: grid;
  grid-template-columns: minmax(480px, 1fr) 490px;
  gap: 80px;
  align-items: center;
  max-width: 1280px;
  min-height: calc(100vh - 260px);
  margin: 0 auto;
}

.agent-portal__eyebrow {
  margin-bottom: 18px;
  color: #3197f1;
  font-weight: 800;
  letter-spacing: 4px;
}

.agent-portal__hero h1 {
  margin: 0;
  font-size: 64px;
  line-height: 1.14;
  color: #0498f3;
  letter-spacing: -1px;
}

.agent-portal__hero h1 span {
  display: block;
  margin-top: 18px;
  color: #04395f;
  font-size: 38px;
}

.agent-portal__hero p {
  max-width: 560px;
  margin: 24px 0 0;
  color: #5f7488;
  font-size: 16px;
  line-height: 1.8;
}

.agent-portal__features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 650px;
  margin-top: 72px;
}

.agent-feature {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 34px rgba(47, 122, 183, 0.12);
}

.agent-feature span {
  font-size: 26px;
}

.agent-feature strong,
.agent-feature em {
  display: block;
}

.agent-feature strong {
  margin-top: 8px;
  color: #07385f;
  font-size: 15px;
}

.agent-feature em {
  margin-top: 5px;
  color: #7c91a5;
  font-style: normal;
  font-size: 12px;
  line-height: 1.5;
}

.agent-card {
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 24px 70px rgba(37, 136, 210, 0.2);
  backdrop-filter: blur(16px);
}

.agent-card__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 58px;
  background: linear-gradient(90deg, #fff 0%, #d2f0ff 100%);
}

.agent-card__tabs button {
  font-size: 18px;
  font-weight: 800;
}

.agent-card__tabs button.active {
  color: #fff;
  background: linear-gradient(135deg, #075f94, #1ba8ef);
  border-bottom-right-radius: 28px;
}

.agent-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 30px 12px;
}

.agent-card__title h2 {
  margin: 0;
  color: #16283a;
  font-size: 22px;
}

.agent-card__title span {
  color: #7a91a7;
}

.agent-card__title a,
.agent-form__tools a {
  cursor: pointer;
  color: #168ff0;
}

.agent-form {
  padding: 0 30px 34px;
}

.agent-form ::v-deep .el-input__inner {
  height: 56px;
  border: 1px solid #cfe0ec;
  border-radius: 13px;
  background: #eef8fd;
  color: #16384f;
  font-size: 16px;
}

.agent-form__eye {
  line-height: 56px;
  cursor: pointer;
  color: #6b879c;
}

.agent-captcha-row {
  display: grid;
  grid-template-columns: 1fr 118px;
  gap: 10px;
}

.agent-captcha {
  height: 56px;
  border: 1px solid #b8d8ea;
  border-radius: 13px;
  color: #075f9a;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 6px;
  cursor: pointer;
  background:
    linear-gradient(135deg, rgba(10, 150, 255, 0.16), rgba(255, 255, 255, 0.55)),
    repeating-linear-gradient(45deg, transparent 0 8px, rgba(5, 140, 240, 0.12) 8px 10px);
}

.agent-form__tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 26px;
}

.agent-submit {
  width: 58%;
  height: 54px;
  margin: 8px auto 0;
  display: block;
  border: 0;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #0b6ca6, #16a7ef);
  box-shadow: 0 14px 30px rgba(18, 142, 222, 0.28);
}

.agent-portal__footer {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  max-width: 980px;
  margin: 0 auto;
}

.agent-service-card {
  min-height: 88px;
  padding: 18px;
  border-radius: 18px;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 30px rgba(44, 121, 180, 0.12);
}

.agent-service-card strong,
.agent-service-card span {
  display: block;
}

.agent-service-card strong {
  color: #123b58;
}

.agent-service-card span {
  margin-top: 8px;
  color: #7c8fa2;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .agent-portal__main {
    grid-template-columns: 1fr;
    gap: 38px;
    padding-top: 50px;
  }

  .agent-card {
    max-width: 520px;
  }
}
</style>

<style lang="scss">
.agent-forgot-message.el-message {
  top: 50% !important;
  left: 50%;
  width: auto;
  min-width: auto;
  max-width: 420px;
  padding: 12px 22px;
  transform: translate(-50%, -50%);
  border-color: #e3e8ef;
  border-radius: 4px;
  background: #f3f6fb;
  box-shadow: 0 10px 28px rgba(15, 45, 70, 0.08);
}

.agent-forgot-message .el-message__icon {
  color: #f5a623;
}

.agent-forgot-message .el-message__content {
  color: #f56c6c;
}
</style>
