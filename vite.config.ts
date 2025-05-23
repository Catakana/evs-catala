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
      // Forcer la pré-bundlisation de React et ses dépendances
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        '@radix-ui/react-context', 
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tabs',
        '@radix-ui/react-dialog',
        '@radix-ui/react-toast',
        'lucide-react'
      ],
      force: true
    },
    build: {
      // Augmenter la limite d'avertissement pour les chunks (en KB)
      chunkSizeWarningLimit: 1500,
      // Stocker tous les assets dans un seul dossier
      assetsDir: 'assets',
      // Ne pas générer de source maps en production
      sourcemap: mode === 'development',
      // Stratégie de bundling simplifiée
      rollupOptions: {
        output: {
          // Regrouper tout React dans un seul fichier
          manualChunks: {
            'vendor': [
              'react', 
              'react-dom', 
              'react-router-dom',
              'scheduler',
              '@radix-ui/react-context',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-dialog',
              '@radix-ui/react-toast',
              'prop-types',
              'object-assign',
              'loose-envify'
            ],
            'ui': [
              'lucide-react',
              'framer-motion',
              'class-variance-authority',
              'tailwind-merge'
            ]
          },
          // Format de sortie ES moderne
          format: 'es',
          // Nom de fichiers cohérents
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Désactiver la minification en mode développement pour faciliter le débogage
      minify: mode !== 'development',
      // S'assurer qu'un seul fichier de bundle global est créé pour React et ses dépendances
      modulePreload: {
        resolveDependencies: (filename, deps) => {
          // Forcer le préchargement des dépendances React dans tous les cas
          if (filename.includes('vendor')) {
            return deps;
          }
          return [];
        }
      }
    }
  };
});
