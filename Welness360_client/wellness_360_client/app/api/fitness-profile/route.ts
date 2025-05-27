'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * GET handler to fetch the user's fitness profile
 * This is a proxy to the workout profile endpoint
 */
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Fetch from the backend API using the workouts/profile endpoint
    const response = await fetch(`${API_BASE}/workouts/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch fitness profile: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching fitness profile:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch fitness profile' },
      { status: 500 }
    );
  }
} 