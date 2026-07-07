<template>
  <div class="admin-dashboard">
    <!-- 管理后台统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #667eea">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userCount }}</div>
              <div class="stat-label">总用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #48bb78">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ noteCount }}</div>
              <div class="stat-label">总笔记</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ed8936">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ folderCount }}</div>
              <div class="stat-label">文件夹</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fc8181">
              <el-icon><Share /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ shareCount }}</div>
              <div class="stat-label">分享次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 管理菜单 -->
    <el-card class="menu-card">
      <template #header>
        <span>管理功能</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in menuItems" :key="item.path">
          <div class="menu-item" @click="navigateTo(item.path)">
            <el-icon :size="32"><component :is="item.icon" /></el-icon>
            <span>{{ item.name }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 子路由内容 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Folder, Share, Setting, EditPen } from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const userCount = ref(0)
const noteCount = ref(0)
const folderCount = ref(0)
const shareCount = ref(0)

// 管理菜单
const menuItems = [
  { path: '/admin/users', name: '用户管理', icon: User },
  { path: '/admin/logs', name: '操作日志', icon: Document },
  { path: '/admin/config', name: '系统配置', icon: Setting },
  { path: '/templates', name: '笔记模板', icon: EditPen },
]

function navigateTo(path: string) {
  router.push(path)
}

onMounted(async () => {
  // 加载统计数据
  // 实际项目中调用 API
  userCount.value = 0
  noteCount.value = 0
  folderCount.value = 0
  shareCount.value = 0
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.stat-label {
  font-size: 14px;
  color: #a0aec0;
}

.menu-card {
  border-radius: 8px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f7fafc;
  gap: 8px;
}

.menu-item:hover {
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.menu-item .el-icon {
  color: #667eea;
}

.menu-item span {
  font-size: 14px;
  color: #2d3748;
}
</style>