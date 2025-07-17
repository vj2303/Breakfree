import React, { useState } from "react";
import Editor from "@/components/Editor";

const peopleOptions = [
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
  { value: "client", label: "Client" },
];

const AddContentStep = () => {
  const [exerciseTime, setExerciseTime] = useState(30);
  const [readingTime, setReadingTime] = useState(30);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [emailContent, setEmailContent] = useState("");

  return (
    <div className="bg-white rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Inbox Content</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 border rounded-full px-4 py-2 bg-white">
            <span className="text-gray-700">Exercise Time (Min)</span>
            <input
              type="number"
              value={exerciseTime}
              onChange={e => setExerciseTime(Number(e.target.value))}
              className="w-16 px-2 py-1 border-none outline-none text-black bg-transparent"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-full px-4 py-2 bg-white">
            <span className="text-gray-700">Reading Time (Min)</span>
            <input
              type="number"
              value={readingTime}
              onChange={e => setReadingTime(Number(e.target.value))}
              className="w-16 px-2 py-1 border-none outline-none text-black bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">From<span className="text-red-500">*</span></label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            required
          >
            <option value="">Select Type</option>
            {peopleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">To<span className="text-red-500">*</span></label>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
            required
          >
            <option value="">Select Type</option>
            {peopleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">CC</label>
          <select
            value={cc}
            onChange={e => setCc(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
          >
            <option value="">Select Type</option>
            {peopleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">BCC</label>
          <select
            value={bcc}
            onChange={e => setBcc(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
          >
            <option value="">Select Type</option>
            {peopleOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">Subject<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-black">Date<span className="text-red-500">*</span></label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
            required
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-black">E-mail Content</label>
        <Editor
          content={emailContent}
          onChange={setEmailContent}
        />
      </div>
      <div className="flex justify-end">
        <button
          className="mt-4 px-8 py-2 rounded-full bg-gray-900 text-white font-semibold text-lg shadow hover:bg-gray-800 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddContentStep; 