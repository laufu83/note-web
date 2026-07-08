<!-- src/components/business/RenameFolderDialog.vue -->

<template>
  <el-dialog
    v-model="dialogVisible"
    title="重命名文件夹"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="rename-content">
      <!-- 当前文件夹信息 -->
      <div class="folder-info">
        <span class="info-icon">📁</span>
        <div class="info-detail">
          <div class="info-label">当前名称</div>
          <div class="info-value">{{ folder?.name }}</div>
        </div>
      </div>

      <!-- 新名称输入 -->
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="新名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入新文件夹名称"
            maxlength="50"
            show-word-limit
            clearable
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
      </el-form>

      <div v-if="folder" class="path-info">
        <span class="path-label">路径：</span>
        <span class="path-value">{{ getFolderPath(folder.id) }}</span>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button 
        type="primary" 
        :loading="loading" 
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useFolderStore } from '@/store/modules/folder'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  folder: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const folderStore = useFolderStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  name: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1-50 个字符', trigger: 'blur' },
    { 
      pattern: /^[^\\/:*?"<>|]+$/, 
      message: '名称不能包含特殊字符 \\ / : * ? " < > |', 
      trigger: 'blur' 
    }
  ]
}

// 获取文件夹路径
const getFolderPath = (folderId: string): string => {
  // 简单实现：从树中查找路径
  const findPath = (folders: any[], id: string, path: string[] = []): string[] | null => {
    for (const f of folders) {
      const currentPath = [...path, f.name]
      if (f.id === id) {
        return currentPath
      }
      if (f.children) {
        const result = findPath(f.children, id, currentPath)
        if (result) return result
      }
    }
    return null
  }
  
  const path = findPath(folderStore.tree, folderId)
  return path ? path.join(' / ') : ''
}

// 监听打开，初始化表单
watch(() => props.modelValue, (val) => {
  if (val && props.folder) {
    form.value.name = props.folder.name
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})

const handleClose = () => {
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value || !props.folder) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 检查名称是否变化
    if (form.value.name === props.folder.name) {
      dialogVisible.value = false
      return
    }
    
    loading.value = true
    try {
      // 使用 updateFolder 方法
      await folderStore.updateFolder(props.folder.id, { name: form.value.name })
      emit('success')
      dialogVisible.value = false
      ElMessage.success('重命名成功')
    } catch (error: any) {
      ElMessage.error(error.message || '重命名失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.rename-content {
  padding: 4px 0;
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f7f6f3;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-icon {
  font-size: 24px;
}

.info-detail {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #8e8e93;
  margin-bottom: 2px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.path-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 13px;
}

.path-label {
  color: #8e8e93;
}

.path-value {
  color: #1d1d1f;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-input) {
  --el-input-focus-border-color: #007aff;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}
</style>