<script setup lang="ts">
import { onBeforeUnmount, type Ref } from "vue";
import { SongType, Status } from "assets/enums";
import {
  _PING_TIME,
  formatSeconds,
  getChzzkUser,
  getLoading,
  type IChzzkStreamer,
} from "@/assets/tools";

export interface ISong {
  name: string;
  author: string;
  length: number;
  reqName: string | null;
  url: string;
}

export interface ISongResponse {
  current: ISong | null;
  next: ISong[] | null;
}

export interface ISongResponseWS {
  type: SongType;
  uid: string;
  reqUid: string | null;
  current: ISong | null;
  next: ISong | null;
  delUrl: string | null;
}

const route = useRoute();
const uid = route.params.uid as string;
const config = useRuntimeConfig();

const status = getLoading();
const streamer: Ref<IChzzkStreamer | undefined> = ref(undefined);
const list: Ref<ISong[]> = ref([]);
const current: Ref<ISong | undefined> = ref();

const getProfile = (value: IChzzkStreamer | undefined) => {
  streamer.value = value;

  useSeoMeta({
    title: `Chibot :: Playlist :: ${streamer.value?.nickname ?? "??"}`,
    robots: false,
  });
};

const getSongList = async () => {
  try {
    const { current: cur, next } = (await useRequestFetch()(
      `${config.public.backend_url}/songs/${uid}`,
      {
        method: "GET",
      },
    )) as ISongResponse;
    current.value = cur ?? undefined;
    list.value = next ?? [];
    status.value = Status.DONE;
  } catch (e) {
    console.error(`Error found! ${e ?? ""}`);
    status.value = Status.ERROR;
  }
};

const { close, open } = useWebSocket(
  `wss://${config.public.backend_url.replace("https://", "")}/song/${uid}`,
  {
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
    async onMessage(_ws, msg) {
      if (msg.data == "pong") {
        return;
      }
      const message = JSON.parse(msg.data) as ISongResponseWS;

      switch (message.type) {
        case SongType.ADD:
          if (message.next)
            if (
              !list.value.filter((value) => {
                return value.url != message.delUrl;
              })
            )
              list.value.push({
                name: message.next.name ?? "",
                author: message.next?.author ?? "",
                length: message.next?.length ?? 0,
                reqName:
                  (await getChzzkUser(message.reqUid!, config.public.backend_url))
                    .nickname ?? "",
                url: message.next.url ?? "",
              });
          if (message.current) {
            current.value = message.current;
          }
          break;
        case SongType.REMOVE:
          await nextTick();
          list.value = list.value.filter((value) => {
            return value.url != message.delUrl;
          });
          break;
        case SongType.NEXT:
          current.value = list.value.shift();
          if (list.value[0].url == current.value?.url) list.value = [];
          break;
        case SongType.STREAM_OFF:
          list.value = [];
          break;
      }
    },
  },
);

onBeforeUnmount(() => close());
onMounted(async () => {
  await getSongList();
  open();
});
</script>

<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <ChzzkProfile :uid="uid" @profile="getProfile" />
    <table class="w-full border-collapse">
      <thead>
        <tr class="border-b">
          <td class="p-2">ID</td>
          <td class="p-2 w-[50%]">노래이름</td>
          <td class="p-2 w-[15%]">업로더</td>
          <td class="p-2 w-[25%]">신청자</td>
          <td class="p-2 w-[10%]">시간</td>
        </tr>
      </thead>
      <tbody v-if="list.length > 0">
        <tr
          v-for="(song, key) in list"
          :key="`song_${key}`"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2">{{ key + 1 }}</td>
          <td class="p-2">{{ song.name }}</td>
          <td class="p-2">{{ song.author }}</td>
          <td class="p-2">{{ song.reqName }}</td>
          <td class="p-2">{{ formatSeconds(song.length) }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center p-4">신청된 노래가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped></style>
