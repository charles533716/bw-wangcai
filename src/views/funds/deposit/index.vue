<template>
  <div class="deposit-audit-page">
    <el-card class="filter-card" shadow="never">
      <el-form ref="queryForm" :model="queryParams" :inline="true" label-position="top">
        <el-form-item label="单号" prop="code">
          <el-input v-model="queryParams.code" placeholder="请输入单号..." clearable />
        </el-form-item>
        <el-form-item label="账号类型" prop="accountType">
          <el-select v-model="queryParams.accountType" placeholder="全部类型" clearable>
            <el-option label="会员" value="MEMBER" />
            <el-option label="代理" value="AGENT" />
            <el-option label="站点管理员" value="SITE_ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="memberName">
          <el-input v-model="queryParams.memberName" placeholder="请输入账号名称..." clearable />
        </el-form-item>
        <el-form-item label="充值类型" prop="payType">
          <el-select v-model="queryParams.payType" placeholder="全部/请选择" clearable>
            <el-option
              v-for="dict in dict.type.pay_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="币种" prop="coin">
          <el-select v-model="queryParams.coin" placeholder="全部/请选择" clearable>
            <el-option
              v-for="dict in dict.type.pay_coin"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部/请选择" clearable>
            <el-option label="充值待支付" :value="15" />
            <el-option label="充值确认中" :value="1" />
            <el-option label="充值确认失败" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="toolbar-card" shadow="never">
      <div class="timeout-config">
        <span class="timeout-label">“充值待支付”失效时间</span>
        <el-input-number v-model="timeoutHours" :min="0" :max="168" :controls="false" size="small" />
        <span>小时</span>
        <el-input-number v-model="timeoutMinutes" :min="0" :max="59" :controls="false" size="small" />
        <span>分钟</span>
        <el-button type="warning" size="small" :loading="timeoutSaving" @click="saveTimeoutConfig">确认更新</el-button>
      </div>
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="openLinkedOrder" v-hasPermi="['funds:deposit:add']">
        新增订单
      </el-button>
    </el-card>

    <el-table v-loading="loading" :data="depositList" class="deposit-table" border>
      <el-table-column label="单号" prop="code" align="center" width="170" fixed="left" show-overflow-tooltip />
      <el-table-column label="账号类型" prop="accountTypeLabel" align="center" width="95">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="accountTypeTag(row.accountType)">{{ row.accountTypeLabel || formatAccountType(row.accountType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="账号名称" align="center" width="140" show-overflow-tooltip>
        <template slot-scope="{ row }">{{ row.accountNameDisplay || row.memberName || '-' }}</template>
      </el-table-column>
      <el-table-column label="三方支付通道" align="center" width="130" show-overflow-tooltip>
        <template slot-scope="{ row }">{{ row.providerTypeLabel || row.channelName || '-' }}</template>
      </el-table-column>
      <el-table-column label="充值类型" align="center" width="95">
        <template slot-scope="{ row }">{{ row.payTypeDisplay || formatPayType(row.payType) }}</template>
      </el-table-column>
      <el-table-column label="币种" align="center" width="85">
        <template slot-scope="{ row }"><el-tag size="mini">{{ row.coin || row.currency || '-' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="订单金额" align="right" width="120">
        <template slot-scope="{ row }">{{ formatAmount(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="充值金额" align="right" width="120">
        <template slot-scope="{ row }">{{ formatAmount(row.realAmount) }}</template>
      </el-table-column>
      <el-table-column label="实际到账" align="right" width="120">
        <template slot-scope="{ row }"><span class="amount-credit">{{ formatAmount(row.actualAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="手续费" align="right" width="110">
        <template slot-scope="{ row }"><span class="amount-fee">{{ formatAmount(row.feeAmount) }}</span></template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="130">
        <template slot-scope="{ row }">
          <el-tag :type="statusTag(row.displayStatus || row.status)">
            {{ row.displayStatusLabel || formatStatus(row.displayStatus || row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="160" />
      <el-table-column label="操作" align="center" width="190">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" icon="el-icon-view" @click="handleView(row)" v-hasPermi="['funds:deposit:query']">查看</el-button>
          <el-button
            v-if="canApprove(row)"
            type="text"
            size="mini"
            icon="el-icon-top"
            class="success-action"
            @click="openApprove(row)"
            v-hasPermi="['funds:deposit:approve']"
          >上分</el-button>
          <el-button
            v-if="canCancel(row)"
            type="text"
            size="mini"
            icon="el-icon-circle-close"
            class="danger"
            @click="confirmCancel(row)"
            v-hasPermi="['funds:deposit:reject']"
          >取消</el-button>
        </template>
      </el-table-column>
      <el-table-column label="异常备注" align="center" width="120" show-overflow-tooltip>
        <template slot-scope="{ row }"><span :class="{ danger: row.abnormalRemark && row.abnormalRemark !== '-' }">{{ row.abnormalRemark || '-' }}</span></template>
      </el-table-column>
      <el-table-column label="官方备注" align="center" width="170" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <el-button type="text" class="remark-button" @click="editAdminRemark(row)" v-hasPermi="['funds:deposit:remark']">
            {{ row.adminRemark || '点击输入官方备注' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :visible.sync="viewOpen" width="680px" custom-class="deposit-detail-dialog" append-to-body :show-close="false">
      <div class="deposit-detail-panel">
        <div class="deposit-detail-header">
          <div class="dark-dialog-title">
            <div class="title-icon">i</div>
            <div>
              <div>充值订单详情</div>
              <small>DEPOSIT ORDER DETAILS</small>
            </div>
          </div>
          <button type="button" class="detail-close" @click="viewOpen = false">×</button>
        </div>
        <div class="deposit-detail-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span>订单单号</span>
              <strong>{{ viewForm.code || '-' }}</strong>
            </div>
            <div class="detail-item">
              <span>账号类型</span>
              <strong>{{ viewForm.accountTypeLabel || formatAccountType(viewForm.accountType) }}</strong>
            </div>
            <div class="detail-item">
              <span>账号名称</span>
              <strong>{{ viewForm.accountNameDisplay || viewForm.memberName || '-' }}</strong>
            </div>
            <div class="detail-item">
              <span>充值类型</span>
              <strong>{{ viewForm.payTypeDisplay || formatPayType(viewForm.payType) }}</strong>
            </div>
            <div class="detail-item">
              <span>币种</span>
              <strong>{{ viewForm.coin || viewForm.currency || '-' }}</strong>
            </div>
            <div class="detail-item">
              <span>平台类型</span>
              <strong>{{ viewForm.platformType || '-' }}</strong>
            </div>
            <div class="detail-item highlight">
              <span>订单金额</span>
              <strong>{{ formatAmount(viewForm.amount) }}</strong>
            </div>
            <div class="detail-item">
              <span>充值金额</span>
              <strong>{{ formatAmount(viewForm.realAmount) }}</strong>
            </div>
            <div class="detail-item success">
              <span>实际到账金额</span>
              <strong>{{ formatAmount(viewForm.actualAmount) }}</strong>
            </div>
            <div class="detail-item danger">
              <span>手续费</span>
              <strong>{{ formatAmount(viewForm.feeAmount) }}</strong>
            </div>
            <div class="detail-item">
              <span>状态</span>
              <strong>{{ viewForm.displayStatusLabel || formatStatus(viewForm.displayStatus || viewForm.status) }}</strong>
            </div>
            <div class="detail-item">
              <span>创建时间</span>
              <strong>{{ viewForm.createTime || '-' }}</strong>
            </div>
          </div>
          <el-divider />
          <div class="detail-grid">
            <div class="detail-item">
              <span>三方支付渠道</span>
              <strong>{{ viewForm.providerTypeLabel || viewForm.channelName || '-' }}</strong>
            </div>
            <div class="detail-item">
              <span>渠道通道编号</span>
              <strong>{{ viewForm.channelId || '-' }}</strong>
            </div>
            <div class="detail-item boxed">
              <span>用户自填备注</span>
              <strong>{{ viewForm.userRemark || '暂无用户备注' }}</strong>
            </div>
            <div class="detail-item boxed">
              <span>官方审核备注</span>
              <strong>{{ viewForm.adminRemark || '暂无官方备注' }}</strong>
            </div>
          </div>
        </div>
        <div class="deposit-detail-footer">
          <el-button @click="viewOpen = false">关闭详情</el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="approveOpen" width="460px" custom-class="deposit-approve-dialog" append-to-body>
      <div slot="title" class="approve-title">
        <div class="title-icon">↑</div>
        <div>
          <div>订单上分</div>
          <small>ADD CREDIT TO MEMBER</small>
        </div>
      </div>
      <div class="approve-summary">
        <div><span>账号名称</span><strong>{{ approveRow.accountNameDisplay || approveRow.memberName || '-' }}</strong></div>
        <div><span>账号类型</span><el-tag size="mini">{{ approveRow.accountTypeLabel || formatAccountType(approveRow.accountType) }}</el-tag></div>
        <div><span>订单金额</span><strong class="order-amount">{{ formatAmount(approveRow.amount) }}</strong></div>
      </div>
      <el-form ref="approveForm" :model="approveForm" :rules="approveRules" label-position="top">
        <el-form-item label="实际入账金额" prop="actualRechargeAmount">
          <el-input v-model="approveForm.actualRechargeAmount" placeholder="请输入上分金额">
            <template slot="prefix">￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input v-model="approveForm.reviewReason" type="textarea" :rows="3" placeholder="可选，填写本次上分备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer split-footer">
        <el-button @click="approveOpen = false">取消</el-button>
        <el-button type="success" :loading="approveSubmitting" @click="submitApprove">确认上分</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="linkedOpen" width="680px" custom-class="linked-order-dialog" append-to-body>
      <div slot="title" class="linked-title">
        <div class="title-icon">+</div>
        <div>
          <div>新增关联订单</div>
          <small>CREATE LINKED ORDER</small>
        </div>
      </div>
      <div class="sync-box">
        <div class="sync-title">关联/同步历史订单信息</div>
        <el-input v-model="syncCode" placeholder="请输入历史充值订单号...">
          <el-button slot="append" :loading="syncLoading" @click="syncSourceOrder">确认同步</el-button>
        </el-input>
      </div>
      <el-form ref="linkedForm" :model="linkedForm" :rules="linkedRules" label-position="top">
        <el-form-item label="手动输入/修改最新订单号（必填）" prop="code">
          <el-input v-model="linkedForm.code" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="账号类型" prop="accountType">
              <el-select v-model="linkedForm.accountType">
                <el-option label="会员" value="MEMBER" />
                <el-option label="代理" value="AGENT" />
                <el-option label="站点管理员" value="SITE_ADMIN" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号名称" prop="memberName">
              <el-input v-model="linkedForm.memberName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充值类型" prop="payType">
              <el-input v-model="linkedForm.payType" placeholder="BANK/ALIPAY/WECHAT/USDT" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="币种" prop="coin">
              <el-select v-model="linkedForm.coin">
                <el-option label="人民币" value="CNY" />
                <el-option label="USDT" value="USDT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台类型" prop="platformType">
              <el-input v-model="linkedForm.platformType" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单金额" prop="amount">
              <el-input v-model="linkedForm.amount" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="充值金额" prop="actualRechargeAmount">
              <el-input v-model="linkedForm.actualRechargeAmount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三方渠道">
              <el-input v-model="linkedForm.channelName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通道编号">
              <el-input v-model="linkedForm.channelId" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="银行名称">
              <el-input v-model="linkedForm.bankName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="账户姓名">
              <el-input v-model="linkedForm.accountName" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="详细账号">
              <el-input v-model="linkedForm.accountNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="官方备注">
              <el-input v-model="linkedForm.adminRemark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer split-footer">
        <el-button @click="linkedOpen = false">再想想</el-button>
        <el-button type="primary" :loading="linkedSubmitting" @click="submitLinkedOrder">保存并新增订单</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addLinkedDeposit,
  approveDeposit,
  getDeposit,
  getDepositNewCode,
  getDepositSyncSource,
  getDepositTimeoutConfig,
  listDeposit,
  rejectDeposit,
  updateDepositAdminRemark,
  updateDepositTimeoutConfig
} from "@/api/funds/deposit";

export default {
  name: "Deposit",
  dicts: ["pay_type", "pay_coin"],
  data() {
    const amountRule = (rule, value, callback) => {
      if (value === undefined || value === null || value === "") {
        callback(new Error("请输入金额"));
        return;
      }
      const number = Number(value);
      if (!Number.isFinite(number) || number <= 0) {
        callback(new Error("金额必须大于 0"));
        return;
      }
      callback();
    };
    return {
      loading: false,
      depositList: [],
      total: 0,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        accountType: undefined,
        memberName: undefined,
        payType: undefined,
        coin: undefined,
        status: 15
      },
      timeoutHours: 2,
      timeoutMinutes: 30,
      timeoutSaving: false,
      viewOpen: false,
      viewForm: {},
      approveOpen: false,
      approveRow: {},
      approveSubmitting: false,
      approveForm: {
        id: undefined,
        actualRechargeAmount: undefined,
        reviewReason: ""
      },
      approveRules: {
        actualRechargeAmount: [{ validator: amountRule, trigger: "blur" }]
      },
      linkedOpen: false,
      linkedSubmitting: false,
      syncCode: "",
      syncLoading: false,
      linkedForm: this.emptyLinkedForm(),
      linkedRules: {
        code: [{ required: true, message: "请输入订单号", trigger: "blur" }],
        accountType: [{ required: true, message: "请选择账号类型", trigger: "change" }],
        memberName: [{ required: true, message: "请输入账号名称", trigger: "blur" }],
        amount: [{ validator: amountRule, trigger: "blur" }],
        actualRechargeAmount: [{ validator: amountRule, trigger: "blur" }]
      }
    };
  },
  created() {
    this.loadTimeoutConfig();
    this.getList();
  },
  methods: {
    emptyLinkedForm() {
      return {
        code: "",
        accountType: "MEMBER",
        memberName: "",
        payType: "BANK",
        coin: "CNY",
        currency: "CNY",
        platformType: "PC",
        amount: "",
        actualRechargeAmount: "",
        channelId: "",
        channelName: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
        adminRemark: ""
      };
    },
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
        transactionType: 1,
        params: {}
      };
      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + " 00:00:00";
        params.params.endTime = this.dateRange[1] + " 23:59:59";
      }
      listDeposit(params).then(response => {
        this.depositList = response.rows || [];
        this.total = response.total || 0;
      }).finally(() => {
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.status = 15;
      this.handleQuery();
    },
    loadTimeoutConfig() {
      getDepositTimeoutConfig().then(response => {
        const minutes = Number((response.data && response.data.minutes) || 150);
        this.timeoutHours = Math.floor(minutes / 60);
        this.timeoutMinutes = minutes % 60;
      });
    },
    saveTimeoutConfig() {
      const minutes = Number(this.timeoutHours || 0) * 60 + Number(this.timeoutMinutes || 0);
      if (minutes <= 0) {
        this.$modal.msgError("失效时间必须大于 0");
        return;
      }
      this.timeoutSaving = true;
      updateDepositTimeoutConfig({ minutes }).then(() => {
        this.$modal.msgSuccess("失效时间已更新");
        this.getList();
      }).finally(() => {
        this.timeoutSaving = false;
      });
    },
    handleView(row) {
      getDeposit(row.id).then(response => {
        this.viewForm = response.data || {};
        this.viewOpen = true;
      });
    },
    openApprove(row) {
      this.approveRow = row;
      this.approveForm = {
        id: row.id,
        actualRechargeAmount: row.realAmount || row.amount || "",
        reviewReason: ""
      };
      this.approveOpen = true;
    },
    submitApprove() {
      this.$refs.approveForm.validate(valid => {
        if (!valid) return;
        this.approveSubmitting = true;
        approveDeposit(this.approveForm).then(() => {
          this.$modal.msgSuccess("上分成功");
          this.approveOpen = false;
          this.getList();
        }).finally(() => {
          this.approveSubmitting = false;
        });
      });
    },
    confirmCancel(row) {
      this.$confirm(`您确定要取消订单 ${row.code} 吗？此操作不可逆。`, "取消订单", {
        confirmButtonText: "确认取消",
        cancelButtonText: "暂不取消",
        type: "warning"
      }).then(() => {
        return rejectDeposit({ id: row.id, reviewReason: "充值确认失败" });
      }).then(() => {
        this.$modal.msgSuccess("订单已取消");
        this.getList();
      });
    },
    editAdminRemark(row) {
      this.$prompt("请输入官方备注", "官方备注", {
        inputType: "textarea",
        inputValue: row.adminRemark || "",
        confirmButtonText: "保存",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        return updateDepositAdminRemark({ id: row.id, adminRemark: value });
      }).then(() => {
        this.$modal.msgSuccess("官方备注已保存");
        this.getList();
      });
    },
    openLinkedOrder() {
      this.linkedForm = this.emptyLinkedForm();
      this.syncCode = "";
      getDepositNewCode().then(response => {
        this.linkedForm.code = response.data;
        this.linkedOpen = true;
      });
    },
    syncSourceOrder() {
      if (!this.syncCode) {
        this.$modal.msgError("请输入历史充值订单号");
        return;
      }
      this.syncLoading = true;
      getDepositSyncSource(this.syncCode).then(response => {
        const source = response.data || {};
        const keepCode = this.linkedForm.code;
        this.linkedForm = {
          ...this.emptyLinkedForm(),
          ...source,
          code: keepCode,
          accountType: source.accountType || "MEMBER",
          memberName: source.memberName || source.accountNameDisplay || "",
          amount: source.amount || "",
          actualRechargeAmount: source.realAmount || source.amount || "",
          coin: source.coin || source.currency || "CNY",
          currency: source.currency || source.coin || "CNY"
        };
        this.$modal.msgSuccess("已同步历史订单字段，可继续修改后保存");
      }).finally(() => {
        this.syncLoading = false;
      });
    },
    submitLinkedOrder() {
      this.$refs.linkedForm.validate(valid => {
        if (!valid) return;
        this.linkedSubmitting = true;
        const payload = {
          ...this.linkedForm,
          channelId: this.linkedForm.channelId ? Number(this.linkedForm.channelId) : undefined
        };
        addLinkedDeposit(payload).then(() => {
          this.$modal.msgSuccess("关联订单已创建并入账");
          this.linkedOpen = false;
          this.getList();
        }).finally(() => {
          this.linkedSubmitting = false;
        });
      });
    },
    canApprove(row) {
      return row.status !== 3;
    },
    canCancel(row) {
      return row.status === 1 || row.status === 15;
    },
    formatPayType(type) {
      if (this.dict && this.dict.type && this.dict.type.pay_type) {
        const found = this.dict.type.pay_type.find(item => item.value === type);
        if (found) return found.label;
      }
      const map = { BANK: "银行卡", ALIPAY: "支付宝", WECHAT: "微信", USDT: "USDT" };
      return map[type] || type || "-";
    },
    formatAccountType(type) {
      const map = { MEMBER: "会员", AGENT: "代理", SITE_ADMIN: "站点管理员" };
      return map[type] || "-";
    },
    accountTypeTag(type) {
      const map = { MEMBER: "", AGENT: "warning", SITE_ADMIN: "success" };
      return map[type] || "info";
    },
    formatStatus(status) {
      const map = { 1: "充值确认中", 2: "充值确认失败", 3: "充值确认成功", 15: "充值待支付" };
      return map[Number(status)] || status || "-";
    },
    statusTag(status) {
      const map = { 1: "warning", 2: "info", 3: "success", 15: "warning" };
      return map[Number(status)] || "info";
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === "") return "-";
      const number = Number(amount);
      if (!Number.isFinite(number)) return amount;
      return number.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }
};
</script>

<style scoped src="./index.css"></style>

<style>
.deposit-detail-dialog .el-dialog__header {
  display: none;
}

.deposit-detail-dialog .el-dialog__body {
  padding: 0;
}

.deposit-detail-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
}
</style>
