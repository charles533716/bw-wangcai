<!-- 代理代存 -->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>代理代存</span>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="额度代存" name="agentBalance">
          <agent-balance @deposit-success="handleDepositSuccess" />
        </el-tab-pane>
        <el-tab-pane label="佣金代存" name="agentCommission">
          <agent-commission @deposit-success="handleDepositSuccess" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <div class="gap-row"></div>

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会员账号" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入会员账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="全部"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" prop="operationTime">
        <el-date-picker
          v-model="operationTimeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          unlink-panels
          :picker-options="operationTimePickerOptions"
          style="width: 320px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="agentpayList">
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="记录编号" align="center" prop="code" />
      <el-table-column label="会员账号" align="center" prop="memberName" />
      <!--<<el-table-column label="代存类型" align="center" prop="transactionType" />-->
      <el-table-column label="状态" align="center">
        <template #default="scope">
          {{ gettransactionTypeLabel(scope.row.transactionType) }}
        </template>
      </el-table-column>
      <el-table-column label="代存金额" align="center" prop="amount" />
      <!--<el-table-column label="状态" align="center" prop="status" />-->
      <el-table-column label="状态" align="center">
        <template #default="scope">
          {{ getStatusLabel(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="userRemark" />
      <el-table-column label="操作时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
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
  </div>
</template>

<script>
import AgentCommission from './AgentCommission'
import AgentBalance from './AgentBalance'
import { listAgentAccountrecord } from "@/api/agent/agentaccount"

export default {
  name: "AgentpayRecord",
  components: {
    AgentCommission,
    AgentBalance
  },
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
        memberName: null,
        beginOperationTime: null,
        endOperationTime: null,
        
        apiTransferNo: null,
        memberId: null,
        agentPayType: null,
        agentPayAmount: null,
        agentPayStatus: null,
        agentPayRemark: null,
        operationTime: null,
        turnoverMultiple: null,
        agentPayUserId: null,
      },
      // 操作时间
      operationTimeRange: [],
      // date-picker 左侧快捷选项
      operationTimePickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setDate(start.getDate() - 7)
              picker.$emit("pick", [start, end])
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 1)
              picker.$emit("pick", [start, end])
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 3)
              picker.$emit("pick", [start, end])
            }
          }
        ]
      },
      // 表单参数
      form: {},
      statusOptions: [
        { label: '全部', value: 0 },
        { label: '代理转账审核成功', value: 22 },
        { label: '代理转账审核中', value: 31 },
        { label: '代理转账审核失败', value: 32 },

      ],
      transactionTypeOptions: [
        { label: '佣金代存', value: 18 },
        { label: '额度代存', value: 19 },
      ],
      // 表单校验
      rules: {
        agentPayAmount: [
          { required: true, message: "代存金额不能为空", trigger: "blur" }
        ],
        operationTime: [
          { required: true, message: "操作时间不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" }
        ],
      },

    }
  },
  watch: {
    // 选择日期范围后，同步到 queryParams
    operationTimeRange(val) {
      if (val && val.length === 2) {
        this.queryParams.beginOperationTime = val[0]
        this.queryParams.endOperationTime = val[1]
      } else {
        this.queryParams.beginOperationTime = null
        this.queryParams.endOperationTime = null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    gettransactionTypeLabel(value) {
      const item = this.transactionTypeOptions.find(
        option => option.value === value
      )
      return item ? item.label : value
    },
    getStatusLabel(value) {
      const item = this.statusOptions.find(
        option => option.value === value
      )
      return item ? item.label : value
    },
    /** 代存成功后刷新列表 */
    handleDepositSuccess() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 查询代存记录列表 */
    getList() {
      this.loading = true

      const params = {
          memberName: this.queryParams.memberName,
          status: this.queryParams.status,
          startDate: this.queryParams.beginOperationTime,
          endDate: this.queryParams.endOperationTime,
        };

      listAgentAccountrecord(params).then(response => {
        console.log("-----listAgentAccountrecord-----", params);
        if (response.code === 200) {
          this.agentpayList = response.rows || []
          this.total = response.total
        } else {
          console.error("获取代存记录失败:", error);  
        }
        this.loading = false
      }).catch(error => {
        console.error("获取代存记录失败:", error);
        this.loading = false;
        //this.$modal.msgError("获取数据失败");
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.operationTimeRange = []
      this.queryParams.beginOperationTime = null
      this.queryParams.endOperationTime = null
      this.resetForm("queryForm")
      this.handleQuery()
    },
  }
}
</script>

<style scoped>
.gap-row {
  height: 24px;
}
</style>
