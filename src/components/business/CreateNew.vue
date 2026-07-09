<!-- src/components/business/CreateNew.vue -->
<template>
  <el-dropdown trigger="click" placement="bottom-start" @command="$emit('command', $event)" style="width:100%;">
    <el-button size="large" type="primary" class="create-main-btn">
      <el-icon><Plus /></el-icon>
      新建
    </el-button>
    <template #dropdown>
      <el-dropdown-menu class="create-menu">
        <!-- 分组1：新建笔记 -->
        <div class="menu-group-title">新建笔记</div>
        <div class="menu-grid">
          <el-dropdown-item command="note-blank" class="grid-item">
            <div class="grid-icon blue">
              <Document />
            </div>
            <span class="grid-text">空白文档</span>
          </el-dropdown-item>
          <el-dropdown-item command="note-md" class="grid-item">
            <div class="grid-icon sky">
              <Document />
            </div>
            <span class="grid-text">Markdown</span>
          </el-dropdown-item>
          <el-dropdown-item command="folder" class="grid-item">
            <div class="grid-icon orange">
              <FolderAdd />
            </div>
            <span class="grid-text">新建文件夹</span>
          </el-dropdown-item>
        </div>

        <el-divider />

        <!-- 分组2：更多方式 -->
        <div class="menu-group-title">更多方式</div>
        <div class="menu-grid">
          <el-dropdown-item command="template-ai" class="grid-item">
            <div class="grid-icon purple ai-badge">
              <MagicStick />
              <span class="badge-text">AI</span>
            </div>
            <span class="grid-text">从模板新建</span>
          </el-dropdown-item>
          <el-dropdown-item command="upload-file" class="grid-item">
            <div class="grid-icon orange">
              <Upload />
            </div>
            <span class="grid-text">上传文件</span>
          </el-dropdown-item>
          <!-- 透明占位补齐3列，不产生溢出 -->
          <div class="grid-item empty-placeholder"></div>
        </div>

       
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { Plus, Document, FolderAdd, MagicStick, Upload } from '@element-plus/icons-vue'
const emit = defineEmits<{
  (e: 'command', cmd: string): void
}>()
</script>

<style scoped>
.create-main-btn {
  width: 100% !important;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}

/* 下拉根容器：强制隐藏横向滚动，固定500px宽度 */
:deep(.create-menu) {
  width: 500px !important;
  min-width: 500px !important;
  max-width: 500px !important;
  padding: 12px 0;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}
/* 全局盒模型约束，所有元素内边距不撑大宽度 */
:deep(.create-menu *) {
  box-sizing: border-box !important;
}

.menu-group-title {
  padding: 0 20px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 3列等分网格 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 8px;
  width: 100%;
}
.grid-item {
  padding: 12px 4px !important;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
/* 空白占位：完全透明，无交互，不占用可视宽度 */
.empty-placeholder {
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

/* 强制图标文字垂直上下排列，覆盖Element默认横向布局 */
:deep(.el-dropdown-menu__item.grid-item) {
  flex-direction: column !important;
  align-items: center;
}

/* 彩色方形图标 */
.grid-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.grid-icon.blue { background: #4080ff; color: white; }
.grid-icon.sky { background: #29b6f6; color: white; }
.grid-icon.orange { background: #fb923c; color: white; }
.grid-icon.purple { background: #a855f7; color: white; }
.grid-icon svg { font-size: 20px; }

/* AI角标 */
.ai-badge .badge-text {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #a855f7;
  color: white;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 4px;
}
.grid-text {
  font-size: 12px;
  color: #333;
  text-align: center;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f3f4f6;
}
:deep(.el-divider) {
  margin: 8px 20px;
}
</style>