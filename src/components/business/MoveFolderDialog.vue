<!-- src/components/business/MoveFolderDialog.vue -->

<template>
  <el-dialog
    v-model="dialogVisible"
    title="移动文件夹"
    width="480px"
    :close-on-click-modal="false"
    class="move-folder-dialog"
    @close="handleClose"
  >
    <div class="move-content">
      <!-- 第一行：当前文件名 -->
      <div class="move-info">
        <span class="info-label">📄</span>
        <span class="file-name">{{ props.folder?.name || '未命名文件夹' }}</span>
      </div>

      <!-- 第二行：目标路径 -->
      <div class="target-path">
        <span class="path-label">移动到：</span>
        <span class="path-value">{{ targetPath }}</span>
      </div>

      <!-- 文件夹树 -->
      <div class="folder-tree-container">      
        
        <div class="tree-body">
          <!-- 根目录选项（显示为"我的文件夹"） -->
          <div 
            class="tree-node root"
            :class="{ selected: selectedTargetId === null }"
            @click="selectTarget(null)"
          >
            <span class="node-icon">📁</span>
            <span class="node-label">我的文件夹</span>
            <span class="node-hint">(根目录)</span>
          </div>

          <!-- 使用 FolderTreeNode 组件 -->
          <div v-for="folder in folderTree" :key="folder.id">
            <FolderTreeNode
              :folder="folder"
              :level="1"
              :selected-id="selectedTargetId"
              :current-folder-id="props.folder?.id"
              :default-expanded="true"
              :highlight-id="currentFolderParentId"
              @select="selectTarget"
            />
          </div>

          <!-- 空状态 -->
          <div v-if="folderTree.length === 0" class="tree-empty">
            暂无其他文件夹
          </div>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="loading" 
          :disabled="!isValidTarget"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import { useFolderStore } from '@/store/modules/folder'
import FolderTreeNode from './FolderTreeNode.vue'

const props = defineProps<{
  modelValue: boolean
  folder: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const folderStore = useFolderStore()
const loading = ref(false)
const selectedTargetId = ref<string | null>(null)
const errorMessage = ref('')

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 获取当前文件夹的父级 ID（用于默认选中）
const currentFolderParentId = computed(() => {
  return props.folder?.parentId || null
})

// 获取文件夹树（过滤当前文件夹及其子文件夹）
const folderTree = computed(() => {
  if (!props.folder) return []
  
  const filterFolder = (folders: any[]): any[] => {
    return folders
      .filter(f => f.id !== props.folder?.id)
      .map(f => ({
        ...f,
        children: filterFolder(f.children || [])
      }))
      .filter(f => f.id !== props.folder?.id)
  }
  return filterFolder(folderStore.tree || [])
})

// 获取目标路径 - 显示为 "我的文件夹/目标文件夹"
const targetPath = computed(() => {
  if (selectedTargetId.value === null) {
    return '我的文件夹'
  }
  
  // 从树中查找文件夹路径
  const findPath = (folders: any[], id: string, path: string[] = []): string[] | null => {
    for (const f of folders) {
      const currentPath = [...path, f.name]
      if (f.id === id) {
        return currentPath
      }
      if (f.children && f.children.length > 0) {
        const result = findPath(f.children, id, currentPath)
        if (result) return result
      }
    }
    return null
  }
  
  const path = findPath(folderStore.tree, selectedTargetId.value)
  return path ? `我的文件夹 / ${path.join(' / ')}` : '我的文件夹'
})

// 验证目标是否有效
const isValidTarget = computed(() => {
  if (selectedTargetId.value === null) return true // 允许移动到根目录
  
  // 检查是否选择了自身
  if (selectedTargetId.value === props.folder?.id) {
    errorMessage.value = '不能移动到自身'
    return false
  }
  
  // 检查是否选择了子文件夹
  if (isChildOf(props.folder?.id, selectedTargetId.value)) {
    errorMessage.value = '不能移动到子文件夹'
    return false
  }
  
  errorMessage.value = ''
  return true
})

// 判断 targetId 是否是 folderId 的子文件夹
const isChildOf = (folderId: string, targetId: string): boolean => {
  const findFolder = (folders: any[], id: string): any => {
    for (const f of folders) {
      if (f.id === id) return f
      const found = findFolder(f.children || [], id)
      if (found) return found
    }
    return null
  }
  
  const folder = findFolder(folderStore.tree || [], folderId)
  if (!folder) return false
  
  const checkChildren = (children: any[]): boolean => {
    for (const child of children) {
      if (child.id === targetId) return true
      if (checkChildren(child.children || [])) return true
    }
    return false
  }
  
  return checkChildren(folder.children || [])
}

// 选择目标
const selectTarget = (id: string | null) => {
  selectedTargetId.value = id
  errorMessage.value = ''
}

// 初始化选中的目标（默认选中当前文件夹的父级）
const initSelectedTarget = () => {
  if (props.folder) {
    // 默认选中当前文件夹的父级
    const parentId = props.folder.parentId || null
    selectedTargetId.value = parentId
    errorMessage.value = ''
  }
}

// 监听对话框打开，初始化选中状态
watch(() => props.modelValue, (val) => {
  if (val && props.folder) {
    // 使用 nextTick 确保组件渲染完成后再设置选中状态
    nextTick(() => {
      initSelectedTarget()
    })
  }
}, { immediate: true })

const handleClose = () => {
  selectedTargetId.value = null
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (!isValidTarget.value) {
    ElMessage.warning(errorMessage.value || '请选择有效的目标文件夹')
    return
  }
  
  if (!props.folder) return
  
  loading.value = true
  try {
    await folderStore.updateFolder(props.folder.id, { 
      parentId: selectedTargetId.value || undefined 
    })
    emit('success')
    dialogVisible.value = false
    ElMessage.success(`已移动「${props.folder.name}」`)
  } catch (error: any) {
    ElMessage.error(error.message || '移动失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.move-folder-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.move-folder-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.move-folder-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
}

.move-folder-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.move-folder-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

/* ========== 内容区域 ========== */
.move-content {
  padding: 0;
}

/* 第一行：当前文件名 */
.move-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 24px;
  background: #f7f6f3;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  font-size: 18px;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

/* 第二行：目标路径 */
.target-path {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.path-label {
  font-size: 13px;
  color: #8e8e93;
  flex-shrink: 0;
}

.path-value {
  font-size: 13px;
  color: #007aff;
  font-weight: 500;
  word-break: break-all;
  flex: 1;
}

/* ========== 文件夹树 ========== */
.folder-tree-container {
  padding: 8px 0;
  max-height: 320px;
  overflow-y: auto;
}

.tree-header {
  padding: 6px 24px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #8e8e93;
  border-bottom: 1px solid #f5f5f5;
}

.tree-body {
  padding: 4px 0;
}

/* 根节点 */
.tree-node.root {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px;
  cursor: pointer;
  transition: background 0.15s;

}

.tree-node.root:hover {
  background: #f5f5f5;
}

.tree-node.root.selected {
  background: #e8f2ff;
}

.tree-node.root .node-icon {
  font-size: 16px;
}

.tree-node.root .node-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.tree-node.root .node-hint {
  font-size: 12px;
  color: #8e8e93;
  margin-left: auto;
}

/* 空状态 */
.tree-empty {
  padding: 30px 24px;
  text-align: center;
  color: #8e8e93;
  font-size: 14px;
}

/* ========== 错误信息 ========== */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 24px 16px;
  color: #f56c6c;
  font-size: 13px;
}

.error-icon {
  font-size: 16px;
}

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-footer .el-button {
  min-width: 72px;
}

.dialog-footer .el-button--primary {
  background: #007aff;
  border-color: #007aff;
}

.dialog-footer .el-button--primary:hover {
  background: #0066d9;
  border-color: #0066d9;
}

.dialog-footer .el-button--primary.is-disabled {
  background: #a0cfff;
  border-color: #a0cfff;
}

/* 滚动条美化 */
.folder-tree-container::-webkit-scrollbar {
  width: 4px;
}

.folder-tree-container::-webkit-scrollbar-track {
  background: transparent;
}

.folder-tree-container::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}

.folder-tree-container::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}
</style>