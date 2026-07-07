import request from './request'
import type { UserInfo, OperationLog, SystemConfig } from '@/types'

export const adminApi = {
  // ==================== 用户管理 ====================
  getUsers(params?: { page?: number; pageSize?: number; keyword?: string; status?: number }) {
    return request.get<{ items: UserInfo[]; total: number }>('/admin/users', { params })
  },

  getUserById(id: string) {
    return request.get<UserInfo>(`/admin/users/${id}`)
  },

  updateUser(id: string, data: Partial<UserInfo>) {
    return request.put<UserInfo>(`/admin/users/${id}`, data)
  },

  deleteUser(id: string) {
    return request.delete(`/admin/users/${id}`)
  },

  // ==================== 操作日志 ====================
  getLogs(params?: {
    page?: number
    pageSize?: number
    userId?: string
    operationType?: string
    resourceType?: string
    startDate?: string
    endDate?: string
    status?: number
  }) {
    return request.get<{ items: OperationLog[]; total: number }>('/admin/logs', { params })
  },

  getLogDetail(id: string) {
    return request.get<OperationLog>(`/admin/logs/${id}`)
  },

  // ==================== 系统配置 ====================
  getConfigs(params?: { group?: string }) {
    return request.get<SystemConfig[]>('/admin/configs', { params })
  },

  getConfigByKey(key: string) {
    return request.get<SystemConfig>(`/admin/configs/${key}`)
  },

  updateConfig(key: string, value: any) {
    return request.put<SystemConfig>(`/admin/configs/${key}`, { value })
  },

  createConfig(data: Partial<SystemConfig>) {
    return request.post<SystemConfig>('/admin/configs', data)
  },

  deleteConfig(key: string) {
    return request.delete(`/admin/configs/${key}`)
  },
}