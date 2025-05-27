'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * POST handler to generate a workout plan based on user's profile
 */
export async function POST(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Parse the request body
    const body = await req.json();
    
    // Submit to the backend API
    const response = await fetch(`${API_BASE}/workouts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Check if the request was successful
    if (!response.ok) {
      // Get error details from response if available
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Unknown error' };
      }
      
      // Return the error response
      return NextResponse.json(
        { error: errorData.message || 'Failed to generate workout plan' },
        { status: response.status }
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
} 