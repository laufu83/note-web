// src/composables/useFolderCache.ts
import { ref } from 'vue'

interface CacheData {
  notes: any[]
  folders: any[]
  total: number
  searchKeyword: string
  currentPage: number
  sortBy: string
  filters: any
  timestamp: number
}

// 使用全局 Map 存储缓存
const cacheMap = new Map<string, CacheData>()

export function useFolderCache() {
  const cachedFolderId = ref<string | null>(null)

  /**
   * 生成缓存键 - 包含所有影响数据的参数
   */
  function getCacheKey(
    folderId: string | null,
    searchKeyword: string = '',
    currentPage: number = 1,
    sortBy: string = 'updatedAt_desc',
    filters: any = {}
  ): string {
    // 构建完整的缓存键
    const filterStr = JSON.stringify(filters)
    return `${folderId || 'all'}_${searchKeyword}_${currentPage}_${sortBy}_${filterStr}`
  }

  /**
   * 获取缓存数据
   */
  function getCache(key: string): CacheData | null {
    const data = cacheMap.get(key)
    if (data) {
      // 检查缓存是否过期（5分钟）
      const now = Date.now()
      if (now - data.timestamp > 5 * 60 * 1000) {
        cacheMap.delete(key)
        return null
      }
      return data
    }
    return null
  }

  /**
   * 设置缓存数据
   */
  function setCache(
    key: string,
    data: Omit<CacheData, 'timestamp'>
  ) {
    cacheMap.set(key, {
      ...data,
      timestamp: Date.now()
    })
    // 从key中提取folderId
    const folderId = key.split('_')[0]
    cachedFolderId.value = folderId === 'all' ? null : folderId
  }

  /**
   * 清理指定目录的缓存
   */
  function clearCacheByFolderId(folderId: string | null) {
    const prefix = folderId || 'all'
    const keysToDelete: string[] = []
    for (const key of cacheMap.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => cacheMap.delete(key))
    if (cachedFolderId.value === folderId) {
      cachedFolderId.value = null
    }
  }

  /**
   * 清理所有缓存
   */
  function clearAllCache() {
    cacheMap.clear()
    cachedFolderId.value = null
  }

  /**
   * 获取当前缓存的目录ID
   */
  function getCachedFolderId(): string | null {
    return cachedFolderId.value
  }

  return {
    cacheMap,
    cachedFolderId,
    getCache,
    setCache,
    clearCacheByFolderId,
    clearAllCache,
    getCachedFolderId,
  }
}