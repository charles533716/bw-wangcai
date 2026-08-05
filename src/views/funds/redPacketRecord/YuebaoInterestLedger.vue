<template>
  <div class="interest-ledger">
    <div class="interest-toolbar">
      <div class="interest-toolbar__title">
        <strong>余额宝利息发放记录</strong>
        <span>余额宝每日复利计息</span>
      </div>
      <div class="interest-toolbar__actions">
        <el-button size="small" icon="el-icon-refresh" @click="resetQuery">刷新</el-button>
        <el-button size="small" type="primary" icon="el-icon-setting" @click="showRuleDialog = true">余额宝规则配置</el-button>
        <el-button size="small" @click="exportRows">导出</el-button>
        <el-button size="small" disabled>下载文件</el-button>
      </div>
    </div>

    <div class="interest-summary">
      <div class="interest-summary__card">
        <span>计息本金快照合计</span>
        <strong>{{ money(summary.principal) }} CNY</strong>
        <small>按当前筛选条件汇总本金快照</small>
      </div>
      <div class="interest-summary__card">
        <span>累计派发利息</span>
        <strong>{{ money(summary.interest) }} CNY</strong>
        <small>按复利公式生成的利息合计</small>
      </div>
      <div class="interest-summary__card">
        <span>受益会员数</span>
        <strong>{{ summary.members }} 人</strong>
        <small>当前筛选条件下的去重会员数</small>
      </div>
    </div>

    <section class="interest-panel">
      <el-form :inline="true" size="small" class="interest-filter">
        <el-form-item>
          <el-input v-model.trim="query.keyword" clearable prefix-icon="el-icon-search" placeholder="单号/会员/站点/代理" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="query.site" clearable placeholder="所属站点">
            <el-option label="旺财体育" value="旺财体育" />
            <el-option label="DW体育" value="DW体育" />
            <el-option label="财神体育" value="财神体育" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="query.member" clearable placeholder="会员账号" />
        </el-form-item>
        <el-form-item>
          <el-input v-model.trim="query.agent" clearable placeholder="上级代理" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="query.status" clearable placeholder="发放状态">
            <el-option label="已派发到账" value="已派发到账" />
            <el-option label="派发失败" value="派发失败" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="query.range"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="applyQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="pagedRows"
        border
        stripe
        show-summary
        :summary-method="getInterestSummaries"
      >
        <el-table-column prop="settlementNo" label="利息结算单号" min-width="190" show-overflow-tooltip />
        <el-table-column prop="site" label="适用子站" min-width="110" />
        <el-table-column prop="member" label="会员账号" min-width="120" />
        <el-table-column prop="agent" label="上级代理" min-width="120" />
        <el-table-column prop="principal" label="本金快照" min-width="110" align="right">
          <template slot-scope="scope">{{ money(scope.row.principal) }}</template>
        </el-table-column>
        <el-table-column prop="historyInterest" label="历史利息快照" min-width="120" align="right">
          <template slot-scope="scope">{{ money(scope.row.historyInterest) }}</template>
        </el-table-column>
        <el-table-column prop="interestBase" label="计息基数" min-width="110" align="right">
          <template slot-scope="scope">{{ money(scope.row.interestBase) }}</template>
        </el-table-column>
        <el-table-column prop="annualRate" label="年化利率" min-width="90" align="right" />
        <el-table-column prop="issuedInterest" label="派发利息" min-width="100" align="right">
          <template slot-scope="scope"><strong class="interest-value">+{{ money(scope.row.issuedInterest) }}</strong></template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="发放后利息余额" min-width="125" align="right">
          <template slot-scope="scope">{{ money(scope.row.balanceAfter) }}</template>
        </el-table-column>
        <el-table-column prop="turnoverMultiple" label="流水倍数" min-width="90" align="center" />
        <el-table-column prop="status" label="发放状态" min-width="110">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.status === '已派发到账' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issuedAt" label="利息发放时间" min-width="165" />
      </el-table>

      <pagination
        v-show="filteredRows.length > 0"
        :total="filteredRows.length"
        :page.sync="pageNum"
        :limit.sync="pageSize"
      />
    </section>

    <el-dialog title="余额宝规则配置" :visible.sync="showRuleDialog" width="520px" append-to-body>
      <el-form label-width="130px">
        <el-form-item label="默认年化利率">
          <el-input value="4.25"><template slot="append">%</template></el-input>
        </el-form-item>
        <el-form-item label="默认流水倍数">
          <el-input value="3"><template slot="append">倍</template></el-input>
        </el-form-item>
        <el-form-item label="每日派发时间">
          <el-time-picker value="00:00:00" value-format="HH:mm:ss" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRules">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const sites = ['旺财体育', 'DW体育', '财神体育']
const members = ['charles03', 'dengji000', 'xianzhi100', 'dlwc0011', 'testhd021', 'test1117']
const agents = ['--', 'dailiwc001a', 'dailiwc001']

function createRows() {
  return Array.from({ length: 36 }, (_, index) => {
    const principal = [5000, 3000, 200, 10799.48, 919.36, 2000][index % 6]
    const historyInterest = Number(((index % 5) * 1.37).toFixed(2))
    const annualRate = index < 4 ? 10 : 4.25
    const issuedInterest = Number(((principal + historyInterest) * annualRate / 36500).toFixed(2))
    const day = String(29 - (index % 12)).padStart(2, '0')
    return {
      settlementNo: `YEB202607${day}${String(index + 1).padStart(10, '0')}`,
      site: sites[index % sites.length],
      member: members[index % members.length],
      agent: agents[index % agents.length],
      principal,
      historyInterest,
      interestBase: Number((principal + historyInterest).toFixed(2)),
      annualRate: `${annualRate.toFixed(2)} %`,
      issuedInterest,
      balanceAfter: Number((historyInterest + issuedInterest).toFixed(2)),
      turnoverMultiple: `${index < 4 ? 10 : 3} 倍`,
      status: index === 17 ? '派发失败' : '已派发到账',
      issuedAt: `2026-07-${day} ${index % 3 === 0 ? '13:00:00' : '00:00:00'}`
    }
  })
}

function defaultQuery() {
  return { keyword: '', site: '', member: '', agent: '', status: '', range: [] }
}

export default {
  name: 'YuebaoInterestLedger',
  data() {
    return {
      query: defaultQuery(),
      appliedQuery: defaultQuery(),
      rows: createRows(),
      pageNum: 1,
      pageSize: 10,
      showRuleDialog: false
    }
  },
  computed: {
    filteredRows() {
      const query = this.appliedQuery
      const keyword = String(query.keyword || '').toLowerCase()
      return this.rows.filter(row => {
        const searchable = [row.settlementNo, row.member, row.site, row.agent].join(' ').toLowerCase()
        if (keyword && !searchable.includes(keyword)) return false
        if (query.site && row.site !== query.site) return false
        if (query.member && !row.member.toLowerCase().includes(query.member.toLowerCase())) return false
        if (query.agent && !row.agent.toLowerCase().includes(query.agent.toLowerCase())) return false
        if (query.status && row.status !== query.status) return false
        if (query.range && query.range.length === 2) {
          if (row.issuedAt < query.range[0] || row.issuedAt > query.range[1]) return false
        }
        return true
      })
    },
    pagedRows() {
      const start = (this.pageNum - 1) * this.pageSize
      return this.filteredRows.slice(start, start + this.pageSize)
    },
    summary() {
      const members = new Set(this.filteredRows.map(row => row.member)).size
      return {
        principal: this.filteredRows.reduce((sum, row) => sum + row.principal, 0),
        interest: this.filteredRows.reduce((sum, row) => sum + row.issuedInterest, 0),
        members
      }
    }
  },
  methods: {
    applyQuery() {
      this.appliedQuery = { ...this.query, range: [...(this.query.range || [])] }
      this.pageNum = 1
    },
    resetQuery() {
      this.query = defaultQuery()
      this.appliedQuery = defaultQuery()
      this.pageNum = 1
    },
    exportRows() {
      this.$message.success(`已导出 ${this.filteredRows.length} 条余额宝利息发放记录`)
    },
    saveRules() {
      this.showRuleDialog = false
      this.$message.success('余额宝规则配置已保存')
    },
    getInterestSummaries({ columns }) {
      const amountFields = new Set([
        'principal',
        'historyInterest',
        'interestBase',
        'issuedInterest',
        'balanceAfter'
      ])

      return columns.map((column, index) => {
        if (index === 0) return '总计'
        if (!amountFields.has(column.property)) return ''
        const total = this.filteredRows.reduce((sum, row) => {
          return sum + Number(row[column.property] || 0)
        }, 0)
        return this.money(total)
      })
    },
    money(value) {
      return Number(value || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.interest-ledger {
  color: #1f2d3d;
}

.interest-toolbar,
.interest-panel,
.interest-summary__card {
  background: #fff;
  border: 1px solid #e4e9f1;
  border-radius: 8px;
}

.interest-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

.interest-toolbar__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.interest-toolbar__title strong {
  font-size: 20px;
}

.interest-toolbar__title span {
  color: #8b98aa;
}

.interest-toolbar__actions {
  display: flex;
  gap: 8px;
}

.interest-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.interest-summary__card {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 18px;
}

.interest-summary__card span {
  color: #596879;
  font-weight: 600;
}

.interest-summary__card strong {
  font-size: 25px;
}

.interest-summary__card small,
.interest-value {
  color: #059669;
}

.interest-panel {
  padding: 14px;
}

::v-deep .el-table__footer-wrapper td {
  color: #303133;
  font-weight: 600;
  background: #f5f7fa;
}

.interest-filter {
  padding: 12px 12px 0;
  margin-bottom: 12px;
  background: #f7f9fc;
  border-radius: 6px;
}

@media (max-width: 1100px) {
  .interest-toolbar,
  .interest-toolbar__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .interest-summary {
    grid-template-columns: 1fr;
  }
}
</style>
