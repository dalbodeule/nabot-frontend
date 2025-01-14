<script setup lang="ts">
import "@/assets/loading.scss"
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithButtons.vue";
import {Status} from "assets/enums";
import {defaultCommands} from "assets/tools";

export interface ICommandType {
  label: string,
  content: string,
  failContent: string,
  isNew: boolean
}

const commands: Ref<ICommandType[]> = ref([])
const status: Ref<Status> = ref(Status.LOADING)

const config = useRuntimeConfig()
const user: Ref<IChzzkSession[] | undefined> = inject("USER", ref(undefined))
const currentUser: Ref<number | undefined> = inject("CURRENT_USER", ref(0))

definePageMeta({
  layout: 'administrator'
})

useSeoMeta({
  title: "Nabot :: administrator :: Command",
  robots: false
})

const getCommand = async () => {
  try {
    const response = await useRequestFetch()(`${config.public.backend_url}/commands/${user?.value?.at(currentUser.value)?.uid}`, {
      method: 'GET',
      credentials: 'include'
    }) as { label: string, content: string, failContent: string }[]
    if(response) {
      commands.value = response.map((value) => {
        return {...value, isNew: false}
      })
    }
  } catch(e) {
    console.error(e)
  }
}

const addCommand = () => {
  commands.value.push({label: '', content: '', failContent: '', isNew: true})
}

const insertPlaceholder = (index: number, placeholder: string) => {
  commands.value[index].content += placeholder
}

const saveCommand = async (index: number) => {
  try {
    const p = commands.value[index]
    status.value = Status.LOADING
    if(p.isNew) {
      try {
        await useRequestFetch()(`${config.public.backend_url}/commands/${user?.value?.at(currentUser.value)?.uid}`, {
          method: 'PUT',
          credentials: 'include',
          body: JSON.stringify({label: p.label, content: p.content, failContent: p.failContent})
        });
        status.value = Status.DONE
      } catch(e) {
        console.error(e)
        alert("저장에 실패했습니다.")
        status.value = Status.ERROR
      }
    } else {
      try {
        await useRequestFetch()(`${config.public.backend_url}/commands/${user?.value?.at(currentUser.value)?.uid}`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({label: p.label, content: p.content, failContent: p.failContent})
        });
        status.value = Status.DONE
      } catch(e) {
        console.error(e)
        alert("저장에 실패했습니다.")
        status.value = Status.ERROR
      }
    }

    await getCommand()
  } catch(e) {
    console.error(e)
  }
}



const deleteCommand = async(index: number) => {
  try {
    const p = commands.value.splice(index, 1)
    await useRequestFetch()(`${config.public.backend_url}/commands/${user?.value?.at(currentUser.value)?.uid}`, {
      method: 'DELETE',
      credentials: 'include',
      body: JSON.stringify({ label: p[0].label, content: p[0].content, failContent: p[0].failContent })
    });

  } catch(e) {
    console.error(e)
  }
}

watchEffect(async () => {
  console.log(user?.value?.at(currentUser.value)?.uid)
  await getCommand()
  status.value = Status.DONE
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <div v-if="status == Status.LOADING" class="page-overlay">
      <div class="loading"/>
    </div>
    <div class="content">
      <h2>기본 명령어</h2>
      <div v-for="(command, index) in defaultCommands" :key="`def-${index}`" class="box">
        <div class="field">
          <label class="label">명령어 이름</label>
          <div class="control">
            <input v-model="command.label" class="input" type="text" disabled>
          </div>
        </div>
        <div class="field">
          <label class="label">명령어 내용</label>
          <div class="control">
            <input v-model="command.content" type="text" class="input" disabled>
          </div>
        </div>
      </div>
      <br >
      <h2>스트리머 명령어</h2>
      <!-- 명령어 추가 버튼 (맨 위) -->
      <div class="buttons is-right">
        <button class="button is-primary" @click="addCommand">명령어 추가</button>
        <button class="button is-info" @click="getCommand">목록 다시받기</button>
      </div>

      <!-- 명령어 목록 -->
      <div v-for="(command, index) in commands" :key="index" class="box">
        <div class="field">
          <label class="label">명령어 이름</label>
          <div class="control">
            <input v-model="command.label" class="input" type="text" placeholder="명령어 이름 입력">
          </div>
        </div>
        <div class="field">
          <label class="label">명령어 내용</label>
          <div class="control">
            <input v-model="command.content" type="text" class="input" placeholder="명령어 내용 입력">
          </div>
        </div>
        <div class="field">
          <label class="label">명령어 실패시 내용</label>
          <div class="control">
            <input v-model="command.failContent" type="text" class="input" placeholder="명령어 내용 입력">
          </div>
          <p class="help is-info">데일리 카운터에서 이미 사용한 유저가 보게 될 내용입니다.</p>
        </div>
        <div class="field">
          <label class="label">플레이스홀더 추가</label>
          <!-- placeholders:
           <name>
           <following>
           <counter:counter_name>
           <personal_counter:counter_name>
           <daily_counter:counter_name>
           <days:yyyy-mm-dd>
           -->
          <div class="buttons">
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<name>')"
              >유저 이름</button>
              <div class="tooltip">이 자리에 유저 이름이 표시됩니다.</div>
            </div>
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<following>')"
              >팔로우 기간</button>
              <div class="tooltip">이 자리에 만 몇일 팔로우했는지 숫자로 나옵니다.</div>
            </div>
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<counter:>')"
              >일반 카운터</button>
              <div class="tooltip">사용하면 +1 되는 카운터입니다. &lt;counter:이름&gt; 으로 작성합니다.</div>
            </div>
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<personal_counter:>')"
              >개인 카운터</button>
              <div class="tooltip">사용하면 유저별로 +1 되는 카운터입니다. &lt;personal_counter:이름&gt; 으로 작성합니다.</div>
            </div>
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<daily_counter:>')"
              >데일리 카운터</button>
              <div class="tooltip">사용하면 유저별 하루 한번 +1 되는 카운터입니다. &lt;daily_counter:이름&gt; 으로 작성합니다.<br>명령어 실패시 내용을 적어주세요!</div>
            </div>
            <div class="tooltip-wrapper">
              <button
                  class="button is-light"
                  @click="insertPlaceholder(index, '<days:yyyy-mm-dd>')"
              >디데이 카운터</button>
              <div class="tooltip">yyyy-mm-dd 부터 몇일이 지났는지 숫자로 표시됩니다.</div>
            </div>
          </div>
          <p class="help is-info">일반 카운터, 개인 카운터, 데일리 카운터는 : 뒤에 이름을 적어주세요!</p>
          <p class="help is-info">디데이 카운터는 yyyy-mm-dd 를 날짜로 바꿔주세요. (예시: 2024-08-10)</p>
        </div>
        <!-- 저장 및 삭제 버튼 -->
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <button class="button is-success" @click="saveCommand(index)">저장</button>
          </p>
          <p class="control">
            <button class="button is-danger" @click="deleteCommand(index)">삭제</button>
          </p>
        </div>
      </div>

      <!-- 명령어 추가 버튼 (맨 아래) -->
      <div class="buttons is-right">
        <button class="button is-primary" @click="addCommand">명령어 추가</button>
        <button class="button is-info" @click="getCommand">목록 다시받기</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    text-align: center;
    padding: 5px 10px;
    border-radius: 5px;
    white-space: nowrap;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }

  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
}
</style>