import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function DataLoadingDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test 1: Connexion Supabase
      console.log('🔍 [DIAGNOSTIC] Test connexion Supabase...');
      const { data: authData, error: authError } = await supabase.auth.getSession();
      results.auth = {
        success: !authError,
        hasSession: !!authData?.session,
        error: authError?.message
      };

      // Test 2: Accès aux tables
      console.log('🔍 [DIAGNOSTIC] Test accès aux tables...');
      
      // Test table profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('evscatala_profiles')
        .select('id')
        .limit(1);
      
      results.tables = {
        profiles: {
          success: !profilesError,
          error: profilesError?.message,
          code: profilesError?.code,
          hasData: profilesData && profilesData.length > 0
        }
      };

      // Test table events
      const { data: eventsData, error: eventsError } = await supabase
        .from('evscatala_events')
        .select('id')
        .limit(1);
      
      results.tables.events = {
        success: !eventsError,
        error: eventsError?.message,
        code: eventsError?.code,
        hasData: eventsData && eventsData.length > 0
      };

      // Test table notes
      const { data: notesData, error: notesError } = await supabase
        .from('evscatala_notes')
        .select('id')
        .limit(1);
      
      results.tables.notes = {
        success: !notesError,
        error: notesError?.message,
        code: notesError?.code,
        hasData: notesData && notesData.length > 0
      };

      // Test 3: Politiques RLS
      console.log('🔍 [DIAGNOSTIC] Test politiques RLS...');
      
      // Essayer de lire des données réelles
      const { data: realEventsData, error: realEventsError } = await supabase
        .from('evscatala_events')
        .select('*')
        .limit(1);
      
      results.rls = {
        events: {
          success: !realEventsError,
          error: realEventsError?.message,
          code: realEventsError?.code,
          dataCount: realEventsData?.length || 0
        }
      };

      const { data: realNotesData, error: realNotesError } = await supabase
        .from('evscatala_notes')
        .select('*')
        .limit(1);
      
      results.rls.notes = {
        success: !realNotesError,
        error: realNotesError?.message,
        code: realNotesError?.code,
        dataCount: realNotesData?.length || 0
      };

    } catch (error) {
      results.globalError = {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      };
    }

    results.timestamp = new Date().toISOString();
    setDiagnostics(results);
    setIsLoading(false);
    
    console.log('🔍 [DIAGNOSTIC] Résultats complets:', results);
  };

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';
  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';

  if (isLoading) {
    return (
      <Card className="border-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span>Diagnostic en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔍 Diagnostic de chargement des données
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            Relancer
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Authentification */}
        <div>
          <div className={`font-medium ${getStatusColor(diagnostics.auth?.success)}`}>
            {getStatusIcon(diagnostics.auth?.success)} Authentification
          </div>
          {diagnostics.auth?.error && (
            <div className="text-red-600 text-xs ml-4">
              Erreur: {diagnostics.auth.error}
            </div>
          )}
          <div className="text-xs ml-4 text-gray-600">
            Session: {diagnostics.auth?.hasSession ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Tables */}
        <div>
          <div className="font-medium">📊 Accès aux tables</div>
          {Object.entries(diagnostics.tables || {}).map(([tableName, tableInfo]: [string, any]) => (
            <div key={tableName} className="ml-4">
              <div className={`${getStatusColor(tableInfo.success)}`}>
                {getStatusIcon(tableInfo.success)} {tableName} {tableInfo.hasData ? '(contient des données)' : '(vide)'}
              </div>
              {tableInfo.error && (
                <div className="text-red-600 text-xs ml-4">
                  {tableInfo.code && `[${tableInfo.code}] `}{tableInfo.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Politiques RLS */}
        <div>
          <div className="font-medium">🔒 Politiques RLS (lecture des données)</div>
          {Object.entries(diagnostics.rls || {}).map(([tableName, rlsInfo]: [string, any]) => (
            <div key={tableName} className="ml-4">
              <div className={`${getStatusColor(rlsInfo.success)}`}>
                {getStatusIcon(rlsInfo.success)} {tableName} ({rlsInfo.dataCount} éléments)
              </div>
              {rlsInfo.error && (
                <div className="text-red-600 text-xs ml-4">
                  {rlsInfo.code && `[${rlsInfo.code}] `}{rlsInfo.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Erreur globale */}
        {diagnostics.globalError && (
          <div className="bg-red-50 p-2 rounded border border-red-200">
            <div className="text-red-600 font-medium">Erreur globale:</div>
            <div className="text-red-600 text-xs">{diagnostics.globalError.message}</div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          Diagnostic effectué le {new Date(diagnostics.timestamp).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
} 