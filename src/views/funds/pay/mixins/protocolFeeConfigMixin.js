const DEFAULT_PROTOCOL_FEE_OPTIONS = {
  coinField: "payCoin",
  typeField: "payType",
  tieredRowLabel: "手续费档位",
  parseWarn: "解析手续费配置失败",
  includeFixedMinWithdrawCny: false
};

export default {
  data() {
    return {
      lastActiveFeeProtocol: null
    };
  },
  computed: {
    protocolFeeOptions() {
      return {
        ...DEFAULT_PROTOCOL_FEE_OPTIONS,
        ...(this.protocolFeeConfigOptions || {})
      };
    }
  },
  methods: {
    formatFeeMode(mode) {
      return mode === "fixed_fee" ? "固定手续费" : "按档位费率";
    },
    isTronPayUsdtChannel() {
      const coin = this.form[this.protocolFeeOptions.coinField];
      const type = this.form[this.protocolFeeOptions.typeField];
      return coin === "USDT"
        && (String(this.form.providerType || "").toLowerCase() === "tronpay"
          || String(type || "").toLowerCase() === "tronpay");
    },
    shouldUseProtocolFeeConfig() {
      return this.isTronPayUsdtChannel()
        && Array.isArray(this.form.selectedUsdtProtocols)
        && this.form.selectedUsdtProtocols.length > 0;
    },
    normalizeProtocolKey(protocol) {
      const compact = String(protocol || "").trim().toUpperCase().replace(/[-_]/g, "");
      if (compact === "728126428" || compact === "TRON" || compact === "TRC20") {
        return "TRC20";
      }
      if (compact === "1" || compact === "ETH" || compact === "ETHEREUM" || compact === "ERC20") {
        return "ERC20";
      }
      if (compact === "56" || compact === "BSC" || compact === "BSC20" || compact === "BEP20") {
        return "BEP20";
      }
      return String(protocol || "").trim().toUpperCase();
    },
    resolveFormProtocolValue(protocolKey) {
      const canonicalKey = this.normalizeProtocolKey(protocolKey);
      const found = (this.dict.type.chain_id || []).find(item => this.normalizeProtocolKey(item.value) === canonicalKey);
      return found ? found.value : protocolKey;
    },
    getProtocolName(protocolValue) {
      const canonicalKey = this.normalizeProtocolKey(protocolValue);
      if (canonicalKey === "TRC20") {
        return "TRC20";
      }
      if (canonicalKey === "BEP20") {
        return "BSC";
      }
      if (canonicalKey === "ERC20") {
        return "ETH";
      }
      const protocol = (this.dict.type.chain_id || []).find(item => item.value === protocolValue);
      return protocol ? protocol.label : protocolValue;
    },
    formatProtocolFeeSummary(row) {
      const feeConfig = this.parseFeeConfigObject(row && row.feeConfig);
      const protocolConfigs = feeConfig && feeConfig.protocolFeeConfigs;
      if (!protocolConfigs || typeof protocolConfigs !== "object" || Array.isArray(protocolConfigs)) {
        return "-";
      }
      const orderedProtocols = ["TRC20", "BEP20", "ERC20"]
        .filter(protocol => Object.keys(protocolConfigs).some(key => this.normalizeProtocolKey(key) === protocol));
      const extraProtocols = Object.keys(protocolConfigs)
        .filter(protocol => !orderedProtocols.includes(this.normalizeProtocolKey(protocol)));
      const summaries = [...orderedProtocols, ...extraProtocols].map(protocol => {
        const sourceKey = Object.keys(protocolConfigs).find(key => this.normalizeProtocolKey(key) === this.normalizeProtocolKey(protocol)) || protocol;
        const config = protocolConfigs[sourceKey] || {};
        const mode = config.feeMode || config.fee_mode || feeConfig.feeMode || (row && row.feeMode);
        return `${this.getProtocolName(protocol)}: ${this.formatFeeMode(mode)}`;
      });
      return summaries.length ? summaries.join(" / ") : "-";
    },
    parseFeeConfigObject(feeConfig) {
      if (!feeConfig) {
        return null;
      }
      try {
        return typeof feeConfig === "string" ? JSON.parse(feeConfig) : feeConfig;
      } catch (e) {
        console.warn(this.protocolFeeOptions.parseWarn, e);
        return null;
      }
    },
    getCurrentFeeEditorState() {
      const state = {
        feeMode: this.form.feeMode || "tiered_rate",
        feeRates: Array.isArray(this.form.feeRates)
          ? this.form.feeRates.map(item => ({ ...item }))
          : this.createDefaultFeeRates(),
        minFeeCny: this.form.minFeeCny,
        fixedFee: this.form.fixedFee
      };
      if (this.protocolFeeOptions.includeFixedMinWithdrawCny) {
        state.fixedMinWithdrawCny = this.form.fixedMinWithdrawCny;
      }
      return state;
    },
    createFeeEditorStateFromConfig(feeMode, feeConfig) {
      const state = {
        feeMode: feeMode || "tiered_rate",
        feeRates: this.createDefaultFeeRates(),
        minFeeCny: 0,
        fixedFee: null
      };
      if (this.protocolFeeOptions.includeFixedMinWithdrawCny) {
        state.fixedMinWithdrawCny = null;
      }
      const parsedConfig = this.parseFeeConfigObject(feeConfig);
      if (!parsedConfig || typeof parsedConfig !== "object") {
        return state;
      }
      state.feeMode = parsedConfig.feeMode || state.feeMode;
      const feeRates = parsedConfig.feeRates || parsedConfig.fee_rates;
      if (Array.isArray(feeRates) && feeRates.length > 0) {
        state.feeRates = feeRates.map(item => ({
          min: item.min === undefined || item.min === null ? null : Number(item.min),
          max: item.max === undefined || item.max === null ? null : Number(item.max),
          rate: this.normalizeRateForDisplay(item.rate)
        }));
      }
      const fixedFee = this.resolveFixedFeeValue(parsedConfig, this.form[this.protocolFeeOptions.coinField]);
      if (fixedFee !== undefined && fixedFee !== null && fixedFee !== "") {
        state.fixedFee = Number(fixedFee);
      }
      const minFeeCny = parsedConfig.minFeeCny !== undefined
        ? parsedConfig.minFeeCny
        : parsedConfig.min_fee_cny;
      if (minFeeCny !== undefined && minFeeCny !== null && minFeeCny !== "") {
        state.minFeeCny = Number(minFeeCny);
      }
      if (this.protocolFeeOptions.includeFixedMinWithdrawCny) {
        const fixedMinWithdrawCny = parsedConfig.fixedMinWithdrawCny !== undefined
          ? parsedConfig.fixedMinWithdrawCny
          : (parsedConfig.minWithdrawCny !== undefined
            ? parsedConfig.minWithdrawCny
            : (parsedConfig.fixedMinAmountCny !== undefined
              ? parsedConfig.fixedMinAmountCny
              : parsedConfig.min_amount_cny));
        if (fixedMinWithdrawCny !== undefined && fixedMinWithdrawCny !== null && fixedMinWithdrawCny !== "") {
          state.fixedMinWithdrawCny = Number(fixedMinWithdrawCny);
        }
      }
      return state;
    },
    applyFeeEditorState(state) {
      const next = state || this.createFeeEditorStateFromConfig("tiered_rate", null);
      this.form.feeMode = next.feeMode || "tiered_rate";
      this.$set(this.form, "feeRates", Array.isArray(next.feeRates)
        ? next.feeRates.map(item => ({ ...item }))
        : this.createDefaultFeeRates());
      this.$set(this.form, "minFeeCny", next.minFeeCny === undefined ? 0 : next.minFeeCny);
      this.$set(this.form, "fixedFee", next.fixedFee === undefined ? null : next.fixedFee);
      if (this.protocolFeeOptions.includeFixedMinWithdrawCny) {
        this.$set(this.form, "fixedMinWithdrawCny", next.fixedMinWithdrawCny === undefined ? null : next.fixedMinWithdrawCny);
      }
    },
    saveActiveProtocolFeeConfig(protocol) {
      const active = protocol || this.lastActiveFeeProtocol || this.form.activeFeeProtocol;
      if (active) {
        this.$set(this.form.protocolFeeConfigs, active, this.getCurrentFeeEditorState());
      }
    },
    resetProtocolFeeConfigState() {
      this.$set(this.form, "activeFeeProtocol", null);
      this.$set(this.form, "protocolFeeConfigs", {});
      this.lastActiveFeeProtocol = null;
    },
    ensureProtocolFeeConfigs() {
      if (!this.form.protocolFeeConfigs || typeof this.form.protocolFeeConfigs !== "object") {
        this.$set(this.form, "protocolFeeConfigs", {});
      }
      const baseState = this.getCurrentFeeEditorState();
      const selected = this.form.selectedUsdtProtocols || [];
      selected.forEach(protocol => {
        if (!this.form.protocolFeeConfigs[protocol]) {
          this.$set(this.form.protocolFeeConfigs, protocol, {
            ...baseState,
            feeRates: baseState.feeRates.map(item => ({ ...item }))
          });
        }
      });
      Object.keys(this.form.protocolFeeConfigs).forEach(protocol => {
        if (!selected.includes(protocol)) {
          this.$delete(this.form.protocolFeeConfigs, protocol);
        }
      });
      if (!selected.includes(this.form.activeFeeProtocol)) {
        this.$set(this.form, "activeFeeProtocol", selected[0] || null);
      }
      this.lastActiveFeeProtocol = this.form.activeFeeProtocol;
    },
    switchFeeProtocol(protocol) {
      if (this.lastActiveFeeProtocol && this.lastActiveFeeProtocol !== protocol) {
        this.saveActiveProtocolFeeConfig(this.lastActiveFeeProtocol);
      }
      const state = this.form.protocolFeeConfigs && this.form.protocolFeeConfigs[protocol]
        ? this.form.protocolFeeConfigs[protocol]
        : this.createFeeEditorStateFromConfig(this.form.feeMode, null);
      this.applyFeeEditorState(state);
      this.$set(this.form, "activeFeeProtocol", protocol);
      this.lastActiveFeeProtocol = protocol;
    },
    applyProtocolFeeConfigToForm(rootConfig, rootFeeMode) {
      const parsedConfig = this.parseFeeConfigObject(rootConfig);
      const protocolConfigs = parsedConfig && parsedConfig.protocolFeeConfigs;
      this.$set(this.form, "protocolFeeConfigs", {});
      if (protocolConfigs && typeof protocolConfigs === "object") {
        Object.keys(protocolConfigs).forEach(protocolKey => {
          const formProtocol = this.resolveFormProtocolValue(protocolKey);
          this.$set(
            this.form.protocolFeeConfigs,
            formProtocol,
            this.createFeeEditorStateFromConfig(protocolConfigs[protocolKey].feeMode || rootFeeMode, protocolConfigs[protocolKey])
          );
        });
      }
      this.ensureProtocolFeeConfigs();
      if (this.form.activeFeeProtocol && this.form.protocolFeeConfigs[this.form.activeFeeProtocol]) {
        this.applyFeeEditorState(this.form.protocolFeeConfigs[this.form.activeFeeProtocol]);
      }
    },
    applyFeeConfigToForm(feeMode, feeConfig) {
      this.applyFeeEditorState(this.createFeeEditorStateFromConfig(feeMode, feeConfig));
      if (this.shouldUseProtocolFeeConfig()) {
        this.applyProtocolFeeConfigToForm(feeConfig, feeMode);
      }
    },
    normalizeFeeRatesForPersist(strictMode, feeRates = this.form.feeRates, label = "") {
      if (!Array.isArray(feeRates)) {
        if (strictMode) {
          this.$modal.msgError(`${label}请至少配置一个手续费档位`);
          return null;
        }
        return [];
      }

      const normalizedRates = [];
      for (let i = 0; i < feeRates.length; i++) {
        const item = feeRates[i];
        const min = Number(item.min);
        const max = Number(item.max);
        const ratePercent = Number(item.rate);
        const isIncomplete = Number.isNaN(min) || Number.isNaN(max) || Number.isNaN(ratePercent);
        const isInvalidRange = min < 0 || max < 0 || ratePercent < 0 || max < min;
        if (isIncomplete || isInvalidRange) {
          if (strictMode) {
            const reason = isIncomplete ? "请填写完整" : (max < min ? "最大金额不能小于最小金额" : "不能为负数");
            this.$modal.msgError(`${label}第${i + 1}行${this.protocolFeeOptions.tieredRowLabel}${reason}`);
            return null;
          }
          continue;
        }
        normalizedRates.push({
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
          rate: Number((ratePercent / 100).toFixed(6)),
          desc: this.formatRateDesc(min, max)
        });
      }

      if (strictMode && normalizedRates.length === 0) {
        this.$modal.msgError(`${label}请至少配置一个手续费档位`);
        return null;
      }
      return normalizedRates;
    },
    buildSingleFeeConfigPayload(state, label = "") {
      const feeMode = state.feeMode || "tiered_rate";
      const normalizedRates = this.normalizeFeeRatesForPersist(feeMode === "tiered_rate", state.feeRates, label);
      if (!normalizedRates) {
        return null;
      }

      const minFeeCny = this.normalizeNonNegativeAmount(state.minFeeCny, `${label}最低手续费必须是大于等于0的数字`, 0);
      const fixedFee = this.normalizeNonNegativeAmount(state.fixedFee, `${label}固定手续费必须是大于等于0的数字`, null);
      if (minFeeCny === false || fixedFee === false) {
        return null;
      }
      if (feeMode === "fixed_fee" && fixedFee === null) {
        this.$modal.msgError(`${label}固定手续费不能为空`);
        return null;
      }

      const coin = this.form[this.protocolFeeOptions.coinField];
      const unit = this.getFixedFeeUnit(coin);
      const payload = { feeMode, fixedFee, unit, feeRates: normalizedRates };
      if (feeMode === "tiered_rate") {
        payload.minFeeCny = minFeeCny;
      }
      if (unit === "CNY") {
        payload.fixedFeeCny = fixedFee;
      } else {
        payload.fixedFeeUsdt = fixedFee;
      }
      if (this.protocolFeeOptions.includeFixedMinWithdrawCny) {
        const minWithdraw = this.normalizeNonNegativeAmount(
          state.fixedMinWithdrawCny,
          `${label}最低提现额度必须是大于等于0的数字`,
          null
        );
        if (minWithdraw === false) {
          return null;
        }
        if (feeMode === "fixed_fee" && (minWithdraw === null || minWithdraw <= 0)) {
          this.$modal.msgError(`${label}固定手续费模式下最低提现额度不能为空，且必须大于0`);
          return null;
        }
        payload.fixedMinWithdrawCny = minWithdraw;
        payload.fixedMinWithdrawUnit = "CNY";
      }
      return payload;
    },
    normalizeNonNegativeAmount(value, message, fallback) {
      if (value === null || value === undefined || value === "") {
        return fallback;
      }
      const numeric = Number(value);
      if (Number.isNaN(numeric) || numeric < 0) {
        this.$modal.msgError(message);
        return false;
      }
      return Number(numeric.toFixed(2));
    },
    buildFeeConfigPayload() {
      if (!this.shouldUseProtocolFeeConfig()) {
        const payload = this.buildSingleFeeConfigPayload(this.getCurrentFeeEditorState());
        return payload ? JSON.stringify(payload) : null;
      }
      this.saveActiveProtocolFeeConfig(this.form.activeFeeProtocol);
      this.ensureProtocolFeeConfigs();
      const protocolPayloads = {};
      for (const protocol of this.form.selectedUsdtProtocols) {
        const payload = this.buildSingleFeeConfigPayload(
          this.form.protocolFeeConfigs[protocol],
          `${this.getProtocolName(protocol)} `
        );
        if (!payload) {
          return null;
        }
        protocolPayloads[this.normalizeProtocolKey(protocol)] = payload;
      }
      const firstProtocol = this.form.selectedUsdtProtocols[0];
      const firstPayload = { ...protocolPayloads[this.normalizeProtocolKey(firstProtocol)] };
      firstPayload.protocolFeeConfigs = protocolPayloads;
      this.form.feeMode = firstPayload.feeMode || "tiered_rate";
      return JSON.stringify(firstPayload);
    },
    syncProtocolFeeConfigAfterProtocolChange() {
      if (this.shouldUseProtocolFeeConfig()) {
        this.saveActiveProtocolFeeConfig(this.form.activeFeeProtocol);
        this.ensureProtocolFeeConfigs();
        if (this.form.activeFeeProtocol) {
          this.applyFeeEditorState(this.form.protocolFeeConfigs[this.form.activeFeeProtocol]);
        }
      } else {
        this.resetProtocolFeeConfigState();
      }
    }
  }
};
