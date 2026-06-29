<template>
  <div class="game-manage">
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
      <el-form-item label="游戏ID" prop="id">
        <el-input
          v-model="queryParams.id"
          placeholder="请输入游戏ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏编码" prop="gameCode">
        <el-input
          v-model="queryParams.gameCode"
          placeholder="请输入游戏编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏名称" prop="gameName">
        <el-input
          v-model="queryParams.gameName"
          placeholder="请输入游戏名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="游戏类型" prop="gameType">
        <el-select v-model="queryParams.gameType" placeholder="请选择游戏类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.venue_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="授权状态" prop="isAuth">
        <el-select v-model="queryParams.isAuth" placeholder="请选择授权状态" clearable size="small">
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

    <el-table v-loading="loading" :data="gameList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="站点编码" align="center" prop="siteCode" width="120" />
      <el-table-column label="站点名称" align="center" prop="siteNameZn" min-width="150" />
      <el-table-column label="游戏编码" align="center" prop="gameCode" width="120" />
      <el-table-column label="游戏名称" align="center" prop="gameName" min-width="150" />
      <el-table-column label="游戏类型" align="center" prop="gameType" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.gameType"/>
        </template>
      </el-table-column>
      <el-table-column label="场馆" align="center" prop="venueNameZn" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.venueNameZn || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="游戏状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.game_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="授权状态" align="center" prop="isAuth" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isAuth"
            :active-value="1"
            :inactive-value="0"
            @change="handleAuthChange(scope.row)"
          ></el-switch>
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

    <!-- 编辑游戏配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="游戏编码" prop="gameCode">
          <el-input v-model="form.gameCode" placeholder="请输入游戏编码" disabled />
        </el-form-item>
        <el-form-item label="游戏名称" prop="gameName">
          <el-input v-model="form.gameName" placeholder="请输入游戏名称" disabled />
        </el-form-item>
        <el-form-item label="授权状态" prop="isAuth">
          <el-radio-group v-model="form.isAuth">
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
import { listSiteManageGame, updateSiteGame, toggleGameAuth, batchAuthGame,getSiteGame  } from "@/api/site/config";

export default {
  name: "GameManage",
  dicts: ['venue_type', 'game_status'],
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
      // 游戏表格数据
      gameList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
         siteId: null,
          siteCode: null,
          siteNameZn: null,
        gameCode: null,
        gameName: null,
        gameType: null,
        isAuth: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        gameCode: [
          { required: true, message: "游戏编码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询游戏列表 */
    getList() {
      this.loading = true;
      listSiteManageGame(this.queryParams).then(response => {
        this.gameList = response.rows;
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

        gameCode: null,
        gameName: null,
        isAuth: 1
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
      getSiteGame(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改游戏配置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSiteGame(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 授权状态修改 */
    handleAuthChange(row) {
      const text = row.isAuth === 1 ? "授权" : "取消授权";
      this.$modal.confirm(`确认要${text}"${row.gameName}"游戏吗？`).then(() => {
        const authData = {
          id: row.id,
          siteCode:row.siteCode,
          gameCode: row.gameCode,
          isAuth: row.isAuth
        };
        return toggleGameAuth(authData);
      }).then(() => {
        this.$modal.msgSuccess(`${text}成功`);
      }).catch(() => {
        row.isAuth = row.isAuth === 1 ? 0 : 1;
      });
    },
    /** 批量授权按钮操作 */
    handleBatchAuth() {
      const selectedGames = this.gameList.filter(item => this.ids.includes(item.id));
      if (selectedGames.length === 0) {
        this.$modal.msgError("请选择要授权的游戏");
        return;
      }

      this.$modal.confirm('是否确认授权选中的游戏？').then(() => {
        const authGames = selectedGames.map(item => {
          return {
            id: item.id,
            siteCode:item.siteCode,
            gameCode: item.gameCode,
            isAuth: 1
          };
        });

        batchAuthGame(authGames).then(() => {
          this.$modal.msgSuccess("授权成功");
          this.getList();
        });
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/site/venue/manage/game/export', {
        ...this.queryParams
      }, `game_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
