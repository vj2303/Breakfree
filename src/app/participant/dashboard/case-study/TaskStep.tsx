import React, { useState } from 'react';

interface TaskStepProps {
  activityData?: any;
  submissionData: {
    textContent?: string;
    notes?: string;
    file?: File;
    submissionType: 'TEXT' | 'DOCUMENT' | 'VIDEO';
  };
  setSubmissionData: (data: any) => void;
}

const TaskStep: React.FC<TaskStepProps> = ({ activityData, submissionData, setSubmissionData }) => {
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmissionData({
        ...submissionData,
        file,
        submissionType: file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT'
      });
    }
  };

  const removeFile = () => {
    setSubmissionData({
      ...submissionData,
      file: undefined,
      submissionType: 'TEXT'
    });
    setFileInputKey(prev => prev + 1);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Task</h2>
      <div className="bg-white p-6 rounded-lg border text-gray-700">
        {/* Task Content */}
        <div className="mb-6">
          {activityData?.activityDetail?.tasks && activityData.activityDetail.tasks.length > 0 ? (
            <div className="space-y-6">
              {activityData.activityDetail.tasks.map((task: any, index: number) => (
                <div key={task.id} className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  <div className="mb-3">
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span><strong>Read Time:</strong> {task.readTime} minutes</span>
                      <span><strong>Exercise Time:</strong> {task.exerciseTime} minutes</span>
                    </div>
                  </div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: task.data }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No task data available for this activity.</p>
          )}
        </div>

        {/* Submission Options */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Submit Your Response</h3>
          
          {/* Submission Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="submissionType"
                  value="TEXT"
                  checked={submissionData.submissionType === 'TEXT'}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionType: e.target.value as 'TEXT' })}
                  className="mr-2"
                />
                Text Response
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="submissionType"
                  value="DOCUMENT"
                  checked={submissionData.submissionType === 'DOCUMENT'}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionType: e.target.value as 'DOCUMENT' })}
                  className="mr-2"
                />
                Document Upload
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="submissionType"
                  value="VIDEO"
                  checked={submissionData.submissionType === 'VIDEO'}
                  onChange={(e) => setSubmissionData({ ...submissionData, submissionType: e.target.value as 'VIDEO' })}
                  className="mr-2"
                />
                Video Upload
              </label>
            </div>
          </div>

          {/* Text Response */}
          {submissionData.submissionType === 'TEXT' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={submissionData.textContent || ''}
                onChange={(e) => setSubmissionData({ ...submissionData, textContent: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your detailed response here..."
              />
            </div>
          )}

          {/* File Upload */}
          {(submissionData.submissionType === 'DOCUMENT' || submissionData.submissionType === 'VIDEO') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {submissionData.submissionType === 'VIDEO' ? 'Video' : 'Document'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  key={fileInputKey}
                  type="file"
                  accept={submissionData.submissionType === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload {submissionData.submissionType === 'VIDEO' ? 'video' : 'document'}
                  </p>
                </label>
              </div>
              {submissionData.file && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{submissionData.file.name}</span>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={submissionData.notes || ''}
              onChange={(e) => setSubmissionData({ ...submissionData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional context or assumptions..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStep; 