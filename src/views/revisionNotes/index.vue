<template>
  <div class="app-container revision-notes-page">
    <weekly-update-notes />
  </div>
</template>

<script>
import WeeklyUpdateNotes from '@/components/WeeklyUpdateNotes'

export default {
  name: 'RevisionNotes',
  components: {
    WeeklyUpdateNotes
  }
}
</script>

<style scoped>
.revision-notes-page {
  padding: 12px;
}

.revision-notes-page ::v-deep .weekly-update-notes {
  margin: 0;
}
</style>
