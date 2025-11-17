import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `http://localhost:3001/api/assessment-centers?page=${page}&limit=${limit}&search=${search}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch assessment centers' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Assessment centers API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [API] ========== ASSESSMENT CENTERS POST ENDPOINT HIT ==========');
  console.log('🚀 [API] Request method:', request.method);
  console.log('🚀 [API] Request URL:', request.url);

  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('authorization');
    console.log('🔐 [API] Authorization header present:', !!authHeader);

    if (!authHeader) {
      console.log('❌ [API] Authorization header missing - returning 401');
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Get form data from the request
    console.log('📦 [API] Parsing form data...');
    const formData = await request.formData();

    // Extract the fields from form data
    const name = formData.get('name') as string;
    console.log('📋 [API] Extracted form fields:', {
      name: name ? `${name.substring(0, 50)}...` : 'No name',
      hasDescription: !!formData.get('description'),
      hasDisplayName: !!formData.get('displayName'),
      hasCompetencyIds: !!formData.get('competencyIds'),
      hasActivities: !!formData.get('activities'),
      hasAssignments: !!formData.get('assignments'),
      hasDocument: !!formData.get('document')
    });
    const description = formData.get('description') as string;
    const displayName = formData.get('displayName') as string;
    const displayInstructions = formData.get('displayInstructions') as string;
    const competencyIds = formData.get('competencyIds') as string;
    const reportTemplateName = formData.get('reportTemplateName') as string;
    const reportTemplateType = formData.get('reportTemplateType') as string;
    const activities = formData.get('activities') as string;
    const assignments = formData.get('assignments') as string;
    // const document = formData.get('document') as File | null;

    // Validate required fields
    if (!name || !description || !displayName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, description, displayName' },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let parsedCompetencyIds, parsedActivities, parsedAssignments;
    try {
      parsedCompetencyIds = competencyIds ? JSON.parse(competencyIds) : [];
      parsedActivities = activities ? JSON.parse(activities) : [];
      parsedAssignments = assignments ? JSON.parse(assignments) : [];
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in competencyIds, activities, or assignments' },
        { status: 400 }
      );
    }

    // Prepare the request body
    const requestBody: Record<string, unknown> = {
      name,
      description,
      displayName,
      displayInstructions,
      competencyIds: parsedCompetencyIds,
      reportTemplateName,
      reportTemplateType,
      activities: parsedActivities,
      assignments: parsedAssignments,
    };

    // If there's a document file, you might want to handle it here
    // For now, we'll skip file upload handling

    console.log('🌐 [API] Calling backend API...');
    console.log('🌐 [API] Backend URL: http://localhost:3001/api/assessment-centers');
    console.log('🌐 [API] Request payload size:', JSON.stringify(requestBody).length, 'characters');

    const response = await fetch(
      'http://localhost:3001/api/assessment-centers',
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('🌐 [API] Backend response status:', response.status, response.statusText);

    if (!response.ok) {
      console.log('❌ [API] Backend API call failed with status:', response.status);
      return NextResponse.json(
        { success: false, message: 'Failed to create assessment center' },
        { status: response.status }
      );
    }

    console.log('✅ [API] Backend API call successful!');
    const data = await response.json();
    console.log('📦 [API] Response data received, forwarding to client...');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [API] Assessment centers POST API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
