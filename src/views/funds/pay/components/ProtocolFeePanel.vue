<template>
  <div class="protocol-fee-panel">
    <div class="protocol-fee-panel__header">
      <span>手续费协议设置（切换以下配置）</span>
      <div class="protocol-fee-panel__tabs">
        <button
          v-for="protocol in protocols"
          :key="'fee-protocol-' + protocol"
          type="button"
          class="protocol-fee-panel__tab"
          :class="{ 'is-active': isActiveProtocol(protocol) }"
          @click="handleProtocolClick(protocol)"
        >
          {{ getProtocolLabel(protocol) }}
        </button>
      </div>
    </div>
    <div class="protocol-fee-panel__meta">
      当前配置协议：<b>{{ getProtocolLabel(activeProtocol) }}</b>
      <span>收费模式：{{ feeModeLabel }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProtocolFeePanel",
  props: {
    protocols: {
      type: Array,
      default: () => []
    },
    activeProtocol: {
      type: [String, Number],
      default: null
    },
    feeMode: {
      type: String,
      default: "tiered_rate"
    },
    getProtocolName: {
      type: Function,
      required: true
    }
  },
  computed: {
    feeModeLabel() {
      return this.feeMode === "fixed_fee" ? "固定手续费" : "按档位费率";
    }
  },
  methods: {
    normalizeProtocolKey(protocol) {
      const compact = String(protocol || "").trim().toUpperCase().replace(/[-_]/g, "");
      if (compact === "728126428" || compact === "TRON" || compact === "TRC20") {
        return "TRC20";
      }
      if (compact === "56" || compact === "BSC" || compact === "BSC20" || compact === "BEP20") {
        return "BEP20";
      }
      if (compact === "1" || compact === "ETH" || compact === "ETHEREUM" || compact === "ERC20") {
        return "ERC20";
      }
      return compact;
    },
    getProtocolLabel(protocol) {
      const normalized = this.normalizeProtocolKey(protocol);
      if (normalized === "TRC20") {
        return "TRC20";
      }
      if (normalized === "BEP20") {
        return "BSC";
      }
      if (normalized === "ERC20") {
        return "ETH";
      }
      return this.getProtocolName(protocol);
    },
    isActiveProtocol(protocol) {
      const active = this.normalizeProtocolKey(this.activeProtocol);
      return Boolean(active) && active === this.normalizeProtocolKey(protocol);
    },
    handleProtocolClick(protocol) {
      if (!this.isActiveProtocol(protocol)) {
        this.$emit("change", protocol);
      }
    }
  }
};
</script>

<style scoped>
.protocol-fee-panel {
  margin: 8px 0 16px var(--protocol-fee-panel-offset, 100px);
  padding: 14px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f8fafc;
}
.protocol-fee-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: #606266;
}
.protocol-fee-panel__tabs {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #eef2f7;
}
.protocol-fee-panel__tab {
  min-width: 62px;
  height: 28px;
  padding: 0 14px;
  border: 0;
  border-left: 1px solid #dcdfe6;
  background: transparent;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  line-height: 28px;
  cursor: pointer;
}
.protocol-fee-panel__tab:first-child {
  border-left: 0;
}
.protocol-fee-panel__tab.is-active {
  background: #1890ff;
  color: #fff;
}
.protocol-fee-panel__tab:focus {
  outline: none;
}
.protocol-fee-panel__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  color: #909399;
}
.protocol-fee-panel__meta b,
.protocol-fee-panel__meta span {
  color: #1d63d9;
}
</style>
