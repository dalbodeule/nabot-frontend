<script setup lang="ts">
import "bulma/bulma.scss"
import type {IChzzkStreamer} from "@/assets/tools";

export interface IChzzkSession extends IChzzkStreamer {
  maxQueueSize: number,
  maxUserSize: number,
  isStreamerOnly: boolean,
  isDisabled: boolean,
}

const { profile } = defineProps<{ profile: IChzzkSession, idx: number }>()
const emit = defineEmits<{
  (e: 'profile', value: IChzzkStreamer | undefined): void
  (e: 'selected', value: number): void
}>()
</script>

<template>
  <div
    class="card"
    :class="{
    'has-background-primary': profile.isStreamOn,
    'has-background-info': !profile.isStreamOn
    }"
    style="margin-bottom: 1em;"
  >
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img
              :src="profile.avatarUrl"
              :alt="`${profile.nickname}'s Avatar`"
            >
          </figure>
        </div>
        <div class="media-content" style="display: flex; justify-content: space-between; align-items: center;">
          <p class="title is-4">{{profile.nickname}}</p>
          <a
            class="subtitle is-6"
            :href="`https://chzzk.naver.com/live/${profile.uid}`"
            target="_blank"
          >치지직 바로가기</a>
          <button class="button is-warning" type="button" style="margin-left: auto;" @click="emit('selected', idx)">
            유저 선택
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>