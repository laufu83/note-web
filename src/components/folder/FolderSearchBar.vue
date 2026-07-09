<!-- src/components/folder/FolderSearchBar.vue -->

<template>
  <div class="search-bar-wrap">
    <div class="column-search">
      <el-input
        :model-value="searchKeyword"
        placeholder="搜索笔记 Ctrl+Shift+F"
        size="small"
        prefix-icon="Search"
        clearable
        @input="handleInput"
        class="search-input"
      />
    </div>

    <el-dropdown trigger="click" popper-append-to-body>
      <el-button text class="menu-icon-btn">
        <el-icon size="20"><Menu /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu class="parent-main-menu">
          <!-- 视图切换 -->
          <el-dropdown trigger="hover" class="view-sub-dropdown">
            <template #default>
              <span class="menu-main-text">
                列表展示
                <el-icon class="arrow-right"><ArrowRight /></el-icon>
              </span>
            </template>
            <template #dropdown>
              <el-dropdown-menu class="sub-menu">
                <el-dropdown-item
                  :class="{ active: viewMode === 'preview' }"
                  @click="handleViewModeChange('preview')"
                >
                  <span>摘要</span>
                  <el-icon v-if="viewMode === 'preview'" class="check-icon"><Check /></el-icon>
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ active: viewMode === 'list' }"
                  @click="handleViewModeChange('list')"
                >
                  <span>列表</span>
                  <el-icon v-if="viewMode === 'list'" class="check-icon"><Check /></el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 排序方式 -->
          <el-dropdown trigger="hover" class="sort-sub-dropdown">
            <template #default>
              <span class="menu-main-text">
                排序方式
                <el-icon class="arrow-right"><ArrowRight /></el-icon>
              </span>
            </template>
            <template #dropdown>
              <el-dropdown-menu class="sub-menu">
                <el-dropdown-item
                  v-for="item in sortOptions"
                  :key="item.value"
                  :class="{ active: sortBy === item.value }"
                  @click="handleSortChange(item.value)"
                >
                  <span>{{ item.label }}</span>
                  <el-icon v-if="sortBy === item.value" class="check-icon"><Check /></el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { Menu, ArrowRight, Check } from '@element-plus/icons-vue'

const props = defineProps<{
  searchKeyword: string
  viewMode: 'list' | 'preview'
  sortBy: string
}>()

const emit = defineEmits<{
  (e: 'update:searchKeyword', value: string): void
  (e: 'update:viewMode', value: 'list' | 'preview'): void
  (e: 'update:sortBy', value: string): void
  (e: 'search'): void
  (e: 'sortChange', value: string): void
  (e: 'viewModeChange', value: 'list' | 'preview'): void
}>()

const sortOptions = [
  { label: '创建时间', value: 'createdAt_desc' },
  { label: '修改时间', value: 'updatedAt_desc' },
  { label: '文件名称', value: 'title_asc' },
  { label: '文件大小', value: 'wordCount_desc' },
]

let searchTimer: number | null = null

function handleInput(value: string) {
  emit('update:searchKeyword', value)
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    emit('search')
  }, 400)
}

function handleSortChange(value: string) {
  emit('update:sortBy', value)
  emit('sortChange', value)
}

function handleViewModeChange(value: 'list' | 'preview') {
  emit('update:viewMode', value)
  emit('viewModeChange', value)
}
</script>

<style scoped>
/* ============================================================
   搜索栏容器
   ============================================================ */
.search-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 6px;
  flex-shrink: 0;
}

.column-search {
  flex: 1;
}

/* ============================================================
   搜索框
   ============================================================ */
.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  background: #f5f5f7;
  border: none;
  box-shadow: none;
  transition: all 0.22s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: #e9e9eb;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow: 0 0 0 1px #409eff;
}

.search-input :deep(.el-input__inner) {
  font-size: 13px;
  color: #1d1d1f;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #a0a0a0;
}

/* ============================================================
   菜单按钮
   ============================================================ */
.menu-icon-btn {
  padding: 4px 8px;
  color: #606266;
  transition: all 0.2s ease;
}

.menu-icon-btn:hover {
  background: #f0f2f5;
  border-radius: 6px;
  color: #303133;
}

/* ============================================================
   主菜单
   ============================================================ */
:deep(.parent-main-menu) {
  min-width: 190px;
  padding: 6px 0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
}

/* ============================================================
   主菜单项
   ============================================================ */
.menu-main-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.18s ease;
}

.menu-main-text:hover {
  background: #f3f4f6;
}

.arrow-right {
  font-size: 14px;
  color: #b0b0b5;
  transition: transform 0.2s, color 0.2s;
}

.menu-main-text:hover .arrow-right {
  transform: translateX(2px);
  color: #409eff;
}

/* ============================================================
   子菜单
   ============================================================ */
:deep(.sub-menu) {
  min-width: 140px;
  padding: 6px 0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebeef5;
  margin-left: 6px;
}

:deep(.sub-menu .el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 18px !important;
  font-size: 14px;
  color: #303133;
  border-radius: 4px;
  transition: all 0.15s ease;
  gap: 12px;
  min-width: 80px;
}

:deep(.sub-menu .el-dropdown-menu__item:hover) {
  background: #f3f4f6;
}

:deep(.sub-menu .el-dropdown-menu__item.active) {
  background: #ecf5ff;
  color: #409eff;
}

:deep(.sub-menu .el-dropdown-menu__item.active span) {
  color: #409eff;
}

.check-icon {
  font-size: 14px;
  color: #409eff;
}

/* ============================================================
   隐藏嵌套 dropdown 的默认箭头
   ============================================================ */
:deep(.view-sub-dropdown .el-dropdown__caret-button),
:deep(.sort-sub-dropdown .el-dropdown__caret-button) {
  display: none !important;
}

:deep(.view-sub-dropdown .el-dropdown__self),
:deep(.sort-sub-dropdown .el-dropdown__self) {
  display: block;
  width: 100%;
}

:deep(.view-sub-dropdown .el-dropdown),
:deep(.sort-sub-dropdown .el-dropdown) {
  display: block;
  width: 100%;
}

/* ============================================================
   分割线（如果需要添加更多菜单项）
   ============================================================ */
:deep(.el-dropdown-menu__item--divided) {
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 4px;
}

/* ============================================================
   滚动条
   ============================================================ */
:deep(.el-dropdown-menu::-webkit-scrollbar) {
  width: 4px;
}

:deep(.el-dropdown-menu::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.el-dropdown-menu::-webkit-scrollbar-thumb) {
  background: #d0d0d0;
  border-radius: 4px;
}
</style>