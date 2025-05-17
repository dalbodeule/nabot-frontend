<script setup lang="ts">
import type { Ref } from "vue";
import { Status } from "assets/enums";
import { getCurrentUser, getLoading, getUser } from "assets/tools";

export interface IUserSettingsDTO {
  isBotDisabled: boolean;
  isBotMsgDisabled: boolean;
}

const status = getLoading();
const options: Ref<IUserSettingsDTO> = ref({
  isBotDisabled: false,
  isBotMsgDisabled: false,
});

const config = useRuntimeConfig();
const user = getUser();
const currentUser = getCurrentUser();

definePageMeta({
  layout: "administrator",
});

useSeoMeta({
  title: "Chibot :: administrator :: 기본설정",
  robots: false,
});

const getSettings = async () => {
  try {
    options.value = await useRequestFetch()(`${config.public.backend_url}/settings`, {
      method: "GET",
      credentials: "include",
    });
  } catch (e) {
    console.error(e);
    status.value = Status.REQUIRE_LOGIN;
  }
};

const setSettings = async () => {
  try {
    status.value = Status.LOADING;

    await useRequestFetch()(`${config.public.backend_url}/settings`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(options.value),
    });

    status.value = Status.DONE;
  } catch (e) {
    console.log(e);
    status.value = Status.ERROR;
  }
};

watchEffect(async () => {
  console.log(`${user.value?.at(currentUser.value)?.uid}`);
  await getSettings();
  status.value = Status.DONE;
});
</script>

<template>
  <div class="w-full h-full">
    <div
      v-if="status == Status.REQUIRE_LOGIN"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <LoginBox :url="`${config.public.frontend_url}/administrator/songlist`" />
    </div>
    <div
      v-else-if="currentUser > 0"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="text-center">
          <p class="mb-4">기본설정 기능은 본인만 접속이 가능합니다.</p>
          <NuxtLink
            to="/administrator"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >돌아가기
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">기본 설정</h1>
      <!-- 타이머 옵션 선택 -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">봇 제어</label>
        <div class="relative">
          <select
            v-model="options.isBotDisabled"
            class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option :value="false">봇 켜기</option>
            <option :value="true">봇 끄기</option>
          </select>
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2"
          >봇 알림메세지 제어</label
        >
        <div class="relative">
          <select
            v-model="options.isBotMsgDisabled"
            class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
          >
            <option :value="false">알림메세지 켜기</option>
            <option :value="true">알림메세지 끄기</option>
          </select>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="mt-6">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          @click="setSettings"
        >
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
