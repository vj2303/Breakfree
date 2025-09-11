'use client'
import React, { useState } from "react";
import AssessmentCenterLayout from "../AssessmentCenterLayout";
import SelectContentStep from "../steps/SelectContentStep";
import SelectCompetenciesStep from "../steps/SelectCompetenciesStep";
import SubjectExerciseMatrixStep from "../steps/SubjectExerciseMatrixStep";
import AddFrameworkStep from "../steps/AddFrameworkStep";
import AddDocumentStep from "../steps/AddDocumentStep";
import ReportConfigurationStep from "../steps/ReportConfigurationStep";
import ParticipantAssessorManagementStep from "../steps/ParticipantAssessorManagementStep";
import { AssessmentFormContext, useAssessmentForm } from "./context";
import type { FormData } from "./context";
import { useAuth } from "../../../../../../context/AuthContext";

const stepTitles = [
  "Select Content",
  "Select Competencies", 
  "Subject - Exercise Matrix",
  "Add Framework",
  "Add Document",
  "Report configuration",
  "Participant and assessor management",
];

// Define interfaces for type safety
interface Activity {
  activityType?: string;
  type?: string;
  activityContent?: string;
  id?: string;
  displayName?: string;
  displayInstructions?: string;
}

// Remove the Assignment interface and use the actual GroupAssignment type from context
// interface Assignment {
//   [key: string]: unknown;
// }

const AssessmentFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    displayName: '',
    displayInstructions: '',
    competencyIds: [],
    selectedCompetenciesData: [],
    reportTemplateName: '',
    reportTemplateType: '',
    activities: [],
    assignments: [],
    document: null,
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value } as FormData;
      try {
        const payloadPreview = buildPayloadPreview(updated);
        console.log("[Assessment Center] Updated field:", field, "=>", value);
        console.log("[Assessment Center] Payload preview:", payloadPreview);
      } catch (e) {
        console.log("[Assessment Center] Payload preview error:", e);
      }
      return updated;
    });
  };

  return (
    <AssessmentFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </AssessmentFormContext.Provider>
  );
};

const CreateAssessmentCenterContent = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { formData } = useAssessmentForm();
  const { token } = useAuth();

  // Handler for final submit
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      console.log("[Assessment Center] Submitting with formData:", formData);
      
      const payload = buildPayloadPreview(formData);
      console.log("[Assessment Center] Final payload structure:", payload);
      console.log("[Assessment Center] Activities structure:", payload.activities);
      console.log("[Assessment Center] Assignments structure:", payload.assignments);
      
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('displayName', formData.displayName);
      form.append('displayInstructions', formData.displayInstructions);
      form.append('competencyIds', JSON.stringify(formData.competencyIds));
      form.append('selectedCompetenciesData', JSON.stringify(formData.selectedCompetenciesData));
      form.append('reportTemplateName', formData.reportTemplateName);
      form.append('reportTemplateType', formData.reportTemplateType);
      form.append('activities', JSON.stringify(payload.activities));
      form.append('assignments', JSON.stringify(payload.assignments));
      if (formData.document) {
        form.append('document', formData.document);
      }
      const res = await fetch('https://api.breakfreeacademy.in/api/assessment-centers', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: form,
      });
      if (!res.ok) throw new Error('Failed to create assessment center');
      setSuccess(true);
      // Optionally redirect or reset form
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create assessment center');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step components with props to update formData
  const stepComponents = [
    <SelectContentStep key="select-content" />,
    <SelectCompetenciesStep key="select-competencies" />,
    <SubjectExerciseMatrixStep key="subject-exercise-matrix" />,
    <AddFrameworkStep key="add-framework" />,
    <AddDocumentStep key="add-document" />,
    <ReportConfigurationStep key="report-configuration" />,
    <ParticipantAssessorManagementStep key="participant-assessor-management" />,
  ];

  const handleSave = () => {
    try {
      console.log(`[Assessment Center] Step ${currentStep + 1} saved. Current payload preview:`, buildPayloadPreview(formData));
      
      // Dispatch custom event to notify all step components to log their state
      window.dispatchEvent(new CustomEvent('step-save', { 
        detail: { 
          stepNumber: currentStep + 1, 
          stepName: stepTitles[currentStep],
          formData: formData 
        } 
      }));
    } catch {}
    if (currentStep < stepComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <AssessmentCenterLayout
      currentStep={currentStep}
      onStepChange={(next) => {
        try {
          console.log(`[Assessment Center] Navigating to step ${next + 1}. Current payload preview:`, buildPayloadPreview(formData));
        } catch {}
        setCurrentStep(next);
      }}
      onSave={handleSave}
      showSaveButton={currentStep < stepComponents.length - 1 || !loading}
      saveButtonText={currentStep === stepComponents.length - 2 ? "Finish" : "Save and Next"}
    >
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">Assessment Center created successfully!</div>}
      {stepComponents[currentStep]}
    </AssessmentCenterLayout>
  );
};

const CreateAssessmentCenter = () => {
  return (
    <AssessmentFormProvider>
      <CreateAssessmentCenterContent />
    </AssessmentFormProvider>
  );
};

// Only export the default component
export default CreateAssessmentCenter;

// Helper to build API payload preview matching the POST endpoint structure
function buildPayloadPreview(data: FormData) {
  const activityTypeMap: Record<string, string> = {
    'case-study': 'CASE_STUDY',
    'inbox-activity': 'INBOX_ACTIVITY',
  };

  // Transform activities to match the required format
  const activities = (data.activities || []).map((a: Activity, index: number) => {
    // Get the competencyLibraryId from the first selected competency
    const competencyLibraryId = (data.competencyIds || [])[0] || '';
    
    return {
      activityType: activityTypeMap[a.activityType || ''] || a.type || '',
      activityId: a.activityContent || a.id || '',
      competencyLibraryId: competencyLibraryId,
      displayOrder: index + 1,
      displayName: a.displayName || '',
      displayInstructions: a.displayInstructions || '',
    };
  });

  // Use the assignments directly without casting - they're already the correct type
  const assignments = data.assignments || [];

  return {
    name: data.name,
    description: data.description,
    displayName: data.displayName,
    displayInstructions: data.displayInstructions,
    competencyIds: data.competencyIds,
    reportTemplateName: data.reportTemplateName,
    reportTemplateType: data.reportTemplateType,
    activities,
    assignments,
    document: data.document ? (data.document as File).name : undefined,
  };
}