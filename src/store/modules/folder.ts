import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Folder, FolderNode } from '@/types'
import { folderApi } from '@/api/folder'

export const useFolderStore = defineStore('folder', () => {
  const tree = ref<FolderNode[]>([])
  const currentFolder = ref<Folder | null>(null)
  const loading = ref(false)

  async function loadTree() {
    loading.value = true
    try {
      tree.value = await folderApi.getTree()
      return tree.value
    } finally {
      loading.value = false
    }
  }

  async function createFolder(data: any) {
    const folder = await folderApi.create(data)
    await loadTree()
    return folder
  }

  async function updateFolder(id: string, data: any) {
    const folder = await folderApi.update(id, data)
    if (currentFolder.value?.id === id) {
      currentFolder.value = folder
    }
    await loadTree()
    return folder
  }

  async function deleteFolder(id: string) {
    await folderApi.delete(id)
    if (currentFolder.value?.id === id) {
      currentFolder.value = null
    }
    await loadTree()
  }

  function setCurrentFolder(folder: Folder | null) {
    currentFolder.value = folder
  }

  return {
    tree,
    currentFolder,
    loading,
    loadTree,
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
  }
})