<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/home', { replace: true })
    },
  ],
})
</script>
