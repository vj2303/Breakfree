import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authorization token required' 
        }, 
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Parse the form data
    const formData = await request.formData();
    
    // Extract form fields
    const participantId = formData.get('participantId') as string;
    const assessmentCenterId = formData.get('assessmentCenterId') as string;
    const activityId = formData.get('activityId') as string;
    const activityType = formData.get('activityType') as string;
    const submissionType = formData.get('submissionType') as string;
    const notes = formData.get('notes') as string;
    const textContent = formData.get('textContent') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!participantId || !assessmentCenterId || !activityId || !activityType || !submissionType) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: participantId, assessmentCenterId, activityId, activityType, submissionType' 
        }, 
        { status: 400 }
      );
    }

    // Validate submission type specific requirements
    if (submissionType === 'TEXT' && !textContent) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Text content is required for TEXT submission type' 
        }, 
        { status: 400 }
      );
    }

    if ((submissionType === 'VIDEO' || submissionType === 'DOCUMENT') && !file) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'File is required for VIDEO/DOCUMENT submission type' 
        }, 
        { status: 400 }
      );
    }

    // Create form data for backend API
    const backendFormData = new FormData();
    backendFormData.append('participantId', participantId);
    backendFormData.append('assessmentCenterId', assessmentCenterId);
    backendFormData.append('activityId', activityId);
    backendFormData.append('activityType', activityType);
    backendFormData.append('submissionType', submissionType);
    
    if (notes) {
      backendFormData.append('notes', notes);
    }
    
    if (textContent) {
      backendFormData.append('textContent', textContent);
    }
    
    if (file) {
      backendFormData.append('file', file);
    }

    // Make request to backend API
    const response = await fetch('https://api.breakfreeacademy.in/api/assignments/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: backendFormData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Assignment submitted successfully',
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Failed to submit assignment' 
        }, 
        { status: response.status || 400 }
      );
    }
  } catch (error) {
    console.error('Submit assignment API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit assignment due to server error', 
        error: error?.toString() 
      }, 
      { status: 500 }
    );
  }
}
