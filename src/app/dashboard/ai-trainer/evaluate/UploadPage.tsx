'use client';
import React, { useState } from 'react';
import Upload from '@/components/Upload';
import RecentContentCard from './RecentContentCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const UploadPage = ({ uploadStatus, uploadedFileName, handleFileUpload }) => {
    

    const handleDoneClick = async () => {
        // router.push("/ai-trainer/evaluate/accuracy")
    };

    return (
        <div className="  max-w-[1200px] mx-auto">
            <h1 className="font-bold text-black text-[40px] leading-[60px]">Upload</h1>

            {/* Upload component */}
            <Upload onFileChange={handleFileUpload} uploadStatus={uploadStatus} />

            {/* Upload Status Message */}
            {uploadStatus && (
                <p className={`mt-2 ${uploadStatus.startsWith('✅') ? 'text-green-500' : 'text-red-500'}`}>
                    {uploadStatus} {uploadedFileName && (`${uploadedFileName}`)}
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