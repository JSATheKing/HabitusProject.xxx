/*
  # Create challenges table

  1. New Tables
    - `challenges`
      - `id` (uuid, primary key, default: gen_random_uuid())
      - `title` (text, not null)
      - `description` (text)
      - `type` (text, not null) - caminhada, ciclismo, flexoes, abdominais, academia
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, not null)
      - `registration_end` (timestamptz, not null)
      - `reward_amount` (integer, not null, in cents)
      - `entry_value` (integer, not null, in cents)
      - `vacancies` (integer, not null)
      - `participants_count` (integer, default: 0)
      - `rules` (jsonb) - stores challenge rules like days, distance, reps, time, window
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `challenges` table
    - Add policy for anyone to view challenges
    - Add policy for authenticated users to create challenges (can be restricted later)

  3. Notes
    - reward_amount and entry_value stored in cents for precision
    - rules stored as JSON for flexibility
*/

CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  registration_end timestamptz NOT NULL,
  reward_amount integer NOT NULL DEFAULT 0,
  entry_value integer NOT NULL DEFAULT 0,
  vacancies integer NOT NULL DEFAULT 0,
  participants_count integer DEFAULT 0,
  rules jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create challenges"
  ON challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();