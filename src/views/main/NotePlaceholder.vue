<!-- src/views/main/NotePlaceholder.vue -->
<template>
  <div class="note-placeholder">
    <div class="placeholder-content">
      <div class="placeholder-icon">📄</div>
      <h2 class="placeholder-title">选择或新建一篇笔记</h2>
      <p class="placeholder-desc">从左侧列表中选择一篇笔记，或点击下方按钮创建新笔记</p>
      <el-button type="primary" @click="createNewNote">
        <el-icon><Plus /></el-icon>
        新建笔记
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

function createNewNote() {
  router.push('/note/new')
}
</script>

<style scoped>
.note-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #ffffff;
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.placeholder-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.placeholder-desc {
  font-size: 14px;
  color: #8e8e93;
  margin-bottom: 24px;
  line-height: 1.6;
}
</style>