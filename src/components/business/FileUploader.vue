<template>
  <div class="file-uploader">
    <el-upload
      ref="uploadRef"
      drag
      multiple
      :auto-upload="false"
      :file-list="fileList"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处，或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 jpg/png/gif/webp，单个文件不超过 10MB
        </div>
      </template>
    </el-upload>

    <div class="upload-actions">
      <el-button :loading="uploading" type="primary" @click="handleUpload">
        上传到笔记
      </el-button>
    </div>

    <div v-if="uploadedUrls.length > 0" class="uploaded-urls">
      <el-tag
        v-for="(url, idx) in uploadedUrls"
        :key="idx"
        closable
        @close="removeUploaded(idx)"
      >
        {{ url }}
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { assetApi } from '@/api/asset'

const emit = defineEmits<{
  (e: 'uploaded', urls: string[]): void
}>()

const fileList = ref<any[]>([])
const uploading = ref(false)
const uploadedUrls = ref<string[]>([])

function handleChange(file: any) {
  fileList.value.push(file)
}

function handleRemove(file: any) {
  fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

async function handleUpload() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }
  uploading.value = true
  try {
    const formData = new FormData()
    for (const file of fileList.value) {
      formData.append('files', file.raw)
    }
    const result = await assetApi.batchUpload(formData)
    uploadedUrls.value = result.map((item: any) => item.url)
    emit('uploaded', uploadedUrls.value)
    ElMessage.success(`成功上传 ${result.length} 个文件`)
    fileList.value = []
  } finally {
    uploading.value = false
  }
}

function removeUploaded(idx: number) {
  uploadedUrls.value.splice(idx, 1)
}
</script>

<style scoped>
.file-uploader {
  padding: 16px;
}
.upload-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}
.uploaded-urls {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>