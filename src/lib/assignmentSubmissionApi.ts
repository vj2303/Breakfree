// assignmentSubmissionApi.ts

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api' 
  : 'http://localhost:3000/api';

export interface SubmissionData {
  participantId: string;
  assessmentCenterId: string;
  activityId: string;
  activityType: 'CASE_STUDY' | 'INBOX_ACTIVITY';
  submissionType: 'VIDEO' | 'DOCUMENT' | 'TEXT';
  notes?: string;
  textContent?: string;
  file?: File;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export class AssignmentSubmissionApi {
  private static getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  static async submitAssignment(
    token: string,
    submissionData: SubmissionData
  ): Promise<SubmissionResponse> {
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('participantId', submissionData.participantId);
      formData.append('assessmentCenterId', submissionData.assessmentCenterId);
      formData.append('activityId', submissionData.activityId);
      formData.append('activityType', submissionData.activityType);
      formData.append('submissionType', submissionData.submissionType);
      
      // Add optional fields
      if (submissionData.notes) {
        formData.append('notes', submissionData.notes);
      }
      
      if (submissionData.textContent) {
        formData.append('textContent', submissionData.textContent);
      }
      
      if (submissionData.file) {
        formData.append('file', submissionData.file);
      }

      const response = await fetch(`${API_BASE_URL}/assignments/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to submit assignment',
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message || 'Assignment submitted successfully',
      };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return {
        success: false,
        message: 'Network error occurred while submitting assignment',
      };
    }
  }
}
