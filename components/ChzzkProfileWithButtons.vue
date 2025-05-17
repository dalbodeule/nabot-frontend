<script setup lang="ts">
import type { IChzzkStreamer } from "@/assets/tools";

export interface IChzzkSession extends IChzzkStreamer {
  maxQueueSize: number;
  maxUserSize: number;
  isStreamerOnly: boolean;
  isDisabled: boolean;
}

const { profile } = defineProps<{ profile: IChzzkSession; idx: number }>();
const emit = defineEmits<{
  profile: [IChzzkStreamer | undefined];
  selected: [value: number];
}>();
</script>

<template>
  <div
    class="mb-4 card"
    :class="{
      'bg-primary': profile.isStreamOn,
      'bg-info': !profile.isStreamOn,
    }"
  >
    <div class="p-4">
      <div class="flex">
        <div class="mr-4">
          <figure class="w-12 h-12">
            <img
              :src="profile.avatarUrl"
              :alt="`${profile.nickname}'s Avatar`"
              class="rounded-full"
            />
          </figure>
        </div>
        <div class="flex flex-1 items-center justify-between">
          <p class="text-2xl font-bold">{{ profile.nickname }}</p>
          <a
            class="text-sm"
            :href="`https://chzzk.naver.com/live/${profile.uid}`"
            target="_blank"
            >치지직 바로가기</a
          >
          <button
            class="ml-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            type="button"
            @click="emit('selected', idx)"
          >
            유저 선택
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
