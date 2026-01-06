import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }, // ✅ Cerramos el objeto `resolve` aquí
    base: '/slurm_stat_js/',
    server: {
      port: 5173,
      host: true,
      allowedHosts: [
        'labsb.cimat.mx',
        'localhost',
      ],
    }
  }; // ← Cierra el objeto principal
});
