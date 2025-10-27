/*
  # Create users profile table

  1. New Tables
    - `users_profile`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `state` (text)
      - `city` (text)
      - `phone` (text)
      - `nickname` (text)
      - `birth_date` (text)
      - `avatar_url` (text)
      - `plan` (text, default: 'Gratuito')
      - `xp` (integer, default: 0)
      - `saldo` (integer, default: 0, in cents)
      - `cpf_hash` (text)
      - `device_id` (text)
      - `kyc_status` (text, default: 'nao_iniciado')
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `users_profile` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to insert their own data

  3. Notes
    - Supabase Auth handles authentication, passwords are stored securely in auth.users
    - This table extends auth.users with additional profile information
*/

CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  name text,
  state text,
  city text,
  phone text,
  nickname text,
  birth_date text,
  avatar_url text,
  plan text DEFAULT 'Gratuito',
  xp integer DEFAULT 0,
  saldo integer DEFAULT 0,
  cpf_hash text,
  device_id text,
  kyc_status text DEFAULT 'nao_iniciado',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();