import React from 'react';

interface ScenarioStepProps {
  activityDetail?: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    videoUrl?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    scenarios: Array<{
      id: string;
      title: string;
      readTime: number;
      exerciseTime: number;
      data: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    characters: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    organizationCharts: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      parentId: string | null;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    contents: Array<{
      id: string;
      to: string[];
      from: string;
      cc: string[];
      bcc: string[];
      subject: string;
      date: string;
      emailContent: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const ScenarioStep: React.FC<ScenarioStepProps> = ({ activityDetail }) => {
  const [selected, setSelected] = React.useState(0);
  
  const scenarios = activityDetail?.scenarios || [];
  
  if (!activityDetail || scenarios.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Scenario Description</h2>
        <div className="bg-white p-6 rounded-lg border text-black">
          <p>No scenarios available for this activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Scenario Description</h2>
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white p-6 rounded-lg border text-black">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{scenarios[selected].title}</h3>
              <div className="flex gap-2">
                <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  Exercise Time (Min) <b>{scenarios[selected].exerciseTime}</b>
                </span>
                <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  Reading Time (Min) <b>{scenarios[selected].readTime}</b>
                </span>
              </div>
            </div>
            <div 
              className="text-black" 
              dangerouslySetInnerHTML={{ __html: scenarios[selected].data }}
            />
          </div>
        </div>
        {scenarios.length > 1 && (
          <div className="w-56">
            <div className="bg-white rounded-lg border mb-2 p-2 font-semibold text-center">All Scenarios</div>
            <div className="bg-white rounded-lg border divide-y">
              {scenarios.map((scenario, idx) => (
                <button
                  key={scenario.id}
                  className={`w-full px-4 py-2 text-left text-black font-medium rounded ${selected === idx ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelected(idx)}
                >
                  {scenario.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioStep; 