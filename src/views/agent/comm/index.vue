<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="commissionList">
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="返佣方案名称" align="center" prop="planName" :show-overflow-tooltip="true" />

      <el-table-column label="方案详情" align="center" prop="detailList" width="250">
        <template slot-scope="scope">
          <div v-if="resolveDetailList(scope.row).length > 0">
            <div v-for="(detail, index) in resolveDetailList(scope.row)" :key="index" class="detail-item">
              <span v-if="scope.row.commType === '1'">
                净输赢 {{ detail.netWinLossMin }} - {{ detail.netWinLossMax }} / 返比 {{ (detail.commissionRate * 100).toFixed(2) }}%
              </span>
              <span v-else-if="scope.row.commType === '2'">
                月流水 {{ detail.monthlyTurnoverMin }} - {{ detail.monthlyTurnoverMax }} / 返比 {{ (detail.commissionRate * 100).toFixed(2) }}%
              </span>
              <span v-else-if="scope.row.commType === '3'">
                 {{ detail.levelNum }} 星级代理 / 返比 {{ (detail.commissionRate * 100).toFixed(2) }}%
              </span>
              <span v-else-if="scope.row.commType === '6'">
                {{ detail.levelNum }} 级代理 / 返比 {{ (detail.commissionRate * 100).toFixed(2) }}%
              </span>
              <span v-else-if="scope.row.commType === '4'">
                首充 {{ detail.firstRechargeAmount }} / 返佣金额 {{ detail.commissionAmount }}
              </span>
              <span v-else-if="scope.row.commType === '5'">
                留存天数 {{ detail.retentionDays }} / 返佣金额 {{ detail.commissionAmount }}
              </span>
            </div>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后操作人" align="center" prop="updateBy" />
      <el-table-column label="操作时间" align="center" prop="updateTime" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:commission:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-setting"
            @click="handleConfigure(scope.row)"
            v-hasPermi="['system:commission:edit']"
          >配置</el-button>
          <!--<el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:commission:remove']"
          >删除</el-button>-->
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

    <!-- 添加或修改佣金方案对话框 -->
       <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body> <!-- 增加对话框宽度 -->
         <el-form ref="form" :model="form" :rules="rules" label-width="120px">
           <el-form-item label="方案名称" prop="planName">
             <el-input v-model="form.planName" placeholder="请输入方案名称" />
           </el-form-item>

           <div v-if="activeCommType === '3' || activeCommType === '6'">
             <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddDetail">添加级别</el-button>
             <el-table :data="form.detailList" border style="width: 100%; margin-top: 10px;">
                <el-table-column :label="activeCommType === '3' ? '代理星级' : '代理层级'" align="center" width="150">
                 <template slot-scope="scope">
                   <el-input-number
                    v-model="scope.row.levelNum"
                    :min="0"
                    :step="1"
                    :precision="0"
                    controls-position="right"
                    size="mini"
                    style="width: 120px"
                  />
                 </template>
                </el-table-column>
               <el-table-column label="返佣比例(0~1)" align="center" width="180">
                 <template slot-scope="scope">
                   <el-input-number
                     v-model="scope.row.commissionRate"
                     :precision="4"
                     :step="0.0001"
                     :min="0"
                     :max="1"
                     controls-position="right"
                     size="mini"
                     style="width: 120px"
                   />
                 </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="100">
                 <template slot-scope="scope">
                   <el-button size="mini" type="text" icon="el-icon-delete" @click="handleRemoveDetail(scope.$index)">删除</el-button>
                 </template>
               </el-table-column>
             </el-table>
             <div class="explanation">
               <h4>说明：</h4>
               <p>1、代理自身星级/层级不在此处改变，这里只配置对应级别的返佣比例。</p>
               <p>2、比例按 0~1 保存，例如 0.45 表示 45%。</p>
             </div>
           </div>

         </el-form>
         <div slot="footer" class="dialog-footer">
           <el-button type="primary" @click="submitForm">确 定</el-button>
           <el-button @click="cancel">取 消</el-button>
         </div>
       </el-dialog>
     </div>
</template>

<script>
import { listCommission, listCommissionByType, getCommission, delCommission, addCommission, updateCommission, exportCommission } from "@/api/agent/commission";

export default {
  name: "Commission",
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
      // 佣金方案表格数据
      commissionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 日期范围
      dateRange: [],
      // 操作日期范围
      updateDateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        planName: null,
        updateBy: null,
        commType: null
      },
      // 表单参数
      form: {
        detailList: []
      },
      // 表单校验
      rules: {
        planName: [
          { required: true, message: "方案名称不能为空", trigger: "blur" }
        ]
      },
      // 激活的tab
      activeTab: "all",
      // 激活的佣金类型
      activeCommType: "1"
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询佣金方案列表 */
    getList() {
      this.loading = true;
      // 设置佣金类型
      if (this.activeTab !== 'all') {
        this.queryParams.commType = this.activeTab;
      } else {
        this.queryParams.commType = null;
      }

// 设置时间范围参数
  this.queryParams.params = {};

  // 设置创建时间范围
  if (this.dateRange && this.dateRange.length === 2) {
    this.queryParams.params.beginTime = this.dateRange[0];
    this.queryParams.params.endTime = this.dateRange[1];
  } else {
    this.queryParams.params.beginTime = null;
    this.queryParams.params.endTime = null;
  }

  // 设置操作时间范围
  if (this.updateDateRange && this.updateDateRange.length === 2) {
    this.queryParams.params.updateBeginTime = this.updateDateRange[0];
    this.queryParams.params.updateEndTime = this.updateDateRange[1];
  } else {
    this.queryParams.params.updateBeginTime = null;
    this.queryParams.params.updateEndTime = null;
  }

      listCommission(this.queryParams).then(response => {
        this.commissionList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    resolveDetailList(row) {
      const details = row && Array.isArray(row.detailList) ? row.detailList.slice() : [];
      if (row && row.commType === "6") {
        return details.sort((a, b) => Number(a.levelNum || 0) - Number(b.levelNum || 0));
      }
      return details;
    },
    // tab点击事件
    handleTabClick(tab) {
      this.activeTab = tab.name;
      this.getList();
    },
     // 佣金类型tab切换
      handleCommTypeChange(tab) {
        // 编辑状态下不允许切换tab
        if (this.isEdit) {
          // 恢复原来的值
          this.$nextTick(() => {
            this.activeCommType = this.form.commType;
          });
          this.$message.warning('修改时不允许切换佣金类型');
          return;
        }
        this.activeCommType = tab.name;
        // 清空明细列表
        this.form.detailList = [];
      },
      // 取消按钮
       cancel() {
         this.open = false;
         this.isEdit = false; // 重置编辑状态
         this.reset();
       },
     // 表单重置
       reset() {
         this.form = {
           id: null,
           planName: null,
           commType: this.activeCommType,
           status: "0",
           detailList: []
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
      this.dateRange = [];
      this.updateDateRange = [];

      // 重置查询参数
        this.queryParams = {
          pageNum: 1,
          pageSize: 10,
          planName: null,
          updateBy: null,
          commType: null,
          params: {}  // 确保 params 对象存在
        };
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
         this.isEdit = false; // 新增时允许切换tab
         this.open = true;
         this.title = "添加佣金方案";
    },
    /** 添加明细 */
    handleAddDetail() {
      const detailList = this.form.detailList || [];
      const hasZeroLevel = detailList.some(item => Number(item && item.levelNum) === 0);
      const maxLevel = detailList.reduce((max, item) => {
        const level = Number(item && item.levelNum)
        return Number.isFinite(level) && level > max ? level : max
      }, -1)
      const newDetail = {
        levelNum: hasZeroLevel ? maxLevel + 1 : 0,
        commissionRate: 0,
        sortOrder: detailList.length + 1
      };
      detailList.push(newDetail);
      this.form.detailList = this.normalizeDetailList(detailList);
    },
    /** 删除明细 */
    handleRemoveDetail(index) {
      this.form.detailList.splice(index, 1);
    },

        /** 修改按钮操作 */
        handleUpdate(row) {
          this.reset();
          this.isEdit = true; // 修改时禁止切换tab
          const id = row.id || this.ids;
          getCommission(id).then(response => {
            this.form = response.data;
            this.activeCommType = this.form.commType;
            console.log(this.form.commType);
            this.open = true;
            this.title = "修改佣金方案";
          });
        },
    /** 配置按钮操作 */
    handleConfigure(row) {
      this.reset();
      this.isEdit = true;
      const id = row.id || this.ids;
      getCommission(id).then(response => {
        this.form = response.data;
        this.form.detailList = this.normalizeDetailList(this.form.detailList);
        this.activeCommType = this.form.commType;
        this.open = true;
        this.title = "配置返佣方案";
      });
    },
    normalizeDetailList(detailList) {
      return (detailList || []).map((item, index) => ({
        ...item,
        levelNum: Number(item.levelNum),
        commissionRate: Number(item.commissionRate || 0),
        sortOrder: item.sortOrder || index + 1
      })).sort((a, b) => Number(a.levelNum ?? 0) - Number(b.levelNum ?? 0));
    },
    buildSubmitForm() {
      const data = { ...this.form };
      if (data.commType === '3' || data.commType === '6') {
        data.detailList = this.normalizeDetailList(data.detailList).map((item, index) => ({
          ...item,
          sortOrder: item.sortOrder || index + 1
        }));
      }
      return data;
    },
    /** 提交按钮 */
       submitForm() {
         this.$refs["form"].validate(valid => {
           if (valid) {
             // 设置佣金类型
             this.form.commType = this.activeCommType;
             const submitData = this.buildSubmitForm();

             if (this.form.id != null) {
               updateCommission(submitData).then(response => {
                 this.$modal.msgSuccess("修改成功");
                 this.open = false;
                 this.isEdit = false; // 重置编辑状态
                 this.getList();
               });
             } else {
               addCommission(submitData).then(response => {
                 this.$modal.msgSuccess("新增成功");
                 this.open = false;
                 this.isEdit = false; // 重置编辑状态
                 this.getList();
               });
             }
           }
         });
       },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除佣金方案编号为"' + ids + '"的数据项？').then(function() {
        return delCommission(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有佣金方案数据项？').then(() => {
        this.exportLoading = true;
        return exportCommission(queryParams);
      }).then(response => {
        this.$download.name(response, '佣金方案.xlsx');
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.detail-item {
  margin: 2px 0;
  font-size: 12px;
  line-height: 1.4;
}

.explanation {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.explanation h4 {
  margin-top: 0;
  color: #409EFF;
}

.explanation p {
  margin: 5px 0;
  color: #666;
  line-height: 1.5;
}

/* 添加表格样式优化 */
::v-deep .el-table .el-input-number {
  width: 100%;
}

::v-deep .el-table .el-input-number .el-input__inner {
  text-align: center;
}
</style>
