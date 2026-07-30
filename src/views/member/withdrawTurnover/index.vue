<template>
  <div class="turnover-page app-container">
    <header class="page-heading">
      <h2>会员提现流水查询</h2>
      <p>查询会员近 3 个月充值额度、主钱包余额及当前与历史提现流水。</p>
    </header>

    <section class="filter-panel">
      <el-form :model="query" inline>
        <el-form-item label="站点">
          <el-select v-model="query.site" clearable placeholder="全部站点">
            <el-option label="全部站点" value="" />
            <el-option v-for="site in sites" :key="site" :label="site" :value="site" />
          </el-select>
        </el-form-item>
        <el-form-item label="代理账号"><el-input v-model.trim="query.agent" clearable placeholder="请输入直属代理账号" /></el-form-item>
        <el-form-item label="会员账号 / ID"><el-input v-model.trim="query.member" clearable placeholder="请输入会员账号或ID" /></el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button type="warning" plain icon="el-icon-download" @click="$message.success('提现流水数据已导出')">导出</el-button>
        </el-form-item>
      </el-form>
    </section>

    <div class="tip-bar"><i class="el-icon-info" /> 充值额度统计查询时刻往前滚动 3 个月的充值成功实际到账金额；总余额 = 可提现余额 + 锁定余额；充值/彩金提现流水为当前还需解锁流水。</div>

    <section class="table-card">
      <div class="table-title">
        <div><strong>会员提现流水统计</strong><span>共 {{ filteredRows.length }} 条</span></div>
        <right-toolbar :showSearch="false" @queryTable="handleQuery" />
      </div>
      <el-table :data="pagedRows" border :header-cell-style="headerStyle">
        <el-table-column label="站点" min-width="120" align="center">
          <template slot-scope="{ row }"><b>{{ row.site }}</b><small>{{ row.siteId }}</small></template>
        </el-table-column>
        <el-table-column prop="agent" label="代理" min-width="130" align="center" />
        <el-table-column label="会员账号 / ID" min-width="155" align="center">
          <template slot-scope="{ row }"><b>{{ row.member }}</b><small>ID：{{ row.memberId }}</small></template>
        </el-table-column>
        <el-table-column prop="currency" label="币种" width="80" align="center" />
        <el-table-column label="近3个月充值额度" min-width="155" align="right">
          <template slot-scope="{ row }">{{ money(row.depositAmount) }}</template>
        </el-table-column>
        <el-table-column label="总余额" min-width="130" align="right"><template slot-scope="{ row }">{{ money(row.totalBalance) }}</template></el-table-column>
        <el-table-column label="可提现余额" min-width="130" align="right">
          <template slot-scope="{ row }"><b class="available">{{ money(row.availableBalance) }}</b></template>
        </el-table-column>
        <el-table-column label="锁定余额" min-width="130" align="right"><template slot-scope="{ row }">{{ money(row.lockedBalance) }}</template></el-table-column>
        <el-table-column label="充值/彩金提现流水" min-width="190" align="right">
          <template slot-scope="{ row }">
            {{ money(row.turnover) }}
            <el-button type="text" size="mini" @click="openDetail(row)">查看明细</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <span>共 {{ filteredRows.length }} 条</span>
        <el-pagination background layout="sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50]" :page-size.sync="pageSize" :current-page.sync="pageNum" :total="filteredRows.length" />
      </div>
    </section>

    <el-dialog title="充值/彩金提现流水明细" :visible.sync="detailVisible" width="92%" top="4vh" append-to-body>
      <div class="member-meta">{{ selected.member }} · {{ selected.site }} · ID：{{ selected.memberId }}</div>
      <section class="detail-summary">
        <div><span>会员账号</span><strong>{{ selected.member }}</strong></div>
        <div><span>锁定余额</span><strong>{{ money(selected.lockedBalance) }}</strong></div>
        <div><span>充值/彩金提现流水</span><strong>{{ money(selected.turnover) }}</strong></div>
        <div><span>当前状态</span><el-tag size="mini" type="warning">{{ selected.lockedBalance > 0 ? '锁定中' : '已解锁' }}</el-tag></div>
      </section>
      <div class="detail-heading">
        <div><strong>提现流水列表</strong><span>展示全部历史任务</span></div>
        <el-button type="warning" plain size="mini" icon="el-icon-download" @click="$message.success('完整明细已导出')">导出完整明细</el-button>
      </div>
      <el-table :data="detailRows" border :header-cell-style="headerStyle">
        <el-table-column prop="startTime" label="开始时间" min-width="150" align="center" />
        <el-table-column prop="type" label="类型" min-width="100" align="center" />
        <el-table-column label="锁定额度（初始）" min-width="140" align="right"><template slot-scope="{ row }">{{ money(row.initial) }}</template></el-table-column>
        <el-table-column label="目标流水" min-width="130" align="right"><template slot-scope="{ row }">{{ money(row.target) }}</template></el-table-column>
        <el-table-column label="已完成有效流水" min-width="150" align="right"><template slot-scope="{ row }">{{ money(row.completed) }}</template></el-table-column>
        <el-table-column label="待确认流水" min-width="130" align="right"><template slot-scope="{ row }">{{ money(row.pending) }}</template></el-table-column>
        <el-table-column label="还需解锁流水" min-width="140" align="right"><template slot-scope="{ row }"><b class="locked">{{ money(row.remaining) }}</b></template></el-table-column>
        <el-table-column prop="unlockTime" label="解锁时间" min-width="145" align="center" />
        <el-table-column label="状态" width="100" align="center"><template slot-scope="{ row }"><el-tag size="mini" :type="row.status === '锁定中' ? 'warning' : 'success'">{{ row.status }}</el-tag></template></el-table-column>
      </el-table>
      <div class="detail-tip"><i class="el-icon-info" /> 锁定额度（初始）为任务创建时的资金快照，不与顶部当前锁定余额直接求和；待确认流水为已分配到任务但尚未结算的有效投注。</div>
    </el-dialog>
  </div>
</template>

<script>
const SITES = ['DW体育', '旺财体育', '财神体育', '星河体育']

function createRows() {
  return Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    site: SITES[index % SITES.length],
    siteId: 8888 + index % 4,
    agent: `dw666s0${index % 6}${String.fromCharCode(97 + index % 4)}`,
    member: `dw666s${String(index % 8 + 1).padStart(2, '0')}m${String(index % 7).padStart(2, '0')}`,
    memberId: 1867 - index,
    currency: index % 9 === 0 ? 'USDT' : 'CNY',
    depositAmount: index % 3 === 0 ? 120 + index * 10 : index * 35,
    totalBalance: index * 18.5,
    availableBalance: index % 5 === 0 ? 0 : index * 8.5,
    lockedBalance: index % 5 === 0 ? 1300 : index * 10,
    turnover: index % 5 === 0 ? 1300 : index * 10
  }))
}

function defaultQuery() { return { site: '', agent: '', member: '' } }

export default {
  name: 'MemberWithdrawTurnover',
  data() {
    return {
      sites: SITES,
      rows: createRows(),
      query: defaultQuery(),
      appliedQuery: defaultQuery(),
      pageNum: 1,
      pageSize: 10,
      detailVisible: false,
      selected: {},
      detailRows: []
    }
  },
  computed: {
    filteredRows() {
      const q = this.appliedQuery
      return this.rows.filter(row =>
        (!q.site || row.site === q.site) &&
        (!q.agent || row.agent.includes(q.agent)) &&
        (!q.member || `${row.member}${row.memberId}`.includes(q.member))
      )
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    }
  },
  methods: {
    headerStyle() { return { background: '#f5f7fa', color: '#667085' } },
    money(value) { return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    handleQuery() { this.appliedQuery = { ...this.query }; this.pageNum = 1 },
    resetQuery() { this.query = defaultQuery(); this.appliedQuery = defaultQuery(); this.pageNum = 1 },
    openDetail(row) {
      this.selected = { ...row }
      this.detailRows = [
        {
          startTime: '2026-07-28 15:07:39',
          type: '充值',
          initial: Math.max(1600, row.lockedBalance),
          target: Math.max(1600, row.turnover),
          completed: 300,
          pending: 0,
          remaining: Math.max(1300, row.turnover),
          unlockTime: '-',
          status: '锁定中'
        }
      ]
      this.detailVisible = true
    }
  }
}
</script>

<style scoped>
.turnover-page { min-height: calc(100vh - 84px); background: #f4f7fb; }
.page-heading h2 { margin: 0 0 6px; color: #23314d; }
.page-heading p { margin: 0 0 18px; color: #94a0b3; font-size: 13px; }
.filter-panel, .table-card { padding: 16px; background: #fff; border: 1px solid #e7ecf4; border-radius: 6px; }
.filter-panel .el-form-item { margin-bottom: 0; }
.filter-panel .el-select, .filter-panel .el-input { width: 200px; }
.tip-bar, .detail-tip { margin: 14px 0; padding: 10px 14px; background: #f3f5f8; color: #8a95a7; font-size: 13px; }
.table-title, .pagination-row, .detail-heading { display: flex; align-items: center; justify-content: space-between; }
.table-title { margin-bottom: 12px; } .table-title span, .detail-heading span { margin-left: 10px; color: #8d99ad; font-size: 13px; }
.table-card small { display: block; margin-top: 5px; color: #95a1b3; }
.available { color: #00a36c; } .locked { color: #e9801b; }
.pagination-row { justify-content: flex-end; gap: 12px; margin-top: 16px; color: #667085; }
.member-meta { margin-bottom: 10px; color: #7d8ca3; }
.detail-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.detail-summary div { padding: 14px; background: #f7f9fc; border: 1px solid #e8edf5; border-radius: 6px; }
.detail-summary span, .detail-summary strong { display: block; }
.detail-summary span { margin-bottom: 8px; color: #8c98ab; font-size: 12px; }
.detail-heading { margin: 14px 0 10px; }
</style>
