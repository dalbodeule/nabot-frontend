<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import {SongType, Status} from "assets/enums";
import {formatSeconds, getChzzkUser, getSessionUser, getYoutubeVideoId, type IChzzkStreamer} from "@/assets/tools";
import type {ISong, ISongResponse} from "~/pages/songs/[uid].vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSID.vue";

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
const streamer: Ref<IChzzkSession | undefined> = ref(undefined)
const list: Ref<ISong[]> = ref([])

const autoPlay: Ref<boolean> = ref(true)
const current: Ref<ISong | undefined> = ref()

const youtubeId: Ref<string> = ref("")
const showPlayer: Ref<boolean> = ref(false)
const queueSize = ref(50)
const personalSize = ref(5)
const streamerOnly = ref(false)

watchEffect( async () => {
  showPlayer.value = false
  youtubeId.value = getYoutubeVideoId(current.value?.url ?? "") ?? ""
  console.log(current.value)
  await nextTick()
  if(youtubeId.value)
    showPlayer.value = true
})

const music: Ref<string> = ref("")

const getProfile = (value: IChzzkSession | undefined) => {
  streamer.value = value

  queueSize.value = value?.maxQueueSize ?? 50
  personalSize.value = value?.maxUserSize ?? 5
  streamerOnly.value = value?.isStreamerOnly ?? false

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
          return (value.url == message.url)
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

const sendNextSignal = () => {
  sendSignal({
    type: SongType.NEXT,
    uid: uid.value,
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null
  })
}

const sendQueueSizeSignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: uid.value,
    url: null,
    maxQueue: queueSize.value,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null
  })
}

const sendPersonalSizeSignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: uid.value,
    url: null,
    maxQueue: null,
    maxUserLimit: personalSize.value,
    isStreamerOnly: null,
    remove: null
  })
}

const sendStreamerOnlySignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: uid.value,
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: streamerOnly.value,
    remove: null
  })
}

const sendRemoveSignal = (id: number, url: string) => {
  sendSignal({
    type: SongType.REMOVE,
    uid: uid.value,
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: id
  })
}

const sendSignal = (r: ISongRequest) => {
  if (WSStatus.value == "OPEN") send(JSON.stringify(r))
}

const readyEvent = async(event: YT.PlayerEvent) => event.target.playVideo()
const stateChanged = async(event: YT.OnStateChangeEvent, _target: YT.Player) => {
  switch(event.data) {
    case YT.PlayerState.ENDED:
      sendNextSignal()
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
    <div>
      <div class="fixed-grid">
        <div class="grid">
          <div class="cell">
            <ChzzkProfileWithSID :sid="sid" @profile="getProfile"/>
            <div class="box">
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">노래 신청</label>
                </div>
                <div class="field-body">
                  <div class="field has-addons">
                    <div class="control">
                      <input v-model="music" class="input" type="url" placeholder="https://youtube.com/watch?v=">
                    </div>
                    <div class="control">
                      <button type="button" class="button" :disabled="!music" @click="addMusic">신청하기</button>
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
                      <input v-model="queueSize" class="input" type="number" placeholder="노래목록 크기">
                    </div>
                    <div class="control">
                      <button type="button" class="button" :disabled="!queueSize" @click="sendQueueSizeSignal">저장</button>
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
                      <input v-model="personalSize" class="input" type="number" placeholder="개인 신청제한">
                    </div>
                    <div class="control">
                      <button type="button" class="button" :disabled="!personalSize" @click="sendPersonalSizeSignal">저장</button>
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
                      <input v-model="streamerOnly" type="checkbox" @click="sendStreamerOnlySignal">
                      활성화시 매니저 이상 신청가능
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
                      <input v-model="autoPlay" type="checkbox">
                      매번 리셋되는 값입니다. 확인 필수!
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-grouped is-grouped-right">
                <div class="control">
                  <button class="button is-success" type="button" @click="sendNextSignal">다음노래</button>
                </div>
                <div class="control">
                  <button class="button" disabled>???</button>
                </div>
              </div>
            </div>
          </div>
          <div class="cell">
            <div class="box">
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
      </div>

    </div>
    <div class="box">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <td>ID</td>
            <td style="width: 50em;">노래이름</td>
            <td style="width: 10em;">업로더</td>
            <td style="width: 15em;">신청자</td>
            <td style="width: 8em;">시간</td>
            <td style="width: 6em;">삭제하기</td>
          </tr>
        </thead>
        <tbody v-if="list.length > 0">
          <tr v-for="(song, key) in list" :key="`song_${key}`">
            <td>{{ key + 1 }}</td>
            <td>{{ song.name }}</td>
            <td>{{ song.author }}</td>
            <td>{{ song.reqName }}</td>
            <td>{{ formatSeconds(song.time) }}</td>
            <td>
              <button type="button" class="button is-danger is-small" @click="sendRemoveSignal(key, song.url)">!</button>
            </td>
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