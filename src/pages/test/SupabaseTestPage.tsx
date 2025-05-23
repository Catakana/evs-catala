import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SupabaseTest } from '@/components/ui/SupabaseTest';

/**
 * Page de test pour vérifier la connexion à la nouvelle base de données Supabase
 * Cette page est uniquement destinée à tester la migration.
 */
const SupabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container flex-1 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Test de migration Supabase</h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <p className="text-amber-800">
              Cette page est destinée à tester la connexion avec la nouvelle base de données Supabase après migration.
              Utilisez les boutons ci-dessous pour vérifier que tout fonctionne correctement.
            </p>
          </div>
          
          <SupabaseTest />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Résumé de la migration</h2>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>URL Supabase : <code className="bg-gray-100 p-1 rounded">https://oybpmjjtbmlesvhlgabn.supabase.co</code></li>
              <li>Préfixe des tables : <code className="bg-gray-100 p-1 rounded">evscatala_</code></li>
              <li>Tables principales :
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>evscatala_profiles</li>
                  <li>evscatala_events</li>
                  <li>evscatala_announcements</li>
                  <li>evscatala_permanences</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SupabaseTestPage; 