import React from "react";

const sentMails = [
  {
    sender: "Garima Tewari",
    designation: "Manager",
    subject: "Hi! I am Garima Tewari.",
    date: "12-01-25  12:00",
  },
  {
    sender: "Sakshi Gupta",
    designation: "Senior Manager",
    subject: "Hi! I am Sakshi Gupta.",
    date: "13-01-25  16:00",
  },
];

interface PreviewStepProps {
  loading?: boolean;
  error?: string;
  onSubmit?: () => void;
  onPrevious?: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ loading = false, error = '', onSubmit, onPrevious }) => {
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
              {sentMails.map((mail, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-6 py-4 text-black font-medium">{mail.sender}</td>
                  <td className="px-6 py-4 text-black">{mail.designation}</td>
                  <td className="px-6 py-4 text-black">{mail.subject}</td>
                  <td className="px-6 py-4 text-black">{mail.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    
      </div>
      {/* Right Sidebar */}
      <div className="flex flex-col gap-6 w-96">
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <button className="w-full flex items-center justify-between text-gray-400 font-semibold text-lg cursor-default" disabled>
            Scenario Description <span className="underline cursor-pointer text-gray-400">View</span>
          </button>
          <button className="w-full flex items-center justify-between text-gray-400 font-semibold text-lg cursor-default" disabled>
            Organizational Chart <span className="underline cursor-pointer text-gray-400">View</span>
          </button>
          <button className="w-full flex items-center justify-between text-gray-400 font-semibold text-lg cursor-default" disabled>
            Calender <span className="underline cursor-pointer text-gray-400">View</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-black">Sent Mails</span>
            <span className="bg-gray-900 text-white rounded-full px-3 py-1 font-semibold">10</span>
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