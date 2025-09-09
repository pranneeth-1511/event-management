import React from 'react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Database, Download, Upload, Trash2 } from 'lucide-react';

export function Settings() {
  const { state, dispatch } = useAppContext();
  const [, setStoredData] = useLocalStorage('eventTracker', {});

  const handleExportData = () => {
    const data = {
      events: state.events,
      participants: state.participants,
      attendanceRecords: state.attendanceRecords,
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventtracker-backup-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input value so the same file can be selected again
    event.target.value = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.events && data.participants && data.attendanceRecords) {
          dispatch({ type: 'LOAD_DATA', payload: data });
          setStoredData(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format. Please select a valid backup file.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        'Are you sure you want to clear all data? This action cannot be undone.'
      )
    ) {
      dispatch({
        type: 'LOAD_DATA',
        payload: { events: [], participants: [], attendanceRecords: [] },
      });
      setStoredData({});
      alert('All data has been cleared.');
    }
  };

  const stats = {
    totalEvents: state.events.length,
    totalParticipants: state.participants.length,
    totalVenues: state.events.reduce(
      (sum, event) => sum + event.venues.length,
      0
    ),
    totalAttendance: state.attendanceRecords.length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        subtitle="Manage application settings and data"
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* System Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              System Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalEvents}
                </p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalParticipants}
                </p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalVenues}
                </p>
                <p className="text-sm text-gray-600">Venues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalAttendance}
                </p>
                <p className="text-sm text-gray-600">Attendance Records</p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Data Management
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  icon={Download}
                  onClick={handleExportData}
                  variant="secondary"
                >
                  Export All Data
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button icon={Upload} variant="secondary">
                    Import Data
                  </Button>
                </div>

                <Button
                  icon={Trash2}
                  onClick={handleClearAllData}
                  variant="danger"
                >
                  Clear All Data
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Always backup your data before
                  making changes. The export function creates a complete backup
                  of all your events, participants, and attendance records.
                </p>
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage:</span>
                <span className="font-medium">Local Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
