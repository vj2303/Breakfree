"use client"
import React, { useState } from 'react'
import UploadPage from './UploadPage'
import axios from 'axios';
import ChatPage from './ChatPage';

interface EvaluationResult {
  evaluation: any;
  classification: any;
}

const page = () => {
  const [uploadStatus, setUploadStatus] = useState<'loading' | 'success' | 'error' | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
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
    } catch (error: any) {
      alert(error.message)
      setUploadStatus('error');
    }
  };
  return (
    <div className="h-full overflow-hidden">
      {result ? <ChatPage evaluation={result.evaluation} classification={result.classification} /> : <UploadPage handleFileUpload={handleFileUpload} uploadStatus={uploadStatus} uploadedFileName={uploadedFileName} />}
    </div>
  )
}

export default page