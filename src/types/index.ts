export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venues: Venue[];
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  eventId: string;
}

export interface Participant {
  id: string;
  participant_id: string; // Custom participant ID
  name: string; // Participant Name
  email: string;
  phone: string;
  department: string; // Name of the Department
  year_of_studying: string; // Year of Studying
  college_university: string; // College / University Name
  city_district: string; // City / District
  qr_code?: string; // QR Code image based on participant ID
  registration_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  participantId: string;
  eventId: string;
  venueId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late';
}

export interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalVenues: number;
  totalAttendance: number;
  recentEvents: Event[];
  attendanceRate: number;
}

export interface UserRole {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'viewer';
  accessibleVenues: string[]; // Array of venue IDs
  permissions: {
    canCreateEvents: boolean;
    canManageParticipants: boolean;
    canTakeAttendance: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
  };
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}