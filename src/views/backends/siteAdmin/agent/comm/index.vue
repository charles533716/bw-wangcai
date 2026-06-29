<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="commissionList">
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="返佣方案名称" align="center" prop="planName" :show-overflow-tooltip="true" />
      <el-table-column label="方案详情" align="center" prop="detailList" min-width="260">
        <template slot-scope="scope">
          <div v-if="resolveDetailList(scope.row).length > 0">
            <div v-for="(detail, index) in resolveDetailList(scope.row)" :key="index" class="detail-item">
              <span v-if="scope.row.commType === '3'">
                {{ detail.levelNum }} 星级代理 / 返比 {{ ((detail.commissionRate || 0) * 100).toFixed(2) }}%
              </span>
              <span v-else-if="scope.row.commType === '6'">
                {{ detail.levelNum }} 级代理 / 返比 {{ ((detail.commissionRate || 0) * 100).toFixed(2) }}%
              </span>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后操作人" align="center" prop="updateBy" />
      <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getCommission, listCommissionByType } from "@/api/agent/commission";

export default {
  name: "Commission",
  data() {
    return {
      loading: false,
      commissionList: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    resolveDetailList(row) {
      const details = row && Array.isArray(row.detailList) ? row.detailList.slice() : [];
      if (row && (row.commType === "3" || row.commType === "6")) {
        return details.sort((a, b) => Number(a.levelNum || 0) - Number(b.levelNum || 0));
      }
      return details;
    },
    sortByCreateTimeDesc(list) {
      return list.sort((a, b) => {
        const timeA = new Date(a.createTime || 0).getTime();
        const timeB = new Date(b.createTime || 0).getTime();
        return timeB - timeA;
      });
    },
    enrichStarPlanDetails(starPlans) {
      const tasks = (starPlans || []).map((plan) => {
        if (plan && Array.isArray(plan.detailList) && plan.detailList.length > 0) {
          return Promise.resolve(plan);
        }
        return getCommission(plan.id).then((resp) => {
          const detailList = resp && resp.data && Array.isArray(resp.data.detailList) ? resp.data.detailList : [];
          return { ...plan, detailList };
        }).catch(() => {
          return { ...plan, detailList: [] };
        });
      });
      return Promise.all(tasks);
    },
    getList() {
      this.loading = true;
      Promise.all([listCommissionByType("3"), listCommissionByType("6")]).then(([starResp, multiResp]) => {
        const starPlans = starResp.rows || [];
        const multiPlans = multiResp.rows || [];
        this.enrichStarPlanDetails(starPlans).then((enrichedStarPlans) => {
          this.commissionList = this.sortByCreateTimeDesc([...enrichedStarPlans, ...multiPlans]);
        });
      }).catch(() => {
        this.commissionList = [];
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
</script>

<style scoped>
.detail-item {
  margin: 2px 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
