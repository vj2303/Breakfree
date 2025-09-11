import React, { useState } from 'react';

interface TaskStepProps {
  activityDetail?: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    videoUrl?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    scenarios: Array<{
      id: string;
      title: string;
      readTime: number;
      exerciseTime: number;
      data: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    characters: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    organizationCharts: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      parentId: string | null;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    contents: Array<{
      id: string;
      to: string[];
      from: string;
      cc: string[];
      bcc: string[];
      subject: string;
      date: string;
      emailContent: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const TaskStep: React.FC<TaskStepProps> = ({ activityDetail }) => {
  const [selectedEmail, setSelectedEmail] = useState<number>(0);
  const [responses, setResponses] = useState<{ [key: string]: string }>({});

  const emails = activityDetail?.contents || [];
  const characters = activityDetail?.characters || [];

  if (!activityDetail || emails.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Task</h2>
        <div className="bg-white p-6 rounded-lg border text-black">
          <p>No email tasks available for this activity.</p>
        </div>
      </div>
    );
  }

  const handleResponseChange = (emailId: string, response: string) => {
    setResponses(prev => ({ ...prev, [emailId]: response }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Task - Email Management</h2>
      <div className="flex gap-6">
        {/* Email List */}
        <div className="w-80">
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b font-semibold">Inbox ({emails.length})</div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {emails.map((email, idx) => (
                <button
                  key={email.id}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${selectedEmail === idx ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                  onClick={() => setSelectedEmail(idx)}
                >
                  <div className="font-medium text-sm truncate">{email.subject}</div>
                  <div className="text-xs text-black truncate">From: {email.from}</div>
                  <div className="text-xs text-black">{formatDate(email.date)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Email Content and Response */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border">
            {/* Email Header */}
            <div className="p-4 border-b">
              <h3 className="font-semibold text-lg mb-2">{emails[selectedEmail].subject}</h3>
              <div className="text-sm text-black space-y-1">
                <div><span className="font-medium">From:</span> {emails[selectedEmail].from}</div>
                <div><span className="font-medium">To:</span> {emails[selectedEmail].to.join(', ')}</div>
                {emails[selectedEmail].cc.length > 0 && (
                  <div><span className="font-medium">CC:</span> {emails[selectedEmail].cc.join(', ')}</div>
                )}
                <div><span className="font-medium">Date:</span> {formatDate(emails[selectedEmail].date)}</div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-4 border-b">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: emails[selectedEmail].emailContent }}
              />
            </div>

            {/* Response Section */}
            <div className="p-4">
              <h4 className="font-semibold mb-3">Your Response:</h4>
              <textarea
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your response to this email..."
                value={responses[emails[selectedEmail].id] || ''}
                onChange={(e) => handleResponseChange(emails[selectedEmail].id, e.target.value)}
              />
              <div className="mt-2 flex justify-between items-center">
                <div className="text-sm text-black">
                  Characters: {(responses[emails[selectedEmail].id] || '').length}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save Response
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters Reference */}
      {characters.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Key Characters</h3>
          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((character) => (
                <div key={character.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-black">{character.name}</div>
                  <div className="text-sm text-black">{character.designation}</div>
                  <div className="text-xs text-black">{character.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStep; 