<!-- src/views/main/NoteDetail.vue -->
<template>
  <div class="note-detail" v-loading="loading">
    <!-- ============================================================
    顶部头部
    ============================================================ -->
    <div class="note-header">
      <div class="header-left">
        <el-button size="small" text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-input
          v-model="editTitle"
          placeholder="无标题笔记"
          class="header-title-input"
          @focus="handleTitleFocus"
          clearable
        />
        <span class="save-status">{{ saveStatus }}</span>
      </div>
      <div class="header-right">
        <el-button type="primary" size="small" :loading="saving" @click="handleSave">
          保存
        </el-button>
        <div class="header-icon-group">
          <el-icon size="18" class="header-icon" @click="togglePreview"><DocumentCopy /></el-icon>
          <el-icon size="18" class="header-icon" @click="toggleFullscreen"><FullScreen /></el-icon>
          <el-icon size="18" class="header-icon"><More /></el-icon>
        </div>
      </div>
    </div>

    <!-- ============================================================
    编辑器工具栏
    ============================================================ -->
    <div class="editor-toolbar">
      <el-button-group size="small">
        <el-button @click="undo">
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
        <el-button @click="redo">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
        <el-button @click="printDoc">
          <el-icon><Printer /></el-icon>
        </el-button>
        <el-button @click="openAttachment">
          <el-icon><Paperclip /></el-icon>
        </el-button>
      </el-button-group>

      <div class="toolbar-divider"></div>

      <el-dropdown trigger="click" @command="handleInsert">
        <el-button size="small" type="primary" text>
          <el-icon><Plus /></el-icon>
          插入
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="image">🖼 图片</el-dropdown-item>
            <el-dropdown-item command="table">📊 表格</el-dropdown-item>
            <el-dropdown-item command="code">💻 代码块</el-dropdown-item>
            <el-dropdown-item command="link">🔗 链接</el-dropdown-item>
            <el-dropdown-item command="divider">─ 分割线</el-dropdown-item>
            <el-dropdown-item command="formula">∑ 公式</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="toolbar-divider"></div>

      <el-dropdown trigger="click" @command="handleHeading">
        <el-button size="small" text>
          正文
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="p">正文</el-dropdown-item>
            <el-dropdown-item command="h1">标题 1</el-dropdown-item>
            <el-dropdown-item command="h2">标题 2</el-dropdown-item>
            <el-dropdown-item command="h3">标题 3</el-dropdown-item>
            <el-dropdown-item command="h4">标题 4</el-dropdown-item>
            <el-dropdown-item command="h5">标题 5</el-dropdown-item>
            <el-dropdown-item command="h6">标题 6</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button size="small" text>
          默认字体
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>默认字体</el-dropdown-item>
            <el-dropdown-item>微软雅黑</el-dropdown-item>
            <el-dropdown-item>宋体</el-dropdown-item>
            <el-dropdown-item>黑体</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button size="small" text>
          14
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>12</el-dropdown-item>
            <el-dropdown-item>14</el-dropdown-item>
            <el-dropdown-item>16</el-dropdown-item>
            <el-dropdown-item>18</el-dropdown-item>
            <el-dropdown-item>20</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="toolbar-divider"></div>

      <el-button-group size="small">
        <el-button @click="format('bold')" :class="{ active: isActive('bold') }">
          <b>B</b>
        </el-button>
        <el-button @click="format('italic')" :class="{ active: isActive('italic') }">
          <i>I</i>
        </el-button>
        <el-button @click="format('underline')" :class="{ active: isActive('underline') }">
          <u>U</u>
        </el-button>
        <el-button @click="format('strikethrough')">
          <s>S</s>
        </el-button>
      </el-button-group>

      <div class="toolbar-divider"></div>

      <el-color-picker v-model="fontColor" size="small" show-alpha @change="setFontColor">
        <template #default>
          <el-button size="small" text>
            <span style="color: var(--font-color)">A</span>
          </el-button>
        </template>
      </el-color-picker>

      <div class="toolbar-divider"></div>

      <el-button size="small" text @click="aiOptimize">
        <el-icon><MagicStick /></el-icon>
        AI
      </el-button>

      <div class="toolbar-divider"></div>

      <el-button-group size="small">
        <el-button @click="format('todoList')">☑</el-button>
        <el-button @click="format('orderedList')">≡</el-button>
        <el-button @click="format('unorderedList')">☰</el-button>
        <el-button @click="indentReduce">←≡</el-button>
        <el-button @click="indentAdd">≡→</el-button>
      </el-button-group>

      <div class="toolbar-divider"></div>

      <el-button-group size="small">
        <el-button @click="insertDivider">
          <el-icon><Minus /></el-icon>
        </el-button>
        <el-button @click="insertTable">
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-button-group>

      <div class="toolbar-divider"></div>

      <el-button size="small" text @click="openSearch">
        <el-icon><Search /></el-icon>
      </el-button>
    </div>

    <!-- ============================================================
    编辑区
    ============================================================ -->
    <div class="note-body">
      <div class="editor-wrapper">
        <el-input
          v-show="!showPreview"
          v-model="editContent"
          type="textarea"
          placeholder="输入'/'可插入内容"
          class="content-input auto-height-textarea"
          :autosize="{ minRows: 20, maxRows: 100 }"
          @input="handleContentChange"
          @keydown="handleKeydown"
        />

        <div v-show="showPreview" class="editor-preview auto-preview" v-html="renderedContent" />
      </div>
    </div>

    <!-- ============================================================
    标签弹窗
    ============================================================ -->
    <el-dialog v-model="showTagDialog" title="添加标签" width="380px">
      <el-checkbox-group v-model="selectedTagIds">
        <el-checkbox v-for="tag in allTags" :key="tag.id" :label="tag.id">
          <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddTags">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus, ArrowDown, ArrowLeft,
  RefreshLeft, RefreshRight, Printer, Paperclip,
  DocumentCopy, More, MagicStick, Minus, Grid, Search, FullScreen
} from '@element-plus/icons-vue'
import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { noteApi } from '@/api/note'
// ✅ 新增：防抖加载相关
let loadTimer: number | null = null
let lastLoadedNoteId: string | null = null
// ============================================================
// Types
// ============================================================
export interface CreateNoteRequest {
  title: string
  content?: string
  folderId?: string | null
  summary?: string
  isStarred?: number
  isArchived?: number
  tagIds?: string[]
}

// ============================================================
// Props - 从路由 props 传入
// ============================================================
const props = defineProps<{
  /** 笔记ID，空或 undefined 表示新建 */
  noteId?: string | null
  /** 是否新建笔记（由路由 props 传入） */
  isNew?: boolean
  /** 文件夹ID */
  folderId?: string
  /** 新笔记的默认文件夹ID（兼容旧方式） */
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

const editTitle = ref('')
const editContent = ref('')
const editTags = ref<any[]>([])
const selectedTagIds = ref<string[]>([])
const allTags = ref<any[]>([])

const saveStatus = ref('已保存')
const activeFormats = ref<string[]>([])
const fontColor = ref('#000000')
let saveTimer: number | null = null

// ============================================================
// 计算属性
// ============================================================

/** 当前有效的文件夹ID */
const currentFolderId = computed(() => {
  // 1. props 传入
  if (props.newNoteFolderId) return props.newNoteFolderId
  if (props.folderId) return props.folderId
  
  // 2. 路由参数
  const paramsFolderId = route.params.folderId as string
  if (paramsFolderId && paramsFolderId !== 'new') return paramsFolderId
  
  // 3. query 参数
  return route.query.folderId as string || null
})

/** 当前有效的笔记ID */
const currentNoteId = computed(() => {
  // 1. props 传入
  if (props.noteId) return props.noteId
  
  // 2. 路由参数
  const paramsNoteId = route.params.noteId as string
  if (paramsNoteId && paramsNoteId !== 'new' && paramsNoteId !== '') {
    return paramsNoteId
  }
  
  // 3. 兼容旧路由
  const paramsId = route.params.id as string
  if (paramsId && paramsId !== 'new') return paramsId
  
  return null
})

/** 是否新建笔记 */
const isNewNote = computed(() => {
  // 1. props 明确指定
  if (props.isNew !== undefined) return props.isNew
  
  // 2. 没有 noteId
  if (!currentNoteId.value) return true
  
  // 3. noteId 为 'new' 或空字符串
  const id = currentNoteId.value
  if (id === 'new' || id === '') return true
  
  // 4. 路由参数判断
  const paramsNoteId = route.params.noteId as string
  if (paramsNoteId === 'new' || paramsNoteId === '') return true
  
  return false
})

/** 当前笔记对象 */
const note = computed(() => noteStore.currentNote)

// ============================================================
// 预览渲染
// ============================================================
function parseMarkdownTable(match: string, headerRaw: string, rowsRaw: string): string {
  const headers = headerRaw
    .split('|')
    .filter(h => h.trim())
    .map(h => `<th>${h.trim()}</th>`)
    .join('')

  const body = rowsRaw
    .split('\n')
    .filter(r => r.trim())
    .map((rowStr: string) => {
      const cells = rowStr
        .split('|')
        .filter(c => c.trim())
        .map(c => `<td>${c.trim()}</td>`)
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`
}

const renderedContent = computed(() => {
  let text = editContent.value || ''

  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match: string, lang: string, code: string) => {
    return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
  })

  text = text.replace(/`([^`]+)`/g, (match: string, code: string) => `<code>${code}</code>`)
  text = text.replace(/^### (.+)$/gm, (match: string, content: string) => `<h3>${content}</h3>`)
  text = text.replace(/^## (.+)$/gm, (match: string, content: string) => `<h2>${content}</h2>`)
  text = text.replace(/^# (.+)$/gm, (match: string, content: string) => `<h1>${content}</h1>`)
  text = text.replace(/\*\*(.+?)\*\*/g, (match: string, content: string) => `<strong>${content}</strong>`)
  text = text.replace(/\*(.+?)\*/g, (match: string, content: string) => `<em>${content}</em>`)
  text = text.replace(/<u>(.+?)<\/u>/g, (match: string, content: string) => `<u>${content}</u>`)
  text = text.replace(/~~(.+?)~~/g, (match: string, content: string) => `<s>${content}</s>`)
  text = text.replace(/^> (.+)$/gm, (match: string, content: string) => `<blockquote>${content}</blockquote>`)
  text = text.replace(/^-\s*\[x\]\s*(.+)$/gm, (match: string, content: string) => `<li class="todo done">☑ ${content}</li>`)
  text = text.replace(/^-\s*\[ \]\s*(.+)$/gm, (match: string, content: string) => `<li class="todo">☐ ${content}</li>`)
  text = text.replace(/^- (.+)$/gm, (match: string, content: string) => `<li>${content}</li>`)
  text = text.replace(/^(\d+)\. (.+)$/gm, (match: string, num: string, content: string) => `<li>${content}</li>`)
  text = text.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)*)/g, parseMarkdownTable)
  text = text.replace(/^---$/gm, '<hr>')
  text = text.replace(/\n/g, '<br>')

  return text
})

// ============================================================
// 工具函数
// ============================================================
function handleTitleFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  input.select()
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function getBackPath(): string {
  const fId = currentFolderId.value
  if (fId) {
    return `/file/${fId}`
  }
  return '/'
}



// ============================================================
// 加载笔记 - 带防抖和去重
// ============================================================
async function loadNote() {
  if (isNewNote.value) {
    editTitle.value = ''
    editContent.value = ''
    editTags.value = []
    noteStore.clearCurrentNote()
    saveStatus.value = '已保存'
    lastLoadedNoteId = null
    return
  }
  
  const id = currentNoteId.value
  if (!id) return
  
  // ✅ 如果笔记ID相同，不重复加载
  if (lastLoadedNoteId === id) {
    return
  }
  
  // ✅ 防抖，避免快速切换时重复请求
  if (loadTimer) {
    clearTimeout(loadTimer)
  }
  
  loadTimer = window.setTimeout(async () => {
    // ✅ 再次检查是否已经加载了相同的笔记
    if (lastLoadedNoteId === id) {
      loading.value = false
      loadTimer = null
      return
    }
    
    loading.value = true
    try {
      await noteStore.loadNote(id)
      if (note.value) {
        editTitle.value = note.value.title || ''
        editContent.value = note.value.content || ''
        editTags.value = note.value.tags || []
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
// 强制刷新笔记（用于保存后刷新）
// ============================================================
async function forceLoadNote() {
  // 清除缓存，强制重新加载
  lastLoadedNoteId = null
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
  await loadNote()
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

function removeTag(tagId: string) {
  editTags.value = editTags.value.filter(t => t.id !== tagId)
}

function handleAddTags() {
  const selected = allTags.value.filter(t => selectedTagIds.value.includes(t.id))
  const existing = new Set(editTags.value.map(t => t.id))
  editTags.value = [...editTags.value, ...selected.filter(t => !existing.has(t.id))]
  showTagDialog.value = false
  selectedTagIds.value = []
}

// ============================================================
// 编辑器操作
// ============================================================
function handleContentChange() {
  saveStatus.value = '编辑中...'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => autoSave(), 3000)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleSave()
  }
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = event.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    editContent.value = editContent.value.substring(0, start) + '  ' + editContent.value.substring(end)
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2
    }, 0)
  }
}

function insertMarkdown(prefix: string, suffix: string, placeholder: string = '') {
  const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
  if (!textarea) {
    editContent.value += prefix + placeholder + suffix
    return
  }
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = editContent.value.substring(start, end) || placeholder
  editContent.value = editContent.value.substring(0, start) + prefix + selected + suffix + editContent.value.substring(end)
  setTimeout(() => {
    textarea.focus()
    const newPos = start + prefix.length + selected.length + suffix.length
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

function format(type: string) {
  const map: Record<string, [string, string]> = {
    bold: ['**', '**'],
    italic: ['*', '*'],
    underline: ['<u>', '</u>'],
    strikethrough: ['~~', '~~'],
    orderedList: ['\n1. ', ''],
    unorderedList: ['\n- ', ''],
    todoList: ['\n- [ ] ', ''],
    blockquote: ['\n> ', ''],
  }
  if (map[type]) insertMarkdown(map[type][0], map[type][1])
  const index = activeFormats.value.indexOf(type)
  if (index > -1) activeFormats.value.splice(index, 1)
  else activeFormats.value.push(type)
}

function isActive(type: string): boolean {
  return activeFormats.value.includes(type)
}

function insertDivider() {
  editContent.value += '\n---\n'
}

function insertTable() {
  editContent.value += '\n| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |\n'
}

function indentAdd() { insertMarkdown('  ', '') }
function indentReduce() {
  const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
  if (!textarea) return
  const start = textarea.selectionStart
  const content = editContent.value
  if (content.substring(start - 2, start) === '  ') {
    editContent.value = content.slice(0, start - 2) + content.slice(start)
    setTimeout(() => textarea.setSelectionRange(start - 2, start - 2), 0)
  }
}

function setFontColor() {
  document.documentElement.style.setProperty('--font-color', fontColor.value)
}

function aiOptimize() {
  ElMessage.info('AI文本美化功能待开发')
}

function openSearch() {
  ElMessage.info('搜索功能待开发')
}

function printDoc() { window.print() }
function openAttachment() { ElMessage.info('附件上传待开发') }
function undo() { ElMessage.info('撤销待开发') }
function redo() { ElMessage.info('重做待开发') }

function handleInsert(command: string) {
  const map: Record<string, string> = {
    image: '![图片](url)',
    table: '| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |',
    code: '```语言\n代码\n```',
    link: '[链接文字](url)',
    divider: '---',
    formula: '$$ 公式 $$',
  }
  const text = map[command] || ''
  if (text) editContent.value += text
}

function handleHeading(command: string) {
  const map: Record<string, string> = {
    p: '',
    h1: '# ', h2: '## ', h3: '### ', h4: '#### ', h5: '##### ', h6: '###### ',
  }
  const prefix = map[command] || ''
  insertMarkdown(prefix, '')
}

// ============================================================
// 保存
// ============================================================
async function autoSave() {
  if (isNewNote.value || !currentNoteId.value) return
  try {
    const data: CreateNoteRequest = {
      title: editTitle.value,
      content: editContent.value,
      tagIds: editTags.value.map(t => t.id),
    }
    await noteApi.update(currentNoteId.value!, data)
    saveStatus.value = '已保存'
  } catch {
    saveStatus.value = '保存失败'
  }
}
// ============================================================
// 保存后的处理
// ============================================================
async function handleSave() {
  saving.value = true
  saveStatus.value = '保存中...'
  try {
    const data: CreateNoteRequest = {
      title: editTitle.value,
      content: editContent.value,
      tagIds: editTags.value.map(t => t.id),
    }
    
    if (isNewNote.value && currentFolderId.value) {
      data.folderId = currentFolderId.value
    }
    
    if (isNewNote.value) {
      const newNote = await noteApi.create(data)
      ElMessage.success('笔记创建成功')
      emit('note-created')
      emit('clear-new-note')
      saveStatus.value = '已保存'
      lastLoadedNoteId = newNote.id
      
      const folderPath = data.folderId || currentFolderId.value || 'default'
      router.replace(`/file/${folderPath}/note/${newNote.id}`)
    } else {
      const id = currentNoteId.value
      if (!id) {
        ElMessage.error('笔记ID不存在')
        return
      }
      await noteApi.update(id, data)
      ElMessage.success('保存成功')
      saveStatus.value = '已保存'
      emit('note-updated')
      emit('save')
      // ✅ 保存后强制刷新
      await forceLoadNote()
    }
  } catch (error) {
    saveStatus.value = '保存失败'
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}


// ============================================================
// 导航返回
// ============================================================
function goBack() {
  // 清除加载状态
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
// 监听路由变化 - 使用防抖
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
// ✅ 监听 props 变化（合并为一个 watch）
// ============================================================
watch(
  () => [props.noteId, props.folderId, props.isNew],
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
// ✅ 生命周期 - 移除重复加载
// ============================================================
onMounted(() => {
  loadAllTags()
  // ✅ watch 已经处理了加载，这里不再重复调用
  if (isNewNote.value) {
    nextTick(() => {
      const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
      if (textarea) textarea.focus()
    })
  }
})

// ============================================================
// ✅ 组件卸载时清理定时器
// ============================================================
onUnmounted(() => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
})

// ============================================================
// 暴露方法
// ============================================================
defineExpose({
  loadNote,
  forceLoadNote,
  handleSave
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

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-title-input {
  flex: 1;
  min-width: 100px;
}

.header-title-input :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none;
  padding: 0 8px;
  background: transparent;
}

.header-title-input :deep(.el-input__wrapper:hover) {
  background: #f5f7fa;
}

.header-title-input :deep(.el-input__wrapper.is-focus) {
  background: #f5f7fa;
}

.header-title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  height: 36px;
}

.save-status {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-icon-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.header-icon {
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.header-icon:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
  flex-shrink: 0;
  min-height: 48px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
  flex-shrink: 0;
}

.editor-toolbar .el-button {
  padding: 4px 10px;
  font-size: 13px;
}

.editor-toolbar .el-button-group .el-button {
  padding: 4px 10px;
}

.editor-toolbar .el-button.active {
  background: #e2e8f0;
  color: #0f172a;
}

.editor-toolbar .el-color-picker {
  --el-color-picker-size: 28px;
}

.arrow {
  font-size: 12px;
  margin-left: 2px;
}

.note-body {
  flex: 1;
  padding: 16px 20px;
  overflow: hidden;
  min-height: 0;
}

.editor-wrapper {
  height: 100%;
}

.content-input {
  height: 100%;
}

.content-input :deep(.el-textarea) {
  height: 100%;
}

.content-input :deep(.el-textarea__inner) {
  height: 100% !important;
  border: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
  resize: none;
  background: transparent;
  box-shadow: none;
}

.content-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.content-input :deep(.el-textarea__inner::placeholder) {
  color: #cbd5e1;
}

.editor-preview {
  height: 100%;
  overflow-y: auto;
  padding: 4px 0;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
}

.editor-preview :deep(h1) { font-size: 28px; margin: 16px 0 8px; font-weight: 700; }
.editor-preview :deep(h2) { font-size: 22px; margin: 14px 0 8px; font-weight: 600; }
.editor-preview :deep(h3) { font-size: 18px; margin: 12px 0 6px; font-weight: 600; }
.editor-preview :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding: 4px 16px;
  margin: 8px 0;
  background: #f8fafc;
  color: #475569;
}
.editor-preview :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #0f172a;
}
.editor-preview :deep(pre.code-block) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}
.editor-preview :deep(pre.code-block code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
.editor-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}
.editor-preview :deep(th),
.editor-preview :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  text-align: left;
}
.editor-preview :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
}
.editor-preview :deep(ul),
.editor-preview :deep(ol) {
  padding-left: 24px;
  margin: 4px 0;
}
.editor-preview :deep(li.todo) {
  list-style: none;
}
.editor-preview :deep(li.todo.done) {
  text-decoration: line-through;
  color: #94a3b8;
}
.editor-preview :deep(hr) {
  border: none;
  border-top: 2px dashed #e2e8f0;
  margin: 16px 0;
}
</style>