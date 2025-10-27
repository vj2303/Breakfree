import * as React from 'react';

export interface CompetencyData {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  activityType: string;
  activityContent: string;
  displayName: string;
  displayInstructions: string;
}

// Updated Assignment interface to match the required structure
export interface AssignmentParticipant {
  participantId: string;
  activityIds: string[];
  assessorId: string; // Changed from assessorIds array to single assessorId
}

export interface GroupAssignment {
  groupId: string;
  participants: AssignmentParticipant[];
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
  assignments: GroupAssignment[]; // Updated to use GroupAssignment
  document: File | null;
}

export interface AssessmentFormContextType {
  formData: FormData;
  updateFormData: (field: string, value: unknown) => void;
  isLoading?: boolean;
}

export const AssessmentFormContext = React.createContext<AssessmentFormContextType | null>(null);
export const useAssessmentForm = () => {
  const context = React.useContext(AssessmentFormContext);
  if (!context) {
    throw new Error('useAssessmentForm must be used within an AssessmentFormProvider');
  }
  return context;
}; 