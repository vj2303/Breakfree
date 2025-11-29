"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, ArrowLeft, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AssessmentCenter {
  assignmentId: string;
  assessmentCenterId: string;
  assessmentCenterName: string;
  assessmentCenterDescription: string;
  participantCount: number;
}

interface GroupData {
  groupId: string;
  groupName: string;
  adminName: string;
  adminEmail: string;
  assessmentCenters: AssessmentCenter[];
  totalParticipantCount: number;
}

type ViewState = 'groups' | 'assessmentCenters' | 'participants';

export default function AssessorPlatform() {
  const router = useRouter();
  const { user, assessorGroups, assessorGroupsLoading, fetchAssessorGroups } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('groups');
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [selectedAssessmentCenter, setSelectedAssessmentCenter] = useState<AssessmentCenter | null>(null);

  useEffect(() => {
    if (!assessorGroups && !assessorGroupsLoading) {
      fetchAssessorGroups();
    }
  }, [assessorGroups, assessorGroupsLoading, fetchAssessorGroups]);

  const handleGroupClick = (group: GroupData) => {
    setSelectedGroup(group);
    setViewState('assessmentCenters');
  };

  const handleAssessmentCenterClick = (assessmentCenter: AssessmentCenter) => {
    setSelectedAssessmentCenter(assessmentCenter);
    setViewState('participants');
    // Navigate to the group details page with the correct assessmentCenterId
    router.push(`/assessor/assess/${selectedGroup?.groupId}?assessmentCenterId=${assessmentCenter.assessmentCenterId}`);
  };

  const handleBack = () => {
    if (viewState === 'participants') {
      setViewState('assessmentCenters');
      setSelectedAssessmentCenter(null);
    } else if (viewState === 'assessmentCenters') {
      setViewState('groups');
      setSelectedGroup(null);
    }
  };

  if (assessorGroupsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessor assignments...</p>
        </div>
      </div>
    );
  }

  const groups: GroupData[] = assessorGroups?.groups || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {viewState !== 'groups' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {assessorGroups?.assessor?.name || user?.firstName || 'Assessor'}
          </h1>
          <p className="text-gray-500 mb-6">
            {viewState === 'groups' && 'Select a group to view assessment centers and participants.'}
            {viewState === 'assessmentCenters' && `Assessment Centers in ${selectedGroup?.groupName}`}
            {viewState === 'participants' && `Participants in ${selectedGroup?.groupName} - ${selectedAssessmentCenter?.assessmentCenterName}`}
          </p>
        </div>

        {/* Groups View */}
        {viewState === 'groups' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Groups</h2>
            {groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div
                    key={group.groupId}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.groupName}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="text-gray-500">Admin:</span> {group.adminName}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span> {group.adminEmail}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={16} />
                        <span>{group.assessmentCenters.length} assessment{group.assessmentCenters.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{group.totalParticipantCount} participant{group.totalParticipantCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 text-lg">No groups assigned to you yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Assessment Centers View */}
        {viewState === 'assessmentCenters' && selectedGroup && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Assessment Centers in {selectedGroup.groupName}
            </h2>
            {selectedGroup.assessmentCenters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedGroup.assessmentCenters.map((assessmentCenter) => (
                  <div
                    key={`${assessmentCenter.assessmentCenterId}-${selectedGroup.groupId}`}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAssessmentCenterClick(assessmentCenter)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {assessmentCenter.assessmentCenterName}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {assessmentCenter.assessmentCenterDescription || 'No description available'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
                      <Users size={16} />
                      <span>{assessmentCenter.participantCount} participant{assessmentCenter.participantCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 text-lg">No assessment centers found in this group.</p>
              </div>
            )}
          </div>
        )}

        {/* Participants View - This will be handled by the [id]/page.tsx route */}
        {viewState === 'participants' && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">Loading participants...</p>
          </div>
        )}
      </div>
    </div>
  );
}
