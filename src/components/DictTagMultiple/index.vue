<template>
  <div>
    <el-tag
      v-for="item in selectedOptions"
      :key="item.dictValue"
      :type="item.listClass || 'default'"
      size="small"
      style="margin: 2px;"
    >
      {{ item.dictLabel }}
    </el-tag>
    <span v-if="selectedOptions.length === 0">-</span>
  </div>
</template>

<script>
export default {
  name: "DictTagMultiple",
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: [String, Array],
      default: ''
    }
  },
  computed: {
    selectedOptions() {
      if (!this.value) return [];

      const valueArray = typeof this.value === 'string'
        ? this.value.split(',')
        : this.value;

      return this.options.filter(option =>
        valueArray.includes(option.dictValue)
      );
    }
  }
}
</script>
