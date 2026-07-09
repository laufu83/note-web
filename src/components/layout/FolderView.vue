<!-- src/views/layout/FolderView.vue -->

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
        @create-note="handleCreateNoteFromProps"
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
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useFolderStore } from '@/store/modules/folder'
import { useTagStore } from '@/store/modules/tag'
import { useFolderData } from '@/composables/useFolderData'
import { useFolderNavigation } from '@/composables/useFolderNavigation'
import { useFolderActions } from '@/composables/useFolderActions'
import FolderSearchBar from '@/components/folder/FolderSearchBar.vue'
import FolderHeader from '@/components/folder/FolderHeader.vue'
import FolderList from '@/components/folder/FolderList.vue'
import FolderDialogs from '@/components/folder/FolderDialogs.vue'

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
  createNote?: (folderId: string | null) => void
}>()

const emit = defineEmits<{
  (e: 'note-created'): void
  (e: 'note-updated'): void
  (e: 'note-deleted'): void
  (e: 'clear-new-note'): void
}>()

// ============================================================
// 工具函数
// ============================================================
const getFolderId = (route: any): string | null => {
  return props.folderId || route.params.folderId || route.query.folderId || null
}

const getNoteId = (route: any): string | null => {
  return route.params.noteId || route.params.id || null
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
  loadData,
  refreshData,
  onFolderChange,
  handleSearch,
  handleSortChange,
  handleViewModeChange,
  applyFilters,
  resetFilters,
  selectFirstItem,
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
  handleFolderStatus,
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
// ✅ 统一的刷新方法（刷新树 + 列表）
// ============================================================
async function refreshAll() {
  console.log('[FolderView] 刷新所有数据')
  await folderStore.loadTree()  // 刷新左侧文件夹树
  await refreshData()           // 刷新中间列表
  selectFirstItem()             // 重新选中
}

// ============================================================
// ✅ 防抖刷新（用于快速连续操作）
// ============================================================
let refreshTimer: number | null = null

function refreshAllDebounced(delay: number = 300) {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
  refreshTimer = window.setTimeout(async () => {
    await refreshAll()
    refreshTimer = null
  }, delay)
}

// ============================================================
// ✅ 本地包装：调用父组件的创建笔记方法
// ============================================================
function handleCreateNoteFromProps() {
  if (props.createNote) {
    props.createNote(currentFolderId.value)
  } else {
    router.push('/note')
  }
}

// ============================================================
// ✅ 事件处理
// ============================================================
async function handleNoteCreated() {
  console.log('[FolderView] 笔记已创建，刷新所有数据')
  await refreshAll()
  emit('note-created')
}

async function handleNoteUpdated() {
  console.log('[FolderView] 笔记已更新，刷新所有数据')
  await refreshAll()
  emit('note-updated')
}

async function handleNoteDeleted() {
  console.log('[FolderView] 笔记已删除，刷新所有数据')
  await refreshAll()
  emit('note-deleted')
  
  // 删除后跳转
  if (currentFolderId.value && !isSpecialView.value) {
    router.push(`/file/${currentFolderId.value}`)
  } else {
    router.push('/')
  }
}

async function handleClearNewNote() {
  console.log('[FolderView] 清除新建状态')
  await refreshAll()
  
  if (currentFolderId.value && !isSpecialView.value) {
    router.push(`/file/${currentFolderId.value}`)
  } else {
    router.push('/')
  }
  emit('clear-new-note')
}

// ============================================================
// ✅ 同步选中状态
// ============================================================
function syncSelectedNote() {
  const urlNoteId = route.params.noteId as string | null
  if (urlNoteId) {
    const exists = notes.value.some(n => n.id === urlNoteId)
    if (exists && selectedNoteId.value !== urlNoteId) {
      selectedNoteId.value = urlNoteId
      return true
    }
  }
  return false
}

// ============================================================
// ✅ 监听：目录变化
// ============================================================
watch(
  () => currentFolderId.value,
  (newFolderId, oldFolderId) => {
    if (newFolderId !== oldFolderId) {
      onFolderChange(newFolderId ?? null, oldFolderId ?? null)
    }
  },
  { immediate: true }
)

// ============================================================
// ✅ 监听：笔记ID变化 → 更新选中状态
// ============================================================
watch(
  () => route.params.noteId,
  (newNoteId) => {
    if (newNoteId) {
      const exists = notes.value.some(n => n.id === newNoteId)
      if (exists) {
        selectedNoteId.value = newNoteId as string
      }
    } else {
      selectFirstItem()
    }
  },
  { immediate: false }
)

// ============================================================
// ✅ 监听：notes 变化 → 同步选中状态
// ============================================================
watch(
  () => notes.value,
  () => {
    syncSelectedNote()
  },
  { deep: false, immediate: true }
)

// ============================================================
// ✅ 监听：从详情页返回文件夹
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
      refreshAllDebounced()
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
  refresh: refreshAll,
  refreshData,
  loadData,
  syncSelectedNote,
  getSelectedNoteId: () => selectedNoteId.value,
  refreshWithCacheClear: refreshAll
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