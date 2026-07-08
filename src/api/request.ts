// src/api/request.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import router from '@/router'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// ============================================================
// 类型定义
// ============================================================

interface QueueItem {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  config: InternalAxiosRequestConfig
}

// ============================================================
// 状态
// ============================================================

let isRefreshing = false
let failedQueue: QueueItem[] = []
let isRedirecting = false

// ============================================================
// 工具函数
// ============================================================

function processQueue(error: any | null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      request.getInstance()(promise.config)
        .then((res) => promise.resolve(res))
        .catch((err) => promise.reject(err))
    }
  })
  failedQueue = []
}

function handleUnauthorized(): void {
  const userStore = useUserStore()
  
  if (isRedirecting) return
  isRedirecting = true
  
  userStore.clearUser()
  ElMessage.error('登录已过期，请重新登录')
  
  setTimeout(() => {
    isRedirecting = false
    router.push('/login')
  }, 500)
}

async function refreshAccessToken(): Promise<string | null> {
  const userStore = useUserStore()
  const refreshToken = userStore.refreshToken
  
  if (!refreshToken) {
    console.warn('[Token] 没有 Refresh Token')
    return null
  }
  
  try {
    const { authApi } = await import('./auth')
    const result = await authApi.refreshToken(refreshToken)
    
    if (result && result.accessToken) {
      userStore.accessToken = result.accessToken
      localStorage.setItem('note_cloud_token', result.accessToken)
      console.log('[Token] 刷新成功')
      return result.accessToken
    }
    
    return null
  } catch (error) {
    console.error('[Token] 刷新失败:', error)
    return null
  }
}

// ============================================================
// Request 类
// ============================================================

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

    // ============================================================
    // 请求拦截器
    // ============================================================
    this.instance.interceptors.request.use(
      (config) => {
        const userStore = useUserStore()
        
        if (userStore.accessToken) {
          config.headers.Authorization = `Bearer ${userStore.accessToken}`
        }
        
        config.headers['Client-Type'] = 'web'
        
        if (import.meta.env.DEV) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        }
        
        return config
      },
      (error) => {
        console.error('[API] 请求错误:', error)
        return Promise.reject(error)
      }
    )

    // ============================================================
    // 响应拦截器
    // ============================================================
    this.instance.interceptors.response.use(
      // 成功回调
      (response) => {
        const { code, message, data } = response.data
        
        if (code === 0) {
          return data
        }
        
        // 业务 401
        if (code === 1001 || code === 1002) {
          handleUnauthorized()
          return Promise.reject(new Error(message || '未授权'))
        }
        
        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message || '请求失败'))
      },
      
      // 错误回调
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        
        if (!error.response) {
          if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时')
          } else {
            ElMessage.error('网络连接失败，请检查网络')
          }
          return Promise.reject(error)
        }
        
        const status = error.response.status
        const data = error.response.data as any
        
        // ============================================================
        // HTTP 401 - Token 过期
        // ============================================================
        if (status === 401) {
          if (originalRequest._retry) {
            handleUnauthorized()
            return Promise.reject(error)
          }
          
          originalRequest._retry = true
          
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                resolve,
                reject,
                config: originalRequest,
              })
            })
          }
          
          isRefreshing = true
          
          try {
            const newToken = await refreshAccessToken()
            
            if (newToken) {
              processQueue(null)
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.instance(originalRequest)
            } else {
              processQueue(error)
              handleUnauthorized()
              return Promise.reject(error)
            }
          } catch (refreshError) {
            processQueue(refreshError)
            handleUnauthorized()
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }
        
        // ============================================================
        // 其他 HTTP 错误
        // ============================================================
        if (status === 403) {
          ElMessage.error(data?.message || '权限不足')
        } else if (status === 404) {
          ElMessage.error(data?.message || '资源不存在')
        } else if (status === 409) {
          ElMessage.error(data?.message || '数据冲突')
        } else if (status === 422) {
          const detailMsg = data?.details 
            ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details))
            : ''
          ElMessage.error(`${data?.message || '参数验证失败'}${detailMsg ? `: ${detailMsg}` : ''}`)
        } else if (status === 429) {
          ElMessage.error('请求过于频繁，请稍后再试')
        } else if (status >= 500) {
          ElMessage.error(data?.message || '服务器内部错误')
        } else {
          ElMessage.error(data?.message || `请求失败 (${status})`)
        }
        
        return Promise.reject(error)
      }
    )
  }

  // ============================================================
  // 请求方法
  // ============================================================
  
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

  upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
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

  download(url: string, data?: any, method: 'get' | 'post' = 'get'): Promise<Blob> {
    return this.instance({
      url,
      method,
      data,
      responseType: 'blob',
    })
  }

  getInstance(): AxiosInstance {
    return this.instance
  }
}

export const request = new Request()
export default request