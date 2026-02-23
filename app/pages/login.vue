<template>
  <NuxtLayout name="auth">
    <div>
      <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Sign in to your account</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            :disabled="loading"
            class="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50"
          />
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="password" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
          </div>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              :disabled="loading"
              class="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              <svg v-if="showPassword" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Remember me -->
        <label class="flex items-center gap-2.5 cursor-pointer select-none group">
          <div class="relative">
            <input v-model="form.rememberMe" type="checkbox" class="sr-only peer" />
            <div class="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full peer-checked:bg-indigo-500 transition-colors" />
            <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
          </div>
          <span class="text-sm text-zinc-600 dark:text-zinc-400">Remember me for 30 days</span>
        </label>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="error" class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3.5 py-2.5">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ error }}
          </div>
        </Transition>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div class="relative flex justify-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 px-2">
          Don't have an account?
        </div>
      </div>

      <!-- Register link -->
      <NuxtLink
        to="/register"
        class="block w-full py-2.5 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm text-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
      >
        Create an account
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)

const form = reactive({ email: '', password: '', rememberMe: false })
const showPassword = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  const result = await authStore.login(form.email, form.password, form.rememberMe)
  if (result.success) {
    await navigateTo('/home', { replace: true })
  } else {
    error.value = result.error || 'Login failed'
  }
}
</script>
