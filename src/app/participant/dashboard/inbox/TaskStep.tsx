import React, { useState, useEffect } from 'react';
import { InboxActivityData, EmailContent } from './types';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/context/AuthContext';

interface TaskStepProps {
  activityData?: InboxActivityData;
  submissionData: {
    textContent?: string;
    notes?: string;
    file?: File;
    submissionType: 'TEXT' | 'DOCUMENT' | 'VIDEO';
  };
  setSubmissionData: (data: {
    textContent?: string;
    notes?: string;
    file?: File;
    submissionType: 'TEXT' | 'DOCUMENT' | 'VIDEO';
  }) => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
}

const TaskStep: React.FC<TaskStepProps> = ({ 
  activityData, 
  submissionData, 
  setSubmissionData,
  onSaveDraft,
  onSubmit 
}) => {
  const { user } = useAuth();
  const [fileInputKey, setFileInputKey] = useState(0);
  const [emailContent, setEmailContent] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyCc, setReplyCc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const contents = activityData?.activityDetail?.contents || [];
  const isSubmitted = activityData?.isSubmitted || false;
  const submission = activityData?.submission as any;

  // Load existing submission/draft
  useEffect(() => {
    if (submission) {
      setExistingSubmission(submission);
      if (submission.textContent) {
        setEmailContent(submission.textContent);
        setSubmissionData(prev => ({
          ...prev,
          textContent: submission.textContent,
          submissionType: submission.submissionType || 'TEXT'
        }));
      }
    }
  }, [submission]);

  // Pre-fill reply fields from the first email
  useEffect(() => {
    if (contents.length > 0 && !existingSubmission) {
      const firstEmail = contents[0];
      setReplyTo(firstEmail.from);
      setReplySubject(`Re: ${firstEmail.subject}`);
      if (firstEmail.cc && firstEmail.cc.length > 0) {
        setReplyCc(firstEmail.cc.join(', '));
      }
    }
  }, [contents, existingSubmission]);

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

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsSavingDraft(true);
      try {
        await onSaveDraft();
      } finally {
        setIsSavingDraft(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEmailContentChange = (html: string) => {
    setEmailContent(html);
    setSubmissionData({
      ...submissionData,
      textContent: html,
      submissionType: 'TEXT'
    });
  };

  if (!activityData?.activityDetail || contents.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Task</h2>
        <div className="bg-white p-6 rounded-lg border text-black">
          <p>No task content available for this activity.</p>
        </div>
      </div>
    );
  }

  const canEdit = !isSubmitted || (existingSubmission?.submissionStatus === 'DRAFT');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Task</h2>
      
      {/* Original Emails */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Inbox Emails</h3>
        <div className="space-y-4">
          {contents.map((content: EmailContent) => (
            <div key={content.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{content.subject}</h4>
                <span className="text-sm text-gray-500">{new Date(content.date).toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2 space-y-1">
                <p><strong>From:</strong> {content.from}</p>
                <p><strong>To:</strong> {content.to.join(', ')}</p>
                {content.cc && content.cc.length > 0 && (
                  <p><strong>CC:</strong> {content.cc.join(', ')}</p>
                )}
                {content.bcc && content.bcc.length > 0 && (
                  <p><strong>BCC:</strong> {content.bcc.join(', ')}</p>
                )}
              </div>
              <div 
                className="prose max-w-none text-gray-700 mt-3 p-3 bg-white rounded border"
                dangerouslySetInnerHTML={{ __html: content.emailContent }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Email Reply Interface */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Compose Reply</h3>
        
        {isSubmitted && existingSubmission?.submissionStatus !== 'DRAFT' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> This email has been submitted and cannot be edited.
            </p>
          </div>
        )}

        {existingSubmission?.submissionStatus === 'DRAFT' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Draft Saved:</strong> You have a saved draft. You can continue editing and submit when ready.
            </p>
          </div>
        )}

        {/* Email Form Fields */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CC (Optional)</label>
            <input
              type="text"
              value={replyCc}
              onChange={(e) => setReplyCc(e.target.value)}
              disabled={!canEdit}
              placeholder="Enter email addresses separated by commas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Rich Text Editor for Email Body */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          {canEdit ? (
            <RichTextEditor
              content={emailContent}
              onChange={handleEmailContentChange}
            />
          ) : (
            <div 
              className="min-h-[200px] border rounded-md bg-gray-50 p-4"
              dangerouslySetInnerHTML={{ __html: emailContent || '<p>No content</p>' }}
            />
          )}
        </div>

        {/* Document Upload */}
        {canEdit && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Document (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                key={fileInputKey}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={!canEdit}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex items-center gap-2 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="h-6 w-6 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-gray-600">
                  {submissionData.file ? submissionData.file.name : 'Click to upload document'}
                </span>
              </label>
              {submissionData.file && (
                <div className="mt-2 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{submissionData.file.name}</span>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSavingDraft && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              )}
              {isSavingDraft ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSavingDraft || !emailContent.trim()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}

        {!canEdit && existingSubmission && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>Submitted on:</strong> {new Date(existingSubmission.submittedAt || existingSubmission.createdAt).toLocaleString()}
            </p>
            {existingSubmission.fileName && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Attachment:</strong> {existingSubmission.fileName}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStep;
