<!-- src/components/note/NoteTagDialog.vue -->
<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="选择标签" 
    width="460px"
    :close-on-click-modal="false"
    class="note-tag-dialog"
  >
    <!-- 搜索框 - 宽度调整 -->
    <div class="dialog-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索或创建标签..."
        size="default"
        clearable
        @keydown.enter="handleCreateFromSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button 
            type="primary" 
            @click="handleCreateFromSearch"
            :loading="creating"
          >
            创建
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 已选数量 -->
    <div class="dialog-info" v-if="localSelectedTagIds.length > 0">
      <span>已选择 {{ localSelectedTagIds.length }} 个标签</span>
      <el-button text type="primary" size="small" @click="clearAllSelect">清空</el-button>
    </div>

    <!-- 标签列表 -->
    <div class="dialog-body">
      <div v-if="loading" class="empty-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="filteredTags.length === 0" class="empty-state">
        <el-icon><FolderRemove /></el-icon>
        <span>{{ searchKeyword ? '未找到匹配标签' : '暂无标签' }}</span>
        <el-button 
          v-if="searchKeyword.trim()" 
          text 
          type="primary" 
          @click="handleCreateFromSearch"
        >
          创建「{{ searchKeyword.trim() }}」
        </el-button>
      </div>
      
      <el-checkbox-group v-else v-model="localSelectedTagIds" class="tag-checkbox-group">
        <el-checkbox 
          v-for="tag in filteredTags" 
          :key="tag.id" 
          :label="tag.id"
          class="tag-checkbox"
        >
          <div class="tag-item">
            <span 
              class="tag-color-dot" 
              :style="{ backgroundColor: tag.color || '#667eea' }"
            ></span>
            <span class="tag-name">{{ tag.name }}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <!-- 底部 -->
    <template #footer>
      <div class="dialog-footer">
        <span class="selected-count" :class="{ empty: localSelectedTagIds.length === 0 }">
          {{ localSelectedTagIds.length > 0 ? `已选 ${localSelectedTagIds.length} 个` : '请选择标签' }}
        </span>
        <div class="footer-buttons">
          <el-button @click="handleCancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm"
            :disabled="localSelectedTagIds.length === 0"
          >
            确认添加
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, FolderRemove, Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  selectedTagIds: string[]
  allTags: any[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [selectedIds: string[]]
  'create': [name: string]
}>()

const searchKeyword = ref('')
const localSelectedTagIds = ref<string[]>([])
const creating = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const filteredTags = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return props.allTags
  return props.allTags.filter(t => t.name.toLowerCase().includes(keyword))
})

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      localSelectedTagIds.value = [...props.selectedTagIds]
      searchKeyword.value = ''
    }
  }
)

function clearAllSelect() {
  localSelectedTagIds.value = []
}

async function handleCreateFromSearch() {
  const name = searchKeyword.value.trim()
  if (!name) {
    ElMessage.warning('请输入标签名称')
    return
  }

  const exist = props.allTags.find(t => t.name === name)
  if (exist) {
    if (!localSelectedTagIds.value.includes(exist.id)) {
      localSelectedTagIds.value.push(exist.id)
      ElMessage.success(`已选中标签：${name}`)
    } else {
      ElMessage.warning('标签已选中')
    }
    searchKeyword.value = ''
    return
  }

  creating.value = true
  try {
    emit('create', name)
    searchKeyword.value = ''
  } catch {
    ElMessage.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

function handleConfirm() {
  if (localSelectedTagIds.value.length === 0) {
    ElMessage.warning('请选择至少一个标签')
    return
  }
  emit('confirm', localSelectedTagIds.value)
  dialogVisible.value = false
}

function handleCancel() {
  dialogVisible.value = false
}
</script>

<style scoped>
.note-tag-dialog :deep(.el-dialog) {
  border-radius: 12px;
}

.note-tag-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 0;
}

.note-tag-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 600;
}

.note-tag-dialog :deep(.el-dialog__body) {
  padding: 16px 24px 12px;
}

.note-tag-dialog :deep(.el-dialog__footer) {
  padding: 8px 24px 20px;
}

/* ==================== 搜索框 - 宽度缩短 ==================== */
.dialog-search {
  margin-bottom: 12px;
  /* ✅ 限制搜索框最大宽度，让它变短 */
  max-width: 320px;
}

.dialog-search :deep(.el-input__wrapper) {
  border-radius: 8px 0 0 8px;
  border: 1px solid #e4e7ed;
  border-right: none;
}

.dialog-search :deep(.el-input-group__append) {
  border-radius: 0 8px 8px 0;
  border: 1px solid #e4e7ed;
  border-left: none;
  background: transparent;
  padding: 0;
}

.dialog-search :deep(.el-input-group__append .el-button) {
  border-radius: 0 8px 8px 0;
  padding: 0 14px;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: #fff;
}

.dialog-search :deep(.el-input-group__append .el-button:hover) {
  opacity: 0.9;
}

/* ==================== 已选信息 ==================== */
.dialog-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 6px;
  font-size: 13px;
  color: #667eea;
  margin-bottom: 10px;
}

/* ==================== 标签列表 ==================== */
.dialog-body {
  max-height: 280px;
  overflow-y: auto;
}

.dialog-body::-webkit-scrollbar {
  width: 4px;
}
.dialog-body::-webkit-scrollbar-thumb {
  background: #d5dce6;
  border-radius: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 8px;
  color: #8896a8;
}
.empty-state .el-icon {
  font-size: 36px;
}

.tag-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  margin: 0 !important;
  height: auto !important;
}

.tag-checkbox:hover {
  background: rgba(102, 126, 234, 0.06);
}

.tag-checkbox :deep(.el-checkbox__input) {
  margin-right: 10px;
}

.tag-checkbox :deep(.el-checkbox__label) {
  padding-left: 0;
  width: 100%;
}

.tag-checkbox:has(:deep(.is-checked)) {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  font-size: 14px;
  color: #1a2332;
}

.tag-checkbox:has(:deep(.is-checked)) .tag-name {
  color: #667eea;
}

/* ==================== 底部 ==================== */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 13px;
  color: #667eea;
}
.selected-count.empty {
  color: #8896a8;
}

.footer-buttons {
  display: flex;
  gap: 10px;
}

.footer-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}
.footer-buttons .el-button--primary:disabled {
  background: #e4e7ed;
  color: #8896a8;
}

/* ==================== 暗色主题 ==================== */
@media (prefers-color-scheme: dark) {
  .note-tag-dialog :deep(.el-dialog) {
    background: #1a1a2e;
  }
  .note-tag-dialog :deep(.el-dialog__title) {
    color: #e0e0e0;
  }

  .dialog-search :deep(.el-input__wrapper) {
    background: #1a1a2e;
    border-color: #3a3a4e;
  }
  .dialog-search :deep(.el-input__inner) {
    color: #c8d0e0;
  }

  .dialog-info {
    background: rgba(102, 126, 234, 0.15);
    color: #8a9ef0;
  }

  .tag-name {
    color: #c8d0e0;
  }

  .tag-checkbox:has(:deep(.is-checked)) {
    background: rgba(102, 126, 234, 0.2);
  }
  .tag-checkbox:has(:deep(.is-checked)) .tag-name {
    color: #8a9ef0;
  }

  .empty-state {
    color: #8896a8;
  }

  .selected-count:not(.empty) {
    color: #8a9ef0;
  }

  .footer-buttons .el-button--primary:disabled {
    background: #2a2a4a;
    color: #8896a8;
  }
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .note-tag-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 20px auto;
  }
  .note-tag-dialog :deep(.el-dialog__header) {
    padding: 16px 16px 0;
  }
  .note-tag-dialog :deep(.el-dialog__body) {
    padding: 12px 16px;
  }
  .note-tag-dialog :deep(.el-dialog__footer) {
    padding: 8px 16px 16px;
  }

  /* ✅ 移动端搜索框宽度适应 */
  .dialog-search {
    max-width: 100%;
  }

  .dialog-body {
    max-height: 200px;
  }

  .tag-checkbox {
    padding: 6px 10px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 10px;
  }

  .footer-buttons .el-button {
    flex: 1;
    justify-content: center;
  }
}
</style>