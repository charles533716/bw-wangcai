<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="游戏编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入游戏编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏名称" prop="nameZn" size="small">
        <el-input
          v-model="queryParams.nameZn"
          placeholder="请输入游戏中文名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="场馆编码" prop="venueCode">
        <el-select v-model="queryParams.venueCode" placeholder="请选择场馆" clearable size="small">
          <el-option
            v-for="venue in venueList"
            :key="venue.code"
            :label="venue.nameZn"
            :value="venue.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameType">
        <el-select v-model="queryParams.gameType" placeholder="请选择游戏类型" clearable size="small">
          <el-option
            v-for="dict in venueTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="TOP" prop="isTop">
        <el-select v-model="queryParams.isTop" placeholder="TOP" clearable size="small">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="游戏状态" clearable size="small">
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
          v-hasPermi="['system:game:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:game:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:game:remove']"
        >删除</el-button>
      </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            icon="el-icon-refresh"
            size="mini"
            @click="handleSync"
            v-hasPermi="['system:game:sync']"
            :loading="syncLoading"
          >同步</el-button>
        </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="gameList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="游戏ID" align="center" prop="id" />
      <el-table-column label="游戏编码" align="center" prop="code" />
      <el-table-column label="游戏名称" align="center" prop="nameZn" />
      <el-table-column label="场馆编码" align="center" prop="venueCode" />
      <el-table-column label="场馆名称" align="center" prop="venueNameZn" />
      <el-table-column label="游戏类型" align="center" prop="gameType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.gameType"/>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="是否TOP" align="center" prop="isTop">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isTop === 1 ? 'success' : 'info'">
            {{ scope.row.isTop === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支持平台" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.suportH5 === 1" type="success">H5</el-tag>
          <el-tag v-if="scope.row.suportPc === 1" type="primary">PC</el-tag>
          <el-tag v-if="scope.row.suportApp === 1" type="warning">APP</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="H5图片" align="center" prop="h5Images" width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.h5Images">
            <el-image
              style="width: 50px; height: 50px; border-radius: 4px;"
              :src="[getImageUrl(scope.row.h5Images)]"
              :preview-src-list="[getImageUrl(scope.row.h5Images)]"
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
      <el-table-column label="授权数量" align="center" prop="authQuantity" />
      <el-table-column label="游戏状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.game_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:game:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:game:remove']"
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

    <!-- 添加或修改游戏对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="游戏编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入游戏编码" @blur="checkCodeUnique" />
          <div v-if="codeError" style="color: #f56c6c; font-size: 12px; margin-top: 5px;">{{ codeError }}</div>
        </el-form-item>
        <el-form-item label="API编码" prop="apiCode">
          <el-input v-model="form.apiCode" placeholder="请输入外部api对应编码" />
        </el-form-item>
        <el-form-item label="API名称" prop="apiName">
          <el-input v-model="form.apiName" placeholder="请输入外部api对应名称" />
        </el-form-item>
        <el-form-item label="场馆" prop="venueCode">
          <el-select v-model="form.venueCode" placeholder="请选择场馆">
            <el-option
              v-for="venue in venueList"
              :key="venue.code"
              :label="venue.nameZn"
              :value="venue.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="中文名称" prop="nameZn">
          <el-input v-model="form.nameZn" placeholder="请输入游戏中文名称" />
        </el-form-item>
        <el-form-item label="英文名称" prop="nameEn">
          <el-input v-model="form.nameEn" placeholder="请输入游戏英文名称" />
        </el-form-item>
        <el-form-item label="游戏类型" prop="gameType">
          <el-select v-model="form.gameType" placeholder="请选择游戏类型">
            <el-option
              v-for="dict in venueTypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="是否TOP游戏">
          <el-radio-group v-model="form.isTop">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支持平台">
          <el-checkbox v-model="form.suportH5" :true-label="1" :false-label="0">H5</el-checkbox>
          <el-checkbox v-model="form.suportPc" :true-label="1" :false-label="0">PC</el-checkbox>
          <el-checkbox v-model="form.suportApp" :true-label="1" :false-label="0">APP</el-checkbox>
        </el-form-item>
        <el-form-item label="H5图片" prop="h5Images">
          <image-upload v-model="form.h5Images" :limit="1" />
        </el-form-item>
        <el-form-item label="PC图片" prop="pcImages">
          <image-upload v-model="form.pcImages" :limit="1" />
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listGame, getGame, delGame, addGame, updateGame, exportGame,checkCodeUnique ,syncGameList  } from "@/api/game/game";
import { listVenue } from "@/api/venue/venue";
import ImageUpload from '@/components/ImageUpload';
export default {
  name: "Game",
   dicts: ['venue_type', 'game_status'],
    components: {
      ImageUpload
    },
  data() {
    return {
      syncLoading: false,
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
      // 游戏表格数据
      gameList: [],
      // 场馆列表
      venueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 游戏类型字典
       venueTypeOptions: [],
      // 状态字典
      statusOptions: [],
        // 编码重复错误提示
            codeError: "",
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        code: null,
        apiCode: null,
        apiName: null,
        venueCode: null,
        nameZn: null,
        gameType: null,
        isTop: null,
        status: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: "游戏编码不能为空", trigger: "blur" }
        ],
        nameZn: [
          { required: true, message: "游戏中文名称不能为空", trigger: "blur" }
        ],
        venueCode: [
          { required: true, message: "场馆编码不能为空", trigger: "change" }
        ],
        gameType: [
          { required: true, message: "游戏类型不能为空", trigger: "change" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
         sort: [
           { type: 'number', message: '排序必须为数字值' }
         ]
      }
    };
  },
  created() {
    this.getList();
    this.getVenueList();
    this.getDicts("venue_type").then(response => {
      this.venueTypeOptions = response.data;
    });
    this.getDicts("game_status").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {

        /** 同步按钮操作 */
        handleSync() {
          this.$confirm('是否确认同步所有场馆的游戏列表?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.syncLoading = true;
            syncGameList().then(response => {
              this.$modal.msgSuccess(response.msg || "同步成功");
              this.getList(); // 刷新列表
            }).catch(error => {
              console.error("同步失败:", error);
              this.$modal.msgError("同步失败");
            }).finally(() => {
              this.syncLoading = false;
            });
          }).catch(() => {
            this.$modal.msgInfo("已取消同步");
          });
        },
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
    /** 查询游戏列表 */
    getList() {
      this.loading = true;
      listGame(this.queryParams).then(response => {
        this.gameList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询场馆列表 */
    getVenueList() {
      listVenue({pageSize:100}).then(response => {
        this.venueList = response.rows;
      });
    },
    /** 检查游戏编码是否重复 */
        checkCodeUnique() {
          if (!this.form.code || this.form.code.trim() === '') {
            this.codeError = '';
            return;
          }

          // 如果是修改操作且编码没有变化，则不检查
          if (this.form.id && this.originalCode === this.form.code) {
            this.codeError = '';
            return;
          }

          checkCodeUnique(this.form.code, this.form.id).then(response => {
            if (!response.data) {
              this.codeError = '游戏编码已存在，请重新输入';
            } else {
              this.codeError = '';
            }
          });
        },
    // 游戏类型字典翻译
    gameTypeFormat(row, column) {
      return this.selectDictLabel(this.venueTypeOptions, row.gameType);
    },
    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
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
        apiName: null,
        apiTypeId: null,
        venueCode: null,
        nameZn: null,
        nameEn: null,
        gameType: null,
        status: 1,
        sort: null,
        isTop: 0,
        suportH5: 1,
        suportPc: 0,
        suportApp: 0,
        h5Images: null,
        pcImages: null,
        authQuantity: null
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
      this.title = "添加游戏";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getGame(id).then(response => {
        this.form = response.data;
           this.originalCode = this.form.code; // 保存原始编码用于重复检查
        this.open = true;
        this.title = "修改游戏";
      });
    },
    /** 提交按钮 */
    submitForm() {
        if (this.codeError) {
              this.$modal.msgError("游戏编码已存在，请修改后重试");
              return;
            }
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateGame(this.form).then(response => {
           this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              // 错误处理
              console.error("修改失败:", error);
            });;
          } else {
            addGame(this.form).then(response => {
            this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }).catch(error => {
              // 错误处理
              console.error("新增失败:", error);
            });;
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除游戏编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delGame(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有游戏数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportGame(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
