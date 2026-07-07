import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { getToken, setToken, removeToken } from '@/utils/storage'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const accessToken = ref<string>(getToken() || '')
  const refreshToken = ref<string>('')

  const isLoggedIn = computed(() => !!accessToken.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || username.value)

  function setUser(user: UserInfo, access: string, refresh: string) {
    userInfo.value = user
    accessToken.value = access
    refreshToken.value = refresh
    setToken(access)
  }

  function clearUser() {
    userInfo.value = null
    accessToken.value = ''
    refreshToken.value = ''
    removeToken()
  }

  function restoreSession() {
    const token = getToken()
    if (token) {
      accessToken.value = token
      // 获取用户信息
      authApi.getMe().then((user) => {
        userInfo.value = user
      }).catch(() => {
        clearUser()
      })
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // 忽略
    } finally {
      clearUser()
    }
  }

  return {
    userInfo,
    accessToken,
    refreshToken,
    isLoggedIn,
    username,
    nickname,
    setUser,
    clearUser,
    restoreSession,
    logout,
  }
})