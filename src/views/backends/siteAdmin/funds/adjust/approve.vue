<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="订单号" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入订单号"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员账号" prop="memberName">
        <el-input
          v-model="queryParams.memberName"
          placeholder="请输入会员账号"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="调分方向" prop="transactionType">
        <el-select
          v-model="queryParams.transactionType"
          placeholder="请选择调分方向"
          clearable
          size="small"
          style="width: 200px"
        >
          <el-option label="人工上分" :value="7" />
          <el-option label="人工下分" :value="8" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作人" prop="operatorName">
        <el-input
          v-model="queryParams.operatorName"
          placeholder="请输入操作人"
          clearable
          size="small"
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="操作时段">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="recordList">
      <el-table-column label="订单号" align="center" prop="code" width="200" />
      <el-table-column label="会员账号" align="center" prop="memberName" />
      <el-table-column label="调分方向" align="center" prop="transactionType">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.transactionType === 7" type="success">人工上分</el-tag>
          <el-tag v-else-if="scope.row.transactionType === 8" type="warning">人工下分</el-tag>
          <span v-else>{{ scope.row.transactionType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调分金额" align="center" prop="amount">
        <template slot-scope="scope">
          {{ Math.abs(scope.row.amount) }} CNY
        </template>
      </el-table-column>

      <el-table-column label="调分原因" align="center" prop="adjustReason">
        <template slot-scope="scope">
          {{ getReasonLabel(scope.row.adjustReason, scope.row.transactionType) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="memo" show-overflow-tooltip />
      <el-table-column label="发起人" align="center" prop="operatorName" />
      <el-table-column label="发起时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 9" type="info">审核中</el-tag>
          <el-tag v-else-if="scope.row.status === 10" type="info">审核成功</el-tag>
          <el-tag v-else-if="scope.row.status === 11" type="success">审核失败</el-tag>
          <el-tag v-else-if="scope.row.status === 12" type="danger">审核中</el-tag>
          <el-tag v-else-if="scope.row.status === 13" type="success">审核失败</el-tag>
          <el-tag v-else-if="scope.row.status === 14" type="danger">审核成功</el-tag>
          <span v-else>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 9 || scope.row.status === 12"
            size="mini"
            type="success"
            @click="handleApprove(scope.row)"
            style="min-width: 60px; margin: 2px"
          >通过</el-button>
          <el-button
            v-if="scope.row.status === 9 || scope.row.status === 12"
            size="mini"
            type="danger"
            @click="handleReject(scope.row)"
            style="min-width: 60px; margin: 2px"
          >拒绝</el-button>
          <span v-else>-</span>
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

    <!-- 审核通过对话框 -->
    <el-dialog title="审核通过" :visible.sync="approveVisible" width="500px" append-to-body>
      <el-form ref="approveForm" :model="approveForm" :rules="approveRules" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="approveForm.code" disabled />
        </el-form-item>
        <el-form-item label="审核意见" prop="reviewReason">
          <el-input
            v-model="approveForm.reviewReason"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approveVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitApprove">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 审核拒绝对话框 -->
    <el-dialog title="审核拒绝" :visible.sync="rejectVisible" width="500px" append-to-body>
      <el-form ref="rejectForm" :model="rejectForm" :rules="rejectRules" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="rejectForm.code" disabled />
        </el-form-item>
        <el-form-item label="拒绝原因" prop="reviewReason">
          <el-input
            v-model="rejectForm.reviewReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitReject">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAuditRecord, approveRecord, rejectRecord ,getUpReasons,getDownReasons} from "@/api/funds/account";

export default {
  name: "ManualAdjustAudit",
  data() {
    return {
      loading: false,
      recordList: [],
      total: 0,
      dateRange: [],
      upReasonOptions: [],
      downReasonOptions: [],
      approveVisible: false,
      rejectVisible: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: undefined,
        memberName: undefined,
        transactionType: undefined,
        operatorName: undefined,
        siteCode:this.$store.getters.siteCode,
      },
      approveForm: {
        recordId: undefined,
        code: '',
        reviewReason: ''
      },
      rejectForm: {
        recordId: undefined,
        code: '',
        reviewReason: ''
      },
      approveRules: {
        reviewReason: [
          { required: true, message: "审核意见不能为空", trigger: "blur" }
        ]
      },
      rejectRules: {
        reviewReason: [
          { required: true, message: "拒绝原因不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    // 获取上分原因
     getUpReasons().then(response => {
       this.upReasonOptions = response.data;
     });
     getDownReasons().then(response => {
       this.downReasonOptions = response.data;
     });
    this.getList();

  },
  methods: {
    // 获取调整原因标签
      getReasonLabel(reasonValue, transactionType) {
        if (!reasonValue) return '-';

        let options = [];
        if (transactionType === 7) {
          // 人工上分
          options = this.upReasonOptions;
        } else if (transactionType === 8) {
          // 人工下分
          options = this.downReasonOptions;
        }

        const reason = options.find(item => item.dictValue === reasonValue);
        return reason ? reason.dictLabel : reasonValue;
      },
    getList() {
      this.loading = true;

      // 处理时间范围参数
      const params = {
        ...this.queryParams,
        params: {}
      };

      if (this.dateRange && this.dateRange.length === 2) {
        params.params.beginTime = this.dateRange[0] + ' 00:00:00';
        params.params.endTime = this.dateRange[1] + ' 23:59:59';
      }

      listAuditRecord(params).then(response => {
        this.recordList = response.rows;
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
    handleApprove(row) {
      this.approveForm = {
        recordId: row.id,
        code: row.code,
        reviewReason: ''
      };
      this.approveVisible = true;
      this.$nextTick(() => {
        this.$refs.approveForm.clearValidate();
      });
    },
    handleReject(row) {
      this.rejectForm = {
        recordId: row.id,
        code: row.code,
        reviewReason: ''
      };
      this.rejectVisible = true;
      this.$nextTick(() => {
        this.$refs.rejectForm.clearValidate();
      });
    },
    submitApprove() {
      this.$refs.approveForm.validate(valid => {
        if (valid) {
          approveRecord(this.approveForm).then(response => {
            this.$modal.msgSuccess("审核通过成功");
            this.approveVisible = false;
            this.getList();
          });
        }
      });
    },
    submitReject() {
      this.$refs.rejectForm.validate(valid => {
        if (valid) {
          rejectRecord(this.rejectForm).then(response => {
            this.$modal.msgSuccess("拒绝成功");
            this.rejectVisible = false;
            this.getList();
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
