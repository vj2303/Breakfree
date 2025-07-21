'use client'
import React, { useState, useEffect } from 'react';
import Chats from './Chats';
import AccuracyRate from './AccuracyRate';
import SuggetionsCard from './SuggetionsCard';
import Modal from './Modal'; // Import Modal

const ChatPage = ({ classification, evaluation }) => {
    const [currentDetails, setCurrentDetails] = useState("classification")
    
//   const [evaluationResult, setEvaluationResult] = useState(null); // Store Evaluation Response
//   const [overallScore, setOverallScore] = useState(null); // Store Overall Score
//   const [loading, setLoading] = useState(false); // Track loading state

//   useEffect(() => {
//     handleDoneClick();
//   }, []); // Call API when component mounts

//   const handleDoneClick = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('http://127.0.0.1:8000/evaluate/done', {
//         method: 'POST',
//         headers: { 'accept': 'application/json' },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setEvaluationResult(data.lesson_plan_evaluation);
//         setOverallScore(data.overall_score);
//       } else {
//         setEvaluationResult('❌ Evaluation failed.');
//         setOverallScore(null);
//       }
//     } catch (error) {
//       setEvaluationResult('❌ Error fetching evaluation.');
//       setOverallScore(null);
//     }
//     setLoading(false);
//   };

  return (
    <div className="ml-[130px] mt-[120px] flex h-full overflow-hidden">
      {/* Left Section - Chats with Evaluation Result */}
      <div className="bg-[#FFFFFF] w-[60%] rounded-xl overflow-hidden">
        <Chats Feedback={evaluation.Feedback}  />
      </div>

      {/* Right Section - Sticky Evaluation Results */}
      <div className="bg-[#ffffff] w-[35%] ml-[27px] p-4 border border-gray-300 rounded-lg sticky top-20 h-fit overflow-hidden">
        {/* Pass overallScore and Modal to AccuracyRate */}
        <AccuracyRate currentDetails={currentDetails} setCurrentDetails={setCurrentDetails} />

        {/* Suggestions Section */}
        <SuggetionsCard evaluation={evaluation} classification={classification} currentDetails={currentDetails} />
      </div>
    </div>
  );
};

export default ChatPage;
