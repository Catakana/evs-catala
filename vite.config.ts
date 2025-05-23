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
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      force: true
    },
    build: {
      // Augmenter la limite d'avertissement pour les chunks (en KB)
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          // Nouvelle configuration de chunking simplifiée
          manualChunks: (id) => {
            // Tout ce qui est lié à React dans un seul chunk monolithique
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/scheduler') ||
                id.includes('node_modules/@radix-ui/react') ||
                id.includes('node_modules/prop-types') ||
                id.includes('node_modules/object-assign') ||
                id.includes('node_modules/js-tokens') ||
                id.includes('node_modules/loose-envify')) {
              return 'react-vendor';
            }
            
            // Regrouper d'autres UI components
            if (id.includes('node_modules/framer-motion') || 
                id.includes('node_modules/lucide-react') ||
                id.includes('node_modules/class-variance-authority')) {
              return 'ui-vendor';
            }
            
            // Regrouper toutes les autres dépendances
            if (id.includes('node_modules')) {
              return 'deps-vendor';
            }
          },
          // Assurer que les chunks sont compatibles avec ESM
          format: 'es',
          // Utiliser des noms de fichiers cohérents
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
        // S'assurer que React et ReactDOM sont externalisés correctement
        external: []
      },
      // S'assurer que les modules sont correctement évalués
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      // Générer des sourcemaps pour le débogage en production
      sourcemap: mode === 'development',
      // Assurer que les modules sont correctement préservés
      target: 'esnext',
      // Désactivation de la minification pour le débogage si nécessaire
      minify: mode !== 'development',
    }
  };
});
