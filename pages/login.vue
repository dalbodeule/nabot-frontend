<script setup lang="ts">
const router = useRouter()
const config = useRuntimeConfig()

router.push(`${config.public.backend_url}/auth/login`)
</script>