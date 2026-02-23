<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Initialize auth state once when the app first loads on the client.
// This ensures the store is populated before any route middleware runs.
const authStore = useAuthStore()
if (import.meta.client && !authStore.initialized) {
  await authStore.fetchMe()
}
</script>
