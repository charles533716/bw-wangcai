<template>
  <div class="app-container maintenance-page">
    <el-card shadow="never" class="maintenance-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="系统维护列表" name="list">
          <div class="filter-bar">
            <el-form :inline="true" size="small" label-width="86px">
              <el-form-item label="站点关键字">
                <el-input v-model="query.keyword" placeholder="站点名称 / 编码" clearable />
              </el-form-item>
              <el-form-item label="维护状态">
                <el-select v-model="query.status" placeholder="全部状态" clearable>
                  <el-option label="全部状态" value="" />
                  <el-option label="正常" value="normal" />
                  <el-option label="维护中" value="maintaining" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
                <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-actions">
            <el-button type="primary" plain size="mini" icon="el-icon-video-play" :disabled="!selectedMaintenanceRows.length" @click="openBatchStartDialog">批量开启维护</el-button>
            <el-button type="success" plain size="mini" icon="el-icon-video-pause" :disabled="!selectedMaintenanceRows.length" @click="openBatchStopDialog">批量停止维护</el-button>
            <span class="selected-tip">已选择 {{ selectedMaintenanceRows.length }} 个站点</span>
          </div>

          <el-table :data="filteredMaintenanceList" border @selection-change="handleMaintenanceSelection">
            <el-table-column type="selection" width="48" align="center" />
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column label="站点" min-width="180">
              <template slot-scope="scope">
                <span class="site-name">{{ scope.row.siteName }}</span>
                <el-tag size="mini" class="site-code">{{ scope.row.siteCode }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="140" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.status === 'maintaining'" type="danger" size="mini">维护中</el-tag>
                <el-tag v-else type="success" size="mini">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="维护文案" prop="notice" min-width="260" />
            <el-table-column label="生效期间" min-width="260">
              <template slot-scope="scope">
                <template v-if="scope.row.status === 'maintaining'">
                  <div>开始：{{ scope.row.startTime }}</div>
                  <div>结束：{{ scope.row.endTime }}</div>
                </template>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column label="操作人" prop="operator" width="140" align="center" />
            <el-table-column label="操作时间" prop="operateTime" width="170" align="center" />
            <el-table-column label="操作" width="140" align="center">
              <template slot-scope="scope">
                <el-button
                  v-if="scope.row.status === 'maintaining'"
                  type="text"
                  size="mini"
                  icon="el-icon-video-pause"
                  @click="openStopDialog(scope.row)"
                >停止维护</el-button>
                <el-button
                  v-else
                  type="text"
                  size="mini"
                  icon="el-icon-video-play"
                  @click="openStartDialog(scope.row)"
                >开启维护</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="filteredMaintenanceList.length > 0"
            :total="filteredMaintenanceList.length"
            :page.sync="listPager.pageNum"
            :limit.sync="listPager.pageSize"
          />
        </el-tab-pane>

        <el-tab-pane label="系统维护白名单" name="whitelist">
          <div class="filter-bar">
            <el-form :inline="true" size="small" label-width="86px">
              <el-form-item label="关联站点">
                <el-select v-model="whiteQuery.siteCode" placeholder="全部站点" clearable>
                  <el-option label="全部站点" value="" />
                  <el-option v-for="site in siteOptions" :key="site.code" :label="site.name" :value="site.code" />
                </el-select>
              </el-form-item>
              <el-form-item label="账号关键字">
                <el-input v-model="whiteQuery.keyword" placeholder="账号 / 备注 / 站点" clearable />
              </el-form-item>
              <el-form-item label="白名单状态">
                <el-select v-model="whiteQuery.status" placeholder="启用" clearable>
                  <el-option label="全部状态" value="" />
                  <el-option label="启用" value="enabled" />
                  <el-option label="禁用" value="disabled" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="handleWhiteQuery">查询</el-button>
                <el-button icon="el-icon-refresh" @click="resetWhiteQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-actions">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="openWhitelistDialog">新增系统维护白名单用户</el-button>
          </div>

          <el-table :data="filteredWhitelist" border>
            <el-table-column label="序号" type="index" width="80" align="center" />
            <el-table-column label="关联站点" min-width="180">
              <template slot-scope="scope">
                <span class="site-name">{{ scope.row.siteName }}</span>
                <el-tag size="mini" class="site-code">{{ scope.row.siteCode }}</el-tag>
                <el-tag v-if="scope.row.status === 'enabled'" type="success" size="mini" class="site-status">正常</el-tag>
                <el-tag v-else type="info" size="mini" class="site-status">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="白名单用户账号" prop="account" min-width="220" />
            <el-table-column label="授权备注原因" prop="reason" min-width="260" />
            <el-table-column label="操作人" prop="operator" width="140" align="center" />
            <el-table-column label="授权录入时间" prop="createdAt" width="180" align="center" />
            <el-table-column label="管理操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button type="text" size="mini" icon="el-icon-delete" class="danger-text" @click="confirmDeleteWhitelist(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="filteredWhitelist.length > 0"
            :total="filteredWhitelist.length"
            :page.sync="whitePager.pageNum"
            :limit.sync="whitePager.pageSize"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="startDialogTitle" :visible.sync="startDialogVisible" width="620px" append-to-body>
      <el-form ref="maintenanceForm" :model="maintenanceForm" :rules="maintenanceRules" label-width="110px" size="small">
        <el-form-item label="目标站点">
          <el-tag v-for="site in targetSites" :key="site.siteCode" size="mini" type="primary" class="target-site">{{ site.siteName }} / {{ site.siteCode }}</el-tag>
        </el-form-item>
        <el-form-item label="维护公告文案" prop="notice">
          <el-input v-model="maintenanceForm.notice" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="系统例行升级维护，请稍后再试。" />
        </el-form-item>
        <el-form-item label="开始维护时间" prop="startTime">
          <el-date-picker v-model="maintenanceForm.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择开始维护时间" />
        </el-form-item>
        <el-form-item label="预计恢复时间" prop="endTime">
          <el-date-picker v-model="maintenanceForm.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择预计恢复时间" />
        </el-form-item>
        <el-form-item label="维护原因">
          <el-input v-model="maintenanceForm.reason" placeholder="例如：例行升级、紧急修复" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="startDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitStartMaintenance">确认开启维护</el-button>
      </div>
    </el-dialog>

    <el-dialog title="系统提示" :visible.sync="stopDialogVisible" width="420px" append-to-body>
      <div class="confirm-content">
        <i class="el-icon-warning confirm-icon"></i>
        <span>确认停止以下站点维护并恢复正常状态？ {{ stopSiteNames }}</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="stopDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitStopMaintenance">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增系统维护白名单用户" :visible.sync="whitelistDialogVisible" width="620px" append-to-body>
      <el-form ref="whiteForm" :model="whiteForm" :rules="whiteRules" label-width="110px" size="small">
        <el-form-item label="关联站点" prop="siteCode">
          <el-select v-model="whiteForm.siteCode" placeholder="请选择站点" class="full-width">
            <el-option v-for="site in siteOptions" :key="site.code" :label="site.name" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户账号" prop="accounts">
          <el-input v-model="whiteForm.accounts" type="textarea" :rows="5" placeholder="多个账号可使用换行、半角逗号、空格或分号分隔" />
        </el-form-item>
        <el-form-item label="授权备注原因">
          <el-input v-model="whiteForm.reason" placeholder="例如：开发联调测试、超级 VIP 服务" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="whitelistDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitWhitelist">确认添加至白名单</el-button>
      </div>
    </el-dialog>

    <el-dialog title="系统提示" :visible.sync="deleteDialogVisible" width="420px" append-to-body>
      <div class="confirm-content">
        <i class="el-icon-warning confirm-icon"></i>
        <span>确认删除白名单账号【{{ deletingWhiteRow ? deletingWhiteRow.account : '' }}】？</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDeleteWhitelist">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const nowText = '2026-07-31 01:21:36'

export default {
  name: 'SystemPlaceholderPage',
  data() {
    return {
      activeTab: 'list',
      query: {
        keyword: '',
        status: ''
      },
      whiteQuery: {
        siteCode: '',
        keyword: '',
        status: 'enabled'
      },
      listPager: {
        pageNum: 1,
        pageSize: 20
      },
      whitePager: {
        pageNum: 1,
        pageSize: 20
      },
      selectedMaintenanceRows: [],
      startDialogVisible: false,
      stopDialogVisible: false,
      whitelistDialogVisible: false,
      deleteDialogVisible: false,
      targetSites: [],
      stopTargets: [],
      deletingWhiteRow: null,
      maintenanceForm: {
        notice: '系统例行升级维护，请稍后再试。',
        startTime: nowText,
        endTime: '2026-07-31 05:21:36',
        reason: ''
      },
      whiteForm: {
        siteCode: '',
        accounts: '',
        reason: ''
      },
      siteOptions: [
        { name: 'DW测试', code: '8888' },
        { name: '旺财体育', code: '2222' },
        { name: '财神客栈', code: '333333' },
        { name: '拉布布', code: '20260106' }
      ],
      maintenanceList: [
        { id: 1, siteName: 'DW测试', siteCode: '8888', status: 'normal', notice: '--', startTime: '', endTime: '', operator: '系统默认', operateTime: '--' },
        { id: 2, siteName: '旺财体育', siteCode: '2222', status: 'normal', notice: '--', startTime: '', endTime: '', operator: '系统默认', operateTime: '--' },
        { id: 3, siteName: '财神客栈', siteCode: '333333', status: 'normal', notice: '--', startTime: '', endTime: '', operator: '系统默认', operateTime: '--' },
        { id: 4, siteName: '拉布布', siteCode: '20260106', status: 'normal', notice: '--', startTime: '', endTime: '', operator: '系统默认', operateTime: '--' }
      ],
      whitelist: [
        { id: 1, siteName: '旺财体育', siteCode: '2222', account: 'test', reason: '--', operator: 'admin', createdAt: '2026-07-30 18:23:49', status: 'enabled' }
      ],
      maintenanceRules: {
        notice: [{ required: true, message: '请输入维护公告文案', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始维护时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择预计恢复时间', trigger: 'change' }]
      },
      whiteRules: {
        siteCode: [{ required: true, message: '请选择关联站点', trigger: 'change' }],
        accounts: [{ required: true, message: '请输入用户账号', trigger: 'blur' }]
      }
    }
  },
  computed: {
    filteredMaintenanceList() {
      return this.maintenanceList.filter(item => {
        const hitKeyword = !this.query.keyword || `${item.siteName}${item.siteCode}`.includes(this.query.keyword)
        const hitStatus = !this.query.status || item.status === this.query.status
        return hitKeyword && hitStatus
      })
    },
    filteredWhitelist() {
      return this.whitelist.filter(item => {
        const hitSite = !this.whiteQuery.siteCode || item.siteCode === this.whiteQuery.siteCode
        const hitKeyword = !this.whiteQuery.keyword || `${item.siteName}${item.siteCode}${item.account}${item.reason}`.includes(this.whiteQuery.keyword)
        const hitStatus = !this.whiteQuery.status || item.status === this.whiteQuery.status
        return hitSite && hitKeyword && hitStatus
      })
    },
    startDialogTitle() {
      if (this.targetSites.length === 1) {
        return `站点【${this.targetSites[0].siteName}】开启维护`
      }
      return '批量开启维护'
    },
    stopSiteNames() {
      return this.stopTargets.map(item => item.siteName).join('、')
    }
  },
  methods: {
    handleQuery() {
      this.listPager.pageNum = 1
    },
    resetQuery() {
      this.query = { keyword: '', status: '' }
      this.handleQuery()
    },
    handleWhiteQuery() {
      this.whitePager.pageNum = 1
    },
    resetWhiteQuery() {
      this.whiteQuery = { siteCode: '', keyword: '', status: 'enabled' }
      this.handleWhiteQuery()
    },
    handleMaintenanceSelection(rows) {
      this.selectedMaintenanceRows = rows
    },
    resetMaintenanceForm() {
      this.maintenanceForm = {
        notice: '系统例行升级维护，请稍后再试。',
        startTime: nowText,
        endTime: '2026-07-31 05:21:36',
        reason: ''
      }
    },
    openStartDialog(row) {
      this.targetSites = [row]
      this.resetMaintenanceForm()
      this.startDialogVisible = true
    },
    openBatchStartDialog() {
      this.targetSites = this.selectedMaintenanceRows
      this.resetMaintenanceForm()
      this.startDialogVisible = true
    },
    submitStartMaintenance() {
      this.$refs.maintenanceForm.validate(valid => {
        if (!valid) return
        const targetCodes = this.targetSites.map(item => item.siteCode)
        this.maintenanceList = this.maintenanceList.map(item => {
          if (!targetCodes.includes(item.siteCode)) return item
          return {
            ...item,
            status: 'maintaining',
            notice: this.maintenanceForm.notice,
            startTime: this.maintenanceForm.startTime,
            endTime: this.maintenanceForm.endTime,
            operator: 'admin',
            operateTime: '2026-07-31 02:22:14'
          }
        })
        this.startDialogVisible = false
        this.$message.success('已开启系统维护')
      })
    },
    openStopDialog(row) {
      this.stopTargets = [row]
      this.stopDialogVisible = true
    },
    openBatchStopDialog() {
      this.stopTargets = this.selectedMaintenanceRows
      this.stopDialogVisible = true
    },
    submitStopMaintenance() {
      const targetCodes = this.stopTargets.map(item => item.siteCode)
      this.maintenanceList = this.maintenanceList.map(item => {
        if (!targetCodes.includes(item.siteCode)) return item
        return {
          ...item,
          status: 'normal',
          notice: '--',
          startTime: '',
          endTime: '',
          operator: 'admin',
          operateTime: '2026-07-31 02:25:40'
        }
      })
      this.stopDialogVisible = false
      this.$message.success('已停止系统维护')
    },
    openWhitelistDialog() {
      this.whiteForm = { siteCode: '', accounts: '', reason: '' }
      this.whitelistDialogVisible = true
    },
    submitWhitelist() {
      this.$refs.whiteForm.validate(valid => {
        if (!valid) return
        const site = this.siteOptions.find(item => item.code === this.whiteForm.siteCode)
        const accounts = this.whiteForm.accounts.split(/[\n,;；\s]+/).filter(Boolean)
        const nextRows = accounts.map((account, index) => ({
          id: Date.now() + index,
          siteName: site.name,
          siteCode: site.code,
          account,
          reason: this.whiteForm.reason || '--',
          operator: 'admin',
          createdAt: '2026-07-31 02:31:12',
          status: 'enabled'
        }))
        this.whitelist = nextRows.concat(this.whitelist)
        this.whitelistDialogVisible = false
        this.$message.success('已添加至系统维护白名单')
      })
    },
    confirmDeleteWhitelist(row) {
      this.deletingWhiteRow = row
      this.deleteDialogVisible = true
    },
    submitDeleteWhitelist() {
      if (this.deletingWhiteRow) {
        this.whitelist = this.whitelist.filter(item => item.id !== this.deletingWhiteRow.id)
      }
      this.deleteDialogVisible = false
      this.$message.success('白名单账号已删除')
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-page {
  background: #f3f6fb;
}

.maintenance-card {
  border-radius: 4px;
}

.filter-bar {
  padding: 16px 0 6px;
  border-bottom: 1px solid #e8edf3;

  ::v-deep .el-input,
  ::v-deep .el-select,
  ::v-deep .el-date-editor {
    width: 240px;
  }
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0 10px;
}

.selected-tip {
  color: #7a8aa0;
  font-size: 12px;
}

.site-name {
  font-weight: 600;
  color: #1f2d3d;
}

.site-code,
.site-status,
.target-site {
  margin-left: 6px;
}

.danger-text {
  color: #f56c6c;
}

.confirm-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #606266;
  line-height: 24px;
}

.confirm-icon {
  color: #e6a23c;
  font-size: 22px;
}

.full-width {
  width: 100%;
}

::v-deep .el-tabs__header {
  margin-bottom: 10px;
}
</style>
