<script setup lang="ts">

import type {Ref} from "vue";
import {Status, TimerType} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";

definePageMeta({
  layout: 'administrator'
})

const timerOptions: {[key: number]: string} = {0: "업타임", 2: "삭제"}; // 실제 옵션에 맞게 수정
const options: Ref<TimerType> = ref(TimerType.REMOVE)
const status: Ref<Status> = ref(Status.LOADING)

const config = useRuntimeConfig()
const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))
const currentUser: Ref<number> = inject("CURRENT_USER", ref(0))

definePageMeta({
  layout: 'administrator'
})

useSeoMeta({
  title: "Nabot :: administrator :: Timer",
  robots: false
})

const getTimer = async() => {
  try {
    const response = await useRequestFetch()(`${config.public.backend_url}/timerapi/${user?.value?.at(currentUser.value)?.uid}`, {
      method: 'GET',
      credentials: 'include'
    }) as { option: number }

    options.value = response.option
  } catch(e) {
    console.error(e)
    status.value = Status.REQUIRE_LOGIN
  }
}

const setTimer = async() => {
  try {
    status.value = Status.LOADING

    await useRequestFetch()(`${config.public.backend_url}/timerapi/${user?.value?.at(currentUser.value)?.uid}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ option: options.value })
    })

    status.value = Status.DONE
  } catch(e) {
    console.log(e)
    status.value = Status.ERROR
  }
}

watchEffect(async () => {
  console.log(user?.value?.uid)
  await getTimer()
  status.value = Status.DONE
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading"/>
    </div>
    <div class="content">
      <h1 class="title">타이머 설정</h1>
      <!-- 타이머 옵션 선택 -->
      <div class="field">
        <label class="label">타이머 옵션 선택</label>
        <div class="control">
          <div class="select">
            <select v-model="options">
              <option v-for="(option, index) in timerOptions" :key="index" :value="index">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="field">
        <div class="control">
          <button class="button is-primary" @click="setTimer">저장</button>
        </div>
      </div>
    </div>
    <div class="content">
      <h1 class="title">타이머 위젯 URL</h1>
      <div class="field">
        <div class="control">
          <div class="field has-addons">
            <div class="control">
              <input
                  :value="`https://nabot.mori.space/timer/${streamer?.at(currentUser)?.uid ?? ''}`"
                  disabled
                  class="input is-fullwidth"
                  type="url"
              >
            </div>
            <div class="control">
              <button
                  type="button"
                  class="button is-info"
                  @click="copyText(`https://nabot.mori.space/timer/${streamer?.at(currentUser)?.uid ?? ''}`)"
              >복사하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>