// src/composables/useNoteContent.ts
import { ref, computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

interface ContentOptions {
  props: any
  route: RouteLocationNormalizedLoaded
  noteStore: any
}

export function useNoteContent(options: ContentOptions) {
  const { props, route, noteStore } = options

  const editTitle = ref('')
  const editContent = ref('')
  const editTags = ref<any[]>([])
  const selectedTagIds = ref<string[]>([])

  const currentFolderId = computed(() => {
    if (props.newNoteFolderId) return props.newNoteFolderId
    if (props.folderId) return props.folderId
    
    const paramsFolderId = route.params.folderId as string
    if (paramsFolderId && paramsFolderId !== 'new') return paramsFolderId
    
    return route.query.folderId as string || null
  })

  const currentNoteId = computed(() => {
    if (props.noteId) return props.noteId
    
    const paramsNoteId = route.params.noteId as string
    if (paramsNoteId && paramsNoteId !== 'new' && paramsNoteId !== '') {
      return paramsNoteId
    }
    
    const paramsId = route.params.id as string
    if (paramsId && paramsId !== 'new') return paramsId
    
    return null
  })

  const isNewNote = computed(() => {
    if (props.isNew !== undefined) return props.isNew
    if (!currentNoteId.value) return true
    
    const id = currentNoteId.value
    if (id === 'new' || id === '') return true
    
    const paramsNoteId = route.params.noteId as string
    if (paramsNoteId === 'new' || paramsNoteId === '') return true
    
    return false
  })

  const note = computed(() => noteStore.currentNote)

  function setNoteData(data: any) {
    editTitle.value = data.title || ''
    editContent.value = data.content || ''
    editTags.value = data.tags || []
  }

  function clearNoteData() {
    editTitle.value = ''
    editContent.value = ''
    editTags.value = []
    noteStore.clearCurrentNote()
  }

  return {
    editTitle,
    editContent,
    editTags,
    selectedTagIds,
    currentFolderId,
    currentNoteId,
    isNewNote,
    note,
    setNoteData,
    clearNoteData,
  }
}