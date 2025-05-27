// Composant VoteResults - Affichage des résultats d'un vote
// Architecture simplifiée avec calculs côté client

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import type { Vote, VoteOption, VoteResult } from '../../types/vote';

interface VoteResultsProps {
  vote: Vote;
  options: VoteOption[];
  results: VoteResult[];
  totalResponses: number;
}

export function VoteResults({ vote, options, results, totalResponses }: VoteResultsProps) {
  const getMaxCount = () => {
    return Math.max(...results.map(r => r.count), 1);
  };

  const getWinningOptions = () => {
    const maxCount = Math.max(...results.map(r => r.count));
    return results.filter(r => r.count === maxCount && maxCount > 0);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const winningOptions = getWinningOptions();
  const maxCount = getMaxCount();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Résultats du vote
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalResponses} participant{totalResponses > 1 ? 's' : ''}</span>
          </div>
          
          {winningOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>
                {winningOptions.length === 1 ? 'Option gagnante' : 'Égalité'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {totalResponses === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun vote enregistré pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const isWinning = winningOptions.some(w => w.optionId === result.optionId);
              
              return (
                <div key={result.optionId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.optionText}</span>
                      {isWinning && totalResponses > 0 && (
                        <Badge variant="default" className="text-xs">
                          {winningOptions.length === 1 ? 'Gagnant' : 'Égalité'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{result.count}</span>
                      <span className="text-muted-foreground">
                        ({formatPercentage(result.percentage)})
                      </span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={result.percentage} 
                    className={`h-2 ${isWinning ? 'bg-green-100' : ''}`}
                  />
                </div>
              );
            })}
            
            {/* Statistiques supplémentaires */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalResponses}</div>
                  <div className="text-xs text-muted-foreground">Total votes</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {options.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Options</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(Math.max(...results.map(r => r.percentage)))}
                  </div>
                  <div className="text-xs text-muted-foreground">Score max</div>
                </div>
                
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {winningOptions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {winningOptions.length === 1 ? 'Gagnant' : 'Égalités'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analyse rapide */}
            {totalResponses > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Analyse</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {winningOptions.length === 1 && (
                    <p>
                      • L'option "{winningOptions[0].optionText}" arrive en tête avec {winningOptions[0].count} vote{winningOptions[0].count > 1 ? 's' : ''} 
                      ({formatPercentage(winningOptions[0].percentage)})
                    </p>
                  )}
                  
                  {winningOptions.length > 1 && (
                    <p>
                      • Égalité entre {winningOptions.length} options avec {winningOptions[0].count} vote{winningOptions[0].count > 1 ? 's' : ''} chacune
                    </p>
                  )}
                  
                  {vote.type === 'multiple_choice' && (
                    <p>
                      • Vote à choix multiples : les participants pouvaient sélectionner plusieurs options
                    </p>
                  )}
                  
                  {totalResponses < 5 && (
                    <p>
                      • Échantillon réduit : les résultats peuvent évoluer avec plus de participants
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 