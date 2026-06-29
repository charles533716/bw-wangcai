<template>
  <div class="app-container venue-fee-page" v-loading="loading">
    <div class="site-switch-card">
      <div>
        <div class="site-switch-title">站点选择</div>
        <div class="site-switch-subtitle">当前查看：{{ currentSiteName || '-' }}</div>
      </div>
      <el-select
        v-model="currentSiteCode"
        filterable
        placeholder="请选择站点"
        class="site-select"
        @change="handleSiteChange"
      >
        <el-option
          v-for="site in siteOptions"
          :key="site.code"
          :label="site.name"
          :value="site.code"
        />
      </el-select>
    </div>

    <div class="page-hero">
      <div>
        <div class="eyebrow">Venue Fee Config</div>
        <h2>三方场馆设置</h2>
        <p>按站点独立配置场馆金额区间与手续费比例，保存后用于该站点三方场馆费计算。</p>
      </div>
      <div class="hero-actions">
        <el-button
          icon="el-icon-plus"
          type="primary"
          :disabled="!currentSiteCode || availableVenues.length === 0"
          @click="openAddVenueDialog"
          v-hasPermi="['venue:feeConfig:edit']"
        >
          新增馆
        </el-button>
        <el-button
          icon="el-icon-check"
          type="success"
          :loading="saving"
          @click="handleSave"
          v-hasPermi="['venue:feeConfig:edit']"
        >
          保存配置
        </el-button>
      </div>
    </div>

    <div class="hint-bar">
      <span>规则：首档起始金额必须为 0，下一档起始金额必须等于上一档封顶金额 + 1，最后一档封顶金额可留空表示无上限。</span>
      <span>当前站点可新增授权启用场馆：{{ availableVenues.length }} 个</span>
    </div>

    <el-empty v-if="venueItems.length === 0 && !loading" description="暂无三方场馆手续费配置">
      <el-button
        type="primary"
        :disabled="!currentSiteCode || availableVenues.length === 0"
        @click="openAddVenueDialog"
        v-hasPermi="['venue:feeConfig:edit']"
      >
        新增馆
      </el-button>
    </el-empty>

    <div v-else class="venue-grid">
      <section
        v-for="(venue, venueIndex) in venueItems"
        :key="venue.venueId"
        class="venue-card"
      >
        <div class="venue-card__header">
          <div>
            <div class="venue-title">{{ venue.venueName || venue.venueCode }}</div>
            <div class="venue-code">{{ venue.venueCode }}</div>
          </div>
          <div class="venue-card__actions">
            <el-button
              size="mini"
              type="primary"
              plain
              icon="el-icon-plus"
              @click="addRange(venue)"
              v-hasPermi="['venue:feeConfig:edit']"
            >
              增加区间
            </el-button>
            <el-button
              size="mini"
              type="danger"
              plain
              icon="el-icon-delete"
              @click="removeVenue(venue, venueIndex)"
              v-hasPermi="['venue:feeConfig:edit']"
            >
              删除场馆
            </el-button>
          </div>
        </div>

        <div class="range-head">
          <span>区间</span>
          <span>起始金额</span>
          <span>封顶金额</span>
          <span>手续费比例</span>
          <span>操作</span>
        </div>

        <div
          v-for="(range, rangeIndex) in venue.ranges"
          :key="range.localId"
          class="range-row"
        >
          <div class="range-label">区间{{ rangeIndex + 1 }}</div>
          <el-input-number
            v-model="range.startAmount"
            :min="0"
            :precision="0"
            :controls="false"
            size="small"
            placeholder="起始金额"
            class="amount-input"
          />
          <el-input-number
            v-model="range.endAmount"
            :min="range.startAmount || 0"
            :precision="0"
            :controls="false"
            size="small"
            placeholder="留空表示无上限"
            class="amount-input"
          />
          <div class="rate-field">
            <el-input-number
              v-model="range.feeRate"
              :min="0"
              :max="100"
              :precision="4"
              :controls="false"
              size="small"
              placeholder="手续费"
              class="rate-input"
            />
            <span>%</span>
          </div>
          <el-button
            size="mini"
            type="text"
            class="danger-link"
            :disabled="venue.ranges.length === 1"
            @click="removeRange(venue, rangeIndex)"
            v-hasPermi="['venue:feeConfig:edit']"
          >
            删除
          </el-button>
        </div>
      </section>
    </div>

    <el-dialog
      title="新增场馆"
      :visible.sync="addVenueOpen"
      width="420px"
      append-to-body
    >
      <el-form label-width="86px">
        <el-form-item label="启用场馆">
          <el-select
            v-model="selectedVenueId"
            filterable
            placeholder="请选择正在启用且未配置的场馆"
            style="width: 100%;"
          >
            <el-option
              v-for="venue in availableVenues"
              :key="venue.venueId"
              :label="formatVenueOption(venue)"
              :value="venue.venueId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVenueOpen = false">取消</el-button>
        <el-button type="primary" @click="confirmAddVenue">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getVenueFeeConfig, updateVenueFeeConfig } from "@/api/report/venueFeeConfig"
import { listSite } from "@/api/site/site"

export default {
  name: "VenueFeeConfig",
  data() {
    return {
      loading: false,
      saving: false,
      addVenueOpen: false,
      selectedVenueId: null,
      currentSiteCode: null,
      siteOptions: [],
      venueItems: [],
      availableVenues: [],
      localIdSeed: 1
    }
  },
  created() {
    this.loadSites()
  },
  methods: {
    loadSites() {
      this.loading = true
      listSite({ pageNum: 1, pageSize: 1000, status: '1' }).then(response => {
        const rows = response && response.rows ? response.rows : []
        this.siteOptions = rows.filter(site => site && site.code).map(site => {
          return {
            code: site.code,
            name: site.nameZn || site.nameEn || site.code
          }
        })
        if (this.siteOptions.length > 0) {
          this.currentSiteCode = this.siteOptions[0].code
          return this.loadConfig()
        }
        this.applyConfig({})
        return null
      }).finally(() => {
        this.loading = false
      })
    },
    loadConfig() {
      if (!this.currentSiteCode) {
        this.applyConfig({})
        return Promise.resolve()
      }
      this.loading = true
      return getVenueFeeConfig(this.currentSiteCode).then(response => {
        this.applyConfig(response && response.data ? response.data : {})
      }).finally(() => {
        this.loading = false
      })
    },
    handleSiteChange() {
      this.addVenueOpen = false
      this.selectedVenueId = null
      this.loadConfig()
    },
    applyConfig(data) {
      this.venueItems = (data.venueItems || []).map(item => {
        return {
          venueId: item.venueId,
          venueCode: item.venueCode,
          venueName: item.venueName,
          venueSort: item.venueSort,
          ranges: (item.ranges || []).map(range => this.normalizeRange(range))
        }
      }).sort((left, right) => this.compareVenueSort(left, right))
      this.availableVenues = (data.availableVenues || []).map(item => {
        return {
          venueId: item.venueId,
          venueCode: item.venueCode,
          venueName: item.venueName,
          venueSort: item.venueSort
        }
      }).sort((left, right) => this.compareVenueSort(left, right))
    },
    normalizeRange(range) {
      return {
        id: range.id,
        localId: this.localIdSeed++,
        startAmount: this.toNumberOrNull(range.startAmount),
        endAmount: this.toNumberOrNull(range.endAmount),
        feeRate: this.toNumberOrNull(range.feeRate),
        sortOrder: this.toNumberOrNull(range.sortOrder)
      }
    },
    openAddVenueDialog() {
      if (this.availableVenues.length === 0) {
        this.$message.warning("暂无可新增启用场馆")
        return
      }
      this.selectedVenueId = this.availableVenues[0].venueId
      this.addVenueOpen = true
    },
    confirmAddVenue() {
      const index = this.availableVenues.findIndex(item => item.venueId === this.selectedVenueId)
      if (index < 0) {
        this.$message.warning("请选择可新增的启用场馆")
        return
      }
      const venue = this.availableVenues.splice(index, 1)[0]
      this.venueItems.push({
        venueId: venue.venueId,
        venueCode: venue.venueCode,
        venueName: venue.venueName,
        venueSort: venue.venueSort,
        ranges: [
          {
            id: null,
            localId: this.localIdSeed++,
            startAmount: 0,
            endAmount: 0,
            feeRate: 0,
            sortOrder: 1
          }
        ]
      })
      this.venueItems.sort((left, right) => this.compareVenueSort(left, right))
      this.addVenueOpen = false
      this.selectedVenueId = null
    },
    addRange(venue) {
      const lastRange = venue.ranges[venue.ranges.length - 1]
      if (!lastRange || this.isBlank(lastRange.endAmount)) {
        this.$message.warning("请先填写上一档封顶金额，再增加新区间")
        return
      }
      const endAmount = Number(lastRange.endAmount)
      if (!Number.isInteger(endAmount) || endAmount < Number(lastRange.startAmount)) {
        this.$message.warning("上一档封顶金额必须是不小于起始金额的整数")
        return
      }
      venue.ranges.push({
        id: null,
        localId: this.localIdSeed++,
        startAmount: endAmount + 1,
        endAmount: null,
        feeRate: 0,
        sortOrder: venue.ranges.length + 1
      })
    },
    removeRange(venue, rangeIndex) {
      if (venue.ranges.length === 1) {
        this.$message.warning("每个场馆至少保留一个区间")
        return
      }
      venue.ranges.splice(rangeIndex, 1)
      this.reindexRanges(venue)
    },
    removeVenue(venue, venueIndex) {
      this.$modal.confirm(`是否确认删除"${venue.venueName || venue.venueCode}"的手续费配置？`).then(() => {
        this.venueItems.splice(venueIndex, 1)
        if (!this.availableVenues.some(item => item.venueId === venue.venueId)) {
          this.availableVenues.push({
            venueId: venue.venueId,
            venueCode: venue.venueCode,
            venueName: venue.venueName,
            venueSort: venue.venueSort
          })
          this.sortAvailableVenues()
        }
      }).catch(() => {})
    },
    reindexRanges(venue) {
      venue.ranges.forEach((range, index) => {
        range.sortOrder = index + 1
      })
    },
    sortAvailableVenues() {
      this.availableVenues.sort((left, right) => this.compareVenueSort(left, right))
    },
    compareVenueSort(left, right) {
      const leftSort = this.toNumberOrNull(left.venueSort) || 0
      const rightSort = this.toNumberOrNull(right.venueSort) || 0
      if (leftSort !== rightSort) {
        return rightSort - leftSort
      }
      return this.formatVenueOption(left).localeCompare(this.formatVenueOption(right), "zh-Hans-CN")
    },
    handleSave() {
      if (!this.currentSiteCode) {
        this.$message.warning("请先选择站点")
        return
      }
      const payload = this.buildPayload()
      if (!payload) {
        return
      }
      this.saving = true
      updateVenueFeeConfig(this.currentSiteCode, payload).then(response => {
        this.$message.success("保存成功")
        this.applyConfig(response && response.data ? response.data : {})
      }).finally(() => {
        this.saving = false
      })
    },
    buildPayload() {
      const seenVenueIds = {}
      const venueItems = []
      for (let i = 0; i < this.venueItems.length; i++) {
        const venue = this.venueItems[i]
        const venueLabel = venue.venueName || venue.venueCode || `第${i + 1}个场馆`
        if (seenVenueIds[venue.venueId]) {
          this.$message.error(`${venueLabel} 重复配置，请删除重复场馆`)
          return null
        }
        seenVenueIds[venue.venueId] = true
        if (!venue.ranges || venue.ranges.length === 0) {
          this.$message.error(`${venueLabel} 至少需要配置一个金额区间`)
          return null
        }
        const ranges = []
        let expectedStart = 0
        for (let j = 0; j < venue.ranges.length; j++) {
          const normalized = this.normalizePayloadRange(venueLabel, venue.ranges[j], j, venue.ranges.length, expectedStart)
          if (!normalized) {
            return null
          }
          ranges.push(normalized)
          if (normalized.endAmount !== null) {
            expectedStart = normalized.endAmount + 1
          }
        }
        venueItems.push({
          venueId: venue.venueId,
          venueCode: venue.venueCode,
          ranges: ranges
        })
      }
      return { venueItems: venueItems }
    },
    normalizePayloadRange(venueLabel, range, rangeIndex, rangeCount, expectedStart) {
      const lineLabel = `${venueLabel} 区间${rangeIndex + 1}`
      const startAmount = this.parseInteger(range.startAmount)
      if (startAmount === null) {
        this.$message.error(`${lineLabel} 的起始金额必须是整数`)
        return null
      }
      if (startAmount < 0) {
        this.$message.error(`${lineLabel} 的起始金额不能小于 0`)
        return null
      }
      if (startAmount !== expectedStart) {
        this.$message.error(`${lineLabel} 的起始金额应为 ${expectedStart}`)
        return null
      }
      let endAmount = null
      if (!this.isBlank(range.endAmount)) {
        endAmount = this.parseInteger(range.endAmount)
        if (endAmount === null) {
          this.$message.error(`${lineLabel} 的封顶金额必须是整数`)
          return null
        }
        if (endAmount < startAmount) {
          this.$message.error(`${lineLabel} 的封顶金额不能小于起始金额`)
          return null
        }
      }
      if (endAmount === null && rangeIndex !== rangeCount - 1) {
        this.$message.error(`${lineLabel} 不是最后一档，必须填写封顶金额`)
        return null
      }
      const feeRate = this.parseNumber(range.feeRate)
      if (feeRate === null) {
        this.$message.error(`${lineLabel} 的手续费比例必填`)
        return null
      }
      if (feeRate < 0 || feeRate > 100) {
        this.$message.error(`${lineLabel} 的手续费比例必须在 0 到 100 之间`)
        return null
      }
      return {
        id: range.id,
        startAmount: startAmount,
        endAmount: endAmount,
        feeRate: feeRate,
        sortOrder: rangeIndex + 1
      }
    },
    parseInteger(value) {
      if (this.isBlank(value)) {
        return null
      }
      const numberValue = Number(value)
      return Number.isInteger(numberValue) ? numberValue : null
    },
    parseNumber(value) {
      if (this.isBlank(value)) {
        return null
      }
      const numberValue = Number(value)
      return Number.isFinite(numberValue) ? numberValue : null
    },
    toNumberOrNull(value) {
      if (this.isBlank(value)) {
        return null
      }
      return Number(value)
    },
    isBlank(value) {
      return value === null || value === undefined || value === ""
    },
    formatVenueOption(venue) {
      const name = venue.venueName || venue.venueCode || venue.venueId
      return venue.venueCode ? `${name}（${venue.venueCode}）` : String(name)
    }
  },
  computed: {
    currentSiteName() {
      const site = this.siteOptions.find(item => item.code === this.currentSiteCode)
      return site ? site.name : this.currentSiteCode
    }
  }
}
</script>

<style scoped>
.venue-fee-page {
  min-height: calc(100vh - 84px);
  background: linear-gradient(135deg, #f5f8fc 0%, #eef4fb 48%, #f7fbf3 100%);
}

.site-switch-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, .9);
  border: 1px solid rgba(116, 141, 166, .18);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(39, 79, 124, .08);
}

.site-switch-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e2a36;
}

.site-switch-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #7b8da3;
}

.site-select {
  width: 260px;
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  margin-bottom: 16px;
  color: #1e2a36;
  background:
    radial-gradient(circle at 18% 20%, rgba(65, 145, 255, .2), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #eef7ff 55%, #f7fff0 100%);
  border: 1px solid rgba(57, 113, 166, .12);
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(33, 81, 130, .12);
}

.page-hero h2 {
  margin: 4px 0 8px;
  font-size: 26px;
  font-weight: 700;
}

.page-hero p {
  margin: 0;
  color: #6d7b8a;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #2f80ed;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.hint-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 18px;
  color: #53606d;
  background: rgba(255, 255, 255, .78);
  border: 1px solid rgba(116, 141, 166, .18);
  border-radius: 12px;
}

.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(620px, 1fr));
  gap: 18px;
}

.venue-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(127, 150, 174, .18);
  border-radius: 18px;
  box-shadow: 0 16px 38px rgba(39, 79, 124, .1);
}

.venue-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f8fbff 0%, #f1f7ff 100%);
  border-bottom: 1px solid #edf1f6;
}

.venue-title {
  font-size: 17px;
  font-weight: 700;
  color: #233044;
}

.venue-code {
  margin-top: 4px;
  font-size: 12px;
  color: #7a8796;
}

.venue-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.range-head,
.range-row {
  display: grid;
  grid-template-columns: 92px minmax(120px, 1fr) minmax(120px, 1fr) minmax(130px, 1fr) 72px;
  align-items: center;
  gap: 12px;
}

.range-head {
  padding: 12px 20px;
  color: #7c8895;
  font-size: 12px;
  font-weight: 700;
  background: #fbfcfe;
  border-bottom: 1px solid #edf1f6;
}

.range-row {
  padding: 12px 20px;
  border-bottom: 1px dashed #e4eaf1;
}

.range-row:last-child {
  border-bottom: 0;
}

.range-label {
  font-weight: 700;
  color: #536273;
}

.amount-input,
.rate-input {
  width: 100%;
}

.rate-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-field span {
  font-weight: 700;
  color: #627284;
}

.danger-link {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .page-hero,
  .hint-bar,
  .venue-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .venue-grid {
    grid-template-columns: 1fr;
  }

  .range-head {
    display: none;
  }

  .range-row {
    grid-template-columns: 1fr;
  }
}
</style>
