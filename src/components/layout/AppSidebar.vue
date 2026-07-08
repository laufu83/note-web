<!-- src/components/layout/AppSidebar.vue -->

<template>
  <div class="sidebar">
    <!-- 标题 -->
    <div class="sidebar-header">
      <span class="logo">📝 我的笔记</span>
    </div>

    <!-- 快捷操作 -->
    <div class="sidebar-actions">
      <el-dropdown trigger="click" placement="bottom-start" @command="handleCommand">
        <el-button size="small" text class="create-btn">
          <el-icon><Plus /></el-icon>
          新建
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="create-menu">
            <div class="menu-title">新建</div>
            <el-dropdown-item command="note">
              <span class="menu-icon">📄</span> 新建笔记
            </el-dropdown-item>
            <el-dropdown-item command="folder">
              <span class="menu-icon">📁</span> 新建文件夹
            </el-dropdown-item>
            <el-dropdown-item divided command="template">
              <span class="menu-icon">📋</span> 从模板新建
            </el-dropdown-item>
            <el-dropdown-item command="upload">
              <span class="menu-icon">📎</span> 上传文件
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 导航菜单 -->
    <div class="sidebar-nav">
      <!-- 最新 -->
      <div
        class="nav-item"
        :class="{ active: isActive('/file/recent') }"
        @click="goTo('/file/recent')"
      >
        <span class="nav-icon">🕐</span>
        <span class="nav-label">最新</span>
      </div>

      <!-- 星标 -->
      <div
        class="nav-item"
        :class="{ active: isActive('/file/starred') }"
        @click="goTo('/file/starred')"
      >
        <span class="nav-icon">⭐</span>
        <span class="nav-label">星标</span>
      </div>

      <!-- 回收站 -->
      <div
        class="nav-item"
        :class="{ active: isActive('/file/trash') }"
        @click="goTo('/file/trash')"
      >
        <span class="nav-icon">🗑️</span>
        <span class="nav-label">回收站</span>
      </div>

      <div class="nav-divider"></div>

      <!-- 我的文件夹 -->
      <div class="nav-section">
        <div class="section-header" @click="foldersExpanded = !foldersExpanded">
          <span class="section-icon">📁</span>
          <span class="section-label">我的文件夹</span>
          <span class="section-count">{{ folderList.length }}</span>
          <el-icon class="section-arrow" :class="{ expanded: foldersExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
        <div v-show="foldersExpanded" class="section-children">
          <FolderTreeItem
            v-for="folder in folderList"
            :key="folder.id"
            :folder="folder"
            :level="1"
            :current-folder-id="currentFolderId"
            :child-create-target-id="childCreateTargetId"
            :child-create-name="childCreateName"
            @update:child-create-name="childCreateName = $event"
            @select="goToFolder"
            @folder-menu="handleFolderMenuCommand"
            @child-submit="submitChildCreateFolder"
            @child-cancel="cancelChildCreateFolder"
          />

          <div v-if="folderList.length === 0" class="nav-empty">暂无文件夹</div>
        </div>
      </div>

      <div class="nav-divider"></div>

      <!-- 标签 -->
      <div class="nav-section">
        <div class="section-header" @click="tagsExpanded = !tagsExpanded">
          <span class="section-icon">🏷️</span>
          <span class="section-label">标签</span>
          <span class="section-count">{{ tagList.length }}</span>
          <el-icon class="section-arrow" :class="{ expanded: tagsExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
        <div v-show="tagsExpanded" class="section-children">
          <div
            v-for="tag in tagList"
            :key="tag.id"
            class="nav-item nav-tag"
            @click="goToTag(tag.id)"
          >
            <span class="nav-icon" :style="{ color: tag.color || '#6e6e73' }">#</span>
            <span class="nav-label">{{ tag.name }}</span>
            <span class="nav-badge">{{ tag.noteCount || 0 }}</span>
          </div>
          <div v-if="tagList.length === 0" class="nav-empty">暂无标签</div>
        </div>
      </div>

      <div class="nav-divider"></div>

      <div class="nav-item" @click="goTo('/settings')">
        <span class="nav-icon">⚙️</span>
        <span class="nav-label">设置</span>
      </div>
    </div>

    <!-- 底部用户 -->
    <div class="sidebar-footer">
      <div class="user-info">
        <el-avatar :size="24" :src="userStore.userInfo?.avatarUrl || undefined">
          {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
        </el-avatar>
        <span class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
      </div>
    </div>

    <!-- 创建文件夹弹窗 -->
    <CreateFolderDialog
      v-model="showCreateFolderDialog"
      :parent-id="createFolderParentId"
      @success="onFolderCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { useFolderStore } from '@/store/modules/folder'
import { useTagStore } from '@/store/modules/tag'
import { useUserStore } from '@/store/modules/user'
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'
import FolderTreeItem from './FolderTreeItem.vue'

// ============================================================
// 特殊目录列表
// ============================================================
const SPECIAL_FOLDERS = ['recent', 'starred', 'trash'] as const

const isSpecialFolder = (id: string | null): boolean => {
  return id !== null && SPECIAL_FOLDERS.includes(id as any)
}

// ============================================================
// Store & Router
// ============================================================
const router = useRouter()
const route = useRoute()
const folderStore = useFolderStore()
const tagStore = useTagStore()
const userStore = useUserStore()

// ============================================================
// 状态
// ============================================================
const foldersExpanded = ref(true)
const tagsExpanded = ref(true)

const showCreateFolderDialog = ref(false)
const createFolderParentId = ref<string | null>(null)

const currentFolderId = computed(() => {
  return route.params.folderId as string || null
})

// 子文件夹新建
const childCreateTargetId = ref<string | null>(null)
const childCreateName = ref('')

// ============================================================
// 计算属性
// ============================================================
const folderList = computed(() => folderStore.tree || [])
const tagList = computed(() => tagStore.tags || [])

// ============================================================
// Emit
// ============================================================
const emit = defineEmits<{
  (e: 'create-folder', parentId: string | null): void
  (e: 'create-note', folderId: string | null): void
  (e: 'folder-delete', folderId: string): void
  (e: 'folder-rename', folder: any): void
  (e: 'folder-move', folder: any): void
 //(e: 'folder-copy', folder: any): void
  (e: 'folder-more', folder: any): void
  (e: 'refresh'): void
}>()

// ============================================================
// 导航方法
// ============================================================

function isActive(path: string): boolean {
  if (path === '/file/recent') {
    return route.path === '/file/recent' || route.path === '/'
  }
  return route.path === path || route.path.startsWith(path + '/')
}

function goTo(path: string) {
  router.push(path)
}

function goToFolder(id: string) {
  router.push(`/file/${id}`)
}

function goToTag(id: string) {
  router.push(`/tag/${id}`)
}

// ============================================================
// 获取有效的父文件夹ID
// ============================================================

function getValidParentId(parentId: string | null): string | null {
  if (isSpecialFolder(parentId)) {
    return null
  }
  return parentId
}

// ============================================================
// 创建文件夹（统一使用弹窗）
// ============================================================

function openCreateFolderDialog(parentId: string | null = null) {
  const validParentId = getValidParentId(parentId)
  createFolderParentId.value = validParentId
  showCreateFolderDialog.value = true
}

async function onFolderCreated() {
  await folderStore.loadTree()
  ElMessage.success('文件夹创建成功')
  emit('refresh')
}

// ============================================================
// 顶部下拉菜单
// ============================================================

function handleCommand(command: string) {
  switch (command) {
    case 'note':
      emit('create-note', currentFolderId.value)
      break
    case 'folder':
      openCreateFolderDialog(currentFolderId.value)
      break
    case 'template':
      router.push('/templates')
      break
    case 'upload':
      ElMessage.info('上传文件功能开发中')
      break
    default:
      break
  }
}

// ============================================================
// 文件夹右键菜单
// ============================================================

function handleFolderMenuCommand(cmd: string, folder: any) {
  switch (cmd) {
    case 'new':
      openCreateFolderDialog(folder.id)
      break
    case 'delete':
      if (isSpecialFolder(folder.id)) {
        ElMessage.warning('不能删除特殊目录')
        return
      }
      ElMessageBox.confirm(
        `确定删除文件夹「${folder.name}」？内部所有笔记将移入回收站`,
        '删除提示',
        { type: 'warning' }
      )
        .then(() => {
          emit('folder-delete', folder.id)
          setTimeout(() => emit('refresh'), 300)
        })
        .catch(() => {})
      break
    case 'rename':
      if (isSpecialFolder(folder.id)) {
        ElMessage.warning('不能重命名特殊目录')
        return
      }
      emit('folder-rename', folder)
      break
    case 'move':
      if (isSpecialFolder(folder.id)) {
        ElMessage.warning('不能移动特殊目录')
        return
      }
      emit('folder-move', folder)
      break
    // case 'copy':
    //   if (isSpecialFolder(folder.id)) {
    //     ElMessage.warning('不能复制特殊目录')
    //     return
    //   }
    //   emit('folder-copy', folder)
    //   break
    case 'more':
      emit('folder-more', folder)
      break
    default:
      break
  }
}

// ============================================================
// 子文件夹新建（由 FolderTreeItem 触发）
// ============================================================

function submitChildCreateFolder() {
  const parentId = childCreateTargetId.value
  if (!parentId) return

  openCreateFolderDialog(parentId)
  childCreateTargetId.value = null
  childCreateName.value = ''
}

function cancelChildCreateFolder() {
  childCreateTargetId.value = null
  childCreateName.value = ''
}

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  await Promise.all([folderStore.loadTree(), tagStore.loadTags()])
})

defineExpose({
  refresh: () => {
    folderStore.loadTree()
  }
})
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 14px;
  background: #f7f6f3;
}

.sidebar-header {
  padding: 0 4px 12px;
  flex-shrink: 0;
}
.logo {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
}

.sidebar-actions .create-btn {
  width: 100%;
  justify-content: center;
  font-size: 13px;
  color: #1d1d1f;
  background: #e8e8e8;
  border-radius: 4px;
  padding: 8px 0;
}
.create-btn:hover { background: #d0d0d0; }
.create-btn .arrow { font-size: 12px; margin-left: 4px; }

:deep(.create-menu) { min-width: 220px; padding: 8px 0; }
.menu-title { padding: 6px 16px 10px; font-size: 14px; font-weight: 600; }
.menu-icon { font-size: 16px; margin-right: 8px; width: 18px; text-align: center; }
.sub-arrow { margin-left: auto; font-size: 12px; color: #8e8e93; }
:deep(.el-dropdown-menu__item) { padding: 6px 16px; font-size: 13px; display: flex; align-items: center; }
:deep(.el-dropdown-menu__item:hover) { background: #f5f5f5; }

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #1d1d1f;
  transition: background 0.15s;
}
.nav-item:hover { background: #e8e8e8; }
.nav-item.active { background: #e8e8e8; font-weight: 500; }

.nav-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-badge {
  font-size: 11px;
  color: #8e8e93;
  background: #e8e8e8;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-empty {
  padding: 4px 8px 4px 24px;
  font-size: 13px;
  color: #8e8e93;
}

.nav-divider {
  height: 1px;
  background: #e8e8e8;
  margin: 8px 4px;
}

.nav-section { margin: 2px 0; }
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.section-header:hover { background: #e8e8e8; }
.section-count {
  font-size: 11px;
  color: #8e8e93;
  background: #e8e8e8;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
.section-arrow {
  font-size: 12px;
  transition: transform 0.2s;
}
.section-arrow.expanded { transform: rotate(180deg); }
.section-children { margin-left: 4px; }

.sidebar-footer {
  padding: 12px 4px 0;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name { font-size: 14px; color: #1d1d1f; }

.sidebar-nav::-webkit-scrollbar { width: 2px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #d0d0d0; border-radius: 2px; }
</style>