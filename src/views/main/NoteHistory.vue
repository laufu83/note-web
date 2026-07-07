<template>
  <el-dialog v-model="visible" title="历史版本" width="700px">
    <el-table :data="versions" v-loading="loading" style="width: 100%">
      <el-table-column prop="versionNumber" label="版本" width="80" align="center" />
      <el-table-column prop="changeSummary" label="变更摘要" min-width="150" />
      <el-table-column prop="changeType" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTagType(row.changeType)" size="small">
            {{ row.changeType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="restoreVersion(row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadHistory"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi } from '@/api/note'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  modelValue: boolean
  noteId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'restored'): void
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const versions = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

watch(visible, (val) => emit('update:modelValue', val))
watch(() => props.modelValue, (val) => { visible.value = val })

watch(visible, (val) => {
  if (val) loadHistory()
})

async function loadHistory() {
  loading.value = true
  try {
    const result = await noteApi.getHistory(props.noteId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    versions.value = result.items
    total.value = result.pagination.total
  } finally {
    loading.value = false
  }
}

function getTagType(type: string) {
  const map: Record<string, string> = {
    create: 'success',
    edit: 'primary',
    restore: 'warning',
    delete: 'danger',
  }
  return map[type] || 'info'
}

async function restoreVersion(row: any) {
  try {
    await ElMessageBox.confirm(`确定要恢复到版本 ${row.versionNumber} 吗？`, '确认恢复', {
      type: 'warning',
    })
    await noteApi.restoreVersion(props.noteId, row.versionNumber)
    ElMessage.success('版本恢复成功')
    emit('restored')
    visible.value = false
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>