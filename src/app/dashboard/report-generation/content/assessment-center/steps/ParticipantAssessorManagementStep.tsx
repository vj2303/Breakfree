import React, { useEffect, useState } from 'react';
import { useAssessmentForm } from '../create/page';
import Select from 'react-select';

const GROUPS_API = 'http://localhost:3000/api/groups?page=1&limit=10&search=';
const ASSESSORS_API = 'http://localhost:3000/api/assessors?page=1&limit=10&search=';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZkNjkzMjMxMjYzYjNjMmQ4OTJiYTEiLCJpYXQiOjE3NTIwODM4OTksImV4cCI6MTc1MjY4ODY5OX0.tTGDyJJ-rjo_tKQ89qKHhxcxd3G4YVn4M_qrfdqwg_0';

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    color: 'black',
    borderColor: '#d1d5db',
    minHeight: '36px',
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: '#f3f4f6',
    color: 'black',
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: 'black',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    color: 'black',
    backgroundColor: state.isSelected ? '#e5e7eb' : 'white',
  }),
  menu: (provided: any) => ({
    ...provided,
    color: 'black',
    zIndex: 9999,
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'black',
  }),
};

const ParticipantAssessorManagementStep: React.FC = () => {
  const { formData, updateFormData } = useAssessmentForm();
  const [groups, setGroups] = useState<any[]>([]);
  const [assessors, setAssessors] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>(formData.assignments || []);
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
      } catch (err) {
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

  const handleAssignmentChange = (groupId: string, participantId: string, field: string, value: any) => {
    setAssignments(prev => {
      const groupIdx = prev.findIndex((g: any) => g.groupId === groupId);
      let newAssignments = [...prev];
      if (groupIdx === -1) {
        newAssignments.push({ groupId, participants: [{ participantId, [field]: value, activityIds: [], assessorIds: [] }] });
      } else {
        const participantIdx = newAssignments[groupIdx].participants.findIndex((p: any) => p.participantId === participantId);
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
  const activities = [
    { value: 'case-study', label: 'Case Study' },
    { value: 'inbox', label: 'Inbox' },
  ];

  const assessorOptions = assessors.map((ass: any) => ({
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
              {group.participants.map((participant: any) => {
                const groupAssignment = assignments.find((g: any) => g.groupId === group.id) || { participants: [] };
                const participantAssignment = groupAssignment.participants.find((p: any) => p.participantId === participant.id) || {};
                return (
                  <tr key={participant.id} className="border-b">
                    <td className="px-4 py-2 text-black">{participant.name}</td>
                    <td className="px-4 py-2 text-black">{participant.email}</td>
                    <td className="px-4 py-2 text-black">{participant.designation}</td>
                    <td className="px-4 py-2 text-black" style={{ minWidth: 200 }}>
                      <Select
                        isMulti
                        options={activities}
                        value={activities.filter((a: any) => (participantAssignment.activityIds || []).includes(a.value))}
                        onChange={selected => {
                          handleAssignmentChange(group.id, participant.id, 'activityIds', selected.map((s: any) => s.value));
                        }}
                        styles={customStyles}
                        placeholder="Select activities..."
                        closeMenuOnSelect={false}
                        classNamePrefix="react-select"
                      />
                    </td>
                    <td className="px-4 py-2 text-black" style={{ minWidth: 200 }}>
                      <Select
                        isMulti
                        options={assessorOptions}
                        value={assessorOptions.filter((a: any) => (participantAssignment.assessorIds || []).includes(a.value))}
                        onChange={selected => {
                          handleAssignmentChange(group.id, participant.id, 'assessorIds', selected.map((s: any) => s.value));
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