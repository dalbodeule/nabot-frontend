<script setup lang="ts">
import { onBeforeUnmount, type Ref } from "vue";
import FlipClock from "~/components/FlipClock.vue";
import dayjs from "dayjs";
import { useWebSocket } from "@vueuse/core";
import { TimerType, TimerMode } from "assets/enums";

const route = useRoute();
const config = useRuntimeConfig();

const status: Ref<TimerType> = ref(TimerType.STREAM_OFF);
const flipFlags: Ref<[boolean, boolean][]> = ref([
  [false, false],
  [false, false],
  [false, false],
]);
const mode: Ref<TimerMode> = ref(TimerMode.DEFAULT);
const timer: Ref<number> = ref(0);

const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const uid = route.params.uid as string;

definePageMeta({
  layout: "transparent",
});
useSeoMeta({
  title: `Chibot :: Timer on ${uid}`,
  robots: false,
});

const { close } = useWebSocket(
  `wss://${config.public.backend_url.replace("https://", "")}/timer/${uid}`,
  {
    autoReconnect: true,
    onError(ws, event) {
      console.error("WebSocket error: ", event);
    },
    onConnected() {
      console.log("WebSocket connected.");
    },
    onDisconnected() {
      console.log("WebSocket disconnected.");
    },
    onMessage(_ws, msg) {
      const message = JSON.parse(msg.data) as { type: TimerType; time: string };
      switch (message.type) {
        case TimerType.REMOVE:
          stopTimer();
          break;
        case TimerType.TIMER:
          startCountDownFromTime(message.time);
          break;
        case TimerType.UPTIME:
          startCountUpFromTime(message.time);
          break;
        case TimerType.STREAM_OFF:
          stopTimer();
      }
      status.value = message.type;
    },
  },
);

const startTimer = () => {
  if (timer.value) {
    stopTimer();
  }
  timer.value = setInterval(updateTime, 1000) as unknown as number;
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = 0;
  }
};

const updateTime = () => {
  const prevHours = hours.value;
  const prevMinutes = minutes.value;
  const prevSeconds = seconds.value;

  switch (mode.value) {
    case TimerMode.UP:
      incrementTime();
      break;
    case TimerMode.DOWN:
      decrementTime();
      break;
  }

  updateFlipFlags(prevHours, hours.value, 0);
  updateFlipFlags(prevMinutes, minutes.value, 1);
  updateFlipFlags(prevSeconds, seconds.value, 2);
};

const incrementTime = () => {
  seconds.value++;
  if (seconds.value === 60) {
    seconds.value = 0;
    minutes.value++;
  }
  if (minutes.value === 60) {
    minutes.value = 0;
    hours.value++;
  }
};

const decrementTime = () => {
  if (seconds.value === 0) {
    seconds.value = 59;
    if (minutes.value === 0) {
      minutes.value = 59;
      hours.value--;
    } else {
      minutes.value--;
    }
  } else {
    seconds.value--;
  }
};

const updateFlipFlags = (prev: number, current: number, unit: number) => {
  const prevDigits = String(prev).padStart(2, "0").split("");
  const currentDigits = String(current).padStart(2, "0").split("");

  flipFlags.value[unit] = [
    prevDigits[0] !== currentDigits[0],
    prevDigits[1] !== currentDigits[1],
  ];

  setTimeout(() => (flipFlags.value[unit] = [false, false]), 500);
};

const disconnectWebSocket = () => {
  close();
};

onBeforeUnmount(() => {
  disconnectWebSocket();
});

const startCountUpFromTime = (time: string) => {
  const [hour, minute, second] = time.split(":").map(Number);
  hours.value = hour;
  minutes.value = minute;
  seconds.value = second;

  mode.value = TimerMode.UP;
  startTimer();
};

const startCountDownFromTime = (time: string) => {
  const target = dayjs(time);
  const current = dayjs();

  let remain = target.diff(current, "seconds");

  hours.value = Math.floor(remain / 3600);
  remain %= 3600;
  minutes.value = Math.floor(remain / 60);
  seconds.value = remain % 60;

  mode.value = TimerMode.DOWN;
  startTimer();
};
</script>

<template>
  <div>
    <div v-if="status == TimerType.STREAM_OFF" class="overlay">
      <div class="loader" />
    </div>
    <div v-else-if="status != TimerType.REMOVE" class="timer">
      <FlipClock :time="hours" :flip-flags="flipFlags[0]" />
      <FlipClock :time="minutes" :flip-flags="flipFlags[1]" />
      <FlipClock :time="seconds" :flip-flags="flipFlags[2]" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>
