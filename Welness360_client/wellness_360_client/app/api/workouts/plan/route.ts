'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET handler to fetch the user's current workout plan
 */
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Fetch from the backend API
    const response = await fetch(`${API_BASE}/workouts/plan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      // If not, throw an error with the status
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
    console.error('Error fetching workout plan:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
      { status: 500 }
    );
  }
} 