<!-- src/views/main/NoteDetail.vue -->
<template>
  <div class="note-detail" v-loading="loading">
    <!-- 头部 -->
    <NoteHeader
      v-model:title="editTitle"
      :save-status="saveStatus"
      :saving="saving"
      :show-preview="showPreview"
      @save="handleSave"
      @toggle-preview="togglePreview"
      @toggle-fullscreen="toggleFullscreen"
    />

    <!-- 编辑器外层：绑定preview-mode class -->
    <div class="editor-wrapper" >
      <MdEditor
        ref="editorRef"
        v-model="editContent"
        :theme="theme"
        :preview-theme="previewTheme"
        :code-theme="codeTheme"
        :language="language"
        :toolbars="currentToolbars"
        :toolbars-exclude="excludeToolbars"
        :placeholder="placeholder"
        :disabled="disabled"
        :show-toolbar-name="showToolbarName"       
        @on-change="handleContentChange"
        @on-save="handleSave"
        @on-upload-img="handleUploadImage"
        @on-error="handleError"
        @on-get-catalog="handleGetCatalog"
      />
    </div>

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

import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames, HeadList, ExposeParam } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { useFolderStore } from '@/store/modules/folder'
import { noteApi } from '@/api/note'
import NoteHeader from '@/components/note/NoteHeader.vue'
import NoteTagDialog from '@/components/note/NoteTagDialog.vue'
import { useNoteContent } from '@/composables/useNoteContent'
import { useNoteSave } from '@/composables/useNoteSave'

// ============================================================
// Props & Emits
// ============================================================
const props = defineProps<{
  noteId?: string | null
  isEdit?: boolean
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
const folderStore = useFolderStore()

// ============================================================
// 全局状态
// ============================================================
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)
const showTagDialog = ref(false)
const isFullscreen = ref(false)
const saveStatus = ref('已保存')
const allTags = ref<any[]>([])
const catalog = ref<HeadList[]>([])
const editorRef = ref<ExposeParam | null>(null)

// ============================================================
// MdEditor 基础配置
// ============================================================
const theme = ref<'light' | 'dark'>('light')
const previewTheme = ref<'default' | 'github' | 'vuepress'>('github')
const codeTheme = ref<'default' | 'github' | 'oneDark' | 'oneLight'>('default')
const language = ref('zh-CN')
const placeholder = ref('开始书写你的笔记...')
const disabled = ref(false)
const showToolbarName = ref(false)

// 完整工具栏配置
const fullToolbars: ToolbarNames[] = [
  'revoke',
  'next',
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  'prettier',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
  'pageFullscreen',
  'fullscreen'
]

const excludeToolbars = ref<ToolbarNames[]>([])

// 预览模式仅保留预览按钮
const currentToolbars = computed<ToolbarNames[]>(() => {
  return showPreview.value ? ['preview'] : fullToolbars
})

// ============================================================
// 工具函数
// ============================================================
const getBackPath = (): string => {
  const fId = currentFolderId.value
  return fId ? `/file/${fId}` : '/'
}

// ============================================================
// 文件夹缓存刷新
// ============================================================
async function clearFolderCache() {
  await folderStore.loadTree()
  emit('note-created')
  emit('save')
}

// ============================================================
// 笔记内容组合式函数
// ============================================================
const {
  editTitle,
  editContent,
  editTags,
  selectedTagIds,
  currentFolderId,
  currentNoteId,
  isEditNote,
  note,
  setNoteData,
  clearNoteData,
  getFullSaveTitle,
} = useNoteContent({
  props,
  route,
  noteStore,
})

// ============================================================
// 保存逻辑组合式函数
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
  isEditNote,
  noteApi,
  router,
  noteStore,
  emit,
  getFullSaveTitle,
  onSaveSuccess: async () => {
    await clearFolderCache()
  },
})

saving.value = savingState.value
saveStatus.value = saveStatusState.value

// ============================================================
// 编辑器聚焦
// ============================================================
function focusEditor() {
  if (!editorRef.value) {
    console.warn('编辑器实例不存在')
    return false
  }
  try {
    editorRef.value.getEditorView()?.focus()
    return true
  } catch {
    try {
      editorRef.value.focus()
      return true
    } catch {
      const cm = document.querySelector('.cm-content') as HTMLElement
      cm?.focus()
      return !!cm
    }
  }
}

// ============================================================
// 加载笔记
// ============================================================
let loadTimer: number | null = null
let lastLoadedNoteId: string | null = null

async function loadNote(noteId?: string) {
  const id = noteId || currentNoteId.value
  if (!id || lastLoadedNoteId === id) return

  if (loadTimer) clearTimeout(loadTimer)

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
        showPreview.value = !props.isEdit
        // 新建笔记默认聚焦
        if (!showPreview.value) {
          nextTick(() => setTimeout(focusEditor, 100))
        }
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
// 预览模式同步
// ============================================================
function updatePreviewMode() {
  showPreview.value = !props.isEdit
}

// ============================================================
// 标签相关
// ============================================================
async function loadAllTags() {
  try {
    const res = await tagStore.loadTags()
    allTags.value = res.items || []
  } catch {}
}

function handleAddTags() {
  const selected = allTags.value.filter(t => selectedTagIds.value.includes(t.id))
  const existIds = new Set(editTags.value.map(i => i.id))
  editTags.value = [...editTags.value, ...selected.filter(i => !existIds.has(i.id))]
  showTagDialog.value = false
  selectedTagIds.value = []
}

// ============================================================
// 切换预览【修复核心】
// ============================================================
async function togglePreview() {
  if (!editorRef.value) return
  showPreview.value = !showPreview.value
  // 调用官方纯预览API
  editorRef.value.togglePreviewOnly(showPreview.value)
  await nextTick()

  if (showPreview.value) {
    // 预览模式滚动到顶部
    const previewDom = document.querySelector('.md-editor-preview')
    if (previewDom) previewDom.scrollTop = 0
  } else {
    // 切回编辑模式，强制聚焦输入框，解决无法输入
    setTimeout(focusEditor, 80)
  }
}

// ============================================================
// 全屏切换
// ============================================================
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const rootEl = document.querySelector('.note-detail') as HTMLElement
  if (isFullscreen.value) rootEl?.requestFullscreen?.()
  else document.exitFullscreen?.()
}

// ============================================================
// 编辑器事件
// ============================================================
function handleContentChange() {
  saveStatus.value = '编辑中...'
  autoSave()
}

async function handleSave() {
  const ok = await saveNote()
  if (ok) await clearFolderCache()
}

function handleUploadImage(files: File[], callback: (urls: string[]) => void) {
  const tempUrls = files.map(f => URL.createObjectURL(f))
  callback(tempUrls)
}

function handleError(err: any) {
  console.error('编辑器异常', err)
  ElMessage.error(`编辑器错误：${err.message}`)
}

function handleGetCatalog(list: HeadList[]) {
  catalog.value = list
}

// ============================================================
// 对外暴露方法
// ============================================================
function getContent() {
  return editContent.value
}
function setContent(v: string) {
  editContent.value = v
}
function getCatalogData() {
  return catalog.value
}

// ============================================================
// 监听路由/参数
// ============================================================
watch(
  () => [route.params.folderId, route.params.noteId, props.noteId, props.isEdit],
  () => {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
    updatePreviewMode()
    loadNote()
  },
  { immediate: true }
)

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  updatePreviewMode()
 // loadAllTags()
  if (isEditNote.value && !showPreview.value) {
    nextTick(() => setTimeout(focusEditor, 300))
  }
})

defineExpose({
  loadNote,
  handleSave,
  clearFolderCache,
  getContent,
  setContent,
  getCatalog: getCatalogData,
  focusEditor,
  togglePreview,
  getEditor: () => editorRef.value,
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

.editor-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px 16px;
}

/* ============================================================
   编辑器基础样式
   ============================================================ */
.editor-wrapper :deep(.md-editor) {
  height: 100% !important;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.editor-wrapper :deep(.md-editor-toolbar) {
  background: #fafbfc;
  border-bottom: 1px solid #e4e7ed;
  padding: 4px 8px;
  flex-shrink: 0;
}

.editor-wrapper :deep(.md-editor-content) {
  height: calc(100% - 48px) !important;
  display: flex !important;
  flex-direction: row !important;
}

.editor-wrapper :deep(.md-editor-input-wrapper) {
  flex: 1 !important;
  height: 100% !important;
  overflow: hidden !important;
}

.editor-wrapper :deep(.md-editor-preview-wrapper) {
  flex: 1 !important;
  height: 100% !important;
  overflow-y: auto !important;
  border-left: 1px solid #e4e7ed;
}

/* 取消预览区最大宽度限制，铺满容器 */
.editor-wrapper :deep(.md-editor-preview) {
  padding: 24px 32px !important;
  background: #ffffff;
  min-height: 100% !important;
  box-sizing: border-box !important;
  max-width: none !important;
  width: 100% !important;
  margin: 0 !important;
}

.editor-wrapper :deep(.cm-editor) {
  height: 100% !important;
}

/* ============================================================
   预览模式样式（依赖 .preview-mode class，模板已绑定）
   ============================================================ */
.editor-wrapper.preview-mode :deep(.md-editor-toolbar) {
  display: none !important;
}

.editor-wrapper.preview-mode :deep(.md-editor-content) {
  height: 100% !important;
}

.editor-wrapper.preview-mode :deep(.md-editor-input-wrapper) {
  display: none !important;
  flex: 0 0 0 !important;
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

.editor-wrapper.preview-mode :deep(.md-editor-preview-wrapper) {
  flex: 1 1 100% !important;
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  border-left: none !important;
}

.editor-wrapper.preview-mode :deep(.md-editor-preview) {
  padding: 32px 48px !important;
  max-width: none !important;
  width: 100% !important;
}

/* ============================================================
   暗色主题适配
   ============================================================ */
@media (prefers-color-scheme: dark) {
  .editor-wrapper :deep(.md-editor-toolbar) {
    background: #1f1f1f;
    border-bottom-color: #3a3a3a;
  }

  .editor-wrapper :deep(.md-editor-preview) {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .editor-wrapper :deep(.md-editor-preview-wrapper) {
    border-left-color: #3a3a3a;
  }

  .editor-wrapper.preview-mode :deep(.md-editor-preview-wrapper) {
    border-left: none;
  }
}

/* ============================================================
   响应式适配
   ============================================================ */
@media (max-width: 768px) {
  .editor-wrapper {
    padding: 0 8px 8px;
  }

  .editor-wrapper :deep(.md-editor-preview) {
    padding: 16px 20px !important;
  }

  .editor-wrapper.preview-mode :deep(.md-editor-preview) {
    padding: 16px 20px !important;
  }
}

/* ============================================================
   预览内容美化
   ============================================================ */
.editor-wrapper :deep(.md-editor-preview h1),
.editor-wrapper :deep(.md-editor-preview h2),
.editor-wrapper :deep(.md-editor-preview h3),
.editor-wrapper :deep(.md-editor-preview h4),
.editor-wrapper :deep(.md-editor-preview h5),
.editor-wrapper :deep(.md-editor-preview h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.editor-wrapper :deep(.md-editor-preview p) {
  line-height: 1.8;
  margin-bottom: 1em;
}

.editor-wrapper :deep(.md-editor-preview img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.editor-wrapper :deep(.md-editor-preview code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.editor-wrapper :deep(.md-editor-preview pre) {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.editor-wrapper :deep(.md-editor-preview blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin-left: 0;
  color: #666;
}

.editor-wrapper :deep(.md-editor-preview table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.editor-wrapper :deep(.md-editor-preview th),
.editor-wrapper :deep(.md-editor-preview td) {
  border: 1px solid #e4e7ed;
  padding: 8px 12px;
  text-align: left;
}

.editor-wrapper :deep(.md-editor-preview th) {
  background: #f5f7fa;
  font-weight: 600;
}
</style>