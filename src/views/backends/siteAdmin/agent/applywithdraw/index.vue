<!-- 提款申请 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="this.$store.getters.device === 'mobile'" class="default-theme">
        <pane>
          <div class="withdraw-page">
          <!-- 标题 -->
          <div class="page-title">
            <span class="title-text">提款申请</span>
          </div>

          <!-- 顶部卡片：可用佣金 -->
          <div class="top-card">
            <div class="icon-box">
              <i class="el-icon-picture-outline"></i>
            </div>
            <div class="info">
              <div class="k">可用佣金</div>
              <div class="v">{{ $formatters.formatMoneyCNY(null, null, commissionAmount) }}</div>
            </div>
          </div>

          <!-- 添加虚拟币账户按钮 -->
          <!-- <div class="actions">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddAccount">
              添加虚拟币账户
            </el-button>
          </div> -->
          <el-card shadow="never" class="card">
            <!-- 表格 -->
            <el-table
              v-loading="loading"
              :data="list"
              border
              class="table"
              :header-cell-style="headerStyle"
            >
              <el-table-column label="序号" type="index" width="80" align="center" />
              <el-table-column label="货币种类" prop="coin" min-width="140" align="center" />
              <el-table-column label="网络协议" prop="chainId" min-width="160" align="center" />
              <el-table-column label="提币地址" prop="to" min-width="220" align="center" />
              <el-table-column
                label="提币金额(USDT)"
                prop="amount"
                min-width="160"
                align="center"
                :formatter="$formatters.formatMoney"
              />
              <el-table-column
                label="预计手续费"
                prop="feeAmount"
                min-width="170"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="预计到账"
                prop="actualAmount"
                min-width="170"
                align="center"
                :formatter="$formatters.formatMoneyCNY"
              />
              <el-table-column
                label="状态"
                prop="status"
                min-width="140"
                align="center"
                :formatter="formatStatus"
              />
              <!-- <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button type="text" class="danger" @click="handleDelete(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column> -->

              <!-- 空状态（符合截图：中间大图标+暂无数据） -->
              <template slot="empty">
                <div class="empty-wrap">
                  <i class="el-icon-document"></i>
                  <div class="empty-text">暂无数据</div>
                </div>
              </template>
            </el-table>
            <div class="footer">
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
            </div>
          </el-card>
          <!-- 下方表单（左侧） -->
          <div class="bottom-layout">
            <div class="form-wrap">
              <el-form
                ref="form"
                :model="form"
                :rules="rules"
                label-width="110px"
                class="withdraw-form"
              >
                <el-form-item label="提币地址" prop="to">
                  <el-input v-model="form.to" placeholder="请输入提币地址" class="w-260" />
                </el-form-item>

                <el-form-item label="网络协议" class="fi w-360">
                  <el-radio-group v-model="form.chainId">
                    <el-radio label="TRC20">TRC20</el-radio>
                    <el-radio label="ERC20">ERC20</el-radio>
                    <el-radio label="BEP20">BEP20</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="提币金额" prop="amount">
                  <div class="amount-input-wrapper">
                    <img
                      class="currency-icon"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHCSURBVHgB7ZdfasJAEMZnN0EsvngEjxB9KG0SMJ6g3qBeoTfpDWpP0PQETZHgo+kRegMfJP5ttjNEwYJ2doMRW/IDUcmEfDvzzewGoOKPIY5dGI3GgZTwBmU8VKjAdd33Q9ckXBiVII5KEIeAghzrQqUg8v3bHhSkKhnHxQmyoWQmk0lzNls4liXulPp69jwvgXML2ho+EAK6aTp3pBRNhW4XQoTcvScXhCJISEC/UQOYNnIhD1EZbFt2oQS0MrTvA1y3k6aLAAzAck2pXMul+ORi2XzmflAvGNoETXIBEGUZRI1GPex0OqyQHZoeMhFDk9o9/6SmLEAJaHfZzgeUgfW6/mrbCwfL8uuJMo5jjLHQ/KqP91N8/9hJUVvQZlNParW07fs/Bxp662A8PrQVx+MnEkGlVnnvQ25XBRysoF6vTaVJQJ8WfgZFDxLGg3F/Cit+wcawy6AZNJ8v75XKAvwbmLY/xif4HVoWJJx/CDZDNBAxI4+6JSARUsohQBauVlcf25JrU8LmKjATNw9QEOM5lJdB0a49hBJgMySlNcVzTERbAb5xRp6X+2Br7gGcGFaQ511TyxfeCkypztQV/45v1Qyz+CdIsKgAAAAASUVORK5CYII="
                    />
                    <el-input-number
                      v-model="form.amount"
                      :min="0"
                      :precision="2"
                      class="w-260 with-prefix"
                    />
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" class="submit-btn" @click="handleSubmit"
                    >提款申请</el-button
                  >
                </el-form-item>
              </el-form>
            </div>

            <!-- 右侧空白区（保持截图的大留白效果） -->
            <div class="right-blank"></div>
          </div>
          </div>
        </pane>
      </splitpanes>
    </el-row>
  </div>
</template>

<script>
import { addRecord, listIncome, getCommissionAmount } from '@/api/applywithdraw/index';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

export default {
  name: 'WithdrawApply',
  components: { Splitpanes, Pane },
  data() {
    return {
      loading: false,
      // 表格数据（截图是空）
      list: [],
      total: 50,
      commissionAmount: 0.0,
      query: {
        pageNum: 1,
        pageSize: 5
      },
      form: {
        chainId: 'TRC20',
        to: '',
        amount: ''
      },
      rules: {
        to: [{ required: true, message: '请输入提币地址', trigger: 'blur' }],
        chainId: [{ required: true, message: '请选择虚拟币协议', trigger: 'change' }],
        amount: [
          { required: true, message: '请输入提币金额', trigger: 'change' },
          { type: 'number', min: 0.01, message: '提币金额必须大于 0', trigger: 'change' }
        ]
      }
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
    handleAddAccount() {
      // TODO: 打开新增虚拟币账户弹窗
      console.log('add account');
    },
    handleEdit(row) {
      console.log('edit', row);
    },
    handleDelete(row) {
      console.log('delete', row);
    },
    handlePageChange(page) {
      this.query.pageNum = page;
      this.fetchList();
    },
    async fetchList() {
      this.loading = true;
      try {
        listIncome(this.query).then((response) => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        });
        const response = await getCommissionAmount();
        this.commissionAmount = response.data || 0;
      } finally {
      }
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        addRecord(this.form).then((response) => {
          this.$modal.msgSuccess('提款申请成功');
          this.fetchList();
        });
      });
    },
    formatStatus(row, column, cellValue) {
      if (cellValue === 4) return '提现审核中';
      return '-';
    }
  }
};
</script>

<style scoped>
.withdraw-page {
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

/* 顶部卡片 */
.top-card {
  width: 320px;
  border: 1px solid #eef0f3;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  margin-bottom: 12px;
}
.icon-box {
  width: 38px;
  height: 38px;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
}
.info .k {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}
.info .v {
  font-size: 18px;
  font-weight: 800;
  color: #111;
}

/* 添加账户按钮 */
.actions {
  margin: 8px 0 10px;
}

/* 表格 */
.table {
  margin-top: 6px;
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

/* 下半部分布局：左表单 + 右留白 */
.bottom-layout {
  display: flex;
  gap: 20px;
  margin-top: 18px;
}
.form-wrap {
  width: 420px;
}
.right-blank {
  flex: 1;
}

/* 表单 */
.withdraw-form ::v-deep .el-form-item__label {
  color: #303133;
  font-size: 13px;
}
.w-260 {
  width: 260px;
}

.question-text {
  font-size: 13px;
  color: #111;
}

.eye {
  cursor: pointer;
  color: #909399;
  margin-right: 6px;
}
.eye:hover {
  color: #606266;
}

.submit-btn {
  width: 120px;
}

/* 操作列 danger */
.danger {
  color: #f56c6c;
}
/* 底部 */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 0;
}
.pager {
  display: flex;
  justify-content: flex-end;
}

.amount-input-wrapper {
  position: relative;
  display: inline-block;
}

.currency-icon {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  z-index: 2;
  pointer-events: none;
}

.with-prefix .el-input__inner {
  padding-left: 34px; /* 给图标留空间 */
}
</style>
