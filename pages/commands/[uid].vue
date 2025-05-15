<script setup lang="ts">
import "@/assets/loading.scss";
import type { Ref } from "vue";
import { Status } from "assets/enums";
import { defaultCommands } from "assets/tools";

export interface ICommandType {
  label: string;
  content: string;
  failContent: string;
  isNew: boolean;
}

const commands: Ref<ICommandType[]> = ref([]);
const status: Ref<Status> = ref(Status.LOADING);
const route = useRoute();
const uid = route.params.uid as string;

const config = useRuntimeConfig();

useSeoMeta({
  title: "Chibot :: Command",
  robots: false,
});
(async () => {
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
})();
</script>

<template>
  <div style="width: 100%; height: 100%">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading" />
    </div>
    <div class="content">
      <ChzzkProfile :uid="uid" />

      <h2>기본 명령어</h2>
      <div v-for="(command, index) in defaultCommands" :key="`def-${index}`" class="box">
        <div class="field">
          <label class="label">명령어 이름</label>
          <div class="control">
            <input v-model="command.label" class="input" type="text" disabled />
          </div>
        </div>
        <div class="field">
          <label class="label">명령어 내용</label>
          <div class="control">
            <input v-model="command.content" type="text" class="input" disabled />
          </div>
        </div>
      </div>
      <br />
      <h2>스트리머 명령어</h2>

      <!-- 명령어 목록 -->
      <div v-for="(command, index) in commands" :key="index" class="box">
        <div class="field">
          <label class="label">명령어 이름</label>
          <div class="control">
            <input v-model="command.label" class="input" type="text" disabled />
          </div>
        </div>
        <div class="field">
          <label class="label">명령어 내용</label>
          <div class="control">
            <input v-model="command.content" type="text" class="input" disabled />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
