<!-- src/components/business/FolderTreeNode.vue -->

<template>
  <div class="folder-tree-node" :style="{ paddingLeft: `${(level - 1) * 20 + 24}px` }">
    <!-- 文件夹节点 -->
    <div 
      class="tree-node"
      :class="{ 
        selected: selectedId === folder.id,
        disabled: folder.id === currentFolderId,
        highlight: highlightId === folder.id && selectedId !== folder.id
      }"
      @click="handleClick"
    >
      <!-- 折叠/展开按钮 -->
      <span 
        v-if="hasChildren"
        class="expand-btn"
        :class="{ expanded: isExpanded }"
        @click.stop="toggleExpand"
      >
        <el-icon>
          <ArrowRight />
        </el-icon>
      </span>
      <span v-else class="expand-placeholder"></span>
      
      <!-- 文件夹图标 -->
      <span class="node-icon">📁</span>
      
      <!-- 文件夹名称 -->
      <span class="node-label">{{ folder.name }}</span>
      
      <!-- 标签 -->
      <span v-if="folder.id === currentFolderId" class="node-tag current">当前</span>
      <span v-if="highlightId === folder.id && selectedId !== folder.id" class="node-tag highlight">当前位置</span>      
   
    </div>

    <!-- 子节点（可折叠） -->
    <div v-if="hasChildren && isExpanded" class="node-children">
      <FolderTreeNode
        v-for="child in folder.children"
        :key="child.id"
        :folder="child"
        :level="level + 1"
        :selected-id="selectedId"
        :current-folder-id="currentFolderId"
        :highlight-id="highlightId"
        @select="handleChildSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

// ============================================================
// Props
// ============================================================
interface FolderNode {
  id: string
  name: string
  parentId?: string | null
  noteCount?: number
  children?: FolderNode[]
  [key: string]: any
}

const props = defineProps<{
  folder: FolderNode
  level: number
  selectedId: string | null
  currentFolderId: string | null
  defaultExpanded?: boolean
  highlightId?: string | null  // 高亮显示的文件夹ID（当前文件夹的父级）
}>()

// ============================================================
// Emits
// ============================================================
const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

// ============================================================
// State
// ============================================================

/**
 * 是否展开
 */
const isExpanded = ref(props.defaultExpanded ?? false)

// ============================================================
// Computed
// ============================================================

/**
 * 是否有子节点
 */
const hasChildren = computed(() => {
  return props.folder.children && props.folder.children.length > 0
})

/**
 * 是否被选中
 */
const isSelected = computed(() => {
  return props.selectedId === props.folder.id
})

/**
 * 是否禁用（当前文件夹不能选择）
 */
const isDisabled = computed(() => {
  return props.folder.id === props.currentFolderId
})

/**
 * 是否需要高亮
 */
const shouldHighlight = computed(() => {
  return props.highlightId === props.folder.id && props.selectedId !== props.folder.id
})

// ============================================================
// Watch
// ============================================================

/**
 * 当选中状态变化时，自动展开父级路径
 */
watch(() => props.selectedId, (newId) => {
  if (newId === props.folder.id) {
    isExpanded.value = true
  }
}, { immediate: true })

/**
 * 当高亮ID变化时，自动展开包含高亮节点的路径
 */
watch(() => props.highlightId, (newId) => {
  if (newId === props.folder.id) {
    isExpanded.value = true
  }
}, { immediate: true })

// ============================================================
// Methods
// ============================================================

/**
 * 切换展开/折叠
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

/**
 * 处理节点点击
 */
const handleClick = () => {
  if (isDisabled.value) {
    return
  }
  emit('select', props.folder.id)
}

/**
 * 处理子节点选择
 */
const handleChildSelect = (id: string) => {
  emit('select', id)
}
</script>

<style scoped>
/* ============================================================
   容器
   ============================================================ */
.folder-tree-node {
  user-select: none;
}

/* ============================================================
   树节点
   ============================================================ */
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  min-height: 34px;
  position: relative;
}

.tree-node:hover {
  background: #f5f5f5;
}

.tree-node.selected {
  background: #e8f2ff;
}

.tree-node.highlight {
  background: #f0f7ff;
  border: 1px dashed #007aff;
}

.tree-node.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tree-node.disabled:hover {
  background: transparent;
}

/* ============================================================
   展开/折叠按钮
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
  background: #e8e8e8;
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
   节点内容
   ============================================================ */
.node-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.node-label {
  font-size: 14px;
  color: #1d1d1f;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tag {
  font-size: 11px;
  padding: 0 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.node-tag.current {
  color: #007aff;
  background: #e8f2ff;
}

.node-tag.highlight {
  color: #007aff;
  background: #e8f2ff;
  border: 1px solid #007aff;
}

.node-count {
  font-size: 11px;
  color: #8e8e93;
  background: #f0f0f0;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.node-count.child-count {
  color: #8e8e93;
  background: #e8e8e8;
  font-size: 10px;
}

/* ============================================================
   子节点容器
   ============================================================ */
.node-children {
  margin: 0;
  overflow: hidden;
  animation: expandIn 0.2s ease;
}

/* ============================================================
   选中指示器 - 左侧竖条
   ============================================================ */
.tree-node.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: #007aff;
  border-radius: 0 2px 2px 0;
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