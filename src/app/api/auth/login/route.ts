import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Make request to your actual backend API
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
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
          message: result.message || 'Login failed' 
        }, 
        { status: response.status || 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Login failed due to server error', 
        error: error?.toString() 
      }, 
      { status: 500 }
    );
  }
}