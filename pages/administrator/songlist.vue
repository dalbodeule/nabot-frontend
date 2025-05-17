<script setup lang="ts">
import { onBeforeUnmount, type Ref, watch, nextTick } from "vue";
import { SongType, Status } from "assets/enums";
import {
  _PING_TIME,
  formatSeconds,
  getChzzkUser,
  getCurrentUser,
  getLoading,
  getUser,
  getYoutubeVideoId,
  wait,
} from "@/assets/tools";
import type { ISong, ISongResponse, ISongResponseWS } from "~/pages/songs/[uid].vue";
import YouTube from "vue3-youtube";

export interface ISongRequest {
  type: SongType;
  uid: string;
  url: string | null;
  maxQueue: number | null;
  maxUserLimit: number | null;
  isStreamerOnly: boolean | null;
  remove: number | null;
  isDisabled: boolean | null;
}

const config = useRuntimeConfig();
const status = getLoading();
const streamer = getUser();
const currentUserId = getCurrentUser();

const songQueue: Ref<ISong[]> = ref([]);
const { copy: copyText } = useClipboard();
const autoPlay: Ref<boolean> = ref(true);
const current: Ref<ISong | undefined> = ref();
const youtubeId: Ref<string> = ref("");
const showPlayer: Ref<boolean> = ref(false);
const queueSize = ref(50);
const personalSize = ref(5);
const streamerOnly = ref(false);
const isDisabled = ref(false);
const isFirstPlay = ref(true);
const isDataLoading = ref(false);

definePageMeta({
  layout: "administrator",
});

const newSongUrl: Ref<string> = ref("");

const {
  send,
  status: webSocketStatus,
  close,
  open,
} = useWebSocket(`wss://${config.public.backend_url.replace("https://", "")}/songlist`, {
  autoReconnect: true,
  immediate: false,
  heartbeat: {
    message: "ping",
    interval: _PING_TIME,
  },
  onConnected: () => {
    console.log("WebSocket connected.");
  },
  onDisconnected() {
    console.log("WebSocket disconnected.");
  },
  onError(_ws, event) {
    console.error("WebSocket error: ", event);
  },
  async onMessage(_ws, wsMessage) {
    if (wsMessage.data === "pong") return;

    const message = JSON.parse(wsMessage.data) as ISongResponseWS;
    isDataLoading.value = false;

    switch (message.type) {
      case SongType.ADD:
        if (message.next) {
          if (songQueue.value.some((value) => value.url === message.next?.url)) break;
          songQueue.value.push({
            name: message.next.name ?? "",
            author: message.next.author ?? "",
            length: message.next.length ?? 0,
            reqName:
              (await getChzzkUser(message.reqUid!, config.public.backend_url)).nickname ??
              "",
            url: message.next.url ?? "",
          });
        }
        if (!isFirstPlay.value && autoPlay.value && !current.value) sendNextSignal();
        break;
      case SongType.REMOVE:
        console.log(`remove: ${message.delUrl}`);
        songQueue.value = songQueue.value.filter((value) => value.url !== message.delUrl);
        break;
      case SongType.NEXT:
        current.value = songQueue.value.shift();
        showPlayer.value = false;
        youtubeId.value = getYoutubeVideoId(current.value?.url ?? "") ?? "";
        console.log(`NEXT: ${current.value?.name} - ${current.value?.author}`);
        await nextTick();
        if (youtubeId.value) showPlayer.value = true;
        break;
      case SongType.STREAM_OFF:
        songQueue.value = [];
        break;
    }
    await sendAcknowledgment();
  },
});

const awaitWebSocketConnection = async () => {
  while (webSocketStatus.value !== "OPEN") {
    await wait(500);
  }
};

const sendAcknowledgment = async () => {
  const ackRequest: ISongRequest = {
    type: SongType.ACK,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  };
  await awaitWebSocketConnection();
  send(JSON.stringify(ackRequest));
};

const addMusic = async () => {
  if (!newSongUrl.value) return;
  status.value = Status.LOADING;

  const request: ISongRequest = {
    type: SongType.ADD,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: newSongUrl.value,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  };

  newSongUrl.value = "";
  await awaitWebSocketConnection();
  send(JSON.stringify(request));
  status.value = Status.DONE;
};

const sendNextSignal = () => {
  if (isFirstPlay.value) isFirstPlay.value = false;
  isDataLoading.value = true;
  sendWebSocketRequest({
    type: SongType.NEXT,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  });
};

const sendQueueSizeSignal = () => {
  sendWebSocketRequest({
    type: SongType.OTHER,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: queueSize.value,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  });
};

const sendPersonalSizeSignal = () => {
  sendWebSocketRequest({
    type: SongType.OTHER,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: personalSize.value,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  });
};

const sendStreamerOnlySignal = () => {
  sendWebSocketRequest({
    type: SongType.OTHER,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: streamerOnly.value,
    remove: null,
    isDisabled: null,
  });
};

const sendRemoveSignal = (id: number, url: string) => {
  sendWebSocketRequest({
    type: SongType.REMOVE,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: id,
    isDisabled: null,
  });
};

const sendDisabledSignal = () => {
  sendWebSocketRequest({
    type: SongType.OTHER,
    uid: streamer?.value?.at(0)?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: isDisabled.value,
  });
};

const sendWebSocketRequest = async (request: ISongRequest) => {
  await awaitWebSocketConnection();
  send(JSON.stringify(request));
};

// eslint-disable-next-line
const readyEvent = async (event: YT.PlayerEvent) => event.target.playVideo();
// eslint-disable-next-line
const stateChanged = async (event: YT.OnStateChangeEvent, _target: YT.Player) => {
  switch (event.data) {
    // eslint-disable-next-line
    case YT.PlayerState.ENDED:
      sendNextSignal();
      break;
  }
};

const getSongList = async (uid: string) => {
  try {
    if (uid) {
      const response = (await useRequestFetch()(
        `${config.public.backend_url}/songs/${uid}`,
        {
          method: "GET",
          credentials: "include",
        },
      )) as ISongResponse;
      const { current: cur, next } = response;
      if (next) songQueue.value = next;
      if (cur && !current.value) current.value = cur;
      open();
      status.value = Status.DONE;
    } else {
      status.value = Status.REQUIRE_LOGIN;
    }
  } catch (e) {
    console.error(`Error found! ${e}`);
    status.value = Status.ERROR;
  }
};

onBeforeUnmount(() => close());

watch(
  streamer,
  async () => {
    console.log(streamer?.value?.at(0)?.uid);
    if (currentUserId.value > 0) {
      status.value = Status.DONE;
      return;
    }
    try {
      queueSize.value = streamer?.value?.at(0)?.maxQueueSize ?? 50;
      personalSize.value = streamer?.value?.at(0)?.maxUserSize ?? 5;
      streamerOnly.value = streamer?.value?.at(0)?.isStreamerOnly ?? false;
      useSeoMeta({
        title: `nabot :: Music manager :: ${streamer?.value?.at(0)?.nickname ?? "??"}`,
        robots: false,
      });
      await getSongList(streamer?.value?.at(0)?.uid ?? "");
    } catch (e) {
      console.error(e);
      status.value = Status.ERROR;
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="flex flex-col w-full gap-[40px]">
    <div
      v-if="status == Status.REQUIRE_LOGIN"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <LoginBox :url="`${config.public.frontend_url}/administrator/songlist`" />
    </div>
    <div v-else-if="currentUserId > 0" class="page-overlay">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="prose">
          <p>치수 플레이리스트 기능은 본인만 접속이 가능합니다.</p>
          <NuxtLink
            to="/administrator"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            돌아가기
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="w-full">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="w-full flex-col gap-[20px]">
            <ChzzkProfile :uid="streamer?.at(0)?.uid ?? ''" />
            <div class="box">
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">노래 신청</label>
                </div>
                <div class="w-3/4">
                  <div class="flex">
                    <input
                      v-model="newSongUrl"
                      class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="url"
                      placeholder="https://youtube.com/watch?v="
                    />
                    <button
                      type="button"
                      class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!newSongUrl || webSocketStatus != 'OPEN'"
                      @click="addMusic"
                    >
                      신청하기
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">노래목록 크기</label>
                </div>
                <div class="w-3/4">
                  <div class="flex">
                    <input
                      v-model="queueSize"
                      class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="number"
                      placeholder="노래목록 크기"
                    />
                    <button
                      type="button"
                      class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!queueSize || webSocketStatus != 'OPEN'"
                      @click="sendQueueSizeSignal"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">개인 신청제한</label>
                </div>
                <div class="w-3/4">
                  <div class="flex">
                    <input
                      v-model="personalSize"
                      class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="number"
                      placeholder="개인 신청제한"
                    />
                    <button
                      type="button"
                      class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!personalSize || webSocketStatus != 'OPEN'"
                      @click="sendPersonalSizeSignal"
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">신청제한</label>
                </div>
                <div class="w-3/4">
                  <div class="flex items-center">
                    <input
                      v-model="streamerOnly"
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-blue-600"
                      :disabled="webSocketStatus != 'OPEN'"
                      @click="sendStreamerOnlySignal"
                    />
                    <span class="ml-2">활성화시 매니저 이상 신청가능</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">기능 비활성화</label>
                </div>
                <div class="w-3/4">
                  <div class="flex items-center">
                    <input
                      v-model="isDisabled"
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-blue-600"
                      :disabled="webSocketStatus != 'OPEN'"
                      @click="sendDisabledSignal"
                    />
                    <span class="ml-2">신청곡 기능을 비활성화 합니다.</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">자동재생</label>
                </div>
                <div class="w-3/4">
                  <div class="flex items-center">
                    <input
                      v-model="autoPlay"
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span class="ml-2">매번 리셋되는 값입니다. 확인 필수!</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center mb-4">
                <div class="w-1/4">
                  <label class="block text-gray-700 font-bold">노래 위젯</label>
                </div>
                <div class="w-3/4">
                  <div class="flex">
                    <input
                      :value="`${config.public.frontend_url}/songwidget/${streamer?.at(0)?.uid ?? ''}`"
                      disabled
                      class="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="url"
                    />
                    <button
                      type="button"
                      class="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
                      @click="
                        copyText(
                          `${config.public.frontend_url}/songwidget/${streamer?.at(0)?.uid ?? ''}`,
                        )
                      "
                    >
                      복사하기
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex justify-end space-x-2">
                <div v-if="isFirstPlay">
                  <button
                    type="button"
                    class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="webSocketStatus != 'OPEN'"
                    @click="sendNextSignal"
                  >
                    노래시작
                  </button>
                </div>
                <div v-else>
                  <button
                    type="button"
                    class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="webSocketStatus != 'OPEN'"
                    @click="sendNextSignal"
                  >
                    다음노래
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    @click="getSongList(streamer?.at(0)?.uid ?? '')"
                  >
                    노래목록 강제 갱신
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="box w-full h-full">
            <YouTube
              v-if="showPlayer"
              :key="youtubeId"
              :src="`https://www.youtube.com/watch?v=${youtubeId}`"
              :player-vars="{ autoplay: autoPlay ? 1 : 0 }"
              class="w-full aspect-video"
              @ready="readyEvent"
              @state-change="stateChanged"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50em]"
            >
              노래이름
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10em]"
            >
              업로더
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15em]"
            >
              신청자
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8em]"
            >
              시간
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[6em]"
            >
              삭제하기
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(song, key) in songQueue"
            :key="`song_${key}`"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ key + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ song.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ song.author }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ song.reqName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatSeconds(song.length) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                type="button"
                class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                @click="sendRemoveSignal(key, song.url)"
              >
                !
              </button>
            </td>
          </tr>
          <tr v-if="!songQueue.length">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
              신청된 노래가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* 스타일링 필요 시 추가 */
</style>
