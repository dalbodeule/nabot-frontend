<script setup lang="ts">
import { onBeforeUnmount, type Ref } from "vue";
import "@/assets/loading.scss";
import "@/assets/billboard.scss";
import { SongType, Status } from "assets/enums";
import { _PING_TIME, getChzzkUser } from "@/assets/tools";
import type { ISong, ISongResponse, ISongResponseWS } from "~/pages/songs/[uid].vue";

const route = useRoute();
const uid = route.params.uid as string;

const config = useRuntimeConfig();

const status: Ref<Status> = ref(Status.LOADING);
const list: Ref<ISong[]> = ref([]);
const current: Ref<ISong | undefined> = ref(undefined);

definePageMeta({
  layout: "transparent",
});

useSeoMeta({
  title: "Chibot :: SongWidget",
  robots: false,
});

const getSongList = async () => {
  try {
    const { current: cur, next } = (await useRequestFetch()(
      `${config.public.backend_url}/songs/${uid}`,
      {
        method: "GET",
      },
    )) as ISongResponse;
    if (next) list.value = next;
    if (cur) current.value = cur;
    status.value = Status.DONE;
  } catch (e) {
    console.error(`Error found! ${e ?? ""}`);
    status.value = Status.ERROR;
  }
};

const { close, open } = useWebSocket(
  `wss://${config.public.backend_url.replace("https://", "")}/song/${uid}`,
  {
    autoReconnect: false,
    heartbeat: {
      message: "ping",
      interval: _PING_TIME,
    },
    onConnected: () => {
      console.log("WebSocket connected.");
    },
    onDisconnected() {
      console.log("WebSocket disconnected.");
      setTimeout(async () => {
        await getSongList();
        open();
      }, 500);
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
          if (list.value[0]?.url == current.value?.url) list.value = [];
          break;
        case SongType.STREAM_OFF:
          list.value = [];
          break;
      }
    },
  },
);

onBeforeUnmount(() => close());
(async () => {
  await getSongList();
  open();
})();
</script>

<template>
  <div>
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader" />
    </div>
    <div class="billboard">
      <div id="currentSong" class="song">
        <span
          >지금 노래:
          {{
            current?.url
              ? `${current?.name} - ${current?.author}`
              : "노래 정보가 없습니다."
          }}
        </span>
      </div>
      <div id="nextSong" class="song">
        <span
          >다음 노래:
          {{
            list?.at(0)?.url
              ? `${list?.at(0)?.name} - ${list?.at(0)?.author}`
              : "노래 정보가 없습니다."
          }}</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped></style>
