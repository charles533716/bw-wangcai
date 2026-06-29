<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="单号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入单号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input v-model="queryParams.memberName" placeholder="请输入会员账号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="取款类型" prop="withdrawType">
        <el-select v-model="queryParams.withdrawType" placeholder="请选择取款类型" clearable style="width: 200px">
          <el-option label="银行卡" value="BANK"/>
          <el-option label="支付宝" value="ALIPAY"/>
          <el-option label="微信" value="WECHAT"/>
          <el-option label="USDT" value="USDT"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option
            v-for="option in withdrawStatusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="withdrawList"
    >
      <el-table-column label="单号" prop="code" align="center" width="200" fixed="left"/>
      <el-table-column label="会员账号" prop="memberName" align="center" width="120"/>
      <el-table-column label="取款类型" prop="withdrawType" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ formatWithdrawType(scope.row.withdrawType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="取款金额" prop="amount" align="center" width="120">
        <template slot-scope="scope">
          <span class="amount-negative">{{ formatWithdrawAmount(scope.row.amount, scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际到账" prop="actualAmount" align="center" width="120">
        <template slot-scope="scope">
          <span class="amount-negative">{{ formatActualAmount(scope.row.actualAmount, scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费" prop="feeAmount" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ formatFeeAmount(scope.row.feeAmount, scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="银行名称" prop="bankName" align="center" width="150" show-overflow-tooltip/>
      <el-table-column label="账户姓名" prop="accountName" align="center" width="120"/>
      <el-table-column label="银行账号" prop="accountNumber" align="center" width="180" show-overflow-tooltip/>
      <el-table-column label="平台类型" prop="platformType" align="center" width="120"/>
      <el-table-column label="状态" prop="status" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户备注" prop="userRemark" align="center" width="150" show-overflow-tooltip/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="160"/>
      <el-table-column label="操作" align="center" width="250" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['funds:withdraw:view']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleApprove(scope.row)"
            v-hasPermi="['funds:withdraw:approve']"
            v-if="scope.row.status === 4"
          >审核</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-refresh"
            @click="handleTransfer(scope.row)"
            v-hasPermi="['funds:withdraw:transfer']"
            v-if="scope.row.status === 5"
          >转账</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handleComplete(scope.row)"
            v-hasPermi="['funds:withdraw:complete']"
            v-if="scope.row.status === 5"
          >完成</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 查看对话框 -->
    <el-dialog :title="viewTitle" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-form ref="viewForm" :model="viewForm" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="单号：">{{ viewForm.code }}</el-form-item>
            <el-form-item label="会员账号：">{{ viewForm.memberName }}</el-form-item>
            <el-form-item label="取款类型：">{{ formatWithdrawType(viewForm.withdrawType) }}</el-form-item>
            <el-form-item label="取款金额：">{{ formatWithdrawAmount(viewForm.amount, viewForm) }}</el-form-item>
            <el-form-item label="实际到账：">{{ formatActualAmount(viewForm.actualAmount, viewForm) }}</el-form-item>
            <el-form-item label="手续费：">{{ formatFeeAmount(viewForm.feeAmount, viewForm) }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行名称：">{{ viewForm.bankName }}</el-form-item>
            <el-form-item label="账户姓名：">{{ viewForm.accountName }}</el-form-item>
            <el-form-item label="银行账号：">{{ viewForm.accountNumber }}</el-form-item>
            <el-form-item label="平台类型：">{{ viewForm.platformType }}</el-form-item>
            <el-form-item label="状态：">
              <el-tag :type="getStatusTagType(viewForm.status)">{{ formatStatus(viewForm.status) }}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="用户备注：">{{ viewForm.userRemark || '无' }}</el-form-item>
        <el-form-item label="创建时间：">{{ viewForm.createTime }}</el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog :title="approveTitle" :visible.sync="approveOpen" width="500px" append-to-body>
      <el-form ref="approveForm" :model="approveForm" :rules="approveRules" label-width="80px">
        <el-form-item label="审核操作" prop="action">
          <el-radio-group v-model="approveForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="remark">
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            placeholder="请输入审核备注"
            :rows="4"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitApprove">确 定</el-button>
        <el-button @click="approveOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listWithdraw, getWithdraw, approveWithdraw, rejectWithdraw, transferWithdraw, completeWithdraw } from "@/api/funds/withdraw";
import {
  WITHDRAW_STATUS_OPTIONS,
  formatMemberAccountStatus,
  getMemberAccountStatusTagType
} from "@/utils/memberAccountRecordStatus";

export default {
  name: "Withdraw",
  data() {
    return {
      loading: false,
      withdrawList: [],
      total: 0,
      dateRange: [],
      withdrawStatusOptions: WITHDRAW_STATUS_OPTIONS,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        memberName: undefined,
        withdrawType: undefined,
        status: 4 // 默认查询待审核状态
      },
      // 查看相关
      viewOpen: false,
      viewTitle: "",
      viewForm: {},
      // 审核相关
      approveOpen: false,
      approveTitle: "",
      approveForm: {
        id: null,
        action: "approve",
        remark: ""
      },
      approveRules: {
        action: [
          { required: true, message: "请选择审核操作", trigger: "change" }
        ],
        remark: [
          { required: true, message: "请输入审核备注", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      const params = {
        ...this.queryParams,
        transactionType: 2, // 取款类型
        params: {}
      };

      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00';
        params.params.endTime = this.dateRange[1] + ' 23:59:59';
      }

      listWithdraw(params).then(response => {
        this.withdrawList = response.rows;
        this.total = response.total;
        this.loading = false;
      }).catch(() => {
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
      this.handleQuery();
    },
    // 查看详情
    handleView(row) {
      this.viewOpen = true;
      this.viewTitle = "取款详情";
      this.viewForm = { ...row };
    },
    // 审核操作
    handleApprove(row) {
      this.approveOpen = true;
      this.approveTitle = "审核取款";
      this.approveForm.id = row.id;
      this.approveForm.action = "approve";
      this.approveForm.remark = "";
    },
    // 开始转账
    handleTransfer(row) {
      this.$modal.confirm('确认开始转账操作？').then(() => {
        transferWithdraw({ id: row.id }).then(response => {
          this.$modal.msgSuccess("操作成功");
          this.getList();
        });
      });
    },
    // 完成转账
    handleComplete(row) {
      this.$modal.confirm('确认转账已完成？').then(() => {
        completeWithdraw({ id: row.id }).then(response => {
          this.$modal.msgSuccess("操作成功");
          this.getList();
        });
      });
    },
    // 提交审核
    submitApprove() {
      this.$refs["approveForm"].validate(valid => {
        if (valid) {
          const request = this.approveForm.action === "approve" ? approveWithdraw : rejectWithdraw;
          const params = {
            id: this.approveForm.id,
            remark: this.approveForm.remark
          };

          request(params).then(response => {
            this.$modal.msgSuccess("审核成功");
            this.approveOpen = false;
            this.getList();
          });
        }
      });
    },
    formatWithdrawType(type) {
      const map = {
        'BANK': '银行卡',
        'ALIPAY': '支付宝',
        'WECHAT': '微信',
        'USDT': 'USDT'
      };
      return map[type] || type;
    },
    formatStatus(status) {
      return formatMemberAccountStatus(status);
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined) return '-';
      const num = parseFloat(amount);
      if (isNaN(num)) return '-';
      return num.toFixed(2);
    },
    formatAmountWithUnit(amount, currency) {
      const amountText = this.formatAmount(amount);
      if (amountText === '-') return amountText;
      const unit = currency || '-';
      return `${amountText} ${unit}`;
    },
    getAmountCurrency(row, fallback = 'USDT') {
      if (row && row.coin) return row.coin;
      if (row && row.currency) return row.currency;
      return fallback;
    },
    formatWithdrawAmount(amount, row) {
      return this.formatAmountWithUnit(amount, this.getAmountCurrency(row, 'USDT'));
    },
    formatActualAmount(amount, row) {
      return this.formatAmountWithUnit(amount, this.getAmountCurrency(row, 'USDT'));
    },
    formatFeeAmount(amount, row) {
      const feeUnit = row && row.feeUnit ? row.feeUnit : 'CNY';
      return this.formatAmountWithUnit(amount, feeUnit);
    },
    getStatusTagType(status) {
      return getMemberAccountStatusTagType(status);
    }
  }
};
</script>

<style scoped>
.amount-negative {
  color: #f56c6c;
  font-weight: bold;
}
</style>
