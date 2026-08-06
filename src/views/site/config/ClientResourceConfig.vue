<template>
  <div class="client-resource-config">
    <el-tabs v-model="activeTab" class="resource-tabs">
      <el-tab-pane label="登录注册页" name="loginRegister">
        <div class="login-resource-page">
          <section class="resource-section">
            <h3 class="section-title">LOGO</h3>
            <div class="resource-grid resource-grid--two">
              <div class="resource-item">
                <div class="resource-label">WEB端</div>
                <image-upload
                  v-model="loginRegister.webLogo"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
              </div>

              <div class="resource-item">
                <div class="resource-label">H5端/APP端</div>
                <image-upload
                  v-model="loginRegister.mobileLogo"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <section class="resource-section">
            <h3 class="section-title">背景图</h3>
            <div class="resource-grid">
              <div class="resource-item">
                <div class="resource-label">WEB端</div>
                <image-upload
                  v-model="loginRegister.webBackground"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png', 'gif']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG、GIF，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <div class="page-actions">
            <el-button size="small" @click="resetConfig('loginRegister')">重置</el-button>
            <el-button type="primary" size="small" @click="saveLoginRegisterConfig">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="APP下载页" name="appDownload">
        <div class="app-download-page">
          <section class="resource-section">
            <h3 class="section-title">LOGO</h3>
            <div class="resource-grid">
              <div class="resource-item">
                <div class="resource-label resource-label--required">LOGO</div>
                <image-upload
                  v-model="appDownload.logo"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 500*72，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <section class="resource-section">
            <h3 class="section-title">下载页背景图</h3>
            <div class="resource-grid">
              <div class="resource-item">
                <div class="resource-label resource-label--required">下载页背景图</div>
                <image-upload
                  v-model="appDownload.background"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 750*1624，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <section class="resource-section">
            <h3 class="section-title">全站APP下载页展示图</h3>
            <div class="download-showcase-grid">
              <div class="resource-item">
                <div class="resource-label resource-label--required">Android端</div>
                <image-upload
                  v-model="appDownload.androidShowcase"
                  :limit="6"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                />
                <div class="resource-tip-row">
                  <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 750*870，每张不超过 2MB，最多上传 6 张</p>
                  <el-button type="primary" size="mini" @click="openSortDialog('android')">排序配置</el-button>
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-label resource-label--required">iOS端</div>
                <image-upload
                  v-model="appDownload.iosShowcase"
                  :limit="6"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                />
                <div class="resource-tip-row">
                  <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 750*870，每张不超过 2MB，最多上传 6 张</p>
                  <el-button type="primary" size="mini" @click="openSortDialog('ios')">排序配置</el-button>
                </div>
              </div>
            </div>
          </section>

          <section class="resource-section">
            <h3 class="section-title">体育APP下载页安装教程图</h3>
            <div class="resource-grid resource-grid--two">
              <div class="resource-item">
                <div class="resource-label">Android端</div>
                <image-upload
                  v-model="appDownload.androidGuide"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 750*1060，单张不超过 2MB</p>
              </div>

              <div class="resource-item">
                <div class="resource-label">iOS端</div>
                <image-upload
                  v-model="appDownload.iosGuide"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸为 750*1060，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <div class="page-actions">
            <el-button size="small" @click="resetConfig('appDownload')">重置</el-button>
            <el-button type="primary" size="small" @click="saveAppDownloadConfig">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="合营计划" name="affiliatePlan">
        <div class="affiliate-plan-page">
          <section class="resource-section">
            <h3 class="section-title">WEB端合营计划</h3>
            <div class="resource-grid">
              <div class="resource-item">
                <div class="resource-label">主图</div>
                <image-upload
                  v-model="affiliatePlan.webMainImage"
                  :limit="1"
                  :file-size="2"
                  :file-type="['jpg', 'jpeg', 'png']"
                  :is-show-tip="false"
                  :drag="false"
                  replace-on-exceed
                />
                <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
              </div>
            </div>
          </section>

          <div class="page-actions">
            <el-button size="small" @click="resetConfig('affiliatePlan')">重置</el-button>
            <el-button type="primary" size="small" @click="saveAffiliatePlanConfig">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="WEB首页" name="webHome">
        <div class="web-home-page">
          <section class="resource-section">
            <h3 class="section-title">首页顶部tab栏</h3>
            <div class="home-tab-grid">
              <div v-for="(tabValue, index) in webHome.topTabs" :key="index" class="home-tab-item">
                <span class="home-tab-label">左{{ index + 1 }}</span>
                <el-select
                  v-model="webHome.topTabs[index]"
                  clearable
                  filterable
                  placeholder="请选择场馆类型"
                  size="small"
                  class="home-tab-select"
                >
                  <el-option
                    v-for="option in homeTabOptions"
                    :key="option"
                    :label="option"
                    :value="option"
                    :disabled="isHomeTabOptionDisabled(option, index)"
                  />
                </el-select>
              </div>
            </div>
          </section>

          <div class="page-actions">
            <el-button size="small" @click="resetConfig('webHome')">重置</el-button>
            <el-button type="primary" size="small" @click="saveWebHomeConfig">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="WEB二级下拉" name="webSecondaryDropdown">
        <div class="web-secondary-page">
          <div class="secondary-tab-buttons">
            <el-button
              v-for="item in secondaryDropdownTabs"
              :key="item.value"
              size="small"
              :type="webSecondaryDropdown.activeTab === item.value ? 'primary' : 'default'"
              @click="webSecondaryDropdown.activeTab = item.value"
            >
              {{ item.label }}
            </el-button>
          </div>

          <div v-if="currentSecondaryConfig" class="secondary-config-panel">
            <section class="resource-section">
              <div class="secondary-rebate-row">
                <div class="secondary-form-item">
                  <span class="secondary-label secondary-label--required">返水信息</span>
                  <el-radio-group v-model="currentSecondaryConfig.rebateVisible">
                    <el-radio label="show">展示</el-radio>
                    <el-radio label="hide">不展示</el-radio>
                  </el-radio-group>
                </div>

                <div v-if="currentSecondaryConfig.rebateVisible === 'show'" class="secondary-form-item secondary-form-item--image">
                  <span class="secondary-label secondary-label--required">场馆返水信息</span>
                  <div>
                    <image-upload
                      v-model="currentSecondaryConfig.rebateImage"
                      :limit="1"
                      :file-size="2"
                      :file-type="['jpg', 'jpeg', 'png']"
                      :is-show-tip="false"
                      :drag="false"
                      replace-on-exceed
                    />
                    <p class="resource-tip">支持 JPG、JPEG、PNG，建议尺寸，单张不超过 2MB</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="secondary-venue-section">
              <div class="secondary-venue-toolbar">
                <el-button type="primary" size="mini" @click="addSecondaryVenue">新增</el-button>
              </div>

              <div
                v-for="(venue, index) in currentSecondaryConfig.venues"
                :key="venue.id"
                class="secondary-venue-row"
              >
                <div class="secondary-form-item">
                  <span class="secondary-label secondary-label--required">左{{ index + 1 }}场馆</span>
                  <div class="secondary-venue-control">
                    <el-select
                      v-model="venue.venueName"
                      clearable
                      filterable
                      placeholder="请选择场馆"
                      size="small"
                      class="secondary-venue-select"
                    >
                      <el-option
                        v-for="option in venueOptions"
                        :key="option"
                        :label="option"
                        :value="option"
                      />
                    </el-select>
                    <el-button
                      type="danger"
                      plain
                      size="mini"
                      class="secondary-venue-delete"
                      :disabled="currentSecondaryConfig.venues.length <= 1"
                      @click="removeSecondaryVenue(index)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>

                <div class="secondary-form-item secondary-form-item--image">
                  <span class="secondary-label secondary-label--required">配置场馆图片</span>
                  <div>
                    <image-upload
                      v-model="venue.venueImage"
                      :limit="1"
                      :file-size="2"
                      :file-type="['jpg', 'jpeg', 'png']"
                      :is-show-tip="false"
                      :drag="false"
                      replace-on-exceed
                    />
                    <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
                  </div>
                </div>

                <div class="secondary-form-item secondary-form-item--image">
                  <span class="secondary-label secondary-label--required">场馆名称图片</span>
                  <div>
                    <image-upload
                      v-model="venue.nameImage"
                      :limit="1"
                      :file-size="2"
                      :file-type="['jpg', 'jpeg', 'png']"
                      :is-show-tip="false"
                      :drag="false"
                      replace-on-exceed
                    />
                    <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div v-else class="secondary-empty-panel">
            APP下拉配置待补充
          </div>

          <div class="page-actions">
            <el-button size="small" @click="resetSecondaryDropdownConfig">重置</el-button>
            <el-button type="primary" size="small" @click="saveSecondaryDropdownConfig">保存配置</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="APP/H5首页" name="appH5Home">
        <app-h5-home-config :site-code="siteCode" />
      </el-tab-pane>
      <el-tab-pane label="WEB场馆详情页" name="webVenueDetail">
        <web-venue-detail-config :site-code="siteCode" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      title="排序配置"
      :visible.sync="sortDialogVisible"
      width="720px"
      append-to-body
      class="app-download-sort-dialog"
    >
      <el-table :data="sortRows" border>
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column label="APP下载页展示图" align="center">
          <template slot-scope="{ row }">
            <img class="sort-preview" :src="row.url" alt="APP下载页展示图" />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="300" align="center">
          <template slot-scope="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="1"
              :max="6"
              :controls="false"
              size="small"
              class="sort-input"
            />
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer">
        <el-button size="small" @click="sortDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveShowcaseSort">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import AppH5HomeConfig from './AppH5HomeConfig'
import WebVenueDetailConfig from './WebVenueDetailConfig'
import logoImage from '@/assets/logo/logo.png'
import profileImage from '@/assets/images/profile.jpg'
import backgroundImage from '@/assets/images/login-background.jpg'
import placeholderImage from '@/assets/404_images/404.png'

export default {
  name: 'ClientResourceConfig',
  components: {
    ImageUpload,
    AppH5HomeConfig,
    WebVenueDetailConfig
  },
  props: {
    siteCode: {
      type: String,
      default: ''
    }
  },
  data() {
    const clone = value => JSON.parse(JSON.stringify(value))
    const loginRegister = {
      webLogo: '',
      mobileLogo: '',
      webBackground: ''
    }
    const appDownload = {
      logo: logoImage,
      background: backgroundImage,
      androidShowcase: [profileImage, logoImage, placeholderImage],
      iosShowcase: [placeholderImage, profileImage],
      androidGuide: '',
      iosGuide: placeholderImage
    }
    const affiliatePlan = { webMainImage: '' }
    const webHome = {
      topTabs: ['捕鱼', '电竞', '棋牌', '真人', '电子', '彩票', '体育', '哈希']
    }
    const secondaryDropdownTabs = [
      { label: '捕鱼下拉', value: 'fish', type: 'venue' },
      { label: '电竞下拉', value: 'esports', type: 'venue' },
      { label: '棋牌下拉', value: 'chess', type: 'venue' },
      { label: '真人下拉', value: 'live', type: 'venue' },
      { label: '电子下拉', value: 'slot', type: 'venue' },
      { label: '彩票下拉', value: 'lottery', type: 'venue' },
      { label: '体育下拉', value: 'sports', type: 'venue' },
      { label: '哈希下拉', value: 'hash', type: 'venue' }
    ]
    const createSecondaryConfig = (prefix) => ({
      rebateVisible: 'show',
      rebateImage: profileImage,
      venues: [
        { id: `${prefix}-1`, venueName: 'AG捕鱼', venueImage: placeholderImage, nameImage: profileImage },
        { id: `${prefix}-2`, venueName: '博雅捕鱼1', venueImage: profileImage, nameImage: profileImage },
        { id: `${prefix}-3`, venueName: 'PM捕鱼', venueImage: placeholderImage, nameImage: placeholderImage }
      ]
    })
    const secondaryDropdownConfigs = {}
    secondaryDropdownTabs
      .filter(item => item.type === 'venue')
      .forEach(item => {
        secondaryDropdownConfigs[item.value] = createSecondaryConfig(item.value)
      })
    return {
      activeTab: 'loginRegister',
      loginRegister,
      appDownload,
      affiliatePlan,
      homeTabOptions: ['哈希', '体育', '真人', '棋牌', '电竞', '彩票', '电子', '捕鱼'],
      webHome,
      secondaryDropdownTabs,
      venueOptions: [
        'AG捕鱼',
        '博雅捕鱼1',
        'PM捕鱼',
        '旺财体育',
        '熊猫体育',
        'IM体育',
        '旺财真人',
        '旺财彩票',
        '旺财棋牌',
        'DB棋牌',
        'PG电子',
        'DB电子',
        'IM电竞',
        '旺财电竞',
        '哈希竞猜'
      ],
      webSecondaryDropdown: {
        activeTab: 'fish',
        configs: secondaryDropdownConfigs
      },
      savedConfigs: {
        loginRegister: clone(loginRegister),
        appDownload: clone(appDownload),
        affiliatePlan: clone(affiliatePlan),
        webHome: clone(webHome),
        webSecondaryDropdown: clone(secondaryDropdownConfigs)
      },
      sortDialogVisible: false,
      sortTarget: 'android',
      sortRows: []
    }
  },
  computed: {
    currentSecondaryConfig() {
      return this.webSecondaryDropdown.configs[this.webSecondaryDropdown.activeTab] || null
    }
  },
  methods: {
    cloneConfig(value) {
      return JSON.parse(JSON.stringify(value))
    },
    resetConfig(key) {
      this[key] = this.cloneConfig(this.savedConfigs[key])
      this.$message.success('已恢复最近一次保存的配置')
    },
    saveLoginRegisterConfig() {
      this.savedConfigs.loginRegister = this.cloneConfig(this.loginRegister)
      this.$modal.msgSuccess('登录注册页资源配置保存成功')
    },
    saveAppDownloadConfig() {
      this.savedConfigs.appDownload = this.cloneConfig(this.appDownload)
      this.$modal.msgSuccess('APP下载页资源配置保存成功')
    },
    saveAffiliatePlanConfig() {
      this.savedConfigs.affiliatePlan = this.cloneConfig(this.affiliatePlan)
      this.$modal.msgSuccess('合营计划资源配置保存成功')
    },
    saveWebHomeConfig() {
      const emptyIndex = this.webHome.topTabs.findIndex(item => !item)
      if (emptyIndex > -1) {
        this.$message.warning(`请选择左${emptyIndex + 1}的场馆类型`)
        return
      }
      this.savedConfigs.webHome = this.cloneConfig(this.webHome)
      this.$modal.msgSuccess('WEB首页资源配置保存成功')
    },
    isHomeTabOptionDisabled(option, currentIndex) {
      return this.webHome.topTabs.some((item, index) => index !== currentIndex && item === option)
    },
    addSecondaryVenue() {
      if (!this.currentSecondaryConfig) {
        return
      }
      const nextIndex = this.currentSecondaryConfig.venues.length + 1
      this.currentSecondaryConfig.venues.push({
        id: `${this.webSecondaryDropdown.activeTab}-${Date.now()}-${nextIndex}`,
        venueName: '',
        venueImage: '',
        nameImage: ''
      })
    },
    removeSecondaryVenue(index) {
      if (!this.currentSecondaryConfig || this.currentSecondaryConfig.venues.length <= 1) {
        return
      }
      this.currentSecondaryConfig.venues.splice(index, 1)
    },
    resetSecondaryDropdownConfig() {
      const config = this.currentSecondaryConfig
      if (!config) {
        this.$message.info('APP下拉配置待补充')
        return
      }
      const saved = this.savedConfigs.webSecondaryDropdown[this.webSecondaryDropdown.activeTab]
      this.$set(this.webSecondaryDropdown.configs, this.webSecondaryDropdown.activeTab, this.cloneConfig(saved))
      this.$message.success('已恢复最近一次保存的配置')
    },
    saveSecondaryDropdownConfig() {
      const config = this.currentSecondaryConfig
      if (!config) {
        this.$message.info('APP下拉配置待补充')
        return
      }
      if (config.rebateVisible === 'show' && !config.rebateImage) {
        this.$message.warning('请配置场馆返水信息')
        return
      }
      const invalidIndex = config.venues.findIndex(item => !item.venueName || !item.venueImage || !item.nameImage)
      if (invalidIndex > -1) {
        this.$message.warning(`请完整配置左${invalidIndex + 1}场馆`)
        return
      }
      this.$set(
        this.savedConfigs.webSecondaryDropdown,
        this.webSecondaryDropdown.activeTab,
        this.cloneConfig(config)
      )
      this.$modal.msgSuccess('WEB二级下拉资源配置保存成功')
    },
    normalizeImageList(value) {
      if (!value) {
        return []
      }
      if (Array.isArray(value)) {
        return value.filter(Boolean)
      }
      return String(value).split(',').map(item => item.trim()).filter(Boolean)
    },
    getShowcaseField() {
      return this.sortTarget === 'ios' ? 'iosShowcase' : 'androidShowcase'
    },
    openSortDialog(target) {
      this.sortTarget = target
      const field = this.getShowcaseField()
      this.sortRows = this.normalizeImageList(this.appDownload[field]).map((url, index) => ({
        url,
        sort: index + 1
      }))
      if (!this.sortRows.length) {
        this.$message.warning('请先上传APP下载页展示图')
        return
      }
      this.sortDialogVisible = true
    },
    saveShowcaseSort() {
      const field = this.getShowcaseField()
      const sortedRows = this.sortRows
        .slice()
        .sort((left, right) => {
          if (Number(left.sort) === Number(right.sort)) {
            return this.sortRows.indexOf(left) - this.sortRows.indexOf(right)
          }
          return Number(left.sort) - Number(right.sort)
        })
      this.appDownload[field] = sortedRows.map(item => item.url)
      this.sortDialogVisible = false
      this.$modal.msgSuccess('排序配置保存成功')
    }
  }
}
</script>

<style scoped lang="scss">
.client-resource-config {
  min-height: 360px;
  padding: 0 20px;
}

.resource-tabs {
  ::v-deep .el-tabs__item {
    height: 38px;
    line-height: 38px;
    font-size: 12px;
  }
}

.login-resource-page,
.app-download-page,
.affiliate-plan-page,
.web-home-page,
.web-secondary-page {
  padding: 8px 4px 20px;
}

.resource-section {
  padding: 0 0 26px;
  border-bottom: 1px solid #ebeef5;

  & + & {
    padding-top: 24px;
  }
}

.section-title {
  margin: 0 0 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  color: #303133;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.resource-grid {
  display: grid;
  grid-template-columns: minmax(260px, 420px);
  gap: 32px 72px;
  padding-left: 28px;
}

.resource-grid--two {
  grid-template-columns: repeat(2, minmax(260px, 420px));
}

.resource-item {
  min-width: 0;
}

.resource-label {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
  line-height: 20px;
}

.resource-label--required::before {
  content: '*';
  margin-right: 4px;
  color: #f56c6c;
}

.resource-tip {
  margin: 8px 0 0;
  color: #a8abb2;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.resource-tip-row {
  display: flex;
  align-items: center;
  gap: 18px;

  .resource-tip {
    margin-top: 8px;
  }
}

.download-showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(380px, 1fr));
  gap: 36px 72px;
  padding-left: 28px;
}

.home-tab-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 320px));
  gap: 22px 180px;
  padding-left: 28px;
}

.home-tab-item {
  display: flex;
  align-items: center;
  min-width: 0;
}

.home-tab-label {
  flex: 0 0 46px;
  color: #606266;
  font-size: 14px;

  &::before {
    content: '*';
    margin-right: 4px;
    color: #f56c6c;
  }
}

.home-tab-select {
  width: 270px;
}

.secondary-tab-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;

  .el-button {
    min-width: 82px;
    margin-left: 0;
    border-radius: 0;
  }

  .el-button + .el-button {
    margin-left: -1px;
  }
}

.secondary-config-panel {
  border-top: 1px solid #ebeef5;
}

.secondary-rebate-row {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(420px, 1fr);
  gap: 48px 120px;
  padding: 12px 0 10px 8px;
}

.secondary-form-item {
  display: flex;
  align-items: center;
  min-width: 0;
}

.secondary-form-item--image {
  align-items: flex-start;
}

.secondary-form-item--image .secondary-label,
.secondary-venue-row .secondary-label {
  padding-top: 7px;
}

.secondary-label {
  flex: 0 0 108px;
  color: #606266;
  font-size: 14px;
  line-height: 20px;
}

.secondary-label--required::before {
  content: '*';
  margin-right: 4px;
  color: #f56c6c;
}

.secondary-venue-section {
  margin-top: 24px;
}

.secondary-venue-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 14px 8px;
}

.secondary-venue-row {
  display: grid;
  grid-template-columns: minmax(300px, 420px) minmax(420px, 1fr) minmax(420px, 1fr);
  gap: 48px 64px;
  align-items: start;
  padding: 26px 0 24px 8px;
  border-bottom: 1px solid #ebeef5;
}

.secondary-venue-select {
  width: 220px;
}

.secondary-venue-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.secondary-venue-delete {
  margin-top: 12px;
}

.secondary-empty-panel {
  margin-top: 12px;
  padding: 42px 0;
  border: 1px dashed #dcdfe6;
  background: #fafafa;
  color: #909399;
  text-align: center;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 22px;
}

::v-deep .component-upload-image .el-upload--picture-card,
::v-deep .component-upload-image .el-upload-list--picture-card .el-upload-list__item {
  width: 112px;
  height: 112px;
  line-height: 110px;
}

.sort-preview {
  display: block;
  max-width: 86px;
  max-height: 112px;
  margin: 0 auto;
  object-fit: contain;
}

.sort-input {
  width: 100%;
}

@media (max-width: 900px) {
  .download-showcase-grid,
  .resource-grid--two,
  .home-tab-grid,
  .secondary-rebate-row,
  .secondary-venue-row {
    grid-template-columns: minmax(240px, 1fr);
  }

  .resource-tip {
    white-space: normal;
  }
}
</style>
