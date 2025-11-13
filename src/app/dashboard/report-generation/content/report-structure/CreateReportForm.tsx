"use client"
import React, { useState, useEffect } from 'react'
import { AIProfileApi } from '../../../../../lib/aiProfileApi'
import { useAuth } from '../../../../../context/AuthContext'
import { AIProfile } from '../ai-profile/types'
import { ReportStructureApi, ReportFormData, ReportStructure } from '../../../../../lib/reportStructureApi'

interface CreateReportFormProps {
  onCancel: () => void
  onSave: (data: ReportStructure) => void
  editingReport?: ReportStructure | null
}

const CreateReportForm: React.FC<CreateReportFormProps> = ({ onCancel, onSave, editingReport }) => {
  const { token } = useAuth()
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([])
  const [aiProfilesLoading, setAiProfilesLoading] = useState(true)
  const [aiProfilesError, setAiProfilesError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ReportFormData>({
    reportName: '',
    description: '',
    selectedAssessment: '',
    reportTemplate: 'Report Template 2',
    aiProfile: '',
    reportCover: {
      reportName: true,
      candidateName: true,
      date: true
    },
    part1Introduction: false,
    part2Analysis: {
      detailObservation: true,
      customerOrientation: true,
      innovation: false,
      flexibleAndAdaptive: false,
      analyticalSkills: false,
      achievementOrientation: false,
      communicationSkills: false,
      inspiresTeam: false,
      developsTeamMembers: false,
      isAnSME: false,
      overallCompetencyRating: true
    },
    part3Comments: {
      areasOfStrength: true,
      areasOfDevelopment: true
    },
    part4OverallRatings: {
      interpretingScoreTable: true,
      competenciesScoreMatrix: true,
      chartType: 'bar'
    },
    part5Recommendation: false
  })

  // Populate form data when editing
  useEffect(() => {
    if (editingReport) {
      setFormData({
        reportName: editingReport.reportName || '',
        description: editingReport.description || '',
        selectedAssessment: editingReport.selectedAssessment || '',
        reportTemplate: editingReport.reportTemplate || 'Report Template 2',
        aiProfile: editingReport.aiProfile || '',
        reportCover: editingReport.reportCover || {
          reportName: true,
          candidateName: true,
          date: true
        },
        part1Introduction: editingReport.part1Introduction || false,
        part2Analysis: editingReport.part2Analysis || {
          detailObservation: true,
          customerOrientation: true,
          innovation: false,
          flexibleAndAdaptive: false,
          analyticalSkills: false,
          achievementOrientation: false,
          communicationSkills: false,
          inspiresTeam: false,
          developsTeamMembers: false,
          isAnSME: false,
          overallCompetencyRating: true
        },
        part3Comments: editingReport.part3Comments || {
          areasOfStrength: true,
          areasOfDevelopment: true
        },
        part4OverallRatings: editingReport.part4OverallRatings || {
          interpretingScoreTable: true,
          competenciesScoreMatrix: true,
          chartType: 'bar'
        },
        part5Recommendation: editingReport.part5Recommendation || false
      })
    }
  }, [editingReport])

  // Fetch AI profiles on component mount
  useEffect(() => {
    const fetchAiProfiles = async () => {
      if (!token) {
        setAiProfilesLoading(false)
        setAiProfilesError('Authentication required')
        return
      }

      try {
        setAiProfilesLoading(true)
        setAiProfilesError(null)
        
        const response = await AIProfileApi.getProfiles(token, {
          page: 1,
          limit: 100 // Get all profiles for the dropdown
        })
        
        if (response.success && response.data) {
          setAiProfiles(response.data.aiProfiles || [])
        } else {
          setAiProfilesError(response.message || 'Failed to fetch AI profiles')
        }
      } catch (err) {
        setAiProfilesError('An error occurred while fetching AI profiles')
        console.error('Error fetching AI profiles:', err)
      } finally {
        setAiProfilesLoading(false)
      }
    }

    fetchAiProfiles()
  }, [token])

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => {
      const parentValue = prev[parent as keyof ReportFormData]
      const parentObject = typeof parentValue === 'object' && parentValue !== null 
        ? parentValue as Record<string, unknown>
        : {}
      
      return {
        ...prev,
        [parent]: {
          ...parentObject,
          [field]: value
        }
      }
    })
  }

  const handleSave = async () => {
    if (!token) {
      setSubmitError('Authentication required')
      return
    }

    // Validate required fields
    if (!formData.reportName.trim()) {
      setSubmitError('Report name is required')
      return
    }

    if (!formData.description.trim()) {
      setSubmitError('Description is required')
      return
    }

    if (!formData.aiProfile) {
      setSubmitError('AI Profile is required')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      let response
      if (editingReport) {
        // Update existing report structure
        response = await ReportStructureApi.updateReportStructure(token, editingReport.id, formData)
      } else {
        // Create new report structure
        response = await ReportStructureApi.createReportStructure(token, formData)
      }
      
      if (response.success && response.data) {
        // Call the parent onSave callback with the data
        onSave(response.data)
      } else {
        setSubmitError(response.message || `Failed to ${editingReport ? 'update' : 'create'} report structure`)
      }
    } catch (err) {
      setSubmitError(`An unexpected error occurred while ${editingReport ? 'updating' : 'saving'} the report structure`)
      console.error(`Error ${editingReport ? 'updating' : 'saving'} report structure:`, err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected AI profile details
  const selectedAiProfile = aiProfiles.find(profile => profile.id === formData.aiProfile)

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{editingReport ? 'Edit Report Structure' : 'Create New Report Structure'}</h1>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? (editingReport ? 'Updating...' : 'Saving...') : (editingReport ? 'Update Report' : 'Save & Next')}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-8">
        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{submitError}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSubmitError(null)}
                    className="bg-red-100 px-3 py-1 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name
            </label>
            <input
              type="text"
              value={formData.reportName}
              onChange={(e) => handleInputChange('reportName', e.target.value)}
              placeholder="Enter Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select AI profile
            </label>
            <select
              value={formData.aiProfile}
              onChange={(e) => handleInputChange('aiProfile', e.target.value)}
              disabled={aiProfilesLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {aiProfilesLoading ? 'Loading AI profiles...' : 'Select AI Profile'}
              </option>
              {aiProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.title} ({profile.model})
                </option>
              ))}
            </select>
            {aiProfilesError && (
              <p className="mt-1 text-sm text-red-600">{aiProfilesError}</p>
            )}
            {aiProfiles.length === 0 && !aiProfilesLoading && !aiProfilesError && (
              <p className="mt-1 text-sm text-gray-500">No AI profiles available</p>
            )}
          </div>
        </div>

        {/* Selected AI Profile Details */}
        {selectedAiProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected AI Profile Details</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Title:</span> {selectedAiProfile.title}</p>
              <p><span className="font-medium">Model:</span> {selectedAiProfile.model}</p>
              <p><span className="font-medium">Temperature:</span> {selectedAiProfile.temperature}</p>
              <p><span className="font-medium">System Instruction:</span></p>
              <p className="text-xs bg-blue-100 p-2 rounded border-l-2 border-blue-300">
                {selectedAiProfile.systemInstruction}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Assessment
            </label>
            <select
              value={formData.selectedAssessment}
              onChange={(e) => handleInputChange('selectedAssessment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="assessment-1">Assessment 1</option>
              <option value="assessment-2">Assessment 2</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Report Template
            </label>
            <select
              value={formData.reportTemplate}
              onChange={(e) => handleInputChange('reportTemplate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Report Template 1">Report Template 1</option>
              <option value="Report Template 2">Report Template 2</option>
            </select>
          </div>
        </div>

        {/* Report Structural Elements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Select Report Structural elements
          </h2>

          {/* Report Cover */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Report Cover</h3>
            <div className="space-y-2">
              {[
                { key: 'reportName', label: 'Report Name' },
                { key: 'candidateName', label: 'Candidate Name' },
                { key: 'date', label: 'Date' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.reportCover[item.key as keyof typeof formData.reportCover]}
                    onChange={(e) => handleNestedChange('reportCover', item.key, e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Part 1: Introduction */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Part 1: Introduction to the Report
            </h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.part1Introduction}
                onChange={(e) => handleInputChange('part1Introduction', e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Introduction</span>
            </label>
          </div>

          {/* Part 2: Analysis */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Part 2: Analysis Of Report
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { key: 'detailObservation', label: 'Detail Observation' },
                { key: 'customerOrientation', label: 'Customer Orientation' },
                { key: 'innovation', label: 'Innovation' },
                { key: 'flexibleAndAdaptive', label: 'Flexible and Adaptive' },
                { key: 'analyticalSkills', label: 'Analytical Skills' },
                { key: 'achievementOrientation', label: 'Achievement Orientation' },
                { key: 'communicationSkills', label: 'Communication/Interpersonal Skills' },
                { key: 'inspiresTeam', label: 'Inspires Team' },
                { key: 'developsTeamMembers', label: 'Develops Team Members' },
                { key: 'isAnSME', label: 'Is an SME' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.part2Analysis[item.key as keyof typeof formData.part2Analysis]}
                    onChange={(e) => handleNestedChange('part2Analysis', item.key, e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.part2Analysis.overallCompetencyRating}
                  onChange={(e) => handleNestedChange('part2Analysis', 'overallCompetencyRating', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Overall Competency Rating for each competency</span>
              </label>
            </div>
          </div>

          {/* Part 3: Comments */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Part 3: Comments and Evaluation
            </h3>
            <div className="space-y-2">
              {[
                { key: 'areasOfStrength', label: 'Areas Of Strength' },
                { key: 'areasOfDevelopment', label: 'Areas Of Development' }
              ].map((item) => (
                <label key={item.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.part3Comments[item.key as keyof typeof formData.part3Comments]}
                    onChange={(e) => handleNestedChange('part3Comments', item.key, e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Part 4: Overall Ratings */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Part 4: Overall Ratings
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.part4OverallRatings.interpretingScoreTable}
                  onChange={(e) => handleNestedChange('part4OverallRatings', 'interpretingScoreTable', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Interpreting Score Table</span>
              </label>
              <div className="ml-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.part4OverallRatings.competenciesScoreMatrix}
                    onChange={(e) => handleNestedChange('part4OverallRatings', 'competenciesScoreMatrix', e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Competencies Score Matrix</span>
                </label>
                {formData.part4OverallRatings.competenciesScoreMatrix && (
                  <div className="ml-6 mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="chartType"
                        value="bar"
                        checked={formData.part4OverallRatings.chartType === 'bar'}
                        onChange={(e) => handleNestedChange('part4OverallRatings', 'chartType', e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Bar Graph</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="chartType"
                        value="pie"
                        checked={formData.part4OverallRatings.chartType === 'pie'}
                        onChange={(e) => handleNestedChange('part4OverallRatings', 'chartType', e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Pie Chart</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Part 5: Recommendation */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">
              Part 5: Recommendation - IDP
            </h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.part5Recommendation}
                onChange={(e) => handleInputChange('part5Recommendation', e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Recommendation</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateReportForm
