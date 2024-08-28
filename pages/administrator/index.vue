  <script setup lang="ts">

  import {inject, type Ref} from "vue";
  import ChzzkProfileWithButtons, {type IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";

  definePageMeta({
    layout: 'administrator'
  })

  const users: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))
  const currentUser: Ref<number> = inject("CURRENT_USER", ref(0))

  </script>

  <template>
    <div class="content">
      <h1>관리할 유저를 선택해주세요.</h1>
      <div v-for="(value, idx) in users" :key="`user-${idx}`">
        <ChzzkProfileWithButtons :profile="value" :idx="idx" @selected="selected => { currentUser = selected }"/>
      </div>
    </div>
  </template>

  <style scoped>

  </style>