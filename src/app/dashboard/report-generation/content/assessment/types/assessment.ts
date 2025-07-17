// types/assessment.ts
export interface Assessment {
    id: string;
    title: string;
    description: string;
    createdOn: string;
    allottedTo: number;
    attemptedBy: number;
  }
  
  export type AssessmentType = 'case-study' | 'inbox-activity';