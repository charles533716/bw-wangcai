<template>
  <div class="participation-page">
    <section class="participation-filter">
      <el-form :model="query" inline @submit.native.prevent>
        <el-form-item label="站点">
          <el-select v-model="query.site" clearable placeholder="站点编码">
            <el-option v-for="site in sites" :key="site.code" :label="site.name" :value="site.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model.trim="query.member" clearable placeholder="会员名称/ID" />
        </el-form-item>
        <el-form-item label="活动">
          <el-input v-model.trim="query.activity" clearable placeholder="活动名称/编码" />
        </el-form-item>
        <el-form-item label="参与状态">
          <el-select v-model="query.participationStatus" clearable placeholder="全部">
            <el-option label="进行中" value="ACTIVE" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="上分状态">
          <el-select v-model="query.transferStatus" clearable placeholder="全部">
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失败" value="FAILED" />
          </el-select>
        </el-form-item>
        <el-form-item label="锁定状态">
          <el-select v-model="query.lockStatus" clearable placeholder="全部">
            <el-option label="已锁定" value="LOCKED" />
            <el-option label="已解锁" value="UNLOCKED" />
          </el-select>
        </el-form-item>
        <div class="filter-actions">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>
      </el-form>
    </section>

    <section class="participation-table-card">
      <el-table :data="pagedRows" border :header-cell-style="headerStyle">
        <el-table-column prop="participationTime" label="参与时间" min-width="168" />
        <el-table-column prop="siteCode" label="站点" width="92" />
        <el-table-column label="会员" min-width="140">
          <template slot-scope="{ row }">{{ row.memberName }} ({{ row.memberId }})</template>
        </el-table-column>
        <el-table-column prop="activityName" label="活动" min-width="190" />
        <el-table-column prop="venueName" label="指定场馆" min-width="120" />
        <el-table-column prop="principal" label="本金" width="90" align="right" />
        <el-table-column prop="bonus" label="彩金" width="90" align="right" />
        <el-table-column prop="requiredTurnover" label="所需流水" width="110" align="right" />
        <el-table-column prop="completedTurnover" label="已完成流水" width="112" align="right" />
        <el-table-column prop="participationStatus" label="参与状态" width="112" />
        <el-table-column prop="transferStatus" label="上分状态" width="105" />
        <el-table-column prop="lockStatus" label="锁定状态" width="105" />
        <el-table-column prop="exception" label="异常" min-width="110" />
        <el-table-column label="操作" width="212" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="openDetail(row)">详情</el-button>
            <el-button type="text" @click="refreshTurnover(row)">刷新流水</el-button>
            <el-button
              v-if="row.lockStatus === 'LOCKED'"
              type="text"
              class="unlock-button"
              @click="openManualUnlock(row)"
            >
              人工解锁
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <span>共 {{ filteredRows.length }} 条</span>
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper"
          :page-sizes="[20, 50, 100]"
          :page-size.sync="pageSize"
          :current-page.sync="pageNum"
          :total="filteredRows.length"
        />
      </div>
    </section>

    <el-dialog title="首存参与详情" :visible.sync="detailVisible" width="760px" append-to-body>
      <el-descriptions v-if="currentRow" :column="2" border>
        <el-descriptions-item label="参与ID">{{ currentRow.id }}</el-descriptions-item>
        <el-descriptions-item label="幂等请求号">{{ currentRow.requestNo }}</el-descriptions-item>
        <el-descriptions-item label="转账单号">{{ currentRow.transferNo }}</el-descriptions-item>
        <el-descriptions-item label="场馆API编码">{{ currentRow.venueApiCode }}</el-descriptions-item>
        <el-descriptions-item label="解锁原因">{{ currentRow.unlockReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="失败/异常原因">{{ currentRow.exception || '-' }}</el-descriptions-item>
        <el-descriptions-item label="配置快照" :span="2">
          <pre class="snapshot-text">{{ currentRow.snapshot }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <h3 class="log-title">操作日志</h3>
      <el-table v-if="currentRow" :data="currentRow.logs" border>
        <el-table-column prop="time" label="时间" width="190" />
        <el-table-column prop="event" label="事件" width="145" />
        <el-table-column prop="amount" label="金额" width="90" />
        <el-table-column prop="description" label="说明" min-width="220" />
        <el-table-column prop="operator" label="操作人" width="120" />
      </el-table>
    </el-dialog>

    <el-dialog title="人工解锁" :visible.sync="unlockVisible" width="380px" append-to-body>
      <div class="unlock-label">请输入人工解锁原因（将写入审计日志）</div>
      <el-input v-model.trim="unlockReason" maxlength="100" show-word-limit />
      <span slot="footer">
        <el-button @click="unlockVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmManualUnlock">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const SITES = [
  { code: '2222', name: '旺财体育' },
  { code: '333333', name: '财神体育' },
  { code: 'DW', name: 'DW体育' }
]

function createRows() {
  const venues = ['God彩票', '旺财真人', '熊猫体育']
  return Array.from({ length: 27 }, (_, index) => {
    const locked = index === 3 || index === 4 || index % 9 === 0
    const principal = [10, 3000, 100, 200, 915][index % 5]
    const bonus = [3, 1500, 30, 70, 622.2][index % 5]
    const id = 13 + index
    return {
      id,
      participationTime: `2026-07-${String(28 - (index % 10)).padStart(2, '0')} ${String(10 + (index % 8)).padStart(2, '0')}:45:09`,
      siteCode: SITES[index % SITES.length].code,
      memberName: `testhd${String(300 - index).padStart(3, '0')}`,
      memberId: 1481 + index,
      activityName: index % 3 === 0 ? '彩票首存等你来战' : '体育首存送68%最高2000元',
      activityCode: `ACT202607${11547087718 + index}`,
      venueName: venues[index % venues.length],
      principal,
      bonus,
      requiredTurnover: Math.round((principal + bonus) * 12),
      completedTurnover: locked ? 0 : Math.round((principal + bonus) * 12),
      participationStatus: locked ? 'ACTIVE' : 'COMPLETED',
      transferStatus: 'SUCCESS',
      lockStatus: locked ? 'LOCKED' : 'UNLOCKED',
      exception: '',
      requestNo: `fd-20260728-${1481 + index}-${357085 + index}`,
      transferNo: `4db6c961cc834ba0ad627aa546b${String(172 + index)}a2`,
      venueApiCode: index % 3 === 0 ? 'LOTTERY' : 'SPORT',
      unlockReason: locked ? 'VENUE_BALANCE_DEPLETED' : '',
      snapshot: JSON.stringify({
        activityCode: `ACT202607${11547087718 + index}`,
        fixedGiftAmount: 0,
        giftCap: 200,
        giftMode: 'RATE',
        giftRate: 30,
        termsOfThreshold: 10,
        turnoverMultiple: 12
      }),
      logs: [
        { time: '2026-07-28 10:45:09', event: 'RESERVED', amount: principal, description: '资格预占并扣除本金', operator: 'system' },
        { time: '2026-07-28 10:45:10', event: 'TRANSFER_SUCCESS', amount: principal + bonus, description: '本金和彩金已上分到指定场馆', operator: 'system' }
      ]
    }
  })
}

function defaultQuery() {
  return { site: '', member: '', activity: '', participationStatus: '', transferStatus: '', lockStatus: '' }
}

export default {
  name: 'FirstDepositParticipation',
  data() {
    return {
      sites: SITES,
      query: defaultQuery(),
      appliedQuery: defaultQuery(),
      rows: createRows(),
      pageNum: 1,
      pageSize: 20,
      detailVisible: false,
      unlockVisible: false,
      currentRow: null,
      unlockReason: ''
    }
  },
  computed: {
    filteredRows() {
      const query = this.appliedQuery
      const contains = (value, keyword) => !keyword || String(value).toLowerCase().includes(String(keyword).toLowerCase())
      return this.rows.filter(row =>
        (!query.site || row.siteCode === query.site) &&
        (contains(row.memberName, query.member) || contains(row.memberId, query.member)) &&
        (contains(row.activityName, query.activity) || contains(row.activityCode, query.activity)) &&
        (!query.participationStatus || row.participationStatus === query.participationStatus) &&
        (!query.transferStatus || row.transferStatus === query.transferStatus) &&
        (!query.lockStatus || row.lockStatus === query.lockStatus)
      )
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    }
  },
  methods: {
    headerStyle() {
      return { background: '#f6f8fb', color: '#42526a', fontWeight: '600' }
    },
    handleQuery() {
      this.appliedQuery = { ...this.query }
      this.pageNum = 1
    },
    resetQuery() {
      this.query = defaultQuery()
      this.appliedQuery = defaultQuery()
      this.pageNum = 1
    },
    openDetail(row) {
      this.currentRow = row
      this.detailVisible = true
    },
    refreshTurnover(row) {
      row.completedTurnover = Math.min(row.requiredTurnover, row.completedTurnover + Math.ceil(row.requiredTurnover * 0.25))
      this.$message.success('流水刷新完成')
    },
    openManualUnlock(row) {
      this.currentRow = row
      this.unlockReason = ''
      this.unlockVisible = true
    },
    confirmManualUnlock() {
      if (!this.unlockReason) {
        this.$message.warning('请输入人工解锁原因')
        return
      }
      const row = this.currentRow
      row.lockStatus = 'UNLOCKED'
      row.participationStatus = 'COMPLETED'
      row.completedTurnover = row.requiredTurnover
      row.unlockReason = this.unlockReason
      row.logs.push({
        time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        event: 'MANUAL_UNLOCK',
        amount: row.principal + row.bonus,
        description: this.unlockReason,
        operator: 'admin'
      })
      this.unlockVisible = false
      this.$message.success('人工解锁成功')
    }
  }
}
</script>

<style scoped>
.participation-page {
  margin-top: 10px;
}

.participation-filter,
.participation-table-card {
  border: 1px solid #e3ebf5;
  border-radius: 12px;
  background: #fff;
}

.participation-filter {
  padding: 16px 18px 4px;
}

.participation-filter .el-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0 14px;
}

.participation-filter .el-form-item {
  margin-right: 0;
  margin-bottom: 12px;
}

.participation-filter .el-input,
.participation-filter .el-select {
  width: 165px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin: 0 0 12px auto;
}

.filter-actions .el-button {
  width: 76px;
  margin: 0;
}

.participation-table-card {
  margin-top: 16px;
  padding: 14px;
}

.unlock-button {
  color: #f56c6c;
}

.pagination-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  padding-top: 14px;
  color: #66758a;
}

.snapshot-text {
  max-height: 100px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
}

.log-title {
  margin: 18px 0 10px;
  font-size: 14px;
}

.unlock-label {
  margin-bottom: 14px;
  color: #5d6778;
}
</style>
