<script setup lang="ts">
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {Status} from "assets/enums";

const user: Ref<IChzzkSession | undefined> | undefined = inject("USER")
const status: Ref<Status> = ref(Status.LOADING)

useSeoMeta({
  title: 'Nabot :: Main',
  description: 'Nabot :: smart chzzk bot.'
})

;(async() => {
  try {
    status.value = Status.DONE
  } catch(e) {
    console.error("error", e)
  }
})()
</script>

<template>
  <div>
    <section class="section">
      <div class="content">
        <h1>나봇 홈페이지는 아직 제작중입니다.</h1>
      </div>
      <iframe
        src="https://discord.com/widget?id=1250093195870867577&theme=dark"
        width="350"
        height="500"
        allowtransparency="true"
        frameborder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      />
      <br>
      <template v-if="user">
        <ChzzkProfileWithSession />
      </template>
      <template v-else>
        <LoginBox url="https://nabot.mori.space/"/>
      </template>
    </section>
  </div>
</template>

<style scoped>

</style>