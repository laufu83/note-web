<!-- src/components/layout/AppHeader.vue -->

<template>
  <div class="app-header">
    <div class="header-left">
      <el-button text @click="appStore.toggleSidebar">
        <el-icon><Expand /></el-icon>
      </el-button>
      <span class="header-breadcrumb">{{ breadcrumb }}</span>
    </div>

    <div class="header-right">
      <el-button text size="small" @click="focusSearch">
        <el-icon><Search /></el-icon>
      </el-button>

      <el-dropdown @command="handleCommand">
        <el-avatar :size="28" :src="userStore.userInfo?.avatarUrl || undefined">
          {{ userStore.nickname?.charAt(0)?.toUpperCase() || 'U' }}
        </el-avatar>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="settings">设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Expand, Search } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useFolderStore } from '@/store/modules/folder'
import CreateMenu from '@/components/business/CreateMenu.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()
const folderStore = useFolderStore()

const breadcrumb = computed(() => {
  const path = route.path
  if (path === '/') return '全部笔记'
  if (path.startsWith('/folder/')) {
    const id = path.split('/')[2]
    const folder = folderStore.tree.find(f => f.id === id)
    return folder?.name || '文件夹'
  }
  if (path.startsWith('/note/')) return '笔记详情'
  if (path === '/starred') return '⭐ 星标笔记'
  if (path === '/trash') return '🗑️ 回收站'
  if (path === '/settings') return '⚙️ 设置'
  if (path === '/templates') return '📋 笔记模板'
  return '我的笔记'
})

// ✅ 修复 focus 类型错误
function focusSearch() {
  const input = document.querySelector('.middle-column .el-input__inner') as HTMLInputElement | null
  if (input) {
    input.focus()
  }
}

function handleCreateFolder() {
  ElMessage.info('新建文件夹')
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout()
    router.push('/login')
  } else {
    router.push('/settings')
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 48px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-breadcrumb {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>