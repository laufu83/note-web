<!-- src/components/layout/NoteLayout.vue -->
<template>
  <div class="note-layout">
    <!-- 左侧栏 -->
    <div class="left-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <AppSidebar />
    </div>

    <!-- 右侧内容 -->
    <div class="content-area" :class="{ expanded: appStore.sidebarCollapsed }">
      <NoteHeader />
      <div class="content-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import AppSidebar from './AppSidebar.vue'
import NoteHeader from './NoteHeader.vue'

const appStore = useAppStore()
</script>

<style scoped>
.note-layout {
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
  transition: width 0.25s ease, min-width 0.25s ease;
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
}

.content-body {
  flex: 1;
  overflow: hidden;
}
</style>