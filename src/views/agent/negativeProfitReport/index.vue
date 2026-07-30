<template>
  <div class="app-container report-page">
    <div class="head">
      <div><h2>负盈利代理佣金报表</h2><p>当前周期按最近完整自然日动态预估；已结算周期继续展示不可变账单快照。</p></div>
      <div><el-button size="small" type="warning" plain @click="$message.success('报表数据已导出')">导出</el-button><el-button size="small" disabled>下载文件</el-button></div>
    </div>
    <el-form :inline="true" class="filters">
      <el-form-item label="站点"><el-select v-model="filters.site" clearable placeholder="全部站点"><el-option v-for="item in sites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="佣金周期"><el-select v-model="filters.period" clearable placeholder="全部周期"><el-option v-for="item in periods" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="统计开始日期"><el-date-picker v-model="filters.startDate" type="date" placeholder="开始日期" /></el-form-item>
      <el-form-item label="统计结束日期"><el-date-picker v-model="filters.endDate" type="date" placeholder="结束日期" /></el-form-item>
      <el-form-item label="代理身份"><el-select v-model="filters.identity" clearable placeholder="全部身份"><el-option label="普通代理" value="普通代理" /><el-option label="官方代理" value="官方代理" /></el-select></el-form-item>
      <el-form-item label="字段筛选"><el-button plain>已选 34 项</el-button></el-form-item>
      <el-form-item label="代理/团队"><el-input v-model="filters.keyword" placeholder="团队编号、名称、代理ID或账号" /></el-form-item>
      <el-form-item><el-button type="primary" @click="query">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
    </el-form>
    <div class="table-wrap">
      <el-table :data="rows" border stripe show-summary :summary-method="summaryMethod">
        <el-table-column type="expand" width="40"><template slot-scope="{ row }"><div class="detail">账单快照：{{ row.period }}，统计区间：{{ row.periodRange }}</div></template></el-table-column>
        <el-table-column type="index" label="序号" width="58" fixed="left" />
        <el-table-column prop="site" label="站点" width="105" fixed="left" />
        <el-table-column prop="agentName" label="代理名称" width="125" fixed="left" />
        <el-table-column prop="period" label="佣金周期" width="180" show-overflow-tooltip />
        <el-table-column label="统计时间" width="170"><template slot-scope="{ row }">{{ row.periodRange }}<br><el-tag size="mini" type="success">已结算</el-tag></template></el-table-column>
        <el-table-column prop="teamName" label="团队名称" width="165" show-overflow-tooltip />
        <el-table-column prop="agentId" label="代理编号" width="85" />
        <el-table-column prop="agentType" label="代理类型" width="100" />
        <el-table-column prop="recommender" label="推荐人" width="85" />
        <el-table-column prop="identity" label="代理身份" width="95" />
        <el-table-column prop="level" label="代理层级" width="85" />
        <el-table-column prop="parentAgent" label="上级账号" width="95" />
        <el-table-column prop="teamCount" label="团队人数" width="85" align="right" />
        <el-table-column prop="memberCount" label="下级会员" width="85" align="right" />
        <el-table-column prop="registerCount" label="注册人数" width="85" align="right" />
        <el-table-column prop="firstDepositCount" label="首存人数" width="85" align="right" />
        <el-table-column prop="activeCount" label="活跃人数" width="85" align="right" />
        <el-table-column prop="newActiveCount" label="新增活跃人数" width="105" align="right" />
        <el-table-column label="存款金额" width="105" align="right"><template slot-scope="{ row }">{{ money(row.depositAmount) }}</template></el-table-column>
        <el-table-column label="提款金额" width="105" align="right"><template slot-scope="{ row }">{{ money(row.withdrawAmount) }}</template></el-table-column>
        <el-table-column label="总输赢" width="105" align="right"><template slot-scope="{ row }">{{ money(row.totalWin) }}</template></el-table-column>
        <el-table-column label="历史总输赢" width="115" align="right"><template slot-scope="{ row }">{{ money(row.historyWin) }}</template></el-table-column>
        <el-table-column label="运营费用" width="105" align="right"><template slot-scope="{ row }"><span class="link">{{ money(row.operationFee) }}</span></template></el-table-column>
        <el-table-column label="历史运营费用" width="120" align="right"><template slot-scope="{ row }"><span class="link">{{ money(row.historyOperationFee) }}</span></template></el-table-column>
        <el-table-column label="三方场馆费用" width="120" align="right"><template slot-scope="{ row }"><span class="link">{{ money(row.venueFee) }}</span></template></el-table-column>
        <el-table-column label="充提手续费" width="110" align="right"><template slot-scope="{ row }"><span class="link">{{ money(row.withdrawFee) }}</span></template></el-table-column>
        <el-table-column prop="rebateLevel" label="返佣等级" width="110" />
        <el-table-column label="返佣比例" width="90"><template slot-scope="{ row }">{{ row.rebateRate.toFixed(2) }} %</template></el-table-column>
        <el-table-column label="历史结余佣金" width="120" align="right"><template slot-scope="{ row }">{{ money(row.historyBalance) }}</template></el-table-column>
        <el-table-column label="净输赢" width="105" align="right"><template slot-scope="{ row }">{{ money(row.totalWin + row.historyWin - row.operationFee - row.historyOperationFee - row.venueFee - row.withdrawFee) }}</template></el-table-column>
        <el-table-column label="佣金净收益" width="110" align="right"><template slot-scope="{ row }">{{ money(row.commissionNet) }}</template></el-table-column>
        <el-table-column label="欠站点总额" width="110" align="right"><template slot-scope="{ row }">{{ money(row.siteDebt) }}</template></el-table-column>
        <el-table-column label="佣金" width="100" align="right"><template slot-scope="{ row }">{{ money(row.commission) }}</template></el-table-column>
        <el-table-column prop="agentTime" label="成为代理时间" width="165" />
        <el-table-column prop="teamTime" label="加入团队时间" width="165" />
      </el-table>
    </div>
    <div class="pager"><el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="rows.length" :page-sizes="[10,20,50]" :page-size="10" /></div>
    <div class="formula">
      <h3>负盈利代理佣金报表口径</h3>
      <div v-for="item in formulaRows" :key="item[0]"><strong>{{ item[0] }}</strong><span>{{ item[1] }}</span></div>
      <p>统计日期按周期区间重叠筛选；推荐数据只读展示，不参与团队人数、等级、佣金和总计。</p>
    </div>
  </div>
</template>

<script>
import { buildReportRows, formulaRows, money, periods, sites } from '@/utils/negativeCommission'
export default {
  name: 'AgentNegativeProfitReport',
  data() {
    return { rows: buildReportRows(), sites, periods, formulaRows, filters: { site: '', period: '', startDate: '', endDate: '', identity: '', keyword: '' } }
  },
  methods: {
    money,
    query() { this.$message.success('已按筛选条件更新报表') },
    reset() { this.filters = { site: '', period: '', startDate: '', endDate: '', identity: '', keyword: '' } },
    summaryMethod({ columns }) { return columns.map((column, index) => index === 1 ? '完整筛选合计' : '—') }
  }
}
</script>

<style lang="scss" scoped>
.report-page{background:#f4f7fb;min-height:calc(100vh - 84px)}.head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px}.head h2{margin:0 0 7px;font-size:22px}.head p{margin:0;color:#909399}.filters{padding:14px 14px 2px;background:#fff;border:1px solid #e4e9f1;margin-bottom:14px}.filters ::v-deep .el-select{width:145px}.filters ::v-deep .el-date-editor{width:155px}.filters ::v-deep .el-input{width:220px}.table-wrap{background:#fff;overflow:hidden}.detail{padding:8px 55px}.link{color:#409eff;border-bottom:1px dashed #409eff}.pager{display:flex;justify-content:flex-end;padding:14px 0}.formula{background:#20395f;color:#dce7f7;padding:0 18px 14px}.formula h3{margin:0 -18px 6px;padding:13px 18px;border-bottom:1px solid rgba(255,255,255,.16);font-size:16px}.formula div{display:grid;grid-template-columns:130px 1fr;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.12);font-size:13px}.formula p{color:#ffd56a;margin:12px 0 0;font-size:13px}
</style>
