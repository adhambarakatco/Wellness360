'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler - Get all notifications
export async function GET(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  
  // Extract only pagination parameters
  const { searchParams } = new URL(req.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  
  // Build query string with only pagination parameters
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();
    return new NextResponse(
      JSON.stringify({
        success: response.ok,
        message: response.ok
          ? 'Notifications fetched successfully!'
          : result.message || `Request failed with status ${response.status}`,
        data: response.ok ? result.notifications : undefined,
      }),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch notifications',
      },
      { status: 500 }
    );
  }
}

// POST handler - Create a notification
export async function POST(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;
  const body = await req.json();

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return new NextResponse(
      JSON.stringify({
        success: response.ok,
        message: response.ok
          ? 'Notification created successfully!'
          : result.message || `Request failed with status ${response.status}`,
        data: response.ok ? result : undefined,
      }),
      {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create notification',
      },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete all notifications
export async function DELETE(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: result.message || `Request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    // For status 204 No Content, we should not return a body
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Notifications deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete notifications',
      },
      { status: 500 }
    );
  }
} 