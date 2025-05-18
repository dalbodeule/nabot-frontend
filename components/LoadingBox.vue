<script setup lang="ts">
import { Status } from "assets/enums";
import { getLoading } from "assets/tools";

const status = getLoading();
</script>

<template>
  <div class="page-overlay" :class="{
    'hidden': status !== Status.LOADING
  }">
    <div class="loader" />
  </div>
</template>

<style scoped lang="scss">
.page-overlay {
  @apply fixed flex top-0 left-0 w-full h-full bg-white/80 justify-center items-center z-10 opacity-100 transition-opacity duration-500;

  .loader {
    @apply w-[120px] h-[120px] border-[16px] border-[#f3f3f3] border-t-[#3498db] rounded-full mx-auto animate-spin;
  }

  &.hidden {
    display: none;

    .loader {
      display: none;
    }
  }
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
