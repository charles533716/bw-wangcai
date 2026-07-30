<template>
  <div class="app-container commission-page">
    <div class="page-head">
      <div><h2>负盈利代理佣金结算</h2><p>按站点结算周期核对团队账单快照；等级 0 账单只结转经营数据，不进入佣金公式。</p></div>
      <div><el-button size="small" type="warning" plain @click="exportData">导出</el-button><el-button size="small" disabled>下载文件</el-button></div>
    </div>

    <el-form :inline="true" :model="filters" class="filter-panel">
      <el-form-item label="站点"><el-select v-model="filters.site" clearable placeholder="全部站点"><el-option v-for="item in sites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="佣金周期"><el-select v-model="filters.period" clearable placeholder="全部周期"><el-option v-for="item in periods" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="代理身份"><el-select v-model="filters.identity" clearable placeholder="全部身份"><el-option label="普通代理" value="普通代理" /><el-option label="官方代理" value="官方代理" /></el-select></el-form-item>
      <el-form-item label="佣金状态"><el-select v-model="filters.status" clearable placeholder="全部状态"><el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="审核状态"><el-select v-model="filters.audit" clearable placeholder="全部状态"><el-option label="待审核" value="待审核" /><el-option label="已审核" value="已审核" /></el-select></el-form-item>
      <el-form-item label="字段筛选"><el-button plain>已选 26 项</el-button></el-form-item>
      <el-form-item label="代理/团队"><el-input v-model.trim="filters.keyword" clearable placeholder="团队编号、名称、代理ID或账号" /></el-form-item>
      <el-form-item><el-button type="primary" @click="query">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
    </el-form>

    <div class="table-shell">
      <el-table :data="pagedRows" border stripe show-summary :summary-method="summaryMethod">
        <el-table-column type="expand" width="42"><template slot-scope="{ row }"><div class="row-detail">账单快照：{{ row.period }}；调整原因：{{ row.reason || '—' }}</div></template></el-table-column>
        <el-table-column type="index" label="序号" width="58" fixed="left" :index="tableIndex" />
        <el-table-column prop="site" label="站点" width="105" fixed="left" />
        <el-table-column prop="agentName" label="代理名称" width="130" fixed="left" show-overflow-tooltip />
        <el-table-column prop="period" label="佣金周期" width="190" show-overflow-tooltip />
        <el-table-column prop="teamName" label="团队名称" width="170" show-overflow-tooltip />
        <el-table-column prop="agentId" label="代理编号" width="90" />
        <el-table-column prop="identity" label="代理身份" width="100" />
        <el-table-column prop="parentAgent" label="上级代理" width="100" />
        <el-table-column label="总输赢" width="110" align="right"><template slot-scope="{ row }">{{ money(row.totalWin) }}</template></el-table-column>
        <el-table-column label="历史总输赢" width="115" align="right"><template slot-scope="{ row }">{{ money(row.historyWin) }}</template></el-table-column>
        <el-table-column label="运营费用" width="110" align="right"><template slot-scope="{ row }"><span class="link-value">{{ money(row.operationFee) }}</span></template></el-table-column>
        <el-table-column label="历史运营费用" width="125" align="right"><template slot-scope="{ row }"><span class="link-value">{{ money(row.historyOperationFee) }}</span></template></el-table-column>
        <el-table-column label="三方场馆费用" width="125" align="right"><template slot-scope="{ row }"><span class="link-value">{{ money(row.venueFee) }}</span></template></el-table-column>
        <el-table-column label="充提手续费" width="115" align="right"><template slot-scope="{ row }"><span class="link-value">{{ money(row.withdrawFee) }}</span></template></el-table-column>
        <el-table-column prop="rebateLevel" label="返佣等级" width="115" />
        <el-table-column label="返佣比例" width="90" align="right"><template slot-scope="{ row }">{{ row.rebateRate.toFixed(2) }} %</template></el-table-column>
        <el-table-column label="历史结余佣金" width="125" align="right"><template slot-scope="{ row }">{{ money(row.historyBalance) }}</template></el-table-column>
        <el-table-column label="佣金净收益" width="115" align="right"><template slot-scope="{ row }">{{ money(row.commissionNet) }}</template></el-table-column>
        <el-table-column label="欠站点总额" width="110" align="right"><template slot-scope="{ row }">{{ money(row.siteDebt) }}</template></el-table-column>
        <el-table-column label="佣金调整" width="100" align="right"><template slot-scope="{ row }">{{ money(row.adjustment) }}</template></el-table-column>
        <el-table-column label="佣金" width="105" align="right"><template slot-scope="{ row }">{{ money(row.commission) }}</template></el-table-column>
        <el-table-column label="佣金状态" width="120"><template slot-scope="{ row }"><el-tag size="mini" :type="statusType(row.status)">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column prop="agentTime" label="成为代理时间" width="165" />
        <el-table-column prop="teamTime" label="加入团队时间" width="165" />
        <el-table-column prop="issuer" label="发放人" width="95" />
        <el-table-column prop="issueTime" label="发放时间" width="165" />
        <el-table-column prop="reason" label="调整原因" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="190" fixed="right">
          <template slot-scope="{ row }">
            <template v-if="row.status === '待发放'">
              <el-button type="text" @click="openAction('confirm', row)">确认</el-button>
              <el-button type="text" @click="openAction('skip', row)">不发放</el-button>
              <el-button type="text" @click="openAction('modify', row)">修改发放</el-button>
            </template>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pager"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[10, 20, 50]" :page-size.sync="pager.size" :current-page.sync="pager.page" /></div>

    <div class="formula-panel">
      <h3>负盈利代理佣金结算口径</h3>
      <div v-for="item in formulaRows" :key="item[0]" class="formula-row"><strong>{{ item[0] }}</strong><span>{{ item[1] }}</span></div>
      <p>本页用于账单核对与最终处理；未达等级且总输赢为正时，仅结转经营数据，不进入佣金公式。</p>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialog.open" width="470px" append-to-body>
      <div v-if="dialog.row" class="action-dialog">
        <p><span>团队</span>{{ dialog.row.teamName }}</p>
        <p><span>应发佣金</span>{{ money(dialog.row.commission || Math.max(0, dialog.row.commissionNet)) }}</p>
        <el-form v-if="dialog.type === 'modify'" label-width="108px"><el-form-item label="最终发放金额" required><el-input-number v-model="dialog.amount" :min="0" :precision="2" controls-position="right" /></el-form-item></el-form>
        <el-form v-if="dialog.type !== 'confirm'" label-width="108px"><el-form-item label="原因" required><el-input v-model="dialog.reason" type="textarea" maxlength="500" show-word-limit :rows="3" /></el-form-item></el-form>
      </div>
      <span slot="footer"><el-button @click="dialog.open = false">取消</el-button><el-button type="primary" @click="submitAction">确认</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { buildSettlementRows, formulaRows, money, nowText, periods, sites } from '@/utils/negativeCommission'

export default {
  name: 'AgentNegativeProfitSettlement',
  data() {
    return {
      allRows: buildSettlementRows(),
      sites,
      periods,
      formulaRows,
      statusOptions: ['欠款待回收', '历史数据结转', '待发放', '欠款已回收', '已发放', '不发放已结转'],
      filters: { site: '', period: '', identity: '', status: '', audit: '', keyword: '' },
      applied: { site: '', period: '', identity: '', status: '', audit: '', keyword: '' },
      pager: { page: 1, size: 10 },
      dialog: { open: false, type: '', row: null, reason: '', amount: 0 }
    }
  },
  computed: {
    filteredRows() {
      const f = this.applied
      return this.allRows.filter(row =>
        (!f.site || row.site === f.site) &&
        (!f.period || row.period.includes(f.period)) &&
        (!f.identity || row.identity === f.identity) &&
        (!f.status || row.status === f.status) &&
        (!f.keyword || `${row.agentName}${row.teamName}${row.agentId}`.toLowerCase().includes(f.keyword.toLowerCase()))
      )
    },
    pagedRows() {
      const start = (this.pager.page - 1) * this.pager.size
      return this.filteredRows.slice(start, start + this.pager.size)
    },
    dialogTitle() {
      return { confirm: '正常发放', skip: '不发放并结转', modify: '修改发放' }[this.dialog.type] || ''
    }
  },
  methods: {
    money,
    tableIndex(index) { return (this.pager.page - 1) * this.pager.size + index + 1 },
    query() { this.applied = { ...this.filters }; this.pager.page = 1 },
    reset() { this.filters = { site: '', period: '', identity: '', status: '', audit: '', keyword: '' }; this.query() },
    exportData() { this.$message.success('负盈利代理佣金结算数据已导出') },
    statusType(status) { return { '待发放': 'warning', '欠款待回收': 'danger', '欠款已回收': 'success', '已发放': 'success', '不发放已结转': 'info' }[status] || 'info' },
    openAction(type, row) {
      this.dialog = { open: true, type, row, reason: '', amount: Number((row.commission || Math.max(0, row.commissionNet)).toFixed(2)) }
    },
    submitAction() {
      if (this.dialog.type !== 'confirm' && !this.dialog.reason.trim()) return this.$message.warning('请填写原因')
      const row = this.dialog.row
      if (this.dialog.type === 'skip') row.status = '不发放已结转'
      else {
        row.status = '已发放'
        if (this.dialog.type === 'modify') {
          row.adjustment = Number((this.dialog.amount - row.commission).toFixed(2))
          row.commission = this.dialog.amount
        }
      }
      row.reason = this.dialog.reason || '正常发放'
      row.issuer = 'admin'
      row.issueTime = nowText()
      this.dialog.open = false
      this.$message.success(this.dialog.type === 'skip' ? '已设置不发放并结转' : '佣金发放处理成功')
    },
    summaryMethod({ columns }) {
      return columns.map((column, index) => index === 1 ? '当前页合计' : ['totalWin', 'historyWin', 'operationFee', 'historyOperationFee', 'venueFee', 'withdrawFee', 'historyBalance', 'commissionNet', 'siteDebt', 'adjustment', 'commission'].includes(column.property) ? '' : '—')
    }
  }
}
</script>

<style lang="scss" scoped>
.commission-page { background: #f4f7fb; min-height: calc(100vh - 84px); }
.page-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
h2 { margin:0 0 7px; font-size:22px; color:#202c3c; } .page-head p { margin:0; color:#909399; }
.filter-panel { padding:14px 14px 2px; background:#fff; border:1px solid #e5eaf2; margin-bottom:14px; }
.filter-panel ::v-deep .el-select { width:145px; } .filter-panel ::v-deep .el-input { width:220px; }
.table-shell { background:#fff; overflow:hidden; } .link-value { color:#409eff; border-bottom:1px dashed #409eff; }
.row-detail { padding:8px 56px; color:#606266; }.pager { display:flex; justify-content:flex-end; padding:14px 0; }
.formula-panel { background:#20395f; color:#dce7f7; padding:0 18px 14px; }
.formula-panel h3 { margin:0 -18px 6px; padding:13px 18px; border-bottom:1px solid rgba(255,255,255,.16); font-size:16px; }
.formula-row { display:grid; grid-template-columns:130px 1fr; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.12); font-size:13px; }
.formula-panel p { color:#ffd56a; margin:12px 0 0; font-size:13px; }.action-dialog p { margin:18px 36px; }.action-dialog p span { display:inline-block; width:90px; color:#606266; }
</style>
