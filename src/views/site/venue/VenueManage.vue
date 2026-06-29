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
        <el-select
          v-model="queryParams.siteCode"
          placeholder="请选择站点"
          clearable
          filterable
          size="small"
          :loading="siteLoading"
        >
          <el-option
            v-for="item in siteOptions"
            :key="item.code"
            :label="formatSiteOption(item)"
            :value="item.code"
          />
        </el-select>
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option label="正常" :value="1" />
          <el-option label="维护" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="钱包状态" prop="walletLocked">
        <el-select v-model="queryParams.walletLocked" placeholder="请选择钱包状态" clearable size="small">
          <el-option label="钱包正常" :value="0" />
          <el-option label="钱包锁定" :value="1" />
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
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-lock"
          size="mini"
          :disabled="multiple"
          @click="handleBatchWalletLock"
        >批量锁定钱包</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-unlock"
          size="mini"
          :disabled="multiple"
          @click="handleBatchWalletUnlock"
        >批量解锁钱包</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-setting"
          size="mini"
          :disabled="single"
          @click="handleMaintain"
        >维护设置</el-button>
      </el-col>
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
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="钱包状态" align="center" prop="walletLocked" width="140">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.walletLocked"
            :active-value="1"
            :inactive-value="0"
            active-text="锁定"
            inactive-text="正常"
            @change="handleWalletLockChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
     <!-- <el-table-column label="维护状态" align="center" prop="maintainStatus" width="100">
        <template slot-scope="scope">
          <el-tag
            :type="getMaintainStatus(scope.row) ? 'danger' : 'success'"
            size="small"
          >
            {{ getMaintainStatus(scope.row) ? '维护中' : '正常' }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="场馆状态" align="center" prop="venueStatus" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_status" :value="scope.row.venueStatus"/>
        </template>
      </el-table-column>
    <!--  <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-setting"
            @click="handleMaintain(scope.row)"
          >维护</el-button>
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">维护</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="钱包锁定" prop="walletLocked">
          <el-radio-group v-model="form.walletLocked">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 维护设置对话框 -->
    <el-dialog title="场馆维护设置" :visible.sync="maintainOpen" width="600px" append-to-body>
      <el-form ref="maintainForm" :model="maintainForm" :rules="maintainRules" label-width="140px">
        <el-form-item label="场馆编码" prop="venueCode">
          <el-input v-model="maintainForm.venueCode" placeholder="请输入场馆编码" disabled />
        </el-form-item>
        <el-form-item label="场馆名称" prop="venueNameZn">
          <el-input v-model="maintainForm.venueNameZn" placeholder="请输入场馆名称" disabled />
        </el-form-item>
        <el-form-item label="维护开始时间" prop="maintainStartTime">
          <el-date-picker
            v-model="maintainForm.maintainStartTime"
            type="datetime"
            placeholder="选择维护开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维护结束时间" prop="maintainEndTime">
          <el-date-picker
            v-model="maintainForm.maintainEndTime"
            type="datetime"
            placeholder="选择维护结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维护原因" prop="maintainReason">
          <el-input
            v-model="maintainForm.maintainReason"
            type="textarea"
            placeholder="请输入维护原因"
            maxlength="500"
            show-word-limit
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="展示维护时间" prop="showMaintainTime">
          <el-radio-group v-model="maintainForm.showMaintainTime">
            <el-radio :label="1">展示</el-radio>
            <el-radio :label="0">不展示</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跳转场馆编码" prop="redirectVenueCode">
          <el-input
            v-model="maintainForm.redirectVenueCode"
            placeholder="请输入跳转场馆编码（可选）"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">维护时引导玩家前往的其他场馆</div>
        </el-form-item>
        <el-form-item label="自动跳转" prop="autoRedirect">
          <el-radio-group v-model="maintainForm.autoRedirect">
            <el-radio :label="1">开启</el-radio>
            <el-radio :label="0">关闭</el-radio>
          </el-radio-group>
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">开启后维护时自动跳转到指定场馆</div>
        </el-form-item>
        <el-form-item v-if="maintainForm.autoRedirect === 1" label="跳转倒计时" prop="redirectCountdown">
          <el-input-number
            v-model="maintainForm.redirectCountdown"
            :min="3"
            :max="60"
            controls-position="right"
            style="width: 100%"
          />
          <div style="color: #909399; font-size: 12px; margin-top: 5px;">自动跳转倒计时时间（秒）</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitMaintainForm">确 定</el-button>
        <el-button @click="cancelMaintain">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
   listSiteManageVenue,
    getSiteVenue,
    updateSiteVenue,
    batchUpdateVenueStatus,
    batchAuthVenues,
    batchUpdateWalletLocked,       // 新增
    updateVenueMaintainInfo,       // 新增
    batchLockWallet,               // 新增
    batchUnlockWallet              // 新增

} from "@/api/site/config";
import { listSite } from "@/api/site/site";

const DEFAULT_SITE_CODE = "2222";
const DEFAULT_VENUE_STATUS = 1;
const QUERY_TIMEOUT_MESSAGE = "数据量过大，请修改查询条件";

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
      siteLoading: false,
      siteOptions: [],
      // 场馆表格数据
      venueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示维护弹出层
      maintainOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: null,
        siteCode: DEFAULT_SITE_CODE,
        id: null,
        venueCode: null,
        venueNameZn: null,
        venueType: null,
        status: DEFAULT_VENUE_STATUS,
        walletLocked: null
      },
      // 表单参数
      form: {},
      // 维护表单参数
      maintainForm: {},
      // 表单校验
      rules: {
        venueCustomName: [
          { required: true, message: "自定义名称不能为空", trigger: "blur" }
        ],
        feeRate: [
          { required: true, message: "场馆费率不能为空", trigger: "blur" }
        ]
      },
      // 维护表单校验
      maintainRules: {
        maintainStartTime: [
          { required: true, message: "维护开始时间不能为空", trigger: "blur" }
        ],
        maintainEndTime: [
          { required: true, message: "维护结束时间不能为空", trigger: "blur" }
        ],
        maintainReason: [
          { required: true, message: "维护原因不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getSiteOptions();
    this.getList();
  },
  methods: {
    getDefaultQueryParams() {
      return {
        pageNum: 1,
        pageSize: 10,
        siteId: null,
        siteCode: DEFAULT_SITE_CODE,
        id: null,
        venueCode: null,
        venueNameZn: null,
        venueType: null,
        status: DEFAULT_VENUE_STATUS,
        walletLocked: null
      };
    },
    getSiteOptions() {
      this.siteLoading = true;
      listSite({ pageNum: 1, pageSize: 1000 })
        .then(response => {
          const rows = Array.isArray(response.rows)
            ? response.rows
            : (response.data && Array.isArray(response.data.rows) ? response.data.rows : []);
          this.siteOptions = rows
            .map(site => ({
              code: site.code || site.siteCode || "",
              name: site.nameZn || site.name_zn || site.siteName || site.name || ""
            }))
            .filter(site => site.code);
        })
        .catch(() => {
          this.siteOptions = [];
        })
        .finally(() => {
          this.siteLoading = false;
        });
    },
    formatSiteOption(site) {
      if (site.name && site.code) {
        return `${site.name}（${site.code}）`;
      }
      return site.name || site.code || "-";
    },
    /** 查询场馆列表 */
    getList() {
      this.loading = true;
      listSiteManageVenue(this.queryParams, { timeoutMessage: QUERY_TIMEOUT_MESSAGE })
        .then(response => {
          this.venueList = response.rows || [];
          this.total = response.total || 0;
        })
        .catch(() => {
          this.venueList = [];
          this.total = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消维护设置
    cancelMaintain() {
      this.maintainOpen = false;
      this.resetMaintainForm();
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
        status: 1,
        walletLocked: 0
      };
      this.resetForm("form");
    },
    // 维护表单重置
    resetMaintainForm() {
      this.maintainForm = {
        id: null,
        venueCode: null,
        venueNameZn: null,
        maintainStartTime: null,
        maintainEndTime: null,
        maintainReason: '',
        showMaintainTime: 1,
        redirectVenueCode: '',
        autoRedirect: 0,
        redirectCountdown: 5
      };
      if (this.$refs.maintainForm) {
        this.$refs.maintainForm.resetFields();
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams = this.getDefaultQueryParams();
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
    /** 维护设置按钮操作 */
    handleMaintain(row) {
      this.resetMaintainForm();
      const id = row.id || this.ids[0];
      getSiteVenue(id).then(response => {
        const data = response.data;
        this.maintainForm = {
          id: data.id,
          siteCode: data.siteCode,
          venueCode: data.venueCode,
          venueNameZn: data.venueNameZn,
          maintainStartTime: data.maintainStartTime,
          maintainEndTime: data.maintainEndTime,
          maintainReason: data.maintainReason || '',
          showMaintainTime: data.showMaintainTime !== undefined ? data.showMaintainTime : 1,
          redirectVenueCode: data.redirectVenueCode || '',
          autoRedirect: data.autoRedirect !== undefined ? data.autoRedirect : 0,
          redirectCountdown: data.redirectCountdown !== undefined ? data.redirectCountdown : 5
        };
        this.maintainOpen = true;
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
    /** 提交维护表单 */
    submitMaintainForm() {
      this.$refs["maintainForm"].validate(valid => {
        if (valid) {
          updateVenueMaintainInfo(this.maintainForm).then(response => {
            this.$modal.msgSuccess("维护设置成功");
            this.maintainOpen = false;
            this.getList();
          });
        }
      });
    },
    /** 状态修改 */
    handleStatusChange(row) {
      const text = row.status === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.venueNameZn + '"场馆吗？').then(function() {
        const updateData = [{
          id: row.id,
          siteCode: row.siteCode,
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
    /** 钱包锁定状态修改 */
    handleWalletLockChange(row) {
      const text = row.walletLocked === 1 ? "锁定" : "解锁";
      this.$modal.confirm('确认要"' + text + '""' + row.venueNameZn + '"场馆的钱包吗？').then(function() {
        const updateData = [{
          id: row.id,
          siteCode: row.siteCode,
          venueCode: row.venueCode,
          walletLocked: row.walletLocked
        }];
        return batchUpdateWalletLocked(updateData);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.walletLocked = row.walletLocked === 0 ? 1 : 0;
      });
    },
    /** 判断是否在维护中 */
    getMaintainStatus(row) {
      if (row.status === 0 && row.maintainStartTime && row.maintainEndTime) {
        const now = new Date();
        const startTime = new Date(row.maintainStartTime);
        const endTime = new Date(row.maintainEndTime);
        return now >= startTime && now <= endTime;
      }
      return false;
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
            siteCode: item.siteCode,
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
    /** 批量锁定钱包 */
    handleBatchWalletLock() {
      const selectedVenues = this.venueList.filter(item => this.ids.includes(item.id));

      if (selectedVenues.length === 0) {
        this.$modal.msgError("请选择要锁定钱包的场馆");
        return;
      }

      this.$modal.confirm('是否确认锁定选中场馆的钱包？').then(() => {
        const lockVenues = selectedVenues.map(item => {
          return {
            id: item.id,
            siteCode: item.siteCode,
            venueCode: item.venueCode,
            walletLocked: 1
          };
        });

        batchUpdateWalletLocked(lockVenues).then(() => {
          this.$modal.msgSuccess("钱包锁定成功");
          this.getList();
        });
      }).catch(() => {});
    },
    /** 批量解锁钱包 */
    handleBatchWalletUnlock() {
      const selectedVenues = this.venueList.filter(item => this.ids.includes(item.id));

      if (selectedVenues.length === 0) {
        this.$modal.msgError("请选择要解锁钱包的场馆");
        return;
      }

      this.$modal.confirm('是否确认解锁选中场馆的钱包？').then(() => {
        const unlockVenues = selectedVenues.map(item => {
          return {
            id: item.id,
            siteCode: item.siteCode,
            venueCode: item.venueCode,
            walletLocked: 0
          };
        });

        batchUpdateWalletLocked(unlockVenues).then(() => {
          this.$modal.msgSuccess("钱包解锁成功");
          this.getList();
        });
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
