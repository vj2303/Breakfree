import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // Make request to backend API with the token
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Failed to fetch user information' 
        }, 
        { status: response.status || 401 }
      );
    }
  } catch (error) {
    console.error('Get user info API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch user information due to server error', 
        error: error?.toString() 
      }, 
      { status: 500 }
    );
  }
}
