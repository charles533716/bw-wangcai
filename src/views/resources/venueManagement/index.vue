<template>
  <div class="app-container venue-management-page">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="场馆类型" name="venueTypes"><venue-type-list :state="state" @state-change="persist" /></el-tab-pane>
        <el-tab-pane label="场馆列表" name="venues"><venue-list :state="state" @state-change="persist" @switch-tab="switchTab" /></el-tab-pane>
        <el-tab-pane label="游戏列表" name="games"><game-list :state="state" :preset-venue-id="presetVenueId" @state-change="persist" /></el-tab-pane>
        <el-tab-pane label="钱包列表" name="wallets"><wallet-list :state="state" @state-change="persist" /></el-tab-pane>
        <el-tab-pane label="维护日志" name="maintenance"><maintenance-log :state="state" /></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import VenueList from './VenueList'
import VenueTypeList from './VenueTypeList'
import GameList from './GameList'
import WalletList from './WalletList'
import MaintenanceLog from './MaintenanceLog'
const { createInitialState, loadState, saveState } = require('./model')

export default {
  name: 'ResourceVenueManagement',
  components: { VenueTypeList, VenueList, GameList, WalletList, MaintenanceLog },
  data() {
    return { activeTab: 'venueTypes', presetVenueId: '', state: createInitialState() }
  },
  created() {
    if (typeof window !== 'undefined' && window.localStorage) this.state = loadState(window.localStorage)
  },
  methods: {
    persist() {
      if (typeof window !== 'undefined' && window.localStorage) saveState(window.localStorage, this.state)
    },
    switchTab(payload) {
      this.presetVenueId = payload.venueId
      this.activeTab = payload.tab
    }
  }
}
</script>

<style scoped>
.venue-management-page { padding: 12px; }
::v-deep .el-card__body { padding: 0 14px 16px; }
</style>
