import request from './request'
import type { NoteInfo, CreateNoteRequest, UpdateNoteRequest, PaginatedResult } from '@/types'

export const noteApi = {
  // 创建笔记
  create(data: CreateNoteRequest) {
    return request.post<NoteInfo>('/notes', data)
  },

  // 获取笔记列表
  list(params: {
    folderId?: string | null
    isStarred?: number
    isArchived?: number
    keyword?: string
    tagId?: string
    page?: number
    pageSize?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  }) {
    return request.get<PaginatedResult<NoteInfo>>('/notes', { params })
  },

  // 获取星标笔记
  getStarred(params?: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResult<NoteInfo>>('/notes/starred', { params })
  },

  // 获取回收站笔记
  getDeleted(params?: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResult<NoteInfo>>('/notes/deleted', { params })
  },

  // 获取笔记详情
  getById(id: string) {
    return request.get<NoteInfo>(`/notes/${id}`)
  },

  // 更新笔记
  update(id: string, data: UpdateNoteRequest) {
    return request.put<NoteInfo>(`/notes/${id}`, data)
  },

  // 删除笔记
  delete(id: string) {
    return request.delete(`/notes/${id}`)
  },

  // 恢复笔记
  restore(id: string) {
    return request.post(`/notes/${id}/restore`)
  },

  // 永久删除笔记
  permanentDelete(id: string) {
    return request.delete(`/notes/${id}/permanent`)
  },

  // 切换星标
  toggleStar(id: string, starred?: number) {
    return request.post<{ isStarred: number }>(`/notes/${id}/star`, { starred })
  },

  // 切换归档
  toggleArchive(id: string, archived?: number) {
    return request.post<{ isArchived: number }>(`/notes/${id}/archive`, { archived })
  },

  // 获取历史版本
  getHistory(id: string, params?: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResult<any>>(`/notes/${id}/history`, { params })
  },

  // 恢复历史版本
  restoreVersion(id: string, version: number) {
    return request.post<NoteInfo>(`/notes/${id}/history/${version}/restore`)
  },

  // 搜索笔记
  search(keyword: string, params?: { page?: number; pageSize?: number }) {
    return request.get<PaginatedResult<NoteInfo>>('/notes/search', { params: { q: keyword, ...params } })
  },
}