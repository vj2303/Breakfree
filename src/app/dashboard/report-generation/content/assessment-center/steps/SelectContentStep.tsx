import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useAssessmentForm } from '../create/context';
import { useAuth } from '@/context/AuthContext';

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

interface CaseStudy {
  id: string;
  name: string;
}

interface InboxActivity {
  id: string;
  name: string;
}

const SelectContentStep: React.FC = () => {
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('SelectContentStep must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;

  const { token } = useAuth();

  // Basic assessment center fields - use formData directly to prevent circular updates
  const [contentOptions, setContentOptions] = useState<{ [key: string]: { value: string; label: string }[] }>({});
  const [loading] = useState(false);
  const [error, setError] = useState("");

  // Use refs to prevent infinite loops
  // const isUpdatingFormData = useRef(false);

  // Memoize activity types to prevent unnecessary re-renders
  const activityTypesString = useMemo(() => {
    return formData.activities?.map(a => a.activityType).filter(Boolean).sort().join(',') || '';
  }, [formData.activities]);

  // Track which activity types are currently being fetched to prevent duplicates
  const fetchingTypes = useRef<Set<string>>(new Set());

  // Log when step is saved/next is clicked
  useEffect(() => {
    const handleStepSave = () => {
      try {
        const currentActivities = formData.activities || [];
        const mapped = currentActivities.map((a, i) => ({
          activityType: a.activityType,
          activityId: a.activityContent,
          displayOrder: i + 1,
          displayName: a.displayName,
          displayInstructions: a.displayInstructions,
        }));
        console.log('=== SELECT CONTENT STEP SAVED ===');
        console.log('Current activities:', mapped);
        console.log('Step validation:', {
          hasActivities: currentActivities.length > 0,
          allTypesSelected: currentActivities.every(a => a.activityType),
          allContentSelected: currentActivities.every(a => a.activityContent),
          allNamesFilled: currentActivities.every(a => a.displayName),
          allInstructionsFilled: currentActivities.every(a => a.displayInstructions)
        });
      } catch {}
    };

    // Listen for step save events
    window.addEventListener('step-save', handleStepSave);
    return () => window.removeEventListener('step-save', handleStepSave);
  }, [formData.activities]);

  // Fetch content options when activity types change - only run when necessary
  useEffect(() => {
    // Only run if we have activities and a token
    const currentActivities = formData.activities || [];
    if (currentActivities.length === 0 || !token) return;

    const fetchContent = async (type: string) => {
      // Prevent duplicate requests for the same type
      if (fetchingTypes.current.has(type)) {
        console.log(`[SelectContentStep] Already fetching for type: ${type}`);
        return;
      }

      // Don't fetch if already have options for this type
      if (contentOptions[type] && contentOptions[type].length > 0) {
        console.log(`[SelectContentStep] Already have options for type: ${type}`);
        return;
      }

      fetchingTypes.current.add(type);
      console.log(`[SelectContentStep] Starting fetch for type: ${type}`);

      try {
        let url = "";
        if (type === "case-study") {
          url = "https://api.breakfreeacademy.in/api/case-studies?page=1&limit=10";
        } else if (type === "inbox-activity") {
          url = "https://api.breakfreeacademy.in/api/inbox-activities?page=1&limit=10";
        } else {
          setContentOptions((prev) => ({ ...prev, [type]: [] }));
          fetchingTypes.current.delete(type);
          return;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        let options: { value: string; label: string }[] = [];
        if (type === "case-study" && data?.data?.caseStudies) {
          options = data.data.caseStudies.map((cs: CaseStudy) => ({ value: cs.id, label: cs.name }));
        } else if (type === "inbox-activity" && data?.data?.inboxActivities) {
          options = data.data.inboxActivities.map((ia: InboxActivity) => ({ value: ia.id, label: ia.name }));
        }
        setContentOptions((prev) => ({ ...prev, [type]: options }));
        console.log(`[SelectContentStep] Successfully fetched ${options.length} options for ${type}`);
      } catch (error) {
        console.error(`[SelectContentStep] Error fetching ${type}:`, error);
        setError("Failed to fetch content options");
      } finally {
        fetchingTypes.current.delete(type);
      }
    };

    // Get unique activity types that need fetching
    const uniqueTypes = [...new Set(currentActivities.map(a => a.activityType).filter(Boolean))];
    const typesToFetch = uniqueTypes.filter(type => !contentOptions[type]);

    console.log(`[SelectContentStep] Current activity types: [${activityTypesString}]`);
    console.log(`[SelectContentStep] Types to fetch: [${typesToFetch.join(', ')}]`);

    // Fetch content for each unique activity type that hasn't been fetched yet
    if (typesToFetch.length > 0) {
      typesToFetch.forEach(fetchContent);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityTypesString, token, formData.activities]); // Depend on formData.activities

  // Fetch activity details when activity content is selected
  // const fetchActivityDetails = useCallback(async (activityId: string, activityType: string) => {
  //   if (!activityId || !token || loading) {
  //     console.log(`[SelectContentStep] Skipping fetchActivityDetails: activityId=${activityId}, token=${!!token}, loading=${loading}`);
  //     return;
  //   }

  //   console.log(`[SelectContentStep] Fetching activity details for ${activityType}/${activityId}`);
  //   try {
  //     setLoading(true);
  //     const endpoint = activityType === 'case-study'
  //       ? `https://api.breakfreeacademy.in/api/case-studies/${activityId}`
  //       : `https://api.breakfreeacademy.in/api/inbox-activities/${activityId}`;

  //     const response = await fetch(endpoint, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       if (result.success && result.data) {
  //         console.log(`[SelectContentStep] Fetched activity details:`, result.data);
  //         // Don't auto-populate any fields - let user enter manually
  //       }
  //     } else {
  //       console.error(`[SelectContentStep] Failed to fetch activity details: ${response.status}`);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching activity details:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [token, loading]);

  const handleAdd = useCallback(() => {
    const newActivities = [...(formData.activities || []), { ...initialActivity }];
    console.log('[SelectContentStep] Adding new activity:', newActivities);
    updateFormData('activities', newActivities);
  }, [formData.activities, updateFormData]);

  const handleRemove = useCallback((idx: number) => {
    const newActivities = (formData.activities || []).filter((_, i) => i !== idx);
    console.log('[SelectContentStep] Removing activity at index:', idx);
    updateFormData('activities', newActivities);
  }, [formData.activities, updateFormData]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">Assessment Center Details</h2>
      
      {/* Basic Assessment Center Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-black mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black">Assessment Center Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => {
                console.log('[SelectContentStep] Name changed:', e.target.value);
                updateFormData('name', e.target.value);
              }}
              placeholder="Enter assessment center name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-black mb-8">Select Activity and Content</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <div className="flex flex-col gap-8">
        {(formData.activities || []).map((activity, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-6 items-end mb-2">
            <div>
              <label className="block text-sm font-semibold mb-1 text-black flex items-center gap-1">
                Select Activity <span className="text-black text-xs">?</span>
              </label>
              <select
                value={activity.activityType || ''}
                onChange={e => {
                  console.log(`[SelectContentStep] Activity type changed for idx ${idx}:`, e.target.value);
                  const newActivities = [...(formData.activities || [])];
                  if (newActivities[idx]) {
                    newActivities[idx] = { ...newActivities[idx], activityType: e.target.value, activityContent: '' };
                    updateFormData('activities', newActivities);
                  }
                }}
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
                value={activity.activityContent || ''}
                onChange={e => {
                  console.log(`[SelectContentStep] Activity content changed for idx ${idx}:`, e.target.value);
                  const newActivities = [...(formData.activities || [])];
                  if (newActivities[idx]) {
                    newActivities[idx] = { ...newActivities[idx], activityContent: e.target.value };
                    updateFormData('activities', newActivities);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white"
                disabled={!activity.activityType || loading}
              >
                <option value="">Select Content</option>
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
                value={activity.displayName || ''}
                onChange={e => {
                  console.log(`[SelectContentStep] Display name changed for idx ${idx}:`, e.target.value);
                  const newActivities = [...(formData.activities || [])];
                  if (newActivities[idx]) {
                    newActivities[idx] = { ...newActivities[idx], displayName: e.target.value };
                    updateFormData('activities', newActivities);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1 text-black">Display Instructions</label>
                <input
                  type="text"
                  value={activity.displayInstructions || ''}
                  onChange={e => {
                    console.log(`[SelectContentStep] Display instructions changed for idx ${idx}:`, e.target.value);
                    const newActivities = [...(formData.activities || [])];
                    if (newActivities[idx]) {
                      newActivities[idx] = { ...newActivities[idx], displayInstructions: e.target.value };
                      updateFormData('activities', newActivities);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              {(formData.activities || []).length > 1 && (
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