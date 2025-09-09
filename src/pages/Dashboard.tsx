import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { useAppContext } from '../context/AppContext';
import { Calendar, Users, MapPin, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    const totalVenues = state.events.reduce((sum, event) => sum + event.venues.length, 0);
    const totalAttendance = state.attendanceRecords.length;
    const presentAttendance = state.attendanceRecords.filter(record => record.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;
    
    return {
      totalEvents: state.events.length,
      totalParticipants: state.participants.length,
      totalVenues,
      totalAttendance,
      attendanceRate: Math.round(attendanceRate),
      recentEvents: state.events.slice(-3),
    };
  }, [state]);

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Total Venues',
      value: stats.totalVenues,
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      title: 'Attendance Rate',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+2%',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your events." />
      
      <div className="flex-1 p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} rounded-full p-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
            <div className="space-y-4">
              {stats.recentEvents.length > 0 ? (
                stats.recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.name}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.startDate), 'MMM dd, yyyy')} - {event.venues.length} venues
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No events created yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/events')}
                className="w-full flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Create New Event</p>
                  <p className="text-sm text-gray-600">Set up a new event with venues</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/participants')}
                className="w-full flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Add Participant</p>
                  <p className="text-sm text-gray-600">Register a new participant</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/attendance')}
                className="w-full flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <CheckCircle className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Take Attendance</p>
                  <p className="text-sm text-gray-600">Mark attendance for an event</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.attendanceRecords.slice(-5).map((record) => {
                  const participant = state.participants.find(p => p.id === record.participantId);
                  const event = state.events.find(e => e.id === record.eventId);
                  
                  return (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {participant ? `${participant.firstName} ${participant.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event?.name || 'Unknown Event'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(record.checkInTime), 'MMM dd, HH:mm')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {state.attendanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No attendance records yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}