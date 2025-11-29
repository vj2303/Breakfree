"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ParticipantScoringProps {
  params: Promise<{ id: string; participantId: string }>;
}

interface ParticipantDetails {
  success: boolean;
  message: string;
  data: {
    assessor: {
      id: string;
      name: string;
      email: string;
      designation: string;
      accessLevel: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    participant: {
      id: string;
      name: string;
      email: string;
      designation: string;
      managerName: string;
      createdAt: string;
      updatedAt: string;
    };
    assignments: Array<{
      assignmentId: string;
      assessmentCenter: {
        id: string;
        name: string;
        description: string;
        displayName: string;
        displayInstructions: string;
        competencyIds: string[];
        documentUrl?: string;
        reportTemplateName: string;
        reportTemplateType: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
      };
      group: {
        id: string;
        name: string;
        admin: string;
        adminEmail: string;
        participantIds: string[];
        createdAt: string;
        updatedAt: string;
      };
      activities: Array<{
        activityId: string;
        activityType: string;
        displayOrder: number;
        competency: {
          id: string;
          competencyName: string;
          subCompetencyNames: string[];
          createdAt: string;
          updatedAt: string;
        };
        activityDetail: {
          id: string;
          name: string;
          description: string;
          instructions: string;
          videoUrl?: string;
        };
        submission: unknown;
      }>;
      assessorScore: unknown;
      submissionCount: number;
      totalActivities: number;
      competencies: Array<{
        id: string;
        competencyName: string;
        subCompetencyNames: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    }>;
  };
}

interface Evaluation {
  metric: string;
  reasoning: string;
  score: string;
}

interface EvaluationResponse {
  evaluations: Evaluation[];
  filename: string;
  overall_score: string;
  success: boolean;
  summary: {
    average_score: string;
    total_metrics: number;
  };
}

interface AssessorScore {
  status?: 'DRAFT' | 'SUBMITTED' | 'FINALIZED';
  competencyScores?: Record<string, Record<string, number>>;
  overallComments?: string;
}

interface ActivityWithSubmissions {
  activityId: string;
  activityType: string;
  displayOrder: number;
  competency?: {
    id: string;
    competencyName: string;
    subCompetencyNames: string[];
    createdAt: string;
    updatedAt: string;
  };
  activityDetail: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    videoUrl?: string;
  };
  submission: unknown;
  allSubmissions?: Array<{
    id: string;
    parentSubmissionId?: string;
    textContent?: string;
    submissionType?: string;
    submissionStatus?: string;
    submittedAt?: string;
    createdAt?: string;
    notes?: string;
    fileUrl?: string;
    fileName?: string;
  }>;
}

const AssessmentDetail = ({ params }: ParticipantScoringProps) => {
  const { participantId } = React.use(params);
  const router = useRouter();
  const { assessorId, token } = useAuth();
  const [participantDetails, setParticipantDetails] = useState<ParticipantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationResponse | null>(null);
  // Removed unused averageScore state
  const [comments, setComments] = useState<Record<string, string>>({}); // assignmentId -> comments
  const [competencyScores, setCompetencyScores] = useState<Record<string, Record<string, Record<string, number>>>>({}); // assignmentId -> competencyId -> subCompetency -> score
  const [activityCompetencyScores, setActivityCompetencyScores] = useState<Record<string, Record<string, Record<string, number>>>>({}); // activityId -> competencyId -> subCompetency -> score
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreStatus, setScoreStatus] = useState<Record<string, 'DRAFT' | 'SUBMITTED' | 'FINALIZED'>>({}); // assignmentId -> status
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [assessmentCenterId, setAssessmentCenterId] = useState<string | null>(null);

  // Get assessmentCenterId from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const centerId = params.get('assessmentCenterId');
      setAssessmentCenterId(centerId);
    }
  }, []);

  useEffect(() => {
    const fetchParticipantDetails = async () => {
      if (!assessorId || !token) {
        setError('Assessor ID or token not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/assessors/${assessorId}/participants/${participantId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.success) {
          setParticipantDetails(result);
        } else {
          setError(result.message || 'Failed to fetch participant details');
        }
      } catch (err) {
        console.error('Error fetching participant details:', err);
        setError('An error occurred while fetching participant details');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantDetails();
  }, [assessorId, token, participantId]);

  // Initialize competency scores when participant details are loaded
  useEffect(() => {
    if (participantDetails?.data.assignments) {
      const initialScores: Record<string, Record<string, Record<string, number>>> = {};
      const initialActivityScores: Record<string, Record<string, Record<string, number>>> = {};
      const initialStatus: Record<string, 'DRAFT' | 'SUBMITTED' | 'FINALIZED'> = {};
      
      // Initialize scores for each assignment
      participantDetails.data.assignments.forEach(assignment => {
        const assignmentId = assignment.assignmentId;
        initialScores[assignmentId] = {};
        const assessorScore = assignment.assessorScore as AssessorScore | null;
        initialStatus[assignmentId] = assessorScore?.status || 'DRAFT';
        
        // Load existing scores if available
        if (assessorScore) {
          const existingScores = assessorScore.competencyScores || {};
          Object.keys(existingScores).forEach(competencyId => {
            initialScores[assignmentId][competencyId] = {};
            Object.keys(existingScores[competencyId]).forEach(subComp => {
              initialScores[assignmentId][competencyId][subComp] = existingScores[competencyId][subComp];
            });
          });
          // Load existing comments
          if (assessorScore.overallComments) {
            setComments(prev => ({
              ...prev,
              [assignmentId]: assessorScore.overallComments || ''
            }));
          }
        }
        
        // Initialize default scores for competencies not yet scored
        assignment.competencies.forEach(competency => {
          if (!initialScores[assignmentId][competency.id]) {
            initialScores[assignmentId][competency.id] = {};
          }
        competency.subCompetencyNames.forEach(subComp => {
            if (!initialScores[assignmentId][competency.id][subComp]) {
              initialScores[assignmentId][competency.id][subComp] = 5.0; // Default score
            }
        });
      });

        // Initialize per-activity competency scores
        assignment.activities.forEach(activity => {
          if (!initialActivityScores[activity.activityId]) {
            initialActivityScores[activity.activityId] = {};
          }
          if (activity.competency) {
            if (!initialActivityScores[activity.activityId][activity.competency.id]) {
              initialActivityScores[activity.activityId][activity.competency.id] = {};
            }
            activity.competency.subCompetencyNames.forEach(subComp => {
              if (!initialActivityScores[activity.activityId][activity.competency.id][subComp]) {
                initialActivityScores[activity.activityId][activity.competency.id][subComp] = 5.0;
              }
            });
          }
        });
      });

      setCompetencyScores(initialScores);
      setActivityCompetencyScores(initialActivityScores);
      setScoreStatus(initialStatus);
      
      // Set assignment based on assessmentCenterId from URL, or first assignment
      if (participantDetails.data.assignments.length > 0) {
        let targetAssignment = participantDetails.data.assignments[0];
        
        // If assessmentCenterId is provided, find matching assignment
        if (assessmentCenterId) {
          const matchingAssignment = participantDetails.data.assignments.find(
            a => a.assessmentCenter.id === assessmentCenterId
          );
          if (matchingAssignment) {
            targetAssignment = matchingAssignment;
          }
        }
        
        setSelectedAssignmentId(targetAssignment.assignmentId);
        if (targetAssignment.activities.length > 0) {
          setSelectedActivityId(targetAssignment.activities[0].activityId);
        }
      }
    }
  }, [participantDetails, assessmentCenterId]);

  const updateCompetencyScore = (assignmentId: string, competencyId: string, subCompetency: string, score: number) => {
    setCompetencyScores(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId] || {},
      [competencyId]: {
          ...(prev[assignmentId]?.[competencyId] || {}),
        [subCompetency]: score
        }
      }
    }));
  };

  const updateActivityCompetencyScore = (activityId: string, competencyId: string, subCompetency: string, score: number) => {
    setActivityCompetencyScores(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId] || {},
        [competencyId]: {
          ...(prev[activityId]?.[competencyId] || {}),
          [subCompetency]: score
        }
      }
    }));
  };

  const submitScores = async (assignmentId: string, status: 'DRAFT' | 'SUBMITTED') => {
    if (!participantDetails?.data || !assessorId || !token) {
      setError('Missing required data for score submission');
      return;
    }

    setIsSubmittingScore(true);
    setError(null);

    try {
      const assignment = participantDetails.data.assignments.find(a => a.assignmentId === assignmentId);
      if (!assignment) {
        throw new Error('No assignment data available');
      }

      const payload = {
        participantId: participantDetails.data.participant.id,
        assessorId: assessorId,
        assessmentCenterId: assignment.assessmentCenter.id,
        competencyScores: competencyScores[assignmentId] || {},
        activityCompetencyScores: activityCompetencyScores, // Include per-activity scores
        overallComments: comments[assignmentId] || '',
        status: status
      };

      // POST will auto-create or auto-update existing scores
      const response = await fetch('/api/assessors/scores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setScoreStatus(prev => ({ ...prev, [assignmentId]: status }));
        alert(`Scores ${status === 'DRAFT' ? 'saved as draft' : 'submitted'} successfully for ${assignment.assessmentCenter.displayName}!`);
      } else {
        throw new Error(result.message || 'Failed to submit scores');
      }
    } catch (err) {
      console.error('Error submitting scores:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting scores');
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      if (!participantDetails?.data || !assessorId || !token) {
        throw new Error('Missing required data for report generation');
      }

      const assignment = participantDetails.data.assignments[0];
      if (!assignment) {
        throw new Error('No assignment data available');
      }

      console.log('Generating PDF report...');
      
      // Call the report generation API with actual data
      const reportResponse = await fetch('/api/report-structures/generate-from-assessment-center', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participantDetails.data.participant.id,
          assessorId: assessorId,
          assessmentCenterId: assignment.assessmentCenter.id,
          reportTemplateName: assignment.assessmentCenter.reportTemplateName,
          reportTemplateType: assignment.assessmentCenter.reportTemplateType,
        }),
      });

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json().catch(() => ({ message: 'Failed to generate report' }));
        throw new Error(errorData.message || `Failed to generate report: ${reportResponse.status}`);
      }

      const reportBlob = await reportResponse.blob();
      
      // Create a download link and trigger download
      const downloadUrl = window.URL.createObjectURL(reportBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      const reportFileName = `${assignment.assessmentCenter.displayName || assignment.assessmentCenter.name}_${participantDetails.data.participant.name}_Report.pdf`.replace(/[^a-z0-9]/gi, '_');
      downloadLink.download = reportFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
      console.log('PDF report downloaded successfully');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the report');
      console.error('Error generating report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const evaluateInterview = async () => {
    setIsEvaluating(true);
    setError(null);
    
    try {
      // Create a FormData object to send the video file
      const formData = new FormData();
      
      // Get the first video submission from activities
      const videoActivity = participantDetails?.data.assignments[0]?.activities.find(
        a => Boolean(a.submission) && (a.submission as { submissionType?: string })?.submissionType === 'VIDEO'
      );
      
      if (!videoActivity || !videoActivity.submission) {
        throw new Error('No video submission found for evaluation');
      }
      
      const submission = videoActivity.submission as { fileUrl?: string; fileName?: string };
      
      if (!submission.fileUrl) {
        throw new Error('Video file URL not available');
      }
      
      console.log('Fetching video file for evaluation from:', submission.fileUrl);
      
      // Fetch the video file from the submission URL
      const response = await fetch(submission.fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Video blob size:', videoBlob.size, 'bytes');
      console.log('Video blob type:', videoBlob.type);
      
      // Create a proper File object with the correct name and type
      const videoFile = new File([videoBlob], submission.fileName || 'video.mp4', { 
        type: videoBlob.type || 'video/mp4',
        lastModified: Date.now()
      });
      
      console.log('Created video file:', videoFile.name, videoFile.size, 'bytes');
      
      // Append the video file to FormData
      formData.append('video', videoFile);
      
      console.log('FormData entries:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log('Making API call for evaluation...');
      
      // Use environment variable for API URL or default to localhost
      const evaluationApiUrl = process.env.NEXT_PUBLIC_EVALUATION_API_URL || 'http://127.0.0.1:5001/evaluate-interview';
      
      // Make the API call with proper headers
      const apiResponse = await fetch(evaluationApiUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary for FormData
      });

      console.log('API Response status:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API call failed: ${apiResponse.status} ${apiResponse.statusText} - ${errorText}`);
      }

      const result: EvaluationResponse = await apiResponse.json();
      console.log('API Response:', result);
      setEvaluationData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while evaluating the interview');
      console.error('Error evaluating interview:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading participant details...</p>
        </div>
      </div>
    );
  }

  if (error || !participantDetails || !participantDetails.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4 text-black">Error Loading Participant</h1>
          <p className="text-lg text-red-600 mb-4">{error || 'Invalid participant data received'}</p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const ParticipantCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">
            {participantDetails.data.participant.name}, <span className="text-black font-normal">Email- {participantDetails.data.participant.email}</span>
          </h2>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <p className="text-black mt-1">
          {participantDetails.data.participant.designation} • Manager: {participantDetails.data.participant.managerName}
        </p>
        {selectedAssignmentId && (() => {
          const selectedAssignment = participantDetails.data.assignments.find(a => a.assignmentId === selectedAssignmentId);
          if (!selectedAssignment) return null;
          return (
          <p className="text-black mt-1">
              Assessment: {selectedAssignment.assessmentCenter.displayName} • 
              Activities: {selectedAssignment.activities.map(a => a.activityDetail.name).join(', ')}
          </p>
          );
        })()}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-3">
          <button 
            onClick={generateReport}
            disabled={isGenerating || isEvaluating}
            className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate report'
            )}
          </button>
          <button 
            onClick={evaluateInterview}
            disabled={isGenerating || isEvaluating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Evaluate'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const EvaluationResults = () => {
    if (!evaluationData) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-black">Interview Evaluation Report</h3>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-700">Overall Score: {evaluationData.overall_score}</p>
            <p className="text-sm text-black">Average: {evaluationData.summary.average_score}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationData.evaluations.map((evaluation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-black">{evaluation.metric}</h4>
                <span className="text-sm font-semibold px-2 py-1 bg-slate-100 rounded text-black">
                  {evaluation.score}
                </span>
              </div>
              <p className="text-sm text-black">{evaluation.reasoning}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-black">
          <p>Report generated for: {evaluationData.filename}</p>
          <p>Total metrics evaluated: {evaluationData.summary.total_metrics}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title & Participant */}
        <ParticipantCard />

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Only show assignment selector if assessmentCenterId not provided and multiple assignments exist */}
        {!assessmentCenterId && participantDetails.data.assignments.length > 1 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-md font-semibold mb-3 text-black">Select Assessment Center</h3>
            <div className="flex gap-2 flex-wrap">
              {participantDetails.data.assignments.map((assignment) => (
                <button
                  key={assignment.assignmentId}
                  onClick={() => {
                    setSelectedAssignmentId(assignment.assignmentId);
                    if (assignment.activities.length > 0) {
                      setSelectedActivityId(assignment.activities[0].activityId);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedAssignmentId === assignment.assignmentId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {assignment.assessmentCenter.displayName}
                  <span className="ml-2 text-xs opacity-75">
                    ({assignment.submissionCount}/{assignment.totalActivities})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two-column layout */}
        {selectedAssignmentId && (() => {
          const selectedAssignment = participantDetails.data.assignments.find(
            a => a.assignmentId === selectedAssignmentId
          );
          
          if (!selectedAssignment) return null;

          return (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competency Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-black">{selectedAssignment.assessmentCenter.displayName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAssignment.assessmentCenter.description}</p>
                </div>
                
                {/* Activity-based Competency Scoring */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-black mb-3">Score by Activity</h4>
                  {selectedAssignment.activities
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((activity) => (
                      <div key={activity.activityId} className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-black">{activity.activityDetail.name}</p>
                            <p className="text-xs text-gray-600">{activity.competency?.competencyName || 'No Competency'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            Boolean(activity.submission) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {Boolean(activity.submission) ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        {activity.competency && (
                          <div className="mt-3 space-y-2">
                            {activity.competency.subCompetencyNames.map((subComp, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border">
                                <label className="text-sm text-black">{subComp}</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={activityCompetencyScores[activity.activityId]?.[activity.competency.id]?.[subComp] || 5.0}
                                    onChange={(e) => updateActivityCompetencyScore(
                                      activity.activityId,
                                      activity.competency.id,
                                      subComp,
                                      parseFloat(e.target.value) || 0
                                    )}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <span className="text-sm text-gray-600">/10</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Overall Competency Scores (Aggregated) */}
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-black mb-3">Overall Competency Assessment</h4>
                  {selectedAssignment.competencies.map((competency) => (
                    <div key={competency.id} className="mb-4">
                      <h5 className="font-medium text-black mb-2">{competency.competencyName}</h5>
                
                {competency.subCompetencyNames.map((subComp, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                            <label className="text-sm font-medium text-black">{subComp}</label>
                            <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                                value={competencyScores[selectedAssignmentId]?.[competency.id]?.[subComp] || 5.0}
                                onChange={(e) => updateCompetencyScore(selectedAssignmentId, competency.id, subComp, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      />
                      <span className="text-sm text-gray-600">/10</span>
                            </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
                </div>
            
            <div className="border-t pt-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-black">Overall Assessment</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                        scoreStatus[selectedAssignmentId] === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                        {scoreStatus[selectedAssignmentId] || 'DRAFT'}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Overall Comments (Required)</p>
                  <textarea
                    rows={4}
                        value={comments[selectedAssignmentId] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [selectedAssignmentId]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Add your overall assessment comments here..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                        onClick={() => submitScores(selectedAssignmentId, 'DRAFT')}
                        disabled={isSubmittingScore || !comments[selectedAssignmentId]?.trim()}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmittingScore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Draft...
                      </>
                    ) : (
                      'Save as Draft'
                    )}
                  </button>
                  <button 
                        onClick={() => submitScores(selectedAssignmentId, 'SUBMITTED')}
                        disabled={isSubmittingScore || !comments[selectedAssignmentId]?.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    {isSubmittingScore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Final...
                      </>
                    ) : (
                      'Submit Final Score'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-black">Submissions & Activities</h3>
              <p className="text-sm text-black">
                    {selectedAssignment.submissionCount || 0}/{selectedAssignment.totalActivities || 0} Submitted
              </p>
            </div>
            
                {/* Activity Tabs */}
                <div className="mb-4 border-b border-gray-200">
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedAssignment.activities
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((activity) => {
                        const activityWithSubs = activity as ActivityWithSubmissions;
                        const allSubmissions = activityWithSubs.allSubmissions || [];
                        const hasSubmissions = allSubmissions.length > 0 || Boolean(activity.submission);
                        const isSelected = selectedActivityId === activity.activityId;
                        
                        return (
                          <button
                            key={activity.activityId}
                            onClick={() => setSelectedActivityId(activity.activityId)}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                              isSelected
                                ? 'bg-white border-t border-l border-r border-gray-300 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {activity.activityDetail.name}
                            {hasSubmissions && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                {allSubmissions.length || 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Activity Content */}
                {selectedActivityId && (() => {
                  const selectedActivity = selectedAssignment.activities.find(
                    a => a.activityId === selectedActivityId
                  );
              
              if (!selectedActivity) return null;
              
              const selectedActivityWithSubs = selectedActivity as ActivityWithSubmissions;
              const allSubmissions = selectedActivityWithSubs.allSubmissions || [];
              
              interface Submission {
                id: string;
                parentSubmissionId?: string;
                createdAt?: string;
                submittedAt?: string;
                replies?: Submission[];
              }
              
              const sortedSubmissions = [...allSubmissions].sort((a: Submission, b: Submission) => 
                new Date(a.createdAt || a.submittedAt || 0).getTime() - new Date(b.createdAt || b.submittedAt || 0).getTime()
              );

              // Build thread hierarchy
              const buildThread = (submissions: Submission[]): Submission[] => {
                const submissionMap = new Map<string, Submission>();
                const rootSubmissions: Submission[] = [];

                submissions.forEach(sub => {
                  submissionMap.set(sub.id, sub);
                });

                submissions.forEach(sub => {
                  if (!sub.parentSubmissionId) {
                    rootSubmissions.push(sub);
                  }
                });

                const addChildren = (parent: Submission): Submission => {
                  const children = submissions.filter(s => s.parentSubmissionId === parent.id);
                  return {
                    ...parent,
                    replies: children.map(child => addChildren(child))
                  };
                };

                return rootSubmissions.map(root => addChildren(root));
              };

              const threadStructure = buildThread(sortedSubmissions);

              return (
                <div className="space-y-4">
                  {/* Activity Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-black mb-2">{selectedActivity.activityDetail.name}</h4>
                    <p className="text-sm text-gray-700 mb-2">{selectedActivity.activityDetail.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        sortedSubmissions.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sortedSubmissions.length > 0 ? `${sortedSubmissions.length} Submission(s)` : 'No Submissions'}
                  </span>
                      <span className="text-gray-600">
                        Competency: {selectedActivity.competency?.competencyName || 'N/A'}
                      </span>
                      <span className="text-gray-600">
                        Type: {selectedActivity.activityType.replace('_', ' ')}
                  </span>
                </div>
                    {selectedActivity.activityDetail.instructions && (
                      <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                        <p className="text-xs font-medium text-blue-900 mb-1">Instructions:</p>
                        <div 
                          className="text-xs text-blue-800"
                          dangerouslySetInnerHTML={{ __html: selectedActivity.activityDetail.instructions }} 
                        />
                  </div>
                )}
              </div>

                  {/* Per-Activity Competency Scoring */}
                  {selectedActivity.competency && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-black mb-3">
                        Score for: {selectedActivity.competency.competencyName}
                      </h5>
                      {selectedActivity.competency.subCompetencyNames.map((subComp, idx) => (
                        <div key={idx} className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-black">{subComp}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={activityCompetencyScores[selectedActivity.activityId]?.[selectedActivity.competency.id]?.[subComp] || 5.0}
                                onChange={(e) => updateActivityCompetencyScore(
                                  selectedActivity.activityId,
                                  selectedActivity.competency.id,
                                  subComp,
                                  parseFloat(e.target.value) || 0
                                )}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <span className="text-sm text-gray-600">/10</span>
            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submissions Display */}
                  {sortedSubmissions.length > 0 ? (
                <div className="space-y-4">
                      <h5 className="font-medium text-black">Submissions ({sortedSubmissions.length})</h5>
                      
                      {selectedActivity.activityType === 'INBOX_ACTIVITY' ? (
                        /* Email Thread View */
                        <div className="space-y-3">
                          {threadStructure.map((thread: Submission) => {
                            interface EmailSubmission extends Submission {
                              notes?: string;
                              textContent?: string;
                              submissionStatus?: string;
                              fileName?: string;
                            }
                            
                            const renderSubmission = (sub: EmailSubmission, depth: number = 0) => {
                              try {
                                const notes = sub.notes ? JSON.parse(sub.notes) : {};
                                const subject = notes.subject || 'Email Reply';
                                const to = notes.to || [];
                                const cc = notes.cc || [];
                                
                                return (
                                  <div key={sub.id} className={`bg-white border border-gray-200 rounded-lg p-4 ${depth > 0 ? 'ml-8' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                    <div>
                                        <p className="font-semibold text-black">{subject}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {Array.isArray(to) ? to.join(', ') : to}
                                          {cc && cc.length > 0 && ` | CC: ${Array.isArray(cc) ? cc.join(', ') : cc}`}
                                        </p>
                      </div>
                                      <div className="text-right">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                          sub.submissionStatus === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {sub.submissionStatus || 'SUBMITTED'}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleString()}
                                        </p>
                            </div>
                          </div>
                                    <div 
                                      className="prose prose-sm max-w-none text-gray-700 mt-3 p-3 bg-gray-50 rounded border"
                                      dangerouslySetInnerHTML={{ __html: sub.textContent || '<p>No content</p>' }}
                                    />
                                    {sub.fileName && (
                                      <div className="mt-2 text-xs text-blue-600">
                                        📎 {sub.fileName}
                                      </div>
                                    )}
                                    {thread.replies && thread.replies.length > 0 && (
                                      <div className="mt-3">
                                        {thread.replies.map((reply: EmailSubmission) => renderSubmission(reply, depth + 1))}
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch {
                                return (
                                  <div key={sub.id} className={`bg-white border border-gray-200 rounded-lg p-4 ${depth > 0 ? 'ml-8' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <p className="font-semibold text-black">Submission</p>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        sub.submissionStatus === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {sub.submissionStatus || 'SUBMITTED'}
                                      </span>
                                    </div>
                                    <div 
                                      className="prose prose-sm max-w-none text-gray-700 mt-3"
                                      dangerouslySetInnerHTML={{ __html: sub.textContent || '<p>No content</p>' }}
                                    />
                                  </div>
                                );
                              }
                            };
                            
                            return renderSubmission(thread);
                          })}
                    </div>
                  ) : (
                        /* Case Study or Other Activity Types */
                        <div className="space-y-3">
                          {sortedSubmissions.map((sub: Submission & { submissionType?: string; submissionStatus?: string; fileUrl?: string; fileName?: string; fileSize?: number; textContent?: string; notes?: string }) => (
                            <div key={sub.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold text-black">{selectedActivity.activityDetail.name}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Type: {sub.submissionType || 'TEXT'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    sub.submissionStatus === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {sub.submissionStatus || 'SUBMITTED'}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(sub.submittedAt || sub.createdAt || Date.now()).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              {sub.submissionType === 'VIDEO' && sub.fileUrl && (
                                <div className="mt-3">
                                  <video controls className="w-full h-64 bg-black rounded-md" preload="metadata">
                                    <source src={sub.fileUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  {sub.fileName && <p className="text-xs text-gray-600 mt-2">📎 {sub.fileName}</p>}
                    </div>
                  )}
                              
                              {sub.submissionType === 'DOCUMENT' && sub.fileUrl && (
                                <div className="mt-3">
                                  <a 
                                    href={sub.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-2"
                                  >
                                    📄 {sub.fileName || 'Download Document'}
                                    {sub.fileSize && (
                                      <span className="text-xs text-gray-500">
                                        ({(sub.fileSize / 1024).toFixed(2)} KB)
                                      </span>
                                    )}
                                  </a>
                </div>
                              )}
                              
                              {sub.submissionType === 'TEXT' && sub.textContent && (
                                <div 
                                  className="prose prose-sm max-w-none text-gray-700 mt-3 p-3 bg-gray-50 rounded border"
                                  dangerouslySetInnerHTML={{ __html: sub.textContent }}
                                />
                              )}
                              
                              {sub.notes && (
                            <div className="mt-2 text-xs text-gray-600">
                                  <p><strong>Notes:</strong> {sub.notes}</p>
                            </div>
                          )}
                        </div>
                          ))}
                    </div>
                  )}
                </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No submissions yet for this activity</p>
                </div>
              )}
            </div>
              );
            })()}
          </div>
            </div>
          );
        })()}

        {/* Evaluation Results */}
        <EvaluationResults />
      </div>
    </div>
  );
};

export default AssessmentDetail;