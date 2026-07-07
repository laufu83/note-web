<template>
  <div class="header">
    <div class="header-left">
      <el-button :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" @click="appStore.toggleSidebar()" text />
      <span class="header-title">{{ route.name || '个人云笔记' }}</span>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo?.avatarUrl || undefined">
            {{ userStore.nickname?.charAt(0)?.toUpperCase() || 'U' }}
          </el-avatar>
          <span class="user-name">{{ userStore.nickname || userStore.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon> 个人信息
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon> 设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

async function handleCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/settings')
  } else if (command === 'settings') {
    router.push('/settings')
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f0f0f0;
}

.user-name {
  font-size: 14px;
  color: #333;
}
</style>