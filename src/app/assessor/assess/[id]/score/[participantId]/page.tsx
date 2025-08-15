"use client";

import React, { useState } from 'react';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';

const mockAssessments = [
  { id: '1', name: 'Group Name', admin: 'John Doe', members: 5 },
  { id: '2', name: 'Development Team', admin: 'Jane Smith', members: 8 },
  { id: '3', name: 'Marketing Group', admin: 'Mike Johnson', members: 6 },
  { id: '4', name: 'Project Alpha', admin: 'Sarah Wilson', members: 4 },
  { id: '5', name: 'Research Team', admin: 'David Brown', members: 7 },
  { id: '6', name: 'Beta Testing', admin: 'Lisa Davis', members: 5 },
  { id: '7', name: 'Design Squad', admin: 'Tom Anderson', members: 3 },
  { id: '8', name: 'Quality Assurance', admin: 'Emma Thompson', members: 9 },
];

const participantsData = [
  {
    id: 1,
    name: "Participant Name",
    email: "sakshi@gmail.com",
    activities: [
      { name: "Case Study Activity", type: "View Task" }
    ]
  }
];

interface Evaluation {
  metric: string;
  reasoning: string;
  score: string;
}

interface EvaluationResponse {
  evaluations: Evaluation[];
  filename: string;
  overall_score: string;
  success: boolean;
  summary: {
    average_score: string;
    total_metrics: number;
  };
}

const AssessmentDetail = () => {
  const [activeTab, setActiveTab] = useState('videos');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [averageScore, setAverageScore] = useState('2.5');
  const [comments, setComments] = useState('');
  
  // Mock data - in real app, you'd get this from useParams
  const id = '1';
  const assessment = mockAssessments.find(a => a.id === id);

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Downloading PDF report...');
      
      // Fetch the PDF file from the public folder
      const pdfResponse = await fetch('/test-doc.pdf');
      
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF file: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      
      const pdfBlob = await pdfResponse.blob();
      
      // Create a download link and trigger download
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'Interview_Report.pdf'; // You can customize the filename
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
      console.log('PDF report downloaded successfully');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while downloading the report');
      console.error('Error downloading report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const evaluateInterview = async () => {
    setIsEvaluating(true);
    setError(null);
    
    try {
      // Create a FormData object to send the video file
      const formData = new FormData();
      
      console.log('Fetching video file for evaluation...');
      
      // Fetch the video file from the public folder with proper error handling
      const response = await fetch('/test.MP4');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Video blob size:', videoBlob.size, 'bytes');
      console.log('Video blob type:', videoBlob.type);
      
      // Create a proper File object with the correct name and type
      const videoFile = new File([videoBlob], 'test.MP4', { 
        type: videoBlob.type || 'video/mp4',
        lastModified: Date.now()
      });
      
      console.log('Created video file:', videoFile.name, videoFile.size, 'bytes');
      
      // Append the video file to FormData
      formData.append('video', videoFile);
      
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      console.log('Making API call for evaluation...');
      
      // Make the API call with proper headers
      const apiResponse = await fetch('http://127.0.0.1:5001/evaluate-interview', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser set it with boundary for FormData
      });

      console.log('API Response status:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`API call failed: ${apiResponse.status} ${apiResponse.statusText} - ${errorText}`);
      }

      const result: EvaluationResponse = await apiResponse.json();
      console.log('API Response:', result);
      setEvaluationData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while evaluating the interview');
      console.error('Error evaluating interview:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4 text-black">Assessment Not Found</h1>
          <p className="text-lg text-black">No assessment found for ID: {id}</p>
        </div>
      </div>
    );
  }

  const ParticipantCard = ({ participant }: { participant: { id: number; name: string; email: string; activities: { name: string; type: string }[] } }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-black">{participant.name}, <span className="text-black font-normal">Email- {participant.email}</span></h2>
        <p className="text-black mt-1">Case Study Activity, Date- 12/02/2025</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-3">
          <button 
            onClick={generateReport}
            disabled={isGenerating || isEvaluating}
            className="bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate report'
            )}
          </button>
          <button 
            onClick={evaluateInterview}
            disabled={isGenerating || isEvaluating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Evaluate'
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <button className="border border-gray-300 rounded-full px-4 py-1 text-sm text-black">View Task</button>
          <button className="bg-black text-white rounded-full px-4 py-1 text-sm">Done</button>
        </div>
      </div>
    </div>
  );

  const EvaluationResults = () => {
    if (!evaluationData) return null;

    return (
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-black">Interview Evaluation Report</h3>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-700">Overall Score: {evaluationData.overall_score}</p>
            <p className="text-sm text-black">Average: {evaluationData.summary.average_score}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationData.evaluations.map((evaluation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-black">{evaluation.metric}</h4>
                <span className="text-sm font-semibold px-2 py-1 bg-slate-100 rounded text-black">
                  {evaluation.score}
                </span>
              </div>
              <p className="text-sm text-black">{evaluation.reasoning}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-black">
          <p>Report generated for: {evaluationData.filename}</p>
          <p>Total metrics evaluated: {evaluationData.summary.total_metrics}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title & Participant */}
        {participantsData.map((participant) => (
          <ParticipantCard key={participant.id} participant={participant} />
        ))}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competency Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Competency</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-black mb-4">
              <p>2. Struggled to align cross-functional teams and lacked a comprehensive approach to collaboration. Outcomes were not well-defined. Did share examples of working with NA and France teams. Limited outcome level.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-black mb-4">
              <p>2. Struggled to align cross-functional teams and lacked a comprehensive approach to collaboration. Outcomes were not well-defined. Did share examples of working with NA and France teams. Limited outcome level.</p>
            </div>
            <div className="text-sm text-white bg-slate-700 px-3 py-1 rounded-md inline-block mb-4">
              Score given to this sub competency- 1
            </div>
            <div className="mb-4">
              <p className="font-medium text-black">Average Competency Score</p>
              <input
                type="number"
                value={averageScore}
                onChange={(e) => setAverageScore(e.target.value)}
                min="0"
                max="10"
                step="0.1"
                className="w-full mt-1 border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Enter score (0-10)"
              />
            </div>
            <div>
              <p className="font-medium text-black">Add Comments</p>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 text-black focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Add your comments here"
              />
            </div>
          </div>

          {/* Submissions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-black">Submissions</h3>
              <p className="text-sm text-black">Completion Date- 12/02/2025</p>
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => setActiveTab('videos')}
                className={`border border-gray-300 rounded-md px-4 py-2 text-sm ${
                  activeTab === 'videos' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-black'
                }`}
              >
                Submitted Videos
              </button>
              <button 
                onClick={() => setActiveTab('documents')}
                className={`border border-gray-300 rounded-md px-4 py-2 text-sm ${
                  activeTab === 'documents' 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-black'
                }`}
              >
                Submitted Documents
              </button>
            </div>

            <div className="mt-4 border border-gray-300 rounded-md p-4 h-[400px] overflow-y-auto">
              {activeTab === 'videos' ? (
                <div className="space-y-4">
                  <div className="text-sm text-black mb-3">
                    <strong>Video Submission:</strong> test.MP4
                  </div>
                  <video 
                    controls 
                    className="w-full h-64 bg-black rounded-md"
                    preload="metadata"
                  >
                    <source src="/test1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="text-xs text-black mt-2">
                    <p><strong>File:</strong> test.MP4</p>
                    <p><strong>Submitted:</strong> 12/02/2025</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-black">
                  <p>
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                  </p>
                  <br />
                  <p>
                    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Results */}
        <EvaluationResults />
      </div>
    </div>
  );
};

export default AssessmentDetail;