import { listAgent, getAgent, addAgent, updateAgent, resetAgentPwd } from "@/api/agent/agent";
import { listSite } from "@/api/site/site";
import { getSiteComprehensiveConfig } from "@/api/site/config";
import { listCommissionByType, getCommission } from "@/api/agent/commission";
import AgentRegisterAudit from "./components/AgentRegisterAudit";
import {
  defaultRecommenderOptions,
  filterAndPaginateAgentRows,
  getSiteRecruiterOptions,
  normalizeAgentRows
} from "./agentListPrototype";

const buildPrototypeCommissionPlan = (id, planName, commType, maxLevel, baseRate, rateStep) => ({
  id,
  planName,
  commType,
  detailList: Array.from({ length: maxLevel }, (item, index) => ({
    levelNum: index + 1,
    commissionRate: Number((baseRate + rateStep * index).toFixed(4))
  }))
});

const PROTOTYPE_COMMISSION_PLANS = [
  buildPrototypeCommissionPlan("STAR-001", "星级返佣方案", "3", 6, 0.2, 0.05),
  buildPrototypeCommissionPlan("STAR-002", "财神Excel0419活动礼金C链星级返佣方案", "3", 6, 0.18, 0.05),
  buildPrototypeCommissionPlan("STAR-003", "opex260808-50", "3", 6, 0.25, 0.05),
  buildPrototypeCommissionPlan("STAR-004", "opex260808-30", "3", 6, 0.15, 0.03),
  buildPrototypeCommissionPlan("STAR-005", "opex260808-45", "3", 6, 0.2, 0.05),
  buildPrototypeCommissionPlan("STAR-006", "opex260808-70", "3", 6, 0.35, 0.05),
  buildPrototypeCommissionPlan("STAR-007", "opex260808-3333", "3", 6, 0.18, 0.04),
  buildPrototypeCommissionPlan("MULTI-001", "多层级返佣方案", "6", 9, 0.2, 0.025),
  buildPrototypeCommissionPlan("MULTI-002", "旺财测试多层级佣金方案", "6", 9, 0.18, 0.025),
  buildPrototypeCommissionPlan("MULTI-003", "财神Excel佣金测试方案20260406", "6", 9, 0.16, 0.025),
  buildPrototypeCommissionPlan("MULTI-004", "财神Excel0419活动礼金A链方案", "6", 9, 0.15, 0.025),
  buildPrototypeCommissionPlan("MULTI-005", "财神Excel0419活动礼金B链方案", "6", 9, 0.14, 0.025),
  buildPrototypeCommissionPlan("TEAM-001", "DW负盈利佣金方案", "team", 1, 0.15, 0),
  buildPrototypeCommissionPlan("TEAM-002", "DW666", "team", 1, 0.12, 0)
];

const PROTOTYPE_TEAM_OPTIONS = [
  { id: "TEAM001", name: "DW推广团队" },
  { id: "TEAM002", name: "旺财精英团队" },
  { id: "TEAM003", name: "星河运营团队" },
  { id: "TEAM004", name: "财神合作团队" }
];

export default {
  name: "Agent",
  components: { AgentRegisterAudit },
  dicts: ["sys_agent_level", "sys_star_level"],
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };

    return {
      loading: true,
      ids: [],
      selectedAgents: [],
      single: true,
      total: 0,
      dateRange: [],
      agentList: [],
      siteOptions: [],
      siteNameMap: {},
      commissionOptions: [],
      commissionTypeMap: {},
      commissionDetailMap: {},
      siteProfitShareRateMap: {},
      parentAgentOptions: [],
      recommenderOptions: defaultRecommenderOptions,
      teamOptions: PROTOTYPE_TEAM_OPTIONS,
      exportLoading: false,
      submitLoading: false,
      activeAgentTab: "list",
      title: "",
      open: false,
      resetPwdOpen: false,
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        agentId: null,
        name: null,
        recommender: null,
        siteCode: null,
        agentType: null,
        agentStatus: null,
        googleVerify: null
      },
      form: {},
      originalModelType: null,
      resetPwdForm: {
        id: null,
        name: "",
        newPassword: "",
        confirmPassword: ""
      },
      rules: {
        name: [
          { required: true, message: "代理账号不能为空", trigger: "blur" },
          { min: 3, max: 20, message: "账号长度在 3 到 20 个字符", trigger: "blur" },
          { pattern: /^[A-Za-z0-9]+$/, message: "代理账号只能包含字母和数字", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
        ],
        siteCode: [{ required: true, message: "站点编码不能为空", trigger: "change" }],
        agentType: [{ required: true, message: "代理类型不能为空", trigger: "change" }],
        commissionPlanId: [{ required: true, message: "佣金方案不能为空", trigger: "change" }],
        agentLevel: [{ required: true, message: "层级级别不能为空", trigger: "change" }],
        starLevel: [{ required: true, message: "星级级别不能为空", trigger: "change" }],
        agentStatus: [{ required: true, message: "代理状态不能为空", trigger: "change" }]
      },
      resetPwdRules: {
        newPassword: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" }
        ]
      },
      operationExpenseTypeOptions: [
        { value: "ACTIVITY_REWARD", label: "活动奖励" },
        { value: "MEMBER_REFERRAL", label: "会员推会员" },
        { value: "REBATE", label: "返水" },
        { value: "VIP_BENEFIT", label: "VIP福利" },
        { value: "BONUS", label: "彩金" },
        { value: "BALANCE_INTEREST", label: "余额宝利息" },
        { value: "DEPOSIT_FEE", label: "充值手续费" },
        { value: "WITHDRAW_FEE", label: "提现手续费" },
        { value: "VENUE_FEE", label: "三方场馆费" }
      ]
    };
  },
  computed: {
    recommenderSelectOptions() {
      const options = new Set(this.recommenderOptions);
      this.parentAgentOptions.forEach(item => {
        if (item.name) options.add(item.name);
      });
      return Array.from(options);
    },
    recruiterSelectOptions() {
      return getSiteRecruiterOptions(this.form.siteCode);
    },
    selectedCommissionType() {
      return this.resolveCommissionTypeByPlanId(this.form.commissionPlanId);
    },
    isCommissionAgentType() {
      return this.form.agentType === "star" || this.form.agentType === "multi";
    },
    availableCommissionOptions() {
      const targetType = this.form.agentType === "star"
        ? "3"
        : this.form.agentType === "multi"
          ? "6"
          : "";
      return this.commissionOptions.filter(item => String(item.commType) === targetType);
    },
    teamCommissionOptions() {
      return this.commissionOptions.filter(item => String(item.commType) === "team");
    },
    teamAgentSelectOptions() {
      const optionMap = new Map();
      this.parentAgentOptions.forEach((item, index) => {
        const name = String(item.name || "").trim();
        if (!name) {
          return;
        }
        const id = item.id || item.agentId || `AGENT-${index + 1}`;
        optionMap.set(String(id), { id: String(id), name });
      });
      this.recommenderOptions.forEach((name, index) => {
        const safeName = String(name || "").trim();
        if (!safeName) {
          return;
        }
        const id = `170${index + 1}`;
        if (!Array.from(optionMap.values()).some(item => item.name === safeName)) {
          optionMap.set(id, { id, name: safeName });
        }
      });
      return Array.from(optionMap.values());
    },
    isTeamLeaderRole() {
      return this.form.agentType === "team"
        && (this.form.teamRole === "leader_multi" || this.form.teamRole === "leader_single");
    },
    isTeamBranchRole() {
      return this.form.agentType === "team" && this.form.teamRole === "branch";
    },
    isStarModel() {
      return this.selectedCommissionType === "3";
    },
    isMultiModel() {
      return this.selectedCommissionType === "6";
    },
    isOriginalMultiModel() {
      return this.originalModelType === "6";
    },
    isOriginalStarModel() {
      return this.originalModelType === "3";
    },
    isOriginalTeamModel() {
      return this.originalModelType === "team";
    },
    showPendingTeamCommissionPlan() {
      return this.isOriginalTeamModel
        && (this.form.targetIdentity === "current_leader_multi"
          || this.form.targetIdentity === "new_leader_single");
    },
    editCommissionPlanLabel() {
      const planName = this.form.commissionPlanName || "未设置佣金方案";
      const typeName = this.isOriginalStarModel ? "星级代理返佣" : "层级代理返佣";
      return `${planName}（${typeName}）`;
    },
    editCommissionPlanValue() {
      return this.form.commissionPlanId || "__current_commission_plan__";
    },
    editCommissionRateText() {
      const rate = this.currentCommissionRate !== null && this.currentCommissionRate !== undefined
        ? this.currentCommissionRate
        : this.form.commissionRate !== null && this.form.commissionRate !== undefined
          ? this.form.commissionRate
          : 0.5;
      return this.formatCommissionRatePercent(rate);
    },
    editSiteProfitShareRateText() {
      const rate = this.currentSiteProfitShareRate !== null && this.currentSiteProfitShareRate !== undefined
        ? this.currentSiteProfitShareRate
        : 0.8;
      return this.formatCommissionRatePercent(rate);
    },
    showCommissionRate() {
      return this.isStarModel || this.isMultiModel;
    },
    starLevelOptions() {
      const levels = this.resolvePlanLevelOptions(this.form.commissionPlanId);
      return levels.length ? levels : [1, 2, 3, 4, 5, 6];
    },
    multiLevelOptions() {
      const levels = this.resolvePlanLevelOptions(this.form.commissionPlanId);
      if (!levels.length) {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9];
      }
      if (this.currentSiteProfitShareRate === null || this.currentSiteProfitShareRate === undefined) {
        return levels;
      }
      return levels.filter(level => this.isAgentLevelBelowSiteRate(level));
    },
    multiLevelParentOptions() {
      const options = this.parentAgentOptions.filter(item => {
        return this.resolveAgentMode(item) === "6" || item.agentType === "multi" || item.agentType === "team";
      });
      const sameSiteOptions = options.filter(item => !this.form.siteCode || item.siteCode === this.form.siteCode);
      return sameSiteOptions.length ? sameSiteOptions : options.length ? options : this.parentAgentOptions.slice(0, 5);
    },
    selectedLevelNum() {
      if (this.isStarModel) {
        return this.form.starLevel;
      }
      if (this.isMultiModel) {
        return this.form.agentLevel;
      }
      return null;
    },
    currentCommissionRate() {
      if (!this.form.commissionPlanId || this.selectedLevelNum == null) {
        return null;
      }
      const detailList = this.commissionDetailMap[this.form.commissionPlanId] || [];
      const matched = detailList.find(item => Number(item.levelNum) === Number(this.selectedLevelNum));
      return matched && matched.commissionRate != null ? matched.commissionRate : null;
    },
    currentCommissionRateText() {
      return this.formatCommissionRatePercent(this.currentCommissionRate);
    },
    currentSiteProfitShareRate() {
      const siteCode = this.form && this.form.siteCode ? this.form.siteCode : null;
      if (!siteCode || !Object.prototype.hasOwnProperty.call(this.siteProfitShareRateMap, siteCode)) {
        return null;
      }
      return this.siteProfitShareRateMap[siteCode];
    },
    currentSiteProfitShareRateText() {
      return this.formatCommissionRatePercent(this.currentSiteProfitShareRate);
    },
    currentMultiLevelRateInvalid() {
      if (!this.isMultiModel || this.currentCommissionRate === null || this.currentCommissionRate === undefined
        || this.currentSiteProfitShareRate === null || this.currentSiteProfitShareRate === undefined) {
        return false;
      }
      const agentRate = this.normalizeRateValue(this.currentCommissionRate);
      const siteRate = this.normalizeRateValue(this.currentSiteProfitShareRate);
      return agentRate !== null && siteRate !== null && agentRate >= siteRate;
    }
  },
  created() {
    this.reset();
    this.applyRouteQuery();
    this.getList();
    this.getSiteOptions();
    this.getCommissionOptions();
    this.getParentAgents();
  },
  methods: {
    unwrapTableData(response) {
      if (!response || typeof response !== "object") {
        return { rows: [], total: 0 };
      }
      if (Array.isArray(response.rows) || typeof response.total !== "undefined") {
        return {
          rows: Array.isArray(response.rows) ? response.rows : [],
          total: Number(response.total || 0)
        };
      }
      const nested = response.data;
      if (nested && (Array.isArray(nested.rows) || typeof nested.total !== "undefined")) {
        return {
          rows: Array.isArray(nested.rows) ? nested.rows : [],
          total: Number(nested.total || 0)
        };
      }
      return { rows: [], total: 0 };
    },
    applyRouteQuery() {
      const query = (this.$route && this.$route.query) || {};
      if (query && query.name !== undefined && query.name !== null) {
        const name = String(query.name).trim();
        if (name) {
          this.queryParams.name = name;
        }
      }
      if (query && query.siteCode !== undefined && query.siteCode !== null) {
        const siteCode = String(query.siteCode).trim();
        if (siteCode) {
          this.queryParams.siteCode = siteCode;
        }
      }
    },
    getList() {
      this.loading = true;
      listAgent({ pageNum: 1, pageSize: 2000 })
        .then(response => {
          const table = this.unwrapTableData(response);
          const result = filterAndPaginateAgentRows(table.rows, this.queryParams, this.dateRange);
          this.agentList = result.rows;
          this.total = result.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 })
        .then(response => {
          this.siteOptions = this.unwrapTableData(response).rows;
          this.siteNameMap = {};
          this.siteOptions.forEach(site => {
            if (site.code && site.nameZn) {
              this.siteNameMap[site.code] = site.nameZn;
            }
          });
        })
        .catch(() => {
          this.siteOptions = [];
          this.siteNameMap = {};
        });
    },
    getSiteName(siteCode) {
      return this.siteNameMap[siteCode] || "";
    },
    handleSiteChange(siteCode) {
      if (!getSiteRecruiterOptions(siteCode).includes(this.form.recruiter)) {
        this.form.recruiter = null;
      }
      this.loadSiteProfitShareRate(siteCode).then(() => {
        this.ensureAvailableMultiLevelSelected();
      });
    },
    loadSiteProfitShareRate(siteCode) {
      if (!siteCode) {
        return Promise.resolve(null);
      }
      if (Object.prototype.hasOwnProperty.call(this.siteProfitShareRateMap, siteCode)) {
        return Promise.resolve(this.siteProfitShareRateMap[siteCode]);
      }
      return getSiteComprehensiveConfig(siteCode)
        .then(response => {
          const percent = response && response.data ? Number(response.data.siteProfitSharePercent) : NaN;
          const rate = Number.isFinite(percent) ? percent / 100 : null;
          this.$set(this.siteProfitShareRateMap, siteCode, rate);
          return rate;
        })
        .catch(() => {
          this.$set(this.siteProfitShareRateMap, siteCode, null);
          return null;
        });
    },
    getCommissionOptions() {
      Promise.all([listCommissionByType("3"), listCommissionByType("6")])
        .then(([starResp, multiResp]) => {
          const starPlans = this.unwrapTableData(starResp).rows;
          const multiPlans = this.unwrapTableData(multiResp).rows;
          const mergedPlans = [...starPlans, ...multiPlans, ...PROTOTYPE_COMMISSION_PLANS];
          const uniquePlanMap = {};
          mergedPlans.forEach(plan => {
            const planId = plan && plan.id != null ? String(plan.id) : null;
            if (!planId) {
              return;
            }
            const commType = plan && plan.commType != null ? String(plan.commType) : "";
            const commTypeName = commType === "3"
              ? "星级代理返佣"
              : commType === "6"
                ? "多层级代理返佣"
                : commType === "team"
                  ? "团队代理返佣"
                  : "未知";
            uniquePlanMap[planId] = { ...plan, commType, commTypeName };
          });
          this.commissionOptions = Object.values(uniquePlanMap);

          this.commissionTypeMap = {};
          this.commissionDetailMap = {};
          this.commissionOptions.forEach(plan => {
            this.commissionTypeMap[plan.id] = plan.commType;
            const detailList = Array.isArray(plan.detailList) ? plan.detailList : [];
            this.$set(
              this.commissionDetailMap,
              plan.id,
              detailList.slice().sort((a, b) => Number(a.levelNum || 0) - Number(b.levelNum || 0))
            );
          });
        })
        .catch(() => {
          this.commissionOptions = PROTOTYPE_COMMISSION_PLANS.map(plan => ({
            ...plan,
            commTypeName: plan.commType === "3"
              ? "星级代理返佣"
              : plan.commType === "6"
                ? "多层级代理返佣"
                : "团队代理返佣"
          }));
          this.commissionTypeMap = {};
          this.commissionDetailMap = {};
          this.commissionOptions.forEach(plan => {
            this.commissionTypeMap[plan.id] = plan.commType;
            this.$set(this.commissionDetailMap, plan.id, plan.detailList.slice());
          });
        });
    },
    getParentAgents() {
      listAgent({ pageNum: 1, pageSize: 2000 })
        .then(response => {
          this.parentAgentOptions = normalizeAgentRows(this.unwrapTableData(response).rows);
        })
        .catch(() => {
          this.parentAgentOptions = [];
        });
    },
    getAgentModeByPlanId(planId) {
      return this.resolveCommissionTypeByPlanId(planId);
    },
    resolveAgentMode(row) {
      if (!row) {
        return null;
      }
      if (row.agentType === "team") {
        return "team";
      }
      if (row.agentType === "multi") {
        return "6";
      }
      if (row.agentType === "star") {
        return "3";
      }
      if (row.commType !== null && row.commType !== undefined && row.commType !== "") {
        return String(row.commType);
      }
      if (row.commissionPlanId) {
        const modeByPlanId = this.getAgentModeByPlanId(row.commissionPlanId);
        if (modeByPlanId) {
          return modeByPlanId;
        }
      }
      const planName = row.commissionPlanName || "";
      if (planName.includes("层级") || planName.includes("多层")) {
        return "6";
      }
      if (planName.includes("星级")) {
        return "3";
      }
      if (row.agentCode) {
        return "6";
      }
      if (row.agentLevel !== null && row.agentLevel !== undefined && row.agentLevel !== "") {
        return "6";
      }
      if (Number(row.starLevel || 0) > 1) {
        return "3";
      }
      return null;
    },
    resolveCommissionTypeByPlanId(planId) {
      if (!planId) {
        return null;
      }
      const selectedPlan = this.commissionOptions.find(item => String(item.id) === String(planId));
      const mapped = this.commissionTypeMap[planId];
      if (mapped !== null && mapped !== undefined && mapped !== "") {
        return String(mapped);
      }
      if (selectedPlan && selectedPlan.commType !== null && selectedPlan.commType !== undefined) {
        return String(selectedPlan.commType);
      }
      return null;
    },
    loadCommissionPlanDetails(planId) {
      if (!planId) {
        return Promise.resolve([]);
      }
      if (Object.prototype.hasOwnProperty.call(this.commissionDetailMap, planId)) {
        return Promise.resolve(this.commissionDetailMap[planId]);
      }
      return getCommission(planId)
        .then(response => {
          const detailList = response && response.data && Array.isArray(response.data.detailList)
            ? response.data.detailList
            : [];
          const sorted = detailList
            .slice()
            .sort((a, b) => Number(a.levelNum || 0) - Number(b.levelNum || 0));
          this.$set(this.commissionDetailMap, planId, sorted);
          return sorted;
        })
        .catch(() => {
          this.$set(this.commissionDetailMap, planId, []);
          return [];
        });
    },
    hasCommissionRateConfigured(detail) {
      return !!(detail && detail.commissionRate !== null && detail.commissionRate !== undefined && detail.commissionRate !== "");
    },
    isStarAgent(row) {
      return this.resolveAgentMode(row) === "3";
    },
    isMultiAgent(row) {
      return this.resolveAgentMode(row) === "6";
    },
    formatAgentLevel(level) {
      if (level === null || level === undefined || level === "") {
        return "-";
      }
      return `${level}层代理`;
    },
    formatStarLevel(level) {
      if (level === null || level === undefined || level === "") {
        return "-";
      }
      return `${level}星代理`;
    },
    formatParentAgentLevel(level) {
      if (level === null || level === undefined || level === "") {
        return "-";
      }
      return `${level}级`;
    },
    formatCommissionRatePercent(rateValue) {
      if (rateValue === null || rateValue === undefined || rateValue === "") {
        return "--";
      }
      const rate = Number(rateValue);
      if (!Number.isFinite(rate)) {
        return String(rateValue);
      }
      const percent = rate <= 1 ? rate * 100 : rate;
      return `${percent.toFixed(2)}%`;
    },
    formatWalletBalance(value) {
      if (value === null || value === undefined || value === "") {
        return "--";
      }
      const amount = Number(value);
      if (!Number.isFinite(amount)) {
        return String(value);
      }
      return amount.toFixed(2);
    },
    formatAgentType(type) {
      if (type === "team") return "团队代理";
      if (type === "multi") return "层级代理";
      return "星级代理";
    },
    normalizeRateValue(rateValue) {
      const rate = Number(rateValue);
      if (!Number.isFinite(rate)) {
        return null;
      }
      return rate > 1 ? rate / 100 : rate;
    },
    getCommissionRateByLevel(planId, level) {
      if (!planId || level === null || level === undefined || level === "") {
        return null;
      }
      const detailList = this.commissionDetailMap[planId] || [];
      const matched = detailList.find(item => Number(item.levelNum) === Number(level));
      return matched && matched.commissionRate !== null && matched.commissionRate !== undefined && matched.commissionRate !== ""
        ? matched.commissionRate
        : null;
    },
    formatParentAgentRate(agent) {
      const rate = this.getCommissionRateByLevel(agent.commissionPlanId, agent.agentLevel);
      const level = Math.max(1, Number(agent.agentLevel || 1));
      const fallbackRate = Math.min(0.75, 0.25 + level * 0.05);
      const displayRate = rate !== null
        ? rate
        : agent.commissionRate !== null && agent.commissionRate !== undefined && agent.commissionRate !== ""
          ? agent.commissionRate
          : fallbackRate;
      return this.formatCommissionRatePercent(displayRate);
    },
    resolvePlanLevelOptions(planId) {
      const detailList = this.commissionDetailMap[planId] || [];
      const levelSet = new Set();
      detailList.forEach(item => {
        const level = Number(item && item.levelNum);
        if (!Number.isInteger(level) || level < 0) {
          return;
        }
        if (!this.hasCommissionRateConfigured(item)) {
          return;
        }
        levelSet.add(level);
      });
      return Array.from(levelSet).sort((a, b) => a - b);
    },
    isAgentLevelBelowSiteRate(level) {
      const siteRate = this.normalizeRateValue(this.currentSiteProfitShareRate);
      if (siteRate === null) {
        return true;
      }
      const agentRate = this.normalizeRateValue(this.getCommissionRateByLevel(this.form.commissionPlanId, level));
      if (agentRate === null) {
        return false;
      }
      return agentRate < siteRate;
    },
    ensureAvailableMultiLevelSelected() {
      if (!this.isMultiModel || !this.multiLevelOptions.length) {
        return;
      }
      if (!this.multiLevelOptions.includes(this.form.agentLevel)) {
        this.form.agentLevel = this.multiLevelOptions[this.multiLevelOptions.length - 1];
      }
    },
    ensureAvailableStarLevelSelected() {
      if (!this.isStarModel || !this.starLevelOptions.length) {
        return;
      }
      if (!this.starLevelOptions.includes(this.form.starLevel)) {
        this.form.starLevel = this.starLevelOptions[0];
      }
    },
    getAgentModeLabel(row) {
      const mode = this.resolveAgentMode(row);
      if (mode === "3") return "星级代理";
      if (mode === "6") return "多层级代理";
      return "未知";
    },
    getAgentModeType(row) {
      const mode = this.resolveAgentMode(row);
      if (mode === "3") return "success";
      if (mode === "6") return "warning";
      return "info";
    },
    handleCommissionPlanChange() {
      const selectedPlan = this.commissionOptions.find(item => String(item.id) === String(this.form.commissionPlanId));
      this.form.commissionPlanName = selectedPlan ? selectedPlan.planName : "";
      this.loadCommissionPlanDetails(this.form.commissionPlanId).then(() => {
        if (this.isStarModel) {
          this.form.agentLevel = 1;
          this.form.agentCode = null;
          if (this.form.starLevel === null || this.form.starLevel === undefined || this.form.starLevel === "") {
            this.form.starLevel = 1;
          }
          this.ensureAvailableStarLevelSelected();
          return;
        }
        if (this.isMultiModel) {
          if (this.form.agentLevel === null || this.form.agentLevel === undefined || this.form.agentLevel === "") {
            this.form.agentLevel = 1;
          }
          this.ensureAvailableMultiLevelSelected();
          this.form.starLevel = 1;
        }
      });
    },
    handleBearAllOperationExpenseChange(value) {
      if (value !== 1) {
        this.form.bearOperationExpenseTypes = [];
      }
    },
    parseOperationExpenseTypes(value) {
      const allowedTypes = this.operationExpenseTypeOptions.map(item => item.value);
      const rawTypes = Array.isArray(value) ? value : String(value || "").split(",");
      return rawTypes
        .map(item => String(item || "").trim())
        .filter(item => allowedTypes.includes(item));
    },
    validateOperationExpenseConfig() {
      if (this.form.bearAllOperationExpense !== 1) {
        this.form.bearAllOperationExpense = 0;
        this.form.bearOperationExpenseTypes = [];
      }
      return true;
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    buildQueryParams() {
      const params = {
        ...this.queryParams,
        params: {}
      };
      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + " 00:00:00";
        params.params.endTime = this.dateRange[1] + " 23:59:59";
      }
      return params;
    },
    async handleExport() {
      this.exportLoading = true;
      try {
        await this.download('member/agent/export', this.buildQueryParams(), `agent_${new Date().getTime()}.xlsx`);
      } finally {
        this.exportLoading = false;
      }
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 20,
        agentId: null,
        name: null,
        recommender: null,
        siteCode: null,
        agentType: null,
        agentStatus: null,
        googleVerify: null
      };
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.selectedAgents = selection;
      this.single = selection.length !== 1;
    },
    reset() {
      this.form = {
        id: null,
        name: null,
        recruiter: null,
        developer: null,
        recommender: null,
        password: null,
        siteCode: null,
        agentType: null,
        agentIdentity: null,
        canAddSubline: null,
        teamRole: null,
        teamName: null,
        teamId: null,
        targetIdentity: "keep",
        newTeamName: null,
        pendingCommissionPlanId: null,
        pendingCommissionPlanName: null,
        currentTeam: "-",
        commissionPlanId: null,
        agentLevel: 1,
        starLevel: 1,
        agentCode: null,
        bearAllOperationExpense: 0,
        bearOperationExpenseTypes: [],
        migrateUnsettledExpense: 0,
        agentStatus: 1,
        agentRemark: null
      };
      this.originalModelType = null;
      if (this.$refs.form) {
        this.$refs.form.clearValidate();
      }
    },
    handleAdd() {
      this.reset();
      this.form.name = "admin";
      this.form.password = "aaaaaa";
      this.open = true;
      this.title = "新增代理";
      this.loadSiteProfitShareRate(this.form.siteCode);
    },
    handleAgentAccountInput(value) {
      this.form.name = String(value || "").replace(/[^A-Za-z0-9]/g, "");
    },
    handleAgentTypeChange(type) {
      this.form.commissionPlanId = null;
      this.form.commissionPlanName = "";
      this.form.agentLevel = type === "multi" ? 1 : null;
      this.form.starLevel = type === "star" ? 1 : null;
      this.form.agentCode = null;
      this.form.agentIdentity = null;
      this.form.canAddSubline = null;
      this.form.teamRole = null;
      this.form.teamName = null;
      this.form.teamId = null;
      if (type === "team") {
        this.form.bearAllOperationExpense = 0;
        this.form.bearOperationExpenseTypes = [];
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(["commissionPlanId", "agentLevel", "starLevel", "agentCode"]);
        }
      });
    },
    handleTeamIdentityChange() {
      this.form.canAddSubline = null;
      this.form.teamRole = null;
      this.clearTeamAgentDetails();
    },
    handleCanAddSublineChange(value) {
      this.form.teamRole = value === 1 ? "leader_multi" : null;
      this.clearTeamAgentDetails();
    },
    handleTeamRoleChange() {
      this.clearTeamAgentDetails();
    },
    clearTeamAgentDetails() {
      this.form.teamName = null;
      this.form.teamId = null;
      this.form.commissionPlanId = null;
      this.form.commissionPlanName = "";
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate(["commissionPlanId"]);
        }
      });
    },
    handleTargetIdentityChange(value) {
      if (value !== "new_leader_single") {
        this.form.newTeamName = null;
      }
      if (value === "current_leader_multi" || value === "new_leader_single") {
        const matchedPlan = this.teamCommissionOptions.find(item => item.planName === this.form.commissionPlanName)
          || this.teamCommissionOptions[0];
        this.form.pendingCommissionPlanId = matchedPlan ? matchedPlan.id : null;
        this.form.pendingCommissionPlanName = matchedPlan ? matchedPlan.planName : null;
        return;
      }
      this.form.pendingCommissionPlanId = null;
      this.form.pendingCommissionPlanName = null;
    },
    handlePendingCommissionPlanChange(planId) {
      const selectedPlan = this.teamCommissionOptions.find(item => String(item.id) === String(planId));
      this.form.pendingCommissionPlanName = selectedPlan ? selectedPlan.planName : null;
    },
    handleUpdate(row) {
      this.reset();
      const id = row && row.id ? row.id : this.ids[0];
      if (!id) {
        this.$modal.msgWarning("请选择要修改的代理");
        return;
      }
      const rowData = row && row.id
        ? row
        : this.selectedAgents.find(item => String(item.id) === String(id))
          || this.agentList.find(item => String(item.id) === String(id));
      if (rowData) {
        this.openAgentEditDialog(rowData);
        return;
      }
      getAgent(id).then(response => {
        this.openAgentEditDialog(response.data || {});
      });
    },
    openAgentEditDialog(agentData) {
      const { password, ...safeAgentData } = agentData || {};
      this.form = {
        ...this.form,
        ...safeAgentData,
        targetIdentity: "keep",
        newTeamName: null,
        pendingCommissionPlanId: null,
        pendingCommissionPlanName: null,
        starLevel: safeAgentData.starLevel === null || safeAgentData.starLevel === undefined || safeAgentData.starLevel === ""
          ? 1
          : safeAgentData.starLevel,
        agentLevel: safeAgentData.agentLevel === null || safeAgentData.agentLevel === undefined || safeAgentData.agentLevel === ""
          ? 1
          : safeAgentData.agentLevel,
        bearAllOperationExpense: Number(safeAgentData.bearAllOperationExpense) === 1 ? 1 : 0,
        bearOperationExpenseTypes: this.parseOperationExpenseTypes(safeAgentData.bearOperationExpenseTypes),
        migrateUnsettledExpense: Number(safeAgentData.migrateUnsettledExpense) === 1 ? 1 : 0
      };
      this.loadCommissionPlanDetails(this.form.commissionPlanId);
      this.loadSiteProfitShareRate(this.form.siteCode);
      this.originalModelType = this.resolveAgentMode(safeAgentData);
      if (this.form.commissionPlanId && this.originalModelType) {
        this.$set(this.commissionTypeMap, this.form.commissionPlanId, this.originalModelType);
      }
      this.open = true;
      this.title = "修改代理";
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateOperationExpenseConfig()) {
          return;
        }

        const payload = {
          ...this.form,
          commType: this.form.agentType === "multi"
            ? "6"
            : this.form.agentType === "star"
              ? "3"
              : "team",
          bearAllOperationExpense: this.form.bearAllOperationExpense === 1 ? 1 : 0,
          bearOperationExpenseTypes: this.form.bearAllOperationExpense === 1
            ? [...this.form.bearOperationExpenseTypes]
            : [],
          userType: 1,
          isAgent: 1
        };
        const request = payload.id
          ? (() => {
            const { password, ...updateData } = payload;
            return updateAgent(updateData);
          })()
          : addAgent(payload);
        this.submitLoading = true;
        request.then(() => {
          this.$modal.msgSuccess(payload.id ? "修改成功" : "新增成功");
          this.open = false;
          this.getList();
          this.getParentAgents();
        }).finally(() => {
          this.submitLoading = false;
        });
      });
    },
    handleResetPwd(row) {
      const id = row && row.id ? row.id : this.ids[0];
      if (!id) {
        this.$modal.msgWarning("请选择要修改密码的代理");
        return;
      }
      const target = row && row.id
        ? row
        : this.selectedAgents.find(item => String(item.id) === String(id))
          || this.agentList.find(item => String(item.id) === String(id));
      this.resetPwdForm = {
        id,
        name: target ? target.name : "",
        newPassword: "",
        confirmPassword: ""
      };
      this.resetPwdOpen = true;
    },
    handleResetWithdrawPwd(row) {
      this.$confirm(
        `确认将代理“${row.name}”的取款密码重置为未设置状态吗？重置后需由代理本人重新设置。`,
        "系统提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        this.$modal.msgSuccess("取款密码已重置为未设置状态");
      }).catch(() => {});
    },
    handleBindDomain() {
      const target = this.selectedAgents[0];
      if (!target) {
        this.$modal.msgWarning("请选择要绑定专属域名的代理");
        return;
      }
      this.$prompt("请输入代理专属域名", `绑定专属域名 - ${target.name}`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: target.dedicatedDomain === "-" ? "" : target.dedicatedDomain,
        inputPlaceholder: "例如：agent.wangcai.test"
      }).then(({ value }) => {
        this.$set(target, "dedicatedDomain", value || "-");
        this.$modal.msgSuccess("专属域名绑定成功");
      }).catch(() => {});
    },
    submitResetPwd() {
      this.$refs.resetPwdForm.validate(valid => {
        if (!valid) {
          return;
        }

        resetAgentPwd({ id: this.resetPwdForm.id, password: this.resetPwdForm.newPassword }).then(() => {
          this.$modal.msgSuccess("密码修改成功");
          this.resetPwdOpen = false;
        });
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    }
  }
};
