import React from 'react';

const scenarios = [
  { id: 1, title: 'Inventory', content: 'Scenario 1: Inventory\n\nIn this exercise, first, you would need to read through a given business situation and comprehend the context.\n\nBased on the business situation, you will be required to complete certain task within the Exercise.\n\nTask 1: You would need to provide written responses to questions.\nTask 2: You would need to connect with an assessor to elaborate upon your written response.\n\nThe whole exercise will be of 60 minutes with 30 minutes of Reading Time and 30 minutes for completing the tasks. Please keep a tab on the Time left (will be visible at the top-right of the screen)\n\nIn case you face any issues during the exercise, please inform the Program Coordinator as soon as possible.' },
  { id: 2, title: 'Inventory', content: 'Scenario 2: Inventory\n\n[Scenario 2 content goes here.]' },
];

const ScenarioStep = () => {
  const [selected, setSelected] = React.useState(0);
  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="bg-white p-6 rounded-lg border text-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{scenarios[selected].title}</h3>
            <div className="flex gap-2">
              <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-medium">Exercise Time (Min) <b>30</b></span>
              <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-medium">Reading Time (Min) <b>30</b></span>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-700">{scenarios[selected].content}</pre>
        </div>
      </div>
      <div className="w-56">
        <div className="bg-white rounded-lg border mb-2 p-2 font-semibold text-center">All Scenarios</div>
        <div className="bg-white rounded-lg border divide-y">
          {scenarios.map((s, idx) => (
            <button
              key={s.id}
              className={`w-full px-4 py-2 text-left text-gray-700 font-medium rounded ${selected === idx ? 'bg-blue-50' : ''}`}
              onClick={() => setSelected(idx)}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioStep; 