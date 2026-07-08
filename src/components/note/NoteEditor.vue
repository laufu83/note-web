<!-- src/components/note/NoteEditor.vue -->
<template>
  <div class="note-body">
    <div class="editor-wrapper">
      <el-input
        v-show="!showPreview"
        :model-value="content"
        type="textarea"
        placeholder="输入'/'可插入内容"
        class="content-input auto-height-textarea"
        :autosize="{ minRows: 20, maxRows: 100 }"
        @input="handleInput"
        @keydown="emit('keydown', $event)"
      />

      <div v-show="showPreview" class="editor-preview auto-preview" v-html="renderedContent" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string
  showPreview: boolean
  renderedContent: string
}>()

const emit = defineEmits<{
  (e: 'update:content', value: string): void
  (e: 'change'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

// ✅ 合并 input 事件处理
function handleInput(val: string) {
  emit('update:content', val)
  emit('change')
}
</script>

<style scoped>
.note-body {
  flex: 1;
  padding: 16px 20px;
  overflow: hidden;
  min-height: 0;
}

.editor-wrapper {
  height: 100%;
}

.content-input {
  height: 100%;
}

.content-input :deep(.el-textarea) {
  height: 100%;
}

.content-input :deep(.el-textarea__inner) {
  height: 100% !important;
  border: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
  resize: none;
  background: transparent;
  box-shadow: none;
}

.content-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.content-input :deep(.el-textarea__inner::placeholder) {
  color: #cbd5e1;
}

.editor-preview {
  height: 100%;
  overflow-y: auto;
  padding: 4px 0;
  font-size: 15px;
  line-height: 1.8;
  color: #1e293b;
}

.editor-preview :deep(h1) { 
  font-size: 28px; 
  margin: 16px 0 8px; 
  font-weight: 700; 
}

.editor-preview :deep(h2) { 
  font-size: 22px; 
  margin: 14px 0 8px; 
  font-weight: 600; 
}

.editor-preview :deep(h3) { 
  font-size: 18px; 
  margin: 12px 0 6px; 
  font-weight: 600; 
}

.editor-preview :deep(blockquote) {
  border-left: 4px solid #e2e8f0;
  padding: 4px 16px;
  margin: 8px 0;
  background: #f8fafc;
  color: #475569;
}

.editor-preview :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #0f172a;
}

.editor-preview :deep(pre.code-block) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.editor-preview :deep(pre.code-block code) {
  background: transparent;
  color: inherit;
  padding: 0;
}

.editor-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.editor-preview :deep(th),
.editor-preview :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  text-align: left;
}

.editor-preview :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
}

.editor-preview :deep(ul),
.editor-preview :deep(ol) {
  padding-left: 24px;
  margin: 4px 0;
}

.editor-preview :deep(li.todo) {
  list-style: none;
}

.editor-preview :deep(li.todo.done) {
  text-decoration: line-through;
  color: #94a3b8;
}

.editor-preview :deep(hr) {
  border: none;
  border-top: 2px dashed #e2e8f0;
  margin: 16px 0;
}
</style>