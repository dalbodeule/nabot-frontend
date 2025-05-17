<script setup lang="ts">
const prop = defineProps<{ time: number; flipFlags: [boolean, boolean] }>();

const timeDigits = computed(() => {
  return String(prop.time).padStart(2, "0").split("");
});
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="flex items-center space-x-2">
      <div
        v-for="(digit, index) in timeDigits"
        :key="index"
        class="relative w-24 h-32"
        :class="{ 'animate-flip': flipFlags[index] }"
      >
        <div class="absolute inset-0 bg-gray-900 rounded shadow-lg">
          <div
            class="flex items-center justify-center h-full text-4xl text-white font-mono"
          >
            {{ digit }}
          </div>
          <div class="absolute inset-0 backface-hidden">
            <div
              class="flex items-center justify-center h-full text-4xl text-white font-mono"
            >
              {{ digit }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@keyframes flip {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(180deg);
  }
}

.animate-flip {
  animation: flip 0.6s ease-in-out;
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  transform: rotateX(180deg);
}
</style>
