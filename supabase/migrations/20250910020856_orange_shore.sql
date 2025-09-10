/*
  # Complete Event Attendance Management System Schema

  1. New Tables
    - `users` - User management with Clerk integration
    - `events` - Event management
    - `venues` - Venue management linked to events
    - `participants` - Participant registration
    - `attendance_records` - Attendance tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Features
    - Automatic timestamps
    - UUID primary keys
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table (integrated with Clerk)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'staff', 'viewer')),
  accessible_venues text[] DEFAULT '{}',
  permissions jsonb DEFAULT '{
    "canManageUsers": false,
    "canViewReports": true,
    "canCreateEvents": false,
    "canTakeAttendance": false,
    "canManageParticipants": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  year_of_studying text,
  college_university text,
  city_district text,
  qr_code text,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES venues(id) ON DELETE CASCADE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_venues_event_id ON venues(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_participant_id ON participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_attendance_participant_id ON attendance_records(participant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_venue_id ON attendance_records(venue_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (clerk_id = auth.jwt() ->> 'sub');

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role = 'admin'
    )
  );

-- RLS Policies for events table
CREATE POLICY "Authenticated users can read events" ON events
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users with permission can manage events" ON events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND (role = 'admin' OR (permissions->>'canCreateEvents')::boolean = true)
    )
  );

-- RLS Policies for venues table
CREATE POLICY "Authenticated users can read venues" ON venues
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users with permission can manage venues" ON venues
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND (role = 'admin' OR (permissions->>'canCreateEvents')::boolean = true)
    )
  );

-- RLS Policies for participants table
CREATE POLICY "Authenticated users can read participants" ON participants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users with permission can manage participants" ON participants
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND (role = 'admin' OR (permissions->>'canManageParticipants')::boolean = true)
    )
  );

-- RLS Policies for attendance_records table
CREATE POLICY "Authenticated users can read attendance records" ON attendance_records
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users with permission can manage attendance" ON attendance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND (role = 'admin' OR (permissions->>'canTakeAttendance')::boolean = true)
    )
  );

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();