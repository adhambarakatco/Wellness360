'use server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// PATCH handler - Mark all notifications as read
export async function PATCH(req: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
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

    return NextResponse.json(
      {
        success: true,
        message: 'All notifications marked as read',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to mark notifications as read',
      },
      { status: 500 }
    );
  }
} 