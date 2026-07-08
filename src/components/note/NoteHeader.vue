<!-- src/components/note/NoteHeader.vue -->
<template>
  <div class="note-header">
    <div class="header-left">
      <el-button size="small" text @click="emit('back')">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <el-input
        :model-value="title"
        placeholder="无标题笔记"
        class="header-title-input"
        @focus="handleTitleFocus"
        @update:model-value="emit('update:title', $event)"
        clearable
      />
      <span class="save-status">{{ saveStatus }}</span>
    </div>
    <div class="header-right">
      <el-button type="primary" size="small" :loading="saving" @click="emit('save')">
        保存
      </el-button>
      <div class="header-icon-group">
        <el-icon size="18" class="header-icon" @click="emit('togglePreview')">
          <DocumentCopy />
        </el-icon>
        <el-icon size="18" class="header-icon" @click="emit('toggleFullscreen')">
          <FullScreen />
        </el-icon>
        <el-icon size="18" class="header-icon" @click="emit('openMore')">
          <More />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, DocumentCopy, FullScreen, More } from '@element-plus/icons-vue'

defineProps<{
  title: string
  saveStatus: string
  saving: boolean
}>()

const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'back'): void
  (e: 'save'): void
  (e: 'togglePreview'): void
  (e: 'toggleFullscreen'): void
  (e: 'openMore'): void
}>()

function handleTitleFocus(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  input.select()
}
</script>

<style scoped>
.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.header-title-input {
  flex: 1;
  min-width: 100px;
}

.header-title-input :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none;
  padding: 0 8px;
  background: transparent;
}

.header-title-input :deep(.el-input__wrapper:hover) {
  background: #f5f7fa;
}

.header-title-input :deep(.el-input__wrapper.is-focus) {
  background: #f5f7fa;
}

.header-title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  height: 36px;
}

.save-status {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-icon-group {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

.header-icon {
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.header-icon:hover {
  background: #f1f5f9;
  color: #0f172a;
}
</style>