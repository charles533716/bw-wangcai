<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>站点场馆管理</span>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="场馆管理" name="venue">
          <venue-manage />
        </el-tab-pane>
        <el-tab-pane label="游戏管理" name="game">
          <game-manage />
        </el-tab-pane>
        <el-tab-pane label="钱包管理" name="wallet">
          <div class="placeholder-content">
            <el-empty description="钱包管理功能开发中..." :image-size="200" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import VenueManage from './VenueManage'
import GameManage from './GameManage'

export default {
  name: "SiteVenueManage",
  components: {
    VenueManage,
    GameManage
  },
  data() {
    return {
      activeTab: 'venue'
    }
  }
}
</script>

<style scoped>
.placeholder-content {
  padding: 50px 0;
  text-align: center;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>
