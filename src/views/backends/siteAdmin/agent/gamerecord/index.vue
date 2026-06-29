<!-- 游戏记录 -->
<template>
  <div class="game-page">
    <!-- 标题 -->
    <div class="page-title">
      <span class="title-text">游戏记录</span>
    </div>

    <el-card shadow="never" class="card">
      <!-- 筛选区 -->
      <div class="filter-bar">
        <div class="left">
          <div class="field">
            <span class="label">下级账号：</span>
            <el-input
              v-model="query.userName"
              placeholder="请输入下级账号"
              clearable
              class="w-200"
            />
          </div>

          <div class="field">
            <span class="label">场馆：</span>
            <el-select v-model="query.venueCode" placeholder="全部" clearable class="w-200">
              <el-option
                v-for="item in venueOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="field">
            <span class="label">状态：</span>
            <el-select v-model="query.obBetStatus" placeholder="全部" clearable class="w-200">
              <el-option label="全部" value="" />
              <el-option
                v-for="item in betStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>

          <div class="field">
            <span class="label">投注时间：</span>
            <el-date-picker
              v-model="query.betTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              clearable
              class="w-360"
            />
          </div>

          <el-button type="primary" class="btn" @click="handleSearch">搜索</el-button>
          <el-button class="btn" @click="handleReset">重置</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        border
        class="table"
        :header-cell-style="headerStyle"
        @sort-change="handleSortChange"
      >
        <el-table-column label="序号" type="index" width="80" align="center" />
        <el-table-column label="下级账号" prop="userName" min-width="140" align="center" />
        <el-table-column label="场馆" prop="venueName" min-width="120" align="center" />
        <el-table-column label="游戏名称" prop="gameTypeName" min-width="180" align="center" />
        <el-table-column
          label="投注额"
          prop="betAmount"
          min-width="140"
          align="center"
          :formatter="$formatters.formatMoneyCNY"
        />
        <el-table-column
          label="有效投注"
          prop="validBetAmount"
          min-width="140"
          align="center"
          :formatter="$formatters.formatMoneyCNY"
        />
        <el-table-column
          label="状态"
          prop="obBetStatus"
          min-width="120"
          align="center"
          :formatter="(row) => formatByOptions(row.obBetStatus, betStatusOptions)"
        />
        <el-table-column label="输赢" prop="netAmount" min-width="140" align="center">
          <template slot-scope="scope">
            <span
              :style="{
                color: $formatters.getWinLoseColor(scope.row.netAmount)
              }"
            >
              {{ $formatters.formatMoneyCNY(null, null, scope.row.netAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="投注时间"
          prop="betAt"
          min-width="180"
          align="center"
          :formatter="$formatters.formatDateTime"
        />
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">明细</el-button>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template slot="empty">
          <div class="empty-wrap">
            <i class="el-icon-document"></i>
            <div class="empty-text">暂无数据</div>
          </div>
        </template>
      </el-table>

      <!-- 分页（需要可打开） -->
      <div class="pager" v-if="showPager">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          :page-size="query.pageSize"
          :current-page.sync="query.pageNum"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { list } from '@/api/gamerecord/index';
import { venueList } from '@/api/venue/venue';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRecentSevenDaysRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return [formatDate(start), formatDate(end)];
}

function createDefaultQuery() {
  return {
    userName: '',
    venueCode: '',
    obBetStatus: '',
    betTimeRange: getRecentSevenDaysRange(),
    pageNum: 1,
    pageSize: 10
  };
}

export default {
  name: 'GameRecord',
  data() {
    return {
      loading: false,
      list: [],
      venueOptions: [],
      betStatusOptions: [
        { label: '未结算', value: 0 },
        { label: '已结算', value: 1 },
        { label: '不结算', value: 2 }
      ],
      total: 0,
      showPager: true,

      query: createDefaultQuery()
    };
  },
  created() {
    this.fetchList();
  },
  methods: {
    headerStyle() {
      return {
        background: '#f5f7fa',
        color: '#303133',
        fontWeight: '600',
        height: '44px'
      };
    },
    handleSearch() {
      this.query.pageNum = 1;
      this.fetchList();
    },
    handleReset() {
      this.query = createDefaultQuery();
      this.fetchList();
    },
    handlePageChange(page) {
      this.query.pageNum = page;
      this.fetchList();
    },
    handleDetail(row) {
      // TODO: 跳转明细
      console.log('detail:', row);
    },
    handleSortChange({ prop, order }) {
      // prop: 排序字段
      // order: ascending / descending / null

      this.query.orderByColumn = prop;
      this.query.isAsc = order === 'ascending' ? 'asc' : 'desc';

      if (!order) {
        this.query.orderByColumn = '';
        this.query.isAsc = '';
      }

      this.fetchList();
    },
    async fetchList() {
      this.loading = true;
      try {
        const params = {
          ...this.query,
          params: {}
        };
        if (this.query.betTimeRange && this.query.betTimeRange.length === 2) {
          params.params.beginTime = `${this.query.betTimeRange[0]} 00:00:00`;
          params.params.endTime = `${this.query.betTimeRange[1]} 23:59:59`;
        }

        list(params).then((response) => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        });
        venueList().then((res) => {
          const list = res.data || [];
          this.venueOptions = [
            { label: '全部', value: '' },
            ...list.map((item) => ({
              label: item.nameZn,
              value: item.code
            }))
          ];
        });
      } finally {
      }
    },
    formatByOptions(value, options) {
      const item = options.find((o) => o.value == value);
      return item ? item.label : '-';
    }
  }
};
</script>

<style scoped>
.game-page {
  padding: 16px;
  background: #fff;
}

/* 标题 */
.page-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.title-text {
  font-size: 18px;
  font-weight: 700;
  color: #111;
}
.badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f56c6c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 卡片 */
.card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

/* 筛选区 */
.filter-bar {
  padding: 10px 6px 14px;
}
.filter-bar .left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 18px;
}
.field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.label {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
}
.w-200 {
  width: 200px;
}
.w-180 {
  width: 180px;
}
.w-360 {
  width: 360px;
}
.btn {
  min-width: 80px;
}

/* 表格 */
.table {
  margin-top: 4px;
}

/* 空状态 */
.empty-wrap {
  padding: 60px 0;
  text-align: center;
  color: #909399;
}
.empty-wrap i {
  font-size: 42px;
  opacity: 0.5;
}
.empty-text {
  margin-top: 10px;
  font-size: 13px;
}

/* 分页 */
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 0 4px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .w-360 {
    width: 300px;
  }
}
</style>
