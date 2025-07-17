import React, { useEffect, useState } from 'react';
import { useAssessmentForm } from '../create/context';
import Select, { StylesConfig, GroupBase, MultiValue } from 'react-select';

const GROUPS_API = 'http://localhost:3000/api/groups?page=1&limit=10&search=';
const ASSESSORS_API = 'http://localhost:3000/api/assessors?page=1&limit=10&search=';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZkNjkzMjMxMjYzYjNjMmQ4OTJiYTEiLCJpYXQiOjE3NTIwODM4OTksImV4cCI6MTc1MjY4ODY5OX0.tTGDyJJ-rjo_tKQ89qKHhxcxd3G4YVn4M_qrfdqwg_0';

// Define types
interface Participant {
  id: string;
  name: string;
  email: string;
  designation: string;
}

interface Group {
  id: string;
  name: string;
  admin: string;
  adminEmail: string;
  participants: Participant[];
}

interface Assessor {
  id: string;
  name: string;
  email: string;
}

interface AssignmentParticipant {
  participantId: string;
  activityIds: string[];
  assessorIds: string[];
}

interface GroupAssignment {
  groupId: string;
  participants: AssignmentParticipant[];
}

type OptionType = { value: string; label: string };

const customStyles: StylesConfig<OptionType, true, GroupBase<OptionType>> = {
  control: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    borderColor: '#d1d5db',
    minHeight: '36px',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#f3f4f6',
    color: 'black',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'black',
  }),
  option: (provided, state) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isSelected ? '#e5e7eb' : 'white',
  }),
  menu: (provided) => ({
    ...provided,
    color: 'black',
    zIndex: 9999,
  }),
  input: (provided) => ({
    ...provided,
    color: 'black',
  }),
};

const ParticipantAssessorManagementStep: React.FC = () => {
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('ParticipantAssessorManagementStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;
  const [groups, setGroups] = useState<Group[]>([]);
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [assignments, setAssignments] = useState<GroupAssignment[]>((formData.assignments as unknown as GroupAssignment[]) || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [groupsRes, assessorsRes] = await Promise.all([
          fetch(GROUPS_API, { headers: { Authorization: AUTH_TOKEN } }),
          fetch(ASSESSORS_API, { headers: { Authorization: AUTH_TOKEN } })
        ]);
        const groupsData = await groupsRes.json();
        const assessorsData = await assessorsRes.json();
        setGroups(groupsData?.data?.groups || []);
        setAssessors(assessorsData?.data?.assessors || []);
      } catch {
        setError('Failed to fetch groups or assessors');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    updateFormData('assignments', assignments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments]);

  const handleAssignmentChange = (
    groupId: string,
    participantId: string,
    field: keyof AssignmentParticipant,
    value: string[]
  ) => {
    setAssignments(prev => {
      const groupIdx = prev.findIndex((g) => g.groupId === groupId);
      const newAssignments = [...prev];
      if (groupIdx === -1) {
        newAssignments.push({ groupId, participants: [{ participantId, [field]: value, activityIds: [], assessorIds: [] }] });
      } else {
        const participantIdx = newAssignments[groupIdx].participants.findIndex((p) => p.participantId === participantId);
        if (participantIdx === -1) {
          newAssignments[groupIdx].participants.push({ participantId, [field]: value, activityIds: [], assessorIds: [] });
        } else {
          newAssignments[groupIdx].participants[participantIdx] = {
            ...newAssignments[groupIdx].participants[participantIdx],
            [field]: value
          };
        }
      }
      return newAssignments;
    });
  };

  // Hardcoded activities
  const activities: OptionType[] = [
    { value: 'case-study', label: 'Case Study' },
    { value: 'inbox', label: 'Inbox' },
  ];

  const assessorOptions: OptionType[] = assessors.map((ass) => ({
    value: ass.id,
    label: `${ass.name} (${ass.email})`,
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">Participant and Assessor Management</h2>
      {groups.map(group => (
        <div key={group.id} className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2 text-black">Group: {group.name}</h3>
          <div className="mb-2 text-black">Admin: {group.admin} ({group.adminEmail})</div>
          <table className="min-w-full border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-black">Participant Name</th>
                <th className="px-4 py-2 text-left text-black">Email</th>
                <th className="px-4 py-2 text-left text-black">Designation</th>
                <th className="px-4 py-2 text-left text-black">Assign Activity</th>
                <th className="px-4 py-2 text-left text-black">Assign Assessor</th>
              </tr>
            </thead>
            <tbody>
              {group.participants.map((participant) => {
                const groupAssignment = assignments.find((g) => g.groupId === group.id) || { participants: [] };
                const participantAssignment = groupAssignment.participants.find((p) => p.participantId === participant.id) || { activityIds: [], assessorIds: [] };
                return (
                  <tr key={participant.id} className="border-b">
                    <td className="px-4 py-2 text-black">{participant.name}</td>
                    <td className="px-4 py-2 text-black">{participant.email}</td>
                    <td className="px-4 py-2 text-black">{participant.designation}</td>
                    <td className="px-4 py-2 text-black" style={{ minWidth: 200 }}>
                      <Select<OptionType, true>
                        isMulti
                        options={activities}
                        value={activities.filter((a) => (participantAssignment.activityIds as string[] || []).includes(a.value))}
                        onChange={(selected: MultiValue<OptionType>) => {
                          handleAssignmentChange(group.id, participant.id, 'activityIds', Array.from(selected).map((s) => s.value));
                        }}
                        styles={customStyles}
                        placeholder="Select activities..."
                        closeMenuOnSelect={false}
                        classNamePrefix="react-select"
                      />
                    </td>
                    <td className="px-4 py-2 text-black" style={{ minWidth: 200 }}>
                      <Select<OptionType, true>
                        isMulti
                        options={assessorOptions}
                        value={assessorOptions.filter((a) => (participantAssignment.assessorIds as string[] || []).includes(a.value))}
                        onChange={(selected: MultiValue<OptionType>) => {
                          handleAssignmentChange(group.id, participant.id, 'assessorIds', Array.from(selected).map((s) => s.value));
                        }}
                        styles={customStyles}
                        placeholder="Select assessors..."
                        closeMenuOnSelect={false}
                        classNamePrefix="react-select"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ParticipantAssessorManagementStep; 