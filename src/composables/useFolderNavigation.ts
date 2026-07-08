// src/composables/useFolderNavigation.ts
import { computed } from 'vue'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'

interface NavigationOptions {
  currentFolderId: any
  isSpecialView: any
  isNotePage: any
  isFolderMainPage: any
  isRecentView: any
  isTrashView: any
  isStarredView: any
  route: RouteLocationNormalizedLoaded
  router: Router
  findFolderParentId: (items: any[], id: string | null) => string | null
  setRedirecting: (val: boolean) => void
  isRedirecting: any
  folderStore: any  // ✅ 添加 folderStore
}

export function useFolderNavigation(options: NavigationOptions) {
  const {
    currentFolderId,
    isSpecialView,
    isNotePage,
    isFolderMainPage,
    isRecentView,
    isTrashView,
    isStarredView,
    route,
    router,
    findFolderParentId,
    setRedirecting,
    isRedirecting,
    folderStore,  // ✅ 接收 folderStore
  } = options

  // ✅ 修复：显示返回按钮
  const showBackButton = computed(() => {
    // 特殊视图（最新、星标、回收站）不显示返回按钮
    if (isRecentView.value) return false
    if (isTrashView.value) return false
    if (isStarredView.value) return false
    
    // 普通文件夹：如果有父级则显示返回按钮
    if (currentFolderId.value) {
      // 使用 findFolderParentId 查找父级
      const parentId = findFolderParentId(folderStore.tree, currentFolderId.value)
      return !!parentId
    }
    
    return false
  })

  function goToFolder(id: string) {
    router.push(`/file/${id}`)
  }

  function goBack() {
    // 特殊视图（最新、星标、回收站）跳转到首页
    if (isRecentView.value || isTrashView.value || isStarredView.value) {
      router.push('/')
      return
    }
    
    if (!currentFolderId.value) {
      router.push('/')
      return
    }
    
    // 查找父级文件夹
    const parentId = findFolderParentId(folderStore.tree, currentFolderId.value)
    if (parentId) {
      router.push(`/file/${parentId}`)
    } else {
      router.push('/')
    }
  }

  function createNewNote() {
    if (isRecentView.value || isTrashView.value || isStarredView.value) {
      router.push('/note')
      return
    }
    const folderId = currentFolderId.value
    if (folderId) {
      router.push(`/file/${folderId}/note`)
    } else {
      router.push('/note')
    }
  }

  let statusTimer: number | null = null

  function handleFolderStatus(hasContent: boolean) {
    const folderId = currentFolderId.value

    if (!folderId || isSpecialView.value) {
      return
    }

    if (isNotePage.value) {
      return
    }

    if (isRedirecting.value) {
      return
    }

    if (statusTimer) {
      clearTimeout(statusTimer)
      statusTimer = null
    }

    statusTimer = window.setTimeout(() => {
      const currentPath = route.path
      const emptyPath = `/file/${folderId}/empty`
      const folderPath = `/file/${folderId}`

      if (!hasContent && isFolderMainPage.value && currentPath !== emptyPath) {
        setRedirecting(true)
        router.replace(emptyPath)
        setTimeout(() => {
          setRedirecting(false)
        }, 500)
      } else if (hasContent && currentPath === emptyPath) {
        setRedirecting(true)
        router.replace(folderPath)
        setTimeout(() => {
          setRedirecting(false)
        }, 500)
      }
    }, 300)
  }

  function handleClearNewNote() {
    if (currentFolderId.value && !isSpecialView.value) {
      router.push(`/file/${currentFolderId.value}`)
    } else {
      router.push('/')
    }
  }

  function handleNoteCancel() {
    if (currentFolderId.value && !isSpecialView.value) {
      router.push(`/file/${currentFolderId.value}`)
    } else {
      router.push('/')
    }
  }

  return {
    showBackButton,
    goToFolder,
    goBack,
    createNewNote,
    handleFolderStatus,
    handleClearNewNote,
    handleNoteCancel,
  }
}