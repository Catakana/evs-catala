-- Migration pour ajouter les tables liées à la messagerie
-- Préfixe: evscatala_ conformément à la convention

-- Table des conversations
CREATE TABLE IF NOT EXISTS evscatala_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('private', 'group')),
  title TEXT, -- Optionnel pour les conversations privées
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_id UUID, -- Référence après création de la table messages
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_evscatala_conversations_type ON evscatala_conversations(type);
CREATE INDEX IF NOT EXISTS idx_evscatala_conversations_created_by ON evscatala_conversations(created_by);

-- Table des participants aux conversations
CREATE TABLE IF NOT EXISTS evscatala_conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES evscatala_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_conversation_participants_conversation_id ON evscatala_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_conversation_participants_user_id ON evscatala_conversation_participants(user_id);

-- Table des messages
CREATE TABLE IF NOT EXISTS evscatala_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES evscatala_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  is_reported BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_messages_conversation_id ON evscatala_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_messages_sender_id ON evscatala_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_evscatala_messages_created_at ON evscatala_messages(created_at);

-- Table des pièces jointes aux messages
CREATE TABLE IF NOT EXISTS evscatala_message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES evscatala_messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evscatala_message_attachments_message_id ON evscatala_message_attachments(message_id);

-- Mise à jour de la référence circulaire après création des tables
ALTER TABLE evscatala_conversations ADD CONSTRAINT fk_last_message_id FOREIGN KEY (last_message_id) REFERENCES evscatala_messages(id) ON DELETE SET NULL;

-- Politiques RLS pour les conversations
ALTER TABLE evscatala_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE evscatala_message_attachments ENABLE ROW LEVEL SECURITY;

-- Voir les conversations auxquelles l'utilisateur participe
CREATE POLICY "Voir ses conversations" ON evscatala_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversations.id 
      AND user_id = auth.uid()
    )
  );

-- Créer une conversation (tous les utilisateurs authentifiés)
CREATE POLICY "Créer une conversation" ON evscatala_conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Mettre à jour une conversation (admin de la conversation ou admin du système)
CREATE POLICY "Modifier une conversation" ON evscatala_conversations
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversations.id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Supprimer une conversation (admin de la conversation ou admin du système)
CREATE POLICY "Supprimer une conversation" ON evscatala_conversations
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversations.id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Voir les participants des conversations auxquelles on participe
CREATE POLICY "Voir les participants" ON evscatala_conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversation_participants.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Ajouter des participants (admin de la conversation ou admin du système)
CREATE POLICY "Ajouter des participants" ON evscatala_conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_conversations 
      WHERE id = conversation_id 
      AND created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversation_participants.conversation_id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Modifier ses propres informations de participant
CREATE POLICY "Modifier ses infos de participant" ON evscatala_conversation_participants
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversation_participants.conversation_id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Quitter une conversation (supprimer son propre participant)
CREATE POLICY "Quitter une conversation" ON evscatala_conversation_participants
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_conversation_participants.conversation_id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Voir les messages des conversations auxquelles on participe
CREATE POLICY "Voir les messages" ON evscatala_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Envoyer des messages dans les conversations auxquelles on participe
CREATE POLICY "Envoyer des messages" ON evscatala_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Modifier ses propres messages
CREATE POLICY "Modifier ses messages" ON evscatala_messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_messages.conversation_id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Supprimer ses propres messages
CREATE POLICY "Supprimer ses messages" ON evscatala_messages
  FOR DELETE USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM evscatala_conversation_participants 
      WHERE conversation_id = evscatala_messages.conversation_id 
      AND user_id = auth.uid()
      AND is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Voir les pièces jointes des messages dans les conversations auxquelles on participe
CREATE POLICY "Voir les pièces jointes" ON evscatala_message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM evscatala_messages
      JOIN evscatala_conversation_participants ON evscatala_messages.conversation_id = evscatala_conversation_participants.conversation_id
      WHERE evscatala_messages.id = evscatala_message_attachments.message_id
      AND evscatala_conversation_participants.user_id = auth.uid()
    )
  );

-- Ajouter des pièces jointes à ses propres messages
CREATE POLICY "Ajouter des pièces jointes" ON evscatala_message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM evscatala_messages
      WHERE id = message_id
      AND sender_id = auth.uid()
    )
  );

-- Supprimer ses propres pièces jointes
CREATE POLICY "Supprimer ses pièces jointes" ON evscatala_message_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM evscatala_messages
      WHERE id = message_id
      AND sender_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_messages
      JOIN evscatala_conversation_participants ON evscatala_messages.conversation_id = evscatala_conversation_participants.conversation_id
      WHERE evscatala_messages.id = evscatala_message_attachments.message_id
      AND evscatala_conversation_participants.user_id = auth.uid()
      AND evscatala_conversation_participants.is_admin = true
    ) OR
    EXISTS (
      SELECT 1 FROM evscatala_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  ); 