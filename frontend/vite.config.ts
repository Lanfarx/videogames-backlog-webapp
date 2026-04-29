import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  

  const defines: Record<string, string> = {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
  };
  Object.keys(env).forEach(key => {
    if (key.startsWith('REACT_APP_')) {
      const val = env[key];
      defines[`process.env.${key}`] = JSON.stringify(val.replace(/^"|"$/g, ''));
    }
  });

  return {
    plugins: [react()],
    base: '/',
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
    },
    define: defines,
  };
});
