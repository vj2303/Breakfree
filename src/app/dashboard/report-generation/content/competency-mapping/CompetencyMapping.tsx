'use client';
import React, { useState } from 'react';

interface SubCompetency {
  id: string;
  text: string;
}

interface Competency {
  id: string;
  name: string;
  subCompetencies: SubCompetency[];
}

interface CompetencyLibrary {
  id: string;
  name: string;
  createdOn: string;
  competencies: Competency[];
}

interface CompetencyMap {
  id: string;
  name: string;
  designation: string;
  selectedLibrary: CompetencyLibrary | null;
  selectedCompetencies: Competency[];
  createdOn: string;
}

interface CompetencyMappingProps {
  libraries: CompetencyLibrary[];
  maps: CompetencyMap[];
  onAddMap: (map: Omit<CompetencyMap, 'id'>) => void;
  onEditMap: (id: string, map: Omit<CompetencyMap, 'id'>) => void;
  onDeleteMap: (id: string) => void;
}

const CompetencyMapping: React.FC<CompetencyMappingProps> = ({
  libraries,
  maps,
  onAddMap,
  onEditMap,
  onDeleteMap,
}) => {
  const [showCreateMap, setShowCreateMap] = useState(false);
  const [editingMap, setEditingMap] = useState<CompetencyMap | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  
  const [newMap, setNewMap] = useState({
    name: '',
    designation: '',
    selectedLibrary: null as CompetencyLibrary | null,
    selectedCompetencies: [] as Competency[]
  });

  const handleCreateMap = () => {
    if (!newMap.name.trim() || !newMap.designation.trim()) return;
    
    onAddMap({
      name: newMap.name,
      designation: newMap.designation,
      selectedLibrary: newMap.selectedLibrary,
      selectedCompetencies: newMap.selectedCompetencies,
      createdOn: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    });
    
    resetForm();
  };

  const handleEditMap = () => {
    if (!editingMap || !newMap.name.trim() || !newMap.designation.trim()) return;
    
    onEditMap(editingMap.id, {
      name: newMap.name,
      designation: newMap.designation,
      selectedLibrary: newMap.selectedLibrary,
      selectedCompetencies: newMap.selectedCompetencies,
      createdOn: editingMap.createdOn
    });
    
    resetForm();
  };

  const openEditModal = (map: CompetencyMap) => {
    setEditingMap(map);
    setNewMap({
      name: map.name,
      designation: map.designation,
      selectedLibrary: map.selectedLibrary,
      selectedCompetencies: map.selectedCompetencies
    });
    setShowCreateMap(true);
  };

  const resetForm = () => {
    setNewMap({
      name: '',
      designation: '',
      selectedLibrary: null,
      selectedCompetencies: []
    });
    setShowCreateMap(false);
    setEditingMap(null);
    setLibrarySearchTerm('');
  };

  const handleLibrarySelect = (library: CompetencyLibrary) => {
    setNewMap({
      ...newMap,
      selectedLibrary: library,
      selectedCompetencies: [] // Reset selected competencies when library changes
    });
    setLibrarySearchTerm('');
  };

  const handleCompetencyToggle = (competency: Competency) => {
    const isSelected = newMap.selectedCompetencies.some(c => c.id === competency.id);
    
    if (isSelected) {
      setNewMap({
        ...newMap,
        selectedCompetencies: newMap.selectedCompetencies.filter(c => c.id !== competency.id)
      });
    } else {
      setNewMap({
        ...newMap,
        selectedCompetencies: [...newMap.selectedCompetencies, competency]
      });
    }
  };

  const filteredMaps = maps.filter(map =>
    map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    map.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLibraries = libraries.filter(library =>
    library.name.toLowerCase().includes(librarySearchTerm.toLowerCase())
  );

  const toggleDropdown = (mapId: string) => {
    setDropdownOpen(dropdownOpen === mapId ? null : mapId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">Competency Maps</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              className="border border-gray-300 rounded-full px-4 py-2 pl-10 w-80 text-black"
              placeholder="Search by competency map name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowCreateMap(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-full"
          >
            + Create Competency Map
          </button>
        </div>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaps.map((map) => (
          <div key={map.id} className="bg-white border border-gray-200 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleDropdown(map.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {dropdownOpen === map.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      // Handle view action
                      setDropdownOpen(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      openEditModal(map);
                      setDropdownOpen(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDeleteMap(map.id);
                      setDropdownOpen(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-black mb-2 pr-8">{map.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Designation: {map.designation}</p>
            <p className="text-sm text-gray-600 mb-2">Created on {map.createdOn}</p>
            {map.selectedLibrary && (
              <p className="text-sm text-blue-600">Library: {map.selectedLibrary.name}</p>
            )}
            {map.selectedCompetencies.length > 0 && (
              <p className="text-sm text-green-600">{map.selectedCompetencies.length} competencies mapped</p>
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Map Modal */}
      {showCreateMap && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-6 text-xl text-black">
              {editingMap ? 'Edit Competency Map' : 'Create Competency Map'}
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Competency Map Name</label>
                <input
                  className="border w-full p-3 rounded-lg text-black"
                  placeholder="Enter Name"
                  value={newMap.name}
                  onChange={(e) => setNewMap({ ...newMap, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-black">Designation</label>
                <input
                  className="border w-full p-3 rounded-lg text-black"
                  placeholder="Write Designation"
                  value={newMap.designation}
                  onChange={(e) => setNewMap({ ...newMap, designation: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-black">Select Competency</label>
              <div className="relative">
                <input
                  className="border w-full p-3 pl-10 rounded-lg text-black"
                  placeholder="Search by competency library name"
                  value={librarySearchTerm}
                  onChange={(e) => setLibrarySearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Library Selection */}
            <div className="space-y-4 mb-6">
              {filteredLibraries.map((library) => (
                <div
                  key={library.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    newMap.selectedLibrary?.id === library.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLibrarySelect(library)}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      checked={newMap.selectedLibrary?.id === library.id}
                      onChange={() => handleLibrarySelect(library)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-black">
                        Competency- {library.name}
                      </div>
                      <div className="text-sm text-blue-600">Creator</div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="text-sm text-blue-600 mb-1">Sub Competency</div>
                    <ul className="text-sm text-black space-y-1">
                      {library.competencies.slice(0, 3).map((comp) => (
                        <li key={comp.id} className="flex items-center">
                          <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                          {comp.name}
                        </li>
                      ))}
                      {library.competencies.length > 3 && (
                        <li className="text-gray-500">
                          +{library.competencies.length - 3} more competencies
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Competency Selection */}
            {newMap.selectedLibrary && (
              <div className="mb-6">
                <h4 className="font-medium text-black mb-4">
                  Select Competencies from {newMap.selectedLibrary.name}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {newMap.selectedLibrary.competencies.map((competency) => (
                    <div
                      key={competency.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        newMap.selectedCompetencies.some(c => c.id === competency.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleCompetencyToggle(competency)}
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={newMap.selectedCompetencies.some(c => c.id === competency.id)}
                          onChange={() => handleCompetencyToggle(competency)}
                          className="mr-3"
                        />
                        <div className="font-medium text-black">{competency.name}</div>
                      </div>
                      <div className="ml-6">
                        <ul className="text-sm text-black space-y-1">
                          {competency.subCompetencies.map((sub) => (
                            <li key={sub.id} className="flex items-center">
                              <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                              {sub.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-6 py-2 text-black"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                className="bg-gray-800 text-white px-6 py-2 rounded-lg"
                onClick={editingMap ? handleEditMap : handleCreateMap}
              >
                {editingMap ? 'Update Map' : 'Create Map'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetencyMapping;