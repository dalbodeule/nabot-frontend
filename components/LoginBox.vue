<script setup lang="ts">
const props = defineProps<{ url: string }>()
const config = useRuntimeConfig()
</script>

<template>
  <div class="box">
    <div class="content">
      <p>로그인이 필요합니다.</p><br>
      <a
          class="button is-align-self-center"
          :href="`${config.public.backend_url}/auth/login?redirectUrl=${props.url}`"
          target="_self"
          style="color: #ffffff; background-color: #03c75a;"
      >
        <img src="@/public/naver-logo.png" style="height: 20px;">
        &nbsp;Naver 아이디로 로그인
      </a>
    </div>
  </div>
</template>

<style scoped>

</style>