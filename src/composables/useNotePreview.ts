// src/composables/useNotePreview.ts
import { computed, type Ref } from 'vue'

export function useNotePreview(content: Ref<string>) {
  function parseMarkdownTable(match: string, headerRaw: string, rowsRaw: string): string {
    const headers = headerRaw
      .split('|')
      .filter(h => h.trim())
      .map(h => `<th>${h.trim()}</th>`)
      .join('')

    const body = rowsRaw
      .split('\n')
      .filter(r => r.trim())
      .map((rowStr: string) => {
        const cells = rowStr
          .split('|')
          .filter(c => c.trim())
          .map(c => `<td>${c.trim()}</td>`)
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('')

    return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`
  }

  function escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  const renderedContent = computed(() => {
    let text = content.value || ''

    // 代码块
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match: string, lang: string, code: string) => {
      return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
    })

    // 行内代码
    text = text.replace(/`([^`]+)`/g, (match: string, code: string) => `<code>${code}</code>`)
    
    // 标题
    text = text.replace(/^### (.+)$/gm, (match: string, content: string) => `<h3>${content}</h3>`)
    text = text.replace(/^## (.+)$/gm, (match: string, content: string) => `<h2>${content}</h2>`)
    text = text.replace(/^# (.+)$/gm, (match: string, content: string) => `<h1>${content}</h1>`)
    
    // 格式
    text = text.replace(/\*\*(.+?)\*\*/g, (match: string, content: string) => `<strong>${content}</strong>`)
    text = text.replace(/\*(.+?)\*/g, (match: string, content: string) => `<em>${content}</em>`)
    text = text.replace(/<u>(.+?)<\/u>/g, (match: string, content: string) => `<u>${content}</u>`)
    text = text.replace(/~~(.+?)~~/g, (match: string, content: string) => `<s>${content}</s>`)
    
    // 引用
    text = text.replace(/^> (.+)$/gm, (match: string, content: string) => `<blockquote>${content}</blockquote>`)
    
    // 待办列表
    text = text.replace(/^-\s*\[x\]\s*(.+)$/gm, (match: string, content: string) => `<li class="todo done">☑ ${content}</li>`)
    text = text.replace(/^-\s*\[ \]\s*(.+)$/gm, (match: string, content: string) => `<li class="todo">☐ ${content}</li>`)
    
    // 列表
    text = text.replace(/^- (.+)$/gm, (match: string, content: string) => `<li>${content}</li>`)
    text = text.replace(/^(\d+)\. (.+)$/gm, (match: string, num: string, content: string) => `<li>${content}</li>`)
    
    // 表格
    text = text.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)*)/g, parseMarkdownTable)
    
    // 分割线
    text = text.replace(/^---$/gm, '<hr>')
    
    // 换行
    text = text.replace(/\n/g, '<br>')

    return text
  })

  return {
    renderedContent,
    escapeHtml,
  }
}