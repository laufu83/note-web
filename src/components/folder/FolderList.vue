<!-- src/components/folder/FolderList.vue -->
<template>
  <div class="column-list" v-loading="loading">
    <div v-if="refreshing" class="refresh-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
      刷新中...
    </div>

    <!-- ✅ 文件夹列表：回收站也显示已删除的文件夹 -->
    <template v-if="showFolders">
      <FolderItem
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :is-trash="isTrash"
        @select="(id:string) => emit('selectFolder', id)"
        @action="(cmd:string, data:any) => emit('folderAction', cmd, data)"
      />
    </template>

    <!-- 笔记列表 -->
    <NoteItem
      v-for="note in notes"
      :key="note.id"
      :note="note"
      :view-mode="viewMode"
      :selected="selectedNoteId === note.id"
      :is-trash="isTrash"
      @select="emit('selectNote', note)"
      @action="(cmd:string) => emit('noteAction', cmd, note)"
    />

    <!-- 空状态 -->
    <EmptyState
      v-if="!loading && notes.length === 0 && (showFolders ? folders.length === 0 : true)"
      :text="emptyText"
      :button-text="emptyButtonText"
      @create="emit('create-note')"
    />
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import FolderItem from './FolderItem.vue'
import NoteItem from './NoteItem.vue'
import EmptyState from './EmptyState.vue'

defineProps<{
  loading: boolean
  refreshing: boolean
  notes: any[]
  folders: any[]
  selectedNoteId: string | null
  viewMode: 'list' | 'preview'
  showFolders: boolean
  emptyText: string
  emptyButtonText: string
  isTrash?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectNote', note: any): void
  (e: 'selectFolder', id: string): void
  (e: 'folderAction', command: string, folder: any): void
  (e: 'noteAction', command: string, note: any): void
  (e: 'create-note'): void
}>()
</script>

<style scoped>
.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #888;
  font-size: 13px;
}

.column-list::-webkit-scrollbar {
  width: 4px;
}

.column-list::-webkit-scrollbar-track {
  background: transparent;
}

.column-list::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}
</style>