<script lang="ts" setup>
import "bulma/bulma.scss"
import "bulma/sass/themes/light.scss"

useHead({
  htmlAttrs: {
    class: 'theme-light'
  }
})

</script>
<template>
  <div>
    <div class="container" style="margin-top: 20px; min-height: 80vh;">
      <NuxtPage />
    </div>
  </div>
</template>