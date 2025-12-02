"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ReportStructureApi, ReportStructure } from '@/lib/reportStructureApi';
import { Download, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface ParticipantReportsProps {
  token: string | null;
}

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

const ParticipantReports: React.FC<ParticipantReportsProps> = ({ token }) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [reportStructures, setReportStructures] = useState<ReportStructure[]>([]);
  const [selectedReportStructure, setSelectedReportStructure] = useState<ReportStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const [downloadingParticipantId, setDownloadingParticipantId] = useState<string | null>(null);
  const [showReportStructureSelector, setShowReportStructureSelector] = useState(false);

  // Fetch groups and report structures
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch groups
      const groupsRes = await fetch('/api/management-reports/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (groupsRes.ok) {
        const groupsResult = await groupsRes.json();
        const groupsList = groupsResult.data?.groups || [];
        setGroups(groupsList);
      }

      // Fetch report structures
      const reportStructuresRes = await ReportStructureApi.getReportStructures(token, {
        page: 1,
        limit: 100, // Get all report structures
      });
      if (reportStructuresRes.success && reportStructuresRes.data) {
        setReportStructures(reportStructuresRes.data.reportStructures);
        // Auto-select first report structure if available
        if (reportStructuresRes.data.reportStructures.length > 0) {
          setSelectedReportStructure(reportStructuresRes.data.reportStructures[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const filteredParticipants = selectedGroup?.participants.filter(p =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(participantSearch.toLowerCase())
  ) || [];

  const formatReportContent = (reportData: any): Paragraph[] => {
    const paragraphs: Paragraph[] = [];

    // Report Cover
    if (reportData.reportCover?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Report Cover',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
      paragraphs.push(
        new Paragraph({
          text: reportData.reportCover.content || '',
          spacing: { after: 400 },
        })
      );
    }

    // Part 1: Introduction
    if (reportData.part1Introduction?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Introduction',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );
      paragraphs.push(
        new Paragraph({
          text: reportData.part1Introduction.content || '',
          spacing: { after: 400 },
        })
      );
    }

    // Part 2: Analysis
    if (reportData.part2Analysis?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Analysis',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );
      
      try {
        const analysisContent = typeof reportData.part2Analysis.content === 'string' 
          ? JSON.parse(reportData.part2Analysis.content)
          : reportData.part2Analysis.content;
        
        if (typeof analysisContent === 'object' && analysisContent !== null) {
          Object.keys(analysisContent).forEach((step) => {
            paragraphs.push(
              new Paragraph({
                text: step,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              })
            );
            
            const stepData = analysisContent[step];
            if (typeof stepData === 'string') {
              paragraphs.push(
                new Paragraph({
                  text: stepData,
                  spacing: { after: 100 },
                })
              );
            } else if (typeof stepData === 'object' && stepData !== null) {
              Object.keys(stepData).forEach((key) => {
                paragraphs.push(
                  new Paragraph({
                    text: key,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 100, after: 50 },
                  })
                );
                
                if (Array.isArray(stepData[key])) {
                  stepData[key].forEach((item: unknown) => {
                    if (typeof item === 'string') {
                      paragraphs.push(new Paragraph({ text: `• ${item}`, spacing: { after: 50 } }));
                    } else if (typeof item === 'object' && item !== null) {
                      Object.keys(item).forEach((prop) => {
                        paragraphs.push(
                          new Paragraph({
                            text: `${prop}: ${(item as Record<string, unknown>)[prop]}`,
                            spacing: { after: 50 },
                          })
                        );
                      });
                    }
                  });
                } else if (typeof stepData[key] === 'string') {
                  paragraphs.push(
                    new Paragraph({
                      text: stepData[key],
                      spacing: { after: 50 },
                    })
                  );
                }
              });
            }
          });
        }
      } catch {
        paragraphs.push(
          new Paragraph({
            text: typeof reportData.part2Analysis.content === 'string' 
              ? reportData.part2Analysis.content 
              : JSON.stringify(reportData.part2Analysis.content),
            spacing: { after: 400 },
          })
        );
      }
    }

    // Part 3: Comments
    if (reportData.part3Comments?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Comments',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );
      
      try {
        const commentsContent = typeof reportData.part3Comments.content === 'string'
          ? JSON.parse(reportData.part3Comments.content)
          : reportData.part3Comments.content;
        
        if (commentsContent && typeof commentsContent === 'object') {
          if (commentsContent.Strengths) {
            paragraphs.push(
              new Paragraph({
                text: 'Strengths',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 100, after: 100 },
              })
            );
            if (Array.isArray(commentsContent.Strengths)) {
              commentsContent.Strengths.forEach((strength: string) => {
                paragraphs.push(
                  new Paragraph({
                    text: `• ${strength}`,
                    spacing: { after: 50 },
                  })
                );
              });
            } else if (typeof commentsContent.Strengths === 'object') {
              Object.keys(commentsContent.Strengths).forEach((key) => {
                paragraphs.push(
                  new Paragraph({
                    text: `${key}: ${commentsContent.Strengths[key]}`,
                    spacing: { after: 50 },
                  })
                );
              });
            }
          }
          
          if (commentsContent['Areas of Opportunity'] || commentsContent['Areas of Development']) {
            paragraphs.push(
              new Paragraph({
                text: 'Areas of Opportunity',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 100, after: 100 },
              })
            );
            const areas = commentsContent['Areas of Opportunity'] || commentsContent['Areas of Development'];
            if (Array.isArray(areas)) {
              areas.forEach((area: string) => {
                paragraphs.push(
                  new Paragraph({
                    text: `• ${area}`,
                    spacing: { after: 50 },
                  })
                );
              });
            } else if (typeof areas === 'object') {
              Object.keys(areas).forEach((key) => {
                paragraphs.push(
                  new Paragraph({
                    text: `${key}: ${areas[key]}`,
                    spacing: { after: 50 },
                  })
                );
              });
            }
          }
        }
      } catch {
        paragraphs.push(
          new Paragraph({
            text: typeof reportData.part3Comments.content === 'string'
              ? reportData.part3Comments.content
              : JSON.stringify(reportData.part3Comments.content),
            spacing: { after: 400 },
          })
        );
      }
    }

    // Part 4: Overall Ratings
    if (reportData.part4OverallRatings?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Overall Ratings',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );
      
      if (reportData.part4OverallRatings.scoreTable) {
        paragraphs.push(
          new Paragraph({
            text: 'Score Table',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 100 },
          })
        );
        
        if (reportData.part4OverallRatings.scoreTable.readiness) {
          paragraphs.push(
            new Paragraph({
              text: `Readiness Scores: ${Array.isArray(reportData.part4OverallRatings.scoreTable.readiness) 
                ? reportData.part4OverallRatings.scoreTable.readiness.join(', ')
                : reportData.part4OverallRatings.scoreTable.readiness}`,
              spacing: { after: 50 },
            })
          );
        }
        
        if (reportData.part4OverallRatings.scoreTable.application) {
          paragraphs.push(
            new Paragraph({
              text: `Application Scores: ${Array.isArray(reportData.part4OverallRatings.scoreTable.application)
                ? reportData.part4OverallRatings.scoreTable.application.join(', ')
                : reportData.part4OverallRatings.scoreTable.application}`,
              spacing: { after: 50 },
            })
          );
        }
      }
      
      if (typeof reportData.part4OverallRatings.content === 'string') {
        paragraphs.push(
          new Paragraph({
            text: reportData.part4OverallRatings.content,
            spacing: { after: 400 },
          })
        );
      }
    }

    // Part 5: Recommendations
    if (reportData.part5Recommendation?.content) {
      paragraphs.push(
        new Paragraph({
          text: 'Recommendations',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );
      
      if (reportData.part5Recommendation.recommendations && Array.isArray(reportData.part5Recommendation.recommendations)) {
        reportData.part5Recommendation.recommendations.forEach((rec: string) => {
          paragraphs.push(
            new Paragraph({
              text: `• ${rec}`,
              spacing: { after: 50 },
            })
          );
        });
      } else {
        paragraphs.push(
          new Paragraph({
            text: typeof reportData.part5Recommendation.content === 'string'
              ? reportData.part5Recommendation.content
              : JSON.stringify(reportData.part5Recommendation.content),
            spacing: { after: 400 },
          })
        );
      }
    }

    return paragraphs;
  };

  const handleDownloadReport = async (participant: ParticipantData) => {
    if (!token || !selectedReportStructure) {
      setError('Please select a report structure first');
      return;
    }

    setDownloadingParticipantId(participant.id);
    setError(null);

    try {
      // Call API to generate report using report structure
      const response = await fetch(`/api/report-structures/${selectedReportStructure.id}/generate-participant-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participant.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate report' }));
        throw new Error(errorData.message || `Failed to generate report: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to generate report');
      }

      // Create DOCX document from report data
      const reportContent = data.data.reportContent;
      const paragraphs = formatReportContent(reportContent);

      // Add header information
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: data.data.reportStructure?.reportName || selectedReportStructure.reportName || 'Assessment Report',
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                text: `Participant: ${data.data.participant?.name || participant.name}`,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `Assessment Center: ${data.data.assessmentCenter?.name || data.data.assessmentCenter?.displayName || 'N/A'}`,
                spacing: { after: 400 },
              }),
              ...paragraphs,
            ],
          },
        ],
      });

      // Generate and download the document
      const blob = await Packer.toBlob(doc);
      const fileName = `${participant.name}_${selectedReportStructure.reportName}_Report.docx`.replace(/[^a-z0-9]/gi, '_');
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloadingParticipantId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !selectedGroup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Structure Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Structure
            </label>
            {selectedReportStructure ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{selectedReportStructure.reportName}</span>
                <button
                  onClick={() => setShowReportStructureSelector(!showReportStructureSelector)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowReportStructureSelector(!showReportStructureSelector)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Select Report Structure
              </button>
            )}
          </div>
        </div>

        {/* Report Structure Dropdown */}
        {showReportStructureSelector && (
          <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
            {reportStructures.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {reportStructures.map((structure) => (
                  <button
                    key={structure.id}
                    onClick={() => {
                      setSelectedReportStructure(structure);
                      setShowReportStructureSelector(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedReportStructure?.id === structure.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{structure.reportName}</div>
                    {structure.description && (
                      <div className="text-xs text-gray-500 mt-1">{structure.description}</div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No report structures available. Please create one in Report Structure page.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`rounded-lg p-4 ${
          error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {(error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')) ? (
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {(error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit'))
                  ? 'API Quota Exceeded'
                  : 'Error'}
              </h3>
              <div className={`mt-2 text-sm ${
                error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                <p>{error}</p>
                {(error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')) && (
                  <p className="mt-2 text-xs">
                    Please check your OpenAI account billing and quota limits, or try again later.
                  </p>
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setError(null)}
                  className={`text-sm font-medium ${
                    error.toLowerCase().includes('quota') || error.toLowerCase().includes('rate limit')
                      ? 'text-yellow-800 hover:text-yellow-900'
                      : 'text-red-800 hover:text-red-900'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groups List or Group Details */}
      {!selectedGroup ? (
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
                  onClick={() => setSelectedGroup(group)}
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
                      <ChevronRight className="w-5 h-5" />
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
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedGroup(null);
                setParticipantSearch('');
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Back to Groups</span>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">{selectedGroup.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Select a participant to download their report</p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by participant name or email"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Participants Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Designation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Manager</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">{participant.userCode}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{participant.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{participant.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{participant.designation}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{participant.managerName || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDownloadReport(participant)}
                          disabled={!selectedReportStructure || downloadingParticipantId === participant.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingParticipantId === participant.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </td>
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
      )}
    </div>
  );
};

export default ParticipantReports;

