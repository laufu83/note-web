<!-- src/layout/FolderView.vue -->
<template>
  <div class="folder-view">
    <!-- 中间列 -->
    <div class="middle-column" :class="{ expanded: appStore.sidebarCollapsed }">
      <!-- 搜索栏 -->
      <FolderSearchBar
        v-model:search-keyword="searchKeyword"
        v-model:view-mode="viewMode"
        v-model:sort-by="sortBy"
        @search="handleSearch"
        @sort-change="handleSortChange"
        @view-mode-change="handleViewModeChange"
      />

      <!-- 头部 -->
      <FolderHeader
        :title="currentTitle"
        :count="total"
        :show-back="showBackButton"
        @back="goBack"
      />

      <!-- 列表 -->
      <FolderList
        :loading="loading"
        :refreshing="refreshing"
        :notes="displayNotes"
        :folders="folders"
        :selected-note-id="selectedNoteId"
        :view-mode="viewMode"
        :show-folders="showFolders"
        :empty-text="emptyText"
        :empty-button-text="emptyButtonText"
        :is-trash="isTrashView"
        @select-note="handleNoteClick"
        @select-folder="goToFolder"
        @folder-action="handleFolderAction"
        @note-action="handleNoteAction"
        @create-note="createNewNote"
      />
    </div>

    <!-- 右侧详情 -->
    <div class="right-column" :class="{ expanded: appStore.sidebarCollapsed }">
      <router-view
        :key="$route.fullPath"
        v-slot="{ Component, route: currentRoute }"
      >
        <component
          :is="Component"
          :note-id="getNoteId(currentRoute)"
          :folder-id="getFolderId(currentRoute)"
          :is-new="getIsNew(currentRoute)"
          @note-created="handleNoteCreated"
          @note-updated="handleNoteUpdated"
          @note-deleted="handleNoteDeleted"
          @clear-new-note="handleClearNewNote"
          @cancel="handleNoteCancel"
          @save="handleNoteUpdated"
        />
      </router-view>
    </div>

    <!-- 弹窗 -->
    <FolderDialogs
      v-model:show-filter="showFilterDialog"
      v-model:show-rename="showRenameDialog"
      v-model:show-move="showMoveDialog"
      v-model:show-share="showShareDialog"
      v-model:rename-value="renameValue"
      v-model:move-target-id="moveTargetId"
      :filters="filters"
      :tag-list="tagList"
      :folder-tree="folderTree"
      :move-source-type="moveSourceType"
      :rename-target-type="renameTargetType"
      :share-target-id="shareTargetId"
      :share-target-type="shareTargetType"
      @apply-filters="applyFilters"
      @reset-filters="resetFilters"
      @confirm-rename="confirmRename"
      @confirm-move="confirmMove"
      @share-success="onShareSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useFolderStore } from '@/store/modules/folder'
import { useTagStore } from '@/store/modules/tag'
import { useFolderData } from '@/composables/useFolderData'
import { useFolderNavigation } from '@/composables/useFolderNavigation'
import { useFolderActions } from '@/composables/useFolderActions'
import FolderSearchBar from '@/components/FolderSearchBar.vue'
import FolderHeader from '@/components/FolderHeader.vue'
import FolderList from '@/components/FolderList.vue'
import FolderDialogs from '@/components/FolderDialogs.vue'

// ============================================================
// Store & Router
// ============================================================
const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const folderStore = useFolderStore()
const tagStore = useTagStore()

// ============================================================
// Props & Emits
// ============================================================
const props = defineProps<{
  folderId?: string
}>()

const emit = defineEmits<{
  (e: 'note-created'): void
  (e: 'note-updated'): void
  (e: 'note-deleted'): void
  (e: 'clear-new-note'): void
}>()

// ============================================================
// 工具函数（从路由提取参数）
// ============================================================
const getFolderId = (route: any): string | null => {
  return props.folderId || route.params.folderId || route.query.folderId || null
}

const getNoteId = (route: any): string | null => {
  return route.params.noteId || route.params.id || null
}

const getIsNew = (route: any): boolean => {
  const noteId = getNoteId(route)
  return !noteId || noteId === '' || noteId === 'new'
}

// ============================================================
// Composables
// ============================================================

// 数据管理
const {
  loading,
  refreshing,
  notes,
  folders,
  total,
  searchKeyword,
  currentPage,
  pageSize,
  tagList,
  filters,
  viewMode,
  sortBy,
  selectedIds,
  selectedNoteId,
  displayNotes,
  showFolders,
  currentTitle,
  emptyText,
  emptyButtonText,
  isSpecialView,
  isNotePage,
  isFolderMainPage,
  currentFolderId,
  isRecentView,
  isTrashView,
  isStarredView,
  currentView,
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
  isRedirecting
} = useFolderData({ folderId: props.folderId })

// 导航管理
const {
  showBackButton,
  goToFolder,
  goBack,
  createNewNote,
  handleFolderStatus,
  handleClearNewNote,
  handleNoteCancel
} = useFolderNavigation({
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
  folderStore
})

// 操作管理
const {
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
  handleFolderAction,
  handleNoteAction,
  confirmRename,
  confirmMove,
  onShareSuccess,
  handleNoteClick
} = useFolderActions({
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
  selectFirstItem
})

// ============================================================
// ✅ 防抖刷新
// ============================================================
let refreshTimer: number | null = null

function refreshDataWithDebounce(delay: number = 300) {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(() => {
    refreshData()
    refreshTimer = null
  }, delay)
}

// ============================================================
// 事件处理
// ============================================================
function handleNoteCreated() {
  refreshDataWithDebounce()
  emit('note-created')
}

function handleNoteUpdated() {
  refreshDataWithDebounce()
  emit('note-updated')
}

function handleNoteDeleted() {
  refreshDataWithDebounce()
  emit('note-deleted')
  if (currentFolderId.value && !isSpecialView.value) {
    router.push(`/file/${currentFolderId.value}`)
  } else {
    router.push('/')
  }
}

// ============================================================
// ✅ 同步选中状态
// ============================================================
function syncSelectedNote() {
  const urlNoteId = route.params.noteId as string | null
  if (urlNoteId) {
    const exists = notes.value.some(n => n.id === urlNoteId)
    if (exists) {
      if (selectedNoteId.value !== urlNoteId) {
        selectedNoteId.value = urlNoteId
      }
      return true
    }
  }
  return false
}

// ============================================================
// ✅ 监听：目录变化时处理缓存
// ============================================================
watch(
  () => currentFolderId.value,
  (newFolderId, oldFolderId) => {
    const newId = newFolderId ?? null
    const oldId = oldFolderId ?? null
    if (newId !== oldId) {
      onFolderChange(newId, oldId)
    }
  },
  { immediate: true }
)

// ============================================================
// ✅ 监听：笔记ID变化时，只更新选中状态（不刷新数据）
// ============================================================
watch(
  () => route.params.noteId,
  (newNoteId, oldNoteId) => {
    if (newNoteId === oldNoteId) return
    
    if (newNoteId) {
      const exists = notes.value.some(n => n.id === newNoteId)
      if (exists) {
        selectedNoteId.value = newNoteId as string
      }
      // ✅ 如果笔记不在列表中，不改变选中状态
      // 等待 notes 变化时再同步
    } else {
      selectFirstItem()
    }
  },
  { immediate: false }
)

// ============================================================
// ✅ 监听：notes 变化时，同步选中状态（确保高亮）
// ============================================================
watch(
  () => notes.value,
  (newNotes) => {
    const urlNoteId = route.params.noteId as string | null
    if (urlNoteId) {
      const exists = newNotes.some(n => n.id === urlNoteId)
      if (exists) {
        if (selectedNoteId.value !== urlNoteId) {
          selectedNoteId.value = urlNoteId
        }
      } else if (newNotes.length > 0) {
        // 当前选中的笔记不在列表中，选中第一个
        if (!selectedNoteId.value || !newNotes.some(n => n.id === selectedNoteId.value)) {
          selectedNoteId.value = newNotes[0].id
        }
      } else {
        selectedNoteId.value = null
      }
    } else if (newNotes.length > 0 && !selectedNoteId.value) {
      selectedNoteId.value = newNotes[0].id
    }
  },
  { deep: false, immediate: true }
)

// ============================================================
// ✅ 监听：路由路径变化（从详情页返回）
// ============================================================
watch(
  () => route.path,
  (newPath, oldPath) => {
    const folderId = currentFolderId.value
    if (!folderId || isSpecialView.value) return

    const wasNotePage = oldPath?.includes('/note')
    const isNowFolderMain = newPath === `/file/${folderId}`

    if (wasNotePage && isNowFolderMain) {
      setRedirecting(false)
      setTimeout(() => {
        refreshData()
      }, 300)
    }
  }
)

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  const savedMode = localStorage.getItem('note_view_mode') as 'list' | 'preview' | null
  if (savedMode) viewMode.value = savedMode
  if (folderStore.tree.length === 0 && !folderStore.loading) {
    await folderStore.loadTree()
  }
})

// ============================================================
// 暴露方法
// ============================================================
defineExpose({
  refresh: refreshData,
  loadData,
  syncSelectedNote,
  getSelectedNoteId: () => selectedNoteId.value
})
</script>

<style scoped>
.folder-view {
  display: flex;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
  flex: 1;
}

.middle-column {
  width: 340px;
  min-width: 340px;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.25s ease;
}

.middle-column.expanded {
  width: 380px;
  min-width: 380px;
}

.right-column {
  flex: 1;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.right-column::-webkit-scrollbar {
  width: 4px;
}

.right-column::-webkit-scrollbar-track {
  background: transparent;
}

.right-column::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}
</style>