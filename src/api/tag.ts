import request from './request'
import type { Tag, TagInfo, CreateTagRequest } from '@/types'

export const tagApi = {
  // 创建标签
  create(data: CreateTagRequest) {
    return request.post<Tag>('/tags', data)
  },

  // 获取标签列表
  list(params?: { keyword?: string; page?: number; pageSize?: number }) {
    return request.get<{ items: Tag[]; total: number }>('/tags', { params })
  },

  // 获取标签详情
  getById(id: string) {
    return request.get<Tag>(`/tags/${id}`)
  },

  // 更新标签
  update(id: string, data: Partial<CreateTagRequest>) {
    return request.put<Tag>(`/tags/${id}`, data)
  },

  // 删除标签
  delete(id: string) {
    return request.delete(`/tags/${id}`)
  },

  // 批量删除标签
  batchDelete(ids: string[]) {
    return request.post<{ deleted: string[]; notFound: string[] }>('/tags/batch-delete', { ids })
  },
}