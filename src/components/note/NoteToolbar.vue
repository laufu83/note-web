<!-- src/components/note/NoteToolbar.vue -->
<template>
  <div class="editor-toolbar">
    <!-- 基础操作 -->
    <el-button-group size="small">
      <el-button @click="emit('undo')">
        <el-icon><RefreshLeft /></el-icon>
      </el-button>
      <el-button @click="emit('redo')">
        <el-icon><RefreshRight /></el-icon>
      </el-button>
      <el-button @click="emit('print')">
        <el-icon><Printer /></el-icon>
      </el-button>
      <el-button @click="emit('attachment')">
        <el-icon><Paperclip /></el-icon>
      </el-button>
    </el-button-group>

    <div class="toolbar-divider"></div>

    <!-- 插入 -->
    <el-dropdown trigger="click" @command="handleInsertCommand">
      <el-button size="small" type="primary" text>
        <el-icon><Plus /></el-icon>
        插入
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="image">🖼 图片</el-dropdown-item>
          <el-dropdown-item command="table">📊 表格</el-dropdown-item>
          <el-dropdown-item command="code">💻 代码块</el-dropdown-item>
          <el-dropdown-item command="link">🔗 链接</el-dropdown-item>
          <el-dropdown-item command="divider">─ 分割线</el-dropdown-item>
          <el-dropdown-item command="formula">∑ 公式</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div class="toolbar-divider"></div>

    <!-- 标题 -->
    <el-dropdown trigger="click" @command="handleHeadingCommand">
      <el-button size="small" text>
        正文
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="p">正文</el-dropdown-item>
          <el-dropdown-item command="h1">标题 1</el-dropdown-item>
          <el-dropdown-item command="h2">标题 2</el-dropdown-item>
          <el-dropdown-item command="h3">标题 3</el-dropdown-item>
          <el-dropdown-item command="h4">标题 4</el-dropdown-item>
          <el-dropdown-item command="h5">标题 5</el-dropdown-item>
          <el-dropdown-item command="h6">标题 6</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 字体 -->
    <el-dropdown trigger="click">
      <el-button size="small" text>
        默认字体
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>默认字体</el-dropdown-item>
          <el-dropdown-item>微软雅黑</el-dropdown-item>
          <el-dropdown-item>宋体</el-dropdown-item>
          <el-dropdown-item>黑体</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 字号 -->
    <el-dropdown trigger="click">
      <el-button size="small" text>
        14
        <el-icon class="arrow"><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>12</el-dropdown-item>
          <el-dropdown-item>14</el-dropdown-item>
          <el-dropdown-item>16</el-dropdown-item>
          <el-dropdown-item>18</el-dropdown-item>
          <el-dropdown-item>20</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div class="toolbar-divider"></div>

    <!-- 格式 -->
    <el-button-group size="small">
      <el-button @click="() => emit('format', 'bold')" :class="{ active: isActive('bold') }">
        <b>B</b>
      </el-button>
      <el-button @click="() => emit('format', 'italic')" :class="{ active: isActive('italic') }">
        <i>I</i>
      </el-button>
      <el-button @click="() => emit('format', 'underline')" :class="{ active: isActive('underline') }">
        <u>U</u>
      </el-button>
      <el-button @click="() => emit('format', 'strikethrough')">
        <s>S</s>
      </el-button>
    </el-button-group>

    <div class="toolbar-divider"></div>

    <!-- 颜色 -->
    <el-color-picker
      :model-value="fontColor"
      size="small"
      show-alpha
      @change="handleColorChange"
    >
      <template #default>
        <el-button size="small" text>
          <span style="color: var(--font-color)">A</span>
        </el-button>
      </template>
    </el-color-picker>

    <div class="toolbar-divider"></div>

    <!-- AI -->
    <el-button size="small" text @click="emit('ai')">
      <el-icon><MagicStick /></el-icon>
      AI
    </el-button>

    <div class="toolbar-divider"></div>

    <!-- 列表 -->
    <el-button-group size="small">
      <el-button @click="() => emit('format', 'todoList')">☑</el-button>
      <el-button @click="() => emit('format', 'orderedList')">≡</el-button>
      <el-button @click="() => emit('format', 'unorderedList')">☰</el-button>
      <el-button @click="emit('indentReduce')">←≡</el-button>
      <el-button @click="emit('indentAdd')">≡→</el-button>
    </el-button-group>

    <div class="toolbar-divider"></div>

    <!-- 插入工具 -->
    <el-button-group size="small">
      <el-button @click="emit('insertDivider')">
        <el-icon><Minus /></el-icon>
      </el-button>
      <el-button @click="emit('insertTable')">
        <el-icon><Grid /></el-icon>
      </el-button>
    </el-button-group>

    <div class="toolbar-divider"></div>

    <!-- 搜索 -->
    <el-button size="small" text @click="emit('search')">
      <el-icon><Search /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import {
  Plus, ArrowDown, RefreshLeft, RefreshRight, Printer, Paperclip,
  MagicStick, Minus, Grid, Search
} from '@element-plus/icons-vue'

// ✅ 定义命令类型
type InsertCommand = 'image' | 'table' | 'code' | 'link' | 'divider' | 'formula'
type HeadingCommand = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'orderedList' | 'unorderedList' | 'todoList' | 'blockquote'

// ✅ 声明 props 变量
const props = defineProps<{
  activeFormats: string[]
  fontColor?: string
}>()

const emit = defineEmits<{
  (e: 'format', type: FormatCommand): void
  (e: 'insert', command: InsertCommand): void
  (e: 'heading', command: HeadingCommand): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'print'): void
  (e: 'attachment'): void
  (e: 'ai'): void
  (e: 'indentAdd'): void
  (e: 'indentReduce'): void
  (e: 'insertDivider'): void
  (e: 'insertTable'): void
  (e: 'search'): void
  (e: 'fontColorChange', color: string): void
}>()

// ✅ 现在可以使用 props 了
function isActive(type: string): boolean {
  return props.activeFormats.includes(type)
}

// 处理插入命令
function handleInsertCommand(cmd: string | number) {
  if (typeof cmd === 'string') {
    emit('insert', cmd as InsertCommand)
  }
}

// 处理标题命令
function handleHeadingCommand(cmd: string | number) {
  if (typeof cmd === 'string') {
    emit('heading', cmd as HeadingCommand)
  }
}

// 处理颜色变化
function handleColorChange(val: string | null) {
  if (val) {
    emit('fontColorChange', val)
  }
}
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
  flex-shrink: 0;
  min-height: 48px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin: 0 4px;
  flex-shrink: 0;
}

.editor-toolbar .el-button {
  padding: 4px 10px;
  font-size: 13px;
}

.editor-toolbar .el-button-group .el-button {
  padding: 4px 10px;
}

.editor-toolbar .el-button.active {
  background: #e2e8f0;
  color: #0f172a;
}

.editor-toolbar .el-color-picker {
  --el-color-picker-size: 28px;
}

.arrow {
  font-size: 12px;
  margin-left: 2px;
}
</style>