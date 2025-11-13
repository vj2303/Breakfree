"use client";

import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AssessmentDetailProps {
  params: Promise<{ id: string }>;
}

interface GroupDetails {
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
    assignment: {
      id: string;
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
      participants: Array<{
        participant: {
          id: string;
          name: string;
          email: string;
          designation: string;
          managerName: string;
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
          };
          submission: unknown;
        }>;
        assessorScore: unknown;
        submissionCount: number;
        totalActivities: number;
      }>;
      competencies: Array<{
        id: string;
        competencyName: string;
        subCompetencyNames: string[];
        createdAt: string;
        updatedAt: string;
      }>;
    };
  };
}


const AssessmentDetail = ({ params }: AssessmentDetailProps) => {
  const { id } = React.use(params); // This is the groupId
  const router = useRouter();
  const { assessorId, token } = useAuth();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!assessorId || !token) {
        setError('Assessor ID or token not available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/assessors/${assessorId}/groups/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result.success) {
          setGroupDetails(result);
        } else {
          setError(result.message || 'Failed to fetch group details');
        }
      } catch (err) {
        console.error('Error fetching group details:', err);
        setError('An error occurred while fetching group details');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [assessorId, token, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !groupDetails || !groupDetails.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading Group</h1>
          <p className="text-lg text-red-600 mb-4">{error || 'Invalid group data received'}</p>
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

  const ParticipantCard = ({ participant }: { participant: { participant: { id: string; name: string; email: string; designation: string; managerName: string; createdAt: string; updatedAt: string }; activities: { activityId: string; activityType: string; displayOrder: number; competency: { id: string; competencyName: string; subCompetencyNames: string[]; createdAt: string; updatedAt: string }; activityDetail: { id: string; name: string; description: string }; submission: unknown }[]; assessorScore: unknown; submissionCount: number; totalActivities: number } }) => (
    <div className="bg-slate-600 text-white rounded-lg p-4 mb-4">
      <div className="mb-3">
        <h4 className="font-semibold text-lg">{participant.participant.name}</h4>
        <p className="text-slate-300 text-sm">{participant.participant.email}</p>
        <p className="text-slate-300 text-xs">{participant.participant.designation}</p>
        <p className="text-slate-300 text-xs">Manager: {participant.participant.managerName}</p>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2">Activities ({participant.submissionCount}/{participant.totalActivities})</div>
        {participant.activities.map((activity) => (
          <div key={activity.activityId} className="flex items-center justify-between bg-slate-500 bg-opacity-50 rounded p-2">
            <div className="flex-1">
              <span className="text-sm">{activity.activityDetail.name}</span>
              <p className="text-xs text-slate-300 mt-1">{activity.activityDetail.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${
                  activity.submission ? 'bg-green-600' : 'bg-yellow-600'
                }`}>
                  {activity.submission ? 'Submitted' : 'Pending'}
                </span>
                <span className="text-xs text-slate-300">
                  {activity.competency.competencyName}
                </span>
              </div>
            </div>
            <button
              className="flex items-center gap-1 text-sm text-slate-200 hover:text-white transition-colors"
              onClick={() => router.push(`/assessor/assess/${id}/score/${participant.participant.id}`)}
            >
              Score Assessment
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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Groups
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Assessment Details</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Group Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{groupDetails.data.assignment?.group?.name || 'Unknown Group'}</h2>
            <p className="text-gray-600 mb-2">Admin: {groupDetails.data.assignment?.group?.admin || 'N/A'}</p>
            <p className="text-gray-600 mb-6">Email: {groupDetails.data.assignment?.group?.adminEmail || 'N/A'}</p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Details</h3>
            <p className="text-gray-700 mb-2">Assignment ID: {groupDetails.data.assignment?.id || 'N/A'}</p>
            <p className="text-gray-700 mb-6">Participants: {groupDetails.data.assignment?.participants?.length || 0}</p>
            
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{groupDetails.data.assignment?.assessmentCenter?.displayName || groupDetails.data.assignment?.assessmentCenter?.name || 'Assessment Center'}</h4>
            <p className="text-gray-600 mb-6">{groupDetails.data.assignment?.assessmentCenter?.description || ''}</p>
            
            {/* Assessment Instructions */}
            {groupDetails.data.assignment?.assessmentCenter?.displayInstructions && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Instructions</h5>
                <div 
                  className="text-blue-800 text-sm"
                  dangerouslySetInnerHTML={{ __html: groupDetails.data.assignment.assessmentCenter.displayInstructions }}
                />
              </div>
            )}
            
            {/* Assessor Guide */}
            {groupDetails.data.assignment?.assessmentCenter?.documentUrl && (
              <div className="mb-8">
                <a 
                  href={groupDetails.data.assignment.assessmentCenter.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={20} className="text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Assessor Guide</div>
                    <div className="text-sm text-gray-600">Click to view document</div>
                  </div>
                </a>
              </div>
            )}
            
            {/* Competencies */}
            {groupDetails.data.assignment?.competencies && groupDetails.data.assignment.competencies.length > 0 && (
              <div className="mb-8">
                <h5 className="font-medium text-gray-900 mb-3">Assessment Competencies</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupDetails.data.assignment.competencies.map((competency) => (
                    <div key={competency.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <h6 className="font-medium text-gray-900 mb-2">{competency.competencyName}</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competency.subCompetencyNames.map((subComp, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            {subComp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Group Members */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Group Members ({groupDetails.data.assignment?.participants?.length || 0})</h3>
            
            {groupDetails.data.assignment?.participants && groupDetails.data.assignment.participants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupDetails.data.assignment.participants.map((participant) => (
                  <ParticipantCard key={participant.participant.id} participant={participant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No participants found in this group.</p>
              </div>
            )}
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