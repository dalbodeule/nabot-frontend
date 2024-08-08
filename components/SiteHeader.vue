<script setup lang="ts">
import type { Ref } from "vue";

const show: Ref<boolean> = ref(false)
const user = inject("USER")

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
        <NuxtLink v-if="user != undefined" class="navbar-item" to="/songlist">치수 플레이리스트</NuxtLink>
        <a class="navbar-item" href="/privacy" target="_blank">개인정보 처리방침</a>
        <a class="navbar-item" href="/policy" target="_blank">이용약관</a>
      </div>
      <div v-if="user == undefined" class="navbar-end">
        <NuxtLink class="navbar-item" to="/login">로그인</NuxtLink>
      </div>
      <div v-else class="navbar-end">
        <NuxtLink class="navbar-item" to="/logout">로그아웃</NuxtLink>
      </div>
    </div>
  </nav>
</template>