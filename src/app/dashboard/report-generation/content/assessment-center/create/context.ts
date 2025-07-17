import * as React from 'react';

export interface CompetencyData {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
}

export interface Assignment {
  id: string;
  participantId: string;
  assessorId: string;
}

export interface FormData {
  name: string;
  description: string;
  displayName: string;
  displayInstructions: string;
  competencyIds: string[];
  selectedCompetenciesData: CompetencyData[];
  reportTemplateName: string;
  reportTemplateType: string;
  activities: Activity[];
  assignments: Assignment[];
  document: File | null;
}

export interface AssessmentFormContextType {
  formData: FormData;
  updateFormData: (field: string, value: unknown) => void;
}

export const AssessmentFormContext = React.createContext<AssessmentFormContextType | null>(null);
export const useAssessmentForm = () => {
  const context = React.useContext(AssessmentFormContext);
  if (!context) {
    throw new Error('useAssessmentForm must be used within an AssessmentFormProvider');
  }
  return context;
}; 