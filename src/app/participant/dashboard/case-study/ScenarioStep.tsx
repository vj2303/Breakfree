import React from 'react';
import { ActivityData, Scenario } from './types';

interface ScenarioStepProps {
  activityData?: ActivityData;
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({ activityData }) => {
  const scenarios = activityData?.activityDetail?.scenarios || [];
  
  if (!activityData?.activityDetail || scenarios.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Scenario Description</h2>
        <div className="bg-white p-6 rounded-lg border text-gray-700">
          <p className="text-gray-500 italic">No scenario data available for this activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Scenario Description</h2>
      <div className="bg-white p-6 rounded-lg border text-gray-700">
        <div className="space-y-6">
          {scenarios.map((scenario: Scenario) => (
            <div key={scenario.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">{scenario.title}</h3>
              <div className="mb-3">
                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                  <span><strong>Read Time:</strong> {scenario.readTime} minutes</span>
                  <span><strong>Exercise Time:</strong> {scenario.exerciseTime} minutes</span>
                </div>
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: scenario.data }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioStep;