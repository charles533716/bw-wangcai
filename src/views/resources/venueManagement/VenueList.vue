<template>
  <div class="tab-page">
    <el-form :inline="true" :model="query" size="small" class="filter-form">
      <el-form-item label="场馆名称"><el-input v-model="query.name" clearable placeholder="请输入中文、英文或CODE" /></el-form-item>
      <el-form-item label="场馆类型"><el-select v-model="query.type" clearable placeholder="全部"><el-option v-for="item in venueTypeOptions" :key="item.name" :label="item.name" :value="item.name" /></el-select></el-form-item>
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
      <el-table-column label="授权数" width="75" align="center"><template slot-scope="scope"><el-button type="text" @click="openAuthorizedSites(scope.row)">{{ stats(scope.row).authCount }}</el-button></template></el-table-column>
      <el-table-column label="场馆状态" width="90"><template slot-scope="scope"><el-tag :type="statusType(scope.row.status)" size="mini">{{ statusLabel(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column label="备注" prop="remark" min-width="110" show-overflow-tooltip />
      <el-table-column label="操作" fixed="right" width="285"><template slot-scope="scope">
        <el-button type="text" size="mini" @click="openDetail(scope.row)">详情</el-button>
        <el-button type="text" size="mini" @click="openEdit(scope.row)">编辑</el-button>
        <el-button type="text" size="mini" @click="openStatus(scope.row)">切换场馆状态</el-button>
        <el-button type="text" size="mini" @click="openAuthorization(scope.row, 'authorize')">授权</el-button>
        <el-button type="text" size="mini" @click="openAuthorization(scope.row, 'revoke')">取消授权</el-button>
      </template></el-table-column>
    </el-table>
    <pagination v-show="page.total > 0" :total="page.total" :page.sync="pageNum" :limit.sync="pageSize" @pagination="syncPage" />

    <el-dialog :title="dialogMode === 'create' ? '新增场馆' : dialogMode === 'edit' ? '编辑场馆' : '场馆详情'" :visible.sync="dialogVisible" width="620px" append-to-body>
      <el-form ref="venueForm" :model="form" label-width="130px" size="small" :disabled="dialogMode === 'detail'">
        <el-form-item label="场馆ID" required><el-input-number v-model="form.id" :min="1" :disabled="dialogMode !== 'create'" class="full" /></el-form-item>
        <el-form-item label="场馆CODE" required><el-input v-model.trim="form.code" name="venue-code" autocomplete="off" data-1p-ignore="true" data-bwignore="true" data-lpignore="true" placeholder="请输入场馆CODE" /></el-form-item>
        <el-form-item label="中文名称" required><el-input v-model.trim="form.nameZh" placeholder="请输入中文名称" /></el-form-item>
        <el-form-item label="场馆英文名称"><el-input v-model.trim="form.name" placeholder="请输入场馆英文名称" /></el-form-item>
        <el-form-item label="场馆类型" required><el-select v-model="form.type" class="full"><el-option v-for="item in venueTypeOptions" :key="item.name" :label="item.name" :value="item.name" /></el-select></el-form-item>
        <el-form-item label="场馆钱包" required><el-select v-model="form.walletId" class="full"><el-option v-for="item in state.wallets" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="场馆佣金比例" required><el-input-number v-model="form.commissionRate" :min="0" :max="100" :precision="4" class="full" /><div class="form-tip">用于代理佣金结算；站点设置了自定义费率时优先使用站点费率，否则使用此默认费率。</div></el-form-item>
        <el-form-item label="排序" required><el-input-number v-model="form.sort" :min="1" class="full" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" maxlength="200" show-word-limit :rows="3" /></el-form-item>
      </el-form>
      <span slot="footer"><el-button @click="dialogVisible = false">取消</el-button><el-button v-if="dialogMode !== 'detail'" type="primary" @click="submit">提交</el-button></span>
    </el-dialog>

    <el-dialog title="切换场馆状态" :visible.sync="statusVisible" width="660px" append-to-body custom-class="venue-status-dialog">
      <div v-if="currentStatusVenue" class="status-dialog-body">
        <div class="status-row"><span class="status-label">场馆名称：</span><strong>{{ currentStatusVenue.nameZh }} / {{ currentStatusVenue.code }}</strong></div>
        <div class="status-row">
          <span class="status-label">设置场馆状态：</span>
          <el-radio-group v-model="statusForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="maintenance">维护中</el-radio>
            <el-radio label="disabled">停用</el-radio>
          </el-radio-group>
        </div>
        <div v-if="statusForm.status === 'maintenance'" class="maintenance-settings">
          <div class="status-row"><span class="status-label required-label">维护起始时间：</span><el-date-picker v-model="statusForm.maintenanceConfig.startDate" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="请选择维护起始时间" /></div>
          <div class="status-row"><span class="status-label required-label">维护结束时间：</span><el-date-picker v-model="statusForm.maintenanceConfig.endDate" type="date" value-format="yyyy-MM-dd" format="yyyy-MM-dd" placeholder="请选择维护结束时间" /></div>
          <div class="status-row"><span class="status-label">原因备注：</span><el-input v-model.trim="statusForm.maintenanceConfig.reason" type="textarea" :maxlength="50" show-word-limit :rows="3" class="maintenance-reason" /></div>
          <div class="status-row"><span class="status-label required-label">展示维护时间：</span><el-radio-group v-model="statusForm.maintenanceConfig.showMaintenanceTime"><el-radio :label="true">展示</el-radio><el-radio :label="false">不展示</el-radio></el-radio-group></div>
        </div>
      </div>
      <span slot="footer"><el-button @click="statusVisible = false">取消</el-button><el-button type="primary" @click="submitStatus">提交</el-button></span>
    </el-dialog>

    <el-dialog :title="authorizationTitle" :visible.sync="authorizationVisible" width="720px" append-to-body custom-class="venue-authorization-dialog">
      <div v-loading="siteLoading" class="authorization-body">
        <div class="site-selection">
          <el-checkbox :value="allFilteredSelected" :indeterminate="selectionIndeterminate" @change="toggleAllFiltered">全部</el-checkbox>
          <el-checkbox-group v-model="selectedSiteCodes" class="site-checkboxes">
            <el-checkbox v-for="site in authorizationCandidates" :key="site.code" :label="site.code">{{ site.name }}（{{ site.code }}）</el-checkbox>
          </el-checkbox-group>
          <el-empty v-if="!siteLoading && !authorizationCandidates.length" description="暂无可选站点" :image-size="70" />
        </div>
      </div>
      <span slot="footer"><el-button @click="authorizationVisible = false">取消</el-button><el-button type="primary" :loading="siteLoading" @click="submitAuthorization">确定</el-button></span>
    </el-dialog>

    <el-dialog :title="authorizedSitesTitle" :visible.sync="authorizedSitesVisible" width="560px" append-to-body>
      <el-table v-loading="authorizedSitesLoading" :data="authorizedSiteRows" border stripe size="mini" empty-text="该场馆暂未授权站点">
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="name" label="站点名称" min-width="180" />
        <el-table-column prop="code" label="站点编号" min-width="150" />
      </el-table>
      <span slot="footer"><el-button type="primary" @click="authorizedSitesVisible = false">关闭</el-button></span>
    </el-dialog>
  </div>
</template>

<script>
import { listSite } from '@/api/site/site'
const { cloneState, defaultMaintenanceConfig, validateMaintenanceConfig, filterVenues, normalizeSiteRows, paginate, authorizeVenueSites, revokeVenueSites, canEnableVenue, getVenueStats, validateVenue, appendMaintenanceLog } = require('./model')
const emptyForm = () => ({ id: null, code: '', name: '', nameZh: '', type: '', walletId: null, commissionRate: 0, sort: 1, status: 'enabled', authCount: 0, authorizedSiteCodes: [], billingRateConfiguredSiteCodes: [], remark: '', updatedAt: '' })
export default {
  name: 'VenueList', props: { state: { type: Object, required: true } },
  data() { return { statusOptions: [{ label: '启用', value: 'enabled' }, { label: '停用', value: 'disabled' }, { label: '维护中', value: 'maintenance' }], query: { name: '', type: '', status: '', remark: '' }, appliedQuery: {}, pageNum: 1, pageSize: 10, dialogVisible: false, dialogMode: 'create', editingId: null, form: emptyForm(), statusVisible: false, statusVenueId: null, statusForm: { status: 'enabled', maintenanceConfig: defaultMaintenanceConfig() }, authorizationVisible: false, authorizationMode: 'authorize', authorizationVenueId: null, siteRows: [], selectedSiteCodes: [], siteLoading: false, authorizedSitesVisible: false, authorizedSitesVenueId: null, authorizedSitesLoading: false, authorizedSitesSource: [] } },
  computed: {
    venueTypeOptions() { return (this.state.venueTypes || []).slice().sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0)) },
    page() { return paginate(filterVenues(this.state.venues, this.appliedQuery), this.pageNum, this.pageSize) },
    currentStatusVenue() { return this.state.venues.find(item => item.id === this.statusVenueId) || null },
    currentAuthorizationVenue() { return this.state.venues.find(item => item.id === this.authorizationVenueId) || null },
    authorizationTitle() { const name = this.currentAuthorizationVenue ? this.currentAuthorizationVenue.nameZh : ''; return this.authorizationMode === 'authorize' ? `场馆授权 - ${name}` : `场馆取消授权 - ${name}` },
    currentAuthorizedSitesVenue() { return this.state.venues.find(item => item.id === this.authorizedSitesVenueId) || null },
    authorizedSitesTitle() { return `已授权站点 - ${this.currentAuthorizedSitesVenue ? this.currentAuthorizedSitesVenue.nameZh : ''}` },
    authorizedSiteRows() { const venue = this.currentAuthorizedSitesVenue; if (!venue) return []; const sites = new Map(this.authorizedSitesSource.map(site => [site.code, site])); return (venue.authorizedSiteCodes || []).map(code => sites.get(code) || { code, name: code }) },
    authorizationCandidates() { const authorized = new Set((this.currentAuthorizationVenue && this.currentAuthorizationVenue.authorizedSiteCodes) || []); return this.siteRows.filter(site => this.authorizationMode === 'authorize' ? !authorized.has(site.code) : authorized.has(site.code)) },
    filteredSiteCodes() { return this.authorizationCandidates.map(site => site.code) },
    selectedFilteredCount() { const selected = new Set(this.selectedSiteCodes); return this.filteredSiteCodes.filter(code => selected.has(code)).length },
    allFilteredSelected() { return this.filteredSiteCodes.length > 0 && this.selectedFilteredCount === this.filteredSiteCodes.length },
    selectionIndeterminate() { return this.selectedFilteredCount > 0 && !this.allFilteredSelected }
  },
  methods: {
    stats(row) { return getVenueStats(this.state, row.id) }, statusLabel(value) { return ({ enabled: '启用', disabled: '停用', maintenance: '维护中' })[value] }, statusType(value) { return ({ enabled: 'success', disabled: 'info', maintenance: 'warning' })[value] },
    search() { this.appliedQuery = cloneState(this.query); this.pageNum = 1 }, resetQuery() { this.query = { name: '', type: '', status: '', remark: '' }; this.search() }, syncPage({ page, limit }) { this.pageNum = page; this.pageSize = limit },
    openCreate() { this.dialogMode = 'create'; this.editingId = null; this.form = emptyForm(); this.form.id = Math.max(0, ...this.state.venues.map(item => Number(item.id))) + 1; this.dialogVisible = true },
    openEdit(row) { this.dialogMode = 'edit'; this.editingId = row.id; this.form = cloneState(row); this.dialogVisible = true }, openDetail(row) { this.dialogMode = 'detail'; this.form = cloneState(row); this.dialogVisible = true },
    submit() { const result = validateVenue(this.form, this.state.venues, this.editingId); if (!result.valid) return this.$message.warning(result.message); this.form.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); if (this.dialogMode === 'create') this.state.venues.unshift(cloneState(this.form)); else Object.assign(this.state.venues.find(item => item.id === this.editingId), cloneState(this.form)); this.$emit('state-change'); this.dialogVisible = false; this.$modal.msgSuccess('场馆保存成功') },
    openStatus(row) { this.statusVenueId = row.id; this.statusForm = { status: row.status, maintenanceConfig: { ...defaultMaintenanceConfig(), ...(row.maintenanceConfig || {}) } }; this.statusVisible = true },
    submitStatus() { const row = this.currentStatusVenue; if (!row) return; if (this.statusForm.status === 'enabled' && !canEnableVenue(row)) return this.$message.warning('账单模板结算费率未配置完成，暂不可启用'); if (this.statusForm.status === 'maintenance') { const config = this.statusForm.maintenanceConfig; const result = validateMaintenanceConfig(config); if (!result.valid) return this.$message.warning(result.message); row.maintenanceConfig = cloneState(config); appendMaintenanceLog(this.state, { venueId: row.id, startAt: config.startDate, endAt: config.endDate, reason: config.reason || '场馆维护' }) } const statusChanged = row.status !== this.statusForm.status; if (statusChanged) row.status = this.statusForm.status; if (statusChanged || this.statusForm.status === 'maintenance') { row.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); this.$emit('state-change') } this.statusVisible = false; this.$modal.msgSuccess('场馆状态已更新') },
    async openAuthorizedSites(row) { this.authorizedSitesVenueId = row.id; this.authorizedSitesSource = []; this.authorizedSitesVisible = true; this.authorizedSitesLoading = true; try { const response = await listSite({ pageNum: 1, pageSize: 1000 }); this.authorizedSitesSource = normalizeSiteRows((response && response.rows) || []) } catch (error) { this.$message.error('站点列表获取失败') } finally { this.authorizedSitesLoading = false } },
    async openAuthorization(row, mode) { this.authorizationVenueId = row.id; this.authorizationMode = mode; this.selectedSiteCodes = []; this.authorizationVisible = true; this.siteLoading = true; try { const response = await listSite({ pageNum: 1, pageSize: 1000 }); this.siteRows = normalizeSiteRows((response && response.rows) || []) } catch (error) { this.authorizationVisible = false; this.$message.error('站点列表获取失败') } finally { this.siteLoading = false } },
    toggleAllFiltered(checked) { const visible = new Set(this.filteredSiteCodes); const selected = new Set(this.selectedSiteCodes); if (checked) visible.forEach(code => selected.add(code)); else visible.forEach(code => selected.delete(code)); this.selectedSiteCodes = Array.from(selected) },
    submitAuthorization() { const venue = this.currentAuthorizationVenue; if (!venue) return; if (!this.selectedSiteCodes.length) return this.$message.warning(`请选择需要${this.authorizationMode === 'authorize' ? '授权' : '取消授权'}的站点`); if (this.authorizationMode === 'authorize') authorizeVenueSites(venue, this.selectedSiteCodes); else revokeVenueSites(venue, this.selectedSiteCodes, this.state.games); venue.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' '); this.$emit('state-change'); this.authorizationVisible = false; this.$modal.msgSuccess(this.authorizationMode === 'authorize' ? '授权成功' : '取消授权成功') }
  }
}
</script>

<style scoped>
.filter-form { padding: 10px 0 0; }.filter-form .el-input,.filter-form .el-select{width:190px}.data-table{width:100%}.full{width:100%}.form-tip{color:#909399;font-size:12px;line-height:18px;margin-top:4px}
.status-dialog-body{min-height:360px;padding:0 105px}.status-row{display:flex;align-items:center;margin-bottom:28px;font-size:14px}.status-label{width:145px;text-align:right;margin-right:12px}.required-label::before{content:'*';color:#f56c6c;margin-right:4px}.maintenance-settings .status-row{align-items:flex-start}.maintenance-settings .status-label{padding-top:8px}.maintenance-settings .el-date-editor{width:260px}.maintenance-reason{width:300px}.authorization-body{min-height:320px}.site-selection{padding:18px 8px}.site-checkboxes{display:flex;flex-wrap:wrap;margin-top:18px}.site-checkboxes .el-checkbox{width:30%;margin:0 3% 18px 0}
</style>
