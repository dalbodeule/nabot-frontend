<script setup lang="ts">
import type { Ref } from "vue";
import { Status } from "assets/enums";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  getCurrentUser,
  getGuildBannerUrl,
  getGuildIconUrl,
  getLoading,
  getUser,
} from "assets/tools";

export interface IGuildChannel {
  id: string;
  type: number;
  name: string;
}

export interface IGuildRole {
  color: number;
  id: string;
  mentionable: boolean;
  name: string;
}

export interface IGuild {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  channel: IGuildChannel[];
  roles: IGuildRole[];
}

export interface IGuildSettings {
  guildId: string | null;
  channelId: string | null;
  message: string | null;
}

const guilds: Ref<IGuild[]> = ref([]);
const selectGuild: Ref<IGuildSettings> = ref({
  guildId: null,
  channelId: null,
  message: null,
});
const selectGuildIdx = ref(0);

const status = getLoading();
const isActive = ref(false);

const config = useRuntimeConfig();
const user = getUser();
const currentUser = getCurrentUser();

definePageMeta({
  layout: "administrator",
});

useSeoMeta({
  title: "Chibot :: administrator :: Discord",
  robots: false,
});

const getDiscordStatus = async () => {
  try {
    guilds.value = await useRequestFetch()(
      `${config.public.backend_url}/discord/guilds`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    selectGuild.value = (await useRequestFetch()(
      `${config.public.backend_url}/discord/${user?.value?.[currentUser.value].uid}`,
      {
        method: "GET",
        credentials: "include",
      },
    )) as IGuildSettings;

    if (guilds.value.length == 0) {
      status.value = Status.REQUIRE_DISCORD;
    }
    status.value = Status.DONE;
  } catch (e) {
    console.error(e.status, e.data);
    if (e.status == 404) {
      status.value = Status.REQUIRE_DISCORD;
    } else {
      console.error("Error! ", e);
      status.value = Status.REQUIRE_LOGIN;
    }
  }
};

const selectGuildId = async (id: number) => {
  selectGuildIdx.value = id;
  if (selectGuild.value) selectGuild.value.guildId = guilds.value[id].id;
  else selectGuild.value = { guildId: guilds.value[id].id, channelId: "", message: "" };
  isActive.value = false;
};

const addMention = (mention: { id: string; name: string }) => {
  const mentionCode = mention.name === "@everyone" ? "@everyone" : `<@&${mention.id}>`;
  selectGuild.value.message =
    (selectGuild.value.message || "") + `${mentionCode}`;
};

const getContrastColor = (hexColor: number) => {
  const rgb = hexColor.toString(16).padStart(6, "0");
  const r = parseInt(rgb.slice(0, 2), 16);
  const g = parseInt(rgb.slice(2, 4), 16);
  const b = parseInt(rgb.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#ffffff";
};

const submit = async () => {
  status.value = Status.LOADING;
  try {
    await useRequestFetch()(
      `${config.public.backend_url}/discord/${user?.value?.[currentUser.value].uid}`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(selectGuild.value),
      },
    );
    status.value = Status.DONE;
  } catch (e) {
    console.error(e.status, e.data);
    status.value = Status.ERROR;
  }
};

watchEffect(async () => {
  console.log(user?.value?.[currentUser.value].uid);

  await getDiscordStatus();
});
</script>

<template>
  <div style="width: 100%; height: 100%">
    <div v-if="status == Status.REQUIRE_DISCORD" class="page-overlay">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="p-4">
          <div class="flex">
            <div class="flex-grow">
              <p>로그인 버튼을 누른 뒤, 원하는 디스코드 서버를 선택해주세요!</p>
              <a
                :href="`${config.public.backend_url}/auth/login/discord?redirectUrl=${config.public.frontend_url}/administrator/discord`"
                target="_self"
                class="inline-flex items-center px-4 py-2 bg-[#5865f2] text-white rounded-md hover:bg-[#4752c4] transition-colors"
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
      <div class="relative inline-block text-left" :class="{ 'z-50': isActive }">
        <div>
          <button
            class="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50"
            type="button"
            @click="isActive = !isActive"
          >
            <span>서버를 선택해주세요.</span>
            <span class="icon is-small">
              <FontAwesomeIcon :icon="['fas', 'caret-down']" />
            </span>
          </button>
        </div>
        <div
          v-show="isActive"
          class="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out transform origin-top-right"
          role="menu"
          @click.outside="isActive = false"
        >
          <div class="py-1 divide-y divide-gray-100">
            <a
              v-for="(value, idx) in guilds"
              :key="`discord-${idx}`"
              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              @click="selectGuildId(idx)"
            >
              <div class="flex items-center space-x-2">
                <figure class="image is-32x32">
                  <img
                    :src="value.icon ? getGuildIconUrl(value.id, value.icon) : ``"
                    alt="Guild icon"
                    class="guild-icon"
                  />
                </figure>
                <span>&nbsp;{{ value.name }}</span>
              </div>
              <div v-if="value.banner" class="guild-banner">
                <figure class="image is-4by3">
                  <img
                    :src="getGuildBannerUrl(value.id, value.banner)"
                    alt="Guild Banner"
                    class="banner-image"
                  />
                </figure>
              </div>
            </a>
          </div>
        </div>
      </div>
      <br />
      <div v-if="selectGuild" class="box content">
        <div class="flex flex-row gap-[10px] align-middle">
          <img
            v-if="guilds[selectGuildIdx]?.icon"
            :src="
              getGuildIconUrl(
                guilds[selectGuildIdx]?.id,
                guilds[selectGuildIdx]?.icon ?? '',
              )
            "
            alt="Guild icon"
            class="w-[32px] h-[32px]"
          />
          <h2>{{ guilds[selectGuildIdx]?.name }} 서버가 선택되었습니다.</h2>
        </div>
        <figure v-if="guilds[selectGuildIdx]?.banner" class="image is-4by3">
          <img
            :src="
              getGuildBannerUrl(
                guilds[selectGuildIdx]?.id,
                guilds[selectGuildIdx]?.banner ?? '',
              )
            "
            alt="Guild Banner"
            class="banner-image"
          />
        </figure>
        <!-- Channel Dropdown -->
        <form @submit.prevent="submit">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-1/4">
              <label class="block text-sm font-medium text-gray-700 my-2"
                >디스코드 채널</label
              >
            </div>
            <div class="w-3/4">
              <div class="field">
                <div class="control">
                  <div class="w-full">
                    <select
                      v-model="selectGuild.channelId"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option disabled value="">채널을 선택하세요</option>
                      <option
                        v-for="channel in guilds[selectGuildIdx]?.channel"
                        :key="`channel-${channel.id}`"
                        :value="channel.id"
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
          <div class="flex items-center gap-4 mb-4">
            <div class="w-1/4">
              <label class="block text-sm font-medium text-gray-700 my-2"
                >메세지 내용</label
              >
            </div>
            <div class="w-3/4">
              <div class="relative">
                <div class="w-full">
                  <textarea
                    v-model="selectGuild.message"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] p-2"
                  ></textarea>
                  <div class="mt-2 text-sm text-gray-500">
                    <span
                      v-for="match in selectGuild.message?.match(
                        /(@everyone|<@&\d+>)/g,
                      ) || []"
                      :key="match"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1"
                      :style="
                        match === '@everyone'
                          ? {}
                          : {
                              backgroundColor: `#${guilds[selectGuildIdx]?.roles
                                .find((r) => r.id === match.match(/\d+/)?.[0])
                                ?.color.toString(16)
                                .padStart(6, '0')}`,
                              color: getContrastColor(
                                guilds[selectGuildIdx]?.roles.find(
                                  (r) => r.id === match.match(/\d+/)?.[0],
                                )?.color || 0,
                              ),
                            }
                      "
                    >
                      {{
                        match === "@everyone"
                          ? "@everyone"
                          : guilds[selectGuildIdx]?.roles.find(
                              (r) => r.id === match.match(/\d+/)?.[0],
                            )?.name || match
                      }}
                    </span>
                    {{ selectGuild.message?.replace(/(@everyone|<@&\d+>)/g, "") }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Role mention buttons -->
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="block text-sm font-medium text-gray-700 my-2"
                >역할 맨션하기</label
              >
            </div>
            <div class="field-body">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(role, idx) in guilds[selectGuildIdx]?.roles"
                  :key="`role-${idx}`"
                  :style="{
                    backgroundColor: `#${role.color.toString(16).padStart(6, '0')}`,
                    color: getContrastColor(role.color),
                  }"
                  class="px-3 py-1 rounded-md hover:opacity-90"
                  type="button"
                  @click="addMention({ id: role.id, name: role.name })"
                >
                  {{ role.name }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              type="submit"
            >
              저장
            </button>
          </div>
        </form>
      </div>
      <br />
      <br />

      <p>
        만약 원하는 서버가 안보이신다면, 디스코드 계정이 서버 주인인지, 봇이 초대되어
        있는지 확인해주세요!
      </p>
      <a
        :href="`${config.public.backend_url}/auth/login/discord?redirectUrl=${config.public.frontend_url}/administrator/discord`"
        target="_self"
        class="inline-flex items-center px-4 py-2 text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-md transition-colors"
      >
        <FontAwesomeIcon :icon="['fab', 'discord']" class="mr-2" />
        Discord 봇 초대(및 로그인)
      </a>
    </div>
  </div>
</template>

<style scoped>
.guild-icon {
  @apply rounded-full;
}

.banner-image {
  @apply rounded-md;
}
</style>
