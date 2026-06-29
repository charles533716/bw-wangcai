<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="100px">
      <el-form-item label="游戏编号" prop="gameCode">
        <el-input v-model="queryParams.gameCode" placeholder="请输入游戏编号" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="会员ID" prop="memberId">
        <el-input v-model="queryParams.memberId" placeholder="请输入会员ID" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="下注号码" prop="betNumber">
        <el-input-number v-model="queryParams.betNumber" :min="1" :max="10" controls-position="right" style="width: 120px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" @click="handleExport" v-hasPermi="['system:gameBet:export']">导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="下注单号" align="center" prop="betCode" width="160" />
      <el-table-column label="会员ID" align="center" prop="memberId" />
      <el-table-column label="下注号码" align="center" prop="betNumber" />
      <el-table-column label="下注金额" align="center" prop="betTotalAmount" />
      <el-table-column label="赔率" align="center" prop="betNumberOdds" />
      <el-table-column label="游戏编号" align="center" prop="gameCode" width="140" />
      <el-table-column label="下注时间" align="center" prop="betTime" width="160" />
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)" v-hasPermi="['system:gameBet:detail']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listGameBet } from "@/api/game/bet";

export default {
  name: "GameBet",
  data() {
    return {
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        gameCode: undefined,
        memberId: undefined,
        betNumber: undefined

      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.loading = true;
      listGameBet(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },
    handleDetail(row) {
      this.$router.push('/system/gameBet/detail/' + row.id);
    },
    handleExport() {
      this.download('system/gameBet/export', { ...this.queryParams }, `game_bet_${new Date().getTime()}.xlsx`);
    }
  }
};
</script>
