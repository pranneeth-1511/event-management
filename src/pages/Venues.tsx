import React, { useState, useMemo } from 'react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { Venue } from '../types';
import { Plus, MapPin, Users, Calendar, Search, Edit, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function Venues() {
  const { state, dispatch } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    eventId: '',
  });

  const filteredVenues = state.venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (venue?: Venue) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity.toString(),
        eventId: venue.eventId || '',
      });
    } else {
      setEditingVenue(null);
      setFormData({
        name: '',
        location: '',
        capacity: '',
        eventId: state.events.length > 0 ? state.events[0].id : '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
    setFormData({
      name: '',
      location: '',
      capacity: '',
      eventId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.location || !formData.capacity) {
      alert('Name, location, and capacity are required fields');
      return;
    }

    if (parseInt(formData.capacity) <= 0) {
      alert('Capacity must be greater than 0');
      return;
    }
    
    try {
      setLoading(true);
      
      const venueData: Venue = {
        id: editingVenue?.id || uuidv4(),
        name: formData.name,
        location: formData.location,
        capacity: parseInt(formData.capacity),
        eventId: formData.eventId || '',
      };
      
      if (editingVenue) {
        dispatch({ type: 'UPDATE_VENUE', payload: venueData });
      } else {
        dispatch({ type: 'ADD_VENUE', payload: venueData });
      }
      
      handleCloseModal();
      alert(editingVenue ? 'Venue updated successfully!' : 'Venue created successfully!');
    } catch (error) {
      console.error('Error saving venue:', error);
      alert(`Failed to save venue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    if (confirm('Are you sure you want to delete this venue?')) {
      try {
        setLoading(true);
        dispatch({ type: 'DELETE_VENUE', payload: venue.id });
        alert('Venue deleted successfully!');
      } catch (error) {
        console.error('Error deleting venue:', error);
        alert(`Failed to delete venue: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEventName = (eventId: string) => {
    const event = state.events.find(e => e.id === eventId);
    return event ? event.name : 'No Event';
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Venues" subtitle="Manage event venues and their capacity" />
      
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">All Venues</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {state.venues.length} total
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button icon={Plus} onClick={() => handleOpenModal()} loading={loading}>
              Add Venue
            </Button>
          </div>
        </div>

        {filteredVenues.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No venues found' : 'No venues yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first venue to get started'}
            </p>
            {!searchTerm && (
              <Button icon={Plus} onClick={() => handleOpenModal()}>
                Add Your First Venue
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div key={venue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenModal(venue)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVenue(venue)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {venue.location}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Capacity: {venue.capacity}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {getEventName(venue.eventId)}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status: Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">
              Event
            </label>
            <select
              id="eventId"
              value={formData.eventId}
              onChange={(e) => setFormData(prev => ({ ...prev, eventId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an event</option>
              {state.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Venue Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingVenue ? 'Update Venue' : 'Add Venue'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}