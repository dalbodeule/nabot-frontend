// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  build: {
    transpile: [ 'Dayjs' ]
  },
  nitro: {
    preset: 'cloudflare-module'
  },
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  purgecss: {
    safelist: [/svg.*/, /fa.*/]
  },
  modules: [
    '@vueuse/nuxt',
    'nuxt-purgecss',
    '@nuxt/eslint',
  ]
})
