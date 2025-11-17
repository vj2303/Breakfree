import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const assessorId = searchParams.get('assessorId') || '';
    const participantId = searchParams.get('participantId') || '';
    const assessmentCenterId = searchParams.get('assessmentCenterId') || '';
    const status = searchParams.get('status') || '';

    // Build query string - match the curl request format exactly
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('assessorId', assessorId);
    queryParams.append('participantId', participantId);
    queryParams.append('assessmentCenterId', assessmentCenterId);
    queryParams.append('status', status);

    const backendUrl = `http://localhost:3001/api/assessors/admin/scores?${queryParams.toString()}`;
    
    console.log('🔍 [API] Fetching assessor scores from:', backendUrl);
    console.log('🔍 [API] Auth header present:', !!authHeader);

    // Forward the request to the backend API
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 [API] Backend response status:', response.status);

    // Parse response only once
    let data;
    try {
      const responseText = await response.text();
      console.log('🔍 [API] Backend response text (first 200 chars):', responseText.substring(0, 200));
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('🔍 [API] Failed to parse response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to parse backend response',
          error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 500 }
      );
    }

    console.log('🔍 [API] Backend response success:', data.success);

    if (!response.ok) {
      console.error('🔍 [API] Backend returned error:', data);
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Failed to fetch assessor scores',
          errors: data.errors || undefined
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API] Error fetching assessor scores:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

