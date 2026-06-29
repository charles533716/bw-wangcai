<!-- 会员管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane>
          <div class="member-page">
          <!-- 标题 -->
          <div class="page-title">
            <span class="title-text">会员管理</span>
          </div>

          <!-- 顶部标签筛选（全部/未分配/编辑标签） -->
          <div class="top-tags">
            <div
              class="tag-item"
              :class="{ active: tagFilter === 'all' }"
              @click="tagFilter = 'all'"
            >
              {{ currentUserTypeLabel }} <span class="count">{{ total }}</span>
            </div>
            <!-- <div
              class="tag-item"
              :class="{ active: tagFilter === 'unassigned' }"
              @click="tagFilter = 'unassigned'"
            >
              未分配 <span class="count">1</span>
            </div>
            <div class="edit-tag" @click="handleEditTags">
              <i class="el-icon-edit"></i> 编辑标签
            </div> -->
          </div>

          <el-card shadow="never" class="card">
            <!-- 查询表单 -->
            <el-form
              :model="query"
              ref="queryForm"
              :rules="rules"
              label-width="80px"
              class="query-form"
            >
              <!-- 第一行 -->
              <div class="row">
                <el-form-item label="会员账号" prop="id" class="fi w-260">
                  <el-input v-model="query.id" placeholder="请输入会员账号" clearable />
                </el-form-item>

                <el-form-item label="姓名" prop="name" class="fi w-260">
                  <el-input v-model="query.name" placeholder="请输入姓名" clearable />
                </el-form-item>

                <el-form-item label="上级代理" prop="parentAgentName" class="fi w-260">
                  <el-input
                    v-model="query.parentAgentName"
                    placeholder="请输入上级代理账号"
                    clearable
                  />
                </el-form-item>

                <el-form-item label="注册时间" class="fi w-420">
                  <el-date-picker
                    v-model="query.registerRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    clearable
                    class="w-360"
                  />
                </el-form-item>
              </div>

              <!-- 第二行 -->
              <div class="row row2">
                <el-form-item label="存款金额" class="fi w-420">
                  <div class="money-range">
                    <span class="prefix">CNY</span>
                    <el-input
                      v-model="query.depositMin"
                      placeholder="最小金额"
                      clearable
                      class="money-input"
                    />
                    <el-input
                      v-model="query.depositMax"
                      placeholder="最大金额"
                      clearable
                      class="money-input"
                    />
                  </div>
                </el-form-item>

                <el-form-item label="注册入金" class="fi w-420">
                  <div class="money-range">
                    <span class="prefix">CNY</span>
                    <el-input
                      v-model="query.registerDepositMin"
                      placeholder="最小金额"
                      clearable
                      class="money-input"
                    />
                    <el-input
                      v-model="query.registerDepositMax"
                      placeholder="最大金额"
                      clearable
                      class="money-input"
                    />
                  </div>
                </el-form-item>

                <el-form-item label="状态" class="fi w-360">
                  <el-radio-group v-model="query.status">
                    <el-radio :label="''">全部</el-radio>
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="2">禁用</el-radio>
                  </el-radio-group>
                </el-form-item>

                <div class="btns">
                  <el-button type="warning" icon="el-icon-download" @click="handleExport"
                    >导出Excel</el-button
                  >
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </div>
              </div>

              <!-- 第三行 -->
              <div class="row row3">
                <el-form-item label="会员/代理" class="fi w-260">
                  <el-select
                    v-model="query.userType"
                    class="w-180"
                    clearable
                    placeholder="全部"
                  >
                    <el-option label="会员" :value="0" />
                    <el-option label="代理" :value="1" />
                  </el-select>
                </el-form-item>

                <el-form-item label="站点名称" prop="siteName" class="fi w-260">
                  <el-input v-model="query.siteName" placeholder="请输入站点名称" clearable />
                </el-form-item>
              </div>
            </el-form>

            <!-- 表格 -->
            <el-table
              v-loading="loading"
              :data="list"
              border
              class="table"
              :header-cell-style="headerStyle"
              :summary-method="getSummaries"
              show-summary
              @sort-change="handleSortChange"
            >
              <el-table-column label="会员账号" prop="id" min-width="140" align="center" />
              <el-table-column label="VIP等级" prop="vipLevel" min-width="120" align="center" />
              <el-table-column
                label="状态"
                prop="status"
                min-width="120"
                align="center"
                :formatter="formatStatus"
              />
              <el-table-column label="姓名" prop="name" min-width="120" align="center" />
              <el-table-column
                label="会员/代理"
                prop="userType"
                min-width="120"
                align="center"
                :formatter="formatUserType"
              />
              <el-table-column label="站点名称" prop="siteName" min-width="140" align="center" />
              <el-table-column
                label="上级代理"
                prop="parentAgentName"
                min-width="140"
                align="center"
              />
              <el-table-column
                label="总充值"
                prop="amountUsdInSum"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="首充金额"
                prop="firstDepositAmount"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="实际到账"
                prop="amountCnyInSum"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="注册入金金额"
                prop="registerDepositAmount"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="总提款"
                prop="amountCnyOutSum"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="钱包余额"
                prop="balanceCnySum"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column label="总输赢" prop="winLoseCnySum" min-width="140" align="center">
                <template slot-scope="scope">
                  <span
                    :style="{
                      color: $formatters.getWinLoseColor(scope.row.winLoseCnySum)
                    }"
                  >
                    {{ $formatters.formatMoneyCNY(null, null, scope.row.winLoseCnySum) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="总有效投注额"
                prop="amountValidCnySum"
                min-width="140"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="最后登录时间"
                prop="lastLoginTime"
                min-width="170"
                align="center"
                :formatter="$formatters.formatDateTime"
              />
              <el-table-column
                label="注册时间"
                prop="regTime"
                min-width="170"
                align="center"
                :formatter="$formatters.formatDateTime"
              />
              <!-- 空状态 -->
              <template slot="empty">
                <div class="empty-wrap">
                  <i class="el-icon-document"></i>
                  <div class="empty-text">暂无数据</div>
                </div>
              </template>
            </el-table>

            <!-- 底部说明 + 分页 -->
            <div class="pager">
              <el-pagination
                background
                layout="prev, pager, next, jumper"
                :current-page.sync="query.pageNum"
                :page-size="query.pageSize"
                :total="total"
                @current-change="handlePageChange"
              />
            </div>
          </el-card>
          </div>
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script>
import { listUser } from '@/api/agentmember/index';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

function createDefaultQuery() {
  return {
    id: '',
    name: '',
    parentAgentName: '',
    siteName: '',
    userType: '',
    depositMin: '',
    depositMax: '',
    registerDepositMin: '',
    registerDepositMax: '',
    statRange: [],
    registerRange: [],
    status: '',
    hasBet: '',
    pageNum: 1,
    pageSize: 10
  };
}

export default {
  name: 'MemberManage',
  components: { Splitpanes, Pane },
  data() {
    return {
      tagFilter: 'all', // all | unassigned
      loading: false,
      list: [],
      total: 0,
      appliedUserType: '',
      query: createDefaultQuery(),
      rules: {
        id: [{ pattern: /^[0-9]*$/, message: '只能输入数字', trigger: 'blur' }]
      }
    };
  },

  created() {
    this.fetchList();
  },
  computed: {
    currentUserTypeLabel() {
      return this.resolveUserTypeLabel(this.appliedUserType);
    }
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
    handleEditTags() {
      // TODO: 打开“编辑标签”弹窗
      console.log('edit tags');
    },
    handleSearch() {
      this.query.pageNum = 1;
      this.$refs.queryForm.validate((valid) => {
        if (valid) {
          this.fetchList();
        }
      });
    },
    handleReset() {
      this.query = createDefaultQuery();
      this.fetchList();
    },
    buildQueryParams() {
      const queryParams = {
        ...this.query,
        params: {}
      };

      if (queryParams.registerRange && queryParams.registerRange.length === 2) {
        queryParams.params.beginTime = queryParams.registerRange[0] + ' 00:00:00';
        queryParams.params.endTime = queryParams.registerRange[1] + ' 23:59:59';
      }

      if (
        queryParams.depositMin !== '' &&
        queryParams.depositMin !== null &&
        queryParams.depositMin !== undefined
      ) {
        queryParams.params.depositMin = queryParams.depositMin;
      }
      if (
        queryParams.depositMax !== '' &&
        queryParams.depositMax !== null &&
        queryParams.depositMax !== undefined
      ) {
        queryParams.params.depositMax = queryParams.depositMax;
      }
      if (
        queryParams.registerDepositMin !== '' &&
        queryParams.registerDepositMin !== null &&
        queryParams.registerDepositMin !== undefined
      ) {
        queryParams.params.registerDepositMin = queryParams.registerDepositMin;
      }
      if (
        queryParams.registerDepositMax !== '' &&
        queryParams.registerDepositMax !== null &&
        queryParams.registerDepositMax !== undefined
      ) {
        queryParams.params.registerDepositMax = queryParams.registerDepositMax;
      }

      delete queryParams.registerRange;
      delete queryParams.statRange;
      return queryParams;
    },
    handlePageChange(page) {
      this.query.pageNum = page;
      this.fetchList();
    },
    goDetail(row) {
      console.log('会员详情', row);
    },
    goAgentDeposit(row) {
      // if (row.isAgent == 1 && row.agentCode) {
      //   const url = `https://wangcaisports.com/auth/register-plus?agentCode=${row.agentCode}`;
      //   window.open(url, '_blank'); // 新窗口打开
      // } else {
      //   this.$message.warning('该用户不是代理或缺少代理编码');
      // }
    },

    goBonus(row) {
      console.log('发放红利', row);
    },
    handleEdit(row) {
      console.log('编辑', row);
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
    handleExport() {
      const params = this.buildQueryParams();
      this.download('/agentmember/user/export', params, `会员管理_${new Date().getTime()}.xlsx`);
    },
    normalizeUserType(value) {
      if (value === 0 || value === '0') return 0;
      if (value === 1 || value === '1') return 1;
      return '';
    },
    resolveUserTypeLabel(value) {
      const normalized = this.normalizeUserType(value);
      if (normalized === 0) return '会员';
      if (normalized === 1) return '代理';
      return '全部';
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      const summaryConfig = {
        amountUsdInSum: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        firstDepositAmount: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        amountCnyInSum: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        registerDepositAmount: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        amountCnyOutSum: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        balanceCnySum: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        winLoseCnySum: (value) => this.$formatters.formatMoneyCNY(null, null, value),
        amountValidCnySum: (value) => this.$formatters.formatMoneyCNY(null, null, value)
      };
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总计';
          return;
        }
        const formatter = summaryConfig[column.property];
        if (!formatter) {
          sums[index] = '-';
          return;
        }
        const total = data.reduce((sum, row) => {
          const num = Number(row[column.property]);
          return sum + (Number.isNaN(num) ? 0 : num);
        }, 0);
        sums[index] = formatter(total);
      });
      return sums;
    },
    async fetchList() {
      this.loading = true;
      try {
        const params = this.buildQueryParams();
        const response = await listUser(params);
        this.list = response.rows || [];
        this.total = Number(response.total || 0);
        this.appliedUserType = this.normalizeUserType(params.userType);
      } finally {
        this.loading = false;
      }
    },
    formatStatus(row, column, cellValue) {
      if (cellValue === 1) return '正常';
      if (cellValue === 2) return '禁用';
      return '-';
    },
    formatUserType(row, column, cellValue) {
      const normalizedUserType = Number(cellValue);
      const normalizedIsAgent = Number(row && row.isAgent);
      if (normalizedUserType === 1 || normalizedIsAgent === 1) return '代理';
      if (normalizedUserType === 0 || normalizedIsAgent === 0) return '会员';
      return '-';
    }
  }
};
</script>

<style scoped>
.member-page {
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

/* 顶部 tags */
.top-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  background: #fff;
  cursor: pointer;
  color: #303133;
  font-size: 13px;
}
.tag-item.active {
  border-color: #409eff;
  color: #409eff;
}
.count {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #f2f6fc;
  color: #606266;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.edit-tag {
  margin-left: 8px;
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* 卡片 */
.card {
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

/* 查询表单 */
.query-form {
  padding: 8px 6px 6px;
}
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 18px;
  padding: 5px;
}
.row2 {
  margin-top: 8px;
}
.fi {
  margin-bottom: 0 !important;
}
.w-260 {
  width: 260px;
}
.w-320 {
  width: 320px;
}
.w-360 {
  width: 360px;
}
.w-420 {
  width: 420px;
}

.money-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
}
.prefix {
  width: 22px;
  color: #606266;
}
.money-input {
  width: 140px;
}

.btns {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

/* 表格 */
.table {
  margin-top: 10px;
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

/* 底部 */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 0;
}
.tip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
}
</style>
