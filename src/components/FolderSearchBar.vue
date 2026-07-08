<!-- src/components/FolderSearchBar.vue -->
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
          <el-dropdown trigger="hover" split-button class="view-sub-dropdown">
            <template #default>
              <el-dropdown-item class="menu-main-item">
                列表展示
                <el-icon class="item-right-arrow"><ArrowRight /></el-icon>
              </el-dropdown-item>
            </template>
            <template #dropdown>
              <el-dropdown-menu class="view-sub-menu">
                <el-dropdown-item 
                  :class="{ active: viewMode === 'preview' }"
                  @click="handleViewModeChange('preview')"
                >
                  摘要
                </el-dropdown-item>
                <el-dropdown-item 
                  :class="{ active: viewMode === 'list' }"
                  @click="handleViewModeChange('list')"
                >
                  列表
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 排序 -->
          <el-dropdown trigger="hover" split-button class="sort-sub-dropdown">
            <template #default>
              <el-dropdown-item class="menu-main-item">
                排序方式
                <el-icon class="item-right-arrow"><ArrowRight /></el-icon>
              </el-dropdown-item>
            </template>
            <template #dropdown>
              <el-dropdown-menu class="sort-sub-menu">
                <el-dropdown-item
                  v-for="item in sortOptions"
                  :key="item.value"
                  :class="{ active: sortBy === item.value }"
                  @click="handleSortChange(item.value)"
                >
                  {{ item.label }}
                  <el-icon v-if="sortBy === item.value" class="sort-arrow"><ArrowDown /></el-icon>
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
import { Menu, ArrowRight, ArrowDown } from '@element-plus/icons-vue'

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

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background: #f5f5f7;
  border: none;
  box-shadow: none;
}

.search-input :deep(.el-input__wrapper:hover) {
  background: #eee;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #409eff;
}

.search-input :deep(.el-input__inner) {
  font-size: 13px;
  color: #1d1d1f;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: #999;
}

.menu-icon-btn {
  padding: 4px;
  color: #666;
}

.menu-icon-btn:hover {
  background: #f0f0f0;
  border-radius: 4px;
  color: #111;
}

:deep(.parent-main-menu) {
  min-width: 160px;
}

:deep(.view-sub-menu),
:deep(.sort-sub-menu) {
  margin-left: 8px;
  min-width: 100px;
}

:deep(.el-dropdown-menu__item) {
  font-size: 16px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.el-dropdown-menu__item.active) {
  background: #ecf5ff;
  color: #409eff;
}

.item-right-arrow {
  font-size: 12px;
  color: #999;
}

.sort-arrow {
  font-size: 10px;
  color: #409eff;
}
</style>