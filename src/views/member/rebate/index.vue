<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="场馆类型" prop="venueType">
        <el-select v-model="queryParams.venueType" placeholder="请选择场馆类型" clearable size="small">
          <el-option
            v-for="dict in venueTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="是否启用" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="是否启用" clearable size="small">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['module:rebate:add']"
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
          v-hasPermi="['module:rebate:edit']"
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
          v-hasPermi="['module:rebate:remove']"
        >删除</el-button>
      </el-col>

    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" width="80" />
      <el-table-column label="场馆类型" align="center" prop="venueType">
        <template slot-scope="scope">
          {{getDictLabel(scope.row.venueType,venueTypeOptions)}}

        </template>
      </el-table-column>
   <!--   <el-table-column label="游戏类型" align="center" prop="gameType" /> -->
      <el-table-column label="返水比例(%)" align="center" prop="rebateRate">
        <template slot-scope="scope">
          <span>{{ scope.row.rebateRate }}%</span>
        </template>
      </el-table-column>
    <!--  <el-table-column label="最低投注额" align="center" prop="minBetAmount" /> -->
      <el-table-column label="最高返水金额" align="center" prop="maxRebateAmount" />
    <!--  <el-table-column label="有效期" align="center" prop="validPeriod">
        <template slot-scope="scope">
          <dict-tag :options="validPeriodOptions" :value="scope.row.validPeriod"/>
        </template>
      </el-table-column> -->
      <el-table-column label="是否启用" align="center" prop="isActive">
         <template slot-scope="scope">
       {{scope.row.isActive === 1 ? "启用" : "禁用"}}
        </template>
      </el-table-column>
     <!-- <el-table-column label="生效时间" align="center" prop="effectiveTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.effectiveTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="失效时间" align="center" prop="expiryTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expiryTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updatedBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['module:rebate:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['module:rebate:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="场馆类型" prop="venueType">
              <el-select v-model="form.venueType" placeholder="请选择场馆类型" style="width: 100%">
                <el-option
                  v-for="dict in venueTypeOptions"
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
            <el-form-item label="返水比例(%)" prop="rebateRate">
              <el-input-number v-model="form.rebateRate" :min="0" :max="100" :precision="2" :step="0.01" style="width: 100%" />
            </el-form-item>
          </el-col>

        </el-row>
        <el-row>
        <!--  <el-col :span="12">
            <el-form-item label="最低投注额" prop="minBetAmount">
              <el-input-number v-model="form.minBetAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col> -->
          <el-col :span="12">
            <el-form-item label="最高返水金额" prop="maxRebateAmount">
              <el-input-number v-model="form.maxRebateAmount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="isActive">
              <el-radio-group v-model="form.isActive">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRebateConfig, getRebateConfig, delRebateConfig, addRebateConfig, updateRebateConfig, changeStatus } from "@/api/member/rebate";
import DictTag from '@/components/DictTag';

export default {
  name: "RebateConfig",
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
      // 返水设置表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        venueType: null,
        gameType: null,
        validPeriod: null,
        isActive: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        venueType: [
          { required: true, message: "场馆类型不能为空", trigger: "blur" }
        ],

        rebateRate: [
          { required: true, message: "返水比例不能为空", trigger: "blur" }
        ],

        isActive: [
          { required: true, message: "是否启用不能为空", trigger: "blur" }
        ]

      },
      // 字典数据
      venueTypeOptions: [],
      validPeriodOptions: [
        { dictValue: 'daily', dictLabel: '日' },
        { dictValue: 'weekly', dictLabel: '周' },
        { dictValue: 'monthly', dictLabel: '月' }
      ]
    };
  },
  created() {

    this.getDicts("venue_type").then(response => {
      this.venueTypeOptions = response.data;
    });
     this.getList();
  },


  methods: {
    /** 查询返水设置列表 */
    getList() {
      this.loading = true;
      listRebateConfig(this.queryParams).then(response => {
        this.configList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
 /** 获取字典标签方法 */
      getDictLabel(value, options) {
        if (!value || !options || options.length === 0) return value;
        const item = options.find(item =>
          item.dictValue === value || item.value === value
        );
        return item ? (item.dictLabel || item.label) : value;
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
        venueType: null,
        gameType: null,
        rebateRate: 0,
        minBetAmount: 0,
        maxRebateAmount: null,
        validPeriod: null,
        isActive: 1,
        effectiveTime: null,
        expiryTime: null,
        remark: null,
        updatedBy: null,
        createdBy: null
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
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加返水设置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getRebateConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改返水设置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRebateConfig(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRebateConfig(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除返水设置编号为"' + ids + '"的数据项？').then(function() {
        return delRebateConfig(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/module/rebate/export', {
        ...this.queryParams
      }, `rebate_config_${new Date().getTime()}.xlsx`)
    },
    /** 状态修改操作 */
    handleStatusChange(row) {
      const text = row.isActive === 1 ? "启用" : "禁用";
      this.$modal.confirm('确认要' + text + '"' + row.gameType + '"吗？').then(function() {
        return changeStatus(row.id, row.isActive);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.isActive = row.isActive === 0 ? 1 : 0;
      });
    }
  }
};
</script>
