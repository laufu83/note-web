// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

const routes = [
  // ============================================================
  // 公开路由（无需认证）
  // ============================================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/share/:token',
    name: 'SharedNote',
    component: () => import('@/views/share/SharedNote.vue'),
    meta: { requiresAuth: false },
  },

  // ============================================================
  // 主布局路由（三栏布局）
  // ============================================================
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ✅ 默认进入最近文件
      {
        path: '',
        redirect: '/file/recent',
      },

      // ✅ 统一文件路由：/file/:folderId
      // folderId 可以是: recent, starred, trash, 或具体文件夹ID
      {
        path: 'file/:folderId',
        name: 'FileView',
        component: () => import('@/components/layout/FolderView.vue'),
        props: true,
        children: [
            // ✅ 空状态页面
          {
            path: 'empty',
            name: 'FolderEmpty',
            component: () => import('@/views/main/EmptyPreview.vue'),
            props: (route: any) => ({
              folderId: route.params.folderId,
            }),
          },
          // 新建笔记：/file/:folderId/note
          {
            path: 'note',
            name: 'FileNoteNew',
            component: () => import('@/views/main/NoteDetail.vue'),
            props: (route: any) => ({
              noteId: null,
              folderId: route.params.folderId,
              isNew: true,
            }),
          },
          // 编辑笔记：/file/:folderId/note/:noteId
          {
            path: 'note/:noteId',
            name: 'FileNoteDetail',
            component: () => import('@/views/main/NoteDetail.vue'),
            props: (route: any) => (
              {
              noteId: route.params.noteId,
              folderId: route.params.folderId,
              isEdit: ('edit' in route.query)
            }),
          },
        ],
      },
    ],
  },

  // ============================================================
  // 设置布局（两栏：左侧栏 + 内容区）
  // ============================================================
  {
    path: '/settings',
    component: () => import('@/components/layout/SettingsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Settings',
        component: () => import('@/views/settings/Profile.vue'),
      },
    ],
  },
  {
    path: '/templates',
    component: () => import('@/components/layout/SettingsLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Templates',
        component: () => import('@/views/main/Templates.vue'),
      },
    ],
  },

  // ============================================================
  // 管理后台布局（两栏：左侧栏 + 内容区）
  // ============================================================
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/Logs.vue'),
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: () => import('@/views/admin/SystemConfig.vue'),
      },
    ],
  },

  // ============================================================
  // 404 重定向
  // ============================================================
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

export default router