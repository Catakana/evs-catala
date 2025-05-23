-- Migration pour les tables de permanences
-- Ce script crée les tables nécessaires pour la gestion des permanences

-- Table des permanences
CREATE TABLE IF NOT EXISTS evscatala_permanences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    required_volunteers INTEGER NOT NULL DEFAULT 1,
    max_volunteers INTEGER NOT NULL DEFAULT 5,
    min_volunteers INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances des requêtes par date
CREATE INDEX IF NOT EXISTS idx_permanences_date ON evscatala_permanences(date);

-- Table des participants aux permanences
CREATE TABLE IF NOT EXISTS evscatala_permanence_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permanence_id UUID REFERENCES evscatala_permanences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'registered',
    checked_by UUID REFERENCES auth.users(id),
    check_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Contrainte pour éviter les inscriptions multiples
    UNIQUE(permanence_id, user_id)
);

-- Index pour améliorer les performances des requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_permanence_participants_user ON evscatala_permanence_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_permanence_participants_permanence ON evscatala_permanence_participants(permanence_id);

-- Fonction pour mettre à jour le timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le champ 'updated_at'
DROP TRIGGER IF EXISTS update_permanences_updated_at ON evscatala_permanences;
CREATE TRIGGER update_permanences_updated_at
BEFORE UPDATE ON evscatala_permanences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Fonction pour gérer le statut de la permanence en fonction du nombre d'inscrits
CREATE OR REPLACE FUNCTION update_permanence_status()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    permanence_record RECORD;
BEGIN
    -- Calculer le nombre actuel de participants
    SELECT COUNT(*) INTO current_count FROM evscatala_permanence_participants
    WHERE permanence_id = COALESCE(NEW.permanence_id, OLD.permanence_id);
    
    -- Récupérer les informations de la permanence
    SELECT * INTO permanence_record FROM evscatala_permanences
    WHERE id = COALESCE(NEW.permanence_id, OLD.permanence_id);
    
    -- Mettre à jour le statut en fonction du nombre de participants
    IF TG_OP = 'DELETE' OR current_count < permanence_record.required_volunteers THEN
        -- Si le nombre est inférieur au minimum requis, marquer comme 'open'
        UPDATE evscatala_permanences
        SET status = 'open'
        WHERE id = COALESCE(NEW.permanence_id, OLD.permanence_id)
          AND status <> 'canceled' AND status <> 'completed';
    ELSIF current_count >= permanence_record.max_volunteers THEN
        -- Si le nombre atteint le maximum, marquer comme 'full'
        UPDATE evscatala_permanences
        SET status = 'full'
        WHERE id = COALESCE(NEW.permanence_id, OLD.permanence_id)
          AND status <> 'canceled' AND status <> 'completed';
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour le statut de la permanence
DROP TRIGGER IF EXISTS after_insert_permanence_participant ON evscatala_permanence_participants;
CREATE TRIGGER after_insert_permanence_participant
AFTER INSERT ON evscatala_permanence_participants
FOR EACH ROW
EXECUTE FUNCTION update_permanence_status();

DROP TRIGGER IF EXISTS after_delete_permanence_participant ON evscatala_permanence_participants;
CREATE TRIGGER after_delete_permanence_participant
AFTER DELETE ON evscatala_permanence_participants
FOR EACH ROW
EXECUTE FUNCTION update_permanence_status();

-- Sécurité RLS: Politiques pour la table des permanences
ALTER TABLE evscatala_permanences ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les permanences (mais pas les modifier)
CREATE POLICY permanences_view_policy ON evscatala_permanences
    FOR SELECT USING (true);

-- Seuls les créateurs et les administrateurs peuvent modifier/supprimer
CREATE POLICY permanences_update_policy ON evscatala_permanences
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

CREATE POLICY permanences_delete_policy ON evscatala_permanences
    FOR DELETE USING (
        auth.uid() = created_by OR 
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

-- Les utilisateurs avec le rôle staff ou admin peuvent créer des permanences
CREATE POLICY permanences_insert_policy ON evscatala_permanences
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE auth.jwt() ->> 'user_role' IN ('staff', 'admin')
        )
    );

-- Sécurité RLS: Politiques pour la table des participants
ALTER TABLE evscatala_permanence_participants ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les participants
CREATE POLICY permanence_participants_view_policy ON evscatala_permanence_participants
    FOR SELECT USING (true);

-- Les utilisateurs peuvent s'inscrire eux-mêmes
CREATE POLICY permanence_participants_insert_policy ON evscatala_permanence_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent seulement se désinscrire eux-mêmes
CREATE POLICY permanence_participants_delete_policy ON evscatala_permanence_participants
    FOR DELETE USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE auth.jwt() ->> 'user_role' IN ('staff', 'admin')
        )
    );

-- Insertions de test pour les permanences (optionnel, à décommenter si nécessaire)
/*
INSERT INTO evscatala_permanences (title, description, date, start_time, end_time, location, required_volunteers, max_volunteers, created_by)
VALUES
    ('Permanence Lundi', 'Ouverture du local', CURRENT_DATE + INTERVAL '7 days', '14:00:00', '18:00:00', 'Local associatif', 2, 4, (SELECT id FROM auth.users LIMIT 1)),
    ('Permanence Mercredi', 'Accueil et information', CURRENT_DATE + INTERVAL '9 days', '10:00:00', '13:00:00', 'Local associatif', 1, 3, (SELECT id FROM auth.users LIMIT 1)),
    ('Permanence Vendredi', 'Activités ludiques', CURRENT_DATE + INTERVAL '11 days', '16:00:00', '20:00:00', 'Local associatif', 3, 6, (SELECT id FROM auth.users LIMIT 1));
*/ 