'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler to fetch dashboard data
 */
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const period = url.searchParams.get('period');
  
  try {
    // Determine which endpoint to call based on the type parameter
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/dashboard`;
    
    if (type === 'activity-summary') {
      apiUrl += '/activity-summary';
    } else if (type === 'sleep-summary') {
      apiUrl += '/sleep-summary';
    } else if (type === 'nutrition-summary') {
      apiUrl += '/nutrition-summary';
    } else if (type === 'user-stats') {
      apiUrl += '/user-stats';
    }

    // Add period parameter if provided and valid
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      apiUrl += `?period=${period}`;
    }
  
    // Fetch from the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
