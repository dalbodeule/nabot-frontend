<script setup lang="ts">
const router = useRouter();
const config = useRuntimeConfig();

window.location.href = `${config.public.backend_url}/auth/logout`
</script>
