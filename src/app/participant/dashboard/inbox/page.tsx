'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OverviewStep from './OverviewStep';
import ScenarioStep from './ScenarioStep';
import OrganizationChartStep from './OrganizationChartStep';
import TaskStep from './TaskStep';

const steps = [
  'Overview and Instructions',
  'Scenario Description',
  'Organization Chart',
  'Task',
];

const InboxPage = () => {
  const router = useRouter();
  const { assignments, assignmentsLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<number>(0);

  // Find all activities from assignments (not just inbox activities)
  const allActivities = assignments?.assignments.flatMap(assignment => 
    assignment.activities.map(activity => ({ ...activity, assignment }))
  ) || [];

  // Filter inbox activities for this specific page
  const inboxActivities = allActivities.filter(activity => activity.activityType === 'INBOX_ACTIVITY');

  const currentInboxActivity = inboxActivities[selectedActivity];
  const currentAssignmentData = currentInboxActivity?.assignment;
  const currentActivityDetail = currentInboxActivity?.activityDetail;

  const stepContent = [
    <OverviewStep key="overview" activityDetail={currentActivityDetail} />, 
    <ScenarioStep key="scenario" activityDetail={currentActivityDetail} />, 
    <OrganizationChartStep key="orgchart" activityDetail={currentActivityDetail} />, 
    <TaskStep key="task" activityDetail={currentActivityDetail} />
  ];

  // Loading state
  if (assignmentsLoading) {
    return (
      <div className="mt-8 p-4 flex justify-center items-center">
        <div className="text-lg">Loading assignments...</div>
      </div>
    );
  }

  // Show all activities if no inbox activities, or redirect to activity selection
  if (!inboxActivities.length) {
    if (allActivities.length > 0) {
      // Redirect to activity selection page
      return (
        <div className="mt-8 p-4">
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Select Your Assessment Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allActivities.map((activity) => {
                const getActivityTypeDisplay = (type: string) => {
                  switch (type) {
                    case 'INBOX_ACTIVITY':
                      return { name: 'Inbox Activity', color: 'bg-blue-100 text-blue-800' };
                    case 'CASE_STUDY':
                      return { name: 'Case Study', color: 'bg-green-100 text-green-800' };
                    default:
                      return { name: type.replace('_', ' '), color: 'bg-gray-100 text-gray-800' };
                  }
                };

                const activityType = getActivityTypeDisplay(activity.activityType);
                
                const handleActivityClick = () => {
                  if (activity.activityType === 'INBOX_ACTIVITY') {
                    router.push('/participant/dashboard/inbox');
                  } else if (activity.activityType === 'CASE_STUDY') {
                    router.push('/participant/dashboard/case-study');
                  } else {
                    // Default fallback
                    router.push('/participant/dashboard');
                  }
                };

                return (
                  <div
                    key={activity.activityId}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={handleActivityClick}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activityType.color}`}>
                        {activityType.name}
                      </span>
                      <span className="text-xs text-black">
                        Order: {activity.displayOrder}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black mb-2">{activity.activityDetail.name}</h3>
                    <p className="text-sm text-black mb-3">{activity.activityDetail.description}</p>
                    <div className="text-xs text-black">
                      <div>Assessment: {activity.assignment.assessmentCenter.displayName}</div>
                      <div>Competency: {activity.competency.competencyName}</div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs ${activity.isSubmitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {activity.isSubmitted ? 'Completed' : 'Pending'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Start →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-8 p-4">
        <div className="bg-white rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-black">No Activities Found</h2>
          <p className="text-black">You don&apos;t have any activities assigned at the moment.</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleStart = () => {
    // Check if we have a current activity and route based on its type
    if (currentInboxActivity) {
      const activityType = currentInboxActivity.activityType;
      
      if (activityType === 'INBOX_ACTIVITY') {
        // Stay in inbox flow and proceed to next step
        handleNext();
      } else if (activityType === 'CASE_STUDY') {
        // Redirect to case study flow
        router.push('/participant/dashboard/case-study');
      } else {
        // For other activity types, redirect to main dashboard
        router.push('/participant/dashboard');
      }
    } else {
      // Fallback to next step if no activity detected
      handleNext();
    }
  };

  return (
    <div className="mt-8 p-4">
      {/* Activity Selection */}
      {inboxActivities.length > 1 && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow border">
          <h3 className="text-lg text-black font-semibold mb-3">Select Inbox Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inboxActivities.map((activity, idx) => (
              <button
                key={activity.activityId}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedActivity === idx 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedActivity(idx)}
              >
                <div className="font-medium text-black">{activity.activityDetail.name}</div>
                <div className="text-sm text-black">{activity.assignment.assessmentCenter.displayName}</div>
                <div className="text-xs text-black mt-1">
                  Competency: {activity.competency.competencyName}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-2 mb-6 shadow border">
        <h1 className="text-2xl font-bold mb-1 text-black">
          {currentAssignmentData?.assessmentCenter.displayName || 'Assessment Center'}, 
          <span className="font-normal text-lg text-black"> {currentActivityDetail?.name || 'Inbox Activity'}</span>
        </h1>
        <div className="text-black text-sm mb-4">
          Date: {new Date().toLocaleDateString('en-GB')} | 
          Competency: {currentInboxActivity?.competency.competencyName}
        </div>
        {/* Stepper */}
        <div className="flex items-center gap-6 mb-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className={`text-sm font-medium ${currentStep === idx ? 'text-black' : 'text-black'}`}>{step}</span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1
                  ${currentStep === idx ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}
                >
                  {currentStep > idx ? (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  ) : currentStep === idx ? (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  ) : null}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="w-8 h-1 bg-gray-200 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6 text-black">
        {stepContent[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-2">
        {currentStep > 0 && (
          <button
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
            onClick={handlePrev}
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            className="px-6 py-2 rounded bg-gray-800 text-white font-medium hover:bg-gray-700"
            onClick={currentStep === 0 ? handleStart : handleNext}
          >
            {currentStep === 0 ? 'Start' : 'Next'}
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
            onClick={() => alert('Submit!')}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default InboxPage;