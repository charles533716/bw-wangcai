<template>
  <div class="tab-page">
    <el-form :inline="true" :model="query" size="small" class="filter-form">
      <el-form-item label="类型名称">
        <el-input v-model.trim="query.name" clearable placeholder="请输入类型名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="success" @click="openCreate">新增类型</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="page.rows" border stripe size="mini" class="data-table">
      <el-table-column label="序号" type="index" width="60" align="center" />
      <el-table-column label="类型名称" prop="name" min-width="140" />
      <el-table-column label="未选中图标" width="120" align="center">
        <template slot-scope="scope">
          <el-image class="type-icon" :src="scope.row.inactiveIcon" :preview-src-list="[scope.row.inactiveIcon]" />
        </template>
      </el-table-column>
      <el-table-column label="已选中图标" width="120" align="center">
        <template slot-scope="scope">
          <el-image class="type-icon" :src="scope.row.activeIcon" :preview-src-list="[scope.row.activeIcon]" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" width="90" align="center" />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openEdit(scope.row)">修改</el-button>
          <el-button type="text" size="mini" class="danger" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="page.total > 0" :total="page.total" :page.sync="pageNum" :limit.sync="pageSize" @pagination="syncPage" />

    <el-dialog :title="editingId ? '修改场馆类型' : '新增场馆类型'" :visible.sync="dialogVisible" width="560px" append-to-body>
      <el-form :model="form" label-width="120px" size="small">
        <el-form-item label="类型名称" required>
          <el-input v-model.trim="form.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="未选中图标" required>
          <image-upload v-model="form.inactiveIcon" :limit="1" :file-size="1" :file-type="['jpg','jpeg','png','svg']" :is-show-tip="false" :drag="false" replace-on-exceed />
          <div class="form-tip">支持 jpg、jpeg、png、svg，大小不超过1M。</div>
        </el-form-item>
        <el-form-item label="已选中图标" required>
          <image-upload v-model="form.activeIcon" :limit="1" :file-size="1" :file-type="['jpg','jpeg','png','svg']" :is-show-tip="false" :drag="false" replace-on-exceed />
          <div class="form-tip">支持 jpg、jpeg、png、svg，大小不超过1M。</div>
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="form.sort" :min="1" :precision="0" class="full" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
const { DEMO_IMAGE, cloneState, filterVenueTypes, paginate, validateVenueType } = require('./model')

const emptyForm = () => ({ id: null, name: '', inactiveIcon: DEMO_IMAGE, activeIcon: DEMO_IMAGE, sort: 1 })

export default {
  name: 'VenueTypeList',
  components: { ImageUpload },
  props: { state: { type: Object, required: true } },
  data() {
    return {
      query: { name: '' },
      appliedQuery: {},
      pageNum: 1,
      pageSize: 10,
      dialogVisible: false,
      editingId: null,
      originalName: '',
      form: emptyForm()
    }
  },
  computed: {
    sortedTypes() {
      return (this.state.venueTypes || []).slice().sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    },
    page() {
      return paginate(filterVenueTypes(this.sortedTypes, this.appliedQuery), this.pageNum, this.pageSize)
    }
  },
  methods: {
    search() {
      this.appliedQuery = cloneState(this.query)
      this.pageNum = 1
    },
    resetQuery() {
      this.query = { name: '' }
      this.search()
    },
    syncPage({ page, limit }) {
      this.pageNum = page
      this.pageSize = limit
    },
    openCreate() {
      this.editingId = null
      this.originalName = ''
      this.form = emptyForm()
      this.form.id = Math.max(0, ...(this.state.venueTypes || []).map(item => Number(item.id))) + 1
      this.form.sort = Math.max(0, ...(this.state.venueTypes || []).map(item => Number(item.sort))) + 1
      this.dialogVisible = true
    },
    openEdit(row) {
      this.editingId = row.id
      this.originalName = row.name
      this.form = cloneState(row)
      this.dialogVisible = true
    },
    submit() {
      const result = validateVenueType(this.form, this.state.venueTypes || [], this.editingId)
      if (!result.valid) return this.$message.warning(result.message)
      if (!Array.isArray(this.state.venueTypes)) this.$set(this.state, 'venueTypes', [])
      if (this.editingId) {
        const target = this.state.venueTypes.find(item => item.id === this.editingId)
        Object.assign(target, cloneState(this.form))
        if (this.originalName && this.originalName !== this.form.name) {
          this.state.venues.forEach(venue => {
            if (venue.type === this.originalName) venue.type = this.form.name
          })
        }
      } else {
        this.state.venueTypes.unshift(cloneState(this.form))
      }
      this.$emit('state-change')
      this.dialogVisible = false
      this.$modal.msgSuccess('场馆类型保存成功')
    },
    remove(row) {
      const used = this.state.venues.some(venue => venue.type === row.name)
      if (used) return this.$message.warning('该类型已被场馆使用，暂不能删除')
      this.$confirm(`确认删除场馆类型 ${row.name}？`, '警告', { type: 'warning' }).then(() => {
        const index = this.state.venueTypes.indexOf(row)
        if (index > -1) this.state.venueTypes.splice(index, 1)
        this.pageNum = this.page.pageNum
        this.$emit('state-change')
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.filter-form { padding: 10px 0 0; }
.filter-form .el-input { width: 190px; }
.data-table { width: 100%; }
.type-icon { width: 34px; height: 34px; }
.full { width: 100%; }
.form-tip { color: #909399; font-size: 12px; line-height: 18px; margin-top: 4px; }
.danger { color: #f56c6c; }
</style>
