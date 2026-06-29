<template>
  <div :class="['activity-picture-panel', { 'is-empty': !hasImage }]">
    <image-upload
      ref="upload"
      :value="value"
      :limit="1"
      :file-size="2"
      :file-type="['jpg', 'jpeg', 'png', 'gif']"
      :is-show-tip="false"
      :replace-on-exceed="true"
      @input="$emit('input', $event)"
    />
    <div v-if="!hasImage" class="activity-picture-placeholder">
      <div class="activity-picture-placeholder__icon"><i class="el-icon-plus" /></div>
      <div class="activity-picture-placeholder__title">{{ emptyTitle }}</div>
      <div class="activity-picture-placeholder__desc">{{ emptyDesc }}</div>
    </div>
    <div v-else class="activity-picture-actions">
      <el-button type="text" icon="el-icon-refresh" @click="handleReplace">更换图片</el-button>
      <el-button type="text" icon="el-icon-delete" class="activity-picture-actions__remove" @click="handleClear">移除图片</el-button>
    </div>
  </div>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'

export default {
  name: 'CommonImageUploader',
  components: { ImageUpload },
  props: {
    value: {
      type: String,
      default: ''
    },
    emptyTitle: {
      type: String,
      default: '上传图片'
    },
    emptyDesc: {
      type: String,
      default: '支持 JPG, PNG, GIF (2MB)'
    }
  },
  computed: {
    hasImage() {
      return !!String(this.value || '').trim()
    }
  },
  methods: {
    handleReplace() {
      if (this.$refs.upload && typeof this.$refs.upload.openFileDialog === 'function') {
        this.$refs.upload.openFileDialog()
      }
    },
    handleClear() {
      this.$emit('input', '')
    }
  }
}
</script>
