import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TagInfo } from '@/types'
import { tagApi } from '@/api/tag'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<TagInfo[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentTag = ref<TagInfo | null>(null)

  async function loadTags(params?: { keyword?: string; page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const result = await tagApi.list(params)
      tags.value = result.items
      total.value = result.total
      return result
    } finally {
      loading.value = false
    }
  }

  async function loadTag(id: string) {
    loading.value = true
    try {
      const tag = await tagApi.getById(id)
      currentTag.value = tag
      return tag
    } finally {
      loading.value = false
    }
  }

  async function createTag(data: { name: string; color?: string; icon?: string }) {
    const tag = await tagApi.create(data)
    tags.value.unshift(tag)
    total.value++
    return tag
  }

  async function updateTag(id: string, data: { name?: string; color?: string; icon?: string }) {
    const tag = await tagApi.update(id, data)
    const index = tags.value.findIndex(t => t.id === id)
    if (index !== -1) tags.value[index] = tag
    if (currentTag.value?.id === id) currentTag.value = tag
    return tag
  }

  async function deleteTag(id: string) {
    await tagApi.delete(id)
    tags.value = tags.value.filter(t => t.id !== id)
    total.value--
    if (currentTag.value?.id === id) currentTag.value = null
  }

  async function batchDeleteTags(ids: string[]) {
    const result = await tagApi.batchDelete(ids)
    tags.value = tags.value.filter(t => !ids.includes(t.id))
    total.value -= result.deleted?.length || 0
    return result
  }

  function clearCurrent() {
    currentTag.value = null
  }

  return {
    tags,
    total,
    loading,
    currentTag,
    loadTags,
    loadTag,
    createTag,
    updateTag,
    deleteTag,
    batchDeleteTags,
    clearCurrent,
  }
})