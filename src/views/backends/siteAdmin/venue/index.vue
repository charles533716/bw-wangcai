<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="场馆编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入场馆编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆名称" prop="nameZn">
        <el-input
          v-model="queryParams.nameZn"
          placeholder="请输入场馆中文名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆类型" prop="venueType">
        <el-select v-model="queryParams.venueType" placeholder="请选择场馆类型" clearable size="small">
          <el-option
            v-for="dict in venueTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="场馆状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:venue:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:venue:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:venue:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="venueList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="场馆ID" align="center" prop="id" />
      <el-table-column label="场馆编码" align="center" prop="code" />
      <el-table-column label="场馆名称" align="center" prop="nameZn" />

      <el-table-column label="场馆类型" align="center" prop="venueType">
        <template slot-scope="scope">
        <dict-tag :options="dict.type.venue_type" :value="scope.row.venueType"/>
        </template>
      </el-table-column>
      <el-table-column label="佣金比例" align="center" prop="commRate" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="游戏数量" align="center" prop="gameNumber" />
      <el-table-column label="授权数量" align="center" prop="authNumber" />
      <!-- H5图片列 -->
      <el-table-column label="H5图片" align="center" prop="h5Image" width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.h5Image">
            <el-image
              style="width: 50px; height: 50px; border-radius: 4px;"
              :src="getImageUrl(scope.row.h5Image)"
              :preview-src-list="[getImageUrl(scope.row.h5Image)]"
              fit="cover"
              :hide-on-click-modal="true"
            >
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline" style="font-size: 20px; color: #909399;"></i>
              </div>
            </el-image>
          </div>
          <div v-else>
            <span style="color: #c0c4cc; font-size: 12px;">无图片</span>
          </div>
        </template>
      </el-table-column>
      <!-- H5背景图片列 -->
      <el-table-column label="H5背景图片" align="center" prop="h5ImageBg" width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.h5ImageBg">
            <el-image
              style="width: 50px; height: 50px; border-radius: 4px;"
              :src="getImageUrl(scope.row.h5ImageBg)"
              :preview-src-list="[getImageUrl(scope.row.h5ImageBg)]"
              fit="cover"
              :hide-on-click-modal="true"
            >
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline" style="font-size: 20px; color: #909399;"></i>
              </div>
            </el-image>
          </div>
          <div v-else>
            <span style="color: #c0c4cc; font-size: 12px;">无图片</span>
          </div>
        </template>
      </el-table-column>
      <!-- 调整状态字段显示 -->
      <el-table-column label="钱包状态" align="center" prop="walletStatus">
        <template slot-scope="scope">
         <dict-tag :options="dict.type.wallet_status" :value="scope.row.walletStatus"/>
        </template>
      </el-table-column>
       <el-table-column label="场馆状态" align="center" prop="status">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.venue_status" :value="scope.row.status"/>
            </template>
          </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:venue:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:venue:remove']"
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

    <!-- 添加或修改场馆对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="场馆编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入场馆编码" />
        </el-form-item>
        <el-form-item label="API编码" prop="apiCode">
          <el-input v-model="form.apiCode" placeholder="请输入外部API场馆编码" />
        </el-form-item>
        <el-form-item label="中文名称" prop="nameZn">
          <el-input v-model="form.nameZn" placeholder="请输入场馆中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入场馆英文名称" />
        </el-form-item>
       <el-form-item label="佣金比例" prop="commRate">
         <el-input-number
           v-model="form.commRate"
           placeholder="请输入佣金比例百分比"
           :min="0"
           :max="100"
           :precision="2"
           :step="0.1"
           controls-position="right"
           style="width: 100%"
         />
       </el-form-item>
        <el-form-item label="场馆类型" prop="venueType">
          <el-select v-model="form.venueType" placeholder="请选择场馆类型">
            <el-option
              v-for="dict in venueTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
       <!-- 排序字段 -->
       <el-form-item label="排序" prop="sort">
         <el-input-number
           v-model="form.sort"
           placeholder="请输入排序"
           :min="0"
           :max="9999"
           controls-position="right"
           style="width: 100%"
         />
       </el-form-item>
       <!-- H5图片上传 -->
       <el-form-item label="H5图片" prop="h5Image">
         <image-upload v-model="form.h5Image" :limit="1" />
       </el-form-item>
       <!-- H5背景图片上传 -->
       <el-form-item label="H5背景图片" prop="h5ImageBg">
         <image-upload v-model="form.h5ImageBg" :limit="1" />
       </el-form-item>
       <el-form-item label="钱包状态" prop="walletStatus">
                 <el-radio-group v-model="form.walletStatus">
                   <el-radio
                     v-for="dict in walletStatusOptions"
                     :key="dict.dictValue"
                     :label="parseInt(dict.dictValue)"
                   >{{dict.dictLabel}}</el-radio>
                 </el-radio-group>
               </el-form-item>
        <el-form-item label="API名称" prop="apiName">
          <el-input v-model="form.apiName" placeholder="请输入外部api名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="parseInt(dict.dictValue)"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="场馆描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" placeholder="请输入内容" />
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
import { listVenue, getVenue, delVenue, addVenue, updateVenue, exportVenue,checkVenueCodeUnique  } from "@/api/venue/venue";
import ImageUpload from '@/components/ImageUpload';

export default {
  name: "Venue",
  dicts: ['venue_type', 'wallet_status', 'venue_status'],
  components: {
    ImageUpload
  },
  data() {
    const validateVenueCode = (rule, value, callback) => {
          if (value === '') {
            callback(new Error('场馆编码不能为空'));
          } else {
            // 检查场馆编码是否唯一
            checkVenueCodeUnique(value, this.form.id).then(response => {
              if (!response.data) {
                callback(new Error('场馆编码已存在'));
              } else {
                callback();
              }
            });
          }
        };
    return {
      walletStatusOptions: [],
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
      // 场馆表格数据
      venueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 场馆类型字典
      venueTypeOptions: [],
      // 状态字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: null,
        apiCode: null,
        nameZn: null,
        venueType: null,
        status: null
      },

       // 表单参数
            form: {
              id: null,
              code: null,
              apiCode: null,
              nameZn: null,
              nameEn: null,
              commRate: null,
              venueType: null,
              sort: null,
              gameNumber: null,
              authNumber: null,
              walletStatus: 1, // 默认启用
              desc: null,
              apiName: null,
              status:1, // 默认启用
              h5Image: null,
              h5ImageBg: null
            },

      // 表单校验
      rules: {
         code: [
                  { required: true, message: "场馆编码不能为空", trigger: "blur" },
                  { validator: validateVenueCode, trigger: 'blur' }
                ],
        nameZn: [
          { required: true, message: "场馆中文名称不能为空", trigger: "blur" }
        ],
        venueType: [
          { required: true, message: "场馆类型不能为空", trigger: "change" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
          commRate: [
            { type: 'number', message: '佣金比例必须为数字值', trigger: 'blur' }
          ],
          sort: [
            { type: 'number', message: '排序必须为数字值', trigger: 'blur' }
          ],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("venue_type").then(response => {
        console.log("场馆类型字典数据:", response.data);
      this.venueTypeOptions = response.data;
    });
    this.getDicts("venue_status").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("wallet_status").then(response => {
       this.walletStatusOptions = response.data;
    });
  },
  methods: {
    /** 获取图片完整URL */
    getImageUrl(path) {
      if (!path) return '';
      // 如果已经是完整URL，直接返回
      if (path.startsWith('http')) {
        return path;
      }

      // 如果是相对路径，添加基础路径
      if (path.startsWith('/profile')) {
        return process.env.VUE_APP_BASE_API + path;
      }
      // 默认添加/profile前缀
      return process.env.VUE_APP_BASE_API + '/profile' + path;
    },

    /** 查询场馆列表 */
    getList() {
      this.loading = true;
      listVenue(this.queryParams).then(response => {
        this.venueList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getVenueTypeLabel(value) {
      if (!this.venueTypeOptions || this.venueTypeOptions.length === 0) {
        return '字典未加载';
      }
      const dict = this.venueTypeOptions.find(item => item.dictValue === value);
      return dict ? dict.dictLabel : `未找到: ${value}`;
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
        code: null,
        apiCode: null,
        nameZn: null,
        nameEn: null,
        commRate: null,
        venueType: null,
        sort: null,
        gameNumber: null,
        authNumber: null,
        walletStatus: 1,
        desc: null,
        apiName: null,
        status: 1,
        h5Image: null,
        h5ImageBg: null
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
      this.title = "添加场馆";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getVenue(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改场馆";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateVenue(this.form).then(response => {
             this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              // 错误处理
              console.error("修改失败:", error);
            });
          } else {
            addVenue(this.form).then(response => {
               this.$modal.msgSuccess("新增成功");

              this.open = false;
              this.getList();
            }).catch(error => {
              // 错误处理
              console.error("新增失败:", error);
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除场馆编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delVenue(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有场馆数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportVenue(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
