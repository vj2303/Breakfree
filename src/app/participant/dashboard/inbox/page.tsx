'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AssignmentSubmissionApi, SubmissionData } from '@/lib/assignmentSubmissionApi';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, assignments, assignmentsLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState<{
    textContent?: string;
    notes?: string;
    file?: File;
    submissionType: 'TEXT' | 'DOCUMENT' | 'VIDEO';
  }>({
    submissionType: 'TEXT'
  });

  const assignmentId = searchParams.get('assignmentId');

  useEffect(() => {
    if (assignmentId && assignments?.assignments) {
      const assignment = assignments.assignments.find(
        (a: any) => a.assignmentId === assignmentId
      );
      
      if (assignment) {
        setAssignmentData(assignment);
        // Find the first INBOX_ACTIVITY activity
        const inboxActivity = assignment.activities.find(
          (activity: any) => activity.activityType === 'INBOX_ACTIVITY'
        );
        if (inboxActivity) {
          setActivityData(inboxActivity);
        }
        setLoading(false);
      } else {
        setLoading(false);
        router.push('/participant/dashboard');
      }
    } else {
      setLoading(false);
      router.push('/participant/dashboard');
    }
  }, [assignmentId, assignments, router]);

  const stepContent = [
    <OverviewStep key="overview" activityData={activityData} />, 
    <ScenarioStep key="scenario" activityData={activityData} />, 
    <OrganizationChartStep key="orgchart" activityData={activityData} />, 
    <TaskStep key="task" activityData={activityData} submissionData={submissionData} setSubmissionData={setSubmissionData} />
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!token || !assignmentData || !activityData) {
      alert('Missing required data for submission');
      return;
    }

    setSubmitting(true);
    try {
      const submissionPayload: SubmissionData = {
        participantId: assignments?.participant?.id || '',
        assessmentCenterId: assignmentData.assessmentCenter.id,
        activityId: activityData.activityId,
        activityType: 'INBOX_ACTIVITY',
        submissionType: submissionData.submissionType,
        notes: submissionData.notes,
        textContent: submissionData.textContent,
        file: submissionData.file,
      };

      const response = await AssignmentSubmissionApi.submitAssignment(token, submissionPayload);
      
      if (response.success) {
        alert('Assignment submitted successfully!');
        router.push('/participant/dashboard');
      } else {
        alert(`Failed to submit assignment: ${response.message}`);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('An error occurred while submitting the assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignmentData || !activityData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
        <p className="text-gray-600 mb-4">The requested assignment could not be found.</p>
        <button
          onClick={() => router.push('/participant/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-2 mb-6 shadow border">
        <h1 className="text-2xl font-bold mb-1">{assignmentData.assessmentCenter.displayName || assignmentData.assessmentCenter.name}</h1>
        <div className="text-gray-500 text-sm mb-4">
          Created on {new Date(assignmentData.assessmentCenter.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
        <div className="text-gray-600 text-sm mb-4">
          <strong>Competency:</strong> {activityData.competency?.competencyName || 'N/A'}
        </div>
        {/* Stepper */}
        <div className="flex items-center gap-6 mb-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className={`text-sm font-medium ${currentStep === idx ? 'text-black' : 'text-gray-400'}`}>{step}</span>
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
      <div className="mb-6">
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
            onClick={handleNext}
          >
            {currentStep === 0 ? 'Start' : 'Next'}
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InboxPage;