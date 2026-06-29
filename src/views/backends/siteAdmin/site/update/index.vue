<template>
  <div class="update-config">
    <el-row :gutter="10" class="mb8">
     <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增维护配置</el-button>
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
      <el-table-column label="站点状态" align="center" prop="siteStatus" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.siteStatus === 1 ? 'success' : 'danger'">
            {{ scope.row.siteStatus === 1 ? '运营中' : '维护中' }}
          </el-tag>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.siteStatus === 1"
            size="mini"
            type="warning"
            icon="el-icon-tools"
            @click="handleMaintain(scope.row)"
          >维护</el-button>
          <el-button
            v-else
            size="mini"
            type="success"
            icon="el-icon-s-operation"
            @click="handleOperate(scope.row)"
          >运营</el-button>
          <el-button
            size="mini"
            type="info"
            icon="el-icon-document"
            @click="handleLog(scope.row)"
          >日志</el-button>
         <!-- <el-button
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
          >删除</el-button> -->
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
        <!-- 原有表单内容保持不变 -->
      </el-form>
    </el-dialog>

    <!-- 维护操作对话框 -->
    <el-dialog title="站点维护" :visible.sync="maintainOpen" width="500px" append-to-body>
      <el-form ref="maintainForm" :model="maintainForm" :rules="maintainRules" label-width="100px">
        <el-form-item label="平台类型" prop="platType">
          <el-input v-model="maintainForm.platType" :disabled="true" />
        </el-form-item>
        <el-form-item label="维护原因" prop="updateReason">
          <el-input
            v-model="maintainForm.updateReason"
            type="textarea"
            placeholder="请输入维护原因"
            :rows="4"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="维护时间段" required>
          <el-col :span="11">
            <el-form-item prop="updateDateStart">
              <el-date-picker
                v-model="maintainForm.updateDateStart"
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
                v-model="maintainForm.updateDateEnd"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="提示文字" prop="clientWord">
          <el-input
            v-model="maintainForm.clientWord"
            type="textarea"
            placeholder="请输入客户端显示的维护提示文字"
            :rows="3"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitMaintain">确 定</el-button>
        <el-button @click="maintainOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 维护日志对话框 -->
    <el-dialog title="维护日志" :visible.sync="logOpen" width="800px" append-to-body>
      <el-table v-loading="logLoading" :data="logList">
        <el-table-column label="操作时间" align="center" prop="operationTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.operationTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" align="center" prop="operatorName" width="120" />
        <el-table-column label="维护原因" align="center" prop="updateReason" min-width="200" />
        <el-table-column label="操作前状态" align="center" prop="beforeStatus" width="100">
          <template slot-scope="scope">
            <dict-tag :options="siteStatusOptions" :value="scope.row.beforeStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="操作后状态" align="center" prop="afterStatus" width="100">
          <template slot-scope="scope">
            <dict-tag :options="siteStatusOptions" :value="scope.row.afterStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
      </el-table>
      <pagination
        v-show="logTotal>0"
        :total="logTotal"
        :page.sync="logQueryParams.pageNum"
        :limit.sync="logQueryParams.pageSize"
        @pagination="getLogList"
      />
    </el-dialog>
  </div>
</template>

<script>
import { listSiteUpdate, addSiteUpdate, updateSiteUpdate, delSiteUpdate, maintainSite, operateSite, listSiteUpdateLog } from "@/api/site/config";

export default {
  name: "Update",
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
      maintainOpen: false,
      logOpen: false,
      platTypeOptions: [],
      siteStatusOptions: [],

      // 维护表单
      maintainForm: {
        id: null,
        siteCode: null, // 将通过 store 获取
        platType: null,
        updateDateStart: null,
        updateDateEnd: null,
        clientWord: null,
        updateReason: null
      },
      maintainRules: {
        updateReason: [
          { required: true, message: "维护原因不能为空", trigger: "blur" }
        ],
        updateDateStart: [
          { required: true, message: "请选择维护开始时间", trigger: "change" }
        ],
        updateDateEnd: [
          { required: true, message: "请选择维护结束时间", trigger: "change" }
        ]
      },

      // 日志相关
      logLoading: false,
      logList: [],
      logTotal: 0,
      logQueryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: null, // 将通过 store 获取
        platType: null
      },

      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: null, // 将通过 store 获取
        platType: null,
        status: null,
        siteStatus: null
      },
      form: {
        siteCode: null, // 将通过 store 获取
        status: 1,
        siteStatus: "1"
      },
      rules: {
        // 原有规则保持不变
      }
    };
  },
  computed: {
    // 从 store 获取 siteCode
    siteCode() {
      return this.$store.getters.siteCode;
    }
  },
  watch: {
    // 监听 siteCode 变化
    siteCode: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.updateSiteCodeParams(newVal);
          this.getList();
        }
      }
    }
  },
  created() {
    this.loadDictData();
    // 确保站点配置已加载
    this.ensureSiteConfig();
  },
  methods: {
    // 确保站点配置已加载
    async ensureSiteConfig() {
      if (!this.siteCode) {
        try {
          await this.$store.dispatch('site/getSiteConfig');
          // 初始化参数
          if (this.siteCode) {
            this.updateSiteCodeParams(this.siteCode);
          }
        } catch (error) {
          console.error('加载站点配置失败:', error);
        }
      }
    },

    // 更新所有需要 siteCode 的参数
    updateSiteCodeParams(siteCode) {
      this.queryParams.siteCode = siteCode;
      this.form.siteCode = siteCode;
      this.logQueryParams.siteCode = siteCode;
      this.maintainForm.siteCode = siteCode;
    },

    // 加载字典数据
    loadDictData() {
      this.getDicts("plat_type").then(response => {
        this.platTypeOptions = response.data;
      });
      this.getDicts("site_status").then(response => {
        this.siteStatusOptions = response.data;
      });
    },

    /** 查询维护配置列表 */
    getList() {
      // 确保有 siteCode 再请求
      if (!this.siteCode) {
        console.warn('siteCode 未设置，跳过获取列表');
        this.loading = false;
        return;
      }

      this.loading = true;
      listSiteUpdate(this.queryParams).then(response => {
        this.updateList = response.rows;
        this.total = response.total;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },

    /** 维护按钮操作 */
    handleMaintain(row) {
      this.maintainForm = {
        id: row.id,
        siteCode: this.siteCode, // 使用 store 中的 siteCode
        platType: row.platType,
        updateDateStart: null,
        updateDateEnd: null,
        clientWord: null,
        updateReason: null
      };
      this.maintainOpen = true;
    },

    /** 运营按钮操作 */
    handleOperate(row) {
      this.$modal.confirm('确认要将"' + row.platType+ '"平台恢复运营吗？').then(() => {
        return operateSite(row.id);
      }).then(() => {
        this.$modal.msgSuccess("恢复运营成功");
        this.getList();
      }).catch(() => {});
    },

    /** 日志按钮操作 */
    handleLog(row) {
      this.logQueryParams.platType = row.platType;
      this.logOpen = true;
      this.getLogList();
    },

    /** 查询维护日志列表 */
    getLogList() {
      // 确保有 siteCode 再请求
      if (!this.siteCode) {
        console.warn('siteCode 未设置，跳过获取日志列表');
        this.logLoading = false;
        return;
      }

      this.logLoading = true;
      listSiteUpdateLog(this.logQueryParams).then(response => {
        this.logList = response.rows;
        this.logTotal = response.total;
        this.logLoading = false;
      }).catch(() => {
        this.logLoading = false;
      });
    },

    /** 提交维护操作 */
    submitMaintain() {
      this.$refs["maintainForm"].validate(valid => {
        if (valid) {
          // 验证时间范围
          if (this.maintainForm.updateDateStart && this.maintainForm.updateDateEnd) {
            const startTime = new Date(this.maintainForm.updateDateStart).getTime();
            const endTime = new Date(this.maintainForm.updateDateEnd).getTime();
            if (endTime <= startTime) {
              this.$modal.msgError("结束时间必须大于开始时间");
              return;
            }
          }

          // 确保使用最新的 siteCode
          this.maintainForm.siteCode = this.siteCode;

          maintainSite(this.maintainForm).then(response => {
            this.$modal.msgSuccess("维护操作成功");
            this.maintainOpen = false;
            this.getList();
          });
        }
      });
    },

    // 其他原有方法保持不变...
    cancel() {
      this.open = false;
      this.reset();
    },

    reset() {
      this.form = {
        id: null,
        siteCode: this.siteCode, // 使用 store 中的 siteCode
        platType: null,
        updateDateStart: null,
        updateDateEnd: null,
        status: 1,
        clientWord: null,
        siteStatus: "1"
      };
      this.resetForm("form");
    },

    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },

    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加站点维护配置";
    },

    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      this.form = Object.assign({}, row);
      if (this.form.siteStatus !== null && this.form.siteStatus !== undefined) {
        this.form.siteStatus = this.form.siteStatus.toString();
      }
      this.open = true;
      this.title = "修改站点维护配置";
    },

    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.updateDateStart && this.form.updateDateEnd) {
            const startTime = new Date(this.form.updateDateStart).getTime();
            const endTime = new Date(this.form.updateDateEnd).getTime();
            if (endTime <= startTime) {
              this.$modal.msgError("结束时间必须大于开始时间");
              return;
            }
          }

          // 确保使用最新的 siteCode
          this.form.siteCode = this.siteCode;

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

    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除选中的维护配置？').then(function() {
        return delSiteUpdate(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.update-config {
  padding: 20px;
}

.client-word {
  color: #333;
  font-size: 14px;
}

.no-content {
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .update-config {
    padding: 10px;
  }
}
</style>
