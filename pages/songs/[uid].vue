<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import {SongType, Status} from "assets/enums";
import {_PING_TIME, formatSeconds, getChzzkUser, type IChzzkStreamer} from "@/assets/tools";

export interface ISong {
  name: string,
  author: string,
  length: number,
  reqName: string | null,
  url: string
}

export interface ISongResponse {
  current: ISong | null,
  next: ISong[] | null,
}

export interface ISongResponseWS {
  type: SongType,
  uid: string,
  reqUid: string | null
  current: ISong | null,
  next: ISong | null,
  delUrl: string | null,
}

definePageMeta({
  layout: 'transparent'
})

const route = useRoute()
const uid = route.params.uid as string
const config = useRuntimeConfig()

const status: Ref<Status> = ref(Status.LOADING)
const streamer: Ref<IChzzkStreamer | undefined> = ref(undefined)
const list: Ref<ISong[]> = ref([])
const current: Ref<ISong | undefined> = ref()

const getProfile = (value: IChzzkStreamer | undefined) => {
  streamer.value = value

  useSeoMeta({
    title: `nabot :: Playlist :: ${streamer.value?.nickname ?? "??"}`,
    robots: false,
  })
}

const getSongList = async() => {
  try {
    const { current: cur, next } = await useRequestFetch()(`${config.public.backend_url}/songs/${uid}`, {
      method: 'GET'
    }) as ISongResponse
    current.value = cur
    list.value = next
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
    const message = JSON.parse(msg.data) as ISongResponseWS

    switch (message.type) {
      case SongType.ADD:
        if(message.next)
          if(!list.value.filter((value) => {
            return (value.url != message.delUrl)
          }))
          list.value.push({
            name: message.next.name ?? "",
            author: message.next?.author ?? "",
            time: message.next?.length ?? 0,
            reqName: (await getChzzkUser(message.reqUid!, config.public.backend_url)).nickname ?? "",
            url: message.next.url ?? ""
          })
        if(message.current) {
          current.value = message.current
        }
        break
      case SongType.REMOVE:
        await nextTick()
        list.value = list.value.filter((value) => {
          return (value.url != message.delUrl)
        })
        break
      case SongType.NEXT:
        current.value = list.value.shift()
        if(list.value[0].url == current.value.url)
          list.value = []
        break
      case SongType.STREAM_OFF:
        list.value = []
        break
    }
  }
})

;(async() => {
  await getSongList()
  open()
})()

onBeforeUnmount(() => close())


</script>

<template>
  <div style="width: 100%; height: 100%;">
    <SiteHeader />
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader"/>
    </div>
    <div class="box">
      <ChzzkProfile :uid="uid" @profile="getProfile" />
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <td>ID</td>
            <td style="width: 50em;">노래이름</td>
            <td style="width: 10em;">업로더</td>
            <td style="width: 20em;">신청자</td>
            <td style="width: 8em;">시간</td>
          </tr>
        </thead>
        <tbody v-if="list.length > 0">
          <tr v-for="(song, key) in list" :key="`song_${key}`">
            <td>{{ key + 1 }}</td>
            <td>{{ song.name }}</td>
            <td>{{ song.author }}</td>
            <td>{{ song.reqName }}</td>
            <td>{{ formatSeconds(song.time) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" style="text-align: center;">신청된 노래가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>

</style>