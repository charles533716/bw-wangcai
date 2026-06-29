<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">

     <el-form-item label="配置名称" prop="configType">
       <el-select v-model="queryParams.configType" placeholder="配置名称" clearable size="small">
         <el-option
           v-for="item in typeOptions"
           :key="item.configType"
           :label="item.configName"
           :value="item.configType"
         />
       </el-select>

     </el-form-item>
      <el-form-item label="配置标签" prop="configLabel">
        <el-input
          v-model="queryParams.configLabel"
          placeholder="请输入配置标签"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="配置键值" prop="configValue">
        <el-input
          v-model="queryParams.configValue"
          placeholder="请输入配置键值"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="配置状态" clearable size="small">
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
          v-hasPermi="['game:config:add']"
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
          v-hasPermi="['game:config:edit']"
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
          v-hasPermi="['game:config:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-close"
            size="mini"
            @click="handleClose"
          >关闭</el-button>

      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="配置编号" align="center" prop="configCode" />
      <el-table-column label="配置标签" align="center" prop="configLabel" />
      <el-table-column label="配置键值" align="center" prop="configValue" />
     <!-- <el-table-column label="配置名称" align="center" prop="configType" :formatter="typeFormat" /> -->
      <el-table-column label="扩展数据" align="center" prop="extraData" />
      <el-table-column label="排序" align="center" prop="configSort" />

    <el-table-column label="状态" align="center" prop="status">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
            </template>
          </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['game:config:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['game:config:remove']"
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="配置名称" disabled="true" prop="configType">
         <el-select v-model="form.configType" placeholder="请选择配置名称">
            <el-option
              v-for="item in typeOptions"
              :key="item.configType"
              :label="item.configName"
              :value="item.configType"
            ></el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="配置标签" prop="configLabel">
          <el-input v-model="form.configLabel" placeholder="请输入配置标签" />
        </el-form-item>
        <el-form-item label="配置键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入配置键值" />
        </el-form-item>
        <el-form-item label="扩展数据" prop="extraData">
          <el-input v-model="form.extraData" placeholder="请输入扩展数据" />
        </el-form-item>
        <el-form-item label="显示排序" prop="configSort">
          <el-input-number v-model="form.configSort" controls-position="right" :min="0" />
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
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listConfigData, getConfigData, delConfigData, addConfigData, updateConfigData, exportConfigData } from "@/api/game/config";
import { listConfigType } from "@/api/game/configType";

export default {
  name: "ConfigData",
   dicts: ['sys_normal_disable'],
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
      // 字典表格数据
      configList: [],
      // 类型数据字典
      typeOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configLabel: [
          { required: true, message: "配置标签不能为空", trigger: "blur" }
        ],
        configValue: [
          { required: true, message: "配置键值不能为空", trigger: "blur" }
        ],
        configSort: [
          { required: true, message: "配置顺序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    const configType = this.$route.query.configType;
    if (configType) {
      this.queryParams.configType = configType;
    }


    this.getList();
    this.getTypeList();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询配置数据列表 */
    getList() {
      this.loading = true;
      listConfigData(this.queryParams).then(response => {
        this.configList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 查询配置名称
    getTypeList() {
      listConfigType().then(response => {
        this.typeOptions = response.rows;
      });
    },
    // 配置名称字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType);
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        configCode: undefined,
        configLabel: undefined,
        configValue: undefined,
        configType: undefined,
        extraData: undefined,
        cssClass: undefined,
        listClass: undefined,
        configSort: 0,
        status: "0",
        remark: undefined
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
      this.ids = selection.map(item => item.configCode);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加配置数据";
      this.form.configType = this.queryParams.configType;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const configCode = row.configCode || this.ids;
      getConfigData(configCode).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改配置数据";
      });
    },
    /** 返回按钮操作 */
    handleClose() {
      const obj = { path: "/site-admin/game/config" }
      this.$tab.closeOpenPage(obj)
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.configCode != undefined) {
            updateConfigData(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addConfigData(this.form).then(response => {
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
      const configCodes = row.configCode || this.ids;
      this.$confirm('是否确认删除配置编号为"' + configCodes + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delConfigData(configCodes);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有配置数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportConfigData(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(() => {});
    }
  }
};
</script>
