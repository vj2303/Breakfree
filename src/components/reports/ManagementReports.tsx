"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AssessmentsCard from './AssessmentsCard';
import CompetencyCard from './CompetencyCard';
import GroupsList from './GroupsList';
import GroupDetails from './GroupDetails';
import ApplicationReadinessGraph from './ApplicationReadinessGraph';
import PrePostAssessment from './PrePostAssessment';

interface ManagementReportsProps {
  token: string | null;
}

interface OverviewData {
  totalAssessments: number;
  assigned: number;
  inProgress: number;
  completed: number;
  assignedPercentage: number;
  inProgressPercentage: number;
  completedPercentage: number;
}

interface CompetencyData {
  competencyId: string;
  competencyName: string;
  averageScore: number;
}

interface GroupData {
  id: string;
  name: string;
  participants: ParticipantData[];
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

const ManagementReports: React.FC<ManagementReportsProps> = ({ token }) => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [competencyData, setCompetencyData] = useState<CompetencyData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competencySearch, setCompetencySearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');

  const fetchGroups = useCallback(async () => {
    if (!token) return;

    try {
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
    } catch (err) {
      console.error('Error fetching groups data:', err);
    }
  }, [token]);

  const fetchOverviewAndCompetencies = useCallback(async (groupId?: string) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Build query params
      const queryParams = new URLSearchParams();
      if (groupId) {
        queryParams.append('groupId', groupId);
      }

      // Fetch overview data
      const overviewUrl = `/api/management-reports/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const overviewRes = await fetch(overviewUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (overviewRes.ok) {
        const overviewResult = await overviewRes.json();
        setOverviewData(overviewResult.data);
      }

      // Fetch competency data
      const competencyUrl = `/api/management-reports/competencies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const competencyRes = await fetch(competencyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (competencyRes.ok) {
        const competencyResult = await competencyRes.json();
        setCompetencyData(competencyResult.data || []);
      }
    } catch (err) {
      console.error('Error fetching management reports data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch for groups
  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token, fetchGroups]);

  // Fetch overview and competencies on mount and when group selection changes
  useEffect(() => {
    if (token) {
      fetchOverviewAndCompetencies(selectedGroup?.id);
    }
  }, [token, selectedGroup?.id, fetchOverviewAndCompetencies]);

  const filteredCompetencies = competencyData.filter(comp =>
    comp.competencyName.toLowerCase().includes(competencySearch.toLowerCase())
  );

  const filteredParticipants = selectedGroup?.participants.filter(p =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group Filter Indicator */}
      {selectedGroup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-blue-900">
                Showing data for group: <span className="font-semibold">{selectedGroup.name}</span>
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedGroup(null);
                setSelectedParticipant(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Assessments and Competency Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssessmentsCard data={overviewData} />
        <CompetencyCard
          competencies={filteredCompetencies}
          searchValue={competencySearch}
          onSearchChange={setCompetencySearch}
        />
      </div>

      {/* Groups List or Group Details */}
      {!selectedGroup ? (
        <GroupsList
          groups={groups}
          onGroupSelect={setSelectedGroup}
        />
      ) : (
        <GroupDetails
          group={selectedGroup}
          participants={filteredParticipants}
          searchValue={participantSearch}
          onSearchChange={setParticipantSearch}
          onParticipantSelect={setSelectedParticipant}
          onBack={() => {
            setSelectedGroup(null);
            setSelectedParticipant(null); // Clear participant selection when going back
          }}
        />
      )}

      {/* Application Average vs Readiness Graph */}
      {selectedParticipant && (
        <ApplicationReadinessGraph
          participantId={selectedParticipant.id}
          participantName={selectedParticipant.name}
          token={token}
        />
      )}

      {/* Pre vs Post Assessment */}
      {selectedParticipant && (
        <PrePostAssessment
          participantId={selectedParticipant.id}
          participantName={selectedParticipant.name}
          token={token}
        />
      )}
    </div>
  );
};

export default ManagementReports;

