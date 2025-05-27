import React from 'react';
import { NotesDebugger } from '@/components/notes/NotesDebugger';

export default function NotesDebugPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔧 Debug Notes</h1>
        <p className="text-muted-foreground">
          Page de diagnostic pour tester le système de notes
        </p>
      </div>
      
      <NotesDebugger />
    </div>
  );
} 