<template>
  <div class="folder-view">
    <div class="folder-header">
      <h2>
        <span v-if="currentFolder">{{ currentFolder.icon || '📁' }} {{ currentFolder.name }}</span>
        <span v-else>📁 全部笔记</span>
      </h2>
      <div class="folder-actions">
        <el-button type="primary" size="small" @click="createNote">
          <el-icon><Plus /></el-icon>
          新建笔记
        </el-button>
        <el-button size="small" @click="createSubFolder">
          <el-icon><FolderAdd /></el-icon>
          新建子文件夹
        </el-button>
      </div>
    </div>

    <!-- 子文件夹列表 -->
    <div v-if="subFolders.length > 0" class="sub-folders">
      <div
        v-for="folder in subFolders"
        :key="folder.id"
        class="folder-item"
        @click="goToFolder(folder.id)"
      >
        <span class="folder-icon">{{ folder.icon || '📁' }}</span>
        <span class="folder-name">{{ folder.name }}</span>
        <span class="folder-count">{{ folder.noteCount }} 篇笔记</span>
      </div>
    </div>

    <!-- 笔记列表 -->
    <div class="note-list-wrapper">
      <div class="list-toolbar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记..."
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
        />
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="list">列表</el-radio-button>
            <el-radio-button value="grid">网格</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 列表视图 -->
      <el-table
        v-if="viewMode === 'list'"
        v-loading="loading"
        :data="notes"
        style="width: 100%"
        @row-click="goToNote"
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
      </el-table>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="grid-view" v-loading="loading">
        <div
          v-for="note in notes"
          :key="note.id"
          class="grid-item"
          @click="goToNote(note)"
        >
          <div class="grid-item-header">
            <span class="grid-item-title">{{ note.title }}</span>
            <span v-if="note.isStarred" class="star">⭐</span>
          </div>
          <div class="grid-item-summary">{{ note.summary || note.contentPlain?.slice(0, 100) }}</div>
          <div class="grid-item-footer">
            <span class="grid-item-date">{{ formatDate(note.updatedAt) }}</span>
            <span class="grid-item-words">{{ note.wordCount }} 字</span>
          </div>
        </div>
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, FolderAdd } from '@element-plus/icons-vue'
import { useNoteStore } from '@/store/modules/note'
import { useFolderStore } from '@/store/modules/folder'
import { noteApi, folderApi } from '@/api'
import { formatDate } from '@/utils/date'

const router = useRouter()
const route = useRoute()
const noteStore = useNoteStore()
const folderStore = useFolderStore()

const folderId = computed(() => route.params.id as string || null)
const currentFolder = computed(() => folderStore.currentFolder)
const subFolders = ref<any[]>([])
const notes = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const searchKeyword = ref('')
const viewMode = ref<'list' | 'grid'>('list')
const currentPage = ref(1)
const pageSize = ref(20)
let searchTimer: any = null

async function loadFolderData() {
  // 加载子文件夹
  try {
    const result = await folderApi.getChildren(folderId.value)
    subFolders.value = result.items
  } catch {
    // 忽略
  }

  // 加载笔记
  await loadNotes()
}

async function loadNotes() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (folderId.value) {
      params.folderId = folderId.value
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const result = await noteApi.list(params)
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

function goToFolder(id: string) {
  router.push(`/folder/${id}`)
}

function goToNote(note: any) {
  router.push(`/note/${note.id}`)
}

function createNote() {
  router.push('/note/new')
}

function createSubFolder() {
  ElMessage.info('创建子文件夹功能')
}

watch(folderId, () => {
  // 切换文件夹时重新加载
  folderStore.setCurrentFolder(null)
  loadFolderData()
})

onMounted(() => {
  // 查找当前文件夹信息
  if (folderId.value) {
    const findFolder = (items: any[]): any => {
      for (const item of items) {
        if (item.id === folderId.value) return item
        if (item.children) {
          const found = findFolder(item.children)
          if (found) return found
        }
      }
      return null
    }
    const folder = findFolder(folderStore.tree)
    if (folder) {
      folderStore.setCurrentFolder(folder)
    }
  }
  loadFolderData()
})
</script>

<style scoped>
.folder-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.folder-header h2 {
  margin: 0;
  font-size: 22px;
}

.folder-actions {
  display: flex;
  gap: 8px;
}

.sub-folders {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.folder-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.folder-icon {
  font-size: 18px;
}

.folder-name {
  font-weight: 500;
}

.folder-count {
  font-size: 12px;
  color: #999;
}

.note-list-wrapper {
  background: white;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* 网格视图 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.grid-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.grid-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
  transform: translateY(-2px);
}

.grid-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.grid-item-title {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.grid-item-summary {
  font-size: 13px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.grid-item-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

:deep(.el-table__row) {
  cursor: pointer;
}
</style>