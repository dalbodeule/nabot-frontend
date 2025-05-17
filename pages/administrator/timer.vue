<script setup lang="ts">
import type { Ref } from "vue";
import { Status, TimerType } from "assets/enums";
import { getCurrentUser, getLoading, getUser } from "assets/tools";

const timerOptions: { [key: number]: string } = { 0: "업타임", 2: "삭제" }; // 실제 옵션에 맞게 수정
const options: Ref<TimerType> = ref(TimerType.REMOVE);
const status = getLoading();

const config = useRuntimeConfig();
const user = getUser();
const currentUser = getCurrentUser();
const { copy: copyText } = useClipboard();

definePageMeta({
  layout: "administrator",
});

useSeoMeta({
  title: "Chibot :: administrator :: Timer",
  robots: false,
});

const getTimer = async () => {
  try {
    const response = (await useRequestFetch()(
      `${config.public.backend_url}/timerapi/${user?.value?.at(currentUser.value)?.uid}`,
      {
        method: "GET",
        credentials: "include",
      },
    )) as { option: number };

    options.value = response.option;
  } catch (e) {
    console.error(e);
    status.value = Status.REQUIRE_LOGIN;
  }
};

const setTimer = async () => {
  try {
    status.value = Status.LOADING;

    await useRequestFetch()(
      `${config.public.backend_url}/timerapi/${user?.value?.at(currentUser.value)?.uid}`,
      {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ option: options.value }),
      },
    );

    status.value = Status.DONE;
  } catch (e) {
    console.log(e);
    status.value = Status.ERROR;
  }
};

watchEffect(async () => {
  console.log(user?.value?.at(currentUser.value)?.uid);
  await getTimer();
  status.value = Status.DONE;
});
</script>

<template>
  <div class="w-full h-full">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">타이머 설정</h1>
      <!-- 타이머 옵션 선택 -->
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">타이머 옵션 선택</label>
        <div class="flex gap-2">
          <select
            v-model="options"
            class="block appearance-none w-full bg-white border border-gray-300 rounded px-4 py-2 pr-8"
          >
            <option v-for="(option, index) in timerOptions" :key="index" :value="index">
              {{ option }}
            </option>
          </select>
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
            @click="setTimer"
          >
            저장
          </button>
        </div>
      </div>
    </div>

    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">타이머 위젯 URL</h1>
      <div class="mb-4">
        <div class="flex">
          <div class="flex w-full">
            <input
              :value="`${config.public.frontend_url}/timer/${user?.at(currentUser)?.uid ?? ''}`"
              disabled
              class="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
              type="url"
            />
            <button
              type="button"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              @click="
                copyText(
                  `${config.public.frontend_url}/timer/${user?.at(currentUser)?.uid ?? ''}`,
                )
              "
            >
              복사하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
