<template>
  <div class="venue-config">
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleInit"
        >初始化场馆</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="venueList" @selection-change="handleSelectionChange">
       <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="场馆编码" align="center" prop="venueCode" />
      <el-table-column label="场馆名称" align="center" prop="venueNameZn" />
      <el-table-column label="场馆类型" align="center" prop="venueType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.venueType"/>
        </template>
      </el-table-column>
      <el-table-column label="自定义名称" align="center" prop="venueCustomName">
        <template slot-scope="scope">
          <span>{{ scope.row.venueCustomName || scope.row.venueNameZn }}</span>
        </template>
      </el-table-column>
      <el-table-column label="场馆费率" align="center" prop="feeRate">
        <template slot-scope="scope">
          <span>{{ scope.row.feeRate }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="授权状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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
import { listSiteVenue, updateSiteVenue, initSiteVenues, batchUpdateVenueStatus, batchAuthVenues  } from "@/api/site/config";

export default {
  name: "VenueConfig",
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  dicts: ['venue_type'],
  data() {
    return {
      ids: [],
      venue_codes:[],
      single: true,
      multiple: true,
      loading: true,
      total: 0,
      venueList: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: this.siteCode,
        venueCode: null,
        venueNameZn: null,
        venueType: null,
        status: null
      },
      form: {},
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
  watch: {
    siteCode: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.queryParams.siteCode = newVal;
          this.getList();
        }
      }
    }
  },
  methods: {
    getList() {
      this.loading = true;
      listSiteVenue(this.queryParams).then(response => {
        this.venueList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleInit() {
      this.$modal.confirm('是否初始化场馆配置？这将为当前站点创建所有场馆的配置记录。').then(() => {
        initSiteVenues(this.siteCode).then(() => {
          this.$modal.msgSuccess("初始化成功");
          this.getList();
        });
      }).catch(() => {});
    },
    handleStatusChange(row) {
      const text = row.status === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.venueNameZn + '"场馆吗？').then(() => {
        const updateData = [{
          id: row.id,
          siteCode:this.siteCode,
          venueCode:row.venueCode,
          status: row.status
        }];
        return batchUpdateVenueStatus(updateData);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
        this.getList();
      }).catch(() => {
        row.status = row.status === 1 ? 0 : 1;
      });
    },
    handleUpdate(row) {
      this.reset();
      this.form = {
        id: row.id,
        venueCode: row.venueCode,
        venueNameZn: row.venueNameZn,
        venueCustomName: row.venueCustomName,
        feeRate: row.feeRate,
        sort: row.sort,
        status: row.status,
        siteCode: this.siteCode
      };
      this.open = true;
      this.title = "编辑场馆配置";
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateSiteVenue(this.form).then(response => {
            this.$modal.msgSuccess("修改成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    // 选择框变化
        handleSelectionChange(selection) {
          this.ids = selection.map(item => item.id).filter(id => id != null);
           this.venue_codes = selection.map(item => item.venueCode).filter(venueCode => venueCode != null);

          this.single = selection.length !== 1;
          this.multiple = !selection.length;
        },
    // 批量授权
    handleBatchAuth() {

      const selectedVenues = this.venueList.filter(item => this.venue_codes.includes(item.venueCode));
      if (selectedVenues.length === 0) {
        this.$modal.msgError("请选择要授权的场馆");
        return;
      }


      this.$modal.confirm('是否确认授权选中的场馆？').then(() => {
        const authVenues = selectedVenues.map(item => {
          return {
            siteCode: this.siteCode,
            venueCode: item.venueCode,
            status: 1
          };
        });
 console.log(authVenues)

        batchAuthVenues(authVenues).then(() => {
          this.$modal.msgSuccess("授权成功");
          this.getList();
        });
      }).catch(() => {});
    },
    cancel() {
      this.open = false;
      this.reset();
    },

    reset() {
      this.form = {
        id: null,
        venueCode: null,
        venueNameZn: null,
        venueCustomName: null,
        feeRate: 0,
        sort: 0,
        status: 0,
        siteCode: this.siteCode
      };
      this.resetForm("form");
    }
  }
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
