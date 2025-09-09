import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { v4 as uuidv4 } from 'uuid';
import QrScanner from 'react-qr-scanner';
import { UserCheck, UserX, Clock, LogOut, QrCode, Search, Users, Calendar, MapPin } from 'lucide-react';

export function Attendance() {
  const { state, dispatch } = useAppContext();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleMarkAttendance = async (
    participantId: string,
    status: 'present' | 'absent' | 'late'
  ) => {
    if (!selectedEvent || !selectedVenue) {
      alert('Please select an event and venue first');
      return;
    }

    const existingRecord = state.attendanceRecords.find(
      (r) =>
        r.participantId === participantId &&
        r.eventId === selectedEvent &&
        r.venueId === selectedVenue
    );

    if (existingRecord) {
      const updatedRecord = {
        ...existingRecord,
        status,
        checkInTime:
          status === 'present' || status === 'late'
            ? existingRecord.checkInTime || new Date().toISOString()
            : existingRecord.checkInTime,
        checkOutTime:
          status === 'absent' ? undefined : existingRecord.checkOutTime,
      };

      dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
      try {
        await attendanceApi.update(existingRecord.id, updatedRecord);
      } catch (error) {
        console.error('Error updating attendance:', error);
      }
    } else {
      const newRecord = {
        id: uuidv4(),
        participantId,
        eventId: selectedEvent,
        venueId: selectedVenue,
        checkInTime: status !== 'absent' ? new Date().toISOString() : '',
        status,
      };

      dispatch({ type: 'ADD_ATTENDANCE', payload: newRecord });
      try {
        await attendanceApi.create(newRecord);
      } catch (error) {
        console.error('Error creating attendance:', error);
      }
    }
  };

  const handleCheckOut = async (participantId: string) => {
    if (!selectedEvent || !selectedVenue) return;

    const existingRecord = state.attendanceRecords.find(
      (r) =>
        r.participantId === participantId &&
        r.eventId === selectedEvent &&
        r.venueId === selectedVenue
    );

    if (
      existingRecord &&
      !existingRecord.checkOutTime &&
      existingRecord.status === 'present'
    ) {
      const updatedRecord = {
        ...existingRecord,
        checkOutTime: new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_ATTENDANCE', payload: updatedRecord });
      try {
        await attendanceApi.update(existingRecord.id, updatedRecord);
      } catch (error) {
        console.error('Error updating checkout:', error);
      }
    }
  };

  const handleScan = (data: any) => {
    if (data) {
      setScannedId(data);
      handleMarkAttendance(data, 'present');
      setShowScanner(false);
    }
  };

  const handleScanError = (err: any) => {
    console.error('QR Scan Error:', err);
  };

  const filteredParticipants = state.participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.participant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEventData = state.events.find(e => e.id === selectedEvent);
  const availableVenues = selectedEventData?.venues || state.venues.filter(v => v.eventId === selectedEvent) || [];

  const attendanceStats = {
    present: state.attendanceRecords.filter(r => 
      r.eventId === selectedEvent && r.venueId === selectedVenue && r.status === 'present'
    ).length,
    absent: state.attendanceRecords.filter(r => 
      r.eventId === selectedEvent && r.venueId === selectedVenue && r.status === 'absent'
    ).length,
    late: state.attendanceRecords.filter(r => 
      r.eventId === selectedEvent && r.venueId === selectedVenue && r.status === 'late'
    ).length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Attendance Tracking" subtitle="Mark attendance for participants across events and venues" />
      
      <div className="flex-1 p-6">
        {/* Event and Venue Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Event & Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                Event
              </label>
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setSelectedVenue(''); // Reset venue when event changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an Event</option>
                {state.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <select
                id="venue"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                disabled={!selectedEvent}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select a Venue</option>
                {availableVenues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedEvent && selectedVenue && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredParticipants.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  </div>
                  <UserX className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button icon={QrCode} onClick={() => setShowScanner(true)}>
                Scan QR Code
              </Button>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              </div>
              
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'No participants registered yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => {
                    const record = state.attendanceRecords.find(
                      (r) =>
                        r.participantId === participant.id &&
                        r.eventId === selectedEvent &&
                        r.venueId === selectedVenue
                    );

                    return (
                      <div key={participant.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{participant.name}</h4>
                                <p className="text-sm text-gray-600">ID: {participant.participant_id}</p>
                                <p className="text-sm text-gray-500">{participant.email}</p>
                              </div>
                            </div>
                            {record && (
                              <div className="mt-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  record.status === 'present'
                                    ? 'bg-green-100 text-green-800'
                                    : record.status === 'late'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status}
                                </span>
                                {record.checkInTime && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    Check-in: {new Date(record.checkInTime).toLocaleTimeString()}
                                  </span>
                                )}
                                {record.checkOutTime && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    Check-out: {new Date(record.checkOutTime).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleMarkAttendance(participant.id, 'present')}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMarkAttendance(participant.id, 'late')}
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Late
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleMarkAttendance(participant.id, 'absent')}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Absent
                            </Button>
                            {record?.status === 'present' && !record?.checkOutTime && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCheckOut(participant.id)}
                              >
                                <LogOut className="w-4 h-4 mr-1" />
                                Check Out
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedEvent && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
            <p className="text-gray-500">Choose an event and venue to start taking attendance</p>
          </div>
        )}

        {selectedEvent && !selectedVenue && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Venue</h3>
            <p className="text-gray-500">Choose a venue to start taking attendance</p>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        title="Scan QR Code"
        size="md"
      >
        <div className="text-center">
          <div className="w-full max-w-sm mx-auto mb-4">
            <QrScanner
              delay={300}
              onError={handleScanError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </div>
          {scannedId && (
            <p className="text-green-600 mb-4">Scanned ID: {scannedId}</p>
          )}
          <p className="text-sm text-gray-500">
            Position the QR code within the camera frame to scan
          </p>
        </div>
      </Modal>
    </div>
  );
}