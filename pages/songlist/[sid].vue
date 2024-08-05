<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import {SongType, Status} from "assets/enums";
import {formatSeconds, getChzzkUser, getSessionUser, getYoutubeVideoId, type IChzzkStreamer} from "@/assets/tools";
import type {ISong, ISongResponse} from "~/pages/songs/[uid].vue";

export interface ISongRequest {
  type: SongType,
  uid: string,
  url: string | null,
  maxQueue: number | null,
  maxUserLimit: number | null,
  isStreamerOnly: boolean | null,
  remove: number | null
}

const route = useRoute()
const sid = route.params.sid as string
const uid: Ref<string> = ref("")

const status: Ref<Status> = ref(Status.LOADING)
const streamer: Ref<IChzzkStreamer | undefined> = ref(undefined)
const list: Ref<ISong[]> = ref([])

const autoPlay: Ref<boolean> = ref(true)
const current: Ref<ISong | undefined> = ref()

const youtubeId: Ref<string> = ref("")
const showPlayer: Ref<boolean> = ref(false)

watchEffect( async () => {
  showPlayer.value = false
  youtubeId.value = getYoutubeVideoId(current.value?.url ?? "") ?? ""
  console.log(current.value)
  await nextTick()
  if(youtubeId.value)
    showPlayer.value = true
})

const music: Ref<string> = ref("")

const getProfile = (value: IChzzkStreamer | undefined) => {
  streamer.value = value

  useSeoMeta({
    title: `nabot :: Music manager :: ${streamer.value?.nickname ?? "??"}`,
    robots: false,
  })
}

const { send, status: WSStatus, close } = useWebSocket(`wss://api-nabot.mori.space/songlist/${sid}`, {
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
          reqName: (await getChzzkUser(message.reqUid!)).nickname ?? "",
          url: message.url ?? ""
        })
        break
      case SongType.REMOVE:
        list.value = list.value.filter((value) => {
          return (value.name == message.name && value.author == message.author && value.time == message.time)
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

const addMusic = async() => {
  if(!music.value) return
  status.value = Status.LOADING

  const r: ISongRequest = {
    type: SongType.ADD,
    uid: uid.value,
    url: music.value,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null
  }

  music.value = ""

  if(WSStatus.value == "OPEN")
    send(JSON.stringify(r))

  status.value = Status.DONE
}

const sendNextSignal = async() => {
  const r: ISongRequest = {
    type: SongType.NEXT,
    uid: uid.value,
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null
  }
  if (WSStatus.value == "OPEN") send(JSON.stringify(r))
}

const readyEvent = async(event: YT.PlayerEvent) => event.target.playVideo()
const stateChanged = async(event: YT.OnStateChangeEvent, _target: YT.Player) => {
  switch(event.data) {
    case YT.PlayerState.ENDED:
      await sendNextSignal()
      break
  }
}

onBeforeUnmount(() => close())

;(async() => {
  try {
    uid.value = (await getSessionUser(sid)).uid
    list.value = await (await fetch(`https://api-nabot.mori.space/songs/${uid.value}`, {
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
      <div class="loader"/>
    </div>
    <div class="box">
      <div class="fixed-grid">
        <div class="grid">
          <div class="cell">
            <ChzzkProfileWithSID :sid="sid" @profile="getProfile"/>
          </div>
          <div class="cell">
            <ScriptYouTubePlayer
                v-if="showPlayer"
                :key="youtubeId"
                trigger="immediate"
                :video-id="youtubeId"
                :player-vars="{autoplay: autoPlay ? 1 : 0}"
                @ready="readyEvent"
                @state-change="stateChanged"
            />
          </div>
        </div>
      </div>
      <input v-model="music" type="url" name="">
      <button type="button" class="button is-primary" :disabled="!music" @click="addMusic">추가</button>
      <button type="button" class="button is-primary" @click="sendNextSignal">다음곡</button>
    </div>
    <div class="box">
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