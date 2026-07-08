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

  return {
    userInfo,
    accessToken,
    refreshToken,
    isLoggedIn,
    setUser,
    clearUser,
    restoreSession,
    initToken,
    updateAccessToken,
  }
})