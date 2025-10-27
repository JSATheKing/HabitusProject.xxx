/*
  # Create rooms and room_participants tables

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key, default: gen_random_uuid())
      - `name` (text, not null)
      - `challenge_id` (uuid, foreign key to challenges)
      - `max_participants` (integer, not null)
      - `price` (integer, not null, in cents)
      - `current_participants` (integer, default: 0)
      - `status` (text, default: 'open') - open, full, closed
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())

    - `room_participants`
      - `id` (uuid, primary key, default: gen_random_uuid())
      - `room_id` (uuid, foreign key to rooms, not null)
      - `user_id` (uuid, foreign key to auth.users, not null)
      - `joined_at` (timestamptz, default: now())
      - `status` (text, default: 'active') - active, completed, failed
      - `progress` (integer, default: 0)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and joining rooms
    - Add policies for viewing participant data

  3. Notes
    - Rooms can be associated with challenges
    - Tracks participant progress and status
*/

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  challenge_id uuid REFERENCES challenges ON DELETE SET NULL,
  max_participants integer NOT NULL,
  price integer NOT NULL DEFAULT 0,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view room participants"
  ON room_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join rooms"
  ON room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON room_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();