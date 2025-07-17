'use client';

import React from 'react';
import { Scenario, Task } from '../page';

interface PreviewStepProps {
  formData: {
    overview: string;
    exerciseTime: number;
    readingTime: number;
  };
  scenarios: Scenario[];
  tasks: Task[];
}

const PreviewStep: React.FC<PreviewStepProps> = ({ formData, scenarios, tasks }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Preview</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-black">Exercise Time (Min)</span>
            <span className="font-medium text-black">{formData.exerciseTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black">Reading Time (Min)</span>
            <span className="font-medium text-black">{formData.readingTime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Section */}
        {formData.overview && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2 text-black">Overview and Instructions</h3>
            <div 
              className="text-sm text-black" 
              dangerouslySetInnerHTML={{ __html: formData.overview }} 
            />
          </div>
        )}

        <div className="flex gap-4">
          {/* All Tasks Section */}
          <div className="flex-1">
            <h4 className="font-medium mb-2 text-black">All Tasks ({tasks.length})</h4>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-black">{task.title}</h5>
                    <div className="flex items-center gap-2">
                      {task.responseType && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-black">
                          {task.responseType}
                        </span>
                      )}
                      {task.isMandatory && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-black mt-1">
                    Exercise: {task.exerciseTime}min | Reading: {task.readingTime}min
                  </div>
                  {task.content && (
                    <div 
                      className="text-xs text-gray-700 mt-2" 
                      dangerouslySetInnerHTML={{ __html: task.content.substring(0, 100) + '...' }} 
                    />
                  )}
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No tasks created yet</p>
                </div>
              )}
            </div>
          </div>

          {/* All Scenarios Section */}
          <div className="flex-1">
            <h4 className="font-medium mb-2 text-black">All Scenarios ({scenarios.length})</h4>
            <div className="space-y-2">
              {scenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-black">{scenario.title}</h5>
                    <div className="text-xs text-black">
                      {scenario.exerciseTime}min / {scenario.readingTime}min
                    </div>
                  </div>
                  {scenario.content && (
                    <div 
                      className="text-xs text-gray-700 mt-2" 
                      dangerouslySetInnerHTML={{ __html: scenario.content.substring(0, 100) + '...' }} 
                    />
                  )}
                </div>
              ))}
              
              {scenarios.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No scenarios created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-medium mb-3 text-black">Assessment Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scenarios.length}</div>
              <div className="text-black">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
              <div className="text-black">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {scenarios.reduce((sum, s) => sum + s.exerciseTime, 0)}
              </div>
              <div className="text-black">Total Exercise Time (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {scenarios.reduce((sum, s) => sum + s.readingTime, 0)}
              </div>
              <div className="text-black">Total Reading Time (min)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;