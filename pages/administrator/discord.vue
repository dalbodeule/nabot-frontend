<script setup lang="ts">

import type {Ref} from "vue";
import {Status} from "assets/enums";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {getGuildBannerUrl, getGuildIconUrl} from "assets/tools";

definePageMeta({
  layout: 'administrator'
})

export interface IGuild {
  id: string,
  name: string,
  icon: string | null,
  banner: string | null,
}

const guilds: Ref<IGuild[]> = ref([])
const selectGuild: Ref<IGuild | undefined> = ref()

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
    }) as IGuild

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
  selectGuild.value = guilds.value[id]
  isActive.value = false
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
                  <FontAwesomeIcon :icon="['fab', 'discord']" /> Discord로 로그인
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
          <button class="button" @click="isActive = !isActive">
            <span>서버를 선택해주세요.</span>
            <span class="icon is-small">
              <FontAwesomeIcon :icon="['fas', 'angle-dropdown']" />
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
                <span>{{ value.name }}</span>
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

      <div v-if="selectGuild" class="box content">
        <h2>
          <img v-if="selectGuild.icon" :src="getGuildIconUrl(selectGuild.id, selectGuild.icon)" alt="Guild icon" style="height: 32px; width: 32px;">
          {{ selectGuild.name }} 서버가 선택되었습니다.
        </h2>
        <figure v-if="selectGuild.banner" class="image is-4by3">
          <img :src="getGuildBannerUrl(selectGuild.id, selectGuild.banner)" alt="Guild Banner" class="banner-image" >
        </figure>
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