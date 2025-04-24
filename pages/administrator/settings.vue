<script setup lang="ts">
import type {Ref} from "vue";
import {Status} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";

definePageMeta({
  layout: 'administrator'
})

export interface IUserSettingsDTO {
  isBotDisabled: boolean,
  isBotMsgDisabled: boolean
}

const status: Ref<Status> = ref(Status.LOADING)
const options: Ref<IUserSettingsDTO> = ref({
  isBotDisabled: false,
  isBotMsgDisabled: false
})

const config = useRuntimeConfig()
const _user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))
const currentUser: Ref<number> = inject("CURRENT_USER", ref(0))

definePageMeta({
  layout: 'administrator'
})

useSeoMeta({
  title: "Nabot :: administrator :: 기본설정",
  robots: false
})

const getSettings = async() => {
  try {
    options.value = await useRequestFetch()(`${config.public.backend_url}/settings`, {
      method: 'GET',
      credentials: 'include'
    })
  } catch(e) {
    console.error(e)
    status.value = Status.REQUIRE_LOGIN
  }
}

const setSettings = async() => {
  try {
    status.value = Status.LOADING

    await useRequestFetch()(`${config.public.backend_url}/settings`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(options.value)
    })

    status.value = Status.DONE
  } catch(e) {
    console.log(e)
    status.value = Status.ERROR
  }
}

watchEffect(async () => {
  await getSettings()
  status.value = Status.DONE
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader" />
    </div>
    <div v-else-if="status == Status.REQUIRE_LOGIN" class="page-overlay">
      <LoginBox url="https://nabot.mori.space/administrator/songlist" />
    </div>
    <div v-else-if="currentUser > 0" class="page-overlay">
      <div class="box">
        <div class="content">
          <p>기본설정 기능은 본인만 접속이 가능합니다.</p>
          <NuxtLink to="/administrator" class="button is-primary">돌아가기</NuxtLink>
        </div>
      </div>
    </div>
    <div class="content">
      <h1 class="title">기본 설정</h1>
      <!-- 타이머 옵션 선택 -->
      <div class="field">
        <label class="label">봇 제어</label>
        <div class="control">
          <div class="select">
            <select v-model="options.isBotDisabled">
              <option :value="false">봇 켜기</option>
              <option :value="true">봇 끄기</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">봇 알림메세지 제어</label>
        <div class="control">
          <div class="select">
            <select v-model="options.isBotMsgDisabled">
              <option :value="false">알림메세지 켜기</option>
              <option :value="true">알림메세지 끄기</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="field">
        <div class="control">
          <button class="button is-primary" @click="setSettings">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>