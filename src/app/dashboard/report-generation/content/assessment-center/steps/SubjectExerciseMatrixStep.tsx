import React, { useState, useEffect, useMemo } from "react";
import { useAssessmentForm } from '../create/context';

const activityTypeLabel = (type: string) => {
  if (type === 'case-study') return 'Case Study';
  if (type === 'inbox-activity') return 'Inbox Activity';
  return type;
};

// Use the Activity type from FormData (id, name, type)
interface Activity {
  id: string;
  name: string;
  type: string;
  displayName?: string;
  displayInstructions?: string;
}

interface Competency {
  name: string;
  id: string;
  subCompetencyNames: string[];
}

interface CompetencyLibraryItem {
  id: string;
  name: string;
  subCompetencyNames?: string[];
}

interface SubCompetencyScore {
  [subCompetency: string]: string;
}

// Type for mapped activities used in rendering
interface RenderActivity {
  label: string;
  instruction: string;
  activityType: string;
  activityContent: string;
}

// Add interface for form data structure
interface FormData {
  activities?: Activity[];
  selectedCompetenciesData?: Array<{id: string, name: string}>;
  competencyLibraryList?: CompetencyLibraryItem[];
  competencyIds?: string[];
}

const SubjectExerciseMatrixStep: React.FC = () => {
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('SubjectExerciseMatrixStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;

  // Activities and competencies from formData - memoized for performance
  const activities: RenderActivity[] = useMemo(() => {
    const formDataActivities = formData.activities || [];
    return formDataActivities.map((a: Activity) => ({
      label: a.displayName || a.name || a.type,
      instruction: a.displayInstructions || '',
      activityType: a.type,
      activityContent: a.id,
    }));
  }, [formData.activities]);

  // Get competency names and subcompetencies from formData (store both id and name)
  const competencies = useMemo(() => {
    const formDataSelectedCompetencies = formData.selectedCompetenciesData || [];
    const formDataCompetencyLibraryList = (formData as FormData).competencyLibraryList || [];
    
    return formDataSelectedCompetencies.map((comp: {id: string, name: string}) => {
      // Find full competency object for subCompetencies
      const full = formDataCompetencyLibraryList.find((c: CompetencyLibraryItem) => c.id === comp.id);
      return {
        name: comp.name,
        id: comp.id,
        subCompetencyNames: full?.subCompetencyNames || [],
      };
    });
  }, [formData]);

  // Fallback for backward compatibility if selectedCompetenciesData is not set
  const fallbackCompetencies = useMemo(() => {
    const formDataCompetencyIds = formData.competencyIds || [];
    return formDataCompetencyIds.map((id: string, idx: number) => ({
      name: `Competency ${idx + 1}`,
      id,
      subCompetencyNames: [],
    }));
  }, [formData.competencyIds]);

  const finalCompetencies = competencies.length > 0 ? competencies : fallbackCompetencies;

  // Matrix state: rows = competencies, cols = activities, default OFF
  const [matrix, setMatrix] = useState<boolean[][]>([]);
  // Scores: { [rowIdx_colIdx]: { [subCompetency]: score } }
  const [scores] = useState<{ [key: string]: SubCompetencyScore }>({});

  // Initialize matrix to all false (off)
  useEffect(() => {
    setMatrix(
      finalCompetencies.map((): boolean[] => activities.map((): boolean => false))
    );
  }, [activities, finalCompetencies]);

  // Store matrix and scores in context
  useEffect(() => {
    updateFormData('matrix', matrix);
    updateFormData('matrixScores', scores);
  }, [matrix, scores, updateFormData]);

  const handleToggle = (rowIdx: number, colIdx: number) => {
    setMatrix(prev =>
      prev.map((row: boolean[], r: number) =>
        row.map((val: boolean, c: number) =>
          r === rowIdx && c === colIdx ? !val : val
        )
      )
    );
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
              {activities.map((activity: RenderActivity, idx: number) => (
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
              {activities.map((activity: RenderActivity, idx: number) => (
                <td key={idx} className="px-6 py-2 text-gray-700 border-b border-blue-900">
                  {activity.instruction}
                </td>
              ))}
            </tr>
            {/* Competency Rows */}
            {finalCompetencies.map((comp: Competency, rowIdx: number) => (
              <tr key={comp.id}>
                <td className="px-6 py-4 font-bold text-black border-b">{comp.name}</td>
                {activities.map((activity: RenderActivity, colIdx: number) => {
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