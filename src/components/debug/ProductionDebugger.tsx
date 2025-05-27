import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductionDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Collecter les informations de debug
    const info = {
      environment: {
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
        PROD: import.meta.env.PROD,
        DEV: import.meta.env.DEV,
      },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie',
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      },
      location: {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        origin: window.location.origin,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    
    setDebugInfo(info);
    
    // Log automatique en production
    if (import.meta.env.PROD) {
      console.log('🔧 [PROD DEBUG] Informations de debug:', info);
    }
  }, []);

  // Afficher seulement en développement ou si explicitement demandé
  if (!import.meta.env.DEV && !isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          🔧 Debug Prod
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-gray-900 text-green-400 border-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between items-center">
            🔧 Debug Production
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Environnement:</strong>
            <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
              {JSON.stringify(debugInfo.environment, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Supabase:</strong>
            <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
              {JSON.stringify(debugInfo.supabase, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Location:</strong>
            <pre className="text-xs bg-gray-800 p-1 rounded mt-1">
              {JSON.stringify(debugInfo.location, null, 2)}
            </pre>
          </div>
          
          <Button
            onClick={() => {
              console.log('🔧 [PROD DEBUG] Informations complètes:', debugInfo);
              alert('Informations loggées dans la console');
            }}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            Log Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 