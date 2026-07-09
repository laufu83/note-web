<!-- src/components/folder/FolderItem.vue -->
<template>
  <div class="list-item folder-item" @click="emit('select', folder.id)">
    <span class="item-icon">📁</span>
    <div class="item-info">
      <div class="item-title">{{ folder.name }}</div>
      <div class="item-meta">
        <!-- <span>{{ folder.noteCount || 0 }} 篇笔记</span> -->
        <span v-if="isTrash" class="meta-deleted">已删除 {{ formatDate(folder.deletedAt) }}</span>
      </div>
    </div>

    <!-- ✅ 回收站模式：直接显示恢复和删除按钮 -->
    <template v-if="isTrash">
      <div class="trash-actions">
        <el-button
          size="small"
          type="success"
          plain
          @click.stop="handleRestore"
        >
          <el-icon><RefreshLeft /></el-icon>
          恢复
        </el-button>
        <el-button
          size="small"
          type="danger"
          plain
          @click.stop="handlePermanentDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </template>

    <!-- 普通模式：下拉菜单 -->
    <el-dropdown v-else trigger="click" @command="handleCommand" @click.stop>
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
</template>

<script setup lang="ts">
import { MoreFilled, RefreshLeft, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  folder: any
  isTrash?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'action', command: string, folder: any): void
}>()

function handleCommand(command: string) {
  emit('action', command, props.folder)
}

function handleRestore() {
  emit('action', 'restore', props.folder)
}

function handlePermanentDelete() {
  emit('action', 'delete-permanent', props.folder)
}
</script>

<style scoped>
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

.meta-deleted {
  color: #e74c3c;
  font-size: 11px;
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

/* ============================================================
   回收站操作按钮
   ============================================================ */
.trash-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.list-item:hover .trash-actions {
  opacity: 1;
}

.trash-actions .el-button {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.trash-actions .el-button .el-icon {
  font-size: 14px;
  margin-right: 2px;
}

.trash-actions .el-button--success {
  color: #67c23a;
  border-color: #67c23a;
}

.trash-actions .el-button--success:hover {
  background: #67c23a;
  color: #fff;
}

.trash-actions .el-button--danger {
  color: #f56c6c;
  border-color: #f56c6c;
}

.trash-actions .el-button--danger:hover {
  background: #f56c6c;
  color: #fff;
}
</style>