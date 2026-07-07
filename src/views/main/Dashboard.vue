<template>
  <div class="dashboard">
    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-button type="primary" @click="createNewNote">
        <el-icon><Plus /></el-icon>
        新建笔记
      </el-button>
      <el-button @click="openCreateFolder">
        <el-icon><FolderAdd /></el-icon>
        新建文件夹
      </el-button>
    </div>

    <!-- 笔记列表 -->
    <div class="note-list-wrapper">
      <div class="list-header">
        <span class="list-title">最近笔记</span>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记..."
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
        />
      </div>

      <el-table
        v-loading="loading"
        :data="notes"
        style="width: 100%"
        @row-click="handleNoteClick"
      >
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="note-title">
              <span v-if="row.isStarred" class="star">⭐</span>
              {{ row.title }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="wordCount" label="字数" width="80" align="center" />

        <el-table-column label="标签" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags?.slice(0, 2)"
              :key="tag.id"
              size="small"
              :color="tag.color"
              style="margin: 2px"
            >
              {{ tag.name }}
            </el-tag>
            <el-tag v-if="row.tags?.length > 2" size="small">+{{ row.tags.length - 2 }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              size="small"
              :type="row.isStarred ? 'warning' : 'default'"
              @click.stop="toggleStar(row)"
            >
              {{ row.isStarred ? '取消星标' : '星标' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadNotes"
          @current-change="loadNotes"
        />
      </div>
    </div>

    <!-- 新建文件夹对话框 -->
    <CreateFolderDialog
      v-model="showCreateFolder"
      @success="onFolderCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, FolderAdd } from '@element-plus/icons-vue'
import { useNoteStore } from '@/store/modules/note'
import { useFolderStore } from '@/store/modules/folder'
import { noteApi } from '@/api/note'
import { formatDate } from '@/utils/date'
// ✅ 导入新建文件夹对话框组件
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'

const router = useRouter()
const noteStore = useNoteStore()
const folderStore = useFolderStore()

const notes = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
let searchTimer: any = null

// ✅ 控制新建文件夹弹窗
const showCreateFolder = ref(false)

async function loadNotes() {
  loading.value = true
  try {
    const result = await noteApi.list({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
    })
    notes.value = result.items
    total.value = result.pagination.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadNotes()
  }, 500)
}

function handleNoteClick(row: any) {
  router.push(`/note/${row.id}`)
}

async function toggleStar(row: any) {
  try {
    const result = await noteApi.toggleStar(row.id, row.isStarred ? 0 : 1)
    row.isStarred = result.isStarred
    ElMessage.success(result.isStarred ? '已添加星标' : '已取消星标')
  } catch {
    // 错误已在拦截器中处理
  }
}

function createNewNote() {
  router.push('/note/new')
}

// ✅ 打开新建文件夹对话框
function openCreateFolder() {
  showCreateFolder.value = true
}

// ✅ 文件夹创建成功回调
async function onFolderCreated() {
  await folderStore.loadTree()
  ElMessage.success('文件夹创建成功')
}

onMounted(() => {
  loadNotes()
  folderStore.loadTree()
})

watch(searchKeyword, () => {
  handleSearch()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.note-list-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
}

.note-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star {
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}
</style>