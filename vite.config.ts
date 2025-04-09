import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'electron/main.ts', // Electron 主进程入口文件
    }),
  ],
  base: './', // 确保静态资源路径正确
  build: {
    outDir: 'dist', // 打包输出目录
  }
})