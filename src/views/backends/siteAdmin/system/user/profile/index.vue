<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />用户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <!--  <li class="list-group-item">
                <svg-icon icon-class="phone" />手机号码
                <div class="pull-right">{{ user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />所属部门
                <div class="pull-right" v-if="user.dept">{{ user.dept.deptName }} / {{ postGroup }}</div>
              </li> -->
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />所属角色
                <div class="pull-right">{{ roleGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />创建日期
                <div class="pull-right">{{ user.createTime }}</div>
              </li>
              <template v-if="shouldShowPromotionLinks">
                <li v-for="(item, index) in domainList" :key="index" class="list-group-item">
                  推广链接
                  <div class="pull-right copy-link" @click.stop="handleCopy(item)">
                    <svg-icon icon-class="link" /> {{ item.areas == '1' ? '国内链接' : '国外链接' }}
                  </div>
                </li>
              </template>
              <template v-if="shouldShowPromotionLinks && normalizedTelegramPromotionLinks.length">
                <li
                  v-for="(item, index) in normalizedTelegramPromotionLinks"
                  :key="`telegram-promotion-${item.botUsername || index}`"
                  class="list-group-item"
                >
                  Telegram推广链接
                  <div class="pull-right copy-link telegram-copy-link" @click.stop="handleCopyTelegramLink(item)">
                    <svg-icon icon-class="link" />
                    <span>{{ item.botUsername ? `@${item.botUsername}` : `链接${index + 1}` }}</span>
                  </div>
                </li>
              </template>
              <li
                v-for="(link, index) in normalizedAppDownloadLinks"
                :key="`app-download-${index}`"
                class="list-group-item"
              >
                {{ index === 0 ? 'App下载链接' : `备用链接${index}` }}
                <div class="pull-right app-download-actions">
                  <el-button
                    type="text"
                    class="copy-btn"
                    @click.stop="handleCopyAppLink(link)"
                  >
                    复制
                  </el-button>
                </div>
              </li>
              <li v-if="!normalizedAppDownloadLinks.length" class="list-group-item">
                App下载链接
                <div class="pull-right app-download-actions">
                  <span class="app-download-empty">未配置</span>
                  <el-button
                    type="text"
                    class="copy-btn"
                    disabled
                  >
                    复制
                  </el-button>
                </div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="selectedTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from './userAvatar';
import userInfo from './userInfo';
import resetPwd from './resetPwd';
import { getUserProfile, getDomain, getTelegramPromotionLinks } from '@/api/system/user';
import { normalizeRoleKeys } from '@/utils/homeContext';

export default {
  name: 'Profile',
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      domainList: [],
      telegramPromotionLinks: [],
      appDownloadLink: '',
      appDownloadLinks: [],
      roleGroup: {},
      postGroup: {},
      selectedTab: 'userinfo'
    };
  },
  created() {
    const activeTab = this.$route.params && this.$route.params.activeTab;
    if (activeTab) {
      this.selectedTab = activeTab;
    }
    this.getUser();
  },
  computed: {
    normalizedRoleKeys() {
      return normalizeRoleKeys(this.$store.getters.roles || []);
    },
    isSiteAdminViewer() {
      return this.normalizedRoleKeys.includes('siteadmin') && Number(this.$store.getters.isAgent || 0) !== 1;
    },
    shouldShowPromotionLinks() {
      return !this.isSiteAdminViewer;
    },
    normalizedAppDownloadLinks() {
      const source = this.appDownloadLinks.length ? this.appDownloadLinks : [this.appDownloadLink];
      const used = new Set();
      return source
        .map(link => (link == null ? '' : String(link).trim()))
        .filter(link => {
          if (!link || used.has(link)) {
            return false;
          }
          used.add(link);
          return true;
        });
    },
    promotionAgentCode() {
      const domain = this.domainList.find(item => item && item.id);
      return domain ? domain.id : '';
    },
    normalizedTelegramPromotionLinks() {
      const used = new Set();
      return (this.telegramPromotionLinks || [])
        .map(item => {
          const botUsername = this.normalizeTelegramBotUsername(item && item.botUsername);
          const promotionUrl = item && item.promotionUrl
            ? String(item.promotionUrl).trim()
            : this.buildTelegramLink({ botUsername });
          return {
            ...item,
            botUsername,
            promotionUrl
          };
        })
        .filter(item => {
          if (!item.botUsername || !item.promotionUrl) {
            return false;
          }
          const key = item.botUsername.toLowerCase();
          if (used.has(key)) {
            return false;
          }
          used.add(key);
          return true;
        });
    }
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
        this.appDownloadLinks = Array.isArray(response.appDownloadLinks) ? response.appDownloadLinks : [];
        this.appDownloadLink = response.appDownloadLink || this.appDownloadLinks[0] || '';
        return Promise.all([
          getDomain(),
          getTelegramPromotionLinks().catch(() => ({ data: [] }))
        ]);
      }).then(([domainResponse, telegramResponse]) => {
        this.domainList = Array.isArray(domainResponse.data) ? domainResponse.data : [];
        this.telegramPromotionLinks = Array.isArray(telegramResponse.data) ? telegramResponse.data : [];
      });
    },
    buildLink(item) {
      if (!item || !item.domain) return '';
      // 如果后端 domain 已带 http，这里防止重复
      const prefix = item.domain.startsWith('http') ? '' : 'https://';
      return `${prefix}${item.domain}/auth/register-plus?agentCode=${item.id}`;
    },
    normalizeTelegramBotUsername(botUsername) {
      return botUsername == null ? '' : String(botUsername).trim().replace(/^@+/, '');
    },
    buildTelegramLink(item) {
      const botUsername = this.normalizeTelegramBotUsername(item && item.botUsername);
      if (!botUsername || !this.promotionAgentCode) {
        return '';
      }
      return `https://t.me/${botUsername}?start=${encodeURIComponent(`agentCode_${this.promotionAgentCode}`)}`;
    },
    fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      const selection = window.getSelection && window.getSelection();
      const selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'fixed';
      textarea.style.left = '0';
      textarea.style.top = '0';
      textarea.style.width = '1px';
      textarea.style.height = '1px';
      textarea.style.padding = '0';
      textarea.style.border = '0';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      if (textarea.focus) {
        try {
          textarea.focus({ preventScroll: true });
        } catch (e) {
          textarea.focus();
        }
      }
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } finally {
        if (textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
        if (selection && selectedRange) {
          try {
            selection.removeAllRanges();
            selection.addRange(selectedRange);
          } catch (e) {
            // 忽略部分移动端 WebView 还原选区失败，不影响复制结果。
          }
        }
      }
      if (!copied) {
        throw new Error('copy failed');
      }
    },
    showManualCopyDialog(text) {
      this.$alert(
        `<div class="manual-copy-dialog">
          <div style="margin-bottom: 10px; color: #606266; line-height: 1.5;">当前浏览器限制自动复制，请长按下方链接手动复制。</div>
          <textarea readonly style="box-sizing: border-box; width: 100%; min-height: 96px; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; color: #303133; resize: vertical;">${this.escapeHtml(text)}</textarea>
        </div>`,
        '手动复制',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '我知道了'
        }
      );
    },
    escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    async copyText(text, successMessage, invalidMessage) {
      if (!text) {
        this.$message.warning(invalidMessage);
        return;
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          this.fallbackCopy(text);
        }
        this.$message.success(successMessage);
      } catch (e) {
        try {
          this.fallbackCopy(text);
          this.$message.success(successMessage);
        } catch (copyError) {
          this.$message.error('复制失败，请手动复制');
          this.showManualCopyDialog(text);
        }
      }
    },
    handleCopy(item) {
      return this.copyText(this.buildLink(item), '推广链接已复制', '无效推广链接');
    },
    handleCopyTelegramLink(item) {
      return this.copyText(item && item.promotionUrl, 'Telegram推广链接已复制', '无效Telegram推广链接');
    },
    handleCopyAppLink(link) {
      return this.copyText(link, 'App下载链接已复制', '未配置App下载链接');
    }
  }
};
</script>

<style scoped>
.copy-link {
  cursor: pointer;
}

.telegram-copy-link {
  display: inline-flex;
  align-items: center;
  max-width: 58%;
  gap: 4px;
}

.telegram-copy-link span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-download-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.app-download-empty {
  color: #909399;
}

.copy-btn {
  padding: 0;
}
</style>
