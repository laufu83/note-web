// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
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
  // 主布局路由（需要认证）
  // ============================================================
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 首页
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/main/Dashboard.vue'),
      },
      // 文件夹视图
      {
        path: 'folder/:id?',
        name: 'FolderView',
        component: () => import('@/views/main/FolderView.vue'),
      },
      // 笔记详情
      {
        path: 'note/:id',
        name: 'NoteDetail',
        component: () => import('@/views/main/NoteDetail.vue'),
      },
      // 星标笔记
      {
        path: 'starred',
        name: 'StarredView',
        component: () => import('@/views/main/Dashboard.vue'),
        props: { filter: 'starred' },
      },
      // 归档笔记
      {
        path: 'archived',
        name: 'ArchivedView',
        component: () => import('@/views/main/Dashboard.vue'),
        props: { filter: 'archived' },
      },
      // 回收站
      {
        path: 'trash',
        name: 'TrashView',
        component: () => import('@/views/main/TrashView.vue'),
      },
      // 笔记模板
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('@/views/main/Templates.vue'),
        meta: { requiresAuth: true },
      },
      // 个人设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Profile.vue'),
      },
      // 管理后台（需管理员权限）
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { roles: ['admin'] },
        children: [
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
    ],
  },

  // ============================================================
  // 404 重定向（必须放在最后）
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