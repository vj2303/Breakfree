import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useAssessmentForm } from '../create/page';

const activityTypes = [
  { value: "case-study", label: "Case Study Assessment" },
  { value: "inbox-activity", label: "Inbox Activity" },
];

const initialActivity = {
  activityType: "",
  activityContent: "",
  displayName: "",
  displayInstructions: "",
};

const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZkNjkzMjMxMjYzYjNjMmQ4OTJiYTEiLCJpYXQiOjE3NTIwODM4OTksImV4cCI6MTc1MjY4ODY5OX0.tTGDyJJ-rjo_tKQ89qKHhxcxd3G4YVn4M_qrfdqwg_0';

const SelectContentStep: React.FC = () => {
  const { formData, updateFormData } = useAssessmentForm();
  const [activities, setActivities] = useState([
    { ...initialActivity },
  ]);
  const [contentOptions, setContentOptions] = useState<{ [key: string]: { value: string; label: string }[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    updateFormData('activities', activities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  // Fetch content options when activity type changes
  useEffect(() => {
    const fetchContent = async (type: string) => {
      setLoading(true);
      setError("");
      try {
        let url = "";
        if (type === "case-study") {
          url = "http://localhost:3000/api/case-studies?page=1&limit=10";
        } else if (type === "inbox-activity") {
          url = "http://localhost:3000/api/inbox-activities?page=1&limit=10";
        } else {
          setContentOptions((prev) => ({ ...prev, [type]: [] }));
          setLoading(false);
          return;
        }
        const res = await fetch(url, {
          headers: {
            Authorization: AUTH_TOKEN,
          },
        });
        const data = await res.json();
        let options: { value: string; label: string }[] = [];
        if (type === "case-study" && data?.data?.caseStudies) {
          options = data.data.caseStudies.map((cs: any) => ({ value: cs.id, label: cs.name }));
        } else if (type === "inbox-activity" && data?.data?.inboxActivities) {
          options = data.data.inboxActivities.map((ia: any) => ({ value: ia.id, label: ia.name }));
        }
        setContentOptions((prev) => ({ ...prev, [type]: options }));
      } catch (err: any) {
        setError("Failed to fetch content options");
      } finally {
        setLoading(false);
      }
    };
    // For each unique activityType in activities, fetch if not already fetched
    activities.forEach((activity) => {
      if (
        activity.activityType &&
        !contentOptions[activity.activityType] &&
        !loading
      ) {
        fetchContent(activity.activityType);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  const handleChange = (idx: number, field: string, value: string) => {
    setActivities((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
    // If activityType changes, reset activityContent
    if (field === "activityType") {
      setActivities((prev) =>
        prev.map((a, i) =>
          i === idx ? { ...a, activityContent: "" } : a
        )
      );
    }
  };

  const handleAdd = () => {
    setActivities((prev) => [...prev, { ...initialActivity }]);
  };

  const handleRemove = (idx: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-8">Select Activity and Content</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <div className="flex flex-col gap-8">
        {activities.map((activity, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-6 items-end mb-2">
            <div>
              <label className="block text-sm font-semibold mb-1 text-black flex items-center gap-1">
                Select Activity <span className="text-black text-xs">?</span>
              </label>
              <select
                value={activity.activityType}
                onChange={e => handleChange(idx, "activityType", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
              >
                <option value="">Select Type</option>
                {activityTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-black flex items-center gap-1">
                Select Activity Content <span className="text-black text-xs">?</span>
              </label>
              <select
                value={activity.activityContent}
                onChange={e => handleChange(idx, "activityContent", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
                disabled={!activity.activityType || loading}
              >
                <option value="">Select Type</option>
                {(contentOptions[activity.activityType] || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-black flex items-center gap-1">
                Display Name <span className="text-black text-xs">?</span>
              </label>
              <input
                type="text"
                value={activity.displayName}
                onChange={e => handleChange(idx, "displayName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-black">Display Instructions</label>
                <input
                  type="text"
                  value={activity.displayInstructions}
                  onChange={e => handleChange(idx, "displayInstructions", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              {activities.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="ml-2 text-red-500 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-gray-300 text-gray-500 font-semibold text-lg bg-white hover:bg-gray-100 shadow"
        >
          <span className="text-2xl">+</span> Create New Activity
        </button>
      </div>
    </div>
  );
};

export default SelectContentStep; 










