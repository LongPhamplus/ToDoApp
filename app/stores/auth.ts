// app/stores/auth.ts
import { defineStore } from 'pinia'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async fetchMe() {
      try {
        const data = await $fetch<{ success: boolean; data: User }>('/api/auth/me')
        if (data.success) {
          this.user = data.data
        }
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },

    async login(email: string, password: string, rememberMe = false) {
      this.loading = true
      try {
        const data = await $fetch<{ success: boolean; data: User }>('/api/auth/login', {
          method: 'POST',
          body: { email, password, rememberMe },
        })
        if (data.success) {
          this.user = data.data
          this.initialized = true
        }
        return { success: true }
      } catch (err: any) {
        // Nuxt $fetch wraps createError as: err.data = { statusCode, message, statusMessage }
        const msg = err?.data?.message || err?.message || 'Login failed'
        return { success: false, error: msg }
      } finally {
        this.loading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.loading = true
      try {
        const data = await $fetch<{ success: boolean; data: User }>('/api/auth/register', {
          method: 'POST',
          body: { name, email, password },
        })
        if (data.success) {
          this.user = data.data
          this.initialized = true
        }
        return { success: true }
      } catch (err: any) {
        // Nuxt $fetch wraps createError as: err.data = { statusCode, message, statusMessage }
        const msg = err?.data?.message || err?.message || 'Registration failed'
        return { success: false, error: msg }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch {
        // ignore
      } finally {
        this.user = null
        await navigateTo('/login')
      }
    },
  },
})
