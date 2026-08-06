<template>
  <div class="web-venue-detail-config">
    <div class="category-tabs">
      <el-button
        v-for="category in config.categories"
        :key="category.type"
        size="small"
        :type="activeType === category.type ? 'primary' : 'default'"
        @click="activeType = category.type"
      >{{ category.type }}场馆</el-button>
    </div>

    <div v-if="activeCategory" class="venue-list">
      <section v-for="(row, index) in activeCategory.rows" :key="row.id" class="venue-row">
        <div class="venue-selector">
          <span class="required-label">左{{ index + 1 }}场馆</span>
          <el-select v-model="row.venueName" filterable size="small" placeholder="请选择场馆">
            <el-option
              v-for="option in activeCategory.venueOptions"
              :key="option"
              :label="option"
              :value="option"
              :disabled="isVenueDisabled(option, row)"
            />
          </el-select>
          <el-button
            v-if="activeCategory.rows.length > 1"
            type="danger"
            plain
            size="mini"
            @click="removeRow(index)"
          >删除</el-button>
        </div>

        <template v-if="activeCategory.mode === 'detail'">
          <div class="image-field">
            <span>场馆名称图片</span>
            <div>
              <image-upload v-model="row.nameImage" :limit="1" :file-size="2" :file-type="['jpg', 'jpeg', 'png']" :is-show-tip="false" :drag="false" replace-on-exceed />
              <p class="image-tip">支持 jpg、jpeg、png，大小不超过2M</p>
            </div>
          </div>
          <div class="image-field">
            <span>游戏图片</span>
            <div>
              <image-upload v-model="row.gameImage" :limit="1" :file-size="1" :file-type="['jpg', 'jpeg', 'png']" :is-show-tip="false" :drag="false" replace-on-exceed />
              <p class="image-tip">支持 jpg、jpeg、png，大小不超过1M</p>
            </div>
          </div>
          <div class="description-field">
            <span>场馆文案</span>
            <el-input
              v-model="row.description"
              type="textarea"
              :rows="5"
              maxlength="150"
              show-word-limit
              placeholder="请输入场馆文案"
            />
          </div>
        </template>
        <template v-else>
          <div class="image-field">
            <span>场馆图标</span>
            <div>
              <image-upload v-model="row.defaultIcon" :limit="1" :file-size="1" :file-type="['jpg', 'jpeg', 'png']" :is-show-tip="false" :drag="false" replace-on-exceed />
              <div class="image-sub-label">鼠标悬停前</div>
              <p class="image-tip">支持 jpg、jpeg、png，大小不超过1M</p>
            </div>
          </div>
          <div class="image-field">
            <span>场馆图标</span>
            <div>
              <image-upload v-model="row.hoverIcon" :limit="1" :file-size="1" :file-type="['jpg', 'jpeg', 'png']" :is-show-tip="false" :drag="false" replace-on-exceed />
              <div class="image-sub-label">鼠标悬停后</div>
              <p class="image-tip">支持 jpg、jpeg、png，大小不超过1M</p>
            </div>
          </div>
        </template>
      </section>
    </div>

    <div class="actions">
      <el-button type="primary" plain size="small" @click="addRow">新增场馆</el-button>
      <span class="action-spacer" />
      <el-button size="small" @click="resetConfig">重置</el-button>
      <el-button type="primary" size="small" @click="submitConfig">提交</el-button>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
const { cloneConfig, createInitialConfig, createRow, validateCategory } = require('./webVenueDetailConfigModel')

export default {
  name: 'WebVenueDetailConfig',
  components: { ImageUpload },
  props: { siteCode: { type: String, default: '' } },
  data() {
    const config = createInitialConfig()
    return { activeType: '体育', config, savedConfig: cloneConfig(config) }
  },
  computed: {
    activeCategory() { return this.config.categories.find(item => item.type === this.activeType) }
  },
  methods: {
    isVenueDisabled(option, currentRow) {
      return this.activeCategory.rows.some(row => row !== currentRow && row.venueName === option)
    },
    addRow() {
      const option = this.activeCategory.venueOptions.find(name => !this.activeCategory.rows.some(row => row.venueName === name))
      if (!option) return this.$message.warning(`${this.activeType}没有可新增的场馆`)
      this.activeCategory.rows.push(createRow(option, this.activeCategory.mode))
    },
    removeRow(index) {
      if (this.activeCategory.rows.length <= 1) return
      this.activeCategory.rows.splice(index, 1)
    },
    resetConfig() {
      this.config = cloneConfig(this.savedConfig)
      this.$message.success('已重置为最近一次提交的配置')
    },
    submitConfig() {
      for (const category of this.config.categories) {
        const result = validateCategory(category)
        if (!result.valid) {
          this.activeType = category.type
          this.$message.warning(result.message)
          return
        }
      }
      this.savedConfig = cloneConfig(this.config)
      this.$modal.msgSuccess(`WEB场馆详情页配置提交成功（站点 ${this.siteCode || '-'}）`)
    }
  }
}
</script>

<style scoped lang="scss">
.web-venue-detail-config { padding: 8px 4px 20px; }
.category-tabs { display: flex; flex-wrap: wrap; margin-bottom: 20px; .el-button { margin-left: -1px; border-radius: 0; } .el-button:first-child { margin-left: 0; } }
.venue-row { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(330px, 1fr) minmax(330px, 1fr); gap: 28px 52px; min-height: 190px; padding: 22px 8px; border-bottom: 1px solid #ebeef5; }
.venue-selector, .image-field, .description-field { display: flex; align-items: flex-start; gap: 10px; > span { flex: 0 0 90px; padding-top: 8px; color: #606266; } }
.venue-selector .el-select { width: 180px; }
.required-label::before { content: '*'; margin-right: 4px; color: #f56c6c; }
.description-field { grid-column: 3; .el-textarea { min-width: 280px; } }
.image-sub-label { margin-top: 4px; color: #606266; font-size: 12px; }
.image-tip { margin: 5px 0 0; color: #a8abb2; font-size: 12px; white-space: nowrap; }
.actions { display: flex; align-items: center; padding-top: 20px; }.action-spacer { flex: 1; }
::v-deep .component-upload-image .el-upload--picture-card, ::v-deep .component-upload-image .el-upload-list--picture-card .el-upload-list__item { width: 88px; height: 88px; line-height: 86px; }
@media (max-width: 1100px) { .venue-row { grid-template-columns: minmax(280px, 1fr); } .description-field { grid-column: auto; } }
</style>
