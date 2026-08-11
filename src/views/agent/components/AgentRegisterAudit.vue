<template>
  <div class="agent-register-audit">
    <el-form :model="query" :inline="true" label-width="90px" class="audit-query">
      <el-form-item v-if="showSite" label="站点">
        <el-select v-model="query.siteCode" placeholder="全部" clearable filterable style="width: 200px">
          <el-option
            v-for="site in effectiveSiteOptions"
            :key="site.code"
            :label="site.name + '（' + site.code + '）'"
            :value="site.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="代理账号">
        <el-input v-model.trim="query.agentAccount" clearable placeholder="请输入代理账号" />
      </el-form-item>
      <el-form-item label="推荐人">
        <el-input v-model.trim="query.recommender" clearable placeholder="请输入推荐人" />
      </el-form-item>
      <el-form-item label="注册来源">
        <el-select v-model="query.source" placeholder="全部" clearable style="width: 140px">
          <el-option label="WEB" value="WEB" />
          <el-option label="H5" value="H5" />
        </el-select>
      </el-form-item>
      <el-form-item label="注册时间">
        <el-date-picker
          v-model="query.registerTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="query.status" placeholder="全部" clearable style="width: 150px">
          <el-option label="待审核" value="pending" />
          <el-option label="审核通过" value="approved" />
          <el-option label="审核拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核人">
        <el-input v-model.trim="query.reviewer" clearable placeholder="请输入审核人" />
      </el-form-item>
      <el-form-item label="审核时间">
        <el-date-picker
          v-model="query.reviewTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">筛选</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-check"
          :disabled="!selectedPendingRows.length"
          @click="handleBatchReview('approved')"
        >批量通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-close"
          :disabled="!selectedPendingRows.length"
          @click="handleBatchReview('rejected')"
        >批量拒绝</el-button>
      </el-col>
    </el-row>

    <el-table ref="auditTable" :data="pagedRows" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" :selectable="isAuditRowSelectable" />
      <el-table-column label="序号" type="index" width="70" align="center" />
      <el-table-column v-if="showSite" label="站点" prop="siteName" min-width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.siteName }}（{{ scope.row.siteCode }}）
        </template>
      </el-table-column>
      <el-table-column label="代理账号" prop="agentAccount" min-width="140" align="center" />
      <el-table-column label="推荐人" prop="recommender" min-width="120" align="center" />
      <el-table-column label="注册来源" prop="source" width="110" align="center" />
      <el-table-column label="注册时间" prop="registerTime" min-width="170" align="center" />
      <el-table-column label="审核状态" prop="status" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核人" prop="reviewer" width="120" align="center">
        <template slot-scope="scope">{{ scope.row.reviewer || '-' }}</template>
      </el-table-column>
      <el-table-column label="审核时间" prop="reviewTime" min-width="170" align="center">
        <template slot-scope="scope">{{ scope.row.reviewTime || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" align="center" fixed="right">
        <template slot-scope="scope">
          <template v-if="scope.row.status === 'pending'">
            <el-button type="text" size="mini" @click="handleReview(scope.row, 'approved')">审核通过</el-button>
            <el-button type="text" size="mini" class="danger-action" @click="handleReview(scope.row, 'rejected')">审核拒绝</el-button>
          </template>
          <span v-else class="audit-done">已审核</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="filteredRows.length > 0"
      :total="filteredRows.length"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="handlePageChange"
    />
  </div>
</template>

<script>
import { addAgent } from "@/api/agent/agent";

const DEFAULT_SITES = [
  { code: "SITE001", name: "旺财体育" },
  { code: "SITE002", name: "星河体育" },
  { code: "SITE003", name: "财神体育" },
  { code: "SITE004", name: "DW体育" },
  { code: "SITE005", name: "托尼体育" }
];
const AUDIT_STORAGE_KEY = "wc-prototype:agent-register-audit:v1";

function buildRows() {
  const accountPrefixes = ["wcagent", "staragent", "fortune", "dwagent", "tony", "sports", "vipagent", "league", "gold", "promo"];
  const accounts = Array.from({ length: 20 }, (item, index) => `${accountPrefixes[index % accountPrefixes.length]}${String(index + 1).padStart(2, "0")}`);
  const statuses = Array.from({ length: 20 }, (item, index) => {
    if (index < 15) return "pending";
    return index % 2 === 0 ? "approved" : "rejected";
  });
  const reviewers = ["admin", "test", "kai01", "Bill"];
  const recommenders = ["laoli", "laoliu", "admin01", "kai01", "Bill02", "tom88"];
  return accounts.map((account, index) => {
    const site = DEFAULT_SITES[index % DEFAULT_SITES.length];
    const status = statuses[index % statuses.length];
    return {
      id: index + 1,
      siteCode: site.code,
      siteName: site.name,
      agentAccount: account,
      recommender: recommenders[index % recommenders.length],
      source: index % 2 === 0 ? "WEB" : "H5",
      registerTime: `2026-08-${String((index % 9) + 1).padStart(2, "0")} ${String(9 + (index % 8)).padStart(2, "0")}:30:00`,
      status,
      reviewer: status === "pending" ? "" : reviewers[index % reviewers.length],
      reviewTime: status === "pending" ? "" : `2026-08-${String((index % 9) + 2).padStart(2, "0")} ${String(10 + (index % 7)).padStart(2, "0")}:20:00`
    };
  });
}

function loadRows() {
  if (typeof window === "undefined") return buildRows();
  try {
    const cached = JSON.parse(window.localStorage.getItem(AUDIT_STORAGE_KEY) || "null");
    if (Array.isArray(cached) && cached.length === 20) {
      const recommenders = ["laoli", "laoliu", "admin01", "kai01", "Bill02", "tom88"];
      return cached.map((row, index) => ({
        ...row,
        recommender: row.recommender || recommenders[index % recommenders.length]
      }));
    }
  } catch (error) {
    window.localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
  return buildRows();
}

export default {
  name: "AgentRegisterAudit",
  props: {
    showSite: {
      type: Boolean,
      default: true
    },
    siteOptions: {
      type: Array,
      default: () => []
    },
    currentSiteCode: {
      type: String,
      default: "SITE001"
    }
  },
  data() {
    return {
      query: this.defaultQuery(),
      pageNum: 1,
      pageSize: 20,
      selectedRows: [],
      rows: loadRows()
    };
  },
  computed: {
    effectiveSiteOptions() {
      const options = Array.isArray(this.siteOptions) && this.siteOptions.length
        ? this.siteOptions.map(site => ({
          code: site.code || site.siteCode,
          name: site.nameZn || site.name || site.siteName || site.code || site.siteCode
        })).filter(site => site.code)
        : DEFAULT_SITES;
      return options;
    },
    scopedRows() {
      if (this.showSite) {
        return this.rows;
      }
      const currentSite = this.effectiveSiteOptions.find(site => site.code === this.currentSiteCode) || this.effectiveSiteOptions[0] || DEFAULT_SITES[0];
      return this.rows.map(row => ({
        ...row,
        siteCode: currentSite.code,
        siteName: currentSite.name
      }));
    },
    filteredRows() {
      const result = this.scopedRows.filter(row => {
        return (!this.query.siteCode || row.siteCode === this.query.siteCode)
          && (!this.query.agentAccount || row.agentAccount.toLowerCase().includes(this.query.agentAccount.toLowerCase()))
          && (!this.query.recommender || row.recommender.toLowerCase().includes(this.query.recommender.toLowerCase()))
          && (!this.query.source || row.source === this.query.source)
          && (!this.query.status || row.status === this.query.status)
          && (!this.query.reviewer || (row.reviewer || "").toLowerCase().includes(this.query.reviewer.toLowerCase()))
          && this.inDateRange(row.registerTime, this.query.registerTime)
          && this.inDateRange(row.reviewTime, this.query.reviewTime);
      });
      return result.sort((a, b) => {
        const pendingDiff = this.statusWeight(a.status) - this.statusWeight(b.status);
        if (pendingDiff !== 0) return pendingDiff;
        if (a.status === "pending" && b.status === "pending") {
          return String(b.registerTime).localeCompare(String(a.registerTime));
        }
        return String(b.reviewTime || "").localeCompare(String(a.reviewTime || ""));
      });
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize;
      return this.filteredRows.slice(start, start + this.pageSize);
    },
    selectedPendingRows() {
      return this.selectedRows.filter(row => row.status === "pending");
    }
  },
  methods: {
    defaultQuery() {
      return {
        siteCode: "",
        agentAccount: "",
        recommender: "",
        source: "",
        registerTime: [],
        status: "",
        reviewer: "",
        reviewTime: []
      };
    },
    statusWeight(status) {
      return status === "pending" ? 0 : 1;
    },
    statusLabel(status) {
      if (status === "approved") return "审核通过";
      if (status === "rejected") return "审核拒绝";
      return "待审核";
    },
    statusTagType(status) {
      if (status === "approved") return "success";
      if (status === "rejected") return "danger";
      return "warning";
    },
    reviewActionLabel(status) {
      return status === "approved" ? "审核通过" : "审核拒绝";
    },
    inDateRange(value, range) {
      if (!Array.isArray(range) || range.length !== 2 || !range[0] || !range[1]) {
        return true;
      }
      if (!value) {
        return false;
      }
      const date = value.slice(0, 10);
      return date >= range[0] && date <= range[1];
    },
    handleQuery() {
      this.pageNum = 1;
    },
    resetQuery() {
      this.query = this.defaultQuery();
      this.pageNum = 1;
    },
    handlePageChange() {
      this.selectedRows = [];
    },
    isAuditRowSelectable(row) {
      return row.status === "pending";
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection.filter(row => this.isAuditRowSelectable(row));
    },
    handleReview(row, status) {
      const actionLabel = this.reviewActionLabel(status);
      this.$confirm(`确认将代理账号“${row.agentAccount}”${actionLabel}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: status === "approved" ? "success" : "warning"
      }).then(() => {
        return this.applyReview(row, status);
      }).catch(() => {});
    },
    applyReview(row, status, silent = false) {
      const target = this.rows.find(item => item.id === row.id);
      if (!target || target.status !== "pending") {
        return Promise.resolve();
      }
      target.status = status;
      target.reviewer = "admin";
      target.reviewTime = this.nowText();
      const syncRequest = status === "approved"
        ? this.syncApprovedAgent({ ...target, siteCode: row.siteCode, siteName: row.siteName })
        : Promise.resolve();
      return syncRequest.then(() => {
        this.persistRows();
        if (!silent) {
          this.$message.success(this.reviewActionLabel(status));
        }
      });
    },
    persistRows() {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.rows));
      }
    },
    syncApprovedAgent(row) {
      return addAgent({
        name: row.agentAccount,
        recommender: row.recommender,
        siteCode: row.siteCode,
        siteName: row.siteName,
        regTime: row.registerTime,
        createTime: row.registerTime,
        agentType: "star",
        commType: "3",
        agentIdentity: "-",
        starLevel: 1,
        agentLevel: null,
        agentStatus: 1,
        status: "1",
        googleVerify: "unbound",
        commissionPlanName: "WC星级佣金方案",
        pendingCommissionPlanName: "-",
        subAgentCount: 0,
        subMemberCount: 0,
        centerBalanceCnySum: 0,
        registrationSource: row.source
      }).then(() => {
        this.$emit("approved", row);
      });
    },
    handleBatchReview(status) {
      const rows = this.selectedPendingRows;
      if (!rows.length) {
        return;
      }
      const actionLabel = this.reviewActionLabel(status);
      this.$confirm(`确认将选中的 ${rows.length} 条代理注册申请${actionLabel}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: status === "approved" ? "success" : "warning"
      }).then(() => {
        return Promise.all(rows.map(row => this.applyReview(row, status, true))).then(() => {
          this.$message.success(`${rows.length} 条申请${actionLabel}`);
          this.selectedRows = [];
          if (this.$refs.auditTable) {
            this.$refs.auditTable.clearSelection();
          }
        });
      }).catch(() => {});
    },
    nowText() {
      const d = new Date();
      const pad = value => String(value).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.agent-register-audit {
  padding-top: 4px;
}

.audit-query {
  margin-bottom: 10px;
}

.danger-action {
  color: #f56c6c;
}

.audit-done {
  color: #909399;
}
</style>
