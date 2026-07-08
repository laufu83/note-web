<!-- src/components/layout/NoteHeader.vue -->
<template>
  <div class="note-header">
    <div class="header-left">
      <el-button text @click="appStore.toggleSidebar">
        <el-icon><Expand /></el-icon>
      </el-button>
      <span class="header-breadcrumb">{{ isNew ? '新建笔记' : '笔记详情' }}</span>
    </div>

    <div class="header-right">
      <el-button text size="small" @click="goBack">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Expand, Close } from '@element-plus/icons-vue'
import { useAppStore } from '@/store/modules/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const isNew = computed(() => route.path === '/note/new')

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
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
  gap: 8px;
}
</style>