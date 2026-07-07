import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NoteInfo } from '@/types'
import { noteApi } from '@/api/note'

export const useNoteStore = defineStore('note', () => {
  const currentNote = ref<NoteInfo | null>(null)
  const notes = ref<NoteInfo[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function loadNotes(params: any) {
    loading.value = true
    try {
      const result = await noteApi.list(params)
      notes.value = result.items
      total.value = result.pagination.total
      return result
    } finally {
      loading.value = false
    }
  }

  async function loadNote(id: string) {
    loading.value = true
    try {
      const note = await noteApi.getById(id)
      currentNote.value = note
      return note
    } finally {
      loading.value = false
    }
  }

  async function createNote(data: any) {
    const note = await noteApi.create(data)
    return note
  }

  async function updateNote(id: string, data: any) {
    const note = await noteApi.update(id, data)
    if (currentNote.value?.id === id) {
      currentNote.value = note
    }
    return note
  }

  async function deleteNote(id: string) {
    await noteApi.delete(id)
    notes.value = notes.value.filter(n => n.id !== id)
    if (currentNote.value?.id === id) {
      currentNote.value = null
    }
  }

  function clearCurrentNote() {
    currentNote.value = null
  }

  return {
    currentNote,
    notes,
    total,
    loading,
    loadNotes,
    loadNote,
    createNote,
    updateNote,
    deleteNote,
    clearCurrentNote,
  }
})