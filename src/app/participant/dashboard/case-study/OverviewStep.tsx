import React from 'react';
import { ActivityData } from './types';

interface OverviewStepProps {
  activityData?: ActivityData;
}

const OverviewStep: React.FC<OverviewStepProps> = ({ activityData }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Overview And Instructions</h2>
    <div className="bg-white p-6 rounded-lg border text-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Activity Details</h3>
        <p className="mb-2"><strong>Name:</strong> {activityData?.activityDetail?.name || 'N/A'}</p>
        <p className="mb-2"><strong>Description:</strong> {activityData?.activityDetail?.description || 'N/A'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <div 
          className="mb-4"
          dangerouslySetInnerHTML={{ 
            __html: activityData?.activityDetail?.instructions || 'No specific instructions provided.' 
          }}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">General Guidelines</h3>
        <p className="mb-2">
          In this exercise, first, you would need to read through a given business situation and comprehend the context.
        </p>
        <p className="mb-2">
          Based on the business situation, you will be required to complete certain task within the Exercise.
        </p>
        <p className="mb-2">
          <b>Task 1:</b> You would need to provide written responses to questions.<br />
          <b>Task 2:</b> You would need to connect with an assessor to elaborate upon your written response.
        </p>
        <p className="mb-2">
          The whole exercise will be of 60 minutes with 30 minutes of <b>Reading Time and 30 minutes</b> for completing the tasks. Please keep a tab on the Time left (will be visible at the top-right of the screen)
        </p>
        <p className="mb-2">
          In case you face any issues during the exercise, please inform the Program Coordinator as soon as possible.
        </p>
        <p>
          Please click on &quot;Start&quot; to proceed to the next page.
        </p>
      </div>
    </div>
  </div>
);

export default OverviewStep; 