<template>
  <div class="venue-manage">
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">

      <el-form-item label="站点ID" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入站点ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点编码" prop="siteCode">
        <el-input
          v-model="queryParams.siteCode"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="siteNameZn">
        <el-input
          v-model="queryParams.siteNameZn"
          placeholder="请输入站点名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入场馆ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆编码" prop="venueCode">
        <el-input
          v-model="queryParams.venueCode"
          placeholder="请输入场馆编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆名称" prop="venueNameZn">
        <el-input
          v-model="queryParams.venueNameZn"
          placeholder="请输入场馆名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆类型" prop="venueType">
        <el-select v-model="queryParams.venueType" placeholder="请选择场馆类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.venue_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="授权状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择授权状态" clearable size="small">
          <el-option label="已授权" :value="1" />
          <el-option label="未授权" :value="0" />
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
          type="success"
          plain
          icon="el-icon-check"
          size="mini"
          :disabled="multiple"
          @click="handleBatchAuth"
        >批量授权</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="venueList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="站点编码" align="center" prop="siteCode" width="120" />
      <el-table-column label="站点名称" align="center" prop="siteNameZn" min-width="150" />
      <el-table-column label="场馆编码" align="center" prop="venueCode" width="120" />
      <el-table-column label="场馆名称" align="center" prop="venueNameZn" min-width="150" />
      <el-table-column label="场馆类型" align="center" prop="venueType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.venueType"/>
        </template>
      </el-table-column>
      <el-table-column label="自定义名称" align="center" prop="venueCustomName" min-width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.venueCustomName || scope.row.venueNameZn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场馆费率" align="center" prop="feeRate" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.feeRate }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="授权状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="场馆状态" align="center" prop="venueStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_status" :value="scope.row.venueStatus"/>
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
          >编辑</el-button>
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

    <!-- 编辑场馆配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="场馆编码" prop="venueCode">
          <el-input v-model="form.venueCode" placeholder="请输入场馆编码" disabled />
        </el-form-item>
        <el-form-item label="场馆名称" prop="venueNameZn">
          <el-input v-model="form.venueNameZn" placeholder="请输入场馆名称" disabled />
        </el-form-item>
        <el-form-item label="自定义名称" prop="venueCustomName">
          <el-input v-model="form.venueCustomName" placeholder="请输入自定义名称" />
        </el-form-item>
        <el-form-item label="场馆费率" prop="feeRate">
          <el-input-number
            v-model="form.feeRate"
            :precision="4"
            :step="0.0001"
            :min="0"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">费率范围: 0-100%</div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="授权状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">授权</el-radio>
            <el-radio :label="0">不授权</el-radio>
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
import { listSiteManageVenue, updateSiteVenue, batchUpdateVenueStatus, batchAuthVenues,getSiteVenue } from "@/api/site/config";

export default {
  name: "VenueManage",
  dicts: ['venue_type', 'venue_status'],
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
      // 场馆表格数据
      venueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
         siteId: null,
          siteCode: null,
          siteNameZn: null,
        id: null,
        venueCode: null,
        venueNameZn: null,
        venueType: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        venueCustomName: [
          { required: true, message: "自定义名称不能为空", trigger: "blur" }
        ],
        feeRate: [
          { required: true, message: "场馆费率不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询场馆列表 */
    getList() {
      this.loading = true;
      listSiteManageVenue(this.queryParams).then(response => {
        this.venueList = response.rows;
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
        venueCode: null,
        venueNameZn: null,
        venueCustomName: null,
        feeRate: 0,
        sort: 0,
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
      this.ids = selection.map(item => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 编辑按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getSiteVenue(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改场馆配置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSiteVenue(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 状态修改 */
    handleStatusChange(row) {
      const text = row.status === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.venueNameZn + '"场馆吗？').then(function() {
        const updateData = [{
          id: row.id,
          siteCode:row.siteCode,
          venueCode: row.venueCode,
          status: row.status
        }];
        return batchUpdateVenueStatus(updateData);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === 0 ? 1 : 0;
      });
    },
    /** 批量授权按钮操作 */
    handleBatchAuth() {
      const selectedVenues = this.venueList.filter(item => this.ids.includes(item.id));

      if (selectedVenues.length === 0) {
        this.$modal.msgError("请选择要授权的场馆");
        return;
      }

      this.$modal.confirm('是否确认授权选中的场馆？').then(() => {
        const authVenues = selectedVenues.map(item => {

          return {
            siteCode:item.siteCode,
            venueCode: item.venueCode,
            status: 1
          };
        });

        batchAuthVenues(authVenues).then(() => {
          this.$modal.msgSuccess("授权成功");
          this.getList();
        });
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/site/venue/manage/venue/export', {
        ...this.queryParams
      }, `venue_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
