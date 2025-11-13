'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Participant {
  id: string;
  name: string;
  email: string;
  designation: string;
  managerName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ParticipantsComponentProps {
  // Optional: you can still pass these props if needed for external control
  participants?: Participant[];
  onAddParticipant?: (participant: Omit<Participant, 'id'>) => void;
  onEditParticipant?: (id: string, participant: Omit<Participant, 'id'>) => void;
  onRemoveParticipant?: (id: string) => void;
}

const ParticipantsComponent: React.FC<ParticipantsComponentProps> = (props) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showEditParticipant, setShowEditParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: '',
    designation: '',
    managerName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk selection state
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Mock token - in real app, get this from auth context or secure storage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      // Replace with your actual token or get from secure storage
      return localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2ZDc5NGU3OGJiM2VmZjc2Mzc1YWYiLCJpYXQiOjE3NTE1NzAzMjgsImV4cCI6MTc1MjE3NTEyOH0.4qIQk1NGkzsxaGUDmySQBb_Gj6c2qjSs4SNdgCKfpTs';
    }
    return '';
  };

  // API Functions
  const fetchParticipants = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL('https://api.breakfreeacademy.in/api/participants');
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('search', search);
      
      console.log('🚀 Fetching participants with URL:', url.toString());
      console.log('🔑 Authorization token:', getAuthToken());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ Response not ok, trying to parse error data...');
        const errorData = await response.json().catch((parseError) => {
          console.error('❌ Failed to parse error response as JSON:', parseError);
          return null;
        });
        console.log('❌ Error data:', errorData);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Response ok, parsing data...');
      const data = await response.json();
      console.log('📄 Full response data:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data) {
        console.log('✅ Data parsing successful');
        console.log('👥 Participants:', data.data.participants);
        console.log('📊 Pagination:', data.data.pagination);
        
        setParticipants(data.data.participants || []);
        setPagination(data.data.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: data.data.participants?.length || 0,
          itemsPerPage: limit
        });
      } else {
        console.error('❌ Data structure unexpected:', data);
        throw new Error(data.message || 'Failed to fetch participants');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching participants';
      console.error('💥 Complete error in fetchParticipants:', err);
      console.error('💥 Error name:', err instanceof Error ? err.name : 'Unknown');
      console.error('💥 Error message:', errorMessage);
      console.error('💥 Error stack:', err instanceof Error ? err.stack : 'No stack');
      
      setError(errorMessage);
      
      // Set empty state on error
      setParticipants([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit
      });
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const createParticipant = async (participantData: Omit<Participant, 'id'>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('🚀 Creating participant with data:', participantData);

      const response = await fetch('https://api.breakfreeacademy.in/api/participants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      console.log('📡 Create response status:', response.status);
      console.log('📡 Create response ok:', response.ok);

      if (!response.ok) {
        console.error('❌ Create response not ok');
        const errorData = await response.json().catch((parseError) => {
          console.error('❌ Failed to parse create error response:', parseError);
          return null;
        });
        console.log('❌ Create error data:', errorData);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📄 Create response data:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('✅ Participant created successfully');
        // Refresh the participants list
        await fetchParticipants(currentPage, searchTerm);
        return data.data;
      } else {
        console.error('❌ Create operation failed:', data);
        throw new Error(data.message || 'Failed to create participant');
      }
    } catch {
      // Error is already handled in createParticipant
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateParticipant = async (id: string, participantData: Partial<Omit<Participant, 'id'>>) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`https://api.breakfreeacademy.in/api/participants/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh the participants list
        await fetchParticipants(currentPage, searchTerm);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update participant');
      }
    } catch {
      // Error is already handled in updateParticipant
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`https://api.breakfreeacademy.in/api/participants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Refresh the participants list
        await fetchParticipants(currentPage, searchTerm);
      } else {
        throw new Error(data.message || 'Failed to delete participant');
      }
    } catch {
      // Error is already handled in deleteParticipant
    }
  };

  // Load participants on component mount
  useEffect(() => {
    console.log('🔄 useEffect triggered - currentPage:', currentPage);
    fetchParticipants(currentPage, searchTerm);
  }, [currentPage, fetchParticipants, searchTerm]);

  // Handle search with debounce
  useEffect(() => {
    console.log('🔍 Search useEffect triggered - searchTerm:', searchTerm);
    const timeoutId = setTimeout(() => {
      console.log('⏰ Search timeout executed');
      if (currentPage === 1) {
        fetchParticipants(1, searchTerm);
      } else {
        setCurrentPage(1); // This will trigger fetchParticipants via the effect above
      }
    }, 500);

    return () => {
      console.log('🧹 Cleaning up search timeout');
      clearTimeout(timeoutId);
    };
  }, [searchTerm, fetchParticipants, currentPage]);

  const handleAddParticipant = async () => {
    if (!newParticipant.name || !newParticipant.email || !newParticipant.designation || !newParticipant.managerName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await createParticipant(newParticipant);
      setNewParticipant({ name: '', email: '', designation: '', managerName: '' });
      setShowAddParticipant(false);
      
      // Call external callback if provided
      if (props.onAddParticipant) {
        props.onAddParticipant(newParticipant);
      }
    } catch {
      // Error is already handled in createParticipant
    }
  };

  const handleEditParticipant = async () => {
    if (!editingParticipant || !newParticipant.name || !newParticipant.email || !newParticipant.designation || !newParticipant.managerName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updateParticipant(editingParticipant.id, newParticipant);
      setNewParticipant({ name: '', email: '', designation: '', managerName: '' });
      setShowEditParticipant(false);
      setEditingParticipant(null);
      
      // Call external callback if provided
      if (props.onEditParticipant) {
        props.onEditParticipant(editingParticipant.id, newParticipant);
      }
    } catch {
      // Error is already handled in updateParticipant
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await deleteParticipant(id);
        
        // Call external callback if provided
        if (props.onRemoveParticipant) {
          props.onRemoveParticipant(id);
        }
      } catch {
        // Error is already handled in deleteParticipant
      }
    }
  };

  const openEditModal = (participant: Participant) => {
    setEditingParticipant(participant);
    setNewParticipant({
      name: participant.name,
      email: participant.email,
      designation: participant.designation,
      managerName: participant.managerName
    });
    setShowEditParticipant(true);
  };

  const handleCancelAdd = () => {
    setNewParticipant({ name: '', email: '', designation: '', managerName: '' });
    setShowAddParticipant(false);
    setError(null);
  };

  const handleCancelEdit = () => {
    setNewParticipant({ name: '', email: '', designation: '', managerName: '' });
    setShowEditParticipant(false);
    setEditingParticipant(null);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      setCurrentPage(newPage);
    }
  };

  // Use external participants if provided, otherwise use internal state
  const displayParticipants = props.participants || participants;

  // Bulk email sending function
  const sendBulkEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const response = await fetch('https://api.breakfreeacademy.in/api/participants/send-bulk-login-credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantIds: selectedParticipantIds,
          customMessage: "Welcome to the Assessment Platform! Please check your email for login credentials."
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send emails');
      }
      setEmailStatus({ success: 'Emails sent successfully!' });
      setSelectedParticipantIds([]);
    } catch {
      setEmailStatus({ error: 'Failed to send emails' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Checkbox logic
  const isAllSelected = displayParticipants.length > 0 && selectedParticipantIds.length === displayParticipants.length;
  const isIndeterminate = selectedParticipantIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedParticipantIds([]);
    } else {
      setSelectedParticipantIds(displayParticipants.map(p => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedParticipantIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">All Participants</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search participants..."
            className="border px-3 py-2 rounded-lg text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-full shadow disabled:opacity-50"
            onClick={() => setShowAddParticipant(true)}
            disabled={isSubmitting}
          >
            + Add Participant
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow disabled:opacity-50 flex items-center gap-2"
            onClick={sendBulkEmail}
            disabled={selectedParticipantIds.length === 0 || isSendingEmail}
            title="Send login credentials to selected participants"
          >
            {isSendingEmail ? (
              <span>Sending...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" />
                </svg>
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Status Feedback */}
      {emailStatus?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {emailStatus.success}
          <button className="ml-2 text-sm underline" onClick={() => setEmailStatus(null)}>Dismiss</button>
        </div>
      )}
      {emailStatus?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {emailStatus.error}
          <button className="ml-2 text-sm underline" onClick={() => setEmailStatus(null)}>Dismiss</button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            className="ml-2 text-sm underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading participants...</div>
        </div>
      )}

      {/* Participants Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-black">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">E-mail</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Manager Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No participants found matching your search' : 'No participants found'}
                  </td>
                </tr>
              ) : (
                displayParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-black">
                      <input
                        type="checkbox"
                        checked={selectedParticipantIds.includes(participant.id)}
                        onChange={() => handleSelectOne(participant.id)}
                        disabled={isSendingEmail}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{participant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{participant.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{participant.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{participant.managerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          onClick={() => openEditModal(participant)}
                          disabled={isSubmitting}
                          title="Edit Participant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          onClick={() => handleDeleteParticipant(participant.id)}
                          disabled={isSubmitting}
                          title="Delete Participant"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">
          Showing {displayParticipants.length} of {pagination.totalItems} participants
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>
          <span className="px-3 py-1 border rounded bg-gray-100 text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-bold mb-4 text-xl text-black">Add Participant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Name*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter participant name"
                  value={newParticipant.name}
                  onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Email*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  type="email"
                  value={newParticipant.email}
                  onChange={e => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Designation*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation"
                  value={newParticipant.designation}
                  onChange={e => setNewParticipant({ ...newParticipant, designation: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Manager Name*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manager name"
                  value={newParticipant.managerName}
                  onChange={e => setNewParticipant({ ...newParticipant, managerName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-6 py-2 text-black hover:bg-gray-100 rounded disabled:opacity-50" 
                onClick={handleCancelAdd}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50" 
                onClick={handleAddParticipant}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Participant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant Modal */}
      {showEditParticipant && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-bold mb-4 text-xl text-black">Edit Participant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Name*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter participant name"
                  value={newParticipant.name}
                  onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Email*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  type="email"
                  value={newParticipant.email}
                  onChange={e => setNewParticipant({ ...newParticipant, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Designation*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation"
                  value={newParticipant.designation}
                  onChange={e => setNewParticipant({ ...newParticipant, designation: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">Manager Name*</label>
                <input
                  className="border w-full p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manager name"
                  value={newParticipant.managerName}
                  onChange={e => setNewParticipant({ ...newParticipant, managerName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-6 py-2 text-black hover:bg-gray-100 rounded disabled:opacity-50" 
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50" 
                onClick={handleEditParticipant}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Participant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsComponent;