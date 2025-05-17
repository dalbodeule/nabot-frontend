<script setup lang="ts">
import type { Ref } from "vue";
import { Status } from "assets/enums";
import { defaultCommands, getLoading } from "assets/tools";

export interface ICommandType {
  label: string;
  content: string;
  failContent: string;
  isNew: boolean;
}

const commands: Ref<ICommandType[]> = ref([]);
const status = getLoading();
const route = useRoute();
const uid = route.params.uid as string;

const config = useRuntimeConfig();

useSeoMeta({
  title: "Chibot :: Command",
  robots: false,
});

onMounted(async () => {
  try {
    const response = (await useRequestFetch()(
      `${config.public.backend_url}/commands/${uid}`,
      {
        method: "GET",
        credentials: "include",
      },
    )) as { label: string; content: string; failContent: string }[];
    if (response) {
      commands.value = response.map((value) => {
        return { ...value, isNew: false };
      });
      status.value = Status.DONE;
    }
  } catch (e) {
    console.error(e);
    status.value = Status.ERROR;
  }
});
</script>

<template>
  <div class="w-full h-full">
    <div class="p-6">
      <ChzzkProfile :uid="uid" />

      <h2>기본 명령어</h2>
      <div
        v-for="(command, index) in defaultCommands"
        :key="`def-${index}`"
        class="p-4 mb-4 bg-white rounded-lg shadow"
      >
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">명령어 이름</label>
          <div>
            <input
              v-model="command.label"
              class="w-full px-3 py-2 border rounded-lg bg-gray-100"
              type="text"
              disabled
            />
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">명령어 내용</label>
          <div>
            <input
              v-model="command.content"
              type="text"
              class="w-full px-3 py-2 border rounded-lg bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>
      <br />
      <h2>스트리머 명령어</h2>

      <!-- 명령어 목록 -->
      <div
        v-for="(command, index) in commands"
        :key="index"
        class="p-4 mb-4 bg-white rounded-lg shadow"
      >
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">명령어 이름</label>
          <div>
            <input
              v-model="command.label"
              class="w-full px-3 py-2 border rounded-lg bg-gray-100"
              type="text"
              disabled
            />
          </div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-bold mb-2">명령어 내용</label>
          <div>
            <input
              v-model="command.content"
              type="text"
              class="w-full px-3 py-2 border rounded-lg bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
