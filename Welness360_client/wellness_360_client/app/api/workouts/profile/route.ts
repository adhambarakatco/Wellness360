'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET handler to fetch the user's workout profile
 */
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Fetch from the backend API
    const response = await fetch(`${API_BASE}/workouts/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      // If not, throw an error with the status
      // please complte your fitness profile 
      return NextResponse.json(
        { error: 'Please complete your fitness profile' },
        { status: 400 }
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching workout profile:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch workout profile' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create or update the user's workout profile
 */
export async function POST(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Parse the request body
    const body = await req.json();

    // Submit the workout profile to the backend API
    const response = await fetch(`${API_BASE}/workouts/profile`, {
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
        { error: errorData.message || 'Failed to update workout profile' },
        { status: response.status }
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: response.ok ? 200 : 201 });
  } catch (error) {
    console.error('Error updating workout profile:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to update workout profile' },
      { status: 500 }
    );
  }
} 