<script setup lang="ts">
import "bulma/bulma.scss"
import type {Ref} from "vue";
import {getSessionUser, type IChzzkStreamer} from "assets/tools";

export interface IChzzkSession extends IChzzkStreamer {
  maxQueueSize: number,
  maxUserSize: number,
  isStreamerOnly: boolean,
}

const props = defineProps<{ sid: string }>()
const emit = defineEmits<{
  profile: [value: IChzzkSession | undefined ]
}>()
const streamer: Ref<IChzzkSession | undefined> = ref(undefined)

;(async() => {
  try {
    streamer.value = await getSessionUser(props.sid)
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