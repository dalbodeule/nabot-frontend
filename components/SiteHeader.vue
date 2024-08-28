<script setup lang="ts">
import type { Ref } from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";

const show: Ref<boolean> = ref(false)
const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))

const config = useRuntimeConfig()

</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <NuxtLink class="navbar-item" to="/">
        <img src="~/public/favicon.png" alt="">&nbsp; 나봇
      </NuxtLink>
    </div>
    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="show = !show">
      <span aria-hidden="true"/>
      <span aria-hidden="true"/>
      <span aria-hidden="true"/>
      <span aria-hidden="true"/>
    </a>
    <div class="navbar-menu" :class="show ? 'is-active' : ''">
      <div class="navbar-start">
        <a class="navbar-item" href="/privacy" target="_blank">개인정보 처리방침</a>
        <a class="navbar-item" href="/policy" target="_blank">이용약관</a>
      </div>
      <div v-if="user == undefined" class="navbar-end">
        <a
          class="button is-align-self-center navbar-item"
          :href="`${config.public.backend_url}/auth/login`"
          target="_self"
          style="color: #ffffff; background-color: #03c75a;"
      >
        <img src="@/public/naver-logo.png" style="height: 20px;">
        &nbsp;Naver 아이디로 로그인
      </a>
      </div>
      <div v-else class="navbar-end">
        <NuxtLink class="navbar-item" to="/logout">로그아웃</NuxtLink>
        <NuxtLink class="navbar-item" to="/administrator">봇 관리</NuxtLink>
      </div>
    </div>
  </nav>
</template>