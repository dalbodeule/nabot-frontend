<script setup lang="ts">

import type {Ref} from "vue";
import {Status} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";

definePageMeta({
  layout: 'administrator'
})

const options: Ref<{ user: string, token: string } | undefined> = ref(undefined)
const status: Ref<Status> = ref(Status.LOADING)

const config = useRuntimeConfig()
const user: Ref<IChzzkSession | undefined> | undefined = inject("USER")

definePageMeta({
  layout: 'administrator'
})

useSeoMeta({
  title: "Nabot :: administrator :: Discord",
  robots: false
})

const getDiscordStatus = async() => {
  try {
    options.value = await useRequestFetch()(`${config.public.backend_url}/discord/${user?.value?.uid}`, {
      method: 'GET',
      credentials: 'include'
    })
    status.value = Status.DONE
  } catch(e) {
    console.error(e.status, e.data)
    if(e.status == 404) {
      options.value = e.data as { user: string, token: string }
      status.value = Status.REQUIRE_DISCORD
    } else {
      console.error("Error! ", e)
      status.value = Status.REQUIRE_LOGIN
    }
  }
}

watchEffect(async () => {
  console.log(user?.value?.uid)

  await getDiscordStatus()
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading"/>
    </div>
    <div v-else-if="status == Status.REQUIRE_DISCORD" class="page-overlay">
      <div class="box">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p>연동을 원하는 디스코드 서버에서 다음 명령어를 입력해주세요!</p>
                <p>/hook token:{{ options?.token }}</p>
                <p>연동 후 새로고침 버튼을 눌러주세요!</p>
                <button
                  type="button"
                  class="button is-primary"
                  @click="getDiscordStatus"
                >새로고침</button>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="content">
      <!-- <h1 class="title">타이머 설정</h1>
      <div class="field">
        <label class="label">타이머 옵션 선택</label>
        <div class="control">
∂
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button class="button is-primary" @click="setTimer">저장</button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>

</style>