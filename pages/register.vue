<script setup lang="ts">
const config = useRuntimeConfig();
</script>

<template>
  <LoginBox :url="config.public.frontend_url" />
</template>

<style scoped></style>
