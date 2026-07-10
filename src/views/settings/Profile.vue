<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人信息" name="profile">
        <el-form ref="formRef" :model="form" label-width="120px">
          <el-form-item label="头像">
            <div class="avatar-container">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                :disabled="uploading"
              >
                <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              
              <!-- 上传进度 -->
              <div v-if="uploading" class="upload-progress">
                <el-progress 
                  type="circle" 
                  :percentage="uploadProgress" 
                  :width="100"
                  :stroke-width="6"
                />
                <span class="progress-text">上传中...</span>
              </div>
              
              <!-- 操作按钮 -->
              <div v-if="form.avatarUrl" class="avatar-actions">               
                <el-button                   
                  size="small" 
                  type="danger" 
                  :disabled="uploading"
                  @click="handleRemoveAvatar"
                >
                  移除头像
                </el-button>
              </div>
              <div v-else class="avatar-actions">
                <el-button 
                  size="small" 
                  type="primary" 
                  :loading="uploading"
                  @click="triggerUpload"
                >
                  上传头像
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="用户名">
            <el-input v-model="form.username" disabled />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input v-model="form.email" disabled />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 其他标签页保持不变 -->
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed,watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { authApi } from '@/api/auth'
import { assetApi } from '@/api/asset'

const userStore = useUserStore()
const activeTab = ref('profile')
const saving = ref(false)
const savingPrefs = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

const form = reactive({
  username: '',
  email: '',
  nickname: '',
  avatarUrl: '',
})

const prefs = reactive({
  theme: 'light',
  editorFontSize: 16,
  autoSaveInterval: 30,
})

// 计算属性：是否显示头像
const hasAvatar = computed(() => !!form.avatarUrl)

// 触发文件上传
const triggerUpload = () => {
  // 创建隐藏的 file input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      beforeAvatarUpload(file)
    }
    // 清理
    target.value = ''
  }
  input.click()
}

/**
 * 头像上传前验证
 */
const beforeAvatarUpload = (file: File): boolean => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }

  // 验证文件大小（限制 2MB）
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB！')
    return false
  }

  // 验证图片尺寸（建议 200x200 以上）
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      if (img.width < 200 || img.height < 200) {
        ElMessage.warning('建议使用 200x200 像素以上的图片')
      }
      // 开始上传
      handleAvatarUpload({ file })
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)

  return false // 阻止自动上传
}

/**
 * 自定义上传函数
 */
const handleAvatarUpload = async ({ file }: { file: File }) => {
  uploading.value = true
  uploadProgress.value = 0

  try {
    // 压缩图片（可选）
    const compressedFile = await compressImage(file, 200, 200, 0.8)
    
    // 上传到服务器
    const result = await assetApi.uploadFile(compressedFile, "avatar")
    // 更新头像URL
    form.avatarUrl = result.url
    
    // 自动保存
    await handleSave()
    
    ElMessage.success('头像上传成功！')
    
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

/**
 * 移除头像
 */
const handleRemoveAvatar = async () => {
  try {
    await ElMessageBox.confirm('确定要移除头像吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 删除头像
   // await authApi.deleteAvatar()
    form.avatarUrl = ''
    await handleSave()
    
    ElMessage.success('头像已移除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除头像失败:', error)
      ElMessage.error('移除头像失败')
    }
  }
}

/**
 * 压缩图片
 */
const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 计算压缩尺寸
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width
          height = maxHeight
        }

        // 绘制到 Canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name,
                { type: 'image/webp' }
              )
              resolve(compressedFile)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 加载用户信息
 */
function loadUser() {
  const user = userStore.userInfo
  console.log('loadUser:', user)
  if (user) {
    form.username = user.username
    form.email = user.email
    form.nickname = user.nickname || ''
    form.avatarUrl = user.avatarUrl || ''
    if (user.preferences) {
      prefs.theme = user.preferences.theme || 'light'
      prefs.editorFontSize = user.preferences.editorFontSize || 16
      prefs.autoSaveInterval = user.preferences.autoSaveInterval || 30
    }
  }
}

/**
 * 保存个人信息
 */
async function handleSave() {
  saving.value = true
  try {
    const updated = await authApi.updateMe({
      nickname: form.nickname,
      avatarUrl: form.avatarUrl,
    })
    userStore.updateUserInfo(updated)
    //.userInfo = updated
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 保存偏好设置
 */
async function handleSavePrefs() {
  savingPrefs.value = true
  try {
    const updated = await authApi.updateMe({
      preferences: {
        theme: prefs.theme,
        editorFontSize: prefs.editorFontSize,
        autoSaveInterval: prefs.autoSaveInterval,
      },
    })
    userStore.userInfo = updated
    ElMessage.success('偏好已保存')
  } catch (error) {
    console.error('保存偏好失败:', error)
    ElMessage.error('保存偏好失败，请重试')
  } finally {
    savingPrefs.value = false
  }
}

// 其他方法保持不变...
// 监听 userStore.userInfo 的变化
watch(
  () => userStore.userInfo,
  (newUser) => {
    console.log('userInfo 变化:', newUser)
    if (newUser) {
     loadUser()
    }
  },
  { immediate: true, deep: true }
)

// 在组件挂载时加载
onMounted(() => {
  // 如果 store 中已有数据，直接使用
  if (userStore.userInfo) {
   loadUser()
  } 
})

</script>

<style scoped>
.settings-page {
  padding: 24px;
  max-width: 800px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.avatar-uploader {
  position: relative;
  width: 100px;
  height: 100px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.avatar-uploader .avatar:hover {
  border-color: #409EFF;
  box-shadow: 0 0 12px rgba(64, 158, 255, 0.3);
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-uploader .avatar-uploader-icon:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.upload-progress :deep(.el-progress__text) {
  color: white !important;
}

.progress-text {
  color: white;
  font-size: 12px;
  margin-top: 4px;
}

.avatar-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 暗色主题适配 */
:global(.dark) .avatar-uploader .avatar {
  border-color: #4a4a4a;
}

:global(.dark) .avatar-uploader .avatar-uploader-icon {
  border-color: #4a4a4a;
  color: #8c939d;
}

:global(.dark) .upload-progress {
  background: rgba(0, 0, 0, 0.8);
}
</style>