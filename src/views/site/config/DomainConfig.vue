<template>
  <div class="domain-config">
   <!-- <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
      <el-form-item label="域名类型" prop="domainType">
        <el-select v-model="queryParams.domainType" placeholder="请选择域名类型" clearable size="small">
          <el-option
            v-for="dict in domainTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="域名" prop="domain">
        <el-input
          v-model="queryParams.domain"
          placeholder="请输入域名"
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form -->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增域名</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改域名</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除域名</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="domainList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="域名类型" align="center" prop="domainType" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.domain_type" :value="scope.row.domainType"/>
        </template>
      </el-table-column>
      <el-table-column label="域名" align="center" prop="domain" min-width="200">
        <template slot-scope="scope">
          <span class="domain-text">{{ scope.row.domain }}</span>
        </template>
      </el-table-column>
      <el-table-column label="平台类型" align="center" prop="platType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plat_type" :value="scope.row.platType"/>
        </template>
      </el-table-column>
      <el-table-column label="是否代理域名" align="center" prop="isAgent" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isAgent === 1 ? 'success' : 'info'">
            {{ scope.row.isAgent === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="开放地区" align="center" prop="areas" width="120">
        <template slot-scope="scope">
          <span>{{ getAreasLabel(scope.row.areas) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
     <!-- <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column> -->
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

    <!-- 添加或修改域名配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="域名类型" prop="domainType">
          <el-select v-model="form.domainType" placeholder="请选择域名类型" style="width: 100%">
            <el-option
              v-for="dict in domainTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="请输入域名，如：www.example.com" />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            请输入完整的域名，不需要包含http://或https://
          </div>
        </el-form-item>
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
        <el-form-item label="代理域名" prop="isAgent">
          <el-radio-group v-model="form.isAgent">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开放地区" prop="status">
          <el-select
            v-model="form.areas"
            placeholder=""
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in areasOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <!--<el-form-item label="开放地区" prop="areas">
          <el-input v-model="form.areas" placeholder="请输入开放地区，多个地区用逗号分隔" />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            可选，用于限制域名访问地区，如：CN,US,JP
          </div>
        </el-form-item>-->
        <el-form-item label="配置信息" prop="config">
          <el-input v-model="form.config" type="textarea" placeholder="请输入配置信息，JSON格式" :rows="3" />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            可选，用于存储额外的配置信息，如：{"ssl": true, "cdn": "cloudflare"}
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
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
import { listSiteDomain, addSiteDomain, updateSiteDomain, delSiteDomain } from "@/api/site/config";

export default {
  name: "DomainConfig",
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  dicts: ['domain_type', 'plat_type'],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      domainList: [],
      title: "",
      open: false,
      domainTypeOptions: [],
      platTypeOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: this.siteCode,
        domainType: null,
        domain: null,
        platType: null,
        status: null
      },
      form: {
        siteCode: this.siteCode,
        status: 1,
        isAgent: 0
      },
      areasOptions: [
        { label: '国内', value: '1' },
        { label: '国外', value: '2' },
      ],
      rules: {
        domainType: [
          { required: true, message: "域名类型不能为空", trigger: "change" }
        ],
        domain: [
          { required: true, message: "域名不能为空", trigger: "blur" },
          { pattern: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, message: '请输入正确的域名格式', trigger: 'blur' }
        ],
        platType: [
          { required: true, message: "平台类型不能为空", trigger: "change" }
        ],
        isAgent: [
          { required: true, message: "请选择是否代理域名", trigger: "change" }
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
    getAreasLabel(value) {
      const item = this.areasOptions.find(
        option => option.value === value
      )
      return item ? item.label : value
    },
    // 加载字典数据
    loadDictData() {
      // 域名类型字典
      this.getDicts("domain_type").then(response => {
        this.domainTypeOptions = response.data;
      });
      // 平台类型字典
      this.getDicts("plat_type").then(response => {
        this.platTypeOptions = response.data;
      });
    },

    /** 查询域名列表 */
    getList() {
      this.loading = true;
      listSiteDomain(this.queryParams).then(response => {
        this.domainList = response.rows;
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
        domainType: null,
        domain: null,
        isAgent: 0,
        config: null,
        areas: null,
        platType: null,
        status: 1
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
      this.title = "添加站点域名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      // 这里需要调用获取单个域名详情的接口，如果后端没有提供，可以直接使用行数据
      // 假设没有单独的详情接口，直接使用行数据
      this.form = Object.assign({}, row);
      this.open = true;
      this.title = "修改站点域名";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSiteDomain(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSiteDomain(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除选中的域名？').then(function() {
        return delSiteDomain(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 状态修改 */
    handleStatusChange(row) {
      let text = row.status === 1 ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.domain + '"域名吗？').then(function() {
        return updateSiteDomain(row);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === 0 ? 1 : 0;
      });
    }
  }
};
</script>

<style scoped>
.domain-config {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.domain-text {
  font-family: 'Courier New', monospace;
  color: #1890ff;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .domain-config {
    padding: 10px;
  }

  .search-form .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
