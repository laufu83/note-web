<template>
  <div class="shared-container" v-loading="loading">
    <div v-if="error" class="error">
      <el-empty :description="error" />
    </div>
    <div v-else-if="data" class="shared-content">
      <div class="shared-header">
        <h1>{{ data.target.title || '未命名' }}</h1>
        <div class="shared-meta">
          分享者：{{ data.share.userId }}
          <span v-if="data.permissions.canEdit">（可编辑）</span>
        </div>
      </div>
      <div class="shared-body" v-html="data.target.content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { shareApi } from '@/api/share'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const data = ref<any>(null)

async function loadShare() {
  const token = route.params.token as string
  loading.value = true
  try {
    data.value = await shareApi.accessByToken(token)
  } catch (err: any) {
    error.value = err.message || '分享不存在或已过期'
  } finally {
    loading.value = false
  }
}

onMounted(loadShare)
</script>

<style scoped>
.shared-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.shared-header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 16px;
  margin-bottom: 24px;
}
.shared-meta {
  color: #999;
  font-size: 14px;
}
.shared-body {
  line-height: 1.8;
}
.error {
  text-align: center;
  padding: 60px 0;
}
</style>