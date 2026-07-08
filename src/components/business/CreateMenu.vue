<!-- src/components/business/CreateMenu.vue -->

<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @visible-change="handleVisibleChange"
  >
    <div class="create-button">
      <el-icon><Plus /></el-icon>
      <span>新建</span>
      <el-icon class="arrow"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="create-menu">
        <!-- 标题 -->
        <div class="menu-header">新建</div>

        <!-- 笔记 -->
        <el-dropdown-item @click="createNote">
          <div class="menu-item-content">
            <span class="menu-icon">📄</span>
            <div class="menu-item-info">
              <span class="menu-item-title">新建笔记</span>
              <span class="menu-item-desc">富文本笔记</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- 文件夹 -->
        <el-dropdown-item @click="createFolder">
          <div class="menu-item-content">
            <span class="menu-icon">📁</span>
            <div class="menu-item-info">
              <span class="menu-item-title">新建文件夹</span>
              <span class="menu-item-desc">组织笔记</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- 分隔线 -->
        <el-dropdown-item divided>
          <div class="menu-item-content">
            <span class="menu-icon">📋</span>
            <div class="menu-item-info">
              <span class="menu-item-title">从模板新建</span>
              <span class="menu-item-desc">使用预设模板</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- Word 转笔记 -->
        <el-dropdown-item @click="importWord">
          <div class="menu-item-content">
            <span class="menu-icon">📝</span>
            <div class="menu-item-info">
              <span class="menu-item-title">Word 转笔记</span>
              <span class="menu-item-desc">导入 Word 文档</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- 上传文件 -->
        <el-dropdown-item @click="uploadFile">
          <div class="menu-item-content">
            <span class="menu-icon">📎</span>
            <div class="menu-item-info">
              <span class="menu-item-title">上传文件</span>
              <span class="menu-item-desc">支持多种格式</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- 分隔线 -->
        <el-dropdown-item divided>
          <div class="menu-item-content">
            <span class="menu-icon">📂</span>
            <div class="menu-item-info">
              <span class="menu-item-title">上传文件夹</span>
              <span class="menu-item-desc">批量上传</span>
            </div>
          </div>
        </el-dropdown-item>

        <!-- 加星文件 -->
        <el-dropdown-item @click="starredFiles">
          <div class="menu-item-content">
            <span class="menu-icon">⭐</span>
            <div class="menu-item-info">
              <span class="menu-item-title">加星文件</span>
              <span class="menu-item-desc">查看收藏</span>
            </div>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- 上传文件对话框 -->
  <el-dialog v-model="showUploadDialog" title="上传文件" width="500px">
    <el-upload
      drag
      multiple
      :auto-upload="false"
      :file-list="fileList"
      @change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处，或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 Word、PDF、Markdown、图片等格式
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="showUploadDialog = false">取消</el-button>
      <el-button type="primary" :loading="uploading" @click="handleUpload">上传</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import { useFolderStore } from '@/store/modules/folder'

const router = useRouter()
const folderStore = useFolderStore()

const showUploadDialog = ref(false)
const uploading = ref(false)
const fileList = ref<any[]>([])

const emit = defineEmits<{
  (e: 'create-folder'): void
}>()

function handleVisibleChange(visible: boolean) {
  // 可以添加埋点
}

// 新建笔记
function createNote() {
  router.push('/note/new')
}

// 新建文件夹
function createFolder() {
  emit('create-folder')
}

// 从模板新建
function createFromTemplate() {
  router.push('/templates')
}

// 导入 Word
function importWord() {
  showUploadDialog.value = true
}

// 上传文件
function uploadFile() {
  showUploadDialog.value = true
}

// 上传文件夹
function uploadFolder() {
  ElMessage.info('上传文件夹功能开发中')
}

// 加星文件
function starredFiles() {
  router.push('/starred')
}

function handleFileChange(file: any) {
  fileList.value.push(file)
}

async function handleUpload() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }
  uploading.value = true
  try {
    // 上传逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`成功上传 ${fileList.value.length} 个文件`)
    fileList.value = []
    showUploadDialog.value = false
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
/* ============================================================
   新建按钮样式
   ============================================================ */
.create-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2e7d32;
  color: #ffffff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  user-select: none;
}

.create-button:hover {
  background: #1b5e20;
}

.create-button .arrow {
  font-size: 12px;
  margin-left: 4px;
}

/* ============================================================
   下拉菜单样式
   ============================================================ */
:deep(.create-menu) {
  min-width: 260px;
  padding: 8px 0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.menu-header {
  padding: 6px 16px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.menu-icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.menu-item-info {
  display: flex;
  flex-direction: column;
}

.menu-item-title {
  font-size: 14px;
  color: #1d1d1f;
  font-weight: 500;
}

.menu-item-desc {
  font-size: 12px;
  color: #8e8e93;
}

:deep(.el-dropdown-menu__item) {
  padding: 4px 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f5f5f5;
}

:deep(.el-dropdown-menu__item .menu-item-content) {
  padding: 4px 0;
}

:deep(.el-dropdown-menu__item--divided) {
  border-top-color: #e8e8e8;
  margin-top: 4px;
  padding-top: 4px;
}
</style>