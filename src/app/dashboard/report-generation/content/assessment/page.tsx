'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentCard from './components/AssessmentCard';
import CreateAssessmentModal from './components/CreateAssessmentModal';
import { sampleAssessments, sampleInboxActivities } from './data/assessments';
import { AssessmentType } from './types/assessment';
import { fetchCaseStudies, updateCaseStudy, deleteCaseStudy } from '@/lib/caseStudyApi';

export default function AssessmentPage() {
  const [activeTab, setActiveTab] = useState<AssessmentType>('case-study');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCaseStudy, setPreviewCaseStudy] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (activeTab === 'case-study') {
      setLoading(true);
      fetchCaseStudies()
        .then(res => {
          setCaseStudies(res.data.caseStudies || []);
          setError(null);
        })
        .catch(err => setError(err.message || 'Failed to fetch case studies'))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleTabChange = (tab: AssessmentType) => {
    setActiveTab(tab);
  };

  const handleCreateAssessment = (data: {
    name: string;
    description: string;
  }) => {
    // Store modal data in localStorage for the next page
    localStorage.setItem('caseStudyDraft', JSON.stringify(data));
    setActiveTab(activeTab);
    if (activeTab === 'case-study') {
      router.push('/dashboard/report-generation/content/assessment/case-study');
    } else if (activeTab === 'inbox-activity') {
      router.push('/dashboard/report-generation/content/assessment/inbox-activity');
    }
  };

  const handleEdit = async (id: string) => {
    const newName = prompt('Enter new name:');
    const newDescription = prompt('Enter new description:');
    if (newName && newDescription) {
      setLoading(true);
      try {
        await updateCaseStudy(id, { name: newName, description: newDescription });
        // Refresh list
        const res = await fetchCaseStudies();
        setCaseStudies(res.data.caseStudies || []);
      } catch (err: any) {
        setError(err.message || 'Failed to update case study');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this case study?')) {
      setLoading(true);
      try {
        await deleteCaseStudy(id);
        // Refresh list
        const res = await fetchCaseStudies();
        setCaseStudies(res.data.caseStudies || []);
      } catch (err: any) {
        setError(err.message || 'Failed to delete case study');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreview = (id: string) => {
    const found = caseStudies.find((c) => c.id === id);
    setPreviewCaseStudy(found || null);
    setEditMode(false);
    setEditData(found || {});
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      await updateCaseStudy(editData.id, {
        name: editData.name,
        description: editData.description,
        instructions: editData.instructions,
        videoUrl: editData.videoUrl,
      });
      const res = await fetchCaseStudies();
      setCaseStudies(res.data.caseStudies || []);
      setPreviewCaseStudy(null);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update case study');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('case-study')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'case-study'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Case Study Assessment
            </button>
            <button
              onClick={() => handleTabChange('inbox-activity')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'inbox-activity'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Inbox Activity
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Create Assessment
          </button>
        </div>

        {/* Content */}
        {loading && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">Loading...</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'case-study' ? (
            caseStudies.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={{
                  id: assessment.id,
                  title: assessment.name,
                  description: assessment.description,
                  createdOn: new Date(assessment.createdAt).toLocaleDateString(),
                  allottedTo: assessment.scenarios?.length || 0,
                  attemptedBy: assessment.tasks?.length || 0,
                }}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onRemove={handleRemove}
              />
            ))
          ) : (
            // fallback to static for inbox-activity
            sampleInboxActivities.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {/* Create Assessment Modal */}
        <CreateAssessmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAssessment}
        />

        {/* Preview Modal */}
        {previewCaseStudy && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
                onClick={() => setPreviewCaseStudy(null)}
              >
                ×
              </button>
              {editMode ? (
                <>
                  <h2 className="text-xl font-semibold mb-4">Edit Case Study</h2>
                  <input
                    className="w-full mb-2 px-3 py-2 border rounded"
                    value={editData.name || ''}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                  />
                  <textarea
                    className="w-full mb-2 px-3 py-2 border rounded"
                    value={editData.description || ''}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                  />
                  <textarea
                    className="w-full mb-2 px-3 py-2 border rounded"
                    value={editData.instructions || ''}
                    onChange={e => setEditData({ ...editData, instructions: e.target.value })}
                    placeholder="Instructions"
                  />
                  <input
                    className="w-full mb-2 px-3 py-2 border rounded"
                    value={editData.videoUrl || ''}
                    onChange={e => setEditData({ ...editData, videoUrl: e.target.value })}
                    placeholder="Video URL"
                  />
                  <div className="flex gap-2 mt-4">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={handleEditSave}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 text-black px-4 py-2 rounded"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2">{previewCaseStudy.name || <span className='italic text-gray-400'>No Name</span>}</h2>
                  <p className="mb-2 text-gray-700">{previewCaseStudy.description || <span className='italic text-gray-400'>No Description</span>}</p>
                  <div className="mb-2">
                    <strong>Instructions:</strong>
                    <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: previewCaseStudy.instructions || '<span class=\'italic text-gray-400\'>No Instructions</span>' }} />
                  </div>
                  <div className="mb-2">
                    <strong>Video URL:</strong> <span className="text-blue-600">{previewCaseStudy.videoUrl || <span className='italic text-gray-400'>No Video URL</span>}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Scenarios:</strong>
                    <ul className="list-disc ml-6">
                      {(previewCaseStudy.scenarios || []).map((s: any) => (
                        <li key={s.id}>{s.title || <span className='italic text-gray-400'>No Title</span>} (Read: {s.readTime || '-'} min, Exercise: {s.exerciseTime || '-'} min)</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <strong>Tasks:</strong>
                    <ul className="list-disc ml-6">
                      {(previewCaseStudy.tasks || []).map((t: any) => (
                        <li key={t.id}>{t.title || <span className='italic text-gray-400'>No Title</span>} (Read: {t.readTime || '-'} min, Exercise: {t.exerciseTime || '-'} min)</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}