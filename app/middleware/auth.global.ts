// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client — SSR does not have the auth cookie in the $fetch context
  // (cookie is sent by the browser, not available during server-side rendering of navigation)
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Fetch user info once if not yet initialized
  if (!authStore.initialized) {
    await authStore.fetchMe()
  }

  const publicRoutes = ['/login', '/register']

  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/login', { replace: true })
  }

  if (authStore.isAuthenticated && publicRoutes.includes(to.path)) {
    return navigateTo('/home', { replace: true })
  }
})
