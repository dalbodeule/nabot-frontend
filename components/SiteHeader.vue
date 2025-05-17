<script setup lang="ts">
import type { Ref } from "vue";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";

const show: Ref<boolean> = ref(false);
const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined));

const config = useRuntimeConfig();
</script>

<template>
  <nav
    class="flex items-center justify-between flex-wrap bg-white p-4"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="flex items-center flex-shrink-0 mr-6">
      <NuxtLink class="flex items-center" to="/">
        <img src="~/public/favicon.png" class="mr-2 !max-w-[20px]" alt="" /> 치봇
      </NuxtLink>
    </div>
    <button
      class="block lg:hidden px-2 py-1"
      aria-label="menu"
      aria-expanded="false"
      @click="show = !show"
    >
      <span class="block w-6 h-0.5 bg-black mb-1"></span>
      <span class="block w-6 h-0.5 bg-black mb-1"></span>
      <span class="block w-6 h-0.5 bg-black mb-1"></span>
      <span class="block w-6 h-0.5 bg-black"></span>
    </button>
    <div
      class="w-full flex-grow lg:flex lg:items-center lg:w-auto"
      :class="show ? 'block' : 'hidden'"
    >
      <div class="text-sm">
        <a class="px-4 py-2 hover:text-gray-600" href="/privacy" target="_blank"
          >개인정보 처리방침</a
        >
        <a class="px-4 py-2 hover:text-gray-600" href="/policy" target="_blank"
          >이용약관</a
        >
      </div>
      <div v-if="user == undefined" class="flex items-center">
        <a
          class="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          :href="`${config.public.backend_url}/auth/login`"
          target="_self"
        >
          <img src="@/public/naver-logo.png" class="h-5 mr-2" alt="" />
          치지직 아이디로 로그인
        </a>
      </div>
      <div v-else class="flex items-center space-x-4">
        <NuxtLink class="px-4 py-2 hover:text-gray-600" to="/logout">로그아웃</NuxtLink>
        <NuxtLink class="px-4 py-2 hover:text-gray-600" to="/administrator"
          >봇 관리</NuxtLink
        >
      </div>
    </div>
  </nav>
</template>
