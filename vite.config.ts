import { defineConfig } from "vite";
import type { PluginOption } from "vite";
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: ([
    react(),
    miaodaDevPlugin(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ] as PluginOption[]), 

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    // Increase limit to 1000kb to match your current bundle size
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // This strategy creates separate chunks for major libraries automatically
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Logic to split by package name
            // Example: node_modules/react-dom/... -> vendor-react-dom
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
        // Optional: This keeps your asset names cleaner
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
});