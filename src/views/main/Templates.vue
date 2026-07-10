<template>
  <div class="templates-page">
    <div class="page-header">
      <h2>📋 笔记模板</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建模板
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索模板..."
        prefix-icon="Search"
        clearable
        style="width: 240px"
        @input="handleSearch"
      />
    </div>

    <!-- 模板列表 -->
    <el-table v-loading="loading" :data="templates" style="width: 100%">
      <el-table-column prop="name" label="模板名称" min-width="150" />
      <el-table-column prop="title" label="预设标题" min-width="150" />
      <el-table-column prop="summary" label="摘要" min-width="150" />
      <el-table-column label="标签" width="150">
        <template #default="{ row }">
          <el-tag
            v-for="tag in row.tags?.slice(0, 3)"
            :key="tag.id"
            size="small"
            :color="tag.color"
            style="margin: 2px"
          >
            {{ tag.name }}
          </el-tag>
          <span v-if="row.tags?.length > 3">+{{ row.tags.length - 3 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="默认" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isDefault" type="success" size="small">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="applyTemplate(row)">应用</el-button>
          <el-button size="small" type="primary" @click="editTemplate(row)">编辑</el-button>
          <el-button
            v-if="!row.isDefault"
            size="small"
            type="warning"
            @click="setDefault(row)"
          >设为默认</el-button>
          <el-button size="small" type="danger" @click="deleteTemplate(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadTemplates"
        @current-change="loadTemplates"
      />
    </div>

    <!-- 创建/编辑模板弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：会议纪要模板" />
        </el-form-item>

        <el-form-item label="预设标题" prop="title">
          <el-input v-model="form.title" placeholder="笔记标题" />
        </el-form-item>

        <el-form-item label="预设内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="笔记内容（可包含 Markdown）"
          />
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" placeholder="简短摘要（选填）" />
        </el-form-item>

        <el-form-item label="标签" prop="tagIds">
          <el-select
            v-model="form.tagIds"
            multiple
            filterable
            placeholder="选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            >
              <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useTemplateStore } from '@/store/modules/template'
import { useTagStore } from '@/store/modules/tag'
import { useNoteStore } from '@/store/modules/note'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/date'

const router = useRouter()
const templateStore = useTemplateStore()
const tagStore = useTagStore()
const noteStore = useNoteStore()

const loading = ref(false)
const templates = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const allTags = ref<any[]>([])
let searchTimer: any = null

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  name: '',
  title: '',
  content: '',
  summary: '',
  tagIds: [] as string[],
  isDefault: false,
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  title: [{ required: true, message: '请输入预设标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入预设内容', trigger: 'blur' }],
}

async function loadTemplates() {
  loading.value = true
  try {
    const result = await templateStore.loadTemplates({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    })
    templates.value = result.items
    total.value = result.total
  } finally {
    loading.value = false
  }
}

async function loadAllTags() {
  try {
    const result = await tagStore.loadTags()
    allTags.value = result.items || []
  } catch {
    // 忽略
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadTemplates()
  }, 500)
}

function openCreateDialog() {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    name: '',
    title: '',
    content: '',
    summary: '',
    tagIds: [],
    isDefault: false,
  })
  dialogVisible.value = true
}

function editTemplate(row: any) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    title: row.title,
    content: row.content || '',
    summary: row.summary || '',
    tagIds: row.tags?.map((t: any) => t.id) || [],
    isDefault: row.isDefault || false,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()

  saving.value = true
  try {
    const data = {
      name: form.name,
      title: form.title,
      content: form.content,
      summary: form.summary,
      tagIds: form.tagIds,
      isDefault: form.isDefault,
    }
    if (isEdit.value) {
      await templateStore.updateTemplate(form.id, data)
      ElMessage.success('模板更新成功')
    } else {
      await templateStore.createTemplate(data)
      ElMessage.success('模板创建成功')
    }
    dialogVisible.value = false
    loadTemplates()
  } finally {
    saving.value = false
  }
}

async function deleteTemplate(row: any) {
  try {
    await ElMessageBox.confirm(`确定要删除模板 "${row.name}" 吗？`, '确认删除', { type: 'warning' })
    await templateStore.deleteTemplate(row.id)
    ElMessage.success('删除成功')
    loadTemplates()
  } catch (error) {
    if (error !== 'cancel') console.error(error)
  }
}

async function setDefault(row: any) {
  try {
    await templateStore.setDefault(row.id)
    ElMessage.success('已设为默认模板')
    loadTemplates()
  } catch {
    // 忽略
  }
}

async function applyTemplate(row: any) {
  try {
    const result = await templateStore.applyTemplate(row.id)
    // 跳转到新建笔记页面，并传递模板内容
    router.push({
      path: '/note/new',
      query: {
        title: result.title,
        content: result.content,
        tagIds: result.tagIds?.join(','),
      },
    })
  } catch {
    // 忽略
  }
}

onMounted(() => {
  loadTemplates()
  loadAllTags()
})
</script>

<style scoped>
.templates-page {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-bar {
  margin-bottom: 16px;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>