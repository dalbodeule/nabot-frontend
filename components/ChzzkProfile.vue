<script setup lang="ts">
import "bulma/bulma.scss"
import type {Ref} from "vue";
import {getChzzkUser, type IChzzkStreamer} from "assets/tools";

const props = defineProps<{ uid: string }>()
const emit = defineEmits<{
  profile: [value: IChzzkStreamer | undefined ]
}>()
const streamer: Ref<IChzzkStreamer | undefined> = ref(undefined)
const config = useRuntimeConfig()

;(async() => {
  try {
    streamer.value = await getChzzkUser(props.uid, config.public.backend_url)
    emit("profile", streamer.value)
  } catch(e) {
    console.error(`ChzzkProfile: Error found! ${e ?? ""}`)
  }
})()
</script>

<template>
  <div
    v-if="streamer"
    class="card"
    :class="{
    'has-background-primary': streamer.isStreamOn,
    'has-background-info': !streamer.isStreamOn
    }"
  >
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img
              :src="streamer.avatarUrl"
              :alt="`${streamer.nickname}'s Avatar`"
            >
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4">{{streamer.nickname}}</p>
          <a
            class="subtitle is-6"
            :href="`https://chzzk.naver.com/live/${streamer.uid}`"
          >바로가기</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>