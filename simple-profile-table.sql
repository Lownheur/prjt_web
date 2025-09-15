-- Version simplifiée pour créer la table profile
-- À exécuter dans SQL Editor de Supabase

-- Créer la table profile
CREATE TABLE public.profile (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Politique simple : les utilisateurs peuvent tout faire sur leur propre profil
CREATE POLICY "Users can manage own profile" ON public.profile
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politique pour voir les profils des autres (lecture seule)
CREATE POLICY "Users can view all profiles" ON public.profile
    FOR SELECT USING (true);


