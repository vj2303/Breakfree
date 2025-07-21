import React from 'react';
// Modal Component to handle modal display
const Modal = ({ isOpen, closeModal, contentType, classification, evaluation }) => {
  if (!isOpen) return null;

  console.log({ classification })

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-10 flex justify-center items-center z-50 overflow-scroll">
      <div className="modal-content bg-white  rounded-lg w-3/4 md:w-1/2 max-h-[60vh] relative"> {/* Use relative positioning */}
        {/* Close Button positioned at the top-right */}
        <button
          className="absolute top-2 text-white right-2 text-2xl font-bold"
          onClick={closeModal} // Close modal when clicked
        >
          ×
        </button>

        {/* Modal Content */}
        {contentType === 'classification' && (


          <div>
            <h1 className='font-bold text-[32px] bg-[#476181] rounded-lg text-white mb-2 p-2'>Classification</h1>
            <div className='p-2'>
              <p className='text-[#102377] text-[24px] font-medium'>Score</p>
              <p>Proposal Score: {classification["Training Proposal Score"]}</p>
              <p>E-learning Score: {classification["E-learning Script Score"]}</p>
              <h3 className='text-[#102377] text-[24px]'>Predicted Category</h3>
              <p>{classification["Predicted Category"]}</p>

              <h3 className='text-[#102377] text-[24px] font-medium'>Reasoning</h3>
              <p>{classification["Reasoning"]}</p>

              <div className='flex justify-between mt-4'>
                <h3 className='text-[#102377] text-[24px]'>Confidence - {classification["Confidence"]}</h3>
                <h3 className='text-[#102377] text-[24px]'>Compliance - {classification["Compliance"]}</h3>
              </div>
            </div>
          </div>
        )}

        {contentType === 'evaluation' && (

          <div className='bg-white'>
          <h1 className='font-bold text-[32px] bg-[#476181] rounded-lg text-white mb-2 p-2'>Evaluation</h1>
          <div className='p-2 max-h-[500px] overflow-y-scroll'>
            <div className='flex flex-col justify-between'>
              <p className='text-[#102377] text-[24px] font-medium'>Scores</p>
              <div className="space-y-2">
                {Object.entries(evaluation["scores"]).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <h3 className="font-semibold">{key}:</h3>
                    <p className="text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
              <p className='text-[#102377] text-[24px] font-medium'>Reasoning</p>
              <div className="space-y-2">
                {Object.entries(evaluation["Reasoning"]).map(([key, value]) => (
                  <div key={key} className="flex gap-3">
                    <h3 className="font-semibold">{key}:</h3>
                    <p className="text-gray-700">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <hr className="border-gray-300 my-4" />

            {/* Compliance Status */}
            <div className="flex justify-between mb-4">
              <p className="font-medium text-[#102377]">Compliance Status</p>
              <p className="text-black">{evaluation["Compliance Status"]}</p>
            </div>

            {/* Total Score */}
            <div className="flex justify-between mb-4">
              <p className="font-medium text-[#102377]">Total Score</p>
              <p className="text-black">{evaluation["Total Score"]}</p>
            </div>
            <div className="flex justify-between mb-4">
              <p className="font-medium text-[#102377]">Feedback</p>
              <p className="text-black">{evaluation["Feedback"]}</p>
            </div>
            <div className="flex justify-between mb-4">
              <p className="font-medium text-[#102377]">Content</p>
              <p className="text-black">{evaluation["content"]}</p>
            </div>

            <hr className="border-gray-300 my-4" />

            <div>
              <h3 className="text-[#102377] text-[24px] font-medium mb-2">Suggestions</h3>
              {
                evaluation["Suggestions"].map((ele: string, index: number) => {
                  return <p key={index} className="text-black">{ele}</p>
                })
              }
            </div>
          </div>
          </div>



       
        )}


      </div>
    </div>
  );
};

export default Modal;
