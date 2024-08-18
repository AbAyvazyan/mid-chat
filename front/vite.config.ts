import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [checker({ typescript: true }), react()],
  resolve: {
    alias: {
      '@assets': resolve(__dirname, './src/assets'),
      '@pages': resolve(__dirname, './src/pages'),
      '@app': resolve(__dirname, './src/app'),
      '@utils': resolve(__dirname, './src/utils'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@components': resolve(__dirname, './src/components'),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
