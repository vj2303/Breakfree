"use client";

import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssessmentDetailProps {
  params: { id: string };
}

const mockAssessments = [
  { id: '1', name: 'Group Name', admin: 'John Doe', members: 5 },
  { id: '2', name: 'Development Team', admin: 'Jane Smith', members: 8 },
  { id: '3', name: 'Marketing Group', admin: 'Mike Johnson', members: 6 },
  { id: '4', name: 'Project Alpha', admin: 'Sarah Wilson', members: 4 },
  { id: '5', name: 'Research Team', admin: 'David Brown', members: 7 },
  { id: '6', name: 'Beta Testing', admin: 'Lisa Davis', members: 5 },
  { id: '7', name: 'Design Squad', admin: 'Tom Anderson', members: 3 },
  { id: '8', name: 'Quality Assurance', admin: 'Emma Thompson', members: 9 },
];

// Sample participants data
const participantsData = [
  {
    id: 1,
    name: "Participant Name",
    email: "participant@email.com",
    activities: [
      { name: "Case Study", type: "Score Assessment" },
      { name: "Inbox", type: "Score Assessment" }
    ]
  },
  {
    id: 2,
    name: "Participant Name",
    email: "participant@email.com",
    activities: [
      { name: "Case Study", type: "Score Assessment" },
      { name: "Inbox", type: "Score Assessment" }
    ]
  },
  {
    id: 3,
    name: "Participant Name",
    email: "participant@email.com",
    activities: [
      { name: "Case Study", type: "Score Assessment" },
      { name: "Inbox", type: "Score Assessment" }
    ]
  },
  {
    id: 4,
    name: "Participant Name",
    email: "participant@email.com",
    activities: [
      { name: "Inbox", type: "Score Assessment" }
    ]
  }
];

const AssessmentDetail = ({ params }: AssessmentDetailProps) => {
  const { id } = params;
  const assessment = mockAssessments.find(a => a.id === id);
  const router = useRouter();

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4">Assessment Not Found</h1>
          <p className="text-lg">No assessment found for ID: {id}</p>
        </div>
      </div>
    );
  }

  const ParticipantCard = ({ participant }: { participant: { id: number; name: string; email: string; activities: { name: string; type: string }[] } }) => (
    <div className="bg-slate-600 text-white rounded-lg p-4 mb-4">
      <div className="mb-3">
        <h4 className="font-semibold text-lg">{participant.name}</h4>
        <p className="text-slate-300 text-sm">{participant.email}</p>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2">Activity</div>
        {participant.activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-500 bg-opacity-50 rounded p-2">
            <span className="text-sm">{activity.name}</span>
            <button
              className="flex items-center gap-1 text-sm text-slate-200 hover:text-white transition-colors"
              onClick={() => router.push(`/assessor/assess/${id}/score/${participant.id}`)}
            >
              {activity.type}
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Assessment</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Group Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{assessment.name}</h2>
            <p className="text-gray-600 mb-6">Group Admin Name</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Details</h3>
            <p className="text-gray-700 mb-6">Assigning Date- 12/ 02/ 2025</p>
            
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Assessment Center Name</h4>
            
            {/* Assessor Guide */}
            <div className="mb-8">
              <button className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                <FileText size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Assessor guide</div>
                  <div className="text-sm text-gray-600">Click to view</div>
                </div>
              </button>
            </div>
          </div>

          {/* Group Members */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Group Member</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {participantsData.map((participant) => (
                <ParticipantCard key={participant.id} participant={participant} />
              ))}
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-8">
            <button className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Generate Management Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;