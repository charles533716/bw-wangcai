<template>
  <div class="resource-config">
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
      <el-form-item label="功能模块" prop="platModule">
        <el-select v-model="queryParams.platModule" placeholder="请选择功能模块" clearable size="small">
          <el-option
            v-for="dict in platModuleOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="素材类型" prop="resourceType">
        <el-select v-model="queryParams.resourceType" placeholder="请选择素材类型" clearable size="small">
          <el-option
            v-for="dict in resourceTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="素材状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择素材状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          v-hasPermi="['game:siteResource:add']"
        >新增素材</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['game:siteResource:edit']"
        >修改素材</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['game:siteResource:remove']"
        >删除素材</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="resourceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="60" />
      <el-table-column label="平台类型" align="center" prop="platType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plat_type" :value="scope.row.platType"/>
        </template>
      </el-table-column>
      <el-table-column label="功能模块" align="center" prop="platModule" width="120">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plat_module" :value="scope.row.platModule"/>
        </template>
      </el-table-column>
      <el-table-column label="素材类型" align="center" prop="resourceType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.resource_type" :value="scope.row.resourceType"/>
        </template>
      </el-table-column>
      <el-table-column label="素材内容" align="center" prop="content" min-width="200">
        <template slot-scope="scope">
          <div v-if="scope.row.resourceType === 'image' && scope.row.imageUrl">
            <div class="resource-preview">
              <image-preview :src="scope.row.imageUrl" :width="50" :height="50"/>
              <span class="image-name">{{ getFileName(scope.row.imageUrl) }}</span>
            </div>
          </div>
          <div v-else-if="scope.row.resourceType === 'text' && scope.row.content">
            <el-tooltip :content="scope.row.content" placement="top">
              <span class="text-content">{{ scope.row.content.substring(0, 30) }}{{ scope.row.content.length > 30 ? '...' : '' }}</span>
            </el-tooltip>
          </div>
          <span v-else class="no-content">-</span>
        </template>
      </el-table-column>
      <el-table-column label="配置参数" align="center" prop="configParams" width="120">
        <template slot-scope="scope">
          <el-tooltip v-if="scope.row.configParams" :content="scope.row.configParams" placement="top">
            <span class="config-params">查看参数</span>
          </el-tooltip>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status.toString()"/>
        </template>
      </el-table-column>
     <!-- <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['game:siteResource:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
          >预览</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['game:siteResource:remove']"
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

    <!-- 添加或修改站点资源对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="平台类型" prop="platType">
          <el-select v-model="form.platType" placeholder="请选择平台类型" style="width: 100%">
            <el-option
              v-for="dict in platTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="功能模块" prop="platModule">
          <el-select v-model="form.platModule" placeholder="请选择功能模块" style="width: 100%">
            <el-option
              v-for="dict in platModuleOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="素材类型" prop="resourceType">
          <el-select v-model="form.resourceType" placeholder="请选择素材类型" style="width: 100%" @change="handleResourceTypeChange">
            <el-option
              v-for="dict in resourceTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="配置参数" prop="configParams">
          <el-input v-model="form.configParams" placeholder="请输入配置参数，JSON格式" type="textarea" :rows="3" />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            可选参数，用于存储额外的配置信息，如：{"width": 100, "height": 100, "color": "#ffffff"}
          </div>
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item label="图片素材" prop="imageUrl" v-if="form.resourceType === 'image'">
          <image-upload v-model="form.imageUrl" :limit="1"/>
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            支持jpg、png、gif格式，大小不超过2MB，建议尺寸适合对应平台显示
          </div>
        </el-form-item>

        <!-- 文字内容 -->
        <el-form-item label="文字内容" prop="content" v-if="form.resourceType === 'text'">
          <el-input v-model="form.content" type="textarea" placeholder="请输入文字内容" :rows="4" />
          <div class="el-upload__tip" style="color: #909399; font-size: 12px; margin-top: 5px;">
            请输入需要在平台上显示的文字内容
          </div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog :title="previewTitle" :visible.sync="previewOpen" width="60%" append-to-body>
      <div style="text-align: center;">
        <image-preview
          :src="previewImage"
          :width="600"
          :height="400"
        />
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <el-button @click="handleCopyUrl(previewImage)">复制图片地址</el-button>
        <el-button type="primary" @click="previewOpen = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 文字预览对话框 -->
    <el-dialog :title="textPreviewTitle" :visible.sync="textPreviewOpen" width="50%" append-to-body>
      <div style="padding: 20px; background: #f5f5f5; border-radius: 4px;">
        <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0; font-family: inherit;">{{ previewText }}</pre>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCopyText(previewText)">复制文字内容</el-button>
        <el-button type="primary" @click="textPreviewOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSiteResource, getSiteResource, delSiteResource, addSiteResource, updateSiteResource } from "@/api/site/resource";
import ImageUpload from '@/components/ImageUpload';
import ImagePreview from '@/components/ImagePreview';

export default {
  name: "ResourceConfig",
  components: {
    ImageUpload,
    ImagePreview
  },
  dicts: ['sys_normal_disable','plat_type', 'plat_module', 'resource_type'],
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
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
      // 站点资源表格数据
      resourceList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示图片预览对话框
      previewOpen: false,
      // 是否显示文字预览对话框
      textPreviewOpen: false,
      // 预览图片标题
      previewTitle: "",
      // 预览图片地址
      previewImage: "",
      // 预览文字标题
      textPreviewTitle: "",
      // 预览文字内容
      previewText: "",
      // 平台类型字典
      platTypeOptions: [],
      // 功能模块字典
      platModuleOptions: [],
      // 素材类型字典
      resourceTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: this.siteCode,
        platType: null,
        platModule: null,
        resourceType: null,
        status: null
      },
      // 表单参数
      form: {
        siteCode: this.siteCode,
        status: 0
      },
      // 表单校验
      rules: {
        platType: [
          { required: true, message: "平台类型不能为空", trigger: "change" }
        ],
        platModule: [
          { required: true, message: "功能模块不能为空", trigger: "change" }
        ],
        resourceType: [
          { required: true, message: "素材类型不能为空", trigger: "change" }
        ],
        imageUrl: [
          { required: true, message: "请上传图片", trigger: "blur" }
        ],
        content: [
          { required: true, message: "文字内容不能为空", trigger: "blur" }
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
      // 功能模块字典
      this.getDicts("plat_module").then(response => {
        this.platModuleOptions = response.data;
      });
      // 素材类型字典
      this.getDicts("resource_type").then(response => {
        this.resourceTypeOptions = response.data;
      });
    },

    /** 查询站点资源列表 */
    getList() {
      this.loading = true;
      listSiteResource(this.queryParams).then(response => {
        this.resourceList = response.rows;
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
        platModule: null,
        resourceType: null,
        configParams: null,
        imageUrl: null,
        content: null,
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加站点资源";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSiteResource(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改站点资源";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 根据素材类型设置必填字段
          if (this.form.resourceType === 'image' && !this.form.imageUrl) {
            this.$modal.msgError("请上传图片");
            return;
          }
          if (this.form.resourceType === 'text' && !this.form.content) {
            this.$modal.msgError("请输入文字内容");
            return;
          }

          if (this.form.id != null) {
            updateSiteResource(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSiteResource(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除选中的资源？').then(function() {
        return delSiteResource(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 素材类型变化 */
    handleResourceTypeChange(value) {
      // 根据素材类型清空不相关的字段
      if (value === 'image') {
        this.form.content = null;
      } else if (value === 'text') {
        this.form.imageUrl = null;
      }
    },
    /** 预览素材 */
    handlePreview(row) {
      if (row.resourceType === 'image' && row.imageUrl) {
        this.previewImage = row.imageUrl;
        this.previewTitle = `图片预览 - ${row.platModule}`;
        this.previewOpen = true;
      } else if (row.resourceType === 'text' && row.content) {
        this.previewText = row.content;
        this.textPreviewTitle = `文字预览 - ${row.platModule}`;
        this.textPreviewOpen = true;
      } else {
        this.$modal.msgInfo("该资源没有可预览的内容");
      }
    },
    /** 复制图片地址 */
    handleCopyUrl(url) {
      this.$copyText(url).then(() => {
        this.$modal.msgSuccess("复制成功");
      }).catch(() => {
        this.$modal.msgError("复制失败");
      });
    },
    /** 复制文字内容 */
    handleCopyText(text) {
      this.$copyText(text).then(() => {
        this.$modal.msgSuccess("复制成功");
      }).catch(() => {
        this.$modal.msgError("复制失败");
      });
    },
    /** 获取文件名 */
    getFileName(url) {
      if (!url) return '';
      return url.substring(url.lastIndexOf('/') + 1);
    }
  }
};
</script>

<style scoped>
.resource-config {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.resource-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-name {
  font-size: 12px;
  color: #666;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-content {
  color: #333;
  font-size: 14px;
}

.no-content {
  color: #999;
  font-style: italic;
}

.config-params {
  color: #409EFF;
  cursor: pointer;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resource-config {
    padding: 10px;
  }

  .search-form .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
