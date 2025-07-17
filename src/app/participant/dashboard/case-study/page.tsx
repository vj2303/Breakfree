'use client'

import React, { useState } from 'react';
import OverviewStep from './OverviewStep';
import ScenarioStep from './ScenarioStep';
import TaskStep from './TaskStep';
import ReviewStep from './ReviewStep';

const steps = [
  'Overview and Instructions',
  'Scenario Description',
  'Task',
  'Review',
];

const stepContent = [
  <OverviewStep key="overview" />, 
  <ScenarioStep key="scenario" />, 
  <TaskStep key="task" />, 
  <ReviewStep key="review" />
];

const CaseStudyPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className=" mt-8 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-2 mb-6 shadow border">
        <h1 className="text-2xl font-bold mb-1">Case Study Assessment</h1>
        <div className="text-gray-500 text-sm mb-4">Created on 2 Jan 2025</div>
        {/* Stepper */}
        <div className="flex items-center gap-6 mb-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className={`text-sm font-medium ${currentStep === idx ? 'text-black' : 'text-gray-400'}`}>{step}</span>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1
                  ${currentStep === idx ? 'border-blue-600 bg-blue-100' : 'border-gray-300 bg-white'}`}
                >
                  {currentStep > idx ? (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  ) : currentStep === idx ? (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  ) : null}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="w-8 h-1 bg-gray-200 rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-6">
        {stepContent[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-2">
        {currentStep > 0 && (
          <button
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-medium hover:bg-gray-300"
            onClick={handlePrev}
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            className="px-6 py-2 rounded bg-gray-800 text-white font-medium hover:bg-gray-700"
            onClick={handleNext}
          >
            {currentStep === 0 ? 'Start' : 'Next'}
          </button>
        ) : (
          <button
            className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
            onClick={() => alert('Submit!')}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseStudyPage;