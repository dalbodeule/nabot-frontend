<script lang="ts" setup>
import "bulma/bulma.scss"
import "bulma/sass/themes/light.scss"

import "@/assets/loading.scss"
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {getSessionUser} from "assets/tools";
import {Status} from "assets/enums";

const config = useRuntimeConfig()

const user: Ref<IChzzkSession | undefined> = ref(undefined)
const status: Ref<Status> = ref(Status.LOADING)

const chzzkId: Ref<string> = ref("")

provide("USER", user)

const registerChzzk = async () => {
  try {
    status.value = Status.LOADING
    const response = await useRequestFetch()(`${config.public.backend_url}/user`, {
      method: 'POST',
      body: JSON.stringify({ chzzkUrl: chzzkId.value }),
      credentials: "include"
    })
    if(response) {
      status.value = Status.DONE
    }
  } catch(e) {
    console.error(e)
    status.value = Status.REQUIRE_REGISTER
  }
}

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
      <div v-if="status == Status.REQUIRE_REGISTER" class="page-overlay">
        <div class="box">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <form @submit.prevent="registerChzzk">
                  <h1>치지직 주소를 입력해 주세요!</h1>
                  <div class="field">
                    <label class="label">치지직 주소</label>
                    <div class="control">
                      <input v-model="chzzkId" class="input" type="url" placeholder="https://chzzk.naver.com/">
                    </div>
                  </div>
                  <div class="field is-grouped is-grouped-right">
                    <div class="control">
                      <button type="submit" class="button is-primary">제출하기!</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteHeader />
      <div class="container" style="margin-top: 20px; min-height: 80vh;">
        <NuxtPage />
      </div>
      <SiteFooter />
    </div>
  </div>
</template>