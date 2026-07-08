<!-- src/components/FolderDialogs.vue -->
<template>
  <!-- 筛选对话框 -->
  <el-dialog v-model="filterVisible" title="高级筛选" width="420px">
    <el-form label-width="80px" size="small">
      <el-form-item label="笔记类型">
        <el-select v-model="localFilters.type" placeholder="全部类型" clearable style="width: 100%">
          <el-option value="note" label="富文本" />
          <el-option value="markdown" label="Markdown" />
          <el-option value="todo" label="待办清单" />
          <el-option value="mindmap" label="思维导图" />
        </el-select>
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="localFilters.tagId" placeholder="选择标签" clearable style="width: 100%">
          <el-option
            v-for="tag in tagList"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          >
            <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="包含">
        <el-checkbox-group v-model="localFilters.has">
          <el-checkbox value="image">图片</el-checkbox>
          <el-checkbox value="attachment">附件</el-checkbox>
          <el-checkbox value="table">表格</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="localFilters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="filterVisible = false">取消</el-button>
      <el-button @click="handleResetFilters">重置</el-button>
      <el-button type="primary" @click="handleApplyFilters">应用筛选</el-button>
    </template>
  </el-dialog>

  <!-- 重命名对话框 -->
  <el-dialog v-model="renameVisible" title="重命名" width="400px">
    <el-input 
      v-model="localRenameValue" 
      placeholder="请输入新名称" 
      @keyup.enter="handleConfirmRename" 
    />
    <template #footer>
      <el-button @click="renameVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmRename">确认</el-button>
    </template>
  </el-dialog>

  <!-- 移动对话框 -->
  <el-dialog v-model="moveVisible" title="移动到" width="400px">
    <el-tree-select
      v-model="localMoveTargetId"
      :data="folderTree"
      :props="{ label: 'name', value: 'id', children: 'children' }"
      placeholder="选择目标文件夹"
      clearable
      check-strictly
      style="width: 100%"
    />
    <div v-if="moveSourceType === 'folder'" style="font-size: 12px; color: #999; margin-top: 8px;">
      提示：不能移动到自身或子文件夹
    </div>
    <template #footer>
      <el-button @click="moveVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirmMove">确认移动</el-button>
    </template>
  </el-dialog>

  <!-- 分享对话框 -->
  <ShareDialog
    v-model="shareVisible"
    :target-id="shareTargetId"
    :target-type="shareTargetType"
    @success="handleShareSuccess"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareDialog from '@/components/business/ShareDialog.vue'

const props = defineProps<{
  showFilter: boolean
  showRename: boolean
  showMove: boolean
  showShare: boolean
  renameValue: string
  moveTargetId: string | null
  filters: any
  tagList: any[]
  folderTree: any[]
  moveSourceType: 'folder' | 'note'
  renameTargetType: 'folder' | 'note'
  shareTargetId: string
  shareTargetType: 'folder' | 'note'
}>()

const emit = defineEmits<{
  (e: 'update:showFilter', value: boolean): void
  (e: 'update:showRename', value: boolean): void
  (e: 'update:showMove', value: boolean): void
  (e: 'update:showShare', value: boolean): void
  (e: 'update:renameValue', value: string): void
  (e: 'update:moveTargetId', value: string | null): void
  (e: 'applyFilters'): void
  (e: 'resetFilters'): void
  (e: 'confirmRename'): void
  (e: 'confirmMove'): void
  (e: 'shareSuccess'): void
}>()

// ============================================================
// 使用 computed 包装所有 v-model 绑定的 props
// ============================================================

// 筛选对话框
const filterVisible = computed({
  get: () => props.showFilter,
  set: (val) => emit('update:showFilter', val)
})

const localFilters = computed({
  get: () => props.filters,
  set: (val) => {
    // 由于 filters 是对象，我们需要触发更新
    // 这里通过 emit 通知父组件更新
    emit('applyFilters')
  }
})

// 重命名对话框
const renameVisible = computed({
  get: () => props.showRename,
  set: (val) => emit('update:showRename', val)
})

const localRenameValue = computed({
  get: () => props.renameValue,
  set: (val) => emit('update:renameValue', val)
})

// 移动对话框
const moveVisible = computed({
  get: () => props.showMove,
  set: (val) => emit('update:showMove', val)
})

const localMoveTargetId = computed({
  get: () => props.moveTargetId,
  set: (val) => emit('update:moveTargetId', val)
})

// 分享对话框
const shareVisible = computed({
  get: () => props.showShare,
  set: (val) => emit('update:showShare', val)
})

// ============================================================
// 事件处理
// ============================================================

function handleApplyFilters() {
  emit('applyFilters')
  filterVisible.value = false
}

function handleResetFilters() {
  emit('resetFilters')
  filterVisible.value = false
}

function handleConfirmRename() {
  emit('confirmRename')
}

function handleConfirmMove() {
  emit('confirmMove')
}

function handleShareSuccess() {
  emit('shareSuccess')
}
</script>