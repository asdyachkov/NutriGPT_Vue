import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginPage.vue'), meta: { layout: 'auth', requiresAuth: false } },
  { path: '/register', name: 'Register', component: () => import('@/pages/RegisterPage.vue'), meta: { layout: 'auth', requiresAuth: false } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/pages/DashboardPage.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/ProfilePage.vue'), meta: { requiresAuth: true } },
  { path: '/families', name: 'Families', component: () => import('@/pages/FamilyPage.vue'), meta: { requiresAuth: true } },
  { path: '/families/:id', name: 'FamilyDetail', component: () => import('@/pages/FamilyDetailPage.vue'), meta: { requiresAuth: true } },
  { path: '/recipes', name: 'Recipes', component: () => import('@/pages/RecipesPage.vue'), meta: { requiresAuth: true } },
  { path: '/recipes/:id', name: 'RecipeDetail', component: () => import('@/pages/RecipeDetailPage.vue'), meta: { requiresAuth: true } },
  { path: '/meal-plan', name: 'MealPlan', component: () => import('@/pages/MealPlanPage.vue'), meta: { requiresAuth: true } },
  { path: '/meal-plans/:id', name: 'MealPlanDetail', component: () => import('@/pages/MealPlanDetailPage.vue'), meta: { requiresAuth: true } },
  { path: '/meal-plan/history', name: 'MealPlanHistory', component: () => import('@/pages/MealPlanHistoryPage.vue'), meta: { requiresAuth: true } },
  { path: '/shopping-list', name: 'ShoppingList', component: () => import('@/pages/ShoppingListPage.vue'), meta: { requiresAuth: true } },
  { path: '/shopping-lists/:id', name: 'ShoppingListDetail', component: () => import('@/pages/ShoppingListDetailPage.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('@/pages/AdminPage.vue'), meta: { requiresAuth: true, requiredRoles: ['admin', 'dietitian'] } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/pages/NotFoundPage.vue'), meta: { layout: 'blank' } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token')
  const isAuthenticated = !!token
  if (to.meta.requiresAuth && !isAuthenticated) return next({ name: 'Login', query: { redirect: to.fullPath } })
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) return next({ name: 'Dashboard' })

  // Проверка ролей
  if (to.meta.requiredRoles && isAuthenticated) {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        const roles = to.meta.requiredRoles as string[]
        if (!roles.includes(user.role)) return next({ name: 'Dashboard' })
      } catch { /* ignore */ }
    }
  }

  next()
})

export default router
