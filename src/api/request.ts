import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class Request {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const userStore = useUserStore()
        if (userStore.accessToken) {
          config.headers.Authorization = `Bearer ${userStore.accessToken}`
        }
        config.headers['Client-Type'] = 'web'
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        const { code, message, data } = response.data
        if (code !== 0) {
          ElMessage.error(message || '请求失败')
          return Promise.reject(new Error(message || '请求失败'))
        }
        return data
      },
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status
          const data = error.response.data as any

          if (status === 401) {
            const userStore = useUserStore()
            userStore.clearUser()
            ElMessage.error('登录已过期，请重新登录')
            router.push('/login')
          } else if (status === 403) {
            ElMessage.error('权限不足')
          } else if (status === 404) {
            ElMessage.error(data?.message || '资源不存在')
          } else if (status === 409) {
            ElMessage.error(data?.message || '数据冲突')
          } else if (status === 422) {
            ElMessage.error(data?.message || '参数验证失败')
          } else if (status >= 500) {
            ElMessage.error('服务器内部错误')
          } else {
            ElMessage.error(data?.message || '请求失败')
          }
        } else if (error.code === 'ECONNABORTED') {
          ElMessage.error('请求超时')
        } else {
          ElMessage.error('网络连接失败')
        }
        return Promise.reject(error)
      }
    )
  }

  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.patch(url, data, config)
  }

  upload<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    })
  }
}

export const request = new Request()
export default request