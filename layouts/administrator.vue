<script lang="ts" setup>
import "bulma/bulma.scss"
import "bulma/sass/themes/light.scss"

import "@/assets/loading.scss"
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {getSessionUser} from "assets/tools";
import {Status} from "assets/enums";

const config = useRuntimeConfig()
const route = useRoute()

const user: Ref<IChzzkSession | undefined> = ref(undefined)
const status: Ref<Status> = ref(Status.LOADING)

;(async() => {
  try {
    status.value = Status.LOADING
    user.value = await getSessionUser(config.public.backend_url)
    status.value = Status.DONE
  } catch(e) {
    if(e.status == 404) {
      status.value = Status.REQUIRE_REGISTER
    } else {
      status.value = Status.ERROR
    }
  }
})()

provide("USER", user)

useHead({
  htmlAttrs: {
    class: 'theme-light'
  }
})

</script>
<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading"/>
    </div>
    <div style="width: 100%; height: 100%;">
      <SiteHeader />
      <div class="container" style="margin-top: 20px; min-height: 80vh;">
        <div class="tabs">
          <ul>
            <li :class="{ 'is-active': route.path === '/administrator/command' }">
              <NuxtLink to="/administrator/command">명령어 설정</NuxtLink>
            </li>
            <li :class="{ 'is-active': route.path === '/administrator/discord' }">
              <NuxtLink to="/administrator/discord">디스코드 설정</NuxtLink>
            </li>
            <li :class="{ 'is-active': route.path === '/administrator/timer' }">
              <NuxtLink to="/administrator/timer">타이머 설정</NuxtLink>
            </li>
          </ul>
        </div>
        <NuxtPage />
      </div>
      <SiteFooter />
    </div>
  </div>
</template>