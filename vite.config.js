// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Pixel-Llm-Bot/',   // ← 跟 repo 名稱完全一致
})
