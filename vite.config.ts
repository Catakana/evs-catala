import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@types": path.resolve(__dirname, "./src/types"),
      },
    },
    // Configuration explicite pour le mode développement
    define: {
      __DEV__: mode === 'development',
    },
    build: {
      // Augmenter la limite d'avertissement pour les chunks (en KB)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Configuration améliorée du chunking pour éviter les problèmes de référence
          manualChunks: (id) => {
            // Mettre React et toutes ses dépendances essentielles dans un seul chunk
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/scheduler')) {
              return 'vendor-react-core';
            }
            
            // Regrouper toutes les dépendances React UI
            if (id.includes('node_modules/@radix-ui/react') ||
                id.includes('node_modules/prop-types') ||
                id.includes('node_modules/object-assign') ||
                id.includes('node_modules/js-tokens') ||
                id.includes('node_modules/loose-envify')) {
              return 'vendor-react-ui';
            }
            
            // Regrouper d'autres UI components
            if (id.includes('node_modules/framer-motion') || 
                id.includes('node_modules/lucide-react') ||
                id.includes('node_modules/class-variance-authority')) {
              return 'vendor-ui';
            }
            
            // Regrouper toutes les autres dépendances
            if (id.includes('node_modules')) {
              return 'vendor-other';
            }
          },
          // Assurer que les chunks sont compatibles avec ESM et le systême d'imports
          format: 'es',
          // S'assurer que tous les morceaux externes sont correctement traités
          chunkFileNames: 'assets/[name]-[hash].js',
        }
      }
    }
  };
});
