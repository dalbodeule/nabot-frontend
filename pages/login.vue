<script setup lang="ts">
const config = useRuntimeConfig()

if(import.meta.client)
  window.location.href = `${config.public.backend_url}?redirectUrl=https://nabot.mori.space/auth/login`
</script>