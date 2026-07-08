// src/store/modules/folderContext.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ViewType = 'root' | 'folder' | 'starred' | 'trash' | 'tag' | 'settings'

export interface FolderContext {
  id: string | null
  name: string
  path: string
  parentId: string | null
}

export const useFolderContextStore = defineStore('folderContext', () => {
  // ============================================================
  // 状态
  // ============================================================

  const currentView = ref<ViewType>('root')
  const currentFolderId = ref<string | null>(null)
  const currentTagId = ref<string | null>(null)
  const folderPath = ref<FolderContext[]>([])
  const history = ref<string[]>([])

  // ============================================================
  // 计算属性
  // ============================================================

  const isRoot = computed(() => currentView.value === 'root')
  const currentFolderName = computed(() => {
    if (folderPath.value.length === 0) return '全部笔记'
    return folderPath.value[folderPath.value.length - 1]?.name || '全部笔记'
  })

  // ============================================================
  // 方法
  // ============================================================

  /**
   * 切换到根目录
   */
  function switchToRoot() {
    currentView.value = 'root'
    currentFolderId.value = null
    currentTagId.value = null
    folderPath.value = []
    history.value = []
  }

  /**
   * 切换到文件夹
   */
  function switchToFolder(folderId: string, folderName: string, parentId: string | null, tree: any[]) {
    if (currentFolderId.value !== null) {
      history.value.push(currentFolderId.value)
    }
    
    currentView.value = 'folder'
    currentFolderId.value = folderId
    currentTagId.value = null
    
    // 构建路径
    folderPath.value = buildFolderPath(folderId, tree)
    if (folderPath.value.length === 0) {
      folderPath.value = [{
        id: folderId,
        name: folderName,
        path: `/${folderId}`,
        parentId: parentId
      }]
    }
  }

  /**
   * 切换到其他视图
   */
  function switchToView(view: Exclude<ViewType, 'folder'>) {
    currentView.value = view
    currentFolderId.value = null
    currentTagId.value = null
    folderPath.value = []
    history.value = []
  }

  /**
   * 切换到标签
   */
  function switchToTag(tagId: string) {
    currentView.value = 'tag'
    currentTagId.value = tagId
    currentFolderId.value = null
    folderPath.value = []
    history.value = []
  }

  /**
   * 返回上一级
   */
  function goBack(): string | null {
    if (history.value.length === 0) {
      switchToRoot()
      return null
    }
    
    const prevId = history.value.pop()!
    // 需要重新构建路径，由调用方传入 tree
    return prevId
  }

  /**
   * 构建文件夹路径
   */
  function buildFolderPath(folderId: string, tree: any[]): FolderContext[] {
    const path: FolderContext[] = []
    const findPath = (items: any[], targetId: string, ancestors: FolderContext[] = []): boolean => {
      for (const item of items) {
        const current: FolderContext = {
          id: item.id,
          name: item.name,
          path: [...ancestors.map(a => a.id), item.id].join('/'),
          parentId: item.parentId || null
        }
        
        if (item.id === targetId) {
          path.push(...ancestors, current)
          return true
        }
        
        if (item.children) {
          const found = findPath(item.children, targetId, [...ancestors, current])
          if (found) return true
        }
      }
      return false
    }
    
    findPath(tree, folderId)
    return path
  }

  /**
   * 重置状态
   */
  function reset() {
    currentView.value = 'root'
    currentFolderId.value = null
    currentTagId.value = null
    folderPath.value = []
    history.value = []
  }

  return {
    // 状态
    currentView,
    currentFolderId,
    currentTagId,
    folderPath,
    history,
    
    // 计算属性
    isRoot,
    currentFolderName,
    
    // 方法
    switchToRoot,
    switchToFolder,
    switchToView,
    switchToTag,
    goBack,
    reset,
    buildFolderPath,
  }
})