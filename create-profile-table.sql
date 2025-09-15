-- Script SQL à exécuter dans le dashboard Supabase
-- Va sur https://supabase.com/dashboard → ton projet → SQL Editor → New query

-- Créer la table profile
CREATE TABLE IF NOT EXISTS public.profile (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    photo_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profile
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.profile
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre l'insertion d'un nouveau profil
CREATE POLICY "Users can insert own profile" ON public.profile
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre à tous de voir les profils publics (optionnel)
CREATE POLICY "Anyone can view public profiles" ON public.profile
    FOR SELECT USING (true);


