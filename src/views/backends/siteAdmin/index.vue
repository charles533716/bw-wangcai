<template>
  <div class="home-entry">
    <operations-dashboard
      v-if="dashboardMode === 'super' || dashboardMode === 'site'"
      :scope-type="dashboardMode"
      :site-code="displaySiteCode"
      :user-name="userName"
    />
    <agent-operations-placeholder
      v-else-if="dashboardMode === 'agent'"
      :user-name="userName"
      :site-code="displaySiteCode"
    />
    <div v-else class="app-container">
      <el-empty description="未识别当前用户权限，无法显示运营数据看板" />
    </div>
  </div>
</template>

<script>
import OperationsDashboard from "@/views/backends/siteAdmin/dashboard/OperationsDashboard.vue";
import AgentOperationsPlaceholder from "@/views/backends/siteAdmin/dashboard/AgentOperationsPlaceholder.vue";

export default {
  name: "Index",
  components: {
    OperationsDashboard,
    AgentOperationsPlaceholder
  },
  computed: {
    roles() {
      return this.$store.getters.roles || [];
    },
    isAgent() {
      return Number(this.$store.getters.isAgent || 0);
    },
    userName() {
      return this.$store.getters.userName || this.$store.getters.name || "";
    },
    displaySiteCode() {
      return (
        this.$store.getters.userSiteCode ||
        this.$store.getters.siteCode ||
        ""
      );
    },
    dashboardMode() {
      console.log("agent:",this.roles.map,this.isAgent);

      const normalizedRoles = this.roles.map(role => {
        if (role && typeof role === "object") {
          return String(role.roleKey || role.key || "").toLowerCase();
        }
        return String(role || "").toLowerCase();
      });

      if (normalizedRoles.includes("admin")) {
        return "super";
      }

      if (normalizedRoles.includes("siteadmin")) {
        return "site";
      }

      return "agent";
    }
  }
};
</script>

<style scoped lang="scss">
.home-entry {
  min-height: calc(100vh - 84px);
}
</style>
