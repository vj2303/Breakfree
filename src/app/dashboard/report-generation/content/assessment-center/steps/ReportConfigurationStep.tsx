import React, { useEffect, useState } from "react";
import { useAssessmentForm } from '../create/context';

const templates = [
  { id: 1, name: "Report Template 1" },
  { id: 2, name: "Report Template 2" },
];

const ReportConfigurationStep = () => {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('ReportConfigurationStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;

  // Update local state when form data changes (for edit mode)
  useEffect(() => {
    if (formData.reportTemplateName) {
      setName(formData.reportTemplateName);
    }
    if (formData.reportTemplateType) {
      const templateNumber = formData.reportTemplateType.replace('TEMPLATE', '');
      setSelectedTemplate(parseInt(templateNumber) || null);
    }
  }, [formData.reportTemplateName, formData.reportTemplateType]);

  useEffect(() => {
    updateFormData('reportTemplateName', name);
    updateFormData('reportTemplateType', selectedTemplate ? `TEMPLATE${selectedTemplate}` : '');
    try {
      console.log('[Assessment Center][ReportConfiguration] reportTemplateName:', name, 'reportTemplateType:', selectedTemplate ? `TEMPLATE${selectedTemplate}` : '');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, selectedTemplate]);

  // Log when step is saved/next is clicked
  useEffect(() => {
    const handleStepSave = () => {
      try {
        console.log('=== REPORT CONFIGURATION STEP SAVED ===');
        console.log('Report template name:', name);
        console.log('Selected template ID:', selectedTemplate);
        console.log('Report template type:', selectedTemplate ? `TEMPLATE${selectedTemplate}` : '');
        console.log('Step validation:', {
          hasTemplateName: name.trim().length > 0,
          hasTemplateSelected: selectedTemplate !== null,
          templateName: name || 'None',
          templateType: selectedTemplate ? `TEMPLATE${selectedTemplate}` : 'None'
        });
      } catch {}
    };

    // Listen for step save events
    window.addEventListener('step-save', handleStepSave);
    return () => window.removeEventListener('step-save', handleStepSave);
  }, [name, selectedTemplate]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-black">Report Configuration</h2>
       
      </div>
      <div className="bg-white rounded-2xl p-8 max-w-xl">
        <div className="font-bold text-lg text-black mb-4">Report Template</div>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <div
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white cursor-pointer flex items-center justify-between hover:border-blue-400 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setDropdownOpen(open => !open)}
            >
              <span className={selectedTemplate ? "text-black" : "text-gray-400"}>
                {selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : "Select Template"}
              </span>
              <span className={`text-gray-400 transform transition-transform duration-300 ease-in-out ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>&#8964;</span>
            </div>
            <div className={`absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden transition-all duration-300 ease-in-out ${
              dropdownOpen 
                ? 'max-h-96 opacity-100 transform translate-y-0' 
                : 'max-h-0 opacity-0 transform -translate-y-2 pointer-events-none'
            }`}>
              {templates.map(t => (
                <div
                  key={t.id}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ease-in-out hover:bg-blue-50 ${selectedTemplate === t.id ? "text-black font-semibold bg-blue-100" : "text-gray-400 hover:text-black"}`}
                  onClick={() => { setSelectedTemplate(t.id); setDropdownOpen(false); }}
                >
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportConfigurationStep;