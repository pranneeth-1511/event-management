import React, { useEffect, createContext, useContext } from 'react';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from './useLocalStorage';

export function useDataPersistence() {
  const { state, dispatch } = useAppContext();
  const [storedData, setStoredData] = useLocalStorage('eventTracker', {
    events: [],
    participants: [],
    attendanceRecords: [],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    if (storedData && storedData.events && Array.isArray(storedData.events)) {
      dispatch({ type: 'LOAD_DATA', payload: storedData });
    }
  }, [dispatch, storedData]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    // Only save if we have actual data to prevent overwriting with empty state
    if (state.events.length === 0 && state.participants.length === 0 && state.attendanceRecords.length === 0) {
      return;
    }
    
    const dataToStore = {
      events: state.events,
      participants: state.participants,
      attendanceRecords: state.attendanceRecords,
      userRoles: state.userRoles,
      lastUpdated: new Date().toISOString(),
    };
    
    setStoredData(dataToStore);
  }, [state.events, state.participants, state.attendanceRecords, state.userRoles, setStoredData]);

  return null;
}

// Create a provider component to wrap the hook
export function DataPersistenceProvider({ children }: { children: React.ReactNode }) {
  useDataPersistence();
  return <>{children}</>;
}