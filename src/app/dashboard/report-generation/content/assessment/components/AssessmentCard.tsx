'use client';

import React, { useState } from 'react';
import { MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import { Assessment } from '../types/assessment';

interface AssessmentCardProps {
  assessment: Assessment;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ 
  assessment, 
  onEdit, 
  onPreview, 
  onRemove 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleEdit = () => {
    onEdit?.(assessment.id);
    setShowDropdown(false);
  };

  const handlePreview = () => {
    onPreview?.(assessment.id);
    setShowDropdown(false);
  };

  const handleRemove = () => {
    onRemove?.(assessment.id);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{assessment.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
          <p className="text-xs text-gray-500">Created on {assessment.createdOn}</p>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] z-20">
                <button 
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button 
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button 
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-gray-600">Allotted to </span>
          <span className="text-blue-600 font-medium">({assessment.allottedTo})</span>
        </div>
        <div>
          <span className="text-gray-600">Attempted By </span>
          <span className="text-blue-600 font-medium">({assessment.attemptedBy})</span>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        This case study is designed for new managers participating in Batch No. 3 of the LEAP 2005 June Cohort. As a newly appointed Customer Experience
      </div>
    </div>
  );
};

export default AssessmentCard;