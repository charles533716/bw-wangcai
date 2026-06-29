<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入用户名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上级代理" prop="parentAgentName">
        <el-input
          v-model="queryParams.parentAgentName"
          placeholder="请输入上级代理账号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="推荐人ID" prop="parent">
        <el-input
          v-model="queryParams.parent"
          placeholder="推荐人ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属团队" prop="teamCode">
        <el-select v-model="queryParams.teamCode" placeholder="请选择团队" clearable size="small">
          <el-option
            v-for="item in teamOptions"
            :key="item.teamCode"
            :label="item.title"
            :value="item.teamCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="用户状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">
          导出Excel
        </el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['member:user:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['member:user:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-key"
          size="mini"
          :disabled="single"
          @click="handleResetPwd"
          v-hasPermi="['member:user:edit']"
        >重置密码</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['member:user:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="id" />
      <el-table-column label="用户名称" align="center" prop="name" />
      <el-table-column label="上级代理" align="center" prop="parentAgentName" />
      <el-table-column label="推荐人ID" align="center" prop="parent" />
      <el-table-column label="团队" align="center" prop="teamName">
        <template slot-scope="scope">
          <span>{{ scope.row.teamName || '未分配' }}</span>
        </template>
      </el-table-column>
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
      <el-table-column label="最后登录IP" align="center" prop="lastLoginIp" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status == 1 ? 'primary' : 'danger'"
            size="small"
          >
            {{ scope.row.status == 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['member:user:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-key"
            @click="handleResetPwd(scope.row)"
            v-hasPermi="['member:user:edit']"
          >密码</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['member:user:remove']"
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

    <!-- 添加或修改用户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名称" />
        </el-form-item>
      <!-- 密码字段：只有新增时显示 -->
         <el-form-item
           v-if="!form.id"
           label="密码"
           prop="password"
           :rules="!form.id ? rules.password : []"
         >
           <el-input
             v-model="form.password"
             placeholder="请输入密码"
             type="password"
             show-password
           />
         </el-form-item>
        <el-form-item label="推荐人ID" prop="parent">
          <el-input v-model="form.parent" placeholder="请输入推荐人ID" />
        </el-form-item>
        <el-form-item label="团队" prop="teamCode">
          <el-select v-model="form.teamCode" placeholder="请选择团队" clearable>
            <el-option
              v-for="item in teamOptions"
              :key="item.teamCode"
              :label="item.title + ' (' + item.teamCode + ')'"
              :value="item.teamCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog title="重置密码" :visible.sync="resetPwdOpen" width="400px" append-to-body>
      <el-form ref="resetPwdForm" :model="resetPwdForm" :rules="pwdRules" label-width="80px">
        <el-form-item label="用户名称" prop="name">
          <el-input v-model="resetPwdForm.name" :disabled="true" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" placeholder="请确认新密码" type="password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitResetPwd">确 定</el-button>
        <el-button @click="cancelResetPwd">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, addUser, updateUser, delUser } from "@/api/member/user";
import { listTeam } from "@/api/member/team";

export default {
  name: "User",
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
      // 用户表格数据
      userList: [],
      // 团队选项列表
      teamOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 修改密码对话框
      resetPwdOpen: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        parentAgentName: undefined,
        parent: undefined,
        teamCode: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 修改密码表单
      resetPwdForm: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "用户名称不能为空", trigger: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      },
      // 密码表单校验
      pwdRules: {
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度必须在6到20个字符之间", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: this.validateConfirmPassword, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("member_user_status").then(response => {
      this.statusOptions = response.data;
    });
    this.getTeamList();
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then(response => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    /** 获取团队列表 */
    getTeamList() {
      listTeam({ status: 1 }).then(response => {
        this.teamOptions = response.rows;
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
        id: undefined,
        name: undefined,
        password: undefined,
        parent: undefined,
        teamCode: undefined,
        status: "1"
      };
      this.resetForm("form");
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

    /** 导出按钮操作 */
    handleExport() {
      this.download('member/user/export', {
        ...this.queryParams
      }, `member_user_${new Date().getTime()}.xlsx`);
    },

    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getUser(id).then(response => {
        this.form = response.data;
        if (this.form.status !== undefined && this.form.status !== null) {
          this.form.status = this.form.status.toString();
        }
        this.open = true;
        this.title = "修改用户";
      });
    },

    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.resetPwdForm = {
        id: row.id,
        name: row.name,
        password: "",
        confirmPassword: ""
      };
      this.resetPwdOpen = true;
      this.$nextTick(() => {
        this.$refs.resetPwdForm.clearValidate();
      });
    },

    /** 提交重置密码 */
    submitResetPwd() {
      this.$refs["resetPwdForm"].validate(valid => {
        if (valid) {
          const self = this;
          self.loading = true;

          const submitData = {
            id: self.resetPwdForm.id,
            password: self.resetPwdForm.password
          };

          updateUser(submitData).then(response => {
            self.$modal.msgSuccess("密码重置成功");
            self.resetPwdOpen = false;
            self.getList();
          }).catch(function(error) {
            console.error("密码重置失败:", error);
            self.msgError("密码重置失败");
          }).finally(function() {
            self.loading = false;
          });
        }
      });
    },

    /** 取消重置密码 */
    cancelResetPwd() {
      this.resetPwdOpen = false;
      this.resetPwdForm = {
        id: undefined,
        name: "",
        password: "",
        confirmPassword: ""
      };
    },

    /** 验证确认密码 */
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.resetPwdForm.password) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    },

    /** 提交按钮 */
    submitForm() {
      const self = this;
      this.$refs["form"].validate(valid => {
        if (valid) {
          self.loading = true;
          if (self.form.id != null) {
            updateUser(self.form).then(response => {
              self.$modal.msgSuccess("修改成功");
              self.open = false;
              self.getList();
            }).catch(function(error) {
              console.error("修改失败:", error);
              self.msgError("修改失败");
            }).finally(function() {
              self.loading = false;
            });
          } else {
            addUser(self.form).then(response => {
              self.$modal.msgSuccess("新增成功");
              self.open = false;
              self.getList();
            }).catch(function(error) {
              console.error("新增失败:", error);
              self.msgError("新增失败");
            }).finally(function() {
              self.loading = false;
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除用户编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delUser(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
