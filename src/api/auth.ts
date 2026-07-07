import request from './request'
import type { LoginRequest, RegisterRequest, UserInfo } from '@/types'

export interface LoginResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenId: string
  deviceType: string
}

export const authApi = {
  // 注册
  register(data: RegisterRequest) {
    return request.post<{ id: string; username: string; email: string; nickname: string | null }>(
      '/auth/register',
      data
    )
  },

  // 登录
  login(data: LoginRequest) {
    return request.post<LoginResponse>('/auth/login', data)
  },

  // 刷新 token
  refreshToken(refreshToken: string) {
    return request.post<{ accessToken: string; expiresIn: number }>('/auth/refresh', { refreshToken })
  },

  // 获取当前用户信息
  getMe() {
    return request.get<UserInfo>('/auth/me')
  },

  // 更新用户信息
  updateMe(data: Partial<UserInfo>) {
    return request.put<UserInfo>('/auth/me', data)
  },

  // 登出
  logout() {
    return request.post('/auth/logout')
  },

  // 获取设备列表
  getDevices() {
    return request.get<any[]>('/auth/devices')
  },

  // 撤销设备
  revokeDevice(deviceId: string) {
    return request.delete(`/auth/devices/${deviceId}`)
  },

  // 登出所有设备
  logoutAll() {
    return request.post('/auth/logout-all')
  },
}