<script setup lang="ts">
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";
import {Status} from "assets/enums";
import ChzzkProfile from "~/components/ChzzkProfile.vue";

const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))
const _currentUser: Ref<number> = inject('CURRENT_USER', ref(0))
const status: Ref<Status> = ref(Status.LOADING)

useSeoMeta({
  title: 'Nabot :: Main',
  description: 'Nabot :: smart chzzk bot.'
})

;(async() => {
  try {
    status.value = Status.DONE
  } catch(e) {
    console.error("error", e)
  }
})()
</script>

<template>
  <div>
    <section class="section">
      <div class="fixed-grid">
        <div class="grid">
          <div class="cell">
            <iframe
              src="https://discord.com/widget?id=1250093195870867577&theme=dark"
              height="500"
              width="600"
              allowtransparency="true"
              frameborder="0"
              sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </div>
          <div class="cell">
            <template v-if="user">
              <ChzzkProfile :uid="user?.at(0)?.uid"/>
            </template>
            <template v-else>
              <LoginBox url="https://nabot.mori.space/"/>
            </template>
          </div>
        </div>
      </div>
      <div class="content box">
        <h2>나봇의 주요 기능</h2>

        <h3>1. 명령어 기능</h3>
        <p>
          나봇은 다양한 커스텀 명령어를 제공하여 스트리머와 치수가 손쉽게 소통할 수 있도록 합니다. 관리자는 다양한 명령어를 추가, 수정, 삭제할 수 있으며, 이를 통해 사용자와의 상호작용을 더욱 풍부하게 할 수 있습니다.
        </p>

        <h3>2. 신청곡 기능</h3>
        <p>
          사용자는 나봇을 통해 신청곡을 추가하고 재생할 수 있습니다. 이 기능은 실시간 스트리밍을 지원하며, 원하는 곡을 쉽게 추가할 수 있어 치수들의 요청을 실시간으로 반영할 수 있습니다.
        </p>

        <h3>3. 타이머 기능</h3>
        <p>
          나봇은 타이머 기능을 제공합니다. 사용자는 타이머를 설정하여 특정 시간에 알림을 받거나, 업타임을 위젯으로 쉽게 알 수 있습니다. 이 기능은 이벤트 관리나 시간 제한이 필요한 작업에 유용합니다.
        </p>

        <h3>4. 디스코드 연동 기능</h3>
        <p>
          나봇은 디스코드와의 강력한 연동 기능을 제공합니다. 스트리머는 나봇을 통해 디스코드 서버와 통합하여, 방송 알람을 실시간으로 전송할 수 있습니다.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>

</style>