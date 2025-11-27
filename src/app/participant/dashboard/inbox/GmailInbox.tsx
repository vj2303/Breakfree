'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InboxActivityData, EmailContent } from './types';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/context/AuthContext';
import { AssignmentSubmissionApi } from '@/lib/assignmentSubmissionApi';

interface AssignmentData {
  assessmentCenter: {
    id: string;
    name?: string;
    displayName?: string;
  };
}

interface GmailInboxProps {
  activityData?: InboxActivityData;
  assignmentData: AssignmentData;
  onRefresh?: () => void;
}

type ViewType = 'inbox' | 'drafts' | 'sent';
type EmailThread = {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  lastMessageDate: Date;
  unread: boolean;
  originalEmail: EmailContent;
  replies: SubmissionThread[];
};

interface SubmissionThread {
  id: string;
  parentId?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  content: string;
  date: Date;
  status: 'DRAFT' | 'SUBMITTED';
  fileUrl?: string;
  fileName?: string;
}

const GmailInbox: React.FC<GmailInboxProps> = ({ activityData, assignmentData, onRefresh }) => {
  const { token, assignments, fetchAssignments } = useAuth();
  const [activeView, setActiveView] = useState<ViewType>('inbox');
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    cc: '',
    content: '',
    replyToThreadId: null as string | null,
    parentSubmissionId: null as string | null,
  });
  const [submissions, setSubmissions] = useState<SubmissionThread[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  interface SubmissionData {
    id?: string;
    parentSubmissionId?: string;
    notes?: string;
    textContent?: string;
    submittedAt?: string;
    createdAt?: string;
    submissionStatus?: string;
    fileUrl?: string;
    fileName?: string;
  }
  const existingSubmission = activityData?.submission as SubmissionData | undefined;

  // Load existing submissions from activityData
  interface ActivityDataWithSubmissions extends InboxActivityData {
    allSubmissions?: SubmissionData[];
  }
  
  const contents = useMemo(() => activityData?.activityDetail?.contents || [], [activityData?.activityDetail?.contents]);
  
  useEffect(() => {
    // Check if activityData has allSubmissions (from updated API)
    const activityWithSubs = activityData as ActivityDataWithSubmissions | undefined;
    const allSubmissions = activityWithSubs?.allSubmissions || [];
    
    if (allSubmissions.length > 0) {
      const threadSubmissions: SubmissionThread[] = allSubmissions
        .filter((sub: SubmissionData) => sub.id) // Filter out submissions without id
        .map((sub: SubmissionData) => {
          try {
            const notes = sub.notes ? JSON.parse(sub.notes) : {};
            return {
              id: sub.id!,
              parentId: sub.parentSubmissionId || notes.parentSubmissionId || undefined,
              subject: notes.subject || `Re: ${contents[0]?.subject || ''}`,
              from: assignments?.participant?.email || '',
              to: notes.to ? (Array.isArray(notes.to) ? notes.to : notes.to.split(',').map((e: string) => e.trim())) : contents[0]?.to || [],
              cc: notes.cc ? (Array.isArray(notes.cc) ? notes.cc : notes.cc.split(',').map((e: string) => e.trim())) : contents[0]?.cc || [],
              content: sub.textContent || '',
              date: new Date(sub.submittedAt || sub.createdAt || Date.now()),
              status: (sub.submissionStatus || 'SUBMITTED') as 'DRAFT' | 'SUBMITTED',
              fileUrl: sub.fileUrl,
              fileName: sub.fileName,
            };
          } catch {
            return {
              id: sub.id!,
              parentId: sub.parentSubmissionId || undefined,
              subject: `Re: ${contents[0]?.subject || ''}`,
              from: assignments?.participant?.email || '',
              to: contents[0]?.to || [],
              cc: contents[0]?.cc || [],
              content: sub.textContent || '',
              date: new Date(sub.submittedAt || sub.createdAt || Date.now()),
              status: (sub.submissionStatus || 'SUBMITTED') as 'DRAFT' | 'SUBMITTED',
              fileUrl: sub.fileUrl,
              fileName: sub.fileName,
            };
          }
        });
      setSubmissions(threadSubmissions);
    } else if (existingSubmission) {
      // Fallback to single submission for backward compatibility
      try {
        const notes = existingSubmission.notes ? JSON.parse(existingSubmission.notes) : {};
        const submission: SubmissionThread = {
          id: existingSubmission.id || '1',
          parentId: existingSubmission.parentSubmissionId || notes.parentSubmissionId || undefined,
          subject: notes.subject || composeData.subject || `Re: ${contents[0]?.subject || ''}`,
          from: assignments?.participant?.email || '',
          to: notes.to ? (Array.isArray(notes.to) ? notes.to : notes.to.split(',').map((e: string) => e.trim())) : contents[0]?.to || [],
          cc: notes.cc ? (Array.isArray(notes.cc) ? notes.cc : notes.cc.split(',').map((e: string) => e.trim())) : contents[0]?.cc || [],
          content: existingSubmission.textContent || '',
          date: new Date(existingSubmission.submittedAt || existingSubmission.createdAt || Date.now()),
          status: (existingSubmission.submissionStatus || 'SUBMITTED') as 'DRAFT' | 'SUBMITTED',
          fileUrl: existingSubmission.fileUrl,
          fileName: existingSubmission.fileName,
        };
        setSubmissions([submission]);
      } catch {
        const submission: SubmissionThread = {
          id: existingSubmission.id || '1',
          parentId: existingSubmission.parentSubmissionId || undefined,
          subject: `Re: ${contents[0]?.subject || ''}`,
          from: assignments?.participant?.email || '',
          to: contents[0]?.to || [],
          cc: contents[0]?.cc || [],
          content: existingSubmission.textContent || '',
          date: new Date(existingSubmission.submittedAt || existingSubmission.createdAt || Date.now()),
          status: (existingSubmission.submissionStatus || 'SUBMITTED') as 'DRAFT' | 'SUBMITTED',
          fileUrl: existingSubmission.fileUrl,
          fileName: existingSubmission.fileName,
        };
        setSubmissions([submission]);
      }
    }
  }, [existingSubmission, activityData, contents, assignments, composeData.subject]);

  // Build thread hierarchy from submissions - returns flat list sorted by date
  const buildThreadHierarchy = (submissions: SubmissionThread[]): SubmissionThread[] => {
    if (submissions.length === 0) return [];
    
    // Sort by date to maintain chronological order
    const sorted = [...submissions].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // If there are parent-child relationships, we'll maintain them in the flat list
    // The UI will show them with indentation based on parentId
    return sorted;
  };

  // Create email threads from contents
  const emailThreads: EmailThread[] = contents.map((content, index) => {
    // Find all submissions related to this email (by subject matching)
    const threadReplies = submissions.filter(s => 
      s.subject === content.subject || 
      s.subject === `Re: ${content.subject}` ||
      s.subject.startsWith(`Re: ${content.subject}`)
    );

    // Sort replies by date and build hierarchy
    const sortedReplies = threadReplies.sort((a, b) => a.date.getTime() - b.date.getTime());
    const hierarchicalReplies = buildThreadHierarchy(sortedReplies);
    
    return {
      id: content.id || `thread-${index}`,
      subject: content.subject,
      participants: [content.from, ...content.to],
      lastMessage: hierarchicalReplies.length > 0 
        ? hierarchicalReplies[hierarchicalReplies.length - 1].content.replace(/<[^>]*>/g, '').substring(0, 100)
        : content.emailContent.replace(/<[^>]*>/g, '').substring(0, 100),
      lastMessageDate: hierarchicalReplies.length > 0
        ? hierarchicalReplies[hierarchicalReplies.length - 1].date
        : new Date(content.date),
      unread: hierarchicalReplies.length === 0,
      originalEmail: content,
      replies: hierarchicalReplies,
    };
  });

  const drafts = submissions.filter(s => s.status === 'DRAFT');
  const sent = submissions.filter(s => s.status === 'SUBMITTED');

  const handleCompose = (thread?: EmailThread, replyToSubmission?: SubmissionThread) => {
    if (thread) {
      setComposeData({
        to: thread.originalEmail.from,
        subject: `Re: ${thread.subject}`,
        cc: thread.originalEmail.cc?.join(', ') || '',
        content: '',
        replyToThreadId: thread.id,
        parentSubmissionId: replyToSubmission?.id || null,
      });
    } else {
      setComposeData({
        to: contents[0]?.from || '',
        subject: contents[0] ? `Re: ${contents[0].subject}` : '',
        cc: contents[0]?.cc?.join(', ') || '',
        content: '',
        replyToThreadId: null,
        parentSubmissionId: null,
      });
    }
    setIsComposing(true);
    setSelectedThread(null);
  };

  const handleSaveDraft = async () => {
    if (!token || !assignmentData || !activityData) return;

    setIsSavingDraft(true);
    try {
      const submissionPayload = {
        participantId: assignments?.participant?.id || '',
        assessmentCenterId: assignmentData.assessmentCenter.id,
        activityId: activityData.activityId,
        activityType: 'INBOX_ACTIVITY' as const,
        submissionType: 'TEXT' as const,
        textContent: composeData.content,
        notes: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          cc: composeData.cc,
          threadId: composeData.replyToThreadId,
        }),
        parentSubmissionId: composeData.parentSubmissionId || undefined,
        isDraft: true,
      };

      const response = await AssignmentSubmissionApi.submitAssignment(token, submissionPayload);
      
      if (response.success) {
        alert('Draft saved successfully!');
        setIsComposing(false);
        if (fetchAssignments) {
          await fetchAssignments();
        }
        if (onRefresh) onRefresh();
      } else {
        alert(`Failed to save draft: ${response.message}`);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('An error occurred while saving the draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!token || !assignmentData || !activityData) return;
    if (!composeData.content.trim()) {
      alert('Please enter email content before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionPayload = {
        participantId: assignments?.participant?.id || '',
        assessmentCenterId: assignmentData.assessmentCenter.id,
        activityId: activityData.activityId,
        activityType: 'INBOX_ACTIVITY' as const,
        submissionType: 'TEXT' as const,
        textContent: composeData.content,
        notes: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          cc: composeData.cc,
          threadId: composeData.replyToThreadId,
        }),
        parentSubmissionId: composeData.parentSubmissionId || undefined,
        isDraft: false,
      };

      const response = await AssignmentSubmissionApi.submitAssignment(token, submissionPayload);
      
      if (response.success) {
        alert('Email sent successfully!');
        setIsComposing(false);
        setComposeData({
          to: '',
          subject: '',
          cc: '',
          content: '',
          replyToThreadId: null,
          parentSubmissionId: null,
        });
        if (fetchAssignments) {
          await fetchAssignments();
        }
        if (onRefresh) onRefresh();
      } else {
        alert(`Failed to send email: ${response.message}`);
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      alert('An error occurred while sending the email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayThreads = () => {
    switch (activeView) {
      case 'drafts':
        return emailThreads.filter(t => t.replies.some(r => r.status === 'DRAFT'));
      case 'sent':
        return emailThreads.filter(t => t.replies.some(r => r.status === 'SUBMITTED'));
      default:
        return emailThreads;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsComposing(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Compose
          </button>
        </div>
        <nav className="flex-1 p-2">
          <button
            onClick={() => {
              setActiveView('inbox');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center gap-3 ${
              activeView === 'inbox' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Inbox
            {emailThreads.filter(t => t.unread).length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {emailThreads.filter(t => t.unread).length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('drafts');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center gap-3 ${
              activeView === 'drafts' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Drafts
            {drafts.length > 0 && (
              <span className="ml-auto bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                {drafts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('sent');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center gap-3 ${
              activeView === 'sent' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Sent
            {sent.length > 0 && (
              <span className="ml-auto bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                {sent.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {isComposing ? (
          /* Compose View */
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {composeData.parentSubmissionId ? 'Reply' : 'Compose'}
              </h2>
              <button
                onClick={() => {
                  setIsComposing(false);
                  setComposeData({
                    to: '',
                    subject: '',
                    cc: '',
                    content: '',
                    replyToThreadId: null,
                    parentSubmissionId: null,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 flex flex-col">
              <div className="space-y-3 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="To"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="CC (optional)"
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                    className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 mb-4">
                <RichTextEditor
                  content={composeData.content}
                  onChange={(html) => setComposeData({ ...composeData, content: html })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  {isSavingDraft ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSavingDraft || !composeData.content.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        ) : selectedThread ? (
          /* Thread View */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => setSelectedThread(null)}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {activeView}
              </button>
              <h2 className="text-lg font-semibold text-gray-900">{selectedThread.subject}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original Email */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedThread.originalEmail.from}</p>
                    <p className="text-sm text-gray-600">
                      To: {selectedThread.originalEmail.to.join(', ')}
                      {selectedThread.originalEmail.cc && selectedThread.originalEmail.cc.length > 0 && (
                        <span className="ml-2">CC: {selectedThread.originalEmail.cc.join(', ')}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedThread.originalEmail.date).toLocaleString()}
                  </span>
                </div>
                <div
                  className="prose max-w-none text-gray-700 mt-3"
                  dangerouslySetInnerHTML={{ __html: selectedThread.originalEmail.emailContent }}
                />
              </div>

              {/* Replies - Render with indentation based on parentId */}
              {selectedThread.replies.map((reply) => {
                // Calculate depth based on parent chain
                const getDepth = (submission: SubmissionThread): number => {
                  if (!submission.parentId) return 0;
                  const parent = selectedThread.replies.find(r => r.id === submission.parentId);
                  return parent ? getDepth(parent) + 1 : 0;
                };
                const depth = getDepth(reply);
                
                return (
                  <div key={reply.id} className={`bg-white border border-gray-200 rounded-lg p-4 ${depth > 0 ? 'ml-8' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{reply.from}</p>
                        <p className="text-sm text-gray-600">
                          To: {Array.isArray(reply.to) ? reply.to.join(', ') : reply.to}
                          {reply.cc && reply.cc.length > 0 && (
                            <span className="ml-2">CC: {Array.isArray(reply.cc) ? reply.cc.join(', ') : reply.cc}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          reply.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {reply.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {reply.date.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className="prose max-w-none text-gray-700 mt-3"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                    {reply.fileName && (
                      <div className="mt-2 text-sm text-blue-600">
                        📎 {reply.fileName}
                      </div>
                    )}
                    {reply.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleCompose(selectedThread, reply)}
                        className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Reply Button */}
              {selectedThread.replies.length === 0 || selectedThread.replies[selectedThread.replies.length - 1].status === 'SUBMITTED' ? (
                <button
                  onClick={() => handleCompose(selectedThread)}
                  className="ml-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reply
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          /* Email List View */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{activeView}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {getDisplayThreads().length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No emails in {activeView}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getDisplayThreads().map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        thread.unread ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            {thread.unread && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                            <p className={`font-medium truncate ${thread.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {thread.subject}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {thread.participants.join(', ')}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {thread.lastMessage}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                          {thread.lastMessageDate.toLocaleDateString()}
                        </div>
                      </div>
                      {thread.replies.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailInbox;

