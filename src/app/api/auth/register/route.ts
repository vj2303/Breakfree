import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Here you would normally handle registration logic (e.g., save to DB)
    // For now, just echo the data back
    return NextResponse.json({ success: true, message: 'User registered successfully', data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Registration failed', error: error?.toString() }, { status: 400 });
  }
} 