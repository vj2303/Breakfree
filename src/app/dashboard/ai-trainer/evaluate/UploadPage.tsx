'use client';
import React from 'react';
import Upload from '@/components/Upload';
import RecentContentCard from './RecentContentCard';
import Button from '@/components/ui/Button';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

interface UploadPageProps {
  uploadStatus: UploadStatus;
  uploadedFileName?: string;
  handleFileUpload: (file: File) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ uploadStatus, uploadedFileName, handleFileUpload }) => {
    

    const handleDoneClick = async () => {
        // router.push("/ai-trainer/evaluate/accuracy")
    };

    return (
        <div className="  max-w-[1200px] mx-auto">
            <h1 className="font-bold text-black text-[40px] leading-[60px]">Upload</h1>

            {/* Upload component */}
            <Upload onFileChange={handleFileUpload} uploadStatus={uploadStatus} />

            {/* Upload Status Message */}
            {uploadStatus !== 'idle' && (
                <p className={`mt-2 ${uploadStatus === 'success' ? 'text-green-500' : uploadStatus === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
                    {uploadStatus === 'loading' ? 'Uploading...' : uploadStatus === 'success' ? '✅ Uploaded' : uploadStatus === 'error' ? '❌ Upload failed' : ''} {uploadedFileName && (`${uploadedFileName}`)}
                </p>
            )}

            <div className="flex justify-end mt-4">
                <Button bg="dark-bg" text="white" onClick={handleDoneClick}>
                    Done
                </Button>
            </div>

            <h1 className="font-bold text-black text-[40px] leading-[60px]">
                Recent Evaluated Content
            </h1>
            <RecentContentCard />

            {/* Display Evaluation Results */}

        </div>
    );
};

export default UploadPage;