'use client'
import React, { useState, createContext, useContext } from "react";
import AssessmentCenterLayout from "../AssessmentCenterLayout";
import SelectContentStep from "../steps/SelectContentStep";
import SelectCompetenciesStep from "../steps/SelectCompetenciesStep";
import SubjectExerciseMatrixStep from "../steps/SubjectExerciseMatrixStep";
import AddFrameworkStep from "../steps/AddFrameworkStep";
import AddDocumentStep from "../steps/AddDocumentStep";
import ReportConfigurationStep from "../steps/ReportConfigurationStep";
import ParticipantAssessorManagementStep from "../steps/ParticipantAssessorManagementStep";

// Context for form data
export const AssessmentFormContext = createContext<any>(null);
export const useAssessmentForm = () => useContext(AssessmentFormContext);

const CreateAssessmentCenter = () => {
  const [currentStep, setCurrentStep] = useState(0);
  // State for all form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayName: '',
    displayInstructions: '',
    competencyIds: [],
    selectedCompetenciesData: [], // [{id, name}]
    reportTemplateName: '',
    reportTemplateType: '',
    activities: [],
    assignments: [],
    document: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handler to update form data from steps
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    } catch (err: any) {
      setError(err.message || 'Failed to create assessment center');
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
    <AssessmentFormContext.Provider value={{ formData, updateFormData }}>
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
    </AssessmentFormContext.Provider>
  );
};

export default CreateAssessmentCenter; 