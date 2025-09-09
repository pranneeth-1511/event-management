import React, { useState } from 'react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { Users, Shield, Edit, Trash2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function UserManagement() {
  const { hasPermission } = useAuth();
  const { state, dispatch } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as 'admin' | 'staff' | 'viewer',
    accessibleVenues: [] as string[],
    permissions: {
      canCreateEvents: false,
      canManageParticipants: false,
      canTakeAttendance: false,
      canViewReports: true,
      canManageUsers: false,
    }
  });

  const handleOpenModal = (user?: UserRole) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        accessibleVenues: user.accessibleVenues || [],
        permissions: { ...user.permissions }
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        role: 'viewer',
        accessibleVenues: [],
        permissions: {
          canCreateEvents: false,
          canManageParticipants: false,
          canTakeAttendance: false,
          canViewReports: true,
          canManageUsers: false,
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      alert('Email is required');
      return;
    }

    try {
      setLoading(true);

      const userData: UserRole = {
        id: editingUser?.id || uuidv4(),
        email: formData.email,
        role: formData.role,
        accessibleVenues: formData.accessibleVenues,
        permissions: formData.permissions,
      };

      if (editingUser) {
        dispatch({ type: 'UPDATE_USER_ROLE', payload: userData });
      } else {
        dispatch({ type: 'ADD_USER_ROLE', payload: userData });
      }

      handleCloseModal();
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Failed to save user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        dispatch({ type: 'DELETE_USER_ROLE', payload: userId });
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVenueToggle = (venueId: string) => {
    setFormData(prev => ({
      ...prev,
      accessibleVenues: prev.accessibleVenues.includes(venueId)
        ? prev.accessibleVenues.filter(id => id !== venueId)
        : [...prev.accessibleVenues, venueId]
    }));
  };

  const handlePermissionChange = (permission: keyof UserRole['permissions']) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Access Denied" subtitle="You don't have permission to manage users" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access user management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="User Management" subtitle="Manage user roles and permissions" />
      
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {state.userRoles.length} total
            </span>
          </div>
          <Button icon={Plus} onClick={() => handleOpenModal()} loading={loading}>
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accessible Venues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.userRoles.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'staff'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'admin' ? 'All Venues' : `${user.accessibleVenues?.length || 0} venues`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Object.values(user.permissions || {}).filter(Boolean).length} permissions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {state.userRoles.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found. Add your first user to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="viewer">Viewer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role !== 'admin' && state.venues.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Accessible Venues
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {state.venues.map((venue) => (
                  <label key={venue.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.accessibleVenues.includes(venue.id)}
                      onChange={() => handleVenueToggle(venue.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {venue.name} ({venue.location})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="space-y-2">
              {Object.entries(formData.permissions).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handlePermissionChange(key as keyof UserRole['permissions'])}
                    className="mr-2"
                    disabled={formData.role === 'admin'}
                  />
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
            {formData.role === 'admin' && (
              <p className="text-xs text-gray-500 mt-2">
                Admin users have all permissions by default
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}