// src/views/main/composables/useNoteEditor.ts
import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useNoteEditor(content: Ref<string>) {
  const activeFormats = ref<string[]>([])
  const fontColor = ref('#000000')

  function insertMarkdown(prefix: string, suffix: string, placeholder: string = '') {
    const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
    if (!textarea) {
      content.value += prefix + placeholder + suffix
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.value.substring(start, end) || placeholder
    content.value = content.value.substring(0, start) + prefix + selected + suffix + content.value.substring(end)
    setTimeout(() => {
      textarea.focus()
      const newPos = start + prefix.length + selected.length + suffix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  function handleFormat(type: string) {
    const map: Record<string, [string, string]> = {
      bold: ['**', '**'],
      italic: ['*', '*'],
      underline: ['<u>', '</u>'],
      strikethrough: ['~~', '~~'],
      orderedList: ['\n1. ', ''],
      unorderedList: ['\n- ', ''],
      todoList: ['\n- [ ] ', ''],
      blockquote: ['\n> ', ''],
    }
    if (map[type]) insertMarkdown(map[type][0], map[type][1])
    const index = activeFormats.value.indexOf(type)
    if (index > -1) activeFormats.value.splice(index, 1)
    else activeFormats.value.push(type)
  }

  function handleInsert(command: string) {
    const map: Record<string, string> = {
      image: '![图片](url)',
      table: '| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |',
      code: '```语言\n代码\n```',
      link: '[链接文字](url)',
      divider: '---',
      formula: '$$ 公式 $$',
    }
    const text = map[command] || ''
    if (text) content.value += text
  }

  function handleHeading(command: string) {
    const map: Record<string, string> = {
      p: '',
      h1: '# ', h2: '## ', h3: '### ', h4: '#### ', h5: '##### ', h6: '###### ',
    }
    const prefix = map[command] || ''
    insertMarkdown(prefix, '')
  }

  function insertDivider() {
    content.value += '\n---\n'
  }

  function insertTable() {
    content.value += '\n| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |\n'
  }

  function indentAdd() {
    insertMarkdown('  ', '')
  }

  function indentReduce() {
    const textarea = document.querySelector('.auto-height-textarea textarea') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const text = content.value
    if (text.substring(start - 2, start) === '  ') {
      content.value = text.slice(0, start - 2) + text.slice(start)
      setTimeout(() => textarea.setSelectionRange(start - 2, start - 2), 0)
    }
  }

  function setFontColor(color: string) {
    fontColor.value = color
    document.documentElement.style.setProperty('--font-color', color)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      const textarea = event.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      content.value = content.value.substring(0, start) + '  ' + content.value.substring(end)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  // 占位功能
  function undo() { ElMessage.info('撤销待开发') }
  function redo() { ElMessage.info('重做待开发') }
  function printDoc() { window.print() }
  function openAttachment() { ElMessage.info('附件上传待开发') }
  function aiOptimize() { ElMessage.info('AI文本美化功能待开发') }
  function openSearch() { ElMessage.info('搜索功能待开发') }

  return {
    activeFormats,
    fontColor,
    handleFormat,
    handleInsert,
    handleHeading,
    insertDivider,
    insertTable,
    indentAdd,
    indentReduce,
    setFontColor,
    handleKeydown,
    undo,
    redo,
    printDoc,
    openAttachment,
    aiOptimize,
    openSearch,
  }
}