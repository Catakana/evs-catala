import React, { useState } from 'react';
import { PenTool, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickNoteModal } from './QuickNoteModal';

interface QuickNoteButtonProps {
  className?: string;
}

export function QuickNoteButton({ className }: QuickNoteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 ${className}`}
        size="icon"
        title="Nouvelle note rapide"
      >
        <PenTool className="h-6 w-6" />
      </Button>

      {/* Modal de création de note */}
      <QuickNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNoteSaved={() => {
          setIsModalOpen(false);
          // Optionnel : déclencher un refresh des notes
        }}
      />
    </>
  );
}

// Version pour la navbar (plus discrète)
export function QuickNoteNavButton({ className }: QuickNoteButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="ghost"
        size="sm"
        className={`gap-2 ${className}`}
        title="Nouvelle note rapide"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Note</span>
      </Button>

      <QuickNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNoteSaved={() => setIsModalOpen(false)}
      />
    </>
  );
} 