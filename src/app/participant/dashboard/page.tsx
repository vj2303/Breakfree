'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AssessmentCardProps {
  assignmentId: string;
  displayName: string;
  assignedDate: string;
  submitBy: string;
  daysRemaining: number;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  type: string;
  onStart?: (assignmentId: string, activityType: string) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assignmentId,
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

  const getActivityTypeDisplay = (activityType: string) => {
    switch (activityType) {
      case 'INBOX_ACTIVITY':
        return { name: 'Inbox Activity', color: 'bg-blue-100 text-blue-800' };
      case 'CASE_STUDY':
        return { name: 'Case Study', color: 'bg-green-100 text-green-800' };
      default:
        return { name: activityType.replace('_', ' '), color: 'bg-gray-100 text-gray-800' };
    }
  };

  const activityTypeInfo = getActivityTypeDisplay(type);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${activityTypeInfo.color}`}>
              {activityTypeInfo.name}
            </span>
          </div>
          <p className="text-sm text-gray-500">Assigned on {assignedDate}</p>
        </div>
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          onClick={() => onStart && onStart(assignmentId, type)}
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
  const { user, assignments, assignmentsLoading, fetchAssignments } = useAuth();

  useEffect(() => {
    if (!assignments && !assignmentsLoading) {
      fetchAssignments();
    }
  }, [assignments, assignmentsLoading, fetchAssignments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (createdDate: string) => {
    const created = new Date(createdDate);
    const deadline = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from creation
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const getAssessmentStatus = (completionPercentage: number): 'not-started' | 'in-progress' | 'completed' => {
    if (completionPercentage === 0) return 'not-started';
    if (completionPercentage === 100) return 'completed';
    return 'in-progress';
  };

  const assessments: AssessmentCardProps[] = assignments?.assignments.map(assignment => {
    const createdDate = assignment.assessmentCenter.createdAt;
    const deadline = new Date(new Date(createdDate).getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Determine the primary activity type for this assignment
    const primaryActivityType = assignment.activities.length > 0 
      ? assignment.activities[0].activityType 
      : 'CASE_STUDY';
    
    return {
      assignmentId: assignment.assignmentId,
      displayName: assignment.assessmentCenter.displayName || assignment.assessmentCenter.name,
      assignedDate: formatDate(createdDate),
      submitBy: formatDate(deadline.toISOString()),
      daysRemaining: calculateDaysRemaining(createdDate),
      progress: assignment.completionPercentage,
      status: getAssessmentStatus(assignment.completionPercentage),
      type: primaryActivityType
    };
  }) || [];

  const handleStart = (assignmentId: string, activityType: string) => {
    if (activityType === 'CASE_STUDY') {
      router.push(`/participant/dashboard/case-study?assignmentId=${assignmentId}`);
    } else if (activityType === 'INBOX_ACTIVITY') {
      router.push(`/participant/dashboard/inbox?assignmentId=${assignmentId}`);
    } else {
      // Default fallback to main dashboard for unknown activity types
      router.push('/participant/dashboard');
    }
  };

  if (assignmentsLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-gray-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Loading your assignments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : assignments?.participant?.name || 'Participant'}
          </h1>
          <p className="text-gray-600">
            Complete your assigned assessments to showcase your skills and competencies.
          </p>
        </div>
        {/* Assessments Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-full">
            Assessments ({assessments.length})
          </span>
        </div>
        {/* Assessment Cards Grid */}
        {assessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.assignmentId}
                {...assessment}
                onStart={handleStart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">
                You don&apos;t have any assignments at the moment. Check back later or contact your assessor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDashboard;