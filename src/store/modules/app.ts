import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const loading = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTheme(themeMode: 'light' | 'dark') {
    theme.value = themeMode
    document.documentElement.setAttribute('data-theme', themeMode)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    sidebarCollapsed,
    theme,
    loading,
    toggleSidebar,
    setTheme,
    setLoading,
  }
})