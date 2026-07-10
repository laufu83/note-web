<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="page-actions">
        <el-button size="small" @click="openCreateFolder">
          <el-icon><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button type="primary" size="small" @click="createNewNote">
          <el-icon><Plus /></el-icon>
          新建笔记
        </el-button>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <!-- 列表项 -->
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="resource-item"
        @click="handleItemClick(item)"
      >
        <div class="item-icon">
          <span v-if="item._type === 'folder'">📁</span>
          <span v-else-if="item.isStarred">⭐</span>
          <span v-else>📄</span>
        </div>
        <div class="item-content">
          <div class="item-title">{{ item.title || item.name }}</div>
          <div class="item-meta">
            <span v-if="item._type === 'folder'" class="meta-tag">文件夹</span>
            <span v-else-if="item.tags" class="meta-tags">
              <span v-for="tag in item.tags.slice(0, 2)" :key="tag.id" class="tag">
                #{{ tag.name }}
              </span>
            </span>
            <span class="meta-date">{{ formatDate(item.updatedAt || item.createdAt) }}</span>
            <span v-if="item.wordCount" class="meta-size">{{ item.wordCount }} 字</span>
          </div>
        </div>
        <div class="item-actions">
          <el-dropdown trigger="click" @command="(cmd:string) => handleItemCommand(cmd, item)">
            <el-button size="small" text>
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                <el-dropdown-item command="move">移动</el-dropdown-item>
                <el-dropdown-item v-if="item._type === 'note'" command="star">
                  {{ item.isStarred ? '取消星标' : '星标' }}
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="displayItems.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无内容">
          <el-button type="primary" @click="createNewNote">新建笔记</el-button>
        </el-empty>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadNotes"
      />
    </div>

    <!-- 新建文件夹对话框 -->
    <CreateFolderDialog v-model="showCreateFolder" @success="onFolderCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, FolderAdd, MoreFilled } from '@element-plus/icons-vue'
import { useNoteStore } from '@/store/modules/note'
import { useFolderStore } from '@/store/modules/folder'
import { noteApi, folderApi } from '@/api'
import { formatDate } from '@/utils/date'
import CreateFolderDialog from '@/components/business/CreateFolderDialog.vue'

const router = useRouter()
const noteStore = useNoteStore()
const folderStore = useFolderStore()

const props = defineProps<{
  filter?: 'starred' | 'archived' | 'trash'
}>()

const loading = ref(false)
const notes = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showCreateFolder = ref(false)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    starred: '⭐ 加星笔记',
    archived: '📦 归档笔记',
    trash: '🗑️ 回收站',
  }
  return titles[props.filter || ''] || '📄 全部笔记'
})

const displayItems = computed(() => {
  // 在文件夹视图显示文件夹 + 笔记
  if (router.currentRoute.value.path.startsWith('/folder')) {
    const folderItems = folderStore.tree.map(f => ({ ...f, _type: 'folder' }))
    return [...folderItems, ...notes.value]
  }
  return notes.value
})

async function loadNotes() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }

    if (props.filter === 'starred') params.isStarred = 1
    if (props.filter === 'archived') params.isArchived = 1
    if (props.filter === 'trash') {
      // 回收站特殊处理
      const result = await noteApi.getDeleted({
        page: currentPage.value,
        pageSize: pageSize.value,
      })
      notes.value = result.items
      total.value = result.pagination.total
      return
    }

    const result = await noteApi.list(params)
    notes.value = result.items
    total.value = result.pagination.total
  } finally {
    loading.value = false
  }
}

function createNewNote() {
  router.push('/note/new')
}

function openCreateFolder() {
  showCreateFolder.value = true
}

async function onFolderCreated() {
  await folderStore.loadTree()
  ElMessage.success('文件夹创建成功')
}

function handleItemClick(item: any) {
  if (item._type === 'folder') {
    router.push(`/folder/${item.id}`)
  } else {
    router.push(`/note/${item.id}`)
  }
}

function handleItemCommand(command: string, item: any) {
  switch (command) {
    case 'delete':
      ElMessage.info('删除功能')
      break
    case 'star':
      ElMessage.info('星标功能')
      break
    default:
      ElMessage.info(`${command} 功能`)
  }
}

onMounted(() => {
  loadNotes()
})
</script>

<style scoped>
.dashboard {
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  gap: 12px;
  border: 1px solid transparent;
}

.resource-item:hover {
  background: #f5f5f7;
  border-color: #e8e8e8;
}

.item-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #8e8e93;
  margin-top: 2px;
}

.meta-tag {
  background: #f0f0f0;
  padding: 0 8px;
  border-radius: 3px;
  font-size: 11px;
}

.meta-tags {
  display: flex;
  gap: 4px;
}

.tag {
  color: #6e6e73;
}

.meta-date {
  color: #8e8e93;
}

.meta-size {
  color: #8e8e93;
}

.item-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.resource-item:hover .item-actions {
  opacity: 1;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.loading-state {
  padding: 20px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>