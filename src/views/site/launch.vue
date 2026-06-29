<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="站点ID" prop="siteId">
        <el-input
          v-model="queryParams.siteId"
          placeholder="请输入站点ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="站点名称" prop="siteName">
        <el-input
          v-model="queryParams.siteName"
          placeholder="请输入站点名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发布终端" prop="platType">
        <el-select v-model="queryParams.platType" placeholder="请选择发布终端" clearable size="small">
          <el-option
            v-for="dict in platTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="发布模板" prop="templateType">
        <el-select v-model="queryParams.templateType" placeholder="请选择发布模板" clearable size="small">
          <el-option
            v-for="dict in templateTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
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
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['game:site:publish:add']"
        >站点发布</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="publishList">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="站点ID" align="center" prop="siteId" />
      <el-table-column label="站点名称" align="center" prop="siteName" />
      <el-table-column label="发布终端" align="center" prop="platType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.plat_type" :value="scope.row.platType"/>
        </template>
      </el-table-column>
      <el-table-column label="发布模板" align="center" prop="templateType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.template_type" :value="scope.row.templateType"/>
        </template>
      </el-table-column>
      <el-table-column label="发布皮肤" align="center" prop="skinName" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.publish_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="发布人" align="center" prop="publisherName" />
      <el-table-column label="发布时间" align="center" prop="publishTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.publishTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completeTime" width="180">
        <template slot-scope="scope">
          <span v-if="scope.row.completeTime">{{ parseTime(scope.row.completeTime, '{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['game:site:publish:query']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['game:site:publish:remove']"
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

    <!-- 发布站点对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="站点名称" prop="siteId">
          <el-select v-model="form.siteId" placeholder="请选择站点" style="width: 100%" @change="handleSiteChange">
            <el-option
              v-for="site in siteList"
              :key="site.id"
              :label="site.nameZn"
              :value="site.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布终端" prop="platType">
          <el-select v-model="form.platType" placeholder="请选择发布终端" style="width: 100%">
            <el-option
              v-for="dict in platTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布模板" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择发布模板" style="width: 100%">
            <el-option
              v-for="dict in templateTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布皮肤" prop="skinId">
          <el-select v-model="form.skinId" placeholder="请选择发布皮肤" style="width: 100%">
            <el-option
              v-for="skin in skinList"
              :key="skin.id"
              :label="skin.skinName"
              :value="skin.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">开始发布</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </el-dialog>

    <!-- 发布详情对话框 -->
    <el-dialog :title="viewTitle" :visible.sync="viewOpen" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="站点ID">{{ viewForm.siteId }}</el-descriptions-item>
        <el-descriptions-item label="站点名称">{{ viewForm.siteName }}</el-descriptions-item>
        <el-descriptions-item label="发布终端">
          <dict-tag :options="dict.type.plat_type" :value="viewForm.platType"/>
        </el-descriptions-item>
        <el-descriptions-item label="发布模板">
          <dict-tag :options="dict.type.template_type" :value="viewForm.templateType"/>
        </el-descriptions-item>
        <el-descriptions-item label="发布皮肤">{{ viewForm.skinName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="dict.type.publish_status" :value="viewForm.status"/>
        </el-descriptions-item>
        <el-descriptions-item label="发布人">{{ viewForm.publisherName }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ parseTime(viewForm.publishTime) }}</el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2">
          <span v-if="viewForm.completeTime">{{ parseTime(viewForm.completeTime) }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="发布日志" :span="2">
          <el-input
            v-model="viewForm.publishLog"
            type="textarea"
            :rows="6"
            readonly
            placeholder="暂无发布日志"
          />
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSitePublish, getSitePublish, delSitePublish, addSitePublish, getPublishableSites } from "@/api/site/publish";
import { listSkin } from "@/api/resources/skin";

export default {
  name: "SitePublish",
  dicts: ['plat_type', 'template_type', 'publish_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 发布列表数据
      publishList: [],
      // 站点列表数据
      siteList: [],
      // 皮肤列表数据
      skinList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示查看弹出层
      viewOpen: false,
      // 查看弹出层标题
      viewTitle: "",
      // 平台类型字典
      platTypeOptions: [],
      // 模板类型字典
      templateTypeOptions: [],
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteId: null,
        siteName: null,
        platType: null,
        templateType: null,
        status: null
      },
      // 表单参数
      form: {},
      // 查看表单参数
      viewForm: {},
      // 表单校验
      rules: {
        siteId: [
          { required: true, message: "请选择站点", trigger: "change" }
        ],
        platType: [
          { required: true, message: "请选择发布终端", trigger: "change" }
        ],
        templateType: [
          { required: true, message: "请选择发布模板", trigger: "change" }
        ],
        skinId: [
          { required: true, message: "请选择发布皮肤", trigger: "change" }
        ]
      }
    };
  },
  created() {
    this.getList();
    this.loadDictData();
    this.loadSkinList();
  },
  methods: {
    /** 查询发布列表 */
    getList() {
      this.loading = true;
      listSitePublish(this.queryParams).then(response => {
        this.publishList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 加载字典数据
    loadDictData() {
      // 平台类型字典
      this.getDicts("plat_type").then(response => {
        this.platTypeOptions = response.data;
      });
      // 模板类型字典
      this.getDicts("template_type").then(response => {
        this.templateTypeOptions = response.data;
      });
      // 发布状态字典
      this.getDicts("publish_status").then(response => {
        this.statusOptions = response.data;
      });
    },
    // 加载皮肤列表
    loadSkinList() {
      listSkin({ status: 1 }).then(response => {
        this.skinList = response.rows;
      });
    },
    // 加载可发布站点列表
    loadPublishableSites() {
      getPublishableSites().then(response => {
        this.siteList = response.data;
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
        siteId: null,
        platType: null,
        templateType: null,
        skinId: null
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.loadPublishableSites();
      this.open = true;
      this.title = "发布站点WEB/H5";
    },
    /** 站点选择变化 */
    handleSiteChange(siteId) {
      const selectedSite = this.siteList.find(site => site.id === siteId);
      if (selectedSite) {
        this.form.siteCode = selectedSite.code;
        this.form.siteName = selectedSite.nameZn;
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          addSitePublish(this.form).then(response => {
            this.$modal.msgSuccess("发布任务创建成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
    /** 查看按钮操作 */
    handleView(row) {
      getSitePublish(row.id).then(response => {
        this.viewForm = response.data;
        this.viewOpen = true;
        this.viewTitle = "发布详情";
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$modal.confirm('是否确认删除发布记录？').then(function() {
        return delSitePublish(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
