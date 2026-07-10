// ============================================================
// 用户类型
// ============================================================
export interface User {
  id: string
  username: string
  email: string
  nickname: string | null
  avatarUrl: string | null
  status: number
  emailVerified: number
  createdAt: string
  lastLoginAt: string | null
}

export interface UserInfo extends User {
  preferences: Record<string, any>
}

// ============================================================
// 文件夹类型
// ============================================================
export interface Folder {
  id: string
  userId: string
  parentId: string | null
  name: string
  icon: string | null
  color: string | null
  treePath: string
  treeDepth: number
  sortOrder: number
  noteCount: number
  subFolderCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FolderNode extends Folder {
  children?: FolderNode[]
}

// ============================================================
// 笔记类型
// ============================================================
export interface Note {
  id: string
  userId: string
  folderId: string | null
  title: string
  content: string | null
  contentPlain: string | null
  summary: string | null
  isStarred: number
  isArchived: number
  isLocked: number
  viewCount: number
  wordCount: number
  charCount: number
  currentVersion: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface NoteInfo extends Note {
  tags: TagInfo[]
}

// ============================================================
// 标签类型
// ============================================================
export interface Tag {
  id: string
  userId: string
  name: string
  color: string
  icon: string | null
  noteCount: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface TagInfo {
  id: string
  name: string
  color: string
  icon: string | null
  noteCount: number
}

// ============================================================
// API 响应类型
// ============================================================
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

// ============================================================
// 请求类型
// ============================================================
export interface LoginRequest {
  username: string
  password: string
  deviceType?: string
  deviceName?: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface CreateNoteRequest {
  title: string
  content?: string
  folderId?: string | null
  summary?: string
  isStarred?: number
  isArchived?: number
  tagIds?: string[]
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  folderId?: string | null
  summary?: string
  isStarred?: number
  isArchived?: number
  isLocked?: number
  tagIds?: string[]
}

export interface CreateFolderRequest {
  name: string
  parentId?: string | null
  icon?: string
  color?: string
}

export interface CreateTagRequest {
  name: string
  color?: string
  icon?: string
}
// 用户角色
export type UserRole = 'user' | 'admin'

export interface UserInfo extends User {
  preferences: Record<string, any>
  role?: UserRole  // 新增角色字段
}

// 系统配置
export interface SystemConfig {
  id: string
  configKey: string
  configValue: string
  configGroup: string
  description: string
  isEncrypted: boolean
  createdAt: string
  updatedAt: string
}

// 操作日志
export interface OperationLog {
  id: string
  userId: string | null
  username?: string  // 关联查询时填充
  operationType: string
  resourceType: string
  resourceId: string
  operationDetail: any
  ipAddress: string
  userAgent: string
  deviceType: string
  status: number
  errorMessage: string | null
  createdAt: string
}

// ============================================================
// 笔记模板类型
// ============================================================
export interface NoteTemplate {
  id: string
  userId: string
  name: string
  title: string          // 模板预设的笔记标题
  content: string        // 模板预设的笔记内容
  summary?: string
  tagIds?: string[]      // 预设标签ID列表
  tags?: TagInfo[]       // 关联标签（查询时填充）
  isDefault?: boolean    // 是否为默认模板
  sortOrder?: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CreateTemplateRequest {
  name: string
  title: string
  content?: string
  summary?: string
  tagIds?: string[]
  isDefault?: boolean
}

export interface UpdateTemplateRequest {
  name?: string
  title?: string
  content?: string
  summary?: string
  tagIds?: string[]
  isDefault?: boolean
}

/**
 * 上传文件响应数据结构
 */
export interface UploadResult {
  /** 文件访问URL */
  url: string;
  /** 文件存储路径 */
  path: string;
  /** 原始文件名 */
  fileName: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** MIME类型 */
  mimeType: string;
  /** 文件ID（可选） */
  id?: string;
  /** 缩略图URL（可选） */
  thumbnailUrl?: string;
  /** 图片宽度（可选） */
  width?: number;
  /** 图片高度（可选） */
  height?: number;
  /** 文件分类（可选） */
  category?: 'image' | 'document' | 'video' | 'audio' | 'other';
  /** 文件哈希值（可选） */
  hash?: string;
  /** 上传时间（可选） */
  uploadedAt?: string;
}

export interface Asset {
    id: string;
    user_id: string;
    note_id: string | null;
    file_name: string;
    file_size: number;
    file_type: string;
    storage_path: string;
    storage_bucket: string;
    width: number | null;
    height: number | null;
    thumbnail_path: string | null;
    thumbnail_width: number | null;
    thumbnail_height: number | null;
    file_hash: string | null;
    ref_count: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    sync_version: number;
}