'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

interface AssessmentCardProps {
  displayName: string;
  assignedDate: string;
  submitBy: string;
  daysRemaining: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  type: 'case-study' | 'inbox';
  onStart?: (type: 'case-study' | 'inbox') => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  displayName,
  assignedDate,
  submitBy,
  daysRemaining,
  progress,
  status,
  type,
  onStart
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'not-started':
        return 'Not Started yet';
      case 'in-progress':
        return `${progress}%`;
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };

  const getProgressBarStyle = () => {
    if (status === 'completed') {
      return { width: '100%' };
    }
    return { width: `${progress}%` };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{displayName}</h3>
          <p className="text-sm text-gray-500">Assigned on {assignedDate}</p>
        </div>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          onClick={() => onStart && onStart(type)}
        >
          Start Now
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Submit By: {submitBy}</span>
          <span className="text-gray-600">{daysRemaining} days remaining</span>
        </div>
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                status === 'completed'
                  ? 'bg-blue-600'
                  : status === 'in-progress'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
              style={getProgressBarStyle()}
            />
          </div>
          <div className="text-sm text-gray-600 text-right">
            {getStatusText()}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssessmentDashboard: React.FC = () => {
  const router = useRouter();
  const assessments: AssessmentCardProps[] = [
    {
      displayName: "Case Study Assessment",
      assignedDate: "02/03/2025",
      submitBy: "10/01/2025",
      daysRemaining: 8,
      progress: 0,
      status: "not-started",
      type: 'case-study',
    },
    {
      displayName: "Inbox Assessment",
      assignedDate: "02/03/2025",
      submitBy: "10/01/2025",
      daysRemaining: 8,
      progress: 100,
      status: "completed",
      type: 'inbox',
    },
    {
      displayName: "Case Study Assessment 2",
      assignedDate: "02/03/2025",
      submitBy: "10/01/2025",
      daysRemaining: 8,
      progress: 30,
      status: "in-progress",
      type: 'case-study',
    }
  ];

  const handleStart = (type: 'case-study' | 'inbox') => {
    if (type === 'case-study') {
      router.push('/participant/dashboard/case-study');
    } else if (type === 'inbox') {
      router.push('/participant/dashboard/inbox');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Participant name
          </h1>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        {/* Assessments Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-full">
            Assessments ({assessments.length})
          </span>
        </div>
        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment, index) => (
            <AssessmentCard
              key={index}
              {...assessment}
              onStart={handleStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;