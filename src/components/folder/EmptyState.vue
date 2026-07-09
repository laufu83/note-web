<!-- src/components/folder/EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-svg">
      <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25 15H65L75 25V85H25V15Z" fill="#F2F3F5" stroke="#DCDFE6" stroke-width="1.5"/>
        <path d="M65 15V25H75" fill="#F2F3F5" stroke="#DCDFE6" stroke-width="1.5"/>
        <circle cx="45" cy="50" r="12" fill="#ECF5FF" stroke="#409EFF" stroke-width="1.5"/>
        <text x="41" y="54" font-size="14" fill="#409EFF" font-family="sans-serif">?</text>
        <path d="M55 62L70 77" stroke="#DCDFE6" stroke-width="2" stroke-linecap="round"/>
        <path d="M30 38H60M30 45H55M30 58H62" stroke="#DCDFE6" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </div>
    <p class="empty-tip">{{ text }}</p>
    <el-button type="primary" size="default" @click="emit('create')" class="empty-create-btn">
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  buttonText: string
}>()

const emit = defineEmits<{
  (e: 'create'): void
}>()
</script>

<style scoped>
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-svg {
  margin-bottom: 16px;
}

.empty-tip {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}

.empty-create-btn {
  border-radius: 4px;
  padding: 8px 22px;
}
</style>