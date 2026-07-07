<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <span v-if="!appStore.sidebarCollapsed">📝 个人云笔记</span>
      <span v-else>📝</span>
    </div>

    <!-- ✅ 新建文件夹快捷按钮 -->
    <div v-if="!appStore.sidebarCollapsed" class="sidebar-actions">
      <el-button
        type="primary"
        size="small"
        @click="openCreateFolder"
        style="width: 100%"
      >
        <el-icon><FolderAdd /></el-icon>
        新建文件夹
      </el-button>
    </div>

    <el-menu
      :collapse="appStore.sidebarCollapsed"
      :collapse-transition="false"
      default-active="dashboard"
      router
      background-color="#1e1e2f"
      text-color="#a8a8c8"
      active-text-color="#fff"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-menu-item index="/starred">
        <el-icon><Star /></el-icon>
        <span>星标笔记</span>
      </el-menu-item>

      <el-menu-item index="/archived">
        <el-icon><Box /></el-icon>
        <span>归档</span>
      </el-menu-item>

      <el-menu-item index="/trash">
        <el-icon><Delete /></el-icon>
        <span>回收站</span>
      </el-menu-item>

      <el-sub-menu index="folders">
        <template #title>
          <el-icon><Folder /></el-icon>
          <span>文件夹</span>
        </template>

        <el-menu-item index="/folder">
          <span>全部笔记</span>
        </el-menu-item>

        <el-menu-item
          v-for="folder in folderStore.tree"
          :key="folder.id"
          :index="`/folder/${folder.id}`"
        >
          <span>{{ folder.icon || '📁' }} {{ folder.name }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 笔记模板 -->
      <el-menu-item index="/templates">
        <el-icon><DocumentCopy /></el-icon>
        <span>笔记模板</span>
      </el-menu-item>

      <!-- 个人设置 -->
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-menu-item>

      <!-- 系统管理（仅管理员可见） -->
      <el-sub-menu v-if="userStore.userInfo?.role === 'admin'" index="admin">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/admin/users">用户管理</el-menu-item>
        <el-menu-item index="/admin/logs">操作日志</el-menu-item>
        <el-menu-item index="/admin/config">系统配置</el-menu-item>
      </el-sub-menu>
    </el-menu>

    <!-- 新建文件夹对话框 -->
    <CreateFolderDialog
      v-model="showCreateFolder"
      @success="onFolderCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  Star,
  Box,
  Delete,
  Folder,
  Setting,
  DocumentCopy,
  FolderAdd,
} from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { useFolderStore } from '@/store/modules/folder'
import { useUserStore } from '@/store/modules/user'
// ✅ 导入新建文件夹对话框组件
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'

const appStore = useAppStore()
const folderStore = useFolderStore()
const userStore = useUserStore()

// ✅ 控制弹窗显示
const showCreateFolder = ref(false)

// ✅ 打开新建文件夹对话框
function openCreateFolder() {
  showCreateFolder.value = true
}

// ✅ 文件夹创建成功回调
async function onFolderCreated() {
  await folderStore.loadTree()
  ElMessage.success('文件夹创建成功')
}

onMounted(() => {
  folderStore.loadTree()
})
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* ✅ 侧边栏操作按钮区域 */
.sidebar-actions {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.sidebar-actions .el-button {
  justify-content: center;
}

:deep(.el-menu) {
  border-right: none;
  flex: 1;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
}
</style>