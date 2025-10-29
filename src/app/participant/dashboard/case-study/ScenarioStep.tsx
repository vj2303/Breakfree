import React from 'react';

interface ScenarioStepProps {
  activityData?: any;
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({ activityData }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Scenario Description</h2>
    <div className="bg-white p-6 rounded-lg border text-gray-700">
      {activityData?.activityDetail?.scenarios && activityData.activityDetail.scenarios.length > 0 ? (
        <div className="space-y-6">
          {activityData.activityDetail.scenarios.map((scenario: any, index: number) => (
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
      ) : (
        <p className="text-gray-500 italic">No scenario data available for this activity.</p>
      )}
    </div>
  </div>
);

export default ScenarioStep; 