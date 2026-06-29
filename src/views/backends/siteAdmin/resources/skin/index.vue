<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="皮肤名称" prop="skinName">
        <el-input
          v-model="queryParams.skinName"
          placeholder="请输入皮肤名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="平台类型" prop="platType">
        <el-select v-model="queryParams.platType" placeholder="请选择平台类型" clearable size="small">
          <el-option
            v-for="dict in platTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="皮肤编号" prop="skinCode">
        <el-input
          v-model="queryParams.skinCode"
          placeholder="请输入皮肤编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="皮肤状态" clearable size="small">
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
          v-hasPermi="['resources:skin:add']"
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
          v-hasPermi="['resources:skin:edit']"
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
          v-hasPermi="['resources:skin:remove']"
        >删除</el-button>
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="skinList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="皮肤名称" align="center" prop="skinName" />
      <el-table-column label="平台类型" align="center" prop="platType" :formatter="platTypeFormat" />
      <el-table-column label="皮肤编号" align="center" prop="skinCode" />
      <el-table-column label="皮肤效果图" align="center" prop="skinImage" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.skinImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="模版类型" align="center" prop="templateType"  >
      <template slot-scope="scope">
        <dict-tag :options="dict.type.template_type" :value="scope.row.templateType"/>
      </template>
       </el-table-column>
      <el-table-column label="状态" align="center" prop="status"   >
     <template slot-scope="scope">
       <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
     </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:skin:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:skin:remove']"
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

    <!-- 添加或修改皮肤对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="皮肤名称" prop="skinName">
          <el-input v-model="form.skinName" placeholder="请输入皮肤名称" />
        </el-form-item>
        <el-form-item label="平台类型" prop="platType">
          <el-select v-model="form.platType" placeholder="请选择平台类型">
            <el-option
              v-for="dict in platTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="皮肤编号" prop="skinCode">
          <el-input v-model="form.skinCode" placeholder="请输入皮肤编号" />
        </el-form-item>
        <el-form-item label="皮肤效果图" prop="skinImage">
          <image-upload v-model="form.skinImage"/>
        </el-form-item>
        <el-form-item label="模版类型" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择模版类型">
            <el-option
              v-for="dict in dict.type.template_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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
import { listSkin, getSkin, delSkin, addSkin, updateSkin, exportSkin } from "@/api/resources/skin";

export default {
  name: "Skin",
   dicts: ['template_type','plat_type', 'sys_normal_disable'],
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
      // 皮肤表格数据
      skinList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 平台类型数据字典
      platTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        skinName: null,
        platType: null,
        skinCode: null,
        templateType: null,
        status: null
      },
      // 表单参数
      form: {status:0},
      // 表单校验
      rules: {
        skinName: [
          { required: true, message: "皮肤名称不能为空", trigger: "blur" }
        ],
        platType: [
          { required: true, message: "平台类型不能为空", trigger: "change" }
        ],
        skinCode: [
          { required: true, message: "皮肤编号不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("plat_type").then(response => {
      this.platTypeOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询皮肤列表 */
    getList() {
      this.loading = true;
      listSkin(this.queryParams).then(response => {
        this.skinList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 平台类型字典翻译
    platTypeFormat(row, column) {
      return this.selectDictLabel(this.platTypeOptions, row.platType);
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
        skinName: null,
        platType: null,
        skinCode: null,
        skinImage: null,
        templateType: null,
        status: 0
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
      this.form.status = 0;
      this.open = true;
      this.title = "添加皮肤";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSkin(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改皮肤";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSkin(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSkin(this.form).then(response => {
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
      this.$confirm('是否确认删除皮肤编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delSkin(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有皮肤数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportSkin(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
