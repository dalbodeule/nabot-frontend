<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import '@/assets/billboard.scss'
import {SongType, Status} from "assets/enums";
import {_PING_TIME, getChzzkUser } from "@/assets/tools";
import type {ISong, ISongResponse} from "~/pages/songs/[uid].vue";

const route = useRoute()
const uid = route.params.uid as string

const config = useRuntimeConfig()

const status: Ref<Status> = ref(Status.LOADING)
const list: Ref<ISong[]> = ref([])
const current: Ref<ISong | undefined> = ref(undefined)

definePageMeta({
  layout: 'transparent'
})

useSeoMeta({
  title: "Nabot :: SongWidget",
  robots: false
})

const getSongList = async() => {
  try {
    list.value = await useRequestFetch()(`${config.public.backend_url}/songs/${uid}`, {
      method: 'GET'
    })
    status.value = Status.DONE
  } catch(e) {
    console.error(`Error found! ${e ?? ""}`)
    status.value = Status.ERROR
  }
}

const { close, open } = useWebSocket(`wss://api-nabot.mori.space/song/${uid}`, {
  autoReconnect: false,
  heartbeat: {
    message: "ping",
    interval: _PING_TIME,
  },
  onConnected: (_ws) => {
    console.log("WebSocket connected.")
  },
  onDisconnected(_ws) {
    console.log("WebSocket disconnected.")
    setTimeout(async() => {
      await getSongList()
      open()
    }, 500);
  },
  onError(_ws, event) {
    console.error("WebSocket error: ", event)
  },
  async onMessage(_ws, msg) {
    if(msg.data == "pong") {
      return
    }
    const message = JSON.parse(msg.data) as ISongResponse

    switch (message.type) {
      case SongType.ADD:
        list.value.push({
          name: message.name ?? "",
          author: message.author ?? "",
          time: message.time ?? 0,
          reqName: (await getChzzkUser(message.reqUid!, config.public.backend_url)).nickname ?? "",
          url: message.url ?? ""
        })
        break
      case SongType.REMOVE:
        list.value = list.value.filter((value) => {
          return (value.url != message.url)
        })
        break
      case SongType.NEXT:
        current.value = list.value.shift()
        break
      case SongType.STREAM_OFF:
        list.value = []
        break
    }
  }

})

onBeforeUnmount(() => close())

;(async() => {
  await getSongList()
  open()
})()
</script>

<template>
  <div>
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader"/>
    </div>
    <div class="billboard">
      <div id="currentSong" class="song">
        <span>지금 노래: {{ current?.url ? `${current?.name} - ${current?.author}` : "노래 정보가 없습니다." }} </span>
      </div>
      <div id="nextSong" class="song">
        <span>다음 노래: {{ list[0]?.url ? `${list[0]?.name} - ${list[0]?.author}` : "노래 정보가 없습니다." }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>