<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import {Status} from "assets/enums";
import {formatSeconds, getChzzkUser, type IChzzkStreamer} from "@/assets/tools";

export interface ISong {
  name: string,
  author: string,
  time: number,
  reqName: string
}

enum SongType {
  ADD = 0,
  REMOVE = 1,
  NEXT = 2,

  STREAM_OFF = 50
}

export interface ISongResponse {
  type: SongType,
  uid: string,
  reqUid: string | null,
  name: string | null,
  author: string | null
  time: number | null
}

const route = useRoute()
const uid = route.params.uid as string

const status: Ref<Status> = ref(Status.LOADING)
const streamer: Ref<IChzzkStreamer | null> = ref(null)
const list: Ref<ISong[]> = ref([])

const getProfile = (value: IChzzkStreamer | null) => {
  streamer.value = value

  useSeoMeta({
    title: `nabot :: Playlist :: ${streamer.value?.nickname ?? "??"}`,
    robots: false,
  })
}

const { close } = useWebSocket(`wss://api-nabot.mori.space/song/${uid}`, {
  autoReconnect: true,
  onConnected: (_ws) => {
    console.log("WebSocket connected.")
  },
  onDisconnected(_ws) {
    console.log("WebSocket disconnected.")
  },
  onError(_ws, event) {
    console.error("WebSocket error: ", event)
  },
  async onMessage(_ws, msg) {
    const message = JSON.parse(msg.data) as ISongResponse

    switch (message.type) {
      case SongType.ADD:
        list.value.push({
          name: message.name ?? "",
          author: message.author ?? "",
          time: message.time ?? 0,
          reqName: (await getChzzkUser(message.reqUid!)).nickname ?? ""
        })
        break
      case SongType.REMOVE:
        list.value = list.value.filter((value) => {
          return (value.name == message.name && value.author == message.author && value.time == message.time)
        })
        break
      case SongType.NEXT:
        list.value = list.value.slice(0, 1)
        break
      case SongType.STREAM_OFF:
        list.value = []
        break
    }
  }

})

onBeforeUnmount(() => close())

;(async() => {
  try {
    list.value = await (await fetch(`https://api-nabot.mori.space/songs/${uid}`, {
      method: 'GET'
    })).json()
    status.value = Status.DONE
  } catch(e) {
    console.error(`Error found! ${e ?? ""}`)
    status.value = Status.ERROR
  }
})()
</script>

<template>
  <div>
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader"></div>
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
  </div>
</template>

<style scoped>

</style>