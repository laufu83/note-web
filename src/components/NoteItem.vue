<!-- src/components/NoteItem.vue -->
<template>
  <div
    class="list-item note-item"
    :class="{ active: selected }"
    @click="handleClick"
  >
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
          <!-- 回收站显示删除时间 -->
          <span v-if="isTrash" class="meta-deleted">已删除 {{ formatDate(note.deletedAt) }}</span>
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
          <span v-if="isTrash" class="meta-deleted">已删除 {{ formatDate(note.deletedAt) }}</span>
        </div>
      </div>
    </template>

    <!-- ✅ 回收站模式：直接显示恢复和删除按钮 -->
    <template v-if="isTrash">
      <div class="trash-actions">
        <el-button
          size="small"
          type="success"
          text
          @click.stop="handleRestore"
        >
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
        <el-button
          size="small"
          type="danger"
          text
          @click.stop="handlePermanentDelete"
        >
          <el-icon><Delete /></el-icon>
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
</template>

<script setup lang="ts">
import { MoreFilled, RefreshLeft, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'

const props = defineProps<{
  note: any
  viewMode: 'list' | 'preview'
  selected: boolean
  isTrash?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', note: any): void
  (e: 'action', command: string): void
}>()

function handleClick() {
  emit('select', props.note)
}

function handleCommand(command: string) {
  emit('action', command)
}

function handleRestore() {
  emit('action', 'restore')
}

function handlePermanentDelete() {
  emit('action', 'delete-permanent')
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

.list-item.active {
  background: #e8e8e8;
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

.meta-deleted {
  color: #e74c3c;
  font-size: 11px;
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