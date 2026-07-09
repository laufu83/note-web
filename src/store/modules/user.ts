// src/store/modules/user.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { authApi } from '@/api/auth'

const TOKEN_KEY = 'note_cloud_token'
const REFRESH_TOKEN_KEY = 'note_cloud_refresh_token'
const USER_KEY = 'note_cloud_user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')

  // 初始化
  function initToken() {
    const token = localStorage.getItem(TOKEN_KEY)
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (token) {
      accessToken.value = token
    }
    if (refresh) {
      refreshToken.value = refresh
    }
  }
  
  initToken()

  const isLoggedIn = computed(() => !!accessToken.value)

  function setUser(user: UserInfo, access: string, refresh: string) {
    userInfo.value = user
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  function clearUser() {
    userInfo.value = null
    accessToken.value = ''
    refreshToken.value = ''
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function restoreSession() {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      accessToken.value = token
      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refresh) {
        refreshToken.value = refresh
      }
      // 验证 Token 是否有效
      authApi.getMe().then((user) => {
        userInfo.value = user
      }).catch(() => {
        clearUser()
      })
    }
  }

  // 更新 Token（用于刷新时）
  function updateAccessToken(token: string) {
    accessToken.value = token
    localStorage.setItem(TOKEN_KEY, token)
  }
  /**
   * 🔥 登出（调用后端接口 + 清除本地数据）
   */
  async function logout() {
    // 1. 调用后端登出接口（即使失败也继续清理）
    try {
      await authApi.logout()
    } catch (error) {
      // 后端接口失败不阻塞登出流程
      console.warn('登出接口调用失败:', error)
    }
    
    // 2. 清除本地存储
    clearUser()
  }
   /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo.value))
    }
  }
  return {
    userInfo,
    accessToken,
    refreshToken,
    isLoggedIn,
    setUser,
    clearUser,
    logout,
    updateUserInfo,
    restoreSession,
    initToken,
    updateAccessToken,
  }
})