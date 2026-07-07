import request from './request'

export const assetApi = {
  upload(file: File, noteId?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (noteId) formData.append('noteId', noteId)
    return request.post('/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  batchUpload(formData: FormData) {
    return request.post('/assets/batch-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list(params?: any) {
    return request.get('/assets', { params })
  },
  getByNote(noteId: string) {
    return request.get(`/assets/note/${noteId}`)
  },
  delete(id: string) {
    return request.delete(`/assets/${id}`)
  },
  cleanup(days?: number) {
    return request.post('/assets/cleanup', { days })
  },
}