<!-- src/views/main/NoteDetail.vue -->
<template>
  <div class="note-detail" v-loading="loading">
    <!-- 头部 -->
    <NoteHeader
      v-model:title="editTitle"
      :save-status="saveStatus"
      :saving="saving"
      @back="goBack"
      @save="handleSave"
      @toggle-preview="togglePreview"
      @toggle-fullscreen="toggleFullscreen"
    />

    <!-- 工具栏 -->
    <NoteToolbar
      :active-formats="activeFormats"
      @format="handleFormat"
      @insert="handleInsert"
      @heading="handleHeading"
      @undo="undo"
      @redo="redo"
      @print="printDoc"
      @attachment="openAttachment"
      @ai="aiOptimize"
      @indent-add="indentAdd"
      @indent-reduce="indentReduce"
      @insert-divider="insertDivider"
      @insert-table="insertTable"
      @search="openSearch"
      @font-color-change="setFontColor"
    />

    <!-- 编辑器 -->
    <NoteEditor
      v-model:content="editContent"
      :show-preview="showPreview"
      :rendered-content="renderedContent"
      @change="handleContentChange"
      @keydown="handleKeydown"
    />

    <!-- 标签弹窗 -->
    <NoteTagDialog
      v-model:visible="showTagDialog"
      :selected-tag-ids="selectedTagIds"
      :all-tags="allTags"
      @confirm="handleAddTags"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { noteApi } from '@/api/note'
import NoteHeader from '@/components/note/NoteHeader.vue'
import NoteToolbar from '@/components/note/NoteToolbar.vue'
import NoteEditor from '@/components/note/NoteEditor.vue'
import NoteTagDialog from '@/components/note/NoteTagDialog.vue'
import { useNoteContent } from '@/composables/useNoteContent'
import { useNoteEditor } from '@/composables/useNoteEditor'
import { useNotePreview } from '@/composables/useNotePreview'
import { useNoteSave } from '@/composables/useNoteSave'

// ============================================================
// Props & Emits
// ============================================================
const props = defineProps<{
  noteId?: string | null
  isNew?: boolean
  folderId?: string
  newNoteFolderId?: string | null
}>()

const emit = defineEmits<{
  (e: 'note-created'): void
  (e: 'note-updated'): void
  (e: 'clear-new-note'): void
  (e: 'save'): void
}>()

// ============================================================
// Store & Router
// ============================================================
const router = useRouter()
const route = useRoute()
const noteStore = useNoteStore()
const tagStore = useTagStore()

// ============================================================
// 状态
// ============================================================
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)
const showTagDialog = ref(false)
const isFullscreen = ref(false)
const saveStatus = ref('已保存')
const allTags = ref<any[]>([])

// ============================================================
// 工具函数
// ============================================================
const getBackPath = (): string => {
  const fId = currentFolderId.value
  return fId ? `/file/${fId}` : '/'
}

// ============================================================
// 内容管理
// ============================================================
const {
  editTitle,
  editContent,
  editTags,
  selectedTagIds,
  currentFolderId,
  currentNoteId,
  isNewNote,
  note,
  setNoteData,
  clearNoteData,
} = useNoteContent({
  props,
  route,
  noteStore,
})

// ============================================================
// 预览渲染
// ============================================================
const { renderedContent } = useNotePreview(editContent)

// ============================================================
// 编辑器操作
// ============================================================
const {
  activeFormats,
  handleFormat,
  handleInsert,
  handleHeading,
  insertDivider,
  insertTable,
  indentAdd,
  indentReduce,
  setFontColor,
  handleKeydown,
  undo,
  redo,
  printDoc,
  openAttachment,
  aiOptimize,
  openSearch,
} = useNoteEditor(editContent)

// ============================================================
// 保存逻辑
// ============================================================
const {
  saving: savingState,
  saveStatus: saveStatusState,
  handleSave: saveNote,
  autoSave,
} = useNoteSave({
  editTitle,
  editContent,
  editTags,
  currentFolderId,
  currentNoteId,
  isNewNote,
  noteApi,
  router,
  noteStore,
  emit,
  onSaveSuccess: (noteId: string) => {
    loadNote(noteId)
  },
})

// 同步保存状态
saving.value = savingState.value
saveStatus.value = saveStatusState.value

// ============================================================
// 加载笔记
// ============================================================
let loadTimer: number | null = null
let lastLoadedNoteId: string | null = null

async function loadNote(noteId?: string) {
  const id = noteId || currentNoteId.value
  
  if (isNewNote.value) {
    clearNoteData()
    lastLoadedNoteId = null
    return
  }
  
  if (!id) return
  if (lastLoadedNoteId === id) return
  
  if (loadTimer) {
    clearTimeout(loadTimer)
  }
  
  loadTimer = window.setTimeout(async () => {
    if (lastLoadedNoteId === id) {
      loading.value = false
      loadTimer = null
      return
    }
    
    loading.value = true
    try {
      await noteStore.loadNote(id)
      if (note.value) {
        setNoteData(note.value)
        lastLoadedNoteId = id
      }
    } catch (error) {
      console.error('加载笔记失败:', error)
      ElMessage.error('加载笔记失败')
    } finally {
      loading.value = false
      loadTimer = null
    }
  }, 150)
}

// ============================================================
// 标签
// ============================================================
async function loadAllTags() {
  try {
    const result = await tagStore.loadTags()
    allTags.value = result.items || []
  } catch { /* 忽略 */ }
}

function handleAddTags() {
  const selected = allTags.value.filter(t => selectedTagIds.value.includes(t.id))
  const existing = new Set(editTags.value.map(t => t.id))
  editTags.value = [...editTags.value, ...selected.filter(t => !existing.has(t.id))]
  showTagDialog.value = false
  selectedTagIds.value = []
}

// ============================================================
// 导航
// ============================================================
function goBack() {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
  if (isNewNote.value) {
    emit('clear-new-note')
  }
  router.push(getBackPath())
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const el = document.querySelector('.note-detail') as HTMLElement
  if (isFullscreen.value) {
    el?.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// ============================================================
// 内容变化处理
// ============================================================
function handleContentChange() {
  saveStatus.value = '编辑中...'
  autoSave()
}

// ============================================================
// 保存处理
// ============================================================
async function handleSave() {
  const result = await saveNote()
  if (result) {
    // 保存成功后重新加载
    await loadNote(result.id)
  }
}

// ============================================================
// 监听
// ============================================================
watch(
  () => [route.params.folderId, route.params.noteId, props.noteId, props.isNew],
  () => {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
    loadNote()
  },
  { immediate: true, deep: false }
)

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  loadAllTags()
  if (isNewNote.value) {
    nextTick(() => {
      const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
      if (textarea) textarea.focus()
    })
  }
})

// ============================================================
// 暴露方法
// ============================================================
defineExpose({
  loadNote,
  handleSave,
})
</script>

<style scoped>
.note-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}
</style>