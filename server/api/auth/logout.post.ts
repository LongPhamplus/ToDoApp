// server/api/auth/logout.post.ts
export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  return { success: true }
})
