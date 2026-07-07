import request from './request'

export const shareApi = {
  create(data: any) {
    return request.post('/shares', data)
  },
  list(params?: any) {
    return request.get('/shares', { params })
  },
  getById(id: string) {
    return request.get(`/shares/${id}`)
  },
  update(id: string, data: any) {
    return request.put(`/shares/${id}`, data)
  },
  revoke(id: string) {
    return request.delete(`/shares/${id}`)
  },
  accessByToken(token: string, password?: string) {
    return request.get(`/shares/public/${token}`, { params: { password } })
  },
}