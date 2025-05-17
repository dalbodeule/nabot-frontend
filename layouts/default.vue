<script lang="ts" setup>
import type { Ref } from "vue";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";
import { getSessionUser } from "assets/tools";
import { Status } from "assets/enums";
import LoadingBox from "~/components/LoadingBox.vue";

const config = useRuntimeConfig();

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
    <div>
      <SiteHeader />
      <div class="container mx-auto mt-5 min-h-[80vh]">
        <NuxtPage />
      </div>
      <SiteFooter />
      <LoadingBox />
    </div>
  </div>
</template>
