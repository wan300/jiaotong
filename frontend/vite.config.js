import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 指定构建输出目录
    outDir: 'dist',
    // 指定生成静态资源的存放路径
    assetsDir: 'assets',
  },
  server: {
    // 配置开发服务器代理，解决跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 代理到您的后端地址
        changeOrigin: true,
      },
    },
  },
})
