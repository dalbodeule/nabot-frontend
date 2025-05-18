<script setup lang="ts">
import type { Ref } from "vue";
import { Status } from "assets/enums";
import type { IChzzkSession } from "~/components/ChzzkProfileWithButtons.vue";

const user: Ref<IChzzkSession[] | undefined> = ref(undefined);
const currentUser: Ref<number> = ref(0);
const status: Ref<Status> = ref(Status.LOADING);

provide("USER", user);
provide("CURRENT_USER", currentUser);
provide("STATUS", status);
</script>

<template>
  <div class="h-full w-full">
    <NuxtPage />
    <LoadingBox />
  </div>
</template>
