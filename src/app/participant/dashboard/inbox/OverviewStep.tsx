import React from 'react';
import { InboxActivityData } from './types';

interface OverviewStepProps {
  activityData?: InboxActivityData;
}

const OverviewStep: React.FC<OverviewStepProps> = ({ activityData }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Overview And Instructions</h2>
    <div className="bg-white p-6 rounded-lg border text-black">
      {activityData?.activityDetail ? (
        <>
          <h3 className="text-xl text-black font-semibold mb-3">{activityData.activityDetail.name}</h3>
          <p className="mb-4 text-black">{activityData.activityDetail.description}</p>
          <div 
            className="mb-4" 
            dangerouslySetInnerHTML={{ __html: activityData.activityDetail.instructions }}
          />
          {activityData.activityDetail.videoUrl && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-black">Instructional Video:</h4>
              <a 
                href={activityData.activityDetail.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Watch Video Instructions
              </a>
            </div>
          )}
          <p className="mb-2">
            Please click on &quot;Start&quot; to proceed to the next page.
          </p>
        </>
      ) : (
        <>
          <p className="mb-2">
            In this exercise, you will need to read through a series of business situations and comprehend the context.
          </p>
          <p className="mb-2">
            Based on the business situations, you will be required to complete certain tasks within the Inbox Activity.
          </p>
          <p className="mb-2">
            <b>Task 1:</b> Provide written responses to questions.<br />
            <b>Task 2:</b> Connect with an assessor to elaborate upon your written response.
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
        </>
      )}
    </div>
  </div>
);

export default OverviewStep; 