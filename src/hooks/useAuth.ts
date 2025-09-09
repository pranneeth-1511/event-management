import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole, AppUser } from '../types';

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    if (isLoaded && user) {
      console.log("Clerk user:", user);

      // Normalize email (fallback to primary email address)
      const userEmail = (user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "").toLowerCase();

      // Find or create user role
      let userRole = state.userRoles.find(role => role.email === userEmail);

      if (!userRole) {
        // --- SUPER ADMIN OVERRIDE ---
        const isSuperAdmin = userEmail === "pranneethpersonal@gmail.com";

        // Old "App Owner" admin (keep for compatibility)
        const isAppOwner = userEmail === "admin@pranneethdk.com";

        // Final admin flag
        const isAdmin = isSuperAdmin || isAppOwner;

        userRole = {
          id: user.id || userEmail,
          email: userEmail,
          role: isAdmin ? 'admin' : 'viewer',
          accessibleVenues: [],
          permissions: {
            canCreateEvents: isAdmin,
            canManageParticipants: isAdmin,
            canTakeAttendance: isAdmin,
            canViewReports: true,
            canManageUsers: isAdmin,
          }
        };

        console.log("Creating new role for user:", userRole);
        dispatch({ type: 'ADD_USER_ROLE', payload: userRole });
      }

      const appUser: AppUser = {
        id: user.id || userEmail,
        email: userEmail,
        name: user.fullName || user.firstName || userEmail,
        role: userRole!
      };

      console.log("Setting current user:", appUser);
      dispatch({ type: 'SET_CURRENT_USER', payload: appUser });
    }
  }, [isLoaded, user, state.userRoles, dispatch]);

  const hasPermission = (permission: keyof UserRole['permissions']): boolean => {
    if (state.currentUser?.role.role === "admin") {
      return true; // admins always pass
    }
    return state.currentUser?.role.permissions[permission] || false;
  };

  const hasVenueAccess = (venueId: string): boolean => {
    if (!state.currentUser) return false;
    if (state.currentUser.role.role === 'admin') return true;
    return state.currentUser.role.accessibleVenues.includes(venueId);
  };

  const getAccessibleVenues = () => {
    if (!state.currentUser) return [];
    if (state.currentUser.role.role === 'admin') {
      // Admin can access all venues
      return state.events.flatMap(event => event.venues);
    }
    // Filter venues based on user access
    return state.events
      .flatMap(event => event.venues)
      .filter(venue => state.currentUser!.role.accessibleVenues.includes(venue.id));
  };

  const getAccessibleEvents = () => {
    if (!state.currentUser) return [];
    if (state.currentUser.role.role === 'admin') {
      return state.events;
    }
    // Filter events that have at least one accessible venue
    return state.events.filter(event =>
      event.venues.some(venue =>
        state.currentUser!.role.accessibleVenues.includes(venue.id)
      )
    );
  };

  return {
    currentUser: state.currentUser,
    hasPermission,
    hasVenueAccess,
    getAccessibleVenues,
    getAccessibleEvents,
    isLoading: !isLoaded
  };
}