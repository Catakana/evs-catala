// Composant VotesModuleCard - Carte du module votes pour la page d'accueil
// Architecture simplifiée pour éviter les problèmes de performance

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Vote, TrendingUp, Users, Clock } from 'lucide-react';
import { useActiveVotes } from '../../hooks/useVote';

export function VotesModuleCard() {
  const { activeVotes, loading } = useActiveVotes();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-blue-600" />
          Votes et Sondages
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : activeVotes.length}
              </div>
              <div className="text-xs text-muted-foreground">Votes actifs</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : activeVotes.filter(vote => {
                  const now = new Date();
                  const endDate = new Date(vote.end_date);
                  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return daysLeft <= 3 && daysLeft > 0;
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">Se terminent bientôt</div>
            </div>
          </div>

          {/* Votes en cours */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : activeVotes.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Votes en cours :</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activeVotes.slice(0, 3).map((vote) => {
                  const now = new Date();
                  const endDate = new Date(vote.end_date);
                  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={vote.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{vote.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` : 'Se termine aujourd\'hui'}
                          </span>
                        </div>
                      </div>
                      
                      {daysLeft <= 1 && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  );
                })}
                
                {activeVotes.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{activeVotes.length - 3} autre{activeVotes.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Vote className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">Aucun vote actif</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Link to="/votes" className="block">
              <Button variant="outline" className="w-full">
                Voir tous les votes
              </Button>
            </Link>
            
            {activeVotes.length > 0 && (
              <div className="text-center">
                <Link 
                  to={`/votes/${activeVotes[0].id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Participer maintenant →
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 