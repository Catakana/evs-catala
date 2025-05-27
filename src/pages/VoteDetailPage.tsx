// Page VoteDetailPage - Affichage détaillé d'un vote
// Architecture simplifiée pour éviter les boucles infinies

import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { VoteDetail } from '../components/votes/VoteDetail';

export function VoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID du vote manquant dans l'URL
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/votes')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux votes
        </Button>
      </div>

      {/* Contenu principal */}
      <VoteDetail voteId={id} />
    </div>
  );
} 