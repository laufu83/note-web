<template>
  <div class="note-list" v-loading="loading">
    <div v-if="notes.length === 0" class="empty-state">
      <el-empty description="暂无笔记" />
    </div>

    <div v-else class="note-items">
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-item"
        @click="handleClick(note)"
      >
        <div class="note-item-left">
          <div class="note-item-title">
            <span v-if="note.isStarred" class="star">⭐</span>
            <span>{{ note.title }}</span>
          </div>
          <div class="note-item-summary">
            {{ note.summary || note.contentPlain?.slice(0, 80) }}
          </div>
          <div class="note-item-meta">
            <span>{{ formatDate(note.updatedAt) }}</span>
            <span v-if="note.tags?.length > 0" class="tags">
              <el-tag
                v-for="tag in note.tags.slice(0, 3)"
                :key="tag.id"
                size="small"
                :color="tag.color"
                style="margin: 0 2px"
              >
                {{ tag.name }}
              </el-tag>
              <span v-if="note.tags.length > 3" class="more">+{{ note.tags.length - 3 }}</span>
            </span>
          </div>
        </div>
        <div class="note-item-right">
          <span class="word-count">{{ note.wordCount || 0 }} 字</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NoteInfo } from '@/types'
import { formatDate } from '@/utils/date'

defineProps<{
  notes: NoteInfo[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', note: NoteInfo): void
}>()

function handleClick(note: NoteInfo) {
  emit('click', note)
}
</script>

<style scoped>
.note-list {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.note-items {
  padding: 4px 0;
}

.note-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.note-item:hover {
  background: #f5f7fa;
}

.note-item-left {
  flex: 1;
  min-width: 0;
}

.note-item-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  font-size: 12px;
}

.note-item-summary {
  font-size: 13px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #aaa;
}

.tags {
  display: flex;
  align-items: center;
  gap: 2px;
}

.more {
  font-size: 11px;
  color: #999;
}

.note-item-right {
  display: flex;
  align-items: center;
  margin-left: 16px;
  flex-shrink: 0;
}

.word-count {
  font-size: 12px;
  color: #bbb;
}
</style>