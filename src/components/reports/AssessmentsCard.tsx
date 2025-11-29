"use client";

import React from 'react';

interface OverviewData {
  totalAssessments: number;
  assigned: number;
  inProgress: number;
  completed: number;
  assignedPercentage: number;
  inProgressPercentage: number;
  completedPercentage: number;
}

interface AssessmentsCardProps {
  data: OverviewData | null;
}

const AssessmentsCard: React.FC<AssessmentsCardProps> = ({ data }) => {
  const defaultData = {
    totalAssessments: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    assignedPercentage: 0,
    inProgressPercentage: 0,
    completedPercentage: 0,
  };

  const stats = data || defaultData;

  const progressBars = [
    {
      label: 'Assigned',
      count: stats.assigned,
      percentage: stats.assignedPercentage,
      color: 'bg-yellow-400',
      textColor: 'text-yellow-700',
    },
    {
      label: 'In progress',
      count: stats.inProgress,
      percentage: stats.inProgressPercentage,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      label: 'Completed',
      count: stats.completed,
      percentage: stats.completedPercentage,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Assessments</h2>
        <p className="text-sm text-gray-600">
          Total number of assessment: {stats.totalAssessments}
        </p>
      </div>

      <div className="space-y-4">
        {progressBars.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{bar.label}</span>
              <span className={`font-semibold ${bar.textColor}`}>{bar.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`${bar.color} h-full rounded-full transition-all duration-500`}
                style={{ width: `${bar.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Number of assessment: {bar.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentsCard;

