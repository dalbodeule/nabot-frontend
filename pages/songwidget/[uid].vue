<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue";
import {SongType, Status} from "assets/enums";
import {_PING_TIME, getChzzkUser, getLoading} from "@/assets/tools";
import type {ISong, ISongResponse, ISongResponseWS} from "~/pages/songs/[uid].vue";

const route = useRoute();
const uid = route.params.uid as string;

const config = useRuntimeConfig();

const status = getLoading();
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
    autoReconnect: true,
    heartbeat: {
      message: "ping",
      interval: _PING_TIME,
    },
    onConnected: () => {
      console.log("WebSocket connected.");
      status.value = Status.DONE
    },
    onDisconnected() {
      console.log("WebSocket disconnected.");
      status.value = Status.LOADING
    },
    onError(_ws, event) {
      console.error("WebSocket error: ", event);
      status.value = Status.LOADING
    },
    async onMessage(_ws, msg) {
      if (msg.data === "pong") return;

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
onMounted(async () => {
  await getSongList();
  open();
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen font-mono">
    <div
      class="w-[800px] h-[200px] flex flex-col items-center justify-center overflow-hidden bg-black text-white border-[5px] border-white p-[10px] box-border"
    >
      <div class="w-full h-[3em] overflow-hidden text-2xl text-center relative">
        <span
          class="absolute whitespace-nowrap w-full h-full top-[2vh] left-full animate-[marquee_20s_linear_infinite]"
        >
          지금 노래:
          {{
            current?.url
              ? `${current?.name} - ${current?.author}`
              : "노래 정보가 없습니다."
          }}
        </span>
      </div>
      <div class="w-full h-[3em] overflow-hidden text-2xl text-center relative">
        <span
          class="absolute whitespace-nowrap w-full h-full top-[2vh] left-full animate-[marquee_20s_linear_infinite]"
        >
          다음 노래:
          {{
            list?.at(0)?.url
              ? `${list?.at(0)?.name} - ${list?.at(0)?.author}`
              : "노래 정보가 없습니다."
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes marquee {
  from {
    left: 100%;
  }
  to {
    left: -140%;
  }
}
</style>
