import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { userService } from '../services/api';
import { Database } from '../types/database';

type User = Database['public']['Tables']['users']['Row'];

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // Get or create user in Supabase
        let supabaseUser = await userService.getUserByClerkId(user.id);
        
        if (!supabaseUser) {
          // Create new user
          const userData = {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '',
            name: user.fullName || user.firstName || 'User',
            role: user.primaryEmailAddress?.emailAddress === 'pranneethpersonal@gmail.com' ? 'admin' as const : 'viewer' as const,
            permissions: {
              canManageUsers: user.primaryEmailAddress?.emailAddress === 'pranneethpersonal@gmail.com',
              canViewReports: true,
              canCreateEvents: user.primaryEmailAddress?.emailAddress === 'pranneethpersonal@gmail.com',
              canTakeAttendance: user.primaryEmailAddress?.emailAddress === 'pranneethpersonal@gmail.com',
              canManageParticipants: user.primaryEmailAddress?.emailAddress === 'pranneethpersonal@gmail.com',
            }
          };
          
          supabaseUser = await userService.createUser(userData);
        }

        setCurrentUser(supabaseUser);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [isLoaded, user]);

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions[permission] || false;
  };

  const hasVenueAccess = (venueId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.accessible_venues.includes(venueId);
  };

  return {
    user,
    currentUser,
    hasPermission,
    hasVenueAccess,
    isLoading: loading || !isLoaded,
    getToken
  };
}