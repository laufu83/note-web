// src/composables/useNoteContent.ts
import { ref, computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

interface ContentOptions {
  props: any
  route: RouteLocationNormalizedLoaded
  noteStore: any
}

// ✅ 工具函数：获取文件后缀名
function getFileExtension(filename: string): string {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) return ''
  return filename.slice(lastDotIndex)
}

// ✅ 获取文件名（不含后缀）
function getFileNameWithoutExtension(filename: string): string {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) return filename
  return filename.slice(0, lastDotIndex)
}

export function useNoteContent(options: ContentOptions) {
  const { props, route, noteStore } = options

  // 真实原始标题：存完整带后缀的字符串（和后端一致）
  const rawTitle = ref('')
  const editContent = ref('')
  const editTags = ref<any[]>([])
  const selectedTagIds = ref<string[]>([])

  // ✅ 当前文件的后缀名（如 .md、.txt）
  const fileExtension = ref('.md')

  // ✅ 更新后缀名
  function updateExtension(title: string) {
    const ext = getFileExtension(title)
    if (ext) {
      fileExtension.value = ext
    }
  }

  // ✅ 对外暴露给页面使用的编辑标题，自动去除后缀
  const editTitle = computed({
    get() {
      // 如果是新建模式，返回空字符串
      if (isEditNote.value === false) return rawTitle.value
      // 编辑模式：去掉后缀显示
      return getFileNameWithoutExtension(rawTitle.value)
    },
    set(val) {
      // 用户输入纯标题，只存干净文本，保存时再拼接后缀
      rawTitle.value = val
    }
  })

  const currentFolderId = computed(() => {
    if (props.newNoteFolderId) return props.newNoteFolderId
    if (props.folderId) return props.folderId

    const paramsFolderId = route.params.folderId as string
    if (paramsFolderId && paramsFolderId !== 'new') return paramsFolderId

    return route.query.folderId as string || null
  })

  const currentNoteId = computed(() => {
    if (props.noteId) return props.noteId

    const paramsNoteId = route.params.noteId as string
    if (paramsNoteId && paramsNoteId !== 'new' && paramsNoteId !== '') {
      return paramsNoteId
    }

    const paramsId = route.params.id as string
    if (paramsId && paramsId !== 'new') return paramsId

    return null
  })

  const isEditNote = computed(() => {
    if (props.isEdit !== undefined) return props.isEdit
    if (!currentNoteId.value) return false

    const id = currentNoteId.value
    if (id === 'new' || id === '') return false

    const paramsNoteId = route.params.noteId as string
    if (paramsNoteId === 'new' || paramsNoteId === '') return false

    return true
  })

  const note = computed(() => noteStore.currentNote)

  // 回填接口数据：后端返回带后缀的标题存入 rawTitle
  function setNoteData(data: any) {
    rawTitle.value = data.title || ''
    editContent.value = data.content || ''
    editTags.value = data.tags || []
    selectedTagIds.value = data.tags?.map((t: any) => t.id) || []
    // ✅ 更新后缀名
    updateExtension(rawTitle.value)
  }

  function clearNoteData() {
    rawTitle.value = ''
    editContent.value = ''
    editTags.value = []
    selectedTagIds.value = []
    fileExtension.value = '.md'  // ✅ 重置为默认
    noteStore.clearCurrentNote()
  }

  // ✅ 保存时调用，获取带后缀的完整标题
  function getFullSaveTitle(): string {
    const pureName = rawTitle.value.trim()
    // 空标题默认值
    const baseName = pureName || '无标题笔记'
    // 获取当前后缀名
    const ext = fileExtension.value || '.md'
    // 避免重复后缀
    if (baseName.endsWith(ext)) return baseName
    return `${baseName}${ext}`
  }

  return {
    editTitle,
    editContent,
    editTags,
    selectedTagIds,
    currentFolderId,
    currentNoteId,
    isEditNote,
    note,
    fileExtension,  // ✅ 导出后缀名
    setNoteData,
    clearNoteData,
    getFullSaveTitle,
    updateExtension,  // ✅ 导出更新后缀方法
  }
}