<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="单号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入单号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input v-model="queryParams.memberName" placeholder="请输入会员账号" clearable style="width: 200px"/>
      </el-form-item>
      <el-form-item label="充值类型" prop="payType">
        <el-select v-model="queryParams.payType" placeholder="请选择充值类型" clearable style="width: 200px">
          <el-option label="银行卡" value="BANK"/>
          <el-option label="支付宝" value="ALIPAY"/>
          <el-option label="微信" value="WECHAT"/>
          <el-option label="USDT" value="USDT"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option
            v-for="option in depositStatusOptions"
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
      :data="depositList"
    >
      <el-table-column label="单号" prop="code" align="center" width="200" fixed="left"/>
      <el-table-column label="会员账号" prop="memberName" align="center" width="120"/>
      <el-table-column label="充值类型" prop="payType" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ formatPayType(scope.row.payType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="充值金额" prop="amount" align="center" width="120">
        <template slot-scope="scope">
          <span class="amount-positive">{{ formatAmount(scope.row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际到账" prop="actualAmount" align="center" width="120">
        <template slot-scope="scope">
          <span class="amount-positive">{{ formatAmount(scope.row.actualAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手续费" prop="feeAmount" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ formatAmount(scope.row.feeAmount) }}</span>
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
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['funds:deposit:view']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleApprove(scope.row)"
            v-hasPermi="['funds:deposit:approve']"
            v-if="scope.row.status === 1"
          >审核</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-picture"
            @click="handleViewScreenshot(scope.row)"
            v-if="scope.row.screenshotUrl"
          >截图</el-button>
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
            <el-form-item label="充值类型：">{{ formatPayType(viewForm.payType) }}</el-form-item>
            <el-form-item label="充值金额：">{{ formatAmount(viewForm.amount) }}</el-form-item>
            <el-form-item label="实际到账：">{{ formatAmount(viewForm.actualAmount) }}</el-form-item>
            <el-form-item label="手续费：">{{ formatAmount(viewForm.feeAmount) }}</el-form-item>
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
        <el-form-item label="截图：" v-if="viewForm.screenshotUrl">
          <el-image
            style="width: 200px; height: 200px"
            :src="viewForm.screenshotUrl"
            :preview-src-list="[viewForm.screenshotUrl]"
            fit="contain"
          ></el-image>
        </el-form-item>
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
import { listDeposit, getDeposit, approveDeposit, rejectDeposit } from "@/api/funds/deposit";
import {
  DEPOSIT_STATUS_OPTIONS,
  formatMemberAccountStatus,
  getMemberAccountStatusTagType
} from "@/utils/memberAccountRecordStatus";

export default {
  name: "Deposit",
  data() {
    return {
      loading: false,
      depositList: [],
      total: 0,
      depositStatusOptions: DEPOSIT_STATUS_OPTIONS,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        memberName: undefined,
        payType: undefined,
        status: 1 // 默认查询待审核状态
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
        transactionType: 1, // 存款类型
        params: {}
      };

      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00';
        params.params.endTime = this.dateRange[1] + ' 23:59:59';
      }

      listDeposit(params).then(response => {
        this.depositList = response.rows;
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
      this.viewTitle = "存款详情";
      this.viewForm = { ...row };
    },
    // 查看截图
    handleViewScreenshot(row) {
      this.viewOpen = true;
      this.viewTitle = "存款截图";
      this.viewForm = { ...row };
    },
    // 审核操作
    handleApprove(row) {
      this.approveOpen = true;
      this.approveTitle = "审核存款";
      this.approveForm.id = row.id;
      this.approveForm.action = "approve";
      this.approveForm.remark = "";
    },
    // 提交审核
    submitApprove() {
      this.$refs["approveForm"].validate(valid => {
        if (valid) {
          const request = this.approveForm.action === "approve" ? approveDeposit : rejectDeposit;
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
    formatPayType(type) {
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
    getStatusTagType(status) {
      return getMemberAccountStatusTagType(status);
    }
  }
};
</script>

<style scoped>
.amount-positive {
  color: #67c23a;
  font-weight: bold;
}
</style>
