import React, {useState} from "react";
import Modal from "./Modal";

const AccuracyRate = ({ currentDetails, setCurrentDetails }) => {



  

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Buttons for actions */}
      <div className="flex flex-row gap-4">
        <p 
          className={`border rounded-full  px-[40px] cursor-pointer py-[14px] font-bold border-[#9D9D9D] whitespace-nowrap ${currentDetails === "classification" ? "bg-[#476181] text-white" : ""}`}
          onClick={() => setCurrentDetails('classification')} // Open modal for Classification
        >
          See Classification
        </p>
        <p 
          className={`border rounded-full px-[40px] cursor-pointer py-[14px] font-bold border-[#9D9D9D] whitespace-nowrap ${currentDetails === "evaluation" ? "bg-[#476181] text-white" : ""}`}
          onClick={() => setCurrentDetails('evaluation')} // Open modal for Evaluation
        >
          See Evaluation
        </p>           
      </div>

      {/* Pass Modal to display when open */}
      {/* <Modal isOpen={isModalOpen} closeModal={closeModal} contentType={modalType} classification={classification} evaluation={evaluation} /> */}
    </div>
  );
};

export default AccuracyRate;




