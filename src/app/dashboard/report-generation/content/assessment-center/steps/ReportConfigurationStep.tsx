import React, { useState } from "react";

const templates = [
  { id: 1, name: "Report Template 1" },
  { id: 2, name: "Report Template 2" },
];

const ReportConfigurationStep = () => {
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-black">Report Configuration</h2>
        <span className="text-black text-lg font-bold">?</span>
      </div>
      <div className="bg-white rounded-2xl p-8 max-w-xl">
        <div className="font-bold text-lg text-black mb-4">Report Template</div>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">&#8964;</span>
          </div>
          <div className="relative">
            <div
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setDropdownOpen(open => !open)}
            >
              <span className={selectedTemplate ? "text-black" : "text-gray-400"}>
                {selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : "Select Template"}
              </span>
              <span className="text-gray-400">&#8964;</span>
            </div>
            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`px-4 py-3 cursor-pointer ${selectedTemplate === t.id ? "text-black font-semibold" : "text-gray-400"}`}
                    onClick={() => { setSelectedTemplate(t.id); setDropdownOpen(false); }}
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          {templates.map(t => (
            <div
              key={t.id}
              className={`px-2 py-3 ${selectedTemplate === t.id ? "text-black font-semibold" : "text-gray-400"}`}
            >
              {t.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportConfigurationStep; 