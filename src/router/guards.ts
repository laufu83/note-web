import type { Router } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

export function setupGuards(router: Router) {
 // 在路由守卫中增加角色检查
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/')
  } else if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = userStore.userInfo?.role || 'user'
    if (!to.meta.roles.includes(userRole)) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})
}