<template>
  <el-container class="app-layout">
    <el-aside :width="sidebarWidth" class="app-sidebar">
      <AppSidebar />
    </el-aside>

    <el-container>
      <el-header height="60px" class="app-header">
        <AppHeader />
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() =>
  appStore.sidebarCollapsed ? '64px' : '240px'
)
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.app-sidebar {
  background: #1e1e2f;
  color: #fff;
  transition: width 0.3s ease;
  overflow: hidden;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.app-main {
  background: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}
</style>