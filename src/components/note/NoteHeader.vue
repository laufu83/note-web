<!-- src/components/note/NoteHeader.vue -->

<template>
  <div class="note-header">
    <div class="header-left">
       <span v-if="fileIcon" class="file-icon">{{ fileIcon }}</span>
      <el-input
        :model-value="displayTitle"
        placeholder="无标题笔记"
        class="header-title-input"
        :disabled="showPreview"
        @focus="handleTitleFocus"
        @blur="handleTitleBlur"
        @update:model-value="handleTitleUpdate"
        clearable
      />
    </div>
    <div class="header-right">
      <el-button v-if="!showPreview" type="primary" size="small" :loading="saving" @click="emit('save')">
        保存
      </el-button>
      <div class="header-icon-group">
        <el-icon size="32" class="header-icon" @click="emit('togglePreview')">
          <DocumentCopy />
        </el-icon>
        <el-icon size="32" class="header-icon" @click="emit('toggleFullscreen')">
          <FullScreen />
        </el-icon>
        <el-icon size="32" class="header-icon" @click="emit('openMore')">
          <More />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { DocumentCopy, FullScreen, More } from '@element-plus/icons-vue'

// ============================================================
// Props
// ============================================================
const props = defineProps<{
  title: string
  saveStatus: string
  saving: boolean
  showPreview?: boolean
}>()
// ✅ 文件类型图标映射
const FILE_ICON_MAP: Record<string, string> = {
  '.md': '📝',
  '.txt': '📄',
  '.docx': '📘',
  '.pdf': '📕',
  '.jpg': '🖼️',
  '.png': '🖼️',
  '.mp4': '🎬',
  '.mp3': '🎵',
}
const fileIcon = computed(() => {
  const ext = getFileExtension(props.title)
  return FILE_ICON_MAP[ext] || '📄'
})
// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  (e: 'update:title', value: string): void
  (e: 'back'): void
  (e: 'save'): void
  (e: 'togglePreview'): void
  (e: 'toggleFullscreen'): void
  (e: 'openMore'): void
}>()

// ============================================================
// ✅ 工具函数：获取文件后缀名
// ============================================================
function getFileExtension(filename: string): string {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) return ''
  return filename.slice(lastDotIndex)
}

// ✅ 获取文件名（不含后缀）
function getFileNameWithoutExtension(filename: string): string {
  if (!filename) return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === 0) return filename
  return filename.slice(0, lastDotIndex)
}

// ✅ 获取完整文件名（含后缀）
function getFullFileName(name: string, extension: string): string {
  const trimmed = name.trim()
  if (!trimmed) return `无标题${extension || '.md'}`
  // 如果已经有后缀，不重复添加
  if (trimmed.endsWith(extension)) return trimmed
  return trimmed + extension
}

// ============================================================
// 本地显示值
// ============================================================
const displayValue = ref(props.title)
const currentExtension = ref('')

// ✅ 初始化后缀名
function initExtension(title: string) {
  currentExtension.value = getFileExtension(title)
}

// 监听 props.title 变化
watch(
  () => props.title,
  (newTitle) => {
    displayValue.value = newTitle
    initExtension(newTitle)
  },
  { immediate: true }
)

// ✅ 标记是否聚焦中
const isFocused = ref(false)

// ✅ displayTitle：根据聚焦状态和预览模式决定显示
const displayTitle = computed({
  get: () => {
    const val = displayValue.value
    
    // 预览模式：始终显示完整名称（含后缀）
    if (props.showPreview) return val
    
    // 编辑模式：聚焦时去掉后缀，失焦时显示完整名称
    if (isFocused.value) {
      return getFileNameWithoutExtension(val)
    }
    
    // 失焦状态：显示完整名称
    return val
  },
  set: (value: string) => {
    displayValue.value = value
  }
})

// ============================================================
// ✅ 聚焦：标记聚焦状态，去掉后缀
// ============================================================
function handleTitleFocus(event: FocusEvent) {
  if (props.showPreview) return
  
  isFocused.value = true
  const input = event.target as HTMLInputElement
  const val = input.value
  
  // 去掉后缀
  const nameWithoutExt = getFileNameWithoutExtension(val)
  if (nameWithoutExt !== val) {
    displayValue.value = nameWithoutExt
    nextTick(() => {
      input.value = nameWithoutExt
      input.select()
    })
  } else {
    nextTick(() => input.select())
  }
}

// ============================================================
// ✅ 失焦：取消聚焦标记，补回后缀
// ============================================================
function handleTitleBlur(event: FocusEvent) {
  if (props.showPreview) return
  
  isFocused.value = false
  const val = (event.target as HTMLInputElement).value.trim()
  
  // 获取当前后缀名
  const ext = currentExtension.value || '.md'
  
  // 格式化：确保有后缀
  let formatted = val
  if (!formatted) {
    formatted = `无标题${ext}`
  } else if (!formatted.endsWith(ext)) {
    formatted = formatted + ext
  }
  
  displayValue.value = formatted
  
  if (formatted !== props.title) {
    emit('update:title', formatted)
  }
}

// ============================================================
// 输入更新
// ============================================================
function handleTitleUpdate(value: string) {
  if (!props.showPreview) {
    displayValue.value = value
  }
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

.header-title-input :deep(.el-input__wrapper.is-disabled) {
  background: transparent !important;
  cursor: default;
}

.header-title-input :deep(.el-input__wrapper.is-disabled .el-input__inner) {
  color: #1e293b;
  -webkit-text-fill-color: #1e293b;
  cursor: default;
}

.header-title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  height: 36px;
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