"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PrePostAssessmentProps {
  participantId: string;
  participantName: string;
  token: string | null;
}

interface CompetencyData {
  competencyId: string;
  competencyName: string;
  preAssessmentApp: number;
  preAssessmentApp2: number;
  improvement: number;
  postAssessmentReadiness: number;
}

const PrePostAssessment: React.FC<PrePostAssessmentProps> = ({
  participantId,
  participantName,
  token,
}) => {
  const [data, setData] = useState<CompetencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && participantId) {
      fetchData();
    }
  }, [token, participantId]);

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/management-reports/participant/${participantId}/pre-post-assessment`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const result = await res.json();
        setData(result.data?.competencies || []);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching pre-post assessment data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for table
  const tableData = data.map((comp) => ({
    competency: comp.competencyName,
    preAssessmentApp: comp.preAssessmentApp,
    preAssessmentApp2: comp.preAssessmentApp2,
    improvement: comp.improvement,
    postAssessmentReadiness: comp.postAssessmentReadiness,
  }));

  // Prepare data for graph
  const graphData = data.map((comp) => ({
    name: comp.competencyName,
    preAssessment: comp.preAssessmentApp,
    preAssessment2: comp.preAssessmentApp2,
    postAssessment: comp.postAssessmentReadiness,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pre vs Post Assessment ({participantName})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Competencies
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Pre- Assessment App
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Pre- Assessment App
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Improvement
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Post Assessment readiness
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">{row.competency}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{row.preAssessmentApp}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{row.preAssessmentApp2}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 font-medium bg-blue-50">
                    {row.improvement}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{row.postAssessmentReadiness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Graph */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pre vs Post Assessment Graph ({participantName})
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 3.5]}
                ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="preAssessment"
                stroke="#1e40af"
                strokeWidth={2}
                dot={{ fill: '#1e40af', r: 4 }}
                name="Pre Assessment App"
              />
              <Line
                type="monotone"
                dataKey="preAssessment2"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Pre Assessment App 2"
              />
              <Line
                type="monotone"
                dataKey="postAssessment"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 4 }}
                name="Post Assessment Readiness"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            View Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrePostAssessment;

