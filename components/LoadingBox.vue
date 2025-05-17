<script setup lang="ts">
import { Status } from "assets/enums";
import { getLoading } from "assets/tools";

const status = getLoading();
</script>

<template>
  <div v-if="status === Status.LOADING" class="page-overlay">
    <div class="loader" />
  </div>
</template>

<style scoped>
.page-overlay {
  @apply fixed flex top-0 left-0 w-full h-full bg-white/80 justify-center items-center z-10 opacity-100 transition-opacity duration-500;
}

.page-overlay.hidden {
  @apply opacity-0;
}

.loader {
  @apply w-[120px] h-[120px] border-[16px] border-[#f3f3f3] border-t-[#3498db] rounded-full mx-auto animate-spin;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
