<template>
  <div class="system-config">
    <div class="page-header">
      <h2>⚙️ 系统配置</h2>
      <el-button type="primary" @click="addConfig">新增配置</el-button>
    </div>

    <el-tabs v-model="activeGroup" @tab-change="loadConfigs">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="安全" name="security" />
      <el-tab-pane label="存储" name="storage" />
      <el-tab-pane label="系统" name="system" />
    </el-tabs>

    <el-table v-loading="loading" :data="configs" style="width: 100%">
      <el-table-column prop="configKey" label="配置键" min-width="200" />
      <el-table-column prop="configValue" label="配置值" min-width="200">
        <template #default="{ row }">
          <span v-if="row.isEncrypted">🔒 ******</span>
          <span v-else>{{ row.configValue }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="configGroup" label="分组" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ row.configGroup }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="150" />
      <el-table-column prop="updatedAt" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="editConfig(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteConfig(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/新增配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑配置' : '新增配置'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="form.configKey" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="分组" prop="configGroup">
          <el-select v-model="form.configGroup" style="width: 100%">
            <el-option value="security" label="安全" />
            <el-option value="storage" label="存储" />
            <el-option value="system" label="系统" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="加密存储">
          <el-switch v-model="form.isEncrypted" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'
import { formatDate } from '@/utils/date'

const loading = ref(false)
const configs = ref<any[]>([])
const activeGroup = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const form = ref({
  configKey: '',
  configValue: '',
  configGroup: 'system',
  description: '',
  isEncrypted: false,
})

async function loadConfigs() {
  loading.value = true
  try {
    const params = activeGroup.value ? { group: activeGroup.value } : {}
    configs.value = await adminApi.getConfigs(params)
  } finally {
    loading.value = false
  }
}

function addConfig() {
  isEdit.value = false
  form.value = {
    configKey: '',
    configValue: '',
    configGroup: 'system',
    description: '',
    isEncrypted: false,
  }
  dialogVisible.value = true
}

function editConfig(row: any) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function saveConfig() {
  if (!form.value.configKey || !form.value.configValue) {
    ElMessage.warning('配置键和值不能为空')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await adminApi.updateConfig(form.value.configKey, {
        value: form.value.configValue,
        configGroup: form.value.configGroup,
        description: form.value.description,
        isEncrypted: form.value.isEncrypted,
      })
      ElMessage.success('配置更新成功')
    } else {
      await adminApi.createConfig(form.value)
      ElMessage.success('配置创建成功')
    }
    dialogVisible.value = false
    loadConfigs()
  } finally {
    saving.value = false
  }
}

async function deleteConfig(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除配置 "${row.configKey}" 吗？`, '警告', { type: 'warning' })
    await adminApi.deleteConfig(row.configKey)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

onMounted(loadConfigs)
</script>

<style scoped>
.system-config {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>