<!-- src/components/note/NoteTagDialog.vue -->
<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="添加标签" 
    width="380px"
  >
    <el-checkbox-group v-model="localSelectedTagIds">
      <el-checkbox v-for="tag in allTags" :key="tag.id" :label="tag.id">
        <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
      </el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认添加</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  selectedTagIds: string[]
  allTags: any[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'update:selectedTagIds', value: string[]): void
  (e: 'confirm'): void
}>()

// ✅ 使用 computed 包装 visible
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// ✅ 使用 computed 包装 selectedTagIds
const localSelectedTagIds = computed({
  get: () => props.selectedTagIds,
  set: (val) => emit('update:selectedTagIds', val)
})

function handleConfirm() {
  emit('confirm')
}
</script>