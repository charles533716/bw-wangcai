<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="站点编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入站点编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="nameZn">
        <el-input
          v-model="queryParams.nameZn"
          placeholder="请输入站点中文名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请时间" prop="applyDate">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
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
          @click="handleApply"
          v-hasPermi="['game:site:apply']"
        >申请开站</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['game:site:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="siteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="50" />
      <el-table-column label="站点编码" align="center" prop="code" width="50" />
      <el-table-column label="站点名称" align="center" prop="nameZn" width="100" />
      <el-table-column label="站点英文名称" align="center" prop="nameEn" width="100" />
      <el-table-column label="后台账号" align="center" prop="account" width="150" />
      <el-table-column label="申请状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.site_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="站点类型" align="center" prop="typeId" width="80">
         <template slot-scope="scope">
           <dict-tag :options="dict.type.site_type" :value="scope.row.typeId"/>
         </template>
       </el-table-column>
       <el-table-column label="经营类型" align="center" prop="businessTypeId" width="150">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.venue_type" :value="scope.row.businessTypeId"/>
          </template>
        </el-table-column>
      <el-table-column label="申请时间" align="center" prop="applyDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyDate, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请备注" align="center" prop="applyDesc" show-overflow-tooltip />
      <el-table-column label="审批时间" align="center" prop="approveDate" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.approveDate">{{ parseTime(scope.row.approveDate, '{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="审批备注" align="center" prop="approveDesc" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['game:site:query']"
          >查看</el-button>
          <el-button
            v-if="scope.row.status === '3'"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['game:site:edit']"
          >修改</el-button>
          <el-button
            v-if="scope.row.status === '3'"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['game:site:remove']"
          >撤销</el-button>
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

     <el-dialog title="申请开站" :visible.sync="applyOpen" width="600px" append-to-body>
          <el-form ref="applyForm" :model="applyForm" :rules="applyRules" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="站点编码" prop="code">
                  <el-input v-model="applyForm.code" placeholder="请输入站点编码" maxlength="64"   @blur="handleCodeBlur" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="站点中文名称" prop="nameZn">
                  <el-input v-model="applyForm.nameZn" placeholder="请输入站点中文名称" maxlength="255" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="站点英文名称" prop="nameEn">
                  <el-input v-model="applyForm.nameEn" placeholder="请输入站点英文名称" maxlength="255" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="后台登录账号" prop="account">
                  <el-input v-model="applyForm.account" placeholder="请输入后台登录账号" maxlength="255"   @blur="handleAccountBlur"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="登录密码" prop="password">
                  <el-input v-model="applyForm.password" type="password" placeholder="请输入登录密码" maxlength="255" show-password />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="applyForm.confirmPassword" type="password" placeholder="请确认密码" maxlength="255" show-password />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="站点类型" prop="typeId">
                  <el-select v-model="applyForm.typeId" placeholder="请选择站点类型" style="width: 100%">
                    <el-option
                      v-for="dict in dict.type.site_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="经营类型" prop="businessTypeId">
                  <!-- 修改为多选 -->
                  <el-select
                    v-model="applyForm.businessTypeId"
                    placeholder="请选择经营类型"
                    style="width: 100%"
                    multiple

                  >
                    <el-option
                      v-for="dict in dict.type.venue_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="申请备注" prop="applyDesc">
                  <el-input v-model="applyForm.applyDesc" type="textarea" placeholder="请输入申请备注" maxlength="500" :rows="3" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitApplyForm">提交申请</el-button>
            <el-button @click="cancelApply">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 查看站点详情对话框 -->
        <el-dialog title="站点申请详情" :visible.sync="viewOpen" width="700px" append-to-body>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="站点编码">{{ form.code }}</el-descriptions-item>
            <el-descriptions-item label="站点中文名称">{{ form.nameZn }}</el-descriptions-item>
            <el-descriptions-item label="站点英文名称">{{ form.nameEn }}</el-descriptions-item>
            <el-descriptions-item label="后台账号">{{ form.account }}</el-descriptions-item>
            <el-descriptions-item label="站点类型">
              <dict-tag :options="dict.type.site_type" :value="form.typeId"/>
            </el-descriptions-item>
            <el-descriptions-item label="经营类型">
              <dict-tag :options="dict.type.venue_type" :value="form.businessTypeId"/>
            </el-descriptions-item>
            <el-descriptions-item label="申请状态">
              <dict-tag :options="dict.type.site_status" :value="form.status"/>
            </el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ parseTime(form.applyDate, '{y}-{m}-{d} {h}:{i}') }}</el-descriptions-item>
            <el-descriptions-item label="申请备注" :span="2">{{ form.applyDesc || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审批时间">{{ form.approveDate ? parseTime(form.approveDate, '{y}-{m}-{d} {h}:{i}') : '-' }}</el-descriptions-item>
            <el-descriptions-item label="审批备注">{{ form.approveDesc || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div slot="footer" class="dialog-footer">
            <el-button @click="viewOpen = false">关 闭</el-button>
          </div>
        </el-dialog>

        <!-- 修改申请对话框 -->
        <el-dialog title="修改申请" :visible.sync="updateOpen" width="600px" append-to-body>
          <el-form ref="updateForm" :model="updateForm" :rules="updateRules" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="站点编码" prop="code">
                  <el-input v-model="updateForm.code" placeholder="请输入站点编码" maxlength="64" disabled   @blur="handleUpdateCodeBlur" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="站点中文名称" prop="nameZn">
                  <el-input v-model="updateForm.nameZn" placeholder="请输入站点中文名称" maxlength="255" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="站点英文名称" prop="nameEn">
                  <el-input v-model="updateForm.nameEn" placeholder="请输入站点英文名称" maxlength="255" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="后台登录账号" prop="account">
                  <el-input v-model="updateForm.account" placeholder="请输入后台登录账号" maxlength="255"   @blur="handleUpdateAccountBlur"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="站点类型" prop="typeId">
                  <el-select v-model="applyForm.typeId" placeholder="请选择站点类型" style="width: 100%">
                    <el-option
                      v-for="dict in dict.type.site_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="经营类型" prop="businessTypeId">
                  <el-select
                    v-model="updateForm.businessTypeId"
                    placeholder="请选择经营类型"
                    style="width: 100%"
                    multiple

                  >
                    <el-option
                      v-for="dict in dict.type.venue_type"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="申请备注" prop="applyDesc">
                  <el-input v-model="updateForm.applyDesc" type="textarea" placeholder="请输入申请备注" maxlength="500" :rows="3" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitUpdateForm">确 定</el-button>
            <el-button @click="cancelUpdate">取 消</el-button>
          </div>
        </el-dialog>
  </div>
</template>

<script>
import { listSite, getSite, delSite, updateSite, applySite, exportSite,checkSiteCodeUnique, checkSiteAccountUnique } from "@/api/site/site";

const SITE_ACCOUNT_ERROR = '请输入邮箱或6-11位普通账号（首位字母，至少2个字母并包含数字）';
const SITE_ACCOUNT_PATTERN = /^[a-zA-Z][a-zA-Z0-9]{5,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isH5StyleAccount(value) {
  if (!SITE_ACCOUNT_PATTERN.test(value)) {
    return false;
  }
  const letters = value.match(/[a-zA-Z]/g) || [];
  return letters.length >= 2 && /\d/.test(value);
}

function isValidSiteAccount(value) {
  const account = (value || '').trim();
  return EMAIL_PATTERN.test(account) || isH5StyleAccount(account);
}

export default {
  name: "SiteApply",
   dicts: ['site_status','venue_type','site_type'],
  data() {
    // 密码确认验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.applyForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

     // 站点编码唯一性验证
        const validateSiteCode = (rule, value, callback) => {
          if (!value) {
            callback(new Error('站点编码不能为空'));
            return;
          }

          if (value.length < 2 || value.length > 64) {
            callback(new Error('站点编码长度必须介于 2 和 64 之间'));
            return;
          }

          // 检查站点编码是否唯一
          checkSiteCodeUnique({ code: value }).then(response => {
            if (!response.data) {
              callback(new Error('站点编码已存在'));
            } else {
              callback();
            }
          }).catch(() => {
            callback(new Error('验证站点编码时发生错误'));
          });
        };

        // 站点账号唯一性验证
        const validateSiteAccount = (rule, value, callback) => {
          const account = (value || '').trim();
          if (!account) {
            callback(new Error('后台登录账号不能为空'));
            return;
          }

          if (!isValidSiteAccount(account)) {
            callback(new Error(SITE_ACCOUNT_ERROR));
            return;
          }

          // 检查站点账号是否唯一
          checkSiteAccountUnique({ account }).then(response => {
            if (!response.data) {
              callback(new Error('站点账号已存在'));
            } else {
              callback();
            }
          }).catch(() => {
            callback(new Error('验证站点账号时发生错误'));
          });
        };

        // 修改申请时带当前申请ID校验账号唯一性
        const validateUpdateSiteAccount = (rule, value, callback) => {
          const account = (value || '').trim();
          if (!account) {
            callback(new Error('后台登录账号不能为空'));
            return;
          }

          if (!isValidSiteAccount(account)) {
            callback(new Error(SITE_ACCOUNT_ERROR));
            return;
          }

          checkSiteAccountUnique({ account, id: this.updateForm.id }).then(response => {
            if (!response.data) {
              callback(new Error('站点账号已存在'));
            } else {
              callback();
            }
          }).catch(() => {
            callback(new Error('验证站点账号时发生错误'));
          });
        };

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
      // 站点表格数据
      siteList: [],
      // 日期范围
      dateRange: [],
      // 弹出层标题
      title: "",
      // 是否显示申请弹出层
      applyOpen: false,
      // 是否显示查看弹出层
      viewOpen: false,
      // 是否显示修改弹出层
      updateOpen: false,
      // 申请状态字典
      applyStatusOptions: [],
      // 站点类型字典
      siteTypeOptions: [],
      // 经营类型字典
      businessTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: null,
        nameZn: null
          // 默认只显示申请中的记录
      },
      // 表单参数
      form: {},
      // 申请表单参数
      applyForm: {
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        password: null,
        confirmPassword: null,
        typeId: null,
         businessTypeId: [],
        applyDesc: null
      },
      // 修改表单参数
      updateForm: {
          businessTypeId: []
      },
      // 申请表单校验
      applyRules: {
       code: [
                 { required: true, message: "站点编码不能为空", trigger: "blur" },
                 { min: 2, max: 64, message: "站点编码长度必须介于 2 和 64 之间", trigger: "blur" }
               ],
        nameZn: [
          { required: true, message: "站点中文名称不能为空", trigger: "blur" },
          { min: 2, max: 255, message: "站点中文名称长度必须介于 2 和 255 之间", trigger: "blur" }
        ],
        nameEn: [
          { required: true, message: "站点英文名称不能为空", trigger: "blur" },
          { min: 2, max: 255, message: "站点英文名称长度必须介于 2 和 255 之间", trigger: "blur" }
        ],
        account: [
                  { validator: validateSiteAccount, trigger: "blur" }
                ],
        password: [
          { required: true, message: "登录密码不能为空", trigger: "blur" },
          { min: 6, max: 20, message: "密码长度必须介于 6 和 20 之间", trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: validateConfirmPassword, trigger: "blur" }
        ],

        typeId: [
          { required: true, message: "请选择站点类型", trigger: "change" }
        ],
        businessTypeId: [
          { required: true, message: "请选择经营类型", trigger: "change" }
        ]
      },
      // 修改表单校验
      updateRules: {
        nameZn: [
          { required: true, message: "站点中文名称不能为空", trigger: "blur" }
        ],
        nameEn: [
          { required: true, message: "站点英文名称不能为空", trigger: "blur" }
        ],
          account: [
                   { validator: validateUpdateSiteAccount, trigger: "blur" }
                 ],
        businessTypeId: [
                  { required: true, message: "请选择经营类型", trigger: "change" }
                ]
      }
    };
  },
  created() {
    this.getList();
    // this.getDicts("site_status").then(response => {
    //   this.applyStatusOptions = response.data;
    // });
    // this.getDicts("site_type").then(response => {
    //   this.siteTypeOptions = response.data;
    // });
    // this.getDicts("site_bussiness_type").then(response => {
    //   this.businessTypeOptions = response.data;
    // });
  },
  methods: {
    /** 查询站点申请列表 */
    getList() {
      this.loading = true;
      listSite(this.queryParams).then(response => {
        this.siteList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消申请
    cancelApply() {
      this.applyOpen = false;
      this.resetApply();
    },
    // 取消修改
    cancelUpdate() {
      this.updateOpen = false;
      this.resetUpdate();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        password: null,
        skinId: null,
        typeId: null,
        businessTypeId: null,
        houtaiName: null,
        pcSiteTitle: null,
        pcAgentTitle: null,
        applyUserId: null,
        approveUserId: null,
        applyDate: null,
        applyDesc: null,
        approveDesc: null,
        approveDate: null,
        status: null
      };
    },
    // 申请表单重置
    resetApply() {
      this.applyForm = {
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        password: null,
        confirmPassword: null,
        typeId: null,
         businessTypeId: [],
        applyDesc: null
      };
      this.resetForm("applyForm");
    },
    // 修改表单重置
    resetUpdate() {
      this.updateForm = {
        id: null,
        code: null,
        nameZn: null,
        nameEn: null,
        account: null,
        applyDesc: null,
          businessTypeId: [],
      };
      this.resetForm("updateForm");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.status = '3'; // 重置后保持申请中状态
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 申请开站按钮操作 */
    handleApply() {
      this.resetApply();
      this.applyOpen = true;
    },
      /** 站点编码失焦校验 */
        handleCodeBlur() {
          if (this.applyForm.code && this.applyForm.code.length >= 2) {
            this.checkCodeUnique(this.applyForm.code, null);
          }
        },

        /** 站点账号失焦校验 */
        handleAccountBlur() {
          if (isValidSiteAccount(this.applyForm.account)) {
            this.checkAccountUnique(this.applyForm.account.trim(), null);
          }
        },

        /** 修改表单站点编码失焦校验 */
        handleUpdateCodeBlur() {
          if (this.updateForm.code && this.updateForm.code.length >= 2) {
            this.checkCodeUnique(this.updateForm.code, this.updateForm.id);
          }
        },

        /** 修改表单站点账号失焦校验 */
        handleUpdateAccountBlur() {
          if (isValidSiteAccount(this.updateForm.account)) {
            this.checkAccountUnique(this.updateForm.account.trim(), this.updateForm.id);
          }
        },

        /** 检查站点编码唯一性 */
        checkCodeUnique(code, id) {
          const data = { code: code };
          if (id) {
            data.id = id;
          }

          checkSiteCodeUnique(data).then(response => {
            if (!response.data) {
              this.$message.error('站点编码已存在');
              if (id) {
                // 修改表单
                this.updateForm.code = '';
              } else {
                // 申请表单
                this.applyForm.code = '';
              }
            }
          }).catch(() => {
            this.$message.error('验证站点编码时发生错误');
          });
        },

        /** 检查站点账号唯一性 */
        checkAccountUnique(account, id) {
          const data = { account: account };
          if (id) {
            data.id = id;
          }

          checkAccountUnique(data).then(response => {
            if (!response.data) {
              this.$message.error('站点账号已存在');
              if (id) {
                // 修改表单
                this.updateForm.account = '';
              } else {
                // 申请表单
                this.applyForm.account = '';
              }
            }
          }).catch(() => {
            this.$message.error('验证站点账号时发生错误');
          });
        },



    /** 提交申请 */
    /** 提交申请 */
       submitApplyForm() {
         this.$refs["applyForm"].validate(valid => {
           if (valid) {
             // 提交前再次校验唯一性
             this.validateBeforeSubmit().then(() => {
               // 处理多选经营类型，转换为逗号分隔的字符串
               const submitData = {
                 ...this.applyForm,
                 account: this.applyForm.account ? this.applyForm.account.trim() : this.applyForm.account,
                 businessTypeId: Array.isArray(this.applyForm.businessTypeId)
                   ? this.applyForm.businessTypeId.join(',')
                   : this.applyForm.businessTypeId
               };
               delete submitData.confirmPassword;

               applySite(submitData).then(response => {
                 this.$modal.msgSuccess("申请提交成功");
                 this.applyOpen = false;
                 this.getList();
               });
             }).catch(() => {
               this.$message.error('请修正表单错误后重新提交');
             });
           }
         });
       },

       /** 提交前校验 */
       validateBeforeSubmit() {
         return new Promise((resolve, reject) => {
           if (!isValidSiteAccount(this.applyForm.account)) {
             this.$message.error(SITE_ACCOUNT_ERROR);
             reject();
             return;
           }

           const codeCheck = checkSiteCodeUnique({ code: this.applyForm.code });
           const accountCheck = checkSiteAccountUnique({ account: this.applyForm.account.trim() });

           Promise.all([codeCheck, accountCheck]).then(responses => {
             const [codeResponse, accountResponse] = responses;
             if (!codeResponse.data) {
               this.$message.error('站点编码已存在');
               reject();
             } else if (!accountResponse.data) {
               this.$message.error('站点账号已存在');
               reject();
             } else {
               resolve();
             }
           }).catch(() => {
             this.$message.error('校验失败，请重试');
             reject();
           });
         });
       },
    /** 查看按钮操作 */
    handleView(row) {
      this.reset();
      const id = row.id || this.ids[0];
      getSite(id).then(response => {
        this.form = response.data;
        this.viewOpen = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.resetUpdate();
      const id = row.id || this.ids[0];
      getSite(id).then(response => {
         const data = response.data;
       this.updateForm = {
                 ...data,
                 businessTypeId: data.businessTypeId ? data.businessTypeId.split(',') : []
               };
        this.updateOpen = true;
      });
    },
     /** 提交修改 */
       submitUpdateForm() {
         this.$refs["updateForm"].validate(valid => {
           if (valid) {
             // 提交前再次校验唯一性
             this.validateBeforeUpdate().then(() => {
               // 处理多选经营类型，转换为逗号分隔的字符串
               const submitData = {
                 ...this.updateForm,
                 account: this.updateForm.account ? this.updateForm.account.trim() : this.updateForm.account,
                 businessTypeId: Array.isArray(this.updateForm.businessTypeId)
                   ? this.updateForm.businessTypeId.join(',')
                   : this.updateForm.businessTypeId
               };

               updateSite(submitData).then(response => {
                 this.$modal.msgSuccess("修改成功");
                 this.updateOpen = false;
                 this.getList();
               });
             }).catch(() => {
               this.$message.error('请修正表单错误后重新提交');
             });
           }
         });
       },

       /** 修改前校验 */
       validateBeforeUpdate() {
         return new Promise((resolve, reject) => {
           if (!isValidSiteAccount(this.updateForm.account)) {
             this.$message.error(SITE_ACCOUNT_ERROR);
             reject();
             return;
           }

           const codeCheck = checkSiteCodeUnique({
             code: this.updateForm.code,
             id: this.updateForm.id
           });
           const accountCheck = checkSiteAccountUnique({
             account: this.updateForm.account.trim(),
             id: this.updateForm.id
           });

           Promise.all([codeCheck, accountCheck]).then(responses => {
             const [codeResponse, accountResponse] = responses;
             if (!codeResponse.data) {
               this.$message.error('站点编码已存在');
               reject();
             } else if (!accountResponse.data) {
               this.$message.error('站点账号已存在');
               reject();
             } else {
               resolve();
             }
           }).catch(() => {
             this.$message.error('校验失败，请重试');
             reject();
           });
         });
       },


    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认撤销站点编号为"' + ids + '"的申请？').then(function() {
        return delSite(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("撤销成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = {
        ...this.queryParams,
        beginApplyDate: this.dateRange[0],
        endApplyDate: this.dateRange[1]
      };
      this.download('game/site/export', queryParams, `site_apply_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.el-descriptions {
  margin-top: 20px;
}
</style>
