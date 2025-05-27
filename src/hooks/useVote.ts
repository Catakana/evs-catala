// Hook personnalisé pour gérer l'état des votes
// Architecture simplifiée pour éviter les boucles infinies

import { useState, useEffect, useCallback } from 'react';
import { voteService } from '../lib/voteService';
import { supabase } from '../lib/supabase';
import type { 
  Vote, 
  VoteOption, 
  VoteResponse, 
  VoteWithDetails, 
  VoteResult,
  VoteState 
} from '../types/vote';

// Hook pour gérer un vote spécifique
export function useVote(voteId: string) {
  const [vote, setVote] = useState<Vote | null>(null);
  const [options, setOptions] = useState<VoteOption[]>([]);
  const [responses, setResponses] = useState<VoteResponse[]>([]);
  const [userResponse, setUserResponse] = useState<VoteResponse | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadVote = useCallback(async () => {
    if (!voteId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await voteService.getVoteWithDetails(voteId);
      
      setVote(data.vote);
      setOptions(data.options);
      setResponses(data.responses);
      setUserResponse(data.userResponse || null);
      setResults(data.results || []);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Erreur lors du chargement du vote:', err);
    } finally {
      setLoading(false);
    }
  }, [voteId]);

  useEffect(() => {
    loadVote();
  }, [loadVote]);

  const submitVote = async (selectedOptions: string[]) => {
    try {
      setError(null);
      setSuccess(null);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('Vous devez être connecté pour voter');
      }
      
      const response = await voteService.submitVote(voteId, user.data.user.id, selectedOptions);
      setUserResponse(response);
      
      // Recharger les réponses pour mettre à jour les statistiques
      const newResponses = await voteService.getVoteResponses(voteId);
      setResponses(newResponses);
      
      // Recalculer les résultats
      const newResults = voteService.calculateResults(options, newResponses);
      setResults(newResults);
      
      setSuccess('Vote enregistré avec succès');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du vote';
      setError(message);
      console.error('Erreur lors de la soumission du vote:', err);
    }
  };

  return {
    vote,
    options,
    responses,
    userResponse,
    results,
    loading,
    error,
    success,
    submitVote,
    reload: loadVote
  };
}

// Hook pour gérer la liste des votes
export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await voteService.getVotes();
      setVotes(data);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des votes';
      setError(message);
      console.error('Erreur lors du chargement des votes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  return {
    votes,
    loading,
    error,
    reload: loadVotes
  };
}

// Hook pour gérer les votes actifs
export function useActiveVotes() {
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActiveVotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await voteService.getActiveVotes();
      setActiveVotes(data);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des votes actifs';
      setError(message);
      console.error('Erreur lors du chargement des votes actifs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveVotes();
  }, [loadActiveVotes]);

  return {
    activeVotes,
    loading,
    error,
    reload: loadActiveVotes
  };
}

// Hook pour gérer les permissions de vote
export function useVotePermissions() {
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          setPermissions({ canCreate: false, canEdit: false, canDelete: false });
          return;
        }
        
        const perms = await voteService.checkPermissions(user.data.user.id);
        setPermissions(perms);
        
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        setPermissions({ canCreate: false, canEdit: false, canDelete: false });
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, []);

  return { permissions, loading };
}

// Hook pour gérer l'état d'un formulaire de vote
export function useVoteForm() {
  const [state, setState] = useState<VoteState>({
    loading: false,
    error: null,
    success: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }));
  };

  const setSuccess = (success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }));
  };

  const clearMessages = () => {
    setState(prev => ({ ...prev, error: null, success: null }));
  };

  const handleAction = async (action: () => Promise<any>) => {
    try {
      setLoading(true);
      clearMessages();
      
      const result = await action();
      setSuccess('Action réussie');
      return result;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    handleAction
  };
} 