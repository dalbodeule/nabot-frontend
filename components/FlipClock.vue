<script setup lang="ts">
import "~/assets/flip-clock.scss";

const prop = defineProps<{ time: number; flipFlags: [boolean, boolean] }>();

const timeDigits = computed(() => {
  return String(prop.time).padStart(2, "0").split("");
});
</script>

<template>
  <div class="flip-clock">
    <div
      v-for="(digit, index) in timeDigits"
      :key="index"
      class="digit"
      :class="{ flip: flipFlags[index] }"
    >
      <div class="card">
        <div class="front">{{ digit }}</div>
        <div class="back">{{ digit }}</div>
      </div>
    </div>
  </div>
</template>
