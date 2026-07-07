<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="个人信息" name="profile">
        <el-form ref="formRef" :model="form" label-width="120px">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
            >
              <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
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

      <el-tab-pane label="偏好设置" name="preferences">
        <el-form label-width="140px">
          <el-form-item label="主题">
            <el-radio-group v-model="prefs.theme">
              <el-radio-button value="light">浅色</el-radio-button>
              <el-radio-button value="dark">深色</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="编辑器字号">
            <el-slider v-model="prefs.editorFontSize" :min="12" :max="24" show-input />
          </el-form-item>

          <el-form-item label="自动保存间隔">
            <el-select v-model="prefs.autoSaveInterval">
              <el-option label="30秒" :value="30" />
              <el-option label="1分钟" :value="60" />
              <el-option label="2分钟" :value="120" />
              <el-option label="5分钟" :value="300" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="savingPrefs" @click="handleSavePrefs">保存偏好</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="设备管理" name="devices">
        <el-table :data="devices" v-loading="loadingDevices">
          <el-table-column prop="deviceName" label="设备名称" />
          <el-table-column prop="deviceType" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.deviceType === 'web' ? 'primary' : 'success'" size="small">
                {{ row.deviceType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastUsedAt" label="最后使用" width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastUsedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="revokeDevice(row.deviceId)">下线</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button style="margin-top:16px" type="danger" @click="logoutAll">登出所有设备</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { authApi } from '@/api/auth'
import { formatDate } from '@/utils/date'

const userStore = useUserStore()
const activeTab = ref('profile')
const saving = ref(false)
const savingPrefs = ref(false)
const loadingDevices = ref(false)
const devices = ref<any[]>([])

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

const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/assets/upload'
const uploadHeaders = {
  Authorization: `Bearer ${userStore.accessToken}`,
}

function loadUser() {
  const user = userStore.userInfo
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

async function handleSave() {
  saving.value = true
  try {
    const updated = await authApi.updateMe({
      nickname: form.nickname,
      avatarUrl: form.avatarUrl,
    })
    userStore.userInfo = updated
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

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
  } finally {
    savingPrefs.value = false
  }
}

function handleAvatarSuccess(response: any) {
  form.avatarUrl = response.data.url
  ElMessage.success('头像上传成功')
}

async function loadDevices() {
  loadingDevices.value = true
  try {
    devices.value = await authApi.getDevices()
  } finally {
    loadingDevices.value = false
  }
}

async function revokeDevice(deviceId: string) {
  try {
    await authApi.revokeDevice(deviceId)
    ElMessage.success('设备已下线')
    loadDevices()
  } catch {
    // 忽略
  }
}

async function logoutAll() {
  try {
    await authApi.logoutAll()
    ElMessage.success('已登出所有设备')
    userStore.clearUser()
    window.location.href = '/login'
  } catch {
    // 忽略
  }
}

onMounted(() => {
  loadUser()
  loadDevices()
})
</script>

<style scoped>
.settings-page {
  padding: 24px;
  max-width: 800px;
}
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
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
}
</style>