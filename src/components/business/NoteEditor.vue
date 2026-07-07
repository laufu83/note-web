<template>
  <div class="note-editor">
    <div class="editor-toolbar">
      <el-button-group>
        <el-button size="small" @click="insertMarkdown('**', '**')">
          <strong>B</strong>
        </el-button>
        <el-button size="small" @click="insertMarkdown('*', '*')">
          <em>I</em>
        </el-button>
        <el-button size="small" @click="insertMarkdown('`', '`')">
          <code>代码</code>
        </el-button>
        <el-button size="small" @click="insertMarkdown('# ', '')">H1</el-button>
        <el-button size="small" @click="insertMarkdown('## ', '')">H2</el-button>
        <el-button size="small" @click="insertMarkdown('### ', '')">H3</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="insertMarkdown('- ', '')">
          <el-icon><List /></el-icon>
        </el-button>
        <el-button size="small" @click="insertMarkdown('1. ', '')">
          <el-icon><List /></el-icon>
          1.
        </el-button>
        <el-button size="small" @click="insertMarkdown('> ', '')">
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="insertLink">
          <el-icon><Link /></el-icon>
        </el-button>
        <el-button size="small" @click="insertImage">
          <el-icon><Picture /></el-icon>
        </el-button>
      </el-button-group>

      <el-button size="small" @click="togglePreview">
        <el-icon><View /></el-icon>
        {{ showPreview ? '编辑' : '预览' }}
      </el-button>
    </div>

    <div class="editor-body">
      <el-input
        v-show="!showPreview"
        v-model="content"
        type="textarea"
        :rows="20"
        placeholder="开始写作..."
        class="editor-textarea"
      />

      <div v-show="showPreview" class="editor-preview" v-html="renderedContent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { List, ChatDotRound, Link, Picture, View } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const content = ref(props.modelValue || '')
const showPreview = ref(false)

const renderedContent = computed(() => {
  return renderMarkdown(content.value)
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  // 简单 Markdown 渲染（实际项目可使用 marked 或 markdown-it）
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n/g, '<br>')
  return html
}

function insertMarkdown(prefix: string, suffix: string) {
  const textarea = document.querySelector('.editor-textarea textarea') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.substring(start, end)
  const before = content.value.substring(0, start)
  const after = content.value.substring(end)

  content.value = before + prefix + selected + suffix + after

  // 恢复光标位置
  setTimeout(() => {
    textarea.focus()
    const newPos = start + prefix.length + selected.length + suffix.length
    textarea.setSelectionRange(newPos, newPos)
  }, 0)

  emit('update:modelValue', content.value)
}

function insertLink() {
  const url = prompt('请输入链接地址：')
  if (url) {
    const text = prompt('请输入链接文字：') || url
    insertMarkdown(`[${text}](`, `${url})`)
  }
}

function insertImage() {
  const url = prompt('请输入图片地址：')
  if (url) {
    insertMarkdown(`![图片](${url})`, '')
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

watch(content, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  if (val !== content.value) {
    content.value = val
  }
})
</script>

<style scoped>
.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.editor-textarea {
  height: 100%;
}

.editor-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  border: none;
  border-radius: 0;
  resize: none;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.8;
  padding: 16px;
}

.editor-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.editor-preview {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  line-height: 1.8;
}

.editor-preview h1,
.editor-preview h2,
.editor-preview h3 {
  margin: 16px 0 8px;
}

.editor-preview blockquote {
  margin: 8px 0;
  padding: 8px 16px;
  background: #f5f7fa;
  border-left: 4px solid #667eea;
  border-radius: 4px;
}

.editor-preview code {
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.editor-preview li {
  margin-left: 20px;
}
</style>