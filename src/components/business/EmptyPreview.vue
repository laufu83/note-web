<!-- src/components/business/EmptyPreview.vue -->

<template>
  <div class="empty-preview">
    <el-empty description="请选择文件" :image-size="120" />
  </div>
</template>

<style scoped>
.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #ffffff;
}
</style>