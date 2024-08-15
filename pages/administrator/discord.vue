<script setup lang="ts">

import type {Ref} from "vue";
import {Status} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {getGuildBannerUrl, getGuildIconUrl} from "assets/tools";

definePageMeta({
  layout: 'administrator'
})

export interface IGuildChannel {
  id: string,
  type: number,
  name: string
}

export interface IGuildRole {
  color: number,
  id: string,
  mentionable: boolean,
  name: string
}

export interface IGuild {
  id: string,
  name: string,
  icon: string | null,
  banner: string | null,
  channel: IGuildChannel[],
  roles: IGuildRole[],
}

export interface IGuildSettings {
  guildId: number | null,
  channelId: number | null,
  message: string,
}

const guilds: Ref<IGuild[]> = ref([])
const selectGuild: Ref<IGuildSettings> = ref({
  guildId: 0,
  channelId: 0,
  message: '',
})
const selectGuildIdx = ref(0)

const status: Ref<Status> = ref(Status.LOADING)
const isActive = ref(false)

const config = useRuntimeConfig()
const user: Ref<IChzzkSession | undefined> | undefined = inject("USER")

definePageMeta({
  layout: 'administrator'
})

useSeoMeta({
  title: "Nabot :: administrator :: Discord",
  robots: false
})

const getDiscordStatus = async() => {
  try {
    guilds.value = await useRequestFetch()(`${config.public.backend_url}/discord`, {
      method: 'GET',
      credentials: 'include'
    })

    selectGuild.value = await useRequestFetch()(`${config.public.backend_url}/discord/${user?.value?.uid}`, {
      method: 'GET',
      credentials: 'include'
    }) as IGuildSettings

    if(guilds.value.length == 0) {
      status.value = Status.REQUIRE_DISCORD
    }
    status.value = Status.DONE
  } catch(e) {
    console.error(e.status, e.data)
    if(e.status == 404) {
      status.value = Status.REQUIRE_DISCORD
    } else {
      console.error("Error! ", e)
      status.value = Status.REQUIRE_LOGIN
    }
  }
}

const selectGuildId = async (id: number) => {
  selectGuildIdx.value = id
  if(selectGuild.value) selectGuild.value.guildId = parseInt(guilds.value[id].id) ?? 0
  else selectGuild.value = { guildId: parseInt(guilds.value[id].id), channelId:0, message: "" }
  isActive.value = false
}

const addMention = (mention: { id: string, name: string }) => {
  if(mention.name == "@everyone") selectGuild.value.message += "@everyone"
  else selectGuild.value.message += `<@&${mention.id}>`
}

const submit = async() => {
  status.value = Status.LOADING
  try {
    await useRequestFetch()(`${config.public.backend_url}/discord/${user?.value?.uid}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(selectGuild.value)
    })
    status.value = Status.DONE
  } catch(e) {
    console.error(e.status, e.data)
    status.value = Status.ERROR
  }
}

watchEffect(async () => {
  console.log(user?.value?.uid)

  await getDiscordStatus()
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading"/>
    </div>
    <div v-else-if="status == Status.REQUIRE_DISCORD" class="page-overlay">
      <div class="box">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p>로그인 버튼을 누른 뒤, 원하는 디스코드 서버를 선택해주세요!</p>
                <a
                    :href="`${config.public.backend_url}/auth/login/discord?redirectUrl=https://nabot.mori.space/administrator/discord`"
                    target="_self"
                    class="button"
                    style="color: #ffffff; background-color: #5865F2;"
                >
                  <FontAwesomeIcon :icon="['fab', 'discord']" />&nbsp; Discord로 로그인
                </a>
              </div>
            </div>
          </div>
        </div>
    </div>
    <div class="content">
      <h1>디스코드 설정</h1>
      <div class="dropdown" :class="{ 'is-active': isActive }">
        <div class="dropdown-trigger">
          <button class="button" type="button" @click="isActive = !isActive">
            <span>서버를 선택해주세요.</span>
            <span class="icon is-small">
              <FontAwesomeIcon :icon="['fas', 'caret-down']" />
            </span>
          </button>
        </div>
        <div class="dropdown-menu" role="menu">
          <div class="dropdown-content">
            <a
              v-for="(value, idx) in guilds"
              :key="`discord-${idx}`"
              class="dropdown-item"
              @click="selectGuildId(idx)"
            >
              <div class="dropdown-guild">
                <figure class="image is-32x32">
                  <img :src="value.icon ? getGuildIconUrl(value.id, value.icon) : ``" alt="Guild icon" class="guild-icon" >
                </figure>
                <span>&nbsp;{{ value.name }}</span>
              </div>
              <div v-if="value.banner" class="guild-banner">
                <figure class="image is-4by3">
                  <img :src="getGuildBannerUrl(value.id, value.banner)" alt="Guild Banner" class="banner-image" >
                </figure>
              </div>
            </a>
          </div>
        </div>
      </div>
      <br>
      <div v-if="selectGuild" class="box content">
        <h2>
          <img
            v-if="guilds[selectGuildIdx]?.icon"
            :src="getGuildIconUrl(guilds[selectGuildIdx]?.id, guilds[selectGuildIdx]?.icon ?? '')"
            alt="Guild icon"
            style="height: 32px; width: 32px;"
          >
          {{ guilds[selectGuildIdx]?.name }} 서버가 선택되었습니다.
        </h2>
        <figure v-if="guilds[selectGuildIdx]?.banner" class="image is-4by3">
          <img
            :src="getGuildBannerUrl(guilds[selectGuildIdx]?.id, guilds[selectGuildIdx]?.banner ?? '')"
            alt="Guild Banner"
            class="banner-image"
          >
        </figure>
        <!-- Channel Dropdown -->
        <form @submit.prevent="submit">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">디스코드 채널</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="selectGuild.channelId">
                      <option disabled value="">채널을 선택하세요</option>
                      <option
                        v-for="channel in guilds[selectGuildIdx]?.channel"
                        :key="`channel-${channel.id}`"
                        :value="parseInt(channel.id)"
                      >
                        {{ channel?.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Message Content -->
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">메세지 내용</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <textarea v-model="selectGuild.message" class="textarea"/>
                </div>
              </div>
            </div>
          </div>
          <!-- Role mention buttons -->
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">역할 맨션하기</label>
            </div>
            <div class="field-body">
              <div class="buttons">
                <button
                  v-for="(role, idx) in guilds[selectGuildIdx]?.roles"
                  :key="`role-${idx}`"
                  :style="{ 'background-color': `#${role.color.toString(16)}` }"
                  class="button is-light"
                  type="button"
                  @click="addMention({ id: role.id, name: role.name })"
                  >{{ role.name }}</button>
              </div>
            </div>
          </div>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <button class="button is-link" type="submit">저장</button>
            </div>
          </div>
        </form>
      </div>
      <br>
      <br>

      <p>만약 원하는 서버가 안보이신다면, 디스코드 계정이 서버 주인인지, 봇이 초대되어 있는지 확인해주세요!</p>
      <a
          :href="`${config.public.backend_url}/auth/login/discord?redirectUrl=https://nabot.mori.space/administrator/discord`"
          target="_self"
          class="button"
          style="color: #ffffff; background-color: #5865F2;"
      >
        <FontAwesomeIcon :icon="['fab', 'discord']" /> Discord 봇 초대(및 로그인)
      </a>
    </div>
  </div>
</template>

<style scoped>

.dropdown-guild {
  display: flex;
  align-items: center;
}

.guild-icon {
  border-radius: 50%;
  margin-right: 10px;
}

.guild-banner {
  margin-top: 5px;
}

.banner-image {
  border-radius: 5px;
}

.dropdown-item {
  padding: 10px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>