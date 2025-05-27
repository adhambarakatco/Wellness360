'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler to fetch all available activities or specific user activities
 */
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  
  try {
    // Determine which endpoint to call based on the type parameter
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user-activity`;
    
    // If type is 'activities', fetch all available activities
    if (type === 'activities') {
      apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user-activity/activities`;
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
      console.error('API response not ok:', response.status) // Debug log
      // If not, throw an error with the status
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new activity log
 */
export async function POST(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  try {
    // Parse the request body
    const body = await req.json();

    // Make sure required fields are present
    if (!body.activityId || !body.duration || !body.title || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: activityId, duration, title, and date are required' },
        { status: 400 }
      );
    }

    // Validate the date
    const date = new Date(body.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Submit the activity log to the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        activityId: body.activityId,
        duration: Number(body.duration),
        title: body.title,
        date: body.date
      }),
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
        { error: errorData.message || 'Failed to log activity' },
        { status: response.status }
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a specific user activity
 */
export async function DELETE(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Activity ID is required as a query parameter' },
      { status: 400 }
    );
  }
  
  try {
    // Delete the activity via the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-activity/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      // If not, throw an error with the status
      throw new Error(`Failed to delete activity: ${response.status}`);
    }

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update an existing activity log
 */
export async function PATCH(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'Activity ID is required as a query parameter' },
      { status: 400 }
    );
  }
  
  try {
    // Parse the request body
    const body = await req.json();

    // Make sure required fields are present
    if (!body.activityId || !body.duration || !body.title || !body.date) {
      return NextResponse.json(
        { error: 'Missing required fields: activityId, duration, title, and date are required' },
        { status: 400 }
      );
    }

    // Validate the date
    const date = new Date(body.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user-activity/${id}`;


    // Update the activity log via the backend API
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        activityId: body.activityId,
        duration: Number(body.duration),
        title: body.title,
        date: body.date
      }),
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
        { error: errorData.message || 'Failed to update activity' },
        { status: response.status }
      );
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the data with proper status
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
} 