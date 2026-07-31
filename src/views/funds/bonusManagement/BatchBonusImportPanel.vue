<template>
  <div class="batch-bonus-import-panel">
    <div class="batch-file-actions">
      <el-button icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>
      <el-upload
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :file-list="uploadFileList"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
      >
        <el-button icon="el-icon-upload2">
          {{ uploadedFileName ? '重新上传' : '上传文件' }}
        </el-button>
      </el-upload>
      <span v-if="uploadedFileName" class="uploaded-file-name">{{ uploadedFileName }}</span>
    </div>

    <div v-if="batchResult" class="batch-result-wrap">
      <el-alert
        :title="`文件“${uploadedFileName}”校验完成，正常数据可继续发放${showWarning ? '，警告数据需确认处理' : ''}，异常数据不会参与发放。`"
        type="success"
        :closable="false"
        show-icon
      />

      <div class="batch-stat-grid" :class="{ 'without-warning': !showWarning }">
        <div class="batch-stat-card neutral">
          <span>导入总数</span>
          <strong>{{ batchResult.total }}</strong>
        </div>
        <div class="batch-stat-card success">
          <span>正常数据</span>
          <strong>{{ batchResult.validRows.length }}</strong>
        </div>
        <div v-if="showWarning" class="batch-stat-card warning">
          <span>警告数据</span>
          <strong>{{ batchResult.warningRows.length }}</strong>
        </div>
        <div class="batch-stat-card danger">
          <span>异常数据</span>
          <strong>{{ batchResult.invalidRows.length }}</strong>
        </div>
        <div class="batch-stat-card amount">
          <span>正常待发放红利总额</span>
          <strong>¥{{ formatAmount(batchResult.validAmount) }}</strong>
        </div>
      </div>

      <div class="batch-data-card">
        <el-tabs v-model="activeDataTab" @tab-click="resetPagination">
          <el-tab-pane :label="`正常数据（${batchResult.validRows.length}）`" name="valid" />
          <el-tab-pane
            v-if="showWarning"
            :label="`警告数据（${batchResult.warningRows.length}）`"
            name="warning"
          />
          <el-tab-pane :label="`异常数据（${batchResult.invalidRows.length}）`" name="invalid" />
        </el-tabs>

        <div v-if="activeDataTab === 'warning'" class="warning-copy">
          以下用户的最新存款订单已参与官网首存活动，请确认是否继续发放代理线下首存彩金。
        </div>
        <div v-if="activeDataTab === 'invalid'" class="invalid-toolbar">
          <span>异常数据请核对修正后重新上传。</span>
          <el-button type="danger" plain size="small" @click="exportInvalidRows">导出异常Excel</el-button>
        </div>

        <el-table :data="pagedRows" border stripe max-height="360" class="batch-data-table">
          <el-table-column label="序号" width="68" align="center">
            <template slot-scope="{ $index }">{{ rowSequence($index) }}</template>
          </el-table-column>
          <el-table-column prop="rowNo" label="行号" width="78" align="center" />
          <el-table-column :prop="accountField" :label="accountLabel" min-width="180" />
          <el-table-column label="金额" min-width="150" align="right">
            <template slot-scope="{ row }">
              {{ isFiniteAmount(row.amount) ? `¥${formatAmount(row.amount)}` : row.amount || '--' }}
            </template>
          </el-table-column>
          <el-table-column v-if="activeDataTab === 'invalid'" prop="errorText" label="异常原因" min-width="280">
            <template slot-scope="{ row }">
              <span class="invalid-reason">{{ row.errorText }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="activeDataTab === 'warning'" label="操作" width="170" align="center">
            <template slot-scope="{ row }">
              <el-button type="text" @click="markNormal(row)">标记正常</el-button>
              <el-button type="text" class="danger-action" @click="removeWarning(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="batch-pagination">
          <el-pagination
            :current-page.sync="page"
            :page-size.sync="pageSize"
            :page-sizes="[20, 50, 100]"
            :total="currentRows.length"
            layout="total, sizes, prev, pager, next"
            @size-change="page = 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const {
  createBonusImportDemo,
  getBonusTemplateHeaders,
  getBonusTemplateRows,
  markWarningRowNormal,
  deleteWarningRow,
  paginateRows
} = require('./batchBonusImport')

export default {
  name: 'BatchBonusImportPanel',
  props: {
    walletType: {
      type: String,
      required: true
    },
    bonusType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      uploadedFileName: '',
      uploadFileList: [],
      batchResult: null,
      activeDataTab: 'valid',
      page: 1,
      pageSize: 20
    }
  },
  computed: {
    isCommission() {
      return this.walletType === 'commission'
    },
    showWarning() {
      return !this.isCommission && this.bonusType === 'agentFirstDeposit'
    },
    accountField() {
      return this.isCommission ? 'agentAccount' : 'memberAccount'
    },
    accountLabel() {
      return this.isCommission ? '代理账号' : '会员账号'
    },
    currentRows() {
      if (!this.batchResult) return []
      if (this.activeDataTab === 'warning') return this.batchResult.warningRows
      if (this.activeDataTab === 'invalid') return this.batchResult.invalidRows
      return this.batchResult.validRows
    },
    pagedRows() {
      return paginateRows(this.currentRows, this.page, this.pageSize)
    }
  },
  watch: {
    walletType() {
      this.resetUpload()
    },
    bonusType() {
      this.resetUpload()
    }
  },
  methods: {
    resetUpload() {
      this.uploadedFileName = ''
      this.uploadFileList = []
      this.batchResult = null
      this.activeDataTab = 'valid'
      this.page = 1
    },
    handleFileChange(file) {
      this.uploadFileList = []
      this.uploadedFileName = file && file.name ? file.name : '红利批量发放数据.xlsx'
      this.batchResult = createBonusImportDemo({
        walletType: this.walletType,
        bonusType: this.bonusType
      })
      this.activeDataTab = 'valid'
      this.page = 1
      this.$message.success('文件上传并校验完成')
    },
    downloadTemplate() {
      const headers = getBonusTemplateHeaders(this.walletType)
      const rows = getBonusTemplateRows(this.walletType)
      this.downloadExcel(
        `${this.isCommission ? '代理' : '会员'}红利批量发放模板.xls`,
        headers,
        rows
      )
      this.$message.success('红利批量发放模板下载成功')
    },
    exportInvalidRows() {
      const rows = this.batchResult.invalidRows.map(row => [
        row.rowNo,
        row[this.accountField],
        row.amount,
        row.errorText
      ])
      this.downloadExcel('红利批量发放异常数据.xls', ['行号', this.accountLabel, '金额', '异常原因'], rows)
    },
    downloadExcel(fileName, headers, rows) {
      const escapeHtml = value => String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      const head = headers.map(item => `<th>${escapeHtml(item)}</th>`).join('')
      const body = rows.map(row => `<tr>${row.map(item => `<td>${escapeHtml(item)}</td>`).join('')}</tr>`).join('')
      const content = `\ufeff<html><head><meta charset="UTF-8"></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`
      const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    markNormal(row) {
      this.$confirm('确认将该警告数据标记为正常并加入正常数据列表？', '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.batchResult = markWarningRowNormal(this.batchResult, row.id)
        this.page = Math.min(this.page, Math.max(1, Math.ceil(this.currentRows.length / this.pageSize)))
        this.$message.success('已标记为正常数据')
      }).catch(() => {})
    },
    removeWarning(row) {
      this.$confirm('确认删除该警告数据？删除后该条数据不参与本次发放。', '系统提示', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.batchResult = deleteWarningRow(this.batchResult, row.id)
        this.page = Math.min(this.page, Math.max(1, Math.ceil(this.currentRows.length / this.pageSize)))
        this.$message.success('警告数据已删除')
      }).catch(() => {})
    },
    resetPagination() {
      this.page = 1
    },
    rowSequence(index) {
      return (this.page - 1) * this.pageSize + index + 1
    },
    isFiniteAmount(value) {
      return value !== '' && Number.isFinite(Number(value))
    },
    formatAmount(value) {
      return Number(value || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.batch-bonus-import-panel {
  width: min(1180px, calc(100vw - 360px));
  min-width: 760px;
}

.batch-file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.uploaded-file-name {
  max-width: 300px;
  overflow: hidden;
  color: #86909c;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-result-wrap {
  margin-top: 18px;
}

.batch-stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(145px, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.batch-stat-grid.without-warning {
  grid-template-columns: repeat(4, minmax(165px, 1fr));
}

.batch-stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 68px;
  padding: 0 16px;
  border: 1px solid #d9e2ef;
  border-radius: 6px;
  background: #f7f9fc;
}

.batch-stat-card span {
  color: #86909c;
}

.batch-stat-card strong {
  font-size: 22px;
  color: #1d2939;
}

.batch-stat-card.success {
  border-color: #b7ebd3;
  background: #f2fbf7;
}

.batch-stat-card.success strong {
  color: #22a06b;
}

.batch-stat-card.warning {
  border-color: #ffd591;
  background: #fffaf0;
}

.batch-stat-card.warning strong {
  color: #d46b08;
}

.batch-stat-card.danger {
  border-color: #ffc9d2;
  background: #fff6f7;
}

.batch-stat-card.danger strong {
  color: #f5224d;
}

.batch-stat-card.amount {
  border-color: #adc6ff;
  background: #f2f7ff;
}

.batch-stat-card.amount strong {
  color: #1677ff;
}

.batch-data-card {
  border: 1px solid #d9e2ef;
  background: #fff;
}

.batch-data-card ::v-deep .el-tabs__header {
  margin: 0;
  padding: 0 14px;
  background: #f5f7fa;
}

.warning-copy {
  margin: 12px;
  padding: 11px 14px;
  border-left: 3px solid #ff4d4f;
  color: #f5222d;
  background: #fff2f0;
}

.invalid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  color: #86909c;
}

.batch-data-table {
  width: calc(100% - 24px);
  margin: 0 12px;
}

.invalid-reason,
.danger-action {
  color: #f5224d;
}

.batch-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

@media (max-width: 1200px) {
  .batch-bonus-import-panel {
    width: 100%;
    min-width: 0;
  }

  .batch-stat-grid,
  .batch-stat-grid.without-warning {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}
</style>
