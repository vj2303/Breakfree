"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AssessorGroup {
  assignmentId: string;
  groupId: string;
  groupName: string;
  adminName: string;
  adminEmail: string;
  participantCount: number;
}

type GroupsData = {
  assigned: AssessorGroup[];
  completed: AssessorGroup[];
  inProgress: AssessorGroup[];
};

export default function AssessorPlatform() {
  const router = useRouter();
  const { user, assessorGroups, assessorGroupsLoading, fetchAssessorGroups } = useAuth();
  const [activeTab, setActiveTab] = useState<keyof GroupsData>('assigned');
  const [groupsData, setGroupsData] = useState<GroupsData>({
    assigned: [],
    completed: [],
    inProgress: []
  });

  useEffect(() => {
    if (assessorGroups?.groups) {
      // For now, we'll put all groups in 'assigned' since the API doesn't specify status
      // You can modify this logic based on your business requirements
      setGroupsData({
        assigned: assessorGroups.groups,
        completed: [],
        inProgress: []
      });
    }
  }, [assessorGroups]);

  useEffect(() => {
    if (!assessorGroups && !assessorGroupsLoading) {
      fetchAssessorGroups();
    }
  }, [assessorGroups, assessorGroupsLoading, fetchAssessorGroups]);

  const tabs = [
    { key: 'assigned', label: 'Assigned' },
    { key: 'completed', label: 'Completed' },
    { key: 'inProgress', label: 'In- Progress' }
  ];

  const GroupCard = ({ group }: { group: AssessorGroup }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.groupName}</h3>
        <div className="space-y-2 mb-6">
          <p className="text-gray-600">
            <span className="text-gray-500">Group Admin:</span> <span className="font-medium">{group.adminName}</span>
          </p>
          <p className="text-gray-600">
            <span className="text-gray-500">Admin Email:</span> <span className="font-medium">{group.adminEmail}</span>
          </p>
          <p className="text-gray-600">
            <span className="text-gray-500">No. of Members:</span> <span className="font-medium">{group.participantCount}</span>
          </p>
        </div>
        <button
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={() => router.push(`/assessor/assess/${group.groupId}`)}
        >
          View
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  if (assessorGroupsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessor groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {assessorGroups?.assessor?.name || user?.firstName || 'Assessor'}
          </h1>
          <p className="text-gray-500 mb-6">
            Manage and assess your assigned groups below.
          </p>
          
          {/* Management Groups Button */}
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-8">
            Management groups
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as keyof GroupsData)}
                className={`pb-3 text-lg font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupsData[activeTab].map((group: AssessorGroup) => (
            <GroupCard key={group.groupId} group={group} />
          ))}
        </div>

        {/* Empty State */}
        {groupsData[activeTab].length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {assessorGroups?.groups?.length === 0 
                ? 'No groups assigned to you yet.' 
                : `No groups found for ${tabs.find(t => t.key === activeTab)?.label}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}