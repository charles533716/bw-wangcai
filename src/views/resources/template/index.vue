<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="模板编号" prop="templateCode">
        <el-input
          v-model="queryParams.templateCode"
          placeholder="请输入模板编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发送场景" prop="sendScene">
        <el-select v-model="queryParams.sendScene" placeholder="请选择发送场景" clearable size="small">
          <el-option
            v-for="dict in sendSceneOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="功能模块" prop="functionModule">
        <el-select v-model="queryParams.functionModule" placeholder="请选择功能模块" clearable size="small">
          <el-option
            v-for="dict in functionModuleOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="模板状态" clearable size="small">
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:messageTemplate:add']"
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
          v-hasPermi="['system:messageTemplate:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:messageTemplate:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="模板编号" align="center" prop="templateCode" />
      <el-table-column label="发送场景" align="center" prop="sendScene">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.message_send_scene" :value="scope.row.sendScene"/>
        </template>
      </el-table-column>
      <el-table-column label="功能模块" align="center" prop="functionModule">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.message_function_module" :value="scope.row.functionModule"/>
        </template>
      </el-table-column>
      <el-table-column label="发送对象" align="center" prop="sendTarget">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.message_send_target" :value="scope.row.sendTarget"/>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" show-overflow-tooltip />
      <el-table-column label="内容" align="center" prop="content" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.content ? scope.row.content.substring(0, 30) + (scope.row.content.length > 30 ? '...' : '') : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参数" align="center" prop="templateParams" show-overflow-tooltip />
      <el-table-column label="应用站点" align="center" prop="siteCount" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="handleViewSites(scope.row)">查看{{ scope.row.siteCodes.length || 0 }}个</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_status_enabled" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:messageTemplate:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-setting"
            @click="handleAuthSites(scope.row)"
            v-hasPermi="['system:messageTemplate:auth']"
          >授权站点</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:messageTemplate:remove']"
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

    <!-- 添加或修改站内信模板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板编号" prop="templateCode">
              <el-input v-model="form.templateCode" placeholder="请输入模板编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发送场景" prop="sendScene">
              <el-select v-model="form.sendScene" placeholder="请选择发送场景" style="width: 100%">
                <el-option
                  v-for="dict in sendSceneOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发送对象" prop="sendTarget">
              <el-select v-model="form.sendTarget" placeholder="请选择发送对象" style="width: 100%">
                <el-option
                  v-for="dict in sendTargetOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="功能模块" prop="functionModule">
              <el-select v-model="form.functionModule" placeholder="请选择功能模块" style="width: 100%">
                <el-option
                  v-for="dict in functionModuleOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题名称" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入站内信内容，不超过1000字"
            :rows="6"
            maxlength="1000"
            show-word-limit
          />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            提示：点击下方参数即可插入到站内信内容中
          </div>
        </el-form-item>
        <el-form-item label="可用参数">
          <el-tag
            v-for="param in availableParams"
            :key="param"
            type="info"
            style="margin-right: 10px; cursor: pointer;"
            @click="insertParam(param)"
          >
            {{ param }}
          </el-tag>
        </el-form-item>
        <el-form-item label="应用站点" prop="siteCodes">
          <el-select
            v-model="form.siteCodes"
            multiple
            placeholder="请选择应用站点"
            style="width: 100%"
          >
            <el-option
              v-for="site in siteOptions"
              :key="site.code"
              :label="site.nameZn + ' (' + site.code + ')'"
              :value="site.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 授权站点对话框 -->
    <el-dialog title="授权站点" :visible.sync="authOpen" width="500px" append-to-body>
      <el-form :model="authForm" ref="authForm" label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="authForm.templateName" :disabled="true" />
        </el-form-item>
        <el-form-item label="应用站点" prop="siteCodes">
          <el-select
            v-model="authForm.siteCodes"
            multiple
            placeholder="请选择应用站点"
            style="width: 100%"
          >
            <el-option
              v-for="site in siteOptions"
              :key="site.code"
              :label="site.nameZn + ' (' + site.code + ')'"
              :value="site.code"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAuthForm">确 定</el-button>
        <el-button @click="authOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看站点对话框 -->
    <el-dialog title="应用站点" :visible.sync="siteViewOpen" width="500px" append-to-body>
      <el-table :data="siteList" v-loading="siteLoading">
        <el-table-column property="siteName" label="站点名称" align="center"></el-table-column>
        <el-table-column property="siteCode" label="站点编码" align="center"></el-table-column>
       <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-close"
              @click="handleRevokeSite(scope.row)"
              v-hasPermi="['system:messageTemplate:auth']"
            >回收</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { listTemplate, getTemplate,getAuthSiteDetail, delTemplate, addTemplate, updateTemplate, authSites, revokeSiteAuth, getAuthSites } from "@/api/resources/messageTemplate";
import { listSite } from "@/api/site/site";

export default {
  name: "MessageTemplate",
  dicts: ['message_send_scene', 'message_send_target', 'message_function_module', 'sys_status_enabled'],
  data() {
    return {
      // 遮罩层
      loading: true,
      siteLoading: false,
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
      // 站内信模板表格数据
      templateList: [],
      // 站点列表数据
      siteList: [],
      // 站点选项
      siteOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示授权弹出层
      authOpen: false,
      // 是否显示站点查看弹出层
      siteViewOpen: false,
      // 发送场景字典
      sendSceneOptions: [],
      // 发送对象字典
      sendTargetOptions: [],
      // 功能模块字典
      functionModuleOptions: [],
      // 状态字典
      statusOptions: [],
      // 可用参数
      availableParams: ['${用户名}', '${每月充值礼金金额}', '${推荐礼金金额}', '${VIP等级}', '${佣金金额}', '${转账金额}', '${团队名称}'],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        templateCode: null,
        sendScene: null,
        functionModule: null,
        title: null,
        status: null
      },
      // 表单参数
      form: {
        status: "0"
      },
      // 授权表单参数
      authForm: {},
      // 表单校验
      rules: {
        templateCode: [
          { required: true, message: "模板编号不能为空", trigger: "blur" }
        ],
        templateName: [
          { required: true, message: "模板名称不能为空", trigger: "blur" }
        ],
        sendScene: [
          { required: true, message: "发送场景不能为空", trigger: "change" }
        ],
        sendTarget: [
          { required: true, message: "发送对象不能为空", trigger: "change" }
        ],
        functionModule: [
          { required: true, message: "功能模块不能为空", trigger: "change" }
        ],
        title: [
          { required: true, message: "标题不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" },
          { max: 1000, message: "内容长度不能超过1000个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getSiteList();
    this.getDicts("message_send_scene").then(response => {
      this.sendSceneOptions = response.data;
    });
    this.getDicts("message_send_target").then(response => {
      this.sendTargetOptions = response.data;
    });
    this.getDicts("message_function_module").then(response => {
      this.functionModuleOptions = response.data;
    });
    this.getDicts("sys_status_enabled").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询站内信模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then(response => {
        this.templateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询站点列表 */
    getSiteList() {
      listSite({ status: "1" }).then(response => {
        this.siteOptions = response.rows;
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
        templateCode: null,
        templateName: null,
        sendScene: null,
        functionModule: null,
        sendTarget: null,
        title: null,
        content: null,
        templateParams: null,
        status: "0",
        remark: null,
        siteCodes: []
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      // 生成模板编号
      this.form.templateCode = new Date().getTime().toString();
      this.open = true;
      this.title = "添加站内信模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTemplate(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改站内信模板";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTemplate(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTemplate(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除站内信模板编号为"' + ids + '"的数据项？').then(function() {
        return delTemplate(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 插入参数 */
    insertParam(param) {
      if (!this.form.content) {
        this.form.content = param;
      } else {
        this.form.content += param;
      }
    },
    /** 授权站点按钮操作 */
    handleAuthSites(row) {
      this.authForm = {
        id: row.id,
        templateName: row.templateName,
        siteCodes: []
      };
      // 加载已授权的站点
      getAuthSites(row.id).then(response => {
        this.authForm.siteCodes = response.data;
        this.authOpen = true;
      });
    },
    /** 提交授权表单 */
    submitAuthForm() {
      authSites(this.authForm).then(response => {
        this.$modal.msgSuccess("授权成功");
        this.authOpen = false;
        this.getList();
      });
    },
    /** 查看站点按钮操作 */
    handleViewSites(row) {
      this.siteLoading = true;
      getAuthSiteDetail(row.id).then(response => {
        this.siteList = response.data;
        this.siteViewOpen = true;
        this.siteLoading = false;
      }).catch(() => {
        this.siteLoading = false;
      });
    },
    /** 回收站点授权 */
    handleRevokeSite(row) {
      this.$modal.confirm('是否确认回收站点"' + row.siteName + '"的授权？').then(() => {
        return revokeSiteAuth(this.authForm.id, row.siteCode);
      }).then(() => {
        this.$modal.msgSuccess("回收成功");
        this.handleViewSites({ id: this.authForm.id });
      }).catch(() => {});
    }
  }
};
</script>
