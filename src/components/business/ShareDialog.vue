<template>
  <el-dialog v-model="visible" title="分享" width="500px" @close="handleClose">
    <el-form :model="form" label-width="100px">
      <el-form-item label="分享类型">
        <el-radio-group v-model="form.shareType">
          <el-radio-button value="public">公开</el-radio-button>
          <el-radio-button value="protected">密码保护</el-radio-button>
          <el-radio-button value="private">私有</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.shareType === 'protected'" label="访问密码">
        <el-input v-model="form.sharePassword" placeholder="设置访问密码" show-password />
      </el-form-item>

      <el-form-item label="有效期">
        <el-radio-group v-model="form.expireDays">
          <el-radio-button :value="0">永久</el-radio-button>
          <el-radio-button :value="7">7天</el-radio-button>
          <el-radio-button :value="30">30天</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="权限">
        <el-checkbox v-model="form.allowEdit">允许编辑</el-checkbox>
        <el-checkbox v-model="form.allowDownload">允许下载</el-checkbox>
        <el-checkbox v-model="form.allowComments">允许评论</el-checkbox>
      </el-form-item>

      <div v-if="shareUrl" class="share-result">
        <el-input v-model="shareUrl" readonly>
          <template #append>
            <el-button @click="copyLink">复制链接</el-button>
          </template>
        </el-input>
        <el-button type="primary" size="small" @click="openShare">打开分享</el-button>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleShare">创建分享</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { shareApi } from '@/api/share'

const props = defineProps<{
  modelValue: boolean
  targetId: string
  targetType: 'note' | 'folder'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const shareUrl = ref('')
const form = reactive({
  shareType: 'public',
  sharePassword: '',
  expireDays: 0,
  allowEdit: false,
  allowDownload: true,
  allowComments: true,
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

async function handleShare() {
  loading.value = true
  try {
    const result = await shareApi.create({
      targetId: props.targetId,
      targetType: props.targetType,
      shareType: form.shareType,
      sharePassword: form.sharePassword || undefined,
      expireDays: form.expireDays || undefined,
      allowEdit: form.allowEdit ? 1 : 0,
      allowDownload: form.allowDownload ? 1 : 0,
      allowComments: form.allowComments ? 1 : 0,
    })
    shareUrl.value = `${window.location.origin}/share/${result.shareToken}`
    ElMessage.success('分享创建成功')
  } finally {
    loading.value = false
  }
}

function copyLink() {
  navigator.clipboard?.writeText(shareUrl.value)
  ElMessage.success('链接已复制')
}

function openShare() {
  window.open(shareUrl.value, '_blank')
}

function handleClose() {
  shareUrl.value = ''
  visible.value = false
}
</script>

<style scoped>
.share-result {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>