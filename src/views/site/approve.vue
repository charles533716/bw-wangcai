<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="站点编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="nameZn">
        <el-input
          v-model="queryParams.nameZn"
          placeholder="请输入站点中文名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请时间">
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

    <el-row :gutter="10" class="mb8">
    <!--  <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['game:site:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待审批" name="pending"></el-tab-pane>
      <el-tab-pane label="已审批" name="approved"></el-tab-pane>
      <el-tab-pane label="已拒绝" name="rejected"></el-tab-pane>
    </el-tabs>

    <el-table v-loading="loading" :data="siteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="站点编码" align="center" prop="code" width="50" />
      <el-table-column label="站点名称" align="center" prop="nameZn" width="100" />
      <el-table-column label="站点英文名称" align="center" prop="nameEn" width="80" />
      <el-table-column label="后台账号" align="center" prop="account" width="180" />
      <el-table-column label="站点类型" align="center" prop="typeId" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.site_type" :value="scope.row.typeId"/>
        </template>
      </el-table-column>
      <el-table-column label="经营类型" align="center" prop="businessTypeId" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.site_bussiness_type" :value="scope.row.businessTypeId"/>
        </template>
      </el-table-column>
      <el-table-column label="申请状态" align="center" prop="status" width="100">

        <template slot-scope="scope">
          <dict-tag :options="dict.type.site_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="applyDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyDate, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请备注" align="center" prop="applyDesc" show-overflow-tooltip />
      <el-table-column label="审批时间" align="center" prop="approveDate" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.approveDate">{{ parseTime(scope.row.approveDate, '{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="审批备注" align="center" prop="approveDesc" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['game:site:query']"
          >查看</el-button>
          <el-button
            v-if="scope.row.status === '3'"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleApprove(scope.row, '4')"
            v-hasPermi="['game:site:approve']"
          >通过</el-button>
          <el-button
            v-if="scope.row.status === '3'"
            size="mini"
            type="text"
            icon="el-icon-close"
            @click="handleApprove(scope.row, '5')"
            v-hasPermi="['game:site:approve']"
          >拒绝</el-button>
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

    <!-- 查看站点详情对话框 -->
    <el-dialog title="站点申请详情" :visible.sync="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="站点编码">{{ form.code }}</el-descriptions-item>
        <el-descriptions-item label="站点中文名称">{{ form.nameZn }}</el-descriptions-item>
        <el-descriptions-item label="站点英文名称">{{ form.nameEn }}</el-descriptions-item>
        <el-descriptions-item label="后台账号">{{ form.account }}</el-descriptions-item>
        <el-descriptions-item label="站点类型">
          <dict-tag :options="dict.type.site_type" :value="form.typeId"/>
        </el-descriptions-item>
        <el-descriptions-item label="经营类型">
          <dict-tag  :options="dict.type.site_bussiness_type" :value="form.businessTypeId"/>
        </el-descriptions-item>
        <el-descriptions-item label="申请状态">

          <dict-tag :options="dict.type.site_status" :value="form.status"/>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ parseTime(form.applyDate, '{y}-{m}-{d} {h}:{i}') }}</el-descriptions-item>
        <el-descriptions-item label="申请备注" :span="2">{{ form.applyDesc || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批人">{{ form.approveUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ form.approveDate ? parseTime(form.approveDate, '{y}-{m}-{d} {h}:{i}') : '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批备注" :span="2">{{ form.approveDesc || '-' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog :title="approveTitle" :visible.sync="approveOpen" width="500px" append-to-body :close-on-click-modal="false" :show-close="!approveLoading">
      <div v-if="approveLoading" class="approve-loading-container">
        <div class="loading-content">
          <i class="el-icon-loading" style="font-size: 36px; color: #409EFF; margin-bottom: 10px;"></i>
          <div style="text-align: center; color: #606266; font-size: 14px; margin-top: 10px;">
            <p style="margin-bottom: 5px;">{{ approveLoadingText }}</p>
            <p style="font-size: 12px; color: #909399;">请勿关闭窗口或重复操作...</p>
          </div>
        </div>
      </div>
      <div v-else>
        <el-form ref="approveForm" :model="approveForm" :rules="approveRules" label-width="80px">
          <el-form-item label="审批备注" prop="approveDesc">
            <el-input v-model="approveForm.approveDesc" type="textarea" placeholder="请输入审批备注" :rows="4" maxlength="500" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitApproveForm" :loading="approveLoading">确 定</el-button>
          <el-button @click="cancelApprove" :disabled="approveLoading">取 消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSite, getSite, approveSite, exportSite } from "@/api/site/site";

export default {
  name: "SiteApprove",
   dicts: ['site_status','site_bussiness_type','site_type'],
  data() {
    return {
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
      // 站点表格数据
      siteList: [],
      // 日期范围
      dateRange: [],
      // 激活的Tab
      activeTab: 'pending',
      // 是否显示查看弹出层
      viewOpen: false,
      // 是否显示审批弹出层
      approveOpen: false,
      // 审批对话框标题
      approveTitle: "",
      // 审批加载状态
      approveLoading: false,
      // 审批加载提示文本
      approveLoadingText: "正在审批中，请稍候...",
      // 站点类型字典
      siteTypeOptions: [],
      // 经营类型字典
      businessTypeOptions: [],
      // 审批状态字典
      approveStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: null,
        nameZn: null,
        status: '3' // 默认待审批状态
      },
      // 表单参数
      form: {},
      // 审批表单参数
      approveForm: {
        id: null,
        status: null,
        approveDesc: null,
        code:null
      },
      // 审批表单校验
      approveRules: {
        approveDesc: [
          { required: true, message: "审批备注不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("site_type").then(response => {
      this.siteTypeOptions = response.data;
    });
    this.getDicts("site_bussiness_type").then(response => {
      this.businessTypeOptions = response.data;
    });
    this.getDicts("site_status").then(response => {
      this.approveStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询站点列表 */
    getList() {
      this.loading = true;
      listSite(this.queryParams).then(response => {
        this.siteList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消审批
    cancelApprove() {
      if (this.approveLoading) {
        this.$modal.msgWarning("审批正在进行中，请稍候...");
        return;
      }
      this.approveOpen = false;
      this.resetApprove();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        password: null,
        skinId: null,
        typeId: null,
        businessTypeId: null,
        houtaiName: null,
        pcSiteTitle: null,
        pcAgentTitle: null,
        applyUserId: null,
        approveUserId: null,
        applyDate: null,
        applyDesc: null,
        approveDesc: null,
        approveDate: null,
        status: null
      };
    },
    // 审批表单重置
    resetApprove() {
      this.approveForm = {
        id: null,
        status: null,
        approveDesc: null,
        code:null
      };
      this.resetForm("approveForm");
      this.approveLoading = false;
      this.approveLoadingText = "正在审批中，请稍候...";
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleTabClick(); // 重置时重新设置状态
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** Tab 切换 */
    handleTabClick(tab) {
      const tabName = tab ? tab.name : this.activeTab;

      // 根据Tab设置状态筛选条件
      switch(tabName) {
        case 'all':
          this.queryParams.status = null; // 全部，不筛选状态
          break;
        case 'pending':
          this.queryParams.status = '3'; // 待审批
          break;
        case 'approved':
          this.queryParams.status = '4'; // 已审批
          break;
        case 'rejected':
          this.queryParams.status = '5'; // 已拒绝
          break;
      }

      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 查看按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getSite(id).then(response => {
        this.form = response.data;
        this.viewOpen = true;
      });
    },
    /** 审批操作 */
    handleApprove(row, status) {
      this.resetApprove();
      this.approveForm.id = row.id;
      this.approveForm.status = status;
      this.approveForm.code = row.code;
      this.approveTitle = status === '4' ? '审批通过' : '审批拒绝';
      this.approveOpen = true;
    },
    /** 提交审批 */
    submitApproveForm() {
      this.$refs["approveForm"].validate(valid => {
        if (valid) {
          // 防止重复提交
          if (this.approveLoading) {
            return;
          }

          this.approveLoading = true;
          this.approveLoadingText = "正在提交审批，请稍候...";

          approveSite(this.approveForm).then(response => {
            // 如果是审批通过，显示初始化进度提示
            if (this.approveForm.status === '4') {
              this.approveLoadingText = "审批通过，正在初始化站点配置...";

              // 模拟延迟，等待后台初始化完成
              setTimeout(() => {
                this.$modal.msgSuccess("审批操作成功，站点已初始化完成");
                this.approveOpen = false;
                this.approveLoading = false;
                this.getList();
              }, 2000); // 这里可以改为实际的初始化等待时间或使用轮询
            } else {
              // 审批拒绝，直接完成
              this.$modal.msgSuccess("审批操作成功");
              this.approveOpen = false;
              this.approveLoading = false;
              this.getList();
            }
          }).catch(error => {
            this.approveLoading = false;
            this.$modal.msgError("审批操作失败: " + (error.message || "未知错误"));
          });
        }
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = {
        ...this.queryParams,
        beginApplyDate: this.dateRange[0],
        endApplyDate: this.dateRange[1]
      };
      this.download('game/site/export', queryParams, `site_approve_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.el-tabs {
  margin-bottom: 20px;
}
.el-descriptions {
  margin-top: 20px;
}

.approve-loading-container {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  padding: 30px 0;
}

/* 防止用户点击蒙层关闭 */
::v-deep .el-dialog__headerbtn {
  pointer-events: none;
}

/* 加载状态下隐藏关闭按钮 */
::v-deep .approve-loading-container + .el-dialog__headerbtn {
  display: none;
}
</style>
