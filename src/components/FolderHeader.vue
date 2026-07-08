<!-- src/components/FolderHeader.vue -->
<template>
  <div class="column-header">
    <div class="header-left">
      <el-button
        v-if="showBack"
        size="small"
        text
        @click="emit('back')"
        class="back-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
    </div>
    
    <div class="header-center">
      <span class="header-title">{{ title }}</span>
    </div>
    
    <div class="header-right">
      <span class="header-count">{{ count }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'

defineProps<{
  title: string
  count: number
  showBack: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<style scoped>
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 40px;
  flex-shrink: 0;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 8px;
}

.header-right {
  min-width: 40px;
  flex-shrink: 0;
  text-align: right;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.header-count {
  font-size: 12px;
  color: #8e8e93;
  background: #f0f0f0;
  padding: 0 6px;
  border-radius: 10px;
  font-weight: 500;
  display: inline-block;
}

.back-btn {
  padding: 4px 6px !important;
  font-size: 14px;
  color: #6e6e73;
}

.back-btn:hover {
  color: #1d1d1f;
  background: #f0f0f0;
  border-radius: 4px;
}
</style>