<template>
  <div class="app-container relation-page">
    <div class="head"><div><h2>修改代理关系记录</h2><p>查看和筛查全站以及关联子站点下，会员和代理的上级代理关系人工维护历史记录。</p></div><el-button @click="refresh">刷新数据</el-button></div>
    <div class="filter-card">
      <h3><i class="el-icon-document"></i> 全局筛选条件</h3>
      <el-form :model="filters" label-position="top" class="filter-grid">
        <el-form-item label="所属站点"><el-select v-model="filters.site" clearable placeholder="全部站点"><el-option v-for="item in sites" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="目标账号 / 记录编号"><el-input v-model="filters.keyword" placeholder="搜索账号 / ID / 备注..." /></el-form-item>
        <el-form-item label="账号类型"><el-select v-model="filters.type" clearable placeholder="全部类型"><el-option label="会员" value="会员" /><el-option label="代理" value="代理" /></el-select></el-form-item>
        <el-form-item label="操作人"><el-input v-model="filters.operator" placeholder="搜索操作人账号..." /></el-form-item>
        <el-form-item label="迁移本期未结算费用"><el-select v-model="filters.migrateFee" clearable placeholder="全部"><el-option label="是" value="是" /><el-option label="否" value="否" /></el-select></el-form-item>
        <el-form-item label="变更状态"><el-select v-model="filters.changeStatus" clearable placeholder="全部状态"><el-option label="已生效" value="已生效" /><el-option label="已取消" value="已取消" /></el-select></el-form-item>
        <el-form-item label="迁移状态"><el-select v-model="filters.migrateStatus" clearable placeholder="全部状态"><el-option label="已完成" value="已完成" /><el-option label="无需迁移" value="无需迁移" /></el-select></el-form-item>
        <el-form-item label="操作日期"><el-date-picker v-model="filters.operationRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /></el-form-item>
        <el-form-item label="新代理生效日（接口匹配）"><el-date-picker v-model="filters.effectiveRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="至" /></el-form-item>
        <el-form-item class="actions"><el-button @click="reset">重置条件</el-button><el-button type="primary" @click="query">查询</el-button></el-form-item>
      </el-form>
      <p class="helper">请选择并填写上方筛选条件，点击查询按钮进行结果筛查。</p>
    </div>
    <div class="data-card">
      <div class="data-title"><div><h3>变更明细</h3><p>支持按站点、账号类型、操作人及时间筛选</p></div><el-tag effect="plain">共计：{{ filteredRows.length }} 条记录</el-tag></div>
      <div class="table-wrap">
        <el-table :data="pagedRows" border stripe>
          <el-table-column type="index" label="序号" width="56" fixed="left" :index="tableIndex" />
          <el-table-column label="账号" width="130" fixed="left"><template slot-scope="{ row }"><strong>{{ row.account }}</strong><small>ID: {{ row.accountId }}</small></template></el-table-column>
          <el-table-column label="所属站点" width="130"><template slot-scope="{ row }"><strong>{{ row.site }}</strong><small>ID: {{ row.siteId }}</small></template></el-table-column>
          <el-table-column label="账号类型" width="90"><template slot-scope="{ row }"><el-tag size="mini" effect="plain">{{ row.accountType }}</el-tag></template></el-table-column>
          <el-table-column label="原上级" width="110"><template slot-scope="{ row }"><strong>{{ row.oldParentId }}</strong><small>{{ row.oldParent }}</small></template></el-table-column>
          <el-table-column label="新上级" width="110"><template slot-scope="{ row }"><strong>{{ row.newParentId }}</strong><small>{{ row.newParent }}</small></template></el-table-column>
          <el-table-column label="新代理生效日" width="125"><template slot-scope="{ row }"><el-tag type="warning" size="mini">{{ row.effectiveDate }}</el-tag></template></el-table-column>
          <el-table-column label="变更状态" width="95"><template slot-scope="{ row }"><el-tag :type="row.changeStatus === '已生效' ? 'success' : 'info'" size="mini">{{ row.changeStatus }}</el-tag></template></el-table-column>
          <el-table-column label="是否迁移本期未结算费用" width="150"><template slot-scope="{ row }"><el-tag :type="row.migrateFee === '是' ? 'success' : 'info'" size="mini">{{ row.migrateFee }}</el-tag></template></el-table-column>
          <el-table-column label="迁移状态" width="105"><template slot-scope="{ row }"><el-tag :type="row.migrateStatus === '已完成' ? 'success' : 'info'" size="mini">{{ row.migrateStatus }}</el-tag></template></el-table-column>
          <el-table-column prop="retryCount" label="重试次数" width="85" />
          <el-table-column prop="completeTime" label="完成时间" width="165" />
          <el-table-column prop="error" label="错误详情" width="150" />
          <el-table-column prop="operator" label="操作人" width="130" />
          <el-table-column prop="operationTime" label="操作时间" width="165" />
          <el-table-column prop="remark" label="备注" width="210" show-overflow-tooltip />
          <el-table-column label="操作" width="80"><template>—</template></el-table-column>
        </el-table>
      </div>
      <div class="pager"><span>共 {{ filteredRows.length }} 条</span><el-pagination background layout="sizes, prev, pager, next, jumper" :total="filteredRows.length" :page-sizes="[10,20,50]" :page-size.sync="pager.size" :current-page.sync="pager.page" /></div>
    </div>
  </div>
</template>

<script>
import { buildRelationRows, sites } from '@/utils/negativeCommission'
const emptyFilters = () => ({ site: '', keyword: '', type: '', operator: '', migrateFee: '', changeStatus: '', migrateStatus: '', operationRange: [], effectiveRange: [] })
export default {
  name: 'AgentRelationChangeRecord',
  data() { return { sites, allRows: buildRelationRows(), filters: emptyFilters(), applied: emptyFilters(), pager: { page: 1, size: 10 } } },
  computed: {
    filteredRows() {
      const f = this.applied
      return this.allRows.filter(row => (!f.site || row.site === f.site) && (!f.type || row.accountType === f.type) && (!f.operator || row.operator.includes(f.operator)) && (!f.migrateFee || row.migrateFee === f.migrateFee) && (!f.changeStatus || row.changeStatus === f.changeStatus) && (!f.migrateStatus || row.migrateStatus === f.migrateStatus) && (!f.keyword || `${row.account}${row.accountId}${row.remark}`.toLowerCase().includes(f.keyword.toLowerCase())))
    },
    pagedRows() { const start = (this.pager.page - 1) * this.pager.size; return this.filteredRows.slice(start, start + this.pager.size) }
  },
  methods: {
    tableIndex(index) { return (this.pager.page - 1) * this.pager.size + index + 1 },
    query() { this.applied = { ...this.filters }; this.pager.page = 1 },
    reset() { this.filters = emptyFilters(); this.query() },
    refresh() { this.allRows = buildRelationRows(); this.$message.success('数据已刷新') }
  }
}
</script>

<style lang="scss" scoped>
.relation-page{background:#f3f6fb;min-height:calc(100vh - 84px)}.head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}.head h2{margin:0 0 7px;font-size:23px}.head p{margin:0;color:#909399}.filter-card,.data-card{background:#fff;border:1px solid #e4e9f1;margin-bottom:16px}.filter-card{padding:14px 16px 10px}.filter-card h3{margin:0 0 10px;font-size:15px}.filter-card h3 i{color:#409eff}.filter-grid{display:grid;grid-template-columns:repeat(5,minmax(180px,1fr));gap:0 12px}.filter-grid ::v-deep .el-form-item{margin-bottom:8px}.filter-grid ::v-deep .el-form-item__label{padding:0;line-height:24px}.filter-grid ::v-deep .el-select,.filter-grid ::v-deep .el-date-editor{width:100%}.actions{display:flex;align-items:flex-end}.actions ::v-deep .el-form-item__content{display:flex;align-items:flex-end;height:100%}.helper{margin:5px 0 0;color:#8aa0bf;font-size:12px}.data-title{display:flex;justify-content:space-between;align-items:center;padding:14px 16px}.data-title h3{margin:0 0 3px}.data-title p{margin:0;color:#909399;font-size:12px}.table-wrap{overflow:hidden}.el-table small{display:block;color:#9aabc3;margin-top:4px}.pager{display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:13px}
@media(max-width:1200px){.filter-grid{grid-template-columns:repeat(3,minmax(180px,1fr))}}
</style>
