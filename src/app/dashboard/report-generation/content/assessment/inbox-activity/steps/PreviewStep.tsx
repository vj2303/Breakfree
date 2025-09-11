import React from "react";

interface Character {
  name: string;
  email: string;
  designation: string;
}

interface Email {
  id: number;
  from: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  date: string;
  emailContent: string;
  isCollapsed: boolean;
}

interface FormDataShape {
  overview: string;
  exerciseTime: number;
  readingTime: number;
  name: string;
  description: string;
  videoUrl?: string;
}

interface Scenario {
  id: string | number;
  title: string;
  content: string;
  exerciseTime: number;
  readingTime: number;
  documents?: { id: string; name: string; url: string; size: number; type: string }[];
}

interface PreviewStepProps {
  loading?: boolean;
  error?: string;
  scenarios: Scenario[];
  characters: Character[];
  emails: Email[];
  formData: FormDataShape;
  onSubmit?: () => void;
  onPrevious?: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ loading = false, error = '', scenarios, characters, emails, formData, onSubmit, onPrevious }) => {
  const getSenderInfo = (fromEmail: string) => {
    const c = characters.find(ch => ch.email === fromEmail);
    return {
      sender: c ? c.name : fromEmail || '-'.toString(),
      designation: c ? c.designation : '',
    };
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    try {
      return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
    } catch {
      return new Date(dateString).toLocaleString('en-US', options);
    }
  };

  return (
    <div className="flex gap-8">
      {/* Main Table */}
      <div className="flex-1 bg-white rounded-2xl p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Sent Mails</h2>
          <button className="flex items-center gap-2 px-5 py-2 rounded-full border shadow-sm bg-white text-black font-semibold text-base hover:bg-gray-100">
            <span className="text-xl">+</span> Compose
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date and Time</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((mail) => {
                const { sender, designation } = getSenderInfo(mail.from);
                return (
                  <tr key={mail.id} className="border-t">
                    <td className="px-6 py-4 text-black font-medium">{sender}</td>
                    <td className="px-6 py-4 text-black">{designation}</td>
                    <td className="px-6 py-4 text-black">{mail.subject}</td>
                    <td className="px-6 py-4 text-black">{formatDate(mail.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          {onPrevious && (
            <button onClick={onPrevious} className="px-5 py-2 rounded-full border bg-white text-black hover:bg-gray-100">Previous</button>
          )}
          {onSubmit && (
            <button onClick={onSubmit} className="px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
      {/* Right Sidebar */}
      <div className="flex flex-col gap-6 w-96">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black">Activity</span>
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-black">{formData.name || 'Untitled Activity'}</div>
            {formData.videoUrl && (
              <div className="mt-1 text-blue-600 break-all">{formData.videoUrl}</div>
            )}
            {formData.description && (
              <div className="mt-2 text-gray-600">{formData.description}</div>
            )}
          </div>
        </div>
        {scenarios.length > 0 && (
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">Scenarios</span>
              <span className="bg-gray-900 text-white rounded-full px-3 py-1 font-semibold">{scenarios.length}</span>
            </div>
            <div className="space-y-3">
              {scenarios.map((s) => (
                <div key={s.id} className="border rounded p-3">
                  <div className="text-sm font-medium text-black">{s.title || 'Untitled Scenario'}</div>
                  {(s.exerciseTime > 0 || s.readingTime > 0) && (
                    <div className="text-xs text-gray-600 mt-1">
                      {s.exerciseTime > 0 && <span>Exercise: {s.exerciseTime}min</span>}
                      {s.exerciseTime > 0 && s.readingTime > 0 && <span> | </span>}
                      {s.readingTime > 0 && <span>Reading: {s.readingTime}min</span>}
                    </div>
                  )}
                  {s.documents && s.documents.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{s.documents.length} attachment{s.documents.length > 1 ? 's' : ''}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black">Sent Mails</span>
            <span className="bg-gray-900 text-white rounded-full px-3 py-1 font-semibold">{emails.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Inbox</span>
            <span className="bg-gray-200 text-gray-900 rounded-full px-3 py-1 font-semibold">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Draft</span>
            <span className="bg-gray-200 text-gray-900 rounded-full px-3 py-1 font-semibold">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;