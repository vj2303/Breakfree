'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AssessmentCenterStepper from './AssessmentCenterStepper';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

// LocalStorage keys for persistence (must match the ones in create/page.tsx)
const STORAGE_KEYS = {
  FORM_DATA: 'assessment-center-form-data',
  CURRENT_STEP: 'assessment-center-current-step',
  EDIT_ID: 'assessment-center-edit-id',
  IS_ACTIVE: 'assessment-center-is-active',
};

export default function AssessmentCenterPage() {
  const [showStepper, setShowStepper] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingPersistence, setIsCheckingPersistence] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  const { assessmentCenters, assessmentCentersLoading, fetchAssessmentCenters, deleteAssessmentCenter, token } = useAuth();

  // Wrap fetchAssessmentCenters in useCallback to stabilize its reference
  const stableFetchAssessmentCenters = useCallback(() => {
    fetchAssessmentCenters();
  }, [fetchAssessmentCenters]);

  useEffect(() => {
    if (token && !assessmentCenters) {
      stableFetchAssessmentCenters();
    }
  }, [token, assessmentCenters, stableFetchAssessmentCenters]);

  // Check for persisted data and redirect to create/edit page if found
  // Only redirect if user navigated here directly (not from clicking a tab)
  useEffect(() => {
    // Only check once
    if (hasRedirectedRef.current) {
      setIsCheckingPersistence(false);
      return;
    }
    
    // Don't redirect if we're already on the create page
    if (pathname?.includes('/assessment-center/create')) {
      hasRedirectedRef.current = true;
      setIsCheckingPersistence(false);
      return;
    }
    
    // Check if user came from clicking a tab (referrer check)
    // If they explicitly navigated here, don't auto-redirect
    const shouldAutoRedirect = typeof window !== 'undefined' 
      ? sessionStorage.getItem('assessment-center-auto-redirect') !== 'false'
      : true;
    
    if (!shouldAutoRedirect) {
      // User explicitly navigated here, clear the flag and don't redirect
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('assessment-center-auto-redirect');
      }
      hasRedirectedRef.current = true;
      setIsCheckingPersistence(false);
      return;
    }
    
    try {
      const isActive = localStorage.getItem(STORAGE_KEYS.IS_ACTIVE);
      const editId = localStorage.getItem(STORAGE_KEYS.EDIT_ID);
      const formData = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      
      // If there's persisted data, redirect to create/edit page
      if (isActive === 'true' && formData) {
        console.log('🔄 [Assessment Center] Found persisted data, redirecting to create/edit page...');
        console.log('🔄 [Assessment Center] Edit ID:', editId);
        
        hasRedirectedRef.current = true;
        
        if (editId) {
          // Redirect to edit page
          const editUrl = `/dashboard/report-generation/content/assessment-center/create?edit=${editId}`;
          console.log('🔄 [Assessment Center] Redirecting to edit page:', editUrl);
          router.replace(editUrl);
        } else {
          // Redirect to create page
          const createUrl = '/dashboard/report-generation/content/assessment-center/create';
          console.log('🔄 [Assessment Center] Redirecting to create page:', createUrl);
          router.replace(createUrl);
        }
        setIsCheckingPersistence(false);
        return;
      }
    } catch (error) {
      console.error('Error checking persisted data:', error);
    }
    
    hasRedirectedRef.current = true;
    setIsCheckingPersistence(false);
  }, [router, pathname]);

  // Handle edit assessment center
  const handleEdit = (centerId: string) => {
    console.log('Edit assessment center:', centerId);
    setActiveDropdown(null);
    // Navigate to edit flow
    const editUrl = `/dashboard/report-generation/content/assessment-center/create?edit=${centerId}`;
    console.log('Navigating to:', editUrl);

    // Use window.location.href for more reliable navigation
    console.log('Using window.location.href for navigation');
    window.location.href = editUrl;
  };

  // Handle delete assessment center
  const handleDelete = async (centerId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteAssessmentCenter(centerId);
      
      if (result.success) {
        setDeleteConfirmId(null);
      } else {
        console.error('Failed to delete assessment center:', result.message);
        alert(result.message || 'Failed to delete assessment center. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting assessment center:', error);
      alert('An error occurred while deleting the assessment center.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Show loading while checking for persisted data
  if (isCheckingPersistence) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
              <div key={center.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-black mb-2">
                      {center.name || 'Untitled Assessment Center'}
                    </h2>
                    {center.description && (
                      <p className="text-gray-600 mb-3">
                        {center.description}
                      </p>
                    )}
                    {center.displayInstructions && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                          {center.displayInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {center.reportTemplateType}
                    </span>

                    {/* Test Edit Button - Temporary */}
                    <button
                      onClick={() => {
                        console.log('Test edit button clicked for center:', center.id);
                        console.log('Center data:', center);
                        if (center.id) {
                          handleEdit(center.id);
                        } else {
                          console.error('Center does not have an ID');
                        }
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 font-medium"
                    >
                      Test Edit
                    </button>

                    {/* Three dots menu */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          console.log('Three dots clicked for center:', center.id);
                          console.log('Current activeDropdown:', activeDropdown);
                          const newState = activeDropdown === center.id ? null : center.id;
                          console.log('Setting activeDropdown to:', newState);
                          setActiveDropdown(newState);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                      
                      {activeDropdown === center.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for center:', center.id);
                              console.log('Center data:', center);
                              if (center.id) {
                                handleEdit(center.id);
                              } else {
                                console.error('Center does not have an ID');
                              }
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Assessment Center
                          </button>
                          <button
                            onClick={() => {
                              console.log('Delete button clicked for center:', center.id);
                              setDeleteConfirmId(center.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Assessment Center</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this assessment center? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}