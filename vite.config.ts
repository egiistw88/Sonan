import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file dari komputer lokal (jika ada)
    const env = loadEnv(mode, process.cwd(), '');
    
    // Ambil API Key dari Vercel System (process.env) ATAU file .env lokal
    // Jika tidak ketemu, kita kasih string kosong '' (JANGAN undefined, nanti crash)
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Stringify kunci agar tertanam aman di kode frontend
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});