<template>
  <div class="admin-logs">
    <div class="page-header">
      <h2>📋 操作日志</h2>
      <div class="filter-bar">
        <el-input
          v-model="filters.userId"
          placeholder="用户ID"
          clearable
          style="width: 150px"
          @change="loadLogs"
        />
        <el-select v-model="filters.operationType" placeholder="操作类型" clearable style="width: 130px" @change="loadLogs">
          <el-option value="login" label="登录" />
          <el-option value="logout" label="登出" />
          <el-option value="create" label="创建" />
          <el-option value="update" label="更新" />
          <el-option value="delete" label="删除" />
          <el-option value="share" label="分享" />
        </el-select>
        <el-select v-model="filters.resourceType" placeholder="资源类型" clearable style="width: 130px" @change="loadLogs">
          <el-option value="user" label="用户" />
          <el-option value="note" label="笔记" />
          <el-option value="folder" label="文件夹" />
          <el-option value="tag" label="标签" />
          <el-option value="asset" label="素材" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
          @change="loadLogs"
        />
        <el-button type="primary" @click="loadLogs">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="logs" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户" width="120" />
      <el-table-column prop="operationType" label="操作" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ row.operationType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="resourceType" label="资源" width="100">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.resourceType || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="resourceId" label="资源ID" width="120" />
      <el-table-column prop="ipAddress" label="IP" width="140" />
      <el-table-column prop="deviceType" label="设备" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="详情" width="80" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="showDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadLogs"
        @current-change="loadLogs"
      />
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="600px">
      <pre>{{ JSON.stringify(detailData, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { formatDate } from '@/utils/date'

const loading = ref(false)
const logs = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const filters = reactive({
  userId: '',
  operationType: '',
  resourceType: '',
  dateRange: null as [Date, Date] | null,
})

const detailVisible = ref(false)
const detailData = ref<any>(null)

async function loadLogs() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }
    if (filters.userId) params.userId = filters.userId
    if (filters.operationType) params.operationType = filters.operationType
    if (filters.resourceType) params.resourceType = filters.resourceType
    if (filters.dateRange) {
      params.startDate = filters.dateRange[0].toISOString()
      params.endDate = filters.dateRange[1].toISOString()
    }
    const result = await adminApi.getLogs(params)
    logs.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.userId = ''
  filters.operationType = ''
  filters.resourceType = ''
  filters.dateRange = null
  loadLogs()
}

function showDetail(row: any) {
  detailData.value = row.operationDetail
  detailVisible.value = true
}

onMounted(loadLogs)
</script>

<style scoped>
.admin-logs {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
pre {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 6px;
  max-height: 400px;
  overflow: auto;
  font-size: 12px;
}
</style>