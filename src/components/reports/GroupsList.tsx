"use client";

import React from 'react';

interface GroupData {
  id: string;
  name: string;
  participants: any[];
}

interface GroupsListProps {
  groups: GroupData[];
  onGroupSelect: (group: GroupData) => void;
}

const GroupsList: React.FC<GroupsListProps> = ({ groups, onGroupSelect }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Groups</h3>
        <p className="text-sm text-gray-600 mt-1">Select a group to view participants</p>
      </div>

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onGroupSelect(group)}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {group.participants?.length || 0} participant{group.participants?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-blue-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No groups available
        </div>
      )}
    </div>
  );
};

export default GroupsList;

