<script setup lang="ts">
const config = useRuntimeConfig()

if(import.meta.client)
  window.location.href = `${config.public.backend_url}?redirectUrl=${config.public.frontend_url}/auth/login`
</script>