"use client";

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch overview data
      const overviewRes = await fetch('/api/management-reports/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (overviewRes.ok) {
        const overviewResult = await overviewRes.json();
        setOverviewData(overviewResult.data);
      }

      // Fetch competency data
      const competencyRes = await fetch('/api/management-reports/competencies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (competencyRes.ok) {
        const competencyResult = await competencyRes.json();
        setCompetencyData(competencyResult.data || []);
      }

      // Fetch groups data
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
      console.error('Error fetching management reports data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

