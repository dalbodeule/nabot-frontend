<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

route.path = `${config.public.backend_url}/auth/login`
</script>