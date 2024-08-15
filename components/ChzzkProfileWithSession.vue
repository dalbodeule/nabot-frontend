<script setup lang="ts">
import "bulma/bulma.scss"
import type {Ref} from "vue";
import {type IChzzkStreamer} from "assets/tools";

export interface IChzzkSession extends IChzzkStreamer {
  maxQueueSize: number,
  maxUserSize: number,
  isStreamerOnly: boolean,
  isDisabled: boolean,
}

const streamer: Ref<IChzzkStreamer | undefined> | undefined = inject("USER")
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
            target="_blank"
          >바로가기</a>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-4">로그인이 필요합니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>