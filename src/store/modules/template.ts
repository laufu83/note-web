import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NoteTemplate } from '@/types'
import { templateApi } from '@/api/template'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<NoteTemplate[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentTemplate = ref<NoteTemplate | null>(null)

  async function loadTemplates(params?: any) {
    loading.value = true
    try {
      const result = await templateApi.list(params)
      templates.value = result.items
      total.value = result.total
      return result
    } finally {
      loading.value = false
    }
  }

  async function loadTemplate(id: string) {
    loading.value = true
    try {
      const template = await templateApi.getById(id)
      currentTemplate.value = template
      return template
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(data: any) {
    const template = await templateApi.create(data)
    templates.value.unshift(template)
    total.value++
    return template
  }

  async function updateTemplate(id: string, data: any) {
    const template = await templateApi.update(id, data)
    const index = templates.value.findIndex(t => t.id === id)
    if (index !== -1) templates.value[index] = template
    if (currentTemplate.value?.id === id) currentTemplate.value = template
    return template
  }

  async function deleteTemplate(id: string) {
    await templateApi.delete(id)
    templates.value = templates.value.filter(t => t.id !== id)
    total.value--
    if (currentTemplate.value?.id === id) currentTemplate.value = null
  }

  async function setDefault(id: string) {
    const template = await templateApi.setDefault(id)
    // 刷新列表
    await loadTemplates()
    return template
  }

  async function applyTemplate(id: string) {
    return await templateApi.apply(id)
  }

  function clearCurrent() {
    currentTemplate.value = null
  }

  return {
    templates,
    total,
    loading,
    currentTemplate,
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefault,
    applyTemplate,
    clearCurrent,
  }
})