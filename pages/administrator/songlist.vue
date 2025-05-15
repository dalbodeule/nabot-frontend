<script setup lang="ts">
import { onBeforeUnmount, type Ref, watch, nextTick } from "vue";
import "@/assets/loading.scss";
import { SongType, Status } from "assets/enums";
import {
  _PING_TIME,
  formatSeconds,
  getChzzkUser,
  getYoutubeVideoId,
  wait,
} from "@/assets/tools";
import type { ISong, ISongResponse, ISongResponseWS } from "~/pages/songs/[uid].vue";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";
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
const status: Ref<Status> = ref(Status.LOADING);
const streamer: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined));
const currentUserId: Ref<number> = inject("CURRENT_USER", ref(0));
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
  <div>
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader" />
    </div>
    <div v-else-if="status == Status.REQUIRE_LOGIN" class="page-overlay">
      <LoginBox :url="`${config.public.frontend_url}/administrator/songlist`" />
    </div>
    <div v-else-if="currentUserId > 0" class="page-overlay">
      <div class="box">
        <div class="content">
          <p>치수 플레이리스트 기능은 본인만 접속이 가능합니다.</p>
          <NuxtLink to="/administrator" class="button is-primary">돌아가기</NuxtLink>
        </div>
      </div>
    </div>
    <div>
      <div class="fixed-grid">
        <div class="grid">
          <div class="cell">
            <ChzzkProfile :uid="streamer?.at(0)?.uid ?? ''" />
            <div class="box">
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">노래 신청</label>
                </div>
                <div class="field-body">
                  <div class="field has-addons">
                    <div class="control">
                      <input
                        v-model="newSongUrl"
                        class="input"
                        type="url"
                        placeholder="https://youtube.com/watch?v="
                      />
                    </div>
                    <div class="control">
                      <button
                        type="button"
                        class="button"
                        :disabled="!newSongUrl || webSocketStatus != 'OPEN'"
                        @click="addMusic"
                      >
                        신청하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">노래목록 크기</label>
                </div>
                <div class="field-body">
                  <div class="field has-addons">
                    <div class="control">
                      <input
                        v-model="queueSize"
                        class="input"
                        type="number"
                        placeholder="노래목록 크기"
                      />
                    </div>
                    <div class="control">
                      <button
                        type="button"
                        class="button"
                        :disabled="!queueSize || webSocketStatus != 'OPEN'"
                        @click="sendQueueSizeSignal"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">개인 신청제한</label>
                </div>
                <div class="field-body">
                  <div class="field has-addons">
                    <div class="control">
                      <input
                        v-model="personalSize"
                        class="input"
                        type="number"
                        placeholder="개인 신청제한"
                      />
                    </div>
                    <div class="control">
                      <button
                        type="button"
                        class="button"
                        :disabled="!personalSize || webSocketStatus != 'OPEN'"
                        @click="sendPersonalSizeSignal"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">신청제한</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <input
                        v-model="streamerOnly"
                        type="checkbox"
                        :disabled="webSocketStatus != 'OPEN'"
                        @click="sendStreamerOnlySignal"
                      />
                      활성화시 매니저 이상 신청가능
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">기능 비활성화</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <input
                        v-model="isDisabled"
                        type="checkbox"
                        :disabled="webSocketStatus != 'OPEN'"
                        @click="sendDisabledSignal"
                      />
                      신청곡 기능을 비활성화 합니다.
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">자동재생</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <input v-model="autoPlay" type="checkbox" />
                      매번 리셋되는 값입니다. 확인 필수!
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">노래 위젯</label>
                </div>
                <div class="field-body">
                  <div class="field has-addons">
                    <div class="control">
                      <input
                        :value="`${config.public.frontend_url}/songwidget/${streamer?.at(0)?.uid ?? ''}`"
                        disabled
                        class="input"
                        type="url"
                      />
                    </div>
                    <div class="control">
                      <button
                        type="button"
                        class="button is-info"
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
              </div>
              <div class="field is-grouped is-grouped-right">
                <div v-if="isFirstPlay" class="control">
                  <button
                    class="button is-success"
                    type="button"
                    :disabled="webSocketStatus != 'OPEN'"
                    @click="sendNextSignal"
                  >
                    노래시작
                  </button>
                </div>
                <div v-else class="control">
                  <button
                    class="button is-success"
                    type="button"
                    :disabled="webSocketStatus != 'OPEN'"
                    @click="sendNextSignal"
                  >
                    다음노래
                  </button>
                </div>
                <div class="control">
                  <button
                    class="button is-warning"
                    type="button"
                    @click="getSongList(streamer?.at(0)?.uid ?? '')"
                  >
                    노래목록 강제 갱신
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="cell">
            <div class="box">
              <YouTube
                v-if="showPlayer"
                :key="youtubeId"
                :src="`https://www.youtube.com/watch?v=${youtubeId}`"
                :player-vars="{ autoplay: autoPlay ? 1 : 0 }"
                @ready="readyEvent"
                @state-change="stateChanged"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <td>ID</td>
            <td style="width: 50em">노래이름</td>
            <td style="width: 10em">업로더</td>
            <td style="width: 15em">신청자</td>
            <td style="width: 8em">시간</td>
            <td style="width: 6em">삭제하기</td>
          </tr>
        </thead>
        <tbody v-if="songQueue.length > 0">
          <tr v-for="(song, key) in songQueue" :key="`song_${key}`">
            <td>{{ key + 1 }}</td>
            <td>{{ song.name }}</td>
            <td>{{ song.author }}</td>
            <td>{{ song.reqName }}</td>
            <td>{{ formatSeconds(song.length) }}</td>
            <td>
              <button
                type="button"
                class="button is-danger is-small"
                @click="sendRemoveSignal(key, song.url)"
              >
                !
              </button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" style="text-align: center">신청된 노래가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* 스타일링 필요 시 추가 */
</style>
