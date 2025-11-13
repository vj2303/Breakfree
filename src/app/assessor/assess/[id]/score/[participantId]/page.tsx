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

const AssessmentDetail = ({ params }: ParticipantScoringProps) => {
  const { participantId } = React.use(params);
  const router = useRouter();
  const { assessorId, token } = useAuth();
  const [participantDetails, setParticipantDetails] = useState<ParticipantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationResponse | null>(null);
  // Removed unused averageScore state
  const [comments, setComments] = useState('');
  const [competencyScores, setCompetencyScores] = useState<Record<string, Record<string, number>>>({});
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreStatus, setScoreStatus] = useState<'DRAFT' | 'SUBMITTED'>('DRAFT');

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
    if (participantDetails?.data.assignments[0]?.competencies) {
      const initialScores: Record<string, Record<string, number>> = {};
      participantDetails.data.assignments[0].competencies.forEach(competency => {
        initialScores[competency.id] = {};
        competency.subCompetencyNames.forEach(subComp => {
          initialScores[competency.id][subComp] = 5.0; // Default score
        });
      });
      setCompetencyScores(initialScores);
    }
  }, [participantDetails]);

  const updateCompetencyScore = (competencyId: string, subCompetency: string, score: number) => {
    setCompetencyScores(prev => ({
      ...prev,
      [competencyId]: {
        ...prev[competencyId],
        [subCompetency]: score
      }
    }));
  };

  const submitScores = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (!participantDetails?.data || !assessorId || !token) {
      setError('Missing required data for score submission');
      return;
    }

    setIsSubmittingScore(true);
    setError(null);

    try {
      const assignment = participantDetails.data.assignments[0];
      if (!assignment) {
        throw new Error('No assignment data available');
      }

      const payload = {
        participantId: participantDetails.data.participant.id,
        assessorId: assessorId,
        assessmentCenterId: assignment.assessmentCenter.id,
        competencyScores: competencyScores,
        overallComments: comments,
        status: status
      };

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
        setScoreStatus(status);
        alert(`Scores ${status === 'DRAFT' ? 'saved as draft' : 'submitted'} successfully!`);
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
      console.log('Downloading PDF report...');
      
      // Fetch the PDF file from the public folder
      const pdfResponse = await fetch('/test-doc.pdf');
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF file: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      const pdfBlob = await pdfResponse.blob();
      
      // Create a download link and trigger download
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'Interview_Report.pdf'; // You can customize the filename
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
      console.log('PDF report downloaded successfully');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while downloading the report');
      console.error('Error downloading report:', err);
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
      
      console.log('Fetching video file for evaluation...');
      
      // Fetch the video file from the public folder with proper error handling
      const response = await fetch('/test.MP4');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Video blob size:', videoBlob.size, 'bytes');
      console.log('Video blob type:', videoBlob.type);
      
      // Create a proper File object with the correct name and type
      const videoFile = new File([videoBlob], 'test.MP4', { 
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
      
      // Make the API call with proper headers
      const apiResponse = await fetch('http://127.0.0.1:5001/evaluate-interview', {
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
        {participantDetails.data.assignments.length > 0 && (
          <p className="text-black mt-1">
            {participantDetails.data.assignments[0].activities[0]?.activityDetail.name}, 
            Date- {new Date(participantDetails.data.participant.createdAt).toLocaleDateString()}
          </p>
        )}
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
        <div className="flex gap-2">
          {participantDetails.data.assignments[0]?.activities[0]?.activityDetail.instructions && (
            <button 
              onClick={() => {
                // You can implement a modal or navigate to view instructions
                alert(participantDetails.data.assignments[0].activities[0].activityDetail.instructions.replace(/<[^>]*>/g, ''));
              }}
              className="border border-gray-300 rounded-full px-4 py-1 text-sm text-black"
            >
              View Task
            </button>
          )}
          <div className="flex gap-2">
            <button 
              onClick={() => submitScores('DRAFT')}
              disabled={isSubmittingScore}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-full px-4 py-1 text-sm flex items-center gap-1"
            >
              {isSubmittingScore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </button>
            <button 
              onClick={() => submitScores('SUBMITTED')}
              disabled={isSubmittingScore}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full px-4 py-1 text-sm flex items-center gap-1"
            >
              {isSubmittingScore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Final'
              )}
            </button>
          </div>
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

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competency Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Competencies</h3>
            
            {participantDetails.data.assignments[0]?.competencies.map((competency) => (
              <div key={competency.id} className="mb-6">
                <h4 className="font-medium text-black mb-3">{competency.competencyName}</h4>
                
                {competency.subCompetencyNames.map((subComp, index) => (
                  <div key={index} className="mb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-black mb-2">
                      <p className="font-medium mb-2">Sub-competency: {subComp}</p>
                      <p className="text-sm text-gray-600">Assessment notes and observations will be displayed here based on participant&apos;s performance.</p>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <label className="text-sm font-medium text-black">Score (0-10):</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={competencyScores[competency.id]?.[subComp] || 5.0}
                        onChange={(e) => updateCompetencyScore(competency.id, subComp, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      />
                      <span className="text-sm text-gray-600">/10</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-black">Overall Assessment</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    scoreStatus === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {scoreStatus}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Overall Comments (Required)</p>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Add your overall assessment comments here..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => submitScores('DRAFT')}
                    disabled={isSubmittingScore || !comments.trim()}
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
                    onClick={() => submitScores('SUBMITTED')}
                    disabled={isSubmittingScore || !comments.trim()}
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
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Submissions</h3>
              <p className="text-sm text-black">
                Submission Status: {participantDetails.data.assignments[0]?.submissionCount || 0}/{participantDetails.data.assignments[0]?.totalActivities || 0}
              </p>
            </div>
            
            {/* Activity Details */}
            {participantDetails.data.assignments[0]?.activities.map((activity) => (
              <div key={activity.activityId} className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-black mb-2">{activity.activityDetail.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{activity.activityDetail.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    Boolean(activity.submission) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {Boolean(activity.submission) ? 'Submitted' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Type: {activity.activityType.replace('_', ' ')}
                  </span>
                </div>
                {activity.activityDetail.instructions && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div dangerouslySetInnerHTML={{ __html: activity.activityDetail.instructions }} />
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => setActiveTab('videos')}
                className={`border border-gray-300 rounded-md px-4 py-2 text-sm ${
                  activeTab === 'videos' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-black'
                }`}
              >
                Submitted Videos
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`border border-gray-300 rounded-md px-4 py-2 text-sm ${
                  activeTab === 'documents' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-black'
                }`}
              >
                Submitted Documents
              </button>
            </div>

            <div className="mt-4 border border-gray-300 rounded-md p-4 h-[400px] overflow-y-auto">
              {activeTab === 'videos' ? (
                <div className="space-y-4">
                  {participantDetails.data.assignments[0]?.activities.some(a => Boolean(a.submission)) ? (
                    <div>
                      <div className="text-sm text-black mb-3">
                        <strong>Video Submissions:</strong>
                      </div>
                      {participantDetails.data.assignments[0].activities
                        .filter(a => Boolean(a.submission))
                        .map((activity) => (
                          <div key={activity.activityId} className="mb-4">
                            <p className="text-sm font-medium text-black mb-2">{activity.activityDetail.name}</p>
                            <video 
                              controls 
                              className="w-full h-64 bg-black rounded-md"
                              preload="metadata"
                            >
                              <source src="/test1.mp4" type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            <div className="text-xs text-black mt-2">
                              <p><strong>Activity:</strong> {activity.activityDetail.name}</p>
                              <p><strong>Type:</strong> {activity.activityType}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No video submissions found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-black">
                  {participantDetails.data.assignments[0]?.activities.some(a => Boolean(a.submission)) ? (
                    participantDetails.data.assignments[0].activities
                      .filter(a => Boolean(a.submission))
                      .map((activity) => (
                        <div key={activity.activityId} className="mb-4 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium mb-2">{activity.activityDetail.name}</h5>
                          <p className="text-sm">{activity.activityDetail.description}</p>
                          {Boolean(activity.submission) && (
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Submission data available</p>
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p>No document submissions found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Results */}
        <EvaluationResults />
      </div>
    </div>
  );
};

export default AssessmentDetail;