<script setup lang="ts">
const props = defineProps<{ url: string }>();
const config = useRuntimeConfig();
</script>

<template>
  <div class="box">
    <div class="content">
      <p>로그인이 필요합니다.</p>
      <br />
      <a
        class="button is-align-self-center"
        :href="`${config.public.backend_url}/auth/login?redirectUrl=${props.url}`"
        target="_self"
        style="color: #ffffff; background-color: #000000"
      >
        <img src="@/public/naver-logo.png" style="height: 20px" alt="치지직 아이디로 로그인" />
        &nbsp;치지직 아이디로 로그인
      </a>
    </div>
  </div>
</template>

<style scoped></style>
