const STORAGE_KEY = "master-admin-prototype:pay-channel-settings:v3";

const clone = value => JSON.parse(JSON.stringify(value));

const depositTypeOptions = [
  { label: "USDT", value: "usdt", tagType: "info" },
  { label: "支付宝", value: "alipay", tagType: "success" },
  { label: "NEXUS", value: "nexus", tagType: "warning" },
  { label: "EBpay", value: "ebpay", tagType: "info" },
  { label: "支付宝Ehipay", value: "alipay_ehipay", tagType: "primary" },
  { label: "支付宝小额UID", value: "alipay_uid", tagType: "primary" },
  { label: "支付宝蓝精灵扫码", value: "alipay_blue", tagType: "primary" },
  { label: "支付宝小金条", value: "alipay_gold", tagType: "primary" },
  { label: "支付宝到银行卡双通", value: "alipay_bank", tagType: "primary" },
  { label: "支付宝聚合", value: "alipay_union", tagType: "primary" }
];

const depositCoinOptions = [
  { label: "人民币", value: "CNY", tagType: "primary" },
  { label: "USDT", value: "USDT", tagType: "success" },
  { label: "NEXUS", value: "NEXUS", tagType: "warning" },
  { label: "EB", value: "EB", tagType: "warning" }
];

const defaultSites = [
  { siteCode: "2222", label: "演示总站" },
  { siteCode: "SITE001", label: "旺财总站" },
  { siteCode: "SITE002", label: "星河体育" },
  { siteCode: "SITE003", label: "蓝海娱乐" }
];

const createDefaultFeeRates = () => [{ min: 0, max: 100000, rate: 2 }];

const networkPresets = {
  TRC20: {
    networkName: "TRON",
    networkCode: "tron",
    tokenStandard: "TRC-20",
    asset: "USDT",
    contractAddress: "TXLAQ63Xgt1NAzckPwKHvzw7CSEmLMEqcdj",
    enabled: true
  },
  BSC: {
    networkName: "BNB Smart Chain",
    networkCode: "bsc",
    tokenStandard: "BEP-20",
    asset: "USDT",
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    enabled: true
  },
  ETH: {
    networkName: "Ethereum",
    networkCode: "ethereum",
    tokenStandard: "ERC-20",
    asset: "USDT",
    contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    enabled: false
  },
  NEXUS: {
    networkName: "NEXUS",
    networkCode: "nexus",
    tokenStandard: "NEXUS",
    asset: "NEXUS",
    contractAddress: "NexusPrototypeContract",
    enabled: true
  },
  EB: {
    networkName: "EBpay",
    networkCode: "eb",
    tokenStandard: "EB",
    asset: "EB",
    contractAddress: "EBPrototypeContract",
    enabled: true
  }
};

const normalizeNetworkKey = value => String(value || "")
  .trim()
  .toUpperCase()
  .replace(/[-_\s]/g, "");

const getNetworkPreset = item => {
  const values = [
    item && item.networkName,
    item && item.networkCode,
    item && item.tokenStandard,
    item
  ].map(normalizeNetworkKey);
  if (values.some(value => value === "TRON" || value === "TRC20")) return networkPresets.TRC20;
  if (values.some(value => value === "BSC" || value === "BNB" || value === "BNBSMARTCHAIN" || value === "BEP20")) return networkPresets.BSC;
  if (values.some(value => value === "ETH" || value === "ETHEREUM" || value === "ERC20")) return networkPresets.ETH;
  if (values.some(value => value === "NEXUS")) return networkPresets.NEXUS;
  if (values.some(value => value === "EB" || value === "EBPAY")) return networkPresets.EB;
  return null;
};

const normalizeRechargeNetwork = (item = {}, editing = false) => {
  const preset = getNetworkPreset(item) || {};
  return {
    networkName: item.networkName || preset.networkName || "",
    networkCode: item.networkCode || preset.networkCode || "",
    tokenStandard: item.tokenStandard || preset.tokenStandard || "",
    asset: item.asset || preset.asset || "USDT",
    contractAddress: item.contractAddress || preset.contractAddress || item.address || "",
    feeMode: item.feeMode || "tiered_rate",
    enabled: item.enabled !== undefined ? item.enabled : (preset.enabled !== undefined ? preset.enabled : true),
    editing
  };
};

const createDefaultForm = () => ({
  id: null,
  payType: "alipay",
  payTypeName: "支付宝",
  sortOrder: 1,
  payCoin: "CNY",
  payCoinName: "人民币",
  exchangeRate: null,
  isFixedAmount: 1,
  fixedAmounts: "100,200,500",
  isFloatingAmount: 1,
  minAmount: 1,
  maxAmount: 100000,
  providerType: "hipay",
  providerWayCode: "",
  feeMode: "tiered_rate",
  feeRates: createDefaultFeeRates(),
  minFeeCny: 0,
  fixedFee: null,
  payeeName: "1",
  status: "1",
  bankName: "",
  accountName: "",
  accountNumber: "",
  qrCode: null,
  icon: null,
  remark: "",
  selectedClients: ["PC", "H5", "APP"],
  selectedSiteCodes: [],
  supportedClients: "PC,H5,APP",
  supportedSiteCodes: null,
  supportedSiteCodeList: [],
  rechargeNetworks: [],
  conditionEnabled: true,
  vipLevelLimit: "VIP3"
});

const buildFeeConfig = (mode = "tiered_rate", networks = []) => {
  const config = {
    feeMode: mode,
    feeRates: [{ min: 0, max: 100000, rate: 0.02, desc: "0-100000" }],
    minFeeCny: 0,
    fixedFee: mode === "fixed_fee" ? 1 : null
  };
  if (networks.length) {
    config.protocolFeeConfigs = {};
    networks.forEach(item => {
      const key = item.networkCode || item.networkName;
      config.protocolFeeConfigs[key] = {
        feeMode: item.feeMode,
        feeRates: config.feeRates,
        minFeeCny: 0,
        fixedFee: item.feeMode === "fixed_fee" ? 1 : null
      };
    });
  }
  return JSON.stringify(config);
};

const networkRows = names => names.map(name => ({
  ...normalizeRechargeNetwork(name),
  feeMode: "tiered_rate"
}));

const defaultRows = [
  {
    id: 12,
    payType: "usdt",
    payTypeName: "USDT",
    payCoin: "USDT",
    payCoinName: "USDT",
    providerType: "tronpay",
    providerWayCode: "",
    sortOrder: 1,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "10,20,30,50,100,200,300,500,1000,5000,10000,20000",
    minAmount: 1,
    maxAmount: 1000000,
    status: "1",
    createTime: "2025-12-03 18:30",
    rechargeNetworks: networkRows(["TRC20", "BSC", "ETH"]),
    selectedClients: ["PC", "H5", "APP"],
    selectedSiteCodes: [],
    conditionEnabled: true,
    vipLevelLimit: "VIP3"
  },
  {
    id: 14,
    payType: "alipay",
    payTypeName: "支付宝",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "hipay",
    providerWayCode: "",
    sortOrder: 2,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "1,1000,2000,3000,5000,10000",
    minAmount: 1,
    maxAmount: 1000000,
    status: "1",
    createTime: "2025-12-03 18:30",
    rechargeNetworks: [],
    selectedClients: ["PC", "H5"],
    selectedSiteCodes: ["2222", "SITE001"],
    conditionEnabled: true,
    vipLevelLimit: "VIP1"
  },
  {
    id: 47,
    payType: "nexus",
    payTypeName: "NEXUS",
    payCoin: "NEXUS",
    payCoinName: "NEXUS",
    providerType: "nexus",
    providerWayCode: "",
    sortOrder: 3,
    payeeName: "支付渠道名字",
    isFixedAmount: 0,
    isFloatingAmount: 1,
    fixedAmounts: "",
    minAmount: 1,
    maxAmount: 1000000,
    status: "1",
    createTime: "2026-05-30 21:32",
    rechargeNetworks: networkRows(["NEXUS"]),
    selectedClients: ["PC", "H5", "APP"],
    selectedSiteCodes: ["2222"],
    conditionEnabled: false,
    vipLevelLimit: "VIP0"
  },
  {
    id: 46,
    payType: "ebpay",
    payTypeName: "EBpay",
    payCoin: "EB",
    payCoinName: "EB",
    providerType: "jiayunpay",
    providerWayCode: "2182",
    sortOrder: 3,
    payeeName: "老四",
    isFixedAmount: 0,
    isFloatingAmount: 1,
    fixedAmounts: "",
    minAmount: 100,
    maxAmount: 10000,
    status: "1",
    createTime: "2026-05-29 23:47",
    rechargeNetworks: networkRows(["EB"]),
    selectedClients: ["H5", "APP"],
    selectedSiteCodes: ["SITE001"],
    conditionEnabled: true,
    vipLevelLimit: "VIP2"
  },
  {
    id: 48,
    payType: "alipay_ehipay",
    payTypeName: "支付宝Ehipay",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "hipay",
    providerWayCode: "A2",
    sortOrder: 4,
    payeeName: "老四",
    isFixedAmount: 0,
    isFloatingAmount: 1,
    fixedAmounts: "",
    minAmount: 1,
    maxAmount: 10000,
    status: "1",
    createTime: "2026-06-07 01:28",
    rechargeNetworks: [],
    selectedClients: ["PC", "H5"],
    selectedSiteCodes: ["SITE002"],
    conditionEnabled: true,
    vipLevelLimit: "VIP3"
  },
  {
    id: 26,
    payType: "alipay_uid",
    payTypeName: "支付宝小额UID",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "xmfpay",
    providerWayCode: "201",
    sortOrder: 4,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "200,1000,2000,5000",
    minAmount: 200,
    maxAmount: 5000,
    status: "1",
    createTime: "2026-04-09 12:39",
    rechargeNetworks: [],
    selectedClients: ["H5"],
    selectedSiteCodes: ["SITE003"],
    conditionEnabled: false,
    vipLevelLimit: "VIP0"
  },
  {
    id: 25,
    payType: "alipay_blue",
    payTypeName: "支付宝蓝精灵扫码",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "xmfpay",
    providerWayCode: "119",
    sortOrder: 5,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "500,1000,2000,4000,8000,50000",
    minAmount: 5,
    maxAmount: 50000,
    status: "1",
    createTime: "2026-04-08 23:23",
    rechargeNetworks: [],
    selectedClients: ["PC", "H5"],
    selectedSiteCodes: [],
    conditionEnabled: true,
    vipLevelLimit: "VIP3"
  },
  {
    id: 27,
    payType: "alipay_gold",
    payTypeName: "支付宝小金条",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "xmfpay",
    providerWayCode: "209",
    sortOrder: 6,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "100,200",
    minAmount: 100,
    maxAmount: 200,
    status: "1",
    createTime: "2026-04-09 12:40",
    rechargeNetworks: [],
    selectedClients: ["APP"],
    selectedSiteCodes: ["SITE001", "SITE002"],
    conditionEnabled: true,
    vipLevelLimit: "VIP2"
  },
  {
    id: 28,
    payType: "alipay_bank",
    payTypeName: "支付宝到银行卡双通",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "xmfpay",
    providerWayCode: "212",
    sortOrder: 7,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "50,100,150,200",
    minAmount: 50,
    maxAmount: 200,
    status: "1",
    createTime: "2026-04-09 12:42",
    rechargeNetworks: [],
    selectedClients: ["PC", "APP"],
    selectedSiteCodes: [],
    conditionEnabled: false,
    vipLevelLimit: "VIP0"
  },
  {
    id: 29,
    payType: "alipay_union",
    payTypeName: "支付宝聚合",
    payCoin: "CNY",
    payCoinName: "人民币",
    providerType: "xmfpay",
    providerWayCode: "224",
    sortOrder: 8,
    payeeName: "1",
    isFixedAmount: 1,
    isFloatingAmount: 1,
    fixedAmounts: "500,1000,2000,5000,10000",
    minAmount: 1,
    maxAmount: 10000,
    status: "1",
    createTime: "2026-04-09 12:43",
    rechargeNetworks: [],
    selectedClients: ["H5", "APP"],
    selectedSiteCodes: ["2222", "SITE003"],
    conditionEnabled: true,
    vipLevelLimit: "VIP4"
  }
].map(row => ({
  ...createDefaultForm(),
  ...row,
  feeMode: row.feeMode || "tiered_rate",
  feeRates: createDefaultFeeRates(),
  feeConfig: buildFeeConfig(row.feeMode || "tiered_rate", row.rechargeNetworks || [])
}));

export default {
  name: "PayChannel",
  dicts: ["plat_type"],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      allPayChannelRows: [],
      payChannelList: [],
      siteOptions: clone(defaultSites),
      depositTypeOptions,
      depositCoinOptions,
      statusOptions: [
        { label: "启用", value: "1" },
        { label: "停用", value: "0" }
      ],
      providerTypeOptions: [
        { value: "hipay", label: "HiPay" },
        { value: "tronpay", label: "TronPay" },
        { value: "xmfpay", label: "XMFPay" },
        { value: "jiayunpay", label: "佳运支付" },
        { value: "nexus", label: "NEXUS" },
        { value: "ebpay", label: "EBpay" }
      ],
      networkOptions: [
        { label: "TRC20", value: "TRC20" },
        { label: "BSC", value: "BEP20" },
        { label: "ETH", value: "ERC20" },
        { label: "NEXUS", value: "NEXUS" },
        { label: "EB", value: "EB" }
      ],
      vipLevelOptions: [
        { label: "不限制", value: "VIP0" },
        { label: "VIP 1 及以上", value: "VIP1" },
        { label: "VIP 2 及以上", value: "VIP2" },
        { label: "VIP 3 及以上", value: "VIP3" },
        { label: "VIP 4 及以上", value: "VIP4" },
        { label: "VIP 5 及以上", value: "VIP5" }
      ],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        payType: null,
        payCoin: null,
        status: "1"
      },
      form: createDefaultForm(),
      rechargeNetworkDialog: {
        visible: false,
        title: "",
        index: -1,
        form: normalizeRechargeNetwork("TRC20", false)
      },
      rules: {
        payType: [{ required: true, message: "存款类型不能为空", trigger: "change" }],
        payCoin: [{ required: true, message: "存款币种不能为空", trigger: "change" }],
        providerType: [{ required: true, message: "上游服务商不能为空", trigger: "change" }],
        sortOrder: [{ required: true, message: "展示排序不能为空", trigger: "blur" }],
        status: [{ required: true, message: "通道状态不能为空", trigger: "change" }],
        payeeName: [{ required: true, message: "支付姓名不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getSiteOptions();
    this.getList();
  },
  methods: {
    getSiteOptions() {
      this.siteOptions = clone(defaultSites);
    },
    loadRows() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) {
            return parsed.map(row => this.normalizeRow(row));
          }
        }
      } catch (e) {
        console.warn("读取存款设置演示数据失败", e);
      }
      return clone(defaultRows).map(row => this.normalizeRow(row));
    },
    persistRows(rows) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    },
    normalizeRow(row) {
      const merged = { ...createDefaultForm(), ...row };
      merged.payTypeName = this.getOptionLabel(this.depositTypeOptions, merged.payType, merged.payTypeName);
      merged.payCoinName = this.getOptionLabel(this.depositCoinOptions, merged.payCoin, merged.payCoinName);
      merged.rechargeNetworks = Array.isArray(merged.rechargeNetworks)
        ? merged.rechargeNetworks.map(item => normalizeRechargeNetwork(item, false))
        : [];
      merged.selectedClients = this.toArray(merged.selectedClients || merged.supportedClients);
      merged.selectedSiteCodes = this.toArray(merged.selectedSiteCodes || merged.supportedSiteCodes);
      merged.supportedSiteCodeList = merged.selectedSiteCodes.slice();
      merged.feeRates = Array.isArray(merged.feeRates) && merged.feeRates.length
        ? merged.feeRates
        : createDefaultFeeRates();
      merged.feeConfig = buildFeeConfig(merged.feeMode, merged.rechargeNetworks);
      return merged;
    },
    toArray(value) {
      if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean);
      }
      if (!value) {
        return [];
      }
      return String(value).split(",").map(item => item.trim()).filter(Boolean);
    },
    getOptionLabel(options, value, fallback) {
      const found = options.find(item => item.value === value);
      return found ? found.label : (fallback || value || "-");
    },
    getPayTypeTagType(row) {
      const found = this.depositTypeOptions.find(item => item.value === row.payType);
      return found ? found.tagType : "info";
    },
    getPayCoinTagType(row) {
      const found = this.depositCoinOptions.find(item => item.value === row.payCoin);
      return found ? found.tagType : "info";
    },
    displayPayType(row) {
      return row.payTypeName || this.getOptionLabel(this.depositTypeOptions, row.payType, "-");
    },
    displayPayCoin(row) {
      return row.payCoinName || this.getOptionLabel(this.depositCoinOptions, row.payCoin, "-");
    },
    getProviderTypeLabel(providerType) {
      const key = String(providerType || "").trim().toLowerCase();
      const found = this.providerTypeOptions.find(item => item.value === key);
      return found ? found.label : (providerType || "-");
    },
    getProviderWayCodePlaceholder(providerType) {
      const key = String(providerType || "").trim().toLowerCase();
      if (key === "hipay") return "留空走旧商户，填写走新商户通道编码";
      if (key === "xmfpay") return "请输入 XMFPay 通道编码";
      if (key === "jiayunpay") return "请输入佳运支付通道编码（数字）";
      return "当前服务商可留空";
    },
    isDigitalPayCoin(payCoin) {
      return ["USDT", "NEXUS", "EB"].includes(String(payCoin || "").toUpperCase());
    },
    isNexusChannel() {
      return String(this.form.providerType || "").toLowerCase() === "nexus"
        || String(this.form.payType || "").toLowerCase() === "nexus"
        || String(this.form.payCoin || "").toUpperCase() === "NEXUS";
    },
    requiresUsdCnyRate(payCoin) {
      return ["USDT", "NEXUS", "EB"].includes(String(payCoin || "").toUpperCase());
    },
    getFixedFeeUnit(payCoin) {
      const coin = String(payCoin || "").toUpperCase();
      if (coin === "CNY") return "CNY";
      if (coin === "NEXUS") return "NEXUS";
      if (coin === "EB") return "EB";
      return "U";
    },
    formatAmountType(row) {
      if (row.isFixedAmount === 1 && row.isFloatingAmount === 1) return "固定+浮动";
      if (row.isFixedAmount === 1) return "固定金额";
      if (row.isFloatingAmount === 1) return "浮动区间";
      return "-";
    },
    formatAmountRange(row) {
      const parts = [];
      if (row.isFixedAmount === 1 && row.fixedAmounts) {
        parts.push("固定:" + row.fixedAmounts);
      }
      if (row.isFloatingAmount === 1 && row.minAmount && row.maxAmount) {
        parts.push(`${row.minAmount}-${row.maxAmount}`);
      }
      return parts.length ? parts.join(" | ") : "-";
    },
    formatFeeMode(mode) {
      return mode === "fixed_fee" ? "固定手续费" : "按档位费率";
    },
    formatProtocolFeeSummary(row) {
      if (!Array.isArray(row.rechargeNetworks) || !row.rechargeNetworks.length) {
        return "-";
      }
      return row.rechargeNetworks
        .map(item => `${item.tokenStandard || item.networkName || item.networkCode}: ${this.formatFeeMode(item.feeMode)}`)
        .join(" / ");
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
    filterRows(rows) {
      return rows.filter(row => {
        if (this.queryParams.payType && row.payType !== this.queryParams.payType) return false;
        if (this.queryParams.payCoin && row.payCoin !== this.queryParams.payCoin) return false;
        if (this.queryParams.status && row.status !== this.queryParams.status) return false;
        return true;
      });
    },
    getList() {
      this.loading = true;
      const rows = this.loadRows();
      this.allPayChannelRows = rows;
      const filtered = this.filterRows(rows);
      this.total = filtered.length;
      const start = (this.queryParams.pageNum - 1) * this.queryParams.pageSize;
      this.payChannelList = filtered.slice(start, start + this.queryParams.pageSize);
      this.loading = false;
    },
    handlePayTypeChange(value) {
      const type = this.depositTypeOptions.find(item => item.value === value);
      this.form.payTypeName = type ? type.label : "";
      if (value === "nexus") {
        this.form.providerType = "nexus";
        this.form.payCoin = "NEXUS";
        this.form.payCoinName = "NEXUS";
        this.ensureDefaultNetworks();
      }
      if (value === "usdt") {
        this.form.providerType = "tronpay";
        this.form.payCoin = "USDT";
        this.form.payCoinName = "USDT";
        this.ensureDefaultNetworks();
      }
    },
    handleProviderTypeChange(value) {
      if (value === "tronpay") {
        this.form.payCoin = "USDT";
        this.form.payCoinName = "USDT";
        this.ensureDefaultNetworks();
      }
      if (value === "nexus") {
        this.form.payType = "nexus";
        this.form.payTypeName = "NEXUS";
        this.form.payCoin = "NEXUS";
        this.form.payCoinName = "NEXUS";
        this.ensureDefaultNetworks();
      }
    },
    handlePayCoinChange(value) {
      this.form.payCoinName = this.getOptionLabel(this.depositCoinOptions, value, value);
      if (this.isDigitalPayCoin(value)) {
        this.ensureDefaultNetworks();
      } else {
        this.form.rechargeNetworks = [];
      }
    },
    ensureDefaultNetworks() {
      if (Array.isArray(this.form.rechargeNetworks) && this.form.rechargeNetworks.length) {
        this.syncProtocolsFromNetworks();
        return;
      }
      const coin = String(this.form.payCoin || "").toUpperCase();
      if (coin === "USDT") this.form.rechargeNetworks = networkRows(["TRC20", "BSC", "ETH"]);
      else if (coin === "NEXUS") this.form.rechargeNetworks = networkRows(["NEXUS"]);
      else if (coin === "EB") this.form.rechargeNetworks = networkRows(["EB"]);
      this.syncProtocolsFromNetworks();
    },
    handleRechargeNetworkNameChange(item) {
      const found = this.networkOptions.find(network => network.label === item.networkName);
      item.networkCode = found ? found.value : item.networkName;
      this.syncProtocolsFromNetworks();
    },
    createRechargeNetworkDialogForm(item) {
      return normalizeRechargeNetwork(item, false);
    },
    openRechargeNetworkDialog(item, index) {
      this.rechargeNetworkDialog.index = typeof index === "number" ? index : -1;
      this.rechargeNetworkDialog.title = this.rechargeNetworkDialog.index >= 0 ? "修改充值网络" : "新增充值网络";
      this.rechargeNetworkDialog.form = this.createRechargeNetworkDialogForm(item);
      this.rechargeNetworkDialog.visible = true;
    },
    addRechargeNetwork() {
      const coin = String(this.form.payCoin || "").toUpperCase();
      const fallback = coin === "USDT" ? "TRC20" : (coin || "NETWORK");
      this.openRechargeNetworkDialog(fallback, -1);
    },
    submitRechargeNetworkDialog() {
      const network = normalizeRechargeNetwork(this.rechargeNetworkDialog.form, false);
      if (!network.networkName || !network.networkCode || !network.tokenStandard) {
        this.$modal.msgWarning("请填写网络名称、网络代码和代币标准");
        return;
      }
      if (this.rechargeNetworkDialog.index >= 0) {
        this.$set(this.form.rechargeNetworks, this.rechargeNetworkDialog.index, network);
      } else {
        this.form.rechargeNetworks.push(network);
      }
      this.syncProtocolsFromNetworks();
      this.cancelRechargeNetworkDialog();
    },
    cancelRechargeNetworkDialog() {
      this.rechargeNetworkDialog.visible = false;
      this.rechargeNetworkDialog.index = -1;
      this.rechargeNetworkDialog.form = normalizeRechargeNetwork("TRC20", false);
    },
    removeRechargeNetwork(index) {
      if (this.form.rechargeNetworks.length <= 1) return;
      this.form.rechargeNetworks.splice(index, 1);
      this.syncProtocolsFromNetworks();
    },
    syncProtocolsFromNetworks() {
      this.form.usdtProtocols = this.form.rechargeNetworks
        .map(item => item.tokenStandard || item.networkCode || item.networkName)
        .filter(Boolean)
        .join(",");
    },
    addFeeRateRow() {
      this.form.feeRates.push({ min: null, max: null, rate: null });
    },
    removeFeeRateRow(index) {
      if (this.form.feeRates.length <= 1) return;
      this.form.feeRates.splice(index, 1);
    },
    cancel() {
      this.open = false;
      this.$nextTick(() => this.reset());
    },
    reset() {
      this.form = createDefaultForm();
      if (this.$refs.form) {
        this.$refs.form.clearValidate();
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      if (this.$refs.queryForm) {
        this.$refs.queryForm.clearValidate();
      }
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        payType: null,
        payCoin: null,
        status: "1"
      };
      this.handleQuery();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "新增存款设置";
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    handleUpdate(row) {
      const target = row || this.allPayChannelRows.find(item => item.id === this.ids[0]);
      if (!target) {
        this.$modal.msgWarning("请选择要修改的存款设置");
        return;
      }
      this.form = this.normalizeRow(clone(target));
      this.open = true;
      this.title = "修改存款设置";
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
    },
    buildSubmitPayload() {
      const payload = this.normalizeRow(clone(this.form));
      payload.payTypeName = this.getOptionLabel(this.depositTypeOptions, payload.payType, payload.payTypeName);
      payload.payCoinName = this.getOptionLabel(this.depositCoinOptions, payload.payCoin, payload.payCoinName);
      payload.supportedClients = payload.selectedClients.join(",");
      payload.supportedSiteCodeList = payload.selectedSiteCodes.slice();
      payload.supportedSiteCodes = payload.selectedSiteCodes.join(",");
      if (!this.isDigitalPayCoin(payload.payCoin)) {
        payload.rechargeNetworks = [];
      }
      payload.rechargeNetworks = payload.rechargeNetworks.map(item => ({
        ...normalizeRechargeNetwork(item, false),
        editing: false
      }));
      payload.usdtProtocols = payload.rechargeNetworks
        .map(item => item.tokenStandard || item.networkCode || item.networkName)
        .filter(Boolean)
        .join(",");
      payload.feeConfig = buildFeeConfig(payload.feeMode, payload.rechargeNetworks);
      return payload;
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        if (this.isDigitalPayCoin(this.form.payCoin) && !this.form.rechargeNetworks.length) {
          this.$modal.msgError("数字货币存款必须至少配置一个充值网络");
          return;
        }
        const payload = this.buildSubmitPayload();
        const rows = this.loadRows();
        if (payload.id != null) {
          const index = rows.findIndex(item => item.id === payload.id);
          if (index >= 0) rows.splice(index, 1, payload);
          this.$modal.msgSuccess("修改成功");
        } else {
          payload.id = Math.max(...rows.map(item => Number(item.id) || 0), 0) + 1;
          payload.createTime = this.parseTime(new Date(), "{y}-{m}-{d} {h}:{i}");
          rows.unshift(payload);
          this.$modal.msgSuccess("新增成功");
        }
        this.persistRows(rows);
        this.open = false;
        this.getList();
      });
    },
    handleDelete(row) {
      const ids = row ? [row.id] : this.ids;
      if (!ids.length) {
        this.$modal.msgWarning("请选择要删除的存款设置");
        return;
      }
      this.$modal.confirm(`是否确认删除存款设置编号为"${ids.join(",")}"的数据项？`).then(() => {
        const rows = this.loadRows().filter(item => !ids.includes(item.id));
        this.persistRows(rows);
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
