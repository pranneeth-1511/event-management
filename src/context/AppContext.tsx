import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Event, Venue, Participant, AttendanceRecord } from '../types';
import { eventService, venueService, participantService, attendanceService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AppState {
  events: Event[];
  venues: Venue[];
  participants: Participant[];
  attendanceRecords: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_VENUES'; payload: Venue[] }
  | { type: 'ADD_VENUE'; payload: Venue }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'DELETE_VENUE'; payload: string }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'SET_ATTENDANCE'; payload: AttendanceRecord[] }
  | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'DELETE_ATTENDANCE'; payload: string };

const initialState: AppState = {
  events: [],
  venues: [],
  participants: [],
  attendanceRecords: [],
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    case 'SET_VENUES':
      return { ...state, venues: action.payload };
    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };
    case 'UPDATE_VENUE':
      return {
        ...state,
        venues: state.venues.map(venue =>
          venue.id === action.payload.id ? action.payload : venue
        ),
      };
    case 'DELETE_VENUE':
      return {
        ...state,
        venues: state.venues.filter(venue => venue.id !== action.payload),
      };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(participant =>
          participant.id === action.payload.id ? action.payload : participant
        ),
      };
    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload),
      };
    case 'SET_ATTENDANCE':
      return { ...state, attendanceRecords: action.payload };
    case 'ADD_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: [...state.attendanceRecords, action.payload],
      };
    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'DELETE_ATTENDANCE':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.filter(record => record.id !== action.payload),
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshData: () => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser, isLoading: authLoading } = useAuth();

  const refreshData = async () => {
    if (!currentUser || authLoading) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch all data in parallel
      const [events, venues, participants, attendance] = await Promise.all([
        eventService.getAllEvents(),
        venueService.getAllVenues(),
        participantService.getAllParticipants(),
        attendanceService.getAllAttendance(),
      ]);

      // Transform data to match frontend types
      const transformedEvents = events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        venues: event.venues || [],
        createdAt: event.created_at,
      }));

      const transformedParticipants = participants.map(p => ({
        id: p.id,
        participant_id: p.participant_id,
        name: p.name,
        email: p.email,
        phone: p.phone || '',
        department: p.department || '',
        year_of_studying: p.year_of_studying || '',
        college_university: p.college_university || '',
        city_district: p.city_district || '',
        qr_code: p.qr_code || '',
        registration_date: p.registration_date,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      const transformedAttendance = attendance.map(a => ({
        id: a.id,
        participantId: a.participant_id || '',
        eventId: a.event_id || '',
        venueId: a.venue_id || '',
        checkInTime: a.check_in_time || '',
        checkOutTime: a.check_out_time || '',
        status: a.status,
      }));

      dispatch({ type: 'SET_EVENTS', payload: transformedEvents });
      dispatch({ type: 'SET_VENUES', payload: venues });
      dispatch({ type: 'SET_PARTICIPANTS', payload: transformedParticipants });
      dispatch({ type: 'SET_ATTENDANCE', payload: transformedAttendance });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentUser, authLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}