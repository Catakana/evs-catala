-- Script de migration pour créer la table evscatala_profiles

-- Vérifier si la table existe déjà
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS "public"."evscatala_profiles" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,  -- Référence à l'id dans auth.users
    "email" text,
    "firstname" text,
    "lastname" text,
    "avatar_url" text,
    "role" text NOT NULL DEFAULT 'member',  -- member, staff, admin
    "status" text NOT NULL DEFAULT 'pending',  -- pending, active, inactive, banned
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "evscatala_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);

-- Créer un index sur user_id pour des requêtes plus rapides
CREATE INDEX IF NOT EXISTS "evscatala_profiles_user_id_idx" ON "public"."evscatala_profiles" ("user_id");

-- Créer un index sur email pour des recherches plus rapides
CREATE INDEX IF NOT EXISTS "evscatala_profiles_email_idx" ON "public"."evscatala_profiles" ("email");

-- Ajouter les commentaires sur la table et les colonnes
COMMENT ON TABLE "public"."evscatala_profiles" IS 'Profils des utilisateurs de EVS-Catala';
COMMENT ON COLUMN "public"."evscatala_profiles"."id" IS 'ID unique du profil';
COMMENT ON COLUMN "public"."evscatala_profiles"."user_id" IS 'Référence à l''ID auth.users';
COMMENT ON COLUMN "public"."evscatala_profiles"."email" IS 'Adresse email de l''utilisateur';
COMMENT ON COLUMN "public"."evscatala_profiles"."firstname" IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN "public"."evscatala_profiles"."lastname" IS 'Nom de famille de l''utilisateur';
COMMENT ON COLUMN "public"."evscatala_profiles"."avatar_url" IS 'URL de l''avatar de l''utilisateur';
COMMENT ON COLUMN "public"."evscatala_profiles"."role" IS 'Rôle de l''utilisateur: member, staff, admin';
COMMENT ON COLUMN "public"."evscatala_profiles"."status" IS 'Statut du compte: pending, active, inactive, banned';

-- Ajouter des fonctions RLS (Row Level Security) pour les autorisations

-- Activer RLS sur la table
ALTER TABLE "public"."evscatala_profiles" ENABLE ROW LEVEL SECURITY;

-- Règle: les utilisateurs peuvent voir tous les profils
CREATE POLICY "Tout le monde peut voir les profils" 
ON "public"."evscatala_profiles" 
FOR SELECT 
USING (true);

-- Règle: les utilisateurs peuvent uniquement modifier leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier uniquement leur propre profil" 
ON "public"."evscatala_profiles" 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Règle: seuls les administrateurs peuvent supprimer les profils
CREATE POLICY "Seuls les administrateurs peuvent supprimer les profils" 
ON "public"."evscatala_profiles" 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT p.user_id FROM "public"."evscatala_profiles" p 
    WHERE p.role = 'admin' AND p.user_id = auth.uid()
  )
);

-- Création du trigger pour synchroniser les mises à jour
-- Ce trigger s'assure que updated_at est mis à jour à chaque modification
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux mises à jour de evscatala_profiles
DROP TRIGGER IF EXISTS set_timestamp ON "public"."evscatala_profiles";
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "public"."evscatala_profiles"
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Trigger pour créer un profil automatiquement lors de la création d'un utilisateur dans auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.evscatala_profiles (user_id, email, firstname, lastname, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstname', 
    NEW.raw_user_meta_data->>'lastname',
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'pending')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ajouter le trigger aux nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user(); 