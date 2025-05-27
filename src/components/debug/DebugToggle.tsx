import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function DebugToggle() {
  const debugEnabled = import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true' || import.meta.env.DEV;
  const isDev = import.meta.env.DEV;
  
  return (
    <Card className="border-gray-300 bg-gray-50">
      <CardContent className="p-3">
        <div className="text-sm space-y-1">
          <div className="font-medium text-gray-700">
            🔧 Outils de debug
          </div>
          <div className="text-xs text-gray-600">
            <div>Mode: {isDev ? 'Développement' : 'Production'}</div>
            <div>Status: {debugEnabled ? '✅ Activés' : '❌ Masqués'}</div>
            {!isDev && (
              <div className="mt-2 text-gray-500">
                Pour activer en production, définir :<br/>
                <code className="bg-gray-200 px-1 rounded">VITE_ENABLE_DEBUG_TOOLS=true</code>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 