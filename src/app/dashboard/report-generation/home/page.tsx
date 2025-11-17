'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface Assessor {
  id: string;
  name: string;
  email: string;
  designation: string;
  accessLevel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Score {
  id: string;
  participantId: string;
  assessorId: string;
  assessmentCenterId: string;
  competencyScores?: {
    [competencyId: string]: {
      [subCompetency: string]: number;
    };
  };
  overallComments?: string;
  individualComments?: {
    [competencyId: string]: string;
  } | null;
  status: 'DRAFT' | 'SUBMITTED' | 'FINALIZED';
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assessor: Assessor;
  participant: {
    id: string;
    name: string;
    email: string;
  };
  assessmentCenter: {
    id: string;
    name: string;
  };
}

interface AssessorStats {
  assessor: Assessor;
  totalAllotted: number;
  assessed: number;
  inProgress: number;
  notAssessed: number;
  scores: Score[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    scores: Score[];
    pagination: Pagination;
  };
}

interface EditScoreData {
  competencyScores: {
    [competencyId: string]: {
      [subCompetency: string]: number;
    };
  };
  overallComments: string;
  individualComments: {
    [competencyId: string]: string;
  };
  status: 'DRAFT' | 'SUBMITTED' | 'FINALIZED';
}

interface Group {
  id: string;
  name: string;
  admin: string;
  adminEmail: string;
  members: string[];
  participantIds?: string[];
}

interface GroupWithAssessorMarks extends Group {
  assessorMarks: {
    assessorId: string;
    assessorName: string;
    assessorEmail: string;
    participantId: string;
    participantName: string;
    scores: Score[];
    totalAssessments: number;
    completedAssessments: number;
  }[];
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'assessors'>('groups');
  
  // Groups tab state
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsWithMarks, setGroupsWithMarks] = useState<GroupWithAssessorMarks[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithAssessorMarks | null>(null);
  
  // Assessors tab state
  const [assessorStats, setAssessorStats] = useState<AssessorStats[]>([]);
  const [filteredStats, setFilteredStats] = useState<AssessorStats[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssessor, setSelectedAssessor] = useState<AssessorStats | null>(null);
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<EditScoreData | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  // Fetch groups from API
  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('http://localhost:3001/api/groups?page=1&limit=100&search=', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success && result.data && result.data.groups) {
        setGroups(result.data.groups);
        // For now, create mock assessor marks data (UI only)
        const groupsWithMockMarks: GroupWithAssessorMarks[] = result.data.groups.map((group: Group) => ({
          ...group,
          assessorMarks: [] // Will be populated with actual data later
        }));
        setGroupsWithMarks(groupsWithMockMarks);
      } else {
        setGroupsError(result.message || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setGroupsError('Error fetching groups');
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // Fetch groups when tab is active
  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [activeTab, fetchGroups]);

  // Fetch scores from API and group by assessor
  const fetchAssessorScores = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('http://localhost:3001/api/assessors/admin/scores');
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('assessorId', '');
      url.searchParams.append('participantId', '');
      url.searchParams.append('assessmentCenterId', '');
      url.searchParams.append('status', '');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessor scores');
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch assessor scores');
      }

      // Group scores by assessor and calculate statistics
      const assessorMap = new Map<string, AssessorStats>();

      data.data.scores.forEach((score) => {
        const assessorId = score.assessor.id;
        
        if (!assessorMap.has(assessorId)) {
          assessorMap.set(assessorId, {
            assessor: score.assessor,
            totalAllotted: 0,
            assessed: 0,
            inProgress: 0,
            notAssessed: 0,
            scores: [],
          });
        }

        const stats = assessorMap.get(assessorId)!;
        stats.scores.push(score);
        stats.totalAllotted += 1;

        if (score.status === 'SUBMITTED' || score.status === 'FINALIZED') {
          stats.assessed += 1;
        } else if (score.status === 'DRAFT') {
          stats.inProgress += 1;
        }
      });

      // Convert map to array and calculate not assessed
      const statsArray = Array.from(assessorMap.values());
      
      statsArray.forEach((stat) => {
        stat.notAssessed = 0;
      });
      
      setAssessorStats(statsArray);
      setFilteredStats(statsArray);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assessor scores');
      setAssessorStats([]);
      setFilteredStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter assessors based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStats(assessorStats);
    } else {
      const filtered = assessorStats.filter(
        (stat) =>
          stat.assessor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stat.assessor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStats(filtered);
    }
  }, [searchTerm, assessorStats]);

  // Fetch assessor scores when assessors tab is active
  useEffect(() => {
    if (activeTab === 'assessors') {
      fetchAssessorScores(pagination.currentPage, pagination.itemsPerPage);
    }
  }, [activeTab, fetchAssessorScores, pagination.currentPage, pagination.itemsPerPage]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAssessorScores(newPage, pagination.itemsPerPage);
    }
  };

  // Handle opening edit modal
  const handleEditScore = (score: Score) => {
    setSelectedScore(score);
    setEditData({
      competencyScores: score.competencyScores || {},
      overallComments: score.overallComments || '',
      individualComments: score.individualComments || {},
      status: score.status === 'FINALIZED' ? 'FINALIZED' : score.status,
    });
    setShowEditModal(true);
  };

  // Handle saving edited score
  const handleSaveScore = async () => {
    if (!selectedScore || !editData) return;

    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/assessors/admin/scores/${selectedScore.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update score');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update score');
      }

      // Refresh the data
      await fetchAssessorScores(pagination.currentPage, pagination.itemsPerPage);
      setShowEditModal(false);
      setSelectedScore(null);
      setEditData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score');
    } finally {
      setSaving(false);
    }
  };

  // Handle viewing assessor details
  const handleViewAssessor = (stat: AssessorStats) => {
    setSelectedAssessor(stat);
  };

  // Format report content for DOCX
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
        const analysisContent = JSON.parse(reportData.part2Analysis.content);
        // Format the analysis content
        Object.keys(analysisContent).forEach((step) => {
          paragraphs.push(
            new Paragraph({
              text: step,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
          
          const stepData = analysisContent[step];
          if (typeof stepData === 'object') {
            Object.keys(stepData).forEach((key) => {
              paragraphs.push(
                new Paragraph({
                  text: key,
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 100, after: 50 },
                })
              );
              
              if (Array.isArray(stepData[key])) {
                stepData[key].forEach((item: any) => {
                  if (typeof item === 'string') {
                    paragraphs.push(new Paragraph({ text: `• ${item}`, spacing: { after: 50 } }));
                  } else if (typeof item === 'object') {
                    Object.keys(item).forEach((prop) => {
                      paragraphs.push(
                        new Paragraph({
                          text: `${prop}: ${item[prop]}`,
                          spacing: { after: 50 },
                        })
                      );
                    });
                  }
                });
              } else if (typeof stepData[key] === 'object') {
                Object.keys(stepData[key]).forEach((subKey) => {
                  paragraphs.push(
                    new Paragraph({
                      text: `${subKey}: ${JSON.stringify(stepData[key][subKey], null, 2)}`,
                      spacing: { after: 50 },
                    })
                  );
                });
              }
            });
          }
        });
      } catch (e) {
        paragraphs.push(
          new Paragraph({
            text: reportData.part2Analysis.content || '',
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
        const commentsContent = JSON.parse(reportData.part3Comments.content);
        
        if (commentsContent.Strengths) {
          paragraphs.push(
            new Paragraph({
              text: 'Strengths',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 100, after: 100 },
            })
          );
          Object.keys(commentsContent.Strengths).forEach((key) => {
            paragraphs.push(
              new Paragraph({
                text: `${key}: ${commentsContent.Strengths[key]}`,
                spacing: { after: 50 },
              })
            );
          });
        }
        
        if (commentsContent['Areas of Opportunity']) {
          paragraphs.push(
            new Paragraph({
              text: 'Areas of Opportunity',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 100, after: 100 },
            })
          );
          Object.keys(commentsContent['Areas of Opportunity']).forEach((key) => {
            paragraphs.push(
              new Paragraph({
                text: `${key}: ${commentsContent['Areas of Opportunity'][key]}`,
                spacing: { after: 50 },
              })
            );
          });
        }
      } catch (e) {
        paragraphs.push(
          new Paragraph({
            text: reportData.part3Comments.content || '',
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
              text: `Readiness Scores: ${reportData.part4OverallRatings.scoreTable.readiness.join(', ')}`,
              spacing: { after: 50 },
            })
          );
        }
        
        if (reportData.part4OverallRatings.scoreTable.application) {
          paragraphs.push(
            new Paragraph({
              text: `Application Scores: ${reportData.part4OverallRatings.scoreTable.application.join(', ')}`,
              spacing: { after: 50 },
            })
          );
        }
      }
      
      // Add comment if available
      const commentMatch = reportData.part4OverallRatings.content.match(/"Comment":\s*\[([\s\S]*?)\]/);
      if (commentMatch) {
        paragraphs.push(
          new Paragraph({
            text: 'Comments:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 100, after: 100 },
          })
        );
        paragraphs.push(
          new Paragraph({
            text: commentMatch[1].replace(/"/g, '').trim(),
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
      
      if (reportData.part5Recommendation.recommendations) {
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
            text: reportData.part5Recommendation.content || '',
            spacing: { after: 400 },
          })
        );
      }
    }

    return paragraphs;
  };

  // Handle downloading assessor data
  const handleDownloadAssessorData = async (stat: AssessorStats, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when clicking download
    
    if (stat.scores.length === 0) {
      setError('No assessments available to download');
      return;
    }

    setDownloading(stat.assessor.id);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Download reports for all assessments
      for (let i = 0; i < stat.scores.length; i++) {
        const score = stat.scores[i];
        
        try {
          // Call the API to generate report
          const response = await fetch(
            'http://localhost:3001/api/report-structures/generate-from-assessment-center',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assessmentCenterId: score.assessmentCenter.id,
                participantId: score.participant.id,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to generate report for ${score.participant.name}`);
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
                    text: data.data.reportStructure?.reportName || 'Assessment Report',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                  }),
                  new Paragraph({
                    text: `Participant: ${data.data.participant?.name || score.participant.name}`,
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: `Assessment Center: ${data.data.assessmentCenter?.name || score.assessmentCenter.name}`,
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: `Assessor: ${stat.assessor.name}`,
                    spacing: { after: 400 },
                  }),
                  ...paragraphs,
                ],
              },
            ],
          });

          // Generate and download the document
          const blob = await Packer.toBlob(doc);
          const fileName = `${data.data.participant?.name || score.participant.name}_${data.data.assessmentCenter?.name || score.assessmentCenter.name}_${new Date().toISOString().split('T')[0]}.docx`.replace(/\s+/g, '_');
          saveAs(blob, fileName);

          // Add a small delay between downloads to avoid browser blocking
          if (i < stat.scores.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error(`Error downloading report for ${score.participant.name}:`, err);
          setError(err instanceof Error ? err.message : `Failed to download report for ${score.participant.name}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download assessor reports');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafd', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: '#1a1a1a',
          margin: 0
        }}>
          {activeTab === 'groups' ? 'Groups' : 'Assessors'}
        </h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('groups')}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              background: activeTab === 'groups' ? '#374151' : '#f3f4f6',
              color: activeTab === 'groups' ? '#ffffff' : '#1a1a1a',
              transition: 'all 0.2s'
            }}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('assessors')}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              background: activeTab === 'assessors' ? '#374151' : '#f3f4f6',
              color: activeTab === 'assessors' ? '#ffffff' : '#1a1a1a',
              transition: 'all 0.2s'
            }}
          >
            Assessors
          </button>
        </div>
        
        {/* Search Bar - Only show for Assessors tab */}
        {activeTab === 'assessors' && (
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                position: 'absolute', 
                left: '12px', 
                zIndex: 1,
                color: '#6b7280'
              }}
            >
              <path 
                d="M9 3C5.686 3 3 5.686 3 9C3 12.314 5.686 15 9 15C10.039 15 11.008 14.694 11.817 14.175L15.293 17.651C15.488 17.846 15.744 17.943 16 17.943C16.256 17.943 16.512 17.846 16.707 17.651C17.098 17.26 17.098 16.627 16.707 16.236L13.231 12.76C13.75 11.951 14.056 10.982 14.056 9.943C14.056 6.629 11.37 3.943 8.056 3.943H9V3ZM9 5C10.657 5 12 6.343 12 8C12 9.657 10.657 11 9 11C7.343 11 6 9.657 6 8C6 6.343 7.343 5 9 5Z" 
                fill="currentColor"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by Assessor name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 12px 12px 40px',
                fontSize: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                width: '300px',
                outline: 'none',
                background: '#ffffff',
                color: '#000'
              }}
            />
          </div>
        )}
      </div>

      {/* Error State */}
      {(error || groupsError) && (
        <div style={{
          padding: '16px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error || groupsError}</span>
          <button
            onClick={() => {
              setError(null);
              setGroupsError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Groups Tab Content */}
      {activeTab === 'groups' && (
        <>
          {groupsLoading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px',
              color: '#6b7280'
            }}>
              Loading groups...
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '24px',
              marginBottom: '24px'
            }}>
              {groupsWithMarks.length === 0 ? (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  background: '#ffffff',
                  borderRadius: '8px',
                  color: '#6b7280',
                  gridColumn: '1 / -1'
                }}>
                  No groups found
                </div>
              ) : (
                groupsWithMarks.map((group) => (
                  <div
                    key={group.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      padding: '24px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px 0 rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      margin: '0 0 12px 0'
                    }}>
                      {group.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 8px 0'
                    }}>
                      Group Admin: <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{group.admin}</span>
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 16px 0'
                    }}>
                      No. of Members: <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                        {(group.members?.length ?? group.participantIds?.length ?? 0)}
                      </span>
                    </p>
                    
                    {/* Assessor Marks Summary */}
                    <div style={{
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      marginTop: '16px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1a1a1a',
                        margin: '0 0 8px 0'
                      }}>
                        Assessor Marks:
                      </p>
                      {group.assessorMarks.length === 0 ? (
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          No assessor marks available
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {group.assessorMarks.map((mark, idx) => (
                            <div key={idx} style={{
                              padding: '8px',
                              background: '#ffffff',
                              borderRadius: '4px',
                              border: '1px solid #e5e7eb'
                            }}>
                              <p style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#1a1a1a',
                                margin: '0 0 4px 0'
                              }}>
                                {mark.assessorName}
                              </p>
                              <p style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                Completed: {mark.completedAssessments} / {mark.totalAssessments}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Assessors Tab Content */}
      {activeTab === 'assessors' && (
        <>
          {/* Loading State */}
          {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          color: '#6b7280'
        }}>
          Loading assessors...
        </div>
      ) : (
        <>
          {/* Assessor Cards */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {filteredStats.length === 0 ? (
              <div style={{
                padding: '48px',
                textAlign: 'center',
                background: '#ffffff',
                borderRadius: '8px',
                color: '#6b7280'
              }}>
                {searchTerm ? 'No assessors found matching your search' : 'No assessors found'}
              </div>
            ) : (
              filteredStats.map((stat) => (
                <div
                  key={stat.assessor.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px 0 rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => handleViewAssessor(stat)}
                >
                  {/* Left Section - Assessor Info */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      margin: '0 0 8px 0'
                    }}>
                      {stat.assessor.name}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      E-mail- {stat.assessor.email}
                    </p>
                  </div>

                  {/* Right Section - Assessment Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    {/* Total Allotted */}
                    <div style={{
                      padding: '8px 16px',
                      background: '#dbeafe',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1e40af'
                    }}>
                      Number of assessment allotted- {stat.totalAllotted}
                    </div>

                    {/* Assessed */}
                    <div style={{
                      padding: '8px 16px',
                      background: '#d1fae5',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#065f46'
                    }}>
                      Assessed assessment- {stat.assessed}
                    </div>

                    {/* In Progress */}
                    <div style={{
                      padding: '8px 16px',
                      background: '#dbeafe',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1e40af'
                    }}>
                      Assessment in Progress- {stat.inProgress}
                    </div>

                    {/* Not Assessed */}
                    <div style={{
                      padding: '8px 16px',
                      background: '#fce7f3',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#9f1239'
                    }}>
                      Not Assessed assessment- {stat.notAssessed}
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={(e) => handleDownloadAssessorData(stat, e)}
                      disabled={downloading === stat.assessor.id || stat.scores.length === 0}
                      style={{
                        padding: '8px 16px',
                        background: downloading === stat.assessor.id || stat.scores.length === 0 ? '#9ca3af' : '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: downloading === stat.assessor.id || stat.scores.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s',
                        opacity: downloading === stat.assessor.id || stat.scores.length === 0 ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (downloading !== stat.assessor.id && stat.scores.length > 0) {
                          e.currentTarget.style.background = '#2563eb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (downloading !== stat.assessor.id && stat.scores.length > 0) {
                          e.currentTarget.style.background = '#3b82f6';
                        }
                      }}
                    >
                      {downloading === stat.assessor.id ? (
                        <>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="spin-animation"
                          >
                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="11" fill="none" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              d="M8 11L4 7H6V3H10V7H12L8 11Z" 
                              fill="currentColor"
                            />
                            <path 
                              d="M2 13H14V14H2V13Z" 
                              fill="currentColor"
                            />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '32px'
            }}>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: pagination.currentPage === 1 ? '#f3f4f6' : '#ffffff',
                  color: pagination.currentPage === 1 ? '#9ca3af' : '#1a1a1a',
                  cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Previous
              </button>

              <span style={{
                fontSize: '14px',
                color: '#1a1a1a',
                fontWeight: 500
              }}>
                {pagination.currentPage} / {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  background: pagination.currentPage === pagination.totalPages ? '#f3f4f6' : '#ffffff',
                  color: pagination.currentPage === pagination.totalPages ? '#9ca3af' : '#1a1a1a',
                  cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          </>
        )}
        </>
      )}

      {/* View Group Details Modal */}
      {selectedGroup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setSelectedGroup(null)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0
              }}>
                {selectedGroup.name} - Assessor Marks
              </h2>
              <button
                onClick={() => setSelectedGroup(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                Group Admin: <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{selectedGroup.admin}</span>
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                Admin Email: <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{selectedGroup.adminEmail}</span>
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Total Members: <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                  {(selectedGroup.members?.length ?? selectedGroup.participantIds?.length ?? 0)}
                </span>
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '16px'
              }}>
                Assessor Marks by Group
              </h3>
              {selectedGroup.assessorMarks.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                  No assessor marks available for this group
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedGroup.assessorMarks.map((mark, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#f9fafb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1a1a1a' }}>
                            Assessor: {mark.assessorName}
                          </p>
                          <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                            Email: {mark.assessorEmail}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                            Participant: {mark.participantName}
                          </p>
                        </div>
                        <div style={{
                          padding: '8px 16px',
                          background: mark.completedAssessments === mark.totalAssessments ? '#d1fae5' : '#dbeafe',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: mark.completedAssessments === mark.totalAssessments ? '#065f46' : '#1e40af'
                        }}>
                          {mark.completedAssessments} / {mark.totalAssessments} Completed
                        </div>
                      </div>
                      {mark.scores.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                            Assessment Scores:
                          </p>
                          {mark.scores.map((score) => (
                            <div key={score.id} style={{
                              padding: '8px',
                              background: '#ffffff',
                              borderRadius: '4px',
                              marginBottom: '8px',
                              fontSize: '12px',
                              color: '#6b7280'
                            }}>
                              <span style={{ fontWeight: 500 }}>Status: </span>
                              <span style={{
                                color: score.status === 'SUBMITTED' || score.status === 'FINALIZED' ? '#065f46' : '#1e40af',
                                fontWeight: 500
                              }}>
                                {score.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Assessor Assessments Modal */}
      {selectedAssessor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setSelectedAssessor(null)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0
              }}>
                Assessments for {selectedAssessor.assessor.name}
              </h2>
              <button
                onClick={() => setSelectedAssessor(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedAssessor.scores.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px' }}>
                  No assessments found for this assessor
                </p>
              ) : (
                selectedAssessor.scores.map((score) => (
                  <div
                    key={score.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#f9fafb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1a1a1a' }}>
                          Participant: {score.participant.name}
                        </p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                          Assessment Center: {score.assessmentCenter.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                          Status: <span style={{
                            color: score.status === 'SUBMITTED' || score.status === 'FINALIZED' ? '#065f46' : '#1e40af',
                            fontWeight: 500
                          }}>{score.status}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditScore(score)}
                        style={{
                          padding: '8px 16px',
                          background: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Score Modal */}
      {showEditModal && selectedScore && editData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => !saving && setShowEditModal(false)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0
              }}>
                Edit Assessment Score
              </h2>
              <button
                onClick={() => !saving && setShowEditModal(false)}
                disabled={saving}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: saving ? 0.5 : 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1a1a1a' }}>
                Participant: {selectedScore.participant.name}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                Assessment Center: {selectedScore.assessmentCenter.name}
              </p>
            </div>

            {/* Competency Scores */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '16px'
              }}>
                Competency Scores
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(editData.competencyScores).map(([competencyId, subCompetencies]) => (
                  <div key={competencyId} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f9fafb'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1a1a1a',
                      marginBottom: '12px'
                    }}>
                      Competency {competencyId.slice(-6)}
                    </h4>
                    {Object.entries(subCompetencies).map(([subCompetency, score]) => (
                      <div key={subCompetency} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          color: '#374151',
                          flex: 1
                        }}>
                          {subCompetency}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={score}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value) || 0;
                            setEditData({
                              ...editData,
                              competencyScores: {
                                ...editData.competencyScores,
                                [competencyId]: {
                                  ...editData.competencyScores[competencyId],
                                  [subCompetency]: newValue
                                }
                              }
                            });
                          }}
                          style={{
                            width: '100px',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    ))}
                    
                    {/* Individual Comments for this competency */}
                    <div style={{ marginTop: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Comments for this competency:
                      </label>
                      <textarea
                        value={editData.individualComments[competencyId] || ''}
                        onChange={(e) => {
                          setEditData({
                            ...editData,
                            individualComments: {
                              ...editData.individualComments,
                              [competencyId]: e.target.value
                            }
                          });
                        }}
                        placeholder="Enter comments for this competency..."
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          minHeight: '60px',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Comments */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Overall Comments
              </label>
              <textarea
                value={editData.overallComments}
                onChange={(e) => {
                  setEditData({
                    ...editData,
                    overallComments: e.target.value
                  });
                }}
                placeholder="Enter overall comments..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Status */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => {
                  setEditData({
                    ...editData,
                    status: e.target.value as 'DRAFT' | 'SUBMITTED' | 'FINALIZED'
                  });
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="FINALIZED">FINALIZED</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: saving ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: saving ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
