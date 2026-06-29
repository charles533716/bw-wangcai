import { listAgent, getAgent, addAgent, updateAgent, resetAgentPwd, getCurrentUserAgentInfo, getSiteProfitShareRate } from "@/api/agent/agent";
import { listCommissionByType, getCommission } from "@/api/agent/commission";
import { DEFAULT_AGENT_CODE, DEFAULT_SITE_CODE, resolvePrototypePath, setBackendContext } from '@/utils/prototypeBackend'
import AgentAdvanceRecordsDialog from '@/components/AgentAdvanceRecordsDialog'

export default {
  name: "Agent",
  components: { AgentAdvanceRecordsDialog },
  dicts: ["sys_agent_level", "sys_star_level"],
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    const validateCommissionPlan = (rule, value, callback) => {
      if (this.hideCommissionPlanField) {
        callback();
        return;
      }
      if (!value) {
        callback(new Error("佣金方案不能为空"));
        return;
      }
      callback();
    };

    return {
      loading: false,
      ids: [],
      single: true,
      advanceRecordOpen: false,
      total: 0,
      agentList: [],
      commissionOptions: [],
      commissionTypeMap: {},
      commissionDetailMap: {},
      siteProfitShareRate: null,
      parentAgentOptions: [],
      currentAgentInfo: null,
      title: "",
      open: false,
      resetPwdOpen: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
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
        name: [{ required: true, message: "代理账号不能为空", trigger: "blur" }],
        password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
        commissionPlanId: [{ validator: validateCommissionPlan, trigger: "change" }],
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
      }
    };
  },
  computed: {
    userName() {
      return this.$store.state.user.userName;
    },
    currentSiteCode() {
      return this.$store.getters.userSiteCode || DEFAULT_SITE_CODE;
    },
    isCurrentAgent() {
      return Number(this.$store.state.user.isAgent || 0) === 1;
    },
    hideCommissionPlanField() {
      return this.isCurrentAgent && !this.form.id;
    },
    selectedCommissionType() {
      if (!this.form.commissionPlanId) {
        return null;
      }
      return this.commissionTypeMap[this.form.commissionPlanId] || null;
    },
    effectiveCommissionType() {
      if (this.selectedCommissionType) {
        return this.selectedCommissionType;
      }
      if (this.isCurrentAgent && !this.form.id) {
        return "6";
      }
      return null;
    },
    isStarModel() {
      return this.effectiveCommissionType === "3";
    },
    isMultiModel() {
      return this.effectiveCommissionType === "6";
    },
    isOriginalMultiModel() {
      return this.originalModelType === "6";
    },
    showCommissionRate() {
      return this.isStarModel || this.isMultiModel;
    },
    currentAgentModelType() {
      return this.resolveAgentMode(this.currentAgentInfo);
    },
    availableCommissionOptions() {
      if (!this.isCurrentAgent) {
        return this.commissionOptions;
      }
      // 代理账号只能新增多层级代理
      return this.commissionOptions.filter(item => item.commType === "6");
    },
    starLevelOptions() {
      return this.resolvePlanLevelOptions(this.form.commissionPlanId);
    },
    availableMultiLevels() {
      const planId = this.form && this.form.commissionPlanId
        ? this.form.commissionPlanId
        : this.getDefaultMultiCommissionPlanId();
      const allLevels = this.resolvePlanLevelOptions(planId)
        .filter(level => this.isAgentLevelBelowSiteRate(level));
      if (!this.isCurrentAgent) {
        return allLevels;
      }
      if (!this.currentAgentInfo || this.currentAgentInfo.agentLevel === null || this.currentAgentInfo.agentLevel === undefined || this.currentAgentInfo.agentLevel === "") {
        return [];
      }
      return allLevels.filter(level => level < Number(this.currentAgentInfo.agentLevel));
    },
    currentAgentLabel() {
      if (!this.currentAgentInfo) {
        return "自动绑定当前代理";
      }
      return `${this.currentAgentInfo.name}（${this.formatParentAgentLevel(this.currentAgentInfo.agentLevel)}）`;
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
      if (this.currentCommissionRate == null) {
        return "--";
      }
      const rate = Number(this.currentCommissionRate);
      if (!Number.isFinite(rate)) {
        return String(this.currentCommissionRate);
      }
      const percent = rate <= 1 ? rate * 100 : rate;
      return percent.toFixed(2) + "%";
    },
    siteProfitShareRateText() {
      return this.formatCommissionRatePercent(this.siteProfitShareRate);
    },
    currentMultiLevelRateInvalid() {
      if (!this.isMultiModel || this.currentCommissionRate === null || this.currentCommissionRate === undefined
        || this.siteProfitShareRate === null || this.siteProfitShareRate === undefined) {
        return false;
      }
      const agentRate = this.normalizeRateValue(this.currentCommissionRate);
      const siteRate = this.normalizeRateValue(this.siteProfitShareRate);
      return agentRate !== null && siteRate !== null && agentRate >= siteRate;
    },
    commissionPlanDisplayName() {
      const planId = this.form ? this.form.commissionPlanId : null;
      const planName = this.form ? this.form.commissionPlanName : "";
      return this.resolveCommissionPlanDisplayName(planId, planName);
    }
  },
  created() {
    this.reset();
    this.getList();
    this.getParentAgents();
    this.getCommissionOptions();
    this.loadCurrentAgentInfo();
    this.loadSiteProfitShareRate();
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
    getList() {
      this.loading = true;
      listAgent(this.queryParams)
        .then(response => {
          const table = this.unwrapTableData(response);
          this.agentList = table.rows;
          this.total = table.total;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleEnterAgentAdmin(row) {
      const siteCode = row.siteCode || this.$store.getters.userSiteCode || DEFAULT_SITE_CODE
      const agentCode = row.agentCode || row.id || DEFAULT_AGENT_CODE
      setBackendContext('agent', { siteCode, agentCode: String(agentCode) })
      this.$message.success(`已进入代理后台：${agentCode}`)
      window.location.href = resolvePrototypePath('/agent-admin/index')
    },
    getCommissionOptions() {
      const request = this.isCurrentAgent
        ? Promise.all([listCommissionByType("6")]).then(([multiResp]) => ({ starPlans: [], multiPlans: this.unwrapTableData(multiResp).rows }))
        : Promise.all([listCommissionByType("3"), listCommissionByType("6")]).then(([starResp, multiResp]) => ({ starPlans: this.unwrapTableData(starResp).rows, multiPlans: this.unwrapTableData(multiResp).rows }));

      request
        .then(({ starPlans, multiPlans }) => {
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
                ? "多层级代理返佣（新）"
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
          this.applyCurrentAgentDefaultCommissionPlan();
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
    loadSiteProfitShareRate() {
      return getSiteProfitShareRate()
        .then(response => {
          const payload = response && response.data ? response.data : response;
          const rawRate = payload && payload.profitShareRate !== undefined && payload.profitShareRate !== null
            ? payload.profitShareRate
            : (payload && payload.siteProfitSharePercent !== undefined && payload.siteProfitSharePercent !== null
              ? Number(payload.siteProfitSharePercent) / 100
              : null);
          this.siteProfitShareRate = rawRate === null ? null : this.normalizeRateValue(rawRate);
          this.ensureAvailableMultiLevelSelected();
          return this.siteProfitShareRate;
        })
        .catch(() => {
          this.siteProfitShareRate = null;
          return null;
        });
    },
    loadCurrentAgentInfo() {
      if (!this.isCurrentAgent || !this.userName) {
        this.currentAgentInfo = null;
        return;
      }
      getCurrentUserAgentInfo(this.userName)
        .then(response => {
          this.currentAgentInfo = response.data || null;
          this.applyCurrentAgentDefaultCommissionPlan();
        })
        .catch(() => {
          this.currentAgentInfo = null;
        });
    },
    getDefaultMultiCommissionPlanId() {
      const multiPlans = this.commissionOptions.filter(item => item.commType === "6");
      if (multiPlans.length) {
        const enabledPlan = multiPlans.find(item => String(item.status) === "0");
        return (enabledPlan || multiPlans[0]).id;
      }
      return this.currentAgentInfo && this.currentAgentInfo.commissionPlanId
        ? this.currentAgentInfo.commissionPlanId
        : null;
    },
    applyCurrentAgentDefaultCommissionPlan() {
      if (!this.open || this.form.id || !this.isCurrentAgent || !this.currentAgentInfo) {
        return;
      }
      if (!this.form.commissionPlanId) {
        const defaultPlanId = this.getDefaultMultiCommissionPlanId();
        if (!defaultPlanId) {
          return;
        }
        this.form.commissionPlanId = defaultPlanId;
      }
      this.handleCommissionPlanChange();
    },
    resolveAgentMode(row) {
      if (!row) {
        return null;
      }
      if (row.commType !== null && row.commType !== undefined && row.commType !== "") {
        return String(row.commType);
      }
      if (row.commissionPlanId && this.commissionTypeMap[row.commissionPlanId]) {
        return this.commissionTypeMap[row.commissionPlanId];
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
    getAgentModeByPlanId(planId) {
      return this.commissionTypeMap[planId] || null;
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
        .catch(error => {
          this.$set(this.commissionDetailMap, planId, []);
          const message = (error && (error.msg || (error.response && error.response.data && error.response.data.msg)))
            ? (error.msg || error.response.data.msg)
            : "获取佣金方案明细失败，请检查权限配置";
          this.$modal.msgError(message);
          return [];
        });
    },
    hasCommissionRateConfigured(detail) {
      return !!(detail && detail.commissionRate !== null && detail.commissionRate !== undefined && detail.commissionRate !== "");
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
      return percent.toFixed(2) + "%";
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
      const siteRate = this.normalizeRateValue(this.siteProfitShareRate);
      if (siteRate === null) {
        return true;
      }
      const planId = this.form && this.form.commissionPlanId
        ? this.form.commissionPlanId
        : this.getDefaultMultiCommissionPlanId();
      const agentRate = this.normalizeRateValue(this.getCommissionRateByLevel(planId, level));
      if (agentRate === null) {
        return false;
      }
      return agentRate < siteRate;
    },
    ensureAvailableMultiLevelSelected() {
      if (!this.isMultiModel || !this.availableMultiLevels.length) {
        return;
      }
      if (!this.availableMultiLevels.includes(this.form.agentLevel)) {
        this.form.agentLevel = this.availableMultiLevels[this.availableMultiLevels.length - 1];
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
    resolveCommissionPlanDisplayName(planId, planName) {
      if (planId !== null && planId !== undefined && planId !== "") {
        const matched = this.commissionOptions.find(item => String(item.id) === String(planId));
        if (matched) {
          return `${matched.planName}（${matched.commTypeName}）`;
        }
      }
      if (planName) {
        return planName;
      }
      if (planId !== null && planId !== undefined && planId !== "") {
        return `方案ID：${planId}`;
      }
      return "未设置";
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
          if (this.isCurrentAgent) {
            this.$modal.msgError("代理账号不能新增星级代理");
            this.form.commissionPlanId = null;
            return;
          }
          this.form.agentLevel = 1;
          this.form.agentCode = null;
          if (this.form.starLevel === null || this.form.starLevel === undefined || this.form.starLevel === "") {
            this.form.starLevel = 1;
          }
          this.ensureAvailableStarLevelSelected();
          return;
        }

        if (this.isMultiModel) {
          if (this.isCurrentAgent) {
            if (!this.currentAgentInfo) {
              this.$modal.msgError("当前代理不是多层级代理，不能新增下级代理");
              this.form.commissionPlanId = null;
              return;
            }
            if (!this.availableMultiLevels.length) {
              this.$modal.msgError("当前代理级别无可新增下级");
              this.form.commissionPlanId = null;
              return;
            }
            this.form.agentCode = this.currentAgentInfo.id;
            if (!this.availableMultiLevels.includes(this.form.agentLevel)) {
              this.form.agentLevel = this.availableMultiLevels[this.availableMultiLevels.length - 1];
            }
          } else if (this.form.agentLevel === null || this.form.agentLevel === undefined || this.form.agentLevel === "") {
            this.form.agentLevel = 1;
          }
          this.ensureAvailableMultiLevelSelected();
          this.form.starLevel = 1;
        }
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: null,
        agentStatus: null
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
    },
    reset() {
      this.form = {
        id: null,
        name: "",
        password: "",
        commissionPlanId: null,
        commissionPlanName: "",
        agentLevel: 1,
        starLevel: 1,
        agentCode: null,
        agentStatus: 1,
        agentRemark: ""
      };
      this.originalModelType = null;
      this.resetForm("form");
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.$nextTick(() => {
        this.form.name = "";
        this.form.password = "";
      });
      if (this.isCurrentAgent) {
        if (this.currentAgentInfo) {
          this.applyCurrentAgentDefaultCommissionPlan();
        } else {
          this.loadCurrentAgentInfo();
        }
      } else {
        this.applyCurrentAgentDefaultCommissionPlan();
      }
      this.title = "新增代理";
    },
    handleUpdate(row) {
      this.reset();
      const id = row && row.id ? row.id : this.ids[0];
      if (!id) {
        return;
      }
      const selectedRow = row || this.agentList.find(item => String(item.id) === String(id));
      getAgent(id).then(response => {
        this.form = {
          ...this.form,
          ...response.data,
          commissionPlanName: response.data.commissionPlanName || (selectedRow ? selectedRow.commissionPlanName : ""),
          starLevel: response.data.starLevel === null || response.data.starLevel === undefined || response.data.starLevel === ""
            ? 1
            : response.data.starLevel
        };
        this.loadCommissionPlanDetails(this.form.commissionPlanId);
        this.originalModelType = this.resolveAgentMode(response.data);
        this.open = true;
        this.title = "修改代理";
      });
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        const payload = {
          ...this.form,
          userType: 1,
          isAgent: 1
        };

        if (this.isCurrentAgent && !payload.id && !payload.commissionPlanId) {
          payload.commissionPlanId = this.getDefaultMultiCommissionPlanId();
        }

        let selectedType = this.commissionTypeMap[payload.commissionPlanId] || null;
        if (!selectedType && this.isCurrentAgent && !payload.id) {
          selectedType = "6";
        }
        if (!selectedType) {
          selectedType = this.resolveAgentMode(payload);
        }
        if (!selectedType) {
          this.$modal.msgError("请选择有效的佣金方案");
          return;
        }

        this.loadCommissionPlanDetails(payload.commissionPlanId).then(detailList => {
          if (!Array.isArray(detailList) || !detailList.length) {
            this.$modal.msgError("无法获取佣金方案明细，请检查代理角色权限");
            return;
          }
          const currentLevel = selectedType === "3" ? payload.starLevel : payload.agentLevel;
          const matchedDetail = (Array.isArray(detailList) ? detailList : [])
            .find(item => Number(item.levelNum) === Number(currentLevel));
          if (!this.hasCommissionRateConfigured(matchedDetail)) {
            const levelLabel = selectedType === "3" ? "星级级别" : "层级级别";
            this.$modal.msgError(`${levelLabel}${currentLevel}未配置返佣比例，请选择有返佣比例的级别`);
            return;
          }
          if (selectedType === "6" && !payload.id && this.currentMultiLevelRateInvalid) {
            this.$modal.msgError(`代理返佣比例${this.currentCommissionRateText}不能大于或等于站点返佣比例${this.siteProfitShareRateText}`);
            return;
          }

          if (selectedType === "3") {
            if (this.isCurrentAgent) {
              this.$modal.msgError("代理账号不能新增星级代理");
              return;
            }
            payload.agentLevel = 1;
            payload.agentCode = null;
            if (payload.starLevel === null || payload.starLevel === undefined || payload.starLevel === "") {
              payload.starLevel = 1;
            }
          } else {
            if (payload.agentLevel === null || payload.agentLevel === undefined || payload.agentLevel === "") {
              payload.agentLevel = 1;
            }

            if (this.isCurrentAgent) {
              if (!this.currentAgentInfo) {
                this.$modal.msgError("当前代理不是多层级代理，不能新增下级代理");
                return;
              }
              if (payload.agentLevel >= this.currentAgentInfo.agentLevel) {
                this.$modal.msgError("新增代理级别必须低于当前代理级别");
                return;
              }
              payload.agentCode = this.currentAgentInfo.id;
            }
          }

          if (payload.id) {
            const { password, ...updateData } = payload;
            updateAgent(updateData).then(() => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.getParentAgents();
            });
            return;
          }

          addAgent(payload).then(() => {
            this.$modal.msgSuccess("新增成功");
            this.open = false;
            this.getList();
            this.getParentAgents();
          });
        });
      });
    },
    handleResetPwd(row) {
      const id = row && row.id ? row.id : this.ids[0];
      if (!id) {
        return;
      }
      const applyResetPwdTarget = (target) => {
        const agentName = this.resolveAgentAccount(target);
        this.resetPwdForm = {
          id: target && target.id ? target.id : id,
          name: agentName,
          newPassword: "",
          confirmPassword: ""
        };
        this.resetPwdOpen = true;
      };

      const target = row || this.agentList.find(item => String(item.id) === String(id));
      if (target) {
        applyResetPwdTarget(target);
        // 列表若缺少账号字段，回查详情补齐展示
        if (this.resetPwdForm.name) {
          return;
        }
      }

      getAgent(id).then(response => {
        const detail = response && response.data ? response.data : {};
        applyResetPwdTarget({ ...(target || {}), ...detail, id });
      });
    },
    resolveAgentAccount(agent) {
      if (!agent) {
        return "";
      }
      return agent.name || agent.agentName || agent.userName || agent.username || "";
    },
    submitResetPwd() {
      this.$refs.resetPwdForm.validate(valid => {
        if (!valid) {
          return;
        }
        resetAgentPwd({ id: this.resetPwdForm.id, password: this.resetPwdForm.newPassword }).then(() => {
          this.$modal.msgSuccess("密码重置成功");
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
