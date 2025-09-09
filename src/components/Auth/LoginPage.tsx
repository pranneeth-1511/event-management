import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Calendar, Users, MapPin, BarChart3 } from 'lucide-react';

export function LoginPage() {
  console.log('LoginPage rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EventTracker</h1>
            <p className="text-gray-600">Complete Event Attendance Management System</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-3 text-blue-500" />
              <span>Manage events and venues</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-3 text-green-500" />
              <span>Track participant attendance</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-3 text-purple-500" />
              <span>Multi-venue support</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <BarChart3 className="w-4 h-4 mr-3 text-orange-500" />
              <span>Analytics and reporting</span>
            </div>
          </div>

          <div className="space-y-3">
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Create Account
              </button>
            </SignUpButton>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Secure authentication powered by Clerk
          </p>
        </div>
      </div>
    </div>
  );
}