// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-10-01',
  srcDir: '.',
  dir: {
    app: 'app'
  },
  devtools: { enabled: true },
  build: {
    transpile: [ 'Dayjs' ]
  },
  runtimeConfig: {
    public: {
      backend_url: process.env.BACKEND_URL
    }
  },
  nitro: {
    preset: 'cloudflare-module',
    prerender: {
      autoSubfolderIndex: false
    }
  },
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    '@/assets/default.scss'
  ],
  purgecss: {
    safelist: [/svg.*/, /fa.*/]
  },
  modules: ['@vueuse/nuxt', 'nuxt-purgecss', '@nuxt/eslint', "@nuxt/scripts"]
})