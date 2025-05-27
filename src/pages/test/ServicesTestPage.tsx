import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { announcementService } from '../../lib/announcementService';
import { eventService } from '../../lib/eventService';
import { projectService } from '../../lib/projectService';
import { voteService } from '../../lib/voteService';

const ServicesTestPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testService = async (serviceName: string, testFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [serviceName]: true }));
    try {
      console.log(`🧪 Test ${serviceName}...`);
      const result = await testFunction();
      console.log(`✅ ${serviceName} réussi:`, result);
      setResults(prev => ({ 
        ...prev, 
        [serviceName]: { 
          success: true, 
          data: result,
          count: Array.isArray(result) ? result.length : 1
        } 
      }));
    } catch (error) {
      console.error(`❌ ${serviceName} échoué:`, error);
      setResults(prev => ({ 
        ...prev, 
        [serviceName]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const testAllServices = async () => {
    await Promise.all([
      testService('announcements', () => announcementService.getAnnouncements()),
      testService('events', () => eventService.getEvents()),
      testService('projects', () => projectService.getProjects()),
      testService('votes', () => voteService.getActiveVotes()),
    ]);
  };

  useEffect(() => {
    testAllServices();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test des Services</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['announcements', 'events', 'projects', 'votes'].map(service => (
          <Card key={service}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {service.charAt(0).toUpperCase() + service.slice(1)}
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (service === 'announcements') testService(service, () => announcementService.getAnnouncements());
                    if (service === 'events') testService(service, () => eventService.getEvents());
                    if (service === 'projects') testService(service, () => projectService.getProjects());
                    if (service === 'votes') testService(service, () => voteService.getActiveVotes());
                  }}
                  disabled={loading[service]}
                >
                  {loading[service] ? 'Test...' : 'Tester'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading[service] && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Test en cours...</span>
                </div>
              )}
              
              {results[service] && !loading[service] && (
                <div>
                  {results[service].success ? (
                    <div className="text-green-600">
                      <p>✅ Succès</p>
                      <p>Nombre d'éléments: {results[service].count}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer">Voir les données</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(results[service].data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <p>❌ Échec</p>
                      <p>Erreur: {results[service].error}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6">
        <Button onClick={testAllServices} className="w-full">
          Tester tous les services
        </Button>
      </div>
    </div>
  );
};

export default ServicesTestPage; 