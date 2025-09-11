import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import Editor from "@/components/Editor";

interface Scenario {
  id: string | number; // Updated to match ScenarioType
  title: string;
  content: string;
  exerciseTime: number;
  readingTime: number;
  documents: { id: string; name: string; url: string; size: number; type: string }[];
}

interface ScenarioStepProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  setCurrentScenario: React.Dispatch<React.SetStateAction<Scenario>>;
  onScenarioSelect: (scenario: Scenario) => void;
  onAddNew: () => void;
  onAddScenario: (scenario: Scenario) => void;
  onDeleteScenario: (id: string | number) => void; // Updated to match the function signature
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({
  scenarios,
  currentScenario,
  setCurrentScenario,
  onScenarioSelect,
  onAddNew,
  onAddScenario,
  onDeleteScenario
}) => {
  const updateCurrentScenario = (field: keyof Scenario, value: string | number) => {
    setCurrentScenario((prev) => ({
      ...prev,
      [field]: value as never,
    }));
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const mapped = Array.from(files).map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      type: f.type,
    }));
    setCurrentScenario((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...mapped],
    }));
  };

  const removeDocument = (docId: string) => {
    setCurrentScenario((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== docId),
    }));
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Scenario Description</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-black">Exercise Time (Min)</span>
              <input 
                type="number" 
                value={currentScenario.exerciseTime}
                onChange={(e) => updateCurrentScenario('exerciseTime', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black">Reading Time (Min)</span>
              <input 
                type="number" 
                value={currentScenario.readingTime}
                onChange={(e) => updateCurrentScenario('readingTime', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-black"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-black">Title</label>
          <input 
            type="text" 
            value={currentScenario.title}
            onChange={(e) => updateCurrentScenario('title', e.target.value)}
            placeholder="Inventory"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
          />
        </div>

        <Editor
          content={currentScenario.content}
          onChange={(value) => updateCurrentScenario('content', value)}
        />

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2 text-black">Attach Documents</label>
          <div
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50"
            onClick={() => document.getElementById('scenario-file-input')?.click()}
          >
            <div className="text-gray-500 mb-2">📁</div>
            <p className="text-sm text-black">
              Click to choose files or <span className="text-blue-600 hover:underline">browse</span>
            </p>
            <input
              id="scenario-file-input"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>

          {(currentScenario.documents && currentScenario.documents.length > 0) && (
            <div className="mt-4 space-y-2">
              {currentScenario.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">📄</span>
                    <div>
                      <p className="text-sm text-black">{doc.name}</p>
                      <p className="text-xs text-gray-500">{Math.round(doc.size / 1024)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-black">All Scenarios</h3>
            <button 
              onClick={() => {
                onAddScenario(currentScenario);
                onAddNew();
              }}
              className="flex items-center text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Scenario
            </button>
          </div>
          
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <div 
                key={scenario.id}
                className={`p-3 rounded border-l-4 cursor-pointer transition-colors ${
                  currentScenario.id === scenario.id 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onScenarioSelect(scenario)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-black">{scenario.title}</h4>
                    {(scenario.exerciseTime > 0 || scenario.readingTime > 0) && (
                      <p className="text-xs text-gray-600 mt-1">
                        Exercise: {scenario.exerciseTime}min | Reading: {scenario.readingTime}min
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onScenarioSelect(scenario);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
                          onDeleteScenario(scenario.id);
                        }
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioStep;