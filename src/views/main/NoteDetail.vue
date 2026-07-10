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

    <!-- 标签区域 -->
    <div class="note-tags-area" v-if="!showPreview">
      <div class="tags-wrapper">
        <div class="tags-list">
          <!-- 标签列表 -->
          <el-tag
            v-for="tag in editTags"
            :key="tag.id"
            size="default"
            closable
            class="note-tag"
            :style="{
              backgroundColor: (tag.color || '#667eea') + '20',
              borderColor: tag.color || '#667eea',
              color: tag.color || '#667eea'
            }"
            @close="removeTag(tag.id)"
            @click="handleTagClick(tag)"
          >
            {{ tag.name }}
          </el-tag>
          
          <!-- 快速创建输入框 -->
          <div class="tag-input-wrapper" v-if="showTagInput">
            <el-input
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              placeholder="标签名，回车创建"
              clearable
              @keydown.enter="createTagFromInput"
              @blur="handleTagInputBlur"
              @keydown.esc="cancelTagInput"
            >
              <template #prefix>#</template>
              <template #append>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="createTagFromInput"
                  :loading="isCreatingTag"
                >
                  创建
                </el-button>
              </template>
            </el-input>
          </div>

          <!-- 添加按钮 -->
          <el-button
            v-else
            size="small"
            text
            class="add-btn"
            @click="showTagInputField"
          >
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
          
          <!-- 批量选择 -->
          <el-button
            size="small"
            text
            class="add-btn select-btn"
            @click="openTagDialog"
          >
            <el-icon><Folder /></el-icon>
            选择
          </el-button>
        </div>
        
        <!-- 标签计数 -->
        <div class="tags-action" v-if="editTags.length > 0">
          <span class="tags-count">{{ editTags.length }} / {{ MAX_TAG_LIMIT }}</span>
          <el-button text size="small" type="danger" @click="clearAllNoteTags">清空</el-button>
        </div>
      </div>
    </div>

    <!-- 编辑器 -->
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
      :max-select-count="MAX_TAG_LIMIT"
      @confirm="handleAddTags"
      @create="handleCreateTagFromDialog"
      @refresh-tags="refreshAllTags"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames, HeadList, ExposeParam } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { useFolderStore } from '@/store/modules/folder'
import { noteApi } from '@/api/note'
import { tagApi } from '@/api/tag'
import NoteHeader from '@/components/note/NoteHeader.vue'
import NoteTagDialog from '@/components/note/NoteTagDialog.vue'
import { useNoteContent } from '@/composables/useNoteContent'
import { useNoteSave } from '@/composables/useNoteSave'
import { assetApi } from '@/api/asset'
import type { Asset, Tag } from '@/types'

// ====================== 常量 ======================
const MAX_TAG_LIMIT = 15

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
// 状态
// ============================================================
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)
const showTagDialog = ref(false)
const isFullscreen = ref(false)
const saveStatus = ref('已保存')
const allTags = ref<Tag[]>([])
const catalog = ref<HeadList[]>([])
const editorRef = ref<ExposeParam | null>(null)

// 标签输入
const showTagInput = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<any>(null)
const isCreatingTag = ref(false)

// ============================================================
// MdEditor 配置
// ============================================================
const theme = ref<'light' | 'dark'>('light')
const previewTheme = ref<'default' | 'github' | 'vuepress'>('github')
const codeTheme = ref<'default' | 'github' | 'oneDark' | 'oneLight'>('default')
const language = ref('zh-CN')
const placeholder = ref('开始书写你的笔记...')
const disabled = ref(false)
const showToolbarName = ref(false)

const fullToolbars: ToolbarNames[] = [
  'revoke','next','bold','underline','italic','strikeThrough','title','sub','sup',
  'quote','unorderedList','orderedList','task','codeRow','code','link','image',
  'table','mermaid','katex','prettier','preview','previewOnly','htmlPreview','catalog','pageFullscreen','fullscreen'
]

const excludeToolbars = ref<ToolbarNames[]>([])
const currentToolbars = computed<ToolbarNames[]>(() => showPreview.value ? ['preview'] : fullToolbars)

// ============================================================
// 笔记组合
// ============================================================
const {
  editTitle, editContent, editTags, selectedTagIds, currentFolderId,
  currentNoteId, isEditNote, note, setNoteData, clearNoteData, getFullSaveTitle,
} = useNoteContent({ props, route, noteStore })

const {
  saving: savingState, saveStatus: saveStatusState, handleSave: saveNote, autoSave,
} = useNoteSave({
  editTitle, editContent, editTags, currentFolderId, currentNoteId, isEditNote,
  noteApi, router, noteStore, emit, getFullSaveTitle,
  onSaveSuccess: async () => await clearFolderCache()
})
saving.value = savingState.value
saveStatus.value = saveStatusState.value

// ============================================================
// 工具
// ============================================================
async function clearFolderCache() {
  await folderStore.loadTree()
  emit('note-created')
  emit('save')
}

function focusEditor() {
  if (!editorRef.value) return false
  try { editorRef.value.getEditorView()?.focus(); return true }
  catch { try { editorRef.value.focus(); return true }
    catch { const cm = document.querySelector('.cm-content') as HTMLElement; cm?.focus(); return !!cm }
  }
}

function findTagByName(name: string) {
  return allTags.value.find(t => t.name.toLowerCase() === name.trim().toLowerCase())
}

function checkTagLimit(addCount = 1): boolean {
  if (editTags.value.length + addCount > MAX_TAG_LIMIT) {
    ElMessage.warning(`最多添加 ${MAX_TAG_LIMIT} 个标签`)
    return false
  }
  return true
}

async function refreshAllTags() {
  try {
    const res = await tagStore.loadTags()
    allTags.value = res.items || []
  } catch { ElMessage.error('刷新标签失败') }
}

function openTagDialog() {
  selectedTagIds.value = []
  showTagDialog.value = true
}

function clearAllNoteTags() {
  ElMessageBox.confirm('清空所有标签？', '提示', { type: 'info' })
    .then(() => { editTags.value = []; ElMessage.success('已清空') })
    .catch(() => {})
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
    if (lastLoadedNoteId === id) { loading.value = false; loadTimer = null; return }
    loading.value = true
    try {
      await noteStore.loadNote(id)
      if (note.value) {
        setNoteData(note.value)
        lastLoadedNoteId = id
        showPreview.value = !props.isEdit
        if (!showPreview.value) nextTick(() => setTimeout(focusEditor, 100))
      }
    } catch {
      ElMessage.error('加载笔记失败')
    } finally { loading.value = false; loadTimer = null }
  }, 150)
}

function updatePreviewMode() { showPreview.value = !props.isEdit }

// ============================================================
// 标签业务
// ============================================================
async function loadAllTags() {
  if (allTags.value.length) return
  await refreshAllTags()
}

function handleAddTags(selectedIds: string[]) {
  if (!selectedIds.length) { ElMessage.warning('请选择标签'); return }
  const selected = allTags.value.filter(t => selectedIds.includes(t.id))
  const newTags = selected.filter(t => !editTags.value.some(e => e.id === t.id))
  if (!newTags.length) { ElMessage.warning('标签已存在'); return }
  if (!checkTagLimit(newTags.length)) return
  editTags.value = [...editTags.value, ...newTags]
  showTagDialog.value = false
  selectedTagIds.value = []
  ElMessage.success(`已添加 ${newTags.length} 个标签`)
}

async function handleCreateTagFromDialog(name: string) {
  const pureName = name.trim()
  if (!pureName) return
  const exist = findTagByName(pureName)
  if (exist) {
    if (!editTags.value.some(t => t.id === exist.id) && checkTagLimit()) {
      editTags.value = [...editTags.value, exist]
      ElMessage.success(`已添加 ${exist.name}`)
    }
    return
  }
  try {
    const res = await tagApi.create({ name: pureName })
    if (res?.id) {
      await refreshAllTags()
      if (checkTagLimit()) editTags.value = [...editTags.value, res]
      ElMessage.success(`已创建 ${pureName}`)
    }
  } catch { ElMessage.error('创建失败') }
}

function removeTag(tagId: string) {
  ElMessageBox.confirm('移除该标签？', '提示', { type: 'info' })
    .then(() => {
      editTags.value = editTags.value.filter(t => t.id !== tagId)
      ElMessage.success('已移除')
    }).catch(() => {})
}

function handleTagClick(tag: Tag) {
  router.push(`/file/tag/${tag.id}`)
}

function showTagInputField() {
  showTagInput.value = true
  tagInputValue.value = ''
  nextTick(() => tagInputRef.value?.focus())
}

function cancelTagInput() {
  showTagInput.value = false
  tagInputValue.value = ''
}

function handleTagInputBlur() {
  setTimeout(() => {
    if (!tagInputValue.value.trim()) showTagInput.value = false
  }, 150)
}

async function createTagFromInput() {
  const name = tagInputValue.value.trim()
  if (!name) { cancelTagInput(); return }
  if (!checkTagLimit()) return
  isCreatingTag.value = true
  try {
    const exist = findTagByName(name)
    if (exist) {
      if (!editTags.value.some(t => t.id === exist.id)) {
        editTags.value = [...editTags.value, exist]
        ElMessage.success(`已添加 ${exist.name}`)
      }
      cancelTagInput()
      return
    }
    const res = await tagApi.create({ name })
    if (res?.id) {
      await refreshAllTags()
      editTags.value = [...editTags.value, res]
      ElMessage.success(`已创建 ${name}`)
      cancelTagInput()
    }
  } catch { ElMessage.error('创建失败') }
  finally { isCreatingTag.value = false }
}

// ============================================================
// 切换预览/全屏
// ============================================================
async function togglePreview() {
  if (!editorRef.value) return
  showPreview.value = !showPreview.value
  editorRef.value.togglePreviewOnly(showPreview.value)
  await nextTick()
  if (showPreview.value) {
    const previewDom = document.querySelector('.md-editor-preview')
    if (previewDom) previewDom.scrollTop = 0
  } else setTimeout(focusEditor, 80)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const rootEl = document.querySelector('.note-detail') as HTMLElement
  isFullscreen.value ? rootEl?.requestFullscreen?.() : document.exitFullscreen?.()
}

// ============================================================
// 编辑器事件
// ============================================================
function handleContentChange() { saveStatus.value = '编辑中...'; autoSave() }
async function handleSave() {
  const ok = await saveNote()
  if (ok) await clearFolderCache()
}

// ============================================================
// 图片上传
// ============================================================
const uploadedAssets = ref<Asset[]>([])
async function handleUploadImage(files: File[], callback: (urls: string[]) => void) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  if (!imageFiles.length) { ElMessage.warning('请选择图片'); callback([]); return }
  const results: Asset[] = []
  for (const file of imageFiles) {
    if (file.size > 10 * 1024 * 1024) { ElMessage.warning(`${file.name} 超过10MB`); continue }
    try {
      const res = await assetApi.upload(file, props.noteId ?? undefined)
      results.push(res)
      uploadedAssets.value.push(res)
    } catch { ElMessage.error(`${file.name} 上传失败`) }
  }
  callback(results.map(r => r.storage_path))
  if (results.length) ElMessage.success(`上传 ${results.length} 张图片`)
}

function handleError(err: any) {
  console.error(err)
  ElMessage.error(`编辑器错误：${err.message}`)
}
function handleGetCatalog(list: HeadList[]) { catalog.value = list }

// ============================================================
// 对外暴露
// ============================================================
function getContent() { return editContent.value }
function setContent(v: string) { editContent.value = v }
function getCatalogData() { return catalog.value }

defineExpose({
  loadNote, handleSave, clearFolderCache, getContent, setContent,
  getCatalog: getCatalogData, focusEditor, togglePreview,
  getEditor: () => editorRef.value, refreshAllTags,
})

// ============================================================
// 监听 & 生命周期
// ============================================================
const routeWatch = watch(
  () => [route.params.folderId, route.params.noteId, props.noteId, props.isEdit],
  () => {
    if (loadTimer) { clearTimeout(loadTimer); loadTimer = null }
    updatePreviewMode()
    loadNote()
  }, { immediate: true }
)

onMounted(() => {
  updatePreviewMode()
  loadAllTags()
  if (isEditNote.value && !showPreview.value) nextTick(() => setTimeout(focusEditor, 300))
})

onUnmounted(() => {
  if (loadTimer) clearTimeout(loadTimer)
  routeWatch.stop()
})
</script>

<style scoped>
/* ==================== 基础 ==================== */
.note-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

/* ==================== 标签区域 ==================== */
.note-tags-area {
  padding: 6px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  background: #fafbfc;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.tags-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.tags-action {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 12px;
  color: #8896a8;
}

/* 标签 */
.note-tag {
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  border: 1px solid transparent;
  transition: all 0.2s;
  user-select: none;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.note-tag :deep(.el-tag__close) {
  color: inherit;
  font-size: 11px;
  margin-left: 2px;
}
.note-tag :deep(.el-tag__close:hover) {
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
}

/* 按钮 */
.add-btn {
  color: #8896a8;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;
  height: 24px;
  line-height: 22px;
  border: 1px dashed #d0d7e3;
  transition: all 0.2s;
}
.add-btn:hover {
  color: #667eea;
  background: rgba(102,126,234,0.08);
  border-color: #667eea;
}
.add-btn .el-icon { font-size: 13px; }
.add-btn.select-btn { border: none; }
.add-btn.select-btn:hover { border: none; }

/* 输入框 */
.tag-input-wrapper {
  display: inline-flex;
  align-items: center;
  min-width: 180px;
}
.tag-input-wrapper :deep(.el-input) { height: 24px; }
.tag-input-wrapper :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px;
  padding: 0 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: none !important;
}
.tag-input-wrapper :deep(.el-input__wrapper:hover) { border-color: #667eea; }
.tag-input-wrapper :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102,126,234,0.1) !important;
}
.tag-input-wrapper :deep(.el-input__inner) {
  font-size: 12px;
  height: 22px;
  line-height: 22px;
}
.tag-input-wrapper :deep(.el-input__prefix) {
  color: #8896a8;
  font-weight: 600;
  font-size: 13px;
}
.tag-input-wrapper :deep(.el-input-group__append) {
  border-radius: 0 4px 4px 0;
  padding: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
}
.tag-input-wrapper :deep(.el-input-group__append .el-button) {
  border-radius: 0 4px 4px 0;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}
.tag-input-wrapper :deep(.el-input-group__append .el-button:hover) { opacity: 0.9; }
.tag-input-wrapper :deep(.el-input-group__append .el-button:active) { transform: scale(0.95); }

/* ==================== 编辑器 ==================== */
.editor-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px 16px;
}

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
.editor-wrapper :deep(.md-editor-preview) {
  padding: 24px 32px !important;
  background: #fff;
  min-height: 100% !important;
  max-width: none !important;
  width: 100% !important;
}
.editor-wrapper :deep(.cm-editor) { height: 100% !important; }

/* 预览模式 */
.editor-wrapper.preview-mode :deep(.md-editor-toolbar) { display: none !important; }
.editor-wrapper.preview-mode :deep(.md-editor-content) { height: 100% !important; }
.editor-wrapper.preview-mode :deep(.md-editor-input-wrapper) { display: none !important; }
.editor-wrapper.preview-mode :deep(.md-editor-preview-wrapper) {
  flex: 1 1 100% !important;
  width: 100% !important;
  border-left: none !important;
}
.editor-wrapper.preview-mode :deep(.md-editor-preview) {
  padding: 32px 48px !important;
}

/* ==================== 暗色 ==================== */
@media (prefers-color-scheme: dark) {
  .note-detail { background: #1a1a2e; }
  .note-tags-area { background: #1a1a2e; border-bottom-color: #2a2a3e; }
  .add-btn { color: #8896a8; border-color: #3a3a4e; }
  .add-btn:hover { color: #8a9ef0; background: rgba(102,126,234,0.15); border-color: #8a9ef0; }
  .tag-input-wrapper :deep(.el-input__wrapper) { background: #1a1a2e; border-color: #3a3a4e; }
  .tag-input-wrapper :deep(.el-input__inner) { color: #c8d0e0; }
  .tag-input-wrapper :deep(.el-input-group__append) { background: #1a1a2e; border-color: #3a3a4e; }
  .tags-action { color: #8896a8; }
  .editor-wrapper :deep(.md-editor-toolbar) { background: #1f1f1f; border-bottom-color: #3a3a3a; }
  .editor-wrapper :deep(.md-editor-preview) { background: #1a1a1a; color: #e0e0e0; }
  .editor-wrapper :deep(.md-editor-preview-wrapper) { border-left-color: #3a3a3a; }
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .note-tags-area { padding: 4px 12px; }
  .tags-action { width: 100%; justify-content: flex-end; margin-top: 2px; }
  .note-tag { font-size: 11px; height: 20px; line-height: 18px; max-width: 70px; }
  .add-btn { font-size: 11px; height: 20px; line-height: 18px; }
  .tag-input-wrapper { min-width: 130px; }
  .tag-input-wrapper :deep(.el-input) { height: 20px; }
  .tag-input-wrapper :deep(.el-input__inner) { height: 18px; font-size: 11px; line-height: 18px; }
  .tag-input-wrapper :deep(.el-input-group__append .el-button) { height: 20px; padding: 0 6px; font-size: 11px; }
  .editor-wrapper { padding: 0 8px 8px; }
  .editor-wrapper :deep(.md-editor-preview) { padding: 16px 20px !important; }
}
</style>