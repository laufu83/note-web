import request from './request'
import type { NoteTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '@/types'

export const templateApi = {
  // 获取模板列表
  list(params?: { keyword?: string; page?: number; pageSize?: number }) {
    return request.get<{ items: NoteTemplate[]; total: number }>('/templates', { params })
  },

  // 获取模板详情
  getById(id: string) {
    return request.get<NoteTemplate>(`/templates/${id}`)
  },

  // 创建模板
  create(data: CreateTemplateRequest) {
    return request.post<NoteTemplate>('/templates', data)
  },

  // 更新模板
  update(id: string, data: UpdateTemplateRequest) {
    return request.put<NoteTemplate>(`/templates/${id}`, data)
  },

  // 删除模板
  delete(id: string) {
    return request.delete(`/templates/${id}`)
  },

  // 设为默认模板
  setDefault(id: string) {
    return request.post<NoteTemplate>(`/templates/${id}/default`)
  },

  // 应用模板到当前笔记（获取模板内容）
  apply(id: string) {
    return request.get<{ title: string; content: string; tagIds?: string[] }>(`/templates/${id}/apply`)
  },
}