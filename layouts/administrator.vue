<script lang="ts" setup>
import type { Ref } from "vue";
import { getSessionUser } from "@/assets/tools";
import { Status } from "@/assets/enums";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";
import LoadingBox from "~/components/LoadingBox.vue";

const config = useRuntimeConfig();
const route = useRoute();

const user: Ref<IChzzkSession[] | undefined> = ref(undefined);
const currentUser: Ref<number> = ref(0);
const status: Ref<Status> = ref(Status.LOADING);

provide("USER", user);
provide("CURRENT_USER", currentUser);
provide("STATUS", status);

onMounted(async () => {
  try {
    status.value = Status.LOADING;
    user.value = await getSessionUser(config.public.backend_url);
    status.value = Status.DONE;
  } catch (e) {
    if (e.status == 404) {
      status.value = Status.REQUIRE_REGISTER;
    } else {
      status.value = Status.ERROR;
    }
  }
});
</script>

<template>
  <div class="w-full h-full">
    <LoadingBox />
    <div
      v-if="status == Status.ERROR"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <LoginBox :url="config.public.frontend_url" />
    </div>
    <div class="w-full h-full">
      <SiteHeader />
      <div class="container mx-auto mt-5 min-h-[80vh] px-4">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <NuxtLink
              to="/administrator"
              :class="[
                route.path === '/administrator'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                'px-3 py-2 text-sm font-medium',
              ]"
              >유저 선택
            </NuxtLink>
            <NuxtLink
              to="/administrator/settings"
              :class="[
                route.path === '/administrator/settings'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                'px-3 py-2 text-sm font-medium',
              ]"
              >기본 설정
            </NuxtLink>
            <NuxtLink
              to="/administrator/command"
              :class="[
                route.path === '/administrator/command'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                'px-3 py-2 text-sm font-medium',
              ]"
              >명령어 설정
            </NuxtLink>
            <NuxtLink
              to="/administrator/discord"
              :class="[
                route.path === '/administrator/discord'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                'px-3 py-2 text-sm font-medium',
              ]"
              >디스코드 설정
            </NuxtLink>
            <NuxtLink
              to="/administrator/timer"
              :class="[
                route.path === '/administrator/timer'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                'px-3 py-2 text-sm font-medium',
              ]"
              >타이머 설정
            </NuxtLink>
            <NuxtLink
              to="/administrator/songlist"
              :class="[
                route.path === '/administrator/songlist'
                  ? 'border-b-2 border-blue-500'
                  : 'border-transparent',
                currentUser > 0 ? 'opacity-50 cursor-not-allowed' : '',
                'px-3 py-2 text-sm font-medium',
              ]"
              :disabled="currentUser > 0"
              >치수 플레이리스트
            </NuxtLink>
          </nav>
        </div>
        <NuxtPage />
      </div>
      <SiteFooter />
      <LoadingBox />
    </div>
  </div>
</template>
