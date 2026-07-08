<!-- src/components/business/NotePreview.vue -->

<template>
  <div class="note-preview" v-loading="loading">
    <!-- 空状态 -->
    <div v-if="!note && !isEditMode" class="empty-state">
      <el-empty description="请选择一篇笔记" :image-size="100" />
    </div>

    <!-- 预览模式 -->
    <div v-else-if="!isEditMode" class="preview-mode">
      <div class="preview-header">
        <h2 class="preview-title">{{ note?.title || '无标题笔记' }}</h2>
        <div class="preview-meta">
          <span class="meta-date">{{ formatDate(note?.updatedAt) }}</span>
          <span v-if="note?.wordCount" class="meta-size">{{ note.wordCount }} 字</span>
          <span v-if="note?.tags?.length" class="meta-tags">
            <el-tag
              v-for="tag in note.tags.slice(0, 3)"
              :key="tag.id"
              size="small"
              :color="tag.color"
              style="margin: 0 2px; border: none"
            >
              {{ tag.name }}
            </el-tag>
          </span>
        </div>
        <div class="preview-actions">
          <el-button type="primary" size="small" @click="enterEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>
      <div class="preview-content" v-html="renderedContent" />
    </div>

    <!-- 编辑模式 -->
    <div v-else class="edit-mode">
      <!-- <div class="edit-toolbar">
        <el-button size="small" @click="exitEdit">
          <el-icon><ArrowLeft /></el-icon>
          返回预览
        </el-button>
        <span class="edit-title">编辑中...</span>
      </div> -->
      <NoteDetail
        v-if="noteId"
        :key="noteId"
        :note-id="noteId"
        @save="handleSave"
        @cancel="exitEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'
import { noteApi } from '@/api/note'
import { formatDate } from '@/utils/date'
import NoteDetail from '@/views/main/NoteDetail.vue'

// ============================================================
// Props & Emits
// ============================================================

const props = defineProps<{
  noteId?: string | null
}>()

const emit = defineEmits<{
  (e: 'edit-mode', value: boolean): void
  (e: 'note-updated'): void
}>()

// ============================================================
// 状态
// ============================================================

const loading = ref(false)
const isEditMode = ref(false)
const note = ref<any>(null)

// ============================================================
// 计算属性
// ============================================================

const renderedContent = computed(() => {
  const text = note.value?.content || ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
})

// ============================================================
// 加载笔记
// ============================================================

async function loadNote() {
  if (!props.noteId) {
    note.value = null
    return
  }
  loading.value = true
  try {
    note.value = await noteApi.getById(props.noteId)
  } catch (error) {
    console.error('加载笔记失败:', error)
    note.value = null
  } finally {
    loading.value = false
  }
}

// ============================================================
// 编辑模式
// ============================================================

function enterEdit() {
  isEditMode.value = true
  emit('edit-mode', true)
}

function exitEdit() {
  isEditMode.value = false
  emit('edit-mode', false)
}

async function handleSave() {
  await loadNote()
  emit('note-updated')
  exitEdit()
}

// ============================================================
// 监听
// ============================================================

watch(
  () => props.noteId,
  () => {
    if (!isEditMode.value) {
      loadNote()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.note-preview {
  height: 100%;
  padding: 20px 24px;
  background: #ffffff;
  overflow-y: auto;
}

/* ============================================================
   空状态
   ============================================================ */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* ============================================================
   预览模式
   ============================================================ */
.preview-header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.preview-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px;
}

.preview-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #8e8e93;
}

.meta-tags {
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-actions {
  margin-top: 12px;
}

.preview-content {
  line-height: 1.8;
  font-size: 15px;
}

.preview-content h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 16px 0 8px;
}

.preview-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 14px 0 6px;
}

.preview-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 12px 0 6px;
}

.preview-content blockquote {
  margin: 8px 0;
  padding: 8px 16px;
  background: #f5f7fa;
  border-left: 4px solid #409eff;
}

.preview-content code {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.preview-content li {
  margin-left: 20px;
}

/* ============================================================
   编辑模式
   ============================================================ */
.edit-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.edit-title {
  font-size: 14px;
  color: #8e8e93;
}

/* ============================================================
   滚动条
   ============================================================ */
.note-preview::-webkit-scrollbar {
  width: 4px;
}

.note-preview::-webkit-scrollbar-track {
  background: transparent;
}

.note-preview::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}

.note-preview::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>