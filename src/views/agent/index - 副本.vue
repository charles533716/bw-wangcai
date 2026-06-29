<!-- agent/index.vue 完整代码 -->
<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="80px">
      <el-form-item label="代理账号" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入代理账号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点编码" prop="siteCode">
        <el-select
          v-model="queryParams.siteCode"
          placeholder="请选择站点"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="site in siteOptions"
            :key="site.code"
            :label="site.code + ' - ' + site.nameZn"
            :value="site.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="代理状态" prop="agentStatus">
        <el-select v-model="queryParams.agentStatus" placeholder="代理状态" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="代理级别" prop="agentLevel">
        <el-select v-model="queryParams.agentLevel" placeholder="代理级别" clearable>
          <el-option label="一级代理" :value="1" />
          <el-option label="二级代理" :value="2" />
          <el-option label="三级代理" :value="3" />
        </el-select>
      </el-form-item>
     <!-- <el-form-item label="联系电话" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="handleAdd"
          v-hasPermi="['member:agent:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['member:agent:edit']"
        >修改</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['member:agent:remove']"
        >删除</el-button> -->
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          @click="handleExport"
          v-hasPermi="['system:agent:export']"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="agentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="代理ID" align="center" prop="id" />
      <el-table-column label="代理账号" align="center" prop="name" />
      <el-table-column label="代理级别" align="center" prop="agentLevel">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_agent_level" :value="scope.row.agentLevel"/>
        </template>
      </el-table-column>
      <el-table-column label="站点编码" align="center" prop="siteCode">
        <template slot-scope="scope">
          <span>{{ scope.row.siteCode }}</span>
          <el-tag v-if="getSiteName(scope.row.siteCode)" size="mini" type="info" style="margin-left: 5px;">
            {{ getSiteName(scope.row.siteCode) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="代理域名" align="center" prop="agentDomain" />
      <el-table-column label="代理状态" align="center" prop="agentStatus">
        <template slot-scope="scope">
          <el-tag :type="scope.row.agentStatus === 1 ? 'success' : 'danger'">
            {{ scope.row.agentStatus === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="下属代理" align="center" prop="subAgentCount" />
      <el-table-column label="下属会员" align="center" prop="subMemberCount" />
      <el-table-column label="佣金方案" align="center" prop="commissionPlanName">
        <template slot-scope="scope">
          <span>{{ scope.row.commissionPlanName || '未设置' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="最后登录" align="center" prop="lastLoginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastLoginTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['member:agent:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['member:agent:remove']"
          >删除</el-button>
         <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleViewDetails(scope.row)"
            v-hasPermi="['member:agent:query']"
          >详情</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="Number(total)"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改代理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="代理账号" prop="name">
              <el-input v-model="form.name" placeholder="请输入代理账号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入密码" type="password" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="站点编码" prop="siteCode">
              <el-select
                v-model="form.siteCode"
                placeholder="请选择站点"
                style="width: 100%"
                clearable
                filterable
              >
                <el-option
                  v-for="site in siteOptions"
                  :key="site.code"
                  :label="site.code + ' - ' + site.nameZn"
                  :value="site.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="代理级别" prop="agentLevel">
              <el-select v-model="form.agentLevel" placeholder="请选择代理级别" style="width: 100%">
                <el-option label="总代" :value="1" />

              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="代理状态" prop="agentStatus">
              <el-radio-group v-model="form.agentStatus">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="代理域名" prop="agentDomain">
              <el-input v-model="form.agentDomain" placeholder="请输入代理专属域名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="佣金方案" prop="commissionPlanId">
              <el-select
                v-model="form.commissionPlanId"
                placeholder="请选择佣金方案"
                style="width: 100%"
                clearable
                filterable
              >
                <el-option
                  v-for="plan in commissionOptions"
                  :key="plan.id"
                  :label="plan.planName + (plan.commTypeName ? ' (' + plan.commTypeName + ')' : '')"
                  :value="plan.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

       <!-- <el-row>
          <el-col :span="24">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row -->

        <el-row>
          <el-col :span="24">
            <el-form-item label="代理备注" prop="agentRemark">
              <el-input
                v-model="form.agentRemark"
                type="textarea"
                placeholder="请输入代理备注"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 代理详情对话框 -->
    <el-dialog title="代理详情" :visible.sync="detailOpen" width="600px" append-to-body>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="代理账号">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="代理级别">
          <dict-tag :options="dict.type.sys_agent_level" :value="detailForm.agentLevel"/>
        </el-descriptions-item>
        <el-descriptions-item label="站点编码">{{ detailForm.siteCode }}</el-descriptions-item>
        <el-descriptions-item label="代理域名">{{ detailForm.agentDomain || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="代理状态">
          <el-tag :type="detailForm.agentStatus === 1 ? 'success' : 'danger'">
            {{ detailForm.agentStatus === 1 ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下属代理">{{ detailForm.subAgentCount || 0 }}个</el-descriptions-item>
        <el-descriptions-item label="下属会员">{{ detailForm.subMemberCount || 0 }}个</el-descriptions-item>
        <el-descriptions-item label="佣金方案">{{ detailForm.commissionPlanName || '未设置' }}</el-descriptions-item>
     <!--   <el-descriptions-item label="联系电话">{{ detailForm.phone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailForm.email || '未设置' }}</el-descriptions-item> -->
        <el-descriptions-item label="最后登录时间">
          {{ parseTime(detailForm.lastLoginTime) || '从未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ parseTime(detailForm.regTime) }}</el-descriptions-item>
        <el-descriptions-item label="代理备注">{{ detailForm.agentRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAgent, getAgent, delAgent, addAgent, updateAgent, exportAgent } from "@/api/agent/agent";
import { listSite } from "@/api/site/site";
import { listCommissionByType,listCommission } from "@/api/agent/commission";

export default {
  name: "Agent",
  dicts: ['sys_agent_level'],
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
      // 总条数
      total: 0,
      // 代理表格数据
      agentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 详情对话框
      detailOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        siteCode: null,
        agentStatus: null,
        agentLevel: null,
        phone: null,
      },
      // 表单参数
      form: {},
      // 详情表单
      detailForm: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "代理账号不能为空", trigger: "blur" },
          { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        siteCode: [
          { required: true, message: "站点编码不能为空", trigger: "change" }
        ],
        agentLevel: [
          { required: true, message: "代理级别不能为空", trigger: "change" }
        ],
        agentStatus: [
          { required: true, message: "代理状态不能为空", trigger: "change" }
        ]
        // phone: [
        //   { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur" }
        // ],
        // email: [
        //   { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        // ]
      },
      // 站点选项
      siteOptions: [],
      // 佣金方案选项
      commissionOptions: [],
      // 站点名称映射
      siteNameMap: {},
      // 导出loading
      exportLoading: false
    };
  },
  created() {
    this.getList();
    this.getSiteOptions();
    this.getCommissionOptions();
  },
  methods: {
    /** 查询代理列表 */
    getList() {
      this.loading = true;
      listAgent(this.queryParams).then(response => {
        if (response.code === 200) {
          this.agentList = response.rows || response.data?.rows || [];
          this.total = Number(response.total || response.data?.total || 0);
        } else {
          this.agentList = [];
          this.total = 0;
          this.$modal.msgError(response.msg || "获取数据失败");
        }
        this.loading = false;
      }).catch(error => {
        console.error("获取代理列表失败:", error);
        this.agentList = [];
        this.total = 0;
        this.loading = false;
        this.$modal.msgError("获取数据失败");
      });
    },

    /** 获取站点选项 */
    getSiteOptions() {
      listSite({ pageNum: 1, pageSize: 1000 }).then(response => {
        if (response.code === 200) {
          this.siteOptions = response.rows || response.data?.rows || [];
          // 创建站点名称映射
          this.siteOptions.forEach(site => {
            if (site.code && site.nameZn) {
              this.siteNameMap[site.code] = site.nameZn;
            }
          });
        }
      }).catch(error => {
        console.error("获取站点列表失败:", error);
        this.siteOptions = [];
      });
    },

    /** 获取站点名称 */
    getSiteName(siteCode) {
      return this.siteNameMap[siteCode] || '';
    },

    /** 获取佣金方案选项 */
    getCommissionOptions() {
      // 获取所有佣金方案
      listCommission('').then(response => {
        if (response.code === 200) {
          const plans = response.rows || response.data || [];
          this.commissionOptions = plans.map(plan => {
            let commTypeName = '';
            if (plan.commType) {
              switch(plan.commType) {
                case '1': commTypeName = '输赢值返佣'; break;
                case '2': commTypeName = '返点式返佣'; break;
                case '3': commTypeName = '多层级代理返佣'; break;
                case '4': commTypeName = '首充返佣'; break;
                case '5': commTypeName = '留存返佣'; break;
                default: commTypeName = '未知类型';
              }
            }
            return {
              ...plan,
              commTypeName
            };
          });
        }
      }).catch(error => {
        console.error("获取佣金方案失败:", error);
        this.commissionOptions = [];
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        name: null,
        siteCode: null,
        agentStatus: null,
        agentLevel: null,
        phone: null,
      };
      this.handleQuery();
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加代理";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || (this.ids.length > 0 ? this.ids[0] : null);
      if (!id) {
        this.$modal.msgWarning("请选择要修改的代理");
        return;
      }
      getAgent(id).then(response => {
        if (response.code === 200) {
          this.form = response.data;
          this.open = true;
          this.title = "修改代理";
        } else {
          this.$modal.msgError(response.msg || "获取代理信息失败");
        }
      }).catch(error => {
        console.error("获取代理信息失败:", error);
        this.$modal.msgError("获取代理信息失败");
      });
    },

    /** 查看详情 */
    handleViewDetails(row) {
      const id = row.id || (this.ids.length > 0 ? this.ids[0] : null);
      if (!id) {
        this.$modal.msgWarning("请选择要查看的代理");
        return;
      }
      getAgent(id).then(response => {
        if (response.code === 200) {
          this.detailForm = response.data;
          // 设置下属数量（如果接口未返回）
          if (this.detailForm.subAgentCount === undefined) {
            this.detailForm.subAgentCount = 0;
          }
          if (this.detailForm.subMemberCount === undefined) {
            this.detailForm.subMemberCount = 0;
          }
          this.detailOpen = true;
        } else {
          this.$modal.msgError(response.msg || "获取代理详情失败");
        }
      }).catch(error => {
        console.error("获取代理详情失败:", error);
        this.$modal.msgError("获取代理详情失败");
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAgent(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.msg || "修改失败");
              }
            }).catch(error => {
              console.error("修改代理失败:", error);
              this.$modal.msgError("修改失败");
            });
          } else {
            addAgent(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.$modal.msgError(response.msg || "新增失败");
              }
            }).catch(error => {
              console.error("新增代理失败:", error);
              this.$modal.msgError("新增失败");
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || (this.ids.length > 0 ? this.ids.join(",") : null);
      if (!ids) {
        this.$modal.msgWarning("请选择要删除的代理");
        return;
      }
      this.$modal.confirm('是否确认删除代理编号为"' + ids + '"的数据项？').then(() => {
        return delAgent(ids);
      }).then(response => {
        if (response.code === 200) {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        } else {
          this.$modal.msgError(response.msg || "删除失败");
        }
      }).catch(() => {
        // 用户取消了删除操作
      });
    },

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有代理数据项？').then(() => {
        this.exportLoading = true;
        return exportAgent(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.exportLoading = false;
      }).catch(error => {
        console.error("导出失败:", error);
        this.exportLoading = false;
      });
    },

    /** 重置表单 */
    reset() {
      this.form = {
        id: null,
        name: null,
        password: null,
        siteCode: null,
        agentLevel: 1,
        agentStatus: 1,  // 默认正常
        agentDomain: null,
        commissionPlanId: null,
        phone: null,
        email: null,
        agentRemark: null
      };
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    }
  }
};
</script>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}

.el-tag {
  margin-left: 5px;
}

.app-container {
  padding: 20px;
}
</style>
