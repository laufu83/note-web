// src/composables/useFolderActions.ts
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { noteApi, folderApi } from '@/api'

interface ActionOptions {
  currentFolderId: any
  notes: any
  folders: any
  route: RouteLocationNormalizedLoaded
  router: Router
  refreshData: () => void
  loadData: () => void
  folderStore: any
  tagStore: any
  isSpecialView: any
  selectFirstItem: () => void
}

export function useFolderActions(options: ActionOptions) {
  const {
    currentFolderId,
    notes,
    folders,
    route,
    router,
    refreshData,
    loadData,
    folderStore,
    tagStore,
    isSpecialView,
    selectFirstItem,
  } = options

  // ============================================================
  // 弹窗状态
  // ============================================================
  const showFilterDialog = ref(false)
  const showRenameDialog = ref(false)
  const showMoveDialog = ref(false)
  const showShareDialog = ref(false)

  const renameValue = ref('')
  const renameTargetId = ref('')
  const renameTargetType = ref<'folder' | 'note'>('folder')

  const moveTargetId = ref<string | null>(null)
  const moveSourceId = ref('')
  const moveSourceType = ref<'folder' | 'note'>('folder')

  const shareTargetId = ref('')
  const shareTargetType = ref<'folder' | 'note'>('folder')

  // ============================================================
  // 计算属性
  // ============================================================
  const folderTree = computed(() => {
    const excludeId = moveSourceType.value === 'folder' ? moveSourceId.value : ''
    
    const filterSelf = (items: any[], excludeId: string): any[] => {
      return items
        .filter(i => {
          if (i.id === excludeId) return false
          return true
        })
        .map(i => ({
          ...i,
          children: i.children ? filterSelf(i.children, excludeId) : []
        }))
    }
    
    return filterSelf(folderStore.tree || [], excludeId)
  })

  // ============================================================
  // 回收站操作
  // ============================================================
  
  /**
   * 恢复笔记
   */
  async function handleRestoreNote(note: any) {
    try {
      await noteApi.restore(note.id)
      ElMessage.success(`已恢复「${note.title || '无标题笔记'}」`)
      await refreshData()
    } catch (error: any) {
      ElMessage.error(error?.message || '恢复失败，请重试')
    }
  }

  /**
   * 永久删除笔记
   */
  async function handlePermanentDeleteNote(note: any) {
    try {
      await ElMessageBox.confirm(
        `确定要永久删除「${note.title || '无标题笔记'}」吗？此操作不可恢复！`,
        '永久删除提示',
        { 
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        }
      )
      await noteApi.permanentDelete(note.id)
      ElMessage.success('已永久删除')
      await refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || '删除失败，请重试')
      }
    }
  }

  /**
   * 恢复文件夹
   */
  async function handleRestoreFolder(folder: any) {
    try {
      await folderApi.restore(folder.id)
      ElMessage.success(`已恢复「${folder.name}」`)
      await folderStore.loadTree()
      await refreshData()
    } catch (error: any) {
      ElMessage.error(error?.message || '恢复失败，请重试')
    }
  }

  /**
   * 永久删除文件夹
   */
  async function handlePermanentDeleteFolder(folder: any) {
    try {
      await ElMessageBox.confirm(
        `确定要永久删除「${folder.name}」吗？此操作不可恢复！`,
        '永久删除提示',
        { 
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        }
      )
      await folderApi.permanentDelete(folder.id)
      ElMessage.success('已永久删除')
      await folderStore.loadTree()
      await refreshData()
      if (currentFolderId.value === folder.id) {
        router.push('/')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || '删除失败，请重试')
      }
    }
  }

  // ============================================================
  // 文件夹操作
  // ============================================================
  function handleRenameFolder(folder: any) {
    renameTargetId.value = folder.id
    renameTargetType.value = 'folder'
    renameValue.value = folder.name
    showRenameDialog.value = true
  }

  function handleMoveFolder(folder: any) {
    moveSourceId.value = folder.id
    moveSourceType.value = 'folder'
    moveTargetId.value = folder.parentId || null
    showMoveDialog.value = true
  }

  async function handleCopyFolder(folder: any) {
    try {
      await folderApi.create({
        name: `${folder.name}(副本)`,
        parentId: folder.parentId,
        icon: folder.icon,
        color: folder.color
      })
      ElMessage.success('复制成功')
      await folderStore.loadTree()
      refreshData()
    } catch {}
  }

  function handleShareFolder(folder: any) {
    shareTargetId.value = folder.id
    shareTargetType.value = 'folder'
    showShareDialog.value = true
  }

  function handleExportFolder() {
    ElMessage.info('导出文件夹')
  }

  async function handleDeleteFolder(folder: any) {
    try {
      await ElMessageBox.confirm(`删除文件夹「${folder.name}」？`, '确认删除', { type: 'warning' })
      await folderApi.delete(folder.id)
      ElMessage.success('删除成功')
      await folderStore.loadTree()
      refreshData()
      if (currentFolderId.value === folder.id) {
        router.push('/')
      }
    } catch {}
  }

  // ============================================================
  // 笔记操作
  // ============================================================
  async function handleStarNote(note: any) {
    try {
      const res = await noteApi.toggleStar(note.id, note.isStarred ? 0 : 1)
      note.isStarred = res.isStarred
      ElMessage.success(res.isStarred ? '已加星' : '已取消星标')
      refreshData()
    } catch {}
  }

  function handleRenameNote(note: any) {
    renameTargetId.value = note.id
    renameTargetType.value = 'note'
    renameValue.value = note.title || '无标题笔记'
    showRenameDialog.value = true
  }

  function handleMoveNote(note: any) {
    moveSourceId.value = note.id
    moveSourceType.value = 'note'
    moveTargetId.value = note.folderId || null
    showMoveDialog.value = true
  }

  async function handleCopyNote(note: any) {
    try {
      await noteApi.create({
        title: `${note.title}(副本)`,
        content: note.content,
        folderId: note.folderId,
        tagIds: note.tags?.map((t: any) => t.id) || []
      })
      ElMessage.success('复制成功')
      refreshData()
    } catch {}
  }

  function handleShareNote(note: any) {
    shareTargetId.value = note.id
    shareTargetType.value = 'note'
    showShareDialog.value = true
  }

  function handleExportNote() {
    ElMessage.info('导出笔记')
  }

  async function handleArchiveNote(note: any) {
    try {
      await noteApi.toggleArchive(note.id, note.isArchived ? 0 : 1)
      note.isArchived = !note.isArchived
      ElMessage.success(note.isArchived ? '已归档' : '取消归档')
      refreshData()
    } catch {}
  }

  async function handleDeleteNote(note: any) {
    try {
      await ElMessageBox.confirm(`删除笔记「${note.title}」？`, '确认删除', { type: 'warning' })
      await noteApi.delete(note.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch {}
  }

  // ============================================================
  // 操作分发
  // ============================================================
  function handleFolderAction(cmd: string, folder: any) {
    // 检查是否在回收站视图（通过路由判断）
    const isTrashView = currentFolderId.value === 'trash'
    
    if (isTrashView) {
      // 回收站模式
      switch (cmd) {
        case 'restore':
          handleRestoreFolder(folder)
          break
        case 'delete-permanent':
          handlePermanentDeleteFolder(folder)
          break
        default:
          console.warn('未知的回收站命令:', cmd)
          break
      }
      return
    }

    // 普通模式
    switch (cmd) {
      case 'open':
        router.push(`/file/${folder.id}`)
        break
      case 'rename':
        handleRenameFolder(folder)
        break
      case 'move':
        handleMoveFolder(folder)
        break
      case 'copy':
        handleCopyFolder(folder)
        break
      case 'share':
        handleShareFolder(folder)
        break
      case 'export':
        handleExportFolder()
        break
      case 'delete':
        handleDeleteFolder(folder)
        break
      default:
        console.warn('未知命令:', cmd)
        break
    }
  }

  function handleNoteAction(cmd: string, note: any) {
    // 检查是否在回收站视图（通过路由判断）
    const isTrashView = currentFolderId.value === 'trash'
    
    if (isTrashView) {
      // 回收站模式
      switch (cmd) {
        case 'restore':
          handleRestoreNote(note)
          break
        case 'delete-permanent':
          handlePermanentDeleteNote(note)
          break
        default:
          console.warn('未知的回收站命令:', cmd)
          break
      }
      return
    }

    // 普通模式
    switch (cmd) {
      case 'open':
        if (currentFolderId.value) {
          router.push(`/file/${currentFolderId.value}/note/${note.id}`)
        } else {
          router.push(`/note/${note.id}`)
        }
        break
      case 'star':
        handleStarNote(note)
        break
      case 'rename':
        handleRenameNote(note)
        break
      case 'move':
        handleMoveNote(note)
        break
      case 'copy':
        handleCopyNote(note)
        break
      case 'share':
        handleShareNote(note)
        break
      case 'export':
        handleExportNote()
        break
      case 'archive':
        handleArchiveNote(note)
        break
      case 'delete':
        handleDeleteNote(note)
        break
      default:
        console.warn('未知命令:', cmd)
        break
    }
  }

  function handleNoteClick(note: any) {
    if (currentFolderId.value) {
      router.push(`/file/${currentFolderId.value}/note/${note.id}`)
    } else {
      router.push(`/note/${note.id}`)
    }
  }

  // ============================================================
  // 弹窗确认
  // ============================================================
  async function confirmRename() {
    if (!renameValue.value.trim()) {
      ElMessage.warning('请输入名称')
      return
    }
    try {
      if (renameTargetType.value === 'folder') {
        await folderApi.update(renameTargetId.value, { name: renameValue.value })
        await folderStore.loadTree()
      } else {
        await noteApi.update(renameTargetId.value, { title: renameValue.value })
      }
      ElMessage.success('重命名成功')
      refreshData()
      showRenameDialog.value = false
    } catch {}
  }

  async function confirmMove() {
    try {
      const targetId = moveTargetId.value
      const sourceId = moveSourceId.value
      
      if (!sourceId) {
        ElMessage.warning('请选择要移动的项目')
        return
      }
      
      if (moveSourceType.value === 'folder' && targetId === sourceId) {
        ElMessage.warning('不能将文件夹移动到自己')
        return
      }

      if (moveSourceType.value === 'folder') {
        await folderApi.update(sourceId, { parentId: targetId })
        await folderStore.loadTree()
        ElMessage.success('文件夹移动成功')
      } else {
        await noteApi.update(sourceId, { folderId: targetId })
        ElMessage.success('笔记移动成功')
      }
      
      refreshData()
      showMoveDialog.value = false
      
      if (moveSourceType.value === 'folder' && targetId) {
        router.push(`/file/${targetId}`)
      }
    } catch (error: any) {
      ElMessage.error(error?.message || '移动失败，请重试')
    }
  }

  function onShareSuccess() {
    ElMessage.success('分享成功')
  }

  return {
    // State
    showFilterDialog,
    showRenameDialog,
    showMoveDialog,
    showShareDialog,
    renameValue,
    renameTargetId,
    renameTargetType,
    moveTargetId,
    moveSourceId,
    moveSourceType,
    shareTargetId,
    shareTargetType,
    folderTree,
    
    // Methods
    handleFolderAction,
    handleNoteAction,
    confirmRename,
    confirmMove,
    onShareSuccess,
    handleNoteClick,
  }
}