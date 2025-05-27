import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CheckTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [permanenceColumns, setPermanenceColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDatabase() {
      try {
        setLoading(true);
        
        // 1. Lister toutes les tables
        const { data: tablesList, error: tablesError } = await supabase
          .from('pg_tables')
          .select('*')
          .eq('schemaname', 'public');
        
        if (tablesError) throw tablesError;
        setTables(tablesList || []);
        
        // 2. Vérifier la structure de la table evscatala_permanences
        const { data: columnsData, error: columnsError } = await supabase
          .rpc('get_table_definition', { table_name: 'evscatala_permanences' });
        
        if (columnsError) {
          console.error("Erreur lors de la récupération des colonnes:", columnsError);
          // Plan B: essayer de récupérer directement une permanence pour voir sa structure
          const { data: sampleData, error: sampleError } = await supabase
            .from('evscatala_permanences')
            .select('*')
            .limit(1);
          
          if (sampleError) throw sampleError;
          
          if (sampleData && sampleData.length > 0) {
            const columns = Object.keys(sampleData[0]).map(key => ({
              column_name: key,
              data_type: typeof sampleData[0][key]
            }));
            setPermanenceColumns(columns);
          }
        } else {
          setPermanenceColumns(columnsData || []);
        }
        
        // 3. Tester l'insertion directe d'une permanence simple
        const testPermanence = {
          title: 'Test Permanence',
          start_date: '2025-05-30T10:00:00',
          end_date: '2025-05-30T12:00:00',
          location: 'Test Location',
          required_volunteers: 2,
          max_volunteers: 4,
          min_volunteers: 1,
          status: 'open',
          created_by: 'test_user'
        };
        
        console.log("Tentative d'insertion d'une permanence de test:", testPermanence);
        
        const { data: insertData, error: insertError } = await supabase
          .from('evscatala_permanences')
          .insert([testPermanence])
          .select();
        
        if (insertError) {
          console.error("Erreur lors de l'insertion test:", insertError);
        } else {
          console.log("Insertion réussie:", insertData);
        }
        
      } catch (err: any) {
        console.error("Erreur lors de la vérification de la base de données:", err);
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }
    
    checkDatabase();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Vérification des tables Supabase</h1>
      
      {loading ? (
        <div>Chargement en cours...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Tables disponibles</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(tables, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Structure de la table evscatala_permanences</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
              {JSON.stringify(permanenceColumns, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 