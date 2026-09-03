import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { brandDivergingApiPlugin } from './api/viteBrandDivergingApiPlugin.ts'
import { excelTemplateApiPlugin } from './api/viteExcelTemplateApiPlugin.ts'
import { transitionNetworkApiPlugin } from './api/viteTransitionNetworkApiPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    transitionNetworkApiPlugin(),
    brandDivergingApiPlugin(),
    excelTemplateApiPlugin(),
  ],
})
