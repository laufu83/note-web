<template>
  <div class="note-detail" v-loading="loading">
    <div class="note-toolbar">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
  <!-- 新增：模板选择器（仅新建笔记时显示） -->
      <el-select
        v-if="isNew"
        v-model="selectedTemplateId"
        placeholder="从模板创建"
        clearable
        style="width: 180px; margin-left: 12px"
        @change="applyTemplate"
      >
        <el-option
          v-for="tpl in templates"
          :key="tpl.id"
          :label="tpl.name"
          :value="tpl.id"
        >
          <span>{{ tpl.name }}</span>
          <el-tag v-if="tpl.isDefault" size="small" type="success" style="margin-left: 8px">默认</el-tag>
        </el-option>
      </el-select>

      <div class="toolbar-actions">
        <el-button :type="note?.isStarred ? 'warning' : 'default'" @click="toggleStar">
          <el-icon><Star /></el-icon>
          {{ note?.isStarred ? '取消星标' : '星标' }}
        </el-button>

        <el-button :type="note?.isArchived ? 'info' : 'default'" @click="toggleArchive">
          <el-icon><Box /></el-icon>
          {{ note?.isArchived ? '取消归档' : '归档' }}
        </el-button>

        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>

        <el-button type="primary" :loading="saving" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <div class="note-content">
      <el-input
        v-model="editTitle"
        placeholder="输入笔记标题..."
        class="note-title-input"
        size="large"
      />

      <NoteEditor v-model="editContent" />
    </div>

    <!-- 标签管理 -->
    <div class="note-tags">
      <el-tag
        v-for="tag in editTags"
        :key="tag.id"
        :color="tag.color"
        closable
        @close="removeTag(tag.id)"
      >
        {{ tag.name }}
      </el-tag>
      <el-button size="small" @click="showTagDialog = true">
        <el-icon><Plus /></el-icon>
        添加标签
      </el-button>
    </div>

    <!-- 标签选择弹窗 -->
    <el-dialog v-model="showTagDialog" title="选择标签" width="400px">
      <el-checkbox-group v-model="selectedTagIds">
        <el-checkbox
          v-for="tag in allTags"
          :key="tag.id"
          :label="tag.id"
        >
          <el-tag :color="tag.color" size="small">{{ tag.name }}</el-tag>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="showTagDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddTags">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTemplateStore } from '@/store/modules/template'
import { ArrowLeft, Star, Box, Delete, Check, Plus } from '@element-plus/icons-vue'
import { useNoteStore } from '@/store/modules/note'
import { useTagStore } from '@/store/modules/tag'
import { noteApi } from '@/api/note'
import NoteEditor from '@/components/business/NoteEditor.vue'

const router = useRouter()
const route = useRoute()
const noteStore = useNoteStore()
const tagStore = useTagStore()
const templateStore = useTemplateStore()
const noteId = computed(() => route.params.id as string)
const isNew = computed(() => noteId.value === 'new')

const loading = ref(false)
const saving = ref(false)
const showTagDialog = ref(false)

const editTitle = ref('')
const editContent = ref('')
const editTags = ref<any[]>([])
const selectedTagIds = ref<string[]>([])
const allTags = ref<any[]>([])

const note = computed(() => noteStore.currentNote)
// 模板选择
const selectedTemplateId = ref('')
const templates = ref<any[]>([])
// 加载模板列表
async function loadTemplates() {
  try {
    const result = await templateStore.loadTemplates({ pageSize: 100 })
    templates.value = result.items
    // 如果有默认模板，自动选中
    const defaultTpl = templates.value.find(t => t.isDefault)
    if (defaultTpl && isNew.value && !route.query.title) {
      selectedTemplateId.value = defaultTpl.id
      await applyTemplate(defaultTpl.id)
    }
  } catch {
    // 忽略
  }
}

// 应用模板
async function applyTemplate(templateId: string) {
  if (!templateId) return
  try {
    const result = await templateStore.applyTemplate(templateId)
    editTitle.value = result.title || ''
    editContent.value = result.content || ''
    if (result.tagIds) {
      // 预选标签（需将ID转换为标签对象）
      // 假设已加载标签列表
      const allTags = await tagStore.loadTags()
      editTags.value = allTags.items.filter(t => result.tagIds?.includes(t.id))
    }
    ElMessage.success('模板已应用')
  } catch {
    // 忽略
  }
}
async function loadNote() {
  if (isNew.value) {
    // 新建笔记
    editTitle.value = ''
    editContent.value = ''
    editTags.value = []
    return
  }

  loading.value = true
  try {
    await noteStore.loadNote(noteId.value)
    if (note.value) {
      editTitle.value = note.value.title
      editContent.value = note.value.content || ''
      editTags.value = note.value.tags || []
    }
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

async function handleSave() {
  if (!editTitle.value.trim()) {
    ElMessage.warning('请输入笔记标题')
    return
  }

  saving.value = true
  try {
    const data = {
      title: editTitle.value,
      content: editContent.value,
      tagIds: editTags.value.map(t => t.id),
    }

    if (isNew.value) {
      const newNote = await noteApi.create(data)
      ElMessage.success('笔记创建成功')
      router.push(`/note/${newNote.id}`)
    } else {
      await noteApi.update(noteId.value, data)
      ElMessage.success('保存成功')
      await loadNote()
    }
  } catch {
    // 错误已在拦截器中处理
  } finally {
    saving.value = false
  }
}

async function toggleStar() {
  if (!note.value) return
  try {
    const result = await noteApi.toggleStar(note.value.id, note.value.isStarred ? 0 : 1)
    note.value.isStarred = result.isStarred
    ElMessage.success(result.isStarred ? '已添加星标' : '已取消星标')
  } catch {
    // 忽略
  }
}

async function toggleArchive() {
  if (!note.value) return
  try {
    const result = await noteApi.toggleArchive(note.value.id, note.value.isArchived ? 0 : 1)
    note.value.isArchived = result.isArchived
    ElMessage.success(result.isArchived ? '已归档' : '已取消归档')
  } catch {
    // 忽略
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？', '确认删除', {
      type: 'warning',
    })
    await noteApi.delete(noteId.value)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

function goBack() {
  router.back()
}

function removeTag(tagId: string) {
  editTags.value = editTags.value.filter(t => t.id !== tagId)
}

function handleAddTags() {
  const selectedTags = allTags.value.filter(t => selectedTagIds.value.includes(t.id))
  const existingIds = new Set(editTags.value.map(t => t.id))
  const newTags = selectedTags.filter(t => !existingIds.has(t.id))
  editTags.value = [...editTags.value, ...newTags]
  showTagDialog.value = false
  selectedTagIds.value = []
}

onMounted(() => {
  loadNote()
  loadAllTags()
  loadTemplates()
})
</script>

<style scoped>
.note-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.note-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.note-content {
  flex: 1;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.note-title-input {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.note-title-input :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none;
  font-size: 20px;
  font-weight: 600;
  padding: 0;
}

.note-title-input :deep(.el-input__wrapper:hover),
.note-title-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none;
}

.note-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
  flex-wrap: wrap;
}
</style>