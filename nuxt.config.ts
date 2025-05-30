// https://nuxt.com/docs/api/configuration/nuxt-config

// eslint-disable-next-line
export default defineNuxtConfig({
  compatibilityDate: "2024-10-01",
  srcDir: ".",
  dir: {
    app: "app",
  },
  devtools: { enabled: true },
  build: {
    transpile: ["Dayjs"],
  },
  runtimeConfig: {
    public: {
      backend_url: process.env.BACKEND_URL,
      frontend_url: process.env.FRONTEND_URL,
    },
  },
  nitro: {
    preset: "cloudflare-module",
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  css: ["@fortawesome/fontawesome-svg-core/styles.css", "@/assets/tailwind.scss"],
  modules: ["@vueuse/nuxt", "@nuxt/eslint", "@nuxt/scripts", "@nuxtjs/tailwindcss"],
});
