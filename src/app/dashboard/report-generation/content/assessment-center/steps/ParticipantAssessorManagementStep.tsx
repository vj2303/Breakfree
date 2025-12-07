import React, { useEffect, useState } from 'react';
import { useAssessmentForm } from '../create/context';
import { useAuth } from '../../../../../../context/AuthContext';
import Select, { StylesConfig, GroupBase, MultiValue } from 'react-select';

const GROUPS_API = 'http://localhost:3001/api/groups?page=1&limit=10&search=';
const ASSESSORS_API = 'http://localhost:3001/api/assessors?page=1&limit=10&search=';

// Define types
interface Participant {
  id: string;
  name: string;
  email: string;
  designation: string;
}

interface Group {
  id: string;
  name: string;
  admin: string;
  adminEmail: string;
  participants: Participant[];
}

interface Assessor {
  id: string;
  name: string;
  email: string;
}

// Updated interfaces to support multiple assessors per activity
interface ActivityAssignment {
  activityId: string;
  assessorIds: string[]; // Multiple assessors per activity
}

interface AssignmentParticipant {
  participantId: string;
  activities: ActivityAssignment[]; // Array of activity assignments
}

interface GroupAssignment {
  groupId: string;
  participants: AssignmentParticipant[];
}

// Define interface for activity from formData
interface FormActivity {
  activityType?: string;
  activityContent?: string;
  id?: string;
  displayName?: string;
  name?: string;
}

type OptionType = { value: string; label: string };

const customStyles: StylesConfig<OptionType, true, GroupBase<OptionType>> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    minHeight: '38px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e2e8f0',
    borderRadius: '6px',
    color: 'black',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#374151',
    fontSize: '14px',
  }),
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isSelected ? '#e2e8f0' : state.isFocused ? '#f8fafc' : 'white',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    color: 'black',
    zIndex: 9999,
  }),
  input: (provided) => ({
    ...provided,
    color: 'black',
  }),
};

const singleSelectStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    borderColor: '#e2e8f0',
    borderRadius: '8px',
    minHeight: '38px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '&:hover': {
      borderColor: '#cbd5e1',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isSelected ? '#e2e8f0' : state.isFocused ? '#f8fafc' : 'white',
    '&:hover': {
      backgroundColor: '#f1f5f9',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    color: 'black',
    zIndex: 9999,
  }),
  input: (provided) => ({
    ...provided,
    color: 'black',
  }),
};

const ParticipantAssessorManagementStep: React.FC = () => {
  const context = useAssessmentForm();
  const { token } = useAuth();
  
  if (!context) {
    throw new Error('ParticipantAssessorManagementStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;
  const [groups, setGroups] = useState<Group[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  
  // Convert old format to new format if needed
  const convertToNewFormat = (oldAssignments: any[]): GroupAssignment[] => {
    return oldAssignments.map((assignment) => {
      const participants = assignment.participants.map((p: any) => {
        // Check if it's old format (has activityIds and assessorId)
        if (p.activityIds && Array.isArray(p.activityIds) && p.assessorId) {
          // Convert old format to new format
          const activities: ActivityAssignment[] = p.activityIds.map((activityId: string) => ({
            activityId,
            assessorIds: p.assessorId ? [p.assessorId] : []
          }));
          return {
            participantId: p.participantId,
            activities
          };
        }
        // Already in new format or empty
        return {
          participantId: p.participantId,
          activities: p.activities || []
        };
      });
      return {
        groupId: assignment.groupId,
        participants
      };
    });
  };
  
  const [assignments, setAssignments] = useState<GroupAssignment[]>(() => {
    const rawAssignments = (formData.assignments as unknown as GroupAssignment[]) || [];
    return convertToNewFormat(rawAssignments);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Authentication token not available');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [groupsRes, assessorsRes] = await Promise.all([
          fetch(GROUPS_API, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(ASSESSORS_API, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const groupsData = await groupsRes.json();
        const assessorsData = await assessorsRes.json();
        setGroups(groupsData?.data?.groups || []);
        setAssessors(assessorsData?.data?.assessors || []);
      } catch {
        setError('Failed to fetch groups or assessors');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    updateFormData('assignments', assignments);
    try {
      console.log('[Assessment Center][ParticipantAssessorManagement] assignments updated:', assignments);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  // Log when step is saved/next is clicked
  useEffect(() => {
    const handleStepSave = () => {
      try {
        console.log('=== PARTICIPANT ASSESSOR MANAGEMENT STEP SAVED ===');
        console.log('Current assignments:', assignments);
        console.log('Groups count:', groups.length);
        console.log('Assessors count:', assessors.length);
        console.log('Step validation:', {
          hasAssignments: assignments.length > 0,
          hasGroups: groups.length > 0,
          hasAssessors: assessors.length > 0,
          totalAssignments: assignments.reduce((sum, g) => sum + g.participants.length, 0)
        });
      } catch {}
    };

    // Listen for step save events
    window.addEventListener('step-save', handleStepSave);
    return () => window.removeEventListener('step-save', handleStepSave);
  }, [assignments, groups, assessors]);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleActivityAssessorsChange = (
    groupId: string,
    participantId: string,
    activityId: string,
    assessorIds: string[]
  ) => {
    setAssignments(prev => {
      const groupIdx = prev.findIndex((g) => g.groupId === groupId);
      const newAssignments = [...prev];
      
      if (groupIdx === -1) {
        // Create new group assignment
        const newParticipant: AssignmentParticipant = {
          participantId,
          activities: [{ activityId, assessorIds }],
        };
        newAssignments.push({ 
          groupId, 
          participants: [newParticipant] 
        });
      } else {
        const participantIdx = newAssignments[groupIdx].participants.findIndex((p) => p.participantId === participantId);
        if (participantIdx === -1) {
          // Add new participant to existing group
          const newParticipant: AssignmentParticipant = {
            participantId,
            activities: [{ activityId, assessorIds }],
          };
          newAssignments[groupIdx].participants.push(newParticipant);
        } else {
          // Update existing participant
          const updatedParticipant = { ...newAssignments[groupIdx].participants[participantIdx] };
          const activityIdx = updatedParticipant.activities.findIndex((a) => a.activityId === activityId);
          
          if (activityIdx === -1) {
            // Add new activity assignment
            updatedParticipant.activities.push({ activityId, assessorIds });
          } else {
            // Update existing activity assignment
            updatedParticipant.activities[activityIdx] = { activityId, assessorIds };
          }
          newAssignments[groupIdx].participants[participantIdx] = updatedParticipant;
        }
      }
      return newAssignments;
    });
  };

  // Get available activities from formData
  const getAvailableActivities = (): OptionType[] => {
    const formActivities = formData.activities || [];
    return formActivities.map((activity: FormActivity) => {
      const activityTypeLabel = activity.activityType === 'case-study' ? 'Case Study' : 
                               activity.activityType === 'inbox-activity' ? 'Inbox Activity' : 
                               activity.activityType || 'Unknown';
      const displayName = activity.displayName || activity.name || 'Unnamed Activity';
      
      return {
        value: activity.activityContent || activity.id || '',
        label: `${displayName} (${activityTypeLabel})`,
      };
    });
  };

  const availableActivities = getAvailableActivities();
  const assessorOptions: OptionType[] = assessors.map((ass) => ({
    value: ass.id,
    label: `${ass.name} (${ass.email})`,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading groups and assessors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Participant and Assessor Management</h2>
        <p className="text-gray-600 text-sm">Assign multiple assessors to each activity for each participant.</p>
      </div>

      <div className="space-y-4">
        {groups.map(group => {
          const isExpanded = expandedGroups.has(group.id);
          const groupAssignment = assignments.find((g) => g.groupId === group.id);
          const assignedCount = groupAssignment?.participants.length || 0;
          
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
              {/* Group Header - Always Visible */}
              <div 
                className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors duration-200"
                onClick={() => toggleGroupExpansion(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {group.participants.length} participant{group.participants.length !== 1 ? 's' : ''}
                        </span>
                        {assignedCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {assignedCount} assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 transition-transform duration-200 hover:bg-gray-50 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Details - Expandable */}
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Admin:</span> {group.admin} ({group.adminEmail})
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="space-y-6 p-4">
                    {group.participants.map((participant) => {
                      const defaultAssignment: AssignmentParticipant = { 
                        participantId: participant.id,
                        activities: []
                      };
                      const participantAssignment = groupAssignment?.participants.find((p) => p.participantId === participant.id) || defaultAssignment;
                      
                      return (
                        <div key={participant.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                          {/* Participant Header */}
                          <div className="mb-4 pb-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-base font-semibold text-gray-900">{participant.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600">{participant.email}</span>
                                  <span className="text-sm text-gray-500">•</span>
                                  <span className="text-sm text-gray-600">{participant.designation}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Step 1: Select Activities for Participant */}
                          <div className="mb-6 pb-6 border-b border-gray-200">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                              Select Activities for this Participant
                            </label>
                            <div className="w-full max-w-2xl">
                              <Select<OptionType, true>
                                isMulti
                                options={availableActivities}
                                value={availableActivities.filter((a) => {
                                  const assignedActivityIds = participantAssignment.activities.map(act => act.activityId);
                                  return assignedActivityIds.includes(a.value);
                                })}
                                onChange={(selected: MultiValue<OptionType>) => {
                                  const selectedActivityIds = selected ? selected.map((s) => s.value) : [];
                                  const currentActivityIds = participantAssignment.activities.map(a => a.activityId);
                                  
                                  // Remove activities that are no longer selected
                                  const activitiesToKeep = participantAssignment.activities.filter(a => 
                                    selectedActivityIds.includes(a.activityId)
                                  );
                                  
                                  // Add new activities that were just selected
                                  const newActivityIds = selectedActivityIds.filter(id => 
                                    !currentActivityIds.includes(id)
                                  );
                                  
                                  const newActivities = [
                                    ...activitiesToKeep,
                                    ...newActivityIds.map(id => ({ activityId: id, assessorIds: [] }))
                                  ];
                                  
                                  // Update all activities at once
                                  setAssignments(prev => {
                                    const groupIdx = prev.findIndex((g) => g.groupId === group.id);
                                    const newAssignments = [...prev];
                                    
                                    if (groupIdx === -1) {
                                      newAssignments.push({
                                        groupId: group.id,
                                        participants: [{
                                          participantId: participant.id,
                                          activities: newActivities
                                        }]
                                      });
                                    } else {
                                      const participantIdx = newAssignments[groupIdx].participants.findIndex(
                                        (p) => p.participantId === participant.id
                                      );
                                      if (participantIdx === -1) {
                                        newAssignments[groupIdx].participants.push({
                                          participantId: participant.id,
                                          activities: newActivities
                                        });
                                      } else {
                                        newAssignments[groupIdx].participants[participantIdx] = {
                                          participantId: participant.id,
                                          activities: newActivities
                                        };
                                      }
                                    }
                                    return newAssignments;
                                  });
                                }}
                                styles={customStyles}
                                placeholder="Select activities for this participant..."
                                closeMenuOnSelect={false}
                                classNamePrefix="react-select"
                                isSearchable={true}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                              />
                              {participantAssignment.activities.length > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                  {participantAssignment.activities.length} activit{participantAssignment.activities.length !== 1 ? 'ies' : 'y'} selected
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Step 2: Assign Assessors for Each Selected Activity */}
                          {participantAssignment.activities.length > 0 && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Assign Assessors for Each Activity
                              </label>
                              <div className="space-y-3">
                                {participantAssignment.activities.map((activityAssignment) => {
                                  const activity = availableActivities.find(a => a.value === activityAssignment.activityId);
                                  if (!activity) return null;
                                  
                                  const selectedAssessorIds = activityAssignment.assessorIds || [];
                                  
                                  return (
                                    <div key={activityAssignment.activityId} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                                      <div className="flex items-start gap-4">
                                        {/* Activity Label */}
                                        <div className="flex-shrink-0 w-56">
                                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                                            {activity.label}
                                          </label>
                                          <p className="text-xs text-gray-500">Assign assessors</p>
                                        </div>
                                        
                                        {/* Assessors Multi-Select */}
                                        <div className="flex-1 min-w-[350px]">
                                          <Select<OptionType, true>
                                            isMulti
                                            options={assessorOptions}
                                            value={assessorOptions.filter((a) => selectedAssessorIds.includes(a.value))}
                                            onChange={(selected: MultiValue<OptionType>) => {
                                              const assessorIds = selected ? selected.map((s) => s.value) : [];
                                              handleActivityAssessorsChange(
                                                group.id,
                                                participant.id,
                                                activityAssignment.activityId,
                                                assessorIds
                                              );
                                            }}
                                            styles={customStyles}
                                            placeholder="Select multiple assessors..."
                                            closeMenuOnSelect={false}
                                            classNamePrefix="react-select"
                                            isSearchable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                          />
                                          {selectedAssessorIds.length > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-900 text-white">
                                                {selectedAssessorIds.length} assessor{selectedAssessorIds.length !== 1 ? 's' : ''}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {participantAssignment.activities.length === 0 && availableActivities.length > 0 && (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                              <p className="text-sm text-gray-500">
                                Select activities above to assign assessors
                              </p>
                            </div>
                          )}
                          
                          {availableActivities.length === 0 && (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm">No activities available. Please add activities in previous steps.</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Available</h3>
          <p className="text-gray-600">No groups found. Please create groups first before managing participant assignments.</p>
        </div>
      )}
    </div>
  );
};

export default ParticipantAssessorManagementStep;