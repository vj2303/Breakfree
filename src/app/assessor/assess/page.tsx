"use client";

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

type Group = {
  id: number;
  name: string;
  admin: string;
  members: number;
};

type GroupsData = {
  assigned: Group[];
  completed: Group[];
  inProgress: Group[];
};

const groupsData: GroupsData = {
  assigned: [
    { id: 1, name: "Group Name", admin: "John Doe", members: 5 },
    { id: 2, name: "Development Team", admin: "Jane Smith", members: 8 },
    { id: 3, name: "Marketing Group", admin: "Mike Johnson", members: 6 },
  ],
  completed: [
    { id: 4, name: "Project Alpha", admin: "Sarah Wilson", members: 4 },
    { id: 5, name: "Research Team", admin: "David Brown", members: 7 },
  ],
  inProgress: [
    { id: 6, name: "Beta Testing", admin: "Lisa Davis", members: 5 },
    { id: 7, name: "Design Squad", admin: "Tom Anderson", members: 3 },
    { id: 8, name: "Quality Assurance", admin: "Emma Thompson", members: 9 },
  ]
};

export default function AssessorPlatform() {
  const [activeTab, setActiveTab] = useState<keyof GroupsData>('assigned');

  const tabs = [
    { key: 'assigned', label: 'Assigned' },
    { key: 'completed', label: 'Completed' },
    { key: 'inProgress', label: 'In- Progress' }
  ];

  const GroupCard = ({ group }: { group: Group }) => {
    const router = require('next/navigation').useRouter();
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{group.name}</h3>
        <div className="space-y-2 mb-6">
          <p className="text-gray-600">
            <span className="text-gray-500">Group Admin :</span> <span className="font-medium">{group.admin}</span>
          </p>
          <p className="text-gray-600">
            <span className="text-gray-500">No. of Members:</span> <span className="font-medium">{group.members}</span>
          </p>
        </div>
        <button
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          onClick={() => router.push(`/assessor/assess/${group.id}`)}
        >
          View
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Assessor name
          </h1>
          <p className="text-gray-500 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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
          {groupsData[activeTab].map((group: Group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {/* Empty State */}
        {groupsData[activeTab].length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No groups found for {tabs.find(t => t.key === activeTab)?.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}