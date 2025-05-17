<script setup lang="ts">
import { getUser, getCurrentUser } from "assets/tools";

definePageMeta({
  layout: "administrator",
});
useSeoMeta({
  title: "Chibot :: administrator :: SelectUser",
  robots: false,
});

const users = getUser();
const currentUser = getCurrentUser();
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">관리할 유저를 선택해주세요.</h1>
    <div class="space-y-4">
      <div v-for="(value, idx) in users" :key="`user-${idx}`">
        <ChzzkProfileWithButtons
          :profile="value"
          :idx="idx"
          @selected="
            (selected) => {
              currentUser = selected;
            }
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
