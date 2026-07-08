// src/composables/useNoteSave.ts
import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'

// ✅ 定义创建笔记的请求类型
interface CreateNoteRequest {
  title: string
  content?: string
  folderId?: string | null
  tagIds?: string[]
  summary?: string
  isStarred?: number
  isArchived?: number
}

interface SaveOptions {
  editTitle: Ref<string>
  editContent: Ref<string>
  editTags: Ref<any[]>
  currentFolderId: Ref<string | null>
  currentNoteId: Ref<string | null>
  isNewNote: Ref<boolean>
  noteApi: any
  router: Router
  noteStore: any
  emit: any
  onSaveSuccess?: (noteId: string) => void
}

export function useNoteSave(options: SaveOptions) {
  const {
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
    onSaveSuccess,
  } = options

  const saving = ref(false)
  const saveStatus = ref('已保存')
  let saveTimer: number | null = null

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

  async function handleSave(): Promise<{ id: string } | null> {
    saving.value = true
    saveStatus.value = '保存中...'
    try {
      const data: CreateNoteRequest = {
        title: editTitle.value,
        content: editContent.value,
        tagIds: editTags.value.map(t => t.id),
      }
      
      // ✅ 新建笔记时添加 folderId
      if (isNewNote.value && currentFolderId.value) {
        data.folderId = currentFolderId.value
      }
      
      let result
      if (isNewNote.value) {
        result = await noteApi.create(data)
        ElMessage.success('笔记创建成功')
        emit('note-created')
        emit('clear-new-note')
        saveStatus.value = '已保存'
        
        // 跳转到新路由
        const folderPath = data.folderId || currentFolderId.value || 'default'
        router.replace(`/file/${folderPath}/note/${result.id}`)
        
        // 调用成功回调
        if (onSaveSuccess) {
          onSaveSuccess(result.id)
        }
      } else {
        const id = currentNoteId.value
        if (!id) {
          ElMessage.error('笔记ID不存在')
          return null
        }
        result = await noteApi.update(id, data)
        ElMessage.success('保存成功')
        saveStatus.value = '已保存'
        emit('note-updated')
        emit('save')
        
        // 重新加载笔记
        if (onSaveSuccess) {
          onSaveSuccess(id)
        }
      }
      
      return result
    } catch (error) {
      saveStatus.value = '保存失败'
      console.error('保存失败:', error)
      ElMessage.error('保存失败，请重试')
      return null
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    saveStatus,
    handleSave,
    autoSave,
  }
}