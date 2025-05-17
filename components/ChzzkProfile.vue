<script setup lang="ts">
import { getChzzkUser, type IChzzkStreamer } from "@/assets/tools";

const props = defineProps<{ uid: string }>();
const emit = defineEmits<{
  profile: [value: IChzzkStreamer | undefined];
}>();
const streamer: Ref<IChzzkStreamer | undefined> = ref(undefined);
const config = useRuntimeConfig();

(async () => {
  try {
    streamer.value = await getChzzkUser(props.uid, config.public.backend_url);
    emit("profile", streamer.value);
  } catch (e) {
    console.error(`ChzzkProfile: Error found! ${e ?? ""}`);
  }
})();
</script>

<template>
  <div
    v-if="streamer"
    class="rounded-lg shadow-md p-4"
    :class="{
      'bg-green-300': streamer.isStreamOn,
      'bg-blue-300': !streamer.isStreamOn,
    }"
  >
    <div class="p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <figure class="w-12 h-12">
            <img
              class="rounded-full"
              :src="streamer.avatarUrl"
              :alt="`${streamer.nickname}'s Avatar`"
            />
          </figure>
        </div>
        <div class="ml-4">
          <p class="text-xl font-bold">{{ streamer.nickname }}</p>
          <a
            class="text-sm text-gray-100 hover:text-gray-200"
            :href="`https://chzzk.naver.com/live/${streamer.uid}`"
            >치지직 바로가기</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
