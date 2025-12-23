
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tingkatkan limit warning menjadi 1000kb (1MB) agar tidak berisik
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // CODE SPLITTING: Memisahkan library besar ke file terpisah
        manualChunks: {
          vendor: ['react', 'react-dom'], // React dipisah
          genai: ['@google/genai']        // SDK Google AI dipisah (karena cukup besar)
        },
      },
    },
  },
  // Optimasi server development
  server: {
    host: true,
  }
});
