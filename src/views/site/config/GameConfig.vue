<template>
  <div class="game-config">
    <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
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
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleInit"
        >初始化游戏</el-button>
      </el-col>
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
    </el-row>

    <el-table v-loading="loading" :data="gameList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="游戏编码" align="center" prop="gameCode" />
      <el-table-column label="游戏名称" align="center" prop="gameName" />
      <el-table-column label="游戏类型" align="center" prop="gameType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.venue_type" :value="scope.row.gameType"/>
        </template>
      </el-table-column>
      <el-table-column label="场馆" align="center" prop="venueNameZn">
        <template slot-scope="scope">
          <span>{{ scope.row.venueNameZn || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权状态" align="center" prop="isAuth">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isAuth"
            :active-value="1"
            :inactive-value="0"
            @change="handleAuthChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
   <!--   <el-table-column label="操作时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime ? parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}') : '-' }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="scope.row.id"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.id"
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

    <!-- 添加或修改游戏配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="游戏编码" prop="gameCode">
          <el-input v-model="form.gameCode" placeholder="请输入游戏编码" :disabled="form.id != null" />
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
import { listSiteGame, addSiteGame, updateSiteGame, delSiteGame, batchAuthGame, initSiteGames, toggleGameAuth } from "@/api/site/config";

export default {
  name: "GameConfig",
  props: {
    siteCode: {
      type: String,
      required: true
    }
  },
  dicts: ['venue_type'],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      gameList: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        siteCode: this.siteCode,
        gameCode: null,
        gameName: null,
        gameType: null,
        isAuth: null
      },
      form: {},
      rules: {
        gameCode: [
          { required: true, message: "游戏编码不能为空", trigger: "blur" }
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
      listSiteGame(this.queryParams).then(response => {
        this.gameList = response.rows;
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
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id).filter(id => id != null);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleInit() {
      this.$modal.confirm('是否初始化游戏配置？这将为当前站点创建所有可用游戏的配置记录。').then(() => {
       console.info('initsitegames');
        return initSiteGames(this.siteCode);
      }).then(() => {
        this.$modal.msgSuccess("初始化成功");
        this.getList();
      }).catch(() => {});
    },
    handleAuthChange(row) {
      const text = row.isAuth === 1 ? "授权" : "取消授权";
      this.$modal.confirm(`确认要${text}"${row.gameName}"游戏吗？`).then(() => {
        const authData = {
          siteCode: this.siteCode,
          gameCode: row.gameCode,
          isAuth: row.isAuth
        };
        return toggleGameAuth(authData);
      }).then(() => {
        this.$modal.msgSuccess(`${text}成功`);
        this.getList();
      }).catch(() => {
        // 操作取消，恢复原状态
        row.isAuth = row.isAuth === 1 ? 0 : 1;
      });
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加游戏配置";
    },
    handleUpdate(row) {
      this.reset();
      this.form = {
        id: row.id,
        gameCode: row.gameCode,
        gameName: row.gameName,
        isAuth: row.isAuth,
        siteCode: this.siteCode
      };
      this.open = true;
      this.title = "修改游戏配置";
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.siteCode = this.siteCode;
          if (this.form.id != null) {
            updateSiteGame(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSiteGame(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除选中的数据项？').then(function() {
        return delSiteGame(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
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
            siteCode: this.siteCode,
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
    cancel() {
      this.open = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        gameCode: null,
        gameName: null,
        siteCode: this.siteCode,
        isAuth: 1
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
