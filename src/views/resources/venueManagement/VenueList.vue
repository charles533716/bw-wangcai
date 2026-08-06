<template>
  <div class="tab-page">
    <el-form :inline="true" :model="query" size="small" class="filter-form">
      <el-form-item label="场馆名称"><el-input v-model="query.name" clearable placeholder="请输入中文、英文或CODE" /></el-form-item>
      <el-form-item label="场馆类型"><el-select v-model="query.type" clearable placeholder="全部"><el-option v-for="item in types" :key="item" :label="item" :value="item" /></el-select></el-form-item>
      <el-form-item label="状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
      <el-form-item label="备注"><el-input v-model="query.remark" clearable placeholder="请输入备注" /></el-form-item>
      <el-form-item><el-button type="primary" @click="search">筛选</el-button><el-button @click="resetQuery">重置</el-button><el-button type="success" @click="openCreate">新增场馆</el-button></el-form-item>
    </el-form>

    <el-table :data="page.rows" border stripe size="mini" class="data-table">
      <el-table-column label="序号" type="index" width="55" align="center" />
      <el-table-column label="场馆" prop="name" min-width="130" />
      <el-table-column label="场馆CODE" prop="code" width="120" />
      <el-table-column label="场馆中文名称" prop="nameZh" min-width="130" />
      <el-table-column label="场馆类型" prop="type" width="90" />
      <el-table-column label="场馆佣金比例" width="115" align="center"><template slot-scope="scope">{{ scope.row.commissionRate }}%</template></el-table-column>
      <el-table-column label="最后更新时间" prop="updatedAt" width="155" />
      <el-table-column label="游戏数" width="75" align="center"><template slot-scope="scope"><el-button type="text" @click="$emit('switch-tab', { tab: 'games', venueId: scope.row.id })">{{ stats(scope.row).gameCount }}</el-button></template></el-table-column>
      <el-table-column label="授权数" width="75" align="center"><template slot-scope="scope"><el-button type="text">{{ stats(scope.row).authCount }}</el-button></template></el-table-column>
      <el-table-column label="场馆状态" width="90"><template slot-scope="scope"><el-tag :type="statusType(scope.row.status)" size="mini">{{ statusLabel(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column label="备注" prop="remark" min-width="110" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="285"><template slot-scope="scope">
        <el-button type="text" size="mini" @click="openDetail(scope.row)">详情</el-button>
        <el-button type="text" size="mini" @click="openEdit(scope.row)">编辑</el-button>
        <el-button type="text" size="mini" @click="toggleStatus(scope.row)">切换场馆状态</el-button>
        <el-button type="text" size="mini" @click="changeAuth(scope.row, 1)">授权</el-button>
        <el-button type="text" size="mini" @click="changeAuth(scope.row, -1)">取消授权</el-button>
      </template></el-table-column>
    </el-table>
    <pagination v-show="page.total > 0" :total="page.total" :page.sync="pageNum" :limit.sync="pageSize" @pagination="syncPage" />

    <el-dialog :title="dialogMode === 'create' ? '新增场馆' : dialogMode === 'edit' ? '编辑场馆' : '场馆详情'" :visible.sync="dialogVisible" width="620px" append-to-body>
      <el-form ref="venueForm" :model="form" label-width="130px" size="small" :disabled="dialogMode === 'detail'">
        <el-form-item label="场馆ID" required><el-input-number v-model="form.id" :min="1" :disabled="dialogMode !== 'create'" class="full" /></el-form-item>
        <el-form-item label="场馆CODE" required><el-input v-model.trim="form.code" placeholder="请输入场馆CODE" /></el-form-item>
        <el-form-item label="中文名称" required><el-input v-model.trim="form.nameZh" placeholder="请输入中文名称" /></el-form-item>
        <el-form-item label="场馆英文名称"><el-input v-model.trim="form.name" placeholder="请输入场馆英文名称" /></el-form-item>
        <el-form-item label="场馆类型" required><el-select v-model="form.type" class="full"><el-option v-for="item in types" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="场馆钱包" required><el-select v-model="form.walletId" class="full"><el-option v-for="item in state.wallets" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="场馆佣金比例" required><el-input-number v-model="form.commissionRate" :min="0" :max="100" :precision="4" class="full" /><div class="form-tip">用于代理佣金结算；站点设置了自定义费率时优先使用站点费率，否则使用此默认费率。</div></el-form-item>
        <el-form-item label="排序" required><el-input-number v-model="form.sort" :min="1" class="full" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" maxlength="200" show-word-limit :rows="3" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button v-if="dialogMode !== 'detail'" type="primary" @click="submit">提交</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
const { TYPES, cloneState, filterVenues, paginate, getVenueStats, validateVenue, appendMaintenanceLog } = require('./model')
const emptyForm = () => ({ id: null, code: '', name: '', nameZh: '', type: '', walletId: null, commissionRate: 0, sort: 1, status: 'enabled', authCount: 0, remark: '', updatedAt: '' })
export default {
  name: 'VenueList', props: { state: { type: Object, required: true } },
  data() { return { types: TYPES, statusOptions: [{ label: '启用', value: 'enabled' }, { label: '停用', value: 'disabled' }, { label: '维护中', value: 'maintenance' }], query: { name: '', type: '', status: '', remark: '' }, appliedQuery: {}, pageNum: 1, pageSize: 10, dialogVisible: false, dialogMode: 'create', editingId: null, form: emptyForm() } },
  computed: { page() { return paginate(filterVenues(this.state.venues, this.appliedQuery), this.pageNum, this.pageSize) } },
  methods: {
    stats(row) { return getVenueStats(this.state, row.id) }, statusLabel(value) { return ({ enabled: '启用', disabled: '停用', maintenance: '维护中' })[value] }, statusType(value) { return ({ enabled: 'success', disabled: 'info', maintenance: 'warning' })[value] },
    search() { this.appliedQuery = cloneState(this.query); this.pageNum = 1 }, resetQuery() { this.query = { name: '', type: '', status: '', remark: '' }; this.search() }, syncPage({ page, limit }) { this.pageNum = page; this.pageSize = limit },
    openCreate() { this.dialogMode = 'create'; this.editingId = null; this.form = emptyForm(); this.form.id = Math.max(0, ...this.state.venues.map(item => Number(item.id))) + 1; this.dialogVisible = true },
    openEdit(row) { this.dialogMode = 'edit'; this.editingId = row.id; this.form = cloneState(row); this.dialogVisible = true }, openDetail(row) { this.dialogMode = 'detail'; this.form = cloneState(row); this.dialogVisible = true },
    submit() { const result = validateVenue(this.form, this.state.venues, this.editingId); if (!result.valid) return this.$message.warning(result.message); this.form.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); if (this.dialogMode === 'create') this.state.venues.unshift(cloneState(this.form)); else Object.assign(this.state.venues.find(item => item.id === this.editingId), cloneState(this.form)); this.$emit('state-change'); this.dialogVisible = false; this.$modal.msgSuccess('场馆保存成功') },
    toggleStatus(row) { const next = row.status === 'enabled' ? 'maintenance' : row.status === 'maintenance' ? 'disabled' : 'enabled'; this.$confirm(`确认将${row.nameZh}切换为${this.statusLabel(next)}？`, '提示').then(() => { row.status = next; row.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); if (next === 'maintenance') appendMaintenanceLog(this.state, { venueId: row.id, reason: '场馆切换维护状态' }); this.$emit('state-change'); this.$modal.msgSuccess('场馆状态已更新') }).catch(() => {}) },
    changeAuth(row, delta) { if (delta < 0 && row.authCount <= 0) return this.$message.warning('当前没有可取消的授权'); row.authCount = Math.max(0, row.authCount + delta); this.$emit('state-change'); this.$modal.msgSuccess(delta > 0 ? '授权成功' : '取消授权成功') }
  }
}
</script>

<style scoped>
.filter-form { padding: 10px 0 0; }.filter-form .el-input,.filter-form .el-select{width:190px}.data-table{width:100%}.full{width:100%}.form-tip{color:#909399;font-size:12px;line-height:18px;margin-top:4px}
</style>
