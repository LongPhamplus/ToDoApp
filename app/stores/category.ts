// app/stores/category.ts
import { defineStore } from 'pinia'
import type { Category } from '~/types/todo'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ success: boolean; data: Category[] }>('/api/categories')
      if (data.success) categories.value = data.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── Create ─────────────────────────────────────────────────────────────
  async function createCategory(payload: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) {
    const data = await $fetch<{ success: boolean; data: Category }>('/api/categories', {
      method: 'POST',
      body: payload,
    })
    if (data.success) categories.value.push(data.data)
    return data.data
  }

  // ── Update ─────────────────────────────────────────────────────────────
  async function updateCategory(id: string, payload: Partial<Category>) {
    const data = await $fetch<{ success: boolean; data: Category }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: payload,
    })
    if (data.success) {
      const idx = categories.value.findIndex(c => c._id === id)
      if (idx !== -1) categories.value[idx] = data.data
    }
    return data.data
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  async function deleteCategory(id: string) {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    categories.value = categories.value.filter(c => c._id !== id)
  }

  const getCategoryById = (id: string) =>
    categories.value.find(c => c._id === id)

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory, getCategoryById }
})
