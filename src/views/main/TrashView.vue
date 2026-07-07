<template>
  <div class="trash-view">
    <div class="trash-header">
      <h2>🗑️ 回收站</h2>
      <div class="trash-actions">
        <el-button size="small" type="danger" @click="emptyTrash">清空回收站</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="items"
      style="width: 100%"
    >
      <el-table-column prop="title" label="名称" min-width="200">
        <template #default="{ row }">
          <span>{{ row.title || row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="deletedAt" label="删除时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.deletedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row._type === 'note' ? 'primary' : 'warning'" size="small">
            {{ row._type === 'note' ? '笔记' : '文件夹' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="restoreItem(row)">恢复</el-button>
          <el-button size="small" type="danger" @click="permanentDelete(row)">永久删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { noteApi, folderApi } from '@/api'
import { formatDate } from '@/utils/date'

const loading = ref(false)
const items = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

async function loadItems() {
  loading.value = true
  try {
    const [notes, folders] = await Promise.all([
      noteApi.getDeleted({ page: currentPage.value, pageSize: pageSize.value }),
      folderApi.getDeleted(),
    ])
    // 合并并标记类型
    const noteItems = notes.items.map((n: any) => ({ ...n, _type: 'note' }))
    const folderItems = folders.map((f: any) => ({ ...f, _type: 'folder' }))
    items.value = [...noteItems, ...folderItems]
    total.value = notes.pagination.total + folders.length
  } finally {
    loading.value = false
  }
}

async function restoreItem(row: any) {
  try {
    if (row._type === 'note') {
      await noteApi.restore(row.id)
    } else {
      await folderApi.restore(row.id)
    }
    ElMessage.success('恢复成功')
    loadItems()
  } catch {
    // 错误已在拦截器处理
  }
}

async function permanentDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要永久删除吗？此操作不可恢复！', '警告', {
      type: 'error',
    })
    if (row._type === 'note') {
      await noteApi.permanentDelete(row.id)
    } else {
      await folderApi.permanentDelete(row.id)
    }
    ElMessage.success('已永久删除')
    loadItems()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

async function emptyTrash() {
  try {
    await ElMessageBox.confirm('确定要清空回收站吗？所有项目将被永久删除！', '警告', {
      type: 'error',
    })
    // 遍历所有项目删除
    for (const item of items.value) {
      if (item._type === 'note') {
        await noteApi.permanentDelete(item.id)
      } else {
        await folderApi.permanentDelete(item.id)
      }
    }
    ElMessage.success('回收站已清空')
    loadItems()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

onMounted(loadItems)
</script>

<style scoped>
.trash-view {
  padding: 20px;
}
.trash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>