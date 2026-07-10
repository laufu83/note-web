<!-- src/components/layout/AppSidebar.vue -->
<template>
  <div class="sidebar-wrapper">
    <!-- 折叠切换按钮（悬浮在边缘） -->
    <div class="toggle-actions" @click="appStore.toggleSidebar">
      <el-button text class="toggle-btn">
        <el-icon><Expand /></el-icon>
      </el-button>
    </div>

    <div class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
      <!-- ========== 顶部用户区域 ========== -->
      <div class="sidebar-user-header">
        <div class="avatar-wrapper">
          <el-avatar 
            size="72" 
            :src="userStore.userInfo?.avatarUrl || undefined"
            class="user-avatar"
          >
            {{ userStore.userInfo?.nickname?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
          <div class="avatar-status"></div>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</div>
          <div class="user-email">{{ userStore.userInfo?.email || '' }}</div>
        </div>
      </div>

      <!-- ========== 新建按钮 ========== -->
     <div class="sidebar-actions">
      <CreateDropdown @command="handleCommand">
        <template #default>
          <el-button class="create-btn" type="primary" size="large" block>
            <span class="btn-content">
              <el-icon class="btn-icon"><Plus /></el-icon>
              <span class="btn-text">新建笔记</span>
              <el-icon class="btn-arrow"><ArrowDown /></el-icon>
            </span>
          </el-button>
        </template>
      </CreateDropdown>
    </div>

      <!-- ========== 导航菜单 ========== -->
      <div class="sidebar-nav">
        <!-- 最新 -->
        <div
          class="nav-item"
          :class="{ active: isActive('/file/recent') }"
          @click="goTo('/file/recent')"
        >
          <div class="nav-icon-wrapper">
            <el-icon class="nav-icon"><Grid /></el-icon>
          </div>
          <span class="nav-label">最新</span>
          
        </div>

        <!-- 我的文件夹 -->
        <div class="nav-section">
          <div 
            class="nav-item" 
            @click="goTo('/file/root')"
            :class="{ active: isActive('/file/root') }"
          >
            <div class="nav-icon-wrapper">
              <el-icon class="nav-icon"><Folder /></el-icon>
            </div>
            <span class="section-label">我的文件夹</span>
           
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
            <div v-if="folderList.length === 0" class="nav-empty">
              <el-icon><FolderRemove /></el-icon>
              <span>暂无文件夹</span>
            </div>
          </div>
        </div>

        <!-- 与我分享 -->
        <div
          class="nav-item"
          :class="{ active: isActive('/file/shared') }"
          @click="goTo('/file/shared')"
        >
          <div class="nav-icon-wrapper">
            <el-icon class="nav-icon"><User /></el-icon>
          </div>
          <span class="nav-label">与我分享</span>
        </div>

        <!-- 加星 -->
        <div
          class="nav-item"
          :class="{ active: isActive('/file/starred') }"
          @click="goTo('/file/starred')"
        >
          <div class="nav-icon-wrapper">
            <el-icon class="nav-icon"><Star /></el-icon>
          </div>
          <span class="nav-label">加星</span>
        
        </div>

        <!-- 回收站 -->
        <div
          class="nav-item"
          :class="{ active: isActive('/file/trash') }"
          @click="goTo('/file/trash')"
        >
          <div class="nav-icon-wrapper">
            <el-icon class="nav-icon"><Delete /></el-icon>
          </div>
          <span class="nav-label">回收站</span>
        </div>

        <!-- 分隔线 -->
        <div class="nav-divider"></div>

        <!-- 模板中心 -->
        <div
          class="nav-item"
          @click="goTo('/templates')"
        >
          <div class="nav-icon-wrapper">
            <el-icon class="nav-icon"><Collection /></el-icon>
          </div>
          <span class="nav-label">模板中心</span>
        </div>
      </div>

      <!-- ========== 底部区域 ========== -->
      <div class="sidebar-footer">
        <div class="footer-divider"></div>
        <div class="footer-actions">
          <div class="footer-link-row">
            <span class="footer-link" @click="goTo('/settings')">
              <el-icon><Setting /></el-icon>
              设置
            </span>
            
            <span class="footer-link" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出
            </span>
          </div>
        </div>
        <div class="footer-version">v2.0.1</div>
      </div>

      <!-- 创建文件夹弹窗 -->
      <CreateFolderDialog
        v-model="showCreateFolderDialog"
        :parent-id="createFolderParentId"
        @success="onFolderCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Grid,
  Folder,
  User,
  Star,
  Delete,
  Plus,
  Expand,
  Collection,
  Setting,
  QuestionFilled,
  SwitchButton,
  FolderRemove
} from '@element-plus/icons-vue'
import { useFolderStore } from '@/store/modules/folder'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'
import FolderTreeItem from './FolderTreeItem.vue'
import CreateDropdown from '@/components/business/CreateNew.vue'

// ============================================================
// 常量 & Store
// ============================================================
const SPECIAL_FOLDERS = ['recent', 'starred', 'trash', 'shared', 'cloud-collab'] as const
const isSpecialFolder = (id: string | null): boolean => {
  return id !== null && SPECIAL_FOLDERS.includes(id as any)
}

const router = useRouter()
const route = useRoute()
const folderStore = useFolderStore()
const userStore = useUserStore()
const appStore = useAppStore()

// ============================================================
// 状态
// ============================================================
const collapsed = computed({
  get: () => appStore.sidebarCollapsed,
  set: (val) => appStore.setSidebarCollapsed(val),
})

const foldersExpanded = ref(true)
const showCreateFolderDialog = ref(false)
const createFolderParentId = ref<string | null>(null)
const currentFolderId = computed(() => route.params.folderId as string || null)

const childCreateTargetId = ref<string | null>(null)
const childCreateName = ref('')
const folderList = computed(() => folderStore.tree || [])

// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  (e: 'create-folder', parentId: string | null): void
  (e: 'create-note', folderId: string | null, type: string): void
  (e: 'folder-delete', folderId: string): void
  (e: 'folder-rename', folder: any): void
  (e: 'folder-move', folder: any): void
  (e: 'folder-more', folder: any): void
  (e: 'refresh'): void
}>()

// ============================================================
// 导航方法
// ============================================================
function isActive(path: string): boolean {
  if (path === '/file/recent') return route.path === '/file/recent' || route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

function goTo(path: string) {
  router.push(path)
}

function goToFolder(id: string) {
  router.push(`/file/${id}`)
}

// ============================================================
// 文件夹操作
// ============================================================
function getValidParentId(parentId: string | null): string | null {
  if (isSpecialFolder(parentId)) return null
  return parentId
}

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
// 新建命令
// ============================================================
function handleCommand(command: string) {
  const targetFolderId = currentFolderId.value
  switch (command) {
    case 'note-blank': emit('create-note', targetFolderId, 'blank'); break
    case 'note-md': emit('create-note', targetFolderId, 'md'); break
    case 'note-mind': emit('create-note', targetFolderId, 'mind'); break
    case 'note-flow': emit('create-note', targetFolderId, 'flow'); break
    case 'note-table': emit('create-note', targetFolderId, 'table'); break
    case 'note-whiteboard': emit('create-note', targetFolderId, 'whiteboard'); break
    case 'template-ai': router.push('/templates'); break
    case 'word-import': ElMessage.info('Word转笔记功能开发中'); break
    case 'upload-file': ElMessage.info('上传文件功能开发中'); break
    case 'upload-folder': ElMessage.info('上传文件夹功能开发中'); break
    case 'folder': openCreateFolderDialog(targetFolderId); break
  }
}

// ============================================================
// 文件夹菜单
// ============================================================
function handleFolderMenuCommand(cmd: string, folder: any) {
  switch (cmd) {
    case 'new': openCreateFolderDialog(folder.id); break
    case 'delete':
      if (isSpecialFolder(folder.id)) return ElMessage.warning('不能删除特殊目录')
      ElMessageBox.confirm(
        `确定要删除文件夹「${folder.name}」吗？`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        emit('folder-delete', folder.id)
        setTimeout(() => emit('refresh'), 300)
      }).catch(() => {})
      break
    case 'rename':
      if (isSpecialFolder(folder.id)) return ElMessage.warning('不能重命名特殊目录')
      emit('folder-rename', folder)
      break
    case 'move':
      if (isSpecialFolder(folder.id)) return ElMessage.warning('不能移动特殊目录')
      emit('folder-move', folder)
      break
    case 'more': emit('folder-more', folder); break
  }
}

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
// 退出登录
// ============================================================
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(() => {      
      
      // ✅ 正确：调用并等待异步方法
      return userStore.logout()
        .then(() => {
        
          ElMessage.success('已安全退出')
          router.push('/login')
        })
        .catch((error) => {
          console.error('退出失败:', error)
          ElMessage.error('退出失败，请重试')
        })
    })
    .catch(() => {
      // 用户取消了操作，不做任何处理
    })
}

// ============================================================
// 生命周期
// ============================================================
onMounted(async () => {
  await folderStore.loadTree()
})

defineExpose({ refresh: () => folderStore.loadTree() })
</script>

<style scoped>
/* ============================================================
   侧边栏容器
   ============================================================ */
.sidebar-wrapper {
  position: relative;
  height: 100%;
  background: #f8fafc;
}

/* ============================================================
   折叠切换按钮
   ============================================================ */
.toggle-actions {
  position: absolute;
  top: 12px;
  right: -12px;
  z-index: 100;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8ecf1;
}

.toggle-actions:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(54, 113, 233, 0.2);
  border-color: #3671e9;
}

.toggle-actions .toggle-btn {
  padding: 0;
  width: 100%;
  height: 100%;
  color: #5a6a82;
}

.toggle-actions .toggle-btn:hover {
  color: #3671e9;
}

/* ============================================================
   侧边栏主体
   ============================================================ */
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 28px 16px 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f4f9 100%);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

/* ============================================================
   折叠状态
   ============================================================ */
.sidebar-collapsed {
  padding: 16px 8px;
  width: 64px;
  min-width: 64px;
  align-items: center;
}

.sidebar-collapsed .user-info,
.sidebar-collapsed .nav-label,
.sidebar-collapsed .section-label,
.sidebar-collapsed .section-count,
.sidebar-collapsed .section-arrow,
.sidebar-collapsed .nav-badge,
.sidebar-collapsed .footer-link-row,
.sidebar-collapsed .footer-version,
.sidebar-collapsed .nav-divider,
.sidebar-collapsed .nav-empty {
  display: none !important;
}

.sidebar-collapsed .nav-item,
.sidebar-collapsed .section-header {
  justify-content: center;
  padding: 10px !important;
  gap: 0;
}

.sidebar-collapsed .nav-icon-wrapper {
  margin: 0;
}

.sidebar-collapsed .section-children {
  margin-left: 0 !important;
  align-items: center;
}

.sidebar-collapsed .sidebar-user-header {
  gap: 8px;
  margin-bottom: 12px;
}

.sidebar-collapsed .sidebar-user-header .user-avatar {
  width: 40px !important;
  height: 40px !important;
}

.sidebar-collapsed .avatar-status {
  display: none !important;
}

.sidebar-collapsed .create-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  border-radius: 12px;
  min-width: 40px !important;
}

.sidebar-collapsed .create-btn span {
  display: none;
}

.sidebar-collapsed .create-btn .el-icon {
  margin-right: 0;
  font-size: 20px;
}

.sidebar-collapsed :deep(.folder-tree-item .folder-item) {
  padding-left: 0 !important;
  justify-content: center;
}

.sidebar-collapsed :deep(.folder-tree-item .folder-item .nav-label) {
  display: none !important;
}

.sidebar-collapsed :deep(.folder-tree-item .folder-item .nav-badge) {
  display: none !important;
}

.sidebar-collapsed :deep(.folder-tree-item .folder-item .folder-more-dropdown) {
  display: none !important;
}

.sidebar-collapsed :deep(.folder-tree-item .folder-item .folder-icon) {
  margin: 0;
}

.sidebar-collapsed .footer-divider {
  display: none !important;
}

/* ============================================================
   用户区域
   ============================================================ */
.sidebar-user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  padding: 4px 0;
}

.avatar-wrapper {
  position: relative;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid #ffffff;
  box-shadow: 0 4px 16px rgba(54, 113, 233, 0.2);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(54, 113, 233, 0.35);
}

.avatar-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: #34d399;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(52, 211, 153, 0.4);
}

.user-info {
  text-align: center;
  transition: opacity 0.3s ease;
}

.user-name {
  font-size: 17px;
  font-weight: 600;
  color: #1a2332;
  letter-spacing: 0.3px;
}

.user-email {
  font-size: 12px;
  color: #8896a8;
  margin-top: 2px;
  opacity: 0.8;
}

/* ============================================================
   新建按钮
   ============================================================ */
.sidebar-actions {
  margin-bottom: 24px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.create-btn {
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(54, 113, 233, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(54, 113, 233, 0.4);
}

.create-btn:active {
  transform: translateY(0px);
}

.create-btn .el-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: margin 0.3s ease;
}

/* ============================================================
   导航区域
   ============================================================ */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  min-height: 0;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #d5dce6;
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #b8c2d0;
}

/* ============================================================
   导航项
   ============================================================ */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
  margin-bottom: 2px;
  color: #4a5a72;
  position: relative;
}

.nav-item:hover {
  background: rgba(54, 113, 233, 0.08);
  color: #1a2332;
}

.nav-item.active {
  background: rgba(54, 113, 233, 0.12);
  color: #3671e9;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: #3671e9;
  border-radius: 0 4px 4px 0;
}

.nav-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover .nav-icon-wrapper {
  background: rgba(54, 113, 233, 0.1);
}

.nav-item.active .nav-icon-wrapper {
  background: rgba(54, 113, 233, 0.15);
}

.nav-icon {
  font-size: 18px;
  color: #718096;
  transition: all 0.3s ease;
}

.nav-item.active .nav-icon {
  color: #3671e9;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.nav-badge {
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 8px;
  border-radius: 12px;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  flex-shrink: 0;
  transition: opacity 0.3s ease;
}

.nav-divider {
  height: 1px;
  margin: 12px 14px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

/* ============================================================
   文件夹区域
   ============================================================ */
.nav-section {
  margin: 4px 0 6px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
  color: #4a5a72;
  position: relative;
}

.section-header:hover {
  background: rgba(54, 113, 233, 0.08);
  color: #1a2332;
}

.section-header.active {
  background: rgba(54, 113, 233, 0.12);
  color: #3671e9;
}

.section-header.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: #3671e9;
  border-radius: 0 4px 4px 0;
}

.section-icon {
  font-size: 18px;
  color: #718096;
  transition: all 0.3s ease;
}

.section-header.active .section-icon {
  color: #3671e9;
}

.section-label {
  flex: 1;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.section-count {
  font-size: 11px;
  color: #8896a8;
  background: #e8ecf1;
  padding: 0 8px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  transition: opacity 0.3s ease;
}

.section-arrow {
  font-size: 14px;
  color: #a0aec0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.section-arrow.expanded {
  transform: rotate(180deg);
  color: #3671e9;
}

/* ============================================================
   文件夹子项
   ============================================================ */
.section-children {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.nav-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  font-size: 13px;
  color: #a0aec0;
  justify-content: center;
}

.nav-empty .el-icon {
  font-size: 16px;
}

/* ============================================================
   底部区域
   ============================================================ */
.sidebar-footer {
  margin-top: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}

.footer-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

.footer-actions {
  display: flex;
  justify-content: center;
}

.footer-link-row {
  display: flex;
  gap: 20px;
  transition: opacity 0.3s ease;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8896a8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.footer-link .el-icon {
  font-size: 16px;
}

.footer-link:hover {
  color: #3671e9;
  background: rgba(54, 113, 233, 0.08);
}

.footer-version {
  text-align: center;
  font-size: 11px;
  color: #b8c2d0;
  letter-spacing: 0.5px;
  transition: opacity 0.3s ease;
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 768px) {
  .sidebar {
    padding: 20px 12px 16px;
  }

  .sidebar-collapsed {
    width: 56px;
    min-width: 56px;
    padding: 12px 6px;
  }

  .sidebar-collapsed .create-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
  }

  .sidebar-collapsed .sidebar-user-header .user-avatar {
    width: 36px !important;
    height: 36px !important;
  }

  .toggle-actions {
    right: -10px;
    width: 20px;
    height: 20px;
  }

  .toggle-actions .toggle-btn .el-icon {
    font-size: 14px;
  }

  .footer-link-row {
    gap: 12px;
  }

  .footer-link {
    font-size: 12px;
    padding: 2px 6px;
  }

  .footer-link .el-icon {
    font-size: 14px;
  }
}
</style>