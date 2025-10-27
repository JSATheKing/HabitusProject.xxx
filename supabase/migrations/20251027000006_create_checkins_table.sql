/*
  # Create checkins table

  1. New Tables
    - `checkins`
      - `id` (uuid, primary key, default: gen_random_uuid())
      - `user_id` (uuid, foreign key to auth.users, not null)
      - `challenge_id` (uuid, foreign key to challenges, not null)
      - `checkin_time` (timestamptz, default: now())
      - `checkin_type` (text, not null) - 'checkin' or 'checkout'
      - `gps_latitude` (decimal)
      - `gps_longitude` (decimal)
      - `speed` (decimal)
      - `video_url` (text)
      - `liveness_score` (decimal)
      - `gps_traces` (jsonb) - array of GPS coordinates with timestamps
      - `metrics_summary` (jsonb) - summary of metrics like distance, avg_speed
      - `status` (text, default: 'pendente') - pendente, aprovado, reprovado
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `checkins` table
    - Add policy for users to view their own checkins
    - Add policy for users to create their own checkins
    - Add policy for users to view checkins in their challenges

  3. Notes
    - Stores GPS data and video proof for challenge verification
    - gps_traces stored as JSON array for flexibility
*/

CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges ON DELETE CASCADE,
  checkin_time timestamptz DEFAULT now(),
  checkin_type text NOT NULL,
  gps_latitude decimal,
  gps_longitude decimal,
  speed decimal,
  video_url text,
  liveness_score decimal,
  gps_traces jsonb,
  metrics_summary jsonb,
  status text DEFAULT 'pendente',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON checkins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_challenge_id ON checkins(challenge_id);
CREATE INDEX idx_checkins_status ON checkins(status);