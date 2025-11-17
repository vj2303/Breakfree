import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Smile, Trash2 } from 'lucide-react';
import { useAssessmentForm } from '../create/context';

interface Competency {
  id: string;
  name: string;
  subCompetencies: string[];
}

interface ScoreState {
  [competencyId: string]: {
    [subCompetency: string]: {
      score1: string;
      score2: string;
      score3: string;
    };
  };
}

// Add type for items in competencyLibraryList
type CompetencyLibraryItem = {
  id: string;
  subCompetencyNames?: string[];
  // Add other properties if needed
};

const CompetencyFramework = () => {
  const context = useAssessmentForm();
  if (!context) {
    throw new Error('CompetencyFramework must be used within AssessmentFormContext');
  }
  const { formData, updateFormData } = context;
  // competencyLibraryList is dynamically added to formData in SelectCompetenciesStep
  const competencies: Competency[] = (formData.selectedCompetenciesData || []).map((comp: {id: string, name: string}) => {
    const competencyLibraryList = (formData as { competencyLibraryList?: CompetencyLibraryItem[] }).competencyLibraryList || [];
    const full = competencyLibraryList.find((c: CompetencyLibraryItem) => c.id === comp.id);
    return {
      id: comp.id,
      name: comp.name,
      subCompetencies: Array.isArray(full?.subCompetencyNames) ? (full as CompetencyLibraryItem).subCompetencyNames || [] : [],
    };
  });

  const [expandedCompetencies, setExpandedCompetencies] = useState<{[id: string]: boolean}>({});
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [activeCompetency, setActiveCompetency] = useState<Competency | null>(null);
  const [selectedSubCompetency, setSelectedSubCompetency] = useState<string>('');
  
  // Initialize scoreState from formData if it exists
  const [scoreState, setScoreState] = useState<ScoreState>(() => {
    const savedDescriptors = formData.descriptors || {};
    // Convert descriptors format to scoreState format
    const initialState: ScoreState = {};
    Object.keys(savedDescriptors).forEach(competencyId => {
      initialState[competencyId] = {};
      Object.keys(savedDescriptors[competencyId]).forEach(subCompetency => {
        const descriptor = savedDescriptors[competencyId][subCompetency];
        initialState[competencyId][subCompetency] = {
          score1: descriptor.score1 || '',
          score2: descriptor.score2 || '',
          score3: descriptor.score3 || '',
        };
      });
    });
    return initialState;
  });

  const toggleCompetencyExpansion = (id: string) => {
    setExpandedCompetencies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openScoreModal = (competency: Competency) => {
    setActiveCompetency(competency);
    setSelectedSubCompetency('');
    setShowScoreModal(true);
  };

  const openRubricModal = (competency: Competency) => {
    console.log('Open rubric modal for competency:', competency);
    setActiveCompetency(competency);
    setShowRubricModal(true);
  };

  const handleScoreChange = (sub: string, field: 'score1' | 'score2' | 'score3', value: string) => {
    if (!activeCompetency) return;
    setScoreState(prev => ({
      ...prev,
      [activeCompetency.id]: {
        ...(prev[activeCompetency.id] || {}),
        [sub]: {
          ...(prev[activeCompetency.id]?.[sub] || { score1: '', score2: '', score3: '' }),
          [field]: value,
        },
      },
    }));
  };

  // Log when step is saved/next is clicked
  useEffect(() => {
    const handleStepSave = () => {
      try {
        console.log('=== ADD FRAMEWORK STEP SAVED ===');
        console.log('Competencies count:', competencies.length);
        console.log('Score state:', scoreState);
        console.log('Expanded competencies:', Object.keys(expandedCompetencies).filter(key => expandedCompetencies[key]));
        console.log('Step validation:', {
          hasCompetencies: competencies.length > 0,
          hasScoreData: Object.keys(scoreState).length > 0,
          totalSubCompetencies: competencies.reduce((sum, comp) => sum + comp.subCompetencies.length, 0),
          competenciesWithScores: Object.keys(scoreState).length
        });
      } catch {}
    };

    // Listen for step save events
    window.addEventListener('step-save', handleStepSave);
    return () => window.removeEventListener('step-save', handleStepSave);
  }, [competencies, scoreState, expandedCompetencies]);

  return (
    <div className=" p-6 bg-white">
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-6 text-black">Competency Framework</h2>
        <div className="space-y-4">
          {competencies.map((competency: Competency, idx: number) => (
            <div key={competency.id} className="border-l-4 border-slate-800 pl-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-black">{competency.name}</span>
                  <button
                    onClick={() => toggleCompetencyExpansion(competency.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out"
                  >
                    <div className={`transform transition-transform duration-300 ease-in-out ${
                      expandedCompetencies[competency.id] ? 'rotate-180' : 'rotate-0'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openScoreModal(competency)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Add Descriptor"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openRubricModal(competency)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Score"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-1 text-red-500 hover:text-red-700" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div 
                className={`ml-9 overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCompetencies[competency.id] 
                    ? 'max-h-96 opacity-100 mt-3' 
                    : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-2">Sub competency</div>
                  {competency.subCompetencies.length > 0 ? (
                    competency.subCompetencies.map((sub: string, index: number) => (
                      <div key={index} className="text-sm text-black bg-white rounded p-2 mb-2 transform transition-all duration-200 ease-in-out">
                        {sub}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No subcompetencies</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Score Modal */}
      {showScoreModal && activeCompetency && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6 text-center text-black">Add Descriptor to the competency</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">Select Sub competency</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md text-black mb-4"
                value={selectedSubCompetency}
                onChange={e => setSelectedSubCompetency(e.target.value)}
              >
                <option value="">Select Sub competency</option>
                {activeCompetency.subCompetencies.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
              {selectedSubCompetency && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Score -1</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none text-black"
                      placeholder="Enter score description..."
                      value={scoreState[activeCompetency.id]?.[selectedSubCompetency]?.score1 || ''}
                      onChange={e => handleScoreChange(selectedSubCompetency, 'score1', e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Score -2</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none text-black"
                      placeholder="Enter score description..."
                      value={scoreState[activeCompetency.id]?.[selectedSubCompetency]?.score2 || ''}
                      onChange={e => handleScoreChange(selectedSubCompetency, 'score2', e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Score -3</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md h-20 resize-none text-black"
                      placeholder="Enter score description..."
                      value={scoreState[activeCompetency.id]?.[selectedSubCompetency]?.score3 || ''}
                      onChange={e => handleScoreChange(selectedSubCompetency, 'score3', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setSelectedSubCompetency('');
                }}
                className="px-4 py-2 text-black border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeCompetency) {
                    // Save descriptors to formData
                    const currentDescriptors = formData.descriptors || {};
                    const updatedDescriptors = {
                      ...currentDescriptors,
                      [activeCompetency.id]: {
                        ...(currentDescriptors[activeCompetency.id] || {}),
                        ...(scoreState[activeCompetency.id] || {}),
                      },
                    };
                    
                    // Update formData with descriptors
                    updateFormData('descriptors', updatedDescriptors);
                    console.log('💾 [Add Framework] Descriptors saved to formData:', updatedDescriptors);
                  }
                  setShowScoreModal(false);
                  setSelectedSubCompetency('');
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rubric Modal */}
      {showRubricModal && activeCompetency && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6 text-center text-black">Rubric</h3>
            {activeCompetency.subCompetencies.map((sub, idx) => (
              <div key={idx} className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-black">{sub}</h4>
                <div className="space-y-2 text-sm text-black">
                  <p>1. {scoreState[activeCompetency.id]?.[sub]?.score1 || 'No description added yet'}</p>
                  <p>2. {scoreState[activeCompetency.id]?.[sub]?.score2 || 'No description added yet'}</p>
                  <p>3. {scoreState[activeCompetency.id]?.[sub]?.score3 || 'No description added yet'}</p>
                </div>
              </div>
            ))}
            <div className="text-center">
              <button
                onClick={() => setShowRubricModal(false)}
                className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetencyFramework;