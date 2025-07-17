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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Handler for final submit
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('displayName', formData.displayName);
      form.append('displayInstructions', formData.displayInstructions);
      form.append('competencyIds', JSON.stringify(formData.competencyIds));
      form.append('selectedCompetenciesData', JSON.stringify(formData.selectedCompetenciesData));
      form.append('reportTemplateName', formData.reportTemplateName);
      form.append('reportTemplateType', formData.reportTemplateType);
      form.append('activities', JSON.stringify(formData.activities));
      form.append('assignments', JSON.stringify(formData.assignments));
      if (formData.document) {
        form.append('document', formData.document);
      }
      const res = await fetch('http://localhost:3000/api/assessment-centers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer <YOUR_TOKEN_HERE>` // Replace with real token logic
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
    if (currentStep < stepComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <AssessmentCenterLayout
      currentStep={currentStep}
      onStepChange={setCurrentStep}
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