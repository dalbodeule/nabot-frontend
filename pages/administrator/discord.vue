<script setup lang="ts">

import type {Ref} from "vue";
import {Status} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

definePageMeta({
  layout: 'administrator'
})

const options: Ref<{ user: string, token: string } | undefined> = ref(undefined)
const guilds: Ref<number[]> = ref([])
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
    guilds.value = await useRequestFetch()(`${config.public.backend_url}/discord`, {
      method: 'GET',
      credentials: 'include'
    })
    if(guilds.value.length == 0) {
      status.value = Status.REQUIRE_DISCORD
    }
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
                <p>로그인 버튼을 누른 뒤, 원하는 디스코드 서버를 선택해주세요!</p>
                <a
                    :href="`${config.public.backend_url}/auth/login/discord?redirectUrl=https://nabot.mori.space/administrator/discord`"
                    target="_self"
                    class="button"
                    style="color: #ffffff; background-color: #5865F2;"
                >
                  <FontAwesomeIcon icon="['fab', 'discord']" /> Discord로 로그인
                </a>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="content">
      <h1>디스코드 설정</h1>
    </div>
  </div>
</template>

<style scoped>

</style>