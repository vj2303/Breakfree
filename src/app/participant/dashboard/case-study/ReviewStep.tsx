import React from 'react';
import { ActivityData } from './types';

interface ReviewStepProps {
  activityData?: ActivityData;
  submissionData: {
    textContent?: string;
    notes?: string;
    file?: File;
    submissionType: 'TEXT' | 'DOCUMENT' | 'VIDEO';
  };
}

const ReviewStep: React.FC<ReviewStepProps> = ({ activityData, submissionData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review Your Submission</h2>
      <div className="bg-white p-6 rounded-lg border text-gray-700">
        {/* Activity Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Activity Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Activity:</strong> {activityData?.activityDetail?.name || 'N/A'}</p>
            <p><strong>Competency:</strong> {activityData?.competency?.competencyName || 'N/A'}</p>
            <p><strong>Type:</strong> {activityData?.activityType || 'N/A'}</p>
          </div>
        </div>

        {/* Submission Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Submission</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p><strong>Submission Type:</strong> {submissionData.submissionType}</p>
            
            {submissionData.submissionType === 'TEXT' && submissionData.textContent && (
              <div className="mt-3">
                <p><strong>Text Response:</strong></p>
                <div className="mt-2 p-3 bg-white rounded border max-h-40 overflow-y-auto">
                  {submissionData.textContent}
                </div>
              </div>
            )}
            
            {(submissionData.submissionType === 'DOCUMENT' || submissionData.submissionType === 'VIDEO') && submissionData.file && (
              <div className="mt-3">
                <p><strong>Uploaded File:</strong> {submissionData.file.name}</p>
                <p className="text-sm text-gray-600">Size: {(submissionData.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            
            {submissionData.notes && (
              <div className="mt-3">
                <p><strong>Additional Notes:</strong></p>
                <div className="mt-2 p-3 bg-white rounded border">
                  {submissionData.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Before You Submit:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Review your response to ensure it addresses all requirements</li>
            <li>• Check that your submission type matches your intended response</li>
            <li>• Verify that any uploaded files are complete and readable</li>
            <li>• Ensure your additional notes provide helpful context</li>
          </ul>
        </div>

        {/* Validation */}
        <div className="mt-4">
          {submissionData.submissionType === 'TEXT' && !submissionData.textContent && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">⚠️ Please provide a text response before submitting.</p>
            </div>
          )}
          
          {(submissionData.submissionType === 'DOCUMENT' || submissionData.submissionType === 'VIDEO') && !submissionData.file && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">⚠️ Please upload a file before submitting.</p>
            </div>
          )}
          
          {((submissionData.submissionType === 'TEXT' && submissionData.textContent) || 
            ((submissionData.submissionType === 'DOCUMENT' || submissionData.submissionType === 'VIDEO') && submissionData.file)) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">✅ Your submission is ready!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep; 