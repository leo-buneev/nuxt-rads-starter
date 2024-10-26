import type { ModuleOptions, Nuxt, NuxtAppConfig } from 'nuxt/schema'

import Aura from '@primevue/themes/aura'

import versionSvc from './scripts/versionSvc'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  ssr: false,
  srcDir: 'src/',
  serverDir: 'server/',
  devServer: { port: 3000 },
  modules: [injectVersion, '@nuxtjs/tailwindcss', '@primevue/nuxt-module', '@nuxt/icon'],
  icon: {
    provider: 'server',
    mode: 'svg',
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
      sizeLimitKb: 0,
    },
    serverBundle: 'local',
    size: '1.3em',
    customCollections: [
      {
        prefix: 'tc',
        dir: './src/assets/icons',
      },
    ],
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  routeRules: {
    '/**': { cors: true },
  },
  spaLoadingTemplate: false,
  app: { head: getHead() },

  nitro: { preset: 'node-server' },

  imports: {
    imports: [
      {
        from: 'lodash',
        name: '_',
        dtsDisabled: true,
      },
    ],
  },
  css: ['@/assets/css/main.scss'],

  vite: {
    build: { assetsInlineLimit: 0 },
    vue: {
      features: {
        propsDestructure: true,
      },
    },
    css: {
      preprocessorOptions: {
        sass: { api: 'modern-compiler', additionalData: '@use "@/assets/css/variables.scss" as *\n' },
        scss: { api: 'modern-compiler', additionalData: '@use "@/assets/css/variables.scss" as *;\n' },
      },
    },
    resolve: {
      alias: {
        moment: 'moment/min/moment-with-locales',
      },
    },
    // plugins: [
    //   unpluginVueComponents({
    //     // dts: 'components-generated.d.ts',
    //     resolvers: [QuasarResolver()],
    //     exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
    //   }),
    //   radsDbVite({ exposeModulesInDev: true }),
    // ],
    optimizeDeps: {
      exclude: ['_rads-db'],
    },
  },
  hooks: {
    'prerender:routes'() {
      process.env.NUXT_PRERENDER = 'true'
    },
    // Leo file structure
    'pages:extend'(routes) {
      // We assume that routes are ordered by filename, so index files go first.
      // If not, consider ordering manually.
      const newRoutes = routes as any[]
      const directoriesWithIndexComponent = {} as Record<string, boolean>
      for (let i = 0; i < routes.length; i++) {
        newRoutes[i].props = true
        const r = routes[i]
        if (!r.file) continue
        const fileParts = r.file.split('/')
        const directoryPath = fileParts.slice(0, -1).join('/')
        if (directoriesWithIndexComponent[directoryPath]) {
          newRoutes[i] = null
          continue
        }
        const fileNameWithExt = fileParts[fileParts.length - 1]
        const fileName = fileNameWithExt.split('.')[0]
        const directoryName = fileParts[fileParts.length - 2]
        if (directoryName === fileName) {
          directoriesWithIndexComponent[directoryPath] = true

          const higherDirectoryPath = fileParts.slice(0, -2).join('/')
          if (directoriesWithIndexComponent[higherDirectoryPath]) {
            newRoutes[i] = null
            continue
          }
          if (!r.path.includes(':') && r.path.endsWith(`${fileName}/${fileName}`)) {
            r.path = r.path.slice(0, -(fileName.length + 1))
          }
          r.name = r.name?.slice(0, -(fileName.length + 1))
        }
        if (r.path.endsWith('/Home') && r.file.endsWith('/Home.vue')) {
          r.path = r.path.slice(0, -4)
          continue
        }
      }
      filterInPlace(newRoutes, (v) => !!v)
    },
  },
})

function injectVersion(options: ModuleOptions, nuxtApp: Nuxt) {
  nuxtApp.options.runtimeConfig.public.version = versionSvc.getVersion(
    nuxtApp.options._prepare ? 'development' : undefined,
  )
}

function getHead(): NuxtAppConfig['head'] {
  return {
    meta: [
      { name: 'format-detection', content: 'telephone=no' },
      {
        name: 'viewport',
        content:
          'user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, viewport-fit=cover',
      },
    ],
    link: [
      { rel: 'icon', sizes: 'any', href: '/icons/icon-256.webp', key: 'favicon' },
      { rel: 'apple-touch-icon', href: '/icons/icon-256.webp' },
    ],
    title: 'Inscan Viewer',
  }
}

function filterInPlace<T>(array: T[], condition: (value: T) => boolean) {
  let j = 0

  for (const [index, value] of array.entries()) {
    if (condition(value)) {
      if (index !== j) array[j] = value
      j++
    }
  }

  array.length = j
  return array
}
