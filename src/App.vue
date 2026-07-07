<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

onMounted(() => {
  // 检查本地存储是否有 token，恢复登录状态
  userStore.restoreSession()
})
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>