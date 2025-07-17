import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAssessmentForm } from '../create/page';

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

const CompetencyFramework = () => {
  const { formData } = useAssessmentForm();
  const competencies: Competency[] = (formData.selectedCompetenciesData || []).map((comp: {id: string, name: string}) => {
    const full = (formData.competencyLibraryList || []).find((c: any) => c.id === comp.id);
    return {
      id: comp.id,
      name: comp.name,
      subCompetencies: Array.isArray(full?.subCompetencyNames) ? full.subCompetencyNames : [],
    };
  });

  const [expandedCompetencies, setExpandedCompetencies] = useState<{[id: string]: boolean}>({});
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [activeCompetency, setActiveCompetency] = useState<Competency | null>(null);
  const [selectedSubCompetency, setSelectedSubCompetency] = useState<string>('');
  const [scoreState, setScoreState] = useState<ScoreState>({});

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
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {expandedCompetencies[competency.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openScoreModal(competency)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Add Descriptor"
                  >
                    <span className="text-2xl">+</span>
                  </button>
                  <button
                    onClick={() => openRubricModal(competency)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Score"
                  >
                    <span className="text-2xl">😊</span>
                  </button>
                  <button className="p-1 text-red-500 hover:text-red-700" title="Delete">
                    <span className="text-2xl">🗑️</span>
                  </button>
                </div>
              </div>
              {expandedCompetencies[competency.id] && (
                <div className="ml-9 space-y-2 bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold mb-2">Sub competency</div>
                  {competency.subCompetencies.length > 0 ? (
                    competency.subCompetencies.map((sub: string, index: number) => (
                      <div key={index} className="text-sm text-black bg-white rounded p-2 mb-2">
                        {sub}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No subcompetencies</div>
                  )}
                </div>
              )}
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
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2 text-black border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowScoreModal(false)}
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