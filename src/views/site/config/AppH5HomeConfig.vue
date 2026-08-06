<template>
  <div class="app-h5-home-config">
    <section class="resource-section">
      <div class="section-title">APP/H5首页场馆配置</div>
      <div class="venue-table-wrap">
        <table class="venue-table">
          <thead>
            <tr>
              <th>场馆类型</th>
              <th>类型排序</th>
              <th>场馆名称</th>
              <th>场馆排序</th>
              <th>场馆图片</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groups">
              <tr v-for="(venue, venueIndex) in group.venues" :key="`${group.type}-${venue.name}`">
                <td v-if="venueIndex === 0" :rowspan="group.venues.length" class="type-cell">
                  {{ group.type }}
                </td>
                <td v-if="venueIndex === 0" :rowspan="group.venues.length" class="sort-cell">
                  <el-input-number
                    v-model="group.sort"
                    :min="1"
                    :max="groups.length"
                    :controls="false"
                    size="small"
                    class="sort-input"
                  />
                </td>
                <td class="name-cell">{{ venue.name }}</td>
                <td class="sort-cell">
                  <el-input-number
                    v-model="venue.sort"
                    :min="1"
                    :max="group.venues.length"
                    :controls="false"
                    size="small"
                    class="sort-input"
                  />
                </td>
                <td class="image-cell">
                  <image-upload
                    v-model="venue.image"
                    :limit="1"
                    :file-size="2"
                    :file-type="['jpg', 'jpeg', 'png']"
                    :is-show-tip="false"
                    :drag="false"
                    replace-on-exceed
                  />
                  <p class="resource-tip">支持 JPG、JPEG、PNG，单张不超过 2MB</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <div class="page-actions">
      <el-button size="small" @click="resetConfig">重置</el-button>
      <el-button type="primary" size="small" @click="submitConfig">提交</el-button>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'

const {
  cloneGroups,
  createInitialGroups,
  validateGroups
} = require('./appH5HomeConfigModel')

export default {
  name: 'AppH5HomeConfig',
  components: {
    ImageUpload
  },
  props: {
    siteCode: {
      type: String,
      default: ''
    }
  },
  data() {
    const initialGroups = createInitialGroups()
    return {
      groups: initialGroups,
      savedGroups: cloneGroups(initialGroups)
    }
  },
  methods: {
    resetConfig() {
      this.groups = cloneGroups(this.savedGroups)
      this.$message.success('已重置为最近一次提交的配置')
    },
    submitConfig() {
      const result = validateGroups(this.groups)
      if (!result.valid) {
        this.$message.warning(result.message)
        return
      }

      this.groups.forEach(group => {
        group.sort = Number(group.sort)
        group.venues.forEach(venue => {
          venue.sort = Number(venue.sort)
        })
      })
      this.savedGroups = cloneGroups(this.groups)
      this.$modal.msgSuccess(`APP/H5首页场馆配置提交成功（站点 ${this.siteCode || '-'}）`)
    }
  }
}
</script>

<style scoped lang="scss">
.app-h5-home-config {
  padding: 8px 4px 20px;
}

.resource-section {
  padding-bottom: 26px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  margin: 0 0 20px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  color: #303133;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.venue-table-wrap {
  overflow-x: auto;
}

.venue-table {
  width: 100%;
  min-width: 860px;
  border-spacing: 0;
  border-collapse: collapse;
  color: #606266;
  font-size: 13px;

  th,
  td {
    padding: 12px;
    border: 1px solid #ebeef5;
    text-align: center;
    vertical-align: middle;
  }

  th {
    background: #f5f7fa;
    color: #909399;
    font-weight: 500;
  }
}

.type-cell {
  width: 110px;
  background: #fafafa;
  color: #303133;
  font-weight: 500;
}

.name-cell {
  width: 180px;
  color: #303133;
}

.sort-cell {
  width: 130px;
}

.sort-input {
  width: 88px;
}

.image-cell {
  min-width: 250px;
  text-align: left !important;
}

.resource-tip {
  margin: 8px 0 0;
  color: #a8abb2;
  font-size: 12px;
  line-height: 18px;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 22px;
}

::v-deep .component-upload-image .el-upload--picture-card,
::v-deep .component-upload-image .el-upload-list--picture-card .el-upload-list__item {
  width: 96px;
  height: 96px;
  line-height: 94px;
}
</style>
