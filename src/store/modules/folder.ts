// src/store/modules/folder.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Folder, FolderNode } from '@/types'
import { folderApi } from '@/api/folder'

export const useFolderStore = defineStore('folder', () => {
  const tree = ref<FolderNode[]>([])
  const currentFolder = ref<Folder | null>(null)
  const loading = ref(false)
  const refreshKey = ref(0)

  async function loadTree() {
    loading.value = true
    try {
      tree.value = await folderApi.getTree()
      return tree.value
    } finally {
      loading.value = false
    }
  }

  function forceRefresh() {
    refreshKey.value++
  }

  async function refreshCurrentFolder() {
    await loadTree()
    forceRefresh()
  }

  async function createFolder(data: any) {
    const folder = await folderApi.create(data)
    await refreshCurrentFolder()
    return folder
  }

  async function updateFolder(id: string, data: any) {
    const folder = await folderApi.update(id, data)
    await refreshCurrentFolder()
    return folder
  }

  async function deleteFolder(id: string) {
    await folderApi.delete(id)
    await refreshCurrentFolder()
  }

  // 移动文件夹（使用 updateFolder）
  async function moveFolder(id: string, parentId: string | null) {
    return await updateFolder(id, { parentId: parentId || undefined })
  }

  // 重命名文件夹（使用 updateFolder）
  async function renameFolder(id: string, name: string) {
    return await updateFolder(id, { name })
  }

  // 复制文件夹
  async function copyFolder(id: string) {
    // 先获取文件夹详情
    const folder = await folderApi.getById(id)
    // 创建副本
    const newFolder = await folderApi.create({
      name: `${folder.name} - 副本`,
      parentId: folder.parentId
    })
    await refreshCurrentFolder()
    return newFolder
  }

  // 永久删除
  async function permanentDelete(id: string) {
    await folderApi.permanentDelete(id)
    await refreshCurrentFolder()
  }

  function setCurrentFolder(folder: Folder | null) {
    currentFolder.value = folder
  }

  // 获取文件夹路径
  function getFolderPath(folderId: string): string {
    const findPath = (folders: any[], id: string, path: string[] = []): string[] | null => {
      for (const f of folders) {
        const currentPath = [...path, f.name]
        if (f.id === id) {
          return currentPath
        }
        if (f.children) {
          const result = findPath(f.children, id, currentPath)
          if (result) return result
        }
      }
      return null
    }
    
    const path = findPath(tree.value, folderId)
    return path ? path.join(' / ') : ''
  }

  return {
    tree,
    currentFolder,
    loading,
    refreshKey,
    loadTree,
    forceRefresh,
    refreshCurrentFolder,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    renameFolder,
    copyFolder,
    permanentDelete,
    setCurrentFolder,
    getFolderPath,
  }
})