<template>
  <div class="app-container venue-fee-detail-page">
    <div class="page-heading">
      <h2>三方场馆费用明细</h2>
      <el-button
        type="primary"
        plain
        icon="el-icon-download"
        :loading="exportLoading"
        @click="handleExport"
        v-hasPermi="['venue:feeDetail:export']"
      >
        导出报表
      </el-button>
    </div>

    <el-form :model="queryParams" ref="queryForm" :inline="true" class="filter-panel">
      <el-form-item>
        <el-input
          v-model="venueKeyword"
          size="small"
          clearable
          prefix-icon="el-icon-search"
          placeholder="搜索项目..."
          class="search-input"
        />
      </el-form-item>
      <el-form-item label="时间筛选：">
        <el-date-picker
          v-model="queryParams.startMonth"
          type="month"
          size="small"
          value-format="yyyy-MM"
          placeholder="开始月份"
          class="month-picker"
        />
        <span class="range-separator">至</span>
        <el-date-picker
          v-model="queryParams.endMonth"
          type="month"
          size="small"
          value-format="yyyy-MM"
          placeholder="结束月份"
          class="month-picker"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">
          查询
        </el-button>
      </el-form-item>
    </el-form>

    <div class="section-title">场馆费用 明细</div>

    <el-table
      v-loading="loading"
      :data="detailRows"
      border
      class="fee-detail-table"
      size="small"
      :cell-class-name="getCellClassName"
      empty-text=""
    >
      <el-table-column
        label="时间"
        prop="statMonth"
        width="180"
        align="center"
        fixed
      />
      <el-table-column
        label="三方场馆"
        prop="supplierName"
        width="130"
        align="center"
        fixed
      >
        <template slot-scope="scope">
          <span class="supplier-name">{{ scope.row.supplierName || 'SmartAPI' }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-for="venue in filteredVenueColumns"
        :key="venue.venueCode"
        :label="venue.venueName || venue.venueCode"
        min-width="170"
        align="center"
      >
        <template slot-scope="scope">
          <div class="fee-lines" v-if="getFeeItem(scope.row, venue.venueCode)">
            <div class="fee-line">
              <span class="line-label">自:</span>
              <span class="line-value">{{ formatMoney(getFeeItem(scope.row, venue.venueCode).selfFee) }}</span>
            </div>
            <div class="fee-line official-line">
              <span class="line-label">官:</span>
              <el-input-number
                v-if="canEditOfficial"
                v-model="getFeeItem(scope.row, venue.venueCode).officialFee"
                :min="0"
                :precision="2"
                :controls="false"
                size="mini"
                class="official-input"
                :disabled="isSaving(scope.row, venue.venueCode)"
                @blur="commitOfficialFee(scope.row, getFeeItem(scope.row, venue.venueCode))"
                @keyup.enter.native="commitOfficialFee(scope.row, getFeeItem(scope.row, venue.venueCode))"
              />
              <span v-else class="line-value">{{ formatMoney(getFeeItem(scope.row, venue.venueCode).officialFee) }}</span>
            </div>
            <div class="fee-line" :class="getAmountClass(getFeeItem(scope.row, venue.venueCode).diffFee)">
              <span class="line-label">差:</span>
              <span class="line-value">{{ formatSignedMoney(getFeeItem(scope.row, venue.venueCode).diffFee) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="总收益"
        width="180"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <div class="fee-lines total-lines">
            <div class="fee-line">
              <span class="line-label">自:</span>
              <span class="line-value">{{ formatMoney(scope.row.totalSelfFee) }}</span>
            </div>
            <div class="fee-line">
              <span class="line-label">官:</span>
              <span class="line-value">{{ formatMoney(scope.row.totalOfficialFee) }}</span>
            </div>
            <div class="fee-line" :class="getAmountClass(scope.row.totalDiffFee)">
              <span class="line-label">差:</span>
              <span class="line-value">{{ formatSignedMoney(scope.row.totalDiffFee) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>

      <template slot="empty">
        <div class="empty-state">
          <div class="empty-title">暂无费用明细</div>
          <div class="empty-desc">当前月份暂无费用记录</div>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { listVenueFeeDetail, saveVenueFeeOfficial, exportVenueFeeDetail } from '@/api/report/venueFeeDetail'

export default {
  name: 'VenueFeeDetail',
  data() {
    const month = this.getCurrentMonth()
    return {
      loading: false,
      exportLoading: false,
      venueKeyword: '',
      venueColumns: [],
      detailRows: [],
      officialSnapshot: {},
      savingMap: {},
      queryParams: {
        startMonth: month,
        endMonth: month
      }
    }
  },
  computed: {
    filteredVenueColumns() {
      const keyword = String(this.venueKeyword || '').trim().toLowerCase()
      if (!keyword) {
        return this.venueColumns
      }
      return this.venueColumns.filter(venue => {
        const code = String(venue.venueCode || '').toLowerCase()
        const name = String(venue.venueName || '').toLowerCase()
        return code.includes(keyword) || name.includes(keyword)
      })
    },
    canEditOfficial() {
      return this.$auth.hasPermi('venue:feeDetail:edit')
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      if (!this.validateMonthRange()) {
        return
      }
      this.loading = true
      listVenueFeeDetail(this.queryParams).then(response => {
        const data = response && response.data ? response.data : {}
        this.venueColumns = data.venueColumns || []
        this.detailRows = data.rows || []
        this.rebuildSnapshots()
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.getList()
    },
    handleExport() {
      if (!this.validateMonthRange()) {
        return
      }
      const params = {
        startMonth: this.queryParams.startMonth,
        endMonth: this.queryParams.endMonth,
        venueCodes: this.filteredVenueColumns.map(item => item.venueCode)
      }
      this.exportLoading = true
      exportVenueFeeDetail(params).then(data => {
        const fileName = `三方场馆费用明细_${params.startMonth}_${params.endMonth}.xlsx`
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        this.$download.saveAs(blob, fileName)
      }).finally(() => {
        this.exportLoading = false
      })
    },
    commitOfficialFee(row, item) {
      if (!row || !item || !this.canEditOfficial) {
        return
      }
      const key = this.buildSnapshotKey(row.statMonth, item.venueCode)
      if (this.savingMap[key]) {
        return
      }
      const previous = this.officialSnapshot[key] == null ? 0 : this.officialSnapshot[key]
      const next = this.normalizeMoney(item.officialFee)
      if (next < 0) {
        this.$set(item, 'officialFee', previous)
        this.recalculateRow(row)
        this.$message.warning('真实三方费用不能小于0')
        return
      }
      if (this.amountEquals(previous, next)) {
        this.$set(item, 'officialFee', next)
        this.recalculateRow(row)
        return
      }

      this.$set(this.savingMap, key, true)
      saveVenueFeeOfficial({
        statMonth: row.statMonth,
        venueCode: item.venueCode,
        venueName: item.venueName,
        officialFee: next
      }).then(response => {
        const saved = response && response.data ? response.data : {}
        this.applySavedItem(row, item, saved, next)
        this.$set(this.officialSnapshot, key, this.normalizeMoney(item.officialFee))
        this.$message.success('保存成功')
      }).catch(() => {
        this.$set(item, 'officialFee', previous)
        this.recalculateRow(row)
      }).finally(() => {
        this.$delete(this.savingMap, key)
      })
    },
    applySavedItem(row, item, saved, fallbackOfficialFee) {
      this.$set(item, 'monthlyWinLoss', this.normalizeMoney(saved.monthlyWinLoss != null ? saved.monthlyWinLoss : item.monthlyWinLoss))
      this.$set(item, 'feeRate', saved.feeRate != null ? saved.feeRate : item.feeRate)
      this.$set(item, 'selfFee', this.normalizeMoney(saved.selfFee != null ? saved.selfFee : item.selfFee))
      this.$set(item, 'officialFee', this.normalizeMoney(saved.officialFee != null ? saved.officialFee : fallbackOfficialFee))
      this.$set(item, 'diffFee', this.normalizeMoney(saved.diffFee != null ? saved.diffFee : (item.selfFee - item.officialFee)))
      this.recalculateRow(row)
    },
    recalculateRow(row) {
      let totalSelfFee = 0
      let totalOfficialFee = 0
      let totalDiffFee = 0
      Object.keys(row.venueFeeMap || {}).forEach(venueCode => {
        const item = row.venueFeeMap[venueCode]
        const selfFee = this.normalizeMoney(item.selfFee)
        const officialFee = this.normalizeMoney(item.officialFee)
        const diffFee = this.normalizeMoney(selfFee - officialFee)
        this.$set(item, 'selfFee', selfFee)
        this.$set(item, 'officialFee', officialFee)
        this.$set(item, 'diffFee', diffFee)
        totalSelfFee += selfFee
        totalOfficialFee += officialFee
        totalDiffFee += diffFee
      })
      this.$set(row, 'totalSelfFee', this.normalizeMoney(totalSelfFee))
      this.$set(row, 'totalOfficialFee', this.normalizeMoney(totalOfficialFee))
      this.$set(row, 'totalDiffFee', this.normalizeMoney(totalDiffFee))
    },
    rebuildSnapshots() {
      this.officialSnapshot = {}
      this.detailRows.forEach(row => {
        Object.keys(row.venueFeeMap || {}).forEach(venueCode => {
          const item = row.venueFeeMap[venueCode]
          this.$set(this.officialSnapshot, this.buildSnapshotKey(row.statMonth, venueCode), this.normalizeMoney(item.officialFee))
        })
      })
    },
    getFeeItem(row, venueCode) {
      return row && row.venueFeeMap ? row.venueFeeMap[venueCode] : null
    },
    isSaving(row, venueCode) {
      return !!this.savingMap[this.buildSnapshotKey(row.statMonth, venueCode)]
    },
    buildSnapshotKey(month, venueCode) {
      return `${month || ''}|${venueCode || ''}`
    },
    validateMonthRange() {
      if (!this.queryParams.startMonth || !this.queryParams.endMonth) {
        this.$message.warning('请选择月份')
        return false
      }
      if (this.queryParams.startMonth > this.queryParams.endMonth) {
        this.$message.warning('开始月份不能晚于结束月份')
        return false
      }
      return true
    },
    getCellClassName({ columnIndex }) {
      return columnIndex >= 2 ? 'fee-value-cell' : ''
    },
    getCurrentMonth() {
      const date = new Date()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}`
    },
    getAmountClass(value) {
      const amount = this.normalizeMoney(value)
      if (amount > 0) {
        return 'is-positive'
      }
      if (amount < 0) {
        return 'is-negative'
      }
      return 'is-zero'
    },
    formatMoney(value) {
      const amount = this.normalizeMoney(value)
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    formatSignedMoney(value) {
      const amount = this.normalizeMoney(value)
      const prefix = amount > 0 ? '+' : ''
      return `${prefix}${this.formatMoney(amount)}`
    },
    normalizeMoney(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) {
        return 0
      }
      return Math.round(number * 100) / 100
    },
    amountEquals(left, right) {
      return Math.abs(this.normalizeMoney(left) - this.normalizeMoney(right)) < 0.005
    }
  }
}
</script>

<style scoped>
.venue-fee-detail-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-heading h2 {
  position: relative;
  margin: 0;
  padding-left: 14px;
  color: #1f2d3d;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
}

.page-heading h2::before,
.section-title::before {
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 18px;
  background: #2563eb;
  border-radius: 2px;
  content: "";
  transform: translateY(-50%);
}

.filter-panel {
  margin-bottom: 22px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #dfe6ef;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(31, 45, 61, 0.04);
}

.search-input {
  width: 240px;
}

.month-picker {
  width: 150px;
}

.range-separator {
  display: inline-block;
  margin: 0 8px;
  color: #8a97a8;
}

.section-title {
  position: relative;
  margin: 0 0 14px;
  padding-left: 14px;
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 700;
}

.fee-detail-table {
  width: 100%;
  min-height: 170px;
  border-radius: 6px;
  overflow: hidden;
}

.supplier-name {
  color: #1d4ed8;
  font-weight: 700;
}

.fee-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
  padding: 4px 0;
}

.fee-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
  color: #334155;
  font-weight: 600;
}

.line-label {
  flex: 0 0 24px;
  color: #667085;
  text-align: left;
}

.line-value {
  flex: 1;
  text-align: right;
}

.official-input {
  width: 96px;
}

.official-line {
  gap: 8px;
}

.total-lines {
  min-width: 140px;
}

.is-positive {
  color: #059669;
}

.is-negative {
  color: #e11d48;
}

.is-zero {
  color: #94a3b8;
}

.empty-state {
  padding: 32px 0;
  color: #8a97a8;
  line-height: 1.7;
}

.empty-title {
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.empty-desc {
  font-size: 13px;
}

::v-deep .fee-detail-table th {
  background: #08a8c4;
  color: #ffffff;
  font-weight: 700;
}

::v-deep .fee-value-cell {
  vertical-align: middle;
}

::v-deep .official-input .el-input__inner {
  height: 22px;
  padding: 0 6px;
  text-align: right;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .search-input,
  .month-picker {
    width: 100%;
  }
}
</style>
