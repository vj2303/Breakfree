"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ManagementReports from '@/components/reports/ManagementReports';

export default function ReportsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'participants' | 'management'>('management');

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {/* <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'participants'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Participants Reports
            </button> */}
            <button
              onClick={() => setActiveTab('management')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'management'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Management reports
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'management' && <ManagementReports token={token} />}
        {activeTab === 'participants' && (
          <div className="text-center py-12 text-gray-500">
            Participants Reports - Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}
