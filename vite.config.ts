import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Ambil API Key dari process.env (Vercel System Env) ATAU file .env
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Stringify kunci agar tertanam sebagai string di kode frontend
        // Jika kosong, kita kasih string kosong biar gak crash 'undefined'
        'process.env.API_KEY': JSON.stringify(apiKey || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});