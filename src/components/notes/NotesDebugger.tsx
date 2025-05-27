import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { notesService } from '@/lib/notesService';
import { authService } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export function NotesDebugger() {
  const { toast } = useToast();
  const [testContent, setTestContent] = useState('Test de création de note depuis le debugger');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[NOTES DEBUG] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testAuthentication = async () => {
    try {
      addLog('🔍 Test d\'authentification...');
      
      // Test 1: Vérifier la session Supabase
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addLog(`❌ Erreur session: ${sessionError.message}`);
        return;
      }
      
      if (!session?.session) {
        addLog('❌ Aucune session active');
        return;
      }
      
      addLog(`✅ Session active: ${session.session.user.id}`);
      
      // Test 2: Vérifier authService
      const user = await authService.getCurrentUser();
      if (!user) {
        addLog('❌ authService.getCurrentUser() retourne null');
        return;
      }
      
      addLog(`✅ Utilisateur actuel: ${user.id} (${user.email})`);
      
      // Test 3: Vérifier le profil
      const { data: profile, error: profileError } = await supabase
        .from('evscatala_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        addLog(`⚠️ Pas de profil trouvé: ${profileError.message}`);
      } else {
        addLog(`✅ Profil trouvé: ${profile.firstname} ${profile.lastname} (${profile.role})`);
      }
      
    } catch (error) {
      addLog(`❌ Erreur test auth: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const testTableAccess = async () => {
    try {
      addLog('🔍 Test d\'accès à la table...');
      
      // Test 1: Vérifier que la table existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('evscatala_notes')
        .select('count(*)', { count: 'exact', head: true });
        
      if (tableError) {
        addLog(`❌ Erreur accès table: ${tableError.message} (Code: ${tableError.code})`);
        return;
      }
      
      addLog(`✅ Table accessible, ${tableCheck?.length || 0} notes existantes`);
      
      // Test 2: Essayer de lire les notes existantes
      const { data: notes, error: readError } = await supabase
        .from('evscatala_notes')
        .select('*')
        .limit(5);
        
      if (readError) {
        addLog(`❌ Erreur lecture: ${readError.message} (Code: ${readError.code})`);
      } else {
        addLog(`✅ Lecture réussie: ${notes?.length || 0} notes lues`);
      }
      
    } catch (error) {
      addLog(`❌ Erreur test table: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const testDirectInsert = async () => {
    try {
      addLog('🔍 Test d\'insertion directe...');
      setIsLoading(true);
      
      const user = await authService.getCurrentUser();
      if (!user) {
        addLog('❌ Pas d\'utilisateur connecté');
        return;
      }
      
      const testNote = {
        content: testContent + ' - ' + new Date().toISOString(),
        title: 'Note de test debug',
        author_id: user.id,
        context_type: 'free' as const,
        status: 'draft' as const,
        tags: ['test', 'debug'],
        shared_with: [],
        is_private: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      addLog(`📝 Tentative d'insertion: ${JSON.stringify(testNote, null, 2)}`);
      
      const { data: insertedNote, error: insertError } = await supabase
        .from('evscatala_notes')
        .insert(testNote)
        .select('*')
        .single();
        
      if (insertError) {
        addLog(`❌ Erreur insertion: ${insertError.message} (Code: ${insertError.code})`);
        addLog(`📋 Détails erreur: ${JSON.stringify(insertError, null, 2)}`);
      } else {
        addLog(`✅ Insertion réussie: ${insertedNote.id}`);
        addLog(`📋 Note créée: ${JSON.stringify(insertedNote, null, 2)}`);
      }
      
    } catch (error) {
      addLog(`❌ Erreur test insertion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testServiceMethod = async () => {
    try {
      addLog('🔍 Test via notesService...');
      setIsLoading(true);
      
      const user = await authService.getCurrentUser();
      if (!user) {
        addLog('❌ Pas d\'utilisateur connecté');
        return;
      }
      
      const noteData = {
        content: testContent + ' - via service - ' + new Date().toISOString(),
        title: 'Note de test service',
        context_type: 'free' as const,
        status: 'draft' as const,
        tags: ['test', 'service'],
        is_private: false
      };
      
      addLog(`📝 Appel notesService.createNote...`);
      
      const createdNote = await notesService.createNote(noteData, user.id);
      
      addLog(`✅ Service réussi: ${createdNote.id}`);
      addLog(`📋 Note via service: ${JSON.stringify(createdNote, null, 2)}`);
      
    } catch (error) {
      addLog(`❌ Erreur service: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      if (error instanceof Error) {
        addLog(`📋 Stack trace: ${error.stack}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testNotesRetrieval = async () => {
    try {
      addLog('🔍 Test de récupération des notes...');
      setIsLoading(true);
      
      addLog('📝 Appel notesService.getNotes()...');
      
      const notes = await notesService.getNotes();
      
      addLog(`✅ Récupération réussie: ${notes.length} notes trouvées`);
      
      if (notes.length > 0) {
        addLog(`📋 Première note: ${JSON.stringify(notes[0], null, 2)}`);
        
        // Compter les notes de test
        const testNotes = notes.filter(note => 
          note.tags.some(tag => ['test', 'debug', 'service'].includes(tag))
        );
        addLog(`🧪 Notes de test trouvées: ${testNotes.length}`);
      } else {
        addLog('⚠️ Aucune note trouvée - problème de récupération ?');
      }
      
    } catch (error) {
      addLog(`❌ Erreur récupération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      if (error instanceof Error) {
        addLog(`📋 Stack trace: ${error.stack}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    clearLogs();
    addLog('🚀 Début des tests de diagnostic...');
    
    await testAuthentication();
    await testTableAccess();
    await testDirectInsert();
    await testServiceMethod();
    await testNotesRetrieval();
    
    addLog('🏁 Tests terminés');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Debugger Notes - Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contenu de test :</label>
          <Textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            placeholder="Contenu de la note de test..."
            rows={3}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={testAuthentication} variant="outline" size="sm">
            Test Auth
          </Button>
          <Button onClick={testTableAccess} variant="outline" size="sm">
            Test Table
          </Button>
          <Button onClick={testDirectInsert} variant="outline" size="sm" disabled={isLoading}>
            Test Insert Direct
          </Button>
          <Button onClick={testServiceMethod} variant="outline" size="sm" disabled={isLoading}>
            Test Service
          </Button>
          <Button onClick={testNotesRetrieval} variant="outline" size="sm" disabled={isLoading}>
            Test Récupération
          </Button>
          <Button onClick={runAllTests} disabled={isLoading}>
            Tous les tests
          </Button>
          <Button onClick={clearLogs} variant="ghost" size="sm">
            Effacer logs
          </Button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <div className="text-gray-400 mb-2">Console de debug :</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">Aucun log pour le moment...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 