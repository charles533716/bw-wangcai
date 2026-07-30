<template>
  <div class="app-container agent-placeholder-page">
    <div class="placeholder-panel">
      <i class="el-icon-document placeholder-icon"></i>
      <h2>{{ pageTitle }}</h2>
      <p>该功能页面待补充，当前保留菜单入口用于原型结构核对。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentPlaceholderPage',
  computed: {
    pageTitle() {
      return (this.$route.meta && this.$route.meta.title) || '代理管理'
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-placeholder-page {
  min-height: calc(100vh - 84px);
}

.placeholder-panel {
  min-height: 360px;
  border: 1px solid #e4e7ed;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.placeholder-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 18px;
}

h2 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 22px;
  letter-spacing: 0;
}

p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
