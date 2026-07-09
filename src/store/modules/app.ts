// src/store/modules/app.ts

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ============================================================
  // 状态
  // ============================================================
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const loading = ref(false)

  // ============================================================
  // ✅ 从 localStorage 加载状态
  // ============================================================
  function loadState() {
    // 加载侧边栏折叠状态
    const savedSidebar = localStorage.getItem('sidebar_collapsed')
    if (savedSidebar !== null) {
      sidebarCollapsed.value = savedSidebar === 'true'
    }

    // 加载主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }

  // ============================================================
  // ✅ 侧边栏切换
  // ============================================================
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value))
  }

  // ✅ 设置侧边栏状态
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebar_collapsed', String(collapsed))
  }

  // ============================================================
  // ✅ 主题切换
  // ============================================================
  function setTheme(themeMode: 'light' | 'dark') {
    theme.value = themeMode
    document.documentElement.setAttribute('data-theme', themeMode)
    localStorage.setItem('theme', themeMode)
  }

  // ✅ 切换主题
  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // ============================================================
  // ✅ Loading 状态
  // ============================================================
  function setLoading(value: boolean) {
    loading.value = value
  }

  // ============================================================
  // ✅ 监听状态变化自动保存（备用）
  // ============================================================
  watch(
    sidebarCollapsed,
    (newVal) => {
      localStorage.setItem('sidebar_collapsed', String(newVal))
    },
    { immediate: false }
  )

  // ============================================================
  // ✅ 初始化加载
  // ============================================================
  loadState()

  return {
    // 状态
    sidebarCollapsed,
    theme,
    loading,
    // 方法
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    toggleTheme,
    setLoading,
    loadState,
  }
})