<script setup lang="ts">
import {onBeforeUnmount, type Ref} from "vue"
import '@/assets/loading.scss'
import {SongType, Status} from "assets/enums";
import {_PING_TIME, formatSeconds, getChzzkUser, getYoutubeVideoId} from "@/assets/tools";
import type {ISong, ISongResponse} from "~/pages/songs/[uid].vue";
import ChzzkProfileWithSession, {type IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";

export interface ISongRequest {
  type: SongType,
  uid: string,
  url: string | null,
  maxQueue: number | null,
  maxUserLimit: number | null,
  isStreamerOnly: boolean | null,
  remove: number | null,
  isDisabled: boolean | null,
}

const config = useRuntimeConfig()

const status: Ref<Status> = ref(Status.LOADING)
const streamer: Ref<IChzzkSession | undefined> | undefined = inject("USER")
const list: Ref<ISong[]> = ref([])

const { copy: copyText } = useClipboard()

const autoPlay: Ref<boolean> = ref(true)
const current: Ref<ISong | undefined> = ref()

const youtubeId: Ref<string> = ref("")
const showPlayer: Ref<boolean> = ref(false)
const queueSize = ref(50)
const personalSize = ref(5)
const streamerOnly = ref(false)
const isDisabled = ref(false)
const isFirst = ref(true)

definePageMeta({
  layout: 'administrator'
})

const music: Ref<string> = ref("")

const { send, status: WSStatus, close, open } = useWebSocket(`wss://api-nabot.mori.space/songlist`, {
  autoReconnect: true,
  immediate: false,
  heartbeat: {
    message: "ping",
    interval: _PING_TIME,
  },
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
        if(!isFirst.value && autoPlay.value && !current.value) sendNextSignal()
        break
      case SongType.REMOVE:
        list.value = list.value.filter((value) => {
          return (value.url != message.url)
        })
        break
      case SongType.NEXT:
        current.value = list.value.shift()

        showPlayer.value = false
        youtubeId.value = getYoutubeVideoId(current.value?.url ?? "") ?? ""
        console.log(`NEXT: ${current.value?.name} - ${current.value?.author}`)
        await nextTick()
        if (youtubeId.value)
          showPlayer.value = true

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
    uid: streamer?.value?.uid ?? "",
    url: music.value,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  }

  music.value = ""

  if(WSStatus.value == "OPEN")
    send(JSON.stringify(r))

  status.value = Status.DONE
}

const sendNextSignal = () => {
  if(isFirst.value) isFirst.value = false

  sendSignal({
    type: SongType.NEXT,
    uid: streamer?.value?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  })
}

const sendQueueSizeSignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: streamer?.value?.uid ?? "",
    url: null,
    maxQueue: queueSize.value,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  })
}

const sendPersonalSizeSignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: streamer?.value?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: personalSize.value,
    isStreamerOnly: null,
    remove: null,
    isDisabled: null,
  })
}

const sendStreamerOnlySignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: streamer?.value?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: streamerOnly.value,
    remove: null,
    isDisabled: null,
  })
}

const sendRemoveSignal = (id: number, url: string) => {
  sendSignal({
    type: SongType.REMOVE,
    uid: streamer?.value?.uid ?? "",
    url,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: id,
    isDisabled: null,
  })
}

const sendDisabledSignal = () => {
  sendSignal({
    type: SongType.OTHER,
    uid: streamer?.value?.uid ?? "",
    url: null,
    maxQueue: null,
    maxUserLimit: null,
    isStreamerOnly: null,
    remove: null,
    isDisabled: isDisabled.value,
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

const getSongList = async() => {
  try {
    if (streamer?.value?.uid != undefined) {
        list.value = await useRequestFetch()(`https://api-nabot.mori.space/songs/${streamer.value.uid}`, {
          method: 'GET',
          credentials: 'include'
        })
        open()
        status.value = Status.DONE
      } else {
        status.value = Status.REQUIRE_LOGIN
      }
  } catch(e) {
    console.error(`Error found! ${e ?? ""}`)
    status.value = Status.ERROR
  }
}

onBeforeUnmount(() => close())

watchEffect(async () => {
  console.log(streamer?.value?.uid)
  try {
    queueSize.value = streamer?.value?.maxQueueSize ?? 50
    personalSize.value = streamer?.value?.maxUserSize ?? 5
    streamerOnly.value = streamer?.value?.isStreamerOnly ?? false

    useSeoMeta({
      title: `nabot :: Music manager :: ${streamer?.value?.nickname ?? "??"}`,
      robots: false,
    })
    await getSongList()
  } catch(e) {
    console.error(e)
    status.value = Status.ERROR
  }
})
</script>

<template>
  <div>
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loader"/>
    </div>
    <div v-else-if="status == Status.REQUIRE_LOGIN" class="page-overlay">
      <LoginBox url="https://nabot.mori.space/administrator/songlist" />
    </div>
    <div>
      <div class="fixed-grid">
        <div class="grid">
          <div class="cell">
            <ChzzkProfileWithSession/>
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
                  <label class="label">기능 비활성화</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <div class="control">
                      <input v-model="isDisabled" type="checkbox" @click="sendDisabledSignal">
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
                      <input v-model="autoPlay" type="checkbox">
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
                        :value="`https://nabot.mori.space/songwidget/${streamer?.uid ?? ''}`"
                        disabled
                        class="input"
                        type="url"
                      >
                    </div>
                    <div class="control">
                      <button
                        type="button"
                        class="button is-info"
                        @click="copyText(`https://nabot.mori.space/songwidget/${streamer?.uid ?? ''}`)"
                      >복사하기</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-grouped is-grouped-right">
                <div v-if="isFirst" class="control">
                  <button class="button is-success" type="button" @click="sendNextSignal">노래시작</button>
                </div>
                <div v-else class="control">
                  <button class="button is-success" type="button" @click="sendNextSignal">다음노래</button>
                </div>
                <div class="control">
                  <button class="button is-warning" type="button" @click="getSongList">노래목록 강제 갱신</button>
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