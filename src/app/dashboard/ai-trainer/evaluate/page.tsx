"use client"
import React, { useState } from 'react'
import UploadPage from './UploadPage'
import axios from 'axios';
import ChatPage from './ChatPage';

// Define the UploadStatus type to match what UploadPage expects
type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

// Define interfaces that match the Modal component expectations
interface EvaluationScores {
  [key: string]: string | number;
}

interface EvaluationReasoning {
  [key: string]: string;
}

interface EvaluationData {
  scores: EvaluationScores;
  Reasoning: EvaluationReasoning;
  "Compliance Status": string;
  "Total Score": string | number;
  "Feedback": string;
  "content": string;
  "Suggestions": string[];
}

interface ClassificationData {
  "Training Proposal Score": string | number;
  "E-learning Script Score": string | number;
  "Predicted Category": string;
  "Reasoning": string;
  "Confidence": string;
  "Compliance": string;
}

interface EvaluationResult {
  evaluation: EvaluationData;
  classification: ClassificationData;
}

// API Error response type
interface ApiError {
  message: string;
  status?: number;
}

const Page = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<EvaluationResult | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadStatus('loading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios({
        method: 'post',
        url: 'https://breakfreeai-evaluation.onrender.com/evaluate',
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setUploadedFileName(file.name);
      setResult(res.data)
      setUploadStatus("success")
    } catch (error) {
      // Type guard to handle error properly
      const apiError = error as ApiError;
      alert(apiError.message || 'An error occurred during file upload');
      setUploadStatus('error');
    }
  };

  return (
    <div className="h-full overflow-hidden">
      {result ? (
        <ChatPage 
          evaluation={result.evaluation} 
          classification={result.classification} 
        />
      ) : (
        <UploadPage 
          handleFileUpload={handleFileUpload} 
          uploadStatus={uploadStatus} 
          uploadedFileName={uploadedFileName} 
        />
      )}
    </div>
  )
}

export default Page