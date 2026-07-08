// src/api/auth.ts

import request from './request'
import type { LoginRequest, RegisterRequest, UserInfo } from '@/types'

// ============================================================
// 类型定义
// ============================================================

export interface LoginResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenId: string
  deviceType: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

export interface RegisterResponse {
  id: string
  username: string
  email: string
  nickname: string | null
}

export interface DeviceInfo {
  deviceId: string
  deviceName: string
  deviceType: string
  deviceOs?: string
  deviceBrowser?: string
  ipAddress?: string
  userAgent?: string
  loginLocation?: string
}

// ============================================================
// API 方法
// ============================================================

export const authApi = {
  /**
   * 用户注册
   */
  register(data: RegisterRequest) {
    return request.post<RegisterResponse>('/auth/register', data)
  },

  /**
   * 用户登录
   */
  login(data: LoginRequest & { deviceInfo?: DeviceInfo }) {
    return request.post<LoginResponse>('/auth/login', data)
  },

  /**
   * 刷新 Token
   */
  refreshToken(refreshToken: string) {
    return request.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
  },

  /**
   * 获取当前用户信息
   */
  getMe() {
    return request.get<UserInfo>('/auth/me')
  },

  /**
   * 更新用户信息
   */
  updateMe(data: Partial<UserInfo>) {
    return request.put<UserInfo>('/auth/me', data)
  },

  /**
   * 登出
   */
  logout() {
    return request.post('/auth/logout')
  },

  /**
   * 获取设备列表
   */
  getDevices() {
    return request.get<any[]>('/auth/devices')
  },

  /**
   * 撤销设备
   */
  revokeDevice(deviceId: string) {
    return request.delete(`/auth/devices/${deviceId}`)
  },

  /**
   * 登出所有设备
   */
  logoutAll() {
    return request.post('/auth/logout-all')
  },
}