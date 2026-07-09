// src/composables/useFolderData.ts
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFolderStore } from '@/store/modules/folder'
import { useTagStore } from '@/store/modules/tag'
import { noteApi, folderApi } from '@/api'
import { useFolderCache } from './useFolderCache'

export function useFolderData(options: { folderId?: string }) {
  const route = useRoute()
  const folderStore = useFolderStore()
  const tagStore = useTagStore()
  const cache = useFolderCache()

  // ============================================================
  // 状态
  // ============================================================
  const loading = ref(false)
  const refreshing = ref(false)
  const notes = ref<any[]>([])
  const folders = ref<any[]>([])
  const searchKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(50)
  const total = ref(0)
  const tagList = ref<any[]>([])
  const isRedirecting = ref(false)

  const viewMode = ref<'list' | 'preview'>('list')
  const sortBy = ref('updatedAt_desc')
  const selectedIds = ref<string[]>([])
  const selectedNoteId = ref<string | null>(null)

  const filters = ref({
    type: '',
    tagId: '',
    has: [] as string[],
    dateRange: null as [Date, Date] | null,
  })

  // ============================================================
  // 计算属性
  // ============================================================
  const currentFolderId = computed(() => {
    return options.folderId || (route.params.folderId as string) || null
  })

  const isRecentView = computed(() => currentFolderId.value === 'recent')
  const isStarredView = computed(() => currentFolderId.value === 'starred')
  const isTrashView = computed(() => currentFolderId.value === 'trash')
  const isRootView = computed(() => currentFolderId.value === 'root')
  const isSpecialView = computed(() => {
    const id = currentFolderId.value
    return id === 'recent' || id === 'starred' || id === 'trash'||id==='root'
  })
  const isNotePage = computed(() => route.path.includes('/note'))
  const isFolderMainPage = computed(() => {
    const id = currentFolderId.value
    if (!id || isSpecialView.value) return false
    return route.path === `/file/${id}`
  })

  const currentView = computed(() => {
    if (isTrashView.value) return 'trash'
    if (isStarredView.value) return 'starred'
    if (isRecentView.value) return 'recent'
    if (isRootView.value) return 'root'
    if (currentFolderId.value) return 'folder'
    if (route.path.includes('/note/')) return 'note'
    return 'all'
  })

  const showFolders = computed(() => {
    if (isRecentView.value) return false
    if (isTrashView.value) return true
    if (isStarredView.value) return false
    if (isRootView.value) return true
    return currentView.value === 'folder' && currentFolderId.value !== null
  })

  const currentTitle = computed(() => {
    if (isStarredView.value) return '⭐ 星标笔记'
    if (isTrashView.value) return '🗑️ 回收站'
    if (isRecentView.value) return '🕐 最近文件'
    if (isRootView.value) return '我的文件夹'
    if (currentView.value === 'folder' && currentFolderId.value) {
      const name = findFolderName(folderStore.tree, currentFolderId.value)
      return name || '文件夹'
    }
    return '全部笔记'
  })

  const emptyText = computed(() => {
    if (isTrashView.value) return '回收站为空'
    if (isStarredView.value) return '暂无星标笔记'
    if (isRecentView.value) return '暂无最近文件'
    return '暂无笔记'
  })

  const emptyButtonText = computed(() => {
    if (isTrashView.value) return '返回笔记'
    if (isStarredView.value) return '去写笔记'
    if (isRecentView.value) return '创建第一篇笔记'
    return '创建第一篇笔记'
  })

  // 使用稳定排序
  const displayNotes = computed(() => {
    const list = [...notes.value]
    const [field, order] = sortBy.value.split('_')
    list.sort((a, b) => {
      let valA = a[field] || ''
      let valB = b[field] || ''
      if (field === 'title') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }
      if (valA > valB) return order === 'desc' ? -1 : 1
      if (valA < valB) return order === 'desc' ? 1 : -1
      return a.id > b.id ? 1 : -1
    })
    return list
  })

  // ============================================================
  // 工具函数
  // ============================================================
  function findFolderInTree(items: any[], id: string): any | null {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const res = findFolderInTree(item.children, id)
        if (res) return res
      }
    }
    return null
  }

  function findFolderName(items: any[], id: string | null): string | null {
    if (!id) return null
    const folder = findFolderInTree(items, id)
    return folder?.name || null
  }

  function findFolderParentId(items: any[], id: string | null): string | null {
    if (!id) return null
    const folder = findFolderInTree(items, id)
    return folder?.parentId || null
  }

  function setRedirecting(val: boolean) {
    isRedirecting.value = val
  }

  // ============================================================
  // ✅ 生成完整的缓存键
  // ============================================================
  function getCacheKey(): string {
    const folderId = currentFolderId.value || 'all'
    const filterStr = JSON.stringify({
      type: filters.value.type,
      tagId: filters.value.tagId,
      has: filters.value.has,
      dateRange: filters.value.dateRange
    })
    return `${folderId}_${searchKeyword.value}_${currentPage.value}_${sortBy.value}_${filterStr}`
  }

  // ============================================================
  // ✅ 数据加载 - 使用完整的缓存键
  // ============================================================
  async function loadData(forceRefresh: boolean = false) {
    const cacheKey = getCacheKey()
    
    // 检查缓存
    if (!forceRefresh) {
      const cached = cache.getCache(cacheKey)
      if (cached) {
        notes.value = cached.notes
        folders.value = cached.folders
        total.value = cached.total
        searchKeyword.value = cached.searchKeyword
        currentPage.value = cached.currentPage
        sortBy.value = cached.sortBy
        filters.value = cached.filters
        return
      }
    }

    loading.value = true
    try {
      const tagResult = await tagStore.loadTags()
      tagList.value = tagResult.items || []

      let notesData: any[] = []
      let foldersData: any[] = []
      let totalCount = 0

      if (isTrashView.value) {
        const params: any = { 
          page: currentPage.value, 
          pageSize: pageSize.value 
        }
        if (searchKeyword.value) {
          params.keyword = searchKeyword.value
        }
        const noteRes = await noteApi.getDeleted(params)
        notesData = noteRes.items
        totalCount = noteRes.pagination.total
        
        try {
          const folderRes = await folderApi.getDeleted()
          foldersData = folderRes || []
        } catch (error) {
          console.warn('加载已删除文件夹失败:', error)
          foldersData = []
        }
      }
      else if (isStarredView.value) {
        const params: any = { 
          page: currentPage.value, 
          pageSize: pageSize.value, 
          isStarred: 1 
        }
        if (searchKeyword.value) {
          params.keyword = searchKeyword.value
        }
        const res = await noteApi.list(params)
        notesData = res.items
        totalCount = res.pagination.total
        foldersData = []
      }
      else if (isRecentView.value) {
        const params: any = { 
          page: 1, 
          pageSize: 50, 
          orderBy: 'updated_at', 
          orderDirection: 'desc' 
        }
        if (searchKeyword.value) {
          params.keyword = searchKeyword.value
        }
        const res = await noteApi.list(params)
        notesData = res.items || []
        totalCount = notesData.length
        foldersData = []
      }
      else if (showFolders) {
        const validFolderId = currentFolderId.value!=='root' ? currentFolderId.value : null
        const folderRes = await folderApi.getChildren( validFolderId, { page: 1, pageSize: 100 })
        foldersData = folderRes.items || []

        const params: any = {
          page: currentPage.value,
          pageSize: pageSize.value,
          folderId: validFolderId
        }
        
        if (searchKeyword.value) {
          params.keyword = searchKeyword.value
          params.searchMode = 'prefix'
        }
        
        applyFiltersToParams(params)
        const noteRes = await noteApi.list(params)
        notesData = noteRes.items
        totalCount = noteRes.pagination.total
      }
      else {
        foldersData = []
        const params: any = { page: currentPage.value, pageSize: pageSize.value }
        if (searchKeyword.value) {
          params.keyword = searchKeyword.value
          params.searchMode = 'prefix'
        }
        applyFiltersToParams(params)
        const res = await noteApi.list(params)
        notesData = res.items
        totalCount = res.pagination.total
      }

      notes.value = notesData
      folders.value = foldersData
      total.value = totalCount

      // 保存缓存
      cache.setCache(cacheKey, {
        notes: notesData,
        folders: foldersData,
        total: totalCount,
        searchKeyword: searchKeyword.value,
        currentPage: currentPage.value,
        sortBy: sortBy.value,
        filters: { ...filters.value },
      })

    } catch (error: any) {
      console.error('加载数据失败:', error)
      ElMessage.error(error?.message || '加载数据失败')
    } finally {
      loading.value = false
    }
  }

  function applyFiltersToParams(params: any) {
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.tagId) params.tagId = filters.value.tagId
    if (filters.value.has.includes('image')) params.hasImage = 1
    if (filters.value.has.includes('attachment')) params.hasAttachment = 1
    if (filters.value.dateRange) {
      params.startDate = filters.value.dateRange[0].toISOString()
      params.endDate = filters.value.dateRange[1].toISOString()
    }
  }

  // ============================================================
  // ✅ 刷新数据 - 清除当前缓存
  // ============================================================
  async function refreshData() {
    if (refreshing.value) return
    refreshing.value = true
    try {
     // const cacheKey = getCacheKey()
      cache.clearCacheByFolderId(currentFolderId.value)
      await loadData(true)
    } finally {
      refreshing.value = false
    }
  }

  // ============================================================
  // ✅ 目录变化时清理缓存并重新加载
  // ============================================================
  function onFolderChange(newFolderId: string | null, oldFolderId: string | null) {
    if (newFolderId !== oldFolderId) {
      // 清理旧目录的缓存
      cache.clearCacheByFolderId(oldFolderId)
      // 重置分页
      currentPage.value = 1
      // 重新加载
      loadData()
    }
  }

  // ============================================================
  // 选中逻辑
  // ============================================================
  function selectFirstItem() {
    if (displayNotes.value.length > 0) {
      selectedNoteId.value = displayNotes.value[0].id
    } else if (folders.value.length > 0) {
      selectedNoteId.value = null
    } else {
      selectedNoteId.value = null
    }
  }

  function handleUrlNoteSelection() {
    const urlNoteId = route.params.noteId as string | null
    if (!urlNoteId) return
    const exists = notes.value.some(n => n.id === urlNoteId)
    if (exists) {
      selectedNoteId.value = urlNoteId
    } else {
      selectedNoteId.value = null
    }
  }

  // ============================================================
  // 操作
  // ============================================================
  function handleSearch() {
    currentPage.value = 1
    loadData()
  }

  function handleSortChange(val: string) {
    sortBy.value = val
    loadData()
  }

  function handleViewModeChange(val: 'list' | 'preview') {
    viewMode.value = val
    localStorage.setItem('note_view_mode', val)
  }

  function applyFilters() {
    currentPage.value = 1
    loadData()
  }

  function resetFilters() {
    filters.value = { type: '', tagId: '', has: [], dateRange: null }
    currentPage.value = 1
    loadData()
  }

  function toggleNoteSelection(id: string, checked: boolean) {
    if (checked) {
      if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
    } else {
      selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    }
  }

  return {
    loading,
    refreshing,
    notes,
    folders,
    searchKeyword,
    currentPage,
    pageSize,
    total,
    tagList,
    isRedirecting,
    viewMode,
    sortBy,
    selectedIds,
    selectedNoteId,
    filters,
    currentFolderId,
    isRecentView,
    isStarredView,
    isTrashView,
    isSpecialView,
    isNotePage,
    isFolderMainPage,
    currentView,
    showFolders,
    currentTitle,
    emptyText,
    emptyButtonText,
    displayNotes,
    loadData,
    refreshData,
    onFolderChange,
    handleSearch,
    handleSortChange,
    handleViewModeChange,
    applyFilters,
    resetFilters,
    toggleNoteSelection,
    selectFirstItem,
    handleUrlNoteSelection,
    findFolderName,
    findFolderParentId,
    setRedirecting,
  }
}