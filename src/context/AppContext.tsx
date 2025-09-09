import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Event, Venue, Participant, AttendanceRecord, UserRole, AppUser } from '../types';

interface AppState {
  events: Event[];
  venues: Venue[];
  participants: Participant[];
  attendanceRecords: AttendanceRecord[];
  userRoles: UserRole[];
  currentUser: AppUser | null;
  selectedEvent: Event | null;
  selectedVenue: Venue | null;
}

type AppAction =
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_VENUE'; payload: Venue }
  | { type: 'UPDATE_VENUE'; payload: Venue }
  | { type: 'DELETE_VENUE'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'ADD_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'DELETE_ATTENDANCE'; payload: string }
  | { type: 'ADD_USER_ROLE'; payload: UserRole }
  | { type: 'UPDATE_USER_ROLE'; payload: UserRole }
  | { type: 'DELETE_USER_ROLE'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: AppUser | null }
  | { type: 'SET_SELECTED_EVENT'; payload: Event | null }
  | { type: 'SET_SELECTED_VENUE'; payload: Venue | null }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  events: [],
  venues: [],
  participants: [],
  attendanceRecords: [],
  userRoles: [],
  currentUser: null,
  selectedEvent: null,
  selectedVenue: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
        attendanceRecords: state.attendanceRecords.filter(record => record.eventId !== action.payload),
        selectedEvent: state.selectedEvent?.id === action.payload ? null : state.selectedEvent,
      };
    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };
    case 'UPDATE_VENUE':
      return {
        ...state,
        venues: state.venues.map(venue =>
          venue.id === action.payload.id ? action.payload : venue
        ),
      };
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
        attendanceRecords: state.attendanceRecords.filter(record => record.participantId !== action.payload),
      };
    case 'DELETE_VENUE':
      return {
        ...state,
        venues: state.venues.filter(venue => venue.id !== action.payload),
        attendanceRecords: state.attendanceRecords.filter(record => record.venueId !== action.payload),
        selectedVenue: state.selectedVenue?.id === action.payload ? null : state.selectedVenue,
      };
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
    case 'ADD_USER_ROLE':
      return { ...state, userRoles: [...state.userRoles, action.payload] };
    case 'UPDATE_USER_ROLE':
      return {
        ...state,
        userRoles: state.userRoles.map(role =>
          role.id === action.payload.id ? action.payload : role
        ),
      };
    case 'DELETE_USER_ROLE':
      return {
        ...state,
        userRoles: state.userRoles.filter(role => role.id !== action.payload),
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };
    case 'SET_SELECTED_VENUE':
      return { ...state, selectedVenue: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
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