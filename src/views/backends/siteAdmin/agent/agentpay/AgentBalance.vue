<!-- 余额代存 -->
<template>
  <div class="agent-balance">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <!-- 可用额度 -->  
        <el-form-item label-width="0">
          <div class="balance-card">
            <div class="balance-icon">
              <img src="@/assets/images/balance.png" alt="可用额度" />
            </div>

            <div class="balance-right">
              <div class="balance-title">可用额度</div>
              <div class="balance-row2">
                <span class="balance-amount">
                  {{
                    showBalance && form.agentBalance !== null && form.agentBalance !== undefined
                      ? form.agentBalance
                      : '******'
                  }}
                </span>
                <i
                  class="el-icon-view eye-icon"
                  :class="{ 'eye-close': !showBalance }"
                  @click="toggleBalance"
                ></i>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 下级账号 -->
        <el-form-item label="下级账号" prop="memberName">
          <el-input
            v-model="form.memberName"
            :type="showmemberName ? 'text' : 'password'"
            placeholder="请输入下级账号"
            autocomplete="off"
            class="form-input-260"
          >
            <i
              slot="suffix"
              class="el-icon-view eye-icon"
              :class="{ 'eye-close': !showmemberName }"
              @click="togglememberName"
              title="显示/隐藏"
            ></i>
          </el-input>
        </el-form-item>
        <el-form-item label="代存金额" prop="agentPayAmount">
          <div class="input-with-tip">
            <el-input
              v-model="form.agentPayAmount"
              placeholder="请输入代存金额"
              class="form-input-260"
            />
            <span class="input-tip">
              1.00 ≤ 单次代存金额 ≤ 50,000.00，当日限额10,000,000.00
            </span>
          </div>
        </el-form-item>
        <el-form-item label="流水倍数" prop="turnoverMultiple">
          <div class="input-with-tip">
            <el-input
              v-model="form.turnoverMultiple"
              placeholder="请输入流水倍数"
              class="form-input-260"
            />
            <span class="input-tip">
              1 ≤ 提款流水倍数 ≤ 8
            </span>
          </div>
        </el-form-item>
        <el-form-item label="验证方式">
          <el-radio-group v-model="verifyType">
            <el-radio label="sms">身份验证码</el-radio>
            <el-radio label="payPwd">支付密码</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份验证码" prop="authenticationCode">
          <el-input v-model="form.authenticationCode" placeholder="请输入身份验证码" class="form-input-260"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">立即代存</el-button>
      </div>
  </div>
</template>

<script>
import { getAgentBalance } from "@/api/agent/agentaccount"
import { addAgentBalance} from "@/api/agent/agentaccount"
export default {
  name: "AgentBalance",
  data() {
    return {
      activeTab: 'agentBalance',
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 代存记录表格数据
      agentpayList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示可用余额：默认不显示
      showBalance: false,
      // 是否显示显示下级账号：默认不显示
      showmemberName: false,
      // 验证方式: 默认sms
      verifyType: 'sms',
      // 查询参数
      queryParams: {
        commissionType: "1",
      },
      // 表单参数
      form: {
        agentBalance: 0.00,
        memberName: null,
        agentPayAmount: null,
        flowMultiple: null,
        commissionType: "1",
        agentPayStatus: 0,
      },
      // 表单校验
      rules: {
        memberName: [
          { required: true, message: "下级账号不能为空", trigger: "blur" }
        ],
        agentPayAmount: [
          { required: true, message: "代存金额不能为空", trigger: "blur" }
        ],
        turnoverMultiple: [
          { required: true, message: "流水倍数不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getAgentBalance();
  },
  methods: {
    getAgentBalance() {
      this.loading = true
      getAgentBalance(this.queryParams).then(response => {
        if (response.code === 200) {
          this.form.agentBalance = response.data.balance == null ? 0 : response.data.balance
        } else {
          this.form.agentBalance = 0
          // console.error("获取佣金代存金额失败:", error);  
        }
        this.loading = false
      }).catch(error => {
        this.form.agentBalance = 0
        console.error("获取代理金额失败:", error);
        this.loading = false;
      });
    },
    toggleBalance() {
      this.showBalance = !this.showBalance
    },
    togglememberName() {
      this.showmemberName = !this.showmemberName
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          addAgentBalance(this.form).then(response => {
            this.$emit('deposit-success')
            // 可选：重置表单
            this.$refs.form.resetFields();
            // 可选：刷新可用佣金
            this.getAgentBalance();

            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.loading = true;
          }).catch(error => {
            console.error("代存失败:", error);
            this.loading = false;
          });
        }
      });
    },
  }
};
</script>

<style scoped>
.eye-icon {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  position: relative;
}

/* 闭眼状态：加一条斜线 */
.eye-close::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 1.5px;
  background: #999;
  top: 50%;
  left: -1px;
  transform: rotate(-45deg);
}

.balance-card {
  display: flex;
  align-items: center;       /* 让左侧图片整体和右侧两行垂直居中 */
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
}

.balance-icon {
  width: 44px;               /* 左侧固定宽度 */
  display: flex;
  align-items: center;       /* 图片在两行高度中居中 */
  justify-content: center;
  margin-right: 14px;
}

.balance-icon img {
  width: 28px;
  height: 28px;
}

.balance-right {
  flex: 1;
  display: flex;
  flex-direction: column;    /* 右侧两行 */
}

.balance-title {
  font-size: 14px;
  color: #333;
  line-height: 20px;
}

.balance-row2 {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-amount {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

/* 眼睛 + 斜线 */
.eye-icon {
  font-size: 16px;
  color: #999;
  cursor: pointer;
  position: relative;
}

.eye-icon.eye-close::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 2px;
  background: #999;
  top: 50%;
  left: -1px;
  transform: rotate(-45deg);
}
.fixed-input {
  width: 360px;
}
.input-with-tip {
  display: flex;
  align-items: center;
}
.form-input-260 {
  width: 260px;
}
.input-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
  white-space: nowrap; /* 不换行，和截图一致 */
}
</style>
