<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>站点配置 - {{ siteCode }}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="handleBack">返回列表</el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="基本信息" name="base">
          <base-config
            :site-code="siteCode"
            v-if="activeTab === 'base'"
            @update-success="handleUpdateSuccess"
          />
        </el-tab-pane>
        <el-tab-pane label="场馆配置" name="venue">
          <venue-config
            :site-code="siteCode"
            v-if="activeTab === 'venue'"
          />
        </el-tab-pane>

        <el-tab-pane label="游戏配置" name="game">
          <game-config
            :site-code="siteCode"
            v-if="activeTab === 'game'"
          />
        </el-tab-pane>

        <el-tab-pane label="域名配置" name="domain">
          <domain-config
            :site-code="siteCode"
            v-if="activeTab === 'domain'"
          />
        </el-tab-pane>

        <el-tab-pane label="资源配置" name="resource">
          <resource-config
            :site-code="siteCode"
            v-if="activeTab === 'resource'"
          />
        </el-tab-pane>

        <el-tab-pane label="维护配置" name="update">
          <update-config
            :site-code="siteCode"
            v-if="activeTab === 'update'"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import BaseConfig from './BaseConfig'
import GameConfig from './GameConfig'
import VenueConfig from './VenueConfig'
import DomainConfig from './DomainConfig'
import ResourceConfig from './ResourceConfig'
import UpdateConfig from './UpdateConfig'
import { DEFAULT_SITE_CODE } from '@/utils/prototypeBackend'

export default {
  name: "SiteConfig",
  components: {
    BaseConfig,
    VenueConfig,
    GameConfig,
    DomainConfig,
    ResourceConfig,
    UpdateConfig
  },
  data() {
    return {
      activeTab: 'base',
      siteCode: ''
    }
  },
  created() {
    this.siteCode = this.$route.query.siteCode || DEFAULT_SITE_CODE
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
    },
    handleBack() {
      this.$router.push('/site-admin/site/index')
    },
    handleUpdateSuccess() {
      this.$modal.msgSuccess('配置更新成功')
    }
  }
}
</script>

<style scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>
