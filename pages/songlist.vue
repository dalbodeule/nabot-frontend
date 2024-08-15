<script setup lang="ts">
import type {Ref} from "vue";
import type {IChzzkSession} from "~/components/ChzzkProfileWithSession.vue";

const streamer: Ref<IChzzkSession | undefined> | undefined = inject("USER")
const router = useRouter()

watchEffect(() => {
  if(streamer?.value?.uid) {
    router.push("/administrator/songlist")
  } else {
    router.push("/")
  }
})
</script>