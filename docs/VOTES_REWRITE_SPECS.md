# Spécifications techniques - Module Votes (Réécriture)

## 🎯 Objectifs de la réécriture

### Problèmes identifiés dans l'ancienne version
- **Boucles infinies** : Appels répétés à `getAllVotes()` causés par des dépendances instables
- **Erreurs 500** : Jointures complexes avec Supabase causant des erreurs de relations
- **Performance** : Requêtes `count()` et jointures multiples ralentissant l'application
- **Complexité** : Architecture trop complexe pour des besoins simples

### Principes de la nouvelle architecture
- **Simplicité** : Requêtes SQL simples, pas de jointures
- **Robustesse** : Gestion d'erreur systématique, récupération gracieuse
- **Performance** : Chargement rapide, pas de boucles infinies
- **Maintenabilité** : Code clair, patterns cohérents

## 📊 Structure de base de données

### Tables (préfixe `evscatala_votes_v2`)

```sql
-- Table principale des votes
CREATE TABLE evscatala_votes_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('yes_no', 'single_choice', 'multiple_choice')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  show_results_mode TEXT NOT NULL DEFAULT 'after_vote' CHECK (show_results_mode IN ('immediate', 'after_vote', 'after_close')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options de vote (pour choix multiples)
CREATE TABLE evscatala_vote_options_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES evscatala_votes_v2(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réponses des utilisateurs
CREATE TABLE evscatala_vote_responses_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES evscatala_votes_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_options JSONB NOT NULL, -- Array des IDs d'options sélectionnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vote_id, user_id) -- Un seul vote par utilisateur
);

-- Index pour les performances
CREATE INDEX idx_votes_v2_status ON evscatala_votes_v2(status);
CREATE INDEX idx_votes_v2_dates ON evscatala_votes_v2(start_date, end_date);
CREATE INDEX idx_vote_options_v2_vote_id ON evscatala_vote_options_v2(vote_id);
CREATE INDEX idx_vote_responses_v2_vote_id ON evscatala_vote_responses_v2(vote_id);
CREATE INDEX idx_vote_responses_v2_user_id ON evscatala_vote_responses_v2(user_id);
```

### Politiques RLS (Row Level Security)

```sql
-- Votes : lecture pour tous, création pour staff+
ALTER TABLE evscatala_votes_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des votes" ON evscatala_votes_v2
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Création de votes" ON evscatala_votes_v2
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Options : lecture pour tous, création pour le créateur du vote
ALTER TABLE evscatala_vote_options_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des options" ON evscatala_vote_options_v2
  FOR SELECT TO authenticated USING (true);

-- Réponses : lecture pour tous, création pour soi-même
ALTER TABLE evscatala_vote_responses_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture des réponses" ON evscatala_vote_responses_v2
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Création de réponses" ON evscatala_vote_responses_v2
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);
```

## 🔧 Architecture du service

### Service principal (`src/lib/voteService.ts`)

```typescript
interface Vote {
  id: string;
  title: string;
  description?: string;
  type: 'yes_no' | 'single_choice' | 'multiple_choice';
  status: 'draft' | 'active' | 'closed' | 'archived';
  start_date: string;
  end_date: string;
  show_results_mode: 'immediate' | 'after_vote' | 'after_close';
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface VoteOption {
  id: string;
  vote_id: string;
  option_text: string;
  display_order: number;
}

interface VoteResponse {
  id: string;
  vote_id: string;
  user_id: string;
  selected_options: string[]; // Array des IDs d'options
  created_at: string;
  updated_at: string;
}

class VoteService {
  // ===== VOTES =====
  
  async getVotes(): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('evscatala_votes_v2')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
  
  async getVote(id: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('evscatala_votes_v2')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async createVote(vote: Omit<Vote, 'id' | 'created_at' | 'updated_at'>): Promise<Vote> {
    const { data, error } = await supabase
      .from('evscatala_votes_v2')
      .insert(vote)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // ===== OPTIONS =====
  
  async getVoteOptions(voteId: string): Promise<VoteOption[]> {
    const { data, error } = await supabase
      .from('evscatala_vote_options_v2')
      .select('*')
      .eq('vote_id', voteId)
      .order('display_order');
    
    if (error) throw error;
    return data || [];
  }
  
  async createVoteOptions(voteId: string, options: string[]): Promise<VoteOption[]> {
    const optionsData = options.map((text, index) => ({
      vote_id: voteId,
      option_text: text,
      display_order: index
    }));
    
    const { data, error } = await supabase
      .from('evscatala_vote_options_v2')
      .insert(optionsData)
      .select();
    
    if (error) throw error;
    return data || [];
  }
  
  // ===== RÉPONSES =====
  
  async getVoteResponses(voteId: string): Promise<VoteResponse[]> {
    const { data, error } = await supabase
      .from('evscatala_vote_responses_v2')
      .select('*')
      .eq('vote_id', voteId);
    
    if (error) throw error;
    return data || [];
  }
  
  async getUserVoteResponse(voteId: string, userId: string): Promise<VoteResponse | null> {
    const { data, error } = await supabase
      .from('evscatala_vote_responses_v2')
      .select('*')
      .eq('vote_id', voteId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }
  
  async submitVote(voteId: string, userId: string, selectedOptions: string[]): Promise<VoteResponse> {
    const { data, error } = await supabase
      .from('evscatala_vote_responses_v2')
      .upsert({
        vote_id: voteId,
        user_id: userId,
        selected_options: selectedOptions,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // ===== ASSEMBLAGE CÔTÉ CLIENT =====
  
  async getVoteWithDetails(voteId: string): Promise<{
    vote: Vote;
    options: VoteOption[];
    responses: VoteResponse[];
    userResponse?: VoteResponse;
  }> {
    const [vote, options, responses] = await Promise.all([
      this.getVote(voteId),
      this.getVoteOptions(voteId),
      this.getVoteResponses(voteId)
    ]);
    
    if (!vote) throw new Error('Vote not found');
    
    // Récupérer la réponse de l'utilisateur actuel si connecté
    const user = await supabase.auth.getUser();
    let userResponse;
    if (user.data.user) {
      userResponse = await this.getUserVoteResponse(voteId, user.data.user.id);
    }
    
    return { vote, options, responses, userResponse };
  }
  
  // ===== STATISTIQUES (côté client) =====
  
  calculateResults(options: VoteOption[], responses: VoteResponse[]): {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
  }[] {
    const totalResponses = responses.length;
    
    return options.map(option => {
      const count = responses.filter(response => 
        response.selected_options.includes(option.id)
      ).length;
      
      const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
      
      return {
        optionId: option.id,
        optionText: option.option_text,
        count,
        percentage: Math.round(percentage * 100) / 100
      };
    });
  }
}

export const voteService = new VoteService();
```

## 🎨 Composants React

### Structure des composants

```
src/
├── pages/
│   ├── VotesPage.tsx          // Page principale avec liste
│   └── VoteDetailPage.tsx     // Page de détail d'un vote
├── components/votes/
│   ├── VoteCard.tsx           // Carte d'affichage d'un vote
│   ├── CreateVoteForm.tsx     // Formulaire de création
│   ├── VoteDetail.tsx         // Composant de vote
│   ├── VoteResults.tsx        // Affichage des résultats
│   └── VoteOptionsManager.tsx // Gestion des options
└── types/
    └── vote.ts                // Types TypeScript
```

### Gestion d'état avec hooks

```typescript
// Hook personnalisé pour gérer un vote
function useVote(voteId: string) {
  const [vote, setVote] = useState<Vote | null>(null);
  const [options, setOptions] = useState<VoteOption[]>([]);
  const [responses, setResponses] = useState<VoteResponse[]>([]);
  const [userResponse, setUserResponse] = useState<VoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadVote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await voteService.getVoteWithDetails(voteId);
      
      setVote(data.vote);
      setOptions(data.options);
      setResponses(data.responses);
      setUserResponse(data.userResponse || null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [voteId]);
  
  useEffect(() => {
    loadVote();
  }, [loadVote]);
  
  const submitVote = async (selectedOptions: string[]) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Non connecté');
      
      const response = await voteService.submitVote(voteId, user.data.user.id, selectedOptions);
      setUserResponse(response);
      
      // Recharger les réponses pour mettre à jour les statistiques
      const newResponses = await voteService.getVoteResponses(voteId);
      setResponses(newResponses);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du vote');
    }
  };
  
  return {
    vote,
    options,
    responses,
    userResponse,
    loading,
    error,
    submitVote,
    reload: loadVote
  };
}
```

## 🧪 Tests et validation

### Tests unitaires (Jest)

```typescript
describe('VoteService', () => {
  test('should create a vote', async () => {
    const vote = await voteService.createVote({
      title: 'Test Vote',
      description: 'Description test',
      type: 'yes_no',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      show_results_mode: 'after_vote',
      created_by: 'user-id'
    });
    
    expect(vote.id).toBeDefined();
    expect(vote.title).toBe('Test Vote');
  });
  
  test('should calculate results correctly', () => {
    const options = [
      { id: '1', option_text: 'Oui', vote_id: 'vote-1', display_order: 0 },
      { id: '2', option_text: 'Non', vote_id: 'vote-1', display_order: 1 }
    ];
    
    const responses = [
      { id: 'r1', vote_id: 'vote-1', user_id: 'u1', selected_options: ['1'] },
      { id: 'r2', vote_id: 'vote-1', user_id: 'u2', selected_options: ['1'] },
      { id: 'r3', vote_id: 'vote-1', user_id: 'u3', selected_options: ['2'] }
    ];
    
    const results = voteService.calculateResults(options, responses);
    
    expect(results[0].count).toBe(2);
    expect(results[0].percentage).toBe(66.67);
    expect(results[1].count).toBe(1);
    expect(results[1].percentage).toBe(33.33);
  });
});
```

### Tests d'intégration

```typescript
describe('Vote Integration', () => {
  test('complete vote flow', async () => {
    // 1. Créer un vote
    const vote = await voteService.createVote({...});
    
    // 2. Ajouter des options
    const options = await voteService.createVoteOptions(vote.id, ['Oui', 'Non']);
    
    // 3. Voter
    await voteService.submitVote(vote.id, 'user-id', [options[0].id]);
    
    // 4. Vérifier les résultats
    const details = await voteService.getVoteWithDetails(vote.id);
    expect(details.responses).toHaveLength(1);
  });
});
```

## 📚 Documentation utilisateur

### Guide de création d'un vote

1. **Accéder à la page Votes** : Menu Organisation > Votes
2. **Cliquer sur "Nouveau vote"**
3. **Remplir le formulaire** :
   - Titre du vote
   - Description (optionnelle)
   - Type : Oui/Non, Choix unique, Choix multiple
   - Options (pour choix unique/multiple)
   - Dates de début et fin
   - Visibilité des résultats
4. **Publier le vote**

### Guide de participation

1. **Voir les votes actifs** sur la page Votes
2. **Cliquer sur un vote** pour voir les détails
3. **Sélectionner une ou plusieurs options**
4. **Confirmer son vote**
5. **Voir les résultats** (selon la configuration)

## 🔒 Sécurité et permissions

### Niveaux d'accès

- **Invité** : Aucun accès aux votes
- **Membre** : Voir et participer aux votes actifs
- **Staff** : Créer et gérer ses propres votes
- **Admin** : Gérer tous les votes, supprimer, archiver

### Validation côté client et serveur

```typescript
// Validation côté client
const validateVote = (vote: Partial<Vote>): string[] => {
  const errors: string[] = [];
  
  if (!vote.title?.trim()) {
    errors.push('Le titre est obligatoire');
  }
  
  if (vote.start_date && vote.end_date && new Date(vote.start_date) >= new Date(vote.end_date)) {
    errors.push('La date de fin doit être après la date de début');
  }
  
  return errors;
};

// Validation côté serveur (politiques RLS)
// Déjà implémentée dans les politiques SQL
```

## 🚀 Déploiement et migration

### Script de migration

```sql
-- Migration depuis l'ancienne version (si nécessaire)
-- 1. Créer les nouvelles tables
-- 2. Migrer les données existantes
-- 3. Supprimer les anciennes tables

-- Ce script sera créé lors de l'implémentation
```

### Checklist de déploiement

- [ ] Tables créées en base de données
- [ ] Politiques RLS configurées
- [ ] Service testé avec données réelles
- [ ] Composants React fonctionnels
- [ ] Tests unitaires passants
- [ ] Tests d'intégration validés
- [ ] Documentation utilisateur mise à jour
- [ ] Navigation mise à jour
- [ ] Permissions testées pour chaque rôle 