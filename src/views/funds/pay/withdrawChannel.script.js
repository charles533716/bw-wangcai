const STORAGE_KEY = "master-admin-prototype:withdraw-channel-settings:v2";

const WITHDRAW_TYPE_OPTIONS = [
  { label: "EBpay", value: "ebpay", tagType: "warning" },
  { label: "支付宝", value: "alipay", tagType: "success" },
  { label: "USDT", value: "usdt", tagType: "" }
];

const WITHDRAW_COIN_OPTIONS = [
  { label: "EB", value: "EB", tagType: "warning" },
  { label: "人民币", value: "CNY", tagType: "" },
  { label: "USDT", value: "USDT", tagType: "success" },
  { label: "NEXUS", value: "NEXUS", tagType: "warning" }
];

const STATUS_OPTIONS = [
  { label: "启用", value: "1" },
  { label: "停用", value: "0" }
];

const PLATFORM_OPTIONS = [
  { label: "Telegram", value: "Telegram" },
  { label: "H5", value: "H5" },
  { label: "PC", value: "PC" },
  { label: "Android", value: "Android" },
  { label: "IOS", value: "IOS" }
];

const SITE_OPTIONS = [
  { siteCode: "2222", label: "演示总站" },
  { siteCode: "SITE001", label: "旺财总站" },
  { siteCode: "SITE002", label: "星河体育" },
  { siteCode: "SITE003", label: "蓝海娱乐" }
];

const PROVIDER_OPTIONS = [
  { label: "TronPay", value: "TronPay" },
  { label: "HiPay", value: "HiPay" },
  { label: "佳运支付", value: "佳运支付" },
  { label: "NEXUS", value: "NEXUS" }
];

const VIP_OPTIONS = [
  { label: "VIP 1 及以上", value: "VIP1" },
  { label: "VIP 2 及以上", value: "VIP2" },
  { label: "VIP 3 及以上", value: "VIP3" },
  { label: "VIP 5 及以上", value: "VIP5" }
];

const NETWORK_PRESETS = {
  USDT: [
    {
      networkName: "TRON",
      networkCode: "tron",
      tokenStandard: "TRC-20",
      asset: "USDT",
      contractAddress: "TXLAQ63Xgt1NAzckPwKHvzw7CSEmLMEqcdj",
      enabled: true
    },
    {
      networkName: "BNB Smart Chain",
      networkCode: "bsc",
      tokenStandard: "BEP-20",
      asset: "USDT",
      contractAddress: "0x55d398326f99059fF775485246999027B3197955",
      enabled: true
    },
    {
      networkName: "Ethereum",
      networkCode: "ethereum",
      tokenStandard: "ERC-20",
      asset: "USDT",
      contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      enabled: true
    }
  ],
  EB: [
    {
      networkName: "EBpay",
      networkCode: "ebpay",
      tokenStandard: "EB",
      asset: "EB",
      contractAddress: "-",
      enabled: true
    }
  ],
  NEXUS: [
    {
      networkName: "NEXUS",
      networkCode: "nexus",
      tokenStandard: "NEXUS",
      asset: "NEXUS",
      contractAddress: "-",
      enabled: true
    }
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowText() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function createFeeRates() {
  return [{ min: 0, max: 100000, rate: 2 }];
}

function createNetworks(coin) {
  const key = String(coin || "").toUpperCase();
  return clone(NETWORK_PRESETS[key] || NETWORK_PRESETS.USDT).map(item => ({
    ...item,
    editing: false
  }));
}

function normalizeNetwork(item, editing = false) {
  return {
    networkName: item && item.networkName || "",
    networkCode: item && item.networkCode || "",
    tokenStandard: item && item.tokenStandard || item && item.protocol || "",
    asset: item && item.asset || "",
    contractAddress: item && item.contractAddress || "",
    enabled: item && item.enabled !== undefined ? !!item.enabled : true,
    editing
  };
}

function normalizeNetworkKey(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[-_\s]/g, "");
}

function seedRows() {
  return [
    {
      id: 15,
      withdrawType: "ebpay",
      withdrawCoin: "EB",
      providerName: "佳运支付",
      providerWayCode: "2182",
      exchangeRate: "1",
      singleMaxAmount: 20000,
      dailyLimit: 100000,
      feeMode: "tiered_rate",
      feeRates: createFeeRates(),
      fixedFee: 0,
      minWithdrawAmount: 100,
      withdrawNetworks: createNetworks("EB"),
      supportedPlatforms: "Telegram,H5,PC,Android,IOS",
      selectedPlatforms: ["Telegram", "H5", "PC", "Android", "IOS"],
      selectedSiteCodes: ["2222", "SITE001"],
      conditionEnabled: true,
      vipLimit: "VIP3",
      status: "1",
      createTime: "2026-05-29 23:46",
      remark: "EBpay 取款演示通道"
    },
    {
      id: 14,
      withdrawType: "alipay",
      withdrawCoin: "CNY",
      providerName: "HiPay",
      providerWayCode: "",
      exchangeRate: "1",
      singleMaxAmount: 10000,
      dailyLimit: 50000,
      feeMode: "tiered_rate",
      feeRates: createFeeRates(),
      fixedFee: 0,
      minWithdrawAmount: 100,
      withdrawNetworks: [],
      supportedPlatforms: "H5,Android,PC,IOS",
      selectedPlatforms: ["H5", "Android", "PC", "IOS"],
      selectedSiteCodes: ["2222", "SITE003"],
      conditionEnabled: false,
      vipLimit: "VIP1",
      status: "1",
      createTime: "2026-02-21 16:48",
      remark: "支付宝取款演示通道"
    },
    {
      id: 12,
      withdrawType: "usdt",
      withdrawCoin: "USDT",
      providerName: "TronPay",
      providerWayCode: "",
      exchangeRate: "6.8",
      singleMaxAmount: 201,
      dailyLimit: 301,
      feeMode: "tiered_rate",
      feeRates: createFeeRates(),
      fixedFee: 0,
      minWithdrawAmount: 100,
      withdrawNetworks: createNetworks("USDT"),
      supportedPlatforms: "H5,PC,Android,IOS,Telegram",
      selectedPlatforms: ["H5", "PC", "Android", "IOS", "Telegram"],
      selectedSiteCodes: ["2222", "SITE001", "SITE002"],
      conditionEnabled: true,
      vipLimit: "VIP2",
      status: "1",
      createTime: "2025-12-03 20:45",
      remark: "USDT 取款演示通道"
    }
  ];
}

export default {
  name: "WithdrawChannel",
  data() {
    return {
      loading: false,
      showSearch: true,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      allRows: [],
      withdrawChannelList: [],
      open: false,
      title: "",
      withdrawTypeOptions: WITHDRAW_TYPE_OPTIONS,
      withdrawCoinOptions: WITHDRAW_COIN_OPTIONS,
      statusOptions: STATUS_OPTIONS,
      providerOptions: PROVIDER_OPTIONS,
      platformOptions: PLATFORM_OPTIONS,
      siteOptions: SITE_OPTIONS,
      vipOptions: VIP_OPTIONS,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        withdrawType: null,
        withdrawCoin: null,
        status: null
      },
      form: {},
      withdrawNetworkDialog: {
        visible: false,
        title: "",
        index: -1,
        form: normalizeNetwork({}, false)
      },
      rules: {
        withdrawType: [{ required: true, message: "取款类型不能为空", trigger: "change" }],
        withdrawCoin: [{ required: true, message: "取款币种不能为空", trigger: "change" }],
        providerName: [{ required: true, message: "上游服务商不能为空", trigger: "change" }],
        exchangeRate: [{ required: true, message: "取款汇率不能为空", trigger: "blur" }],
        singleMaxAmount: [{ required: true, message: "单笔上限不能为空", trigger: "blur" }],
        dailyLimit: [{ required: true, message: "每日限额不能为空", trigger: "blur" }],
        feeMode: [{ required: true, message: "手续费模式不能为空", trigger: "change" }],
        status: [{ required: true, message: "状态不能为空", trigger: "change" }]
      }
    };
  },
  created() {
    this.reset();
    this.loadRows();
    this.getList();
  },
  methods: {
    loadRows() {
      const cached = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          this.allRows = JSON.parse(cached).map(this.normalizeRow);
          return;
        } catch (e) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      this.allRows = seedRows().map(this.normalizeRow);
      this.saveRows();
    },
    saveRows() {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.allRows.map(this.buildSubmitPayload)));
      }
    },
    normalizeRow(row) {
      const networks = Array.isArray(row.withdrawNetworks)
        ? row.withdrawNetworks.map(item => normalizeNetwork(item, false))
        : this.isDigitalWithdrawCoin(row.withdrawCoin)
          ? createNetworks(row.withdrawCoin)
          : [];
      const platforms = Array.isArray(row.selectedPlatforms)
        ? row.selectedPlatforms
        : String(row.supportedPlatforms || "").split(",").map(item => item.trim()).filter(Boolean);
      return {
        ...row,
        id: row.id,
        feeMode: row.feeMode || "tiered_rate",
        feeRates: Array.isArray(row.feeRates) && row.feeRates.length ? row.feeRates : createFeeRates(),
        fixedFee: row.fixedFee || 0,
        minWithdrawAmount: row.minWithdrawAmount || 0,
        withdrawNetworks: networks,
        selectedPlatforms: platforms,
        supportedPlatforms: platforms.join(","),
        selectedSiteCodes: Array.isArray(row.selectedSiteCodes) ? row.selectedSiteCodes : [],
        conditionEnabled: !!row.conditionEnabled,
        vipLimit: row.vipLimit || "VIP1",
        status: row.status || "1",
        createTime: row.createTime || nowText()
      };
    },
    getList() {
      this.loading = true;
      const filtered = this.allRows.filter(row => {
        const byType = !this.queryParams.withdrawType || row.withdrawType === this.queryParams.withdrawType;
        const byCoin = !this.queryParams.withdrawCoin || row.withdrawCoin === this.queryParams.withdrawCoin;
        const byStatus = !this.queryParams.status || row.status === this.queryParams.status;
        return byType && byCoin && byStatus;
      });
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize;
      this.total = filtered.length;
      this.withdrawChannelList = filtered.slice(start, start + this.queryParams.pageSize);
      this.loading = false;
    },
    getOptionLabel(options, value) {
      const found = options.find(item => item.value === value);
      return found ? found.label : value || "-";
    },
    getTypeTag(value) {
      const found = this.withdrawTypeOptions.find(item => item.value === value);
      return found ? found.tagType : "";
    },
    getCoinTag(value) {
      const found = this.withdrawCoinOptions.find(item => item.value === value);
      return found ? found.tagType : "";
    },
    formatFeeMode(mode) {
      return mode === "fixed_fee" ? "固定手续费" : "按档位费率";
    },
    formatPlatforms(platforms) {
      return String(platforms || "").split(",").filter(Boolean).join("、") || "-";
    },
    formatProtocolFeeSummary(row) {
      if (!this.isDigitalWithdrawCoin(row.withdrawCoin)) return "-";
      const networks = Array.isArray(row.withdrawNetworks) ? row.withdrawNetworks : [];
      if (!networks.length) return "-";
      return networks.map(item => `${item.tokenStandard || item.networkCode || item.networkName}: ${this.formatFeeMode(row.feeMode)}`).join(" / ");
    },
    isDigitalWithdrawCoin(coin) {
      return ["USDT", "EB", "NEXUS"].includes(String(coin || "").toUpperCase());
    },
    getFixedFeeUnit(coin) {
      return this.isDigitalWithdrawCoin(coin) ? String(coin || "U") : "CNY";
    },
    getNetworkIconKey(item) {
      const values = [item && item.networkName, item && item.networkCode, item && item.tokenStandard]
        .map(normalizeNetworkKey);
      if (values.some(value => value === "TRON" || value === "TRC20")) return "trc20";
      if (values.some(value => value === "BSC" || value === "BNB" || value === "BNBSMARTCHAIN" || value === "BEP20")) return "bsc";
      if (values.some(value => value === "ETH" || value === "ETHEREUM" || value === "ERC20")) return "eth";
      if (values.some(value => value === "NEXUS")) return "nexus";
      if (values.some(value => value === "EB" || value === "EBPAY")) return "eb";
      return "default";
    },
    getNetworkIconLabel(item) {
      const labels = {
        trc20: "T",
        bsc: "B",
        eth: "E",
        nexus: "N",
        eb: "EB",
        default: "P"
      };
      return labels[this.getNetworkIconKey(item)] || labels.default;
    },
    getNetworkIconClass(item) {
      return "is-" + this.getNetworkIconKey(item);
    },
    handleWithdrawTypeChange(value) {
      if (value === "usdt") {
        this.form.withdrawCoin = "USDT";
        this.form.providerName = "TronPay";
        this.ensureDigitalNetworks();
      } else if (value === "ebpay") {
        this.form.withdrawCoin = "EB";
        this.form.providerName = "佳运支付";
        this.ensureDigitalNetworks();
      } else if (value === "alipay") {
        this.form.withdrawCoin = "CNY";
        this.form.providerName = "HiPay";
        this.form.withdrawNetworks = [];
      }
    },
    handleWithdrawCoinChange(value) {
      if (this.isDigitalWithdrawCoin(value)) {
        this.ensureDigitalNetworks();
      } else {
        this.form.withdrawNetworks = [];
      }
    },
    ensureDigitalNetworks() {
      if (!this.isDigitalWithdrawCoin(this.form.withdrawCoin)) return;
      if (!Array.isArray(this.form.withdrawNetworks) || !this.form.withdrawNetworks.length) {
        this.$set(this.form, "withdrawNetworks", createNetworks(this.form.withdrawCoin));
      }
    },
    addWithdrawNetwork() {
      const preset = createNetworks(this.form.withdrawCoin)[0] || normalizeNetwork({}, true);
      this.openWithdrawNetworkDialog(preset, -1);
    },
    removeWithdrawNetwork(index) {
      if (this.form.withdrawNetworks.length <= 1) return;
      this.form.withdrawNetworks.splice(index, 1);
    },
    openWithdrawNetworkDialog(item, index) {
      this.withdrawNetworkDialog.index = typeof index === "number" ? index : -1;
      this.withdrawNetworkDialog.title = this.withdrawNetworkDialog.index >= 0 ? "修改取款网络" : "新增取款网络";
      this.withdrawNetworkDialog.form = normalizeNetwork(item, false);
      this.withdrawNetworkDialog.visible = true;
    },
    submitWithdrawNetworkDialog() {
      const network = normalizeNetwork(this.withdrawNetworkDialog.form, false);
      if (!network.networkName || !network.networkCode || !network.tokenStandard) {
        this.$modal.msgWarning("请填写网络名称、网络代码和代币标准");
        return;
      }
      if (this.withdrawNetworkDialog.index >= 0) {
        this.$set(this.form.withdrawNetworks, this.withdrawNetworkDialog.index, network);
      } else {
        this.form.withdrawNetworks.push(network);
      }
      this.cancelWithdrawNetworkDialog();
    },
    cancelWithdrawNetworkDialog() {
      this.withdrawNetworkDialog.visible = false;
      this.withdrawNetworkDialog.index = -1;
      this.withdrawNetworkDialog.form = normalizeNetwork({}, false);
    },
    addFeeRateRow() {
      this.form.feeRates.push({ min: null, max: null, rate: null });
    },
    removeFeeRateRow(index) {
      if (this.form.feeRates.length <= 1) return;
      this.form.feeRates.splice(index, 1);
    },
    reset() {
      this.form = {
        id: null,
        withdrawType: "alipay",
        withdrawCoin: "CNY",
        providerName: "HiPay",
        providerWayCode: "",
        exchangeRate: "1",
        singleMaxAmount: 10000,
        dailyLimit: 50000,
        feeMode: "tiered_rate",
        feeRates: createFeeRates(),
        fixedFee: 0,
        minWithdrawAmount: 100,
        withdrawNetworks: [],
        selectedPlatforms: ["H5", "PC", "Android", "IOS"],
        selectedSiteCodes: [],
        conditionEnabled: false,
        vipLimit: "VIP1",
        status: "1",
        remark: ""
      };
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate();
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: this.queryParams.pageSize,
        withdrawType: null,
        withdrawCoin: null,
        status: null
      };
      this.getList();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增取款设置";
    },
    handleUpdate(row) {
      const id = row && row.id ? row.id : this.ids[0];
      const target = this.allRows.find(item => item.id === id);
      if (!target) {
        this.$modal.msgWarning("请选择要修改的取款设置");
        return;
      }
      this.form = this.normalizeRow(clone(target));
      this.open = true;
      this.title = "修改取款设置";
    },
    buildSubmitPayload(row) {
      const payload = { ...row };
      payload.withdrawNetworks = (payload.withdrawNetworks || []).map(item => normalizeNetwork(item, false));
      payload.supportedPlatforms = (payload.selectedPlatforms || []).join(",");
      payload.createTime = payload.createTime || nowText();
      return payload;
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        if (this.isDigitalWithdrawCoin(this.form.withdrawCoin) && !this.form.withdrawNetworks.length) {
          this.$modal.msgError("数字货币取款必须至少配置一个取款网络");
          return;
        }
        const payload = this.buildSubmitPayload(this.form);
        if (payload.id) {
          this.allRows = this.allRows.map(item => item.id === payload.id ? payload : item);
          this.$modal.msgSuccess("修改成功");
        } else {
          payload.id = Math.max(0, ...this.allRows.map(item => Number(item.id) || 0)) + 1;
          payload.createTime = nowText();
          this.allRows.unshift(payload);
          this.$modal.msgSuccess("新增成功");
        }
        this.saveRows();
        this.open = false;
        this.getList();
      });
    },
    cancel() {
      this.open = false;
      this.reset();
    },
    handleDelete(row) {
      const ids = row && row.id ? [row.id] : this.ids;
      if (!ids.length) {
        this.$modal.msgWarning("请选择要删除的取款设置");
        return;
      }
      this.$modal.confirm(`是否确认删除取款设置编号为"${ids.join(",")}"的数据项？`).then(() => {
        this.allRows = this.allRows.filter(item => !ids.includes(item.id));
        this.saveRows();
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
