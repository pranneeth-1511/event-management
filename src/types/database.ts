export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string;
          name: string;
          role: 'admin' | 'staff' | 'viewer';
          accessible_venues: string[];
          permissions: {
            canManageUsers: boolean;
            canViewReports: boolean;
            canCreateEvents: boolean;
            canTakeAttendance: boolean;
            canManageParticipants: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email: string;
          name: string;
          role?: 'admin' | 'staff' | 'viewer';
          accessible_venues?: string[];
          permissions?: {
            canManageUsers: boolean;
            canViewReports: boolean;
            canCreateEvents: boolean;
            canTakeAttendance: boolean;
            canManageParticipants: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'staff' | 'viewer';
          accessible_venues?: string[];
          permissions?: {
            canManageUsers: boolean;
            canViewReports: boolean;
            canCreateEvents: boolean;
            canTakeAttendance: boolean;
            canManageParticipants: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          location: string;
          capacity: number;
          event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          capacity: number;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          capacity?: number;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          participant_id: string;
          name: string;
          email: string;
          phone: string | null;
          department: string | null;
          year_of_studying: string | null;
          college_university: string | null;
          city_district: string | null;
          qr_code: string | null;
          registration_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          name: string;
          email: string;
          phone?: string | null;
          department?: string | null;
          year_of_studying?: string | null;
          college_university?: string | null;
          city_district?: string | null;
          qr_code?: string | null;
          registration_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          department?: string | null;
          year_of_studying?: string | null;
          college_university?: string | null;
          city_district?: string | null;
          qr_code?: string | null;
          registration_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          participant_id: string | null;
          event_id: string | null;
          venue_id: string | null;
          check_in_time: string | null;
          check_out_time: string | null;
          status: 'present' | 'absent' | 'late';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id?: string | null;
          event_id?: string | null;
          venue_id?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
          status?: 'present' | 'absent' | 'late';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string | null;
          event_id?: string | null;
          venue_id?: string | null;
          check_in_time?: string | null;
          check_out_time?: string | null;
          status?: 'present' | 'absent' | 'late';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}