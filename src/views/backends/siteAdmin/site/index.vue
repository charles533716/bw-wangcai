<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
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
      <el-form-item label="站点状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="站点状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['game:site:add']"
        >新增</el-button>
      </el-col> -->
     <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['game:site:edit']"
        >修改</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['game:site:remove']"
        >删除</el-button>
      </el-col> -->
     <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['game:site:export']"
        >导出</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-s-promotion"
          size="mini"
          @click="handleApply"
          v-hasPermi="['game:site:apply']"
        >申请开站</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-check"
          size="mini"
          @click="handleApproveList"
          v-hasPermi="['game:site:approve']"
        >审批列表</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="siteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="站点ID" align="center" prop="id" />
      <el-table-column label="站点编码" align="center" prop="code" />
      <el-table-column label="站点名称" align="center" prop="nameZn" />
      <el-table-column label="站点英文名称" align="center" prop="nameEn" />
      <el-table-column label="后台账号" align="center" prop="account" />
      <el-table-column label="站点状态" align="center" prop="status">
        <template slot-scope="scope">
                  <dict-tag :options="dict.type.site_status" :value="scope.row.status"/>
                </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="applyDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
           <el-button
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleConfig(scope.row)"
                v-hasPermi="['game:site:config']"
              >配置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['game:site:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['game:site:remove']"
          >删除</el-button>
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

    <!-- 添加或修改站点对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="站点编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入站点编码" />
        </el-form-item>
        <el-form-item label="中文名称" prop="nameZn">
          <el-input v-model="form.nameZn" placeholder="请输入站点中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入站点英文名称" />
        </el-form-item>
        <el-form-item label="后台账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入后台登录账号（邮箱）" />
        </el-form-item>
      <!--  <el-form-item label="登录密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入登录密码" />
        </el-form-item> -->
        <el-form-item label="站点状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择站点状态">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="申请备注" prop="applyDesc">
          <el-input v-model="form.applyDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { listSite, getSite, delSite, addSite, updateSite, applySite, approveSite, getApplyList } from "@/api/site/site";

export default {
  name: "Site",
   dicts: ['site_status','site_bussiness_type','site_type'],

  data() {
    return {
      // 遮罩层
      loading: true,
      approveLoading: false,
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
      // 审批列表数据
      approveList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示申请弹出层
      applyOpen: false,
      // 是否显示审批列表弹出层
      approveOpen: false,
      // 是否显示审批对话框
      approveDialogOpen: false,
      // 审批对话框标题
      approveTitle: "",
      // 站点状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: null,
        nameZn: null,
        status: null
      },
      // 表单参数
      form: {},
      // 申请表单参数
      applyForm: {},
      // 审批表单参数
      approveForm: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: "站点编码不能为空", trigger: "blur" }
        ],
        nameZn: [
          { required: true, message: "站点中文名称不能为空", trigger: "blur" }
        ],
        account: [
          { required: true, message: "后台账号不能为空", trigger: "blur" }
        ]
      },
      // 申请表单校验
      applyRules: {
        code: [
          { required: true, message: "站点编码不能为空", trigger: "blur" }
        ],
        nameZn: [
          { required: true, message: "站点中文名称不能为空", trigger: "blur" }
        ],
        account: [
          { required: true, message: "后台账号不能为空", trigger: "blur" }
        ]
        // ,
        // password: [
        //   { required: true, message: "登录密码不能为空", trigger: "blur" }
        // ]
      },

    };
  },
  created() {
    this.getList();
    this.getDicts("site_status").then(response => {
      this.statusOptions = response.data;
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
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
      this.resetForm("form");
    },
    // 申请表单重置
    resetApply() {
      this.applyForm = {
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        password: null,
        applyDesc: null
      };
      this.resetForm("applyForm");
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 配置按钮操作 */
    handleConfig(row) {
      const siteCode = row.code;
      this.$router.push({
        path: '/site-admin/site/config/index',
        query: { siteCode: siteCode }
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSite(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改站点";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSite(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSite(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    // /** 删除按钮操作 */
    // handleDelete(row) {
    //   const ids = row.id || this.ids;
    //   this.$modal.confirm('是否确认删除站点编号为"' + ids + '"的数据项？').then(function() {
    //     return delSite(ids);
    //   }).then(() => {
    //     this.getList();
    //     this.$modal.msgSuccess("删除成功");
    //   }).catch(() => {});
    // },

  }
};
</script>
