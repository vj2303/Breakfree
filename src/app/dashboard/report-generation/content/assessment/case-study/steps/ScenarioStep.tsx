'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Editor from '@/components/Editor';
import { Scenario } from '../CaseStudyAssessment';

interface ScenarioStepProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  setCurrentScenario: (scenario: Scenario) => void;
  onScenarioSelect: (scenario: Scenario) => void;
  onAddNew: () => void;
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({
  scenarios,
  currentScenario,
  setCurrentScenario,
  onScenarioSelect,
  onAddNew
}) => {
  const updateCurrentScenario = (field: keyof Scenario, value: string | number) => {
    setCurrentScenario({
      ...currentScenario,
      [field]: value
    });
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

        <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <div className="text-gray-500 mb-2">📁</div>
          <p className="text-sm text-black">
            Click to choose files or <button className="text-blue-600 hover:underline">browse</button>
          </p>
        </div>
      </div>

      <div className="w-80">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-black">All Scenarios</h3>
            <button 
              onClick={onAddNew}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Scenario
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
                    <p className="text-xs text-gray-600 mt-1">
                      Exercise: {scenario.exerciseTime}min | Reading: {scenario.readingTime}min
                    </p>
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
                        // Handle delete
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {scenarios.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No scenarios created yet</p>
                <button 
                  onClick={onAddNew}
                  className="text-blue-600 text-sm hover:underline mt-2"
                >
                  Create your first scenario
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioStep;