import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { LoginPage } from './LoginPage';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoaded, isSignedIn } = useUser();
  
  console.log('AuthWrapper state:', { isLoaded, isSignedIn });

  if (!isLoaded) {
    console.log('AuthWrapper: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    console.log('AuthWrapper: Not signed in, showing login page');
    return <LoginPage />;
  }

  console.log('AuthWrapper: Signed in, rendering children');
  return <>{children}</>;
}