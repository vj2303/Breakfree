'use client';
import React, { useState, useEffect } from 'react';
import GroupsComponent from './Groups';
import ParticipantsComponent from './Participants';
import UsersComponent from './Users';

// Updated interfaces
interface Participant {
  id: string;
  name: string;
  email: string;
  designation: string;
  managerName: string;
}

interface Group {
  id: string;
  name: string;
  admin: string;
  adminEmail: string;
  members: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  designation: string;
  accessLevel: 'LEARNER' | 'ASSESSOR';
}

const PeopleManagement = () => {
  const [tab, setTab] = useState<'groups' | 'participants' | 'users'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Helper to get token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:3000/api/groups?page=1&limit=10&search=', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success && result.data && result.data.groups) {
        setGroups(result.data.groups);
      } else {
        setGroupsError(result.message || 'Failed to fetch groups');
      }
    } catch (error) {
      setGroupsError('Error fetching groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch participants from API
  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    setParticipantsError(null);
    try {
      const token = getAuthToken();
      const url = new URL('http://localhost:3000/api/participants');
      url.searchParams.append('page', '1');
      url.searchParams.append('limit', '100');
      url.searchParams.append('search', '');
      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      if (result.success && result.data && result.data.participants) {
        setParticipants(result.data.participants);
      } else {
        setParticipantsError(result.message || 'Failed to fetch participants');
      }
    } catch (error) {
      setParticipantsError('Error fetching participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchParticipants();
  }, []);

  // Handlers for Participants
  const handleAddParticipant = async (newParticipant: Omit<Participant, 'id'>) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('You must be logged in to add a participant.');
        return;
      }
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newParticipant),
      });
      const result = await res.json();
      if (!result.success) {
        alert(result.message || 'Failed to add participant');
      }
    } catch (error) {
      alert('Error adding participant');
    }
  };

  const handleEditParticipant = (id: string, updatedParticipant: Omit<Participant, 'id'>) => {
    // Optionally implement API PATCH here if needed
  };

  const handleRemoveParticipant = (id: string) => {
    // Optionally implement API DELETE here if needed
    setGroups(groups.map(g => ({ ...g, members: g.members.filter(m => m !== id) })));
  };

  // Handlers for Groups (API-based)
  const handleAddGroup = async (newGroup: Omit<Group, 'id'>) => {
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:3000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newGroup.name,
          admin: newGroup.admin,
          adminEmail: newGroup.adminEmail,
          participantIds: newGroup.members,
        }),
      });
      const result = await res.json();
      if (result.success) {
        fetchGroups();
      } else {
        alert(result.message || 'Failed to add group');
      }
    } catch (error) {
      alert('Error adding group');
    }
  };

  const handleEditGroup = async (id: string, updatedGroup: Omit<Group, 'id'>) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:3000/api/groups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: updatedGroup.name,
          admin: updatedGroup.admin,
          adminEmail: updatedGroup.adminEmail,
          participantIds: updatedGroup.members,
        }),
      });
      const result = await res.json();
      if (result.success) {
        fetchGroups();
      } else {
        alert(result.message || 'Failed to update group');
      }
    } catch (error) {
      alert('Error updating group');
    }
  };

  const handleRemoveGroup = async (id: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`http://localhost:3000/api/groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        fetchGroups();
      } else {
        alert(result.message || 'Failed to delete group');
      }
    } catch (error) {
      alert('Error deleting group');
    }
  };

  const handleEditGroupMembers = (groupId: string, memberId: string) => {
    // This should be handled via edit group modal and PATCH API
    // Optionally, you can implement member toggling logic here if needed
  };

  // Handlers for Users (dummy, to be implemented with API later)
  const handleAddUser = async (newUser: Omit<User, 'id'>) => {
    // TODO: Implement API call
    setUsers([...users, { ...newUser, id: `u${Date.now()}` }]);
  };
  const handleEditUser = (id: string, updatedUser: Omit<User, 'id'>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
  };
  const handleRemoveUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-1 text-black">People Management</h1>
      <p className="text-black mb-4">Manage your groups and participants efficiently</p>
      
      <div className="flex gap-2 mb-6">
        <button
          className={`px-6 py-2 rounded-full transition-colors ${tab === 'groups' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
          onClick={() => setTab('groups')}
        >
          Groups
        </button>
        <button
          className={`px-6 py-2 rounded-full transition-colors ${tab === 'participants' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
          onClick={() => setTab('participants')}
        >
          Participants
        </button>
        <button
          className={`px-6 py-2 rounded-full transition-colors ${tab === 'users' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
      </div>

      {/* Render appropriate component based on tab */}
      {tab === 'groups' ? (
        groupsLoading ? (
          <div className="text-gray-500">Loading groups...</div>
        ) : groupsError ? (
          <div className="text-red-500">{groupsError}</div>
        ) : participantsLoading ? (
          <div className="text-gray-500">Loading participants...</div>
        ) : participantsError ? (
          <div className="text-red-500">{participantsError}</div>
        ) : (
          <GroupsComponent
            groups={groups}
            participants={participants}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onRemoveGroup={handleRemoveGroup}
            onEditGroupMembers={handleEditGroupMembers}
          />
        )
      ) : tab === 'participants' ? (
        <ParticipantsComponent
          onAddParticipant={handleAddParticipant}
          onEditParticipant={handleEditParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      ) : (
        <UsersComponent
          users={users}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onRemoveUser={handleRemoveUser}
        />
      )}
    </div>
  );
};

export default PeopleManagement;