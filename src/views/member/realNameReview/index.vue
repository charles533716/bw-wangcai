<template>
  <div class="review-page app-container">
    <header class="page-heading">
      <div>
        <h2>会员实名审核列表</h2>
        <p>审核会员提交的证件信息，管理已通过和认证失败的历史实名审核记录</p>
      </div>
    </header>

    <section class="summary-grid">
      <div v-for="item in summaryCards" :key="item.label" class="summary-card">
        <span>{{ item.label }}</span>
        <strong :class="item.className">{{ item.value }}</strong>
      </div>
    </section>

    <section class="filter-panel">
      <el-form :model="query" inline label-width="78px">
        <el-form-item label="所属站点">
          <el-select v-model="query.site" clearable placeholder="全部站点">
            <el-option label="全部站点" value="" />
            <el-option v-for="site in sites" :key="site" :label="site" :value="site" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员ID"><el-input v-model.trim="query.memberId" clearable placeholder="请输入会员ID" /></el-form-item>
        <el-form-item label="会员用户名"><el-input v-model.trim="query.member" clearable placeholder="请输入用户名" /></el-form-item>
        <el-form-item label="审核真实姓名"><el-input v-model.trim="query.realName" clearable placeholder="请输入真实姓名" /></el-form-item>
        <el-form-item label="实名状态">
          <el-select v-model="query.status" clearable placeholder="全部状态">
            <el-option label="全部状态" value="" />
            <el-option label="审核通过（已实名）" value="passed" />
            <el-option label="认证失败（审核不通过）" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核区分">
          <el-select v-model="query.reviewType" clearable placeholder="全部区分">
            <el-option label="全部区分" value="" />
            <el-option label="人工审核" value="人工审核" />
            <el-option label="自动审核" value="自动审核" />
          </el-select>
        </el-form-item>
        <el-form-item label="提审时间" class="date-filter">
          <el-date-picker v-model="query.dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">开始查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置筛选</el-button>
        </el-form-item>
      </el-form>
    </section>

    <div class="tip-bar"><i class="el-icon-info" /> 温馨小贴士：列表展示会员实名审核记录，统计卡片中，实名申请人数与已实名人数会合并会员实名数据和审核记录，并按会员去重。</div>

    <section class="table-card">
      <div class="table-title"><strong>最新实名报审历史聚合</strong><span>总共 {{ filteredRows.length }} 条记录</span></div>
      <el-table :data="pagedRows" border :header-cell-style="headerStyle">
        <el-table-column label="会员ID / 用户名" min-width="145">
          <template slot-scope="{ row }"><b>{{ row.member }}</b><small>ID: {{ row.memberId }}</small></template>
        </el-table-column>
        <el-table-column label="所属站点" min-width="120">
          <template slot-scope="{ row }"><b>{{ row.site }}</b><small>ID: {{ row.siteId }}</small></template>
        </el-table-column>
        <el-table-column prop="realName" label="待审实名" min-width="110" />
        <el-table-column prop="phone" label="验证手机号" min-width="145" />
        <el-table-column prop="submitTime" label="提审时间" min-width="145" />
        <el-table-column label="审核区分" min-width="105">
          <template slot-scope="{ row }"><el-tag size="mini" :type="row.reviewType === '人工审核' ? 'warning' : ''">{{ row.reviewType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="145" />
        <el-table-column label="实名状态" min-width="145">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.status === 'passed' ? 'success' : 'danger'">{{ row.status === 'passed' ? '审核通过（已实名）' : '认证失败（审核不通过）' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注说明" min-width="260" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" min-width="90" />
        <el-table-column label="管理操作" width="110" fixed="right">
          <template slot-scope="{ row }"><el-button type="primary" size="mini" plain @click="openEdit(row)">手动修改</el-button></template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <span>共 {{ filteredRows.length }} 条</span>
        <el-pagination background layout="sizes, prev, pager, next, jumper" :page-sizes="[10, 20, 50]" :page-size.sync="pageSize" :current-page.sync="pageNum" :total="filteredRows.length" />
      </div>
    </section>

    <el-dialog :visible.sync="editVisible" width="650px" custom-class="real-name-dialog" append-to-body>
      <div slot="title" class="dialog-title">
        <i class="el-icon-edit-outline" />
        <div><strong>手动修正/修改实名记录</strong><small>会员: {{ editForm.member }} (ID: {{ editForm.memberId }})</small></div>
      </div>
      <div class="warning-box"><i class="el-icon-warning" /> 温馨提醒：由于该会员的实名由第三方双因子验证通道拦截，管理员在人工审查用户提供的真实资料无误后，可以在此覆盖并手动放行通过。</div>
      <el-form :model="editForm" label-position="top">
        <el-form-item label="真实姓名" required><el-input v-model="editForm.realName" /></el-form-item>
        <el-form-item label="验证手机号" required><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item label="修正后的状态">
          <el-radio-group v-model="editForm.status" class="status-options">
            <el-radio-button label="passed">审核通过（已实名）</el-radio-button>
            <el-radio-button label="failed">认证失败（审核不通过）</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明"><el-input v-model="editForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editVisible = false">放弃修改</el-button>
        <el-button type="primary" @click="saveEdit">确认保存修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const SITES = ['旺财体育', '财神体育', 'DW体育', '星河体育']

function createRows() {
  const names = ['苏速度', '飞机场', '离箭头', '返水大哥', '活动001', '终章', '大刀王五', '锁定', '测试实名', '黑莉羽']
  return Array.from({ length: 32 }, (_, index) => ({
    id: index + 1,
    member: index < 4 ? ['testhd302', 'tgwc4p4imi', 'testhd1000', 'testhd999'][index] : `member${String(1000 + index)}`,
    memberId: 1823 - index,
    site: SITES[index % SITES.length],
    siteId: 2222 + index % 4,
    realName: names[index % names.length],
    phone: `+8613${String(555000000 + index).slice(-9)}`,
    submitTime: `2026-07-${String(28 - index % 10).padStart(2, '0')} ${String(15 - index % 6).padStart(2, '0')}:05:31`,
    reviewType: index % 5 === 4 ? '自动审核' : '人工审核',
    updateTime: `2026-07-${String(28 - index % 10).padStart(2, '0')} 07:05:51`,
    status: index % 5 === 4 ? 'failed' : 'passed',
    remark: '第三方自动核验结果：手机号与姓名不匹配，实名核验未通过。',
    operator: index % 5 === 4 ? '第三方' : 'admin'
  }))
}

function defaultQuery() {
  return { site: '', memberId: '', member: '', realName: '', status: '', reviewType: '', dateRange: [] }
}

export default {
  name: 'MemberRealNameReview',
  data() {
    return {
      sites: SITES,
      rows: createRows(),
      query: defaultQuery(),
      appliedQuery: defaultQuery(),
      pageNum: 1,
      pageSize: 10,
      editVisible: false,
      editForm: {}
    }
  },
  computed: {
    summaryCards() {
      return [
        { label: '总实名申请人数', value: 268, className: '' },
        { label: '认证检测失败（待修正）', value: 2, className: 'danger' },
        { label: '认证检测通过（已实名）', value: 268, className: 'success' },
        { label: '人工修正授权', value: 27, className: 'primary' }
      ]
    },
    filteredRows() {
      const q = this.appliedQuery
      return this.rows.filter(row =>
        (!q.site || row.site === q.site) &&
        (!q.memberId || String(row.memberId).includes(q.memberId)) &&
        (!q.member || row.member.includes(q.member)) &&
        (!q.realName || row.realName.includes(q.realName)) &&
        (!q.status || row.status === q.status) &&
        (!q.reviewType || row.reviewType === q.reviewType)
      )
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    }
  },
  methods: {
    headerStyle() { return { background: '#f5f7fa', color: '#667085' } },
    handleQuery() { this.appliedQuery = { ...this.query }; this.pageNum = 1 },
    resetQuery() { this.query = defaultQuery(); this.appliedQuery = defaultQuery(); this.pageNum = 1 },
    openEdit(row) { this.editForm = { ...row }; this.editVisible = true },
    saveEdit() {
      const index = this.rows.findIndex(row => row.id === this.editForm.id)
      if (index >= 0) this.$set(this.rows, index, { ...this.editForm, updateTime: '2026-07-29 18:00:00', operator: 'admin' })
      this.editVisible = false
      this.$message.success('实名记录修改成功')
    }
  }
}
</script>

<style scoped>
.review-page { min-height: calc(100vh - 84px); background: #f4f7fb; }
.page-heading h2 { margin: 0 0 6px; color: #23314d; }
.page-heading p { margin: 0; color: #94a0b3; font-size: 13px; }
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 18px 0; }
.summary-card { padding: 18px; background: #fff; border: 1px solid #e8edf5; border-radius: 6px; }
.summary-card span { display: block; color: #8d99ad; font-size: 13px; }
.summary-card strong { display: block; margin-top: 10px; color: #25324b; font-size: 26px; }
.summary-card .danger { color: #ff4d6d; } .summary-card .success { color: #42bd84; } .summary-card .primary { color: #4b7cf3; }
.filter-panel, .table-card { padding: 16px; background: #fff; border: 1px solid #e7ecf4; border-radius: 6px; }
.filter-panel .el-form { display: flex; flex-wrap: wrap; align-items: center; gap: 0 14px; }
.filter-panel .el-form-item { margin-right: 0; margin-bottom: 10px; }
.filter-panel .el-select, .filter-panel .el-input { width: 175px; }
.date-filter ::v-deep .el-date-editor { width: 320px; }
.tip-bar { margin: 14px 0; padding: 10px 14px; background: #edf5ff; color: #7184a2; font-size: 13px; }
.table-title, .pagination-row { display: flex; align-items: center; justify-content: space-between; }
.table-title { margin-bottom: 12px; } .table-title span { color: #8d99ad; font-size: 13px; }
.table-card small, .dialog-title small { display: block; margin-top: 4px; color: #8c98ab; }
.pagination-row { justify-content: flex-end; gap: 12px; margin-top: 16px; color: #667085; }
.dialog-title { display: flex; align-items: center; gap: 14px; }
.dialog-title i { padding: 12px; color: #fff; background: #477bf3; border-radius: 6px; font-size: 24px; }
.dialog-title strong { font-size: 20px; }
.warning-box { margin-bottom: 18px; padding: 16px; color: #c97913; background: #fff9e8; border: 1px solid #f5d78d; border-radius: 6px; line-height: 1.8; }
.status-options { display: flex; width: 100%; }
.status-options ::v-deep .el-radio-button { flex: 1; }
.status-options ::v-deep .el-radio-button__inner { width: 100%; padding: 16px 10px; }
@media (max-width: 1200px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
