import React from 'react';

interface OverviewStepProps {
  activityDetail?: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    videoUrl?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    scenarios: Array<{
      id: string;
      title: string;
      readTime: number;
      exerciseTime: number;
      data: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    characters: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    organizationCharts: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      parentId: string | null;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    contents: Array<{
      id: string;
      to: string[];
      from: string;
      cc: string[];
      bcc: string[];
      subject: string;
      date: string;
      emailContent: string;
      inboxActivityId: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const OverviewStep: React.FC<OverviewStepProps> = ({ activityDetail }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Overview And Instructions</h2>
    <div className="bg-white p-6 rounded-lg border text-black">
      {activityDetail ? (
        <>
          <h3 className="text-xl text-black font-semibold mb-3">{activityDetail.name}</h3>
          <p className="mb-4 text-black">{activityDetail.description}</p>
          <div 
            className="mb-4" 
            dangerouslySetInnerHTML={{ __html: activityDetail.instructions }}
          />
          {activityDetail.videoUrl && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-black">Instructional Video:</h4>
              <a 
                href={activityDetail.videoUrl} 
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