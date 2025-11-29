"use client";

import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';

interface ParticipantData {
  id: string;
  userCode: string;
  name: string;
  email: string;
  designation: string;
  contactNo: string;
  managerName: string;
}

interface GroupData {
  id: string;
  name: string;
  participants: ParticipantData[];
}

interface GroupDetailsProps {
  group: GroupData;
  participants: ParticipantData[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onParticipantSelect: (participant: ParticipantData) => void;
  onBack: () => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  participants,
  searchValue,
  onSearchChange,
  onParticipantSelect,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{group.name}</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Group details</h3>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by participant name"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      {/* Participants Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User code</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">E-mail</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Designation</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact no.</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Manager Name</th>
            </tr>
          </thead>
          <tbody>
            {participants.length > 0 ? (
              participants.map((participant) => (
                <tr
                  key={participant.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onParticipantSelect(participant)}
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.userCode}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.designation}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.contactNo}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{participant.managerName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No participants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupDetails;

