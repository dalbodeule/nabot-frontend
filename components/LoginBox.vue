<script setup lang="ts">
const props = defineProps<{ url: string }>();
const config = useRuntimeConfig();
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="text-center">
      <p class="text-gray-800">로그인이 필요합니다.</p>
      <br />
      <a
        class="inline-flex items-center justify-center px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
        :href="`${config.public.backend_url}/auth/login?redirectUrl=${props.url}`"
        target="_self"
      >
        <img
          src="@/public/naver-logo.png"
          class="h-5 w-auto"
          alt="치지직 아이디로 로그인"
        />
        <span class="ml-2">치지직 아이디로 로그인</span>
      </a>
    </div>
  </div>
</template>

<style scoped></style>
