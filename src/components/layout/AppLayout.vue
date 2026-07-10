<!-- src/components/layout/AppLayout.vue -->

<template>
  <div class="app-layout">
    <div class="left-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <AppSidebar
        ref="sidebarRef"
        @create-folder="handleCreateFolder"
        @create-note="handleCreateNote"
        @folder-delete="handleFolderDelete"
        @folder-rename="handleFolderRename"
        @folder-move="handleFolderMove"     
        @refresh="handleSidebarRefresh"
      />
    </div>

    <div class="content-area">
      <!-- ✅ 修复：将 create-note 传递给组件 -->
      <router-view #default="{ Component }">
        <component
          :is="Component as Component"
          ref="folderViewRef"
          :key="$route.fullPath"
          :create-note="handleCreateNote"
        />
      </router-view>
    </div>

    <!-- 创建文件夹对话框 -->
    <CreateFolderDialog
      v-model="showCreateFolder"
      :parent-id="createFolderParentId"
      @success="onFolderCreated"
    />

    <!-- 重命名文件夹对话框 -->
    <RenameFolderDialog
      v-model="showRenameDialog"
      :folder="renameTarget"
      @success="onRenameSuccess"
    />

    <!-- 移动文件夹对话框 -->
    <MoveFolderDialog
      v-model="showMoveDialog"
      :folder="moveTarget"
      @success="onMoveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from 'vue'
import type{Component} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useFolderStore } from '@/store/modules/folder'
import { useNoteStore } from '@/store/modules/note'
import { noteApi } from '@/api/note'
import AppSidebar from './AppSidebar.vue'
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'
import RenameFolderDialog from '@/components/business/RenameFolderDialog.vue'
import MoveFolderDialog from '@/components/business/MoveFolderDialog.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const folderStore = useFolderStore()
const noteStore = useNoteStore()

// 组件引用
const sidebarRef = ref<any>(null)
const folderViewRef = ref<any>(null)

// 对话框状态
const showCreateFolder = ref(false)
const createFolderParentId = ref<string | null>(null)

const showRenameDialog = ref(false)
const renameTarget = ref<any>(null)

const showMoveDialog = ref(false)
const moveTarget = ref<any>(null)

// ============================================================
// 特殊目录
// ============================================================
const SPECIAL_FOLDERS = ['recent', 'starred', 'trash'] as const

function isSpecialFolder(id: string | null): boolean {
  return id !== null && SPECIAL_FOLDERS.includes(id as any)
}

// ============================================================
// 创建相关
// ============================================================

function handleCreateFolder(parentId: string | null) {
  createFolderParentId.value = parentId
  showCreateFolder.value = true
}

// ============================================================
// ✅ 创建笔记
// ============================================================
async function handleCreateNote(folderId: string | null, type: string = 'blank') {
  console.log('folderId:', folderId, 'type:', type)
  // 如果是特殊目录，folderId 设为 null
  const validFolderId = isSpecialFolder(folderId) ? null : folderId

  try {
    // 根据类型自动填充标题后缀
    const titleMap: Record<string, string> = {
      blank: '.txt',
      md: '.md',
      mind: '（脑图）',
      flow: '（流程图）',
      table: '（表格）',
      whiteboard: '（白板）',
    }
    
    const suffix = titleMap[type] || '.md'
    const title = `无标题${suffix}`

    const noteData: any = {
      title,
      content: '',
      folderId: validFolderId,
      type,
    }

    const newNote = await noteApi.create(noteData)
    console.log('创建笔记成功:', newNote)

    await clearAllCache()

    if (newNote && newNote.id) {
      // ✅ 使用 validFolderId 跳转
      if (validFolderId) {
        router.push(`/file/${validFolderId}/note/${newNote.id}?edit`)
      } else {
        router.push(`/note/${newNote.id}?edit`)
      }
    } else {
      // 降级方案
      if (validFolderId) {
        router.push(`/file/${validFolderId}/note`)
      } else {
        router.push(`/note`)
      }
    }
  } catch (error) {
    console.error('创建笔记失败:', error)
    ElMessage.error('创建笔记失败，请重试')
    if (validFolderId) {
      router.push(`/file/${validFolderId}/note`)
    } else {
      router.push(`/note`)
    }
  }
}

// ============================================================
// ✅ 清理所有缓存（带防抖）
// ============================================================
let clearCacheTimer: number | null = null

async function clearAllCache() {
  // 防抖：避免短时间内多次调用
  if (clearCacheTimer) {
    clearTimeout(clearCacheTimer)
  }
  
  return new Promise((resolve) => {
    clearCacheTimer = window.setTimeout(async () => {
      try {
        // 1. 刷新文件夹树（左侧边栏）
        await folderStore.loadTree()

        // 2. 刷新侧边栏
        if (sidebarRef.value && typeof sidebarRef.value.refresh === 'function') {
          sidebarRef.value.refresh()
        }

        // 3. 刷新 FolderView（中间列）
        if (folderViewRef.value) {
          if (typeof folderViewRef.value.refresh === 'function') {
            await folderViewRef.value.refresh()
          }
          if (typeof folderViewRef.value.refreshWithCacheClear === 'function') {
            await folderViewRef.value.refreshWithCacheClear()
          }
        }
        resolve(true)
      } catch (error) {
        console.error('清理缓存失败:', error)
        resolve(false)
      } finally {
        clearCacheTimer = null
      }
    }, 100)
  })
}

// ============================================================
// 文件夹创建成功
// ============================================================
async function onFolderCreated() {
  await clearAllCache()
  ElMessage.success('文件夹创建成功')
}

// ============================================================
// 删除文件夹
// ============================================================
async function handleFolderDelete(folderId: string) {
  try {
    const isInTrash = route.path.includes('/file/trash')

    if (isInTrash) {
      await ElMessageBox.confirm(
        '确定要永久删除此文件夹吗？此操作不可恢复！',
        '永久删除提示',
        {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
        }
      )
      await folderStore.deleteFolder(folderId)
      ElMessage.success('文件夹已永久删除')
    } else {
      await folderStore.deleteFolder(folderId)
      ElMessage.success('文件夹已移入回收站')
    }

    await clearAllCache()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// ============================================================
// 重命名文件夹
// ============================================================
function handleFolderRename(folder: any) {
  renameTarget.value = folder
  showRenameDialog.value = true
}

async function onRenameSuccess() {
  await clearAllCache()
  ElMessage.success('重命名成功')
}

// ============================================================
// 移动文件夹
// ============================================================
function handleFolderMove(folder: any) {
  moveTarget.value = folder
  showMoveDialog.value = true
}

async function onMoveSuccess() {
  await clearAllCache()
  ElMessage.success('移动成功')
}

// ============================================================
// 刷新当前视图
// ============================================================
function refreshCurrentView() {
  // 通过组件引用刷新
  if (folderViewRef.value && typeof folderViewRef.value.refresh === 'function') {
    folderViewRef.value.refresh()
  }

  // 通过侧边栏引用刷新
  if (sidebarRef.value && typeof sidebarRef.value.refresh === 'function') {
    sidebarRef.value.refresh()
  }

  // 如果当前是文件夹视图，重新加载数据
  const folderId = route.params.folderId as string
  if (folderId && folderViewRef.value) {
    if (typeof folderViewRef.value.loadData === 'function') {
      folderViewRef.value.loadData(folderId)
    }
  }
}

// ============================================================
// 侧边栏刷新
// ============================================================
function handleSidebarRefresh() {
  console.log('[AppLayout] 收到刷新事件')
  clearAllCache()
}

// ============================================================
// 暴露刷新方法给其他组件
// ============================================================
defineExpose({
  refresh: refreshCurrentView,
  clearAllCache,
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.left-sidebar {
  width: 240px;
  min-width: 240px;
  height: 100%;
  background: #f7f6f3;
  border-right: 1px solid #e8e8e8;
  transition: width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.left-sidebar.collapsed {
  width: 48px;
  min-width: 48px;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  min-width: 0;
}
</style>