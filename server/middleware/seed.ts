// server/middleware/seed.ts
// Auto-seed removed: default categories are now seeded per-user at registration time.
// See server/api/auth/register.post.ts → seedCategories(userId)

export default defineEventHandler(async (_event) => {
  // no-op
})
