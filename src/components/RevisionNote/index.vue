<template>
  <div v-if="visible" class="revision-note-entry">
    <el-button
      class="revision-note-entry__button"
      type="primary"
      plain
      size="mini"
      icon="el-icon-document"
      @click="open = true"
    >
      业务及需求说明
    </el-button>

    <el-drawer
      :visible.sync="open"
      :with-header="false"
      :size="drawerSize"
      direction="rtl"
      append-to-body
      custom-class="revision-note-drawer"
    >
      <div class="revision-note-panel">
        <div class="revision-note-panel__header">
          <div>
            <div class="revision-note-panel__eyebrow">业务及需求说明</div>
            <h3>{{ note.pageTitle }}</h3>
          </div>
          <el-button type="text" icon="el-icon-close" @click="open = false" />
        </div>

        <div class="revision-note-panel__meta">
          <el-tag size="mini" type="success">{{ note.backendTitle }}</el-tag>
          <el-tag size="mini">{{ note.moduleTitle }}</el-tag>
          <span>更新时间：{{ note.updatedAt }}</span>
        </div>

        <section class="revision-note-section">
          <h4>页面功能说明</h4>
          <p>{{ note.position }}</p>
        </section>

        <section class="revision-note-section">
          <h4>主要功能</h4>
          <ul>
            <li v-for="item in note.features" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="revision-note-section">
          <h4>字段说明</h4>
          <div class="revision-note-field-group" v-for="group in note.fieldGroups" :key="group.title">
            <div class="revision-note-field-group__title">{{ group.title }}</div>
            <ul>
              <li v-for="item in group.items" :key="fieldKey(group.title, item)">
                <strong>{{ fieldLabel(item) }}</strong>
                <span>{{ fieldDesc(item) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="revision-note-section">
          <h4>业务逻辑说明</h4>
          <ul>
            <li v-for="item in note.businessRules" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section v-if="note.acceptanceFocus && note.acceptanceFocus.length" class="revision-note-section">
          <h4>功能验收说明</h4>
          <ul>
            <li v-for="item in note.acceptanceFocus" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="revision-note-section">
          <h4>关联模块</h4>
          <div class="revision-note-panel__tags">
            <el-tag v-for="item in note.relations" :key="item" size="small" effect="plain">
              {{ item }}
            </el-tag>
          </div>
        </section>

        <section class="revision-note-section">
          <h4>演示说明</h4>
          <p>{{ note.demoText }}</p>
        </section>

        <section class="revision-note-section">
          <h4>业务及需求说明</h4>
          <div class="revision-note-record revision-note-record--current">
            <div class="revision-note-record__head">
              <strong>{{ note.changeSummary.title }}</strong>
              <span>{{ note.changeSummary.time }}</span>
            </div>
            <p>{{ note.changeSummary.content }}</p>
          </div>
          <div
            v-if="note.changeSummary.records && note.changeSummary.records.length"
            class="revision-note-change-list"
          >
            <div class="revision-note-change-list__title">近 2 天修改记录</div>
            <div
              v-for="record in note.changeSummary.records"
              :key="changeRecordKey(record)"
              class="revision-note-change-item"
            >
              <div class="revision-note-change-item__head">
                <strong>{{ record.title }}</strong>
                <span>{{ record.time }}</span>
              </div>
              <p>
                <strong>修改说明：</strong>
                <span>{{ record.summary }}</span>
              </p>
              <ul>
                <li v-for="item in record.contents" :key="item">
                  <strong>修改内容：</strong>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getRevisionNote } from '@/utils/revisionNotes'

export default {
  name: 'RevisionNote',
  data() {
    return {
      open: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device'
    ]),
    visible() {
      return this.$route && !this.$route.meta.link && !String(this.$route.path || '').startsWith('/redirect')
    },
    drawerSize() {
      if (this.device === 'mobile') {
        return '100vw'
      }
      return this.sidebar && this.sidebar.opened
        ? 'calc(100vw - 260px)'
        : 'calc(100vw - 54px)'
    },
    note() {
      return getRevisionNote(this.$route, this.$store.getters.backendMode)
    }
  },
  watch: {
    '$route.path'() {
      this.open = false
    }
  },
  methods: {
    fieldLabel(item) {
      if (typeof item === 'string') {
        return item
      }
      return item.desc ? `${item.label}：` : item.label
    },
    fieldDesc(item) {
      return typeof item === 'string' ? '' : item.desc
    },
    fieldKey(groupTitle, item) {
      return `${groupTitle}-${this.fieldLabel(item)}`
    },
    changeRecordKey(record) {
      return `${record.time}-${record.title}`
    }
  }
}
</script>

<style lang="scss" scoped>
.revision-note-entry {
  position: absolute;
  top: 12px;
  right: 20px;
  z-index: 8;
  pointer-events: none;
}

.revision-note-entry__button {
  pointer-events: auto;
  border-radius: 4px;
  background: #fff;
}
</style>

<style lang="scss">
.revision-note-drawer {
  max-width: 100vw;

  .el-drawer__body {
    height: 100%;
    overflow: auto;
  }
}

.revision-note-panel {
  padding: 22px 22px 28px;
  color: #303133;
}

.revision-note-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 14px;

  h3 {
    margin: 4px 0 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.revision-note-panel__eyebrow {
  font-size: 12px;
  color: #909399;
}

.revision-note-panel__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
  color: #606266;
  font-size: 12px;
}

.revision-note-section {
  margin-top: 18px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #606266;
    line-height: 1.7;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: #606266;
    line-height: 1.8;
  }

  li strong {
    color: #303133;
    font-weight: 600;
  }

  li span {
    margin-left: 4px;
  }
}

.revision-note-panel__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.revision-note-record {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fafafa;
}

.revision-note-field-group {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px 12px;
  background: #fff;

  ul {
    margin-top: 6px;
  }
}

.revision-note-field-group__title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.revision-note-record--current {
  border-color: #d9ecff;
  background: #f5faff;
}

.revision-note-record__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;

  strong {
    font-size: 13px;
  }

  span {
    flex: none;
    color: #909399;
    font-size: 12px;
  }
}

.revision-note-change-list {
  margin-top: 10px;
}

.revision-note-change-list__title {
  margin-bottom: 8px;
  color: #303133;
  font-size: 13px;
  font-weight: 600;
}

.revision-note-change-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 12px;
  margin-top: 10px;
  background: #fff;

  p {
    margin: 6px 0;
  }
}

.revision-note-change-item__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;

  strong {
    font-size: 13px;
  }

  span {
    flex: none;
    color: #909399;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .revision-note-entry {
    top: 8px;
    right: 10px;
  }
}
</style>
