import { listAgent, getAgent, addAgent, updateAgent, resetAgentPwd } from "@/api/agent/agent";
import { listSite } from "@/api/site/site";
import { getSiteComprehensiveConfig } from "@/api/site/config";
import { listCommissionByType, getCommission } from "@/api/agent/commission";

export default {
  name: "Agent",
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
      exportLoading: false,
      submitLoading: false,
      title: "",
      open: false,
      resetPwdOpen: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        siteCode: null,
        agentStatus: null
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
          { min: 3, max: 20, message: "账号长度在 3 到 20 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" }
        ],
        siteCode: [{ required: true, message: "站点编码不能为空", trigger: "change" }],
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
        { value: "DEPOSIT_FEE", label: "充值手续费" },
        { value: "WITHDRAW_FEE", label: "提现手续费" },
        { value: "REBATE", label: "返水" },
        { value: "VENUE_FEE", label: "三方场馆" },
        { value: "BONUS", label: "礼金" },
        { value: "ACTIVITY_REWARD", label: "活动奖励" },
        { value: "PROMOTION_BONUS", label: "推广礼金" }
      ]
    };
  },
  computed: {
    selectedCommissionType() {
      return this.resolveCommissionTypeByPlanId(this.form.commissionPlanId);
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
    showCommissionRate() {
      return this.isStarModel || this.isMultiModel;
    },
    starLevelOptions() {
      return this.resolvePlanLevelOptions(this.form.commissionPlanId);
    },
    multiLevelOptions() {
      const levels = this.resolvePlanLevelOptions(this.form.commissionPlanId);
      if (this.currentSiteProfitShareRate === null || this.currentSiteProfitShareRate === undefined) {
        return levels;
      }
      return levels.filter(level => this.isAgentLevelBelowSiteRate(level));
    },
    multiLevelParentOptions() {
      return this.parentAgentOptions.filter(item => this.resolveAgentMode(item) === "6");
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
      listAgent(this.buildQueryParams())
        .then(response => {
          const table = this.unwrapTableData(response);
          this.agentList = table.rows;
          this.total = table.total;
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
          const mergedPlans = [...starPlans, ...multiPlans];
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
          this.commissionOptions = [];
          this.commissionTypeMap = {};
          this.commissionDetailMap = {};
        });
    },
    getParentAgents() {
      listAgent({ pageNum: 1, pageSize: 2000 })
        .then(response => {
          this.parentAgentOptions = this.unwrapTableData(response).rows;
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
        return true;
      }
      if (!Array.isArray(this.form.bearOperationExpenseTypes) || this.form.bearOperationExpenseTypes.length === 0) {
        this.$modal.msgError("承担全部运营费用时至少选择一个运营费用种类");
        return false;
      }
      this.form.bearOperationExpenseTypes = this.parseOperationExpenseTypes(this.form.bearOperationExpenseTypes);
      if (this.form.bearOperationExpenseTypes.length === 0) {
        this.$modal.msgError("承担全部运营费用时至少选择一个有效的运营费用种类");
        return false;
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
        pageSize: 10,
        name: null,
        siteCode: null,
        agentStatus: null
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
        password: null,
        siteCode: null,
        commissionPlanId: null,
        agentLevel: 1,
        starLevel: 1,
        agentCode: null,
        bearAllOperationExpense: 0,
        bearOperationExpenseTypes: [],
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
      this.open = true;
      this.title = "新增代理";
      this.loadSiteProfitShareRate(this.form.siteCode);
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
        starLevel: safeAgentData.starLevel === null || safeAgentData.starLevel === undefined || safeAgentData.starLevel === ""
          ? 1
          : safeAgentData.starLevel,
        bearAllOperationExpense: Number(safeAgentData.bearAllOperationExpense) === 1 ? 1 : 0,
        bearOperationExpenseTypes: this.parseOperationExpenseTypes(safeAgentData.bearOperationExpenseTypes)
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
        if (!valid) {
          return;
        }

        const selectedType = this.selectedCommissionType;
        if (!selectedType) {
          this.$modal.msgError("请选择有效的佣金方案");
          return;
        }
        if (!this.validateOperationExpenseConfig()) {
          return;
        }

        this.submitLoading = true;
        this.loadCommissionPlanDetails(this.form.commissionPlanId).then(detailList => {
          const currentLevel = selectedType === "3" ? this.form.starLevel : this.form.agentLevel;
          const matchedDetail = (Array.isArray(detailList) ? detailList : [])
            .find(item => Number(item.levelNum) === Number(currentLevel));

          if (!this.hasCommissionRateConfigured(matchedDetail)) {
            const levelLabel = selectedType === "3" ? "星级级别" : "层级级别";
            this.$modal.msgError(`${levelLabel}${currentLevel}未配置返佣比例，请选择有返佣比例的级别`);
            return null;
          }
          if (selectedType === "6" && !this.form.id && this.currentMultiLevelRateInvalid) {
            this.$modal.msgError(`代理返佣比例${this.currentCommissionRateText}不能大于或等于站点返佣比例${this.currentSiteProfitShareRateText}`);
            return null;
          }

          const payload = {
            ...this.form,
            bearAllOperationExpense: this.form.bearAllOperationExpense === 1 ? 1 : 0,
            bearOperationExpenseTypes: this.form.bearAllOperationExpense === 1
              ? this.form.bearOperationExpenseTypes.join(",")
              : null,
            userType: 1,
            isAgent: 1
          };

          if (selectedType === "3") {
            payload.agentLevel = 1;
            payload.agentCode = null;
            if (payload.starLevel === null || payload.starLevel === undefined || payload.starLevel === "") {
              payload.starLevel = 1;
            }
          } else {
            if (payload.agentLevel === null || payload.agentLevel === undefined || payload.agentLevel === "") {
              payload.agentLevel = 1;
            }
            if (this.form.id && this.isOriginalMultiModel) {
              payload.agentLevel = this.form.agentLevel;
              payload.agentCode = this.form.agentCode;
            }
          }

          if (payload.id) {
            const { password, ...updateData } = payload;
            return updateAgent(updateData).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.getParentAgents();
            });
          }

          return addAgent(payload).then(() => {
            this.$modal.msgSuccess("新增成功");
            this.open = false;
            this.getList();
            this.getParentAgents();
          });
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
      getAgent(id).then(response => {
        this.resetPwdForm = {
          id: response.data.id,
          name: response.data.name,
          newPassword: "",
          confirmPassword: ""
        };
        this.resetPwdOpen = true;
      });
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
