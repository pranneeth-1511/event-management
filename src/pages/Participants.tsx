import React, { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { useAppContext } from '../context/AppContext';
import { Participant } from '../types';
import { Plus, Edit, Trash2, Users, Search, QrCode, Mail, Phone, GraduationCap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

export default function Participants() {
  const { state, dispatch } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    participant_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year_of_studying: '',
    college_university: '',
    city_district: '',
  });

  const filteredParticipants = state.participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.participant_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant);
      setFormData({
        participant_id: participant.participant_id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        department: participant.department,
        year_of_studying: participant.year_of_studying,
        college_university: participant.college_university,
        city_district: participant.city_district,
      });
    } else {
      setEditingParticipant(null);
      setFormData({
        participant_id: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        year_of_studying: '',
        college_university: '',
        city_district: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParticipant(null);
  };

  const generateQRCode = async (participantId: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(participantId);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participant_id || !formData.name || !formData.email) {
      alert('Participant ID, name, and email are required');
      return;
    }

    // Check for duplicate participant ID
    const existingParticipant = state.participants.find(
      p => p.participant_id === formData.participant_id && p.id !== editingParticipant?.id
    );
    
    if (existingParticipant) {
      alert('A participant with this ID already exists');
      return;
    }

    try {
      setLoading(true);

      const qrCode = await generateQRCode(formData.participant_id);

      const participantData: Participant = {
        id: editingParticipant?.id || uuidv4(),
        participant_id: formData.participant_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year_of_studying: formData.year_of_studying,
        college_university: formData.college_university,
        city_district: formData.city_district,
        qr_code: qrCode,
        registration_date: editingParticipant?.registration_date || new Date().toISOString(),
        created_at: editingParticipant?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingParticipant) {
        dispatch({ type: 'UPDATE_PARTICIPANT', payload: participantData });
      } else {
        dispatch({ type: 'ADD_PARTICIPANT', payload: participantData });
      }

      handleCloseModal();
      alert(editingParticipant ? 'Participant updated successfully!' : 'Participant registered successfully!');
    } catch (error) {
      console.error('Error saving participant:', error);
      alert(`Failed to save participant: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = (participantId: string) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      dispatch({ type: 'DELETE_PARTICIPANT', payload: participantId });
      alert('Participant deleted successfully!');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Participants" subtitle="Manage event participants and their registration details" />
      
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">All Participants</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {state.participants.length} registered
            </span>
          </div>
          <div className="flex items-center space-x-3">
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
            <Button icon={Plus} onClick={() => handleOpenModal()} loading={loading}>
              Add Participant
            </Button>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No participants found' : 'No participants yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Register your first participant to get started'}
            </p>
            {!searchTerm && (
              <Button icon={Plus} onClick={() => handleOpenModal()}>
                Register First Participant
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                          <div className="text-sm text-gray-500">ID: {participant.participant_id}</div>
                          <div className="text-sm text-gray-500">{participant.city_district}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-3 h-3 mr-1" />
                            {participant.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-3 h-3 mr-1" />
                            {participant.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {participant.department}
                          </div>
                          <div className="text-sm text-gray-500">{participant.year_of_studying}</div>
                          <div className="text-sm text-gray-500">{participant.college_university}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {participant.qr_code ? (
                          <img 
                            src={participant.qr_code} 
                            alt="QR Code" 
                            className="w-12 h-12"
                          />
                        ) : (
                          <QrCode className="w-12 h-12 text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenModal(participant)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteParticipant(participant.id)}
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
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingParticipant ? 'Edit Participant' : 'Register New Participant'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="participant_id" className="block text-sm font-medium text-gray-700 mb-1">
                Participant ID *
              </label>
              <input
                type="text"
                id="participant_id"
                value={formData.participant_id}
                onChange={(e) => setFormData(prev => ({ ...prev, participant_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Participant Name *
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email ID *
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Name of the Department
              </label>
              <input
                type="text"
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="year_of_studying" className="block text-sm font-medium text-gray-700 mb-1">
                Year of Studying
              </label>
              <select
                id="year_of_studying"
                value={formData.year_of_studying}
                onChange={(e) => setFormData(prev => ({ ...prev, year_of_studying: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="college_university" className="block text-sm font-medium text-gray-700 mb-1">
                College / University Name
              </label>
              <input
                type="text"
                id="college_university"
                value={formData.college_university}
                onChange={(e) => setFormData(prev => ({ ...prev, college_university: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="city_district" className="block text-sm font-medium text-gray-700 mb-1">
                City / District
              </label>
              <input
                type="text"
                id="city_district"
                value={formData.city_district}
                onChange={(e) => setFormData(prev => ({ ...prev, city_district: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingParticipant ? 'Update Participant' : 'Register Participant'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}