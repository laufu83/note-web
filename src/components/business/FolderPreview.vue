<!-- src/components/business/FolderPreview.vue -->

<template>
  <div class="folder-preview" v-loading="loading">
    <div class="preview-header">
      <h2 class="preview-title">📁 {{ folder?.name || '文件夹' }}</h2>
      <div class="preview-meta">
        <span>{{ folder?.noteCount || 0 }} 篇笔记</span>
        <span>创建于 {{ formatDate(folder?.createdAt) }}</span>
      </div>
    </div>
    <div class="preview-content">
      <el-empty description="点击左侧文件查看详情" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { folderApi } from '@/api/folder'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  folderId?: string | null
}>()

const loading = ref(false)
const folder = ref<any>(null)

async function loadFolder() {
  if (!props.folderId) {
    folder.value = null
    return
  }
  loading.value = true
  try {
    folder.value = await folderApi.getById(props.folderId)
  } catch {
    folder.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.folderId, loadFolder, { immediate: true })
</script>

<style scoped>
.folder-preview {
  height: 100%;
  padding: 20px 24px;
  background: #ffffff;
  overflow-y: auto;
}

.preview-header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.preview-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 8px;
}

.preview-meta {
  font-size: 13px;
  color: #8e8e93;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60%;
}
</style>