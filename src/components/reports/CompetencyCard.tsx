"use client";

import React from 'react';
import { Search } from 'lucide-react';

interface CompetencyData {
  competencyId: string;
  competencyName: string;
  averageScore: number;
}

interface CompetencyCardProps {
  competencies: CompetencyData[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const CompetencyCard: React.FC<CompetencyCardProps> = ({
  competencies,
  searchValue,
  onSearchChange,
}) => {
  // Color palette for gauges
  const colors = [
    { bg: 'bg-purple-500', text: 'text-purple-700' },
    { bg: 'bg-yellow-400', text: 'text-yellow-700' },
    { bg: 'bg-orange-500', text: 'text-orange-700' },
    { bg: 'bg-red-500', text: 'text-red-700' },
  ];

  const CircularGauge: React.FC<{ score: number; color: typeof colors[0]; index: number }> = ({
    score,
    color,
    index,
  }) => {
    const maxScore = 5; // Assuming max score is 5
    const percentage = (score / maxScore) * 100;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke={
                index === 0 ? '#a855f7' : // purple
                index === 1 ? '#eab308' : // yellow
                index === 2 ? '#f97316' : // orange
                '#ef4444' // red
              }
              strokeWidth="6"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${color.text}`}>{score.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center max-w-[120px] truncate">
          {competencies[index]?.competencyName || 'Competency'}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Competency</h2>
        <p className="text-sm text-gray-600">Average score of the competency</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by Competency name"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Competency Gauges */}
      {competencies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {competencies.slice(0, 4).map((competency, index) => (
            <CircularGauge
              key={competency.competencyId}
              score={competency.averageScore}
              color={colors[index % colors.length]}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No competency data available
        </div>
      )}
    </div>
  );
};

export default CompetencyCard;

