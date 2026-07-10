<!-- src/components/note/NoteTags.vue -->
<template>
  <div class="note-tags-area" v-if="!hideTags">
    <div class="tags-wrapper">
      <div class="tags-list">
        <!-- 标签列表 -->
        <el-tag
          v-for="tag in tags"
          :key="tag.id"
          size="default"
          closable
          class="note-tag"
          :style="{
            backgroundColor: (tag.color || '#667eea') + '20',
            borderColor: tag.color || '#667eea',
            color: tag.color || '#667eea'
          }"
          @close="handleRemove(tag.id)"
          @click="handleClick(tag)"
        >
          {{ tag.name }}
        </el-tag>
        
        <!-- 快速创建输入框 -->
        <div class="tag-input-wrapper" v-if="showInput">
          <el-input
            ref="inputRef"
            v-model="inputValue"
            size="small"
            placeholder="标签名"
            clearable
            @keydown.enter="handleCreate"
            @blur="handleBlur"
            @keydown.esc="handleCancel"
          >
            <template #prefix>#</template>
            <template #append>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleCreate"
                :loading="creating"
              >
                创建
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 添加按钮 -->
        <el-button
          v-else
          size="small"
          text
          class="add-btn"
          @click="showInputField"
        >
          <el-icon><Plus /></el-icon>
          添加
        </el-button>
        
        <!-- 批量选择 -->
        <el-button
          size="small"
          text
          class="add-btn select-btn"
          @click="handleOpenDialog"
        >
          <el-icon><Folder /></el-icon>
          选择
        </el-button>
      </div>
      
      <!-- 标签计数 -->
      <div class="tags-action" v-if="tags.length > 0">
        <span class="tags-count">{{ tags.length }} / {{ maxLimit }}</span>
        <el-button text size="small" type="danger" @click="handleClearAll">清空</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder } from '@element-plus/icons-vue'
import type { Tag } from '@/types'

// ============================================================
// Props
// ============================================================
const props = defineProps<{
  tags: Tag[]
  maxLimit?: number
  hideTags?: boolean
}>()

// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  (e: 'remove', tagId: string): void
  (e: 'click', tag: Tag): void
  (e: 'create', name: string): void
  (e: 'clear-all'): void
  (e: 'open-dialog'): void
}>()

// ============================================================
// 状态
// ============================================================
const showInput = ref(false)
const inputValue = ref('')
const inputRef = ref<any>(null)
const creating = ref(false)

// ============================================================
// 方法
// ============================================================
function showInputField() {
  showInput.value = true
  inputValue.value = ''
  nextTick(() => inputRef.value?.focus())
}

function handleCancel() {
  showInput.value = false
  inputValue.value = ''
}

function handleBlur() {
  setTimeout(() => {
    if (!inputValue.value.trim()) showInput.value = false
  }, 150)
}

async function handleCreate() {
  const name = inputValue.value.trim()
  if (!name) { handleCancel(); return }
  
  creating.value = true
  try {
    await emit('create', name)
    handleCancel()
  } finally {
    creating.value = false
  }
}

function handleRemove(tagId: string) {
  ElMessageBox.confirm('移除该标签？', '提示', { type: 'info' })
    .then(() => emit('remove', tagId))
    .catch(() => {})
}

function handleClick(tag: Tag) {
  emit('click', tag)
}

function handleClearAll() {
  ElMessageBox.confirm('清空所有标签？', '提示', { type: 'info' })
    .then(() => emit('clear-all'))
    .catch(() => {})
}

function handleOpenDialog() {
  emit('open-dialog')
}

// ============================================================
// 暴露方法
// ============================================================
defineExpose({
  showInputField,
  handleCancel,
})
</script>

<style scoped>
/* ==================== 标签区域 ==================== */
.note-tags-area {
  padding: 6px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  background: #fafbfc;
}

.tags-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.tags-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.tags-action {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 12px;
  color: #8896a8;
}

/* 标签 */
.note-tag {
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  border: 1px solid transparent;
  transition: all 0.2s;
  user-select: none;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.note-tag :deep(.el-tag__close) {
  color: inherit;
  font-size: 11px;
  margin-left: 2px;
}
.note-tag :deep(.el-tag__close:hover) {
  background: rgba(0,0,0,0.1);
  border-radius: 50%;
}

/* 按钮 */
.add-btn {
  color: #8896a8;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;
  height: 24px;
  line-height: 22px;
  border: 1px dashed #d0d7e3;
  transition: all 0.2s;
}
.add-btn:hover {
  color: #667eea;
  background: rgba(102,126,234,0.08);
  border-color: #667eea;
}
.add-btn .el-icon { font-size: 13px; }
.add-btn.select-btn { border: none; }
.add-btn.select-btn:hover { border: none; }

/* ==================== 输入框 ==================== */
.tag-input-wrapper {
  display: inline-flex;
  align-items: center;
  min-width: 130px;
  max-width: 160px;
  /* ✅ 添加右侧间距 */
  margin-right: 4px;
}

.tag-input-wrapper :deep(.el-input) { 
  height: 24px; 
  width: 100%;
}

.tag-input-wrapper :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px;
  padding: 0 6px;
  background: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: none !important;
}

.tag-input-wrapper :deep(.el-input__wrapper:hover) { border-color: #667eea; }
.tag-input-wrapper :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102,126,234,0.1) !important;
}

.tag-input-wrapper :deep(.el-input__inner) {
  font-size: 12px;
  height: 22px;
  line-height: 22px;
  padding: 0 4px;
}

.tag-input-wrapper :deep(.el-input__prefix) {
  color: #8896a8;
  font-weight: 600;
  font-size: 12px;
  margin-right: 2px;
}

.tag-input-wrapper :deep(.el-input__suffix) {
  display: none;
}

.tag-input-wrapper :deep(.el-input-group__append) {
  border-radius: 0 4px 4px 0;
  padding: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
}

.tag-input-wrapper :deep(.el-input-group__append .el-button) {
  border-radius: 0 4px 4px 0;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  /* ✅ 按钮右侧间距 */
  margin-right: 2px;
}

.tag-input-wrapper :deep(.el-input-group__append .el-button:hover) { opacity: 0.9; }
.tag-input-wrapper :deep(.el-input-group__append .el-button:active) { transform: scale(0.95); }

/* ==================== 暗色 ==================== */
@media (prefers-color-scheme: dark) {
  .note-tags-area { background: #1a1a2e; border-bottom-color: #2a2a3e; }
  .add-btn { color: #8896a8; border-color: #3a3a4e; }
  .add-btn:hover { color: #8a9ef0; background: rgba(102,126,234,0.15); border-color: #8a9ef0; }
  .tag-input-wrapper :deep(.el-input__wrapper) { background: #1a1a2e; border-color: #3a3a4e; }
  .tag-input-wrapper :deep(.el-input__inner) { color: #c8d0e0; }
  .tag-input-wrapper :deep(.el-input-group__append) { background: #1a1a2e; border-color: #3a3a4e; }
  .tags-action { color: #8896a8; }
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .note-tags-area { padding: 4px 12px; }
  .tags-action { width: 100%; justify-content: flex-end; margin-top: 2px; }
  .note-tag { font-size: 11px; height: 20px; line-height: 18px; max-width: 70px; }
  .add-btn { font-size: 11px; height: 20px; line-height: 18px; }
  .tag-input-wrapper { min-width: 110px; max-width: 140px; margin-right: 2px; }
  .tag-input-wrapper :deep(.el-input) { height: 20px; }
  .tag-input-wrapper :deep(.el-input__inner) { height: 18px; font-size: 11px; line-height: 18px; padding: 0 2px; }
  .tag-input-wrapper :deep(.el-input-group__append .el-button) { 
    height: 20px; 
    padding: 0 6px; 
    font-size: 10px;
    margin-right: 1px;
  }
  .tag-input-wrapper :deep(.el-input__prefix) { font-size: 11px; }
}
</style>