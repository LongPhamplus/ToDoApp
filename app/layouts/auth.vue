<template>
  <div class="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <span class="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg mb-3">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
          </svg>
        </span>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Focus</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your personal task manager</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ titleTemplate: (t) => t ? `${t} · Focus` : 'Focus' })
</script>
