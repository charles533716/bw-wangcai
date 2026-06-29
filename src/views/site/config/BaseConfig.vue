<template>
  <div class="base-config">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px" v-loading="loading">
      <el-card class="box-card" shadow="never">
        <div slot="header" class="clearfix">
          <span>基本信息</span>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="站点编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入站点编码" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择站点状态" style="width: 100%">
                <el-option
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="中文名称" prop="nameZn">
              <el-input v-model="form.nameZn" placeholder="请输入站点中文名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="英文名称" prop="nameEn">
              <el-input v-model="form.nameEn" placeholder="请输入站点英文名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="后台账号" prop="account">
              <el-input v-model="form.account" placeholder="请输入后台登录账号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点类型" prop="typeId">
              <el-select v-model="form.typeId" placeholder="请选择站点类型" style="width: 100%">
                <el-option
                  v-for="dict in siteTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经营类型" prop="businessTypeId">
              <el-select
              v-model="form.businessTypeId"
              placeholder="请选择经营类型"
              style="width: 100%"
              multiple   >
                <el-option
                  v-for="dict in dict.type.venue_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
         <!-- <el-col :span="12">
            <el-form-item label="皮肤ID" prop="skinId">
              <el-input v-model="form.skinId" placeholder="请输入皮肤ID" />
            </el-form-item>
          </el-col> -->
        </el-row>

        <div class="official-contact">
          <div class="contact-title">官方联络</div>
          <div class="email-row">
            <div
              v-for="(field, index) in visibleEmailFields"
              :key="field"
              class="email-item"
            >
              <el-form-item
                :label="index === 0 ? '官方邮箱' : `官方邮箱 ${index + 1}`"
                :prop="field"
              >
                <div class="email-control">
                  <el-input
                    v-model.trim="form[field]"
                    placeholder="请输入常用的官方邮箱"
                  />
                  <el-button
                    v-if="index > 0"
                    class="email-remove"
                    type="text"
                    icon="el-icon-close"
                    @click="removeEmailField(index)"
                  />
                </div>
              </el-form-item>
            </div>
            <el-button
              v-if="canAddEmail"
              class="email-add"
              plain
              icon="el-icon-plus"
              @click="addEmailField"
            >
              添加官方邮箱（{{ visibleEmailCount }}/3）
            </el-button>
          </div>
          <div class="contact-tip">
            <i class="el-icon-info"></i>
            <span>支持配置多组联系方式，方便用户不同渠道进行联络</span>
          </div>
        </div>
      </el-card>

      <el-card class="box-card" shadow="never" style="margin-top: 20px;">
              <div slot="header" class="clearfix">
                <span>站点标题设置</span>
              </div>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="站点后台标题" prop="houtaiName">
                    <el-input v-model="form.houtaiName" placeholder="请输入站点后台标题" />
                  </el-form-item>
                </el-col>
               <!-- <el-col :span="12">
                  <el-form-item label="PC网站标题" prop="pcSiteTitle">
                    <el-input v-model="form.pcSiteTitle" placeholder="请输入PC网站标题" />
                  </el-form-item>
                </el-col> -->
              </el-row>

              <el-row :gutter="20">
              <!--  <el-col :span="12">
                  <el-form-item label="PC代理标题" prop="pcAgentTitle">
                    <el-input v-model="form.pcAgentTitle" placeholder="请输入PC代理网站标题" />
                  </el-form-item>
                </el-col> -->
                <el-col :span="12">
                  <el-form-item label="H5网站标题" prop="h5SiteTitle">
                    <el-input v-model="form.h5SiteTitle" placeholder="请输入H5网站标题" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <!-- <el-col :span="12">
                  <el-form-item label="PC管理后台标题" prop="pcAdminTitle">
                    <el-input v-model="form.pcAdminTitle" placeholder="请输入PC端管理后台标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="代理后台标题" prop="pcAgentAdminTitle">
                    <el-input v-model="form.pcAgentAdminTitle" placeholder="请输入代理端后台标题" />
                  </el-form-item>
                </el-col> -->
              </el-row>
            </el-card>

      <el-card class="box-card" shadow="never" style="margin-top: 20px;">
        <div slot="header" class="clearfix">
          <span>申请审批信息</span>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请时间">
              <el-input :value="parseTime(form.applyDate)" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批时间">
              <el-input :value="parseTime(form.approveDate)" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请备注" prop="applyDesc">
              <el-input
                v-model="form.applyDesc"
                type="textarea"
                placeholder="请输入申请备注"
                :rows="3"
                :disabled="form.status !== '3'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批备注" prop="approveDesc">
              <el-input
                v-model="form.approveDesc"
                type="textarea"
                placeholder="请输入审批备注"
                :rows="3"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div class="form-footer" style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="submitForm" :loading="saveLoading">保存</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getSiteBaseInfo, updateSiteBaseInfo } from "@/api/site/config";

export default {
  name: "BaseConfig",
   dicts: ['site_status','venue_type','site_type'],
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  data() {
    const validateOfficialEmailUnique = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      const currentValue = String(value).trim().toLowerCase();
      const emailFields = ['email1', 'email2', 'email3'];
      const hasDuplicate = emailFields.some(field => {
        if (field === rule.field || !this.form[field]) {
          return false;
        }
        return String(this.form[field]).trim().toLowerCase() === currentValue;
      });
      if (hasDuplicate) {
        callback(new Error("官方邮箱不能重复"));
        return;
      }
      callback();
    };
    return {
      loading: false,
      saveLoading: false,
      form: {
        id: null,
        code: '',
        nameZn: '',
        nameEn: '',
        account: '',
        skinId: '',
        typeId: '',
        businessTypeId: [],
        houtaiName: '',
        pcSiteTitle: '',
        pcAgentTitle: '',
          h5SiteTitle: '',
                pcAdminTitle: '',
                pcAgentAdminTitle: '',
        email1: '',
        email2: '',
        email3: '',
        status: '',
        applyDesc: '',
        approveDesc: '',
        applyDate: null,
        approveDate: null
      },
      rules: {
        code: [
          { required: true, message: "站点编码不能为空", trigger: "blur" }
        ],
        nameZn: [
          { required: true, message: "站点中文名称不能为空", trigger: "blur" }
        ],
        account: [
          { required: true, message: "后台账号不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "请选择站点状态", trigger: "change" }
        ],
        email1: [
          { type: 'email', message: "请输入正确的邮箱地址", trigger: "blur" },
          { validator: validateOfficialEmailUnique, trigger: "blur" }
        ],
        email2: [
          { type: 'email', message: "请输入正确的邮箱地址", trigger: "blur" },
          { validator: validateOfficialEmailUnique, trigger: "blur" }
        ],
        email3: [
          { type: 'email', message: "请输入正确的邮箱地址", trigger: "blur" },
          { validator: validateOfficialEmailUnique, trigger: "blur" }
        ]
      },
      statusOptions: [],
      siteTypeOptions: [],
      businessTypeOptions: [],
      visibleEmailCount: 1
    };
  },
  computed: {
    visibleEmailFields() {
      return ['email1', 'email2', 'email3'].slice(0, this.visibleEmailCount);
    },
    canAddEmail() {
      return this.visibleEmailCount < 3;
    }
  },
  watch: {
    siteCode: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadSiteInfo();
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
      // 站点状态字典
      this.getDicts("site_status").then(response => {
        this.statusOptions = response.data;
      });
      // 站点类型字典
      this.getDicts("site_type").then(response => {
        this.siteTypeOptions = response.data;
      });
      // 经营类型字典
      this.getDicts("venue_type").then(response => {
        this.businessTypeOptions = response.data;
      });
    },

    // 加载站点信息
    loadSiteInfo() {
      this.loading = true;
      getSiteBaseInfo(this.siteCode)
        .then(response => {
           const data = response.data;
            // 关键修复：将字符串转换为数组
            if (data.businessTypeId) {
              if (typeof data.businessTypeId === 'string') {
                // 如果是逗号分隔的字符串，转换为数组
                data.businessTypeId = data.businessTypeId.split(',').filter(item => item.trim() !== '');
              } else if (!Array.isArray(data.businessTypeId)) {
                // 如果不是数组，转为空数组
                data.businessTypeId = [];
              }
            } else {
              // 如果为空，设为空数组
              data.businessTypeId = [];
            }

          this.form = data;
          this.initEmailFields(data);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.$modal.msgError("加载站点信息失败");
        });
    },

    initEmailFields(data) {
      const emailFields = ['email1', 'email2', 'email3'];
      let count = 1;
      emailFields.forEach((field, index) => {
        if (data[field]) {
          count = index + 1;
        } else {
          this.$set(data, field, '');
        }
      });
      this.visibleEmailCount = count;
    },

    addEmailField() {
      if (this.visibleEmailCount < 3) {
        this.visibleEmailCount += 1;
      }
    },

    removeEmailField(index) {
      const emailFields = ['email1', 'email2', 'email3'];
      if (index <= 0 || index >= this.visibleEmailCount) {
        return;
      }
      for (let i = index; i < this.visibleEmailCount - 1; i += 1) {
        this.form[emailFields[i]] = this.form[emailFields[i + 1]];
      }
      this.form[emailFields[this.visibleEmailCount - 1]] = '';
      this.visibleEmailCount -= 1;
      this.$nextTick(() => {
        this.$refs.form.clearValidate(emailFields);
      });
    },

    // 提交表单
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.saveLoading = true;
          const submitData = {
            ...this.form,
            businessTypeId: Array.isArray(this.form.businessTypeId)
              ? this.form.businessTypeId.join(',')
              : this.form.businessTypeId
          };
          ['email1', 'email2', 'email3'].forEach(field => {
            submitData[field] = submitData[field] ? String(submitData[field]).trim() : '';
          });
          updateSiteBaseInfo(submitData)
            .then(response => {
              this.$modal.msgSuccess("保存成功");
              this.saveLoading = false;
              this.$emit('update-success');
            })
            .catch(() => {
              this.saveLoading = false;
            });
        }
      });
    },

    // 重置表单
    resetForm() {
      this.$refs["form"].resetFields();
      // 重新加载数据
      this.loadSiteInfo();
    },

    // 时间格式化
    parseTime(time, pattern) {
      if (!time) {
        return '';
      }
      const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
      let date;
      if (typeof time === 'object') {
        date = time;
      } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
          time = parseInt(time);
        } else if (typeof time === 'string') {
          time = time.replace(new RegExp(/-/gm), '/');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
          time = time * 1000;
        }
        date = new Date(time);
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
      };
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value]; }
        if (result.length > 0 && value < 10) {
          value = '0' + value;
        }
        return value || 0;
      });
      return time_str;
    }
  }
};
</script>

<style scoped>
.base-config {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.official-contact {
  margin-top: 10px;
  padding-top: 22px;
  border-top: 1px solid #edf1f7;
}

.contact-title {
  margin-bottom: 22px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.email-row {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px 28px;
}

.email-item {
  flex: 1 1 300px;
  max-width: 520px;
}

.official-contact ::v-deep .el-form-item__label {
  color: #606266;
  font-size: 14px;
  font-weight: normal;
}

.email-control {
  display: flex;
  align-items: center;
}

.email-control ::v-deep .el-input__inner {
  height: 44px;
  border-color: #e8edf5;
  border-radius: 8px;
  color: #606f83;
  font-weight: normal;
  box-shadow: 0 2px 6px rgba(24, 39, 75, 0.08);
}

.email-control ::v-deep .el-input__inner::placeholder {
  color: #c0c4cc;
}

.email-remove {
  flex: 0 0 34px;
  margin-left: 10px;
  color: #ff8a9a;
  font-size: 20px;
}

.email-add {
  height: 44px;
  min-width: 230px;
  margin-bottom: 22px;
  border: 2px dashed #d9e2ef;
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: normal;
  background: #fff;
}

.contact-tip {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  padding: 7px 18px;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  color: #606266;
  font-size: 14px;
  font-weight: normal;
  background: #fff;
}

.contact-tip i {
  margin-right: 8px;
  color: #409eff;
  font-size: 16px;
}

.form-footer {
  border-top: 1px solid #e6ebf5;
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .base-config {
    padding: 10px;
  }

  .el-col {
    margin-bottom: 15px;
  }

  .email-row {
    gap: 12px;
  }

  .email-item,
  .email-add {
    flex-basis: 100%;
    max-width: none;
    width: 100%;
  }

  .email-add {
    margin-bottom: 0;
  }
}
</style>
