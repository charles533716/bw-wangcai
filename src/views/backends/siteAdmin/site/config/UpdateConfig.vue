<template>
  <div class="update-config">
   <!-- <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
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
      <el-form-item label="维护状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择维护状态" clearable size="small">
          <el-option label="正常" :value="1" />
          <el-option label="维护中" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="站点状态" prop="siteStatus">
        <el-select v-model="queryParams.siteStatus" placeholder="请选择站点状态" clearable size="small">
          <el-option
            v-for="dict in siteStatusOptions"
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
    </el-form> -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增维护配置</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改维护配置</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除维护配置</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="updateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="平台类型" align="center" prop="platType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plat_type" :value="scope.row.platType"/>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="updateDateStart" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateDateStart, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="updateDateEnd" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateDateEnd, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="维护状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            active-text="正常"
            inactive-text="维护"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column> -->
      <el-table-column label="站点状态" align="center" prop="siteStatus" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.siteStatus"
            :active-value="1"
            :inactive-value="2"

            @change="handleSiteStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="提示文字" align="center" prop="clientWord" min-width="200">
        <template slot-scope="scope">
          <el-tooltip v-if="scope.row.clientWord" :content="scope.row.clientWord" placement="top">
            <span class="client-word">{{ scope.row.clientWord.substring(0, 30) }}{{ scope.row.clientWord.length > 30 ? '...' : '' }}</span>
          </el-tooltip>
          <span v-else class="no-content">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
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

    <!-- 添加或修改维护配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="平台类型" prop="platType">
          <el-select v-model="form.platType" placeholder="请选择平台类型" style="width: 100%">
            <el-option
              v-for="dict in platTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="维护时间段" required>
          <el-col :span="11">
            <el-form-item prop="updateDateStart">
              <el-date-picker
                v-model="form.updateDateStart"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" style="text-align: center;">-</el-col>
          <el-col :span="11">
            <el-form-item prop="updateDateEnd">
              <el-date-picker
                v-model="form.updateDateEnd"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-form-item>

      <!--  <el-form-item label="维护状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">维护中</el-radio>
          </el-radio-group>
        </el-form-item> -->

        <el-form-item label="站点状态" prop="siteStatus">
          <el-select v-model="form.siteStatus" placeholder="请选择站点状态" style="width: 100%">
            <el-option
              v-for="dict in siteStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="客户端提示" prop="clientWord">
          <el-input
            v-model="form.clientWord"
            type="textarea"
            placeholder="请输入客户端显示的维护提示文字"
            :rows="4"
            maxlength="255"
            show-word-limit
          />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            维护期间将在客户端显示此提示文字
          </div>
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
import { listSiteUpdate, addSiteUpdate, updateSiteUpdate, delSiteUpdate } from "@/api/site/config";

export default {
  name: "UpdateConfig",
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  dicts: ['plat_type', 'site_status'],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      updateList: [],
      title: "",
      open: false,
      platTypeOptions: [],
      siteStatusOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: this.siteCode,
        platType: null,
        status: null,
        siteStatus: null
      },
      form: {
        siteCode: this.siteCode,
        status: 1,
        siteStatus: "1"
      },
      rules: {
        platType: [
          { required: true, message: "平台类型不能为空", trigger: "change" }
        ],
        updateDateStart: [
          { required: true, message: "请选择维护开始时间", trigger: "change" }
        ],
        updateDateEnd: [
          { required: true, message: "请选择维护结束时间", trigger: "change" }
        ],
        status: [
          { required: true, message: "请选择维护状态", trigger: "change" }
        ],
        siteStatus: [
          { required: true, message: "请选择站点状态", trigger: "change" }
        ]
      }
    };
  },
  watch: {
    siteCode: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.queryParams.siteCode = newVal;
          this.form.siteCode = newVal;
          this.getList();
        }
      }
    }
  },
  created() {
    this.loadDictData();
  },
  methods: {
    // 加载字典数据
    loadDictData() {
      // 平台类型字典
      this.getDicts("plat_type").then(response => {
        this.platTypeOptions = response.data;
      });
      // 站点状态字典
      this.getDicts("site_status").then(response => {
        this.siteStatusOptions = response.data;
      });
    },

    /** 查询维护配置列表 */
    getList() {
      this.loading = true;
      listSiteUpdate(this.queryParams).then(response => {
        this.updateList = response.rows;
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
        siteCode: this.siteCode,
        platType: null,
        updateDateStart: null,
        updateDateEnd: null,
        status: 1,
        clientWord: null,
        siteStatus: "1"
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
      this.open = true;
      this.title = "添加站点维护配置";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      // 直接使用行数据，但需要处理状态值的类型转换
      this.form = Object.assign({}, row);

      // 确保状态值是字符串类型（因为字典值是字符串）
      if (this.form.siteStatus !== null && this.form.siteStatus !== undefined) {
        this.form.siteStatus = this.form.siteStatus.toString();
      }

      this.open = true;
      this.title = "修改站点维护配置";
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 验证时间范围
          if (this.form.updateDateStart && this.form.updateDateEnd) {
            const startTime = new Date(this.form.updateDateStart).getTime();
            const endTime = new Date(this.form.updateDateEnd).getTime();
            if (endTime <= startTime) {
              this.$modal.msgError("结束时间必须大于开始时间");
              return;
            }
          }

          // 准备提交数据
          const submitData = Object.assign({}, this.form);

          if (this.form.id != null) {
            updateSiteUpdate(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSiteUpdate(submitData).then(response => {
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
      this.$modal.confirm('是否确认删除选中的维护配置？').then(function() {
        return delSiteUpdate(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },

    /** 维护状态修改 */
    handleStatusChange(row) {
      let text = row.status === 1 ? "正常" : "维护";
      this.$modal.confirm('确认要将状态修改为"' + text + '"吗？').then(() => {
        const updateData = {
          id: row.id,
          status: row.status
        };
        return updateSiteUpdate(updateData);
      }).then(() => {
        this.$modal.msgSuccess("状态修改成功");
        this.getList();
      }).catch(() => {
        // 操作取消，恢复原状态
        row.status = row.status === 1 ? 0 : 1;
      });
    },

    /** 站点状态修改 */
    handleSiteStatusChange(row) {
      let text = row.siteStatus === 1 ? "启用" : "维护中";
      this.$modal.confirm('确认要将站点状态修改为"' + text + '"吗？').then(() => {
        const updateData = {
          id: row.id,
          siteStatus: row.siteStatus
        };
        return updateSiteUpdate(updateData);
      }).then(() => {
        this.$modal.msgSuccess("站点状态修改成功");
        this.getList();
      }).catch(() => {
        // 操作取消，恢复原状态
        row.siteStatus = row.siteStatus === 1 ? 2 : 1;
      });
    }
  }
};
</script>

<style scoped>
.update-config {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.client-word {
  color: #333;
  font-size: 14px;
}

.no-content {
  color: #999;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .update-config {
    padding: 10px;
  }

  .search-form .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
