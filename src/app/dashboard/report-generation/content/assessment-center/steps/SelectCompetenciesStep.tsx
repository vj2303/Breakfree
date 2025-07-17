import React, { useEffect, useState } from 'react';
import { useAssessmentForm } from '../create/context';

const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZkNjkzMjMxMjYzYjNjMmQ4OTJiYTEiLCJpYXQiOjE3NTIwODM4OTksImV4cCI6MTc1MjY4ODY5OX0.tTGDyJJ-rjo_tKQ89qKHhxcxd3G4YVn4M_qrfdqwg_0';

const SelectCompetenciesStep: React.FC = () => {
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('SelectCompetenciesStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;
  interface CompetencyLibraryItem {
    id: string;
    competencyName: string;
    subCompetencyNames?: string[];
    // Add other properties if needed
  }
  const [competencies, setCompetencies] = useState<CompetencyLibraryItem[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>(formData.competencyIds || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Store both id and name for selected competencies
    const selectedData = competencies.filter(comp => selectedCompetencies.includes(comp.id)).map(comp => ({ id: comp.id, name: comp.competencyName }));
    updateFormData('competencyIds', selectedCompetencies);
    updateFormData('selectedCompetenciesData', selectedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompetencies, competencies]);

  useEffect(() => {
    const fetchCompetencies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3000/api/competency-libraries?page=1&limit=10&search=', {
          headers: {
            Authorization: AUTH_TOKEN,
          },
        });
        const data = await res.json();
        setCompetencies(data?.data?.competencyLibraries || []);
        // Store the full list in context for other steps
        updateFormData('competencyLibraryList', data?.data?.competencyLibraries || []);
      } catch {
        setError('Failed to fetch competencies');
      } finally {
        setLoading(false);
      }
    };
    fetchCompetencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = (id: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Select Competencies</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {competencies.map(comp => (
            <div key={comp.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                id={comp.id}
                checked={selectedCompetencies.includes(comp.id)}
                onChange={() => handleCheck(comp.id)}
                className="w-5 h-5"
              />
              <label htmlFor={comp.id} className="font-semibold text-black text-base cursor-pointer">
                {comp.competencyName}
              </label>
              {comp.subCompetencyNames && comp.subCompetencyNames.length > 0 && (
                <span className="text-gray-500 text-sm ml-2">({comp.subCompetencyNames.join(', ')})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectCompetenciesStep; 