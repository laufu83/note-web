<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑文件夹' : '新建文件夹'"
    width="420px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="submitForm"
    >
      <!-- 父文件夹选择 -->
      <el-form-item label="位置" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="folderTree"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          placeholder="选择父文件夹（可选）"
          clearable
          check-strictly
          style="width: 100%"
          filterable
        >
          <template #default="{ data }">
            <span>{{ data.icon || '📁' }} {{ data.name }}</span>
          </template>
        </el-tree-select>
      </el-form-item>

      <!-- 文件夹名称 -->
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入文件夹名称"
          maxlength="200"
          show-word-limit
          @keyup.enter="submitForm"
        >
          <template #prepend>
            <el-select v-model="form.icon" style="width: 60px">
              <el-option value="📁" label="📁" />
              <el-option value="📂" label="📂" />
              <el-option value="💼" label="💼" />
              <el-option value="📚" label="📚" />
              <el-option value="🏠" label="🏠" />
              <el-option value="💡" label="💡" />
              <el-option value="🚀" label="🚀" />
              <el-option value="⭐" label="⭐" />
              <el-option value="🎯" label="🎯" />
              <el-option value="📝" label="📝" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>

      <!-- 颜色选择 -->
      <el-form-item label="颜色" prop="color">
        <div class="color-picker-wrapper">
          <el-color-picker
            v-model="form.color"
            show-alpha
            :predefine="predefineColors"
            size="default"
          />
          <span class="color-tip">选填，用于区分文件夹</span>
        </div>
      </el-form-item>

      <!-- 是否在当前文件夹下创建 -->
      <el-form-item v-if="currentFolderId" label="快捷操作">
        <el-checkbox v-model="form.useCurrentParent">
          在当前文件夹下创建
        </el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submitForm"
      >
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useFolderStore } from '@/store/modules/folder'
import { folderApi } from '@/api/folder'

const props = defineProps<{
  modelValue: boolean
  editData?: {
    id: string
    name: string
    icon?: string
    color?: string
    parentId?: string | null
  } | null
  parentId?: string | null
  currentFolderId?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const folderStore = useFolderStore()
const formRef = ref()
const submitting = ref(false)

// 预定义颜色
const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#9B59B6',
  '#3498DB',
  '#1ABC9C',
  '#E74C3C',
  '#F39C12',
  '#2ECC71',
  '#95A5A6',
]

const isEdit = computed(() => !!props.editData)

// 表单数据
const form = reactive({
  name: '',
  icon: '📁',
  color: '',
  parentId: null as string | null,
  useCurrentParent: false,
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入文件夹名称', trigger: 'blur' },
    { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' },
  ],
}

// 文件夹树（用于选择父文件夹）
const folderTree = computed(() => {
  // 过滤掉当前编辑的文件夹（防止选择自己作为父级）
  const filterSelf = (nodes: any[]): any[] => {
    if (!props.editData) return nodes
    return nodes
      .filter(node => node.id !== props.editData?.id)
      .map(node => ({
        ...node,
        children: node.children ? filterSelf(node.children) : [],
      }))
  }
  return filterSelf(folderStore.tree)
})

// 可见性控制
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 监听弹窗打开
watch(visible, (val) => {
  if (val) {
    resetForm()
  }
})

// 重置表单
function resetForm() {
  if (props.editData) {
    // 编辑模式
    form.name = props.editData.name
    form.icon = props.editData.icon || '📁'
    form.color = props.editData.color || ''
    form.parentId = props.editData.parentId || null
    form.useCurrentParent = false
  } else {
    // 新建模式
    form.name = ''
    form.icon = '📁'
    form.color = ''
    form.parentId = props.parentId || props.currentFolderId || null
    form.useCurrentParent = false
  }

  // 如果设置了当前文件夹，自动勾选
  if (props.currentFolderId && !props.editData) {
    form.useCurrentParent = true
    form.parentId = props.currentFolderId
  }

  formRef.value?.clearValidate()
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data = {
      name: form.name,
      icon: form.icon,
      color: form.color || undefined,
      parentId: form.parentId || null,
    }

    if (isEdit.value && props.editData) {
      await folderApi.update(props.editData.id, data)
      ElMessage.success('文件夹更新成功')
    } else {
      await folderApi.create(data)
      ElMessage.success('文件夹创建成功')
    }

    // 刷新文件夹树
    await folderStore.loadTree()

    emit('success')
    visible.value = false
  } catch (error) {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
function handleClose() {
  visible.value = false
  formRef.value?.resetFields()
}

// 暴露重置方法
defineExpose({
  resetForm,
})
</script>

<style scoped>
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-tip {
  font-size: 12px;
  color: #909399;
}

:deep(.el-tree-select .el-input__wrapper) {
  display: flex;
  flex-wrap: wrap;
}
</style>