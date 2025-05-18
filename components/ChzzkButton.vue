<script setup lang="ts">
const props = defineProps<{
  uri: string,
  content: string
}>()
</script>

<template>
  <a
      class="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
      :href="`https://chzzk.naver.com/${props.uri.replace(/^\//, '')}`"
      target="_blank"
  >
    <img src="@/public/naver-logo.png" alt="치지직 로고" class="w-4 h-4" />
    {{ content }}
  </a>
</template>