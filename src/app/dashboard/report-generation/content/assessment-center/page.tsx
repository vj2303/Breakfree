'use client'
import React, { useState, useEffect, useCallback } from 'react';
import AssessmentCenterStepper from './AssessmentCenterStepper';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AssessmentCenterPage() {
  const [showStepper, setShowStepper] = useState(false);
  const router = useRouter();
  const { assessmentCenters, assessmentCentersLoading, fetchAssessmentCenters, token } = useAuth();

  // Wrap fetchAssessmentCenters in useCallback to stabilize its reference
  const stableFetchAssessmentCenters = useCallback(() => {
    fetchAssessmentCenters();
  }, [fetchAssessmentCenters]);

  useEffect(() => {
    if (token && !assessmentCenters) {
      stableFetchAssessmentCenters();
    }
  }, [token, assessmentCenters, stableFetchAssessmentCenters]);

  if (showStepper) {
    return <AssessmentCenterStepper onBack={() => setShowStepper(false)} />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Assessment Centers</h1>
        <button
          className="px-6 py-2 rounded-full bg-gray-900 text-white font-semibold text-lg shadow hover:bg-gray-800 transition"
          onClick={() => router.push('/dashboard/report-generation/content/assessment-center/create')}
        >
          + Create Assessment Center
        </button>
      </div>
      
      {assessmentCentersLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading assessment centers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentCenters?.assessmentCenters?.length ? (
            assessmentCenters.assessmentCenters.map(center => (
              <div key={center.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black mb-2">
                      {center.displayName || center.name || 'Untitled Assessment Center'}
                    </h2>
                    <p className="text-gray-600 mb-3">
                      {center.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {center.reportTemplateType}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Template:</span>
                    <span className="ml-2">{center.reportTemplateName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Competencies:</span>
                    <span className="ml-2">{center.competencies?.length || 0} competencies</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(center.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {center.competencies && center.competencies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Competencies:</p>
                    <div className="flex flex-wrap gap-2">
                      {center.competencies.slice(0, 3).map(competency => (
                        <span key={competency.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {competency.competencyName}
                        </span>
                      ))}
                      {center.competencies.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          +{center.competencies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Centers Found</h3>
              <p className="text-gray-500">Create your first assessment center to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}