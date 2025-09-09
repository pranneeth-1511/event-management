import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserButton, useUser, SignOutButton } from '@clerk/clerk-react';
import {
  Calendar,
  Users,
  MapPin,
  ClipboardCheck,
  BarChart3,
  Settings,
  Home,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar, permission: 'canCreateEvents' },
  { name: 'Participants', href: '/participants', icon: Users, permission: 'canManageParticipants' },
  { name: 'Venues', href: '/venues', icon: MapPin },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, permission: 'canTakeAttendance' },
  { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'canViewReports' },
  { name: 'User Management', href: '/users', icon: Shield, permission: 'canManageUsers' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { hasPermission } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg border-r border-gray-200">
      <div 
        className="flex items-center h-16 px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => navigate('/')}
      >
        <Calendar className="w-8 h-8 text-blue-600" />
        <h1 className="ml-2 text-xl font-bold text-gray-900">EventTracker</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => (
          (!item.permission || hasPermission(item.permission as any)) && (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          )
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.firstName || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</p>
            </div>
          </div>
        </div>
        <SignOutButton>
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}