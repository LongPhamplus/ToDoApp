// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  
  // UI Configuration
  ui: {
    colors: {
      primary: 'indigo',
      gray: 'zinc',
    }
  },
  
  // Tailwind CSS
  tailwindcss: {
    config: {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Geist Sans', 'sans-serif'],
          },
          colors: {
            glass: 'rgba(255, 255, 255, 0.7)',
          },
        }
      }
    }
  },
  
  // App Configuration
  app: {
    head: {
      title: '📋 Todo App - Quản Lý Công Việc',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ứng dụng quản lý công việc hiệu quả với thông báo deadline' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  
  // Runtime Config
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-32chars',
  },
  
  // Build
  build: {
    transpile: ['mongoose'],
  },

  // Nitro — externalize mongoose/mongodb so they stay as CJS requires
  nitro: {
    preset: 'vercel',
    externals: {
      external: ['mongoose', 'mongodb'],
    },
    hooks: {
      // Nitro hardcodes "type":"module" in the output package.json, but
      // mongoose/mongodb are CJS and can't resolve imports without .js extension
      // under ESM strict mode. Remove it after build so Node treats them as CJS.
      compiled: async (nitro) => {
        const { writeFileSync, readFileSync, existsSync } = await import('node:fs')
        // nitro.options.output.serverDir = .vercel/output/functions/__fallback.func
        const pkgPath = nitro.options.output.serverDir + '/package.json'
        if (existsSync(pkgPath)) {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
          delete pkg.type
          writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
          console.log('[fix] Removed "type":"module" from', pkgPath)
        }
      },
    },
  },
})
