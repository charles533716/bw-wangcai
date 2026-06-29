<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="会员名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入会员名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="memberList" @row-click="handleRowClick">
      <el-table-column label="会员ID" align="center" prop="id" />
      <el-table-column label="会员名称" align="center" prop="name" />
      <el-table-column label="注册时间" align="center" prop="regTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.regTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastLoginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status == 0 ? 'success' : 'danger'">
            {{ scope.row.status == 0 ? '正常' : '停用' }}
          </el-tag>
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

    <!-- 会员详情对话框 -->
    <el-dialog title="会员详情" :visible.sync="detailVisible" width="90%" append-to-body>
      <div v-if="memberDetail">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>钱包/流水信息 (CNY)</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="refreshBalance">刷新余额</el-button>
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="中心钱包">
                  {{ memberDetail.mainAccount }} CNY
                </el-descriptions-item>
                <el-descriptions-item label="场馆钱包">
                  {{ memberDetail.venueAccount }} CNY
                  <el-tooltip content="点击查看详细场馆余额" placement="top">
                    <el-button type="text" @click="showVenueBalance">查看详情</el-button>
                  </el-tooltip>
                </el-descriptions-item>
                <el-descriptions-item label="总存款">
                  {{ memberDetail.totalDeposit }} CNY
                </el-descriptions-item>
                <el-descriptions-item label="总取款">
                  {{ memberDetail.totalWithdraw }} CNY
                </el-descriptions-item>
                <el-descriptions-item label="总流水">
                  {{ memberDetail.totalFlow }} CNY
                </el-descriptions-item>
                <el-descriptions-item label="总有效投注">
                  {{ memberDetail.validBetAmount }} CNY
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>注册登录信息</span>
              </div>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="注册时间">
                  {{ parseTime(memberDetail.memberInfo.regTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="注册IP">
                  {{ memberDetail.memberInfo.fromIp || '无' }}
                </el-descriptions-item>
                <el-descriptions-item label="注册方式">
                  {{ memberDetail.memberInfo.fromSource || '无' }}
                </el-descriptions-item>
                <el-descriptions-item label="注册来源">
                  {{ memberDetail.memberInfo.fromSource || '无' }}
                </el-descriptions-item>
                <el-descriptions-item label="注册域名">
                  {{ memberDetail.memberInfo.fromDomain || '无' }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录时间">
                  {{ parseTime(memberDetail.memberInfo.lastLoginTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录IP">
                  {{ memberDetail.memberInfo.lastLoginIp || '无' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>

        <div style="margin-top: 20px; text-align: center;">
          <el-button type="primary" @click="handleAddAmount">人工上分</el-button>
          <el-button type="warning" @click="handleSubtractAmount">人工下分</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 上分对话框 -->
    <el-dialog title="人工上分" :visible.sync="addAmountVisible" width="500px" append-to-body>
      <el-form ref="addAmountForm" :model="addAmountForm" :rules="addAmountRules" label-width="100px">
        <el-form-item label="会员账号">
          <el-input v-model="addAmountForm.memberName" disabled />
        </el-form-item>
        <el-form-item label="币种">
          <el-input value="CNY" disabled />
        </el-form-item>
        <el-form-item label="上分金额" prop="amount">
          <el-input v-model="addAmountForm.amount" placeholder="请输入上分金额" type="number">
            <template slot="append">CNY</template>
          </el-input>
        </el-form-item>
        <el-form-item label="流水倍数" prop="flowMultiple">
          <el-input-number v-model="addAmountForm.flowMultiple" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="上分原因" prop="reason">
          <el-select v-model="addAmountForm.reason" placeholder="请选择上分原因">
            <el-option
              v-for="dict in upReasonOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="addAmountForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="512"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="谷歌验证码" prop="googleCode">
          <el-input v-model="addAmountForm.googleCode" placeholder="请输入谷歌验证码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAmountVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddAmount">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 下分对话框 -->
    <el-dialog title="人工下分" :visible.sync="subtractAmountVisible" width="500px" append-to-body>
      <el-form ref="subtractAmountForm" :model="subtractAmountForm" :rules="subtractAmountRules" label-width="100px">
        <el-form-item label="会员账号">
          <el-input v-model="subtractAmountForm.memberName" disabled />
        </el-form-item>
        <el-form-item label="币种">
          <el-input value="CNY" disabled />
        </el-form-item>
        <el-form-item label="下分金额" prop="amount">
          <el-input v-model="subtractAmountForm.amount" placeholder="请输入下分金额" type="number">
            <template slot="append">CNY</template>
          </el-input>
        </el-form-item>
        <el-form-item label="下分原因" prop="reason">
          <el-select v-model="subtractAmountForm.reason" placeholder="请选择下分原因">
            <el-option
              v-for="dict in downReasonOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="subtractAmountForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            maxlength="512"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="谷歌验证码" prop="googleCode">
          <el-input v-model="subtractAmountForm.googleCode" placeholder="请输入谷歌验证码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="subtractAmountVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSubtractAmount">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 场馆余额详情对话框 -->
    <el-dialog title="场馆余额详情" :visible.sync="venueBalanceVisible" width="600px" append-to-body>
      <el-table :data="venueBalanceList" v-loading="balanceLoading">
        <el-table-column label="场馆编码" align="center" prop="venueCode" />
        <el-table-column label="余额" align="center" prop="balance">
          <template slot-scope="scope">
            {{ scope.row.balance }} CNY
          </template>
        </el-table-column>
        <el-table-column label="币种" align="center" prop="currency" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { listUser } from "@/api/member/user";
import { getMemberDetail, manualAddAmount, manualSubtractAmount } from "@/api/funds/account";

export default {
  name: "MemberAmountManage",
  data() {
    return {
      loading: true,
      total: 0,
      memberList: [],
      detailVisible: false,
      addAmountVisible: false,
      subtractAmountVisible: false,
      venueBalanceVisible: false,
      balanceLoading: false,
      memberDetail: null,
      venueBalanceList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      addAmountForm: {
        memberId: undefined,
        memberName: '',
        amount: '',
        flowMultiple: 1,
        reason: '',
        remark: '',
        googleCode: ''
      },
      subtractAmountForm: {
        memberId: undefined,
        memberName: '',
        amount: '',
        reason: '',
        remark: '',
        googleCode: ''
      },
      upReasonOptions: [],
      downReasonOptions: [],
      addAmountRules: {
        amount: [
          { required: true, message: "上分金额不能为空", trigger: "blur" },
          { pattern: /^\d+(\.\d{1,2})?$/, message: "金额格式不正确", trigger: "blur" }
        ],
        reason: [
          { required: true, message: "请选择上分原因", trigger: "change" }
        ],
        googleCode: [
          { required: true, message: "谷歌验证码不能为空", trigger: "blur" }
        ]
      },
      subtractAmountRules: {
        amount: [
          { required: true, message: "下分金额不能为空", trigger: "blur" },
          { pattern: /^\d+(\.\d{1,2})?$/, message: "金额格式不正确", trigger: "blur" }
        ],
        reason: [
          { required: true, message: "请选择下分原因", trigger: "change" }
        ],
        googleCode: [
          { required: true, message: "谷歌验证码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("member_up_amount").then(response => {
      this.upReasonOptions = response.data;
    });
    this.getDicts("member_down_amount").then(response => {
      this.downReasonOptions = response.data;
    });
  },
  methods: {
    getList() {
      this.loading = true;
      listUser(this.queryParams).then(response => {
        this.memberList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleRowClick(row) {
      this.getMemberDetail(row.id);
    },
    getMemberDetail(memberId) {
      this.loading = true;
      getMemberDetail(memberId).then(response => {
        this.memberDetail = response.data;
        this.detailVisible = true;
        this.loading = false;
      });
    },
    refreshBalance() {
      if (this.memberDetail && this.memberDetail.memberInfo) {
        this.getMemberDetail(this.memberDetail.memberInfo.id);
      }
    },
    showVenueBalance() {
      if (this.memberDetail.venueRealBalance) {
        this.venueBalanceList = this.memberDetail.venueRealBalance;
        this.venueBalanceVisible = true;
      }
    },
    handleAddAmount() {
      if (!this.memberDetail) return;

      this.addAmountForm = {
        memberId: this.memberDetail.memberInfo.id,
        memberName: this.memberDetail.memberInfo.name,
        amount: '',
        flowMultiple: 1,
        reason: '',
        remark: '',
        googleCode: ''
      };

      this.addAmountVisible = true;
      this.$nextTick(() => {
        this.$refs.addAmountForm.clearValidate();
      });
    },
    handleSubtractAmount() {
      if (!this.memberDetail) return;

      this.subtractAmountForm = {
        memberId: this.memberDetail.memberInfo.id,
        memberName: this.memberDetail.memberInfo.name,
        amount: '',
        reason: '',
        remark: '',
        googleCode: ''
      };

      this.subtractAmountVisible = true;
      this.$nextTick(() => {
        this.$refs.subtractAmountForm.clearValidate();
      });
    },
    submitAddAmount() {
      this.$refs.addAmountForm.validate(valid => {
        if (valid) {
          manualAddAmount(this.addAmountForm).then(response => {
            this.$modal.msgSuccess("上分成功");
            this.addAmountVisible = false;
            this.getMemberDetail(this.addAmountForm.memberId);
          });
        }
      });
    },
    submitSubtractAmount() {
      this.$refs.subtractAmountForm.validate(valid => {
        if (valid) {
          manualSubtractAmount(this.subtractAmountForm).then(response => {
            this.$modal.msgSuccess("下分成功");
            this.subtractAmountVisible = false;
            this.getMemberDetail(this.subtractAmountForm.memberId);
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
</style>
