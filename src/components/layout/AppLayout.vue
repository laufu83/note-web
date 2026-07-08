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
      <router-view #default="{ Component }">
        <component
          :is="Component"
          ref="folderViewRef"
          :key="$route.fullPath"
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { useFolderStore } from '@/store/modules/folder'
import { useNoteStore } from '@/store/modules/note'
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
// 创建相关
// ============================================================

function handleCreateFolder(parentId: string | null) {
  createFolderParentId.value = parentId
  showCreateFolder.value = true
}

function handleCreateNote(folderId: string | null) {
  if (folderId) {
    router.push(`/file/${folderId}/note/new`)
  } else {
    router.push('/note/new')
  }
}

async function onFolderCreated() {
  await folderStore.loadTree()
  ElMessage.success('文件夹创建成功')
  refreshCurrentView()
}

// ============================================================
// 删除文件夹
// ============================================================

async function handleFolderDelete(folderId: string) {
  try {
    // 检查是否在回收站中
    const isInTrash = route.path.includes('/file/trash')
    
    if (isInTrash) {
      // 如果在回收站，永久删除
      await ElMessageBox.confirm(
        '确定要永久删除此文件夹吗？此操作不可恢复！',
        '永久删除提示',
        { 
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        }
      )
      await folderStore.deleteFolder(folderId)
      ElMessage.success('文件夹已永久删除')
    } else {
      // 普通删除，移入回收站
      await folderStore.deleteFolder(folderId)
      ElMessage.success('文件夹已移入回收站')
    }
    
    await folderStore.loadTree()
    refreshCurrentView()
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
  await folderStore.loadTree()
  ElMessage.success('重命名成功')
  refreshCurrentView()
}

// ============================================================
// 移动文件夹
// ============================================================

function handleFolderMove(folder: any) {
  moveTarget.value = folder
  showMoveDialog.value = true
}

async function onMoveSuccess() {
  await folderStore.loadTree()
  ElMessage.success('移动成功')
  refreshCurrentView()
}

// ============================================================
// 复制文件夹
// ============================================================

// async function handleFolderCopy(folder: any) {
//   try {
//     // 复制文件夹
//     await folderStore.copyFolder?.(folder.id) || (async () => {
//       // 如果 store 没有 copyFolder 方法，使用创建方式
//       const newFolder = await folderStore.createFolder({
//         name: `${folder.name} - 副本`,
//         parentId: folder.parentId
//       })
//       // 如果有笔记，可以复制笔记（这里简化处理）
//       return newFolder
//     })()
    
//     await folderStore.loadTree()
//     ElMessage.success(`已复制文件夹「${folder.name}」`)
//     refreshCurrentView()
//   } catch (error: any) {
//     ElMessage.error(error.message || '复制失败')
//   }
// }

// ============================================================
// 刷新当前视图
// ============================================================

function refreshCurrentView() {
  // 方法1: 通过组件引用刷新
  if (folderViewRef.value && typeof folderViewRef.value.refresh === 'function') {
    folderViewRef.value.refresh()
  }
  
  // 方法2: 通过侧边栏引用刷新
  if (sidebarRef.value && typeof sidebarRef.value.refresh === 'function') {
    sidebarRef.value.refresh()
  }
  
  // 方法3: 如果当前是文件夹视图，重新加载数据
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
  refreshCurrentView()
}

// ============================================================
// 暴露刷新方法给其他组件
// ============================================================

defineExpose({
  refresh: refreshCurrentView
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