<script setup lang="ts">
const router = useRouter();
const config = useRuntimeConfig();

onMounted(async () => {
  await useRequestFetch()(`${config.public.backend_url}/auth/logout`, {
    method: "GET",
    credentials: "include",
  });

  await router.push("/");
});
</script>
