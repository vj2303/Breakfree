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
      // When replying, include original sender and allow user to add more
      const originalTo = thread.originalEmail.from;
      const originalCc = thread.originalEmail.cc?.join(', ') || '';
      // If there's a reply, include its recipients too
      const replyRecipients = replyToSubmission 
        ? (Array.isArray(replyToSubmission.to) ? replyToSubmission.to.join(', ') : replyToSubmission.to)
        : '';
      const replyCc = replyToSubmission && replyToSubmission.cc
        ? (Array.isArray(replyToSubmission.cc) ? replyToSubmission.cc.join(', ') : replyToSubmission.cc)
        : '';
      
      // Combine recipients, allowing user to edit
      const combinedTo = replyRecipients || originalTo;
      const combinedCc = [originalCc, replyCc].filter(Boolean).join(', ');
      
      setComposeData({
        to: combinedTo,
        subject: `Re: ${thread.subject}`,
        cc: combinedCc,
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
    <div className="flex h-[calc(100vh-300px)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setIsComposing(true)}
            className="w-full bg-black text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Compose
          </button>
        </div>
        <nav className="flex-1 p-2">
          <button
            onClick={() => {
              setActiveView('inbox');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 text-sm transition-colors ${
              activeView === 'inbox' 
                ? 'bg-gray-100 text-black font-medium' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Inbox
            {emailThreads.filter(t => t.unread).length > 0 && (
              <span className="ml-auto bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">
                {emailThreads.filter(t => t.unread).length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('drafts');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 text-sm transition-colors ${
              activeView === 'drafts' 
                ? 'bg-gray-100 text-black font-medium' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Drafts
            {drafts.length > 0 && (
              <span className="ml-auto bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded">
                {drafts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveView('sent');
              setSelectedThread(null);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 text-sm transition-colors ${
              activeView === 'sent' 
                ? 'bg-gray-100 text-black font-medium' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Sent
            {sent.length > 0 && (
              <span className="ml-auto bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded">
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
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-black">
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
                className="text-gray-500 hover:text-black"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded p-4 flex flex-col">
              <div className="space-y-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    placeholder="Enter email addresses (comma-separated)"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-0.5">You can add multiple email addresses separated by commas</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CC (optional)</label>
                  <input
                    type="text"
                    placeholder="Enter CC email addresses (comma-separated)"
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-0.5">You can add multiple email addresses separated by commas</p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <RichTextEditor
                  content={composeData.content}
                  onChange={(html) => setComposeData({ ...composeData, content: html })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="px-4 py-1.5 bg-gray-100 text-black text-sm rounded hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
                >
                  {isSavingDraft ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Draft'
                  )}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSavingDraft || !composeData.content.trim()}
                  className="px-4 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : selectedThread ? (
          /* Thread View - Email Detail View with scroll only for email content */
          <div className="flex-1 flex flex-col h-full">
            <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
              <button
                onClick={() => setSelectedThread(null)}
                className="text-gray-600 hover:text-black mb-1.5 flex items-center gap-1.5 text-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {activeView}
              </button>
              <h2 className="text-base font-semibold text-black">{selectedThread.subject}</h2>
            </div>

            {/* Scrollable email content area - only this section scrolls */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0">
              {/* Original Email */}
              <div className="bg-white border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start mb-2 pb-2 border-b border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-black text-sm mb-0.5">{selectedThread.originalEmail.from}</p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-gray-700">To:</span> {selectedThread.originalEmail.to.join(', ')}
                      {selectedThread.originalEmail.cc && selectedThread.originalEmail.cc.length > 0 && (
                        <span className="ml-2"><span className="font-medium text-gray-700">CC:</span> {selectedThread.originalEmail.cc.join(', ')}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                    {new Date(selectedThread.originalEmail.date).toLocaleString()}
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-800 mt-2"
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
                  <div key={reply.id} className={`bg-white border border-gray-200 rounded p-3 ${depth > 0 ? 'ml-6 border-l-2 border-l-gray-300' : ''}`}>
                    <div className="flex justify-between items-start mb-2 pb-2 border-b border-gray-200">
                      <div className="flex-1">
                        <p className="font-semibold text-black text-sm mb-0.5">{reply.from}</p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium text-gray-700">To:</span> {Array.isArray(reply.to) ? reply.to.join(', ') : reply.to}
                          {reply.cc && reply.cc.length > 0 && (
                            <span className="ml-2"><span className="font-medium text-gray-700">CC:</span> {Array.isArray(reply.cc) ? reply.cc.join(', ') : reply.cc}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 ml-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          reply.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {reply.status}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {reply.date.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-800 mt-2"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                    {reply.fileName && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block border border-gray-200">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 00-2.828-2.828L9 10.172 7.586 8.586a2 2 0 10-2.828 2.828l4 4a2 2 0 002.828 0L16.828 9.828a2 2 0 000-2.828z" />
                        </svg>
                        {reply.fileName}
                      </div>
                    )}
                    {reply.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleCompose(selectedThread, reply)}
                        className="mt-2 px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 font-medium transition-colors"
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
                  className="ml-6 px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 font-medium transition-colors"
                >
                  Reply
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          /* Email List View */
          <div className="flex-1 flex flex-col h-full">
            <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
              <h2 className="text-sm font-semibold text-black capitalize">{activeView}</h2>
            </div>
            {/* Scrollable email list - only this section scrolls */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 min-h-0">
              {getDisplayThreads().length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  <p>No emails in {activeView}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {getDisplayThreads().map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 transition-colors ${
                        thread.unread ? 'border-black bg-gray-50' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {thread.unread && (
                              <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></div>
                            )}
                            <p className={`font-medium truncate text-sm ${thread.unread ? 'text-black' : 'text-gray-700'}`}>
                              {thread.subject}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {thread.participants.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {thread.lastMessage}
                          </p>
                        </div>
                        <div className="ml-3 flex-shrink-0 text-xs text-gray-500">
                          {thread.lastMessageDate.toLocaleDateString()}
                        </div>
                      </div>
                      {thread.replies.length > 0 && (
                        <div className="mt-1.5 text-xs text-gray-500">
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

