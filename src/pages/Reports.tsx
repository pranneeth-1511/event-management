import React, { useMemo, useState } from 'react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export function Reports() {
  const { state } = useAppContext();
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  const reportData = useMemo(() => {
    const filteredRecords = selectedEvent
      ? state.attendanceRecords.filter(
          (record) => record.eventId === selectedEvent
        )
      : state.attendanceRecords;

    const totalAttendance = filteredRecords.length;
    const presentCount = filteredRecords.filter(
      (record) => record.status === 'present'
    ).length;
    const absentCount = filteredRecords.filter(
      (record) => record.status === 'absent'
    ).length;
    const lateCount = filteredRecords.filter(
      (record) => record.status === 'late'
    ).length;

    const attendanceRate =
      totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;
    const lateRate =
      totalAttendance > 0 ? (lateCount / totalAttendance) * 100 : 0;

    // Event breakdown
    const eventBreakdown = state.events.map((event) => {
      const eventRecords = state.attendanceRecords.filter(
        (record) => record.eventId === event.id
      );
      const eventPresent = eventRecords.filter(
        (record) => record.status === 'present'
      ).length;
      const eventTotal = eventRecords.length;
      const eventRate = eventTotal > 0 ? (eventPresent / eventTotal) * 100 : 0;

      return {
        event,
        totalRecords: eventTotal,
        presentCount: eventPresent,
        attendanceRate: eventRate,
      };
    });

    // Venue breakdown
    const venueBreakdown = state.events.flatMap((event) =>
      (event.venues || []).map((venue) => {
        const venueRecords = state.attendanceRecords.filter(
          (record) => record.venueId === venue.id
        );
        const venuePresent = venueRecords.filter(
          (record) => record.status === 'present'
        ).length;
        const venueTotal = venueRecords.length;
        const venueRate =
          venueTotal > 0 ? (venuePresent / venueTotal) * 100 : 0;

        return {
          venue,
          event: event.name,
          totalRecords: venueTotal,
          presentCount: venuePresent,
          attendanceRate: venueRate,
        };
      })
    );

    return {
      totalAttendance,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      lateRate,
      eventBreakdown,
      venueBreakdown,
      filteredRecords,
    };
  }, [state, selectedEvent]);

  const handleDownloadCSV = () => {
    if (reportData.filteredRecords.length === 0) {
      alert('No data to export');
      return;
    }

    const csvData = reportData.filteredRecords.map((record) => {
      const participant = state.participants.find(
        (p) => p.id === record.participantId
      );
      const event = state.events.find((e) => e.id === record.eventId);
      const venue = event?.venues.find((v) => v.id === record.venueId);

      return {
        'Participant Name': participant
          ? `${participant.firstName} ${participant.lastName}`
          : 'Unknown',
        Email: participant?.email || 'Unknown',
        Event: event?.name || 'Unknown',
        Venue: venue?.name || 'Unknown',
        Status: record.status,
        'Check In': record.checkInTime
          ? format(new Date(record.checkInTime), 'yyyy-MM-dd HH:mm:ss')
          : '',
        'Check Out': record.checkOutTime
          ? format(new Date(record.checkOutTime), 'yyyy-MM-dd HH:mm:ss')
          : '',
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports & Analytics"
        subtitle="View attendance statistics and export data"
      />

      <div className="flex-1 p-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Events</option>
              {state.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              icon={Download}
              variant="secondary"
              onClick={handleDownloadCSV}
              disabled={reportData.filteredRecords.length === 0}
            >
              Download CSV
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {reportData.totalAttendance}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">
                  {reportData.presentCount}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Attendance Rate
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.attendanceRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {reportData.lateRate.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Breakdown
            </h3>
            <div className="space-y-4">
              {reportData.eventBreakdown.map((item) => (
                <div
                  key={item.event.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.event.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.presentCount} of {item.totalRecords} attended
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {item.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {reportData.eventBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No events with attendance records
                </p>
              )}
            </div>
          </div>

          {/* Venue Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Venue Breakdown
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reportData.venueBreakdown.map((item) => (
                <div
                  key={item.venue.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.venue.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.event} • {item.presentCount} of {item.totalRecords}{' '}
                      attended
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {item.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              {reportData.venueBreakdown.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No venues with attendance records
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Attendance Records
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.filteredRecords
                  .slice(-10)
                  .reverse()
                  .map((record) => {
                    const participant = state.participants.find(
                      (p) => p.id === record.participantId
                    );
                    const event = state.events.find(
                      (e) => e.id === record.eventId
                    );
                    const venue = event?.venues.find(
                      (v) => v.id === record.venueId
                    );

                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant
                              ? `${participant.firstName} ${participant.lastName}`
                              : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event?.name || 'Unknown Event'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {venue?.name || 'Unknown Venue'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'present'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkInTime
                            ? format(
                                new Date(record.checkInTime),
                                'MMM dd, HH:mm'
                              )
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {reportData.filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No attendance records found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
