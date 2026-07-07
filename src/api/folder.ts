import request from './request'
import type { Folder, FolderNode, CreateFolderRequest } from '@/types'

export const folderApi = {
  // 创建文件夹
  create(data: CreateFolderRequest) {
    return request.post<Folder>('/folders', data)
  },

  // 获取文件夹树
  getTree() {
    return request.get<FolderNode[]>('/folders/tree')
  },

  // 获取根文件夹列表
  getRoots() {
    return request.get<Folder[]>('/folders/roots')
  },

  // 获取子文件夹列表
  getChildren(parentId: string | null, params?: { page?: number; pageSize?: number; keyword?: string }) {
    return request.get<{ items: Folder[]; total: number }>('/folders/children', {
      params: { parentId: parentId || undefined, ...params },
    })
  },

  // 获取文件夹详情
  getById(id: string) {
    return request.get<Folder>(`/folders/${id}`)
  },

  // 更新文件夹
  update(id: string, data: Partial<CreateFolderRequest & { sortOrder?: number }>) {
    return request.put<Folder>(`/folders/${id}`, data)
  },

  // 删除文件夹
  delete(id: string) {
    return request.delete(`/folders/${id}`)
  },

  // 恢复文件夹
  restore(id: string) {
    return request.post(`/folders/${id}/restore`)
  },

  // 永久删除文件夹
  permanentDelete(id: string) {
    return request.delete(`/folders/${id}/permanent`)
  },

  // 获取回收站文件夹
  getDeleted() {
    return request.get<Folder[]>('/folders/deleted')
  },
}