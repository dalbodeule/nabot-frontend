<script setup lang="ts">
import type { Ref } from "vue";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";

const show: Ref<boolean> = ref(false);
const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined));

const config = useRuntimeConfig();
</script>

<template>
  <nav class="bg-white shadow" role="navigation" aria-label="main navigation">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <div class="flex items-center flex-shrink-0 mr-6">
        <NuxtLink class="flex items-center" to="/">
          <img src="~/public/favicon.png" class="mr-2 h-[36px] rounded-lg" alt="" />
          <h2 class="text-xl">치봇</h2>
        </NuxtLink>
      </div>
      <!-- 모바일 뷰 햄버거 버튼 -->
      <div class="block md:hidden">
        <button
          id="hamburger"
          class="focus:outline-none"
          type="button"
          @click="show = !show"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
      <div
        class="w-full flex-grow lg:flex lg:items-center lg:w-auto lg:justify-between"
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
        <div v-if="!user" class="flex items-center">
          <a
            class="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            :href="`${config.public.backend_url}/auth/login`"
            target="_self"
          >
            <img src="@/public/naver-logo.png" class="h-5 mr-2" alt="" />
            치지직 아이디로 로그인
          </a>
        </div>
        <div v-else class="flex items-center">
          <NuxtLink class="px-4 py-2 hover:text-gray-600" to="/logout">로그아웃</NuxtLink>
          <NuxtLink class="px-4 py-2 hover:text-gray-600" to="/administrator"
            >봇 관리
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
