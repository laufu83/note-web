<!-- src/components/layout/FolderTreeItem.vue -->

<template>
  <div class="folder-wrap">
    <!-- 当前文件夹条目 -->
    <div
      class="nav-item folder-row nav-folder"
      :style="{ paddingLeft: `${(level - 1) * 24 + 8}px` }"
      :class="{ active: currentFolderId === folder.id }"
      @click="$emit('select', folder.id)"
    >
      <!-- 折叠/展开按钮 -->
      <span 
        v-if="hasChildren"
        class="expand-btn"
        :class="{ expanded: isExpanded }"
        @click.stop="toggleExpand"
      >
        <el-icon><ArrowRight /></el-icon>
      </span>
      <span v-else class="expand-placeholder"></span>
      
      <span class="nav-label">{{ folder.name }}</span>
      
      <!-- 子文件夹数量徽标 -->
      <span v-if="hasChildren" class="nav-badge child-count">
        {{ folder.children.length }}
      </span>

      <el-dropdown
        trigger="click"
        placement="right-start"
        @command="(cmd: string) => $emit('folder-menu', cmd, folder)"
        @click.stop
        class="folder-more-dropdown"
      >
        <div class="more-btn">
          <el-icon><More /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="folder-context-menu">
            <el-dropdown-item command="new">
              <span class="menu-icon">📁</span> 新建子文件夹
            </el-dropdown-item>
            <el-dropdown-item divided command="delete">
              <span class="menu-icon">🗑️</span> 删除
            </el-dropdown-item>
            <el-dropdown-item command="rename">
              <span class="menu-icon">✏️</span> 重命名
            </el-dropdown-item>
            <el-dropdown-item command="move">
              <span class="menu-icon">↔️</span> 移动到
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- ✅ 子文件夹（可折叠） -->
    <div v-if="hasChildren && isExpanded" class="folder-children">
      <template v-for="child in getChildren()" :key="child.id">
        <FolderTreeItem
          v-if="level < 10 && !isCircular(child)"
          :folder="child"
          :level="level + 1"
          :current-folder-id="currentFolderId"
          :child-create-target-id="childCreateTargetId"
          :child-create-name="childCreateName"
          @update:child-create-name="(val: string) => $emit('update:childCreateName', val)"
          @select="(id: string) => $emit('select', id)"
          @folder-menu="(cmd: string, target: any) => $emit('folder-menu', cmd, target)"
          @child-submit="$emit('child-submit')"
          @child-cancel="$emit('child-cancel')"
        />
        <!-- 超过深度显示提示 -->
        <div v-else-if="level >= 10" class="nav-item" :style="{ paddingLeft: `${level * 24 + 8}px` }">
          <span class="nav-label" style="color: #999;">... 层级过深</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { More, ArrowRight } from '@element-plus/icons-vue'

// ============================================================
// Props
// ============================================================
const props = defineProps<{
  folder: any
  level: number
  currentFolderId: string | null
  childCreateTargetId: string | null
  childCreateName: string
  defaultExpanded?: boolean  // 是否默认展开
}>()

// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'folder-menu', cmd: string, targetFolder: any): void
  (e: 'child-submit'): void
  (e: 'child-cancel'): void
  (e: 'update:childCreateName', val: string): void
}>()

// ============================================================
// State
// ============================================================
const isExpanded = ref(props.defaultExpanded ?? false)
const visitedIds = ref<Set<string>>(new Set())

// ============================================================
// Computed
// ============================================================
const hasChildren = computed(() => {
  return props.folder.children && 
         Array.isArray(props.folder.children) && 
         props.folder.children.length > 0
})

// ============================================================
// Watch
// ============================================================
// 当当前文件夹变化时，展开父级路径
watch(() => props.currentFolderId, (newId) => {
  // 如果当前文件夹是当前节点的子节点，展开当前节点
  if (hasChildren.value && props.folder.children) {
    const isChildActive = props.folder.children.some((child: any) => {
      return child.id === newId || isDescendant(child, newId)
    })
    if (isChildActive) {
      isExpanded.value = true
    }
  }
}, { immediate: true })

// 如果当前节点本身被选中，展开它
watch(() => props.currentFolderId, (newId) => {
  if (props.folder.id === newId) {
    isExpanded.value = true
  }
}, { immediate: true })

// ============================================================
// Methods
// ============================================================

/**
 * 检查某个节点是否是另一个节点的后代
 */
function isDescendant(node: any, targetId: string | null): boolean {
  if (!targetId) return false
  if (node.id === targetId) return true
  if (node.children) {
    for (const child of node.children) {
      if (isDescendant(child, targetId)) return true
    }
  }
  return false
}

/**
 * 切换展开/折叠
 */
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

/**
 * 获取子文件夹，并过滤掉循环引用
 */
function getChildren() {
  if (!props.folder.children || !Array.isArray(props.folder.children)) {
    return []
  }
  
  const result = []
  for (const child of props.folder.children) {
    if (visitedIds.value.has(child.id)) {
      console.warn('[FolderTreeItem] 检测到循环引用，跳过:', child.id, child.name)
      continue
    }
    result.push(child)
  }
  return result
}

/**
 * 检查是否有循环引用
 */
function isCircular(child: any): boolean {
  return visitedIds.value.has(child.id)
}
</script>

<style scoped>
.folder-wrap {
  user-select: none;
}

.folder-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #1d1d1f;
  transition: background 0.15s;
  min-height: 32px;
}

.folder-row:hover {
  background: #e8e8e8;
}

.folder-row.active {
  background: #e8e8e8;
  font-weight: 500;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============================================================
   折叠/展开按钮
   ============================================================ */
.expand-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 4px;
  color: #8e8e93;
  transition: all 0.2s ease;
  font-size: 14px;
}

.expand-btn:hover {
  background: #d0d0d0;
  color: #1d1d1f;
}

.expand-btn .el-icon {
  transition: transform 0.25s ease;
  font-size: 14px;
}

.expand-btn.expanded .el-icon {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 20px;
  flex-shrink: 0;
}

/* ============================================================
   徽标
   ============================================================ */
.nav-badge {
  font-size: 11px;
  color: #8e8e93;
  background: #e8e8e8;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-badge.child-count {
  background: #d0d0d0;
  color: #6e6e73;
  font-size: 10px;
}

/* ============================================================
   子文件夹容器
   ============================================================ */
.folder-children {
  overflow: hidden;
  animation: expandIn 0.2s ease;
}

/* ============================================================
   三点更多按钮
   ============================================================ */
.folder-more-dropdown {
  flex-shrink: 0;
}

.more-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #8e8e93;
  transition: background 0.15s;
  visibility: hidden;
  cursor: pointer;
}

.folder-row:hover .more-btn {
  visibility: visible;
}

.more-btn:hover {
  background: #d0d0d0;
  color: #1d1d1f;
}

/* ============================================================
   菜单样式
   ============================================================ */
.menu-icon {
  font-size: 16px;
  margin-right: 8px;
  width: 18px;
  text-align: center;
}

:deep(.el-dropdown-menu__item) {
  padding: 6px 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item:hover) {
  background: #f5f5f5;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

:deep(.folder-context-menu) {
  min-width: 180px;
}

/* ============================================================
   动画
   ============================================================ */
@keyframes expandIn {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>