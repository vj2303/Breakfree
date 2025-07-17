'use client';
import React, { useState } from 'react';
import CompetencyLibrary from './CompetencyLibrary';
import CompetencyMapping from './CompetencyMapping';

interface SubCompetency {
  id: string;
  text: string;
}

interface Competency {
  id: string;
  name: string;
  subCompetencies: SubCompetency[];
}

interface CompetencyLibraryType {
  id: string;
  name: string;
  createdOn: string;
  competencies: Competency[];
}

interface CompetencyMap {
  id: string;
  name: string;
  designation: string;
  selectedLibrary: CompetencyLibraryType | null;
  selectedCompetencies: Competency[];
  createdOn: string;
}

// Sample data
const initialLibraries: CompetencyLibraryType[] = [
  {
    id: '1',
    name: 'Competency Library Name',
    createdOn: '2 Jan 2025',
    competencies: [
      {
        id: 'c1',
        name: 'Delighting Customer: Solution And Experience Creator',
        subCompetencies: [
          { id: 's1', text: 'Brings Perspective & Teaches' },
          { id: 's2', text: 'Multiple Sources of Input' },
          { id: 's3', text: 'Strategically resolves everyday business challenges' },
          { id: 's4', text: 'Iterates for Best Outcomes - by leveraging internal data and external market insight' },
          { id: 's5', text: 'Conducts Courageous Conversation' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Leadership Skills',
    createdOn: '2 Jan 2025',
    competencies: [
      {
        id: 'c2',
        name: 'Strategic Thinking',
        subCompetencies: [
          { id: 's6', text: 'Develops long-term vision' },
          { id: 's7', text: 'Analyzes market trends' },
          { id: 's8', text: 'Makes data-driven decisions' }
        ]
      }
    ]
  }
];

const initialMaps: CompetencyMap[] = [
  {
    id: '1',
    name: 'Senior Developer Map',
    designation: 'Senior Software Engineer',
    selectedLibrary: initialLibraries[0],
    selectedCompetencies: [initialLibraries[0].competencies[0]],
    createdOn: '2 Jan 2025'
  }
];

export default function CompetencyMappingPage() {
  const [activeTab, setActiveTab] = useState<'maps' | 'library'>('maps');
  const [libraries] = useState<CompetencyLibraryType[]>(initialLibraries);
  const [maps, setMaps] = useState<CompetencyMap[]>(initialMaps);

  // Map handlers
  const handleAddMap = (newMap: Omit<CompetencyMap, 'id'>) => {
    setMaps([
      ...maps,
      { id: `map${Date.now()}`, ...newMap }
    ]);
  };

  const handleEditMap = (id: string, updatedMap: Omit<CompetencyMap, 'id'>) => {
    setMaps(maps.map(map => 
      map.id === id ? { ...map, ...updatedMap } : map
    ));
  };

  const handleDeleteMap = (id: string) => {
    setMaps(maps.filter(map => map.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-1 text-black">Competency Management</h1>
      <p className="text-black mb-6">Manage competency libraries and create competency maps</p>
      
      <div className="flex gap-2 mb-6">
        <button
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'maps' 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('maps')}
        >
          Competency Maps
        </button>
        <button
          className={`px-6 py-2 rounded-full transition-colors ${
            activeTab === 'library' 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-100 text-black hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('library')}
        >
          Competency Library
        </button>
      </div>

      {/* Render appropriate component based on active tab */}
      {activeTab === 'maps' ? (
        <CompetencyMapping
          libraries={libraries}
          maps={maps}
          onAddMap={handleAddMap}
          onEditMap={handleEditMap}
          onDeleteMap={handleDeleteMap}
        />
      ) : (
        <CompetencyLibrary />
      )}
    </div>
  );
}