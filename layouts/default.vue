<script lang="ts" setup>
import "bulma/bulma.scss"
import "bulma/sass/themes/light.scss"

import "@/assets/loading.scss"
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";
import {getSessionUser} from "assets/tools";
import {Status} from "assets/enums";

const config = useRuntimeConfig()

const user: Ref<IChzzkSession[] | undefined> = ref(undefined)
const currentUser: Ref<number> = ref(0)
const status: Ref<Status> = ref(Status.LOADING)

provide("USER", user)
provide("CURRENT_USER", currentUser)

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
    <div>
      <SiteHeader />
      <div class="container" style="margin-top: 20px; min-height: 80vh;">
        <NuxtPage />
      </div>
      <SiteFooter />
    </div>
  </div>
</template>