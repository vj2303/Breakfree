import React from "react";
import Editor from "@/components/Editor";

interface OverviewStepProps {
  formData: {
    overview: string;
    exerciseTime: number;
    readingTime: number;
    name?: string;
    description?: string;
  };
  updateFormData: (field: string, value: string | number) => void;
}

const OverviewStep: React.FC<OverviewStepProps> = ({ formData, updateFormData }) => {
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={e => updateFormData('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter assessment name"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={e => updateFormData('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter a brief description"
          required
        />
      </div>
      <h2 className="text-xl font-semibold mb-4 text-black">Create Instructions</h2>
      <Editor
        content={formData.overview}
        onChange={(value) => updateFormData('overview', value)}
      />
      <div className="mt-4 p-4 border border-gray-200 rounded-md">
        <p className="text-sm text-black">Add a video (Optional)</p>
        <button className="text-blue-600 text-sm hover:underline mt-1">
          Add Link here
        </button>
      </div>
    </div>
  );
};

export default OverviewStep; 