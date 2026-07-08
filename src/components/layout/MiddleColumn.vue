<!-- src/components/layout/MiddleColumn.vue -->

<template>
  <div class="middle-column">
    <!-- 第一行：搜索框 + 右侧菜单图标按钮 -->
    <div class="search-bar-wrap">
      <div class="column-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索笔记 Ctrl+Shift+F"
          size="small"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          class="search-input"
        />
      </div>
      <!-- 右侧三横线菜单按钮 -->
      <el-dropdown trigger="click" popper-append-to-body>
        <el-button text class="menu-icon-btn">
          <el-icon size="20"><Menu /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="parent-main-menu">
            <el-dropdown trigger="hover" split-button class="view-sub-dropdown">
              <template #default>
                <el-dropdown-item class="menu-main-item">
                  列表展示
                  <el-icon class="item-right-arrow"><ArrowRight /></el-icon>
                </el-dropdown-item>
              </template>
              <template #dropdown>
                <el-dropdown-menu class="view-sub-menu">
                  <el-dropdown-item command="preview" :class="{ active: viewMode === 'preview' }">摘要</el-dropdown-item>
                  <el-dropdown-item command="list" :class="{ active: viewMode === 'list' }">列表</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown trigger="hover" split-button class="sort-sub-dropdown">
              <template #default>
                <el-dropdown-item class="menu-main-item">
                  排序方式
                  <el-icon class="item-right-arrow"><ArrowRight /></el-icon>
                </el-dropdown-item>
              </template>
              <template #dropdown>
                <el-dropdown-menu class="sort-sub-menu">
                  <el-dropdown-item
                    v-for="item in sortOptions"
                    :key="item.value"
                    :command="item.value"
                    :class="{ active: sortBy === item.value }"
                    @click="handleSortChange(item.value)"
                  >
                    {{ item.label }}
                    <el-icon v-if="sortBy === item.value" class="sort-arrow"><ArrowDown /></el-icon>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 第二行：文件夹头部栏 -->
    <div class="column-header">
      <div class="header-left">
        <!-- 返回按钮 -->
        <el-button
          v-if="showBackButton"
          size="small"
          text
          @click="goBack"
          class="back-btn"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>

        <span class="header-icon">{{ currentIcon }}</span>
        <span class="header-title">{{ currentTitle }}</span>
        <span class="header-count">{{ total }}</span>
      </div>
    </div>

    <!-- 笔记/文件夹列表区域 -->
    <div class="column-list" v-loading="loading">
      <div v-if="refreshing" class="refresh-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        刷新中...
      </div>

      <!-- 文件夹列表 -->
      <div
        v-if="showFolders"
        v-for="folder in folders"
        :key="folder.id"
        class="list-item folder-item"
        @click="goToFolder(folder.id)"
      >
        <span class="item-icon">📁</span>
        <div class="item-info">
          <div class="item-title">{{ folder.name }}</div>
          <div class="item-meta">{{ folder.noteCount || 0 }} 篇笔记</div>
        </div>
        <el-dropdown trigger="click" @command="(cmd: string) => handleFolderAction(cmd, folder)" @click.stop>
          <el-button size="small" text class="more-btn">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="open">📂 打开</el-dropdown-item>
              <el-dropdown-item divided command="rename">✏️ 重命名</el-dropdown-item>
              <el-dropdown-item command="move">📤 移动到</el-dropdown-item>
              <el-dropdown-item command="copy">📋 复制</el-dropdown-item>
              <el-dropdown-item command="share">🔗 分享</el-dropdown-item>
              <el-dropdown-item command="export">📥 导出</el-dropdown-item>
              <el-dropdown-item divided command="delete" style="color: #e74c3c">🗑️ 删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 笔记列表 -->
      <div
        v-for="note in displayNotes"
        :key="note.id"
        class="list-item note-item"
        :class="{ active: selectedNoteId === note.id, selected: selectedIds.includes(note.id) }"
        @click="handleNoteClick(note)"
      >
        <el-checkbox
          v-if="isSelectionMode"
          :model-value="selectedIds.includes(note.id)"
          @click.stop
          @change="(val: boolean) => toggleNoteSelection(note.id, val)"
          size="small"
        />
        <span class="item-icon">{{ note.isStarred ? '⭐' : '📄' }}</span>

        <template v-if="viewMode === 'list'">
          <div class="item-info">
            <div class="item-title">{{ note.title || '无标题笔记' }}</div>
            <div class="item-meta">
              <span class="meta-date">{{ formatDate(note.updatedAt) }}</span>
              <span v-if="note.wordCount" class="meta-size">{{ note.wordCount }} 字</span>
              <span v-if="note.tags?.length" class="meta-tags">
                <el-tag
                  v-for="tag in note.tags.slice(0, 2)"
                  :key="tag.id"
                  size="small"
                  :color="tag.color"
                  style="margin: 0 2px; border: none"
                >
                  {{ tag.name }}
                </el-tag>
                <span v-if="note.tags.length > 2" class="tag-more">+{{ note.tags.length - 2 }}</span>
              </span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="item-info preview-mode">
            <div class="item-title">{{ note.title || '无标题笔记' }}</div>
            <div class="item-preview">{{ note.summary || note.contentPlain?.slice(0, 80) || '开始写作...' }}</div>
            <div class="item-meta">
              <span class="meta-date">{{ formatDate(note.updatedAt) }}</span>
              <span v-if="note.wordCount" class="meta-size">{{ note.wordCount }} 字</span>
            </div>
          </div>
        </template>

        <el-dropdown trigger="click" @command="(cmd: string) => handleNoteAction(cmd, note)" @click.stop>
          <el-button size="small" text class="more-btn">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="open">📄 打开</el-dropdown-item>
              <el-dropdown-item command="star" :style="{ color: note.isStarred ? '#e6a23c' : '' }">
                {{ note.isStarred ? '⭐ 取消星标' : '☆ 加星' }}
              </el-dropdown-item>
              <el-dropdown-item divided command="rename">✏️ 重命名</el-dropdown-item>
              <el-dropdown-item command="move">📤 移动到</el-dropdown-item>
              <el-dropdown-item command="copy">📋 复制</el-dropdown-item>
              <el-dropdown-item command="share">🔗 分享</el-dropdown-item>
              <el-dropdown-item command="export">📥 导出</el-dropdown-item>
              <el-dropdown-item command="archive">📦 归档</el-dropdown-item>
              <el-dropdown-item divided command="delete" style="color: #e74c3c">🗑️ 删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && displayNotes.length === 0 && (showFolders ? folders.length === 0 : true)" class="empty-state">
        <div class="empty-svg">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 15H65L75 25V85H25V15Z" fill="#F2F3F5" stroke="#DCDFE6" stroke-width="1.5"/>
            <path d="M65 15V25H75" fill="#F2F3F5" stroke="#DCDFE6" stroke-width="1.5"/>
            <circle cx="45" cy="50" r="12" fill="#ECF5FF" stroke="#409EFF" stroke-width="1.5"/>
            <text x="41" y="54" font-size="14" fill="#409EFF" font-family="sans-serif">?</text>
            <path d="M55 62L70 77" stroke="#DCDFE6" stroke-width="2" stroke-linecap="round"/>
            <path d="M30 38H60M30 45H55M30 58H62" stroke="#DCDFE6" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-tip">{{ emptyText }}</p>
        <el-button type="primary" size="default" @click="createNewNote" class="empty-create-btn">{{ emptyButtonText }}</el-button>
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="showFilterDialog" title="高级筛选" width="420px">
      <el-form label-width="80px" size="small">
        <el-form-item label="笔记类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
            <el-option value="note" label="富文本" />
            <el-option value="markdown" label="Markdown" />
            <el-option value="todo" label="待办清单" />
            <el-option value="mindmap" label="思维导图" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filters.tagId" placeholder="选择标签" clearable style="width: 100%">
            <el-option
              v-for="tag in tagList"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            >
              <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="包含">
          <el-checkbox-group v-model="filters.has">
            <el-checkbox value="image">图片</el-checkbox>
            <el-checkbox value="attachment">附件</el-checkbox>
            <el-checkbox value="table">表格</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFilterDialog = false">取消</el-button>
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="applyFilters">应用筛选</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showRenameDialog" title="重命名" width="400px">
      <el-input v-model="renameValue" placeholder="请输入新名称" @keyup.enter="confirmRename" />
      <template #footer>
        <el-button @click="showRenameDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showMoveDialog" title="移动到" width="400px">
      <el-tree-select
        v-model="moveTargetId"
        :data="folderTree"
        :props="{ label: 'name', value: 'id', children: 'children' }"
        placeholder="选择目标文件夹"
        clearable
        check-strictly
        style="width: 100%"
      />
      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确认</el-button>
      </template>
    </el-dialog>

    <ShareDialog
      v-model="showShareDialog"
      :target-id="shareTargetId"
      :target-type="shareTargetType"
      @success="onShareSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Loading,
  MoreFilled,
  ArrowLeft,
  ArrowRight,
  Menu
} from '@element-plus/icons-vue'
import { useFolderStore } from '@/store/modules/folder'
import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { noteApi, folderApi } from '@/api'
import { formatDate } from '@/utils/date'
import ShareDialog from '@/components/business/ShareDialog.vue'

type FolderCommand = 'open' | 'rename' | 'move' | 'copy' | 'share' | 'export' | 'delete'
type NoteCommand = 'open' | 'star' | 'rename' | 'move' | 'copy' | 'share' | 'export' | 'archive' | 'delete'

// ============================================================
// Store & Router
// ============================================================

const router = useRouter()
const route = useRoute()
const folderStore = useFolderStore()
const noteStore = useNoteStore()
const tagStore = useTagStore()

// ============================================================
// Props & Emits
// ============================================================

const props = defineProps<{
  selectedNoteId?: string | null
}>()

const emit = defineEmits<{
  (e: 'create-folder', parentId: string | null): void
  (e: 'create-note', folderId: string | null): void
  (e: 'select-item', type: 'note' | 'folder', id: string): void
  (e: 'refresh'): void
  (e: 'folder-status', hasContent: boolean): void  // ✅ 新增
}>()

// ============================================================
// 从 URL 获取当前文件夹 ID
// ============================================================

const currentFolderId = computed(() => {
  return route.params.folderId as string || null
})

const currentNoteId = computed(() => {
  return route.params.noteId as string || null
})

// ✅ 判断视图类型
const isRecentView = computed(() => currentFolderId.value === 'recent')
const isStarredView = computed(() => currentFolderId.value === 'starred')
const isTrashView = computed(() => currentFolderId.value === 'trash')
const isNoteView = computed(() => {
  return route.path.includes('/note/')
})

// ============================================================
// 状态
// ============================================================

const loading = ref(false)
const refreshing = ref(false)
const notes = ref<any[]>([])
const folders = ref<any[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(50)
const total = ref(0)
const tagList = ref<any[]>([])
let searchTimer: number | null = null

const viewMode = ref<'list' | 'preview'>('list')
const sortBy = ref('updatedAt_desc')
const isSelectionMode = ref(false)
const selectedIds = ref<string[]>([])

const showFilterDialog = ref(false)
const filters = ref({
  type: '',
  tagId: '',
  has: [] as string[],
  dateRange: null as [Date, Date] | null,
})

const showRenameDialog = ref(false)
const renameValue = ref('')
const renameTargetId = ref('')
const renameTargetType = ref<'folder' | 'note'>('folder')

const showMoveDialog = ref(false)
const moveTargetId = ref<string | null>(null)
const moveTargetId_ = ref('')
const moveTargetType = ref<'folder' | 'note'>('folder')

const showShareDialog = ref(false)
const shareTargetId = ref('')
const shareTargetType = ref<'folder' | 'note'>('folder')

// ============================================================
// 排序选项
// ============================================================

const sortOptions = [
  { label: '创建时间', value: 'created_at' },
  { label: '修改时间', value: 'updated_at' },
  { label: '文件名称', value: 'title' },
  { label: '文件大小', value: 'wordCount' },
]

// ============================================================
// 当前视图
// ============================================================

const currentView = computed(() => {
  if (isTrashView.value) return 'trash'
  if (isStarredView.value) return 'starred'
  if (isRecentView.value) return 'recent'
  if (currentFolderId.value) return 'folder'
  if (route.path.includes('/note/')) return 'note'
  return 'all'
})

// ============================================================
// 工具函数
// ============================================================

function findFolderInTree(items: any[], id: string): any | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const res = findFolderInTree(item.children, id)
      if (res) return res
    }
  }
  return null
}

function findFolderName(items: any[], id: string): string | null {
  const folder = findFolderInTree(items, id)
  return folder?.name || null
}

function findFolderParentId(items: any[], id: string): string | null {
  const folder = findFolderInTree(items, id)
  return folder?.parentId || null
}

// ============================================================
// 当前图标和标题
// ============================================================

const currentIcon = computed(() => {
  if (isStarredView.value) return '⭐'
  if (isTrashView.value) return '🗑️'
  if (isRecentView.value) return '🕐'
  if (currentView.value === 'folder') return '📁'
  if (currentView.value === 'note') return '📄'
  return '📄'
})

const currentTitle = computed(() => {
  if (isStarredView.value) return '⭐ 星标笔记'
  if (isTrashView.value) return '🗑️ 回收站'
  if (isRecentView.value) return '🕐 最近文件'
  if (currentView.value === 'folder') {
    return findFolderName(folderStore.tree, currentFolderId.value) || '文件夹'
  }
  if (currentView.value === 'note') {
    if (currentNoteId.value && currentNoteId.value !== 'new') return '笔记详情'
    return '新建笔记'
  }
  return '全部笔记'
})

const emptyText = computed(() => {
  if (isTrashView.value) return '回收站为空'
  if (isStarredView.value) return '暂无星标笔记'
  if (isRecentView.value) return '暂无最近文件'
  return '暂无笔记'
})

const emptyButtonText = computed(() => {
  if (isTrashView.value) return '返回笔记'
  if (isStarredView.value) return '去写笔记'
  if (isRecentView.value) return '创建第一篇笔记'
  return '创建第一篇笔记'
})

// ============================================================
// 显示文件夹
// ============================================================

const showFolders = computed(() => {
  if (isRecentView.value) return false
  if (isTrashView.value) return false
  if (isStarredView.value) return false
  return currentView.value === 'folder' && currentFolderId.value !== null
})

// ============================================================
// 返回按钮
// ============================================================

const showBackButton = computed(() => {
  if (isRecentView.value) return true
  if (isTrashView.value) return true
  if (isStarredView.value) return true
  if (currentView.value !== 'folder' || !currentFolderId.value) return false
  const parentId = findFolderParentId(folderStore.tree, currentFolderId.value)
  return !!parentId
})

// ============================================================
// 显示笔记
// ============================================================

const displayNotes = computed(() => {
  const list = [...notes.value]
  const [field, order] = sortBy.value.split('_')
  list.sort((a, b) => {
    let valA = a[field] || ''
    let valB = b[field] || ''
    if (field === 'title') {
      valA = valA.toLowerCase()
      valB = valB.toLowerCase()
    }
    if (order === 'desc') {
      return valA > valB ? -1 : 1
    }
    return valA > valB ? 1 : -1
  })
  return list
})

const folderTree = computed(() => {
  if (moveTargetId_.value) {
    const filterSelf = (items: any[], excludeId: string): any[] => {
      return items
        .filter(i => i.id !== excludeId)
        .map(i => ({
          ...i,
          children: i.children ? filterSelf(i.children, excludeId) : []
        }))
    }
    return filterSelf(folderStore.tree || [], moveTargetId_.value)
  }
  return folderStore.tree || []
})

// ============================================================
// 导航方法
// ============================================================

function goToFolder(id: string) {
  router.push(`/file/${id}`)
}

function goBack() {
  if (isRecentView.value || isTrashView.value || isStarredView.value) {
    router.push('/')
    return
  }
  if (!currentFolderId.value) return
  const parentId = findFolderParentId(folderStore.tree, currentFolderId.value)
  if (parentId) {
    router.push(`/file/${parentId}`)
  } else {
    router.push('/')
  }
}

function createNewNote() {
  if (isRecentView.value || isTrashView.value || isStarredView.value) {
    router.push('/note')
    return
  }
  const folderId = currentFolderId.value
  if (folderId && currentView.value === 'folder') {
    router.push(`/file/${folderId}/note`)
  } else {
    router.push('/note')
  }
}

function openCreateFolder() {
  emit('create-folder', currentFolderId.value)
}

// ============================================================
// 数据加载
// ============================================================

function selectFirstItem() {
  if (displayNotes.value.length > 0) {
    emit('select-item', 'note', displayNotes.value[0].id)
    return
  }
  if (folders.value.length > 0) {
    emit('select-item', 'folder', folders.value[0].id)
    return
  }
  emit('select-item', 'note', '')
}
async function loadData() {
  loading.value = true
  try {
    folders.value = []
    const tagResult = await tagStore.loadTags()
    tagList.value = tagResult.items || []

    // ✅ 回收站
    if (isTrashView.value) {
      const res = await noteApi.getDeleted({ page: currentPage.value, pageSize: pageSize.value })
      notes.value = res.items
      total.value = res.pagination.total
      await nextTick(selectFirstItem)
      
      // ✅ 触发状态
      const hasContent = notes.value.length > 0 || folders.value.length > 0
      emit('folder-status', hasContent)
      return
    }

    // ✅ 星标笔记
    if (isStarredView.value) {
      const res = await noteApi.list({ page: currentPage.value, pageSize: pageSize.value, isStarred: 1 })
      notes.value = res.items
      total.value = res.pagination.total
      await nextTick(selectFirstItem)
      
      // ✅ 触发状态
      const hasContent = notes.value.length > 0 || folders.value.length > 0
      emit('folder-status', hasContent)
      return
    }

    // ✅ 最近文件
    if (isRecentView.value) {
      const res = await noteApi.list({ page: 1, pageSize: 50, orderBy: 'updatedAt', orderDirection: 'desc' })
      notes.value = res.items || []
      total.value = notes.value.length
      await nextTick(selectFirstItem)
      
      // ✅ 触发状态
      const hasContent = notes.value.length > 0 || folders.value.length > 0
      emit('folder-status', hasContent)
      return
    }

    // ✅ 文件夹视图
    if (currentView.value === 'folder' && currentFolderId.value) {
      const folderRes = await folderApi.getChildren(currentFolderId.value, { page: 1, pageSize: 100 })
      folders.value = folderRes.items || []

      const params: any = {
        page: currentPage.value,
        pageSize: pageSize.value,
        folderId: currentFolderId.value
      }
      if (searchKeyword.value) params.keyword = searchKeyword.value
      applyFiltersToParams(params)
      const noteRes = await noteApi.list(params)
      notes.value = noteRes.items
      total.value = noteRes.pagination.total
      await nextTick(selectFirstItem)
      
      // ✅ 触发状态（关键修复）
      const hasContent = notes.value.length > 0 || folders.value.length > 0
      emit('folder-status', hasContent)
      return
    }

    // ✅ 全部笔记
    const params: any = { page: currentPage.value, pageSize: pageSize.value }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    applyFiltersToParams(params)
    const res = await noteApi.list(params)
    notes.value = res.items
    total.value = res.pagination.total
    await nextTick(selectFirstItem)

    // ✅ 触发状态
    const hasContent = notes.value.length > 0 || folders.value.length > 0
    emit('folder-status', hasContent)
  } finally {
    loading.value = false
  }
}


function applyFiltersToParams(params: any) {
  if (filters.value.type) params.type = filters.value.type
  if (filters.value.tagId) params.tagId = filters.value.tagId
  if (filters.value.has.includes('image')) params.hasImage = 1
  if (filters.value.has.includes('attachment')) params.hasAttachment = 1
  if (filters.value.dateRange) {
    params.startDate = filters.value.dateRange[0].toISOString()
    params.endDate = filters.value.dateRange[1].toISOString()
  }
}

async function refreshData() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await loadData()
    emit('refresh')
    
    // ✅ 刷新后再次触发状态
    const hasContent = notes.value.length > 0 || folders.value.length > 0
    emit('folder-status', hasContent)
  } finally {
    refreshing.value = false
  }
}

// ============================================================
// 监听路由变化
// ============================================================

watch(
  () => [currentFolderId.value, route.path],
  () => {
    currentPage.value = 1
    refreshData()
  },
  { deep: true }
)

// ============================================================
// 笔记点击
// ============================================================

function handleNoteClick(note: any) {
  if (isSelectionMode.value) {
    const idx = selectedIds.value.indexOf(note.id)
    if (idx > -1) {
      selectedIds.value.splice(idx, 1)
    } else {
      selectedIds.value.push(note.id)
    }
    return
  }
  // 跳转到笔记详情
  if (currentFolderId.value) {
    router.push(`/file/${currentFolderId.value}/note/${note.id}`)
  } else {
    router.push(`/note/${note.id}`)
  }
}

// ============================================================
// 视图切换
// ============================================================

function handleViewModeChange(cmd: string) {
  viewMode.value = cmd as 'list' | 'preview'
  localStorage.setItem('note_view_mode', viewMode.value)
}

function handleSortChange(val: string) {
  sortBy.value = val
  refreshData()
}

// ============================================================
// 选择模式
// ============================================================

function toggleSelection() {
  isSelectionMode.value = !isSelectionMode.value
  if (!isSelectionMode.value) selectedIds.value = []
}

function toggleNoteSelection(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  }
}

async function batchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择笔记')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除选中 ${selectedIds.value.length} 篇笔记？`, '批量删除', { type: 'warning' })
    for (const id of selectedIds.value) {
      await noteApi.delete(id)
    }
    ElMessage.success(`删除 ${selectedIds.value.length} 篇笔记成功`)
    selectedIds.value = []
    isSelectionMode.value = false
    refreshData()
  } catch {}
}

async function batchMove() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择笔记')
    return
  }
  showMoveDialog.value = true
}

// ============================================================
// 筛选
// ============================================================

function applyFilters() {
  currentPage.value = 1
  loadData()
  showFilterDialog.value = false
}

function resetFilters() {
  filters.value = { type: '', tagId: '', has: [], dateRange: null }
  currentPage.value = 1
  loadData()
  showFilterDialog.value = false
}

// ============================================================
// 文件夹操作
// ============================================================

function handleRenameFolder(folder: any) {
  renameTargetId.value = folder.id
  renameTargetType.value = 'folder'
  renameValue.value = folder.name
  showRenameDialog.value = true
}

function handleMoveFolder(folder: any) {
  moveTargetId_.value = folder.id
  moveTargetType.value = 'folder'
  moveTargetId.value = folder.parentId || null
  showMoveDialog.value = true
}

async function handleCopyFolder(folder: any) {
  try {
    await folderApi.create({
      name: `${folder.name}(副本)`,
      parentId: folder.parentId,
      icon: folder.icon,
      color: folder.color
    })
    ElMessage.success('复制成功')
    await folderStore.loadTree()
    refreshData()
  } catch {}
}

function handleShareFolder(folder: any) {
  shareTargetId.value = folder.id
  shareTargetType.value = 'folder'
  showShareDialog.value = true
}

function handleExportFolder() {
  ElMessage.info('导出文件夹')
}

async function handleDeleteFolder(folder: any) {
  try {
    await ElMessageBox.confirm(`删除文件夹「${folder.name}」？`, '确认删除', { type: 'warning' })
    await folderApi.delete(folder.id)
    ElMessage.success('删除成功')
    await folderStore.loadTree()
    refreshData()
    if (currentFolderId.value === folder.id) {
      router.push('/')
    }
  } catch {}
}

// ============================================================
// 笔记操作
// ============================================================

async function handleStarNote(note: any) {
  try {
    const res = await noteApi.toggleStar(note.id, note.isStarred ? 0 : 1)
    note.isStarred = res.isStarred
    ElMessage.success(res.isStarred ? '已加星' : '已取消星标')
    refreshData()
  } catch {}
}

function handleRenameNote(note: any) {
  renameTargetId.value = note.id
  renameTargetType.value = 'note'
  renameValue.value = note.title || '无标题笔记'
  showRenameDialog.value = true
}

function handleMoveNote(note: any) {
  moveTargetId_.value = note.id
  moveTargetType.value = 'note'
  moveTargetId.value = note.folderId || null
  showMoveDialog.value = true
}

async function handleCopyNote(note: any) {
  try {
    await noteApi.create({
      title: `${note.title}(副本)`,
      content: note.content,
      folderId: note.folderId,
      tagIds: note.tags?.map((t: any) => t.id) || []
    })
    ElMessage.success('复制成功')
    refreshData()
  } catch {}
}

function handleShareNote(note: any) {
  shareTargetId.value = note.id
  shareTargetType.value = 'note'
  showShareDialog.value = true
}

function handleExportNote() {
  ElMessage.info('导出笔记')
}

async function handleArchiveNote(note: any) {
  try {
    await noteApi.toggleArchive(note.id, note.isArchived ? 0 : 1)
    note.isArchived = !note.isArchived
    ElMessage.success(note.isArchived ? '已归档' : '取消归档')
    refreshData()
  } catch {}
}

async function handleDeleteNote(note: any) {
  try {
    await ElMessageBox.confirm(`删除笔记「${note.title}」？`, '确认删除', { type: 'warning' })
    await noteApi.delete(note.id)
    ElMessage.success('删除成功')
    refreshData()
    if (props.selectedNoteId === note.id) emit('select-item', 'note', '')
  } catch {}
}

// ============================================================
// 操作按钮命令
// ============================================================

function handleFolderAction(cmd: string, folder: any) {
  const c = cmd as FolderCommand
  switch (c) {
    case 'open': goToFolder(folder.id); break
    case 'rename': handleRenameFolder(folder); break
    case 'move': handleMoveFolder(folder); break
    case 'copy': handleCopyFolder(folder); break
    case 'share': handleShareFolder(folder); break
    case 'export': handleExportFolder(); break
    case 'delete': handleDeleteFolder(folder); break
  }
}

function handleNoteAction(cmd: string, note: any) {
  const c = cmd as NoteCommand
  switch (c) {
    case 'open':
      if (currentFolderId.value) {
        router.push(`/file/${currentFolderId.value}/note/${note.id}`)
      } else {
        router.push(`/note/${note.id}`)
      }
      break
    case 'star': handleStarNote(note); break
    case 'rename': handleRenameNote(note); break
    case 'move': handleMoveNote(note); break
    case 'copy': handleCopyNote(note); break
    case 'share': handleShareNote(note); break
    case 'export': handleExportNote(); break
    case 'archive': handleArchiveNote(note); break
    case 'delete': handleDeleteNote(note); break
  }
}

// ============================================================
// 弹窗确认
// ============================================================

async function confirmRename() {
  if (!renameValue.value.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  try {
    if (renameTargetType.value === 'folder') {
      await folderApi.update(renameTargetId.value, { name: renameValue.value })
      await folderStore.loadTree()
    } else {
      await noteApi.update(renameTargetId.value, { title: renameValue.value })
    }
    ElMessage.success('重命名成功')
    refreshData()
    showRenameDialog.value = false
  } catch {}
}

async function confirmMove() {
  try {
    if (isSelectionMode.value && selectedIds.value.length > 0) {
      for (const id of selectedIds.value) {
        await noteApi.update(id, { folderId: moveTargetId.value })
      }
      ElMessage.success(`移动 ${selectedIds.value.length} 篇笔记成功`)
      selectedIds.value = []
      isSelectionMode.value = false
    } else {
      const targetId = moveTargetId.value
      if (moveTargetType.value === 'folder') {
        await folderApi.update(moveTargetId_.value, { parentId: targetId })
        await folderStore.loadTree()
      } else {
        await noteApi.update(moveTargetId_.value, { folderId: targetId })
      }
      ElMessage.success('移动成功')
    }
    refreshData()
    showMoveDialog.value = false
  } catch {}
}

function onShareSuccess() {
  ElMessage.success('分享成功')
}

// ============================================================
// 搜索
// ============================================================

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 400)
}

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  const savedMode = localStorage.getItem('note_view_mode') as 'list' | 'preview' | null
  if (savedMode) viewMode.value = savedMode
  if (folderStore.tree.length === 0 && !folderStore.loading) {
    await folderStore.loadTree()
  }
  loadData()
})

defineExpose({ refresh: refreshData, loadData })
</script>

<style scoped>
.middle-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  min-width: 300px;
}

/* 第一行：搜索框 + 菜单图标横向布局 */
.search-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 6px;
  flex-shrink: 0;
}
.column-search {
  flex: 1;
}
.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background: #f5f5f7;
  border: none;
  box-shadow: none;
}
.search-input :deep(.el-input__wrapper:hover) {
  background: #eee;
}
.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #409eff;
}
.search-input :deep(.el-input__inner) {
  font-size: 13px;
  color: #1d1d1f;
}
.search-input :deep(.el-input__inner::placeholder) {
  color: #999;
}

/* 右侧三横线菜单按钮 */
.menu-icon-btn {
  padding: 4px;
  color: #666;
}
.menu-icon-btn:hover {
  background: #f0f0f0;
  border-radius: 4px;
  color: #111;
}

/* 第二行：文件夹头部栏（返回+文件夹名称） */
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.header-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.header-count {
  font-size: 12px;
  color: #8e8e93;
  background: #f0f0f0;
  padding: 0 6px;
  border-radius: 10px;
  flex-shrink: 0;
  font-weight: 500;
}
.back-btn {
  padding: 4px 6px !important;
  font-size: 14px;
  color: #6e6e73;
}
.back-btn:hover {
  color: #1d1d1f;
  background: #f0f0f0;
  border-radius: 4px;
}

/* 下拉菜单：一级菜单垂直竖排两项，匹配截图 */
:deep(.parent-main-menu) {
  min-width: 160px;
}
:deep(.view-sub-menu),
:deep(.sort-sub-menu) {
  margin-left: 8px;
  min-width: 100px;
}
:deep(.el-dropdown-menu__item) {
  font-size: 16px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
:deep(.el-dropdown-menu__item.active) {
  background: #ecf5ff;
  color: #409eff;
}
.item-right-arrow {
  font-size: 12px;
  color: #999;
}
.sort-arrow {
  font-size: 10px;
  color: #409eff;
}

/* 列表容器 */
.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 36px;
}
.list-item:hover {
  background: #f5f5f7;
}
.list-item.active {
  background: #e8e8e8;
}
.list-item.selected {
  background: #ecf5ff;
}
.item-icon {
  font-size: 15px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}
.item-info {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #8e8e93;
  margin-top: 1px;
  flex-wrap: wrap;
}
.meta-tags {
  display: flex;
  align-items: center;
  gap: 2px;
}
.tag-more {
  font-size: 10px;
}
.preview-mode .item-title {
  font-size: 14px;
  margin-bottom: 2px;
}
.preview-mode .item-preview {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.more-btn {
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
  padding: 2px 4px;
}
.list-item:hover .more-btn {
  opacity: 1;
}

/* 空状态 1:1 截图 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}
.empty-svg {
  margin-bottom: 16px;
}
.empty-tip {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}
.empty-create-btn {
  border-radius: 4px;
  padding: 8px 22px;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #888;
  font-size: 13px;
}

/* 滚动条 */
.column-list::-webkit-scrollbar {
  width: 4px;
}
.column-list::-webkit-scrollbar-track {
  background: transparent;
}
.column-list::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 2px;
}
</style>