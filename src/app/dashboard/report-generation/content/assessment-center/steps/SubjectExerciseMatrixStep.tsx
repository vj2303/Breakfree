import React, { useState, useEffect } from "react";
import { useAssessmentForm } from '../create/page';

const activityTypeLabel = (type: string) => {
  if (type === 'case-study') return 'Case Study';
  if (type === 'inbox-activity') return 'Inbox Activity';
  return type;
};

interface SubCompetencyScore {
  [subCompetency: string]: string;
}

const SubjectExerciseMatrixStep: React.FC = () => {
  const { formData, updateFormData } = useAssessmentForm();
  // Activities and competencies from formData
  const activities = (formData.activities || []).map((a: any) => ({
    label: a.displayName || a.activityType,
    instruction: a.displayInstructions || '',
    activityType: a.activityType,
    activityContent: a.activityContent,
  }));
  // Get competency names and subcompetencies from formData (store both id and name)
  const competencies = (formData.selectedCompetenciesData || []).map((comp: {id: string, name: string}) => {
    // Find full competency object for subCompetencies
    const full = (formData.competencyLibraryList || []).find((c: any) => c.id === comp.id);
    return {
      name: comp.name,
      id: comp.id,
      subCompetencyNames: full?.subCompetencyNames || [],
    };
  });

  // Fallback for backward compatibility if selectedCompetenciesData is not set
  const fallbackCompetencies = (formData.competencyIds || []).map((id: string, idx: number) => ({
    name: `Competency ${idx + 1}`,
    id,
    subCompetencyNames: [],
  }));

  const finalCompetencies = competencies.length > 0 ? competencies : fallbackCompetencies;

  // Matrix state: rows = competencies, cols = activities, default OFF
  const [matrix, setMatrix] = useState<boolean[][]>([]);
  // Scores: { [rowIdx_colIdx]: { [subCompetency]: score } }
  const [scores, setScores] = useState<{ [key: string]: SubCompetencyScore }>({});

  // Initialize matrix to all false (off)
  useEffect(() => {
    setMatrix(
      finalCompetencies.map((): boolean[] => activities.map((): boolean => false))
    );
  }, [activities.length, finalCompetencies.length]);

  // Store matrix and scores in context
  useEffect(() => {
    updateFormData('matrix', matrix);
    updateFormData('matrixScores', scores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrix, scores]);

  const handleToggle = (rowIdx: number, colIdx: number) => {
    setMatrix(prev =>
      prev.map((row: boolean[], r: number) =>
        row.map((val: boolean, c: number) =>
          r === rowIdx && c === colIdx ? !val : val
        )
      )
    );
  };

  const handleScoreChange = (rowIdx: number, colIdx: number, sub: string, value: string) => {
    const key = `${rowIdx}_${colIdx}`;
    setScores(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [sub]: value,
      },
    }));
  };

  if (!activities.length || !finalCompetencies.length) {
    return <div className="text-gray-500">Please select activities and competencies in previous steps.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-black">Subject - Exercise Matrix</h2>
        <span className="text-black text-lg font-bold">?</span>
      </div>
      <div className="bg-white rounded-2xl overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-base font-semibold text-black border-b">Assessment Type</th>
              {activities.map((activity: any, idx: number) => (
                <th key={idx} className="px-6 py-4 text-center text-base font-semibold text-black border-b">
                  {activityTypeLabel(activity.activityType)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Assessment Description Row */}
            <tr>
              <td className="px-6 py-2 font-semibold text-black border-b border-blue-900">Assessment Description</td>
              {activities.map((activity: any, idx: number) => (
                <td key={idx} className="px-6 py-2 text-gray-700 border-b border-blue-900">
                  {activity.instruction}
                </td>
              ))}
            </tr>
            {/* Competency Rows */}
            {finalCompetencies.map((comp: {name: string, id: string, subCompetencyNames: string[]}, rowIdx: number) => (
              <tr key={comp.id}>
                <td className="px-6 py-4 font-bold text-black border-b">{comp.name}</td>
                {activities.map((activity: any, colIdx: number) => {
                  const isOn = matrix[rowIdx]?.[colIdx] || false;
                  return (
                    <td key={colIdx} className="px-6 py-4 border-b text-center align-top">
                      <div className="flex flex-col items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => handleToggle(rowIdx, colIdx)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gray-900 transition-all duration-300"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white border border-gray-300 rounded-full transition-all duration-300 peer-checked:translate-x-4"></div>
                        </label>
                        {/* No subcompetencies or score input here */}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectExerciseMatrixStep; 